import { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Search,
  ShieldCheck,
  TrendingUp,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/parent")({
  component: ParentPanel,
  head: () => ({ meta: [{ title: "Panel rodzica | EduNex" }] }),
});

type ChildSummary = {
  id: string;
  name: string;
  class: string;
  school: string;
  initials: string;
  avgScore: number;
  examsPassed: number;
  examsTotal: number;
  attendance: number;
};

type ExamResult = {
  id: string;
  examTitle: string;
  subject: string;
  score: number;
  maxScore: number;
  percent: number;
  passed: boolean;
  date: string;
};

type Notice = {
  id: string;
  type: "warning" | "info" | "success" | "danger";
  message: string;
  date: string;
  child: string;
};

type ViewKey = "overview" | "results" | "attendance" | "messages";

const childrenData: ChildSummary[] = [
  { id: "c1", name: "Kacper Korsik", class: "8A", school: "Szkoła Podstawowa nr 3", initials: "KK", avgScore: 78, examsPassed: 12, examsTotal: 15, attendance: 94 },
  { id: "c2", name: "Zuzanna Korsik", class: "5B", school: "Szkoła Podstawowa nr 3", initials: "ZK", avgScore: 92, examsPassed: 8, examsTotal: 9, attendance: 98 },
];

const examResults: ExamResult[] = [
  { id: "e1", examTitle: "Matematyka - ułamki", subject: "Matematyka", score: 18, maxScore: 20, percent: 90, passed: true, date: "2026-06-25" },
  { id: "e2", examTitle: "Język polski - lektury", subject: "Język polski", score: 14, maxScore: 20, percent: 70, passed: true, date: "2026-06-21" },
  { id: "e3", examTitle: "Fizyka - ruch", subject: "Fizyka", score: 8, maxScore: 15, percent: 53, passed: false, date: "2026-06-18" },
  { id: "e4", examTitle: "Język angielski - grammar", subject: "Język angielski", score: 19, maxScore: 20, percent: 95, passed: true, date: "2026-06-12" },
  { id: "e5", examTitle: "Chemia - pierwiastki", subject: "Chemia", score: 16, maxScore: 20, percent: 80, passed: true, date: "2026-06-05" },
];

const notices: Notice[] = [
  { id: "a1", type: "warning", message: "Kacper ma do powtórzenia materiał z fizyki przed kolejnym sprawdzianem.", date: "2026-06-28", child: "Kacper" },
  { id: "a2", type: "success", message: "Zuzanna poprawiła wynik z języka angielskiego o 15 punktów procentowych.", date: "2026-06-26", child: "Zuzanna" },
  { id: "a3", type: "info", message: "Nowy sprawdzian z chemii zaplanowano na przyszły tydzień.", date: "2026-06-24", child: "Kacper" },
];

const views: Array<{ id: ViewKey; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "overview", label: "Przegląd", icon: LayoutDashboard },
  { id: "results", label: "Wyniki", icon: FileText },
  { id: "attendance", label: "Frekwencja", icon: CalendarDays },
  { id: "messages", label: "Komunikaty", icon: Bell },
];

function ParentPanel() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [selectedChild, setSelectedChild] = useState("all");
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate({ to: "/auth" });
        return;
      }

      setUser({
        email: session.user.email,
        name: session.user.user_metadata?.first_name
          ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ""}`.trim()
          : session.user.email,
      });
      setChecking(false);
    };

    check();
  }, [navigate]);

  const filteredChildren = useMemo(() => {
    return selectedChild === "all" ? childrenData : childrenData.filter((child) => child.id === selectedChild);
  }, [selectedChild]);

  const filteredResults = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return examResults;
    return examResults.filter((result) =>
      result.examTitle.toLowerCase().includes(term) ||
      result.subject.toLowerCase().includes(term),
    );
  }, [query]);

  const averageScore = Math.round(examResults.reduce((sum, result) => sum + result.percent, 0) / examResults.length);
  const passedCount = examResults.filter((result) => result.passed).length;
  const averageAttendance = Math.round(childrenData.reduce((sum, child) => sum + child.attendance, 0) / childrenData.length);

  const logout = async () => {
    await supabase.auth.signOut();
    toast.success("Wylogowano z EduNex.");
    await navigate({ to: "/auth" });
  };

  if (checking) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-slate-900">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          <span className="text-sm font-medium">Sprawdzanie dostępu rodzica...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <Toaster richColors />
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-white">
              <Users className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-semibold">EduNex</div>
              <div className="text-xs text-slate-500">Panel rodzica</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600 sm:flex">
              <Mail className="h-3.5 w-3.5 text-blue-700" />
              {user?.name || user?.email}
            </div>
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              <LogOut className="h-3.5 w-3.5" />
              Wyloguj
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-px bg-slate-200 lg:grid-cols-[1fr_420px]">
            <div className="bg-slate-950 px-6 py-8 text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
                <ShieldCheck className="h-3.5 w-3.5" />
                Widok postępów dziecka
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold sm:text-4xl">Spokojny przegląd wyników, frekwencji i komunikatów.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300">
                Rodzic widzi najważniejsze informacje bez rozbudowanej administracji i bez dostępu do danych innych uczniów.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-px bg-slate-200">
              <Metric label="Średni wynik" value={`${averageScore}%`} icon={TrendingUp} />
              <Metric label="Zaliczone" value={`${passedCount}/${examResults.length}`} icon={CheckCircle2} />
              <Metric label="Frekwencja" value={`${averageAttendance}%`} icon={CalendarDays} />
            </div>
          </div>
        </motion.section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="space-y-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-950">Dzieci</div>
              <div className="space-y-2">
                <ChildButton active={selectedChild === "all"} onClick={() => setSelectedChild("all")} label="Wszystkie dzieci" icon={Users} />
                {childrenData.map((child) => (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChild(child.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition ${
                      selectedChild === child.id ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="grid h-9 w-9 place-items-center rounded-full bg-slate-950 text-xs font-semibold text-white">{child.initials}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-950">{child.name}</div>
                      <div className="text-xs text-slate-500">{child.class} · {child.school}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3 text-sm font-semibold text-slate-950">Widok</div>
              <div className="space-y-2">
                {views.map((view) => (
                  <ChildButton key={view.id} active={activeView === view.id} onClick={() => setActiveView(view.id)} label={view.label} icon={view.icon} />
                ))}
              </div>
            </div>
          </aside>

          <div className="space-y-6">
            {activeView === "overview" && (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredChildren.map((child) => (
                    <ChildCard key={child.id} child={child} />
                  ))}
                </div>
                <Panel title="Ostatnie komunikaty" icon={Bell}>
                  <NoticeList items={notices} />
                </Panel>
              </>
            )}

            {activeView === "results" && (
              <Panel title="Wyniki egzaminów" icon={FileText} action={<SearchBox value={query} onChange={setQuery} />}>
                <ResultsTable items={filteredResults} />
              </Panel>
            )}

            {activeView === "attendance" && (
              <Panel title="Frekwencja" icon={CalendarDays}>
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredChildren.map((child) => (
                    <div key={child.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold text-slate-950">{child.name}</div>
                          <div className="mt-1 text-xs text-slate-500">{child.class}</div>
                        </div>
                        <div className="text-2xl font-semibold text-slate-950">{child.attendance}%</div>
                      </div>
                      <div className="mt-4 h-2 rounded-full bg-white">
                        <div className="h-full rounded-full bg-blue-700" style={{ width: `${child.attendance}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {activeView === "messages" && (
              <Panel title="Komunikaty" icon={Bell}>
                <NoticeList items={notices} expanded />
              </Panel>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function Metric({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="bg-white p-5">
      <Icon className="h-4 w-4 text-blue-700" />
      <div className="mt-4 text-2xl font-semibold text-slate-950">{value}</div>
      <div className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}

function ChildButton({ active, onClick, label, icon: Icon }: { active: boolean; onClick: () => void; label: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
        active ? "border-blue-200 bg-blue-50 text-blue-800" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ChildCard({ child }: { child: ChildSummary }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">{child.initials}</div>
          <div>
            <h2 className="text-base font-semibold text-slate-950">{child.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{child.class} · {child.school}</p>
          </div>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Aktywne</span>
      </div>
      <div className="mt-5 grid grid-cols-3 gap-3">
        <MiniStat label="Średnia" value={`${child.avgScore}%`} icon={BarChart3} />
        <MiniStat label="Zaliczone" value={`${child.examsPassed}/${child.examsTotal}`} icon={Award} />
        <MiniStat label="Frekwencja" value={`${child.attendance}%`} icon={CalendarDays} />
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon: Icon }: { label: string; value: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <Icon className="h-4 w-4 text-blue-700" />
      <div className="mt-3 text-lg font-semibold text-slate-950">{value}</div>
      <div className="mt-0.5 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function Panel({ title, icon: Icon, action, children }: { title: string; icon: ComponentType<{ className?: string }>; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-blue-700" />
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function SearchBox({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 sm:w-80">
      <Search className="h-4 w-4 shrink-0 text-slate-400" />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400" placeholder="Szukaj wyniku" />
    </div>
  );
}

function ResultsTable({ items }: { items: ExamResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] text-sm">
        <thead className="text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Egzamin</th>
            <th className="px-3 py-2 text-left font-semibold">Przedmiot</th>
            <th className="px-3 py-2 text-right font-semibold">Wynik</th>
            <th className="px-3 py-2 text-right font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50/80">
              <td className="px-3 py-3 font-medium text-slate-950">
                {item.examTitle}
                <div className="mt-1 text-xs text-slate-500">{new Date(item.date).toLocaleDateString("pl-PL")}</div>
              </td>
              <td className="px-3 py-3 text-slate-600">{item.subject}</td>
              <td className="px-3 py-3 text-right font-mono text-slate-700">{item.score}/{item.maxScore} · {item.percent}%</td>
              <td className="px-3 py-3 text-right">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                  item.passed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"
                }`}>
                  {item.passed ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                  {item.passed ? "Zaliczone" : "Do poprawy"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function NoticeList({ items, expanded }: { items: Notice[]; expanded?: boolean }) {
  const visible = expanded ? items : items.slice(0, 3);
  return (
    <div className="space-y-3">
      {visible.map((item) => (
        <div key={item.id} className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <NoticeIcon type={item.type} />
          <div className="min-w-0 flex-1">
            <div className="text-sm font-medium text-slate-950">{item.message}</div>
            <div className="mt-1 text-xs text-slate-500">{item.child} · {new Date(item.date).toLocaleDateString("pl-PL")}</div>
          </div>
          <ArrowRight className="h-4 w-4 text-slate-400" />
        </div>
      ))}
    </div>
  );
}

function NoticeIcon({ type }: { type: Notice["type"] }) {
  const className = {
    warning: "bg-amber-50 text-amber-700",
    info: "bg-blue-50 text-blue-700",
    success: "bg-emerald-50 text-emerald-700",
    danger: "bg-rose-50 text-rose-700",
  }[type];

  const Icon = type === "success" ? UserCheck : type === "danger" ? AlertCircle : type === "warning" ? Clock : BookOpen;

  return (
    <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${className}`}>
      <Icon className="h-4 w-4" />
    </div>
  );
}
