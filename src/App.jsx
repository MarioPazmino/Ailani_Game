import { useGameStore } from './store'
import StartScreen from './components/StartScreen'
import GameCanvas from './components/game/GameCanvas'
import HUD from './components/HUD'
import MathWorld from './components/mathWorld/MathWorld'
import WordWorld from './components/wordWorld/WordWorld'

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
            {screen === 'mathWorld' && <MathWorld />}
            {screen === 'wordWorld' && <WordWorld />}
        </>
    )
}
