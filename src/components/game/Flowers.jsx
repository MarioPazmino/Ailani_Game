import { useMemo } from 'react'

const COLORS = [0xff6b6b, 0xffd93d, 0xff85c8, 0xc084fc, 0x6bcaff, 0xff9f43]

function Flower({ position, color }) {
    return (
        <group>
            {/* Stem */}
            <mesh position={[position[0], 0.3, position[1]]}>
                <cylinderGeometry args={[0.04, 0.04, 0.6, 4]} />
                <meshLambertMaterial color={0x388e3c} />
            </mesh>
            {/* Petal */}
            <mesh position={[position[0], 0.7, position[1]]}>
                <sphereGeometry args={[0.2, 6, 6]} />
                <meshLambertMaterial color={color} />
            </mesh>
        </group>
    )
}

export function Flowers() {
    const flowers = useMemo(() => {
        const arr = []
        for (let i = 0; i < 60; i++) {
            const seed = Math.sin(i * 13.37) * 0.5 + 0.5
            const seed2 = Math.cos(i * 7.91) * 0.5 + 0.5
            arr.push({
                pos: [(seed - 0.5) * 90, (seed2 - 0.5) * 90],
                color: COLORS[i % COLORS.length],
                key: i
            })
        }
        return arr
    }, [])

    return (
        <group>
            {flowers.map(f => (
                <Flower key={f.key} position={f.pos} color={f.color} />
            ))}
        </group>
    )
}
