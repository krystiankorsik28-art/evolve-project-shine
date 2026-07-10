import { useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
  Layers3,
  Loader2,
  LockKeyhole,
  Mail,
  School,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";
import type { AuthProvider } from "@/lib/auth/auth-types";
import { studentPinLogin } from "@/lib/student-auth.functions";

type RoleId = "student" | "teacher" | "parent" | "admin";
type Provider = "microsoft" | "google" | "github";
type Mode = "login" | "forgot";

const ROLE_DASHBOARD: Record<RoleId, string> = {
  student: "/student/dashboard",
  teacher: "/teacher",
  parent: "/parent",
  admin: "/admin",
};

const roles: Array<{
  id: RoleId;
  label: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "teacher", label: "Nauczyciel", desc: "Egzaminy, klasy, NexAi i raporty", icon: Users },
  { id: "student", label: "Uczeń", desc: "Wejście kontem lub kodem PIN", icon: GraduationCap },
  {
    id: "admin",
    label: "Dyrekcja / Admin",
    desc: "Role, licencja i bezpieczeństwo",
    icon: Building2,
  },
  { id: "parent", label: "Rodzic", desc: "Postęp dziecka i komunikaty", icon: School },
];

const providers: Array<{ id: Provider; label: string }> = [
  { id: "microsoft", label: "Microsoft" },
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

const accessHighlights: Array<{
  icon: ComponentType<{ className?: string }>;
  title: string;
  text: string;
}> = [
  {
    icon: Building2,
    title: "Dostęp według roli",
    text: "Po zalogowaniu system prowadzi do właściwego panelu i zakresu pracy.",
  },
  {
    icon: LockKeyhole,
    title: "Konto lub logowanie SSO",
    text: "E-mail i hasło oraz Microsoft, Google i GitHub przez Supabase Auth.",
  },
  {
    icon: KeyRound,
    title: "Szybkie wejście ucznia",
    text: "Imię, nazwisko i 6-cyfrowy PIN bez zakładania pełnego konta.",
  },
];

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ location }) => {
    if (location.pathname !== "/auth") return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const role = (session.user.user_metadata?.role ||
          session.user.app_metadata?.role ||
          "student") as RoleId;
        throw redirect({ to: ROLE_DASHBOARD[role] || "/student/dashboard", replace: true });
      }
    } catch (error) {
      if (error && typeof error === "object" && "to" in error) throw error;
    }
  },
  component: AuthRouteShell,
  head: () => ({
    meta: [
      { title: "Logowanie | EduNex" },
      {
        name: "description",
        content:
          "Bezpieczne logowanie do platformy EduNex dla ucznia, nauczyciela, rodzica i administratora.",
      },
    ],
  }),
});

function AuthRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/auth" ? <AuthPage /> : <Outlet />;
}

function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
    );
  }

  if (provider === "microsoft") {
    return (
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path fill="#F25022" d="M1 1h10v10H1z" />
        <path fill="#7FBA00" d="M13 1h10v10H13z" />
        <path fill="#00A4EF" d="M1 13h10v10H1z" />
        <path fill="#FFB900" d="M13 13h10v10H13z" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.69-3.87-1.54-3.87-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 015.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.73.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.79.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  right,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  right?: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-slate-700">
      <span>{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-lg border border-slate-300 bg-white px-3 pr-10 text-[15px] text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </label>
  );
}

function PinInput({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div className="grid grid-cols-6 gap-2" aria-label="Kod PIN egzaminu">
      {value.map((digit, index) => (
        <input
          key={index}
          value={digit}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Cyfra PIN ${index + 1}`}
          onChange={(event) => {
            const next = [...value];
            next[index] = event.target.value.replace(/\D/g, "").slice(0, 1);
            onChange(next);
            if (next[index]) {
              const sibling = event.currentTarget.parentElement?.children[index + 1] as
                | HTMLInputElement
                | undefined;
              sibling?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              const sibling = event.currentTarget.parentElement?.children[index - 1] as
                | HTMLInputElement
                | undefined;
              sibling?.focus();
            }
          }}
          className="h-12 rounded-lg border border-slate-300 bg-white text-center text-lg font-semibold text-slate-950 outline-none transition focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
        />
      ))}
    </div>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const pinLogin = useServerFn(studentPinLogin);
  const { signInWithEmail, signInWithProvider, resetPassword } = useAuth();
  const [role, setRole] = useState<RoleId>("teacher");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);

  const activeRole = roles.find((item) => item.id === role) ?? roles[0];
  const ActiveIcon = activeRole.icon;
  const pin = pinDigits.join("");

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      return toast.error(
        "Brakuje konfiguracji Supabase. Sprawdź VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY.",
      );
    }
    if (!email.trim()) return toast.error("Podaj adres e-mail");

    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email.trim());
        if (error) return toast.error(error);
        toast.success("Wysłaliśmy link resetowania hasła");
        setMode("login");
        return;
      }

      if (!password) return toast.error("Podaj hasło");
      const { error } = await signInWithEmail(email.trim(), password);
      if (error) return toast.error(error);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      const resolvedRole = (user?.user_metadata?.role ||
        user?.app_metadata?.role ||
        role) as RoleId;
      toast.success("Zalogowano do EduNex");
      await navigate({ to: ROLE_DASHBOARD[resolvedRole] || ROLE_DASHBOARD[role], replace: true });
    } finally {
      setLoading(false);
    }
  };

  const submitPin = async (event: FormEvent) => {
    event.preventDefault();
    if (!firstName.trim() || !lastName.trim()) return toast.error("Podaj imię i nazwisko");
    if (pin.length !== 6) return toast.error("Podaj pełny 6-cyfrowy PIN");

    setPinLoading(true);
    try {
      const result = await pinLogin({
        data: { first_name: firstName.trim(), last_name: lastName.trim(), pin },
      });
      sessionStorage.setItem("edunex_student", JSON.stringify(result));
      toast.success(`Egzamin: ${result.exam_title}`);
      await navigate({ to: "/student/exam/$attemptId", params: { attemptId: result.attempt_id } });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się uruchomić egzaminu");
      setPinLoading(false);
    }
  };

  const providerLogin = async (provider: Provider) => {
    try {
      await signInWithProvider(provider as AuthProvider);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Nie udało się rozpocząć logowania");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-950">
      <Toaster position="top-center" theme="light" />
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-16 h-96 w-96 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[28rem] w-[28rem] rounded-full bg-indigo-200/30 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="inline-flex min-w-0 items-center gap-3 rounded-lg text-slate-700 transition hover:text-slate-950 focus:outline-none focus:ring-4 focus:ring-blue-100"
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
            <Layers3 className="h-4 w-4" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-950">EduNex</span>
            <span className="block truncate text-xs text-slate-500">
              Bezpieczny portal edukacyjny
            </span>
          </span>
        </Link>
        <Link
          to="/auth/register"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white/85 px-4 text-sm font-semibold text-slate-800 shadow-sm backdrop-blur transition hover:border-slate-400 hover:bg-white"
        >
          Utwórz konto
          <ArrowRight className="h-4 w-4" />
        </Link>
      </header>

      <div className="relative z-10 mx-auto grid w-full max-w-6xl gap-5 px-5 pb-8 sm:px-6 lg:min-h-[calc(100vh-84px)] lg:grid-cols-[0.78fr_1.22fr] lg:items-stretch lg:px-8 lg:pb-10">
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative hidden overflow-hidden rounded-2xl bg-slate-950 p-8 text-white shadow-[0_28px_90px_rgba(15,23,42,0.22)] lg:flex lg:min-h-[680px] lg:flex-col"
        >
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="relative flex h-full flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-blue-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Dostęp do platformy EduNex
            </div>
            <h1 className="mt-7 max-w-md text-4xl font-semibold leading-[1.04] xl:text-5xl">
              Jedno logowanie. Właściwy panel. Spokojna praca.
            </h1>
            <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
              Nauczyciel, uczeń, rodzic i dyrekcja korzystają z jednej, uporządkowanej bramy dostępu
              do systemu szkoły.
            </p>

            <div className="mt-8 space-y-3">
              {accessHighlights.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-sm"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white/10 text-blue-100">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-400">{text}</span>
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-400">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                Portal dostępu online
              </span>
              <span>edunex.pl</span>
            </div>
          </div>
        </motion.aside>

        <motion.main
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.14)]"
        >
          <div className="flex-1 p-5 sm:p-8">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-800">
                Logowanie EduNex
              </div>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                Witaj ponownie
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Wybierz profil, a następnie metodę dostępu do platformy.
              </p>
            </div>

            {!isSupabaseConfigured && (
              <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Lokalna konfiguracja Supabase nie jest aktywna. Logowanie wymaga zmiennych
                środowiskowych.
              </div>
            )}

            <section className="mt-6" aria-labelledby="role-label">
              <div id="role-label" className="mb-3 text-sm font-semibold text-slate-700">
                Profil użytkownika
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {roles.map((item) => {
                  const Icon = item.icon;
                  const selected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => {
                        setRole(item.id);
                        setMode("login");
                      }}
                      className={`group flex min-h-24 flex-col items-start justify-between rounded-xl border p-3 text-left transition focus:outline-none focus:ring-4 focus:ring-blue-100 ${selected ? "border-blue-400 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <span
                        className={`grid h-9 w-9 place-items-center rounded-lg transition ${selected ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-600 group-hover:bg-white"}`}
                      >
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="mt-3 text-xs font-semibold leading-4 text-slate-900">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mt-7 border-t border-slate-200 pt-7">
              {role === "student" ? (
                <form onSubmit={submitPin} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                      <ActiveIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">
                        Wejście ucznia do egzaminu
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Podaj dane i 6-cyfrowy PIN otrzymany od nauczyciela.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      label="Imię"
                      value={firstName}
                      onChange={setFirstName}
                      placeholder="Jan"
                      autoComplete="given-name"
                    />
                    <Field
                      label="Nazwisko"
                      value={lastName}
                      onChange={setLastName}
                      placeholder="Kowalski"
                      autoComplete="family-name"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-sm font-semibold text-slate-700">Kod PIN egzaminu</div>
                    <PinInput value={pinDigits} onChange={setPinDigits} />
                  </div>
                  <button
                    type="submit"
                    disabled={pinLoading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {pinLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    Rozpocznij egzamin
                  </button>
                </form>
              ) : (
                <form onSubmit={submitAccount} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-950 text-white">
                      <ActiveIcon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">
                        {mode === "forgot" ? "Odzyskaj dostęp" : `Logowanie: ${activeRole.label}`}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {mode === "forgot"
                          ? "Podaj adres e-mail, a wyślemy bezpieczny link resetowania hasła."
                          : activeRole.desc}
                      </p>
                    </div>
                  </div>

                  <Field
                    label="Adres e-mail"
                    type="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="nauczyciel@szkola.pl"
                    autoComplete="email"
                  />
                  {mode === "login" && (
                    <Field
                      label="Hasło"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={setPassword}
                      placeholder="Wpisz hasło"
                      autoComplete="current-password"
                      right={
                        <button
                          type="button"
                          onClick={() => setShowPassword((value) => !value)}
                          className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      }
                    />
                  )}

                  <div className="flex items-center justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}
                      className="text-sm font-semibold text-blue-800 transition hover:text-blue-950"
                    >
                      {mode === "forgot" ? "Wróć do logowania" : "Nie pamiętam hasła"}
                    </button>
                    {mode === "login" && (
                      <span className="text-xs text-slate-400">Dostęp chroniony</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : mode === "forgot" ? (
                      <Mail className="h-4 w-4" />
                    ) : (
                      <LockKeyhole className="h-4 w-4" />
                    )}
                    {mode === "forgot" ? "Wyślij link resetowania" : "Zaloguj się"}
                  </button>

                  {mode === "login" && (
                    <>
                      <div className="flex items-center gap-3 py-1">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
                          lub użyj konta
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {providers.map((provider) => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => providerLogin(provider.id)}
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                          >
                            <ProviderMark provider={provider.id} />
                            {provider.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </form>
              )}
            </section>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-slate-700" /> Bezpieczna sesja
              </span>
              <span className="inline-flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-slate-700" /> Supabase Auth
              </span>
            </div>
            <Link
              to="/dokumenty"
              className="font-semibold text-slate-700 transition hover:text-slate-950"
            >
              Prywatność i RODO
            </Link>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
