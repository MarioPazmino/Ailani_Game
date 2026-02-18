import { useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { World } from './World'
import { Trees } from './Trees'
import { Flowers } from './Flowers'
import { Sky } from './Sky'
import { Animals } from './Animals'
import { Player } from './Player'
import { Stars } from './Stars'
import { CameraRig } from './CameraRig'

export default function GameCanvas() {
    return (
        <Canvas
            shadows
            camera={{ fov: 60, near: 0.1, far: 200, position: [0, 8, 15] }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
            onCreated={({ scene }) => {
                scene.background = new THREE.Color(0x87ceeb)
                scene.fog = new THREE.Fog(0x87ceeb, 60, 120)
            }}
        >
            <ambientLight intensity={0.5} />
            <directionalLight
                position={[30, 40, 20]}
                intensity={0.9}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-left={-60}
                shadow-camera-right={60}
                shadow-camera-top={60}
                shadow-camera-bottom={-60}
                shadow-camera-near={1}
                shadow-camera-far={120}
            />
            <World />
            <Trees />
            <Flowers />
            <Sky />
            <Animals />
            <Player />
            <Stars />
            <CameraRig />
        </Canvas>
    )
}
