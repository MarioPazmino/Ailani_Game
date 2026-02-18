/*
  Static collision volumes for all solid objects.
  Each collider is a circle { x, z, r } or box { x, z, hw, hd } (half-width, half-depth).
*/

// Tree positions (same as Trees.jsx)
const TREE_POSITIONS = [
    [-30, -30], [-25, -35], [-35, -25], [30, -30], [35, -25], [25, -35],
    [-30, 30], [-35, 35], [-25, 25], [30, 30], [35, 25], [28, 38],
    [-40, 0], [40, 5], [-10, 35], [15, 38], [-38, -15], [42, -20],
    [0, -35], [10, -40], [-20, 40], [20, -25],
    [-42, 25], [38, -38], [-15, -42], [42, 42], [-42, -42], [5, 42]
]

// Circle colliders: trees (trunk radius ~0.5), well
const circleColliders = [
    ...TREE_POSITIONS.map(([x, z]) => ({ x, z, r: 1.0 })),
    // Well
    { x: 10, z: 8, r: 1.5 },
]

// Box colliders: buildings
const boxColliders = [
    // Farmhouse (pos [-15, -15], size 8x6) + porch
    { x: -15, z: -15, hw: 4.5, hd: 4.5 },
    // Barn (pos [18, -12], size 10x8)
    { x: 18, z: -12, hw: 5.5, hd: 4.5 },
    // Hay bales near barn
    { x: 24, z: -11, hw: 1.5, hd: 2 },
]

/**
 * Resolves collisions for a proposed player position.
 * Returns the corrected position { x, z }.
 */
export function resolveCollisions(px, pz, playerRadius = 0.4) {
    let x = px
    let z = pz

    // Circle collisions (trees, well)
    for (const c of circleColliders) {
        const dx = x - c.x
        const dz = z - c.z
        const dist = Math.sqrt(dx * dx + dz * dz)
        const minDist = c.r + playerRadius
        if (dist < minDist && dist > 0.001) {
            // Push player out along the collision normal
            const nx = dx / dist
            const nz = dz / dist
            x = c.x + nx * minDist
            z = c.z + nz * minDist
        }
    }

    // Box collisions (buildings)
    for (const b of boxColliders) {
        const hw = b.hw + playerRadius
        const hd = b.hd + playerRadius
        const dx = x - b.x
        const dz = z - b.z

        if (Math.abs(dx) < hw && Math.abs(dz) < hd) {
            // Find the shortest push-out axis
            const overlapX = hw - Math.abs(dx)
            const overlapZ = hd - Math.abs(dz)
            if (overlapX < overlapZ) {
                x = b.x + Math.sign(dx) * hw
            } else {
                z = b.z + Math.sign(dz) * hd
            }
        }
    }

    return { x, z }
}
