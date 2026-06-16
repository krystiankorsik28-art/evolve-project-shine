"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { TorusGeometry, IcosahedronGeometry, Mesh, type Group } from "three";

const SHAPES: {
  position: [number, number, number];
  speed: number;
  scale: number;
}[] = [
  { position: [-4, 2, -3], speed: 0.2, scale: 0.6 },
  { position: [5, -1.5, -2], speed: -0.15, scale: 0.8 },
  { position: [-3, -3, -4], speed: 0.25, scale: 0.5 },
  { position: [4.5, 3.5, -5], speed: -0.3, scale: 0.7 },
];

export default function FloatingGeometry() {
  const groupRef = useRef<Group>(null);
  const meshRefs = useRef<(Mesh | null)[]>([]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.x = t * SHAPES[i].speed;
        mesh.rotation.y = t * SHAPES[i].speed * 1.5;
        mesh.position.y = SHAPES[i].position[1] + Math.sin(t * 0.3 + i * 2) * 0.3;
      }
    });
  });

  return (
    <group ref={groupRef}>
      {SHAPES.map((s, i) => (
        <mesh
          key={i}
          ref={(el) => { meshRefs.current[i] = el; }}
          position={s.position}
          scale={s.scale}
        >
          {i % 2 === 0 ? (
            <torusGeometry args={[1, 0.3, 16, 32]} />
          ) : (
            <icosahedronGeometry args={[1, 1]} />
          )}
          <meshStandardMaterial
            color={i % 2 === 0 ? "#22d3ee" : "#60a5fa"}
            transparent
            opacity={0.15}
            wireframe
          />
        </mesh>
      ))}
    </group>
  );
}
