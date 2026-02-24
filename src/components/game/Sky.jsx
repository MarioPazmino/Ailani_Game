import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getDayNightState } from './dayNight'

function seededRand(seed) {
    const x = Math.sin(seed + 1) * 43758.5453123
    return x - Math.floor(x)
}

// Shared THREE objects for instanced stars
const _tmpColor = new THREE.Color()
const _tmpMat = new THREE.Matrix4()
const _tmpVec = new THREE.Vector3()

// -- Cloud --
function Cloud({ position, seed = 0, opacityRef }) {
    const ref = useRef()
    const matRefs = useRef([])
    const speed = useMemo(() => 0.18 + seededRand(seed) * 0.38, [seed])

    const puffs = useMemo(() => {
        const count = 5 + Math.floor(seededRand(seed * 3.1) * 4)
        return Array.from({ length: count }, (_, i) => ({
            x: (seededRand(seed + i * 1.7) - 0.5) * 5.5,
            y: seededRand(seed + i * 2.3) * 1.2,
            z: (seededRand(seed + i * 3.1) - 0.5) * 1.8,
            s: 1.1 + seededRand(seed + i * 4.3) * 1.5,
        }))
    }, [seed])

    const tint = position[1] < 31 ? 0xfff0e8 : 0xfafcff

    useFrame((_, delta) => {
        if (!ref.current) return
        ref.current.position.x += speed * delta
        if (ref.current.position.x > 58) ref.current.position.x = -58
        const op = opacityRef.current
        matRefs.current.forEach(m => {
            if (m) { m.opacity = op; m.transparent = op < 0.98 }
        })
    })

    return (
        <group ref={ref} position={position}>
            {puffs.map((p, i) => (
                <mesh key={i} position={[p.x, p.y, p.z]}>
                    <sphereGeometry args={[p.s, 7, 7]} />
                    <meshLambertMaterial
                        ref={el => { matRefs.current[i] = el }}
                        color={tint}
                        transparent
                    />
                </mesh>
            ))}
        </group>
    )
}

// -- Decorative night stars (instanced for performance) --
function NightStars({ opacityRef }) {
    const meshRef = useRef()
    const count = 260

    const starData = useMemo(() =>
        Array.from({ length: count }, (_, i) => {
            const theta = seededRand(i * 7.3) * Math.PI * 2
            const phi   = seededRand(i * 3.1 + 1) * Math.PI * 0.42 + 0.12
            const r     = 68 + seededRand(i * 5.7) * 14
            return {
                x: Math.cos(theta) * Math.sin(phi) * r,
                y: Math.cos(phi) * r,
                z: Math.sin(theta) * Math.sin(phi) * r,
                size: 0.08 + seededRand(i * 11.3) * 0.17,
                twSpeed: 2 + seededRand(i * 9.1) * 4,
                twOff: seededRand(i * 13.7) * Math.PI * 2,
            }
        })
    , [])

    useFrame(({ clock }) => {
        if (!meshRef.current) return
        const t = clock.elapsedTime
        const op = opacityRef.current
        const inst = meshRef.current
        for (let i = 0; i < count; i++) {
            const s = starData[i]
            const tw = 0.5 + 0.5 * Math.sin(t * s.twSpeed + s.twOff)
            const sc = s.size * (0.6 + tw * 0.4)
            _tmpMat.makeTranslation(s.x, s.y, s.z)
            _tmpMat.scale(_tmpVec.set(sc, sc, sc))
            inst.setMatrixAt(i, _tmpMat)
            _tmpColor.setHSL(0.14, 0.08, 0.75 + tw * 0.25)
            inst.setColorAt(i, _tmpColor)
        }
        inst.instanceMatrix.needsUpdate = true
        if (inst.instanceColor) inst.instanceColor.needsUpdate = true
        if (inst.material) {
            inst.material.opacity = op
            inst.material.transparent = true
        }
    })

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 5, 4]} />
            <meshBasicMaterial color={0xffffff} transparent />
        </instancedMesh>
    )
}

// -- Moon --
function Moon({ posRef, opacityRef }) {
    const ref = useRef()
    const matRef = useRef()
    const glowRef = useRef()

    useFrame(() => {
        if (!ref.current) return
        const p = posRef.current
        ref.current.position.set(p.x, p.y, p.z)
        const op = opacityRef.current
        if (matRef.current) {
            matRef.current.opacity = op
            matRef.current.transparent = true
        }
        if (glowRef.current) {
            glowRef.current.opacity = op * 0.18
            glowRef.current.transparent = true
        }
        ref.current.visible = op > 0.01
    })

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[3.5, 16, 16]} />
                <meshBasicMaterial ref={matRef} color={0xeeeedd} transparent />
            </mesh>
            <mesh>
                <sphereGeometry args={[5.5, 16, 16]} />
                <meshBasicMaterial ref={glowRef} color={0xccccbb} transparent opacity={0.18} />
            </mesh>
            <mesh position={[0.8, 0.6, 3.2]}>
                <sphereGeometry args={[0.55, 8, 8]} />
                <meshBasicMaterial color={0xccccaa} transparent opacity={0.4} />
            </mesh>
            <mesh position={[-0.5, -0.8, 3.1]}>
                <sphereGeometry args={[0.4, 7, 7]} />
                <meshBasicMaterial color={0xbbbb99} transparent opacity={0.4} />
            </mesh>
            <mesh position={[1.2, -0.3, 2.9]}>
                <sphereGeometry args={[0.3, 6, 6]} />
                <meshBasicMaterial color={0xccccaa} transparent opacity={0.35} />
            </mesh>
        </group>
    )
}

// -- Sun --
function Sun({ posRef, colorRef }) {
    const ref = useRef()
    const bodyMat = useRef()
    const glowMat = useRef()

    useFrame(() => {
        if (!ref.current) return
        const p = posRef.current
        ref.current.position.set(p.x, p.y, p.z)
        const c = colorRef.current
        if (bodyMat.current) bodyMat.current.color.copy(c)
        if (glowMat.current) glowMat.current.color.copy(c)
        ref.current.visible = p.y > -5
    })

    return (
        <group ref={ref}>
            <mesh>
                <sphereGeometry args={[4.5, 16, 16]} />
                <meshBasicMaterial ref={bodyMat} color={0xfff176} />
            </mesh>
            <mesh>
                <sphereGeometry args={[7, 16, 16]} />
                <meshBasicMaterial ref={glowMat} color={0xffd740} transparent opacity={0.2} />
            </mesh>
        </group>
    )
}

const CLOUD_POSITIONS = [
    [-32, 30, -22], [8, 35, -42], [38, 27, 12],
    [-18, 33, 28], [22, 31, -18], [-44, 29, 5],
    [15, 36, 22], [-8, 28, -35], [50, 32, -5],
]

export function Sky() {
    const sunPosRef   = useRef({ x: 50, y: 60, z: -25 })
    const sunColorRef = useRef(new THREE.Color(0xfff176))
    const moonPosRef  = useRef({ x: -50, y: 50, z: 25 })
    const cloudOpRef  = useRef(1)
    const starsOpRef  = useRef(0)
    const moonOpRef   = useRef(0)

    useFrame(() => {
        const s = getDayNightState()
        sunPosRef.current   = { x: s.sunX,  y: s.sunY,  z: s.sunZ }
        sunColorRef.current = s.sunColor
        moonPosRef.current  = { x: s.moonX, y: s.moonY, z: s.moonZ }
        cloudOpRef.current  = s.cloudOpacity
        starsOpRef.current  = s.starsOpacity
        moonOpRef.current   = s.moonOpacity
    })

    return (
        <group>
            <Sun posRef={sunPosRef} colorRef={sunColorRef} />
            <Moon posRef={moonPosRef} opacityRef={moonOpRef} />
            <NightStars opacityRef={starsOpRef} />
            {CLOUD_POSITIONS.map((pos, i) => (
                <Cloud key={i} position={pos} seed={i * 7.3 + 1} opacityRef={cloudOpRef} />
            ))}
        </group>
    )
}

