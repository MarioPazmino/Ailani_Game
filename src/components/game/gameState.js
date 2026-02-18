import * as THREE from 'three'

export const gameState = {
    playerPosition: new THREE.Vector3(0, 0, 0),
    playerRotationY: 0,
    cameraTheta: 0,
    cameraPhi: 0.6,
    velocityY: 0,
    onGround: true,
    isMoving: false,
    walkTime: 0,
}
