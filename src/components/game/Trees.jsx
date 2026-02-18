import { useMemo } from 'react'

const TREE_POSITIONS = [
    [-30, -30], [-25, -35], [-35, -25], [30, -30], [35, -25], [25, -35],
    [-30, 30], [-35, 35], [-25, 25], [30, 30], [35, 25], [28, 38],
    [-40, 0], [40, 5], [-10, 35], [15, 38], [-38, -15], [42, -20],
    [0, -35], [10, -40], [-20, 40], [20, -25]
]

function Tree({ position, scale: s }) {
    return (
        <group position={[position[0], 0, position[1]]}>
            {/* Trunk */}
            <mesh position={[0, 1.5 * s, 0]} castShadow>
                <cylinderGeometry args={[0.3 * s, 0.4 * s, 3 * s, 8]} />
                <meshLambertMaterial color={0x6d4c2e} />
            </mesh>
            {/* Canopy */}
            <mesh position={[0, 4 * s, 0]} castShadow>
                <sphereGeometry args={[2 * s, 10, 8]} />
                <meshLambertMaterial color={0x2e7d32} />
            </mesh>
        </group>
    )
}

export function Trees() {
    const trees = useMemo(() =>
        TREE_POSITIONS.map(([x, z], i) => ({
            pos: [x, z],
            scale: 0.8 + (Math.sin(i * 7.3) * 0.5 + 0.5) * 0.6,
            key: i
        }))
        , [])

    return (
        <group>
            {trees.map(t => (
                <Tree key={t.key} position={t.pos} scale={t.scale} />
            ))}
        </group>
    )
}
