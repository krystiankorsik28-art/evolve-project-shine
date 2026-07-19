import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
  useRouterState,
} from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Eye,
  EyeOff,
  Fingerprint,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Layers3,
  Loader2,
  LockKeyhole,
  LogOut,
  Mail,
  School,
  Server,
  ShieldAlert,
  ShieldCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { IdentityTrustCenter } from "@/components/auth/IdentityTrustCenter";
import { Toaster } from "@/components/ui/sonner";
import { isSupabaseConfigured, supabase } from "@/integrations/supabase/client";
import {
  resolveUserAccess,
  ROLE_DASHBOARD,
  ROLE_LABEL,
  type PortalRole,
  type ResolvedAccess,
} from "@/lib/auth/access";
import { useAuth } from "@/lib/auth/auth-context";
import type { AuthProvider } from "@/lib/auth/auth-types";
import { studentPinLogin } from "@/lib/student-auth.functions";

type RoleId = PortalRole;
type Provider = "microsoft" | "google";
type Mode = "login" | "forgot";
type LoginMethod = "account" | "pin" | "sso";

type RoleConfig = {
  id: RoleId;
  label: string;
  shortLabel: string;
  description: string;
  accessNote: string;
  icon: ComponentType<{ className?: string }>;
  methods: LoginMethod[];
  defaultMethod: LoginMethod;
  providers: Provider[];
};

const roles: RoleConfig[] = [
  {
    id: "teacher",
    label: "Nauczyciel",
    shortLabel: "Nauczyciel",
    description: "Klasy, egzaminy, wyniki i narzędzia NexAi.",
    accessNote: "Konto służbowe może wymagać akceptacji administratora szkoły.",
    icon: Users,
    methods: ["account", "sso"],
    defaultMethod: "account",
    providers: ["microsoft", "google"],
  },
  {
    id: "student",
    label: "Uczeń",
    shortLabel: "Uczeń",
    description: "Szybki dostęp do egzaminu lub pełnego konta ucznia.",
    accessNote: "Do jednorazowego egzaminu wystarczy imię, nazwisko i kod od nauczyciela.",
    icon: GraduationCap,
    methods: ["pin", "account"],
    defaultMethod: "pin",
    providers: ["microsoft", "google"],
  },
  {
    id: "parent",
    label: "Rodzic / opiekun",
    shortLabel: "Rodzic",
    description: "Postępy ucznia, wyniki i komunikacja ze szkołą.",
    accessNote: "Dostęp do danych ucznia jest aktywowany kodem przekazanym przez placówkę.",
    icon: School,
    methods: ["account"],
    defaultMethod: "account",
    providers: ["microsoft", "google"],
  },
  {
    id: "admin",
    label: "Dyrekcja / administrator",
    shortLabel: "Administracja",
    description: "Placówka, role, zgodność, audyt i bezpieczeństwo.",
    accessNote: "Wymagana jest zatwierdzona rola administratora lub firmowe SSO.",
    icon: Building2,
    methods: ["sso", "account"],
    defaultMethod: "sso",
    providers: ["microsoft"],
  },
];

const providers: Record<Provider, { label: string; shortLabel: string }> = {
  microsoft: { label: "Kontynuuj z Microsoft 365", shortLabel: "Microsoft 365" },
  google: { label: "Kontynuuj z Google", shortLabel: "Google" },
};

const methodLabels: Record<LoginMethod, string> = {
  account: "Konto EduNex",
  pin: "Kod egzaminu",
  sso: "Logowanie szkoły",
};

const trustPoints = [
  { icon: ShieldCheck, value: "RLS", label: "Izolacja danych i kontrola ról" },
  { icon: Fingerprint, value: "SSO", label: "Microsoft 365 i dostęp placówki" },
  { icon: Server, value: "EU", label: "Bezpieczna infrastruktura danych" },
];

export const Route = createFileRoute("/auth")({
  beforeLoad: async ({ location }) => {
    if (location.pathname !== "/auth") return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const access = await resolveUserAccess(user);
    if (access.approvedRole) {
      throw redirect({ to: ROLE_DASHBOARD[access.approvedRole], replace: true });
    }
  },
  component: AuthRouteShell,
  head: () => ({
    meta: [
      { title: "Logowanie | EduNex Identity" },
      {
        name: "description",
        content:
          "Bezpieczne logowanie do EduNex dla ucznia, nauczyciela, rodzica i administracji szkoły.",
      },
    ],
  }),
});

function AuthRouteShell() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  return pathname === "/auth" ? <AuthPage /> : <Outlet />;
}

function BrandMark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-[#0b1730] text-white shadow-sm">
      <Layers3 className="h-[18px] w-[18px]" />
    </span>
  );
}

function ProviderMark({ provider }: { provider: Provider }) {
  if (provider === "google") {
    return (
      <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
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

  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden="true">
      <path fill="#F25022" d="M1 1h10v10H1z" />
      <path fill="#7FBA00" d="M13 1h10v10H13z" />
      <path fill="#00A4EF" d="M1 13h10v10H1z" />
      <path fill="#FFB900" d="M13 13h10v10H13z" />
    </svg>
  );
}

function Field({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  inputMode,
  error,
  hint,
  right,
}: {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoComplete?: string;
  inputMode?: "text" | "email" | "numeric";
  error?: string;
  hint?: string;
  right?: ReactNode;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <span className="relative block">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          className={`h-12 w-full rounded-[6px] border bg-white px-3 pr-11 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:ring-1 ${
            error
              ? "border-red-500 focus:border-red-600 focus:ring-red-600"
              : "border-slate-300 focus:border-[#0067b8] focus:ring-[#0067b8]"
          }`}
        />
        {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
      </span>
      {error ? (
        <span
          id={`${id}-error`}
          className="flex items-center gap-1.5 text-xs font-normal text-red-700"
        >
          <CircleAlert className="h-3.5 w-3.5" />
          {error}
        </span>
      ) : hint ? (
        <span id={`${id}-hint`} className="text-xs font-normal leading-5 text-slate-500">
          {hint}
        </span>
      ) : null}
    </label>
  );
}

function PinInput({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return (
    <div
      className="grid grid-cols-6 gap-2"
      aria-label="6-cyfrowy kod egzaminu"
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
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`Cyfra kodu ${index + 1}`}
          onFocus={(event) => event.currentTarget.select()}
          onChange={(event) => {
            const next = [...value];
            next[index] = event.target.value.replace(/\D/g, "").slice(-1);
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
            if (event.key === "ArrowLeft" && index > 0) {
              (event.currentTarget.parentElement?.children[index - 1] as HTMLInputElement)?.focus();
            }
            if (event.key === "ArrowRight" && index < 5) {
              (event.currentTarget.parentElement?.children[index + 1] as HTMLInputElement)?.focus();
            }
          }}
          className="h-12 min-w-0 rounded-[6px] border border-slate-300 bg-white text-center text-lg font-semibold tabular-nums text-slate-950 outline-none transition hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8] sm:h-14 sm:text-xl"
        />
      ))}
    </div>
  );
}

function RoleSelector({ role, onChange }: { role: RoleId; onChange: (role: RoleId) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Wybierz typ konta">
      {roles.map((item) => {
        const Icon = item.icon;
        const selected = item.id === role;
        return (
          <button
            key={item.id}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(item.id)}
            className={`group relative min-h-[74px] rounded-lg border px-3.5 py-3 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/35 ${
              selected
                ? "border-[#0067b8] bg-[#f3f8fc] shadow-[0_0_0_1px_rgba(0,103,184,.08)]"
                : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-start gap-3">
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${
                  selected ? "bg-[#0067b8] text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 pt-0.5">
                <span className="block text-[13px] font-semibold leading-4 text-slate-950">
                  {item.shortLabel}
                </span>
                <span className="mt-1 block text-[11px] leading-4 text-slate-500">
                  {item.id === "student"
                    ? "PIN lub konto"
                    : item.id === "admin"
                      ? "SSO lub konto"
                      : "Konto użytkownika"}
                </span>
              </span>
            </span>
            {selected && (
              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[#0067b8]" />
            )}
          </button>
        );
      })}
    </div>
  );
}

function MethodSelector({
  methods,
  value,
  onChange,
}: {
  methods: LoginMethod[];
  value: LoginMethod;
  onChange: (method: LoginMethod) => void;
}) {
  if (methods.length < 2) return null;
  return (
    <div
      className="grid grid-cols-2 rounded-lg bg-slate-100 p-1"
      role="tablist"
      aria-label="Metoda logowania"
    >
      {methods.map((method) => (
        <button
          key={method}
          type="button"
          role="tab"
          aria-selected={method === value}
          onClick={() => onChange(method)}
          className={`min-h-9 rounded-md px-3 py-2 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/30 ${
            method === value
              ? "bg-white text-slate-950 shadow-sm ring-1 ring-slate-200"
              : "text-slate-600 hover:text-slate-950"
          }`}
        >
          {methodLabels[method]}
        </button>
      ))}
    </div>
  );
}

function AccessRouteSummary({ role, method }: { role: RoleConfig; method: LoginMethod }) {
  const RoleIcon = role.icon;
  const methodDescription: Record<LoginMethod, string> = {
    account: "Weryfikacja adresu, hasła i aktywnej roli",
    pin: "Jednorazowe wejście bez zakładania konta",
    sso: "Przekierowanie do systemu tożsamości szkoły",
  };

  return (
    <div className="mt-3 grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
      <div className="flex items-center gap-2.5 rounded-lg bg-white px-3 py-2 shadow-sm">
        <RoleIcon className="h-4 w-4 text-[#0067b8]" />
        <span>
          <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
            Rola
          </span>
          <span className="block text-xs font-semibold text-slate-900">{role.shortLabel}</span>
        </span>
      </div>
      <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />
      <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
        <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Metoda
        </span>
        <span className="block text-xs font-semibold text-slate-900">{methodLabels[method]}</span>
      </div>
      <ArrowRight className="hidden h-4 w-4 text-slate-300 sm:block" />
      <div className="rounded-lg bg-white px-3 py-2 shadow-sm">
        <span className="block text-[10px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Kontrola
        </span>
        <span className="block text-xs font-semibold text-emerald-700">
          {methodDescription[method]}
        </span>
      </div>
    </div>
  );
}

function AccessNotice({
  access,
  selectedRole,
  onContinue,
  onUseAnotherAccount,
}: {
  access: ResolvedAccess;
  selectedRole: RoleId;
  onContinue: () => void;
  onUseAnotherAccount: () => void;
}) {
  const mismatch = Boolean(access.approvedRole && access.approvedRole !== selectedRole);
  const rejected = access.selectedStatus === "rejected";
  const Icon = mismatch ? ShieldAlert : rejected ? CircleAlert : Clock3;
  const tone = mismatch
    ? "border-blue-200 bg-blue-50 text-blue-900"
    : rejected
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-amber-200 bg-amber-50 text-amber-950";

  return (
    <section className="mt-7" aria-live="polite">
      <div className={`rounded-xl border p-5 ${tone}`}>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-white/80 shadow-sm">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="mt-5 text-xl font-semibold tracking-[-0.02em]">
          {mismatch
            ? "Konto ma inną aktywną rolę"
            : rejected
              ? "Dostęp nie został zatwierdzony"
              : "Wniosek oczekuje na akceptację"}
        </h3>
        <p className="mt-2 text-sm leading-6 opacity-80">
          {mismatch && access.approvedRole
            ? `Wybrano rolę „${ROLE_LABEL[selectedRole]}”, ale to konto ma aktywny dostęp jako „${ROLE_LABEL[access.approvedRole]}”. Możesz bezpiecznie otworzyć przypisany panel.`
            : rejected
              ? access.rejectionReason ||
                "Administrator placówki odrzucił wniosek o tę rolę. Skontaktuj się ze szkołą, aby wyjaśnić status konta."
              : "Tożsamość została potwierdzona, jednak rola musi zostać aktywowana przez administratora placówki. Nie musisz zakładać kolejnego konta."}
        </p>
        {access.lookupFailed && (
          <p className="mt-3 rounded-md border border-current/15 bg-white/50 px-3 py-2 text-xs leading-5">
            Nie udało się pobrać pełnej listy ról. Spróbuj ponownie za chwilę.
          </p>
        )}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {mismatch && access.approvedRole && (
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
          >
            Otwórz panel: {ROLE_LABEL[access.approvedRole]}
            <ArrowRight className="h-4 w-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onUseAnotherAccount}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Użyj innego konta
        </button>
      </div>
    </section>
  );
}

function AuthPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const pinLogin = useServerFn(studentPinLogin);
  const { signInWithEmail, signInWithProvider, resetPassword } = useAuth();
  const [role, setRole] = useState<RoleId>("teacher");
  const [method, setMethod] = useState<LoginMethod>("account");
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [pinDigits, setPinDigits] = useState(["", "", "", "", "", ""]);
  const [ssoDomain, setSsoDomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [pinLoading, setPinLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [accessNotice, setAccessNotice] = useState<ResolvedAccess | null>(null);

  const activeRole = useMemo(() => roles.find((item) => item.id === role) ?? roles[0], [role]);
  const pin = pinDigits.join("");

  useEffect(() => {
    const savedEmail = window.localStorage.getItem("edunex_remembered_email");
    if (savedEmail) setEmail(savedEmail);
  }, []);

  const changeRole = (nextRole: RoleId) => {
    const config = roles.find((item) => item.id === nextRole) ?? roles[0];
    setRole(nextRole);
    setMethod(config.defaultMethod);
    setMode("login");
    setFormError("");
    setFieldErrors({});
    setAccessNotice(null);
  };

  const submitAccount = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    const nextErrors: Record<string, string> = {};
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) nextErrors.email = "Wpisz prawidłowy adres e-mail.";
    if (mode === "login" && !password) nextErrors.password = "Wpisz hasło do konta.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!isSupabaseConfigured) {
      setFormError("Logowanie nie jest skonfigurowane w tym środowisku.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "forgot") {
        const { error } = await resetPassword(email.trim());
        if (error) {
          setFormError(error);
          return;
        }
        toast.success("Wysłaliśmy bezpieczny link do zmiany hasła.");
        setMode("login");
        return;
      }

      const { error } = await signInWithEmail(email.trim(), password);
      if (error) {
        setFormError(error);
        return;
      }

      if (rememberEmail) window.localStorage.setItem("edunex_remembered_email", email.trim());
      else window.localStorage.removeItem("edunex_remembered_email");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setFormError("Sesja została utworzona, ale nie udało się potwierdzić użytkownika.");
        return;
      }

      const access = await resolveUserAccess(user, role);
      if (access.approvedRole === role) {
        toast.success(`Zalogowano jako ${ROLE_LABEL[role]}`);
        await navigate({ to: ROLE_DASHBOARD[role], replace: true });
        return;
      }
      setAccessNotice(access);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nie udało się zalogować.");
    } finally {
      setLoading(false);
    }
  };

  const submitPin = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    const nextErrors: Record<string, string> = {};
    if (!firstName.trim()) nextErrors.firstName = "Podaj imię ucznia.";
    if (!lastName.trim()) nextErrors.lastName = "Podaj nazwisko ucznia.";
    if (pin.length !== 6) nextErrors.pin = "Wpisz pełny 6-cyfrowy kod.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setPinLoading(true);
    try {
      const result = await pinLogin({
        data: { first_name: firstName.trim(), last_name: lastName.trim(), pin },
      });
      sessionStorage.setItem("edunex_student", JSON.stringify(result));
      toast.success(`Egzamin: ${result.exam_title}`);
      await navigate({ to: "/student/exam/$attemptId", params: { attemptId: result.attempt_id } });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Nie udało się uruchomić egzaminu.");
      setPinLoading(false);
    }
  };

  const submitSso = async (event: FormEvent) => {
    event.preventDefault();
    setFormError("");
    const domain = ssoDomain.trim().toLowerCase().split("@").pop() || "";
    if (!domain.includes(".")) {
      setFieldErrors({ ssoDomain: "Podaj domenę szkoły, np. liceum.edu.pl." });
      return;
    }
    if (!isSupabaseConfigured) {
      setFormError("Logowanie SSO nie jest skonfigurowane w tym środowisku.");
      return;
    }

    setFieldErrors({});
    setLoading(true);
    window.sessionStorage.setItem("edunex_intended_role", role);
    const { error } = await supabase.auth.signInWithSSO({
      domain,
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      window.sessionStorage.removeItem("edunex_intended_role");
      setFormError(
        error.message.includes("SSO")
          ? "Nie znaleziono konfiguracji SSO dla tej domeny. Użyj konta EduNex albo skontaktuj się z administratorem szkoły."
          : error.message,
      );
      setLoading(false);
    }
  };

  const providerLogin = async (provider: Provider) => {
    if (!isSupabaseConfigured) {
      setFormError("Logowanie zewnętrzne nie jest skonfigurowane w tym środowisku.");
      return;
    }
    setFormError("");
    setLoading(true);
    window.sessionStorage.setItem("edunex_intended_role", role);
    try {
      await signInWithProvider(provider as AuthProvider);
    } catch (error) {
      window.sessionStorage.removeItem("edunex_intended_role");
      setFormError(error instanceof Error ? error.message : "Nie udało się rozpocząć logowania.");
      setLoading(false);
    }
  };

  const useAnotherAccount = async () => {
    await supabase.auth.signOut({ scope: "local" });
    setAccessNotice(null);
    setPassword("");
    setFormError("");
  };

  const continueWithApprovedRole = async () => {
    if (!accessNotice?.approvedRole) return;
    await navigate({ to: ROLE_DASHBOARD[accessNotice.approvedRole], replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-950 antialiased">
      <Toaster position="top-center" theme="light" richColors />

      <header className="border-b border-slate-200 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/35"
          >
            <BrandMark />
            <span>
              <span className="block text-[15px] font-semibold leading-4 tracking-[-0.01em]">
                EduNex
              </span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                Identity Portal
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <Link
              to="/pomoc"
              className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:inline-flex"
            >
              <HelpCircle className="h-4 w-4" />
              Centrum pomocy
            </Link>
            <Link
              to="/auth/register"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[6px] border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Utwórz konto
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] items-center px-4 py-6 sm:px-8 sm:py-10 lg:min-h-[calc(100vh-69px)] lg:px-10">
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="grid w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.11)] lg:grid-cols-[minmax(360px,0.82fr)_minmax(580px,1.18fr)]"
        >
          <aside className="relative hidden overflow-hidden border-r border-slate-200 bg-[#edf4fa] p-9 lg:block xl:p-12">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.34]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(0,103,184,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(0,103,184,.09) 1px,transparent 1px)",
                backgroundSize: "36px 36px",
                maskImage: "linear-gradient(to bottom, black, transparent 78%)",
              }}
            />
            <div className="pointer-events-none absolute -left-32 top-12 h-80 w-80 rounded-full bg-[#0078d4]/15 blur-3xl" />

            <div className="relative flex h-full min-h-[690px] flex-col">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#0067b8]/15 bg-white/75 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#005a9e] shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                EduNex Identity
              </div>
              <h1 className="mt-7 max-w-xl text-[42px] font-semibold leading-[1.08] tracking-[-0.045em] text-[#0b1730] xl:text-[48px]">
                Jedno bezpieczne wejście do całej szkoły.
              </h1>
              <p className="mt-5 max-w-lg text-[15px] leading-7 text-slate-600">
                Portal rozpoznaje rolę, metodę logowania i zatwierdzone uprawnienia, a następnie
                otwiera właściwe środowisko pracy.
              </p>

              <div className="mt-9 grid gap-3">
                {trustPoints.map(({ icon: Icon, value, label }) => (
                  <div
                    key={value}
                    className="grid grid-cols-[42px_54px_1fr] items-center gap-3 rounded-xl border border-white/90 bg-white/75 p-3.5 shadow-[0_8px_24px_rgba(15,23,42,.04)] backdrop-blur"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#0067b8]/10 text-[#0067b8]">
                      <Icon className="h-[18px] w-[18px]" />
                    </span>
                    <span className="text-sm font-bold text-[#0b1730]">{value}</span>
                    <span className="text-xs leading-5 text-slate-600">{label}</span>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-10">
                <div className="rounded-xl border border-slate-200/80 bg-white/75 p-4 backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-2 text-xs font-medium text-slate-700">
                      <span className="relative flex h-2.5 w-2.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
                        <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      </span>
                      Usługi logowania działają
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">Status 100%</span>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4 text-[11px] text-slate-500">
                  <span>RODO</span>
                  <span className="h-3 w-px bg-slate-300" />
                  <span>Szyfrowanie TLS</span>
                  <span className="h-3 w-px bg-slate-300" />
                  <span>Kontrola sesji</span>
                </div>
              </div>
            </div>
          </aside>

          <div className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto w-full max-w-[610px]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0067b8]">
                    Bezpieczne logowanie
                  </div>
                  <h2 className="mt-2.5 text-[30px] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                    {mode === "forgot" ? "Odzyskaj dostęp" : "Witaj w EduNex"}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {mode === "forgot"
                      ? "Wyślemy link resetujący na zweryfikowany adres konta."
                      : "Najpierw wybierz, w jakiej roli wchodzisz do platformy."}
                  </p>
                </div>
                <span className="hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-800 sm:inline-flex">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Chronione
                </span>
              </div>

              {!isSupabaseConfigured && (
                <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    Widok demonstracyjny — logowanie wymaga konfiguracji zmiennych Supabase.
                  </span>
                </div>
              )}

              {!accessNotice && mode === "login" && (
                <section className="mt-6" aria-labelledby="account-type-label">
                  <div className="mb-2.5 flex items-center justify-between gap-3">
                    <div id="account-type-label" className="text-sm font-semibold text-slate-900">
                      1. Wybierz typ dostępu
                    </div>
                    <span className="text-[11px] font-medium text-slate-500">4 role systemowe</span>
                  </div>
                  <RoleSelector role={role} onChange={changeRole} />
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-slate-50 px-3 py-2.5 text-xs leading-5 text-slate-600">
                    <BadgeCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#0067b8]" />
                    <span>
                      <strong className="font-semibold text-slate-800">{activeRole.label}:</strong>{" "}
                      {activeRole.accessNote}
                    </span>
                  </div>
                </section>
              )}

              {accessNotice ? (
                <AccessNotice
                  access={accessNotice}
                  selectedRole={role}
                  onContinue={continueWithApprovedRole}
                  onUseAnotherAccount={useAnotherAccount}
                />
              ) : (
                <section
                  className="mt-6 border-t border-slate-200 pt-6"
                  aria-label="Dane logowania"
                >
                  {mode === "login" && (
                    <div className="mb-5">
                      <div className="mb-2.5 text-sm font-semibold text-slate-900">
                        2. Wybierz metodę
                      </div>
                      <MethodSelector
                        methods={activeRole.methods}
                        value={method}
                        onChange={(next) => {
                          setMethod(next);
                          setFormError("");
                          setFieldErrors({});
                        }}
                      />
                      <AccessRouteSummary role={activeRole} method={method} />
                    </div>
                  )}

                  {formError && (
                    <div
                      role="alert"
                      className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
                    >
                      <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {mode === "login" && method === "pin" ? (
                    <form onSubmit={submitPin} className="space-y-4" noValidate>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-950">Dołącz do egzaminu</h3>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          Nie potrzebujesz hasła ani konta. Użyj danych i kodu od nauczyciela.
                        </p>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field
                          id="student-first-name"
                          label="Imię ucznia"
                          value={firstName}
                          onChange={(value) => {
                            setFirstName(value);
                            setFieldErrors((current) => ({ ...current, firstName: "" }));
                          }}
                          placeholder="Jan"
                          autoComplete="given-name"
                          error={fieldErrors.firstName}
                        />
                        <Field
                          id="student-last-name"
                          label="Nazwisko ucznia"
                          value={lastName}
                          onChange={(value) => {
                            setLastName(value);
                            setFieldErrors((current) => ({ ...current, lastName: "" }));
                          }}
                          placeholder="Kowalski"
                          autoComplete="family-name"
                          error={fieldErrors.lastName}
                        />
                      </div>
                      <div className="grid gap-2">
                        <div className="flex items-center justify-between gap-3 text-sm font-medium text-slate-800">
                          <span>6-cyfrowy kod egzaminu</span>
                          <span className="text-xs font-normal text-slate-500">
                            Możesz wkleić cały kod
                          </span>
                        </div>
                        <PinInput
                          value={pinDigits}
                          onChange={(value) => {
                            setPinDigits(value);
                            setFieldErrors((current) => ({ ...current, pin: "" }));
                          }}
                        />
                        {fieldErrors.pin && (
                          <span className="flex items-center gap-1.5 text-xs text-red-700">
                            <CircleAlert className="h-3.5 w-3.5" />
                            {fieldErrors.pin}
                          </span>
                        )}
                      </div>
                      <button
                        type="submit"
                        disabled={pinLoading}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {pinLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <KeyRound className="h-4 w-4" />
                        )}
                        {pinLoading ? "Sprawdzanie kodu..." : "Otwórz bezpieczny egzamin"}
                      </button>
                    </form>
                  ) : mode === "login" && method === "sso" ? (
                    <form onSubmit={submitSso} className="space-y-4" noValidate>
                      <div className="rounded-xl border border-blue-100 bg-[#f5f9fd] p-4">
                        <div className="flex items-start gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-[#0067b8] shadow-sm">
                            <Building2 className="h-[18px] w-[18px]" />
                          </span>
                          <span>
                            <span className="block text-sm font-semibold text-slate-900">
                              Logowanie instytucjonalne
                            </span>
                            <span className="mt-1 block text-xs leading-5 text-slate-600">
                              Przekierujemy Cię do zaufanego systemu tożsamości skonfigurowanego
                              przez Twoją szkołę.
                            </span>
                          </span>
                        </div>
                      </div>
                      <Field
                        id="sso-domain"
                        label="Domena placówki"
                        value={ssoDomain}
                        onChange={(value) => {
                          setSsoDomain(value);
                          setFieldErrors({});
                        }}
                        placeholder="szkola.edu.pl"
                        autoComplete="organization"
                        error={fieldErrors.ssoDomain}
                        hint="Możesz też wkleić służbowy e-mail — domenę rozpoznamy automatycznie."
                      />
                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Fingerprint className="h-4 w-4" />
                        )}
                        Kontynuuj przez SSO szkoły
                      </button>
                      <p className="text-center text-xs leading-5 text-slate-500">
                        Nie znasz domeny? Skontaktuj się z administratorem placówki lub wybierz
                        „Konto EduNex”.
                      </p>
                    </form>
                  ) : (
                    <form onSubmit={submitAccount} className="space-y-4" noValidate>
                      {mode === "login" && activeRole.providers.length > 0 && (
                        <>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {activeRole.providers.map((provider, index) => (
                              <button
                                key={provider}
                                type="button"
                                disabled={loading}
                                onClick={() => providerLogin(provider)}
                                className={`flex min-h-12 items-center justify-center gap-2.5 rounded-[6px] border px-4 py-3 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/30 disabled:opacity-60 ${
                                  index === 0
                                    ? "border-slate-400 bg-white text-slate-950 hover:border-[#0067b8] hover:bg-[#f5f9fd]"
                                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                                } ${activeRole.providers.length === 1 ? "sm:col-span-2" : ""}`}
                              >
                                <ProviderMark provider={provider} />
                                {activeRole.providers.length === 1
                                  ? providers[provider].label
                                  : providers[provider].shortLabel}
                              </button>
                            ))}
                          </div>
                          <div className="flex items-center gap-3 py-1">
                            <div className="h-px flex-1 bg-slate-200" />
                            <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">
                              lub e-mail i hasło
                            </span>
                            <div className="h-px flex-1 bg-slate-200" />
                          </div>
                        </>
                      )}

                      {mode === "forgot" && (
                        <button
                          type="button"
                          onClick={() => {
                            setMode("login");
                            setFormError("");
                            setFieldErrors({});
                          }}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-[#0067b8] hover:text-[#004f8b]"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Wróć do logowania
                        </button>
                      )}

                      <Field
                        id="account-email"
                        label="Adres e-mail"
                        type="email"
                        value={email}
                        onChange={(value) => {
                          setEmail(value);
                          setFieldErrors((current) => ({ ...current, email: "" }));
                        }}
                        placeholder="imie.nazwisko@szkola.pl"
                        autoComplete="email"
                        inputMode="email"
                        error={fieldErrors.email}
                      />

                      {mode === "login" && (
                        <Field
                          id="account-password"
                          label="Hasło"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(value) => {
                            setPassword(value);
                            setFieldErrors((current) => ({ ...current, password: "" }));
                          }}
                          placeholder="Wpisz hasło"
                          autoComplete="current-password"
                          error={fieldErrors.password}
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

                      {mode === "login" && (
                        <div className="flex items-center justify-between gap-4">
                          <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-slate-600">
                            <input
                              type="checkbox"
                              checked={rememberEmail}
                              onChange={(event) => setRememberEmail(event.target.checked)}
                              className="h-4 w-4 rounded border-slate-300 accent-[#0067b8]"
                            />
                            Zapamiętaj adres e-mail
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setMode("forgot");
                              setFormError("");
                              setFieldErrors({});
                            }}
                            className="text-xs font-semibold text-[#0067b8] transition hover:text-[#004f8b]"
                          >
                            Nie pamiętam hasła
                          </button>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : mode === "forgot" ? (
                          <Mail className="h-4 w-4" />
                        ) : (
                          <ArrowRight className="h-4 w-4" />
                        )}
                        {loading
                          ? "Proszę czekać..."
                          : mode === "forgot"
                            ? "Wyślij link resetujący"
                            : `Zaloguj jako: ${activeRole.shortLabel}`}
                      </button>
                    </form>
                  )}
                </section>
              )}

              {!accessNotice && (
                <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-slate-500">
                    Nie masz konta?{" "}
                    <Link
                      to="/auth/register"
                      className="font-semibold text-[#0067b8] hover:text-[#004f8b]"
                    >
                      Rozpocznij rejestrację
                    </Link>
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    Rola jest weryfikowana po zalogowaniu
                  </span>
                </div>
              )}

              <div className="mt-4 text-[11px] leading-5 text-slate-400">
                Kontynuując, akceptujesz zasady dostępu opisane w{" "}
                <Link to="/dokumenty" className="font-medium text-slate-600 hover:text-slate-950">
                  dokumentach EduNex
                </Link>
                . Wybrana rola nie nadaje uprawnień — potwierdza je placówka.
              </div>
            </div>
          </div>
          <IdentityTrustCenter mode="login" className="lg:col-span-2" />
        </motion.section>
      </main>
    </div>
  );
}
