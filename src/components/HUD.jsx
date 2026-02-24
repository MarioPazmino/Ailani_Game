import { useState, useEffect } from 'react'
import { useGameStore, CHARACTERS } from '../store'
import { getPhase } from './game/dayNight'
import './HUD.css'

export default function HUD() {
    const character = useGameStore((s) => s.character)
    const stars = useGameStore((s) => s.stars)
    const points = useGameStore((s) => s.points)
    const tooltip = useGameStore((s) => s.tooltip)
    const [showHint, setShowHint] = useState(true)
    const [timeInfo, setTimeInfo] = useState({ phase: '', time: '' })

    const goBack = useGameStore((s) => s.goBack)
    const ch = CHARACTERS[character]

    useEffect(() => {
        const timer = setTimeout(() => setShowHint(false), 4500)
        return () => clearTimeout(timer)
    }, [])

    // Update clock every 30s
    useEffect(() => {
        function update() {
            const now = new Date()
            const h = now.getHours() + now.getMinutes() / 60
            const phase = getPhase(h)
            const ICONS = { night: '🌙', dawn: '🌅', morning: '☀️', afternoon: '🌤️', sunset: '🌇', dusk: '🌆' }
            const LABELS = { night: 'Noche', dawn: 'Amanecer', morning: 'Mañana', afternoon: 'Tarde', sunset: 'Atardecer', dusk: 'Anochecer' }
            const hh = String(now.getHours()).padStart(2, '0')
            const mm = String(now.getMinutes()).padStart(2, '0')
            setTimeInfo({ phase: `${ICONS[phase]} ${LABELS[phase]}`, time: `${hh}:${mm}` })
        }
        update()
        const iv = setInterval(update, 30000)
        return () => clearInterval(iv)
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

            <div className="hud-time">
                <span className="hud-time-phase">{timeInfo.phase}</span>
                <span className="hud-time-clock">{timeInfo.time}</span>
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
