import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { getDayNightState } from './dayNight'

// Lantern post positions — along paths and near buildings
const LANTERN_POSITIONS = [
    // Along main vertical path
    [ 3.2, 0, -18],
    [-3.2, 0, -10],
    [ 3.2, 0,  -2],
    [-3.2, 0,   6],
    [ 3.2, 0,  14],
    [-3.2, 0,  22],
    // Along horizontal crosspath
    [-12, 0, 3],
    [-18, 0, 7],
    [ 12, 0, 3],
    [ 18, 0, 7],
    // Near farmhouse (around -15, -15)
    [-10, 0, -13],
    // Near barn (around 18, -12)
    [ 24, 0, -10],
    // Far corners for ambiance
    [-30, 0, -30],
    [ 30, 0,  30],
]

function LanternPost({ position }) {
    const lightRef = useRef()
    const glowRef = useRef()
    const flameMat = useRef()
    const glassMats = useRef([])

    useFrame(({ clock }) => {
        const s = getDayNightState()
        // Lantern brightness: full when night/dusk, off during day
        const brightness = Math.max(0, 1 - s.angle * 5)  // on below angle≈0.2
        const t = clock.elapsedTime

        if (lightRef.current) {
            lightRef.current.intensity = brightness * 1.8
            lightRef.current.distance = 12 + Math.sin(t * 3.2 + position[0]) * 0.5
        }
        if (glowRef.current) {
            const flicker = 0.92 + Math.sin(t * 7.1 + position[2]) * 0.05
                + Math.sin(t * 11.3 + position[0]) * 0.03
            glowRef.current.scale.setScalar(flicker)
        }
        if (flameMat.current) {
            flameMat.current.opacity = brightness * 0.95
            flameMat.current.emissiveIntensity = brightness * 1.2
        }
        glassMats.current.forEach(m => {
            if (m) {
                m.opacity = 0.15 + brightness * 0.35
                m.emissiveIntensity = brightness * 0.6
            }
        })
    })

    return (
        <group position={position}>
            {/* Post — dark wood/iron */}
            <mesh position={[0, 1.2, 0]} castShadow>
                <cylinderGeometry args={[0.06, 0.09, 2.4, 6]} />
                <meshStandardMaterial color={0x2a1a0a} roughness={0.85} metalness={0.15} />
            </mesh>

            {/* Base plate */}
            <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.18, 0.22, 0.04, 8]} />
                <meshStandardMaterial color={0x1a1a1a} roughness={0.7} metalness={0.3} />
            </mesh>

            {/* Cross arm */}
            <mesh position={[0.18, 2.35, 0]} rotation={[0, 0, -0.3]}>
                <cylinderGeometry args={[0.03, 0.04, 0.45, 5]} />
                <meshStandardMaterial color={0x2a1a0a} roughness={0.85} metalness={0.15} />
            </mesh>

            {/* Lantern housing — top cap */}
            <mesh position={[0.28, 2.55, 0]}>
                <coneGeometry args={[0.14, 0.1, 6]} />
                <meshStandardMaterial color={0x1a1a1a} roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Lantern glass panels (4 sides) */}
            {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((rot, i) => (
                <mesh key={i} position={[
                    0.28 + Math.cos(rot) * 0.08,
                    2.4,
                    Math.sin(rot) * 0.08
                ]}>
                    <boxGeometry args={[0.1, 0.2, 0.005]} />
                    <meshStandardMaterial
                        ref={el => { glassMats.current[i] = el }}
                        color={0xffdd88}
                        transparent
                        opacity={0.2}
                        emissive={0xffaa44}
                        emissiveIntensity={0}
                        roughness={0.1}
                        metalness={0}
                    />
                </mesh>
            ))}

            {/* Bottom rim */}
            <mesh position={[0.28, 2.28, 0]}>
                <cylinderGeometry args={[0.1, 0.11, 0.04, 6]} />
                <meshStandardMaterial color={0x1a1a1a} roughness={0.6} metalness={0.4} />
            </mesh>

            {/* Flame / glow core (always present, brightness controlled) */}
            <group ref={glowRef} position={[0.28, 2.4, 0]}>
                {/* Inner flame */}
                <mesh>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshStandardMaterial
                        ref={flameMat}
                        color={0xffcc44}
                        emissive={0xffaa22}
                        emissiveIntensity={0}
                        transparent
                        opacity={0}
                        roughness={0.1}
                    />
                </mesh>
                {/* Outer warm glow */}
                <mesh>
                    <sphereGeometry args={[0.12, 8, 6]} />
                    <meshBasicMaterial color={0xffdd66} transparent opacity={0} />
                </mesh>
            </group>

            {/* Point light — warm glow */}
            <pointLight
                ref={lightRef}
                position={[0.28, 2.4, 0]}
                color={0xffcc77}
                intensity={0}
                distance={12}
                decay={2}
                castShadow={false}
            />
        </group>
    )
}

export function Lanterns() {
    return (
        <group>
            {LANTERN_POSITIONS.map((pos, i) => (
                <LanternPost key={i} position={pos} />
            ))}
        </group>
    )
}
