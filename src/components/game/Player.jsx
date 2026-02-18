import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboard } from './Controls'
import { gameState } from './gameState'
import { useGameStore, CHARACTERS } from '../../store'
import { resolveCollisions } from './collisions'

const SPEED = 12
const GRAVITY = -25
const JUMP_FORCE = 10

/* Hair sub-components per style */
function PonytailsHair({ hair, accColor }) {
    return (
        <group>
            {/* Base hair cap */}
            <mesh position={[0, 2.88, -0.05]} scale={[1, 0.85, 1]}>
                <sphereGeometry args={[0.43, 12, 12]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Bangs */}
            <mesh position={[0, 2.95, 0.25]} scale={[0.8, 0.3, 0.4]}>
                <sphereGeometry args={[0.35, 10, 8]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Left ponytail */}
            <group position={[-0.35, 2.75, -0.15]}>
                <mesh><sphereGeometry args={[0.12, 8, 8]} /><meshPhongMaterial color={hair} /></mesh>
                <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.1, 0.08, 0.5, 8]} /><meshPhongMaterial color={hair} /></mesh>
                <mesh position={[0, -0.55, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshPhongMaterial color={hair} /></mesh>
                {/* Hair tie */}
                <mesh position={[0, -0.05, 0]}><torusGeometry args={[0.1, 0.025, 6, 12]} /><meshPhongMaterial color={accColor} /></mesh>
            </group>
            {/* Right ponytail */}
            <group position={[0.35, 2.75, -0.15]}>
                <mesh><sphereGeometry args={[0.12, 8, 8]} /><meshPhongMaterial color={hair} /></mesh>
                <mesh position={[0, -0.3, 0]}><cylinderGeometry args={[0.1, 0.08, 0.5, 8]} /><meshPhongMaterial color={hair} /></mesh>
                <mesh position={[0, -0.55, 0]}><sphereGeometry args={[0.1, 8, 8]} /><meshPhongMaterial color={hair} /></mesh>
                <mesh position={[0, -0.05, 0]}><torusGeometry args={[0.1, 0.025, 6, 12]} /><meshPhongMaterial color={accColor} /></mesh>
            </group>
        </group>
    )
}

function BraidsHair({ hair, accColor }) {
    return (
        <group>
            {/* Base hair cap */}
            <mesh position={[0, 2.88, -0.05]} scale={[1, 0.85, 1]}>
                <sphereGeometry args={[0.43, 12, 12]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Headband */}
            <mesh position={[0, 3.0, 0.1]} rotation={[0.2, 0, 0]}>
                <torusGeometry args={[0.38, 0.035, 8, 16, Math.PI]} />
                <meshPhongMaterial color={accColor} />
            </mesh>
            {/* Left braid — segmented */}
            {[0, 1, 2, 3, 4].map(i => (
                <mesh key={`lb${i}`} position={[-0.3, 2.55 - i * 0.18, -0.15 - i * 0.02]}
                    rotation={[0.1 * i, 0, 0.1]}>
                    <sphereGeometry args={[0.08 - i * 0.005, 6, 6]} />
                    <meshPhongMaterial color={hair} />
                </mesh>
            ))}
            {/* Right braid */}
            {[0, 1, 2, 3, 4].map(i => (
                <mesh key={`rb${i}`} position={[0.3, 2.55 - i * 0.18, -0.15 - i * 0.02]}
                    rotation={[0.1 * i, 0, -0.1]}>
                    <sphereGeometry args={[0.08 - i * 0.005, 6, 6]} />
                    <meshPhongMaterial color={hair} />
                </mesh>
            ))}
            {/* Braid ties */}
            <mesh position={[-0.3, 1.85, -0.25]}><sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={accColor} /></mesh>
            <mesh position={[0.3, 1.85, -0.25]}><sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={accColor} /></mesh>
        </group>
    )
}

function LongHair({ hair, accColor }) {
    return (
        <group>
            {/* Base hair top */}
            <mesh position={[0, 2.9, -0.05]} scale={[1.05, 0.9, 1.1]}>
                <sphereGeometry args={[0.44, 12, 12]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Flowing back hair */}
            <mesh position={[0, 2.3, -0.2]} scale={[0.9, 1.2, 0.5]}>
                <cylinderGeometry args={[0.35, 0.25, 1.2, 10]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Side drape left */}
            <mesh position={[-0.3, 2.4, 0]} scale={[0.3, 0.8, 0.3]}>
                <cylinderGeometry args={[0.2, 0.15, 1, 8]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Side drape right */}
            <mesh position={[0.3, 2.4, 0]} scale={[0.3, 0.8, 0.3]}>
                <cylinderGeometry args={[0.2, 0.15, 1, 8]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Bangs */}
            <mesh position={[0, 2.95, 0.28]} scale={[0.85, 0.25, 0.3]}>
                <sphereGeometry args={[0.35, 10, 8]} />
                <meshPhongMaterial color={hair} />
            </mesh>
            {/* Earrings */}
            <mesh position={[-0.38, 2.55, 0.05]}>
                <sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={accColor} emissive={accColor} emissiveIntensity={0.3} />
            </mesh>
            <mesh position={[0.38, 2.55, 0.05]}>
                <sphereGeometry args={[0.04, 6, 6]} /><meshPhongMaterial color={accColor} emissive={accColor} emissiveIntensity={0.3} />
            </mesh>
        </group>
    )
}

function HairComponent({ ch }) {
    switch (ch.hairStyle) {
        case 'ponytails': return <PonytailsHair hair={ch.hair} accColor={ch.accColor} />
        case 'braids': return <BraidsHair hair={ch.hair} accColor={ch.accColor} />
        case 'long': return <LongHair hair={ch.hair} accColor={ch.accColor} />
        default: return null
    }
}

export function Player() {
    const groupRef = useRef()
    const leftArmRef = useRef()
    const rightArmRef = useRef()
    const leftLegRef = useRef()
    const rightLegRef = useRef()
    const skirtRef = useRef()
    const keys = useKeyboard()
    const character = useGameStore((s) => s.character)
    const ch = CHARACTERS[character]

    useFrame((state, delta) => {
        if (!groupRef.current) return
        const dt = Math.min(delta, 0.05)
        const t = state.clock.elapsedTime

        // === Movement ===
        const forward = new THREE.Vector3(-Math.sin(gameState.cameraTheta), 0, -Math.cos(gameState.cameraTheta))
        const right = new THREE.Vector3(forward.z, 0, -forward.x)
        const moveDir = new THREE.Vector3()
        let isMoving = false

        if (keys.current.KeyW || keys.current.ArrowUp) { moveDir.add(forward); isMoving = true }
        if (keys.current.KeyS || keys.current.ArrowDown) { moveDir.sub(forward); isMoving = true }
        if (keys.current.KeyA || keys.current.ArrowLeft) { moveDir.sub(right); isMoving = true }
        if (keys.current.KeyD || keys.current.ArrowRight) { moveDir.add(right); isMoving = true }

        if (isMoving) {
            moveDir.normalize()
            groupRef.current.position.x += moveDir.x * SPEED * dt
            groupRef.current.position.z += moveDir.z * SPEED * dt
            groupRef.current.rotation.y = Math.atan2(moveDir.x, moveDir.z)
        }

        // === Jump ===
        if (keys.current.Space && gameState.onGround) { gameState.velocityY = JUMP_FORCE; gameState.onGround = false }
        gameState.velocityY += GRAVITY * dt
        groupRef.current.position.y += gameState.velocityY * dt
        if (groupRef.current.position.y <= 0) { groupRef.current.position.y = 0; gameState.velocityY = 0; gameState.onGround = true }

        // === Clamp to map ===
        groupRef.current.position.x = Math.max(-46, Math.min(46, groupRef.current.position.x))
        groupRef.current.position.z = Math.max(-46, Math.min(46, groupRef.current.position.z))

        // === Collision detection ===
        const resolved = resolveCollisions(groupRef.current.position.x, groupRef.current.position.z)
        groupRef.current.position.x = resolved.x
        groupRef.current.position.z = resolved.z

        gameState.playerPosition.copy(groupRef.current.position)
        gameState.isMoving = isMoving

        // === Animations ===
        if (isMoving) {
            gameState.walkTime += dt * 10
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x = Math.sin(gameState.walkTime) * 0.6
                rightLegRef.current.rotation.x = -Math.sin(gameState.walkTime) * 0.6
                leftArmRef.current.rotation.x = -Math.sin(gameState.walkTime) * 0.5
                rightArmRef.current.rotation.x = Math.sin(gameState.walkTime) * 0.5
            }
            // Skirt sway
            if (skirtRef.current) skirtRef.current.rotation.z = Math.sin(gameState.walkTime) * 0.06
        } else {
            gameState.walkTime += dt * 2
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x *= 0.9
                rightLegRef.current.rotation.x *= 0.9
                leftArmRef.current.rotation.x = Math.sin(gameState.walkTime) * 0.08
                rightArmRef.current.rotation.x = -Math.sin(gameState.walkTime) * 0.08
            }
            // Idle sway
            if (skirtRef.current) skirtRef.current.rotation.z = Math.sin(t * 1.5) * 0.02
        }
    })

    return (
        <group ref={groupRef}>
            <group position={[0, -0.64, 0]}>
                {/* ======= HEAD ======= */}
                <mesh position={[0, 2.75, 0]} castShadow>
                    <sphereGeometry args={[0.4, 14, 14]} />
                    <meshPhongMaterial color={ch.skin} />
                </mesh>

                {/* Eyes — white + iris + pupil + highlight */}
                {[-0.13, 0.13].map((x, i) => (
                    <group key={i} position={[x, 2.76, 0.32]}>
                        {/* White */}
                        <mesh><sphereGeometry args={[0.085, 8, 8]} /><meshPhongMaterial color={0xffffff} /></mesh>
                        {/* Iris */}
                        <mesh position={[0, 0, 0.04]}><sphereGeometry args={[0.055, 8, 8]} /><meshPhongMaterial color={0x4a2810} /></mesh>
                        {/* Pupil */}
                        <mesh position={[0, 0, 0.06]}><sphereGeometry args={[0.03, 6, 6]} /><meshPhongMaterial color={0x0a0a0a} /></mesh>
                        {/* Eye highlight */}
                        <mesh position={[0.02, 0.025, 0.08]}><sphereGeometry args={[0.015, 6, 6]} /><meshPhongMaterial color={0xffffff} emissive={0xffffff} emissiveIntensity={0.5} /></mesh>
                        {/* Eyelash */}
                        <mesh position={[0, 0.07, 0.03]} rotation={[0.3, 0, 0]}>
                            <boxGeometry args={[0.12, 0.02, 0.02]} /><meshPhongMaterial color={0x1a1005} />
                        </mesh>
                    </group>
                ))}

                {/* Eyebrows */}
                <mesh position={[-0.13, 2.88, 0.36]} rotation={[0, 0, 0.1]}>
                    <boxGeometry args={[0.12, 0.025, 0.02]} /><meshPhongMaterial color={ch.hair} />
                </mesh>
                <mesh position={[0.13, 2.88, 0.36]} rotation={[0, 0, -0.1]}>
                    <boxGeometry args={[0.12, 0.025, 0.02]} /><meshPhongMaterial color={ch.hair} />
                </mesh>

                {/* Nose */}
                <mesh position={[0, 2.7, 0.4]}>
                    <sphereGeometry args={[0.035, 6, 6]} /><meshPhongMaterial color={ch.skin} />
                </mesh>

                {/* Smile 😊 */}
                <mesh position={[0, 2.62, 0.38]} rotation={[Math.PI, 0, 0]}>
                    <torusGeometry args={[0.07, 0.015, 6, 10, Math.PI]} />
                    <meshPhongMaterial color={0xc0392b} />
                </mesh>

                {/* Blush circles */}
                <mesh position={[-0.22, 2.65, 0.32]} rotation={[0, 0.3, 0]}>
                    <circleGeometry args={[0.06, 8]} /><meshPhongMaterial color={ch.blush} transparent opacity={0.4} />
                </mesh>
                <mesh position={[0.22, 2.65, 0.32]} rotation={[0, -0.3, 0]}>
                    <circleGeometry args={[0.06, 8]} /><meshPhongMaterial color={ch.blush} transparent opacity={0.4} />
                </mesh>

                {/* Ears */}
                <mesh position={[-0.38, 2.72, 0]}><sphereGeometry args={[0.07, 6, 6]} /><meshPhongMaterial color={ch.skin} /></mesh>
                <mesh position={[0.38, 2.72, 0]}><sphereGeometry args={[0.07, 6, 6]} /><meshPhongMaterial color={ch.skin} /></mesh>

                {/* ======= HAIR ======= */}
                <HairComponent ch={ch} />

                {/* ======= TORSO — Dress top ======= */}
                <mesh position={[0, 2.05, 0]} castShadow>
                    <boxGeometry args={[0.7, 0.7, 0.45]} />
                    <meshPhongMaterial color={ch.dress} />
                </mesh>
                {/* Collar / neckline accent */}
                <mesh position={[0, 2.35, 0.15]} rotation={[0.3, 0, 0]}>
                    <boxGeometry args={[0.35, 0.08, 0.08]} />
                    <meshPhongMaterial color={ch.dressAccent} />
                </mesh>

                {/* ======= SKIRT ======= */}
                <group ref={skirtRef} position={[0, 1.55, 0]}>
                    <mesh castShadow>
                        <cylinderGeometry args={[0.3, 0.5, 0.6, 10]} />
                        <meshPhongMaterial color={ch.dress} />
                    </mesh>
                    {/* Skirt hem accent */}
                    <mesh position={[0, -0.28, 0]}>
                        <cylinderGeometry args={[0.48, 0.52, 0.08, 10]} />
                        <meshPhongMaterial color={ch.dressAccent} />
                    </mesh>
                </group>

                {/* ======= ARMS — with hands ======= */}
                <group ref={leftArmRef} position={[-0.48, 2.05, 0]}>
                    {/* Sleeve */}
                    <mesh position={[0, -0.15, 0]} castShadow>
                        <boxGeometry args={[0.22, 0.35, 0.22]} />
                        <meshPhongMaterial color={ch.dress} />
                    </mesh>
                    {/* Forearm (skin) */}
                    <mesh position={[0, -0.45, 0]} castShadow>
                        <boxGeometry args={[0.18, 0.3, 0.18]} />
                        <meshPhongMaterial color={ch.skin} />
                    </mesh>
                    {/* Hand */}
                    <mesh position={[0, -0.65, 0]}>
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshPhongMaterial color={ch.skin} />
                    </mesh>
                </group>
                <group ref={rightArmRef} position={[0.48, 2.05, 0]}>
                    <mesh position={[0, -0.15, 0]} castShadow>
                        <boxGeometry args={[0.22, 0.35, 0.22]} />
                        <meshPhongMaterial color={ch.dress} />
                    </mesh>
                    <mesh position={[0, -0.45, 0]} castShadow>
                        <boxGeometry args={[0.18, 0.3, 0.18]} />
                        <meshPhongMaterial color={ch.skin} />
                    </mesh>
                    <mesh position={[0, -0.65, 0]}>
                        <sphereGeometry args={[0.08, 8, 8]} />
                        <meshPhongMaterial color={ch.skin} />
                    </mesh>
                </group>

                {/* ======= LEGS — with skin and shoes ======= */}
                <group ref={leftLegRef} position={[-0.18, 1.25, 0]}>
                    {/* Leg */}
                    <mesh position={[0, -0.25, 0]} castShadow>
                        <cylinderGeometry args={[0.1, 0.1, 0.55, 8]} />
                        <meshPhongMaterial color={ch.skin} />
                    </mesh>
                    {/* Shoe */}
                    <mesh position={[0, -0.55, 0.04]}>
                        <boxGeometry args={[0.16, 0.12, 0.22]} />
                        <meshPhongMaterial color={ch.shoes} />
                    </mesh>
                </group>
                <group ref={rightLegRef} position={[0.18, 1.25, 0]}>
                    <mesh position={[0, -0.25, 0]} castShadow>
                        <cylinderGeometry args={[0.1, 0.1, 0.55, 8]} />
                        <meshPhongMaterial color={ch.skin} />
                    </mesh>
                    <mesh position={[0, -0.55, 0.04]}>
                        <boxGeometry args={[0.16, 0.12, 0.22]} />
                        <meshPhongMaterial color={ch.shoes} />
                    </mesh>
                </group>
            </group>
        </group>
    )
}
