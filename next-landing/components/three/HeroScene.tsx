"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function ParticleField({ mouse }: { mouse: { x: number; y: number } }) {
  const count = 2000;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) pos[i] = (Math.random() - 0.5) * 30;
    return pos;
  }, []);

  const colors = useMemo(() => {
    const c = new Float32Array(count * 3);
    const col = new THREE.Color();
    for (let i = 0; i < count; i++) {
      col.setHSL(0.42 + Math.random() * 0.08, 0.8, 0.4 + Math.random() * 0.3);
      c[i * 3] = col.r;
      c[i * 3 + 1] = col.g;
      c[i * 3 + 2] = col.b;
    }
    return c;
  }, []);

  const meshRef = useRef<THREE.Points>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.02 + mouse.x * 0.1;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.015) * 0.1 + mouse.y * 0.1;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} count={count} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.04} vertexColors sizeAttenuation transparent opacity={0.6} />
    </points>
  );
}

function CenterShape() {
  const meshRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.15;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.2;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={1}>
      <mesh ref={meshRef} scale={1.2}>
        <icosahedronGeometry args={[1.5, 0]} />
        <MeshDistortMaterial
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.4}
          roughness={0.2}
          metalness={0.8}
          distort={0.15}
          speed={2}
          transparent
          opacity={0.85}
        />
      </mesh>
    </Float>
  );
}

function GlowRings() {
  const ringRef = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    if (ringRef.current) ringRef.current.rotation.z = state.clock.elapsedTime * 0.05;
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 3, 0, 0]}>
      <ringGeometry args={[2.5, 3, 64]} />
      <meshBasicMaterial color="#22d3ee" transparent opacity={0.08} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function HeroScene() {
  const mouse = useRef({ x: 0, y: 0 });

  return (
    <div
      className="absolute inset-0 -z-10"
      onMouseMove={(e) => {
        mouse.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
        mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
      }}
    >
      <Canvas camera={{ position: [0, 0, 8], fov: 60 }} dpr={[1, 2]}>
        <color attach="background" args={["#020208"]} />
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={0.8} color="#22d3ee" />
        <pointLight position={[-5, -5, 5]} intensity={0.4} color="#06b6d4" />
        <ParticleField mouse={mouse.current} />
        <CenterShape />
        <GlowRings />
        <fog attach="fog" args={["#020208", 8, 20]} />
      </Canvas>
    </div>
  );
}
