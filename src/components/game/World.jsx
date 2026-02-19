import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { gameState } from './gameState'
import { FarmhouseInterior } from './FarmhouseInterior'
import { BarnInterior } from './BarnInterior'

/* ====== SUBCOMPONENTS ====== */

function Ground() {
    return (
        <group>
            {/* Base dirt */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshLambertMaterial color={0x5d4037} />
            </mesh>
            {/* Main grass layer */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]} receiveShadow>
                <planeGeometry args={[100, 100]} />
                <meshLambertMaterial color={0x4caf50} />
            </mesh>
            {/* Grass variation patches — darker/lighter areas */}
            {[[-20, 15, 18, 14, 0x388e3c], [15, -25, 22, 16, 0x66bb6a], [-30, -20, 15, 12, 0x2e7d32],
            [25, 30, 20, 10, 0x43a047], [35, -10, 12, 18, 0x558b2f], [-10, 35, 16, 20, 0x66bb6a],
            [-40, -35, 14, 10, 0x388e3c], [40, 20, 10, 16, 0x4caf50]
            ].map(([x, z, w, h, c], i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[x, 0.015, z]} receiveShadow>
                    <planeGeometry args={[w, h]} />
                    <meshLambertMaterial color={c} />
                </mesh>
            ))}
        </group>
    )
}

/* Raised grass blades — small clumps scattered */
function GrassClumps() {
    const clumps = useMemo(() => {
        const arr = []
        for (let i = 0; i < 80; i++) {
            const seed = Math.sin(i * 17.31) * 0.5 + 0.5
            const seed2 = Math.cos(i * 11.47) * 0.5 + 0.5
            const x = (seed - 0.5) * 90
            const z = (seed2 - 0.5) * 90
            // Avoid paths and buildings
            if (Math.abs(x) < 3 && Math.abs(z) < 30) continue
            if (Math.abs(z - 5) < 3 && Math.abs(x) < 20) continue
            if (x > -20 && x < -10 && z > -20 && z < -10) continue
            if (x > 12 && x < 25 && z > -18 && z < -6) continue
            arr.push({ x, z, h: 0.15 + seed * 0.25, r: Math.sin(i * 3.7) * 0.3, key: i })
        }
        return arr
    }, [])

    return (
        <group>
            {clumps.map(g => (
                <group key={g.key} position={[g.x, 0, g.z]} rotation={[0, g.r, 0]}>
                    {/* 3 blade cluster */}
                    <mesh position={[-0.06, g.h / 2, 0]} rotation={[0, 0, 0.15]}>
                        <boxGeometry args={[0.04, g.h, 0.02]} />
                        <meshLambertMaterial color={0x388e3c} />
                    </mesh>
                    <mesh position={[0, g.h / 2 + 0.03, 0]} rotation={[0, 0.4, 0]}>
                        <boxGeometry args={[0.04, g.h + 0.06, 0.02]} />
                        <meshLambertMaterial color={0x2e7d32} />
                    </mesh>
                    <mesh position={[0.06, g.h / 2 - 0.02, 0]} rotation={[0, -0.3, -0.1]}>
                        <boxGeometry args={[0.04, g.h - 0.04, 0.02]} />
                        <meshLambertMaterial color={0x43a047} />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

function DirtPath() {
    return (
        <group>
            {/* Main vertical path */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 0]} receiveShadow>
                <planeGeometry args={[4, 60]} />
                <meshLambertMaterial color={0xb87333} />
            </mesh>
            {/* Path edges (slightly darker) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-2.2, 0.022, 0]} receiveShadow>
                <planeGeometry args={[0.5, 60]} />
                <meshLambertMaterial color={0x9e6930} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[2.2, 0.022, 0]} receiveShadow>
                <planeGeometry args={[0.5, 60]} />
                <meshLambertMaterial color={0x9e6930} />
            </mesh>
            {/* Horizontal crosspath */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.025, 5]} receiveShadow>
                <planeGeometry args={[40, 4]} />
                <meshLambertMaterial color={0xb87333} />
            </mesh>
            {/* Stepping stones on path */}
            {[-18, -12, -6, 0, 6, 12, 18].map((z, i) => (
                <mesh key={i} rotation={[-Math.PI / 2, 0, Math.sin(i) * 0.3]} position={[0, 0.03, z]} receiveShadow>
                    <circleGeometry args={[0.6, 8]} />
                    <meshLambertMaterial color={0x8d6e63} />
                </mesh>
            ))}
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
    const wallsRef = useRef()
    const matsRef = useRef(null)
    const opacity = useRef(1)

    useFrame(() => {
        const dx = gameState.playerPosition.x - (-15)
        const dz = gameState.playerPosition.z - (-12)
        const dist = Math.sqrt(dx * dx + dz * dz)
        const targetOpacity = dist < 6 ? 0.15 : 1
        const diff = targetOpacity - opacity.current
        if (Math.abs(diff) < 0.005) return
        opacity.current += diff * 0.08
        // Cache materials on first run
        if (!matsRef.current && wallsRef.current) {
            matsRef.current = []
            wallsRef.current.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.transparent = true
                    matsRef.current.push(child.material)
                }
            })
        }
        if (matsRef.current) {
            for (let i = 0; i < matsRef.current.length; i++) {
                matsRef.current[i].opacity = opacity.current
            }
        }
    })

    return (
        <group position={[-15, 0, -15]}>
            {/* Interior (always rendered, visible when walls transparent) */}
            <FarmhouseInterior />

            {/* Exterior shell */}
            <group ref={wallsRef}>
                {/* Foundation */}
                <mesh position={[0, 0.2, 0]} castShadow>
                    <boxGeometry args={[8.5, 0.4, 6.5]} />
                    <meshLambertMaterial color={0x9e9e9e} />
                </mesh>
                {/* Walls */}
                <mesh position={[0, 2.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[8, 5, 6]} />
                    <meshLambertMaterial color={0xfaebd7} />
                </mesh>
                {/* Wall trim */}
                <mesh position={[0, 4.95, 0]} castShadow>
                    <boxGeometry args={[8.2, 0.15, 6.2]} />
                    <meshLambertMaterial color={0xdec4a0} />
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
                {/* Door handle */}
                <mesh position={[0.5, 1.6, 3.12]}>
                    <sphereGeometry args={[0.08, 6, 6]} />
                    <meshPhongMaterial color={0xffd700} />
                </mesh>
                {/* Porch */}
                <mesh position={[0, 0.15, 4.5]}>
                    <boxGeometry args={[5, 0.15, 2.5]} />
                    <meshLambertMaterial color={0xa0845c} />
                </mesh>
                {/* Windows */}
                {[-2.5, 2.5].map(x => (
                    <group key={x} position={[x, 3.2, 3.05]}>
                        <mesh><boxGeometry args={[1.2, 1.2, 0.1]} /><meshLambertMaterial color={0x85d4f7} /></mesh>
                        <mesh position={[0, 0, 0.02]}><boxGeometry args={[0.08, 1.2, 0.02]} /><meshLambertMaterial color={0xfaebd7} /></mesh>
                        <mesh position={[0, 0, 0.02]}><boxGeometry args={[1.2, 0.08, 0.02]} /><meshLambertMaterial color={0xfaebd7} /></mesh>
                    </group>
                ))}
                {/* Chimney */}
                <mesh position={[3, 7, -1]} castShadow>
                    <boxGeometry args={[1, 2.5, 1]} />
                    <meshLambertMaterial color={0x7f4030} />
                </mesh>
                {/* Flower boxes */}
                {[-2.5, 2.5].map(x => (
                    <group key={`fb${x}`} position={[x, 2.4, 3.2]}>
                        <mesh><boxGeometry args={[1.2, 0.25, 0.3]} /><meshLambertMaterial color={0x8d6e3c} /></mesh>
                        {[-0.3, 0, 0.3].map((ox, i) => (
                            <mesh key={i} position={[ox, 0.25, 0]}><sphereGeometry args={[0.12, 6, 6]} /><meshLambertMaterial color={[0xff6b6b, 0xffd93d, 0xff85c8][i]} /></mesh>
                        ))}
                    </group>
                ))}
            </group>
        </group>
    )
}

function Barn() {
    const wallsRef = useRef()
    const matsRef = useRef(null)
    const opacity = useRef(1)

    useFrame(() => {
        const dx = gameState.playerPosition.x - 18
        const dz = gameState.playerPosition.z - (-8)
        const dist = Math.sqrt(dx * dx + dz * dz)
        const targetOpacity = dist < 7 ? 0.15 : 1
        const diff = targetOpacity - opacity.current
        if (Math.abs(diff) < 0.005) return
        opacity.current += diff * 0.08
        if (!matsRef.current && wallsRef.current) {
            matsRef.current = []
            wallsRef.current.traverse(child => {
                if (child.isMesh && child.material) {
                    child.material.transparent = true
                    matsRef.current.push(child.material)
                }
            })
        }
        if (matsRef.current) {
            for (let i = 0; i < matsRef.current.length; i++) {
                matsRef.current[i].opacity = opacity.current
            }
        }
    })

    return (
        <group position={[18, 0, -12]}>
            {/* Interior */}
            <BarnInterior />

            {/* Exterior shell */}
            <group ref={wallsRef}>
                <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
                    <boxGeometry args={[10, 7, 8]} />
                    <meshLambertMaterial color={0xb71c1c} />
                </mesh>
                {/* White trim */}
                <mesh position={[0, 7, 0]}>
                    <boxGeometry args={[10.2, 0.15, 8.2]} />
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
                <mesh position={[0, 0.08, 0]}>
                    <boxGeometry args={[10.2, 0.15, 8.2]} />
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
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
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
                <mesh position={[0, 2.5, 4.1]} rotation={[0, 0, -0.5]}>
                    <boxGeometry args={[0.15, 5.5, 0.05]} />
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
                {/* Hay bales near barn */}
                {[[6, 0.5, 2], [7, 0.5, 0], [6.5, 1.3, 1]].map(([x, y, z], i) => (
                    <mesh key={i} position={[x, y, z]} rotation={[0, i * 0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.6, 0.6, 1.2, 8]} />
                        <meshLambertMaterial color={0xd4a057} />
                    </mesh>
                ))}
            </group>
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
                <meshPhongMaterial color={0x29b6f6} shininess={80} />
            </mesh>
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
            {/* Bucket */}
            <mesh position={[0, 2.2, 0]}>
                <cylinderGeometry args={[0.2, 0.25, 0.35, 8]} />
                <meshLambertMaterial color={0x5d4037} />
            </mesh>
            {/* Rope */}
            <mesh position={[0, 2.8, 0]}>
                <cylinderGeometry args={[0.02, 0.02, 1, 4]} />
                <meshLambertMaterial color={0xbcaaa4} />
            </mesh>
        </group>
    )
}

function Orchard() {
    const items = useMemo(() => {
        const arr = []
        const crops = [
            { color: 0x7cb342, fruit: 0xff7043, name: 'tomato' },
            { color: 0x558b2f, fruit: 0xfdd835, name: 'corn' },
            { color: 0x66bb6a, fruit: 0x9c27b0, name: 'eggplant' },
            { color: 0x43a047, fruit: 0xff5722, name: 'carrot' },
        ]
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 6; col++) {
                const x = -30 + col * 3
                const z = 10 + row * 3
                const crop = crops[row % crops.length]
                arr.push({ x, z, hasFruit: Math.sin(row * 3 + col * 7) > -0.3, crop, key: `${row}-${col}` })
            }
        }
        return arr
    }, [])

    return (
        <group>
            {/* Soil rows with ridge texture */}
            {[0, 1, 2, 3].map(row => (
                <group key={`soil-${row}`}>
                    <mesh position={[-22.5, 0.1, 10 + row * 3]} receiveShadow>
                        <boxGeometry args={[18, 0.2, 1.5]} />
                        <meshLambertMaterial color={0x5d4037} />
                    </mesh>
                    {/* Soil ridges */}
                    {[-30, -27, -24, -21, -18, -15].map((x, i) => (
                        <mesh key={i} position={[x, 0.18, 10 + row * 3]} receiveShadow>
                            <boxGeometry args={[2.2, 0.08, 0.8]} />
                            <meshLambertMaterial color={0x6d4c2e} />
                        </mesh>
                    ))}
                </group>
            ))}
            {/* Crops with leaves and fruits */}
            {items.map(item => (
                <group key={item.key}>
                    {/* Stem */}
                    <mesh position={[item.x, 0.4, item.z]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.5, 4]} />
                        <meshLambertMaterial color={0x33691e} />
                    </mesh>
                    {/* Leaves */}
                    <mesh position={[item.x - 0.15, 0.55, item.z]} rotation={[0, 0, 0.4]}>
                        <boxGeometry args={[0.3, 0.08, 0.15]} />
                        <meshLambertMaterial color={item.crop.color} />
                    </mesh>
                    <mesh position={[item.x + 0.15, 0.5, item.z]} rotation={[0, 0.5, -0.3]}>
                        <boxGeometry args={[0.25, 0.08, 0.12]} />
                        <meshLambertMaterial color={item.crop.color} />
                    </mesh>
                    {/* Bush body */}
                    <mesh position={[item.x, 0.6, item.z]} castShadow>
                        <sphereGeometry args={[0.35, 6, 6]} />
                        <meshLambertMaterial color={item.crop.color} />
                    </mesh>
                    {item.hasFruit && (
                        <mesh position={[item.x + 0.2, 0.8, item.z + 0.1]}>
                            <sphereGeometry args={[0.14, 6, 6]} />
                            <meshLambertMaterial color={item.crop.fruit} />
                        </mesh>
                    )}
                </group>
            ))}
            {/* Watering can decoration */}
            <mesh position={[-13, 0.3, 12]} rotation={[0, 0.5, 0.1]}>
                <cylinderGeometry args={[0.2, 0.3, 0.5, 8]} />
                <meshLambertMaterial color={0x78909c} />
            </mesh>
        </group>
    )
}

/* Small rocks/pebbles */
function Rocks() {
    const rocks = useMemo(() => {
        const arr = []
        for (let i = 0; i < 25; i++) {
            const seed = Math.sin(i * 23.1) * 0.5 + 0.5
            const seed2 = Math.cos(i * 19.7) * 0.5 + 0.5
            arr.push({
                x: (seed - 0.5) * 88, z: (seed2 - 0.5) * 88,
                s: 0.15 + seed * 0.3, key: i,
                c: [0x9e9e9e, 0x757575, 0xbdbdbd][i % 3]
            })
        }
        return arr
    }, [])
    return (
        <group>
            {rocks.map(r => (
                <mesh key={r.key} position={[r.x, r.s * 0.4, r.z]} castShadow>
                    <dodecahedronGeometry args={[r.s, 0]} />
                    <meshLambertMaterial color={r.c} />
                </mesh>
            ))}
        </group>
    )
}

/* ====== MAIN EXPORT ====== */
export function World() {
    return (
        <group>
            <Ground />
            <GrassClumps />
            <DirtPath />
            <Fence />
            <Farmhouse />
            <Barn />
            <Well />
            <Orchard />
            <Rocks />
        </group>
    )
}
