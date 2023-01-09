import { Match } from 'battlecode-playback';
import { ProfilerFile } from 'battlecode-playback/out/match';
import * as config from '../config';

enum Team {
  A, B
}

export default class Profiler {
  public readonly div: HTMLDivElement;
  public readonly iframe: HTMLIFrameElement;

  private teamSelector: HTMLSelectElement;
  private robotSelector: HTMLSelectElement;
  private notProfilingDiv: HTMLDivElement;

  private profilerFiles: ProfilerFile[];
  private currentTeamIndex: number = -1;
  private currentRobotIndex: number = -1;

  constructor(private conf: config.Config) {
    this.div = this.createSidebarDiv();
    this.iframe = this.createIFrame();
  }

  public reset() {
    this.clearSelect(this.teamSelector);
    this.clearSelect(this.robotSelector);

    this.currentTeamIndex = -1;
    this.currentRobotIndex = -1;
    const win = this.iframe.contentWindow;
    if (win !== null) {
      win.location.reload();
    }
  }

  public load(match: Match | undefined): void {
    this.profilerFiles = match !== undefined ? (match.profilerFiles || []) : [];
    console.log(this.profilerFiles);

    this.profilerFiles = this.profilerFiles.map(file => {
      const frames = file.frames.map(frame => ({ name: frame }));

      const profiles = file.profiles.map(profile => {
        const hasEvents = profile.events.length > 0;

        return {
          type: 'evented',
          name: profile.name,
          unit: 'none',
          startValue: hasEvents ? profile.events[0].at : 0,
          endValue: hasEvents ? profile.events[profile.events.length - 1].at : 0,
          events: profile.events,
        };
      });

      return { frames, profiles };
    });

    this.reset();

    this.addSelectOption(this.teamSelector, 'Team A (red)', '0');
    this.addSelectOption(this.teamSelector, 'Team B (blue)', '1');

    this.onTeamChange(0);
  }

  private createSidebarDiv(): HTMLDivElement {
    const base = document.createElement('div');
    base.id = 'profiler';

    this.teamSelector = document.createElement('select');
    this.robotSelector = document.createElement('select');

    this.teamSelector.onchange = () => {
      const selectedIndex = this.teamSelector.selectedIndex;
      if (selectedIndex > -1) {
        this.onTeamChange(parseInt(this.teamSelector.options[selectedIndex].value, 10));
      }
    };

    this.robotSelector.onchange = () => {
      const selectedIndex = this.robotSelector.selectedIndex;
      if (selectedIndex > -1) {
        this.onRobotChange(parseInt(this.robotSelector.options[selectedIndex].value, 10));
      }
    };

    this.notProfilingDiv =  document.createElement("div");
    this.notProfilingDiv.className = "not-logging-div";
    this.notProfilingDiv.textContent = "Profiling is disabled.";
    this.notProfilingDiv.hidden = this.conf.doProfiling;
    base.appendChild(this.notProfilingDiv);

    let p = document.createElement('p');
    p.innerText = `If no teams are visible, make sure to run a game with profiling enabled by ticking the checkbox on the Runner tab or to load a replay of a game that had profiling enabled. \
                   The match must completely load before profiling is visible.
                  `;
    base.appendChild(p);

    base.appendChild(this.createSidebarFormItem('Team', this.teamSelector));
    base.appendChild(this.createSidebarFormItem('Robot', this.robotSelector));

    return base;
  }

  private createSidebarFormItem(name: string, select: HTMLSelectElement): HTMLElement {
    const item = document.createElement('div');

    const label = document.createElement('span');
    label.textContent = `${name}: `;

    item.appendChild(label);
    item.appendChild(select);
    item.appendChild(document.createElement('br'));

    return item;
  }

  private createIFrame(): HTMLIFrameElement {
    const frame = document.createElement('iframe');

    frame.src = 'speedscope/index.html#localProfilePath=../profiler.js';
    frame.onload = () => {
      // Hide the Export and Import buttons in the top-right corner and certain elements on the homepage
      this.sendToIFrame('apply-css', `
        body > div > div:nth-child(2) > div:last-child > div:not(:last-child),
        body > div > div:nth-child(3) > div > div > p:nth-child(2),
        body > div > div:nth-child(3) > div > div > p:last-child,
        #file,
        label[for="file"] {
          display: none !important;
        }
      `);

      if (this.currentTeamIndex > -1 && this.currentRobotIndex > -1) {
        this.onRobotChange(this.currentRobotIndex);
      }
    };

    return frame;
  }

  private addSelectOption(select: HTMLSelectElement, label: string, value: string = label): void {
    const option = document.createElement('option');
    option.text = label;
    option.value = value;
    select.add(option);
  }

  private clearSelect(select: HTMLSelectElement): void {
    select.options.length = 0;
  }

  private onTeamChange(teamIndex: number): void {
    this.currentTeamIndex = teamIndex;

    this.clearSelect(this.robotSelector);

   // if (!this.profilerFiles[teamIndex]) return;

    for (let i = 0; i < this.profilerFiles[teamIndex].profiles.length; i++) {
      const profile = this.profilerFiles[teamIndex].profiles[i];

      this.addSelectOption(this.robotSelector, profile.name, `${i}`);
    }

    this.onRobotChange(0);
  }

  private onRobotChange(newRobotId: number): void {
    this.currentRobotIndex = newRobotId;

   // if (!this.profilerFiles[this.currentTeamIndex]) return;

    const file = this.profilerFiles[this.currentTeamIndex];
    const robot = this.currentRobotIndex;

    if (this.conf.doProfiling) {
      this.sendToIFrame('load', {
        $schema: 'https://www.speedscope.app/file-format-schema.json',
        activeProfileIndex: 0,
        shared: {
          frames: file.frames,
        },
        profiles: [file.profiles[robot]],
      });
    }
  }

  private sendToIFrame(type: string, payload: any) {
    const frame = this.iframe.contentWindow;
    if (frame !== null) {
      frame.postMessage({ type, payload }, '*');
    }
  }

  /**
   * Sets indicator of whether logs are being processed.
   */
  setNotProfilingDiv() {
    this.notProfilingDiv.hidden = this.conf.doProfiling;
  }
}
