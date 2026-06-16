"use client";
import { Canvas } from "@react-three/fiber";
import { useRef, useMemo, useCallback } from "react";
import { useScroll } from "framer-motion";
import * as THREE from "three";
import NeuralBackground from "./NeuralBackground";
import FloatingGeometry from "./FloatingGeometry";

function SceneContent({ scrollY }: { scrollY: number }) {
  const groupRef = useRef<THREE.Group>(null);

  useMemo(() => {
    if (groupRef.current) {
      groupRef.current.rotation.x = scrollY * 0.3;
      groupRef.current.rotation.y = scrollY * 0.1;
    }
  }, [scrollY]);

  return (
    <group ref={groupRef}>
      <NeuralBackground />
      <FloatingGeometry />
    </group>
  );
}

export default function Scene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 12], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <SceneContent scrollY={scrollY.get()} />
      </Canvas>
    </div>
  );
}
