import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { gameState } from './gameState'

export function CameraRig() {
    const { camera, gl } = useThree()
    const mouseRef = useRef({ down: false, x: 0, y: 0 })
    const camTarget = useRef(new THREE.Vector3())
    const camPos = useRef(new THREE.Vector3())

    useEffect(() => {
        const canvas = gl.domElement

        const onMouseDown = (e) => {
            mouseRef.current = { down: true, x: e.clientX, y: e.clientY }
        }
        const onMouseUp = () => { mouseRef.current.down = false }
        const onMouseMove = (e) => {
            if (!mouseRef.current.down) return
            const dx = e.clientX - mouseRef.current.x
            const dy = e.clientY - mouseRef.current.y
            mouseRef.current.x = e.clientX
            mouseRef.current.y = e.clientY
            gameState.cameraTheta -= dx * 0.005
            gameState.cameraPhi = Math.max(0.15, Math.min(1.2, gameState.cameraPhi - dy * 0.005))
        }

        // Touch support
        const onTouchStart = (e) => {
            if (e.touches.length === 1) {
                mouseRef.current = { down: true, x: e.touches[0].clientX, y: e.touches[0].clientY }
            }
        }
        const onTouchEnd = () => { mouseRef.current.down = false }
        const onTouchMove = (e) => {
            if (!mouseRef.current.down || e.touches.length !== 1) return
            const dx = e.touches[0].clientX - mouseRef.current.x
            const dy = e.touches[0].clientY - mouseRef.current.y
            mouseRef.current.x = e.touches[0].clientX
            mouseRef.current.y = e.touches[0].clientY
            gameState.cameraTheta -= dx * 0.005
            gameState.cameraPhi = Math.max(0.15, Math.min(1.2, gameState.cameraPhi - dy * 0.005))
        }

        canvas.addEventListener('mousedown', onMouseDown)
        window.addEventListener('mouseup', onMouseUp)
        window.addEventListener('mousemove', onMouseMove)
        canvas.addEventListener('touchstart', onTouchStart, { passive: true })
        window.addEventListener('touchend', onTouchEnd)
        window.addEventListener('touchmove', onTouchMove, { passive: true })

        return () => {
            canvas.removeEventListener('mousedown', onMouseDown)
            window.removeEventListener('mouseup', onMouseUp)
            window.removeEventListener('mousemove', onMouseMove)
            canvas.removeEventListener('touchstart', onTouchStart)
            window.removeEventListener('touchend', onTouchEnd)
            window.removeEventListener('touchmove', onTouchMove)
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
