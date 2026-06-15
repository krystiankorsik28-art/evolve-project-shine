import { useState, useRef } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, KeyRound, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { AuthProvider } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/auth/student")({
  component: StudentLogin,
  head: () => ({ meta: [{ title: "Logowanie — Uczeń | EduNex" }] }),
});

function StudentLogin() {
  const [tab, setTab] = useState<"login" | "register" | "pin">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const [pinStep, setPinStep] = useState<"name" | "pin">("name");
  const [pinName, setPinName] = useState("");
  const [pinLname, setPinLname] = useState("");
  const [pin, setPin] = useState<string[]>(["","","","","",""]);
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const submitLogin = async () => {
    if (!email || !pass) { toast.error("Wypełnij wszystkie pola"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("user_role", "student");
    setBusy(false);
    navigate({ to: "/student/dashboard" });
  };

  const submitRegister = async () => {
    if (!fname || !lname || !email || !pass) { toast.error("Wypełnij wszystkie pola"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    setBusy(false);
    toast.success("Konto utworzone! Sprawdź email.");
  };

  const handlePinDigit = (i: number, v: string) => {
    if (!/^\d*$/.test(v)) return;
    const n = [...pin];
    n[i] = v.slice(-1);
    setPin(n);
    if (v && i < 5) pinRefs.current[i + 1]?.focus();
    if (n.every((d) => d)) { toast.success("Zalogowano PIN-em!"); localStorage.setItem("user_role", "student"); navigate({ to: "/student/dashboard" }); }
  };
  const handlePinKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[i] && i > 0) pinRefs.current[i - 1]?.focus();
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
          <div className="flex items-center justify-center gap-1 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 w-fit mx-auto mb-6">
            {(["login", "register", "pin"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={`auth-tab ${tab === t ? "active" : ""}`}>
                {t === "login" ? <><Mail className="w-3.5 h-3.5"/>Zaloguj</> : t === "register" ? <><UserPlus className="w-3.5 h-3.5"/>Rejestracja</> : <><KeyRound className="w-3.5 h-3.5"/>PIN</>}
              </button>
            ))}
          </div>
        </div>

        {tab === "login" && (
          <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <div className="space-y-4">
              <div>
                <label className="auth-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="imie@szkola.pl" className="auth-input pl-10" />
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
            <div className="flex justify-end mt-1">
              <Link to="/auth/reset-password" className="text-xs text-white/40 hover:text-white/70 transition-colors">Nie pamiętasz hasła?</Link>
            </div>
            <button onClick={submitLogin} disabled={busy} className="auth-submit mt-5">
              {busy ? "Logowanie..." : "Zaloguj się"}
            </button>
            <SocialLogin mode="login" />
            <div className="flex justify-center gap-4 text-xs text-white/30 mt-2">
              <Link to="/auth/teacher" className="hover:text-white/60">Nauczyciel</Link>
              <Link to="/auth/admin" className="hover:text-white/60">Admin</Link>
              <Link to="/auth/parent" className="hover:text-white/60">Rodzic</Link>
            </div>
          </div>
        )}

        {tab === "register" && (
          <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="auth-label">Imię</label>
                  <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="Jan" className="auth-input" />
                </div>
                <div>
                  <label className="auth-label">Nazwisko</label>
                  <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Kowalski" className="auth-input" />
                </div>
              </div>
              <div>
                <label className="auth-label">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jan@szkola.pl" className="auth-input" />
              </div>
              <div>
                <label className="auth-label">Hasło</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type={showPass ? "text" : "password"} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Utwórz hasło" className="auth-input pl-10 pr-10" />
                  <button type="button" onClick={() => setShowPass(!showPass)} aria-label={showPass ? "Ukryj hasło" : "Pokaż hasło"} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"><Eye className="w-4 h-4"/></button>
                  </div>
                  {pass && (
                  <div className="mt-2">
                    <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-500 ${pass.length < 6 ? "pw-weak" : pass.length < 10 ? "pw-fair" : pass.length < 14 ? "pw-good" : "pw-strong"}`} />
                    </div>
                    <div className="text-[10px] text-white/30 mt-1">{pass.length < 6 ? "Słabe" : pass.length < 10 ? "Średnie" : pass.length < 14 ? "Dobre" : "Mocne"}</div>
                  </div>
                )}
              </div>
            </div>
            <button onClick={submitRegister} disabled={busy} className="auth-submit mt-5">
              {busy ? "Rejestracja..." : "Utwórz konto"}
            </button>
          </div>
        )}

        {tab === "pin" && (
          <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            {pinStep === "name" ? (
              <>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="auth-label">Imię</label>
                      <input type="text" value={pinName} onChange={(e) => setPinName(e.target.value)} placeholder="Jan" className="auth-input" />
                    </div>
                    <div>
                      <label className="auth-label">Nazwisko</label>
                      <input type="text" value={pinLname} onChange={(e) => setPinLname(e.target.value)} placeholder="Kowalski" className="auth-input" />
                    </div>
                  </div>
                </div>
                <button onClick={() => pinName && pinLname ? setPinStep("pin") : toast.error("Podaj imię i nazwisko")} disabled={!pinName || !pinLname} className="auth-submit mt-5">
                  Dalej <ArrowRight className="w-4 h-4"/>
                </button>
              </>
            ) : (
              <>
                <div className="text-center mb-6">
                  <KeyRound className="w-12 h-12 mx-auto text-accent/60 mb-3" />
                  <div className="text-sm text-white/70">Wpisz kod PIN</div>
                  <div className="text-xs text-white/40 mt-1">Otrzymasz go od nauczyciela</div>
                </div>
                <div className="flex justify-center gap-2.5">
                  {pin.map((d, i) => (
                    <input key={i} ref={(r) => { pinRefs.current[i] = r; }} type="text" inputMode="numeric" maxLength={1} value={d}
                      onChange={(e) => handlePinDigit(i, e.target.value)} onKeyDown={(e) => handlePinKey(i, e)}
                      className="w-11 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] text-center text-lg font-bold text-white focus:border-accent/40 focus:outline-none focus:shadow-[0_0_0_3px_oklch(0.65_0.15_240_/_0.1)] transition-all" />
                  ))}
                </div>
                <button onClick={() => setPinStep("name")} className="btn-ghost w-full mt-4 justify-center text-xs">
                  <ChevronLeft className="w-3 h-3"/>Wróć
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
    </AuthProvider>
  );
}
