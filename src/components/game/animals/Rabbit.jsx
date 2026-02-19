import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'

/*
  CAMILO el Conejo
  Estados:
  - idle:  sentado, orejas moviéndose suavemente, nariz twitching
  - sniff: baja la cabeza a olfatear el suelo
  - hop:   saltos rápidos en línea recta
  - dash:  carrera veloz por la granja
  - sit:   se sienta y mira alrededor
*/

export default function Rabbit({ cx, cz, radius }) {
    const ref = useRef()
    const headRef = useRef()
    const earLRef = useRef()
    const earRRef = useRef()
    const tailRef = useRef()
    const nameRef = useRef()

    const ai = useRef({
        state: 'idle',
        timer: 1 + Math.random() * 2,
        targetX: cx,
        targetZ: cz,
        facing: Math.random() * Math.PI * 2,
        hopPhase: 0,
        speed: 0,
        soundCooldown: 2,
    })

    useFrame((state, delta) => {
        if (!ref.current) return
        const dt = Math.min(delta, 0.05)
        const a = ai.current
        const t = state.clock.elapsedTime

        a.timer -= dt

        // Ear wiggle always
        if (earLRef.current) earLRef.current.rotation.z = 0.15 + Math.sin(t * 3.5) * 0.08
        if (earRRef.current) earRRef.current.rotation.z = -0.15 - Math.sin(t * 3.5 + 1) * 0.08

        // Tail wiggle always
        if (tailRef.current) tailRef.current.rotation.z = Math.sin(t * 6) * 0.25

        // Name always faces up
        if (nameRef.current) nameRef.current.rotation.y = -ref.current.rotation.y

        switch (a.state) {
            case 'idle': {
                // Nariz twitching → head small nodding
                if (headRef.current) headRef.current.rotation.x = Math.sin(t * 8) * 0.04
                ref.current.position.y = 0
                if (a.timer <= 0) {
                    const roll = Math.random()
                    if (roll < 0.3) {
                        a.state = 'sniff'
                        a.timer = 1 + Math.random() * 1.5
                    } else if (roll < 0.55) {
                        a.state = 'sit'
                        a.timer = 2 + Math.random() * 3
                    } else if (roll < 0.8) {
                        a.state = 'hop'
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 2 + Math.random() * 2
                        a.hopPhase = 0
                        a.speed = 2.5 + Math.random() * 1.5
                    } else {
                        a.state = 'dash'
                        a.targetX = cx + (Math.random() - 0.5) * radius * 2
                        a.targetZ = cz + (Math.random() - 0.5) * radius * 2
                        a.timer = 1.5 + Math.random() * 2
                        a.speed = 5 + Math.random() * 3
                    }
                }
                break
            }

            case 'sniff': {
                if (headRef.current) headRef.current.rotation.x = 0.35 + Math.sin(t * 10) * 0.06
                ref.current.position.y = 0
                if (a.timer <= 0) {
                    if (headRef.current) headRef.current.rotation.x = 0
                    a.state = 'idle'
                    a.timer = 0.5 + Math.random() * 1
                }
                break
            }

            case 'sit': {
                if (headRef.current) headRef.current.rotation.x = Math.sin(t * 1.2) * 0.12
                ref.current.position.y = 0
                if (a.timer <= 0) {
                    a.state = 'idle'
                    a.timer = 0.5 + Math.random() * 1
                }
                break
            }

            case 'hop': {
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)

                if (dist > 0.5 && a.timer > 0) {
                    a.facing = Math.atan2(dx, dz)
                    a.hopPhase += dt * 9
                    // Bunny hop: body up on each stride
                    const hopY = Math.max(0, Math.sin(a.hopPhase) * 0.35)
                    ref.current.position.x += (dx / dist) * a.speed * dt
                    ref.current.position.z += (dz / dist) * a.speed * dt
                    ref.current.position.y = hopY
                    // Body tilt forward on hop
                    ref.current.rotation.x = -hopY * 0.4
                } else {
                    ref.current.position.y = 0
                    ref.current.rotation.x = 0
                    a.state = 'idle'
                    a.timer = 1 + Math.random() * 2
                }
                break
            }

            case 'dash': {
                const dx = a.targetX - ref.current.position.x
                const dz = a.targetZ - ref.current.position.z
                const dist = Math.sqrt(dx * dx + dz * dz)

                if (dist > 0.5 && a.timer > 0) {
                    a.facing = Math.atan2(dx, dz)
                    a.hopPhase += dt * 16
                    // Fast running hops
                    const hopY = Math.max(0, Math.sin(a.hopPhase) * 0.25)
                    ref.current.position.x += (dx / dist) * a.speed * dt
                    ref.current.position.z += (dz / dist) * a.speed * dt
                    ref.current.position.y = hopY
                    ref.current.rotation.x = -0.25
                    // Ears lay back when dashing
                    if (earLRef.current) earLRef.current.rotation.x = -0.5
                    if (earRRef.current) earRRef.current.rotation.x = -0.5
                } else {
                    ref.current.position.y = 0
                    ref.current.rotation.x = 0
                    if (earLRef.current) earLRef.current.rotation.x = 0
                    if (earRRef.current) earRRef.current.rotation.x = 0
                    a.state = 'idle'
                    a.timer = 0.8 + Math.random() * 1.5
                }
                break
            }
        }

        // Apply facing
        ref.current.rotation.y = a.facing
    })

    return (
        <group ref={ref} position={[cx, 0, cz]}>

            {/* Nombre Camilo */}
            <group ref={nameRef}>
                <Text
                    position={[0, 2.6, 0]}
                    fontSize={0.55}
                    color="#ff69b4"
                    anchorX="center"
                    anchorY="middle"
                    outlineWidth={0.06}
                    outlineColor="#fff"
                >
                    Camilo 🐰
                </Text>
            </group>

            {/* CUERPO */}
            <mesh position={[0, 0.55, 0]}>
                <sphereGeometry args={[0.45, 12, 10]} />
                <meshPhongMaterial color={0xf8f0e8} />
            </mesh>

            {/* PANZA más clara */}
            <mesh position={[0, 0.5, 0.22]}>
                <sphereGeometry args={[0.28, 10, 8]} />
                <meshPhongMaterial color={0xfff8f0} />
            </mesh>

            {/* CABEZA */}
            <group ref={headRef} position={[0, 1.05, 0.15]}>
                <mesh>
                    <sphereGeometry args={[0.32, 12, 10]} />
                    <meshPhongMaterial color={0xf8f0e8} />
                </mesh>

                {/* Hocico */}
                <mesh position={[0, -0.06, 0.26]}>
                    <sphereGeometry args={[0.13, 8, 6]} />
                    <meshPhongMaterial color={0xffdde8} />
                </mesh>

                {/* Nariz */}
                <mesh position={[0, -0.04, 0.38]}>
                    <sphereGeometry args={[0.045, 6, 6]} />
                    <meshPhongMaterial color={0xff8fb0} />
                </mesh>

                {/* Ojo izquierdo */}
                <mesh position={[-0.13, 0.05, 0.27]}>
                    <sphereGeometry args={[0.045, 6, 6]} />
                    <meshPhongMaterial color={0x222222} />
                </mesh>
                {/* Brillo ojo izq */}
                <mesh position={[-0.115, 0.065, 0.31]}>
                    <sphereGeometry args={[0.015, 4, 4]} />
                    <meshPhongMaterial color={0xffffff} emissive={0xffffff} />
                </mesh>

                {/* Ojo derecho */}
                <mesh position={[0.13, 0.05, 0.27]}>
                    <sphereGeometry args={[0.045, 6, 6]} />
                    <meshPhongMaterial color={0x222222} />
                </mesh>
                {/* Brillo ojo der */}
                <mesh position={[0.115, 0.065, 0.31]}>
                    <sphereGeometry args={[0.015, 4, 4]} />
                    <meshPhongMaterial color={0xffffff} emissive={0xffffff} />
                </mesh>

                {/* OREJA izquierda */}
                <group ref={earLRef} position={[-0.14, 0.3, -0.02]} rotation={[0, 0, 0.15]}>
                    {/* Parte exterior */}
                    <mesh position={[0, 0.28, 0]}>
                        <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
                        <meshPhongMaterial color={0xf8f0e8} />
                    </mesh>
                    {/* Interior rosa */}
                    <mesh position={[0, 0.28, 0.04]}>
                        <capsuleGeometry args={[0.04, 0.35, 4, 8]} />
                        <meshPhongMaterial color={0xffadc5} />
                    </mesh>
                </group>

                {/* OREJA derecha */}
                <group ref={earRRef} position={[0.14, 0.3, -0.02]} rotation={[0, 0, -0.15]}>
                    <mesh position={[0, 0.28, 0]}>
                        <capsuleGeometry args={[0.07, 0.45, 4, 8]} />
                        <meshPhongMaterial color={0xf8f0e8} />
                    </mesh>
                    <mesh position={[0, 0.28, 0.04]}>
                        <capsuleGeometry args={[0.04, 0.35, 4, 8]} />
                        <meshPhongMaterial color={0xffadc5} />
                    </mesh>
                </group>
            </group>

            {/* PATAS delanteras */}
            <mesh position={[-0.2, 0.18, 0.28]}>
                <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
                <meshPhongMaterial color={0xf8f0e8} />
            </mesh>
            <mesh position={[0.2, 0.18, 0.28]}>
                <capsuleGeometry args={[0.07, 0.22, 4, 8]} />
                <meshPhongMaterial color={0xf8f0e8} />
            </mesh>

            {/* PATAS traseras (más grandes) */}
            <mesh position={[-0.22, 0.18, -0.22]} rotation={[0.3, 0, 0]}>
                <capsuleGeometry args={[0.09, 0.3, 4, 8]} />
                <meshPhongMaterial color={0xf8f0e8} />
            </mesh>
            <mesh position={[0.22, 0.18, -0.22]} rotation={[0.3, 0, 0]}>
                <capsuleGeometry args={[0.09, 0.3, 4, 8]} />
                <meshPhongMaterial color={0xf8f0e8} />
            </mesh>

            {/* COLA pompón */}
            <group ref={tailRef} position={[0, 0.6, -0.42]}>
                <mesh>
                    <sphereGeometry args={[0.14, 8, 8]} />
                    <meshPhongMaterial color={0xffffff} />
                </mesh>
            </group>

        </group>
    )
}
