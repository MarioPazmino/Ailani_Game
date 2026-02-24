import { useState, useCallback, useEffect, useRef } from 'react'
import { useGameStore, CHARACTERS } from '../../store'
import './MathWorld.css'

/* ── helpers ─────────────────────────────────────────── */
const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min

function generateProblem() {
    const isAdd = Math.random() > 0.5
    let a, b, answer
    if (isAdd) {
        a = rand(10, 89)
        b = rand(10, 99 - a)
        answer = a + b
    } else {
        a = rand(20, 99)
        b = rand(10, a - 10)
        answer = a - b
    }
    return { a, b, op: isAdd ? '+' : '−', answer }
}

const MAX_WRONG = 7   // head, body, L-arm, R-arm, L-leg, R-leg, face
const WIN_TARGET = 10

const HANGMAN_PARTS = [
    'head', 'body', 'leftArm', 'rightArm', 'leftLeg', 'rightLeg', 'face',
]

const ENCOURAGEMENTS = [
    '¡Muy bien! 🌟', '¡Excelente! ✨', '¡Genial! 🎉',
    '¡Correcto! 💪', '¡Increíble! 🏆', '¡Bravo! 🎊',
    '¡Sigue así! 🚀', '¡Fantástico! 💫',
]

const WRONG_MESSAGES = [
    '¡Casi! Intenta otra vez 💪', 'No te rindas 🌻',
    '¡Tú puedes! 🌈', 'Sigue intentando 🍀',
]

/* ── Hangman SVG ─────────────────────────────────────── */
function HangmanDrawing({ wrongCount, saved }) {
    const show = (i) => wrongCount > i

    return (
        <svg viewBox="0 0 200 260" className="hangman-svg">
            {/* gallows */}
            <line x1="20" y1="250" x2="100" y2="250" stroke="#5d4037" strokeWidth="4" />
            <line x1="60" y1="250" x2="60" y2="20" stroke="#5d4037" strokeWidth="4" />
            <line x1="60" y1="20" x2="140" y2="20" stroke="#5d4037" strokeWidth="4" />
            <line x1="140" y1="20" x2="140" y2="50" stroke="#5d4037" strokeWidth="3" />

            {/* head */}
            {show(0) && (
                <circle cx="140" cy="70" r="20" fill={saved ? '#81c784' : '#FFE0B2'}
                    stroke="#5d4037" strokeWidth="2"
                    className={saved ? 'hangman-saved' : ''} />
            )}

            {/* face (last part) */}
            {show(6) && !saved && (
                <g className="hangman-face-sad">
                    <circle cx="133" cy="66" r="2" fill="#5d4037" />
                    <circle cx="147" cy="66" r="2" fill="#5d4037" />
                    <path d="M132 80 Q140 74 148 80" fill="none" stroke="#5d4037" strokeWidth="1.5" />
                </g>
            )}
            {show(0) && saved && (
                <g className="hangman-face-happy">
                    <circle cx="133" cy="66" r="2" fill="#2e7d32" />
                    <circle cx="147" cy="66" r="2" fill="#2e7d32" />
                    <path d="M132 76 Q140 84 148 76" fill="none" stroke="#2e7d32" strokeWidth="1.5" />
                </g>
            )}

            {/* body */}
            {show(1) && (
                <line x1="140" y1="90" x2="140" y2="160" stroke="#5d4037" strokeWidth="3"
                    className={saved ? 'hangman-saved' : ''} />
            )}

            {/* left arm */}
            {show(2) && (
                <line x1="140" y1="110" x2="110" y2="140" stroke="#5d4037" strokeWidth="2.5"
                    className={saved ? 'hangman-saved' : ''} />
            )}

            {/* right arm */}
            {show(3) && (
                <line x1="140" y1="110" x2="170" y2="140" stroke="#5d4037" strokeWidth="2.5"
                    className={saved ? 'hangman-saved' : ''} />
            )}

            {/* left leg */}
            {show(4) && (
                <line x1="140" y1="160" x2="115" y2="200" stroke="#5d4037" strokeWidth="2.5"
                    className={saved ? 'hangman-saved' : ''} />
            )}

            {/* right leg */}
            {show(5) && (
                <line x1="140" y1="160" x2="165" y2="200" stroke="#5d4037" strokeWidth="2.5"
                    className={saved ? 'hangman-saved' : ''} />
            )}

            {/* rope cut effect when saved */}
            {saved && (
                <line x1="140" y1="20" x2="140" y2="50" stroke="#5d4037" strokeWidth="3"
                    strokeDasharray="4 4" className="rope-cut" />
            )}
        </svg>
    )
}

/* ── Number Pad ─────────────────────────────────────── */
function NumberPad({ onNumber, onDelete, onSubmit, disabled }) {
    return (
        <div className="number-pad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                <button key={n} className="num-btn" onClick={() => onNumber(n)} disabled={disabled}>
                    {n}
                </button>
            ))}
            <button className="num-btn num-delete" onClick={onDelete} disabled={disabled}>⌫</button>
            <button className="num-btn" onClick={() => onNumber(0)} disabled={disabled}>0</button>
            <button className="num-btn num-submit" onClick={onSubmit} disabled={disabled}>✓</button>
        </div>
    )
}

/* ── Main Component ──────────────────────────────────── */
export default function MathWorld() {
    const leaveMathWorld = useGameStore(s => s.leaveMathWorld)
    const character = useGameStore(s => s.character)
    const charData = CHARACTERS[character]

    const [problem, setProblem] = useState(() => generateProblem())
    const [input, setInput] = useState('')
    const [wrongCount, setWrongCount] = useState(0)
    const [correctCount, setCorrectCount] = useState(0)
    const [message, setMessage] = useState('')
    const [messageType, setMessageType] = useState('') // 'correct' | 'wrong'
    const [gameOver, setGameOver] = useState(false) // 'win' | 'lose' | false
    const [showConfetti, setShowConfetti] = useState(false)
    const msgTimeout = useRef(null)

    const showMsg = useCallback((text, type, duration = 1500) => {
        setMessage(text)
        setMessageType(type)
        if (msgTimeout.current) clearTimeout(msgTimeout.current)
        msgTimeout.current = setTimeout(() => setMessage(''), duration)
    }, [])

    const nextProblem = useCallback(() => {
        setProblem(generateProblem())
        setInput('')
    }, [])

    const handleNumber = useCallback((n) => {
        if (gameOver) return
        setInput(prev => {
            if (prev.length >= 3) return prev
            return prev + n
        })
    }, [gameOver])

    const handleDelete = useCallback(() => {
        if (gameOver) return
        setInput(prev => prev.slice(0, -1))
    }, [gameOver])

    const handleSubmit = useCallback(() => {
        if (gameOver || input === '') return
        const userAnswer = parseInt(input, 10)

        if (userAnswer === problem.answer) {
            const newCorrect = correctCount + 1
            setCorrectCount(newCorrect)
            showMsg(ENCOURAGEMENTS[rand(0, ENCOURAGEMENTS.length - 1)], 'correct')

            if (newCorrect >= WIN_TARGET) {
                setGameOver('win')
                setShowConfetti(true)
                return
            }
            setTimeout(nextProblem, 800)
        } else {
            const newWrong = wrongCount + 1
            setWrongCount(newWrong)
            showMsg(WRONG_MESSAGES[rand(0, WRONG_MESSAGES.length - 1)], 'wrong')

            if (newWrong >= MAX_WRONG) {
                setGameOver('lose')
                showMsg(`La respuesta era ${problem.answer}`, 'wrong', 5000)
                return
            }
            setInput('')
        }
    }, [gameOver, input, problem, correctCount, wrongCount, showMsg, nextProblem])

    const restart = useCallback(() => {
        setWrongCount(0)
        setCorrectCount(0)
        setGameOver(false)
        setShowConfetti(false)
        setMessage('')
        nextProblem()
    }, [nextProblem])

    /* keyboard support */
    useEffect(() => {
        const handler = (e) => {
            if (e.key >= '0' && e.key <= '9') handleNumber(parseInt(e.key))
            else if (e.key === 'Backspace') handleDelete()
            else if (e.key === 'Enter') handleSubmit()
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [handleNumber, handleDelete, handleSubmit])

    return (
        <div className="math-world">
            {/* background particles */}
            <div className="math-bg-particles">
                {Array.from({ length: 20 }).map((_, i) => (
                    <span key={i} className="math-particle" style={{
                        left: `${rand(0, 100)}%`,
                        animationDelay: `${rand(0, 5000)}ms`,
                        animationDuration: `${rand(4000, 8000)}ms`,
                        fontSize: `${rand(16, 32)}px`,
                    }}>
                        {['+', '−', '×', '÷', '=', '🔢', '✨', '🌟'][rand(0, 7)]}
                    </span>
                ))}
            </div>

            {/* top bar */}
            <div className="math-topbar">
                <button className="math-back-btn" onClick={leaveMathWorld}>
                    ← Volver a la granja
                </button>
                <div className="math-score-bar">
                    <span className="math-correct-count">
                        ✅ {correctCount}/{WIN_TARGET}
                    </span>
                    <span className="math-wrong-count">
                        ❌ {wrongCount}/{MAX_WRONG}
                    </span>
                </div>
            </div>

            {/* title */}
            <h1 className="math-title">
                🧮 Mundo Matemático 🧮
            </h1>
            <p className="math-subtitle">
                ¡{charData.name}, salva al muñeco resolviendo operaciones!
            </p>

            {/* main content */}
            <div className="math-content">
                {/* hangman side */}
                <div className="math-hangman-area">
                    <HangmanDrawing wrongCount={wrongCount} saved={gameOver === 'win'} />
                    {gameOver === 'win' && (
                        <div className="hangman-status hangman-win">
                            🎉 ¡Salvado! 🎉
                        </div>
                    )}
                    {gameOver === 'lose' && (
                        <div className="hangman-status hangman-lose">
                            😢 Oh no...
                        </div>
                    )}
                </div>

                {/* problem side */}
                <div className="math-problem-area">
                    {!gameOver ? (
                        <>
                            <div className="math-problem-card">
                                <div className="math-problem-text">
                                    <span className="math-num">{problem.a}</span>
                                    <span className="math-op">{problem.op}</span>
                                    <span className="math-num">{problem.b}</span>
                                    <span className="math-eq">=</span>
                                    <span className="math-answer-box">
                                        {input || <span className="math-placeholder">?</span>}
                                    </span>
                                </div>
                            </div>

                            {message && (
                                <div className={`math-message math-message-${messageType}`}>
                                    {message}
                                </div>
                            )}

                            <NumberPad
                                onNumber={handleNumber}
                                onDelete={handleDelete}
                                onSubmit={handleSubmit}
                                disabled={gameOver !== false}
                            />
                        </>
                    ) : (
                        <div className="math-game-over">
                            {gameOver === 'win' ? (
                                <>
                                    <h2 className="math-win-title">🏆 ¡Felicidades, {charData.name}! 🏆</h2>
                                    <p>Resolviste {WIN_TARGET} operaciones y salvaste al muñeco.</p>
                                    <div className="math-win-stars">⭐⭐⭐⭐⭐</div>
                                </>
                            ) : (
                                <>
                                    <h2 className="math-lose-title">¡No te rindas!</h2>
                                    <p>La respuesta correcta era <strong>{problem.answer}</strong></p>
                                    <p>Lograste {correctCount} respuestas correctas.</p>
                                </>
                            )}
                            <div className="math-over-buttons">
                                <button className="math-retry-btn" onClick={restart}>
                                    🔄 Jugar otra vez
                                </button>
                                <button className="math-exit-btn" onClick={leaveMathWorld}>
                                    🏡 Volver a la granja
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* confetti */}
            {showConfetti && (
                <div className="math-confetti">
                    {Array.from({ length: 50 }).map((_, i) => (
                        <span key={i} className="confetti-piece" style={{
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
