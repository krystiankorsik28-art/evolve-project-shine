import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, ChevronLeft, Phone, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { SocialLogin } from "@/components/auth/SocialLogin";
import { AuthProvider } from "@/lib/auth/auth-context";

export const Route = createFileRoute("/auth/parent")({
  component: ParentLogin,
  head: () => ({ meta: [{ title: "Logowanie — Rodzic | EduNex" }] }),
});

function ParentLogin() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [phone, setPhone] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submitLogin = async () => {
    if (!email || !pass) { toast.error("Wypełnij wszystkie pola"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    localStorage.setItem("user_role", "parent");
    setBusy(false);
    navigate({ to: "/student/dashboard" });
  };

  const submitRegister = async () => {
    if (!fname || !lname || !email || !pass) { toast.error("Wypełnij wszystkie pola"); return; }
    setBusy(true);
    await new Promise((r) => setTimeout(r, 800));
    setBusy(false);
    toast.success("Konto utworzone! Sprawdź email, aby potwierdzić i dodać dziecko.");
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
            {(["login", "register"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} className={`auth-tab ${mode === m ? "active" : ""}`}>
                {m === "login" ? <><Mail className="w-3.5 h-3.5"/>Logowanie</> : <><UserPlus className="w-3.5 h-3.5"/>Rejestracja</>}
              </button>
            ))}
          </div>
        </div>

        {mode === "login" ? (
          <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <div className="space-y-4">
              <div>
                <label className="auth-label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rodzic@email.pl" className="auth-input pl-10" />
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
              <Link to="/auth/student" className="hover:text-white/60">Uczeń</Link>
              <Link to="/auth/admin" className="hover:text-white/60">Admin</Link>
            </div>
          </div>
        ) : (
          <div style={{ animation: "fadeSlideIn 0.35s ease-out" }}>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="auth-label">Imię</label><input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="Anna" className="auth-input" /></div>
                <div><label className="auth-label">Nazwisko</label><input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Kowalska" className="auth-input" /></div>
              </div>
              <div><label className="auth-label">Email</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="rodzic@email.pl" className="auth-input" /></div>
              <div>
                <label className="auth-label">Telefon (opcjonalny)</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+48 600 000 000" className="auth-input pl-10" />
                </div>
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
            <p className="text-[11px] text-white/30 mt-2">Po rejestracji sprawdź email, aby potwierdzić konto i dodać dziecko.</p>
            <button onClick={submitRegister} disabled={busy} className="auth-submit mt-4">
              {busy ? "Rejestracja..." : "Utwórz konto"}
            </button>
          </div>
        )}
      </div>
    </div>
    </AuthProvider>
  );
}
