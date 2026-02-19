import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'

/* Barn interior: cow being milked, chickens on hay nests with eggs */
export function BarnInterior() {
    const cowTailRef = useRef()
    const cowHeadRef = useRef()
    const chickenRefs = [useRef(), useRef(), useRef()]

    useFrame((state) => {
        const t = state.clock.elapsedTime
        // Cow tail swish
        if (cowTailRef.current) cowTailRef.current.rotation.x = Math.sin(t * 2) * 0.3 - 0.3
        // Cow head subtle movement (chewing)
        if (cowHeadRef.current) cowHeadRef.current.rotation.z = Math.sin(t * 3) * 0.03
        // Chickens bobbing
        chickenRefs.forEach((ref, i) => {
            if (ref.current) {
                ref.current.rotation.z = Math.sin(t * 2 + i * 2) * 0.05
                ref.current.position.y = 0.85 + Math.sin(t * 1.5 + i) * 0.02
            }
        })
    })

    return (
        <group>
            {/* Barn floor — hay covered */}
            <mesh position={[0, 0.15, 0]} receiveShadow>
                <boxGeometry args={[9.5, 0.05, 7.5]} />
                <meshLambertMaterial color={0xd4a057} />
            </mesh>
            {/* Hay texture lines */}
            {[-3, -1, 1, 3].map((x, i) => (
                <mesh key={i} position={[x, 0.18, 0]}>
                    <boxGeometry args={[0.06, 0.01, 7]} />
                    <meshLambertMaterial color={0xc49340} />
                </mesh>
            ))}

            {/* ===== COW BEING MILKED (left side) ===== */}
            <group position={[-2.5, 0, -1]}>
                {/* Cow body */}
                <mesh position={[0, 1.3, 0]} castShadow>
                    <boxGeometry args={[1.8, 1.2, 1.0]} />
                    <meshLambertMaterial color={0xf5f5f5} />
                </mesh>
                {/* Cow spots */}
                <mesh position={[0.3, 1.5, 0.51]}>
                    <circleGeometry args={[0.25, 6]} />
                    <meshLambertMaterial color={0x4e342e} />
                </mesh>
                <mesh position={[-0.4, 1.2, 0.51]}>
                    <circleGeometry args={[0.18, 6]} />
                    <meshLambertMaterial color={0x4e342e} />
                </mesh>
                {/* Cow head */}
                <group ref={cowHeadRef} position={[1.1, 1.5, 0]}>
                    <mesh castShadow>
                        <boxGeometry args={[0.6, 0.5, 0.6]} />
                        <meshLambertMaterial color={0xf5f5f5} />
                    </mesh>
                    {/* Face features */}
                    <mesh position={[0.2, 0.05, 0]}>
                        <boxGeometry args={[0.25, 0.2, 0.45]} />
                        <meshLambertMaterial color={0xffc0cb} />
                    </mesh>
                    {/* Eyes */}
                    <mesh position={[0.15, 0.12, 0.25]}>
                        <sphereGeometry args={[0.05, 4, 4]} />
                        <meshLambertMaterial color={0x212121} />
                    </mesh>
                    <mesh position={[0.15, 0.12, -0.25]}>
                        <sphereGeometry args={[0.05, 4, 4]} />
                        <meshLambertMaterial color={0x212121} />
                    </mesh>
                    {/* Horns */}
                    <mesh position={[-0.1, 0.32, 0.2]} rotation={[0, 0, -0.3]}>
                        <coneGeometry args={[0.04, 0.2, 4]} />
                        <meshLambertMaterial color={0xdeb887} />
                    </mesh>
                    <mesh position={[-0.1, 0.32, -0.2]} rotation={[0, 0, -0.3]}>
                        <coneGeometry args={[0.04, 0.2, 4]} />
                        <meshLambertMaterial color={0xdeb887} />
                    </mesh>
                </group>
                {/* Cow legs */}
                {[[-0.5, 0.4], [-0.5, -0.4], [0.5, 0.4], [0.5, -0.4]].map(([lx, lz], i) => (
                    <mesh key={i} position={[lx, 0.45, lz]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.7, 4]} />
                        <meshLambertMaterial color={0xf5f5f5} />
                    </mesh>
                ))}
                {/* Udder */}
                <mesh position={[0.2, 0.6, 0]}>
                    <sphereGeometry args={[0.18, 5, 5]} />
                    <meshLambertMaterial color={0xffc0cb} />
                </mesh>
                {/* Cow tail */}
                <group ref={cowTailRef} position={[-0.95, 1.4, 0]}>
                    <mesh position={[-0.2, 0, 0]} rotation={[0, 0, -0.4]}>
                        <cylinderGeometry args={[0.02, 0.03, 0.6, 4]} />
                        <meshLambertMaterial color={0xf5f5f5} />
                    </mesh>
                    <mesh position={[-0.4, -0.15, 0]}>
                        <sphereGeometry args={[0.06, 4, 4]} />
                        <meshLambertMaterial color={0x4e342e} />
                    </mesh>
                </group>

                {/* Milk bucket under cow */}
                <mesh position={[0.2, 0.25, 0.5]} castShadow>
                    <cylinderGeometry args={[0.15, 0.2, 0.35, 6]} />
                    <meshLambertMaterial color={0x78909c} />
                </mesh>
                {/* Milk surface */}
                <mesh position={[0.2, 0.4, 0.5]}>
                    <circleGeometry args={[0.13, 6]} />
                    <meshLambertMaterial color={0xfafafa} />
                </mesh>
                {/* Milking stool */}
                <mesh position={[0.2, 0.3, 0.9]}>
                    <cylinderGeometry args={[0.2, 0.2, 0.05, 6]} />
                    <meshLambertMaterial color={0x8d6e3c} />
                </mesh>
                {[[-0.12, -0.12], [-0.12, 0.12], [0.12, 0]].map(([sx, sz], i) => (
                    <mesh key={`stool${i}`} position={[0.2 + sx, 0.15, 0.9 + sz]}>
                        <cylinderGeometry args={[0.025, 0.025, 0.25, 4]} />
                        <meshLambertMaterial color={0x8d6e3c} />
                    </mesh>
                ))}
            </group>

            {/* ===== CHICKEN NESTS WITH EGGS (right side) ===== */}
            {[
                { x: 2.5, z: -2, rot: 0.2 },
                { x: 3.2, z: 0, rot: -0.1 },
                { x: 2.0, z: 1.5, rot: 0.4 },
            ].map((nest, ni) => (
                <group key={ni} position={[nest.x, 0, nest.z]}>
                    {/* Hay nest */}
                    <mesh position={[0, 0.35, 0]} castShadow>
                        <cylinderGeometry args={[0.5, 0.55, 0.3, 8]} />
                        <meshLambertMaterial color={0xd4a057} />
                    </mesh>
                    {/* Hay strands on top */}
                    {[0, 1, 2, 3].map(s => (
                        <mesh key={s} position={[Math.cos(s * 1.5) * 0.3, 0.45, Math.sin(s * 1.5) * 0.3]} rotation={[0.3, s, 0]}>
                            <boxGeometry args={[0.15, 0.03, 0.03]} />
                            <meshLambertMaterial color={0xc49340} />
                        </mesh>
                    ))}
                    {/* Eggs in nest */}
                    {[[-0.12, 0.1], [0.1, -0.08], [0.0, 0.15]].map(([ex, ez], ei) => (
                        <mesh key={ei} position={[ex, 0.5, ez]}>
                            <sphereGeometry args={[0.08, 5, 5]} />
                            <meshLambertMaterial color={0xfff8e1} />
                        </mesh>
                    ))}
                    {/* Chicken sitting on nest */}
                    <group ref={chickenRefs[ni]} position={[0, 0.85, 0]} rotation={[0, nest.rot, 0]}>
                        {/* Body */}
                        <mesh>
                            <sphereGeometry args={[0.3, 6, 6]} />
                            <meshLambertMaterial color={[0xd4a057, 0xf5f5f5, 0x8d6e3c][ni]} />
                        </mesh>
                        {/* Head */}
                        <mesh position={[0.25, 0.15, 0]}>
                            <sphereGeometry args={[0.15, 5, 5]} />
                            <meshLambertMaterial color={[0xd4a057, 0xf5f5f5, 0x8d6e3c][ni]} />
                        </mesh>
                        {/* Comb */}
                        <mesh position={[0.25, 0.32, 0]}>
                            <boxGeometry args={[0.08, 0.1, 0.04]} />
                            <meshLambertMaterial color={0xe53935} />
                        </mesh>
                        {/* Beak */}
                        <mesh position={[0.38, 0.12, 0]}>
                            <coneGeometry args={[0.04, 0.1, 4]} />
                            <meshLambertMaterial color={0xff9800} />
                        </mesh>
                        {/* Eye */}
                        <mesh position={[0.33, 0.18, 0.08]}>
                            <sphereGeometry args={[0.025, 4, 4]} />
                            <meshLambertMaterial color={0x212121} />
                        </mesh>
                        {/* Wing */}
                        <mesh position={[-0.05, 0.0, 0.22]} rotation={[0, 0, 0.3]}>
                            <boxGeometry args={[0.2, 0.15, 0.05]} />
                            <meshLambertMaterial color={[0xc49340, 0xe0e0e0, 0x795548][ni]} />
                        </mesh>
                        {/* Tail feathers */}
                        <mesh position={[-0.25, 0.1, 0]} rotation={[0, 0, -0.5]}>
                            <boxGeometry args={[0.15, 0.2, 0.08]} />
                            <meshLambertMaterial color={[0xc49340, 0xe0e0e0, 0x795548][ni]} />
                        </mesh>
                    </group>
                </group>
            ))}

            {/* ===== HAY BALES STACKED (back wall) ===== */}
            {[[-3, -2.5], [-1.5, -2.8], [-2.5, -2.8]].map(([hx, hz], i) => (
                <mesh key={`hay${i}`} position={[hx, 0.5 + (i === 2 ? 0.8 : 0), hz]} rotation={[Math.PI / 2, 0, i * 0.4]} castShadow>
                    <cylinderGeometry args={[0.45, 0.45, 0.9, 6]} />
                    <meshLambertMaterial color={0xd4a057} />
                </mesh>
            ))}

            {/* ===== TOOLS ON WALL (left back) ===== */}
            {/* Pitchfork */}
            <mesh position={[-4.3, 2.5, -1]} rotation={[0, 0, 0.1]}>
                <cylinderGeometry args={[0.025, 0.025, 2.5, 4]} />
                <meshLambertMaterial color={0x8d6e3c} />
            </mesh>
            {[-0.1, 0, 0.1].map((pz, i) => (
                <mesh key={`prong${i}`} position={[-4.25, 3.7, -1 + pz]} rotation={[0, 0, 0.1]}>
                    <cylinderGeometry args={[0.015, 0.015, 0.3, 4]} />
                    <meshLambertMaterial color={0x757575} />
                </mesh>
            ))}

            {/* Shovel */}
            <mesh position={[-4.3, 2.0, 1]} rotation={[0, 0, -0.1]}>
                <cylinderGeometry args={[0.025, 0.025, 2.0, 4]} />
                <meshLambertMaterial color={0x8d6e3c} />
            </mesh>
            <mesh position={[-4.35, 3.0, 1]} rotation={[0, 0, -0.1]}>
                <boxGeometry args={[0.02, 0.3, 0.25]} />
                <meshLambertMaterial color={0x757575} />
            </mesh>

            {/* Interior light */}
            <pointLight position={[0, 5, 0]} color={0xfff3e0} intensity={0.4} distance={10} />

            {/* Lantern on post */}
            <mesh position={[4.2, 3, 0]}>
                <boxGeometry args={[0.2, 0.25, 0.2]} />
                <meshPhongMaterial color={0xff8f00} emissive={0xff6f00} emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[4.2, 3.15, 0]}>
                <boxGeometry args={[0.25, 0.05, 0.25]} />
                <meshLambertMaterial color={0x5d4037} />
            </mesh>
        </group>
    )
}
