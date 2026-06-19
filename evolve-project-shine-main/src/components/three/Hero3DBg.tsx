import { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing";
import * as THREE from "three";

const PARTICLE_COUNT = 1200;
const CONNECTION_COUNT = 300;
const CONNECT_DIST = 4;

function ParticleSystem({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const lines = useRef<THREE.LineSegments>(null);

  const { positions, colors, linePositions, lineColors } = useMemo(() => {
    const pos = new Float32Array(PARTICLE_COUNT * 3);
    const col = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 6 * Math.cbrt(Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      pos[i * 3 + 2] = r * Math.cos(phi);
      const t = Math.random();
      col[i * 3] = 0.2 + t * 0.4;
      col[i * 3 + 1] = 0.6 + t * 0.3;
      col[i * 3 + 2] = 0.9 + t * 0.1;
    }

    const lpos: number[] = [];
    const lcol: number[] = [];
    for (let i = 0; i < CONNECTION_COUNT; i++) {
      const a = Math.floor(Math.random() * PARTICLE_COUNT);
      const b = Math.floor(Math.random() * PARTICLE_COUNT);
      const ax = pos[a * 3], ay = pos[a * 3 + 1], az = pos[a * 3 + 2];
      const bx = pos[b * 3], by = pos[b * 3 + 1], bz = pos[b * 3 + 2];
      const dist = Math.sqrt((ax - bx) ** 2 + (ay - by) ** 2 + (az - bz) ** 2);
      if (dist > CONNECT_DIST) continue;
      lpos.push(ax, ay, az, bx, by, bz);
      const alpha = 1 - dist / CONNECT_DIST;
      lcol.push(0.3, 0.7, 1, alpha * 0.3, 0.3, 0.7, 1, alpha * 0.3);
    }

    return {
      positions: pos,
      colors: col,
      linePositions: new Float32Array(lpos),
      lineColors: new Float32Array(lcol),
    };
  }, []);

  const mouseTarget = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!group.current || !points.current || !lines.current) return;

    mouseTarget.current.x = mouse.current.x * 0.3;
    mouseTarget.current.y = mouse.current.y * 0.3;

    currentPos.current.x += (mouseTarget.current.x - currentPos.current.x) * delta * 2;
    currentPos.current.y += (mouseTarget.current.y - currentPos.current.y) * delta * 2;

    group.current.rotation.x += delta * 0.02;
    group.current.rotation.y += delta * 0.03;

    group.current.position.x = currentPos.current.x * 0.5;
    group.current.position.y = currentPos.current.y * 0.5;

    const positionsAttr = (points.current.geometry as THREE.BufferGeometry).attributes.position;
    const array = positionsAttr.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      array[i3 + 1] += Math.sin(Date.now() * 0.001 + i) * 0.002;
    }
    positionsAttr.needsUpdate = true;
  });

  return (
    <group ref={group}>
      <points ref={points}>
        <bufferGeometry>
          <bufferAttribute
            args={[positions, 3]}
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            args={[colors, 3]}
            attach="attributes-color"
            count={PARTICLE_COUNT}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.8}
          blending={THREE.AdditiveBlending}
          sizeAttenuation
          depthWrite={false}
        />
      </points>
      <lineSegments ref={lines}>
        <bufferGeometry>
          <bufferAttribute
            args={[linePositions, 3]}
            attach="attributes-position"
            count={linePositions.length / 3}
            array={linePositions}
            itemSize={3}
          />
          <bufferAttribute
            args={[lineColors, 4]}
            attach="attributes-color"
            count={lineColors.length / 4}
            array={lineColors}
            itemSize={4}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  );
}

function FloatingShape() {
  const mesh = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  useFrame((_, delta) => {
    if (!mesh.current) return;
    mesh.current.rotation.x += delta * 0.15;
    mesh.current.rotation.y += delta * 0.2;
    mesh.current.position.y += Math.sin(Date.now() * 0.0005) * 0.003;
  });

  return (
    <mesh ref={mesh} position={[-2.5, 1.5, -3]}>
      <torusKnotGeometry args={[0.4, 0.15, 64, 8]} />
      <meshPhysicalMaterial
        color="oklch(0.7 0.15 200)"
        metalness={0.3}
        roughness={0.1}
        transparent
        opacity={0.15}
        wireframe
      />
    </mesh>
  );
}

function GlowAura({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  const mesh = useRef<THREE.Mesh>(null);
  const currentPos = useRef({ x: 0, y: 0 });

  useFrame((_, delta) => {
    if (!mesh.current) return;
    const tx = mouse.current.x * 2;
    const ty = mouse.current.y * 1.5;
    currentPos.current.x += (tx - currentPos.current.x) * delta * 1.5;
    currentPos.current.y += (ty - currentPos.current.y) * delta * 1.5;
    mesh.current.position.x = currentPos.current.x;
    mesh.current.position.y = currentPos.current.y;
  });

  return (
    <mesh ref={mesh} position={[0, 0, -4]}>
      <planeGeometry args={[8, 8]} />
      <meshBasicMaterial
        color="oklch(0.7 0.15 200)"
        transparent
        opacity={0.04}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </mesh>
  );
}

function Scene({ mouse }: { mouse: React.MutableRefObject<{ x: number; y: number }> }) {
  return (
    <>
      <ParticleSystem mouse={mouse} />
      <FloatingShape />
      <GlowAura mouse={mouse} />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.2}
          luminanceSmoothing={0.9}
          intensity={0.4}
          mipmapBlur
        />
        <ChromaticAberration offset={[0.001, 0.001]} />
      </EffectComposer>
    </>
  );
}

export default function Hero3DBg() {
  const mouse = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouse.current.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    mouse.current.y = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      onPointerMove={handlePointerMove}
      style={{ touchAction: "none" }}
    >
      <Canvas
        dpr={[1, 1.5]}
        frameloop="demand"
        performance={{ min: 0.5 }}
        camera={{ position: [0, 0, 6], fov: 60 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        style={{ pointerEvents: "none" }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
}
