import { useGameStore } from './store'
import StartScreen from './components/StartScreen'
import GameCanvas from './components/game/GameCanvas'
import HUD from './components/HUD'

export default function App() {
    const screen = useGameStore((s) => s.screen)

    return (
        <>
            {screen === 'start' && <StartScreen />}
            {screen === 'game' && (
                <>
                    <GameCanvas />
                    <HUD />
                </>
            )}
        </>
    )
}
