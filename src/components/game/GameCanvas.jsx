import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import { World } from './World'
import { Trees } from './Trees'
import { Flowers } from './Flowers'
import { Sky } from './Sky'
import { Animals } from './Animals'
import { Player } from './Player'
import { Stars } from './Stars'
import { SkyFormations } from './SkyFormations'
import { CameraRig } from './CameraRig'

export default function GameCanvas() {
    return (
        <Canvas
            shadows
            camera={{ fov: 60, near: 0.5, far: 150, position: [0, 8, 15] }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%' }}
            gl={{ antialias: false, powerPreference: 'high-performance' }}
            dpr={[0.75, 1]}
            onCreated={({ scene }) => {
                scene.background = new THREE.Color(0x87ceeb)
                scene.fog = new THREE.Fog(0x87ceeb, 40, 90)
            }}
        >
            <ambientLight intensity={0.55} />
            <directionalLight
                position={[30, 40, 20]}
                intensity={0.85}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-left={-50}
                shadow-camera-right={50}
                shadow-camera-top={50}
                shadow-camera-bottom={-50}
                shadow-camera-near={5}
                shadow-camera-far={100}
            />
            <World />
            <Trees />
            <Flowers />
            <Sky />
            <Animals />
            <Player />
            <Stars />
            <SkyFormations />
            <CameraRig />
        </Canvas>
    )
}
