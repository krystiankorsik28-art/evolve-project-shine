import { useState, useMemo, useEffect } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, ShieldCheck,
  GraduationCap, Users, School, Building2, Loader2, CheckCircle2,
  KeyRound, UserPlus, ChevronLeft, Hash, AlertTriangle, Fingerprint, User,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAuth } from "@/lib/auth/auth-context";
import { studentPinLogin } from "@/lib/student-auth.functions";

const ROLE_DASHBOARD: Record<string, string> = {
  student: "/student/dashboard",
  teacher: "/teacher",
  parent: "/student/dashboard",
  admin: "/admin",
};

const ROLES = [
  { id: "student" as const, label: "Uczeń", icon: GraduationCap, desc: "Materiały, zadania, oceny" },
  { id: "teacher" as const, label: "Nauczyciel", icon: Users, desc: "Klasy, oceny, materiały" },
  { id: "parent" as const, label: "Rodzic", icon: School, desc: "Postępy i frekwencja dziecka" },
  { id: "admin" as const, label: "Dyrektor / Admin", icon: Building2, desc: "Zarządzanie szkołą" },
];

type RoleId = (typeof ROLES)[number]["id"];
type Mode = "login" | "register" | "forgot";
type Tab = "quick" | "account";

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const role = (session.user.user_metadata?.role as string) || "student";
        throw redirect({ to: ROLE_DASHBOARD[role] || "/student/dashboard", replace: true });
      }
    } catch (e: any) {
      if (e && typeof e === "object" && "to" in e) throw e;
    }
  },
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Logowanie — EduNex" },
      { name: "description", content: "Zaloguj się do platformy edukacyjnej EduNex jako uczeń, rodzic, nauczyciel lub administrator." },
    ],
  }),
});

function BgAnimation() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" style={{ background: "oklch(0.035 0.02 270)" }}>
      <div className="absolute inset-0" style={{
        backgroundImage: `linear-gradient(oklch(1 0 0 / 0.02) 1px, transparent 1px), linear-gradient(90deg, oklch(1 0 0 / 0.02) 1px, transparent 1px)`,
        backgroundSize: "64px 64px",
      }} />
      <motion.div
        className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.82 0.12 200 / 0.06), transparent 60%)", filter: "blur(80px)" }}
        animate={{ x: [0, 40, -30, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.7 0.2 240 / 0.04), transparent 60%)", filter: "blur(80px)" }}
        animate={{ x: [0, -30, 40, 0], y: [0, 30, -20, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-[30%] right-[30%] w-[300px] h-[300px] rounded-full"
        style={{ background: "radial-gradient(circle, oklch(0.8 0.1 60 / 0.03), transparent 60%)", filter: "blur(60px)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Field({ type = "text", value, onChange, placeholder, autoComplete, rightSlot }: {
  type?: string; value: string; onChange: (v: string) => void;
  placeholder: string; autoComplete?: string; rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-12 px-4 text-sm rounded-lg outline-none transition-all duration-200 text-white placeholder:text-white/20"
        style={{
          background: "oklch(1 0 0 / 0.04)",
          border: "1px solid oklch(1 0 0 / 0.1)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.3)";
          e.currentTarget.style.background = "oklch(1 0 0 / 0.06)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.1)";
          e.currentTarget.style.background = "oklch(1 0 0 / 0.04)";
        }}
      />
      {rightSlot && <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>}
    </div>
  );
}

function PrimaryButton({ children, loading, ...props }: any) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      style={{
        background: "oklch(0.82 0.12 200)",
        color: "#000",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "oklch(0.85 0.12 200)";
        e.currentTarget.style.boxShadow = "0 0 24px oklch(0.82 0.12 200 / 0.3)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "oklch(0.82 0.12 200)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4">
      <path fill="#F25022" d="M1 1h10v10H1z"/>
      <path fill="#7FBA00" d="M13 1h10v10H13z"/>
      <path fill="#00A4EF" d="M1 13h10v10H1z"/>
      <path fill="#FFB900" d="M13 13h10v10H13z"/>
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithProvider, signUpWithEmail, resetPassword } = useAuth();

  const [tab, setTab] = useState<Tab>("quick");
  const [mode, setMode] = useState<Mode>("login");
  const [role, setRole] = useState<RoleId>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const [qFirst, setQFirst] = useState("");
  const [qLast, setQLast] = useState("");
  const [qPin, setQPin] = useState("");

  const [adminCode, setAdminCode] = useState("");
  const [adminConsent, setAdminConsent] = useState(false);

  const roleMeta = useMemo(() => ROLES.find((r) => r.id === role)!, [role]);
  const isAdmin = role === "admin";

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (qFirst.trim().length < 2 || qLast.trim().length < 2) {
      toast.error("Wpisz imię i nazwisko");
      return;
    }
    if (!/^[0-9]{6}$/.test(qPin)) {
      toast.error("Kod musi mieć 6 cyfr");
      return;
    }
    setLoading(true);
    try {
      const res = await studentPinLogin({
        data: { first_name: qFirst.trim(), last_name: qLast.trim(), pin: qPin },
      });
      toast.success(`Witaj ${res.student_name}!`);
      navigate({ to: "/student/exam/$attemptId", params: { attemptId: res.attempt_id }, replace: true });
    } catch (err: any) {
      toast.error(err?.message || "Nie udało się zalogować");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Wpisz e-mail i hasło"); return; }
    if (isAdmin) {
      if (!/^[0-9]{6,8}$/.test(adminCode)) {
        toast.error("Wpisz kod administratora (6–8 cyfr)");
        return;
      }
      if (!adminConsent) {
        toast.error("Potwierdź zgodność z polityką bezpieczeństwa");
        return;
      }
    }
    setLoading(true);
    const { error } = await signInWithEmail(email, password);
    setLoading(false);
    if (error) { toast.error(error); return; }
    if (remember) {
      localStorage.setItem("edunex_email", email);
      localStorage.setItem("edunex_remember", "true");
    } else {
      localStorage.removeItem("edunex_email");
      localStorage.removeItem("edunex_remember");
    }
    toast.success("Zalogowano pomyślnie");
    navigate({ to: ROLE_DASHBOARD[role] || "/student/dashboard", replace: true });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName) { toast.error("Wypełnij wszystkie wymagane pola"); return; }
    if (password.length < 8) { toast.error("Hasło musi mieć min. 8 znaków"); return; }
    if (password !== confirm) { toast.error("Hasła nie są takie same"); return; }
    setLoading(true);
    const { error } = await signUpWithEmail(email, password, role, { first_name: firstName, last_name: lastName });
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Konto utworzone! Sprawdź e-mail aby je potwierdzić.");
    setMode("login");
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { toast.error("Wpisz adres e-mail"); return; }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) { toast.error(error); return; }
    toast.success("Wysłaliśmy link do resetu hasła na Twój e-mail");
    setMode("login");
  };

  const handleSSO = async (provider: "google" | "microsoft" | "github") => {
    try {
      setLoading(true);
      await signInWithProvider(provider as any);
    } catch (err: any) {
      toast.error(err?.message || "Logowanie nie powiodło się");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <Toaster theme="dark" position="top-center" />
      <BgAnimation />

      <Link to="/" className="absolute top-6 left-6 z-10 flex items-center gap-2 text-sm transition-colors" style={{ color: "oklch(1 0 0 / 0.35)" }}>
        <ChevronLeft className="w-4 h-4" /> Strona główna
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] rounded-2xl p-8"
        style={{
          background: "oklch(0.055 0.03 270)",
          border: "1px solid oklch(1 0 0 / 0.08)",
          boxShadow: "0 24px 80px oklch(0 0 0 / 0.5)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-[10px] grid place-items-center" style={{
            background: "linear-gradient(135deg, oklch(0.82 0.12 200), oklch(0.7 0.20 240))",
          }}>
            <Sparkles className="w-[18px] h-[18px] text-black" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight">EduNex</div>
            <div className="text-xs" style={{ color: "oklch(1 0 0 / 0.35)" }}>Platforma edukacyjna nowej generacji</div>
          </div>
        </div>

        <div className="relative flex gap-1 p-0.5 rounded-lg mb-6" style={{ background: "oklch(1 0 0 / 0.04)" }}>
          <motion.div
            layout
            className="absolute top-0.5 bottom-0.5 w-[calc(50%-2px)] rounded-md"
            style={{
              left: tab === "quick" ? 2 : "calc(50% + 0px)",
              background: "oklch(1 0 0 / 0.08)",
              transition: "left 0.3s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
          <button type="button" onClick={() => setTab("quick")}
            className="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors"
            style={{ color: tab === "quick" ? "#fff" : "oklch(1 0 0 / 0.35)" }}>
            <Hash className="w-3.5 h-3.5" /> Wejście kodem
          </button>
          <button type="button" onClick={() => setTab("account")}
            className="relative z-10 flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-colors"
            style={{ color: tab === "account" ? "#fff" : "oklch(1 0 0 / 0.35)" }}>
            <Mail className="w-3.5 h-3.5" /> Konto e-mail
          </button>
        </div>

        {tab === "quick" && (
          <motion.div key="quick" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            <h1 className="text-lg font-bold text-white tracking-tight">Szybkie wejście</h1>
            <p className="text-sm mt-1 mb-5" style={{ color: "oklch(1 0 0 / 0.4)" }}>
              Wpisz imię, nazwisko i 6-cyfrowy kod od nauczyciela.
            </p>
            <form onSubmit={handleQuickLogin} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field value={qFirst} onChange={setQFirst} placeholder="Imię" autoComplete="given-name" />
                <Field value={qLast} onChange={setQLast} placeholder="Nazwisko" autoComplete="family-name" />
              </div>
              <Field value={qPin} onChange={(v) => setQPin(v.replace(/\D/g, "").slice(0, 6))} placeholder="Kod (6 cyfr)" autoComplete="one-time-code" />
              <div className="flex justify-center gap-1.5 pt-1 pb-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div key={i} animate={{ scale: i < qPin.length ? 1.15 : 1, backgroundColor: i < qPin.length ? "oklch(0.75 0.2 150 / 0.9)" : "oklch(1 0 0 / 0.12)" }} transition={{ type: "spring", stiffness: 400, damping: 20 }} className="w-2 h-2 rounded-full" />
                ))}
              </div>
              <PrimaryButton loading={loading}>
                Dołącz do egzaminu <ArrowRight className="w-4 h-4" />
              </PrimaryButton>
              <p className="text-xs text-center" style={{ color: "oklch(1 0 0 / 0.25)" }}>Kod działa raz, dla jednego egzaminu.</p>
            </form>
          </motion.div>
        )}

        {tab === "account" && (
        <>
        <AnimatePresence mode="wait">
          <motion.div key={mode} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>
            <h1 className="text-lg font-bold text-white tracking-tight">
              {mode === "login" && "Zaloguj się"}
              {mode === "register" && "Załóż konto"}
              {mode === "forgot" && "Reset hasła"}
            </h1>
            <p className="text-sm mt-1 mb-5" style={{ color: "oklch(1 0 0 / 0.4)" }}>
              {mode === "login" && "Witaj z powrotem!"}
              {mode === "register" && "Dołącz do EduNex w kilka sekund."}
              {mode === "forgot" && "Wyślemy link do zmiany hasła."}
            </p>
          </motion.div>
        </AnimatePresence>

        {mode !== "forgot" && (
          <div className="mb-5">
            <label className="text-xs font-medium mb-2 block" style={{ color: "oklch(1 0 0 / 0.35)" }}>Rola</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ROLES.map((r) => {
                const Ic = r.icon;
                const active = role === r.id;
                return (
                  <button key={r.id} type="button" onClick={() => setRole(r.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all text-left"
                    style={{
                      background: active ? "oklch(1 0 0 / 0.08)" : "oklch(1 0 0 / 0.02)",
                      border: `1px solid ${active ? "oklch(1 0 0 / 0.2)" : "oklch(1 0 0 / 0.06)"}`,
                      color: active ? "oklch(1 0 0)" : "oklch(1 0 0 / 0.5)",
                    }}
                  >
                    <Ic className="w-4 h-4 shrink-0" />
                    <span className="truncate">{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {mode === "login" && isAdmin && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex items-start gap-2 p-3 rounded-lg text-xs"
            style={{ background: "oklch(0.7 0.2 80 / 0.08)", border: "1px solid oklch(0.7 0.2 80 / 0.2)", color: "oklch(0.8 0.15 80)" }}>
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Logowanie administratora wymaga dodatkowego kodu 2FA.</span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.form key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}
            onSubmit={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot} className="space-y-3"
          >
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-2">
                <Field value={firstName} onChange={setFirstName} placeholder="Imię" autoComplete="given-name" />
                <Field value={lastName} onChange={setLastName} placeholder="Nazwisko" autoComplete="family-name" />
              </div>
            )}
            <Field type="email" value={email} onChange={setEmail} placeholder="Adres e-mail" autoComplete="email" />
            {mode !== "forgot" && (
              <Field type={showPass ? "text" : "password"} value={password} onChange={setPassword}
                placeholder="Hasło" autoComplete={mode === "login" ? "current-password" : "new-password"}
                rightSlot={
                  <button type="button" onClick={() => setShowPass((s) => !s)} className="transition-colors" style={{ color: "oklch(1 0 0 / 0.25)" }}>
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            )}
            {mode === "register" && (
              <Field type={showPass ? "text" : "password"} value={confirm} onChange={setConfirm} placeholder="Powtórz hasło" autoComplete="new-password" />
            )}
            {mode === "login" && isAdmin && (
              <>
                <Field value={adminCode} onChange={(v) => setAdminCode(v.replace(/\D/g, "").slice(0, 8))} placeholder="Kod 2FA administratora" autoComplete="one-time-code" />
                <label className="flex items-start gap-2 text-xs cursor-pointer leading-snug" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                  <input type="checkbox" checked={adminConsent} onChange={(e) => setAdminConsent(e.target.checked)} className="w-3.5 h-3.5 accent-white rounded mt-0.5 shrink-0" />
                  Potwierdzam, że logowanie odbywa się z zaufanego urządzenia.
                </label>
              </>
            )}
            {mode === "login" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="w-3.5 h-3.5 accent-white rounded" />
                  Pamiętaj mnie
                </label>
                <button type="button" onClick={() => setMode("forgot")} className="font-medium transition-colors" style={{ color: "oklch(1 0 0 / 0.4)" }}>
                  Nie pamiętam hasła
                </button>
              </div>
            )}
            <div className="pt-1">
              <PrimaryButton loading={loading}>
                {mode === "login" && <>Zaloguj się <ArrowRight className="w-4 h-4" /></>}
                {mode === "register" && <>Utwórz konto <ArrowRight className="w-4 h-4" /></>}
                {mode === "forgot" && <>Wyślij link <KeyRound className="w-4 h-4" /></>}
              </PrimaryButton>
            </div>
          </motion.form>
        </AnimatePresence>

        {mode !== "forgot" && !isAdmin && (
          <>
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px" style={{ background: "oklch(1 0 0 / 0.06)" }} />
              <span className="text-[11px]" style={{ color: "oklch(1 0 0 / 0.25)" }}>lub</span>
              <div className="flex-1 h-px" style={{ background: "oklch(1 0 0 / 0.06)" }} />
            </div>
            <div className="space-y-2">
              <button onClick={() => handleSSO("google")}
                className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)", color: "oklch(1 0 0 / 0.6)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.06)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.03)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.6)"; }}
              >
                <GoogleIcon /> Kontynuuj z Google
              </button>
              <button onClick={() => handleSSO("microsoft")}
                className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)", color: "oklch(1 0 0 / 0.6)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.06)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.03)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.6)"; }}
              >
                <MicrosoftIcon /> Kontynuuj z Microsoft
              </button>
              <button onClick={() => handleSSO("github")}
                className="w-full flex items-center justify-center gap-2.5 h-11 rounded-lg text-sm font-medium transition-all duration-200"
                style={{ background: "oklch(1 0 0 / 0.03)", border: "1px solid oklch(1 0 0 / 0.08)", color: "oklch(1 0 0 / 0.6)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.06)"; e.currentTarget.style.color = "#fff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.03)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.6)"; }}
              >
                <GitHubIcon /> Kontynuuj z GitHub
              </button>
            </div>
          </>
        )}

        <div className="mt-6 text-center text-sm" style={{ color: "oklch(1 0 0 / 0.35)" }}>
          {mode === "login" && (
            <>Nie masz konta?{" "}<button onClick={() => setMode("register")} className="text-white font-medium hover:underline">Zarejestruj się</button></>
          )}
          {mode === "register" && (
            <>Masz już konto?{" "}<button onClick={() => setMode("login")} className="text-white font-medium hover:underline">Zaloguj się</button></>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="text-white/70 hover:text-white font-medium">← Wróć do logowania</button>
          )}
        </div>
        </>
        )}

        <div className="mt-6 pt-4 flex items-center justify-center gap-4 text-[10px]" style={{ color: "oklch(1 0 0 / 0.2)", borderTop: "1px solid oklch(1 0 0 / 0.05)" }}>
          <span>Szyfrowanie E2E</span>
          <span>RODO</span>
          <span>Serwery UE</span>
        </div>
      </motion.div>
    </div>
  );
}
