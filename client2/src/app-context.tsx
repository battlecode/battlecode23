import React, { useEffect } from 'react'
import Game from './playback/Game'
import Match from './playback/Match'
import ScaffoldCommunicator from './electron/scaffold'

export interface AppState {
    queue: Game[]
    activeGame?: Game
    activeMatch?: Match
    scaffold?: ScaffoldCommunicator
}

const DEFAULT_APP_STATE: AppState = {
    queue: [],
    activeGame: undefined,
    activeMatch: undefined,
    scaffold: undefined
}

export interface AppContext {
    state: AppState
    setState: (value: React.SetStateAction<AppState>) => void
}

interface Props {
    children: React.ReactNode[] | React.ReactNode
}

const appContext = React.createContext({} as AppContext)
export const AppContextProvider: React.FC<Props> = (props) => {
    const [appState, setAppState] = React.useState(DEFAULT_APP_STATE)

    // attempt on initial mount to load the scaffold
    useEffect(() => {
        if (process.env.ELECTRON) {
            let scaffoldPath = ScaffoldCommunicator.findDefaultScaffoldPath()
            if (!scaffoldPath) scaffoldPath = ScaffoldCommunicator.promptForScaffoldPath()
            while (scaffoldPath) {
                try {
                    setAppState({ ...appState, scaffold: new ScaffoldCommunicator(scaffoldPath) })
                } catch (e) {
                    scaffoldPath = ScaffoldCommunicator.promptForScaffoldPath()
                }
            }
        }
    }, [])

    return (
        <appContext.Provider value={{ state: appState, setState: setAppState }}>{props.children}</appContext.Provider>
    )
}

export const useAppContext = () => React.useContext(appContext)
