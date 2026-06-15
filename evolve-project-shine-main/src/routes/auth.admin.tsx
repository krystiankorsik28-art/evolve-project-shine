import { useState, useRef, useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, KeyRound, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { AuthProvider } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/auth/admin")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Logowanie — Admin | EduNex" }] }),
});

function AdminLogin() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [otp, setOtp] = useState<string[]>(["","","","","",""]);
  const [countdown, setCountdown] = useState(30);
  const [busy, setBusy] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (step === 2 && countdown > 0) { const t = setTimeout(() => setCountdown((c) => c - 1), 1000); return () => clearTimeout(t); }
  }, [step, countdown]);

  const sendOtp = async () => {
    if (!email || !pass) { toast.error("Wypełnij wszystkie pola"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 600));
    setBusy(false);
    setStep(3);
    setCountdown(30);
    toast.success("Kod OTP wysłany na email");
    setTimeout(() => otpRefs.current[0]?.focus(), 100);
  };

  const verifyOtp = () => {
    if (otp.some((d) => !d)) { toast.error("Wpisz kod 6-cyfrowy"); return; }
    setBusy(true);
    setTimeout(() => {
      localStorage.setItem("user_role", "admin");
      toast.success("Zweryfikowano!");
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

  return (
    <AuthProvider>
    <div className="auth-bg">
      <Toaster theme="dark" />
      <div className="auth-form">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-1.5 text-white/30 hover:text-white/60 transition-colors text-xs mb-5">
            <ChevronLeft className="w-3 h-3"/>EduNex
          </Link>

          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={`w-2 h-2 rounded-full ${step === 1 ? "bg-accent" : "bg-accent/30"}`} />
            <div className="w-8 h-0.5 bg-white/[0.06]" />
            <div className={`w-2 h-2 rounded-full ${step === 3 ? "bg-accent" : "bg-white/20"}`} />
          </div>
        </div>

        {step === 1 && (
          <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <div className="space-y-4">
              <div>
                <label className="auth-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@edunex.pl" className="auth-input pl-10" />
                </div>
              </div>
              <div>
                <label className="auth-label">Hasło</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type={showPass ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="••••••••" className="auth-input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Ukryj hasło" : "Pokaż hasło"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><Eye className="w-4 h-4"/></button>
                </div>
              </div>
            </div>
            <button onClick={sendOtp} disabled={busy} className="auth-submit mt-5">
              {busy ? "Wysyłanie..." : "Wyślij kod OTP"}
            </button>
            <SocialLogin mode="login" />
            <div className="flex justify-center gap-4 text-xs text-white/30 mt-2">
              <Link to="/auth/teacher" className="hover:text-white/60">Nauczyciel</Link>
              <Link to="/auth/student" className="hover:text-white/60">Uczeń</Link>
              <Link to="/auth/parent" className="hover:text-white/60">Rodzic</Link>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <div className="text-center mb-6">
              <KeyRound className="w-12 h-12 mx-auto text-accent/60 mb-3" />
              <div className="text-sm text-white/70">Wpisz kod weryfikacyjny</div>
              <div className="text-xs text-white/40 mt-1">Kod 6-cyfrowy z emaila</div>
            </div>
            <div className="flex justify-center gap-2.5 mb-6">
              {otp.map((d, i) => (
                <input key={i} ref={(r) => { otpRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={d}
                  onChange={(e) => handleOtpDigit(i, e.target.value)} onKeyDown={(e) => handleOtpKey(i, e)}
                  className="w-11 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-lg font-bold text-white focus:border-accent/40 focus:outline-none focus:shadow-[0_0_0_3px_oklch(0.65_0.15_240_/_0.1)] transition-all" />
              ))}
            </div>
            <button onClick={verifyOtp} disabled={busy} className="auth-submit">
              {busy ? "Weryfikacja..." : "Zweryfikuj"}
            </button>
            <div className="mt-4 text-center">
              {countdown > 0 ? (
                <span className="text-xs text-white/30">Wyślij ponownie za {countdown}s</span>
              ) : (
                <button onClick={sendOtp} className="text-xs text-accent/70 hover:text-accent">Wyślij ponownie</button>
              )}
            </div>
            <button onClick={() => { setStep(1); setOtp(["","","","","",""]); }} className="btn-ghost w-full mt-2 justify-center text-xs"><ChevronLeft className="w-3 h-3"/>Wróć</button>
          </div>
        )}
      </div>
    </div>
    </AuthProvider>
  );
}
