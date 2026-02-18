import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'

export default function Sheep({ cx, cz, radius }) {
    const ref = useRef()
    const headRef = useRef()
    const ai = useRef({
        state: 'graze', timer: 2 + Math.random() * 3,
        targetX: cx, targetZ: cz, facing: 0,
        headAngle: 0, headLook: 0,
    })

    useFrame((state, delta) => {
        if (!ref.current) return
        const dt = Math.min(delta, 0.05)
        const a = ai.current
        const t = state.clock.elapsedTime
        a.timer -= dt

        switch (a.state) {
            case 'graze':
                a.headAngle += (0.55 - a.headAngle) * 3 * dt
                a.headLook = Math.sin(t * 1.5) * 0.1
                if (a.timer <= 0) {
                    const r = Math.random()
                    if (r < 0.3) { a.state = 'look'; a.timer = 1.5 + Math.random() * 2 }
                    else if (r < 0.65) {
                        a.state = 'wander'
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 3 + Math.random() * 3
                    } else { a.state = 'huddle'; a.timer = 2 + Math.random() * 3 }
                }
                break
            case 'look':
                a.headAngle += (-0.15 - a.headAngle) * 4 * dt
                a.headLook = Math.sin(t * 2) * 0.5
                if (a.timer <= 0) {
                    if (Math.random() < 0.5) { a.state = 'graze'; a.timer = 3 + Math.random() * 4 }
                    else {
                        a.state = 'wander'
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 2 + Math.random() * 3
                    }
                }
                break
            case 'wander': {
                a.headAngle += (0.1 - a.headAngle) * 3 * dt
                a.headLook *= 0.95
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)
                if (dist > 0.4) {
                    ref.current.position.x += (dx / dist) * 0.8 * dt
                    ref.current.position.z += (dz / dist) * 0.8 * dt
                    a.facing = Math.atan2(dx, dz)
                }
                if (dist < 0.4 || a.timer <= 0) { a.state = 'graze'; a.timer = 2 + Math.random() * 4 }
                break
            }
            case 'huddle':
                a.headAngle += (0 - a.headAngle) * 2 * dt
                a.headLook = Math.sin(t * 0.8) * 0.05
                ref.current.rotation.z = Math.sin(t * 1.2) * 0.015
                if (a.timer <= 0) { ref.current.rotation.z = 0; a.state = 'graze'; a.timer = 3 + Math.random() * 3 }
                break
        }
        ref.current.rotation.y += (a.facing - ref.current.rotation.y) * 3 * dt
        if (headRef.current) {
            headRef.current.rotation.x = a.headAngle
            headRef.current.rotation.y = a.headLook
            headRef.current.position.y = 1.15 - a.headAngle * 0.4
            headRef.current.position.x = 0.85 + a.headAngle * 0.15
        }
    })

    return (
        <group ref={ref} position={[cx, 0, cz]}>
            {/* Body + wool bumps */}
            <mesh position={[0, 1.0, 0]} castShadow>
                <sphereGeometry args={[0.85, 10, 10]} />
                <meshLambertMaterial color={0xf5f5f5} />
            </mesh>
            {[[0.3, 1.4, 0.3, 0.35], [-.3, 1.4, -.2, 0.3], [.1, 1.45, -.3, 0.28], [-.2, 1.35, .35, 0.32]].map(([x, y, z, s], i) => (
                <mesh key={i} position={[x, y, z]}>
                    <sphereGeometry args={[s, 8, 8]} />
                    <meshLambertMaterial color={i % 2 === 0 ? 0xfafafa : 0xeeeeee} />
                </mesh>
            ))}

            {/* Head (animated) */}
            <group ref={headRef} position={[0.85, 1.15, 0]}>
                <mesh castShadow><boxGeometry args={[0.55, 0.6, 0.5]} /><meshLambertMaterial color={0x424242} /></mesh>
                {/* Nose */}
                <mesh position={[0.3, -0.1, 0]}><boxGeometry args={[0.15, 0.2, 0.3]} /><meshLambertMaterial color={0x616161} /></mesh>
                <mesh position={[0.38, -0.07, 0.06]}><sphereGeometry args={[0.025, 6, 6]} /><meshLambertMaterial color={0x212121} /></mesh>
                <mesh position={[0.38, -0.07, -0.06]}><sphereGeometry args={[0.025, 6, 6]} /><meshLambertMaterial color={0x212121} /></mesh>
                {/* Eyes */}
                <mesh position={[0.17, 0.15, 0.22]}><sphereGeometry args={[0.08, 8, 8]} /><meshPhongMaterial color={0xffffff} /></mesh>
                <mesh position={[0.21, 0.15, 0.25]}><sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={0x1a1a2e} /></mesh>
                <mesh position={[0.17, 0.15, -0.22]}><sphereGeometry args={[0.08, 8, 8]} /><meshPhongMaterial color={0xffffff} /></mesh>
                <mesh position={[0.21, 0.15, -0.25]}><sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={0x1a1a2e} /></mesh>
                {/* Ears */}
                <mesh position={[-0.15, 0.2, 0.35]} rotation={[0.4, 0, -0.6]}><boxGeometry args={[0.2, 0.3, 0.08]} /><meshLambertMaterial color={0x424242} /></mesh>
                <mesh position={[-0.15, 0.2, -0.35]} rotation={[-0.4, 0, -0.6]}><boxGeometry args={[0.2, 0.3, 0.08]} /><meshLambertMaterial color={0x424242} /></mesh>
                {/* Wool tuft */}
                <mesh position={[-0.1, 0.4, 0]}><sphereGeometry args={[0.2, 8, 8]} /><meshLambertMaterial color={0xf5f5f5} /></mesh>
            </group>

            {/* Legs + hooves */}
            {[[-0.35, .25, -.35], [-0.35, .25, .35], [.35, .25, -.35], [.35, .25, .35]].map(([x, y, z], i) => (
                <mesh key={i} position={[x, y, z]} castShadow><cylinderGeometry args={[0.07, 0.09, 0.5, 8]} /><meshLambertMaterial color={0x424242} /></mesh>
            ))}
            {[[-0.35, .02, -.35], [-0.35, .02, .35], [.35, .02, -.35], [.35, .02, .35]].map(([x, y, z], i) => (
                <mesh key={`h${i}`} position={[x, y, z]}><cylinderGeometry args={[0.09, 0.1, 0.05, 8]} /><meshLambertMaterial color={0x3e2723} /></mesh>
            ))}
            {/* Tail */}
            <mesh position={[-0.85, 1.1, 0]}><sphereGeometry args={[0.12, 6, 6]} /><meshLambertMaterial color={0xf5f5f5} /></mesh>

            <Html position={[0, 2.6, 0]} center distanceFactor={15}
                style={{ userSelect: 'none', pointerEvents: 'none', fontSize: '2rem' }} zIndexRange={[0, 0]}>🐑</Html>
        </group>
    )
}
