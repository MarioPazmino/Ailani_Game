import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'

function Cloud({ position }) {
    const ref = useRef()
    const speed = useMemo(() => 0.3 + (Math.sin(position[0] * 3.7) * 0.5 + 0.5) * 0.5, [])
    const puffs = useMemo(() => [
        { x: -2.25, y: Math.random() * 0.5, z: Math.random() * 0.8, s: 1.5 },
        { x: -0.75, y: Math.random() * 0.5, z: Math.random() * 0.8, s: 1.8 },
        { x: 0.75, y: Math.random() * 0.5, z: Math.random() * 0.8, s: 1.3 },
        { x: 2.25, y: Math.random() * 0.5, z: Math.random() * 0.8, s: 1.6 },
    ], [])

    useFrame((_, delta) => {
        if (!ref.current) return
        ref.current.position.x += speed * delta
        if (ref.current.position.x > 55) ref.current.position.x = -55
    })

    return (
        <group ref={ref} position={position}>
            {puffs.map((p, i) => (
                <mesh key={i} position={[p.x, p.y, p.z]}>
                    <sphereGeometry args={[p.s, 8, 8]} />
                    <meshLambertMaterial color={0xffffff} />
                </mesh>
            ))}
        </group>
    )
}

const CLOUD_POSITIONS = [
    [-30, 30, -20], [10, 35, -40], [35, 28, 10],
    [-15, 32, 30], [25, 33, -15], [-40, 29, 0]
]

export function Sky() {
    return (
        <group>
            {/* Sun */}
            <mesh position={[50, 60, -50]}>
                <sphereGeometry args={[4, 16, 16]} />
                <meshBasicMaterial color={0xfdd835} />
            </mesh>
            {/* Sun glow */}
            <sprite position={[50, 60, -50]} scale={[20, 20, 1]}>
                <spriteMaterial color={0xfdd835} transparent opacity={0.3} />
            </sprite>
            {/* Clouds */}
            {CLOUD_POSITIONS.map((pos, i) => (
                <Cloud key={i} position={pos} />
            ))}
        </group>
    )
}
