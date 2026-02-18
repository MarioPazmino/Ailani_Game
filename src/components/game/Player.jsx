import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboard } from './Controls'
import { gameState } from './gameState'
import { useGameStore, CHARACTERS } from '../../store'

const SPEED = 12
const GRAVITY = -25
const JUMP_FORCE = 10

export function Player() {
    const groupRef = useRef()
    const leftArmRef = useRef()
    const rightArmRef = useRef()
    const leftLegRef = useRef()
    const rightLegRef = useRef()
    const keys = useKeyboard()
    const character = useGameStore((s) => s.character)
    const ch = CHARACTERS[character]

    useFrame((_, delta) => {
        if (!groupRef.current) return
        const dt = Math.min(delta, 0.05)

        // === Movement relative to camera ===
        const forward = new THREE.Vector3(
            -Math.sin(gameState.cameraTheta), 0, -Math.cos(gameState.cameraTheta)
        )
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
        if (keys.current.Space && gameState.onGround) {
            gameState.velocityY = JUMP_FORCE
            gameState.onGround = false
        }
        gameState.velocityY += GRAVITY * dt
        groupRef.current.position.y += gameState.velocityY * dt
        if (groupRef.current.position.y <= 0) {
            groupRef.current.position.y = 0
            gameState.velocityY = 0
            gameState.onGround = true
        }

        // === Clamp to map ===
        groupRef.current.position.x = Math.max(-46, Math.min(46, groupRef.current.position.x))
        groupRef.current.position.z = Math.max(-46, Math.min(46, groupRef.current.position.z))

        // === Update shared state ===
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
        } else {
            gameState.walkTime += dt * 2
            if (leftLegRef.current) {
                leftLegRef.current.rotation.x *= 0.9 // smooth blend to 0
                rightLegRef.current.rotation.x *= 0.9
                leftArmRef.current.rotation.x = Math.sin(gameState.walkTime) * 0.08
                rightArmRef.current.rotation.x = -Math.sin(gameState.walkTime) * 0.08
            }
        }
    })

    return (
        <group ref={groupRef}>
            {/* Torso */}
            <mesh position={[0, 1.8, 0]} castShadow>
                <boxGeometry args={[0.8, 1, 0.5]} />
                <meshPhongMaterial color={ch.threeColor} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 2.75, 0]} castShadow>
                <sphereGeometry args={[0.4, 12, 12]} />
                <meshPhongMaterial color={0xd2a679} />
            </mesh>

            {/* Hair */}
            <mesh position={[0, 2.85, 0]} scale={[1, 0.8, 1]}>
                <sphereGeometry args={[0.42, 12, 12]} />
                <meshPhongMaterial color={ch.hair} />
            </mesh>

            {/* Eyes */}
            <mesh position={[-0.12, 2.75, 0.35]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshPhongMaterial color={0x1a1a2e} />
            </mesh>
            <mesh position={[0.12, 2.75, 0.35]}>
                <sphereGeometry args={[0.06, 6, 6]} />
                <meshPhongMaterial color={0x1a1a2e} />
            </mesh>

            {/* Mouth */}
            <mesh position={[0, 2.6, 0.38]}>
                <boxGeometry args={[0.15, 0.04, 0.04]} />
                <meshPhongMaterial color={0xc0392b} />
            </mesh>

            {/* Left Arm */}
            <group ref={leftArmRef} position={[-0.55, 1.8, 0]}>
                <mesh position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.8, 0.25]} />
                    <meshPhongMaterial color={ch.threeColor} />
                </mesh>
            </group>

            {/* Right Arm */}
            <group ref={rightArmRef} position={[0.55, 1.8, 0]}>
                <mesh position={[0, -0.4, 0]} castShadow>
                    <boxGeometry args={[0.25, 0.8, 0.25]} />
                    <meshPhongMaterial color={ch.threeColor} />
                </mesh>
            </group>

            {/* Left Leg */}
            <group ref={leftLegRef} position={[-0.2, 1.3, 0]}>
                <mesh position={[0, -0.45, 0]} castShadow>
                    <cylinderGeometry args={[0.15, 0.15, 0.9, 8]} />
                    <meshPhongMaterial color={0x3949ab} />
                </mesh>
            </group>

            {/* Right Leg */}
            <group ref={rightLegRef} position={[0.2, 1.3, 0]}>
                <mesh position={[0, -0.45, 0]} castShadow>
                    <cylinderGeometry args={[0.15, 0.15, 0.9, 8]} />
                    <meshPhongMaterial color={0x3949ab} />
                </mesh>
            </group>
        </group>
    )
}
