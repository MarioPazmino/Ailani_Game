import { useMemo } from 'react'

const TREE_POSITIONS = [
    [-30, -30], [-25, -35], [-35, -25], [30, -30], [35, -25], [25, -35],
    [-30, 30], [-35, 35], [-25, 25], [30, 30], [35, 25], [28, 38],
    [-40, 0], [40, 5], [-10, 35], [15, 38], [-38, -15], [42, -20],
    [0, -35], [10, -40], [-20, 40], [20, -25],
    [-42, 25], [38, -38], [-15, -42], [42, 42], [-42, -42], [5, 42]
]

function Tree({ position, scale: s, variant }) {
    if (variant === 'pine') {
        return (
            <group position={[position[0], 0, position[1]]}>
                {/* Trunk */}
                <mesh position={[0, 1.5 * s, 0]} castShadow>
                    <cylinderGeometry args={[0.2 * s, 0.35 * s, 3 * s, 6]} />
                    <meshLambertMaterial color={0x5d4037} />
                </mesh>
                {/* Pine layers */}
                <mesh position={[0, 3.0 * s, 0]} castShadow>
                    <coneGeometry args={[1.8 * s, 2.5 * s, 8]} />
                    <meshLambertMaterial color={0x2e7d32} />
                </mesh>
                <mesh position={[0, 4.2 * s, 0]} castShadow>
                    <coneGeometry args={[1.4 * s, 2.0 * s, 8]} />
                    <meshLambertMaterial color={0x388e3c} />
                </mesh>
                <mesh position={[0, 5.2 * s, 0]} castShadow>
                    <coneGeometry args={[0.9 * s, 1.5 * s, 8]} />
                    <meshLambertMaterial color={0x43a047} />
                </mesh>
            </group>
        )
    }

    if (variant === 'round') {
        return (
            <group position={[position[0], 0, position[1]]}>
                {/* Thick trunk with root bulge */}
                <mesh position={[0, 0.3 * s, 0]} castShadow>
                    <cylinderGeometry args={[0.35 * s, 0.5 * s, 0.6 * s, 8]} />
                    <meshLambertMaterial color={0x5d4037} />
                </mesh>
                <mesh position={[0, 1.8 * s, 0]} castShadow>
                    <cylinderGeometry args={[0.25 * s, 0.35 * s, 3 * s, 8]} />
                    <meshLambertMaterial color={0x6d4c2e} />
                </mesh>
                {/* Multi-sphere canopy */}
                <mesh position={[0, 4 * s, 0]} castShadow>
                    <sphereGeometry args={[2.0 * s, 10, 8]} />
                    <meshLambertMaterial color={0x2e7d32} />
                </mesh>
                <mesh position={[0.8 * s, 3.5 * s, 0.5 * s]}>
                    <sphereGeometry args={[1.2 * s, 8, 8]} />
                    <meshLambertMaterial color={0x388e3c} />
                </mesh>
                <mesh position={[-0.7 * s, 3.8 * s, -0.6 * s]}>
                    <sphereGeometry args={[1.0 * s, 8, 8]} />
                    <meshLambertMaterial color={0x43a047} />
                </mesh>
                <mesh position={[0.3 * s, 4.5 * s, -0.4 * s]}>
                    <sphereGeometry args={[1.1 * s, 8, 8]} />
                    <meshLambertMaterial color={0x388e3c} />
                </mesh>
            </group>
        )
    }

    // Default — fruit tree
    return (
        <group position={[position[0], 0, position[1]]}>
            <mesh position={[0, 1.5 * s, 0]} castShadow>
                <cylinderGeometry args={[0.3 * s, 0.4 * s, 3 * s, 8]} />
                <meshLambertMaterial color={0x6d4c2e} />
            </mesh>
            {/* Branch stubs */}
            <mesh position={[0.3 * s, 2.5 * s, 0]} rotation={[0, 0, -0.8]}>
                <cylinderGeometry args={[0.08 * s, 0.1 * s, 0.8 * s, 4]} />
                <meshLambertMaterial color={0x6d4c2e} />
            </mesh>
            <mesh position={[-0.25 * s, 2.2 * s, 0.2 * s]} rotation={[0.3, 0, 0.7]}>
                <cylinderGeometry args={[0.06 * s, 0.09 * s, 0.7 * s, 4]} />
                <meshLambertMaterial color={0x6d4c2e} />
            </mesh>
            {/* Canopy */}
            <mesh position={[0, 4 * s, 0]} castShadow>
                <sphereGeometry args={[2 * s, 10, 8]} />
                <meshLambertMaterial color={0x2e7d32} />
            </mesh>
            <mesh position={[0.5 * s, 3.5 * s, 0.5 * s]}>
                <sphereGeometry args={[1.0 * s, 8, 8]} />
                <meshLambertMaterial color={0x388e3c} />
            </mesh>
            {/* Fruits */}
            {[[-0.5, 3.2, 0.8], [0.7, 3.0, -0.5], [-0.3, 3.6, -0.7]].map(([fx, fy, fz], i) => (
                <mesh key={i} position={[fx * s, fy * s, fz * s]}>
                    <sphereGeometry args={[0.15 * s, 6, 6]} />
                    <meshLambertMaterial color={[0xff7043, 0xfdd835, 0xff5252][i]} />
                </mesh>
            ))}
        </group>
    )
}

export function Trees() {
    const trees = useMemo(() =>
        TREE_POSITIONS.map(([x, z], i) => ({
            pos: [x, z],
            scale: 0.8 + (Math.sin(i * 7.3) * 0.5 + 0.5) * 0.6,
            variant: ['round', 'pine', 'fruit'][i % 3],
            key: i
        }))
        , [])

    return (
        <group>
            {trees.map(t => (
                <Tree key={t.key} position={t.pos} scale={t.scale} variant={t.variant} />
            ))}
        </group>
    )
}
