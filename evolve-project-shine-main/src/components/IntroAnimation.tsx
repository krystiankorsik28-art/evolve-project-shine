import { useEffect, useState } from "react";

interface IntroAnimationProps {
  onDone: () => void;
}

const SEGMENTS = [
  { d: "M12 2L2 7l10 5 10-5-10-5z", delay: 0 },
  { d: "M2 17l10 5 10-5", delay: 0.15 },
  { d: "M2 12l10 5 10-5", delay: 0.3 },
];

export default function IntroAnimation({ onDone }: IntroAnimationProps) {
  const [phase, setPhase] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("exit"), 800);
    const t2 = setTimeout(() => onDone(), 1200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center bg-[oklch(0.06_0.03_270)]"
      style={{
        opacity: phase === "exit" ? 0 : 1,
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className="relative">
        <div className="absolute inset-0 -m-16 rounded-full bg-accent/10 blur-[80px] animate-pulse" />
        <svg
          viewBox="0 0 24 24"
          className="w-16 h-16 relative"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ color: "oklch(0.85 0.1 200)" }}
        >
          {SEGMENTS.map((seg) => (
            <path
              key={seg.d}
              d={seg.d}
              className="origin-center"
              style={{
                strokeDasharray: 30,
                strokeDashoffset: 30,
                animation: `segDraw 0.5s ${seg.delay}s cubic-bezier(0.16,1,0.3,1) forwards, segGlow 1.2s ${seg.delay}s ease-in-out infinite`,
              }}
            />
          ))}
        </svg>
        <div
          className="absolute inset-0 -m-8"
          style={{
            background: "linear-gradient(90deg, transparent 0%, oklch(0.85 0.1 200 / 0.3) 50%, transparent 100%)",
            filter: "blur(12px)",
            animation: "lightSweep 0.8s 0.4s cubic-bezier(0.45,0,0.55,1) forwards",
            opacity: 0,
          }}
        />
      </div>
      <style>{`
        @keyframes segDraw { to { stroke-dashoffset: 0; } }
        @keyframes segGlow { 0%,100% { filter: drop-shadow(0 0 4px oklch(0.7 0.15 200 / 0.3)); } 50% { filter: drop-shadow(0 0 12px oklch(0.7 0.15 200 / 0.6)); } }
        @keyframes lightSweep { 0% { opacity: 0; transform: translateX(-100%) rotate(-20deg); } 50% { opacity: 1; } 100% { opacity: 0; transform: translateX(200%) rotate(-20deg); } }
      `}</style>
    </div>
  );
}
