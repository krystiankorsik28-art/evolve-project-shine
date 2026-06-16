import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, KeyRound, ChevronLeft, Shield } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { AuthLayout } from "@/components/auth/AuthLayout";

export const Route = createFileRoute("/auth/admin")({
  component: AdminAuth,
  head: () => ({ meta: [{ title: "Admin — EduNex" }] }),
});

function AdminAuth() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [otp, setOtp] = useState<string[]>(["","","","","",""]);
  const [countdown, setCountdown] = useState(30);
  const [busy, setBusy] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && countdown > 0) { const t = setTimeout(() => setCountdown((c) => c - 1), 1000); return () => clearTimeout(t); }
  }, [step, countdown]);

  const sendOtp = async () => {
    if (!email || !pass) { toast.error("Fill all fields"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setStep(3);
    setCountdown(30);
    toast.success("OTP code sent to email");
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const verifyOtp = () => {
    if (otp.some((d) => !d)) { toast.error("Enter 6-digit code"); return; }
    setBusy(true);
    setTimeout(() => {
      localStorage.setItem("user_role", "admin");
      toast.success("Verified!");
      setBusy(false);
      navigate({ to: "/admin" });
    }, 600);
  };

  const handleOtpDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...otp];
    n[i] = v.slice(-1);
    setOtp(n);
    if (v && i < 5) otpRefs.current[i + 1]?.focus();
  };
  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const trustItems = ["Enterprise security", "OTP verification", "Audit logging"];

  return (
    <AuthLayout title="Enterprise-Grade Security" subtitle="Admin access requires two-factor authentication.">
      <Toaster theme="dark" />
      <h1 className="text-xl font-semibold text-white mb-1">Admin</h1>
      <p className="text-sm text-white/40 mb-6">Two-step verification</p>

      <div className="flex items-center justify-center gap-2 mb-6">
        <div className={`w-2 h-2 rounded-full ${step === 1 || step === 3 ? "bg-cyan-400" : "bg-white/20"}`} />
        <div className="w-8 h-0.5 bg-white/[0.06]" />
        <div className={`w-2 h-2 rounded-full ${step === 3 ? "bg-cyan-400" : "bg-white/20"}`} />
      </div>

      {step === 1 && (
        <div className="space-y-3">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Password" className="w-full h-10 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
          <button onClick={sendOtp} disabled={busy} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
            {busy ? "Sending..." : "Send OTP"} <ArrowRight className="w-3 h-3" />
          </button>
          <div className="space-y-2 mt-4">
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-2 text-[10px] text-white/30">
                <Shield className="w-3 h-3 text-cyan-400/60" />
                {item}
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 text-[10px] text-white/30 mt-2">
            <Link to="/auth/teacher" className="hover:text-white/60">Teacher</Link>
            <Link to="/auth/student" className="hover:text-white/60">Student</Link>
            <Link to="/auth/parent" className="hover:text-white/60">Parent</Link>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 text-center">
          <KeyRound className="w-10 h-10 mx-auto text-cyan-400/60" />
          <p className="text-sm text-white/60">Enter the 6-digit code from your email</p>
          <div className="flex justify-center gap-2">
            {otp.map((d, i) => (
              <input key={i} ref={(r) => { otpRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={d}
                onChange={(e) => handleOtpDigit(i, e.target.value)} onKeyDown={(e) => handleOtpKey(i, e)}
                className="w-10 h-11 text-center text-base font-bold rounded-lg bg-white/[0.04] border border-white/[0.08] text-white outline-none focus:border-cyan-500/40 transition-colors" />
            ))}
          </div>
          <button onClick={verifyOtp} disabled={busy} className="w-full flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 transition-all">
            {busy ? "Verifying..." : "Verify"}
          </button>
          <div className="text-center">
            {countdown > 0 ? (
              <span className="text-[10px] text-white/30">Resend in {countdown}s</span>
            ) : (
              <button onClick={sendOtp} className="text-[10px] text-cyan-400/60 hover:text-cyan-400">Resend code</button>
            )}
          </div>
          <button onClick={() => { setStep(1); setOtp(["","","","","",""]); }} className="flex items-center justify-center gap-1 text-xs text-white/30 hover:text-white/60 transition-colors w-full">
            <ChevronLeft className="w-3 h-3" /> Back
          </button>
        </div>
      )}
    </AuthLayout>
  );
}
