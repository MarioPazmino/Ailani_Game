import { useState, useEffect } from 'react'
import { useGameStore, CHARACTERS } from '../store'
import './HUD.css'

export default function HUD() {
    const character = useGameStore((s) => s.character)
    const stars = useGameStore((s) => s.stars)
    const points = useGameStore((s) => s.points)
    const tooltip = useGameStore((s) => s.tooltip)
    const [showHint, setShowHint] = useState(true)

    const goBack = useGameStore((s) => s.goBack)
    const ch = CHARACTERS[character]

    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 4500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <div className="hud">
            <div className="hud-top-left">
                <button className="hud-back-btn" onClick={goBack} title="Cambiar personaje">
                    ←
                </button>
                <div className="hud-name">
                    <span className="hud-name-emoji">{ch.emoji}</span>
                    {ch.name}
                </div>
            </div>

            <div className="hud-score">
                <span className="hud-star-icon">⭐</span>
                <span className="hud-star-count">{stars}/12</span>
                <span className="hud-divider">·</span>
                <span className="hud-points">{points} pts</span>
            </div>

            {showHint && (
                <div className={`hud-hint ${!showHint ? 'fade-out' : ''}`}>
                    <span>⌨️ WASD / Flechas: Mover</span>
                    <span className="hint-sep">·</span>
                    <span>␣ Espacio: Saltar</span>
                    <span className="hint-sep">·</span>
                    <span>🖱️ Arrastrar: Cámara</span>
                </div>
            )}

            <div className={`hud-tooltip ${tooltip ? 'show' : ''}`}>
                {tooltip}
            </div>
        </div>
    )
}
