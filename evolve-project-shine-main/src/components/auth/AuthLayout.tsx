import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";

const trustItems = [
  "End-to-end encryption",
  "GDPR / RODO compliant",
  "EU-based servers",
  "99.9% uptime",
];

function GradientOrb({ index, size, x, y, color }: { index: number; size: number; x: string; y: string; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        width: size, height: size, left: x, top: y,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        filter: "blur(80px)",
      }}
      animate={{
        x: [0, 30, -20, 0], y: [0, -25, 15, 0], scale: [1, 1.1, 0.95, 1],
      }}
      transition={{ duration: 10 + index * 3, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

function AuthParticles() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: 15 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: 2 + Math.random() * 3, height: 2 + Math.random() * 3,
            left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
            background: `oklch(0.7 0.15 ${200 + Math.random() * 60} / ${0.05 + Math.random() * 0.15})`,
            boxShadow: `0 0 ${(2 + Math.random() * 3) * 3}px oklch(0.7 0.15 200 / 0.05)`,
          }}
          animate={{
            y: [0, (Math.random() - 0.5) * 40, 0],
            opacity: [0, 0.4 + Math.random() * 0.3, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + Math.random() * 4, repeat: Infinity,
            delay: Math.random() * 3, ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function GridBg({ opacity = 0.015 }: { opacity?: number }) {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: `
          linear-gradient(oklch(1 0 0 / ${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, oklch(1 0 0 / ${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: "60px 60px",
      }}
    />
  );
}

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex" style={{ background: "oklch(0.035 0.02 270)" }}>
      <div className="fixed inset-0 pointer-events-none">
        <GradientOrb index={0} size={600} x="-15%" y="-10%" color="oklch(0.7 0.15 200 / 0.04)" />
        <GradientOrb index={1} size={500} x="60%" y="40%" color="oklch(0.6 0.2 240 / 0.04)" />
        <GradientOrb index={2} size={400} x="30%" y="70%" color="oklch(0.65 0.2 280 / 0.03)" />
        <GridBg />
        <AuthParticles />
      </div>

      <div className="hidden lg:flex w-[40%] relative flex-col justify-between p-12 z-10">
        <div
          className="absolute inset-4 rounded-3xl pointer-events-none"
          style={{
            background: "linear-gradient(135deg, oklch(0.08 0.03 270 / 0.6), oklch(0.04 0.02 270 / 0.4))",
            border: "1px solid oklch(1 0 0 / 0.06)",
            backdropFilter: "blur(24px)",
          }}
        />
        <div
          className="absolute inset-4 rounded-3xl pointer-events-none opacity-40"
          style={{
            background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.08), transparent 50%)",
            zIndex: -1,
          }}
        />

        <div className="relative px-6 pt-6">
          <Link to="/" className="flex items-center gap-2.5 mb-12">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.9), oklch(0.6 0.2 240 / 0.9))",
                boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
              }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">EduNex</span>
          </Link>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight mb-4 leading-[1.05]">
              <span className="text-white">{title}</span>
            </h2>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "oklch(1 0 0 / 0.45)" }}>
              {subtitle}
            </p>
          </div>
        </div>

        <div className="relative px-6 pb-6">
          <div className="space-y-3">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                <Shield className="w-3.5 h-3.5 shrink-0" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 text-xs" style={{ color: "oklch(1 0 0 / 0.2)" }}>
            &copy; 2026 EduNex. All rights reserved.
          </div>
        </div>
      </div>

      <div className="w-full lg:w-[60%] flex items-center justify-center p-4 sm:p-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
          className="relative w-full max-w-md rounded-3xl p-8 sm:p-10"
          style={{
            background: "linear-gradient(135deg, oklch(0.08 0.03 270 / 0.6), oklch(0.04 0.02 270 / 0.4))",
            border: "1px solid oklch(1 0 0 / 0.06)",
            backdropFilter: "blur(24px)",
          }}
        >
          <div
            className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-30"
            style={{
              background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.1), transparent 40%, transparent 60%, oklch(0.7 0.15 200 / 0.1))",
              zIndex: -1,
            }}
          />

          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.9), oklch(0.6 0.2 240 / 0.9))" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-semibold text-white">EduNex</span>
            </Link>
          </div>

          {children}
        </motion.div>
      </div>
    </div>
  );
}
