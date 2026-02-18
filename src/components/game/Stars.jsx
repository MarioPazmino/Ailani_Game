import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { gameState } from './gameState'
import { useGameStore } from '../../store'

const STAR_POSITIONS = [
    [-20, 2.5, 30], [15, 2.5, 35], [35, 2.5, 20], [-35, 2.5, -10],
    [20, 2.5, -30], [-10, 2.5, -35], [40, 2.5, 0], [-40, 2.5, 15],
    [0, 2.5, 40], [30, 2.5, -15], [-25, 2.5, -30], [5, 2.5, 20]
]

function Star({ position }) {
    const ref = useRef()
    const collected = useRef(false)
    const baseY = position[1]

    useFrame((state) => {
        if (collected.current || !ref.current) return
        const t = state.clock.elapsedTime
        ref.current.rotation.y = t * 2
        ref.current.rotation.x = t * 0.5
        ref.current.position.y = baseY + Math.sin(t * 2 + position[0]) * 0.5

        const dx = gameState.playerPosition.x - ref.current.position.x
        const dz = gameState.playerPosition.z - ref.current.position.z
        if (Math.sqrt(dx * dx + dz * dz) < 1.8) {
            collected.current = true
            ref.current.visible = false
            const store = useGameStore.getState()
            store.collectStar()
            const newStars = useGameStore.getState().stars
            store.showTooltip(`⭐ +20 pts! (${newStars}/12)`)
            if (newStars === 12) {
                setTimeout(() => {
                    useGameStore.getState().showTooltip('🎉 ¡Todas las estrellas recolectadas! 🎉')
                }, 2000)
            }
        }
    })

    return (
        <group ref={ref} position={position}>
            {/* Glow sphere */}
            <mesh>
                <sphereGeometry args={[0.7, 6, 6]} />
                <meshPhongMaterial color={0xffd700} emissive={0xffb300} emissiveIntensity={0.6} transparent opacity={0.15} />
            </mesh>
            {/* Star body */}
            <mesh castShadow>
                <octahedronGeometry args={[0.45, 0]} />
                <meshPhongMaterial color={0xffd700} emissive={0xffb300} emissiveIntensity={0.5} shininess={120} />
            </mesh>
            <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
                <octahedronGeometry args={[0.35, 0]} />
                <meshPhongMaterial color={0xffea00} emissive={0xffc107} emissiveIntensity={0.4} shininess={120} />
            </mesh>
        </group>
    )
}

export function Stars() {
    return (
        <group>
            {STAR_POSITIONS.map((pos, i) => (
                <Star key={i} position={pos} />
            ))}
        </group>
    )
}
