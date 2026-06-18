"use client";
import { useRef, useMemo, useEffect, useCallback, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom, ChromaticAberration, Noise } from "@react-three/postprocessing";
import * as THREE from "three";
import { BlendFunction } from "postprocessing";

const vertexShader = `
uniform float uProgress;
uniform float uTime;
uniform float uGlitch;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
attribute vec3 aTarget;
attribute float aDelay;
attribute float aSize;
attribute float aPhase;
varying vec3 vColor;
varying float vAlpha;
void main() {
  float t = clamp((uProgress - aDelay) / max(1.0 - aDelay, 0.001), 0.0, 1.0);
  t = t * t * (3.0 - 2.0 * t);
  float burstPhase = sin(aPhase * 6.28 + uTime * 2.0) * 0.5 + 0.5;
  float burstRadius = 15.0 + burstPhase * 10.0;
  vec3 burstDir = normalize(position);
  if (length(position) < 0.01) burstDir = normalize(vec3(1.0, 0.0, 0.0));
  vec3 burstPos = burstDir * burstRadius * (1.0 - t);
  vec3 pos = mix(burstPos, aTarget, t);
  float glitchStrength = uGlitch * (1.0 - t) * 2.0;
  if (glitchStrength > 0.1 && fract(aPhase * 10.0 + uTime * 20.0) < 0.3) {
    pos.x += sin(pos.y * 50.0 + uTime * 30.0) * glitchStrength * 0.5;
    pos.y += cos(pos.z * 50.0 + uTime * 25.0) * glitchStrength * 0.5;
  }
  float size = aSize * (0.3 + (1.0 - t) * 2.0 + sin(uTime * 3.0 + aPhase * 10.0) * 0.3);
  vec3 col1 = mix(uColor1, uColor2, sin(aPhase * 6.28) * 0.5 + 0.5);
  vColor = mix(col1, uColor3, t);
  vAlpha = 0.6 + 0.4 * t;
  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
  gl_PointSize = size * (400.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;
const fragmentShader = `
varying vec3 vColor;
varying float vAlpha;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float alpha = smoothstep(0.5, 0.0, d) * vAlpha;
  float glow = exp(-d * 8.0) * 0.5;
  gl_FragColor = vec4(vColor, alpha + glow);
}
`;

function generateLogoPositions(count: number): Float32Array {
  const pos = new Float32Array(count * 3);
  const ico = new THREE.IcosahedronGeometry(3.5, 1);
  const icoPos = ico.attributes.position.array;
  const torus = new THREE.TorusKnotGeometry(4.5, 1.2, 64, 16);
  const torusPos = torus.attributes.position.array;
  const ring = new THREE.TorusGeometry(6, 0.15, 32, 64);
  const ringPos = ring.attributes.position.array;
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let base: Float32Array;
    let scale = 1;
    if (r < 0.4) { base = icoPos as unknown as Float32Array; scale = 1.2; }
    else if (r < 0.75) { base = torusPos as unknown as Float32Array; scale = 1; }
    else { base = ringPos as unknown as Float32Array; scale = 0.8; }
    const idx = Math.floor(Math.random() * (base.length / 3)) * 3;
    const j = 0.15;
    pos[i * 3] = (base[idx] + (Math.random() - 0.5) * j) * scale;
    pos[i * 3 + 1] = (base[idx + 1] + (Math.random() - 0.5) * j) * scale;
    pos[i * 3 + 2] = (base[idx + 2] + (Math.random() - 0.5) * j) * scale;
  }
  return pos;
}

function ParticleSystem({ progress, glitch }: { progress: number; glitch: number }) {
  const count = 30000;
  const data = useMemo(() => {
    const p = new Float32Array(count * 3);
    const t = generateLogoPositions(count);
    const d = new Float32Array(count);
    const s = new Float32Array(count);
    const ph = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const radius = 0.3 + Math.random() * 0.5;
      p[i * 3] = Math.sin(phi) * Math.cos(theta) * radius;
      p[i * 3 + 1] = Math.sin(phi) * Math.sin(theta) * radius;
      p[i * 3 + 2] = Math.cos(phi) * radius;
      d[i] = Math.random() * 0.6;
      s[i] = 0.5 + Math.random() * 1.5;
      ph[i] = Math.random();
    }
    return { positions: p, targets: t, delays: d, sizes: s, phases: ph };
  }, []);

  const uniforms = useMemo(() => ({
    uProgress: { value: 0 },
    uTime: { value: 0 },
    uGlitch: { value: 0 },
    uColor1: { value: new THREE.Color(0x00ff88) },
    uColor2: { value: new THREE.Color(0x4488ff) },
    uColor3: { value: new THREE.Color(0x8844ff) },
  }), []);

  useFrame((_, delta) => {
    uniforms.uTime.value += delta * 0.8;
    uniforms.uProgress.value += (progress - uniforms.uProgress.value) * 0.05;
    uniforms.uGlitch.value += (glitch - uniforms.uGlitch.value) * 0.1;
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[data.positions, 3]} count={count} array={data.positions} itemSize={3} />
        <bufferAttribute attach="attributes-aTarget" args={[data.targets, 3]} count={count} array={data.targets} itemSize={3} />
        <bufferAttribute attach="attributes-aDelay" args={[data.delays, 1]} count={count} array={data.delays} itemSize={1} />
        <bufferAttribute attach="attributes-aSize" args={[data.sizes, 1]} count={count} array={data.sizes} itemSize={1} />
        <bufferAttribute attach="attributes-aPhase" args={[data.phases, 1]} count={count} array={data.phases} itemSize={1} />
      </bufferGeometry>
      <shaderMaterial uniforms={uniforms} vertexShader={vertexShader} fragmentShader={fragmentShader} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

function GlitchOverlay({ intensity }: { intensity: number }) {
  const uniforms = useMemo(() => ({ uIntensity: { value: 0 }, uTime: { value: 0 } }), []);
  useFrame((_, delta) => {
    uniforms.uTime.value += delta;
    uniforms.uIntensity.value += (intensity - uniforms.uIntensity.value) * 0.08;
  });
  return (
    <mesh scale={[100, 100, 1]}>
      <planeGeometry />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`}
        fragmentShader={`uniform float uIntensity; uniform float uTime; varying vec2 vUv;
          void main() {
            float n = fract(sin(dot(vUv + uTime * 0.1, vec2(12.9898, 78.233))) * 43758.5453);
            float scan = sin(vUv.y * 500.0 + uTime * 30.0) * 0.5 + 0.5;
            float bar = step(0.995, scan) * uIntensity;
            float grain = step(0.98, n) * uIntensity * 0.5;
            float alpha = max(bar, grain) * uIntensity;
            gl_FragColor = vec4(mix(vec3(0.0, 1.0, 0.53), vec3(1.0), bar), alpha * 0.8);
          }`}
        transparent depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function LogoShape({ show }: { show: boolean }) {
  const icoRef = useRef<THREE.Mesh>(null!);
  const torusRef = useRef<THREE.Mesh>(null!);
  const timeRef = useRef(0);
  useFrame((state, delta) => {
    timeRef.current += delta;
    const s = Math.min(timeRef.current * 0.8, 1);
    if (icoRef.current) {
      icoRef.current.rotation.x += delta * 0.2;
      icoRef.current.rotation.y += delta * 0.4;
      icoRef.current.scale.setScalar(s);
    }
    if (torusRef.current) {
      torusRef.current.rotation.x += delta * 0.15;
      torusRef.current.rotation.z += delta * 0.2;
      torusRef.current.scale.setScalar(s);
    }
  });
  return (
    <group visible={show}>
      <mesh ref={icoRef}><icosahedronGeometry args={[2.5, 0]} /><meshBasicMaterial color="#00ff88" wireframe transparent opacity={0.3} /></mesh>
      <mesh ref={torusRef}><torusKnotGeometry args={[3.8, 1, 64, 16]} /><meshBasicMaterial color="#4488ff" wireframe transparent opacity={0.2} /></mesh>
    </group>
  );
}

function SceneContent({ onPhaseChange }: { onPhaseChange: (p: number) => void }) {
  const [phase, setPhase] = useState(0);
  const phaseRef = useRef(0);
  const timeRef = useRef(0);
  useEffect(() => { onPhaseChange(phase); }, [phase, onPhaseChange]);
  useFrame((_, delta) => {
    timeRef.current += delta;
    let newPhase = 0;
    const t = timeRef.current;
    if (t < 0.3) newPhase = 0;
    else if (t < 0.6) newPhase = 1;
    else if (t < 1.5) newPhase = 2;
    else if (t < 2.8) newPhase = 3;
    else newPhase = 4;
    if (newPhase !== phaseRef.current) { phaseRef.current = newPhase; setPhase(newPhase); }
  });
  const c = [
    () => ({ progress: 0, glitch: 0, showLogo: false }),
    () => ({ progress: 0, glitch: 1, showLogo: false }),
    () => ({ progress: (timeRef.current - 0.6) / 0.9, glitch: Math.max(0, 1 - (timeRef.current - 0.6) * 3), showLogo: false }),
    () => ({ progress: 1, glitch: 0, showLogo: true }),
    () => ({ progress: 1, glitch: 0, showLogo: true }),
  ];
  const state = c[Math.min(phase, 4)]();
  return (
    <>
      <ParticleSystem progress={Math.min(state.progress, 1)} glitch={state.glitch} />
      <GlitchOverlay intensity={state.glitch} />
      <LogoShape show={state.showLogo} />
    </>
  );
}

interface EntrySceneProps {
  onComplete?: () => void;
  skipable?: boolean;
}

export function EntryScene({ onComplete, skipable = true }: EntrySceneProps) {
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    if (phase >= 4) {
      setFadeOut(true);
      const t = setTimeout(() => onComplete?.(), 600);
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);
  const handleSkip = useCallback(() => { if (skipable) setPhase(4); }, [skipable]);
  if (!ready) return null;
  return (
    <div className="fixed inset-0 z-[9999] bg-black" style={{ opacity: fadeOut ? 0 : 1, transition: "opacity 0.6s ease-out", pointerEvents: fadeOut ? "none" : "auto", cursor: skipable ? "pointer" : "default" }} onClick={handleSkip}>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
          <span className="text-[10px] text-fg-muted tracking-widest uppercase">{phase < 2 ? "Initializing" : phase < 4 ? "Rendering" : "Complete"}</span>
        </div>
      </div>
      {skipable && <div className="absolute top-8 right-8 z-10 pointer-events-none"><span className="text-[10px] text-fg-subtle tracking-wider">Click anywhere to skip</span></div>}
      <Canvas camera={{ position: [0, 0, 12], fov: 60 }} gl={{ antialias: false, alpha: false }} dpr={[1, 1.5]} style={{ background: "#000" }}>
        <SceneContent onPhaseChange={setPhase} />
        <EffectComposer>
          <Bloom intensity={1.0} luminanceThreshold={0.1} luminanceSmoothing={0.9} mipmapBlur />
          <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new THREE.Vector2(0.002, 0.002)} />
          <Noise blendFunction={BlendFunction.OVERLAY} opacity={0.04} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
