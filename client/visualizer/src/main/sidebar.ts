import { Config, Mode } from '../config'
import { AllImages } from '../imageloader'

import Stats from '../sidebar/stats'
import Console from '../sidebar/console'
import MatchRunner from '../sidebar/matchrunner'
import MatchQueue from '../sidebar/matchqueue'
import Profiler from '../sidebar/profiler'
import MapEditor from '../mapeditor/mapeditor'
import ScaffoldCommunicator from './scaffold'
import Runner from '../runner'

import { http, electron } from './electron-modules'



export default class Sidebar {

  // HTML elements
  readonly div: HTMLDivElement // The public div
  private readonly innerDiv: HTMLDivElement
  private readonly images: AllImages
  private readonly modeButtons: Map<Mode, HTMLButtonElement>

  // Different modes
  readonly stats: Stats
  readonly console: Console
  readonly mapeditor: MapEditor
  readonly matchrunner: MatchRunner
  readonly matchqueue: MatchQueue
  readonly profiler?: Profiler
  private readonly help: HTMLDivElement

  // Options
  private readonly conf: Config

  // Scaffold
  private scaffold: ScaffoldCommunicator

  // Update texts
  private updateText: HTMLDivElement

  // Mode panel
  private modePanel: HTMLTableElement

  // Callback to update the game area when changing modes
  cb: () => void

  constructor(conf: Config, images: AllImages, runner: Runner) {
    // Initialize fields
    this.div = document.createElement("div")
    this.innerDiv = document.createElement("div")
    this.images = images
    this.console = new Console(conf)
    this.mapeditor = new MapEditor(conf, images)
    this.matchrunner = new MatchRunner(conf, () => {
      // Set callback for matchrunner in case the scaffold is loaded later
      electron.remote.dialog.showOpenDialog({
        title: 'Please select your battlecode-scaffold directory.',
        properties: ['openDirectory']
      }).then((result) => {
        let filePaths = result.filePaths
        if (filePaths.length > 0) {
          this.scaffold = new ScaffoldCommunicator(filePaths[0])
          this.addScaffold(this.scaffold)
        } else {
          console.log('No scaffold found or provided')
        }
      })
    }, () => {
      // set callback for running a game, which should trigger the update check
      this.updateUpdate()
    })
    if (conf.useProfiler) this.profiler = new Profiler(conf)
    this.matchqueue = new MatchQueue(conf, images, runner)
    this.stats = new Stats(conf, images, runner)
    this.conf = conf
    this.help = this.initializeHelp()

    // Initialize div structure
    this.loadStyles()
    this.div.appendChild(this.screamForUpdate())
    this.div.appendChild(this.battlecodeLogo())

    this.modePanel = document.createElement('table')
    this.modePanel.className = 'modepanel'

    const modePanelRow1 = document.createElement('tr')
    const modePanelRow2 = document.createElement('tr')

    this.modeButtons = new Map<Mode, HTMLButtonElement>()
    modePanelRow1.appendChild(this.modeButton(Mode.GAME, "Game"))
    // modePanelRow1.appendChild(this.modeButton(Mode.LOGS, "Logs"));
    modePanelRow1.appendChild(this.modeButton(Mode.QUEUE, "Queue"))
    modePanelRow1.appendChild(this.modeButton(Mode.RUNNER, "Runner"))
    if (this.conf.useProfiler) modePanelRow2.appendChild(this.modeButton(Mode.PROFILER, "Profiler"))
    modePanelRow2.appendChild(this.modeButton(Mode.MAPEDITOR, "Map Editor"))
    modePanelRow2.appendChild(this.modeButton(Mode.HELP, "Help"))

    this.modePanel.appendChild(modePanelRow1)
    this.modePanel.appendChild(modePanelRow2)

    this.div.appendChild(this.modePanel)

    this.div.appendChild(this.innerDiv)

    this.conf.mode = Mode.GAME // MAPEDITOR;

    this.updateModeButtons()
    this.setSidebar()
  }

  /**
   * Sets a scaffold if a scaffold directory is found after everything is loaded
   */
  addScaffold(scaffold: ScaffoldCommunicator): void {
    this.mapeditor.addScaffold(scaffold)
    this.matchrunner.addScaffold(scaffold)
  }

  /**
   * Initializes the help div
   */
  private initializeHelp(): HTMLDivElement {
    // <b class="blue">Notes on game stats</b><br>
    // TODO
    // <br>
    var innerHTML: string =
      `
    <b class="red">Issues?</b>
    <ol style="margin-left: -20px; margin-top: 0px;">
    <li>Refresh (Ctrl-R or Command-R).</li>
    <li>Search <a href="https://discordapp.com/channels/386965718572466197/401552673523892227">Discord</a>.</li>
    <li>Ask on <a href="https://discordapp.com/channels/386965718572466197/401552673523892227">Discord</a> (attach a screenshot of console output using F12).</li>
    </ol>

    <br>

    <b class="blue">Keyboard Shortcuts (Game)</b><br>
    LEFT - Step Back One Turn<br>
    RIGHT - Step Forward One Turn<br>
    UP - Double Playback Speed<br>
    DOWN - Halve Playback Speed<br>
    P - Pause/Unpause<br>
    O - Stop (Go to Start)<br>
    E - Go to End<br>
    V - Toggle Indicator Dots/Lines for Selected Robot<br>
    C - Toggle All Indicator Dots/Lines<br>
    G - Toggle Grid<br>
    N - Toggle Action Radius<br>
    M - Toggle Vision Radius<br>
    B - Toggle Interpolation<br>
    Q - Toggle whether to profile matches.<br>
    [ - Hide/unhide sidebar navigation.<br>
    <br>
    <b class="blue">Keyboard Shortcuts (Map Editor)</b><br
    <br>
    S - Add<br>
    D - Delete<br>
    R - Reverse team<br>
    <br>
    <b class="blue">How to Play a Match</b><br>
    <i>From the application:</i> Click <code>Runner</code>, select the bots and
    your desired map, then press "Run Game". Note that it may take a few seconds for
    matches to be displayed. To stop processing a match before it has finished,
    press "Kill ongoing processes". Note that the part of the match that has already
    loaded will remain in the client.<br>
    <br>
    <i>From the web client:</i> You can always upload a <code>.${this.conf.game_extension}</code> file by
    clicking the upload button in the <code>Queue</code> section.<br>
    <br>
    Use the control buttons at the top of the screen to
    navigate the match. Click on different matches in the <code>Queue</code> section to switch between them.<br>
    <br>
    <br>
    <b class="blue">How to Use the Profiler</b><br>
    <i class="red"> The profiler is a competitor tool, and is not officially supported by Teh Devs. Be cautious of memory issues when profiling large games. To disable profiling
    on a profiled match file, press "Q".</i><br>
    The profiler can be used to find out which methods are using a lot of
    bytecodes. To use it, tick the "Profiler enabled" checkbox in the
    Runner before running the game.
    A maximum of 2,000,000 events are recorded per team per
    match if profiling is enabled to prevent the replay file from becoming
    enormous.
    <br>`

    if (this.conf.tournamentMode) {
      innerHTML +=
        `<br><br>
      <b class="blue">Tournament Mode Keyboard Shortcuts</b><br>
      D - Next match<br>
      A - Previous match`
    }

    const div = document.createElement("div")
    div.id = "helpDiv"

    div.innerHTML = innerHTML
    return div
  }

  /**
   * Initializes the styles for the sidebar div
   */
  private loadStyles(): void {

    this.div.id = "sidebar"

  }

  /**
   * Scream for update, if outdated.
   */
  private screamForUpdate(): HTMLDivElement {
    this.updateText = document.createElement("div")
    this.updateText.id = "updateText"

    this.updateUpdate()

    return this.updateText
  }
  private updateUpdate() {
    this.updateText.style.display = "none"
    if (process.env.ELECTRON) {
      (async function (splashDiv, version) {

        var options = {
          host: 'play.battlecode.org',
          path: `/versions/${this.conf.year}/version.txt`
        }

        var req = http.get(options, function (res) {
          let data = ""
          res.on('data', function (chunk) {
            data += chunk
          }).on('end', function () {

            var latest = data

            if (latest.trim() != version.trim()) {
              let newVersion = document.createElement("p")
              newVersion.innerHTML = "NEW VERSION AVAILABLE!!!! (download with <code>gradle update</code> followed by <code>gradle build</code>, and then restart the client): v" + latest
              splashDiv.style.display = "unset"
              while (splashDiv.firstChild) {
                splashDiv.removeChild(splashDiv.firstChild)
              }
              splashDiv.appendChild(newVersion)
            }

          })
        })
      })(this.updateText, this.conf.gameVersion)
    }
  }

  /**
   * Battlecode logo or title, at the top of the sidebar
   */
  private battlecodeLogo(): HTMLDivElement {
    let logo: HTMLDivElement = document.createElement("div")
    logo.id = "logo"

    let boldText = document.createElement("b")
    boldText.innerHTML = "Battlecode " + this.conf.year
    logo.appendChild(boldText)
    return logo
  }

  private updateModeButtons() {
    this.modeButtons.forEach(button => {
      button.className = 'modebutton'
    })
    let modeButton = this.modeButtons.get(this.conf.mode)
    if (modeButton !== undefined)
      modeButton.className = 'modebutton selectedmodebutton'
  }

  private modeButton(mode: Mode, text: string): HTMLTableDataCellElement {
    const cellButton = document.createElement('td')
    const button = document.createElement("button")
    button.type = "button"
    button.className = 'modebutton'
    button.innerHTML = text
    button.onclick = () => {
      this.conf.mode = mode
      this.updateModeButtons()
      this.setSidebar()
    }
    this.modeButtons.set(mode, button)
    cellButton.appendChild(button)
    return cellButton
  }

  /**
   * Update the inner div depending on the mode
   */
  private setSidebar(): void {
    // Clear the sidebar
    while (this.innerDiv.firstChild) {
      this.innerDiv.removeChild(this.innerDiv.firstChild)
    }

    // Update the div and set the correct onkeydown events
    // TODO why does the sidebar need config? (like, circlebots or indicators)
    // this seems it was not updated for a while
    switch (this.conf.mode) {
      case Mode.GAME:
        this.innerDiv.appendChild(this.stats.div)
        break
      case Mode.HELP:
        this.innerDiv.appendChild(this.help)
        break
      case Mode.LOGS:
        this.innerDiv.appendChild(this.console.div)
        break
      case Mode.RUNNER:
        this.innerDiv.appendChild(this.matchrunner.div)
        break
      case Mode.QUEUE:
        this.innerDiv.appendChild(this.matchqueue.div)
        break
      case Mode.MAPEDITOR:
        this.innerDiv.appendChild(this.mapeditor.div)
        break
      case Mode.PROFILER:
        if (this.profiler) this.innerDiv.append(this.profiler.div)
        break
    }

    if (this.cb !== undefined) {
      this.cb()
    }
  }

  hidePanel() {
    this.modePanel.style.display = (this.modePanel.style.display === "" ? "none" : "")
  }
}
