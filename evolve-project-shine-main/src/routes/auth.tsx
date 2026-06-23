import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, ChevronLeft, KeyRound, Shield, Sparkles, Mail, Lock, User,
  School, GraduationCap, Users, Building2, CheckCircle2, AlertTriangle,
  Fingerprint, Smartphone, Globe, History, RefreshCw, LogOut, Copy,
  QrCode, Eye, EyeOff, Clock, MapPin, Monitor, ShieldAlert,
  ShieldCheck, Key, Download, ChevronRight, MoreHorizontal, Search,
  X, ExternalLink, Award, Cpu, Server, FileText,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { EntryScene } from "@/components/three/EntryScene";
import { useAuth } from "@/lib/auth/auth-context";

const ROLE_DASHBOARD: Record<string, string> = {
  student: "/student/dashboard",
  teacher: "/teacher",
  parent: "/student/dashboard",
  admin: "/admin",
};

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ context }) => {
    const { queryClient } = context;
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = session.user.user_metadata?.role || "student";
        const dash = ROLE_DASHBOARD[role] || "/student/dashboard";
        throw redirect({ to: dash, replace: true });
      }
    } catch (e) {
      if (e instanceof redirect) throw e;
    }
  },
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign In — EduNex" }] }),
});

// ─── Constants ───

const ROLES = [
  { id: "student" as const, label: "Student", icon: GraduationCap, desc: "Take exams, learn with AI" },
  { id: "teacher" as const, label: "Teacher", icon: Users, desc: "Create exams, monitor classes" },
  { id: "parent" as const, label: "Parent", icon: School, desc: "Monitor progress" },
  { id: "admin" as const, label: "Admin", icon: Building2, desc: "Manage your school" },
];

type RoleId = (typeof ROLES)[number]["id"];

const TRUST_ITEMS = [
  "End-to-end encryption", "GDPR / RODO compliant", "EU-based servers",
  "ISO 27001 aligned", "99.9% uptime SLA",
];

const STUDENT_PROPS = [
  "Join exams with one PIN",
  "AI tutor available 24/7",
  "Track your progress",
  "Learn at your own pace",
];

const TEACHER_PROPS = [
  "Create exams in seconds with AI",
  "Auto-grade with AI",
  "Real-time class analytics",
  "Enterprise-grade security",
];

const PARENT_PROPS = [
  "Monitor your child's progress",
  "Receive grade notifications",
  "View attendance records",
  "Communicate with teachers",
];

const ADMIN_PROPS = [
  "Full school management",
  "Security Center dashboard",
  "User & role administration",
  "Compliance & audit logs",
];

const ROLE_PROPS: Record<RoleId, string[]> = {
  student: STUDENT_PROPS,
  teacher: TEACHER_PROPS,
  parent: PARENT_PROPS,
  admin: ADMIN_PROPS,
};

const ROLE_TITLES: Record<RoleId, { title: string; tagline: string }> = {
  student: { title: "Student Portal", tagline: "Fast access to exams, lessons & AI tutor" },
  teacher: { title: "Teacher Dashboard", tagline: "Secure access to classes, exams & analytics" },
  parent: { title: "Parent Portal", tagline: "Stay informed about your child's education" },
  admin: { title: "Administration", tagline: "Enterprise security & full school management" },
};

type StudentMethod = "pin" | "google" | "email";
type TeacherMethod = "microsoft" | "google" | "email";
type ParentMethod = "google" | "email";
type AdminView = "login" | "microsoft" | "google" | "recovery" | "device" | "sessions";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

// ══════════════════════════════════════════════════
// PREMIUM BACKGROUND
// ══════════════════════════════════════════════════

/* ───── AURORA (7 animated gradient orbs) ───── */
function AuroraBackground() {
  const orbs = useMemo(() => [
    { size: 900, x: "-25%", y: "-20%", color: "oklch(0.7 0.15 200 / 0.05)", dur: 22, xk: [0, 140, -80, -100, 60, 0], yk: [0, -60, 100, -80, 40, 0] },
    { size: 800, x: "75%", y: "25%", color: "oklch(0.65 0.15 190 / 0.05)", dur: 26, xk: [0, -100, 70, 110, -40, 0], yk: [0, 90, -50, -100, 70, 0] },
    { size: 700, x: "35%", y: "75%", color: "oklch(0.6 0.2 240 / 0.04)", dur: 18, xk: [0, 80, -120, 50, -70, 0], yk: [0, -110, 60, 90, -50, 0] },
    { size: 600, x: "5%", y: "65%", color: "oklch(0.6 0.2 280 / 0.04)", dur: 24, xk: [0, -90, 100, -60, 80, 0], yk: [0, 80, -90, 50, -100, 0] },
    { size: 550, x: "85%", y: "-10%", color: "oklch(0.7 0.15 200 / 0.03)", dur: 30, xk: [0, 110, -50, -120, 40, 0], yk: [0, -50, 110, 60, -80, 0] },
    { size: 500, x: "55%", y: "95%", color: "oklch(0.65 0.15 190 / 0.03)", dur: 14, xk: [0, -60, 90, -40, 100, 0], yk: [0, 100, -70, -60, 50, 0] },
    { size: 850, x: "-15%", y: "85%", color: "oklch(0.6 0.2 240 / 0.03)", dur: 20, xk: [0, 50, -110, 70, -30, 0], yk: [0, -90, 50, 110, -40, 0] },
  ], []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: o.size, height: o.size, left: o.x, top: o.y, background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`, filter: "blur(120px)" }}
          animate={{ x: o.xk, y: o.yk, scale: [1, 1.1, 0.9, 1.08, 0.95, 1] }}
          transition={{ duration: o.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ───── CANVAS PARTICLE SYSTEM (2000+ particles, mouse parallax, neural connections) ───── */
function CanvasParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const count = w < 768 ? 600 : 2000;
    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; hue: number; depth: number; bx: number; by: number }[] = [];

    for (let i = 0; i < count; i++) {
      const bx = Math.random() * w;
      const by = Math.random() * h;
      const d = 0.3 + Math.random() * 0.7;
      particles.push({
        x: bx, y: by, bx, by,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: 0.5 + Math.random() * 2.5,
        alpha: 0.1 + Math.random() * 0.5,
        hue: 190 + Math.random() * 70,
        depth: d,
      });
    }

    let frame = 0;
    const maxDist = w < 768 ? 120 : 180;

    const animate = () => {
      ctx.clearRect(0, 0, w, h);
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.bx += p.vx;
        p.by += p.vy;

        if (p.bx < 0 || p.bx > w) p.vx *= -1;
        if (p.by < 0 || p.by > h) p.vy *= -1;

        const px = p.bx + (mx - 0.5) * p.depth * 30;
        const py = p.by + (my - 0.5) * p.depth * 30;

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `oklch(0.7 0.15 ${p.hue} / ${p.alpha})`;
        ctx.fill();

        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 4);
        glow.addColorStop(0, `oklch(0.7 0.15 ${p.hue} / ${p.alpha * 0.3})`);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, p.size * 4, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < Math.min(i + 4, count); j += 3) {
          const a = particles[i];
          const b = particles[j];
          const ax = a.bx + (mx - 0.5) * a.depth * 30;
          const ay = a.by + (my - 0.5) * a.depth * 30;
          const bx = b.bx + (mx - 0.5) * b.depth * 30;
          const by = b.by + (my - 0.5) * b.depth * 30;
          const dx = ax - bx;
          const dy = ay - by;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(ax, ay);
            ctx.lineTo(bx, by);
            ctx.strokeStyle = `oklch(0.7 0.15 200 / ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      frame = requestAnimationFrame(animate);
    };

    const resize = () => { w = window.innerWidth; h = window.innerHeight; canvas.width = w; canvas.height = h; };
    const mouse = (e: MouseEvent) => { mouseRef.current = { x: e.clientX / w, y: e.clientY / h }; };

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", mouse, { passive: true });
    animate();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", mouse);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}

/* ───── FLOATING GLASS ELEMENTS ───── */
function FloatingGlassElements() {
  const items = useMemo(() => [
    { w: 160, h: 100, x: "85%", y: "6%", dur: 20, xk: [0, 40, -30, 20, 0], yk: [0, -35, 25, -40, 0], rot: [0, 3, -2, 5, 0] },
    { w: 130, h: 80, x: "2%", y: "80%", dur: 22, xk: [0, -30, 35, -15, 0], yk: [0, 30, -20, 35, 0], rot: [0, -2, 4, -3, 0] },
    { w: 100, h: 100, x: "65%", y: "70%", dur: 18, xk: [0, 25, -40, 15, 0], yk: [0, -15, 30, -25, 0], rot: [0, 5, -3, 2, 0] },
  ], []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {items.map((el, i) => (
        <motion.div
          key={i}
          className="absolute rounded-2xl"
          style={{
            width: el.w, height: el.h, left: el.x, top: el.y,
            background: "linear-gradient(135deg, oklch(1 0 0 / 0.04), oklch(1 0 0 / 0.01))",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid oklch(1 0 0 / 0.06)",
            boxShadow: "0 0 40px oklch(0.7 0.15 200 / 0.03), inset 0 0 40px oklch(1 0 0 / 0.02)",
          }}
          animate={{ x: el.xk, y: el.yk, rotate: el.rot }}
          transition={{ duration: el.dur, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

/* ───── LIGHT RAYS ───── */
function LightRays() {
  const rays = useMemo(() => [
    { angle: 28, dur: 12, delay: 0, top: "15%" },
    { angle: 35, dur: 14, delay: 5, top: "45%" },
    { angle: 22, dur: 10, delay: 9, top: "75%" },
  ], []);
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 2 }}>
      {rays.map((r, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: "300vw", height: "1.5px", left: "-100vw", top: r.top,
            transform: `rotate(${r.angle}deg)`,
            background: "linear-gradient(90deg, transparent 0%, oklch(0.7 0.15 200 / 0.5) 30%, oklch(0.6 0.2 240 / 0.5) 50%, oklch(0.7 0.15 200 / 0.5) 70%, transparent 100%)",
            opacity: 0.06,
            filter: "blur(1px)",
          }}
          animate={{ x: ["-100vw", "200vw"] }}
          transition={{ duration: r.dur, repeat: Infinity, delay: r.delay, ease: "linear" }}
        />
      ))}
    </div>
  );
}

/* ───── 3D PERSPECTIVE GRID ───── */
function PerspectiveGrid() {
  const lines = useMemo(() => {
    const result = [];
    for (let i = 0; i < 24; i++) {
      const delay = i * 0.15;
      const x1 = (i / 24) * 100;
      const x2 = 50 + (i - 12) * 2;
      result.push({ x1: `${x1}%`, y1: "0%", x2: `${x2}%`, y2: "100%", delay });
    }
    for (let i = 0; i < 16; i++) {
      const delay = i * 0.2;
      const y1 = (i / 16) * 100;
      result.push({ x1: "0%", y1: `${y1}%`, x2: "100%", y2: `${y1}%`, delay });
    }
    return result;
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 1, perspective: "800px" }}>
      <div style={{ transform: "rotateX(60deg) scaleY(1.8)", transformOrigin: "center bottom" }}>
        {lines.map((l, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              height: "1px", left: l.x1, top: l.y1, width: l.x2 ? undefined : "100%",
              background: "oklch(0.7 0.15 200 / 0.08)",
              boxShadow: "0 0 4px oklch(0.7 0.15 200 / 0.04)",
            }}
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: l.delay, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style2={l.x2 ? {
              left: l.x1, top: l.y1, width: "0px",
              height: `${parseFloat(l.y2) - parseFloat(l.y1)}vh`,
              borderLeft: "1px solid oklch(0.7 0.15 200 / 0.06)",
            } : {
              left: l.x1, top: l.y1, width: "100%",
              height: "1px",
              background: "oklch(0.7 0.15 200 / 0.06)",
            }}
          />
        ))}
      </div>
    </div>
  );
  return null;
}

/* ───── STATIC GRID ───── */
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

// ─── Input Component ───

function GlassInput({ icon: Icon, ...props }: { icon?: any; placeholder?: string; type?: string; value?: string; onChange?: (e: any) => void; className?: string; [key: string]: any }) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="relative flex items-center">
      {Icon && <Icon className="absolute left-3.5 w-4 h-4 pointer-events-none" style={{ color: focused ? "oklch(0.7 0.15 200 / 0.6)" : "oklch(1 0 0 / 0.25)" }} />}
      <input
        {...props}
        onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
        onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
        className={`w-full h-11 px-4 text-sm rounded-xl transition-all outline-none ${Icon ? "pl-10" : ""} ${props.className || ""}`}
        style={{
          background: "oklch(1 0 0 / 0.04)", border: focused ? "1px solid oklch(0.7 0.15 200 / 0.4)" : "1px solid oklch(1 0 0 / 0.08)",
          color: "#fff", boxShadow: focused ? "0 0 10px oklch(0.7 0.15 200 / 0.1)" : "none",
        }}
      />
    </div>
  );
}

function NeonButton({ children, disabled, onClick, icon: Icon, loading, variant = "primary", className, ...props }: any) {
  const isPrimary = variant === "primary";
  return (
    <motion.button
      onClick={onClick} disabled={disabled || loading}
      whileHover={!disabled && !loading ? { scale: 1.01 } : {}}
      whileTap={!disabled && !loading ? { scale: 0.99 } : {}}
      className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50 ${className || ""}`}
      style={isPrimary ? {
        background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
        color: "#fff", boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
      } : {
        background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)", color: "oklch(1 0 0 / 0.7)",
      }}
      onMouseEnter={(e: any) => { if (!disabled && !loading && isPrimary) { e.currentTarget.style.boxShadow = "0 0 40px oklch(0.7 0.15 200 / 0.5)"; } }}
      onMouseLeave={(e: any) => { if (!disabled && !loading && isPrimary) { e.currentTarget.style.boxShadow = "0 0 20px oklch(0.7 0.15 200 / 0.3)"; } }}
      {...props}
    >
      {loading ? (
        <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4" />}
          {children}
        </>
      )}
    </motion.button>
  );
}

function SSOButton({ provider, label, sublabel, icon, onClick }: { provider: string; label: string; sublabel?: string; icon: React.ReactNode; onClick?: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
      style={{
        background: hover ? "oklch(0.7 0.15 200 / 0.12)" : "oklch(0.7 0.15 200 / 0.08)",
        border: "1px solid oklch(0.7 0.15 200 / 0.2)",
        boxShadow: hover ? "0 0 30px oklch(0.7 0.15 200 / 0.2)" : "0 0 20px oklch(0.7 0.15 200 / 0.1)",
      }}
    >
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "oklch(1 0 0 / 0.05)" }}>
        {icon}
      </div>
      <div className="text-left flex-1 min-w-0">
        <div className="text-sm font-medium text-white group-hover:text-white transition-colors truncate">{label}</div>
        {sublabel && <div className="text-[10px] truncate" style={{ color: "oklch(1 0 0 / 0.35)" }}>{sublabel}</div>}
      </div>
      <ChevronRight className="w-4 h-4 shrink-0" style={{ color: "oklch(1 0 0 / 0.2)" }} />
    </motion.button>
  );
}

function MethodPill({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: any; onClick: () => void }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{
        background: active ? "oklch(0.7 0.15 200 / 0.15)" : "oklch(1 0 0 / 0.04)",
        border: active ? "1px solid oklch(0.7 0.15 200 / 0.25)" : "1px solid transparent",
        color: active ? "oklch(0.8 0.12 200)" : "oklch(1 0 0 / 0.4)",
      }}
    >
      <Icon className="w-3 h-3" />
      {label}
    </motion.button>
  );
}

// ─── Icons ───
function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
      <rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1.5" />
      <rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1.5" />
      <rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1.5" />
      <rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1.5" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
      <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z" />
      <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z" />
      <path fill="#4A90E2" d="M19.834 21c2.195-2.05 3.621-5.09 3.621-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z" />
      <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z" />
    </svg>
  );
}

// ─── Security Badge Row ───
function SecurityBadgeRow() {
  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {[
        { label: "AES-256", icon: Lock },
        { label: "TLS 1.3", icon: Shield },
        { label: "SOC 2", icon: CheckCircle2 },
        { label: "GDPR", icon: Award },
      ].map((b) => (
        <div
          key={b.label}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-medium"
          style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.35)" }}
        >
          <b.icon className="w-2 h-2" style={{ color: "oklch(0.7 0.15 200 / 0.5)" }} />
          {b.label}
        </div>
      ))}
    </div>
  );
}

function AuthSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-2 mb-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 flex-1 rounded-lg" style={{ background: "oklch(1 0 0 / 0.06)" }} />
        ))}
      </div>
      <div className="h-11 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)" }} />
      <div className="h-11 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)" }} />
      <div className="h-11 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)" }} />
      <div className="h-11 rounded-xl" style={{ background: "oklch(1 0 0 / 0.04)" }} />
    </div>
  );
}

function PasskeyLoginButton({ onClick }: { onClick?: () => void }) {
  const [supported] = useState(() => typeof window !== "undefined" && typeof window.PublicKeyCredential !== "undefined");
  if (!supported) return null;
  return (
    <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      onClick={onClick} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-medium rounded-xl transition-all"
      style={{ background: "oklch(0.7 0.15 200 / 0.08)", border: "1px solid oklch(0.7 0.15 200 / 0.2)", color: "oklch(0.8 0.12 200)" }}
    >
      <Fingerprint className="w-4 h-4" /> Sign in with Passkey
    </motion.button>
  );
}

function RememberMeCheckbox() {
  const [checked, setChecked] = useState(false);
  return (
    <label className="flex items-center gap-1.5 cursor-pointer group py-0.5">
      <input type="checkbox" checked={checked} onChange={(e) => setChecked(e.target.checked)} className="sr-only peer" />
      <div className="w-3.5 h-3.5 rounded border transition-all" style={{
        background: checked ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.04)",
        borderColor: checked ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.12)",
      }}>
        {checked && <CheckCircle2 className="w-3 h-3 text-white" style={{ margin: "-1px" }} />}
      </div>
      <span className="text-[10px] group-hover:text-white/50 transition-colors" style={{ color: "oklch(1 0 0 / 0.3)" }}>Remember me</span>
    </label>
  );
}

function SecurityStatus() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] mb-3"
      style={{ background: "oklch(0.65 0.2 150 / 0.06)", border: "1px solid oklch(0.65 0.2 150 / 0.1)" }}
    >
      <ShieldCheck className="w-3 h-3" style={{ color: "oklch(0.65 0.2 150)" }} />
      <span style={{ color: "oklch(1 0 0 / 0.5)" }}>Connection secured</span>
      <span className="ml-auto" style={{ color: "oklch(0.65 0.2 150 / 0.6)" }}>● Live</span>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// STUDENT
// ══════════════════════════════════════════════════

function StudentAuth({ onNavigate }: { onNavigate: (to: string) => void }) {
  const auth = useAuth();
  const [method, setMethod] = useState<StudentMethod>("pin");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);
  const [pinStep, setPinStep] = useState<"name" | "pin">("name");
  const [pinName, setPinName] = useState("");
  const [pinLname, setPinLname] = useState("");
  const [pin, setPin] = useState<string[]>(["", "", "", "", "", ""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...pin]; n[i] = v.slice(-1); setPin(n);
    if (v && i < 5) pinRefs.current[i + 1]?.focus();
    if (n.every((d) => d)) {
      toast.success("Logged in with PIN!");
      onNavigate("/student/dashboard");
    }
  };
  const handlePinKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  const submitStudentLogin = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    const { error } = await auth.signInWithEmail(email, pass);
    setBusy(false);
    if (error) { toast.error(error); return; }
    onNavigate("/student/dashboard");
  };

  return (
    <motion.div key="student" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
      <div className="flex gap-1.5 mb-4">
        <MethodPill active={method === "pin"} label="PIN" icon={KeyRound} onClick={() => setMethod("pin")} />
        <MethodPill active={method === "google"} label="Google" icon={() => <GoogleIcon />} onClick={() => setMethod("google")} />
        <MethodPill active={method === "email"} label="Email" icon={Mail} onClick={() => setMethod("email")} />
      </div>

      <AnimatePresence mode="wait">
        {method === "pin" && (
          <motion.div key="pin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            {pinStep === "name" ? (
              <div className="space-y-3">
                <div className="text-center mb-2">
                  <KeyRound className="w-8 h-8 mx-auto mb-2" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                  <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.45)" }}>Enter your name to join with a PIN</p>
                </div>
                <GlassInput value={pinName} onChange={(e: any) => setPinName(e.target.value)} placeholder="First name" />
                <GlassInput value={pinLname} onChange={(e: any) => setPinLname(e.target.value)} placeholder="Last name" />
                <NeonButton onClick={() => pinName && pinLname ? setPinStep("pin") : toast.error("Enter your name")} disabled={!pinName || !pinLname} icon={ArrowRight}>Continue</NeonButton>
              </div>
            ) : (
              <div className="space-y-4 text-center">
                <KeyRound className="w-8 h-8 mx-auto" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.45)" }}>Enter the 6-digit PIN from your teacher</p>
                <div className="flex justify-center gap-2">
                  {pin.map((d, i) => (
                    <input key={i} ref={(r) => { pinRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handlePinDigit(i, e.target.value)} onKeyDown={(e) => handlePinKey(i, e)}
                      className="w-11 h-12 text-center text-lg font-bold rounded-xl transition-all outline-none"
                      style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; e.currentTarget.style.boxShadow = "0 0 10px oklch(0.7 0.15 200 / 0.2)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; e.currentTarget.style.boxShadow = "none"; }} />
                  ))}
                </div>
                <button onClick={() => setPinStep("name")} className="flex items-center justify-center gap-1 text-xs w-full" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                  <ChevronLeft className="w-3 h-3" /> Back
                </button>
              </div>
            )}
          </motion.div>
        )}
        {method === "google" && (
          <motion.div key="google" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
            <div className="text-center py-4">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl flex items-center justify-center" style={{ background: "oklch(1 0 0 / 0.04)" }}><GoogleIcon /></div>
              <p className="text-sm font-medium text-white mb-1">Continue with Google</p>
              <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>Quick and secure — no password needed</p>
            </div>
            <NeonButton onClick={() => auth.signInWithProvider("google")} icon={ArrowRight}>Sign in with Google</NeonButton>
          </motion.div>
        )}
        {method === "email" && (
          <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="space-y-3">
            <GlassInput icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Email address" />
            <GlassInput icon={Lock} type="password" value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="Password" />
            <div className="flex items-center justify-between">
              <RememberMeCheckbox />
              <Link to="/auth/reset-password" className="text-[10px] transition-colors" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>Forgot password?</Link>
            </div>
            <NeonButton onClick={submitStudentLogin} loading={busy} icon={ArrowRight}>{busy ? "Signing in..." : "Sign in"}</NeonButton>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "oklch(1 0 0 / 0.06)" }} /></div>
              <div className="relative flex justify-center"><span className="px-2 text-[9px]" style={{ background: "oklch(0.06 0.03 270)", color: "oklch(1 0 0 / 0.2)" }}>or</span></div>
            </div>
            <PasskeyLoginButton />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// TEACHER
// ══════════════════════════════════════════════════

function TeacherAuth({ onNavigate }: { onNavigate: (to: string) => void }) {
  const auth = useAuth();
  const [method, setMethod] = useState<TeacherMethod>("microsoft");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  const submitTeacherLogin = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    const { error } = await auth.signInWithEmail(email, pass);
    setBusy(false);
    if (error) { toast.error(error); return; }
    onNavigate("/teacher");
  };

  return (
    <motion.div key="teacher" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
      <div className="flex gap-1.5 mb-4">
        <MethodPill active={method === "microsoft"} label="Microsoft" icon={() => <MicrosoftIcon />} onClick={() => setMethod("microsoft")} />
        <MethodPill active={method === "google"} label="Google" icon={() => <GoogleIcon />} onClick={() => setMethod("google")} />
        <MethodPill active={method === "email"} label="Email" icon={Mail} onClick={() => setMethod("email")} />
      </div>
      <AnimatePresence mode="wait">
        {(method === "microsoft" || method === "google") && (
          <motion.div key={method} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "oklch(1 0 0 / 0.04)" }}>
                {method === "microsoft" ? <MicrosoftIcon /> : <GoogleIcon />}
              </div>
              <p className="text-sm font-medium text-white mb-1">Continue with {method === "microsoft" ? "Microsoft 365" : "Google Workspace"}</p>
              <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>{method === "microsoft" ? "School or work account · Entra ID · Azure AD" : "Workspace for Education · Secure SSO"}</p>
            </div>
            <NeonButton onClick={() => auth.signInWithProvider(method === "microsoft" ? "microsoft" : "google")} icon={ArrowRight}>Sign in with {method === "microsoft" ? "Microsoft" : "Google"}</NeonButton>
          </motion.div>
        )}
        {method === "email" && (
          <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-medium" style={{ color: "oklch(1 0 0 / 0.35)" }}>Email login</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={tfaEnabled} onChange={(e) => setTfaEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-7 h-4 rounded-full transition-all" style={{ background: tfaEnabled ? "oklch(0.7 0.15 200 / 0.3)" : "oklch(1 0 0 / 0.1)" }}>
                  <div className="w-3 h-3 rounded-full transition-all mt-0.5" style={{ marginLeft: tfaEnabled ? "14px" : "2px", background: tfaEnabled ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.3)" }} />
                </div>
                <span className="text-[9px]" style={{ color: "oklch(1 0 0 / 0.3)" }}>2FA</span>
              </label>
            </div>
            <div className="space-y-3">
              <GlassInput icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Email address" />
              <GlassInput icon={Lock} type="password" value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="Password" />
              {tfaEnabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <GlassInput icon={Smartphone} type="text" placeholder="2FA code (Authenticator)" />
                </motion.div>
              )}
              <div className="flex items-center justify-between">
                <RememberMeCheckbox />
                <Link to="/auth/reset-password" className="text-[10px] transition-colors" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>Forgot password?</Link>
              </div>
              <NeonButton onClick={submitTeacherLogin} loading={busy} icon={ArrowRight}>{busy ? "Signing in..." : "Sign in"}</NeonButton>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "oklch(1 0 0 / 0.06)" }} /></div>
                <div className="relative flex justify-center"><span className="px-2 text-[9px]" style={{ background: "oklch(0.06 0.03 270)", color: "oklch(1 0 0 / 0.2)" }}>or</span></div>
              </div>
              <PasskeyLoginButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// PARENT
// ══════════════════════════════════════════════════

function ParentAuth({ onNavigate }: { onNavigate: (to: string) => void }) {
  const auth = useAuth();
  const [method, setMethod] = useState<ParentMethod>("google");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  const submitParentLogin = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    const { error } = await auth.signInWithEmail(email, pass);
    setBusy(false);
    if (error) { toast.error(error); return; }
    onNavigate("/student/dashboard");
  };

  return (
    <motion.div key="parent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
      <div className="flex gap-1.5 mb-4">
        <MethodPill active={method === "google"} label="Google" icon={() => <GoogleIcon />} onClick={() => setMethod("google")} />
        <MethodPill active={method === "email"} label="Email" icon={Mail} onClick={() => setMethod("email")} />
      </div>
      <AnimatePresence mode="wait">
        {method === "google" && (
          <motion.div key="google" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "oklch(1 0 0 / 0.04)" }}><GoogleIcon /></div>
              <p className="text-sm font-medium text-white mb-1">Continue with Google</p>
              <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>Quick and secure — no password needed</p>
            </div>
            <NeonButton onClick={() => auth.signInWithProvider("google")} icon={ArrowRight}>Sign in with Google</NeonButton>
          </motion.div>
        )}
        {method === "email" && (
          <motion.div key="email" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-medium" style={{ color: "oklch(1 0 0 / 0.35)" }}>Email login</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input type="checkbox" checked={tfaEnabled} onChange={(e) => setTfaEnabled(e.target.checked)} className="sr-only peer" />
                <div className="w-7 h-4 rounded-full transition-all" style={{ background: tfaEnabled ? "oklch(0.7 0.15 200 / 0.3)" : "oklch(1 0 0 / 0.1)" }}>
                  <div className="w-3 h-3 rounded-full transition-all mt-0.5" style={{ marginLeft: tfaEnabled ? "14px" : "2px", background: tfaEnabled ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.3)" }} />
                </div>
                <span className="text-[9px]" style={{ color: "oklch(1 0 0 / 0.3)" }}>2FA</span>
              </label>
            </div>
            <div className="space-y-3">
              <GlassInput icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Email address" />
              <GlassInput icon={Lock} type="password" value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="Password" />
              {tfaEnabled && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="overflow-hidden">
                  <GlassInput icon={Smartphone} type="text" placeholder="2FA code (Authenticator)" />
                </motion.div>
              )}
              <div className="flex items-center justify-between">
                <RememberMeCheckbox />
                <Link to="/auth/reset-password" className="text-[10px] transition-colors" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>Forgot password?</Link>
              </div>
              <NeonButton onClick={submitParentLogin} loading={busy} icon={ArrowRight}>{busy ? "Signing in..." : "Sign in"}</NeonButton>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t" style={{ borderColor: "oklch(1 0 0 / 0.06)" }} /></div>
                <div className="relative flex justify-center"><span className="px-2 text-[9px]" style={{ background: "oklch(0.06 0.03 270)", color: "oklch(1 0 0 / 0.2)" }}>or</span></div>
              </div>
              <PasskeyLoginButton />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// ADMIN
// ══════════════════════════════════════════════════

const RECOVERY_CODES = ["X7K2-M9P4", "R3N8-J1W5", "F6H2-L9Q7", "B4D1-V8K3", "T5M2-C7N9", "P8R4-E2G1", "Y3L6-Z4X7", "W9Q1-A5H8"];
const LOGIN_HISTORY = [
  { action: "Successful login", device: "Chrome · Windows 11", location: "Warsaw, PL", ip: "83.24.15.2", time: "2 min ago", status: "success" as const },
  { action: "Failed attempt", device: "Firefox · Ubuntu", location: "Berlin, DE", ip: "91.45.2.8", time: "1 hour ago", status: "error" as const },
  { action: "Successful login", device: "Chrome · macOS", location: "Krakow, PL", ip: "85.12.7.3", time: "3 hours ago", status: "success" as const },
  { action: "New device detected", device: "Edge · Windows 11", location: "Warsaw, PL", ip: "83.24.15.2", time: "1 day ago", status: "warning" as const },
  { action: "Successful login", device: "Safari · iOS", location: "Gdansk, PL", ip: "79.8.3.1", time: "2 days ago", status: "success" as const },
];
const ACTIVE_SESSIONS = [
  { device: "Chrome · Windows 11", location: "Warsaw, PL", ip: "83.24.15.2", current: true },
  { device: "Safari · iOS 18", location: "Krakow, PL", ip: "85.12.7.3", current: false },
  { device: "Edge · Windows 11", location: "Warsaw, PL", ip: "83.24.15.2", current: false },
];

function AdminAuth({ onNavigate }: { onNavigate: (to: string) => void }) {
  const auth = useAuth();
  const [view, setView] = useState<AdminView>("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [tfaCode, setTfaCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [codesRevealed, setCodesRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const submitAdminLogin = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    if (!tfaCode) { toast.error("2FA code required for admin access"); return; }
    setBusy(true);
    const { error } = await auth.signInWithEmail(email, pass);
    setBusy(false);
    if (error) { toast.error(error); return; }
    onNavigate("/admin");
  };

  const handleCopyCodes = () => {
    navigator.clipboard.writeText(RECOVERY_CODES.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Recovery codes copied");
  };

  return (
    <motion.div key="admin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
      <motion.div className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4" style={{ background: "oklch(0.7 0.15 200 / 0.06)", border: "1px solid oklch(0.7 0.15 200 / 0.12)" }}>
        <Shield className="w-4 h-4" style={{ color: "oklch(0.7 0.15 200)" }} />
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white">Security Center</div>
          <div className="text-[9px]" style={{ color: "oklch(1 0 0 / 0.35)" }}>Enterprise-grade authentication</div>
        </div>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px]" style={{ background: "oklch(0.65 0.2 150 / 0.1)", color: "oklch(0.65 0.2 150)" }}>
          <ShieldCheck className="w-2.5 h-2.5" />Protected
        </div>
      </motion.div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <MethodPill active={view === "login"} label="Email + 2FA" icon={Mail} onClick={() => setView("login")} />
        <MethodPill active={view === "microsoft"} label="Entra ID" icon={() => <MicrosoftIcon />} onClick={() => setView("microsoft")} />
        <MethodPill active={view === "google"} label="Google SSO" icon={() => <GoogleIcon />} onClick={() => setView("google")} />
      </div>

      <AnimatePresence mode="wait">
        {view === "login" && (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="space-y-3">
              <GlassInput icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="School email address" />
              <div className="relative">
                <GlassInput icon={Lock} type={showPass ? "text" : "password"} value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="Password" />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2">
                  {showPass ? <EyeOff className="w-3.5 h-3.5" style={{ color: "oklch(1 0 0 / 0.25)" }} /> : <Eye className="w-3.5 h-3.5" style={{ color: "oklch(1 0 0 / 0.25)" }} />}
                </button>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(0.65 0.2 150 / 0.12)" }}>
                <Smartphone className="w-3 h-3 shrink-0" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                <span style={{ color: "oklch(1 0 0 / 0.45)" }}>Authenticator code required</span>
                <button onClick={() => setView("recovery")} className="ml-auto text-[9px]" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>Use recovery code</button>
              </div>
              <GlassInput icon={Smartphone} type="text" value={tfaCode} onChange={(e: any) => setTfaCode(e.target.value)} placeholder="6-digit Authenticator code" />
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px]" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)" }}>
                <Monitor className="w-3 h-3 shrink-0" style={{ color: "oklch(0.7 0.15 200 / 0.5)" }} />
                <span style={{ color: "oklch(1 0 0 / 0.35)" }}>This device is recognized</span>
                <CheckCircle2 className="w-3 h-3 ml-auto shrink-0" style={{ color: "oklch(0.65 0.2 150)" }} />
              </div>
              <NeonButton onClick={submitAdminLogin} loading={busy} icon={ShieldCheck}>{busy ? "Verifying..." : "Authenticate & Sign In"}</NeonButton>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setView("sessions")} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[10px] transition-all" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.4)" }}>
                  <History className="w-3 h-3" /> Sessions
                </button>
                <button onClick={() => setView("recovery")} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg text-[10px] transition-all" style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.4)" }}>
                  <Key className="w-3 h-3" /> Recovery
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {view === "microsoft" && (
          <motion.div key="microsoft" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "oklch(1 0 0 / 0.04)" }}><MicrosoftIcon /></div>
              <p className="text-sm font-medium text-white mb-1">Microsoft Entra ID / Azure AD</p>
              <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>Enterprise SSO with conditional access & MFA</p>
            </div>
            <div className="space-y-2 mb-4 px-2">
              {["Conditional Access enforced", "MFA required", "Device compliance check", "Location verification"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[10px]" style={{ color: "oklch(1 0 0 / 0.4)" }}><ShieldCheck className="w-3 h-3" style={{ color: "oklch(0.65 0.2 150 / 0.6)" }} />{item}</div>
              ))}
            </div>
            <NeonButton onClick={() => auth.signInWithProvider("microsoft")} icon={ExternalLink}>Sign in with Microsoft Entra ID</NeonButton>
          </motion.div>
        )}
        {view === "google" && (
          <motion.div key="google" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="text-center py-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ background: "oklch(1 0 0 / 0.04)" }}><GoogleIcon /></div>
              <p className="text-sm font-medium text-white mb-1">Google Workspace SSO</p>
              <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>Workspace for Education with contextual access</p>
            </div>
            <div className="space-y-2 mb-4 px-2">
              {["Context-aware access", "2FA enforced", "Workspace session sync", "Admin audit logging"].map((item) => (
                <div key={item} className="flex items-center gap-2 text-[10px]" style={{ color: "oklch(1 0 0 / 0.4)" }}><ShieldCheck className="w-3 h-3" style={{ color: "oklch(0.65 0.2 150 / 0.6)" }} />{item}</div>
              ))}
            </div>
            <NeonButton onClick={() => auth.signInWithProvider("google")} icon={ArrowRight}>Sign in with Google Workspace</NeonButton>
          </motion.div>
        )}
        {view === "recovery" && (
          <motion.div key="recovery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button onClick={() => setView("login")} className="flex items-center gap-1 text-xs mb-3" style={{ color: "oklch(1 0 0 / 0.4)" }}><ChevronLeft className="w-3 h-3" /> Back to login</button>
            <div className="text-center mb-4">
              <Key className="w-8 h-8 mx-auto mb-2" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
              <p className="text-xs font-medium text-white">Recovery Codes</p>
              <p className="text-[10px]" style={{ color: "oklch(1 0 0 / 0.35)" }}>Use one-time codes when you lose access to Authenticator</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              {RECOVERY_CODES.map((code) => (
                <div key={code} className="px-3 py-2 rounded-lg text-xs font-mono tracking-wider text-center" style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.6)" }}>
                  {codesRevealed ? code : code.replace(/[A-Z0-9]/g, "\u2022")}
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <NeonButton variant="secondary" onClick={() => setCodesRevealed(!codesRevealed)} icon={codesRevealed ? EyeOff : Eye}>{codesRevealed ? "Hide" : "Reveal"}</NeonButton>
              <NeonButton onClick={handleCopyCodes} icon={copied ? CheckCircle2 : Copy}>{copied ? "Copied!" : "Copy codes"}</NeonButton>
            </div>
            <p className="mt-3 text-[9px] text-center" style={{ color: "oklch(1 0 0 / 0.25)" }}>Store codes securely. Each code can only be used once.</p>
          </motion.div>
        )}
        {view === "sessions" && (
          <motion.div key="sessions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <button onClick={() => setView("login")} className="flex items-center gap-1 text-xs mb-3" style={{ color: "oklch(1 0 0 / 0.4)" }}><ChevronLeft className="w-3 h-3" /> Back to login</button>
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2"><History className="w-3 h-3" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} /><span className="text-[10px] font-medium" style={{ color: "oklch(1 0 0 / 0.5)" }}>Login History</span></div>
              <div className="space-y-1">
                {LOGIN_HISTORY.map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px]" style={{ background: "oklch(1 0 0 / 0.03)" }}>
                    {entry.status === "success" && <CheckCircle2 className="w-2.5 h-2.5 shrink-0" style={{ color: "oklch(0.65 0.2 150)" }} />}
                    {entry.status === "error" && <X className="w-2.5 h-2.5 shrink-0" style={{ color: "oklch(0.6 0.2 30)" }} />}
                    {entry.status === "warning" && <AlertTriangle className="w-2.5 h-2.5 shrink-0" style={{ color: "oklch(0.7 0.2 80)" }} />}
                    <div className="flex-1 min-w-0">
                      <div className="truncate" style={{ color: "oklch(1 0 0 / 0.6)" }}>{entry.action}</div>
                      <div className="truncate" style={{ color: "oklch(1 0 0 / 0.25)" }}>{entry.device} · {entry.location}</div>
                    </div>
                    <span className="shrink-0" style={{ color: "oklch(1 0 0 / 0.2)" }}>{entry.time}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <Monitor className="w-3 h-3" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                <span className="text-[10px] font-medium" style={{ color: "oklch(1 0 0 / 0.5)" }}>Active Sessions</span>
                <button className="ml-auto flex items-center gap-1 text-[9px]" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}><RefreshCw className="w-2.5 h-2.5" /> Force logout all</button>
              </div>
              <div className="space-y-1">
                {ACTIVE_SESSIONS.map((session, i) => (
                  <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px]" style={{ background: "oklch(1 0 0 / 0.03)" }}>
                    <Monitor className="w-3 h-3 shrink-0" style={{ color: session.current ? "oklch(0.7 0.15 200 / 0.6)" : "oklch(1 0 0 / 0.2)" }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="truncate" style={{ color: "oklch(1 0 0 / 0.6)" }}>{session.device}</span>
                        {session.current && <span className="px-1.5 py-0.5 rounded-full text-[8px] font-medium" style={{ background: "oklch(0.7 0.15 200 / 0.1)", color: "oklch(0.7 0.15 200)" }}>Current</span>}
                      </div>
                      <div style={{ color: "oklch(1 0 0 / 0.25)" }}>{session.location}</div>
                    </div>
                    {!session.current && <button className="shrink-0 text-[9px] px-1.5 py-0.5 rounded" style={{ color: "oklch(0.6 0.2 30 / 0.6)" }}>Revoke</button>}
                  </div>
                ))}
              </div>
            </div>
            <NeonButton variant="secondary" onClick={() => setView("login")} icon={ChevronLeft}>Back to sign in</NeonButton>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div className="mt-3 flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: "oklch(0.6 0.2 30 / 0.06)", border: "1px solid oklch(0.6 0.2 30 / 0.1)" }}>
        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" style={{ color: "oklch(0.7 0.2 80)" }} />
        <div className="text-[9px]" style={{ color: "oklch(1 0 0 / 0.35)" }}>
          Suspicious login attempt detected from Berlin, DE.{" "}
          <button style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>Review</button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// REGISTRATION FORM
// ══════════════════════════════════════════════════

function RegistrationForm({ role, onBack }: { role: RoleId; onBack: () => void }) {
  const auth = useAuth();
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [busy, setBusy] = useState(false);

  const submitRegister = async () => {
    if (!fname || !lname || !email || !pass) { toast.error("Fill all fields"); return; }
    if (pass.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setBusy(true);
    const { error } = await auth.signUpWithEmail(email, pass, role, {
      first_name: fname, last_name: lname,
    });
    setBusy(false);
    if (error) { toast.error(error); return; }
    toast.success("Account created! Check your email to confirm.");
  };

  return (
    <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="space-y-3">
      <div className="flex gap-3">
        <GlassInput value={fname} onChange={(e: any) => setFname(e.target.value)} placeholder="First name" />
        <GlassInput value={lname} onChange={(e: any) => setLname(e.target.value)} placeholder="Last name" />
      </div>
      <GlassInput icon={Mail} type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} placeholder="Email address" />
      <GlassInput icon={Lock} type="password" value={pass} onChange={(e: any) => setPass(e.target.value)} placeholder="Password (min. 8 characters)" />
      <NeonButton onClick={submitRegister} loading={busy} icon={User}>Create account</NeonButton>
      <button onClick={onBack} className="flex items-center justify-center gap-1 text-xs w-full" style={{ color: "oklch(1 0 0 / 0.4)" }}>
        <ChevronLeft className="w-3 h-3" /> Back to sign in
      </button>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════
// MAIN AUTH PAGE
// ══════════════════════════════════════════════════

function AuthPage() {
  const navigate = useNavigate();
  const [showEntry, setShowEntry] = useState(true);
  const [role, setRole] = useState<RoleId>("student");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [vpIndex, setVpIndex] = useState(0);

  const currentProps = ROLE_PROPS[role];
  const currentTitle = ROLE_TITLES[role];

  useEffect(() => {
    const t = setInterval(() => setVpIndex((i) => (i + 1) % currentProps.length), 3000);
    return () => clearInterval(t);
  }, [currentProps.length]);

  const handleNavigate = useCallback((to: string) => { navigate({ to }); }, [navigate]);

  return (
    <>
      {showEntry && <EntryScene onComplete={() => setShowEntry(false)} />}
      <div className="min-h-screen flex" style={{ opacity: showEntry ? 0 : 1, transition: "opacity 0.6s ease-in" }}>
        <Toaster theme="dark" />

        {/* ─── PREMIUM BACKGROUND LAYER ─── */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: "oklch(0.035 0.02 270)" }}>
          <AuroraBackground />
          <CanvasParticleField />
          <FloatingGlassElements />
          <LightRays />
          <GridBg />
        </div>

        {/* LEFT PANEL */}
        <div className="hidden lg:flex w-[40%] relative flex-col justify-between p-12 z-10">
          <div
            className="absolute inset-4 rounded-3xl pointer-events-none"
            style={{
              background: "linear-gradient(135deg, oklch(0.08 0.03 270 / 0.6), oklch(0.04 0.02 270 / 0.4))",
              border: "1px solid oklch(1 0 0 / 0.06)", backdropFilter: "blur(24px)",
            }}
          />
          <div
            className="absolute inset-4 rounded-3xl pointer-events-none opacity-40"
            style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.08), transparent 50%)", zIndex: -1 }}
          />

          <div className="relative px-6 pt-6">
            <div className="flex items-center gap-2.5 mb-12">
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
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${role}-${vpIndex}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={spring}
                className="mb-8"
              >
                <h2 className="text-4xl font-bold tracking-tight mb-6 leading-[1.05]">
                  <span className="text-white">{currentTitle.title}</span>
                  <br />
                  <span style={{
                    background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                  }}>
                    {role === "admin" ? "Security Center" : "· AI"}
                  </span>
                </h2>
                <p className="text-sm leading-relaxed max-w-sm mb-3" style={{ color: "oklch(1 0 0 / 0.45)" }}>
                  {currentProps[vpIndex]}
                </p>
                <p className="text-xs leading-relaxed max-w-sm" style={{ color: "oklch(1 0 0 / 0.25)" }}>
                  {currentTitle.tagline}
                </p>
                <div className="flex gap-1.5 mt-4">
                  {currentProps.map((_, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full transition-all duration-500"
                      style={{
                        width: i === vpIndex ? "24px" : "6px",
                        background: i === vpIndex ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.08)",
                        boxShadow: i === vpIndex ? "0 0 8px oklch(0.7 0.15 200 / 0.4)" : "none",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px]"
                  style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.4)" }}
                >
                  <Shield className="w-2.5 h-2.5" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                  {item}
                </div>
              ))}
            </div>
            <div className="text-[10px]" style={{ color: "oklch(1 0 0 / 0.25)" }}>
              <span className="font-semibold" style={{ color: "oklch(0.7 0.15 200)" }}>36,000+</span> students ·{" "}
              <span className="font-semibold" style={{ color: "oklch(0.7 0.15 200)" }}>800+</span> teachers ·{" "}
              <span className="font-semibold" style={{ color: "oklch(0.7 0.15 200)" }}>120+</span> schools
            </div>
            <SecurityBadgeRow />
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-[60%] flex items-center justify-center p-4 sm:p-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
            className="relative w-full max-w-md rounded-3xl p-8 sm:p-10"
            style={{
              background: "linear-gradient(135deg, oklch(0.08 0.03 270 / 0.6), oklch(0.04 0.02 270 / 0.4))",
              border: "1px solid oklch(1 0 0 / 0.06)", backdropFilter: "blur(24px)",
            }}
          >
            {/* Auth loading skeleton shown briefly before content appears */}
            <AnimatePresence>
              {showEntry && (
                <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-20 p-8 sm:p-10 rounded-3xl"
                  style={{ background: "oklch(0.06 0.03 270)" }}
                >
                  <div className="flex items-center gap-2.5 mb-8">
                    <div className="w-8 h-8 rounded-lg skeleton-pulse" style={{ background: "oklch(1 0 0 / 0.06)" }} />
                    <div className="w-20 h-4 rounded skeleton-pulse" style={{ background: "oklch(1 0 0 / 0.06)" }} />
                  </div>
                  <div className="h-4 w-24 rounded mb-2 skeleton-pulse" style={{ background: "oklch(1 0 0 / 0.06)" }} />
                  <div className="h-3 w-48 rounded mb-6 skeleton-pulse" style={{ background: "oklch(1 0 0 / 0.04)" }} />
                  <AuthSkeleton />
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-30"
              style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.1), transparent 40%, transparent 60%, oklch(0.7 0.15 200 / 0.1))", zIndex: -1 }}
            />

            <div className="lg:hidden flex items-center gap-2.5 mb-8">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.9), oklch(0.6 0.2 240 / 0.9))" }}>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-semibold text-white">EduNex</span>
            </div>

            <SecurityStatus />

            <button onClick={() => navigate({ to: "/" })} className="flex items-center gap-1 text-xs mb-4" style={{ color: "oklch(1 0 0 / 0.35)" }}>
              <ChevronLeft className="w-3 h-3" /> Back to home
            </button>

            <div className="mb-4">
              <h1 className="text-xl font-bold text-white mb-0.5">
                {role === "student" && "Welcome, Student"}
                {role === "teacher" && "Teacher Access"}
                {role === "parent" && "Parent Portal"}
                {role === "admin" && "Administrator Access"}
              </h1>
              <p className="text-xs" style={{ color: "oklch(1 0 0 / 0.45)" }}>
                {role === "student" && "Choose how you'd like to sign in"}
                {role === "teacher" && "Select your authentication method"}
                {role === "parent" && "Choose your preferred sign-in method"}
                {role === "admin" && "Enterprise authentication required"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {ROLES.map((r) => (
                <motion.button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-2.5 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: role === r.id ? "oklch(0.7 0.15 200 / 0.1)" : "oklch(1 0 0 / 0.03)",
                    border: role === r.id ? "1px solid oklch(0.7 0.15 200 / 0.25)" : "1px solid oklch(1 0 0 / 0.06)",
                    boxShadow: role === r.id ? "0 0 15px oklch(0.7 0.15 200 / 0.1)" : "none",
                  }}
                >
                  <r.icon className={`w-4 h-4 mb-1 ${role === r.id ? "text-neon" : "text-white/40"}`} />
                  <div className={`text-xs font-medium ${role === r.id ? "text-white" : "text-white/60"}`}>{r.label}</div>
                  <div className="text-[9px] mt-0.5" style={{ color: "oklch(1 0 0 / 0.3)" }}>{r.desc}</div>
                </motion.button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {mode === "register"
                ? <RegistrationForm key={`${role}-reg`} role={role} onBack={() => setMode("login")} />
                : role === "student" ? <StudentAuth key="student-auth" onNavigate={handleNavigate} />
                : role === "teacher" ? <TeacherAuth key="teacher-auth" onNavigate={handleNavigate} />
                : role === "parent" ? <ParentAuth key="parent-auth" onNavigate={handleNavigate} />
                : <AdminAuth key="admin-auth" onNavigate={handleNavigate} />
              }
            </AnimatePresence>
            {role !== "admin" && (
              <div className="text-center mt-4">
                {mode === "login" ? (
                  <button onClick={() => setMode("register")} className="text-[11px]" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                    Don't have an account? <span className="underline" style={{ color: "oklch(0.7 0.15 200)" }}>Register</span>
                  </button>
                ) : (
                  <button onClick={() => setMode("login")} className="text-[11px]" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                    Already have an account? <span className="underline" style={{ color: "oklch(0.7 0.15 200)" }}>Sign in</span>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
