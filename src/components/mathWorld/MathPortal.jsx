import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { gameState } from '../game/gameState'
import { useGameStore } from '../../store'

const PORTAL_POS = { x: -5, z: 25 }  // near the path, open area
const TRIGGER_RADIUS = 3.0

export function MathPortal() {
    const ringRef = useRef()
    const innerRef = useRef()
    const glowRef = useRef()
    const particlesRef = useRef()
    const textRef = useRef()
    const baseRef = useRef()
    const triggered = useRef(false)
    const enterMathWorld = useGameStore.getState().enterMathWorld

    /* particle positions (floating around the ring) */
    const particleData = useMemo(() => {
        const count = 40
        const positions = new Float32Array(count * 3)
        const offsets = []
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2
            const r = 1.8 + Math.sin(i * 3.7) * 0.4
            positions[i * 3] = Math.cos(angle) * r
            positions[i * 3 + 1] = 2.5 + Math.sin(angle * 3) * 0.5
            positions[i * 3 + 2] = Math.sin(angle) * r * 0.3
            offsets.push({ angle, r, speed: 0.5 + Math.random() * 1.5, yOff: Math.random() * Math.PI * 2 })
        }
        return { positions, offsets, count }
    }, [])

    useFrame((_, dt) => {
        const t = performance.now() * 0.001

        /* ring rotation */
        if (ringRef.current) {
            ringRef.current.rotation.y += dt * 0.5
        }

        /* inner portal shimmer */
        if (innerRef.current) {
            innerRef.current.material.opacity = 0.3 + Math.sin(t * 2) * 0.15
            innerRef.current.rotation.z += dt * 0.3
        }

        /* glow pulse */
        if (glowRef.current) {
            const scale = 1 + Math.sin(t * 1.5) * 0.1
            glowRef.current.scale.set(scale, scale, scale)
        }

        /* particles orbiting */
        if (particlesRef.current) {
            const pos = particlesRef.current.geometry.attributes.position
            for (let i = 0; i < particleData.count; i++) {
                const d = particleData.offsets[i]
                const a = d.angle + t * d.speed
                pos.array[i * 3] = Math.cos(a) * d.r
                pos.array[i * 3 + 1] = 2.5 + Math.sin(t * 2 + d.yOff) * 0.6
                pos.array[i * 3 + 2] = Math.sin(a) * d.r * 0.3
            }
            pos.needsUpdate = true
        }

        /* text bob */
        if (textRef.current) {
            textRef.current.position.y = 5.2 + Math.sin(t * 1.8) * 0.15
        }

        /* proximity check */
        const px = gameState.playerPosition.x
        const pz = gameState.playerPosition.z
        const dx = px - PORTAL_POS.x
        const dz = pz - PORTAL_POS.z
        const dist = Math.sqrt(dx * dx + dz * dz)

        if (dist < TRIGGER_RADIUS && !triggered.current) {
            triggered.current = true
            // brief delay for visual feedback
            setTimeout(() => {
                enterMathWorld()
                triggered.current = false
            }, 400)
        }
        if (dist > TRIGGER_RADIUS + 1) {
            triggered.current = false
        }
    })

    return (
        <group position={[PORTAL_POS.x, 0, PORTAL_POS.z]}>
            {/* stone base platform */}
            <mesh position={[0, 0.1, 0]} receiveShadow>
                <cylinderGeometry args={[2.2, 2.5, 0.2, 8]} />
                <meshStandardMaterial color={0x78909c} roughness={0.8} metalness={0.1} />
            </mesh>
            <mesh position={[0, 0.22, 0]} receiveShadow>
                <cylinderGeometry args={[1.8, 2.0, 0.12, 8]} />
                <meshStandardMaterial color={0x90a4ae} roughness={0.7} metalness={0.1} />
            </mesh>

            {/* rune marks on platform */}
            {[0, 1, 2, 3, 4, 5].map(i => (
                <mesh key={i} position={[Math.cos(i * Math.PI / 3) * 1.6, 0.25, Math.sin(i * Math.PI / 3) * 1.6]}
                    rotation={[-Math.PI / 2, 0, i * Math.PI / 3]}>
                    <planeGeometry args={[0.3, 0.3]} />
                    <meshStandardMaterial color={0xce93d8} emissive={0xce93d8} emissiveIntensity={0.8}
                        transparent opacity={0.7} side={THREE.DoubleSide} />
                </mesh>
            ))}

            {/* left pillar */}
            <mesh position={[-1.5, 2, 0]} castShadow>
                <boxGeometry args={[0.35, 4, 0.35]} />
                <meshStandardMaterial color={0x5c6bc0} roughness={0.4} metalness={0.3} />
            </mesh>
            {/* right pillar */}
            <mesh position={[1.5, 2, 0]} castShadow>
                <boxGeometry args={[0.35, 4, 0.35]} />
                <meshStandardMaterial color={0x5c6bc0} roughness={0.4} metalness={0.3} />
            </mesh>
            {/* top arch */}
            <mesh position={[0, 4.1, 0]} castShadow>
                <boxGeometry args={[3.35, 0.4, 0.35]} />
                <meshStandardMaterial color={0x5c6bc0} roughness={0.4} metalness={0.3} />
            </mesh>

            {/* crystal orbs on pillars */}
            <mesh position={[-1.5, 4.5, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color={0xce93d8} emissive={0xce93d8} emissiveIntensity={1.2}
                    transparent opacity={0.9} roughness={0.1} metalness={0.5} />
            </mesh>
            <mesh position={[1.5, 4.5, 0]}>
                <sphereGeometry args={[0.25, 16, 16]} />
                <meshStandardMaterial color={0xce93d8} emissive={0xce93d8} emissiveIntensity={1.2}
                    transparent opacity={0.9} roughness={0.1} metalness={0.5} />
            </mesh>

            {/* inner portal ring (torus) */}
            <group ref={ringRef} position={[0, 2.5, 0]}>
                <mesh>
                    <torusGeometry args={[1.4, 0.08, 12, 48]} />
                    <meshStandardMaterial color={0xb388ff} emissive={0x7c4dff}
                        emissiveIntensity={0.8} roughness={0.2} metalness={0.6} />
                </mesh>
            </group>

            {/* inner filled portal (shimmering disc) */}
            <mesh ref={innerRef} position={[0, 2.5, 0]}>
                <circleGeometry args={[1.3, 32]} />
                <meshStandardMaterial
                    color={0x7c4dff} emissive={0xb388ff} emissiveIntensity={0.6}
                    transparent opacity={0.35} side={THREE.DoubleSide}
                    roughness={0} metalness={1} />
            </mesh>

            {/* glow sphere (soft) */}
            <mesh ref={glowRef} position={[0, 2.5, 0]}>
                <sphereGeometry args={[2.0, 16, 16]} />
                <meshBasicMaterial color={0xb388ff} transparent opacity={0.06}
                    side={THREE.BackSide} depthWrite={false} />
            </mesh>

            {/* orbiting particles */}
            <points ref={particlesRef} position={[0, 0, 0]}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={particleData.count}
                        array={particleData.positions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial color={0xea80fc} size={0.12} transparent opacity={0.8}
                    sizeAttenuation depthWrite={false} />
            </points>

            {/* light */}
            <pointLight position={[0, 2.5, 0]} color={0xb388ff} intensity={2} distance={10} decay={2} />
            <pointLight position={[0, 2.5, 1]} color={0xce93d8} intensity={1} distance={6} decay={2} />

            {/* floating sign text (simple 3D boxes as "🧮") */}
            <group ref={textRef} position={[0, 5.2, 0]}>
                {/* Sign board */}
                <mesh>
                    <boxGeometry args={[2.8, 0.6, 0.1]} />
                    <meshStandardMaterial color={0x4a148c} roughness={0.3} metalness={0.2} />
                </mesh>
                {/* "MATH" letters as tiny colored blocks */}
                {['M', 'A', 'T', 'H'].map((_, i) => (
                    <mesh key={i} position={[-0.9 + i * 0.6, 0, 0.06]}>
                        <boxGeometry args={[0.4, 0.35, 0.05]} />
                        <meshStandardMaterial
                            color={[0xffd93d, 0xff6b6b, 0x6bcb77, 0x4d96ff][i]}
                            emissive={[0xffd93d, 0xff6b6b, 0x6bcb77, 0x4d96ff][i]}
                            emissiveIntensity={0.5} />
                    </mesh>
                ))}
            </group>
        </group>
    )
}
