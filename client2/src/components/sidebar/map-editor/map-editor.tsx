import React, { useEffect } from 'react'
import { CurrentMap, StaticMap } from '../../../playback/Map'
import { MapEditorBrushRow } from './map-editor-brushes'
import Bodies from '../../../playback/Bodies'
import Game from '../../../playback/Game'
import { Button, BrightButton, SmallButton } from '../../button'
import { NumInput, Select } from '../../forms'
import { useAppContext } from '../../../app-context'
import Match from '../../../playback/Match'
import { EventType, useListenEvent } from '../../../app-events'
import { MapEditorBrush } from './MapEditorBrush'
import { loadFileAsMap, saveMapToFile } from './MapGenerator'

const MIN_MAP_SIZE = 20
const MAX_MAP_SIZE = 60

type MapParams = {
    width: number
    height: number
    symmetry: number
    imported?: Game
}

export const MapEditorPage: React.FC = () => {
    const context = useAppContext()
    const [mapParams, setMapParams] = React.useState<MapParams>({ width: 30, height: 30, symmetry: 0 })
    const [brushes, setBrushes] = React.useState<MapEditorBrush[]>([])

    const openBrush = brushes.find((b) => b.open)

    const setOpenBrush = (brush: MapEditorBrush | null) => {
        setBrushes(brushes.map((b) => b.opened(b === brush)))
    }

    const mapEmpty = () =>
        !context.state.activeMatch?.currentTurn ||
        (context.state.activeMatch.currentTurn.map.isEmpty() && context.state.activeMatch.currentTurn.bodies.isEmpty())

    const applyBrush = (point: { x: number; y: number }) => {
        if (openBrush) openBrush.apply(point.x, point.y, openBrush.fields)

        setCleared(mapEmpty())
    }

    useListenEvent(EventType.TILE_CLICK, applyBrush, [brushes])
    useListenEvent(EventType.TILE_DRAG, applyBrush, [brushes])

    useEffect(() => {
        let game = mapParams.imported

        if (!game) {
            game = new Game()
            const map = StaticMap.fromParams(mapParams.width, mapParams.height, mapParams.symmetry)
            game.currentMatch = Match.createBlank(game, new Bodies(game), map)
        }

        context.setState({
            ...context.state,
            activeGame: game,
            activeMatch: game.currentMatch
        })

        const turn = game.currentMatch!.currentTurn
        const brushes = turn.map.getEditorBrushes().concat(turn.bodies.getEditorBrushes(turn.map.staticMap))
        brushes[0].open = true
        setBrushes(brushes)
        setCleared(turn.bodies.isEmpty() && turn.map.isEmpty())
    }, [mapParams])

    const changeWidth = (newWidth: number) => {
        newWidth = Math.max(MIN_MAP_SIZE, Math.min(MAX_MAP_SIZE, newWidth))
        setMapParams({ ...mapParams, width: newWidth, imported: undefined })
    }
    const changeHeight = (newHeight: number) => {
        newHeight = Math.max(MIN_MAP_SIZE, Math.min(MAX_MAP_SIZE, newHeight))
        setMapParams({ ...mapParams, height: newHeight, imported: undefined })
    }
    const changeSymmetry = (symmetry: string) => {
        const symmetryInt = parseInt(symmetry)
        if (symmetryInt < 0 || symmetryInt > 2) throw new Error('invalid symmetry value')
        setMapParams({ ...mapParams, symmetry: symmetryInt, imported: undefined })
    }

    const inputRef = React.useRef<HTMLInputElement>(null)
    const fileUploaded = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length == 0) return
        const file = e.target.files[0]
        loadFileAsMap(file).then((game) => {
            const map = game.currentMatch!.currentTurn!.map
            setMapParams({ width: map.width, height: map.height, symmetry: map.staticMap.symmetry, imported: game })
        })
    }

    const [cleared, setCleared] = React.useState(true)
    const clearMap = () => {
        if (!confirm('Are you sure you want to clear the map?')) return
        setCleared(true)
        setMapParams({ ...mapParams, imported: undefined })
    }

    const exportMap = () => {
        if (
            !context.state.activeMatch?.currentTurn ||
            (context.state.activeMatch.currentTurn.map.isEmpty() &&
                context.state.activeMatch.currentTurn.bodies.isEmpty())
        ) {
            alert('Map is empty')
            return
        }
        let name = prompt('Enter a name for this map')
        if (!name) return
        context.state.activeGame!.currentMatch!.currentTurn!.map.staticMap.name = name ?? 'Untitled'

        const turn = context.state.activeGame!.currentMatch!.currentTurn

        if (process.env.ELECTRON && context.state.scaffold) {
            context.state.scaffold.saveMap(mapToFile(turn.map, turn.bodies), name, (err: Error | null) => {
                if (err) console.log(err)
                else alert('Successfully exported!')
            })
        } else {
            saveMapToFile(turn, name)
        }
    }

    return (
        <>
            <input type="file" hidden ref={inputRef} onChange={fileUploaded} />

            <div className="flex flex-col flex-grow">
                {brushes.map((brush, i) => (
                    <MapEditorBrushRow
                        key={i}
                        brush={brush}
                        open={brush == openBrush}
                        onClick={() => {
                            if (brush == openBrush) setOpenBrush(null)
                            else setOpenBrush(brush)
                        }}
                    />
                ))}
                <SmallButton onClick={clearMap} className={'mt-10 ' + (cleared ? 'invisible' : '')}>
                    Clear to unlock
                </SmallButton>
                <div className={'flex flex-col ' + (cleared ? '' : 'opacity-30 pointer-events-none')}>
                    <div className="flex flex-row items-center justify-center">
                        <span className="mr-2 text-sm">Width: </span>
                        <NumInput
                            value={mapParams.width}
                            changeValue={changeWidth}
                            min={MIN_MAP_SIZE}
                            max={MAX_MAP_SIZE}
                        />
                        <span className="ml-3 mr-2 text-sm">Height: </span>
                        <NumInput
                            value={mapParams.height}
                            changeValue={changeHeight}
                            min={MIN_MAP_SIZE}
                            max={MAX_MAP_SIZE}
                        />
                    </div>
                    <div className="flex flex-row mt-3 items-center justify-center">
                        <span className="mr-5 text-sm">Symmetry: </span>
                        <Select onChange={changeSymmetry} value={mapParams.symmetry}>
                            <option value="0">Rotational</option>
                            <option value="1">Horizontal</option>
                            <option value="2">Vertical</option>
                        </Select>
                    </div>
                </div>

                <div className="flex flex-row mt-8">
                    <BrightButton onClick={exportMap}>Export</BrightButton>
                    <Button onClick={() => inputRef.current?.click()}>Import</Button>
                </div>
            </div>
        </>
    )
}
function mapToFile(map: CurrentMap, bodies: Bodies): Uint8Array {
    throw new Error('Function not implemented.')
}
