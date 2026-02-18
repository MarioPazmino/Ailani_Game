import { useMemo } from 'react'

/* ====== SUBCOMPONENTS ====== */

function Ground() {
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
            <planeGeometry args={[100, 100]} />
            <meshLambertMaterial color={0x4caf50} />
        </mesh>
    )
}

function DirtPath() {
    return (
        <group>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]} receiveShadow>
                <planeGeometry args={[4, 60]} />
                <meshLambertMaterial color={0xb87333} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]} receiveShadow>
                <planeGeometry args={[40, 4]} />
                <meshLambertMaterial color={0xb87333} />
            </mesh>
        </group>
    )
}

function Fence() {
    const posts = useMemo(() => {
        const arr = []
        for (let side = 0; side < 4; side++) {
            for (let i = -24; i <= 24; i += 4) {
                let x, z
                if (side === 0) { x = i; z = -48 }
                else if (side === 1) { x = i; z = 48 }
                else if (side === 2) { x = -48; z = i * 2 }
                else { x = 48; z = i * 2 }
                arr.push({ x, z, key: `${side}-${i}` })
            }
        }
        return arr
    }, [])

    const rails = useMemo(() => {
        const arr = []
        const defs = [
            { w: 96, h: 0.15, d: 0.2, x: 0, z: -48 },
            { w: 96, h: 0.15, d: 0.2, x: 0, z: 48 },
            { w: 0.2, h: 0.15, d: 96, x: -48, z: 0 },
            { w: 0.2, h: 0.15, d: 96, x: 48, z: 0 },
        ]
        defs.forEach((d, i) => {
            arr.push({ ...d, y: 1.5, key: `r1-${i}` })
            arr.push({ ...d, y: 0.7, key: `r2-${i}` })
        })
        return arr
    }, [])

    return (
        <group>
            {posts.map(p => (
                <mesh key={p.key} position={[p.x, 1, p.z]} castShadow>
                    <cylinderGeometry args={[0.15, 0.15, 2, 6]} />
                    <meshLambertMaterial color={0x8d6e3c} />
                </mesh>
            ))}
            {rails.map(r => (
                <mesh key={r.key} position={[r.x, r.y, r.z]} castShadow>
                    <boxGeometry args={[r.w, r.h, r.d]} />
                    <meshLambertMaterial color={0xa0845c} />
                </mesh>
            ))}
        </group>
    )
}

function Farmhouse() {
    return (
        <group position={[-15, 0, -15]}>
            {/* Walls */}
            <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[8, 5, 6]} />
                <meshLambertMaterial color={0xfaebd7} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 6.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[6, 3, 4]} />
                <meshLambertMaterial color={0xc0392b} />
            </mesh>
            {/* Door */}
            <mesh position={[0, 1.5, 3.05]}>
                <boxGeometry args={[1.5, 3, 0.1]} />
                <meshLambertMaterial color={0x6d4c2e} />
            </mesh>
            {/* Windows */}
            <mesh position={[-2.5, 3.2, 3.05]}>
                <boxGeometry args={[1.2, 1.2, 0.1]} />
                <meshLambertMaterial color={0x85d4f7} />
            </mesh>
            <mesh position={[2.5, 3.2, 3.05]}>
                <boxGeometry args={[1.2, 1.2, 0.1]} />
                <meshLambertMaterial color={0x85d4f7} />
            </mesh>
            {/* Chimney */}
            <mesh position={[3, 7, -1]} castShadow>
                <boxGeometry args={[1, 2.5, 1]} />
                <meshLambertMaterial color={0x7f4030} />
            </mesh>
        </group>
    )
}

function Barn() {
    return (
        <group position={[18, 0, -12]}>
            {/* Body */}
            <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
                <boxGeometry args={[10, 7, 8]} />
                <meshLambertMaterial color={0xb71c1c} />
            </mesh>
            {/* Roof */}
            <mesh position={[0, 8.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
                <coneGeometry args={[7.5, 3, 4]} />
                <meshLambertMaterial color={0x8b0000} />
            </mesh>
            {/* Big door */}
            <mesh position={[0, 2.5, 4.05]}>
                <boxGeometry args={[4, 5, 0.1]} />
                <meshLambertMaterial color={0x5d1612} />
            </mesh>
            {/* X bracing */}
            <mesh position={[0, 2.5, 4.1]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[0.15, 5.5, 0.05]} />
                <meshLambertMaterial color={0x8b5e3c} />
            </mesh>
            <mesh position={[0, 2.5, 4.1]} rotation={[0, 0, -0.5]}>
                <boxGeometry args={[0.15, 5.5, 0.05]} />
                <meshLambertMaterial color={0x8b5e3c} />
            </mesh>
        </group>
    )
}

function Well() {
    return (
        <group position={[10, 0, 8]}>
            <mesh position={[0, 0.75, 0]} castShadow>
                <cylinderGeometry args={[1.2, 1.2, 1.5, 12]} />
                <meshLambertMaterial color={0x78909c} />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
                <cylinderGeometry args={[1, 1, 0.1, 12]} />
                <meshLambertMaterial color={0x29b6f6} />
            </mesh>
            {/* Roof posts */}
            {[-0.8, 0.8].map(x => (
                <mesh key={x} position={[x, 2.5, 0]} castShadow>
                    <cylinderGeometry args={[0.08, 0.08, 2.5, 6]} />
                    <meshLambertMaterial color={0x6d4c2e} />
                </mesh>
            ))}
            <mesh position={[0, 3.8, 0]} castShadow>
                <boxGeometry args={[2.4, 0.15, 1.8]} />
                <meshLambertMaterial color={0x8d6e3c} />
            </mesh>
        </group>
    )
}

function Orchard() {
    const items = useMemo(() => {
        const arr = []
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                const x = -30 + col * 3
                const z = 10 + row * 3
                arr.push({ x, z, hasFruit: Math.random() > 0.4, key: `${row}-${col}` })
            }
        }
        return arr
    }, [])

    return (
        <group>
            {/* Soil rows */}
            {[0, 1, 2, 3].map(row => (
                <mesh key={`soil-${row}`} position={[-22.5, 0.08, 10 + row * 3]} receiveShadow>
                    <boxGeometry args={[18, 0.15, 1.2]} />
                    <meshLambertMaterial color={0x6d4c2e} />
                </mesh>
            ))}
            {/* Crops */}
            {items.map(item => (
                <group key={item.key}>
                    <mesh position={[item.x, 0.6, item.z]} castShadow>
                        <sphereGeometry args={[0.6, 6, 6]} />
                        <meshLambertMaterial color={0x7cb342} />
                    </mesh>
                    {item.hasFruit && (
                        <mesh position={[item.x + 0.3, 1, item.z]}>
                            <sphereGeometry args={[0.18, 6, 6]} />
                            <meshLambertMaterial color={0xff7043} />
                        </mesh>
                    )}
                </group>
            ))}
        </group>
    )
}

/* ====== MAIN EXPORT ====== */

export function World() {
    return (
        <group>
            <Ground />
            <DirtPath />
            <Fence />
            <Farmhouse />
            <Barn />
            <Well />
            <Orchard />
        </group>
    )
}
