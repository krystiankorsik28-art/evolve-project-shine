import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { createFileRoute, Link, redirect, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpenCheck,
  BrainCircuit,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  MessageSquareText,
  PartyPopper,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw redirect({ to: "/auth", replace: true });
  },
  component: OnboardingPage,
  head: () => ({
    meta: [
      { title: "Zacznijmy razem | EduNex" },
      {
        name: "description",
        content: "Krótka konfiguracja nowego konta EduNex i personalizacja pierwszych kroków.",
      },
    ],
  }),
});

type PurposeId = "teach" | "learn" | "manage" | "support";
type WorkModeId = "guided" | "quick" | "expert";
type ModuleId = "journal" | "exams" | "ai" | "communication" | "documents" | "analytics";

type IconType = ComponentType<{ className?: string }>;

type Purpose = {
  id: PurposeId;
  label: string;
  description: string;
  eyebrow: string;
  icon: IconType;
};

const STEPS = [
  { label: "Cel", question: "Do czego chcesz używać EduNex?" },
  { label: "Miejsce", question: "Gdzie będziemy pracować?" },
  { label: "Moduły", question: "Co ma być pod ręką od pierwszego dnia?" },
  { label: "Styl", question: "Jak EduNex ma z Tobą pracować?" },
  { label: "Start", question: "Twój EduNex jest gotowy." },
] as const;

const PURPOSES: Purpose[] = [
  {
    id: "teach",
    label: "Prowadzić lekcje i klasy",
    description: "Oceny, frekwencja, sprawdziany, materiały i kontakt z uczniami.",
    eyebrow: "Dla nauczyciela",
    icon: BookOpenCheck,
  },
  {
    id: "learn",
    label: "Uczyć się i śledzić postępy",
    description: "Zadania, terminy, wyniki, plan nauki i bezpieczna pomoc NexAI.",
    eyebrow: "Dla ucznia",
    icon: GraduationCap,
  },
  {
    id: "manage",
    label: "Zarządzać placówką",
    description: "Role, raporty, dokumenty, bezpieczeństwo i obraz pracy całej szkoły.",
    eyebrow: "Dla dyrekcji",
    icon: LayoutDashboard,
  },
  {
    id: "support",
    label: "Wspierać dziecko",
    description: "Najważniejsze wyniki, obecności, wiadomości i nadchodzące wydarzenia.",
    eyebrow: "Dla rodzica",
    icon: UsersRound,
  },
];

const MODULES: Array<{
  id: ModuleId;
  label: string;
  description: string;
  icon: IconType;
  accent: string;
}> = [
  {
    id: "journal",
    label: "NexDziennik",
    description: "Plan, oceny, frekwencja i życie klasy.",
    icon: CalendarDays,
    accent: "bg-blue-50 text-blue-700",
  },
  {
    id: "exams",
    label: "Egzaminy i PIN",
    description: "Sprawdziany, bank pytań i wyniki.",
    icon: ClipboardCheck,
    accent: "bg-violet-50 text-violet-700",
  },
  {
    id: "ai",
    label: "NexAI",
    description: "Pomoc w przygotowaniu i nauce.",
    icon: BrainCircuit,
    accent: "bg-cyan-50 text-cyan-700",
  },
  {
    id: "communication",
    label: "Wiadomości",
    description: "Ogłoszenia i spokojny kontakt ze szkołą.",
    icon: MessageSquareText,
    accent: "bg-emerald-50 text-emerald-700",
  },
  {
    id: "documents",
    label: "Dokumenty",
    description: "Zgody, procedury i materiały placówki.",
    icon: ShieldCheck,
    accent: "bg-amber-50 text-amber-700",
  },
  {
    id: "analytics",
    label: "Raporty",
    description: "Czytelne trendy i najważniejsze sygnały.",
    icon: LayoutDashboard,
    accent: "bg-rose-50 text-rose-700",
  },
];

const WORK_MODES: Array<{
  id: WorkModeId;
  label: string;
  description: string;
}> = [
  {
    id: "guided",
    label: "Prowadź mnie krok po kroku",
    description: "Podpowiedzi i krótkie objaśnienia w nowych miejscach.",
  },
  {
    id: "quick",
    label: "Pokazuj tylko najważniejsze",
    description: "Proste skróty, priorytety i minimum komunikatów.",
  },
  {
    id: "expert",
    label: "Daj mi pełną kontrolę",
    description: "Więcej danych, ustawień i zaawansowanych działań.",
  },
];

const PURPOSE_TO_MODULES: Record<PurposeId, ModuleId[]> = {
  teach: ["journal", "exams", "communication"],
  learn: ["journal", "exams", "ai"],
  manage: ["analytics", "documents", "journal"],
  support: ["journal", "communication"],
};

function OnboardingPage() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [purpose, setPurpose] = useState<PurposeId | null>(null);
  const [organization, setOrganization] = useState("");
  const [modules, setModules] = useState<ModuleId[]>([]);
  const [workMode, setWorkMode] = useState<WorkModeId>("guided");
  const [notifications, setNotifications] = useState(true);
  const [aiPersonalization, setAiPersonalization] = useState(true);

  useEffect(() => {
    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const metadata = data.user.user_metadata ?? {};
      const requestedRole =
        typeof metadata.requested_role === "string" ? metadata.requested_role : "";
      const suggestedPurpose: PurposeId | null =
        requestedRole === "teacher"
          ? "teach"
          : requestedRole === "student"
            ? "learn"
            : requestedRole === "admin"
              ? "manage"
              : requestedRole === "parent"
                ? "support"
                : null;

      setFirstName(typeof metadata.first_name === "string" ? metadata.first_name : "");
      setLastName(typeof metadata.last_name === "string" ? metadata.last_name : "");
      setOrganization(typeof metadata.school === "string" ? metadata.school : "");
      setPurpose(suggestedPurpose);
      setModules(suggestedPurpose ? PURPOSE_TO_MODULES[suggestedPurpose] : []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  const progress = ((step + 1) / STEPS.length) * 100;
  const activePurpose = PURPOSES.find((item) => item.id === purpose);
  const selectedModules = useMemo(
    () => MODULES.filter((module) => modules.includes(module.id)),
    [modules],
  );

  const canContinue =
    (step === 0 && purpose !== null) ||
    (step === 1 && firstName.trim().length > 0) ||
    (step === 2 && modules.length > 0) ||
    step >= 3;

  const selectPurpose = (nextPurpose: PurposeId) => {
    setPurpose(nextPurpose);
    setModules(PURPOSE_TO_MODULES[nextPurpose]);
  };

  const toggleModule = (moduleId: ModuleId) => {
    setModules((current) =>
      current.includes(moduleId)
        ? current.filter((item) => item !== moduleId)
        : [...current, moduleId],
    );
  };

  const goToStep = (nextStep: number) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(Math.min(Math.max(nextStep, 0), STEPS.length - 1));
  };

  const complete = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        onboarding_version: 2,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        organization_name: organization.trim(),
        onboarding_profile: purpose,
        onboarding_modules: modules,
        onboarding_work_mode: workMode,
        notification_digest_enabled: notifications,
        ai_personalization_enabled: aiPersonalization,
      },
    });

    if (error) {
      setSaving(false);
      toast.error("Nie udało się zapisać konfiguracji. Spróbuj ponownie.");
      return;
    }

    toast.success("Przestrzeń EduNex jest gotowa.");
    window.setTimeout(
      () => {
        navigate({ to: "/auth/callback", replace: true });
      },
      reduceMotion ? 150 : 850,
    );
  };

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f4f7fb] text-slate-950">
        <div className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl bg-[#0f6cbd] text-white shadow-lg shadow-blue-900/15">
            <Loader2 className="h-5 w-5 animate-spin" />
          </span>
          <p className="mt-4 text-sm font-medium text-slate-600">Przygotowujemy Twój start…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f4f7fb] text-slate-950">
      <Toaster position="top-center" theme="light" richColors />
      <BackgroundOrbs reduceMotion={Boolean(reduceMotion)} />

      <header className="relative z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-10">
          <Link
            to="/"
            className="inline-flex items-center gap-3 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0f6cbd]/40"
          >
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-4">EduNex</span>
              <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.13em] text-slate-500">
                Pierwsze uruchomienie
              </span>
            </span>
          </Link>
          <Link
            to="/pomoc"
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950"
          >
            <HelpCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Potrzebujesz pomocy?</span>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid min-h-[calc(100vh-68px)] max-w-[1440px] lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200/80 bg-[#0b1728] px-6 py-7 text-white lg:border-b-0 lg:border-r lg:px-8 lg:py-10">
          <div className="lg:sticky lg:top-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-100">
              <PartyPopper className="h-3.5 w-3.5" />
              Witaj w EduNex
            </div>
            <h1 className="mt-5 max-w-xs text-3xl font-semibold leading-tight tracking-[-0.035em] sm:text-4xl">
              Kilka odpowiedzi. Lepszy pierwszy dzień.
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Skonfigurujemy skróty i podpowiedzi. Twoja rola oraz dostęp są weryfikowane osobno
              przez placówkę.
            </p>

            <div className="mt-8 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <motion.div
                className="h-full rounded-full bg-[#60a5fa]"
                animate={{ width: `${progress}%` }}
                transition={reduceMotion ? { duration: 0 } : { duration: 0.45, ease: "easeOut" }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
              <span>
                Krok {step + 1} z {STEPS.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>

            <ol className="mt-8 hidden space-y-2 lg:block" aria-label="Postęp konfiguracji">
              {STEPS.map((item, index) => {
                const isActive = index === step;
                const isDone = index < step;
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => index <= step && goToStep(index)}
                      disabled={index > step}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                        isActive
                          ? "bg-white/10 text-white"
                          : isDone
                            ? "text-blue-100 hover:bg-white/[0.06]"
                            : "text-slate-500"
                      }`}
                    >
                      <span
                        className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-xs font-bold ${
                          isActive
                            ? "border-blue-300/40 bg-blue-400/15 text-blue-100"
                            : isDone
                              ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-200"
                              : "border-white/10 bg-white/[0.03]"
                        }`}
                      >
                        {isDone ? <Check className="h-4 w-4" /> : index + 1}
                      </span>
                      <span>
                        <span className="block text-sm font-semibold">{item.label}</span>
                        <span className="mt-0.5 block text-[11px] text-slate-400">
                          {item.question}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 hidden rounded-xl border border-white/10 bg-white/[0.05] p-4 text-xs leading-6 text-slate-300 lg:block">
              <div className="flex items-center gap-2 font-semibold text-white">
                <ShieldCheck className="h-4 w-4 text-blue-300" />
                Bezpieczna personalizacja
              </div>
              <p className="mt-2">
                Odpowiedzi ustawiają widok i skróty. Nie przyznają roli ani uprawnień.
              </p>
            </div>
          </div>
        </aside>

        <section className="flex min-w-0 flex-col px-4 py-6 sm:px-8 sm:py-10 lg:px-12 lg:py-12 xl:px-16">
          <div className="mx-auto flex w-full max-w-4xl flex-1 items-center">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={step}
                custom={direction}
                variants={stepVariants}
                initial={reduceMotion ? false : "initial"}
                animate="animate"
                exit={reduceMotion ? undefined : "exit"}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {step === 0 && (
                  <StepFrame
                    eyebrow="Poznajmy się"
                    title={
                      firstName
                        ? `${firstName}, do czego chcesz używać EduNex?`
                        : "Do czego chcesz używać EduNex?"
                    }
                    description="Wybierz odpowiedź najbliższą Twojej codziennej pracy. Możesz ją później zmienić w profilu."
                  >
                    <div className="grid gap-3 sm:grid-cols-2">
                      {PURPOSES.map((item) => {
                        const Icon = item.icon;
                        const selected = purpose === item.id;
                        return (
                          <motion.button
                            key={item.id}
                            type="button"
                            onClick={() => selectPurpose(item.id)}
                            whileHover={reduceMotion ? undefined : { y: -3 }}
                            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                            className={`group relative min-h-48 overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                              selected
                                ? "border-[#0f6cbd] bg-blue-50 shadow-[0_18px_50px_rgba(15,108,189,.14)]"
                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
                            }`}
                          >
                            <span
                              className={`grid h-11 w-11 place-items-center rounded-xl ${selected ? "bg-[#0f6cbd] text-white" : "bg-slate-100 text-slate-600 group-hover:bg-slate-950 group-hover:text-white"}`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="mt-5 block text-[11px] font-bold uppercase tracking-[0.11em] text-[#0f6cbd]">
                              {item.eyebrow}
                            </span>
                            <span className="mt-1 block text-lg font-semibold tracking-[-0.02em] text-slate-950">
                              {item.label}
                            </span>
                            <span className="mt-2 block text-sm leading-6 text-slate-600">
                              {item.description}
                            </span>
                            {selected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-4 top-4 grid h-7 w-7 place-items-center rounded-full bg-[#0f6cbd] text-white"
                              >
                                <Check className="h-4 w-4" />
                              </motion.span>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </StepFrame>
                )}

                {step === 1 && (
                  <StepFrame
                    eyebrow="Twoja przestrzeń"
                    title="Jak mamy się do Ciebie zwracać?"
                    description="Te dane pojawią się w profilu i powitaniach. Nazwa placówki pomaga dopasować kontekst, ale nie przypisuje do organizacji."
                  >
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <Field
                          label="Imię"
                          value={firstName}
                          onChange={setFirstName}
                          autoComplete="given-name"
                          placeholder="Anna"
                          icon={UserRound}
                          required
                        />
                        <Field
                          label="Nazwisko"
                          value={lastName}
                          onChange={setLastName}
                          autoComplete="family-name"
                          placeholder="Nowak"
                          icon={UserRound}
                        />
                      </div>
                      <div className="mt-5">
                        <Field
                          label="Szkoła lub organizacja"
                          value={organization}
                          onChange={setOrganization}
                          autoComplete="organization"
                          placeholder="np. Liceum Ogólnokształcące nr 3"
                          icon={Building2}
                        />
                      </div>
                      <div className="mt-5 flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-950">
                        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0f6cbd]" />
                        <span>
                          Przypisanie do placówki i uprawnienia potwierdza administrator —
                          niezależnie od tej konfiguracji.
                        </span>
                      </div>
                    </div>
                  </StepFrame>
                )}

                {step === 2 && (
                  <StepFrame
                    eyebrow="Twój pulpit"
                    title="Co ma być pod ręką od pierwszego dnia?"
                    description="Wybierz co najmniej jeden moduł. Najważniejsze elementy trafią wyżej na Twojej stronie startowej."
                  >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {MODULES.map((item) => {
                        const Icon = item.icon;
                        const selected = modules.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleModule(item.id)}
                            className={`relative rounded-2xl border bg-white p-5 text-left shadow-sm transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                              selected
                                ? "border-[#0f6cbd] ring-1 ring-[#0f6cbd]"
                                : "border-slate-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                            }`}
                          >
                            <span
                              className={`grid h-10 w-10 place-items-center rounded-xl ${item.accent}`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="mt-5 block text-base font-semibold text-slate-950">
                              {item.label}
                            </span>
                            <span className="mt-2 block text-sm leading-6 text-slate-600">
                              {item.description}
                            </span>
                            <span
                              className={`absolute right-4 top-4 grid h-6 w-6 place-items-center rounded-full border ${selected ? "border-[#0f6cbd] bg-[#0f6cbd] text-white" : "border-slate-300 bg-white text-transparent"}`}
                            >
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </StepFrame>
                )}

                {step === 3 && (
                  <StepFrame
                    eyebrow="Styl pracy"
                    title="Jak EduNex ma z Tobą pracować?"
                    description="Ustaw poziom prowadzenia oraz rodzaj powiadomień. Wszystko zmienisz później w ustawieniach."
                  >
                    <div className="grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
                      <div className="space-y-3">
                        {WORK_MODES.map((item) => {
                          const selected = workMode === item.id;
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setWorkMode(item.id)}
                              className={`flex w-full items-start gap-4 rounded-2xl border bg-white p-5 text-left shadow-sm transition ${
                                selected
                                  ? "border-[#0f6cbd] ring-1 ring-[#0f6cbd]"
                                  : "border-slate-200 hover:border-slate-300"
                              }`}
                            >
                              <span
                                className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? "border-[#0f6cbd] bg-[#0f6cbd] text-white" : "border-slate-300"}`}
                              >
                                {selected && <Check className="h-3.5 w-3.5" />}
                              </span>
                              <span>
                                <span className="block text-sm font-semibold text-slate-950">
                                  {item.label}
                                </span>
                                <span className="mt-1 block text-sm leading-6 text-slate-600">
                                  {item.description}
                                </span>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                      <div className="space-y-3">
                        <ToggleCard
                          icon={Bell}
                          title="Dzienny skrót"
                          description="Jedno podsumowanie zamiast wielu drobnych alertów."
                          checked={notifications}
                          onChange={setNotifications}
                        />
                        <ToggleCard
                          icon={BrainCircuit}
                          title="Personalizacja NexAI"
                          description="Dopasowuj przykłady i poziom wyjaśnień do wybranego stylu."
                          checked={aiPersonalization}
                          onChange={setAiPersonalization}
                        />
                      </div>
                    </div>
                  </StepFrame>
                )}

                {step === 4 && (
                  <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,.12)]">
                    <div className="relative overflow-hidden bg-[linear-gradient(135deg,#0b1728_0%,#123861_62%,#0f6cbd_100%)] px-6 py-10 text-center text-white sm:px-10 sm:py-12">
                      <motion.div
                        initial={reduceMotion ? false : { scale: 0.65, rotate: -12, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 180, damping: 14, delay: 0.1 }}
                        className="mx-auto grid h-20 w-20 place-items-center rounded-3xl border border-white/20 bg-white text-[#0f6cbd] shadow-[0_20px_60px_rgba(0,0,0,.2)]"
                      >
                        <CheckCircle2 className="h-10 w-10" />
                      </motion.div>
                      <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                      >
                        <div className="mt-6 text-xs font-bold uppercase tracking-[0.14em] text-blue-200">
                          Konfiguracja zakończona
                        </div>
                        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em] sm:text-5xl">
                          {firstName ? `${firstName}, wszystko gotowe.` : "Wszystko gotowe."}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-blue-50/80 sm:text-base">
                          Twój start został dopasowany. Po zapisaniu sprawdzimy zatwierdzoną rolę i
                          otworzymy właściwy panel.
                        </p>
                      </motion.div>
                      {!reduceMotion && <CelebrationDots />}
                    </div>
                    <div className="grid gap-5 p-6 sm:grid-cols-[1fr_1.15fr] sm:p-8">
                      <div className="rounded-2xl border border-slate-200 bg-[#f7f9fc] p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Twój profil startowy
                        </p>
                        <div className="mt-4 flex items-start gap-3">
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0f6cbd] text-white">
                            {activePurpose ? (
                              <activePurpose.icon className="h-5 w-5" />
                            ) : (
                              <Sparkles className="h-5 w-5" />
                            )}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-950">
                              {activePurpose?.label ?? "Spersonalizowany start"}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {organization.trim() || "Przestrzeń osobista EduNex"}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-slate-200 p-5">
                        <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          Priorytety
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedModules.map((item) => (
                            <span
                              key={item.id}
                              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                            >
                              <item.icon className="h-3.5 w-3.5 text-[#0f6cbd]" />
                              {item.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mx-auto mt-7 flex w-full max-w-4xl items-center justify-between gap-4 border-t border-slate-200/80 pt-5">
            <button
              type="button"
              onClick={() => goToStep(step - 1)}
              disabled={step === 0 || saving}
              className="inline-flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold text-slate-600 transition hover:bg-white hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft className="h-4 w-4" />
              Wstecz
            </button>
            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => canContinue && goToStep(step + 1)}
                disabled={!canContinue}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0f6cbd] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c5d9f] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Dalej
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={complete}
                disabled={saving}
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-[#0f6cbd] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0c5d9f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {saving ? "Zapisujemy…" : "Otwórz mój EduNex"}
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

const stepVariants = {
  initial: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 28 : -28,
    filter: "blur(4px)",
  }),
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: (direction: number) => ({ opacity: 0, x: direction > 0 ? -22 : 22, filter: "blur(3px)" }),
};

function StepFrame({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-7">
        <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#0f6cbd]">{eyebrow}</p>
        <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight tracking-[-0.035em] text-slate-950 sm:text-4xl lg:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      </div>
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  icon: Icon,
  ...inputProps
}: { label: string; value: string; onChange: (value: string) => void; icon: IconType } & Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "value" | "onChange"
>) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-800">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 transition focus-within:border-[#0f6cbd] focus-within:ring-4 focus-within:ring-blue-100">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        <input
          {...inputProps}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-full min-w-0 flex-1 bg-transparent text-sm text-slate-950 outline-none placeholder:text-slate-400"
        />
      </span>
    </label>
  );
}

function ToggleCard({
  icon: Icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: IconType;
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <span className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#0f6cbd]">
          <Icon className="h-5 w-5" />
        </span>
        <span>
          <span className="block text-sm font-semibold text-slate-950">{title}</span>
          <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-[#0f6cbd] peer-focus-visible:ring-4 peer-focus-visible:ring-blue-200 after:absolute after:left-1 after:top-1 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-5"
        aria-hidden="true"
      />
    </label>
  );
}

function BackgroundOrbs({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      <motion.div
        className="absolute -right-24 top-24 h-80 w-80 rounded-full bg-blue-300/20 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-cyan-300/15 blur-3xl"
        animate={reduceMotion ? undefined : { x: [0, 30, 0], y: [0, -20, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function CelebrationDots() {
  const dots = [
    ["10%", "26%", "#60a5fa", 0.15],
    ["18%", "72%", "#34d399", 0.3],
    ["30%", "15%", "#fbbf24", 0.45],
    ["70%", "20%", "#c4b5fd", 0.2],
    ["82%", "68%", "#67e8f9", 0.38],
    ["91%", "32%", "#fda4af", 0.52],
  ] as const;

  return (
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {dots.map(([left, top, color, delay]) => (
        <motion.span
          key={`${left}-${top}`}
          className="absolute h-2.5 w-2.5 rounded-sm"
          style={{ left, top, backgroundColor: color }}
          initial={{ opacity: 0, y: -8, rotate: 0 }}
          animate={{ opacity: [0, 1, 0], y: [0, 18, 40], rotate: [0, 90, 180] }}
          transition={{ duration: 2.2, delay, repeat: Infinity, repeatDelay: 1.2 }}
        />
      ))}
    </div>
  );
}
