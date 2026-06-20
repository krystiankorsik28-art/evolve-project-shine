import { useState, useRef, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronLeft, KeyRound, Shield, Sparkles, Mail, Lock, User, School, GraduationCap, Users, Building2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { EntryScene } from "@/components/three/EntryScene";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Sign In — EduNex" }] }),
});

const ROLES = [
  { id: "student", label: "Student", icon: GraduationCap, desc: "Take exams, learn with AI" },
  { id: "teacher", label: "Teacher", icon: Users, desc: "Create exams, monitor classes" },
  { id: "parent", label: "Parent", icon: School, desc: "Monitor progress" },
  { id: "admin", label: "Admin", icon: Building2, desc: "Manage your school" },
];

const TRUST_ITEMS = [
  "End-to-end encryption", "GDPR / RODO compliant", "EU-based servers",
  "ISO 27001 aligned", "99.9% uptime SLA",
];

const VALUE_PROPS = [
  "AI creates exams in seconds",
  "Grades automatically with AI",
  "Personalized AI tutor 24/7",
  "Real-time analytics & insights",
];

type AuthTab = "login" | "register" | "pin";

const spring = { type: "spring" as const, stiffness: 300, damping: 30 };

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

function AuthPage() {
  const navigate = useNavigate();
  const [showEntry, setShowEntry] = useState(true);
  const [role, setRole] = useState("student");
  const [tab, setTab] = useState<AuthTab>("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [busy, setBusy] = useState(false);
  const [vpIndex, setVpIndex] = useState(0);

  const [pinStep, setPinStep] = useState<"name" | "pin">("name");
  const [pinName, setPinName] = useState("");
  const [pinLname, setPinLname] = useState("");
  const [pin, setPin] = useState<string[]>(["","","","","",""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setInterval(() => setVpIndex((i) => (i + 1) % VALUE_PROPS.length), 3000);
    return () => clearInterval(t);
  }, []);

  const submitLogin = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("user_role", role);
    setBusy(false);
    const dash = { student: "/student/dashboard", teacher: "/teacher", parent: "/parent/dashboard", admin: "/admin" };
    navigate({ to: dash[role as keyof typeof dash] });
  };

  const submitRegister = async () => {
    if (!fname || !lname || !email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    setBusy(false);
    toast.success("Account created! Let's get you set up.");
    navigate({ to: "/onboarding" });
  };

  const handlePinDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...pin]; n[i] = v.slice(-1); setPin(n);
    if (v && i < 5) pinRefs.current[i + 1]?.focus();
    if (n.every((d) => d)) {
      toast.success("Logged in with PIN!");
      localStorage.setItem("user_role", "student");
      navigate({ to: "/student/dashboard" });
    }
  };
  const handlePinKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  return (
    <>
      {showEntry && <EntryScene onComplete={() => setShowEntry(false)} />}
      <div className="min-h-screen flex" style={{ opacity: showEntry ? 0 : 1, transition: "opacity 0.6s ease-in" }}>
        <Toaster theme="dark" />

        {/* ──── Background ──── */}
        <div className="fixed inset-0 pointer-events-none" style={{ background: "oklch(0.035 0.02 270)" }}>
          <GradientOrb index={0} size={600} x="-15%" y="-10%" color="oklch(0.7 0.15 200 / 0.04)" />
          <GradientOrb index={1} size={500} x="60%" y="40%" color="oklch(0.6 0.2 240 / 0.04)" />
          <GradientOrb index={2} size={400} x="30%" y="70%" color="oklch(0.65 0.2 280 / 0.03)" />
          <GridBg />
          <AuthParticles />
        </div>

        {/* ──── LEFT PANEL (Brand Experience) ──── */}
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

            <motion.div key={vpIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-8">
              <h2 className="text-4xl font-bold tracking-tight mb-6 leading-[1.05]">
                <span className="text-white">The Future of</span>
                <br />
                <span style={{
                  background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>
                  Education × AI
                </span>
              </h2>
              <p className="text-sm leading-relaxed max-w-sm mb-8" style={{ color: "oklch(1 0 0 / 0.45)" }}>
                {VALUE_PROPS[vpIndex]}
              </p>
              <div className="flex gap-1.5">
                {VALUE_PROPS.map((_, i) => (
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
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex flex-wrap gap-2 mb-4">
              {TRUST_ITEMS.map((item) => (
                <div
                  key={item}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px]"
                  style={{
                    background: "oklch(1 0 0 / 0.03)",
                    border: "1px solid oklch(1 0 0 / 0.06)",
                    color: "oklch(1 0 0 / 0.4)",
                  }}
                >
                  <Shield className="w-2.5 h-2.5" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                  {item}
                </div>
              ))}
            </div>
            <div className="text-[10px]" style={{ color: "oklch(1 0 0 / 0.25)" }}>
              <span className="font-semibold" style={{ color: "oklch(0.7 0.15 200)" }}>36,000+</span> students · {" "}
              <span className="font-semibold" style={{ color: "oklch(0.7 0.15 200)" }}>800+</span> teachers · {" "}
              <span className="font-semibold" style={{ color: "oklch(0.7 0.15 200)" }}>120+</span> schools
            </div>
          </div>
        </div>

        {/* ──── RIGHT PANEL (Auth Form) ──── */}
        <div className="w-full lg:w-[60%] flex items-center justify-center p-4 sm:p-8 z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...spring, delay: 0.15 }}
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
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.9), oklch(0.6 0.2 240 / 0.9))" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-semibold text-white">EduNex</span>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-1">Welcome to EduNex</h1>
              <p className="text-sm" style={{ color: "oklch(1 0 0 / 0.45)" }}>Choose your role to continue</p>
            </div>

            {/* Role Picker */}
            <div className="grid grid-cols-2 gap-2.5 mb-8">
              {ROLES.map((r) => (
                <motion.button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-3 rounded-xl text-left transition-all duration-200"
                  style={{
                    background: role === r.id ? "oklch(0.7 0.15 200 / 0.1)" : "oklch(1 0 0 / 0.03)",
                    border: role === r.id ? "1px solid oklch(0.7 0.15 200 / 0.25)" : "1px solid oklch(1 0 0 / 0.06)",
                    boxShadow: role === r.id ? "0 0 15px oklch(0.7 0.15 200 / 0.1)" : "none",
                  }}
                >
                  <r.icon className={`w-4 h-4 mb-1.5 ${role === r.id ? "text-neon" : "text-white/40"}`} />
                  <div className={`text-xs font-medium ${role === r.id ? "text-white" : "text-white/60"}`}>{r.label}</div>
                  <div className="text-[10px] mt-0.5" style={{ color: "oklch(1 0 0 / 0.3)" }}>{r.desc}</div>
                </motion.button>
              ))}
            </div>

            {/* Tab Switcher */}
            <div
              className="flex gap-1 p-0.5 rounded-xl mb-6"
              style={{ background: "oklch(1 0 0 / 0.04)" }}
            >
              {(["login", "register", "pin"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg transition-all duration-200"
                  style={{
                    background: tab === t ? "oklch(0.7 0.15 200 / 0.15)" : "transparent",
                    color: tab === t ? "oklch(0.8 0.12 200)" : "oklch(1 0 0 / 0.4)",
                    fontWeight: tab === t ? 600 : 400,
                  }}
                >
                  {t === "login" ? "Sign In" : t === "register" ? "Register" : "PIN"}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "login" && (
                <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="space-y-3">
                  <button
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group"
                    style={{
                      background: "oklch(0.7 0.15 200 / 0.08)",
                      border: "1px solid oklch(0.7 0.15 200 / 0.2)",
                      color: "oklch(0.8 0.12 200)",
                      boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.1)",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.7 0.15 200 / 0.12)"; e.currentTarget.style.boxShadow = "0 0 30px oklch(0.7 0.15 200 / 0.2)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.7 0.15 200 / 0.08)"; e.currentTarget.style.boxShadow = "0 0 20px oklch(0.7 0.15 200 / 0.1)"; }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0"><rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1.5"/><rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1.5"/><rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1.5"/><rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1.5"/></svg>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white group-hover:text-white transition-colors">Continue with Microsoft</div>
                      <div className="text-[10px]" style={{ color: "oklch(1 0 0 / 0.35)" }}>School or work account · Entra ID · Azure AD</div>
                    </div>
                  </button>

                  <button
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                    style={{ border: "1px solid oklch(1 0 0 / 0.08)", color: "oklch(1 0 0 / 0.6)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.04)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.9)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "oklch(1 0 0 / 0.6)"; }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.05 3.621-5.09 3.621-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
                    Continue with Google
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }} /></div>
                    <div className="relative flex justify-center">
                      <span className="px-2 text-[10px]" style={{ color: "oklch(1 0 0 / 0.25)", background: "oklch(0.06 0.03 270)" }}>or sign in with email</span>
                    </div>
                  </div>

                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
                    className="w-full h-11 px-4 text-sm rounded-xl text-white placeholder: transition-all"
                    style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; e.currentTarget.style.boxShadow = "0 0 10px oklch(0.7 0.15 200 / 0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; e.currentTarget.style.boxShadow = "none"; }} />
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password"
                    className="w-full h-11 px-4 text-sm rounded-xl text-white transition-all"
                    style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; e.currentTarget.style.boxShadow = "0 0 10px oklch(0.7 0.15 200 / 0.1)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; e.currentTarget.style.boxShadow = "none"; }} />
                  <div className="flex justify-end">
                    <Link to="/auth/reset-password" className="text-[11px] transition-colors" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>
                      Forgot password?
                    </Link>
                  </div>
                  <button onClick={submitLogin} disabled={busy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                      color: "#fff",
                      boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
                    }}
                    onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.boxShadow = "0 0 40px oklch(0.7 0.15 200 / 0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 20px oklch(0.7 0.15 200 / 0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    {busy ? "Signing in..." : "Sign in"} <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {tab === "register" && (
                <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="space-y-3">
                  <button
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200"
                    style={{
                      background: "oklch(0.7 0.15 200 / 0.08)",
                      border: "1px solid oklch(0.7 0.15 200 / 0.2)",
                      boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.1)",
                    }}
                  >
                    <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0"><rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1.5"/><rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1.5"/><rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1.5"/><rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1.5"/></svg>
                    <div className="text-left">
                      <div className="text-sm font-medium text-white">Continue with Microsoft</div>
                      <div className="text-[10px]" style={{ color: "oklch(1 0 0 / 0.35)" }}>School or work account · Entra ID · Azure AD</div>
                    </div>
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200"
                    style={{ border: "1px solid oklch(1 0 0 / 0.08)", color: "oklch(1 0 0 / 0.6)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.04)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.05 3.621-5.09 3.621-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
                    Continue with Google
                  </button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center"><div className="w-full" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }} /></div>
                    <div className="relative flex justify-center">
                      <span className="px-2 text-[10px]" style={{ color: "oklch(1 0 0 / 0.25)", background: "oklch(0.06 0.03 270)" }}>or register with email</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="First name"
                      className="w-full h-11 px-4 text-sm rounded-xl transition-all"
                      style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; }} />
                    <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Last name"
                      className="w-full h-11 px-4 text-sm rounded-xl transition-all"
                      style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; }} />
                  </div>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
                    className="w-full h-11 px-4 text-sm rounded-xl transition-all"
                    style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; }} />
                  <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password"
                    className="w-full h-11 px-4 text-sm rounded-xl transition-all"
                    style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; }}
                    onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; }} />
                  <button onClick={submitRegister} disabled={busy}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                      color: "#fff",
                      boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
                    }}
                    onMouseEnter={(e) => { if (!busy) { e.currentTarget.style.boxShadow = "0 0 40px oklch(0.7 0.15 200 / 0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 20px oklch(0.7 0.15 200 / 0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    {busy ? "Creating account..." : "Create account"} <ArrowRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {tab === "pin" && (
                <motion.div key="pin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
                  {pinStep === "name" ? (
                    <div className="space-y-3">
                      <div className="text-center mb-4">
                        <KeyRound className="w-10 h-10 mx-auto mb-2" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                        <p className="text-sm" style={{ color: "oklch(1 0 0 / 0.45)" }}>Enter your name to join with a PIN</p>
                      </div>
                      <input type="text" value={pinName} onChange={(e) => setPinName(e.target.value)} placeholder="First name"
                        className="w-full h-11 px-4 text-sm rounded-xl transition-all"
                        style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; }} />
                      <input type="text" value={pinLname} onChange={(e) => setPinLname(e.target.value)} placeholder="Last name"
                        className="w-full h-11 px-4 text-sm rounded-xl transition-all"
                        style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; }} />
                      <button onClick={() => pinName && pinLname ? setPinStep("pin") : toast.error("Enter your name")}
                        disabled={!pinName || !pinLname}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-50"
                        style={{
                          background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                          color: "#fff",
                          boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)",
                        }}>
                        Continue <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 text-center">
                      <KeyRound className="w-10 h-10 mx-auto" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }} />
                      <p className="text-sm" style={{ color: "oklch(1 0 0 / 0.45)" }}>Enter the 6-digit PIN from your teacher</p>
                      <div className="flex justify-center gap-2">
                        {pin.map((d, i) => (
                          <input key={i} ref={(r) => { pinRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={d}
                            onChange={(e) => handlePinDigit(i, e.target.value)} onKeyDown={(e) => handlePinKey(i, e)}
                            className="w-11 h-12 text-center text-lg font-bold rounded-xl transition-all"
                            style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.08)", color: "#fff", outline: "none" }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.4)"; e.currentTarget.style.boxShadow = "0 0 10px oklch(0.7 0.15 200 / 0.2)"; }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.08)"; e.currentTarget.style.boxShadow = "none"; }} />
                        ))}
                      </div>
                      <button onClick={() => setPinStep("name")} className="flex items-center justify-center gap-1 text-xs w-full" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                        <ChevronLeft className="w-3 h-3" /> Back
                      </button>
                      <p className="text-[10px]" style={{ color: "oklch(1 0 0 / 0.25)" }}>
                        Don't have a PIN?{" "}
                        <Link to="/auth/student" className="transition-colors" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>Sign in instead</Link>
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {tab !== "pin" && (
              <p className="mt-6 text-center text-xs" style={{ color: "oklch(1 0 0 / 0.25)" }}>
                {tab === "login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={() => setTab(tab === "login" ? "register" : "login")} className="transition-colors" style={{ color: "oklch(0.7 0.15 200 / 0.6)" }}>
                  {tab === "login" ? "Create one" : "Sign in"}
                </button>
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
