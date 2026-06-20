"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface EntrySceneProps {
  onComplete?: () => void;
  skipable?: boolean;
}

const PHASES = [
  { label: "Initializing", duration: 400 },
  { label: "Preparing", duration: 500 },
  { label: "Almost ready", duration: 400 },
  { label: "Complete", duration: 200 },
];

const floatKeyframes = {
  hidden: { opacity: 0, scale: 0.9, filter: "blur(8px)" },
  visible: { opacity: 1, scale: 1, filter: "blur(0px)" },
};

function Particle({ index }: { index: number }) {
  const size = 2 + Math.random() * 4;
  const x = Math.random() * 100;
  const y = Math.random() * 100;
  const delay = Math.random() * 3;
  const duration = 3 + Math.random() * 4;
  const drift = (Math.random() - 0.5) * 30;

  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: `oklch(0.7 0.15 ${200 + Math.random() * 60} / ${0.1 + Math.random() * 0.2})`,
        boxShadow: `0 0 ${size * 3}px oklch(0.7 0.15 200 / ${0.05 + Math.random() * 0.1})`,
      }}
      animate={{
        y: [0, drift, 0],
        opacity: [0, 0.6, 0],
        scale: [1, 1.3, 1],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
    />
  );
}

function GradientOrb({ index, size, x, y, color }: { index: number; size: number; x: string; y: string; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(60px)",
      }}
      animate={{
        x: [0, 20, -10, 0],
        y: [0, -15, 10, 0],
        scale: [1, 1.1, 0.95, 1],
      }}
      transition={{
        duration: 8 + index * 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(oklch(1 0 0 / 0.02) 1px, transparent 1px),
            linear-gradient(90deg, oklch(1 0 0 / 0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function LogoAnimation() {
  return (
    <motion.div
      variants={floatKeyframes}
      initial="hidden"
      animate="visible"
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="relative"
    >
      <div
        className="absolute inset-0 -m-12 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, oklch(0.7 0.15 200 / 0.12) 0%, transparent 60%)",
          filter: "blur(20px)",
        }}
      />
      <div
        className="relative w-20 h-20 rounded-2xl flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, oklch(0.15 0.05 270 / 0.8), oklch(0.08 0.03 270 / 0.6))",
          border: "1px solid oklch(1 0 0 / 0.08)",
          backdropFilter: "blur(20px)",
          boxShadow: "0 0 40px oklch(0.7 0.15 200 / 0.15)",
        }}
      >
        <svg viewBox="0 0 24 24" className="w-10 h-10" fill="none" stroke="oklch(0.75 0.15 200)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5z"/>
          <path d="M2 17l10 5 10-5"/>
          <path d="M2 12l10 5 10-5"/>
        </svg>
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.15), transparent 50%)",
          }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}

function PhaseIndicator({ phase, total }: { phase: number; total: number }) {
  const progress = (phase + 1) / total;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-2 rounded-full"
      style={{
        background: "oklch(1 0 0 / 0.04)",
        border: "1px solid oklch(1 0 0 / 0.06)",
        backdropFilter: "blur(12px)",
      }}
    >
      <div className="relative w-4 h-4">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ border: "2px solid oklch(0.7 0.15 200 / 0.3)" }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <motion.div
            className="absolute top-[-1px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
            style={{ background: "oklch(0.7 0.15 200)" }}
          />
        </motion.div>
      </div>
      <span className="text-[10px] font-medium tracking-widest uppercase" style={{ color: "oklch(1 0 0 / 0.5)" }}>
        {PHASES[phase]?.label ?? "Loading"}
      </span>
      <div className="flex gap-1 ml-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-500"
            style={{
              background: i <= phase ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.1)",
              boxShadow: i <= phase ? "0 0 6px oklch(0.7 0.15 200 / 0.5)" : "none",
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function EntryScene({ onComplete, skipable = true }: EntrySceneProps) {
  const [phase, setPhase] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [ready, setReady] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => { setReady(true); }, []);

  useEffect(() => {
    if (!ready || completed) return;
    const totalMs = PHASES.reduce((a, p) => a + p.duration, 0);
    let elapsed = 0;
    for (let i = 0; i < PHASES.length; i++) {
      const t = setTimeout(() => setPhase(i), elapsed);
      elapsed += PHASES[i].duration;
    }
    const finishT = setTimeout(() => {
      setPhase(PHASES.length - 1);
      setFadeOut(true);
      setTimeout(() => {
        setCompleted(true);
        onComplete?.();
      }, 500);
    }, totalMs);
    return () => { clearTimeout(finishT); };
  }, [ready, completed, onComplete]);

  const skip = () => {
    if (!skipable || completed) return;
    setCompleted(true);
    setFadeOut(true);
    setTimeout(() => onComplete?.(), 300);
  };

  if (!ready) return null;

  return (
    <AnimatePresence>
      {!completed && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: "oklch(0.04 0.02 270)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          onClick={skip}
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <GradientOrb index={0} size={500} x="-10%" y="-10%" color="oklch(0.7 0.15 200 / 0.04)" />
            <GradientOrb index={1} size={400} x="60%" y="20%" color="oklch(0.6 0.2 240 / 0.04)" />
            <GradientOrb index={2} size={350} x="30%" y="60%" color="oklch(0.65 0.2 280 / 0.03)" />
            <GridBackground />
            {Array.from({ length: 20 }).map((_, i) => (
              <Particle key={i} index={i} />
            ))}
          </div>

          <motion.div
            className="relative flex flex-col items-center gap-8"
            animate={fadeOut ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          >
            <LogoAnimation />
            <PhaseIndicator phase={phase} total={PHASES.length} />
          </motion.div>

          {skipable && (
            <motion.div
              className="absolute bottom-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
            >
              <span className="text-[10px] tracking-wider" style={{ color: "oklch(1 0 0 / 0.2)" }}>
                Click anywhere to skip
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
