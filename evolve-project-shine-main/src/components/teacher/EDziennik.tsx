import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertTriangle,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  ClipboardCheck,
  Cloud,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  Megaphone,
  MessageSquareText,
  RefreshCw,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { JournalAttendance } from "./edziennik/JournalAttendance";
import { JournalClassesPanel, JournalLessonsPanel } from "./edziennik/JournalClassesLessons";
import {
  JournalCommunicationPanel,
  JournalIntegrationsPanel,
} from "./edziennik/JournalCommunication";
import { JournalGradesPanel, JournalNotesPanel } from "./edziennik/JournalGradesNotes";
import { JournalOverview } from "./edziennik/JournalOverview";
import { classLabel, type JournalTab } from "./edziennik/journal-types";
import { useJournalData } from "./edziennik/use-journal-data";
import { journalCard, journalInput } from "./edziennik/journal-ui";

const tabs: {
  id: JournalTab;
  label: string;
  shortLabel: string;
  icon: ComponentType<{ className?: string }>;
}[] = [
  { id: "overview", label: "Pulpit", shortLabel: "Pulpit", icon: LayoutDashboard },
  { id: "classes", label: "Klasy i uczniowie", shortLabel: "Klasy", icon: Users },
  { id: "lessons", label: "Lekcje", shortLabel: "Lekcje", icon: BookOpenCheck },
  { id: "attendance", label: "Frekwencja", shortLabel: "Frekwencja", icon: ClipboardCheck },
  { id: "grades", label: "Oceny", shortLabel: "Oceny", icon: TrendingUp },
  { id: "notes", label: "Uwagi i pochwały", shortLabel: "Uwagi", icon: MessageSquareText },
  { id: "communication", label: "Komunikacja", shortLabel: "Kontakt", icon: Megaphone },
  { id: "integrations", label: "Integracje i eksport", shortLabel: "Integracje", icon: Cloud },
];

export function EDziennik() {
  const actions = useJournalData();
  const { snapshot, loading, refreshing, schemaReady, error } = actions;
  const [activeTab, setActiveTab] = useState<JournalTab>("overview");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [lessonComposerOpen, setLessonComposerOpen] = useState(false);

  useEffect(() => {
    if (snapshot.classes.length === 0) {
      if (selectedClassId) setSelectedClassId("");
      return;
    }
    if (!snapshot.classes.some((item) => item.id === selectedClassId)) {
      setSelectedClassId(snapshot.classes[0].id);
    }
  }, [selectedClassId, snapshot.classes]);

  const selectedClass = snapshot.classes.find((item) => item.id === selectedClassId);
  const selectedStudents = snapshot.students.filter(
    (student) => student.class_id === selectedClassId,
  );
  const today = useMemo(
    () =>
      new Intl.DateTimeFormat("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).format(new Date()),
    [],
  );

  const openLessonComposer = () => {
    setActiveTab("lessons");
    setLessonComposerOpen(true);
  };

  const content = () => {
    if (activeTab === "overview") {
      return (
        <JournalOverview
          snapshot={snapshot}
          selectedClassId={selectedClassId}
          onTabChange={setActiveTab}
          onNewLesson={openLessonComposer}
        />
      );
    }
    if (activeTab === "classes") {
      return (
        <JournalClassesPanel
          snapshot={snapshot}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          actions={actions}
        />
      );
    }
    if (activeTab === "lessons") {
      return (
        <JournalLessonsPanel
          snapshot={snapshot}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          actions={actions}
          composerOpen={lessonComposerOpen}
          onComposerChange={setLessonComposerOpen}
        />
      );
    }
    if (activeTab === "attendance") {
      return (
        <JournalAttendance
          snapshot={snapshot}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          actions={actions}
        />
      );
    }
    if (activeTab === "grades") {
      return (
        <JournalGradesPanel
          snapshot={snapshot}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          actions={actions}
        />
      );
    }
    if (activeTab === "notes") {
      return (
        <JournalNotesPanel
          snapshot={snapshot}
          selectedClassId={selectedClassId}
          onClassChange={setSelectedClassId}
          actions={actions}
        />
      );
    }
    if (activeTab === "communication") {
      return (
        <JournalCommunicationPanel
          snapshot={snapshot}
          selectedClassId={selectedClassId}
          actions={actions}
        />
      );
    }
    return <JournalIntegrationsPanel />;
  };

  return (
    <div className="teacher-journal space-y-5 text-slate-950 dark:text-slate-100">
      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_55px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-[#17181b] dark:shadow-[0_24px_70px_rgba(0,0,0,0.28)]">
        <div className="grid lg:grid-cols-[1fr_380px]">
          <div className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700 dark:border-blue-400/20 dark:bg-blue-400/10 dark:text-blue-300">
                <GraduationCap className="h-3.5 w-3.5" />
                E-dziennik 360
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Dane chronione RLS
              </span>
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-semibold tracking-[-0.04em] text-slate-950 dark:text-slate-100 sm:text-4xl">
              Pełny obraz klasy. Jedno miejsce pracy nauczyciela.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400 sm:text-base">
              Lekcje, frekwencja, oceny, uwagi, komunikacja i eksport do systemu szkoły — bez
              przełączania się między przypadkowymi narzędziami.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium capitalize">{today}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>
                {snapshot.classes.length} {snapshot.classes.length === 1 ? "klasa" : "klas"}
              </span>
              <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-600" />
              <span>{snapshot.students.length} uczniów</span>
            </div>
          </div>

          <div className="border-t border-slate-200 bg-slate-50 p-6 dark:border-white/10 dark:bg-[#202123] lg:border-l lg:border-t-0 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                Kontekst pracy
              </div>
              <button
                type="button"
                onClick={() => void actions.refresh()}
                disabled={refreshing}
                className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-950 disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-slate-300 dark:hover:text-white"
                aria-label="Odśwież E-dziennik"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
            <label className="mt-4 grid gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              Wybrana klasa
              <select
                value={selectedClassId}
                onChange={(event) => setSelectedClassId(event.target.value)}
                className={journalInput}
              >
                <option value="">Wszystkie / brak klasy</option>
                {snapshot.classes.map((schoolClass) => (
                  <option key={schoolClass.id} value={schoolClass.id}>
                    {classLabel(schoolClass)}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 grid grid-cols-3 gap-2">
              <HeaderMetric label="Uczniowie" value={String(selectedStudents.length)} />
              <HeaderMetric
                label="Lekcje"
                value={String(
                  snapshot.lessons.filter((lesson) => lesson.class_id === selectedClassId).length,
                )}
              />
              <HeaderMetric
                label="Oceny"
                value={String(
                  snapshot.grades.filter((grade) => grade.class_id === selectedClassId).length,
                )}
              />
            </div>
          </div>
        </div>
      </section>

      {!schemaReady && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <div className="text-sm font-semibold">
              Moduły dziennika oczekują na aktualizację bazy danych
            </div>
            <p className="mt-1 text-xs leading-5 text-amber-900/75 dark:text-amber-200/75">
              Klasy i komunikacja nadal działają. Frekwencja, oceny i uwagi uruchomią się po
              zastosowaniu migracji E-dziennika.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-100">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Nie udało się pobrać części danych: {error}</span>
        </div>
      )}

      <nav aria-label="Sekcje E-dziennika" className={`${journalCard} overflow-x-auto p-1.5`}>
        <div className="flex min-w-max gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`inline-flex h-10 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  active
                    ? "bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-slate-100"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden 2xl:inline">{tab.label}</span>
                <span className="2xl:hidden">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {loading ? (
        <div className={`${journalCard} grid min-h-80 place-items-center`}>
          <div className="text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
            <div className="mt-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
              Ładowanie E-dziennika
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Synchronizuję klasy, lekcje i wpisy.
            </div>
          </div>
        </div>
      ) : (
        content()
      )}

      <footer className="flex flex-col gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500 shadow-sm dark:border-white/10 dark:bg-[#17181b] dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span className="inline-flex items-center gap-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          Dane są ograniczone do nauczyciela, jego klas i przypisanych uczniów.
        </span>
        <span className="inline-flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5" />
          {selectedClass ? classLabel(selectedClass) : "Widok ogólny"}
        </span>
      </footer>
    </div>
  );
}

function HeaderMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className="text-lg font-semibold text-slate-950 dark:text-slate-100">{value}</div>
      <div className="mt-0.5 text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}
