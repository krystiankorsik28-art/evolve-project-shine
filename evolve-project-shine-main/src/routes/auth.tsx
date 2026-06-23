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

function GlassBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden" style={{
      background: "radial-gradient(ellipse at top, #1e1b4b 0%, #0f0a2e 40%, #06030f 100%)",
    }}>
      <motion.div
        animate={{ x: [0, 40, -20, 0], y: [0, -30, 20, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(120,80,255,0.28), transparent 60%)", filter: "blur(70px)" }}
      />
      <motion.div
        animate={{ x: [0, -30, 30, 0], y: [0, 20, -20, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[700px] h-[700px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(60,180,255,0.20), transparent 60%)", filter: "blur(70px)" }}
      />
      <motion.div
        animate={{ opacity: [0.25, 0.5, 0.25] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(255,180,120,0.10), transparent 60%)", filter: "blur(80px)" }}
      />
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
      }} />
    </div>
  );
}

const glassPanel: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  backdropFilter: "blur(28px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.14)",
  boxShadow: "0 30px 90px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.14)",
};

function Field({ icon: Icon, type = "text", value, onChange, placeholder, autoComplete, rightSlot }: {
  icon: any; type?: string; value: string; onChange: (v: string) => void;
  placeholder: string; autoComplete?: string; rightSlot?: React.ReactNode;
}) {
  return (
    <div className="relative flex items-center">
      <Icon className="absolute left-3.5 w-4 h-4 pointer-events-none text-white/40" />
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-12 pl-10 pr-12 text-sm rounded-xl outline-none transition-all text-white placeholder:text-white/30"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.4)";
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
        }}
      />
      {rightSlot && <div className="absolute right-2">{rightSlot}</div>}
    </div>
  );
}

function PrimaryButton({ children, loading, ...props }: any) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full h-12 flex items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      style={{
        background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(220,230,255,0.85))",
        color: "rgba(15,15,30,1)",
        boxShadow: "0 10px 30px rgba(255,255,255,0.18)",
      }}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : children}
    </button>
  );
}

function SSOButton({ label, icon, onClick }: { label: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-12 flex items-center justify-center gap-2.5 rounded-xl text-sm font-medium text-white/90 transition-all"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.14)",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.14)"; }}
    >
      {icon}
      <span>{label}</span>
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
    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white">
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
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6">
      <Toaster theme="dark" position="top-center" />
      <GlassBackground />

      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors">
        <ChevronLeft className="w-4 h-4" /> Strona główna
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md rounded-3xl p-7 sm:p-8 relative"
        style={glassPanel}
      >
        <div className="flex items-center gap-3 mb-7">
          <div className="w-11 h-11 rounded-2xl grid place-items-center" style={{
            background: "linear-gradient(135deg, rgba(160,140,255,0.9), rgba(100,180,255,0.9))",
            boxShadow: "0 8px 24px rgba(120,100,255,0.4)",
          }}>
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-base font-bold text-white tracking-tight">EduNex</div>
            <div className="text-[11px] text-white/50">Platforma edukacyjna</div>
          </div>
        </div>

        <div className="relative grid grid-cols-2 gap-1 p-1 rounded-2xl mb-6"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <motion.div
            layout
            className="absolute top-1 bottom-1 w-[calc(50%-4px)] rounded-xl"
            style={{
              left: tab === "quick" ? 4 : "calc(50% + 0px)",
              background: "linear-gradient(135deg, rgba(160,140,255,0.35), rgba(100,180,255,0.30))",
              border: "1px solid rgba(255,255,255,0.25)",
              boxShadow: "0 8px 24px rgba(120,100,255,0.25)",
              transition: "left 0.35s cubic-bezier(0.16,1,0.3,1)",
            }}
          />
          <button
            type="button"
            onClick={() => setTab("quick")}
            className="relative z-10 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: tab === "quick" ? "#fff" : "rgba(255,255,255,0.55)" }}
          >
            <Hash className="w-3.5 h-3.5" /> Wejście kodem
          </button>
          <button
            type="button"
            onClick={() => setTab("account")}
            className="relative z-10 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: tab === "account" ? "#fff" : "rgba(255,255,255,0.55)" }}
          >
            <Mail className="w-3.5 h-3.5" /> Konto e-mail
          </button>
        </div>

        {tab === "quick" && (
          <motion.div
            key="quick-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex items-start gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl grid place-items-center shrink-0"
                style={{ background: "rgba(120,200,150,0.18)", border: "1px solid rgba(120,200,150,0.35)" }}>
                <GraduationCap className="w-5 h-5" style={{ color: "rgb(160,230,180)" }} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">Szybkie wejście dla ucznia</h1>
                <p className="text-[12px] text-white/55 mt-0.5">
                  Wpisz imię, nazwisko i 6-cyfrowy kod otrzymany od nauczyciela.
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickLogin} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Field icon={User} value={qFirst} onChange={setQFirst} placeholder="Imię" autoComplete="given-name" />
                <Field icon={User} value={qLast} onChange={setQLast} placeholder="Nazwisko" autoComplete="family-name" />
              </div>
              <Field
                icon={Hash}
                value={qPin}
                onChange={(v) => setQPin(v.replace(/\D/g, "").slice(0, 6))}
                placeholder="Kod (6 cyfr)"
                autoComplete="one-time-code"
              />
              <div className="flex justify-center gap-1.5 pt-1">
                {Array.from({ length: 6 }).map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: i < qPin.length ? 1.15 : 1,
                      backgroundColor: i < qPin.length ? "rgba(160,230,180,0.9)" : "rgba(255,255,255,0.15)",
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                    className="w-2 h-2 rounded-full"
                  />
                ))}
              </div>
              <div className="pt-2">
                <PrimaryButton loading={loading}>
                  Dołącz do egzaminu <ArrowRight className="w-4 h-4" />
                </PrimaryButton>
              </div>
              <p className="text-[11px] text-center text-white/40 pt-1">
                Nie tworzymy konta — kod działa raz, dla jednego egzaminu.
              </p>
            </form>
          </motion.div>
        )}

        {tab === "account" && (
        <>
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {mode === "login" && "Zaloguj się"}
              {mode === "register" && "Załóż konto"}
              {mode === "forgot" && "Reset hasła"}
            </h1>
            <p className="text-sm text-white/50 mt-1">
              {mode === "login" && "Witaj z powrotem! Zaloguj się do swojego konta."}
              {mode === "register" && "Dołącz do EduNex w kilka sekund."}
              {mode === "forgot" && "Wyślemy link do zmiany hasła na Twój e-mail."}
            </p>
          </motion.div>
        </AnimatePresence>

        {mode !== "forgot" && (
          <div className="mt-6">
            <label className="block text-[11px] uppercase tracking-wider font-semibold text-white/40 mb-2">Wybierz rolę</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map((r) => {
                const Ic = r.icon;
                const active = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
                    style={{
                      background: active ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.04)",
                      border: `1px solid ${active ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.10)"}`,
                      color: active ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.7)",
                    }}
                  >
                    <Ic className="w-4 h-4 shrink-0" />
                    <span className="truncate">{r.label}</span>
                    {active && <CheckCircle2 className="w-3.5 h-3.5 ml-auto opacity-80" />}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-white/40 mt-2">{roleMeta.desc}</p>
          </div>
        )}

        {mode === "login" && isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 flex items-start gap-2 p-3 rounded-xl text-[11px]"
            style={{
              background: "rgba(255,180,60,0.10)",
              border: "1px solid rgba(255,180,60,0.30)",
              color: "rgba(255,220,150,0.95)",
            }}
          >
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>
              Logowanie administratora wymaga dodatkowego kodu weryfikacyjnego (2FA)
              oraz akceptacji polityki bezpieczeństwa. Sesje admin są krótsze i logowane.
            </span>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            onSubmit={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot}
            className="mt-6 space-y-3"
          >
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-2">
                <Field icon={UserPlus} value={firstName} onChange={setFirstName} placeholder="Imię" autoComplete="given-name" />
                <Field icon={UserPlus} value={lastName} onChange={setLastName} placeholder="Nazwisko" autoComplete="family-name" />
              </div>
            )}

            <Field icon={Mail} type="email" value={email} onChange={setEmail} placeholder="Adres e-mail" autoComplete="email" />

            {mode !== "forgot" && (
              <Field
                icon={Lock}
                type={showPass ? "text" : "password"}
                value={password}
                onChange={setPassword}
                placeholder="Hasło"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                rightSlot={
                  <button type="button" onClick={() => setShowPass((s) => !s)}
                    className="p-2 text-white/40 hover:text-white/80 transition-colors">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            )}

            {mode === "register" && (
              <Field icon={Lock} type={showPass ? "text" : "password"} value={confirm} onChange={setConfirm} placeholder="Powtórz hasło" autoComplete="new-password" />
            )}

            {mode === "login" && isAdmin && (
              <>
                <Field
                  icon={Fingerprint}
                  value={adminCode}
                  onChange={(v) => setAdminCode(v.replace(/\D/g, "").slice(0, 8))}
                  placeholder="Kod 2FA administratora"
                  autoComplete="one-time-code"
                />
                <label className="flex items-start gap-2 text-[11px] text-white/65 cursor-pointer leading-snug">
                  <input
                    type="checkbox"
                    checked={adminConsent}
                    onChange={(e) => setAdminConsent(e.target.checked)}
                    className="w-3.5 h-3.5 accent-white rounded mt-0.5 shrink-0"
                  />
                  Potwierdzam, że logowanie odbywa się z zaufanego urządzenia i akceptuję politykę bezpieczeństwa szkoły.
                </label>
              </>
            )}

            {mode === "login" && (
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-white/60 cursor-pointer">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="w-3.5 h-3.5 accent-white rounded" />
                  Pamiętaj mnie
                </label>
                <button type="button" onClick={() => setMode("forgot")}
                  className="text-white/70 hover:text-white transition-colors font-medium">
                  Nie pamiętam hasła
                </button>
              </div>
            )}

            <div className="pt-2">
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
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
              <span className="text-[11px] uppercase tracking-wider text-white/40">lub kontynuuj przez</span>
              <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.12)" }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <SSOButton label="Google" icon={<GoogleIcon />} onClick={() => handleSSO("google")} />
              <SSOButton label="Microsoft" icon={<MicrosoftIcon />} onClick={() => handleSSO("microsoft")} />
              <SSOButton label="GitHub" icon={<GitHubIcon />} onClick={() => handleSSO("github")} />
            </div>
          </>
        )}

        <div className="mt-6 text-center text-sm text-white/50">
          {mode === "login" && (
            <>Nie masz konta?{" "}
              <button onClick={() => setMode("register")} className="text-white font-semibold hover:underline">
                Zarejestruj się
              </button>
            </>
          )}
          {mode === "register" && (
            <>Masz już konto?{" "}
              <button onClick={() => setMode("login")} className="text-white font-semibold hover:underline">
                Zaloguj się
              </button>
            </>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="text-white/70 hover:text-white font-medium">
              ← Wróć do logowania
            </button>
          )}
        </div>
        </>
        )}

        <div className="mt-7 pt-5 flex items-center justify-center gap-4 text-[10px] text-white/35" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Szyfrowanie E2E</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> RODO</span>
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Serwery UE</span>
        </div>
      </motion.div>
    </div>
  );
}
