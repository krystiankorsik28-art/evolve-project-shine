import { useMemo, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  ClipboardCheck,
  Eye,
  EyeOff,
  GraduationCap,
  HelpCircle,
  KeyRound,
  Layers3,
  Loader2,
  MailCheck,
  School,
  ShieldCheck,
  UserRoundCheck,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { IdentityTrustCenter } from "@/components/auth/IdentityTrustCenter";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Toaster } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { ROLE_LABEL, type PortalRole } from "@/lib/auth/access";
import { useAuth } from "@/lib/auth/auth-context";
import {
  requiresManualInstitutionReview,
  validateNip,
  validateRegon,
  validateRspo,
} from "@/lib/auth/institution-validation";
import { useTheme } from "@/lib/theme";

type RoleId = PortalRole;
type StepId = "role" | "identity" | "organization" | "security";

type RegistrationData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  school: string;
  position: string;
  subject: string;
  studentName: string;
  studentClass: string;
  accessCode: string;
  rspo: string;
  regon: string;
  nip: string;
  website: string;
  authorizationBasis: string;
  password: string;
  confirmPassword: string;
};

type RoleConfig = {
  id: RoleId;
  label: string;
  shortLabel: string;
  description: string;
  approval: string;
  icon: ComponentType<{ className?: string }>;
  benefits: string[];
};

const roles: RoleConfig[] = [
  {
    id: "teacher",
    label: "Nauczyciel",
    shortLabel: "Nauczyciel",
    description: "Twórz egzaminy, zarządzaj klasami i korzystaj z NexAi.",
    approval: "Konto zatwierdza administrator wskazanej placówki.",
    icon: Users,
    benefits: ["Egzaminy i sprawdziany", "Klasy i wyniki", "Narzędzia AI"],
  },
  {
    id: "student",
    label: "Uczeń",
    shortLabel: "Uczeń",
    description: "Pełny profil do nauki, historii wyników i egzaminów.",
    approval: "Kod szkoły łączy profil z właściwą klasą.",
    icon: GraduationCap,
    benefits: ["Historia wyników", "Materiały do nauki", "Profil postępów"],
  },
  {
    id: "parent",
    label: "Rodzic / opiekun",
    shortLabel: "Rodzic",
    description: "Śledź postępy podopiecznego i kontaktuj się ze szkołą.",
    approval: "Placówka potwierdza powiązanie z uczniem.",
    icon: School,
    benefits: ["Wyniki ucznia", "Komunikaty szkoły", "Bezpieczne powiązanie"],
  },
  {
    id: "admin",
    label: "Dyrekcja / administrator",
    shortLabel: "Administracja",
    description: "Zarządzaj organizacją, rolami, zgodnością i audytem.",
    approval: "Wymagana jest wieloetapowa weryfikacja placówki i umocowania służbowego.",
    icon: Building2,
    benefits: ["Role i dostęp", "Audyt i zgodność", "Konfiguracja szkoły"],
  },
];

const steps: Array<{
  id: StepId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { id: "role", label: "Rola", description: "Zakres konta", icon: UserRoundCheck },
  { id: "identity", label: "Tożsamość", description: "Dane użytkownika", icon: BadgeCheck },
  { id: "organization", label: "Placówka", description: "Powiązanie dostępu", icon: Building2 },
  { id: "security", label: "Bezpieczeństwo", description: "Hasło i zgody", icon: ShieldCheck },
];

const initialData: RegistrationData = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  school: "",
  position: "",
  subject: "",
  studentName: "",
  studentClass: "",
  accessCode: "",
  rspo: "",
  regon: "",
  nip: "",
  website: "",
  authorizationBasis: "",
  password: "",
  confirmPassword: "",
};

export const Route = createFileRoute("/auth/register")({
  component: RegisterPanel,
  head: () => ({
    meta: [
      { title: "Rejestracja | EduNex Identity" },
      {
        name: "description",
        content:
          "Utwórz bezpieczne konto EduNex dla nauczyciela, ucznia, rodzica lub administracji szkoły.",
      },
    ],
  }),
});

function BrandMark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-[7px] bg-[#0b1730] text-white shadow-sm">
      <Layers3 className="h-[18px] w-[18px]" />
    </span>
  );
}

function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  inputMode,
  error,
  hint,
  right,
}: {
  id: keyof RegistrationData;
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "numeric" | "url";
  error?: string;
  hint?: string;
  right?: ReactNode;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <label htmlFor={id} className="grid gap-2 text-sm font-medium text-slate-800">
      <span>
        {label}
        {required && (
          <span className="ml-1 text-[#0067b8]" aria-label="wymagane">
            *
          </span>
        )}
      </span>
      <span className="relative block">
        <input
          id={id}
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`h-[52px] w-full rounded-lg border bg-white px-3 pr-11 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:ring-2 ${
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

function StepRail({ currentStep }: { currentStep: number }) {
  return (
    <ol className="mt-9 space-y-2" aria-label="Etapy rejestracji">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const active = index === currentStep;
        const done = index < currentStep;
        return (
          <li
            key={step.id}
            aria-current={active ? "step" : undefined}
            className={`grid grid-cols-[42px_1fr_auto] items-center gap-3 rounded-xl border px-3.5 py-3 transition ${
              active
                ? "border-blue-300/30 bg-white/10 text-white"
                : done
                  ? "border-emerald-300/20 bg-emerald-400/10 text-emerald-100"
                  : "border-transparent bg-white/[0.035] text-slate-400"
            }`}
          >
            <span
              className={`grid h-10 w-10 place-items-center rounded-lg ${
                active
                  ? "bg-[#0067b8] text-white"
                  : done
                    ? "bg-emerald-600 text-white"
                    : "bg-white/10 text-slate-300 ring-1 ring-white/10"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
            </span>
            <span>
              <span className="block text-sm font-semibold">{step.label}</span>
              <span className="mt-0.5 block text-[11px]">{step.description}</span>
            </span>
            <span className="text-[11px] font-bold tabular-nums">0{index + 1}</span>
          </li>
        );
      })}
    </ol>
  );
}

function PasswordMeter({ password }: { password: string }) {
  const checks = [
    { label: "10+ znaków", passed: password.length >= 10 },
    { label: "mała i wielka litera", passed: /[a-z]/.test(password) && /[A-Z]/.test(password) },
    { label: "cyfra", passed: /\d/.test(password) },
    { label: "znak specjalny", passed: /[^\w\s]/.test(password) },
  ];
  const score = checks.filter((check) => check.passed).length;
  const label = score <= 1 ? "Słabe" : score === 2 ? "Podstawowe" : score === 3 ? "Dobre" : "Silne";

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-center justify-between gap-4 text-xs">
        <span className="font-semibold text-slate-700">Siła hasła</span>
        <span className={score >= 3 ? "font-semibold text-emerald-700" : "text-slate-500"}>
          {label}
        </span>
      </div>
      <div className="mt-2.5 grid grid-cols-4 gap-1.5" aria-hidden="true">
        {[0, 1, 2, 3].map((index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition ${
              index < score ? (score >= 3 ? "bg-emerald-500" : "bg-amber-500") : "bg-slate-200"
            }`}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {checks.map((check) => (
          <span
            key={check.label}
            className={`inline-flex items-center gap-1.5 text-[11px] ${
              check.passed ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {check.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function Consent({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: boolean;
  children: ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3.5 text-sm leading-6 transition ${
        error
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 accent-[#0067b8]"
      />
      <span>{children}</span>
    </label>
  );
}

function RegisterPanel() {
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const { signUpWithEmail } = useAuth();
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<RoleId>("teacher");
  const [data, setData] = useState<RegistrationData>(initialData);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [guardianConsent, setGuardianConsent] = useState(false);
  const [authorityDeclaration, setAuthorityDeclaration] = useState(false);
  const [mfaDeclaration, setMfaDeclaration] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);

  const activeRole = useMemo(() => roles.find((item) => item.id === role) ?? roles[0], [role]);
  const ActiveRoleIcon = activeRole.icon;
  const currentStep = steps[step];
  const progress = ((step + 1) / steps.length) * 100;

  const setField = (field: keyof RegistrationData, value: string) => {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
    setFormError("");
  };

  const validateStep = (stepIndex: number) => {
    const nextErrors: Record<string, string> = {};

    if (stepIndex === 1) {
      if (data.firstName.trim().length < 2) nextErrors.firstName = "Podaj pełne imię.";
      if (data.lastName.trim().length < 2) nextErrors.lastName = "Podaj pełne nazwisko.";
      if (!/^\S+@\S+\.\S+$/.test(data.email.trim())) {
        nextErrors.email = "Wpisz prawidłowy adres e-mail.";
      }
      if (data.phone && !/^[+\d][\d\s-]{7,}$/.test(data.phone.trim())) {
        nextErrors.phone = "Sprawdź format numeru telefonu.";
      }
      if (role === "admin" && !data.phone.trim()) {
        nextErrors.phone = "Numer służbowy jest wymagany do weryfikacji administracji.";
      }
    }

    if (stepIndex === 2) {
      if (role === "teacher") {
        if (!data.school.trim()) nextErrors.school = "Podaj nazwę placówki.";
        if (!data.position.trim()) nextErrors.position = "Podaj stanowisko.";
        if (!data.subject.trim()) nextErrors.subject = "Podaj nauczany przedmiot.";
      }
      if (role === "admin") {
        if (!data.school.trim()) nextErrors.school = "Podaj nazwę organizacji.";
        if (!data.position.trim()) nextErrors.position = "Podaj stanowisko służbowe.";
        if (!validateRspo(data.rspo)) nextErrors.rspo = "Wpisz prawidłowy numer RSPO (4–10 cyfr).";
        if (!validateRegon(data.regon))
          nextErrors.regon = "Wpisz prawidłowy REGON z poprawną sumą kontrolną.";
        if (data.nip.trim() && !validateNip(data.nip))
          nextErrors.nip = "Wpisz prawidłowy NIP z poprawną sumą kontrolną.";
        if (!data.authorizationBasis.trim())
          nextErrors.authorizationBasis = "Opisz podstawę umocowania do reprezentowania placówki.";
        if (data.accessCode.trim() && data.accessCode.trim().length < 6) {
          nextErrors.accessCode = "Kod zaproszenia ma co najmniej 6 znaków.";
        }
      }
      if (role === "parent") {
        if (!data.studentName.trim()) nextErrors.studentName = "Podaj imię i nazwisko ucznia.";
        if (!data.studentClass.trim()) nextErrors.studentClass = "Podaj klasę ucznia.";
        if (data.accessCode.trim().length < 6) {
          nextErrors.accessCode = "Wpisz kod powiązania przekazany przez szkołę.";
        }
      }
      if (role === "student") {
        if (!data.school.trim()) nextErrors.school = "Podaj nazwę szkoły.";
        if (!data.studentClass.trim()) nextErrors.studentClass = "Podaj klasę.";
        if (data.accessCode.trim().length < 6) {
          nextErrors.accessCode = "Wpisz kod aktywacyjny przekazany przez szkołę.";
        }
      }
    }

    if (stepIndex === 3) {
      if (data.password.length < 10) nextErrors.password = "Hasło musi mieć co najmniej 10 znaków.";
      else if (
        !/[a-z]/.test(data.password) ||
        !/[A-Z]/.test(data.password) ||
        !/\d/.test(data.password)
      ) {
        nextErrors.password = "Dodaj małą i wielką literę oraz cyfrę.";
      }
      if (data.confirmPassword !== data.password) {
        nextErrors.confirmPassword = "Hasła nie są identyczne.";
      }
      if (!terms) nextErrors.terms = "Zaakceptuj regulamin.";
      if (!privacy) nextErrors.privacy = "Zaakceptuj politykę prywatności.";
      if (role === "student" && !guardianConsent) {
        nextErrors.guardianConsent = "Wymagane jest potwierdzenie wieku lub zgody opiekuna.";
      }
      if (role === "admin" && !authorityDeclaration) {
        nextErrors.authorityDeclaration = "Potwierdź umocowanie i prawdziwość danych.";
      }
      if (role === "admin" && !mfaDeclaration) {
        nextErrors.mfaDeclaration = "Potwierdź obowiązek silnego uwierzytelniania.";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const nextStep = () => {
    if (!validateStep(step)) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const previousStep = () => {
    setErrors({});
    setFormError("");
    setStep((current) => Math.max(current - 1, 0));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (step < steps.length - 1) {
      nextStep();
      return;
    }
    if (!validateStep(3)) return;
    if (!isSupabaseConfigured) {
      setFormError("Rejestracja nie jest skonfigurowana w tym środowisku.");
      return;
    }

    setLoading(true);
    setFormError("");
    const { error } = await signUpWithEmail(data.email.trim(), data.password, role, {
      first_name: data.firstName.trim(),
      last_name: data.lastName.trim(),
      full_name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      display_name: `${data.firstName.trim()} ${data.lastName.trim()}`,
      phone: data.phone.trim(),
      school: data.school.trim(),
      position: data.position.trim(),
      subject: data.subject.trim(),
      student_name: data.studentName.trim(),
      student_class: data.studentClass.trim(),
      access_code: data.accessCode.trim().toUpperCase(),
      institution_rspo: data.rspo.replace(/\D/g, ""),
      institution_regon: data.regon.replace(/\D/g, ""),
      institution_nip: data.nip.replace(/\D/g, ""),
      institution_website: data.website.trim(),
      authorization_basis: data.authorizationBasis.trim(),
      institution_manual_review: String(
        role === "admin" && requiresManualInstitutionReview(data.email),
      ),
      privileged_access_requires_mfa: String(role === "admin"),
      registration_source: "identity_portal_v3",
    });
    setLoading(false);

    if (error) {
      setFormError(error);
      return;
    }
    setCompleted(true);
    toast.success("Wniosek rejestracyjny został utworzony.");
  };

  if (completed) {
    return (
      <div className="edunex-next-gen-identity identity-confirmation grid min-h-screen place-items-center bg-[#f4f6f8] px-5 py-10 text-slate-950">
        <Toaster position="top-center" theme="light" richColors />
        <motion.main
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="identity-confirmation-card w-full max-w-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,.12)]"
        >
          <div className="border-b border-emerald-100 bg-emerald-50 px-6 py-7 text-center sm:px-10">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-900/10">
              <MailCheck className="h-7 w-7" />
            </span>
            <div className="mt-4 text-xs font-bold uppercase tracking-[0.13em] text-emerald-700">
              Wniosek zapisany
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.035em]">
              Sprawdź swoją skrzynkę
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Link potwierdzający wysłaliśmy na{" "}
              <strong className="text-slate-900">{data.email}</strong>.
            </p>
          </div>
          <div className="p-6 sm:p-10">
            <div className="grid gap-3">
              {[
                [
                  "1",
                  "Potwierdź adres e-mail",
                  "Otwórz wiadomość od EduNex i kliknij bezpieczny link.",
                ],
                [
                  "2",
                  "Poznajmy Twój sposób pracy",
                  "Po potwierdzeniu odpowiesz na kilka krótkich pytań, a EduNex dopasuje pierwszy widok.",
                ],
                ["3", `Weryfikacja roli: ${activeRole.shortLabel}`, activeRole.approval],
                [
                  "4",
                  "Wejdź do właściwego panelu",
                  "Po akceptacji roli system automatycznie otworzy bezpieczne środowisko.",
                ],
              ].map(([number, title, description]) => (
                <div
                  key={number}
                  className="grid grid-cols-[34px_1fr] gap-3 rounded-lg border border-slate-200 p-4"
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md bg-[#0067b8]/10 text-xs font-bold text-[#0067b8]">
                    {number}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">{title}</span>
                    <span className="mt-1 block text-xs leading-5 text-slate-500">
                      {description}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <Link
              to="/auth"
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-5 text-sm font-semibold text-white transition hover:bg-[#005a9e]"
            >
              Przejdź do logowania
              <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 text-center text-xs leading-5 text-slate-500">
              Wiadomość nie dotarła? Sprawdź spam lub odczekaj kilka minut przed ponowną próbą.
            </p>
          </div>
        </motion.main>
      </div>
    );
  }

  return (
    <div className="edunex-next-gen-identity min-h-screen bg-[#f4f6f8] text-slate-950 antialiased">
      <Toaster position="top-center" theme={resolvedTheme} richColors />

      <header className="identity-topbar border-b border-slate-200 bg-white/95 backdrop-blur-xl">
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
            <ThemeSwitcher compact />
            <Link
              to="/pomoc"
              className="hidden items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-950 sm:inline-flex"
            >
              <HelpCircle className="h-4 w-4" />
              Centrum pomocy
            </Link>
            <Link
              to="/auth"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-[6px] border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Mam już konto
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main className="identity-main mx-auto w-full max-w-[1440px] px-4 py-6 sm:px-8 sm:py-10 lg:px-10">
        <form onSubmit={submit} noValidate>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="identity-shell grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.11)] lg:grid-cols-[380px_minmax(0,1fr)]"
          >
            <aside className="identity-institutional relative hidden overflow-hidden border-r border-slate-800 bg-[#071426] p-8 text-white lg:block xl:p-10">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.3]"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(148,163,184,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.09) 1px,transparent 1px)",
                  backgroundSize: "36px 36px",
                  maskImage: "linear-gradient(to bottom, black, transparent 75%)",
                }}
              />
              <div className="relative flex h-full min-h-[700px] flex-col">
                <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-200">
                  <ClipboardCheck className="h-4 w-4" />
                  Konfiguracja konta
                </div>
                <h1 className="mt-6 text-[36px] font-semibold leading-[1.1] tracking-[-0.04em] text-white">
                  Konto dopasowane do Twojej roli.
                </h1>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                  Cztery krótkie etapy prowadzą od wyboru roli do bezpiecznego wniosku o dostęp.
                </p>

                <StepRail currentStep={step} />

                <div className="mt-auto pt-8">
                  <div className="rounded-xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur">
                    <div className="flex items-start gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="h-[18px] w-[18px]" />
                      </span>
                      <span>
                        <span className="block text-sm font-semibold text-white">
                          Kontrolowany dostęp
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-300">
                          Wybór roli składa wniosek. Uprawnienia aktywuje dopiero placówka.
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            <section className="identity-content p-5 sm:p-8 lg:p-10 xl:p-12">
              <div className="mx-auto w-full max-w-[820px]">
                <div className="lg:hidden">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-600">
                    <span>
                      Krok {step + 1} z {steps.length}
                    </span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#0067b8] transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between lg:mt-0">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.13em] text-[#0067b8]">
                      Krok {step + 1} · {currentStep.label}
                    </div>
                    <h2 className="mt-2.5 text-[30px] font-semibold tracking-[-0.035em] text-slate-950 sm:text-[34px]">
                      {step === 0 && "Kim jesteś w EduNex?"}
                      {step === 1 && "Podaj dane tożsamości"}
                      {step === 2 && "Połącz konto z placówką"}
                      {step === 3 && "Zabezpiecz i sprawdź konto"}
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                      {step === 0 &&
                        "Rola ustala formularz, zakres panelu i sposób zatwierdzania dostępu."}
                      {step === 1 &&
                        "Użyj danych, które placówka będzie mogła jednoznacznie zweryfikować."}
                      {step === 2 && activeRole.approval}
                      {step === 3 &&
                        "Ustaw silne hasło i sprawdź podsumowanie przed wysłaniem wniosku."}
                    </p>
                  </div>
                  <span className="inline-flex w-fit shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    <ActiveRoleIcon className="h-3.5 w-3.5 text-[#0067b8]" />
                    {activeRole.shortLabel}
                  </span>
                </div>

                {!isSupabaseConfigured && (
                  <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>
                      Widok demonstracyjny — wysłanie rejestracji wymaga konfiguracji Supabase.
                    </span>
                  </div>
                )}

                {formError && (
                  <div
                    role="alert"
                    className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-900"
                  >
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={currentStep.id}
                    initial={reduceMotion ? false : { opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={reduceMotion ? undefined : { opacity: 0, x: -8 }}
                    transition={{ duration: 0.2 }}
                    className="mt-7"
                  >
                    {step === 0 && (
                      <div>
                        <div className="grid gap-3 sm:grid-cols-2">
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
                                  setErrors({});
                                }}
                                className={`relative rounded-xl border p-5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/30 ${
                                  selected
                                    ? "border-[#0067b8] bg-[#f3f8fc] shadow-[0_0_0_1px_rgba(0,103,184,.08)]"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <span className="flex items-start justify-between gap-4">
                                  <span
                                    className={`grid h-10 w-10 place-items-center rounded-lg ${selected ? "bg-[#0067b8] text-white" : "bg-slate-100 text-slate-600"}`}
                                  >
                                    <Icon className="h-[18px] w-[18px]" />
                                  </span>
                                  {selected && <CheckCircle2 className="h-5 w-5 text-[#0067b8]" />}
                                </span>
                                <span className="mt-4 block text-base font-semibold text-slate-950">
                                  {item.label}
                                </span>
                                <span className="mt-1.5 block text-xs leading-5 text-slate-600">
                                  {item.description}
                                </span>
                                <span className="mt-4 flex flex-wrap gap-1.5">
                                  {item.benefits.map((benefit) => (
                                    <span
                                      key={benefit}
                                      className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600"
                                    >
                                      {benefit}
                                    </span>
                                  ))}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <div className="mt-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50/60 p-4 text-xs leading-5 text-slate-700">
                          <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0067b8]" />
                          <span>
                            <strong className="font-semibold">Jak działa akceptacja?</strong>{" "}
                            {activeRole.approval} Wybrana rola nie daje dostępu sama w sobie.
                          </span>
                        </div>
                      </div>
                    )}

                    {step === 1 && (
                      <div className="grid gap-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            id="firstName"
                            label="Imię"
                            value={data.firstName}
                            onChange={(value) => setField("firstName", value)}
                            placeholder="Anna"
                            autoComplete="given-name"
                            required
                            error={errors.firstName}
                          />
                          <Input
                            id="lastName"
                            label="Nazwisko"
                            value={data.lastName}
                            onChange={(value) => setField("lastName", value)}
                            placeholder="Nowak"
                            autoComplete="family-name"
                            required
                            error={errors.lastName}
                          />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            id="email"
                            label="Adres e-mail"
                            type="email"
                            value={data.email}
                            onChange={(value) => setField("email", value)}
                            placeholder="anna.nowak@szkola.pl"
                            autoComplete="email"
                            inputMode="email"
                            required
                            error={errors.email}
                            hint="Na ten adres wyślemy link potwierdzający."
                          />
                          <Input
                            id="phone"
                            label={
                              role === "admin"
                                ? "Służbowy telefon kontaktowy"
                                : "Telefon kontaktowy"
                            }
                            value={data.phone}
                            onChange={(value) => setField("phone", value)}
                            placeholder="+48 000 000 000"
                            autoComplete="tel"
                            inputMode="tel"
                            required={role === "admin"}
                            error={errors.phone}
                            hint={
                              role === "admin"
                                ? "Numer zostanie użyty do niezależnego potwierdzenia w placówce."
                                : "Opcjonalny; pomocny przy weryfikacji konta."
                            }
                          />
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                          <div className="flex items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#0067b8] shadow-sm">
                              <BadgeCheck className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-slate-900">
                                Dane do weryfikacji
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-slate-600">
                                Administrator zobaczy wyłącznie informacje potrzebne do
                                potwierdzenia roli i przypisania do placówki.
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 2 && (
                      <div className="grid gap-5">
                        {role === "teacher" && (
                          <>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                id="school"
                                label="Szkoła / placówka"
                                value={data.school}
                                onChange={(value) => setField("school", value)}
                                placeholder="Pełna nazwa placówki"
                                autoComplete="organization"
                                required
                                error={errors.school}
                              />
                              <Input
                                id="position"
                                label="Stanowisko"
                                value={data.position}
                                onChange={(value) => setField("position", value)}
                                placeholder="np. nauczyciel mianowany"
                                autoComplete="organization-title"
                                required
                                error={errors.position}
                              />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                id="subject"
                                label="Główny przedmiot"
                                value={data.subject}
                                onChange={(value) => setField("subject", value)}
                                placeholder="np. matematyka"
                                required
                                error={errors.subject}
                              />
                              <Input
                                id="accessCode"
                                label="Kod zaproszenia"
                                value={data.accessCode}
                                onChange={(value) => setField("accessCode", value.toUpperCase())}
                                placeholder="Opcjonalny kod szkoły"
                                hint="Jeśli szkoła przekazała kod, przyspieszy on weryfikację."
                              />
                            </div>
                          </>
                        )}

                        {role === "admin" && (
                          <>
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
                              <div className="flex items-start gap-3">
                                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />
                                <span>
                                  <strong className="block font-semibold">
                                    Dostęp uprzywilejowany
                                  </strong>
                                  Formularz składa wniosek. Nie nadaje roli administracyjnej. Dane
                                  zostaną porównane z rejestrem placówki, a umocowanie potwierdzone
                                  niezależnym kanałem.
                                </span>
                              </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                id="school"
                                label="Organizacja / placówka"
                                value={data.school}
                                onChange={(value) => setField("school", value)}
                                placeholder="Pełna nazwa prawna"
                                autoComplete="organization"
                                required
                                error={errors.school}
                              />
                              <Input
                                id="position"
                                label="Stanowisko służbowe"
                                value={data.position}
                                onChange={(value) => setField("position", value)}
                                placeholder="np. dyrektor, administrator IT"
                                autoComplete="organization-title"
                                required
                                error={errors.position}
                              />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                              <Input
                                id="rspo"
                                label="Numer RSPO"
                                value={data.rspo}
                                onChange={(value) => setField("rspo", value.replace(/\D/g, ""))}
                                placeholder="np. 123456"
                                inputMode="numeric"
                                required
                                error={errors.rspo}
                                hint="Identyfikator z publicznego rejestru szkół i placówek."
                              />
                              <Input
                                id="regon"
                                label="REGON placówki"
                                value={data.regon}
                                onChange={(value) => setField("regon", value.replace(/\D/g, ""))}
                                placeholder="9 lub 14 cyfr"
                                inputMode="numeric"
                                required
                                error={errors.regon}
                              />
                              <Input
                                id="nip"
                                label="NIP (jeśli nadany)"
                                value={data.nip}
                                onChange={(value) => setField("nip", value.replace(/\D/g, ""))}
                                placeholder="10 cyfr"
                                inputMode="numeric"
                                error={errors.nip}
                              />
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                id="website"
                                label="Oficjalna strona placówki"
                                type="url"
                                value={data.website}
                                onChange={(value) => setField("website", value)}
                                placeholder="https://szkola.edu.pl"
                                inputMode="url"
                                autoComplete="url"
                              />
                              <Input
                                id="accessCode"
                                label="Kod zaproszenia (opcjonalnie)"
                                value={data.accessCode}
                                onChange={(value) => setField("accessCode", value.toUpperCase())}
                                placeholder="EDX-ADMIN-XXXX"
                                error={errors.accessCode}
                                hint="Kod przyspiesza kontrolę, ale jej nie zastępuje."
                              />
                            </div>
                            <Input
                              id="authorizationBasis"
                              label="Podstawa umocowania"
                              value={data.authorizationBasis}
                              onChange={(value) => setField("authorizationBasis", value)}
                              placeholder="np. dyrektor wskazany w RSPO / pełnomocnictwo organu prowadzącego"
                              required
                              error={errors.authorizationBasis}
                              hint="Nie przesyłaj dokumentów ani danych wrażliwych w tym polu. Zespół weryfikacyjny poprosi o nie bezpiecznym kanałem, jeżeli będą konieczne."
                            />
                            {requiresManualInstitutionReview(data.email) && (
                              <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                                <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />
                                Publiczna domena pocztowa wymaga dodatkowej weryfikacji
                                telefonicznej z placówką. Użyj adresu służbowego, jeśli go
                                posiadasz.
                              </div>
                            )}
                          </>
                        )}

                        {role === "parent" && (
                          <>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                id="studentName"
                                label="Imię i nazwisko ucznia"
                                value={data.studentName}
                                onChange={(value) => setField("studentName", value)}
                                placeholder="Jan Nowak"
                                required
                                error={errors.studentName}
                              />
                              <Input
                                id="studentClass"
                                label="Klasa ucznia"
                                value={data.studentClass}
                                onChange={(value) => setField("studentClass", value.toUpperCase())}
                                placeholder="np. 2A"
                                required
                                error={errors.studentClass}
                              />
                            </div>
                            <Input
                              id="accessCode"
                              label="Kod powiązania od szkoły"
                              value={data.accessCode}
                              onChange={(value) => setField("accessCode", value.toUpperCase())}
                              placeholder="EDX-FAMILY-XXXX"
                              required
                              error={errors.accessCode}
                              hint="Kod nie zawiera ocen ani danych ucznia — służy tylko do bezpiecznego powiązania kont."
                            />
                          </>
                        )}

                        {role === "student" && (
                          <>
                            <div className="grid gap-4 sm:grid-cols-2">
                              <Input
                                id="school"
                                label="Szkoła"
                                value={data.school}
                                onChange={(value) => setField("school", value)}
                                placeholder="Nazwa szkoły"
                                autoComplete="organization"
                                required
                                error={errors.school}
                              />
                              <Input
                                id="studentClass"
                                label="Klasa"
                                value={data.studentClass}
                                onChange={(value) => setField("studentClass", value.toUpperCase())}
                                placeholder="np. 2A"
                                required
                                error={errors.studentClass}
                              />
                            </div>
                            <Input
                              id="accessCode"
                              label="Kod aktywacyjny ucznia"
                              value={data.accessCode}
                              onChange={(value) => setField("accessCode", value.toUpperCase())}
                              placeholder="EDX-STUDENT-XXXX"
                              required
                              error={errors.accessCode}
                              hint="Kod otrzymasz od nauczyciela lub administratora szkoły."
                            />
                          </>
                        )}

                        <div className="rounded-xl border border-blue-100 bg-[#f5f9fd] p-4">
                          <div className="flex items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-white text-[#0067b8] shadow-sm">
                              <BookOpenCheck className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-slate-900">
                                Proces dla roli: {activeRole.shortLabel}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-slate-600">
                                {activeRole.approval} Do czasu akceptacji konto nie uzyska dostępu
                                do chronionych paneli.
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {step === 3 && (
                      <div className="grid gap-5">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <Input
                            id="password"
                            label="Hasło"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={(value) => setField("password", value)}
                            placeholder="Minimum 10 znaków"
                            autoComplete="new-password"
                            required
                            error={errors.password}
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
                          <Input
                            id="confirmPassword"
                            label="Powtórz hasło"
                            type={showConfirm ? "text" : "password"}
                            value={data.confirmPassword}
                            onChange={(value) => setField("confirmPassword", value)}
                            placeholder="Powtórz hasło"
                            autoComplete="new-password"
                            required
                            error={errors.confirmPassword}
                            right={
                              <button
                                type="button"
                                onClick={() => setShowConfirm((value) => !value)}
                                className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                aria-label={
                                  showConfirm ? "Ukryj powtórzone hasło" : "Pokaż powtórzone hasło"
                                }
                              >
                                {showConfirm ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Eye className="h-4 w-4" />
                                )}
                              </button>
                            }
                          />
                        </div>

                        <PasswordMeter password={data.password} />

                        <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                          <div className="flex items-start gap-3">
                            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#0067b8]/10 text-[#0067b8]">
                              <ClipboardCheck className="h-4 w-4" />
                            </span>
                            <span>
                              <span className="block text-sm font-semibold text-slate-900">
                                {data.firstName || "Nowy użytkownik"} {data.lastName}
                              </span>
                              <span className="mt-1 block text-xs leading-5 text-slate-500">
                                {ROLE_LABEL[role]} · {data.email || "brak adresu"}
                              </span>
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-left text-xs font-semibold text-[#0067b8] hover:text-[#004f8b] sm:text-right"
                          >
                            Edytuj dane
                          </button>
                        </div>

                        <div className="grid gap-2.5">
                          <Consent
                            checked={terms}
                            onChange={(checked) => {
                              setTerms(checked);
                              setErrors((current) => ({ ...current, terms: "" }));
                            }}
                            error={Boolean(errors.terms)}
                          >
                            Akceptuję{" "}
                            <Link
                              to="/dokumenty"
                              className="font-semibold text-[#0067b8] hover:text-[#004f8b]"
                            >
                              regulamin świadczenia usług EduNex
                            </Link>
                            .
                          </Consent>
                          <Consent
                            checked={privacy}
                            onChange={(checked) => {
                              setPrivacy(checked);
                              setErrors((current) => ({ ...current, privacy: "" }));
                            }}
                            error={Boolean(errors.privacy)}
                          >
                            Zapoznałem(-am) się z{" "}
                            <Link
                              to="/dokumenty"
                              className="font-semibold text-[#0067b8] hover:text-[#004f8b]"
                            >
                              polityką prywatności i informacją RODO
                            </Link>
                            .
                          </Consent>
                          {role === "student" && (
                            <Consent
                              checked={guardianConsent}
                              onChange={(checked) => {
                                setGuardianConsent(checked);
                                setErrors((current) => ({ ...current, guardianConsent: "" }));
                              }}
                              error={Boolean(errors.guardianConsent)}
                            >
                              Potwierdzam, że mam ukończone 16 lat albo zgodę rodzica lub opiekuna
                              na utworzenie konta.
                            </Consent>
                          )}
                          {role === "admin" && (
                            <>
                              <Consent
                                checked={authorityDeclaration}
                                onChange={(checked) => {
                                  setAuthorityDeclaration(checked);
                                  setErrors((current) => ({
                                    ...current,
                                    authorityDeclaration: "",
                                  }));
                                }}
                                error={Boolean(errors.authorityDeclaration)}
                              >
                                Oświadczam, że dane są prawdziwe i posiadam umocowanie do złożenia
                                wniosku w imieniu wskazanej placówki. Przyjmuję do wiadomości, że
                                EduNex zweryfikuje je niezależnym kanałem.
                              </Consent>
                              <Consent
                                checked={mfaDeclaration}
                                onChange={(checked) => {
                                  setMfaDeclaration(checked);
                                  setErrors((current) => ({ ...current, mfaDeclaration: "" }));
                                }}
                                error={Boolean(errors.mfaDeclaration)}
                              >
                                Akceptuję obowiązkowe silne uwierzytelnianie (MFA) dla dostępu
                                dyrekcji i administracji oraz cykliczny przegląd aktywnych sesji.
                              </Consent>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    onClick={previousStep}
                    disabled={step === 0 || loading}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:invisible"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Wstecz
                  </button>
                  <div className="flex flex-col gap-2 sm:items-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex h-12 min-w-[220px] items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-6 text-sm font-semibold text-white transition hover:bg-[#005a9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/35 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : step === 3 ? (
                        <KeyRound className="h-4 w-4" />
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                      {loading
                        ? "Tworzenie wniosku..."
                        : step === 3
                          ? role === "admin"
                            ? "Wyślij wniosek do weryfikacji"
                            : "Utwórz bezpieczne konto"
                          : "Przejdź dalej"}
                    </button>
                    <span className="text-[11px] text-slate-400">
                      {step === 3
                        ? "Uprawnienia aktywuje placówka"
                        : `Następnie: ${steps[Math.min(step + 1, 3)].label}`}
                    </span>
                  </div>
                </div>
              </div>
            </section>
            <IdentityTrustCenter mode="register" className="lg:col-span-2" />
          </motion.div>
        </form>
      </main>
    </div>
  );
}
