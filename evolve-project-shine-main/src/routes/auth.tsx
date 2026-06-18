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
      <div className="min-h-screen bg-bg flex" style={{ opacity: showEntry ? 0 : 1, transition: "opacity 0.6s ease-in" }}>
      <Toaster theme="dark" />

      {/* ──── LEFT PANEL (Brand Experience) ──── */}
      <div className="hidden lg:flex w-[40%] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg-alt to-bg pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,_oklch(0.85_0.18_160_/_0.08),_transparent_60%)] pointer-events-none" />
        <div className="absolute inset-0 scanline opacity-30" />

        <div className="relative">
          <div className="flex items-center gap-2.5 mb-12">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.3)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">EduNex</span>
          </div>

          <motion.div key={vpIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="mb-8">
            <h2 className="text-4xl font-bold tracking-tight mb-6 leading-[1.05]">
              <span className="text-white">The Future of</span>
              <br />
              <span className="neon-text">Education × AI</span>
            </h2>
            <p className="text-fg-muted text-sm leading-relaxed max-w-sm mb-8">
              {VALUE_PROPS[vpIndex]}
            </p>
            <div className="flex gap-1">
              {VALUE_PROPS.map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${i === vpIndex ? "bg-neon w-6" : "bg-white/[0.08]"}`} />
              ))}
            </div>
          </motion.div>
        </div>

        <div className="relative">
          <div className="flex flex-wrap gap-2 mb-4">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.06] text-[10px] text-fg-muted">
                <Shield className="w-2.5 h-2.5 text-neon/60" />
                {item}
              </div>
            ))}
          </div>
          <div className="text-[10px] text-fg-subtle">
            <span className="text-neon font-semibold">36,000+</span> students · <span className="text-neon font-semibold">800+</span> teachers · <span className="text-neon font-semibold">120+</span> schools
          </div>
        </div>
      </div>

      {/* ──── RIGHT PANEL (Auth Form) ──── */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 sm:p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={spring} className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-semibold">EduNex</span>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome to EduNex</h1>
            <p className="text-sm text-fg-muted">Choose your role to continue</p>
          </div>

          {/* Role Picker */}
          <div className="grid grid-cols-2 gap-2 mb-8">
            {ROLES.map((r) => (
              <motion.button key={r.id} onClick={() => setRole(r.id)}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  role === r.id
                    ? "border-neon/40 bg-neon/5 shadow-[0_0_15px_oklch(0.85_0.18_160_/_0.1)]"
                    : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15]"
                }`}
              >
                <r.icon className={`w-4 h-4 mb-1.5 ${role === r.id ? "text-neon" : "text-white/40"}`} />
                <div className={`text-xs font-medium ${role === r.id ? "text-white" : "text-white/60"}`}>{r.label}</div>
                <div className="text-[10px] text-fg-subtle mt-0.5">{r.desc}</div>
              </motion.button>
            ))}
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04] mb-6">
            {(["login", "register", "pin"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-all ${
                  tab === t ? "bg-white text-bg font-medium" : "text-fg-muted hover:text-white/60"
                }`}
              >
                {t === "login" ? "Sign In" : t === "register" ? "Register" : "PIN"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {tab === "login" && (
              <motion.div key="login" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="space-y-3">
                {/* Microsoft Login */}
                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-xl border border-neon/20 bg-neon/5 text-neon hover:bg-neon/10 transition-all shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.1)] hover:shadow-[0_0_30px_oklch(0.85_0.18_160_/_0.2)] group">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0"><rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1.5"/><rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1.5"/><rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1.5"/><rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1.5"/></svg>
                  <div className="text-left">
                    <div className="text-sm font-medium text-white group-hover:text-white transition-colors">Continue with Microsoft</div>
                    <div className="text-[10px] text-fg-muted">School or work account · Entra ID · Azure AD</div>
                  </div>
                </button>

                <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl border border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.05 3.621-5.09 3.621-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
                  Continue with Google
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
                  <div className="relative flex justify-center"><span className="px-2 text-[10px] text-fg-subtle bg-bg">or sign in with email</span></div>
                </div>

                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
                  className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 focus:shadow-[0_0_10px_oklch(0.85_0.18_160_/_0.1)] transition-all" />
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password"
                  className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 focus:shadow-[0_0_10px_oklch(0.85_0.18_160_/_0.1)] transition-all" />
                <div className="flex justify-end">
                  <Link to="/auth/reset-password" className="text-[11px] text-neon/60 hover:text-neon transition-colors">Forgot password?</Link>
                </div>
                <button onClick={submitLogin} disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-neon text-black rounded-xl hover:bg-neon/90 transition-all shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.3)] hover:shadow-[0_0_40px_oklch(0.85_0.18_160_/_0.5)] disabled:opacity-50">
                  {busy ? "Signing in..." : "Sign in"} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {tab === "register" && (
              <motion.div key="register" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="space-y-3">
                <button className="w-full flex items-center justify-center gap-3 px-4 py-3 text-sm font-medium rounded-xl border border-neon/20 bg-neon/5 text-neon hover:bg-neon/10 transition-all shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.1)]">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0"><rect x="1" y="1" width="10.5" height="10.5" fill="#F25022" rx="1.5"/><rect x="12.5" y="1" width="10.5" height="10.5" fill="#7FBA00" rx="1.5"/><rect x="1" y="12.5" width="10.5" height="10.5" fill="#00A4EF" rx="1.5"/><rect x="12.5" y="12.5" width="10.5" height="10.5" fill="#FFB900" rx="1.5"/></svg>
                  Continue with Microsoft
                </button>
                <button className="w-full flex items-center justify-center gap-3 px-4 py-2.5 text-sm font-medium rounded-xl border border-white/[0.08] text-white/70 hover:bg-white/[0.04] hover:text-white transition-all">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0"><path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.678 1.24 6.65l4.026 3.115Z"/><path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 0 1-6.723-4.823l-4.04 3.067A11.965 11.965 0 0 0 12 24c2.933 0 5.735-1.043 7.834-3l-3.793-2.987Z"/><path fill="#4A90E2" d="M19.834 21c2.195-2.05 3.621-5.09 3.621-9 0-.71-.109-1.473-.272-2.182H12v4.637h6.436c-.317 1.559-1.17 2.766-2.395 3.558L19.834 21Z"/><path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 0 1 4.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 0 0 0 12c0 1.92.445 3.73 1.237 5.335l4.04-3.067Z"/></svg>
                  Continue with Google
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
                  <div className="relative flex justify-center"><span className="px-2 text-[10px] text-fg-subtle bg-bg">or register with email</span></div>
                </div>

                <div className="flex gap-3">
                  <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="First name" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 transition-all" />
                  <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Last name" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 transition-all" />
                </div>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 transition-all" />
                <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 transition-all" />
                <button onClick={submitRegister} disabled={busy}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-neon text-black rounded-xl hover:bg-neon/90 transition-all shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.3)] disabled:opacity-50">
                  {busy ? "Creating account..." : "Create account"} <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {tab === "pin" && (
              <motion.div key="pin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring}>
                {pinStep === "name" ? (
                  <div className="space-y-3">
                    <div className="text-center mb-4">
                      <KeyRound className="w-10 h-10 mx-auto text-neon/60 mb-2" />
                      <p className="text-sm text-fg-muted">Enter your name to join with a PIN</p>
                    </div>
                    <input type="text" value={pinName} onChange={(e) => setPinName(e.target.value)} placeholder="First name" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 transition-all" />
                    <input type="text" value={pinLname} onChange={(e) => setPinLname(e.target.value)} placeholder="Last name" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 transition-all" />
                    <button onClick={() => pinName && pinLname ? setPinStep("pin") : toast.error("Enter your name")}
                      disabled={!pinName || !pinLname}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-neon text-black rounded-xl hover:bg-neon/90 transition-all shadow-[0_0_20px_oklch(0.85_0.18_160_/_0.3)] disabled:opacity-50">
                      Continue <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4 text-center">
                    <KeyRound className="w-10 h-10 mx-auto text-neon/60" />
                    <p className="text-sm text-fg-muted">Enter the 6-digit PIN from your teacher</p>
                    <div className="flex justify-center gap-2">
                      {pin.map((d, i) => (
                        <input key={i} ref={(r) => { pinRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={d}
                          onChange={(e) => handlePinDigit(i, e.target.value)} onKeyDown={(e) => handlePinKey(i, e)}
                          className="w-11 h-12 text-center text-lg font-bold rounded-xl bg-white/[0.04] border border-white/[0.08] text-white outline-none focus:border-neon/40 focus:shadow-[0_0_10px_oklch(0.85_0.18_160_/_0.2)] transition-all" />
                      ))}
                    </div>
                    <button onClick={() => setPinStep("name")} className="flex items-center justify-center gap-1 text-xs text-fg-muted hover:text-white/60 transition-colors w-full">
                      <ChevronLeft className="w-3 h-3" /> Back
                    </button>
                    <p className="text-[10px] text-fg-subtle">Don't have a PIN? <Link to="/auth/student" className="text-neon/60 hover:text-neon">Sign in instead</Link></p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {tab !== "pin" && (
            <p className="mt-6 text-center text-xs text-fg-subtle">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button onClick={() => setTab(tab === "login" ? "register" : "login")} className="text-neon/60 hover:text-neon transition-colors">
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
