import { useMemo } from 'react'

const PETAL_COLORS = [0xff6b6b, 0xffd93d, 0xff85c8, 0xc084fc, 0x6bcaff, 0xff9f43, 0xf06292, 0xab47bc]

function Flower({ x, z, color, scale, type }) {
    const s = scale
    if (type === 'daisy') {
        return (
            <group position={[x, 0, z]}>
                {/* Stem */}
                <mesh position={[0, 0.3 * s, 0]}>
                    <cylinderGeometry args={[0.03 * s, 0.04 * s, 0.6 * s, 4]} />
                    <meshLambertMaterial color={0x388e3c} />
                </mesh>
                {/* Leaf */}
                <mesh position={[0.1 * s, 0.2 * s, 0]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.15 * s, 0.05 * s, 0.08 * s]} />
                    <meshLambertMaterial color={0x4caf50} />
                </mesh>
                {/* Petals — 5 around center */}
                {[0, 1, 2, 3, 4].map(i => {
                    const angle = (i / 5) * Math.PI * 2
                    return (
                        <mesh key={i} position={[Math.cos(angle) * 0.12 * s, 0.65 * s, Math.sin(angle) * 0.12 * s]}>
                            <sphereGeometry args={[0.08 * s, 6, 6]} />
                            <meshLambertMaterial color={color} />
                        </mesh>
                    )
                })}
                {/* Center */}
                <mesh position={[0, 0.65 * s, 0]}>
                    <sphereGeometry args={[0.06 * s, 6, 6]} />
                    <meshLambertMaterial color={0xffd93d} />
                </mesh>
            </group>
        )
    }

    if (type === 'tulip') {
        return (
            <group position={[x, 0, z]}>
                <mesh position={[0, 0.35 * s, 0]}>
                    <cylinderGeometry args={[0.025 * s, 0.035 * s, 0.7 * s, 4]} />
                    <meshLambertMaterial color={0x2e7d32} />
                </mesh>
                {/* Tulip cup — 3 petals */}
                {[0, 1, 2].map(i => {
                    const angle = (i / 3) * Math.PI * 2
                    return (
                        <mesh key={i} position={[Math.cos(angle) * 0.06 * s, 0.72 * s, Math.sin(angle) * 0.06 * s]}
                            rotation={[Math.cos(angle) * 0.3, 0, Math.sin(angle) * 0.3]}>
                            <sphereGeometry args={[0.1 * s, 6, 6]} />
                            <meshLambertMaterial color={color} />
                        </mesh>
                    )
                })}
            </group>
        )
    }

    // Simple wildflower
    return (
        <group position={[x, 0, z]}>
            <mesh position={[0, 0.25 * s, 0]}>
                <cylinderGeometry args={[0.02 * s, 0.03 * s, 0.5 * s, 4]} />
                <meshLambertMaterial color={0x388e3c} />
            </mesh>
            <mesh position={[0, 0.55 * s, 0]}>
                <sphereGeometry args={[0.1 * s, 6, 6]} />
                <meshLambertMaterial color={color} />
            </mesh>
        </group>
    )
}

export function Flowers() {
    const flowers = useMemo(() => {
        const arr = []
        for (let i = 0; i < 80; i++) {
            const seed = Math.sin(i * 13.37) * 0.5 + 0.5
            const seed2 = Math.cos(i * 7.91) * 0.5 + 0.5
            const x = (seed - 0.5) * 90
            const z = (seed2 - 0.5) * 90
            // Skip paths/buildings
            if (Math.abs(x) < 3 && Math.abs(z) < 30) continue
            if (Math.abs(z - 5) < 3 && Math.abs(x) < 20) continue
            arr.push({
                x, z,
                color: PETAL_COLORS[i % PETAL_COLORS.length],
                scale: 0.8 + seed * 0.6,
                type: ['daisy', 'tulip', 'wildflower'][i % 3],
                key: i
            })
        }
        return arr
    }, [])

    return (
        <group>
            {flowers.map(f => (
                <Flower key={f.key} {...f} />
            ))}
        </group>
    )
}
