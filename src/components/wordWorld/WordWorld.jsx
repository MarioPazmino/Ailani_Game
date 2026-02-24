import { useState, useCallback, useEffect, useRef } from 'react'
import { useGameStore, CHARACTERS } from '../../store'
import './WordWorld.css'

/* ── Sentence bank ───────────────────────────────────── */
const SENTENCES = [
    // Animales
    'El gato duerme en la cama',
    'El perro corre por el parque',
    'Los pájaros cantan por la mañana',
    'La vaca come pasto verde',
    'El caballo galopa muy rápido',
    'Las gallinas ponen huevos frescos',
    'El conejo salta entre las flores',
    'Los peces nadan en el río',
    'La mariposa vuela sobre las flores',
    'El león es el rey de la selva',

    // Naturaleza
    'El sol brilla en el cielo azul',
    'La luna sale por la noche',
    'Las estrellas brillan muy bonito',
    'La lluvia moja las plantas verdes',
    'El arcoíris tiene muchos colores',
    'Las flores crecen en el jardín',
    'El viento mueve las hojas secas',
    'La nieve cubre las montañas altas',
    'El río lleva agua cristalina',
    'Los árboles dan sombra fresca',

    // Familia y hogar
    'Mi mamá cocina muy rico',
    'Mi papá lee el periódico',
    'Mi hermana juega en el patio',
    'La abuela cuenta historias bonitas',
    'La familia come junta los domingos',
    'Los niños juegan en la escuela',
    'Mi hermano dibuja muy bien',

    // Acciones cotidianas
    'Yo me lavo las manos siempre',
    'Los niños leen libros en clase',
    'Ella escribe cartas a su amiga',
    'Nosotros jugamos en el recreo',
    'El maestro enseña cosas nuevas',
    'La niña pinta un cuadro bonito',
    'Los amigos comparten la merienda',

    // Comida
    'La sopa caliente está muy rica',
    'Las frutas son buenas y sanas',
    'El pan fresco huele muy bien',
    'La leche es buena para crecer',
    'Las verduras nos dan mucha fuerza',

    // Fantasía / aventura
    'La princesa vive en un castillo',
    'El dragón vuela sobre las nubes',
    'El pirata busca un gran tesoro',
    'La hada tiene alas muy brillantes',
    'El mago hace trucos increíbles',
]

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
const WIN_TARGET = 8
const MAX_WRONG = 5
const TIMER_SECONDS = 45

/* shuffle array (Fisher-Yates) */
function shuffle(arr) {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function pickSentence(usedIndices) {
    const available = SENTENCES.map((s, i) => i).filter(i => !usedIndices.has(i))
    if (available.length === 0) usedIndices.clear()
    const pool = available.length > 0 ? available : SENTENCES.map((_, i) => i)
    const idx = pool[rand(0, pool.length - 1)]
    usedIndices.add(idx)
    const words = SENTENCES[idx].split(' ')
    let shuffled = shuffle(words)
    // Ensure shuffled is different from original
    while (shuffled.join(' ') === words.join(' ') && words.length > 2) {
        shuffled = shuffle(words)
    }
    return { words, shuffled, sentence: SENTENCES[idx] }
}

const ENCOURAGEMENTS = [
    '¡Perfecto! 🌟', '¡Muy bien! ✨', '¡Genial! 🎉',
    '¡Excelente! 💪', '¡Increíble! 🏆', '¡Bravo! 🎊',
]

/* ── Word Chip ──────────────────────────────────────── */
function WordChip({ word, index, onClick, disabled, used, state }) {
    return (
        <button
            className={`word-chip ${used ? 'word-chip-used' : ''} ${state || ''}`}
            onClick={() => !disabled && !used && onClick(word, index)}
            disabled={disabled || used}
        >
            {word}
        </button>
    )
}

/* ── Main Component ──────────────────────────────────── */
export default function WordWorld() {
    const leaveWordWorld = useGameStore(s => s.leaveWordWorld)
    const character = useGameStore(s => s.character)
    const charData = CHARACTERS[character]

    const usedIndices = useRef(new Set())
    const [data, setData] = useState(() => pickSentence(usedIndices.current))
    const [selected, setSelected] = useState([])      // words clicked in order
    const [selectedFrom, setSelectedFrom] = useState([]) // indices of chips used
    const [wrongCount, setWrongCount] = useState(0)
    const [correctCount, setCorrectCount] = useState(0)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('')
    const [gameOver, setGameOver] = useState(false)
    const [showConfetti, setShowConfetti] = useState(false)
    const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS)
    const [shake, setShake] = useState(false)
    const msgTimeout = useRef(null)
    const timerRef = useRef(null)

    const showMsg = useCallback((text, type, duration = 1500) => {
        setMessage(text)
        setMessageType(type)
        if (msgTimeout.current) clearTimeout(msgTimeout.current)
        msgTimeout.current = setTimeout(() => setMessage(''), duration)
    }, [])

    const resetTimer = useCallback(() => {
        setTimeLeft(TIMER_SECONDS)
    }, [])

    const nextProblem = useCallback(() => {
        const newData = pickSentence(usedIndices.current)
        setData(newData)
        setSelected([])
        setSelectedFrom([])
        resetTimer()
    }, [resetTimer])

    const handleWrong = useCallback((msg) => {
        const newWrong = wrongCount + 1
        setWrongCount(newWrong)
        showMsg(msg, 'wrong')
        setShake(true)
        setTimeout(() => setShake(false), 500)

        if (newWrong >= MAX_WRONG) {
            setGameOver('lose')
            showMsg(`La frase era: "${data.sentence}"`, 'wrong', 5000)
            return true
        }
        return false
    }, [wrongCount, data, showMsg])

    /* click a word chip */
    const handleWordClick = useCallback((word, chipIndex) => {
        if (gameOver) return

        const nextPos = selected.length
        const correctWord = data.words[nextPos]

        if (word === correctWord) {
            const newSelected = [...selected, word]
            const newFrom = [...selectedFrom, chipIndex]
            setSelected(newSelected)
            setSelectedFrom(newFrom)

            // Check if sentence is complete
            if (newSelected.length === data.words.length) {
                const newCorrect = correctCount + 1
                setCorrectCount(newCorrect)
                showMsg(ENCOURAGEMENTS[rand(0, ENCOURAGEMENTS.length - 1)], 'correct')

                if (newCorrect >= WIN_TARGET) {
                    setGameOver('win')
                    setShowConfetti(true)
                    return
                }
                resetTimer()
                setTimeout(nextProblem, 1000)
            }
        } else {
            // Wrong word selected
            const lost = handleWrong('¡Esa palabra no va ahí! 🔄')
            if (!lost) {
                // Reset current attempt for this sentence
                setSelected([])
                setSelectedFrom([])
            }
        }
    }, [gameOver, selected, selectedFrom, data, correctCount, showMsg, nextProblem, handleWrong, resetTimer])

    /* undo last word */
    const handleUndo = useCallback(() => {
        if (gameOver || selected.length === 0) return
        setSelected(prev => prev.slice(0, -1))
        setSelectedFrom(prev => prev.slice(0, -1))
    }, [gameOver, selected])

    /* timeout */
    const handleTimeout = useCallback(() => {
        const lost = handleWrong('⏰ ¡Se acabó el tiempo!')
        if (!lost) {
            nextProblem()
        }
    }, [handleWrong, nextProblem])

    /* countdown */
    useEffect(() => {
        if (gameOver) return
        if (timeLeft <= 0) {
            handleTimeout()
            return
        }
        timerRef.current = setTimeout(() => setTimeLeft(t => t - 1), 1000)
        return () => clearTimeout(timerRef.current)
    }, [timeLeft, gameOver, handleTimeout])

    const restart = useCallback(() => {
        setWrongCount(0)
        setCorrectCount(0)
        setGameOver(false)
        setShowConfetti(false)
        setMessage('')
        setSelected([])
        setSelectedFrom([])
        usedIndices.current.clear()
        nextProblem()
    }, [nextProblem])

    /* keyboard: Backspace to undo */
    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'Backspace') handleUndo()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [handleUndo])

    /* progress hearts */
    const hearts = []
    for (let i = 0; i < MAX_WRONG; i++) {
        hearts.push(i < (MAX_WRONG - wrongCount) ? '❤️' : '🖤')
    }

    return (
        <div className="word-world">
            {/* background */}
            <div className="word-bg-particles">
                {Array.from({ length: 18 }).map((_, i) => (
                    <span key={i} className="word-particle" style={{
                        left: `${rand(0, 100)}%`,
                        animationDelay: `${rand(0, 5000)}ms`,
                        animationDuration: `${rand(5000, 9000)}ms`,
                        fontSize: `${rand(16, 30)}px`,
                    }}>
                        {['📖', '✏️', '📝', 'Aa', 'Bb', '📚', '🔤', '💬', '🗣️'][rand(0, 8)]}
                    </span>
                ))}
            </div>

            {/* top bar */}
            <div className="word-topbar">
                <button className="word-back-btn" onClick={leaveWordWorld}>
                    ← Volver a la granja
                </button>
                <div className="word-score-bar">
                    <span className="word-correct-count">
                        📖 {correctCount}/{WIN_TARGET}
                    </span>
                    <span className="word-hearts">
                        {hearts.join('')}
                    </span>
                    {!gameOver && (
                        <span className={`word-timer ${timeLeft <= 10 ? 'word-timer-danger' : timeLeft <= 20 ? 'word-timer-warning' : ''}`}>
                            ⏱ {timeLeft}s
                        </span>
                    )}
                </div>
            </div>

            {/* title */}
            <h1 className="word-title">📖 Mundo de las Palabras 📖</h1>
            <p className="word-subtitle">
                ¡{charData.name}, ordena las palabras para formar la frase correcta!
            </p>

            {/* main content */}
            <div className="word-content">
                {!gameOver ? (
                    <>
                        {/* timer bar */}
                        <div className="word-timer-bar-container">
                            <div className="word-timer-bar" style={{ width: `${(timeLeft / TIMER_SECONDS) * 100}%` }}
                                data-danger={timeLeft <= 10 ? '' : undefined}
                                data-warning={timeLeft > 10 && timeLeft <= 20 ? '' : undefined}
                            />
                        </div>

                        {/* sentence building area */}
                        <div className={`word-sentence-area ${shake ? 'word-shake' : ''}`}>
                            <div className="word-sentence-slots">
                                {data.words.map((_, i) => (
                                    <span key={i} className={`word-slot ${i < selected.length ? 'word-slot-filled' : ''}`}>
                                        {i < selected.length ? selected[i] : '___'}
                                    </span>
                                ))}
                            </div>
                            {selected.length > 0 && (
                                <button className="word-undo-btn" onClick={handleUndo}>
                                    ↩ Deshacer
                                </button>
                            )}
                        </div>

                        {/* hint: word count */}
                        <p className="word-hint">
                            {selected.length} de {data.words.length} palabras
                        </p>

                        {/* message */}
                        {message && (
                            <div className={`word-message word-message-${messageType}`}>
                                {message}
                            </div>
                        )}

                        {/* scrambled word chips */}
                        <div className="word-chips-area">
                            {data.shuffled.map((word, i) => (
                                <WordChip
                                    key={`${word}-${i}`}
                                    word={word}
                                    index={i}
                                    onClick={handleWordClick}
                                    disabled={gameOver !== false}
                                    used={selectedFrom.includes(i)}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="word-game-over">
                        {gameOver === 'win' ? (
                            <>
                                <h2 className="word-win-title">🏆 ¡Felicidades, {charData.name}! 🏆</h2>
                                <p>Ordenaste {WIN_TARGET} frases correctamente.</p>
                                <div className="word-win-stars">⭐⭐⭐⭐⭐</div>
                            </>
                        ) : (
                            <>
                                <h2 className="word-lose-title">¡Sigue practicando!</h2>
                                <p>La frase correcta era:</p>
                                <p className="word-correct-sentence">"{data.sentence}"</p>
                                <p>Lograste {correctCount} frases correctas.</p>
                            </>
                        )}
                        <div className="word-over-buttons">
                            <button className="word-retry-btn" onClick={restart}>
                                🔄 Jugar otra vez
                            </button>
                            <button className="word-exit-btn" onClick={leaveWordWorld}>
                                🏡 Volver a la granja
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* confetti */}
            {showConfetti && (
                <div className="word-confetti">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <span key={i} className="word-confetti-piece" style={{
                            left: `${rand(0, 100)}%`,
                            animationDelay: `${rand(0, 2000)}ms`,
                            backgroundColor: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff6fb7', '#c084fc'][rand(0, 5)],
                        }} />
                    ))}
                </div>
            )}
        </div>
    )
}
