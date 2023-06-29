/*
 * General constants
 */
export const BATTLECODE_YEAR: number = 2024
export const DIRECTIONS: Record<number, Array<number>> = {
    0: [0, 0],
    1: [-1, 0],
    2: [-1, -1],
    3: [0, -1],
    4: [1, -1],
    5: [1, 0],
    6: [1, 1],
    7: [0, 1],
    8: [-1, 1]
}

/*
 * Color constants (defined in tailwind.config.js as well)
 */
export const TEAM_BLUE = '#407496'
export const TEAM_RED = '#D53E43'
export const TEAM_COLORS = [TEAM_RED, TEAM_BLUE]
export const TEAM_NAMES = ['Red', 'Blue']

/*
 * Renderer constants
 */
export const TILE_RESOLUTION: number = 50 // Pixels per axis per tile

// currently just used to get the file names from the resource id
export const RESOURCE_NAMES: Record<number, string> = {
    1: 'adamantium',
    2: 'mana',
    3: 'elixir'
}

export const SPEC_VERSION = '0.0.1'

export enum MapType {
    DEFAULT,
    // SPRINT_1,
    // SPRINT_2,
    // INTL_QUALIFYING,
    // US_QUALIFYING,
    // HS_NEWBIE,
    // FINAL,
    CUSTOM
}

export const SERVER_MAPS: Map<string, MapType> = new Map<string, MapType>([
    ['AllElements', MapType.DEFAULT],
    ['DefaultMap', MapType.DEFAULT],
    ['maptestsmall', MapType.DEFAULT],
    ['SmallElements', MapType.DEFAULT]
])
