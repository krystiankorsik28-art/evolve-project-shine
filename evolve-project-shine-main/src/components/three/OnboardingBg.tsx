"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function FloatingShapes() {
  const count = 20;
  const shapes = useMemo(() => {
    const s: { pos: [number, number, number]; rotSpeed: number; scale: number; type: string; color: string }[] = [];
    const colors = ["#00ff88", "#4488ff", "#8844ff", "#ff4488"];
    for (let i = 0; i < count; i++) {
      s.push({
        pos: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 15 - 5],
        rotSpeed: 0.2 + Math.random() * 0.5,
        scale: 0.3 + Math.random() * 0.8,
        type: ["icosahedron", "octahedron", "dodecahedron", "torus"][Math.floor(Math.random() * 4)],
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
    return s;
  }, []);

  return (
    <>
      {shapes.map((s, i) => (
        <Float key={i} speed={s.rotSpeed * 0.3} rotationIntensity={0.3} floatIntensity={0.5}>
          <mesh position={s.pos} scale={s.scale}>
            {s.type === "icosahedron" && <icosahedronGeometry args={[1, 0]} />}
            {s.type === "octahedron" && <octahedronGeometry args={[1, 0]} />}
            {s.type === "dodecahedron" && <dodecahedronGeometry args={[1, 0]} />}
            {s.type === "torus" && <torusGeometry args={[0.8, 0.3, 16, 32]} />}
            <MeshDistortMaterial
              color={s.color}
              transparent
              opacity={0.08}
              wireframe
              distort={0.2 + Math.random() * 0.3}
              speed={1 + Math.random() * 2}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function ParticleField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 2000;
  const positions = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 40;
      p[i * 3 + 1] = (Math.random() - 0.5) * 30;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20 - 5;
    }
    return p;
  }, []);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.005;
      ref.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.003) * 0.05;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute args={[positions, 3]} attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#00ff88" transparent opacity={0.15} sizeAttenuation />
    </points>
  );
}

export function OnboardingBg() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 12], fov: 75 }} gl={{ antialias: false, alpha: true }} dpr={[1, 1.5]}>
        <color attach="background" args={["#000"]} />
        <ParticleField />
        <FloatingShapes />
      </Canvas>
    </div>
  );
}
