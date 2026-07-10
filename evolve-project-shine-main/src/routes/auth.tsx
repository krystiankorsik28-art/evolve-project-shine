import { useMemo, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, Outlet, redirect, useNavigate, useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  KeyRound,
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

const roles: Array<{ id: RoleId; label: string; desc: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "teacher", label: "Nauczyciel", desc: "Egzaminy, klasy, NexAi i raporty", icon: Users },
  { id: "student", label: "Uczeń", desc: "Wejście kontem lub kodem PIN", icon: GraduationCap },
  { id: "admin", label: "Dyrekcja / Admin", desc: "Role, licencja i bezpieczeństwo", icon: Building2 },
  { id: "parent", label: "Rodzic", desc: "Postęp dziecka i komunikaty", icon: School },
];

const providers: Array<{ id: Provider; label: string }> = [
  { id: "microsoft", label: "Microsoft" },
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
];

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ location }) => {
    if (location.pathname !== "/auth") return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user) {
        const role = (session.user.user_metadata?.role || session.user.app_metadata?.role || "student") as RoleId;
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
        content: "Bezpieczne logowanie do platformy EduNex dla ucznia, nauczyciela, rodzica i administratora.",
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
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
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
              const sibling = event.currentTarget.parentElement?.children[index + 1] as HTMLInputElement | undefined;
              sibling?.focus();
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Backspace" && !digit && index > 0) {
              const sibling = event.currentTarget.parentElement?.children[index - 1] as HTMLInputElement | undefined;
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

  const activeRole = useMemo(() => roles.find((item) => item.id === role) ?? roles[0], [role]);
  const ActiveIcon = activeRole.icon;
  const pin = pinDigits.join("");

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      return toast.error("Brakuje konfiguracji Supabase. Sprawdź VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY.");
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
      const resolvedRole = (user?.user_metadata?.role || user?.app_metadata?.role || role) as RoleId;
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
      const result = await pinLogin({ data: { first_name: firstName.trim(), last_name: lastName.trim(), pin } });
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
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Toaster position="top-center" theme="light" />
      <div className="mx-auto grid min-h-screen max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <motion.aside initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="hidden lg:block">
          <Link to="/" className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 hover:text-slate-950">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
              <ShieldCheck className="h-5 w-5" />
            </span>
            Portal EduNex
          </Link>
          <h1 className="mt-10 max-w-xl text-5xl font-semibold leading-[1.02]">
            Bezpieczne logowanie do EduNex.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
            Jedno wejście dla nauczyciela, dyrekcji i administratora. Uczeń może rozpocząć egzamin prostym kodem PIN, bez rozbudowanego konta.
          </p>
          <div className="mt-8 grid max-w-xl gap-3">
            {[
              ["OAuth", "Google, Microsoft i GitHub przez Supabase Auth"],
              ["PIN ucznia", "Imię, nazwisko i kod sesji egzaminacyjnej"],
              ["2FA ready", "Widoczne miejsce na dodatkowe zabezpieczenia"],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-700" />
                <div>
                  <div className="font-semibold text-slate-950">{title}</div>
                  <div className="mt-1 text-sm text-slate-500">{text}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.aside>

        <motion.main initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="rounded-lg border border-slate-200 bg-white shadow-[0_24px_90px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="text-xs font-semibold uppercase text-blue-800">Logowanie EduNex</div>
                <h2 className="mt-2 text-2xl font-semibold">Wybierz rolę i metodę dostępu</h2>
              </div>
              <Link to="/auth/register" className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                Rejestracja
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {!isSupabaseConfigured && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                Lokalna konfiguracja Supabase nie jest aktywna. Logowanie i rejestracja wymagają pliku `.env.local` albo zmiennych Vercel.
              </div>
            )}
          </div>

          <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
            <section className="border-b border-slate-200 p-5 lg:border-b-0 lg:border-r">
              <div className="grid gap-3">
                {roles.map((item) => {
                  const Icon = item.icon;
                  const selected = role === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setRole(item.id)}
                      className={`rounded-lg border p-4 text-left transition ${selected ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"}`}
                    >
                      <div className="flex gap-3">
                        <div className={`grid h-10 w-10 place-items-center rounded-lg ${selected ? "bg-blue-900 text-white" : "bg-slate-100 text-slate-700"}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-950">{item.label}</div>
                          <div className="mt-1 text-sm text-slate-500">{item.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
                    <ActiveIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-950">{activeRole.label}</div>
                    <div className="text-xs text-slate-500">aktywny profil logowania</div>
                  </div>
                </div>
              </div>
            </section>

            <section className="p-5">
              {role === "student" ? (
                <form onSubmit={submitPin} className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase text-slate-500">Egzamin PIN</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Wejście ucznia do egzaminu</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">Uczeń podaje dane i kod otrzymany od nauczyciela. Konto nie jest wymagane dla tej ścieżki.</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Imię" value={firstName} onChange={setFirstName} placeholder="Jan" autoComplete="given-name" />
                    <Field label="Nazwisko" value={lastName} onChange={setLastName} placeholder="Kowalski" autoComplete="family-name" />
                  </div>
                  <div className="grid gap-2">
                    <div className="text-sm font-semibold text-slate-700">Kod PIN</div>
                    <PinInput value={pinDigits} onChange={setPinDigits} />
                  </div>
                  <button disabled={pinLoading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                    {pinLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                    Rozpocznij egzamin
                  </button>
                  <button type="button" onClick={() => setRole("teacher")} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50">
                    Mam konto EduNex
                  </button>
                </form>
              ) : (
                <form onSubmit={submitAccount} className="space-y-4">
                  <div>
                    <div className="text-xs font-semibold uppercase text-slate-500">{mode === "forgot" ? "Reset hasła" : "Konto instytucjonalne"}</div>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">{mode === "forgot" ? "Odzyskaj dostęp" : `Logowanie: ${activeRole.label}`}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {mode === "forgot" ? "Podaj adres e-mail. Link resetowania zostanie obsłużony przez Supabase Auth." : "Użyj konta e-mail lub logowania organizacyjnego."}
                    </p>
                  </div>
                  <Field label="Adres e-mail" type="email" value={email} onChange={setEmail} placeholder="nauczyciel@szkola.pl" autoComplete="email" />
                  {mode === "login" && (
                    <Field
                      label="Hasło"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={setPassword}
                      placeholder="Hasło"
                      autoComplete="current-password"
                      right={
                        <button type="button" onClick={() => setShowPassword((value) => !value)} className="text-slate-500 hover:text-slate-900" aria-label={showPassword ? "Ukryj hasło" : "Pokaż hasło"}>
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      }
                    />
                  )}
                  <button disabled={loading} className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60">
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : mode === "forgot" ? <Mail className="h-4 w-4" /> : <LockKeyhole className="h-4 w-4" />}
                    {mode === "forgot" ? "Wyślij link resetowania" : "Zaloguj"}
                  </button>
                  <button type="button" onClick={() => setMode(mode === "forgot" ? "login" : "forgot")} className="text-sm font-semibold text-blue-800 hover:text-blue-950">
                    {mode === "forgot" ? "Wróć do logowania" : "Nie pamiętam hasła"}
                  </button>
                  {mode === "login" && (
                    <>
                      <div className="flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs uppercase text-slate-400">SSO</span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>
                      <div className="grid gap-2">
                        {providers.map((provider) => (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => providerLogin(provider.id)}
                            className="inline-flex h-11 items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                          >
                            <ProviderMark provider={provider.id} />
                            Kontynuuj z {provider.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </form>
              )}
            </section>
          </div>

          <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-5 text-sm text-slate-600 sm:grid-cols-3">
            <div className="flex gap-2"><ShieldCheck className="h-4 w-4 text-slate-800" /> Role i zgody</div>
            <div className="flex gap-2"><LockKeyhole className="h-4 w-4 text-slate-800" /> OAuth przez Supabase</div>
            <div className="flex gap-2"><KeyRound className="h-4 w-4 text-slate-800" /> PIN dla ucznia</div>
          </div>
        </motion.main>
      </div>
    </div>
  );
}
