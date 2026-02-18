import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

/*
  CHICKEN BEHAVIORS:
  - PECK:    head bobs down rapidly to peck at ground
  - SCRATCH: pauses, body tilts, scratching the dirt
  - DASH:    quick burst of speed in a random direction
  - IDLE:    looks around with head tilts
*/

export default function Chicken({ cx, cz, radius }) {
    const ref = useRef()
    const headRef = useRef()
    const lwingRef = useRef()
    const rwingRef = useRef()

    const ai = useRef({
        state: 'idle',
        timer: 1,
        targetX: cx,
        targetZ: cz,
        facing: Math.random() * Math.PI * 2,
        peckPhase: 0,
        wingFlap: 0,
        dashSpeed: 0,
        headTilt: 0,
    })

    useFrame((state, delta) => {
        if (!ref.current) return
        const dt = Math.min(delta, 0.05)
        const a = ai.current
        const t = state.clock.elapsedTime

        a.timer -= dt
        a.wingFlap *= 0.95 // decay wing flap

        switch (a.state) {
            case 'idle': {
                // Look around — head tilts side to side
                a.headTilt = Math.sin(t * 2.5) * 0.3
                if (a.timer <= 0) {
                    const roll = Math.random()
                    if (roll < 0.35) {
                        a.state = 'peck'
                        a.timer = 1.5 + Math.random() * 2
                        a.peckPhase = 0
                    } else if (roll < 0.6) {
                        a.state = 'scratch'
                        a.timer = 1 + Math.random() * 1.5
                    } else if (roll < 0.8) {
                        a.state = 'dash'
                        a.timer = 0.5 + Math.random() * 0.8
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.wingFlap = 1
                        a.dashSpeed = 3 + Math.random() * 2
                    } else {
                        // Wander slowly
                        a.state = 'wander'
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 2 + Math.random() * 2
                    }
                }
                break
            }

            case 'peck': {
                a.peckPhase += dt * 12
                a.headTilt = 0
                if (a.timer <= 0) {
                    a.state = 'idle'
                    a.timer = 0.5 + Math.random() * 1
                }
                break
            }

            case 'scratch': {
                // Body tilts and bobs
                ref.current.rotation.z = Math.sin(t * 8) * 0.1
                ref.current.position.y = Math.abs(Math.sin(t * 10)) * 0.03
                if (a.timer <= 0) {
                    ref.current.rotation.z = 0
                    a.state = 'idle'
                    a.timer = 0.5 + Math.random() * 1.5
                }
                break
            }

            case 'dash': {
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)
                if (dist > 0.3 && a.timer > 0) {
                    ref.current.position.x += (dx / dist) * a.dashSpeed * dt
                    ref.current.position.z += (dz / dist) * a.dashSpeed * dt
                    a.facing = Math.atan2(dx, dz)
                    // Bobbing while running
                    ref.current.position.y = Math.abs(Math.sin(t * 14)) * 0.1
                }
                if (a.timer <= 0) {
                    ref.current.position.y = 0
                    a.wingFlap = 0
                    a.state = 'idle'
                    a.timer = 1 + Math.random()
                }
                break
            }

            case 'wander': {
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)
                if (dist > 0.3) {
                    ref.current.position.x += (dx / dist) * 1.5 * dt
                    ref.current.position.z += (dz / dist) * 1.5 * dt
                    a.facing = Math.atan2(dx, dz)
                    ref.current.position.y = Math.abs(Math.sin(t * 10)) * 0.05
                }
                if (dist < 0.3 || a.timer <= 0) {
                    a.state = 'idle'
                    a.timer = 0.5 + Math.random() * 1.5
                    ref.current.position.y = 0
                }
                break
            }
        }

        // Smooth facing
        ref.current.rotation.y += (a.facing - ref.current.rotation.y) * 6 * dt

        // Animate head
        if (headRef.current) {
            if (a.state === 'peck') {
                // Rapid pecking motion
                headRef.current.position.y = 0.95 + Math.sin(a.peckPhase) * 0.15 * (Math.sin(a.peckPhase) > 0 ? -1 : 0)
                headRef.current.position.x = 0.45 + (a.state === 'peck' ? Math.max(0, Math.sin(a.peckPhase)) * 0.1 : 0)
                headRef.current.rotation.x = Math.max(0, Math.sin(a.peckPhase)) * 0.6
            } else {
                headRef.current.position.y = 0.95
                headRef.current.position.x = 0.45
                headRef.current.rotation.x = 0
                headRef.current.rotation.z = a.headTilt
            }
        }

        // Wings flap
        if (lwingRef.current) {
            const flapAngle = a.wingFlap * Math.sin(t * 20) * 0.6
            lwingRef.current.rotation.z = 0.1 + flapAngle
            rwingRef.current.rotation.z = 0.1 - flapAngle
        }
    })

    return (
        <group ref={ref} position={[cx, 0, cz]}>
            {/* === BODY === */}
            <mesh position={[0, 0.55, 0]} castShadow>
                <sphereGeometry args={[0.45, 10, 10]} />
                <meshLambertMaterial color={0xfdd835} />
            </mesh>
            <mesh position={[0.2, 0.45, 0]}>
                <sphereGeometry args={[0.3, 8, 8]} />
                <meshLambertMaterial color={0xfff176} />
            </mesh>

            {/* === HEAD (animated) === */}
            <group ref={headRef} position={[0.45, 0.95, 0]}>
                <mesh castShadow>
                    <sphereGeometry args={[0.22, 10, 10]} />
                    <meshLambertMaterial color={0xfdd835} />
                </mesh>
                {/* Comb */}
                <mesh position={[0, 0.25, 0]}>
                    <boxGeometry args={[0.18, 0.15, 0.06]} />
                    <meshLambertMaterial color={0xe53935} />
                </mesh>
                <mesh position={[-0.03, 0.19, 0]}>
                    <boxGeometry args={[0.12, 0.12, 0.06]} />
                    <meshLambertMaterial color={0xe53935} />
                </mesh>
                {/* Beak */}
                <mesh position={[0.23, -0.05, 0]} rotation={[0, 0, -0.2]}>
                    <coneGeometry args={[0.06, 0.2, 4]} />
                    <meshLambertMaterial color={0xff8f00} />
                </mesh>
                {/* Eyes */}
                <mesh position={[0.15, 0.05, 0.15]}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshPhongMaterial color={0xffffff} />
                </mesh>
                <mesh position={[0.18, 0.05, 0.17]}>
                    <sphereGeometry args={[0.025, 6, 6]} />
                    <meshPhongMaterial color={0x1a1a2e} />
                </mesh>
                <mesh position={[0.15, 0.05, -0.15]}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshPhongMaterial color={0xffffff} />
                </mesh>
                <mesh position={[0.18, 0.05, -0.17]}>
                    <sphereGeometry args={[0.025, 6, 6]} />
                    <meshPhongMaterial color={0x1a1a2e} />
                </mesh>
                {/* Wattle */}
                <mesh position={[0.15, -0.17, 0]}>
                    <sphereGeometry args={[0.05, 6, 6]} />
                    <meshLambertMaterial color={0xe53935} />
                </mesh>
            </group>

            {/* Wings (animated) */}
            <group ref={lwingRef} position={[-0.05, 0.6, 0.38]} rotation={[0.3, 0, 0.1]}>
                <mesh>
                    <boxGeometry args={[0.3, 0.35, 0.08]} />
                    <meshLambertMaterial color={0xf9a825} />
                </mesh>
            </group>
            <group ref={rwingRef} position={[-0.05, 0.6, -0.38]} rotation={[-0.3, 0, 0.1]}>
                <mesh>
                    <boxGeometry args={[0.3, 0.35, 0.08]} />
                    <meshLambertMaterial color={0xf9a825} />
                </mesh>
            </group>

            {/* Tail feathers */}
            <mesh position={[-0.45, 0.75, 0]} rotation={[0, 0, 0.8]}>
                <boxGeometry args={[0.08, 0.35, 0.2]} />
                <meshLambertMaterial color={0xf9a825} />
            </mesh>
            <mesh position={[-0.5, 0.9, 0]} rotation={[0, 0, 1.0]}>
                <boxGeometry args={[0.06, 0.25, 0.15]} />
                <meshLambertMaterial color={0xe65100} />
            </mesh>

            {/* Legs */}
            <mesh position={[0.1, 0.15, 0.12]}>
                <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
                <meshLambertMaterial color={0xff8f00} />
            </mesh>
            <mesh position={[0.1, 0.15, -0.12]}>
                <cylinderGeometry args={[0.03, 0.03, 0.3, 6]} />
                <meshLambertMaterial color={0xff8f00} />
            </mesh>
            <mesh position={[0.12, 0.02, 0.12]} rotation={[0, 0.3, 0]}>
                <boxGeometry args={[0.12, 0.03, 0.08]} />
                <meshLambertMaterial color={0xff8f00} />
            </mesh>
            <mesh position={[0.12, 0.02, -0.12]} rotation={[0, -0.3, 0]}>
                <boxGeometry args={[0.12, 0.03, 0.08]} />
                <meshLambertMaterial color={0xff8f00} />
            </mesh>

            {/* Label */}
            <Html position={[0, 2.0, 0]} center distanceFactor={15}
                style={{ userSelect: 'none', pointerEvents: 'none', fontSize: '2rem' }}
                zIndexRange={[0, 0]}>
                🐔
            </Html>
        </group>
    )
}
