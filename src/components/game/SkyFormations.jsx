import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useGameStore, CHARACTERS } from '../../store'

const COUNT = 300 // Reduced per formation since we'll have 4 of them (total 1200)
const SPREAD = 40

// Geometry for individual stars
const geometry = new THREE.OctahedronGeometry(0.6, 0)
const material = new THREE.MeshPhongMaterial({
    color: 0xffd700,
    emissive: 0xffb300,
    emissiveIntensity: 0.6,
    shininess: 100
})

export function SkyFormations() {
    // We need 4 groups of stars, one for each cardinal direction
    const meshRef = useRef()

    // Subscribe to store updates
    const starsCollected = useGameStore(state => state.stars)
    const character = useGameStore(state => state.character)

    // Initialize positions for ONE formation
    const { targets, currentPositions } = useMemo(() => {
        // We'll manage 4 * COUNT instances
        // 0-199: North, 200-399: East, 400-599: South, 600-799: West
        const curr = new Float32Array(COUNT * 4 * 3)
        const targ = new Float32Array(COUNT * 4 * 3)

        // Initialize random spread for all
        for (let i = 0; i < COUNT * 4; i++) {
            const angle = Math.floor(i / COUNT) * (Math.PI / 2) // 0, 90, 180, 270 deg

            // Random pos relative to center
            const rx = (Math.random() - 0.5) * SPREAD
            const ry = 10 + Math.random() * 20 // Lower in sky (10-30 height)
            const rz = (Math.random() - 0.5) * SPREAD

            // Offset by direction (push out 60 units)
            const dist = 60
            const x = Math.sin(angle) * dist + rx
            const y = ry
            const z = Math.cos(angle) * dist + rz

            curr[i * 3] = x; curr[i * 3 + 1] = y; curr[i * 3 + 2] = z
            targ[i * 3] = x; targ[i * 3 + 1] = y; targ[i * 3 + 2] = z
        }
        return { targets: targ, currentPositions: curr }
    }, [])

    // Update targets when star count changes
    useEffect(() => {
        const getShapePoint = (index, type) => {
            if (type === 'random') {
                const rx = (Math.random() - 0.5) * SPREAD
                const ry = 10 + Math.random() * 20
                const rz = (Math.random() - 0.5) * SPREAD
                return [rx, ry, rz]
            }
            else if (type === 'heart') {
                const t = Math.random() * Math.PI * 2
                // Parametric heart
                const hx = 16 * Math.pow(Math.sin(t), 3)
                const hy = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
                const hz = (Math.random() - 0.5) * 5
                return [hx * 0.5, 15 + hy * 0.5, hz] // Scale 0.5, lift 15
            }
            else if (type === 'planet') {
                // 70% sphere, 30% ring
                const cutoff = Math.floor(COUNT * 0.7)
                const localIdx = index % COUNT

                if (localIdx < cutoff) {
                    // Sphere
                    const phi = Math.acos(-1 + (2 * localIdx) / cutoff)
                    const theta = Math.sqrt(cutoff * Math.PI) * phi
                    const rad = 6 + Math.random() * 1 // Radius 6-7
                    return [
                        rad * Math.cos(theta) * Math.sin(phi),
                        15 + rad * Math.sin(theta) * Math.sin(phi),
                        rad * Math.cos(phi)
                    ]
                } else {
                    // Ring
                    const angle = (localIdx / (COUNT - cutoff)) * Math.PI * 2
                    const rad = 10 + Math.random() * 3
                    const px = Math.cos(angle) * rad
                    const pz = Math.sin(angle) * rad
                    const py = (Math.random() - 0.5) * 0.5
                    // Tilt
                    const tilt = 0.4
                    return [
                        px,
                        15 + py * Math.cos(tilt) - pz * Math.sin(tilt),
                        py * Math.sin(tilt) + pz * Math.cos(tilt)
                    ]
                }
            }
            else if (type === 'moon') {
                // Crescent Moon: Sphere points, reject if inside offset sphere
                // Minimal rejection sampling by just pushing points out
                let attempts = 0
                while (attempts < 10) {
                    const phi = Math.acos(1 - 2 * Math.random()) // Random point on sphere
                    const theta = Math.random() * Math.PI * 2
                    const rad = 7
                    const x = rad * Math.sin(phi) * Math.cos(theta)
                    const y = rad * Math.sin(phi) * Math.sin(theta)
                    const z = rad * Math.cos(phi)

                    // Shadow sphere offset
                    const sx = x - 3
                    const sy = y - 3
                    const sz = z
                    if (Math.sqrt(sx * sx + sy * sy + sz * sz) > 6) {
                        return [x, 15 + y, z] // Valid crescent point
                    }
                    attempts++
                }
                return [0, 15, 0] // Fallback
            }
            else if (type === 'name') {
                // Pixel-grid bitmap font (5 wide x 7 tall, x:0-4, y:0-6)
                const letterPixels = {
                    'A': [
                        [2,6],
                        [1,5],[3,5],
                        [0,4],[4,4],
                        [0,3],[1,3],[2,3],[3,3],[4,3],
                        [0,2],[4,2],
                        [0,1],[4,1],
                        [0,0],[4,0]
                    ],
                    'I': [
                        [0,6],[1,6],[2,6],[3,6],[4,6],
                        [2,5],[2,4],[2,3],[2,2],[2,1],
                        [0,0],[1,0],[2,0],[3,0],[4,0]
                    ],
                    'L': [
                        [0,6],[0,5],[0,4],[0,3],[0,2],[0,1],
                        [0,0],[1,0],[2,0],[3,0],[4,0]
                    ],
                    'N': [
                        [0,6],[4,6],
                        [0,5],[1,5],[4,5],
                        [0,4],[2,4],[4,4],
                        [0,3],[3,3],[4,3],
                        [0,2],[4,2],
                        [0,1],[4,1],
                        [0,0],[4,0]
                    ],
                    'Y': [
                        [0,6],[4,6],
                        [0,5],[4,5],
                        [1,4],[3,4],
                        [2,3],[2,2],[2,1],[2,0]
                    ],
                    'C': [
                        [1,6],[2,6],[3,6],
                        [0,5],[4,5],
                        [0,4],[0,3],[0,2],
                        [0,1],[4,1],
                        [1,0],[2,0],[3,0]
                    ],
                    'R': [
                        [0,6],[1,6],[2,6],[3,6],
                        [0,5],[4,5],
                        [0,4],[4,4],
                        [0,3],[1,3],[2,3],[3,3],
                        [0,2],[2,2],
                        [0,1],[3,1],
                        [0,0],[4,0]
                    ],
                    'O': [
                        [1,6],[2,6],[3,6],
                        [0,5],[4,5],
                        [0,4],[4,4],
                        [0,3],[4,3],
                        [0,2],[4,2],
                        [0,1],[4,1],
                        [1,0],[2,0],[3,0]
                    ]
                }

                // Use the actual selected character's name
                const charName = (CHARACTERS[character]?.name || 'AILANI').toUpperCase()
                const N = charName.length
                const letterIndex = Math.min(Math.floor((index / COUNT) * N), N - 1)
                const char = charName[letterIndex]
                const pixels = letterPixels[char] || letterPixels['A']

                // Pick a random pixel from the letter definition
                const p = pixels[Math.floor(Math.random() * pixels.length)]

                // Scale: 1 pixel = 1.1 world units; center letter on its box (5×7)
                const S = 1.1
                const lx = (p[0] - 2) * S   // horizontal offset within letter
                const ly = (p[1] - 3) * S   // vertical offset within letter

                // Space letters evenly (7 px per slot = 5 wide + 2 gap), centered around 0
                const letterCenterX = (letterIndex - (N - 1) / 2) * 7 * S

                return [letterCenterX + lx, 15 + ly, (Math.random() - 0.5) * 0.3]
            }
            return [0, 0, 0]
        }

        let type = 'random'
        if (starsCollected > 0) {
            const cycle = (starsCollected - 1) % 4
            if (cycle === 0) type = 'heart'
            else if (cycle === 1) type = 'name'
            else if (cycle === 2) type = 'planet'
            else type = 'moon'
        }

        for (let section = 0; section < 4; section++) {
            const angle = section * (Math.PI / 2)
            const dist = 50 // Distance from center

            for (let i = 0; i < COUNT; i++) {
                const idx = (section * COUNT + i) * 3
                let [localX, localY, localZ] = getShapePoint(i, type)

                // For the 'name' type: sections 1 and 3 (East/West) map localX → world-Z
                // inverted, so the text would appear mirrored. Negate localX for those
                // sections so the letters and their pixel shapes both read L→R.
                if (type === 'name' && section % 2 === 1) localX = -localX

                // Rotate around Y by 'angle' to face each cardinal direction
                const rotX = localX * Math.cos(angle) + localZ * Math.sin(angle)
                const rotZ = -localX * Math.sin(angle) + localZ * Math.cos(angle)

                // Translate to cardinal direction
                targets[idx] = Math.sin(angle) * dist + rotX
                targets[idx + 1] = localY // Keep height absolute
                targets[idx + 2] = Math.cos(angle) * dist + rotZ
            }
        }
    }, [starsCollected, character])

    useFrame((state, delta) => {
        if (!meshRef.current) return
        const dt = Math.min(delta, 0.1)
        const t = state.clock.elapsedTime
        const dummy = new THREE.Object3D()

        for (let i = 0; i < COUNT * 4; i++) {
            const ix = i * 3

            // Lerp
            currentPositions[ix] += (targets[ix] - currentPositions[ix]) * 2.0 * dt
            currentPositions[ix + 1] += (targets[ix + 1] - currentPositions[ix + 1]) * 2.0 * dt
            currentPositions[ix + 2] += (targets[ix + 2] - currentPositions[ix + 2]) * 2.0 * dt

            // Wiggle
            const noise = Math.sin(t * 2 + i) * 0.2

            dummy.position.set(
                currentPositions[ix],
                currentPositions[ix + 1] + noise,
                currentPositions[ix + 2]
            )

            // Face player roughly? No, just rotate slowly
            dummy.rotation.set(t * 0.5 + i, t * 0.3 + i, 0)
            const scale = 1.0 + Math.sin(t * 3 + i) * 0.3
            dummy.scale.set(scale, scale, scale)

            dummy.updateMatrix()
            meshRef.current.setMatrixAt(i, dummy.matrix)
        }
        meshRef.current.instanceMatrix.needsUpdate = true
    })

    return (
        <instancedMesh ref={meshRef} args={[geometry, material, COUNT * 4]} castShadow />
    )
}
