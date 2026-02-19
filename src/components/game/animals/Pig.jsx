import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { gameState } from '../gameState'
import { playPigSound } from '../animalSounds'

/*
  PIG BEHAVIORS:
  - ROOT:    snout down rooting/sniffing the ground
  - WALLOW:  lay down and wiggle (rolling in mud)
  - WANDER:  trot slowly to random point
  - IDLE:    stand still, occasional snort (body shakes)
*/

export default function Pig({ cx, cz, radius }) {
    const ref = useRef()
    const headRef = useRef()
    const tailRef = useRef()
    const bodyRef = useRef()

    const ai = useRef({
        state: 'wander',
        timer: 2,
        targetX: cx + (Math.random() - 0.5) * radius * 2,
        targetZ: cz + (Math.random() - 0.5) * radius * 2,
        facing: 0,
        snoutDip: 0,
        wallowPhase: 0,
        snortShake: 0,
        soundCooldown: 2,
    })

    useFrame((state, delta) => {
        if (!ref.current) return
        const dt = Math.min(delta, 0.05)
        const a = ai.current
        const t = state.clock.elapsedTime

        a.timer -= dt
        a.snortShake *= 0.9

        switch (a.state) {
            case 'wander': {
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)
                if (dist > 0.4) {
                    ref.current.position.x += (dx / dist) * 1.0 * dt
                    ref.current.position.z += (dz / dist) * 1.0 * dt
                    a.facing = Math.atan2(dx, dz)
                }
                a.snoutDip += (0 - a.snoutDip) * 3 * dt
                if (dist < 0.4 || a.timer <= 0) {
                    const roll = Math.random()
                    if (roll < 0.35) { a.state = 'root'; a.timer = 2 + Math.random() * 3 }
                    else if (roll < 0.55) { a.state = 'wallow'; a.timer = 3 + Math.random() * 3; a.wallowPhase = 0 }
                    else if (roll < 0.75) { a.state = 'idle'; a.timer = 1.5 + Math.random() * 2 }
                    else {
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 3 + Math.random() * 3
                    }
                }
                break
            }

            case 'root': {
                // Snout down, push forward slowly
                a.snoutDip += (0.6 - a.snoutDip) * 3 * dt
                // Nudge forward slowly while rooting
                const fx = Math.sin(a.facing)
                const fz = Math.cos(a.facing)
                ref.current.position.x += fx * 0.2 * dt
                ref.current.position.z += fz * 0.2 * dt
                // Keep in range
                const ddx = ref.current.position.x - cx
                const ddz = ref.current.position.z - cz
                if (Math.sqrt(ddx * ddx + ddz * ddz) > radius) {
                    a.facing += Math.PI * 0.5
                }
                if (a.timer <= 0) {
                    a.state = 'idle'
                    a.timer = 1 + Math.random() * 1.5
                    a.snortShake = 1
                }
                break
            }

            case 'wallow': {
                // Lay down and wiggle
                a.wallowPhase += dt * 4
                a.snoutDip += (0 - a.snoutDip) * 3 * dt
                if (bodyRef.current) {
                    bodyRef.current.rotation.z = Math.sin(a.wallowPhase) * 0.2
                    bodyRef.current.position.y = 0.65 // lower body
                }
                if (a.timer <= 0) {
                    if (bodyRef.current) {
                        bodyRef.current.rotation.z = 0
                        bodyRef.current.position.y = 0.85
                    }
                    a.state = 'wander'
                    a.targetX = cx + (Math.random() - 0.5) * radius * 2
                    a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                    a.timer = 2 + Math.random() * 3
                }
                break
            }

            case 'idle': {
                a.snoutDip += (0 - a.snoutDip) * 3 * dt
                // Occasional snort (full body quick shake)
                if (Math.random() < 0.005) a.snortShake = 0.5
                if (a.timer <= 0) {
                    a.state = 'wander'
                    a.targetX = cx + (Math.random() - 0.5) * radius * 2
                    a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                    a.timer = 3 + Math.random() * 3
                }
                break
            }
        }

        // Smooth rotation
        ref.current.rotation.y += (a.facing - ref.current.rotation.y) * 4 * dt
        // Snort shake
        if (a.snortShake > 0.01) {
            ref.current.rotation.z = Math.sin(t * 30) * a.snortShake * 0.05
        } else {
            ref.current.rotation.z *= 0.9
        }

        // Head animation
        if (headRef.current) {
            headRef.current.rotation.x = a.snoutDip
            headRef.current.position.y = 1.05 - a.snoutDip * 0.35
            headRef.current.position.x = 0.75 + a.snoutDip * 0.15
        }

        // Tail wiggle
        if (tailRef.current) {
            tailRef.current.rotation.y = Math.sin(t * 5) * 0.4
        }

        // Proximity sound
        a.soundCooldown -= dt
        if (a.soundCooldown <= 0) {
            const pp = gameState.playerPosition
            const sdx = ref.current.position.x - pp.x
            const sdz = ref.current.position.z - pp.z
            if (Math.sqrt(sdx * sdx + sdz * sdz) < 5) {
                playPigSound()
                a.soundCooldown = 5 + Math.random() * 3
            } else {
                a.soundCooldown = 1
            }
        }
    })

    return (
        <group ref={ref} position={[cx, 0, cz]}>
            {/* === BODY === */}
            <group ref={bodyRef} position={[0, 0.85, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[0.75, 12, 10]} />
                    <meshLambertMaterial color={0xf8bbd0} />
                </mesh>
                <mesh position={[0, -0.2, 0.15]}>
                    <sphereGeometry args={[0.55, 10, 10]} />
                    <meshLambertMaterial color={0xfce4ec} />
                </mesh>
            </group>

            {/* === HEAD (animated) === */}
            <group ref={headRef} position={[0.75, 1.05, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[0.45, 10, 10]} />
                    <meshLambertMaterial color={0xf8bbd0} />
                </mesh>
                {/* Snout */}
                <mesh position={[0.4, -0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.15, 10]} />
                    <meshLambertMaterial color={0xf48fb1} />
                </mesh>
                {/* Nostrils */}
                <mesh position={[0.48, -0.07, 0.08]}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshLambertMaterial color={0xad1457} />
                </mesh>
                <mesh position={[0.48, -0.07, -0.08]}>
                    <sphereGeometry args={[0.04, 6, 6]} />
                    <meshLambertMaterial color={0xad1457} />
                </mesh>
                {/* Eyes */}
                <mesh position={[0.25, 0.15, 0.3]}>
                    <sphereGeometry args={[0.09, 8, 8]} />
                    <meshPhongMaterial color={0xffffff} />
                </mesh>
                <mesh position={[0.3, 0.15, 0.33]}>
                    <sphereGeometry args={[0.045, 6, 6]} />
                    <meshPhongMaterial color={0x1a1a2e} />
                </mesh>
                <mesh position={[0.25, 0.15, -0.3]}>
                    <sphereGeometry args={[0.09, 8, 8]} />
                    <meshPhongMaterial color={0xffffff} />
                </mesh>
                <mesh position={[0.3, 0.15, -0.33]}>
                    <sphereGeometry args={[0.045, 6, 6]} />
                    <meshPhongMaterial color={0x1a1a2e} />
                </mesh>
                {/* Floppy ears */}
                <mesh position={[-0.15, 0.45, 0.3]} rotation={[0.6, 0.3, 0.5]}>
                    <boxGeometry args={[0.22, 0.25, 0.06]} />
                    <meshLambertMaterial color={0xf48fb1} />
                </mesh>
                <mesh position={[-0.15, 0.45, -0.3]} rotation={[-0.6, -0.3, 0.5]}>
                    <boxGeometry args={[0.22, 0.25, 0.06]} />
                    <meshLambertMaterial color={0xf48fb1} />
                </mesh>
                {/* Mouth */}
                <mesh position={[0.37, -0.23, 0]}>
                    <boxGeometry args={[0.08, 0.03, 0.15]} />
                    <meshLambertMaterial color={0xc2185b} />
                </mesh>
            </group>

            {/* === LEGS === */}
            {[[-0.35, 0.2, -0.35], [-0.35, 0.2, 0.35], [0.35, 0.2, -0.35], [0.35, 0.2, 0.35]].map(([lx, ly, lz], i) => (
                <mesh key={i} position={[lx, ly, lz]} castShadow>
                    <cylinderGeometry args={[0.1, 0.12, 0.4, 8]} />
                    <meshLambertMaterial color={0xf8bbd0} />
                </mesh>
            ))}
            {[[-0.35, 0.02, -0.35], [-0.35, 0.02, 0.35], [0.35, 0.02, -0.35], [0.35, 0.02, 0.35]].map(([lx, ly, lz], i) => (
                <mesh key={`h${i}`} position={[lx, ly, lz]}>
                    <cylinderGeometry args={[0.12, 0.13, 0.05, 8]} />
                    <meshLambertMaterial color={0x5d4037} />
                </mesh>
            ))}

            {/* Curly tail (animated) */}
            <group ref={tailRef} position={[-0.8, 1.1, 0]} rotation={[0, 0, 1.2]}>
                <mesh>
                    <torusGeometry args={[0.12, 0.025, 6, 12, Math.PI * 1.5]} />
                    <meshLambertMaterial color={0xf48fb1} />
                </mesh>
            </group>

        </group>
    )
}
