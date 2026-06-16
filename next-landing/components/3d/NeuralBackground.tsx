"use client";
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const NODE_COUNT = 60;
const CONNECTION_DIST = 3.5;

export default function NeuralBackground() {
  const groupRef = useRef<THREE.Group>(null);
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, colors, connections } = useMemo(() => {
    const pos = new Float32Array(NODE_COUNT * 3);
    const col = new Float32Array(NODE_COUNT * 3);
    const conn: [number, number][] = [];

    for (let i = 0; i < NODE_COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10;

      const t = Math.random();
      col[i * 3] = 0.2 + t * 0.6;
      col[i * 3 + 1] = 0.7 + t * 0.2;
      col[i * 3 + 2] = 0.8 + t * 0.1;
    }

    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        if (dx * dx + dy * dy + dz * dz < CONNECTION_DIST * CONNECTION_DIST) {
          conn.push([i, j]);
        }
      }
    }

    return { positions: pos, colors: col, connections: conn };
  }, []);

  const lineGeom = useMemo(() => {
    const verts: number[] = [];
    for (const [a, b] of connections) {
      verts.push(
        positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2],
        positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]
      );
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.Float32BufferAttribute(verts, 3));
    return geom;
  }, [positions, connections]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      const time = clock.getElapsedTime();
      const positionsAttrib = pointsRef.current.geometry.attributes.position;
      const array = positionsAttrib.array as Float32Array;
      for (let i = 0; i < NODE_COUNT; i++) {
        array[i * 3 + 1] += Math.sin(time * 0.3 + i * 0.5) * 0.002;
        array[i * 3] += Math.cos(time * 0.2 + i * 0.7) * 0.002;
      }
      positionsAttrib.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={NODE_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={NODE_COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.15}
          vertexColors
          transparent
          opacity={0.8}
          sizeAttenuation
          blending={THREE.AdditiveBlending}
        />
      </points>
      <lineSegments geometry={lineGeom}>
        <lineBasicMaterial
          color="#22d3ee"
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
    </group>
  );
}
