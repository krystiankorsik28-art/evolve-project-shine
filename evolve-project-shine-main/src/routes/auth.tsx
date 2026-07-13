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
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  Fingerprint,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Layers3,
  Loader2,
  LockKeyhole,
  Mail,
  School,
  Server,
  ShieldCheck,
  UserCheck,
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
  shortLabel: string;
  desc: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    id: "teacher",
    label: "Nauczyciel",
    shortLabel: "Nauczyciel",
    desc: "Egzaminy, klasy, wyniki i narzędzia NexAi.",
    icon: Users,
  },
  {
    id: "student",
    label: "Uczeń",
    shortLabel: "Uczeń",
    desc: "Wejście do egzaminu za pomocą danych i kodu PIN.",
    icon: GraduationCap,
  },
  {
    id: "admin",
    label: "Dyrekcja lub administrator",
    shortLabel: "Dyrekcja",
    desc: "Zarządzanie placówką, rolami i bezpieczeństwem.",
    icon: Building2,
  },
  {
    id: "parent",
    label: "Rodzic",
    shortLabel: "Rodzic",
    desc: "Wyniki, postęp ucznia i komunikaty szkoły.",
    icon: School,
  },
];

const providers: Array<{ id: Provider; label: string }> = [
  { id: "microsoft", label: "Zaloguj się przez Microsoft 365" },
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

const platformPoints = [
  {
    icon: UserCheck,
    title: "Dostęp dopasowany do roli",
    text: "Po zalogowaniu otwieramy właściwy panel nauczyciela, ucznia, rodzica lub dyrekcji.",
  },
  {
    icon: Fingerprint,
    title: "Logowanie instytucjonalne",
    text: "Obsługa kont Microsoft 365, Google oraz bezpiecznego dostępu przez e-mail.",
  },
  {
    icon: Server,
    title: "Jedno środowisko szkoły",
    text: "Egzaminy, klasy, raporty i komunikacja pozostają w jednym uporządkowanym systemie.",
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
        const role = (session.user.app_metadata?.role ||
          session.user.user_metadata?.role ||
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
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 pr-11 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
        />
        {right && <div className="absolute right-3 top-1/2 -translate-y-1/2">{right}</div>}
      </div>
    </label>
  );
}

function PinInput({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div
      className="grid grid-cols-6 gap-2"
      aria-label="Kod PIN egzaminu"
      onPaste={(event) => {
        const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
        if (!pasted) return;
        event.preventDefault();
        onChange(Array.from({ length: 6 }, (_, index) => pasted[index] || ""));
      }}
    >
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
                HTMLInputElement | undefined;
              sibling?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              const sibling = event.currentTarget.parentElement?.children[index - 1] as
                HTMLInputElement | undefined;
              sibling?.focus();
            }
          }}
          className="h-12 min-w-0 rounded-md border border-slate-300 bg-white text-center text-lg font-semibold text-slate-950 outline-none transition hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
        />
      ))}
    </div>
  );
}

function RoleSelector({ role, onChange }: { role: RoleId; onChange: (role: RoleId) => void }) {
  return (
    <div
      className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 sm:grid-cols-4"
      role="group"
      aria-label="Typ konta"
    >
      {roles.map((item) => {
        const Icon = item.icon;
        const selected = item.id === role;
        return (
          <button
            key={item.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(item.id)}
            className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-2.5 py-2 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#0067b8]/30 ${
              selected
                ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
                : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{item.shortLabel}</span>
          </button>
        );
      })}
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
      const resolvedRole = (user?.app_metadata?.role ||
        user?.user_metadata?.role ||
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
    <div className="min-h-screen bg-[#f5f7fa] text-slate-950">
      <Toaster position="top-center" theme="light" />

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0067b8]/30"
          >
            <span className="grid h-10 w-10 place-items-center rounded-md bg-[#0b1730] text-white shadow-sm">
              <Layers3 className="h-[18px] w-[18px]" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-4">EduNex</span>
              <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
                Portal dostępu
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/dokumenty"
              className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:inline-flex"
            >
              <HelpCircle className="h-4 w-4" />
              Pomoc i dokumenty
            </Link>
            <Link
              to="/auth/register"
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Zarejestruj konto
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl items-center px-4 py-8 sm:px-6 sm:py-12 lg:min-h-[calc(100vh-69px)] lg:px-8">
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[0.9fr_1.1fr]"
        >
          <aside className="relative overflow-hidden border-b border-slate-200 bg-[#eef4fb] p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10 xl:p-12">
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#0067b8]/10 blur-3xl" />
            <div className="flex h-full flex-col">
              <div className="relative">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0067b8]/15 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#005a9e]">
                  <ShieldCheck className="h-4 w-4 text-[#0067b8]" />
                  EduNex Identity
                </div>
                <h1 className="mt-6 max-w-lg text-3xl font-semibold leading-[1.12] tracking-[-0.035em] text-slate-950 lg:text-[42px]">
                  Bezpieczna przestrzeń pracy dla całej szkoły.
                </h1>
                <p className="mt-4 max-w-lg text-[15px] leading-7 text-slate-600">
                  Jedno konto łączy użytkownika z właściwymi narzędziami, danymi i uprawnieniami
                  placówki.
                </p>

                <div className="mt-8 space-y-3">
                  {platformPoints.map(({ icon: Icon, title, text }) => (
                    <div
                      key={title}
                      className="flex items-start gap-3 rounded-lg border border-white/80 bg-white/75 p-4 shadow-sm"
                    >
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-[#0067b8]/10 text-[#0067b8]">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-slate-900">{title}</span>
                        <span className="mt-1 block text-xs leading-5 text-slate-600">{text}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative mt-10 rounded-lg border border-slate-200/80 bg-white/70 p-4 lg:mt-auto">
                <div className="flex items-center justify-between gap-4 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    System operacyjny
                  </span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                    <BadgeCheck className="h-3.5 w-3.5 text-[#0067b8]" />
                    Chronione połączenie
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <div className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto w-full max-w-[520px]">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#0067b8]">
                  Bezpieczne logowanie
                </div>
                <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                  {mode === "forgot" ? "Odzyskaj dostęp" : "Witaj ponownie"}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {mode === "forgot"
                    ? "Podaj adres e-mail przypisany do konta."
                    : "Wybierz rolę i zaloguj się metodą używaną przez Twoją placówkę."}
                </p>
              </div>

              {!isSupabaseConfigured && (
                <div className="mt-5 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  Logowanie wymaga aktywnej konfiguracji Supabase.
                </div>
              )}

              {mode === "login" && (
                <section className="mt-6" aria-labelledby="account-type-label">
                  <div id="account-type-label" className="mb-2 text-sm font-medium text-slate-800">
                    Typ konta
                  </div>
                  <RoleSelector
                    role={role}
                    onChange={(nextRole) => {
                      setRole(nextRole);
                      setMode("login");
                    }}
                  />
                  <p className="mt-2 text-xs leading-5 text-slate-500">{activeRole.desc}</p>
                </section>
              )}

              <section className="mt-6 border-t border-slate-200 pt-6">
                {role === "student" && mode === "login" ? (
                  <form onSubmit={submitPin} className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-950">Dołącz do egzaminu</h3>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Wpisz dane ucznia oraz kod przekazany przez nauczyciela.
                      </p>
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
                      <div className="text-sm font-medium text-slate-800">6-cyfrowy kod PIN</div>
                      <PinInput value={pinDigits} onChange={setPinDigits} />
                      <div className="text-xs text-slate-500">
                        Kod możesz również wkleić w całości.
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={pinLoading}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pinLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <KeyRound className="h-4 w-4" />
                      )}
                      Przejdź do egzaminu
                    </button>
                  </form>
                ) : (
                  <form onSubmit={submitAccount} className="space-y-4">
                    {mode === "login" && (
                      <>
                        <button
                          type="button"
                          onClick={() => providerLogin(providers[0].id)}
                          className="flex min-h-12 w-full items-center justify-between gap-3 rounded-md border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#0067b8] hover:bg-[#f5f9fd] focus:outline-none focus:ring-2 focus:ring-[#0067b8]/25"
                        >
                          <span className="inline-flex items-center gap-3">
                            <ProviderMark provider="microsoft" />
                            {providers[0].label}
                          </span>
                          <span className="rounded-full bg-[#0067b8]/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#005a9e]">
                            Zalecane
                          </span>
                        </button>

                        <div className="grid grid-cols-2 gap-2">
                          {providers.slice(1).map((provider) => (
                            <button
                              key={provider.id}
                              type="button"
                              onClick={() => providerLogin(provider.id)}
                              className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
                            >
                              <ProviderMark provider={provider.id} />
                              {provider.label}
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 py-1">
                          <div className="h-px flex-1 bg-slate-200" />
                          <span className="text-xs text-slate-500">lub użyj adresu e-mail</span>
                          <div className="h-px flex-1 bg-slate-200" />
                        </div>
                      </>
                    )}

                    <Field
                      label="Adres e-mail"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="imie.nazwisko@szkola.pl"
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
                            className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
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
                        className="text-sm font-semibold text-[#0067b8] transition hover:text-[#004f8b]"
                      >
                        {mode === "forgot" ? "Wróć do logowania" : "Nie pamiętam hasła"}
                      </button>
                      {mode === "login" && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <LockKeyhole className="h-3.5 w-3.5" />
                          Połączenie chronione
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : mode === "forgot" ? (
                        <Mail className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {mode === "forgot" ? "Wyślij link resetowania" : "Zaloguj się"}
                    </button>
                  </form>
                )}
              </section>

              <div className="mt-7 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                Nie masz jeszcze konta?{" "}
                <Link
                  to="/auth/register"
                  className="font-semibold text-[#0067b8] hover:text-[#004f8b]"
                >
                  Rozpocznij rejestrację
                </Link>
              </div>

              <div className="mt-5 border-t border-slate-200 pt-5 text-xs leading-5 text-slate-500">
                Logując się, potwierdzasz zapoznanie z zasadami dostępu. Informacje o prywatności i
                RODO są dostępne w{" "}
                <Link to="/dokumenty" className="font-semibold text-slate-700 hover:text-slate-950">
                  dokumentach EduNex
                </Link>
                .
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
