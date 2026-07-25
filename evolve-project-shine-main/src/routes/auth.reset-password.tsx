import { useEffect, useMemo, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  KeyRound,
  Layers3,
  Loader2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { passwordRequirementState, validateNewPassword } from "@/lib/auth/password-policy";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/lib/theme";

type RecoveryState = "checking" | "ready" | "invalid" | "saving" | "success";

export const Route = createFileRoute("/auth/reset-password")({
  component: ResetPassword,
  head: () => ({
    meta: [
      { title: "Ustaw nowe hasło | EduNex Identity" },
      { name: "description", content: "Bezpieczna zmiana hasła do konta EduNex." },
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

function ResetPassword() {
  const { resolvedTheme } = useTheme();
  const [state, setState] = useState<RecoveryState>("checking");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [error, setError] = useState("");
  const requirements = useMemo(() => passwordRequirementState(password), [password]);

  useEffect(() => {
    let active = true;
    const recoverySignal = `${window.location.search}${window.location.hash}`;
    const hasRecoverySignal = /type=recovery|token_hash=|access_token=|code=/.test(recoverySignal);

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === "PASSWORD_RECOVERY" && session) setState("ready");
    });

    void supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session && hasRecoverySignal) setState("ready");
      else
        window.setTimeout(
          () => active && setState((current) => (current === "checking" ? "invalid" : current)),
          1200,
        );
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const validationError = validateNewPassword(password, confirmation);
    if (validationError) {
      setError(validationError);
      return;
    }

    setState("saving");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(
        "Nie udało się ustawić hasła. Link mógł wygasnąć — poproś o nowy i spróbuj ponownie.",
      );
      setState("ready");
      return;
    }

    await supabase.auth.signOut({ scope: "global" });
    setPassword("");
    setConfirmation("");
    setState("success");
  };

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
              <span className="block text-[15px] font-semibold leading-4">EduNex</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Identity
              </span>
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-3">
            <ThemeSwitcher compact />
            <span className="hidden items-center gap-2 text-xs font-medium text-slate-600 sm:inline-flex">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              Chroniona operacja bezpieczeństwa
            </span>
          </div>
        </div>
      </header>

      <main className="identity-main mx-auto grid min-h-[calc(100vh-68px)] w-full max-w-[1180px] place-items-center px-5 py-10 sm:px-8">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="identity-shell identity-reset-shell grid w-full max-w-[940px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.09)] lg:grid-cols-[0.82fr_1.18fr]"
        >
          <aside className="identity-institutional bg-[#0b1730] p-8 text-white sm:p-10">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.16em] text-blue-200">
              EduNex Security
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">Ustaw nowe hasło</h1>
            <p className="mt-4 text-sm leading-6 text-slate-300">
              Link odzyskiwania tworzy jednorazową, szyfrowaną sesję. Po zmianie hasła wylogujemy
              wszystkie aktywne urządzenia.
            </p>
            <div className="mt-8 space-y-3 text-xs text-slate-300">
              {[
                "Jednorazowa sesja odzyskiwania",
                "Unieważnienie pozostałych sesji",
                "Ochrona przed ponownym użyciem linku",
              ].map((item) => (
                <span key={item} className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  {item}
                </span>
              ))}
            </div>
          </aside>

          <div className="identity-content p-7 sm:p-10">
            {state === "checking" && (
              <Status
                icon={<Loader2 className="h-6 w-6 animate-spin" />}
                title="Weryfikujemy link"
                description="Sprawdzamy jednorazową sesję odzyskiwania hasła."
              />
            )}
            {state === "invalid" && (
              <Status
                icon={<CircleAlert className="h-6 w-6" />}
                title="Link jest nieprawidłowy lub wygasł"
                description="Ze względów bezpieczeństwa link resetujący działa tylko przez ograniczony czas."
                action="Wyślij nowy link"
              />
            )}
            {state === "success" && (
              <Status
                icon={<CheckCircle2 className="h-7 w-7" />}
                title="Hasło zostało zmienione"
                description="Wszystkie sesje zostały zakończone. Zaloguj się ponownie nowym hasłem."
                action="Przejdź do logowania"
              />
            )}
            {(state === "ready" || state === "saving") && (
              <form onSubmit={submit} className="space-y-5" noValidate>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#0067b8]">
                    Nowe dane dostępowe
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.02em]">
                    Utwórz silne hasło
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Nie używaj hasła z innego serwisu ani danych łatwych do odgadnięcia.
                  </p>
                </div>

                <PasswordField
                  label="Nowe hasło"
                  value={password}
                  onChange={setPassword}
                  visible={showPassword}
                  onToggle={() => setShowPassword((value) => !value)}
                />
                <PasswordField
                  label="Powtórz nowe hasło"
                  value={confirmation}
                  onChange={setConfirmation}
                  visible={showConfirmation}
                  onToggle={() => setShowConfirmation((value) => !value)}
                />

                <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                  {requirements.map((requirement) => (
                    <span
                      key={requirement.id}
                      className={`flex items-center gap-2 text-xs ${requirement.passed ? "font-medium text-emerald-700" : "text-slate-500"}`}
                    >
                      <Check className="h-3.5 w-3.5" />
                      {requirement.label}
                    </span>
                  ))}
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900"
                  >
                    <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={state === "saving"}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0067b8]/35 focus-visible:ring-offset-2 disabled:opacity-60"
                >
                  {state === "saving" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <KeyRound className="h-4 w-4" />
                  )}
                  {state === "saving" ? "Zabezpieczanie konta..." : "Zapisz nowe hasło"}
                </button>
              </form>
            )}
          </div>
        </motion.section>
      </main>
    </div>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-slate-800">
      <span>{label}</span>
      <span className="relative block">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="new-password"
          className="h-[52px] w-full rounded-lg border border-slate-300 bg-white px-3 pr-12 text-[15px] text-slate-950 outline-none transition hover:border-slate-400 focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/20"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
          aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </span>
    </label>
  );
}

function Status({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: string;
}) {
  return (
    <div className="flex min-h-[340px] flex-col items-center justify-center text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0067b8]/10 text-[#0067b8]">
        {icon}
      </span>
      <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em]">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">{description}</p>
      {action && (
        <Link
          to="/auth"
          className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-[#0067b8] px-5 text-sm font-semibold text-white hover:bg-[#005a9e]"
        >
          {action}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
