import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

export default function Horse({ cx, cz, radius }) {
    const ref = useRef()
    const headRef = useRef()
    const tailRef = useRef()
    const legRefs = [useRef(), useRef(), useRef(), useRef()]

    const ai = useRef({
        state: 'idle', timer: 1 + Math.random() * 2,
        targetX: cx, targetZ: cz, facing: 0,
        headDip: 0, speed: 0, legPhase: 0,
    })

    useFrame((state, delta) => {
        if (!ref.current) return
        const dt = Math.min(delta, 0.05)
        const a = ai.current
        const t = state.clock.elapsedTime
        a.timer -= dt

        switch (a.state) {
            case 'idle':
                a.speed += (0 - a.speed) * 3 * dt
                a.headDip += (0 - a.headDip) * 3 * dt
                if (a.timer <= 0) {
                    const r = Math.random()
                    if (r < 0.3) { a.state = 'graze'; a.timer = 3 + Math.random() * 4 }
                    else if (r < 0.7) {
                        a.state = 'trot'
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 3 + Math.random() * 3
                    } else {
                        a.state = 'gallop'
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 1.5 + Math.random() * 2
                    }
                }
                break
            case 'graze':
                a.speed += (0 - a.speed) * 3 * dt
                a.headDip += (0.6 - a.headDip) * 3 * dt
                if (a.timer <= 0) { a.state = 'idle'; a.timer = 1 + Math.random() * 2 }
                break
            case 'trot': {
                a.headDip += (0.05 - a.headDip) * 3 * dt
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)
                a.speed += (2.0 - a.speed) * 2 * dt
                if (dist > 0.5) {
                    ref.current.position.x += (dx / dist) * a.speed * dt
                    ref.current.position.z += (dz / dist) * a.speed * dt
                    a.facing = Math.atan2(dx, dz)
                    // Trot bob
                    ref.current.position.y = Math.abs(Math.sin(t * 6)) * 0.06
                }
                if (dist < 0.5 || a.timer <= 0) {
                    ref.current.position.y = 0; a.state = 'idle'; a.timer = 1.5 + Math.random() * 2
                }
                break
            }
            case 'gallop': {
                a.headDip += (-0.1 - a.headDip) * 3 * dt
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)
                a.speed += (4.5 - a.speed) * 2 * dt
                if (dist > 0.5) {
                    ref.current.position.x += (dx / dist) * a.speed * dt
                    ref.current.position.z += (dz / dist) * a.speed * dt
                    a.facing = Math.atan2(dx, dz)
                    ref.current.position.y = Math.abs(Math.sin(t * 10)) * 0.12
                }
                if (dist < 0.5 || a.timer <= 0) {
                    ref.current.position.y = 0; a.state = 'idle'; a.timer = 2 + Math.random() * 3
                }
                break
            }
        }

        // Smooth rotation
        ref.current.rotation.y += (a.facing - ref.current.rotation.y) * 4 * dt

        // Head animation
        if (headRef.current) {
            headRef.current.rotation.x = a.headDip * 0.5
            headRef.current.position.y = 2.3 - a.headDip * 0.5
            headRef.current.position.x = 1.6 + a.headDip * 0.2
            // Head bob during movement
            if (a.speed > 0.5) headRef.current.position.y += Math.sin(t * a.speed * 4) * 0.04
        }

        // Leg animation
        a.legPhase += a.speed * dt * 6
        legRefs.forEach((lr, i) => {
            if (lr.current) {
                const offset = i < 2 ? 0 : Math.PI
                const side = i % 2 === 0 ? 1 : -1
                lr.current.rotation.x = Math.sin(a.legPhase + offset) * Math.min(a.speed * 0.15, 0.5) * side
            }
        })

        // Tail
        if (tailRef.current) {
            tailRef.current.rotation.x = Math.sin(t * 2) * 0.2
            tailRef.current.rotation.z = Math.sin(t * 3) * 0.15
        }
    })

    const legPositions = [[-0.8, 0.4, -0.4], [-0.8, 0.4, 0.4], [0.8, 0.4, -0.4], [0.8, 0.4, 0.4]]

    return (
        <group ref={ref} position={[cx, 0, cz]}>
            {/* Body */}
            <mesh position={[0, 1.4, 0]} castShadow><boxGeometry args={[2.4, 1.3, 1.1]} /><meshLambertMaterial color={0x8d6e63} /></mesh>
            <mesh position={[0, 1.1, 0]}><boxGeometry args={[1.8, 0.4, 0.9]} /><meshLambertMaterial color={0xa1887f} /></mesh>
            {/* Neck */}
            <mesh position={[1.1, 2.0, 0]} rotation={[0, 0, 0.5]} castShadow><boxGeometry args={[0.5, 1.0, 0.6]} /><meshLambertMaterial color={0x8d6e63} /></mesh>

            {/* Head (animated) */}
            <group ref={headRef} position={[1.6, 2.3, 0]}>
                <mesh rotation={[0, 0, 0.15]} castShadow><boxGeometry args={[1.0, 0.5, 0.45]} /><meshLambertMaterial color={0x795548} /></mesh>
                <mesh position={[0.45, -0.15, 0]}><boxGeometry args={[0.35, 0.3, 0.4]} /><meshLambertMaterial color={0xa1887f} /></mesh>
                {/* Nostrils */}
                <mesh position={[0.63, -0.1, 0.1]}><sphereGeometry args={[0.04, 6, 6]} /><meshLambertMaterial color={0x3e2723} /></mesh>
                <mesh position={[0.63, -0.1, -0.1]}><sphereGeometry args={[0.04, 6, 6]} /><meshLambertMaterial color={0x3e2723} /></mesh>
                {/* Mouth */}
                <mesh position={[0.55, -0.25, 0]}><boxGeometry args={[0.2, 0.02, 0.2]} /><meshLambertMaterial color={0x4e342e} /></mesh>
                {/* Eyes */}
                <mesh position={[0.2, 0.15, 0.24]}><sphereGeometry args={[0.08, 8, 8]} /><meshPhongMaterial color={0xffffff} /></mesh>
                <mesh position={[0.25, 0.15, 0.27]}><sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={0x1a1a2e} /></mesh>
                <mesh position={[0.2, 0.15, -0.24]}><sphereGeometry args={[0.08, 8, 8]} /><meshPhongMaterial color={0xffffff} /></mesh>
                <mesh position={[0.25, 0.15, -0.27]}><sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={0x1a1a2e} /></mesh>
                {/* Ears */}
                <mesh position={[-0.2, 0.4, 0.15]} rotation={[0.2, 0, 0.4]}><coneGeometry args={[0.08, 0.25, 4]} /><meshLambertMaterial color={0x795548} /></mesh>
                <mesh position={[-0.2, 0.4, -0.15]} rotation={[-0.2, 0, 0.4]}><coneGeometry args={[0.08, 0.25, 4]} /><meshLambertMaterial color={0x795548} /></mesh>
                <mesh position={[-0.18, 0.38, 0.16]} rotation={[0.2, 0, 0.4]}><coneGeometry args={[0.04, 0.15, 4]} /><meshLambertMaterial color={0xf8bbd0} /></mesh>
                <mesh position={[-0.18, 0.38, -0.16]} rotation={[-0.2, 0, 0.4]}><coneGeometry args={[0.04, 0.15, 4]} /><meshLambertMaterial color={0xf8bbd0} /></mesh>
                {/* Mane on head */}
                {[0, 0.15, 0.3, 0.45].map((o, i) => (
                    <mesh key={i} position={[-0.3 + o * 0.4, 0.35 - o * 0.2, 0]}><boxGeometry args={[0.08, 0.18, 0.12]} /><meshLambertMaterial color={0x3e2723} /></mesh>
                ))}
            </group>

            {/* Mane along neck */}
            {[0, 0.2, 0.4].map((o, i) => (
                <mesh key={`nm${i}`} position={[0.85 + o * 0.6, 2.2 + o * 0.15, 0]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.06, 0.2, 0.12]} /><meshLambertMaterial color={0x3e2723} /></mesh>
            ))}

            {/* Legs (animated) */}
            {legPositions.map(([lx, ly, lz], i) => (
                <group key={i} ref={legRefs[i]} position={[lx, ly, lz]}>
                    <mesh castShadow><cylinderGeometry args={[0.1, 0.12, 0.8, 8]} /><meshLambertMaterial color={0x8d6e63} /></mesh>
                    <mesh position={[0, -0.38, 0]}><cylinderGeometry args={[0.12, 0.13, 0.06, 8]} /><meshLambertMaterial color={0x3e2723} /></mesh>
                </group>
            ))}

            {/* Tail (animated) */}
            <group ref={tailRef} position={[-1.3, 1.8, 0]}>
                <mesh rotation={[0, 0, 0.3]}><cylinderGeometry args={[0.04, 0.03, 0.5, 6]} /><meshLambertMaterial color={0x3e2723} /></mesh>
                <mesh position={[0, -0.35, 0]} rotation={[0, 0, -0.2]}><cylinderGeometry args={[0.03, 0.05, 0.5, 6]} /><meshLambertMaterial color={0x3e2723} /></mesh>
                <mesh position={[0, -0.6, 0]}><cylinderGeometry args={[0.05, 0.02, 0.3, 6]} /><meshLambertMaterial color={0x3e2723} /></mesh>
            </group>

            <Html position={[0, 3.5, 0]} center distanceFactor={15}
                style={{ userSelect: 'none', pointerEvents: 'none', fontSize: '2rem' }} zIndexRange={[0, 0]}>🐴</Html>
        </group>
    )
}
