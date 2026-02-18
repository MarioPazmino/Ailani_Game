import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { gameState } from './gameState'
import { useGameStore } from '../../store'

const STAR_POSITIONS = [
    [-20, 2, 30], [15, 2, 35], [35, 2, 20], [-35, 2, -10],
    [20, 2, -30], [-10, 2, -35], [40, 2, 0], [-40, 2, 15],
    [0, 2, 40], [30, 2, -15], [-25, 2, -30], [5, 2, 20]
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
        ref.current.position.y = baseY + Math.sin(t * 2 + position[0]) * 0.4

        // Proximity check
        const dx = gameState.playerPosition.x - ref.current.position.x
        const dz = gameState.playerPosition.z - ref.current.position.z
        if (Math.sqrt(dx * dx + dz * dz) < 1.5) {
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
        <mesh ref={ref} position={position} castShadow>
            <octahedronGeometry args={[0.5, 0]} />
            <meshPhongMaterial
                color={0xffd700}
                emissive={0xffb300}
                emissiveIntensity={0.4}
                shininess={100}
            />
        </mesh>
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
