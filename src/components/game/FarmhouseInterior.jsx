/* Princess-themed farmhouse interior */
export function FarmhouseInterior() {
    return (
        <group>
            {/* Floor — wooden planks */}
            <mesh position={[0, 0.42, 0]} receiveShadow>
                <boxGeometry args={[7.5, 0.05, 5.5]} />
                <meshLambertMaterial color={0xa0845c} />
            </mesh>
            {/* Plank lines */}
            {[-2.5, -1.25, 0, 1.25, 2.5].map((x, i) => (
                <mesh key={i} position={[x, 0.45, 0]}>
                    <boxGeometry args={[0.04, 0.01, 5.5]} />
                    <meshLambertMaterial color={0x8d6e3c} />
                </mesh>
            ))}

            {/* === PRINCESS BED (left side) === */}
            <group position={[-2.5, 0, -1]}>
                {/* Bed frame */}
                <mesh position={[0, 0.8, 0]} castShadow>
                    <boxGeometry args={[2.2, 0.3, 1.5]} />
                    <meshLambertMaterial color={0xdeb887} />
                </mesh>
                {/* Mattress */}
                <mesh position={[0, 1.0, 0]}>
                    <boxGeometry args={[2.0, 0.2, 1.3]} />
                    <meshLambertMaterial color={0xffc0cb} />
                </mesh>
                {/* Blanket */}
                <mesh position={[0.2, 1.12, 0]}>
                    <boxGeometry args={[1.5, 0.08, 1.25]} />
                    <meshLambertMaterial color={0xe91e63} />
                </mesh>
                {/* Pillow */}
                <mesh position={[-0.7, 1.15, 0]}>
                    <boxGeometry args={[0.4, 0.15, 0.8]} />
                    <meshLambertMaterial color={0xfff0f5} />
                </mesh>
                {/* Headboard */}
                <mesh position={[-1.1, 1.5, 0]} castShadow>
                    <boxGeometry args={[0.15, 1.2, 1.5]} />
                    <meshLambertMaterial color={0xdeb887} />
                </mesh>
                {/* Headboard crown decoration */}
                <mesh position={[-1.1, 2.0, 0]}>
                    <coneGeometry args={[0.25, 0.3, 5]} />
                    <meshPhongMaterial color={0xffd700} />
                </mesh>
                {/* Bed legs */}
                {[[-0.9, -0.5], [-0.9, 0.5], [0.9, -0.5], [0.9, 0.5]].map(([bx, bz], i) => (
                    <mesh key={i} position={[bx, 0.55, bz]}>
                        <cylinderGeometry args={[0.06, 0.06, 0.25, 4]} />
                        <meshLambertMaterial color={0xdeb887} />
                    </mesh>
                ))}
            </group>

            {/* === PINK RUG (center floor) === */}
            <mesh position={[0, 0.46, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[1.2, 12]} />
                <meshLambertMaterial color={0xf8bbd0} />
            </mesh>

            {/* === DRESSER WITH MIRROR (right side) === */}
            <group position={[2.5, 0, -1.5]}>
                {/* Dresser body */}
                <mesh position={[0, 1.0, 0]} castShadow>
                    <boxGeometry args={[1.4, 1.2, 0.8]} />
                    <meshLambertMaterial color={0xfce4ec} />
                </mesh>
                {/* Drawer accents */}
                {[0.65, 1.05, 1.35].map((y, i) => (
                    <mesh key={i} position={[0, y, 0.42]}>
                        <boxGeometry args={[1.1, 0.2, 0.02]} />
                        <meshLambertMaterial color={0xf48fb1} />
                    </mesh>
                ))}
                {/* Drawer knobs */}
                {[0.65, 1.05, 1.35].map((y, i) => (
                    <mesh key={`k${i}`} position={[0, y, 0.45]}>
                        <sphereGeometry args={[0.04, 4, 4]} />
                        <meshPhongMaterial color={0xffd700} />
                    </mesh>
                ))}
                {/* Mirror */}
                <mesh position={[0, 2.2, -0.1]}>
                    <boxGeometry args={[0.8, 1.0, 0.05]} />
                    <meshPhongMaterial color={0xbbdefb} shininess={100} />
                </mesh>
                {/* Mirror frame */}
                <mesh position={[0, 2.2, -0.12]}>
                    <boxGeometry args={[0.95, 1.15, 0.04]} />
                    <meshLambertMaterial color={0xffd700} />
                </mesh>
            </group>

            {/* === SMALL TABLE WITH TOYS (right front) === */}
            <group position={[2.2, 0, 1.2]}>
                {/* Table top */}
                <mesh position={[0, 0.9, 0]}>
                    <boxGeometry args={[1.0, 0.08, 0.8]} />
                    <meshLambertMaterial color={0xfce4ec} />
                </mesh>
                {/* Table legs */}
                {[[-0.4, -0.3], [-0.4, 0.3], [0.4, -0.3], [0.4, 0.3]].map(([tx, tz], i) => (
                    <mesh key={i} position={[tx, 0.55, tz]}>
                        <cylinderGeometry args={[0.04, 0.04, 0.5, 4]} />
                        <meshLambertMaterial color={0xfce4ec} />
                    </mesh>
                ))}
                {/* Crown toy */}
                <mesh position={[-0.2, 1.1, 0]}>
                    <coneGeometry args={[0.15, 0.2, 5]} />
                    <meshPhongMaterial color={0xffd700} />
                </mesh>
                {/* Magic wand */}
                <mesh position={[0.2, 1.05, 0]} rotation={[0, 0, 0.3]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.4, 4]} />
                    <meshLambertMaterial color={0xce93d8} />
                </mesh>
                <mesh position={[0.28, 1.22, 0]}>
                    <octahedronGeometry args={[0.08, 0]} />
                    <meshPhongMaterial color={0xffd700} emissive={0xffb300} emissiveIntensity={0.3} />
                </mesh>
            </group>

            {/* === TOY BOX (left front) === */}
            <group position={[-2.2, 0, 1.5]}>
                <mesh position={[0, 0.7, 0]} castShadow>
                    <boxGeometry args={[1.0, 0.8, 0.7]} />
                    <meshLambertMaterial color={0xce93d8} />
                </mesh>
                {/* Heart decoration */}
                <mesh position={[0, 0.85, 0.36]}>
                    <sphereGeometry args={[0.12, 6, 6]} />
                    <meshLambertMaterial color={0xe91e63} />
                </mesh>
                {/* Teddy bear poking out */}
                <mesh position={[0.2, 1.2, 0]}>
                    <sphereGeometry args={[0.15, 6, 6]} />
                    <meshLambertMaterial color={0xd7a86e} />
                </mesh>
                <mesh position={[0.2, 1.35, 0]}>
                    <sphereGeometry args={[0.1, 5, 5]} />
                    <meshLambertMaterial color={0xd7a86e} />
                </mesh>
                {/* Bear ears */}
                {[-0.06, 0.06].map((ex, i) => (
                    <mesh key={i} position={[0.2 + ex, 1.42, 0]}>
                        <sphereGeometry args={[0.04, 4, 4]} />
                        <meshLambertMaterial color={0xd7a86e} />
                    </mesh>
                ))}
            </group>

            {/* === CHANDELIER (ceiling) === */}
            <group position={[0, 4.5, 0]}>
                <mesh>
                    <cylinderGeometry args={[0.5, 0.3, 0.15, 8]} />
                    <meshPhongMaterial color={0xffd700} />
                </mesh>
                <mesh position={[0, -0.2, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.3, 4]} />
                    <meshLambertMaterial color={0xffd700} />
                </mesh>
                {/* Light bulbs */}
                {[0, 1, 2, 3].map(i => {
                    const angle = (i / 4) * Math.PI * 2
                    return (
                        <mesh key={i} position={[Math.cos(angle) * 0.35, -0.1, Math.sin(angle) * 0.35]}>
                            <sphereGeometry args={[0.06, 4, 4]} />
                            <meshPhongMaterial color={0xffffcc} emissive={0xfff9c4} emissiveIntensity={0.5} />
                        </mesh>
                    )
                })}
            </group>

            {/* Interior warm light */}
            <pointLight position={[0, 3.5, 0]} color={0xfff3e0} intensity={0.6} distance={8} />

            {/* Wall decorations — princess paintings */}
            {/* Back wall painting */}
            <mesh position={[0, 3.0, -2.4]}>
                <boxGeometry args={[1.2, 0.9, 0.05]} />
                <meshLambertMaterial color={0xf8bbd0} />
            </mesh>
            <mesh position={[0, 3.0, -2.38]}>
                <boxGeometry args={[1.0, 0.7, 0.02]} />
                <meshLambertMaterial color={0xfce4ec} />
            </mesh>
            {/* Crown in painting */}
            <mesh position={[0, 3.15, -2.36]}>
                <coneGeometry args={[0.15, 0.15, 5]} />
                <meshLambertMaterial color={0xffd700} />
            </mesh>

            {/* Side wall painting */}
            <mesh position={[-3.45, 3.0, 0]}>
                <boxGeometry args={[0.05, 0.8, 1.0]} />
                <meshLambertMaterial color={0xce93d8} />
            </mesh>
        </group>
    )
}
