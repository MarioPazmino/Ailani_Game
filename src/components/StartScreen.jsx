import { useGameStore, CHARACTERS } from '../store'
import './StartScreen.css'

export default function StartScreen() {
    const character = useGameStore((s) => s.character)
    const setCharacter = useGameStore((s) => s.setCharacter)
    const startGame = useGameStore((s) => s.startGame)

    return (
        <div className="start-screen">
            {/* Floating decorations */}
            <div className="floating-decor">
                {['🌻', '🌾', '🐔', '⭐', '🌈', '🦋', '🌸', '🍎'].map((e, i) => (
                    <span key={i} className="float-emoji" style={{
                        left: `${10 + (i * 12) % 85}%`,
                        animationDelay: `${i * 0.7}s`,
                        fontSize: `${1.5 + Math.random()}rem`
                    }}>{e}</span>
                ))}
            </div>

            <h1 className="title">
                <span className="title-icon">🌾</span>
                La Granja Mágica de Ailani
                <span className="title-icon">🌾</span>
            </h1>
            <p className="subtitle">¡Elige tu personaje y explora la granja!</p>

            <div className="char-grid">
                {Object.entries(CHARACTERS).map(([id, ch]) => (
                    <div
                        key={id}
                        className={`char-card ${character === id ? 'selected' : ''}`}
                        onClick={() => setCharacter(id)}
                    >
                        <div className="card-glow" />
                        <span className="char-emoji">{ch.emoji}</span>
                        <div className="char-name">{ch.name}</div>
                        <div className="char-desc">{ch.desc}</div>
                        {character === id && <div className="selected-badge">✓</div>}
                    </div>
                ))}
            </div>

            <button className="btn-play" onClick={startGame}>
                <span className="btn-sparkle">✨</span>
                ¡Explorar!
                <span className="btn-sparkle">✨</span>
            </button>
        </div>
    )
}
