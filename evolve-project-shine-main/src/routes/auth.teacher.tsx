import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SocialLogin } from "@/components/auth/SocialLogin";

export const Route = createFileRoute("/auth/teacher")({
  component: TeacherAuth,
  head: () => ({ meta: [{ title: "Teacher — EduNex" }] }),
});

function TeacherAuth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submitLogin = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("user_role", "teacher");
    setBusy(false);
    navigate({ to: "/teacher" });
  };

  const submitRegister = async () => {
    if (!fname || !lname || !email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    setBusy(false);
    toast.success("Account created! Pending admin approval.");
  };

  return (
    <AuthLayout title="The AI Platform for Modern Education" subtitle="Generate exams, tutor with AI, and track progress in real-time.">
      <Toaster theme="dark" />
      <h1 className="text-xl font-semibold text-white mb-1">Teacher</h1>
      <p className="text-sm text-white/40 mb-6">Sign in to your teacher account</p>

      <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.04] mb-6">
        {(["login", "register"] as const).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-all ${mode === m ? "bg-white text-[#0a0a12]" : "text-white/40 hover:text-white/60"}`}
          >
            {m === "login" ? "Sign in" : "Register"}
          </button>
        ))}
      </div>

      {mode === "login" ? (
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
            <Link to="/auth/student" className="hover:text-white/60">Student</Link>
            <Link to="/auth/admin" className="hover:text-white/60">Admin</Link>
            <Link to="/auth/parent" className="hover:text-white/60">Parent</Link>
          </div>
        </div>
      ) : (
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
          <p className="text-[10px] text-white/30">Account requires admin approval.</p>
          <button onClick={submitRegister} disabled={busy} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
            {busy ? "Creating..." : "Create account"} <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
