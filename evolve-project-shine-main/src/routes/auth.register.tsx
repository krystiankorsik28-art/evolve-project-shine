import { useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  HelpCircle,
  Layers3,
  Loader2,
  LockKeyhole,
  School,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { isSupabaseConfigured } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth/auth-context";

type RoleId = "student" | "parent" | "teacher" | "admin";

const roles: Array<{
  id: RoleId;
  label: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    id: "teacher",
    label: "Nauczyciel",
    description: "Egzaminy, klasy, wyniki i narzędzia NexAi.",
    icon: Users,
  },
  {
    id: "admin",
    label: "Dyrekcja / Admin",
    description: "Placówka, role, raporty i bezpieczeństwo.",
    icon: Building2,
  },
  {
    id: "parent",
    label: "Rodzic",
    description: "Postępy ucznia, wyniki i komunikacja.",
    icon: School,
  },
  {
    id: "student",
    label: "Uczeń",
    description: "Profil ucznia używany przez jego szkołę.",
    icon: GraduationCap,
  },
];

const registrationSteps = [
  ["01", "Wybierz rolę", "Określa dostępne moduły i proces zatwierdzania."],
  ["02", "Uzupełnij dane", "Podaj dane konta oraz informacje o placówce."],
  ["03", "Zabezpiecz konto", "Ustaw hasło i zaakceptuj wymagane dokumenty."],
] as const;

export const Route = createFileRoute("/auth/register")({
  component: RegisterPanel,
  head: () => ({
    meta: [
      { title: "Rejestracja | EduNex" },
      {
        name: "description",
        content: "Utwórz bezpieczne konto EduNex dla nauczyciela, dyrekcji, rodzica lub ucznia.",
      },
    ],
  }),
});

function Input({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
  inputMode,
  right,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel";
  right?: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>
        {label}
        {required && (
          <span className="text-[#0067b8]" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </span>
      <span className="relative block">
        <input
          type={type}
          value={value}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-md border border-slate-300 bg-white px-3 pr-11 text-[15px] text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
        />
        {right && <span className="absolute right-3 top-1/2 -translate-y-1/2">{right}</span>}
      </span>
    </label>
  );
}

function BrandMark() {
  return (
    <span className="grid h-10 w-10 place-items-center rounded-md bg-[#0b1730] text-white shadow-sm">
      <Layers3 className="h-[18px] w-[18px]" />
    </span>
  );
}

function RegisterPanel() {
  const navigate = useNavigate();
  const { signUpWithEmail } = useAuth();
  const [role, setRole] = useState<RoleId>("teacher");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [school, setSchool] = useState("");
  const [position, setPosition] = useState("");
  const [student, setStudent] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeRole = roles.find((item) => item.id === role) ?? roles[0];
  const passwordLongEnough = password.length >= 8;
  const passwordsMatch = Boolean(confirm) && password === confirm;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      return toast.error(
        "Brakuje konfiguracji Supabase. Sprawdź VITE_SUPABASE_URL i VITE_SUPABASE_PUBLISHABLE_KEY.",
      );
    }
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password || !consent) {
      return toast.error("Uzupełnij wymagane pola i zgody");
    }
    if (password.length < 8) return toast.error("Hasło musi mieć minimum 8 znaków");
    if (password !== confirm) return toast.error("Hasła nie są takie same");

    setLoading(true);
    const { error } = await signUpWithEmail(email.trim(), password, role, {
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      phone: phone.trim(),
      school: school.trim(),
      position: position.trim(),
      student_name: student.trim(),
      student_class: studentClass.trim(),
    });
    setLoading(false);

    if (error) return toast.error(error);
    toast.success("Konto utworzone. Sprawdź e-mail.");
    await navigate({ to: "/auth", replace: true });
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
            <BrandMark />
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
              to="/auth"
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
            >
              Mam już konto
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <motion.form
          onSubmit={submit}
          aria-busy={loading}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.10)] lg:grid-cols-[0.82fr_1.18fr]"
        >
          <aside className="relative hidden overflow-hidden border-r border-slate-200 bg-[#eef4fb] p-10 lg:block xl:p-12">
            <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#0067b8]/10 blur-3xl" />
            <div className="relative flex h-full flex-col">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#0067b8]/15 bg-white/70 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#005a9e]">
                  <UserPlus className="h-4 w-4" />
                  Nowe konto EduNex
                </div>
                <h1 className="mt-6 max-w-md text-[40px] font-semibold leading-[1.12] tracking-[-0.035em] text-slate-950">
                  Dołącz do cyfrowego środowiska swojej szkoły.
                </h1>
                <p className="mt-4 max-w-md text-[15px] leading-7 text-slate-600">
                  Formularz prowadzi przez rolę, dane użytkownika i zabezpieczenie konta w jednym
                  czytelnym procesie.
                </p>
              </div>

              <ol className="mt-9 space-y-3" aria-label="Etapy rejestracji">
                {registrationSteps.map(([number, title, description]) => (
                  <li
                    key={number}
                    className="grid grid-cols-[36px_1fr] gap-3 rounded-lg border border-white/80 bg-white/75 p-4 shadow-sm"
                  >
                    <span className="grid h-9 w-9 place-items-center rounded-md bg-[#0067b8]/10 text-xs font-bold text-[#0067b8]">
                      {number}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-slate-900">{title}</span>
                      <span className="mt-1 block text-xs leading-5 text-slate-600">
                        {description}
                      </span>
                    </span>
                  </li>
                ))}
              </ol>

              <div className="mt-10 rounded-lg border border-slate-200/80 bg-white/70 p-4 lg:mt-auto">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-emerald-50 text-emerald-700">
                    <BadgeCheck className="h-[18px] w-[18px]" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">
                      Kontrolowane uprawnienia
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-slate-600">
                      Role nauczyciela i administratora mogą wymagać potwierdzenia przez placówkę.
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </aside>

          <section className="p-5 sm:p-8 lg:p-10 xl:p-12">
            <div className="mx-auto w-full max-w-3xl">
              <div className="flex flex-col gap-3 border-b border-slate-200 pb-7 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.1em] text-[#0067b8]">
                    Rejestracja konta
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-slate-950">
                    Utwórz profil użytkownika
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Pola oznaczone gwiazdką są wymagane. Pozostałe dane pomagają placówce
                    zweryfikować konto.
                  </p>
                </div>
                <span className="inline-flex shrink-0 items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Bezpieczny formularz
                </span>
              </div>

              {!isSupabaseConfigured && (
                <div className="mt-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
                  Lokalna konfiguracja Supabase nie jest aktywna. Rejestracja wymaga pliku
                  `.env.local` albo zmiennych Vercel.
                </div>
              )}

              <section className="mt-7" aria-labelledby="registration-role-heading">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <h3
                      id="registration-role-heading"
                      className="text-base font-semibold text-slate-950"
                    >
                      1. Typ konta
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Wybierz rolę, z którą będziesz korzystać z EduNex.
                    </p>
                  </div>
                  <span className="hidden text-xs font-medium text-[#0067b8] sm:block">
                    {activeRole.label}
                  </span>
                </div>
                <div
                  className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4"
                  role="group"
                  aria-label="Typ konta"
                >
                  {roles.map((item) => {
                    const Icon = item.icon;
                    const selected = role === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setRole(item.id)}
                        className={`relative rounded-lg border p-4 text-left transition focus:outline-none focus:ring-2 focus:ring-[#0067b8]/25 ${
                          selected
                            ? "border-[#0067b8] bg-[#f3f8fc] shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {selected && (
                          <Check className="absolute right-3 top-3 h-4 w-4 text-[#0067b8]" />
                        )}
                        <Icon
                          className={`mb-3 h-5 w-5 ${selected ? "text-[#0067b8]" : "text-slate-500"}`}
                        />
                        <span className="block text-sm font-semibold text-slate-950">
                          {item.label}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-slate-500">
                          {item.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section
                className="mt-8 border-t border-slate-200 pt-7"
                aria-labelledby="registration-data-heading"
              >
                <div className="mb-4">
                  <h3
                    id="registration-data-heading"
                    className="text-base font-semibold text-slate-950"
                  >
                    2. Dane użytkownika i placówki
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Dane będą widoczne wyłącznie w zakresie potrzebnym do obsługi konta.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Imię"
                      value={firstName}
                      onChange={setFirstName}
                      placeholder="Anna"
                      autoComplete="given-name"
                      required
                    />
                    <Input
                      label="Nazwisko"
                      value={lastName}
                      onChange={setLastName}
                      placeholder="Nowak"
                      autoComplete="family-name"
                      required
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Adres e-mail"
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="anna.nowak@szkola.pl"
                      autoComplete="email"
                      inputMode="email"
                      required
                    />
                    <Input
                      label="Telefon"
                      value={phone}
                      onChange={setPhone}
                      placeholder="+48 000 000 000"
                      autoComplete="tel"
                      inputMode="tel"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="Szkoła / placówka"
                      value={school}
                      onChange={setSchool}
                      placeholder="Nazwa placówki"
                      autoComplete="organization"
                    />
                    <Input
                      label="Stanowisko / klasa"
                      value={position}
                      onChange={setPosition}
                      placeholder="Nauczyciel, dyrektor, klasa 2A"
                      autoComplete="organization-title"
                    />
                  </div>
                  {(role === "parent" || role === "student") && (
                    <div className="grid gap-4 rounded-lg border border-blue-100 bg-blue-50/60 p-4 sm:grid-cols-2">
                      <Input
                        label="Dane dziecka / ucznia"
                        value={student}
                        onChange={setStudent}
                        placeholder="Imię i nazwisko ucznia"
                      />
                      <Input
                        label="Klasa ucznia"
                        value={studentClass}
                        onChange={setStudentClass}
                        placeholder="np. 2A"
                      />
                    </div>
                  )}
                </div>
              </section>

              <section
                className="mt-8 border-t border-slate-200 pt-7"
                aria-labelledby="registration-security-heading"
              >
                <div className="mb-4">
                  <h3
                    id="registration-security-heading"
                    className="text-base font-semibold text-slate-950"
                  >
                    3. Bezpieczeństwo konta
                  </h3>
                  <p className="mt-1 text-xs text-slate-500">
                    Ustaw hasło składające się z co najmniej 8 znaków.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Hasło"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={setPassword}
                    placeholder="Minimum 8 znaków"
                    autoComplete="new-password"
                    required
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
                    label="Powtórz hasło"
                    type={showConfirm ? "text" : "password"}
                    value={confirm}
                    onChange={setConfirm}
                    placeholder="Powtórz hasło"
                    autoComplete="new-password"
                    required
                    right={
                      <button
                        type="button"
                        onClick={() => setShowConfirm((value) => !value)}
                        className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                        aria-label={
                          showConfirm ? "Ukryj powtórzone hasło" : "Pokaż powtórzone hasło"
                        }
                      >
                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    }
                  />
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                      passwordLongEnough
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Minimum 8 znaków
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                      passwordsMatch
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50 text-slate-500"
                    }`}
                  >
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Hasła są zgodne
                  </span>
                </div>

                <label className="mt-5 flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  <input
                    type="checkbox"
                    checked={consent}
                    required
                    onChange={(event) => setConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-[#0067b8] focus:ring-[#0067b8]"
                  />
                  <span>
                    Akceptuję regulamin, politykę prywatności i zasady przetwarzania danych
                    osobowych opisane w{" "}
                    <Link
                      to="/dokumenty"
                      className="font-semibold text-[#0067b8] hover:text-[#004f8b]"
                    >
                      dokumentach EduNex
                    </Link>
                    .
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-[#0067b8] px-6 text-sm font-semibold text-white transition hover:bg-[#005a9e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                  {loading ? "Tworzenie konta..." : "Utwórz konto EduNex"}
                  {!loading && <ArrowRight className="h-4 w-4" />}
                </button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                  <BadgeCheck className="h-3.5 w-3.5 text-[#0067b8]" />
                  Dane są przesyłane przez chronione połączenie.
                </div>
              </section>
            </div>
          </section>
        </motion.form>
      </main>
    </div>
  );
}
