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

// Circle colliders: trees, well
const circleColliders = [
    ...TREE_POSITIONS.map(([x, z]) => ({ x, z, r: 1.0 })),
    { x: 10, z: 8, r: 1.5 },
]

// Box colliders: building walls (with door gaps)
// Farmhouse at [-15, -15], size 8x6: door is at front center (z = -15 + 3 = -12)
// We split into 3 walls: left, right, and back (leaving front door open)
const boxColliders = [
    // Farmhouse left wall (x = -15 - 4 to -15 - 0.75, z = -15 -3 to -15 + 3)
    { x: -17.4, z: -15, hw: 1.6, hd: 3.5 },
    // Farmhouse right wall
    { x: -12.6, z: -15, hw: 1.6, hd: 3.5 },
    // Farmhouse back wall
    { x: -15, z: -17.5, hw: 4.5, hd: 1.0 },
    // Barn left wall (at [18, -12], size 10x8, door front center z = -12 + 4 = -8)
    { x: 15, z: -12, hw: 2.0, hd: 4.5 },
    // Barn right wall
    { x: 21, z: -12, hw: 2.0, hd: 4.5 },
    // Barn back wall
    { x: 18, z: -15.5, hw: 5.5, hd: 1.0 },
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
