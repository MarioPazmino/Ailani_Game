import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { gameState } from '../gameState'
import { playCowSound } from '../animalSounds'

/*
  COW BEHAVIORS:
  - WANDER: walks slowly to a random nearby point
  - GRAZE:  head dips down, chewing animation
  - IDLE:   stands still, tail swishes, occasional head turn
*/

export default function Cow({ cx, cz, radius }) {
    const ref = useRef()
    const headRef = useRef()
    const tailRef = useRef()

    const ai = useRef({
        state: 'wander',
        timer: 0,
        targetX: cx + (Math.random() - 0.5) * radius * 2,
        targetZ: cz + (Math.random() - 0.5) * radius * 2,
        facing: 0,
        headDip: 0,
        chewPhase: 0,
        soundCooldown: 2,
    })

    useFrame((state, delta) => {
        if (!ref.current) return
        const dt = Math.min(delta, 0.05)
        const a = ai.current
        const t = state.clock.elapsedTime

        a.timer -= dt

        if (a.state === 'wander') {
            // Move towards target
            const dx = a.targetX - ref.current.position.x
            const dz = a.targetZ - ref.current.position.z
            const dist = Math.sqrt(dx * dx + dz * dz)

            if (dist < 0.5 || a.timer <= 0) {
                // Pick new behavior
                const roll = Math.random()
                if (roll < 0.5) {
                    a.state = 'graze'
                    a.timer = 3 + Math.random() * 4
                } else if (roll < 0.8) {
                    a.state = 'idle'
                    a.timer = 2 + Math.random() * 3
                } else {
                    a.targetX = cx + (Math.random() - 0.5) * radius * 2
                    a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                    a.timer = 4 + Math.random() * 3
                }
            } else {
                const speed = 1.2
                const moveX = (dx / dist) * speed * dt
                const moveZ = (dz / dist) * speed * dt
                ref.current.position.x += moveX
                ref.current.position.z += moveZ
                a.facing = Math.atan2(dx, dz)
            }
            // Head level when walking
            a.headDip += (0 - a.headDip) * 3 * dt
        }

        if (a.state === 'graze') {
            // Head dips down to eat grass
            a.headDip += (0.5 - a.headDip) * 3 * dt
            a.chewPhase += dt * 5
            if (a.timer <= 0) {
                a.state = 'wander'
                a.targetX = cx + (Math.random() - 0.5) * radius * 2
                a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                a.timer = 3 + Math.random() * 3
            }
        }

        if (a.state === 'idle') {
            a.headDip += (0 - a.headDip) * 3 * dt
            if (a.timer <= 0) {
                a.state = 'wander'
                a.targetX = cx + (Math.random() - 0.5) * radius * 2
                a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                a.timer = 3 + Math.random() * 4
            }
        }

        // Smooth rotation
        ref.current.rotation.y += (a.facing - ref.current.rotation.y) * 4 * dt

        // Animate head
        if (headRef.current) {
            headRef.current.rotation.x = a.headDip + Math.sin(a.chewPhase) * 0.05
            headRef.current.position.y = 1.5 - a.headDip * 0.4
            headRef.current.position.x = 1.4 + a.headDip * 0.2
        }

        // Tail swish
        if (tailRef.current) {
            tailRef.current.rotation.z = 0.6 + Math.sin(t * 3) * 0.3
        }

        // Proximity sound
        a.soundCooldown -= dt
        if (a.soundCooldown <= 0) {
            const pp = gameState.playerPosition
            const sdx = ref.current.position.x - pp.x
            const sdz = ref.current.position.z - pp.z
            if (Math.sqrt(sdx * sdx + sdz * sdz) < 5) {
                playCowSound()
                a.soundCooldown = 6 + Math.random() * 3
            } else {
                a.soundCooldown = 1
            }
        }
    })

    return (
        <group ref={ref} position={[cx, 0, cz]}>
            {/* === BODY === */}
            <mesh position={[0, 1.2, 0]} castShadow>
                <boxGeometry args={[2.2, 1.3, 1.2]} />
                <meshLambertMaterial color={0xf5f5f5} />
            </mesh>

            {/* Black spots on body */}
            <mesh position={[0.4, 1.5, 0.61]} rotation={[0, 0, 0.2]}>
                <circleGeometry args={[0.35, 8]} />
                <meshLambertMaterial color={0x222222} />
            </mesh>
            <mesh position={[-0.3, 1.1, 0.61]}>
                <circleGeometry args={[0.25, 8]} />
                <meshLambertMaterial color={0x222222} />
            </mesh>
            <mesh position={[0.5, 1.2, -0.61]} rotation={[0, Math.PI, 0.15]}>
                <circleGeometry args={[0.3, 8]} />
                <meshLambertMaterial color={0x222222} />
            </mesh>

            {/* === HEAD GROUP (animated) === */}
            <group ref={headRef} position={[1.4, 1.5, 0]}>
                {/* Head */}
                <mesh castShadow>
                    <boxGeometry args={[0.9, 0.85, 0.85]} />
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
                {/* Muzzle */}
                <mesh position={[0.5, -0.15, 0]}>
                    <boxGeometry args={[0.35, 0.45, 0.55]} />
                    <meshLambertMaterial color={0xf8bbd0} />
                </mesh>
                {/* Nostrils */}
                <mesh position={[0.69, -0.1, -0.1]}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshLambertMaterial color={0x4a2020} />
                </mesh>
                <mesh position={[0.69, -0.1, 0.1]}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshLambertMaterial color={0x4a2020} />
                </mesh>
                {/* Eyes */}
                <mesh position={[0.35, 0.15, 0.35]}>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshPhongMaterial color={0xffffff} />
                </mesh>
                <mesh position={[0.4, 0.15, 0.38]}>
                    <sphereGeometry args={[0.06, 6, 6]} />
                    <meshPhongMaterial color={0x1a1a2e} />
                </mesh>
                <mesh position={[0.35, 0.15, -0.35]}>
                    <sphereGeometry args={[0.12, 8, 8]} />
                    <meshPhongMaterial color={0xffffff} />
                </mesh>
                <mesh position={[0.4, 0.15, -0.38]}>
                    <sphereGeometry args={[0.06, 6, 6]} />
                    <meshPhongMaterial color={0x1a1a2e} />
                </mesh>
                {/* Ears */}
                <mesh position={[-0.2, 0.5, 0.45]} rotation={[0.3, 0, 0.5]}>
                    <boxGeometry args={[0.25, 0.15, 0.2]} />
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
                <mesh position={[-0.2, 0.5, -0.45]} rotation={[-0.3, 0, 0.5]}>
                    <boxGeometry args={[0.25, 0.15, 0.2]} />
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
                {/* Horns */}
                <mesh position={[-0.1, 0.65, 0.25]} rotation={[0.2, 0, 0.3]}>
                    <coneGeometry args={[0.06, 0.35, 6]} />
                    <meshLambertMaterial color={0xe8dcc8} />
                </mesh>
                <mesh position={[-0.1, 0.65, -0.25]} rotation={[-0.2, 0, 0.3]}>
                    <coneGeometry args={[0.06, 0.35, 6]} />
                    <meshLambertMaterial color={0xe8dcc8} />
                </mesh>
            </group>

            {/* === LEGS === */}
            {[[-0.7, 0.3, -0.4], [-0.7, 0.3, 0.4], [0.7, 0.3, -0.4], [0.7, 0.3, 0.4]].map(([lx, ly, lz], i) => (
                <mesh key={i} position={[lx, ly, lz]} castShadow>
                    <cylinderGeometry args={[0.1, 0.12, 0.6, 8]} />
                    <meshLambertMaterial color={0xf5f5f5} />
                </mesh>
            ))}
            {[[-0.7, 0.02, -0.4], [-0.7, 0.02, 0.4], [0.7, 0.02, -0.4], [0.7, 0.02, 0.4]].map(([lx, ly, lz], i) => (
                <mesh key={`h${i}`} position={[lx, ly, lz]}>
                    <cylinderGeometry args={[0.12, 0.13, 0.06, 8]} />
                    <meshLambertMaterial color={0x3e2723} />
                </mesh>
            ))}

            {/* Udder */}
            <mesh position={[0.3, 0.55, 0]}>
                <sphereGeometry args={[0.2, 8, 8]} />
                <meshLambertMaterial color={0xf8bbd0} />
            </mesh>

            {/* Tail (animated) */}
            <group ref={tailRef} position={[-1.2, 1.5, 0]} rotation={[0, 0, 0.6]}>
                <mesh>
                    <cylinderGeometry args={[0.03, 0.02, 0.7, 6]} />
                    <meshLambertMaterial color={0xf5f5f5} />
                </mesh>
                <mesh position={[0, -0.4, 0]}>
                    <sphereGeometry args={[0.08, 6, 6]} />
                    <meshLambertMaterial color={0x222222} />
                </mesh>
            </group>

        </group>
    )
}
