import { useState, useMemo, useEffect, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate, redirect } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  GraduationCap,
  Users,
  School,
  Building2,
  Loader2,
  CheckCircle2,
  KeyRound,
  ChevronLeft,
  Hash,
  AlertTriangle,
  Fingerprint,
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
  { id: "student" as const, label: "Uczeń", icon: GraduationCap, desc: "Egzaminy, sprawdziany i wyniki" },
  { id: "teacher" as const, label: "Nauczyciel", icon: Users, desc: "Klasy, testy, sesje i raporty" },
  { id: "parent" as const, label: "Rodzic", icon: School, desc: "Postępy dziecka i powiadomienia" },
  { id: "admin" as const, label: "Dyrektor / Admin", icon: Building2, desc: "Zarządzanie szkołą i bezpieczeństwem" },
];

const SSO_PROVIDERS = [
  { id: "microsoft" as const, label: "Kontynuuj z Microsoft", icon: MicrosoftIcon },
  { id: "google" as const, label: "Kontynuuj z Google", icon: GoogleIcon },
  { id: "github" as const, label: "Kontynuuj z GitHub", icon: GitHubIcon },
];

type RoleId = (typeof ROLES)[number]["id"];
type Mode = "login" | "register" | "forgot";
type Tab = "quick" | "account";
type Provider = (typeof SSO_PROVIDERS)[number]["id"];

export const Route = createFileRoute("/auth")({
  beforeLoad: async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const {
        data: { session },
      } = await supabase.auth.getSession();
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
      {
        name: "description",
        content:
          "Zaloguj się do platformy edukacyjnej EduNex jako uczeń, rodzic, nauczyciel lub administrator.",
      },
    ],
  }),
});

function BgAnimation() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-[#f3f6fb]">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 18% 12%, rgba(0,103,184,0.16), transparent 28%), radial-gradient(circle at 82% 0%, rgba(80,132,214,0.16), transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(233,239,248,0.92))",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.32]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <motion.div
        className="absolute left-[8%] top-[12%] h-72 w-72 rounded-full bg-[#0078d4]/20 blur-3xl"
        animate={{ x: [0, 34, -18, 0], y: [0, -18, 22, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[8%] right-[10%] h-96 w-96 rounded-full bg-[#50e6ff]/15 blur-3xl"
        animate={{ x: [0, -28, 20, 0], y: [0, 22, -16, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function Field({
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  rightSlot,
}: {
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  autoComplete?: string;
  rightSlot?: ReactNode;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="h-12 w-full rounded-sm border border-[#8a8886] bg-white px-3 text-[15px] text-[#1b1b1b] outline-none transition-all duration-150 placeholder:text-[#605e5c] focus:border-[#0067b8] focus:shadow-[inset_0_-2px_0_#0067b8]"
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
      className="h-11 w-full rounded-sm bg-[#0067b8] px-5 text-sm font-semibold text-white shadow-sm transition-all duration-150 hover:bg-[#005da6] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
    >
      <span className="flex items-center justify-center gap-2">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
      </span>
    </button>
  );
}

function SSOButton({ provider, label, icon: Icon, onClick, disabled }: {
  provider: Provider;
  label: string;
  icon: () => JSX.Element;
  onClick: (provider: Provider) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(provider)}
      disabled={disabled}
      className="flex h-11 w-full items-center justify-center gap-3 rounded-sm border border-[#8a8886] bg-white text-sm font-semibold text-[#1f1f1f] transition-all duration-150 hover:border-[#323130] hover:bg-[#f7f7f7] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Icon />
      {label}
    </button>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

function MicrosoftIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const { signInWithEmail, signInWithProvider, signUpWithEmail, resetPassword } = useAuth();

  const [tab, setTab] = useState<Tab>("account");
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

  useEffect(() => {
    const savedRemember = localStorage.getItem("edunex_remember") === "true";
    const savedEmail = localStorage.getItem("edunex_email");
    if (savedRemember && savedEmail) {
      setEmail(savedEmail);
      setRemember(true);
    }
  }, []);

  const handleQuickLogin = async (e: FormEvent) => {
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

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Wpisz e-mail i hasło");
      return;
    }
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
    if (error) {
      toast.error(error);
      return;
    }
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }
    if (password.length < 8) {
      toast.error("Hasło musi mieć min. 8 znaków");
      return;
    }
    if (password !== confirm) {
      toast.error("Hasła nie są takie same");
      return;
    }
    setLoading(true);
    const { error } = await signUpWithEmail(email, password, role, {
      first_name: firstName,
      last_name: lastName,
    });
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Konto utworzone! Sprawdź e-mail aby je potwierdzić.");
    setMode("login");
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Wpisz adres e-mail");
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    toast.success("Wysłaliśmy link do resetu hasła na Twój e-mail");
    setMode("login");
  };

  const handleSSO = async (provider: Provider) => {
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
    <div className="relative min-h-screen overflow-hidden p-4 text-[#1f1f1f] sm:p-6 lg:p-10">
      <Toaster theme="light" position="top-center" />
      <BgAnimation />

      <Link
        to="/"
        className="absolute left-5 top-5 z-20 flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-sm font-semibold text-[#323130] shadow-sm backdrop-blur transition-colors hover:text-[#0067b8]"
      >
        <ChevronLeft className="h-4 w-4" /> Strona główna
      </Link>

      <div className="flex min-h-[calc(100vh-3rem)] items-center justify-center pt-14 lg:pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
          className="grid w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.18)] lg:grid-cols-[1.05fr_0.95fr]"
        >
          <aside className="relative hidden min-h-[720px] overflow-hidden bg-[#0f172a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(0,120,212,0.55),transparent_28%),radial-gradient(circle_at_82%_18%,rgba(80,230,255,0.22),transparent_30%),linear-gradient(145deg,#0f172a,#111827_48%,#062a4f)]" />
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.12) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

            <div className="relative z-10">
              <div className="mb-10 flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[12px] bg-white text-[#0067b8] shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-semibold tracking-tight">EduNex</div>
                  <div className="text-xs uppercase tracking-[0.28em] text-white/55">secure education cloud</div>
                </div>
              </div>

              <div className="max-w-md">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-[#bfe7ff] backdrop-blur">
                  <ShieldCheck className="h-3.5 w-3.5" /> Logowanie w stylu Microsoft
                </div>
                <h1 className="text-4xl font-semibold tracking-[-0.045em] text-white xl:text-5xl">
                  Jedno bezpieczne wejście do całej szkoły.
                </h1>
                <p className="mt-5 text-base leading-7 text-white/68">
                  Panel ucznia, nauczyciela, rodzica i administratora w jednej eleganckiej bramie logowania — czytelnie, szybko i bez chaosu.
                </p>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3">
                {[
                  ["SSO", "Google / Microsoft / GitHub"],
                  ["2FA", "Kod administratora"],
                  ["PIN", "Wejście ucznia na egzamin"],
                  ["RODO", "Serwery UE i audyt"],
                ].map(([title, desc]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.075] p-4 backdrop-blur">
                    <div className="text-sm font-semibold text-white">{title}</div>
                    <div className="mt-1 text-xs leading-5 text-white/55">{desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10 rounded-3xl border border-white/10 bg-white/[0.075] p-5 backdrop-blur-xl">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Fingerprint className="h-4 w-4 text-[#50e6ff]" /> Aktualny tryb
              </div>
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
                  <roleMeta.icon className="h-5 w-5 text-[#bfe7ff]" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{roleMeta.label}</div>
                  <div className="text-xs text-white/55">{tab === "quick" ? "Szybkie wejście kodem PIN" : roleMeta.desc}</div>
                </div>
              </div>
            </div>
          </aside>

          <main className="flex min-h-[720px] items-center justify-center px-5 py-8 sm:px-8 lg:px-12">
            <div className="w-full max-w-[430px]">
              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-[10px] bg-[#0067b8] text-white shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold tracking-tight">EduNex</div>
                    <div className="text-xs text-[#605e5c]">Bezpieczne logowanie szkolne</div>
                  </div>
                </div>
              </div>

              <div className="mb-6 flex items-center gap-2 text-[13px] font-semibold text-[#605e5c]">
                <span className="h-px flex-1 bg-[#edebe9]" />
                Microsoft-like sign in
                <span className="h-px flex-1 bg-[#edebe9]" />
              </div>

              <div className="mb-6 grid grid-cols-2 gap-0 rounded-sm border border-[#d2d0ce] bg-[#f8f8f8] p-1">
                <button
                  type="button"
                  onClick={() => setTab("account")}
                  className={`flex h-10 items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-all ${tab === "account" ? "bg-white text-[#0067b8] shadow-sm" : "text-[#605e5c] hover:text-[#323130]"}`}
                >
                  <Mail className="h-4 w-4" /> Konto
                </button>
                <button
                  type="button"
                  onClick={() => setTab("quick")}
                  className={`flex h-10 items-center justify-center gap-2 rounded-sm text-sm font-semibold transition-all ${tab === "quick" ? "bg-white text-[#0067b8] shadow-sm" : "text-[#605e5c] hover:text-[#323130]"}`}
                >
                  <Hash className="h-4 w-4" /> Kod PIN
                </button>
              </div>

              {tab === "quick" && (
                <motion.div key="quick" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}>
                  <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1b1b]">Dołącz do egzaminu</h1>
                  <p className="mt-2 text-sm leading-6 text-[#605e5c]">
                    Wpisz imię, nazwisko i 6-cyfrowy kod otrzymany od nauczyciela.
                  </p>

                  <form onSubmit={handleQuickLogin} className="mt-6 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field value={qFirst} onChange={setQFirst} placeholder="Imię" autoComplete="given-name" />
                      <Field value={qLast} onChange={setQLast} placeholder="Nazwisko" autoComplete="family-name" />
                    </div>
                    <Field
                      value={qPin}
                      onChange={(v) => setQPin(v.replace(/\D/g, "").slice(0, 6))}
                      placeholder="Kod egzaminu (6 cyfr)"
                      autoComplete="one-time-code"
                    />
                    <div className="flex justify-center gap-2 py-2">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: i < qPin.length ? 1.12 : 1,
                            backgroundColor: i < qPin.length ? "#0067b8" : "#d2d0ce",
                          }}
                          transition={{ type: "spring", stiffness: 420, damping: 22 }}
                          className="h-2.5 w-2.5 rounded-full"
                        />
                      ))}
                    </div>
                    <PrimaryButton loading={loading}>
                      Dołącz do egzaminu <ArrowRight className="h-4 w-4" />
                    </PrimaryButton>
                    <p className="text-center text-xs text-[#605e5c]">Kod PIN działa dla jednej aktywnej sesji egzaminacyjnej.</p>
                  </form>
                </motion.div>
              )}

              {tab === "account" && (
                <>
                  <AnimatePresence mode="wait">
                    <motion.div key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.15 }}>
                      <h1 className="text-2xl font-semibold tracking-[-0.03em] text-[#1b1b1b]">
                        {mode === "login" && "Zaloguj się"}
                        {mode === "register" && "Utwórz konto"}
                        {mode === "forgot" && "Reset hasła"}
                      </h1>
                      <p className="mt-2 text-sm leading-6 text-[#605e5c]">
                        {mode === "login" && "Użyj konta EduNex albo konta organizacji."}
                        {mode === "register" && "Załóż konto i wybierz rolę w systemie szkolnym."}
                        {mode === "forgot" && "Podaj adres e-mail, a wyślemy instrukcję resetu."}
                      </p>
                    </motion.div>
                  </AnimatePresence>

                  {mode !== "forgot" && (
                    <div className="mt-6">
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#605e5c]">Wybierz rolę</label>
                      <div className="grid grid-cols-2 gap-2">
                        {ROLES.map((r) => {
                          const Icon = r.icon;
                          const active = role === r.id;
                          return (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => setRole(r.id)}
                              className={`flex items-center gap-2 rounded-sm border px-3 py-2.5 text-left text-xs font-semibold transition-all ${active ? "border-[#0067b8] bg-[#eef6fd] text-[#005da6]" : "border-[#d2d0ce] bg-white text-[#605e5c] hover:border-[#8a8886] hover:text-[#323130]"}`}
                            >
                              <Icon className="h-4 w-4 shrink-0" />
                              <span className="truncate">{r.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {mode === "login" && isAdmin && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 flex items-start gap-2 rounded-sm border border-[#f3c911] bg-[#fff8d7] p-3 text-xs leading-5 text-[#6b5700]"
                    >
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>Logowanie administratora wymaga dodatkowego kodu 2FA i zaufanego urządzenia.</span>
                    </motion.div>
                  )}

                  <AnimatePresence mode="wait">
                    <motion.form
                      key={mode}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.16 }}
                      onSubmit={mode === "login" ? handleLogin : mode === "register" ? handleRegister : handleForgot}
                      className="mt-5 space-y-3"
                    >
                      {mode === "register" && (
                        <div className="grid grid-cols-2 gap-3">
                          <Field value={firstName} onChange={setFirstName} placeholder="Imię" autoComplete="given-name" />
                          <Field value={lastName} onChange={setLastName} placeholder="Nazwisko" autoComplete="family-name" />
                        </div>
                      )}

                      <Field type="email" value={email} onChange={setEmail} placeholder="Adres e-mail" autoComplete="email" />

                      {mode !== "forgot" && (
                        <Field
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={setPassword}
                          placeholder="Hasło"
                          autoComplete={mode === "login" ? "current-password" : "new-password"}
                          rightSlot={
                            <button type="button" onClick={() => setShowPass((s) => !s)} className="text-[#605e5c] transition-colors hover:text-[#0067b8]">
                              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          }
                        />
                      )}

                      {mode === "register" && (
                        <Field type={showPass ? "text" : "password"} value={confirm} onChange={setConfirm} placeholder="Powtórz hasło" autoComplete="new-password" />
                      )}

                      {mode === "login" && isAdmin && (
                        <>
                          <Field
                            value={adminCode}
                            onChange={(v) => setAdminCode(v.replace(/\D/g, "").slice(0, 8))}
                            placeholder="Kod 2FA administratora"
                            autoComplete="one-time-code"
                          />
                          <label className="flex cursor-pointer items-start gap-2 text-xs leading-5 text-[#605e5c]">
                            <input
                              type="checkbox"
                              checked={adminConsent}
                              onChange={(e) => setAdminConsent(e.target.checked)}
                              className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-[#0067b8]"
                            />
                            Potwierdzam, że logowanie odbywa się z zaufanego urządzenia.
                          </label>
                        </>
                      )}

                      {mode === "login" && (
                        <div className="flex items-center justify-between pt-1 text-xs">
                          <label className="flex cursor-pointer items-center gap-2 text-[#605e5c]">
                            <input
                              type="checkbox"
                              checked={remember}
                              onChange={(e) => setRemember(e.target.checked)}
                              className="h-3.5 w-3.5 accent-[#0067b8]"
                            />
                            Nie wylogowuj mnie
                          </label>
                          <button type="button" onClick={() => setMode("forgot")} className="font-semibold text-[#0067b8] hover:underline">
                            Nie pamiętam hasła
                          </button>
                        </div>
                      )}

                      <div className="pt-2">
                        <PrimaryButton loading={loading}>
                          {mode === "login" && <>Zaloguj się <ArrowRight className="h-4 w-4" /></>}
                          {mode === "register" && <>Utwórz konto <ArrowRight className="h-4 w-4" /></>}
                          {mode === "forgot" && <>Wyślij link <KeyRound className="h-4 w-4" /></>}
                        </PrimaryButton>
                      </div>
                    </motion.form>
                  </AnimatePresence>

                  {mode !== "forgot" && !isAdmin && (
                    <>
                      <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[#edebe9]" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8886]">lub</span>
                        <div className="h-px flex-1 bg-[#edebe9]" />
                      </div>
                      <div className="space-y-2">
                        {SSO_PROVIDERS.map((provider) => (
                          <SSOButton
                            key={provider.id}
                            provider={provider.id}
                            label={provider.label}
                            icon={provider.icon}
                            onClick={handleSSO}
                            disabled={loading}
                          />
                        ))}
                      </div>
                    </>
                  )}

                  <div className="mt-6 text-center text-sm text-[#605e5c]">
                    {mode === "login" && (
                      <>
                        Nie masz konta?{" "}
                        <button onClick={() => setMode("register")} className="font-semibold text-[#0067b8] hover:underline">
                          Zarejestruj się
                        </button>
                      </>
                    )}
                    {mode === "register" && (
                      <>
                        Masz już konto?{" "}
                        <button onClick={() => setMode("login")} className="font-semibold text-[#0067b8] hover:underline">
                          Zaloguj się
                        </button>
                      </>
                    )}
                    {mode === "forgot" && (
                      <button onClick={() => setMode("login")} className="font-semibold text-[#0067b8] hover:underline">
                        ← Wróć do logowania
                      </button>
                    )}
                  </div>
                </>
              )}

              <div className="mt-8 grid grid-cols-3 gap-2 border-t border-[#edebe9] pt-4 text-center text-[11px] font-semibold text-[#605e5c]">
                <div className="flex items-center justify-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-[#107c10]" /> RODO</div>
                <div className="flex items-center justify-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#0067b8]" /> 2FA</div>
                <div className="flex items-center justify-center gap-1.5"><Fingerprint className="h-3.5 w-3.5 text-[#0067b8]" /> SSO</div>
              </div>
            </div>
          </main>
        </motion.div>
      </div>
    </div>
  );
}
