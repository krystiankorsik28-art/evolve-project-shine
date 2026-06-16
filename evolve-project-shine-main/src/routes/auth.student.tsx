import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SocialLogin } from "@/components/auth/SocialLogin";

export const Route = createFileRoute("/auth/student")({
  component: StudentAuth,
  head: () => ({ meta: [{ title: "Student — EduNex" }] }),
});

function StudentAuth() {
  const [tab, setTab] = useState<"login" | "register" | "pin">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const [pinStep, setPinStep] = useState<"name" | "pin">("name");
  const [pinName, setPinName] = useState("");
  const [pinLname, setPinLname] = useState("");
  const [pin, setPin] = useState<string[]>(["","","","","",""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const submitLogin = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("user_role", "student");
    setBusy(false);
    navigate({ to: "/student/dashboard" });
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
    const n = [...pin];
    n[i] = v.slice(-1);
    setPin(n);
    if (v && i < 5) pinRefs.current[i + 1]?.focus();
    if (n.every((d) => d)) { toast.success("Logged in with PIN!"); localStorage.setItem("user_role", "student"); navigate({ to: "/student/dashboard" }); }
  };
  const handlePinKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
  };

  return (
    <AuthLayout title="The AI Platform for Modern Education" subtitle="Generate exams, tutor students with AI, and track progress in real-time.">
      <Toaster theme="dark" />
      <h1 className="text-xl font-semibold text-white mb-1">Student</h1>
      <p className="text-sm text-white/40 mb-6">Sign in or use a PIN to join an exam</p>

      <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04] mb-6">
        {(["login", "register", "pin"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-all ${tab === t ? "bg-white text-[#0a0a12]" : "text-white/40 hover:text-white/60"}`}
          >
            {t === "login" ? "Sign in" : t === "register" ? "Register" : "PIN"}
          </button>
        ))}
      </div>

      {tab === "login" && (
        <div className="space-y-3">
          <SocialLogin mode="login" />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="px-2 text-[10px] text-white/20 bg-[#0a0a12]">or</span></div>
          </div>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <div className="flex justify-end">
            <Link to="/auth/reset-password" className="text-[10px] text-cyan-400/60 hover:text-cyan-400">Forgot password?</Link>
          </div>
          <button onClick={submitLogin} disabled={busy} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
            {busy ? "Signing in..." : "Sign in"} <ArrowRight className="w-3 h-3" />
          </button>
          <div className="flex justify-center gap-4 text-[10px] text-white/30 mt-2">
            <Link to="/auth/teacher" className="hover:text-white/60">Teacher</Link>
            <Link to="/auth/admin" className="hover:text-white/60">Admin</Link>
            <Link to="/auth/parent" className="hover:text-white/60">Parent</Link>
          </div>
        </div>
      )}

      {tab === "register" && (
        <div className="space-y-3">
          <SocialLogin mode="register" />
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative flex justify-center"><span className="px-2 text-[10px] text-white/20 bg-[#0a0a12]">or</span></div>
          </div>
          <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="First name" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Last name" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <button onClick={submitRegister} disabled={busy} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
            {busy ? "Creating..." : "Create account"} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {tab === "pin" && (
        pinStep === "name" ? (
          <div className="space-y-3">
            <input type="text" value={pinName} onChange={(e) => setPinName(e.target.value)} placeholder="First name" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
            <input type="text" value={pinLname} onChange={(e) => setPinLname(e.target.value)} placeholder="Last name" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
            <button onClick={() => pinName && pinLname ? setPinStep("pin") : toast.error("Enter your name")} disabled={!pinName || !pinLname} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
              Next <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 text-center">
            <KeyRound className="w-10 h-10 mx-auto text-cyan-400/60" />
            <p className="text-sm text-white/60">Enter the PIN from your teacher</p>
            <div className="flex justify-center gap-2">
              {pin.map((d, i) => (
                <input key={i} ref={(r) => { pinRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => handlePinDigit(i, e.target.value)} onKeyDown={(e) => handlePinKey(i, e)}
                  className="w-10 h-11 text-center text-base font-bold rounded-lg bg-white/[0.04] border border-white/[0.08] text-white outline-none focus:border-cyan-500/40 transition-colors" />
              ))}
            </div>
            <button onClick={() => setPinStep("name")} className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors w-full">
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
          </div>
        )
      )}
    </AuthLayout>
  );
}
