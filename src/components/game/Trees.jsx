import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const TREE_POSITIONS = [
    [-30, -30], [-25, -35], [-35, -25], [30, -30], [35, -25], [25, -35],
    [-30, 30], [-35, 35], [-25, 25], [30, 30], [35, 25], [28, 38],
    [-40, 0], [40, 5], [-10, 35], [15, 38], [-38, -15], [42, -20],
    [0, -35], [10, -40], [-20, 40], [20, -25],
    [-42, 25], [38, -38], [-15, -42], [42, 42], [-42, -42], [5, 42]
]

// Deterministic pseudo-random
function sr(seed) {
    const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
    return x - Math.floor(x)
}

// ── Noise helpers ──────────────────────────────────────────────────────────────
// Simple smooth 3D value noise (no imports needed)
function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10) }
function lerp(a, b, t) { return a + t * (b - a) }
function grad(h, x, y, z) {
    h = h & 15
    const u = h < 8 ? x : y
    const v = h < 4 ? y : (h === 12 || h === 14 ? x : z)
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
}
const P = Array.from({ length: 512 }, (_, i) => {
    const p = [151,160,137,91,90,15,131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,190,6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,88,237,149,56,87,174,20,125,136,171,168,68,175,74,165,71,134,139,48,27,166,77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,102,143,54,65,25,63,161,1,216,80,73,209,76,132,187,208,89,18,169,200,196,135,130,116,188,159,86,164,100,109,198,173,186,3,64,52,217,226,250,124,123,5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,223,183,170,213,119,248,152,2,44,154,163,70,221,153,101,155,167,43,172,9,129,22,39,253,19,98,108,110,79,113,224,232,178,185,112,104,218,246,97,228,251,34,242,193,238,210,144,12,191,179,162,241,81,51,145,235,249,14,239,107,49,192,214,31,181,199,106,157,184,84,204,176,115,121,50,45,127,4,150,254,138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180]
    return p[i & 255]
})
function noise3(x, y, z) {
    const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z)
    const u = fade(x), v = fade(y), w = fade(z)
    const A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z
    const B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z
    return lerp(
        lerp(lerp(grad(P[AA], x, y, z), grad(P[BA], x - 1, y, z), u),
             lerp(grad(P[AB], x, y - 1, z), grad(P[BB], x - 1, y - 1, z), u), v),
        lerp(lerp(grad(P[AA + 1], x, y, z - 1), grad(P[BA + 1], x - 1, y, z - 1), u),
             lerp(grad(P[AB + 1], x, y - 1, z - 1), grad(P[BB + 1], x - 1, y - 1, z - 1), u), v), w)
}

// Create a noise-displaced icosahedron geometry (organic canopy blob)
function makeCanopyGeo(radius, noiseSeed, noiseAmt = 0.22, detail = 2) {
    const geo = new THREE.IcosahedronGeometry(radius, detail)
    const pos = geo.attributes.position
    const ns = noiseSeed * 3.7
    for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i)
        const len = Math.sqrt(x * x + y * y + z * z)
        const nx = x / len, ny = y / len, nz = z / len
        // Multi-octave noise for organic bumps
        const n = noise3(nx * 2.1 + ns, ny * 2.1 + ns, nz * 2.1 + ns) * 0.6
                + noise3(nx * 4.3 + ns, ny * 4.3 + ns, nz * 4.3 + ns) * 0.3
                + noise3(nx * 8.5 + ns, ny * 8.5 + ns, nz * 8.5 + ns) * 0.1
        const disp = radius * (1 + n * noiseAmt)
        pos.setXYZ(i, nx * disp, ny * disp, nz * disp)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
}

// Create a tapered organic trunk geometry
function makeTrunkGeo(radiusTop, radiusBot, height, seed) {
    const seg = 8, hSeg = 4
    const geo = new THREE.CylinderGeometry(radiusTop, radiusBot, height, seg, hSeg)
    const pos = geo.attributes.position
    for (let i = 0; i < pos.count; i++) {
        const y = pos.getY(i)
        const t = (y / height + 0.5) // 0 at bottom, 1 at top
        const wobble = (1 - t) * 0.12 // more wobble at base
        const angle = sr(seed + i * 3.7) * Math.PI * 2
        pos.setX(i, pos.getX(i) + Math.cos(angle) * wobble * radiusBot)
        pos.setZ(i, pos.getZ(i) + Math.sin(angle) * wobble * radiusBot)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()
    return geo
}

// ── CANOPY INSTANCE using pre-built geometry ───────────────────────────────────
function CanopyBlob({ geo, color, roughness, position, scale }) {
    return (
        <mesh geometry={geo} position={position} scale={scale} castShadow receiveShadow>
            <meshStandardMaterial
                color={color}
                roughness={roughness}
                metalness={0}
            />
        </mesh>
    )
}

// ── OAK TREE ──────────────────────────────────────────────────────────────────
function Oak({ position, s, seed }) {
    const groupRef = useRef()
    const swayOff = useMemo(() => sr(seed) * Math.PI * 2, [seed])
    const swayAmt = useMemo(() => 0.005 + sr(seed + 1) * 0.006, [seed])

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.elapsedTime
        groupRef.current.rotation.x = Math.sin(t * 0.65 + swayOff) * swayAmt
        groupRef.current.rotation.z = Math.cos(t * 0.5 + swayOff + 1) * swayAmt * 0.7
    })

    const barkColor = useMemo(() =>
        [0x4a3728, 0x5c3d2e, 0x3d2b1f, 0x6b4226][Math.floor(sr(seed) * 4)], [seed])

    const trunkH = 3.0 * s

    // Build organic trunk geometry once
    const trunkGeo = useMemo(() =>
        makeTrunkGeo(0.26 * s, 0.52 * s, trunkH, seed), [s, seed, trunkH])

    // Root flare geo
    const rootGeo = useMemo(() =>
        makeTrunkGeo(0.58 * s, 0.76 * s, 0.5 * s, seed + 99), [s, seed])

    // 5–7 canopy clusters with unique noise per blob
    const clusters = useMemo(() => {
        const count = 5 + Math.floor(sr(seed + 10) * 3)
        return Array.from({ length: count }, (_, i) => {
            const angle = sr(seed + i * 5.1) * Math.PI * 2
            const dist = (0.5 + sr(seed + i * 3.3) * 1.0) * s
            const r = (1.0 + sr(seed + i * 2.9) * 0.85) * s
            // Non-uniform scale → not a perfect sphere
            const sx = 0.85 + sr(seed + i * 7.1) * 0.35
            const sy = 0.75 + sr(seed + i * 9.3) * 0.45
            const sz = 0.85 + sr(seed + i * 11.7) * 0.35
            const colors = [0x1a5c20, 0x2a7230, 0x33691e, 0x2e7d32, 0x3d8b37, 0x4a9e3f, 0x1e6b27]
            return {
                geo: makeCanopyGeo(r, seed + i * 17.3, 0.28),
                color: colors[Math.floor(sr(seed + i * 4.1) * colors.length)],
                roughness: 0.88 + sr(seed + i) * 0.1,
                position: [
                    Math.cos(angle) * dist,
                    (trunkH + 0.8 * s) + (sr(seed + i * 7.7) - 0.3) * 1.3 * s,
                    Math.sin(angle) * dist
                ],
                scale: [sx, sy, sz],
            }
        })
    }, [seed, s, trunkH])

    // 2–3 branches
    const branches = useMemo(() => Array.from({ length: 2 + Math.floor(sr(seed + 20) * 2) }, (_, i) => ({
        angle: sr(seed + i * 11.7) * Math.PI * 2,
        lean: 0.5 + sr(seed + i * 6.1) * 0.45,
        len: (0.85 + sr(seed + i * 4.3) * 0.85) * s,
        geo: makeTrunkGeo(0.055 * s, 0.13 * s, (0.85 + sr(seed + i * 4.3) * 0.85) * s, seed + i * 37),
    })), [seed, s])

    const lean = useMemo(() => (sr(seed + 20) - 0.5) * 0.06, [seed])

    return (
        <group position={[position[0], 0, position[1]]}
               rotation={[lean, sr(seed + 3) * Math.PI * 2, lean * 0.4]}>
            <group ref={groupRef}>
                {/* Root flare */}
                <mesh geometry={rootGeo} position={[0, 0.25 * s, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                </mesh>
                {/* Trunk */}
                <mesh geometry={trunkGeo} position={[0, trunkH / 2, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                </mesh>
                {/* Branches */}
                {branches.map((b, i) => (
                    <group key={i} position={[0, trunkH * 0.6, 0]} rotation={[0, b.angle, 0]}>
                        <mesh geometry={b.geo}
                              position={[b.len * 0.42, b.len * 0.22, 0]}
                              rotation={[0, 0, b.lean]}
                              castShadow>
                            <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                        </mesh>
                    </group>
                ))}
                {/* Canopy blobs */}
                {clusters.map((c, i) => (
                    <CanopyBlob key={i} {...c} />
                ))}
            </group>
        </group>
    )
}

// ── PINE TREE ─────────────────────────────────────────────────────────────────
function Pine({ position, s, seed }) {
    const groupRef = useRef()
    const swayOff = useMemo(() => sr(seed) * Math.PI * 2, [seed])
    const swayAmt = useMemo(() => 0.004 + sr(seed + 1) * 0.005, [seed])

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.elapsedTime
        groupRef.current.rotation.x = Math.sin(t * 0.7 + swayOff) * swayAmt
        groupRef.current.rotation.z = Math.cos(t * 0.55 + swayOff) * swayAmt * 0.6
    })

    const barkColor = useMemo(() =>
        [0x3d2b1f, 0x4a3728, 0x5c3d2e][Math.floor(sr(seed) * 3)], [seed])

    const trunkH = 3.2 * s
    const trunkGeo = useMemo(() => makeTrunkGeo(0.18 * s, 0.4 * s, trunkH, seed), [s, seed, trunkH])
    const rootGeo  = useMemo(() => makeTrunkGeo(0.48 * s, 0.62 * s, 0.4 * s, seed + 99), [s, seed])

    // Cone layers replaced by noise-displaced oblate blobs stacked
    const layers = useMemo(() => {
        const count = 4 + Math.floor(sr(seed + 5) * 3) // 4–6
        return Array.from({ length: count }, (_, i) => {
            const frac = i / (count - 1)
            const r = (1.7 - frac * 1.1) * s
            const squeeze = 0.52 + sr(seed + i * 2.1) * 0.12 // flat oblate
            return {
                geo: makeCanopyGeo(r, seed + i * 23.1, 0.22, 2),
                y: (trunkH * 0.65 + i * 0.92 * s),
                scale: [1 + sr(seed + i * 3.7) * 0.2, squeeze, 1 + sr(seed + i * 5.3) * 0.2],
                color: [0x1b5e20, 0x215f26, 0x2a7230, 0x2e7d32, 0x33691e, 0x3a7d44][i] || 0x2a7230,
                roughness: 0.9,
            }
        })
    }, [seed, s, trunkH])

    const lean = useMemo(() => (sr(seed + 9) - 0.5) * 0.05, [seed])

    return (
        <group position={[position[0], 0, position[1]]}
               rotation={[lean, sr(seed) * Math.PI * 2, lean * 0.5]}>
            <group ref={groupRef}>
                <mesh geometry={rootGeo} position={[0, 0.2 * s, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                </mesh>
                <mesh geometry={trunkGeo} position={[0, trunkH / 2, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                </mesh>
                {layers.map((l, i) => (
                    <CanopyBlob key={i} {...l} position={[0, l.y, 0]} />
                ))}
            </group>
        </group>
    )
}

// ── FRUIT TREE ────────────────────────────────────────────────────────────────
function FruitTree({ position, s, seed }) {
    const groupRef = useRef()
    const swayOff = useMemo(() => sr(seed) * Math.PI * 2, [seed])
    const swayAmt = useMemo(() => 0.006 + sr(seed + 3) * 0.007, [seed])

    useFrame(({ clock }) => {
        if (!groupRef.current) return
        const t = clock.elapsedTime
        groupRef.current.rotation.x = Math.sin(t * 0.8 + swayOff) * swayAmt
        groupRef.current.rotation.z = Math.cos(t * 0.6 + swayOff) * swayAmt
    })

    const barkColor = useMemo(() =>
        [0x5c3d2e, 0x6b4226, 0x7a4f3a][Math.floor(sr(seed) * 3)], [seed])

    const fruitColor = useMemo(() =>
        [0xe53935, 0xff7043, 0xfdd835, 0xf06292, 0xff8f00, 0xd32f2f][Math.floor(sr(seed + 30) * 6)], [seed])

    const trunkH = 3.0 * s
    const trunkGeo = useMemo(() => makeTrunkGeo(0.22 * s, 0.42 * s, trunkH, seed), [s, seed, trunkH])
    const rootGeo  = useMemo(() => makeTrunkGeo(0.5 * s, 0.65 * s, 0.45 * s, seed + 99), [s, seed])

    // Big irregular canopy made of 4–6 overlapping blobs
    const canopy = useMemo(() => {
        const count = 4 + Math.floor(sr(seed + 10) * 3)
        return Array.from({ length: count }, (_, i) => {
            const angle = sr(seed + i * 5.3) * Math.PI * 2
            const dist  = (i === 0 ? 0 : 0.45 + sr(seed + i * 3.7) * 0.9) * s
            const r = (1.5 + sr(seed + i * 2.9) * 0.8) * s
            const colors = [0x2d6a2d, 0x33691e, 0x3a7d44, 0x2a7230, 0x4a8c3f, 0x22692e]
            return {
                geo: makeCanopyGeo(r, seed + i * 19.1, 0.3, 2),
                color: colors[Math.floor(sr(seed + i * 6.1) * colors.length)],
                roughness: 0.85 + sr(seed + i) * 0.12,
                position: [
                    Math.cos(angle) * dist,
                    (trunkH + 0.5 * s) + (sr(seed + i * 7.3) - 0.2) * 1.1 * s,
                    Math.sin(angle) * dist
                ],
                scale: [
                    0.88 + sr(seed + i * 7.1) * 0.28,
                    0.82 + sr(seed + i * 9.3) * 0.38,
                    0.88 + sr(seed + i * 11.7) * 0.28
                ],
            }
        })
    }, [seed, s, trunkH])

    // Branches
    const branches = useMemo(() => Array.from({ length: 3 }, (_, i) => ({
        angle: (i / 3) * Math.PI * 2 + sr(seed + i) * 0.8,
        len: (0.8 + sr(seed + i * 5.3) * 0.7) * s,
        geo: makeTrunkGeo(0.05 * s, 0.12 * s, (0.8 + sr(seed + i * 5.3) * 0.7) * s, seed + i * 41),
    })), [seed, s])

    // Fruits
    const fruits = useMemo(() =>
        Array.from({ length: 4 + Math.floor(sr(seed + 50) * 6) }, (_, i) => {
            const angle = sr(seed + i * 13.1) * Math.PI * 2
            const dist  = (0.9 + sr(seed + i * 7.7) * 1.3) * s
            return {
                x: Math.cos(angle) * dist,
                y: (trunkH + 0.6 + sr(seed + i * 5.3) * 1.3) * s,
                z: Math.sin(angle) * dist,
                r: (0.1 + sr(seed + i * 3.1) * 0.09) * s,
            }
        })
    , [seed, s, trunkH])

    const lean = useMemo(() => (sr(seed + 40) - 0.5) * 0.06, [seed])

    return (
        <group position={[position[0], 0, position[1]]}
               rotation={[lean, sr(seed + 6) * Math.PI * 2, lean * 0.5]}>
            <group ref={groupRef}>
                <mesh geometry={rootGeo} position={[0, 0.22 * s, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                </mesh>
                <mesh geometry={trunkGeo} position={[0, trunkH / 2, 0]} castShadow receiveShadow>
                    <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                </mesh>
                {branches.map((b, i) => (
                    <group key={i} position={[0, trunkH * 0.62, 0]} rotation={[0, b.angle, 0]}>
                        <mesh geometry={b.geo}
                              position={[b.len * 0.4, b.len * 0.22, 0]}
                              rotation={[0, 0, 0.65]} castShadow>
                            <meshStandardMaterial color={barkColor} roughness={0.95} metalness={0} />
                        </mesh>
                    </group>
                ))}
                {canopy.map((c, i) => (
                    <CanopyBlob key={i} {...c} />
                ))}
                {/* Shiny fruits */}
                {fruits.map((f, i) => (
                    <mesh key={i} position={[f.x, f.y, f.z]} castShadow>
                        <sphereGeometry args={[f.r, 7, 7]} />
                        <meshStandardMaterial
                            color={fruitColor}
                            roughness={0.25}
                            metalness={0.05}
                        />
                    </mesh>
                ))}
            </group>
        </group>
    )
}

// ── EXPORT ────────────────────────────────────────────────────────────────────
export function Trees() {
    const trees = useMemo(() =>
        TREE_POSITIONS.map(([x, z], i) => ({
            pos: [x, z],
            scale: 0.75 + sr(i * 7.3) * 0.65,
            variant: ['oak', 'pine', 'fruit'][i % 3],
            seed: i * 13.7 + 1,
            key: i,
        }))
    , [])

    return (
        <group>
            {trees.map(t =>
                t.variant === 'pine'
                    ? <Pine key={t.key} position={t.pos} s={t.scale} seed={t.seed} />
                    : t.variant === 'oak'
                        ? <Oak key={t.key} position={t.pos} s={t.scale} seed={t.seed} />
                        : <FruitTree key={t.key} position={t.pos} s={t.scale} seed={t.seed} />
            )}
        </group>
    )
}
