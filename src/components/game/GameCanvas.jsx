import { useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { World } from './World'
import { Trees } from './Trees'
import { Flowers } from './Flowers'
import { Sky } from './Sky'
import { Animals } from './Animals'
import { Player } from './Player'
import { Stars } from './Stars'
import { SkyFormations } from './SkyFormations'
import { CameraRig } from './CameraRig'
import { getDayNightState } from './dayNight'

// Updates scene lighting, fog, background, exposure every frame based on real time
function DayNightController() {
    const { scene, gl } = useThree()
    const hemiRef     = useRef()
    const sunLightRef = useRef()
    const fillRef     = useRef()

    useFrame(() => {
        const s = getDayNightState()

        // Background
        if (!scene.background) scene.background = new THREE.Color()
        scene.background.copy(s.skyColor)

        // Fog
        if (scene.fog) {
            scene.fog.color.copy(s.fogColor)
            scene.fog.density = s.fogDensity
        }

        // Hemisphere light
        if (hemiRef.current) {
            hemiRef.current.color.copy(s.hemiSkyCol)
            hemiRef.current.groundColor.copy(s.hemiGroundCol)
            hemiRef.current.intensity = s.hemiIntensity
        }

        // Directional sun — moves with the sun position
        if (sunLightRef.current) {
            sunLightRef.current.position.set(s.sunX * 0.7, Math.max(s.sunY * 0.85, 2), s.sunZ)
            sunLightRef.current.color.copy(s.sunColor)
            sunLightRef.current.intensity = s.sunIntensity
        }

        // Fill light
        if (fillRef.current) {
            fillRef.current.color.copy(s.ambientColor)
            fillRef.current.intensity = s.ambientIntensity
        }

        // Tone mapping exposure
        gl.toneMappingExposure = s.exposure
    })

    return (
        <>
            <hemisphereLight ref={hemiRef} args={[0x74b9ff, 0x7c5229, 0.6]} />
            <directionalLight
                ref={sunLightRef}
                position={[30, 45, 20]}
                intensity={1.1}
                color={0xfff3c0}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-55}
                shadow-camera-right={55}
                shadow-camera-top={55}
                shadow-camera-bottom={-55}
                shadow-camera-near={5}
                shadow-camera-far={110}
                shadow-bias={-0.0003}
            />
            <directionalLight
                ref={fillRef}
                position={[-20, 15, -20]}
                intensity={0.28}
                color={0xc9e8ff}
            />
        </>
    )
}

export default function GameCanvas() {
    return (
        <Canvas
            shadows
            camera={{ fov: 58, near: 0.5, far: 150, position: [0, 8, 15] }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
            gl={{
                antialias: true,
                powerPreference: 'high-performance',
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.1,
            }}
            dpr={[1, 1.5]}
            onCreated={({ scene }) => {
                scene.background = new THREE.Color(0x87ceeb)
                scene.fog = new THREE.FogExp2(0xa8d8ea, 0.008)
            }}
        >
            <DayNightController />

            <World />
            <Trees />
            <Flowers />
            <Sky />
            <Animals />
            <Player />
            <Stars />
            <SkyFormations />
            <CameraRig />

            {/* Post-processing */}
            <EffectComposer>
                {/* Glow on stars, sun and bright objects */}
                <Bloom
                    luminanceThreshold={0.82}
                    luminanceSmoothing={0.4}
                    intensity={0.55}
                    mipmapBlur
                />
                {/* Cinematic vignette */}
                <Vignette offset={0.4} darkness={0.45} />
            </EffectComposer>
        </Canvas>
    )
}
