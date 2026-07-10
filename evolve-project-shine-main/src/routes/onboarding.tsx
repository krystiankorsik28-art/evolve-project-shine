import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Loader2,
  ShieldCheck,
  User,
  Users,
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
  head: () => ({ meta: [{ title: "Konfiguracja | EduNex" }] }),
});

type RoleId = "student" | "teacher" | "parent" | "admin";

type StepConfig = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
};

const STEPS: StepConfig[] = [
  { id: "profile", icon: User, label: "Profil" },
  { id: "role", icon: GraduationCap, label: "Rola" },
  { id: "school", icon: Building2, label: "Placówka" },
  { id: "workspace", icon: BookOpen, label: "Zakres" },
  { id: "ai", icon: BrainCircuit, label: "AI" },
  { id: "ready", icon: CheckCircle2, label: "Gotowe" },
];

const ROLES: Array<{
  id: RoleId;
  label: string;
  icon: ComponentType<{ className?: string }>;
  desc: string;
}> = [
  { id: "student", label: "Uczeń", icon: GraduationCap, desc: "Egzaminy PIN, historia wyników i materiały do nauki." },
  { id: "teacher", label: "Nauczyciel", icon: BookOpen, desc: "Egzaminy, wyniki, klasy, AI i eksport ocen." },
  { id: "parent", label: "Rodzic", icon: Users, desc: "Postępy, komunikaty i najważniejsze informacje o uczniu." },
  { id: "admin", label: "Administracja", icon: Building2, desc: "Zarządzanie szkołą, rolami, zgodnością i dokumentami." },
];

const SUBJECTS = [
  "Matematyka",
  "Fizyka",
  "Chemia",
  "Biologia",
  "Historia",
  "Geografia",
  "Język polski",
  "Informatyka",
  "Języki obce",
  "Ekonomia",
];

const AI_STYLES = [
  { id: "formal", label: "Formalny", desc: "Precyzyjne, uporządkowane wyjaśnienia." },
  { id: "friendly", label: "Wspierający", desc: "Spokojny ton i jasne podpowiedzi." },
  { id: "creative", label: "Obrazowy", desc: "Przykłady, analogie i praca krok po kroku." },
  { id: "concise", label: "Zwięzły", desc: "Krótkie odpowiedzi bez zbędnych dygresji." },
];

const AVATAR_COLORS = ["#1d4ed8", "#0f766e", "#7c3aed", "#be123c", "#c2410c", "#475569"];
const MOCK_SCHOOLS = [
  "Zespół Szkół nr 1 im. Mikołaja Kopernika",
  "Liceum Ogólnokształcące nr 3",
  "Szkoła Podstawowa nr 5",
  "Technikum Informatyczne nr 7",
  "EduNex International School",
  "Akademia Future",
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [role, setRole] = useState<RoleId | "">("");
  const [schoolQuery, setSchoolQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [createSchool, setCreateSchool] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [level, setLevel] = useState("");
  const [schedule, setSchedule] = useState<string[]>([]);
  const [timePerDay, setTimePerDay] = useState("30");
  const [aiLang, setAiLang] = useState("pl");
  const [aiStyle, setAiStyle] = useState("friendly");
  const [aiConsent, setAiConsent] = useState(false);

  useEffect(() => {
    let active = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return;
      if (!data.user) {
        navigate({ to: "/auth", replace: true });
        return;
      }

      const meta = data.user.user_metadata || {};
      setFname(typeof meta.first_name === "string" ? meta.first_name : "");
      setLname(typeof meta.last_name === "string" ? meta.last_name : "");
      setReady(true);
    });

    return () => {
      active = false;
    };
  }, [navigate]);

  const filteredSchools = useMemo(
    () => MOCK_SCHOOLS.filter((school) => school.toLowerCase().includes(schoolQuery.toLowerCase())),
    [schoolQuery],
  );

  const progress = Math.round(((step + 1) / STEPS.length) * 100);

  const canProceed = () => {
    switch (step) {
      case 0:
        return fname.trim().length > 0;
      case 1:
        return role !== "";
      case 2:
        return createSchool ? schoolName.trim().length > 0 : selectedSchool !== null;
      case 3:
        return subjects.length > 0 && level !== "";
      case 4:
        return aiStyle !== "" && aiConsent;
      default:
        return true;
    }
  };

  const toggleSubject = (subject: string) => {
    setSubjects((current) =>
      current.includes(subject) ? current.filter((item) => item !== subject) : [...current, subject],
    );
  };

  const toggleDay = (day: string) => {
    setSchedule((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]));
  };

  const complete = async () => {
    setBusy(true);
    const finalRole: RoleId = role || "student";

    const { error } = await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        avatar_color: AVATAR_COLORS[avatar],
        role: finalRole,
        school: selectedSchool || schoolName,
        subjects,
        skill_level: level,
        schedule_days: schedule,
        time_per_day: timePerDay,
        ai_language: aiLang,
        ai_style: aiStyle,
        ai_consent: aiConsent,
      },
    });

    setBusy(false);

    if (error) {
      toast.error("Nie udało się zapisać konfiguracji. Spróbuj ponownie.");
      return;
    }

    toast.success("Konfiguracja EduNex została zapisana.");
    const destinations: Record<RoleId, string> = {
      student: "/student/dashboard",
      teacher: "/teacher",
      parent: "/parent",
      admin: "/admin",
    };
    navigate({ to: destinations[finalRole] });
  };

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f8fb] text-slate-800">
        <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Toaster theme="light" />
      <div className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-700 text-white shadow-sm">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">EduNex</p>
              <p className="text-xs text-slate-500">Konfiguracja profilu</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>
              Krok {step + 1} z {STEPS.length}
            </span>
            <button type="button" onClick={complete} className="font-medium text-blue-700 transition hover:text-blue-900">
              Pomiń
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl gap-8 px-5 py-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,.08)]">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase text-blue-700">Start pracy</p>
            <h1 className="mt-3 text-3xl font-semibold">Dostosuj EduNex do swojej roli.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Kilka informacji pozwala przygotować właściwy panel, dokumenty i ścieżkę pierwszych działań.
            </p>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-blue-700 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>

          <div className="space-y-2">
            {STEPS.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === step;
              const isDone = index < step;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStep(index)}
                  className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-blue-200 bg-blue-50 text-blue-900"
                      : "border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-xl ${
                      isActive || isDone ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{item.label}</span>
                    <span className="text-xs text-slate-500">Etap {index + 1}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="flex items-center rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,.08)] sm:p-10">
          <div className="w-full">
            {step === 0 && (
              <div className="mx-auto max-w-2xl space-y-6">
                <SectionHeading title="Dane profilu" text="Ustaw podstawowe informacje widoczne w panelu i dokumentach." />
                <div className="flex flex-wrap gap-3">
                  {AVATAR_COLORS.map((color, index) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatar(index)}
                      className={`h-12 w-12 rounded-full border-4 transition ${
                        avatar === index ? "border-blue-100 ring-2 ring-blue-700" : "border-white opacity-75 hover:opacity-100"
                      }`}
                      style={{ background: color }}
                      aria-label={`Kolor profilu ${index + 1}`}
                    />
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Imię" value={fname} onChange={setFname} />
                  <Field label="Nazwisko" value={lname} onChange={setLname} />
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mx-auto max-w-3xl space-y-6">
                <SectionHeading title="Wybierz rolę" text="EduNex przygotuje inne pierwsze kroki dla ucznia, nauczyciela, rodzica i administracji." />
                <div className="grid gap-3 sm:grid-cols-2">
                  {ROLES.map((item) => {
                    const Icon = item.icon;
                    const selected = role === item.id;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setRole(item.id)}
                        className={`rounded-2xl border p-5 text-left transition ${
                          selected ? "border-blue-300 bg-blue-50 shadow-sm" : "border-slate-200 bg-white hover:border-slate-300"
                        }`}
                      >
                        <Icon className={`h-6 w-6 ${selected ? "text-blue-700" : "text-slate-400"}`} />
                        <p className="mt-4 text-base font-semibold">{item.label}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mx-auto max-w-2xl space-y-6">
                <SectionHeading title="Placówka" text="Wybierz szkołę z listy albo dodaj nazwę placówki ręcznie." />
                {!createSchool ? (
                  <div className="space-y-4">
                    <Field label="Wyszukaj placówkę" value={schoolQuery} onChange={setSchoolQuery} />
                    <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                      {filteredSchools.map((school) => (
                        <button
                          key={school}
                          type="button"
                          onClick={() => setSelectedSchool(school)}
                          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                            selectedSchool === school
                              ? "border-blue-300 bg-blue-50 text-blue-900"
                              : "border-slate-200 text-slate-700 hover:border-slate-300"
                          }`}
                        >
                          {school}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setCreateSchool(true)} className="text-sm font-medium text-blue-700">
                      Dodaj inną placówkę
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Field label="Nazwa placówki" value={schoolName} onChange={setSchoolName} />
                    <button type="button" onClick={() => setCreateSchool(false)} className="text-sm font-medium text-blue-700">
                      Wróć do wyszukiwania
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="mx-auto max-w-3xl space-y-7">
                <SectionHeading title="Zakres pracy" text="Wybierz przedmioty, poziom i rytm pracy. Możesz zmienić te ustawienia później." />
                <ChoiceGroup label="Przedmioty">
                  {SUBJECTS.map((subject) => (
                    <Chip key={subject} active={subjects.includes(subject)} onClick={() => toggleSubject(subject)}>
                      {subject}
                    </Chip>
                  ))}
                </ChoiceGroup>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["beginner", "Podstawowy", "Pierwsze kroki lub powtórka."],
                    ["intermediate", "Średni", "Regularna praca i utrwalanie."],
                    ["advanced", "Zaawansowany", "Wyższy poziom trudności."],
                  ].map(([id, label, desc]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLevel(id)}
                      className={`rounded-2xl border p-4 text-left transition ${
                        level === id ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <BookOpen className="h-5 w-5 text-blue-700" />
                      <p className="mt-3 text-sm font-semibold">{label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">{desc}</p>
                    </button>
                  ))}
                </div>
                <ChoiceGroup label="Dni pracy">
                  {["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"].map((day) => (
                    <Chip key={day} active={schedule.includes(day)} onClick={() => toggleDay(day)}>
                      {day}
                    </Chip>
                  ))}
                </ChoiceGroup>
                <ChoiceGroup label="Czas dziennie">
                  {["15", "30", "45", "60", "90"].map((time) => (
                    <Chip key={time} active={timePerDay === time} onClick={() => setTimePerDay(time)}>
                      {time} min
                    </Chip>
                  ))}
                </ChoiceGroup>
              </div>
            )}

            {step === 4 && (
              <div className="mx-auto max-w-3xl space-y-7">
                <SectionHeading title="Asystent AI" text="Ustaw styl odpowiedzi i zgodę na przetwarzanie danych edukacyjnych w celu personalizacji." />
                <ChoiceGroup label="Język odpowiedzi">
                  {[
                    ["pl", "Polski"],
                    ["en", "English"],
                    ["uk", "Українська"],
                  ].map(([id, label]) => (
                    <Chip key={id} active={aiLang === id} onClick={() => setAiLang(id)}>
                      {label}
                    </Chip>
                  ))}
                </ChoiceGroup>
                <div className="grid gap-3 sm:grid-cols-2">
                  {AI_STYLES.map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setAiStyle(style.id)}
                      className={`rounded-2xl border p-5 text-left transition ${
                        aiStyle === style.id ? "border-blue-300 bg-blue-50" : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <BrainCircuit className="h-5 w-5 text-blue-700" />
                      <p className="mt-3 text-sm font-semibold">{style.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">{style.desc}</p>
                    </button>
                  ))}
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <input
                    type="checkbox"
                    checked={aiConsent}
                    onChange={(event) => setAiConsent(event.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-700 focus:ring-blue-700"
                  />
                  <span className="text-sm leading-6 text-slate-700">
                    Wyrażam zgodę na wykorzystanie danych edukacyjnych do personalizacji odpowiedzi AI w EduNex.
                  </span>
                </label>
              </div>
            )}

            {step === 5 && (
              <div className="mx-auto max-w-2xl text-center">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-blue-700 text-white shadow-lg shadow-blue-700/20">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h2 className="mt-6 text-3xl font-semibold">Profil jest gotowy.</h2>
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Po zapisaniu przeniesiemy Cię do właściwego panelu. Ustawienia możesz później dopracować w profilu.
                </p>
                <div className="mt-8 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-left sm:grid-cols-2">
                  <SummaryItem label="Imię i nazwisko" value={`${fname} ${lname}`.trim() || "Nie podano"} />
                  <SummaryItem label="Rola" value={ROLES.find((item) => item.id === role)?.label || "Uczeń"} />
                  <SummaryItem label="Placówka" value={selectedSchool || schoolName || "Nie wybrano"} />
                  <SummaryItem label="Przedmioty" value={subjects.length ? `${subjects.length} wybranych` : "Nie wybrano"} />
                  <SummaryItem label="Rytm pracy" value={`${timePerDay} min dziennie`} />
                  <SummaryItem label="Styl AI" value={AI_STYLES.find((item) => item.id === aiStyle)?.label || "Wspierający"} />
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white/90 px-5 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(current - 1, 0))}
            disabled={step === 0}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
          >
            <ArrowLeft className="h-4 w-4" />
            Wstecz
          </button>
          {step < STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => canProceed() && setStep((current) => current + 1)}
              disabled={!canProceed()}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Dalej
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={complete}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? "Zapisywanie..." : "Zapisz konfigurację"}
              {!busy && <ArrowRight className="h-4 w-4" />}
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}

function SectionHeading({ title, text }: { title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-blue-700">EduNex</p>
      <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <CalendarDays className="h-4 w-4 text-blue-700" />
        {label}
      </p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
        active ? "border-blue-300 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
      }`}
    >
      {children}
    </button>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
