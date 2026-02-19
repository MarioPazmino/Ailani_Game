import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gameState } from './gameState'

export function CameraRig() {
    const { camera, gl } = useThree()
    const camTarget = useRef(new THREE.Vector3())
    const camPos = useRef(new THREE.Vector3())

    useEffect(() => {
        const canvas = gl.domElement

        // Click to lock pointer — gives unlimited mouse movement
        const onClick = () => {
            if (!document.pointerLockElement) {
                canvas.requestPointerLock()
            }
        }

        // Mouse movement (only works when pointer is locked)
        const onMouseMove = (e) => {
            if (document.pointerLockElement !== canvas) return
            gameState.cameraTheta -= e.movementX * 0.003
            gameState.cameraPhi = Math.max(0.15, Math.min(1.2, gameState.cameraPhi - e.movementY * 0.003))
        }

        // ESC releases pointer lock automatically (browser default)

        // Touch support (drag-based for mobile)
        const touchRef = { down: false, x: 0, y: 0 }
        const onTouchStart = (e) => {
            if (e.touches.length === 1) {
                touchRef.down = true
                touchRef.x = e.touches[0].clientX
                touchRef.y = e.touches[0].clientY
            }
        }
        const onTouchEnd = () => { touchRef.down = false }
        const onTouchMove = (e) => {
            if (!touchRef.down || e.touches.length !== 1) return
            const dx = e.touches[0].clientX - touchRef.x
            const dy = e.touches[0].clientY - touchRef.y
            touchRef.x = e.touches[0].clientX
            touchRef.y = e.touches[0].clientY
            gameState.cameraTheta -= dx * 0.005
            gameState.cameraPhi = Math.max(0.15, Math.min(1.2, gameState.cameraPhi - dy * 0.005))
        }

        canvas.addEventListener('click', onClick)
        document.addEventListener('mousemove', onMouseMove)
        canvas.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchend', onTouchEnd)
        window.addEventListener('touchmove', onTouchMove, { passive: true })

        return () => {
            canvas.removeEventListener('click', onClick)
            document.removeEventListener('mousemove', onMouseMove)
            canvas.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchend', onTouchEnd)
            window.removeEventListener('touchmove', onTouchMove)
            if (document.pointerLockElement === canvas) {
                document.exitPointerLock()
            }
        }
    }, [gl])

    useFrame((_, delta) => {
        const dt = Math.min(delta, 0.05)
        const dist = 10
        const pp = gameState.playerPosition

        const idealX = pp.x + Math.sin(gameState.cameraTheta) * dist * Math.cos(gameState.cameraPhi)
        const idealY = pp.y + 3 + dist * Math.sin(gameState.cameraPhi)
        const idealZ = pp.z + Math.cos(gameState.cameraTheta) * dist * Math.cos(gameState.cameraPhi)

        camPos.current.set(idealX, idealY, idealZ)
        camera.position.lerp(camPos.current, 5 * dt)
        camTarget.current.set(pp.x, pp.y + 2, pp.z)
        camera.lookAt(camTarget.current)
    })

    return null
}
