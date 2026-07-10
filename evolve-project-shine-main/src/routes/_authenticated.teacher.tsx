import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Database,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Library,
  Loader2,
  LogOut,
  Megaphone,
  MessageCircle,
  MessagesSquare,
  Radio,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wand2,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { AuthProvider } from "@/lib/auth/auth-context";
import { Pulpit } from "@/components/teacher/PulpitSection";
import { AISection } from "@/components/teacher/AISection";
import { Certyfikaty } from "@/components/teacher/CertyfikatySection";

const lazyLoad = <T,>(fn: () => Promise<T>, name: keyof T) =>
  lazy(async () => {
    const module = await fn();
    return { default: module[name] as ComponentType<Record<string, unknown>> };
  });

export type Exam = { id: string; title: string; subject: string | null; status: string; created_at: string };
export type TabKey =
  | "pulpit"
  | "egzaminy"
  | "ai"
  | "aiocen"
  | "tutor"
  | "plan"
  | "bank"
  | "klasy"
  | "zadania"
  | "kalendarz"
  | "live"
  | "monitoring"
  | "analityka"
  | "ranking"
  | "materialy"
  | "forum"
  | "ustawienia"
  | "ogloszenia"
  | "wiadomosci"
  | "eksport"
  | "edziennik"
  | "sprawdziany"
  | "certyfikaty";

type NavItem = { k: TabKey; l: string; i: ComponentType<{ className?: string }>; badge?: string };
type NavGroup = { label: string; items: NavItem[] };

const Egzaminy = lazyLoad(() => import("@/components/teacher/Egzaminy"), "Egzaminy");
const BankPytan = lazyLoad(() => import("@/components/teacher/BankPytan"), "BankPytan");
const Klasy = lazyLoad(() => import("@/components/teacher/Klasy"), "Klasy");
const Zadania = lazyLoad(() => import("@/components/teacher/Zadania"), "Zadania");
const Kalendarz = lazyLoad(() => import("@/components/teacher/Kalendarz"), "Kalendarz");
const LiveQuiz = lazyLoad(() => import("@/components/teacher/LiveQuiz"), "LiveQuiz");
const Monitoring = lazyLoad(() => import("@/components/teacher/Monitoring"), "Monitoring");
const Analityka = lazyLoad(() => import("@/components/teacher/Pozostale"), "Analityka");
const Ranking = lazyLoad(() => import("@/components/teacher/Pozostale"), "Ranking");
const Materialy = lazyLoad(() => import("@/components/teacher/Pozostale"), "Materialy");
const Forum = lazyLoad(() => import("@/components/teacher/Pozostale"), "Forum");
const Ustawienia = lazyLoad(() => import("@/components/teacher/Pozostale"), "Ustawienia");
const AiTutor = lazyLoad(() => import("@/components/teacher/AiTutor"), "AiTutor");
const PlanLekcji = lazyLoad(() => import("@/components/teacher/PlanLekcji"), "PlanLekcji");
const Ogloszenia = lazyLoad(() => import("@/components/teacher/Ogloszenia"), "Ogloszenia");
const Wiadomosci = lazyLoad(() => import("@/components/teacher/Wiadomosci"), "Wiadomosci");
const Eksport = lazyLoad(() => import("@/components/teacher/Eksport"), "Eksport");
const EDziennik = lazyLoad(() => import("@/components/teacher/EDziennik"), "EDziennik");
const AiOcen = lazyLoad(() => import("@/components/teacher/AiOcen"), "AiOcen");
const Sprawdziany = lazyLoad(() => import("@/components/teacher/Sprawdziany"), "Sprawdziany");

const navGroups: NavGroup[] = [
  {
    label: "Przegląd",
    items: [
      { k: "pulpit", l: "Pulpit", i: LayoutDashboard },
      { k: "analityka", l: "Analityka", i: BarChart3 },
      { k: "ranking", l: "Ranking", i: Trophy },
      { k: "certyfikaty", l: "Certyfikaty", i: Award },
    ],
  },
  {
    label: "Nauczanie",
    items: [
      { k: "egzaminy", l: "Egzaminy", i: FileText },
      { k: "sprawdziany", l: "Sprawdziany", i: ScrollText },
      { k: "bank", l: "Bank pytań", i: Library },
      { k: "zadania", l: "Zadania", i: ClipboardList },
      { k: "materialy", l: "Materiały", i: BookOpen },
    ],
  },
  {
    label: "NexAi i wsparcie",
    items: [
      { k: "ai", l: "NexAi Generator", i: Sparkles },
      { k: "aiocen", l: "NexAi Ocenianie", i: Wand2 },
      { k: "tutor", l: "NexAi Tutor", i: Brain },
    ],
  },
  {
    label: "Klasa",
    items: [
      { k: "klasy", l: "Klasy", i: Users },
      { k: "plan", l: "Plan lekcji", i: CalendarClock },
      { k: "kalendarz", l: "Kalendarz", i: Calendar },
      { k: "live", l: "Sesja PIN", i: Radio, badge: "LIVE" },
      { k: "monitoring", l: "Monitoring", i: Activity },
    ],
  },
  {
    label: "Organizacja",
    items: [
      { k: "edziennik", l: "E-dziennik", i: Globe },
      { k: "eksport", l: "Eksport", i: Database },
      { k: "ogloszenia", l: "Ogłoszenia", i: Megaphone },
      { k: "wiadomosci", l: "Wiadomości", i: MessageCircle },
      { k: "forum", l: "Forum", i: MessagesSquare },
      { k: "ustawienia", l: "Ustawienia", i: Settings },
    ],
  },
];

const allNav = navGroups.flatMap((group) => group.items);

export const Route = createFileRoute("/_authenticated/teacher")({
  component: TeacherPanel,
  head: () => ({ meta: [{ title: "Panel nauczyciela | EduNex" }] }),
});

function TeacherPanel() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("nauczycielu");
  const [exams, setExams] = useState<Exam[]>([]);
  const [tab, setTab] = useState<TabKey>("pulpit");
  const [attempts, setAttempts] = useState(0);
  const [search, setSearch] = useState("");

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email ?? "");
        setDisplayName(user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "nauczycielu");
      }

      const { data } = await supabase
        .from("exams")
        .select("id,title,subject,status,created_at")
        .order("created_at", { ascending: false })
        .limit(50);
      setExams((data ?? []) as Exam[]);

      const { count } = await supabase.from("attempts").select("id", { count: "exact", head: true });
      setAttempts(count ?? 0);
    })();
  }, []);

  const published = exams.filter((exam) => exam.status === "published").length;
  const current = allNav.find((item) => item.k === tab) ?? allNav[0];
  const filteredNav = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allNav.slice(0, 6);
    return allNav.filter((item) => item.l.toLowerCase().includes(q)).slice(0, 8);
  }, [search]);

  const logout = async () => {
    await supabase.auth.signOut();
    await navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fb] text-slate-950">
      <Toaster theme="light" />
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="sticky top-0 flex h-screen flex-col">
            <div className="border-b border-slate-200 p-5">
              <Link to="/" className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-semibold">EduNex</div>
                  <div className="text-[11px] uppercase text-slate-500">Panel nauczyciela</div>
                </div>
              </Link>
            </div>

            <nav className="flex-1 overflow-y-auto p-4">
              <div className="space-y-5">
                {navGroups.map((group) => (
                  <div key={group.label}>
                    <div className="mb-2 px-2 text-[11px] font-semibold uppercase text-slate-400">{group.label}</div>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const Icon = item.i;
                        const active = tab === item.k;
                        return (
                          <button
                            key={item.k}
                            type="button"
                            onClick={() => setTab(item.k)}
                            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition ${
                              active ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{item.l}</span>
                            {item.badge && <span className={`rounded-md px-1.5 py-0.5 text-[10px] ${active ? "bg-white/15 text-white" : "bg-blue-50 text-blue-800"}`}>{item.badge}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </nav>

            <div className="border-t border-slate-200 p-4">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <div className="text-xs font-semibold uppercase text-slate-400">Konto</div>
                <div className="mt-1 truncate text-sm font-semibold text-slate-950">{email || "teacher@edunex.pl"}</div>
              </div>
              <button onClick={logout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                <LogOut className="h-4 w-4" />
                Wyloguj
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl">
            <div className="flex min-h-16 flex-col gap-3 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase text-slate-400">
                  EduNex
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-blue-800">{current.l}</span>
                </div>
                <h1 className="mt-1 text-2xl font-semibold text-slate-950">
                  {tab === "pulpit" ? `Dzień dobry, ${displayName}` : current.l}
                </h1>
              </div>
              <div className="grid gap-3 sm:grid-cols-[minmax(220px,360px)_auto]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Szukaj modułu..."
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                  />
                  {search && (
                    <div className="absolute right-0 top-12 z-40 w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                      {filteredNav.map((item) => {
                        const Icon = item.i;
                        return (
                          <button
                            key={item.k}
                            type="button"
                            onClick={() => {
                              setTab(item.k);
                              setSearch("");
                            }}
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <Icon className="h-4 w-4 text-blue-800" />
                            {item.l}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                  <Bell className="h-4 w-4 text-slate-500" />
                  {published} opublikowane
                </div>
              </div>
            </div>
          </header>

          <div className="p-5 lg:p-8">
            <Suspense fallback={<div className="grid min-h-[360px] place-items-center"><Loader2 className="h-6 w-6 animate-spin text-blue-800" /></div>}>
              {tab === "pulpit" && <Pulpit exams={exams} published={published} attempts={attempts} go={setTab} email={email} />}
              {tab === "ai" && <AISection />}
              {tab === "tutor" && <AiTutor />}
              {tab === "plan" && <PlanLekcji />}
              {tab === "egzaminy" && <Egzaminy />}
              {tab === "sprawdziany" && <Sprawdziany />}
              {tab === "bank" && <BankPytan />}
              {tab === "klasy" && <Klasy />}
              {tab === "zadania" && <Zadania />}
              {tab === "kalendarz" && <Kalendarz />}
              {tab === "live" && <LiveQuiz />}
              {tab === "monitoring" && <Monitoring />}
              {tab === "analityka" && <Analityka />}
              {tab === "ranking" && <Ranking />}
              {tab === "materialy" && <Materialy go={setTab as (tab: string) => void} />}
              {tab === "forum" && <Forum />}
              {tab === "ustawienia" && <AuthProvider><Ustawienia /></AuthProvider>}
              {tab === "ogloszenia" && <Ogloszenia />}
              {tab === "wiadomosci" && <Wiadomosci />}
              {tab === "edziennik" && <EDziennik />}
              {tab === "eksport" && <Eksport />}
              {tab === "aiocen" && <AiOcen />}
              {tab === "certyfikaty" && <Certyfikaty />}
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
