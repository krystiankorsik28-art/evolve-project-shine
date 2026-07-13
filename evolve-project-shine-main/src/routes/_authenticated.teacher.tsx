import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Activity,
  AlertCircle,
  Award,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  CalendarClock,
  ChevronRight,
  ClipboardList,
  Command,
  Database,
  FileText,
  Globe,
  GraduationCap,
  LayoutDashboard,
  Library,
  Loader2,
  LogOut,
  Megaphone,
  Menu,
  MessageCircle,
  MessagesSquare,
  Radio,
  RefreshCw,
  ScrollText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Wand2,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { Pulpit } from "@/components/teacher/PulpitSection";
import { AISection } from "@/components/teacher/AISection";
import { Certyfikaty } from "@/components/teacher/CertyfikatySection";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { useTheme } from "@/lib/theme";

const lazyLoad = <T,>(fn: () => Promise<T>, name: keyof T) =>
  lazy(async () => {
    const module = await fn();
    return { default: module[name] as ComponentType<Record<string, unknown>> };
  });

export type Exam = {
  id: string;
  title: string;
  subject: string | null;
  status: string;
  created_at: string;
  available_from?: string | null;
  available_until?: string | null;
};

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

type NavItem = {
  k: TabKey;
  l: string;
  i: ComponentType<{ className?: string }>;
  badge?: string;
};

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
  validateSearch: (search: Record<string, unknown>): { tab?: TabKey } => ({
    tab:
      typeof search.tab === "string" && allNav.some((item) => item.k === search.tab)
        ? (search.tab as TabKey)
        : undefined,
  }),
  head: () => ({ meta: [{ title: "Panel nauczyciela | EduNex" }] }),
});

function ModuleFallback() {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-xl border border-slate-200 bg-white">
      <div className="text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#0067b8]" />
        <div className="mt-3 text-sm font-medium text-slate-700">Ładowanie modułu</div>
        <div className="mt-1 text-xs text-slate-500">Przygotowujemy dane i komponenty widoku.</div>
      </div>
    </div>
  );
}

function TeacherSidebar({
  tab,
  email,
  onSelect,
  onLogout,
}: {
  tab: TabKey;
  email: string;
  onSelect: (tab: TabKey) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 p-5">
        <Link to="/" className="flex items-center gap-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0067b8]/30">
          <div className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="font-semibold text-slate-950">EduNex</div>
            <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-slate-500">Panel nauczyciela</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label}>
              <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">{group.label}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.i;
                  const active = tab === item.k;
                  return (
                    <button
                      key={item.k}
                      type="button"
                      onClick={() => onSelect(item.k)}
                      aria-current={active ? "page" : undefined}
                      className={`flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-[#0067b8]/25 ${
                        active
                          ? "bg-slate-950 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span className="flex-1 truncate">{item.l}</span>
                      {item.badge && (
                        <span className={`rounded px-1.5 py-0.5 text-[9px] font-semibold ${active ? "bg-white/15 text-white" : "bg-blue-50 text-blue-800"}`}>
                          {item.badge}
                        </span>
                      )}
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
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Zalogowane konto</div>
          <div className="mt-1 truncate text-sm font-semibold text-slate-950">{email || "Ładowanie konta..."}</div>
        </div>
        <button
          type="button"
          onClick={onLogout}
          className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <LogOut className="h-4 w-4" />
          Wyloguj
        </button>
      </div>
    </div>
  );
}

function TeacherPanel() {
  const { resolvedTheme } = useTheme();
  const routeSearch = Route.useSearch();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("nauczycielu");
  const [exams, setExams] = useState<Exam[]>([]);
  const [tab, setTab] = useState<TabKey>(routeSearch.tab ?? "pulpit");
  const [attempts, setAttempts] = useState(0);
  const [pendingReview, setPendingReview] = useState(0);
  const [activePins, setActivePins] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [online, setOnline] = useState(true);

  const loadDashboard = useCallback(
    async (manual = false) => {
      if (manual) setRefreshing(true);
      else setLoading(true);
      setLoadError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          await navigate({ to: "/auth", replace: true });
          return;
        }

        setEmail(user.email ?? "");

        const [profileResult, examsResult, attemptsResult, pendingResult, pinsResult] = await Promise.all([
          supabase
            .from("profiles")
            .select("display_name,first_name,last_name")
            .eq("user_id", user.id)
            .maybeSingle(),
          supabase
            .from("exams")
            .select("id,title,subject,status,created_at,available_from,available_until")
            .eq("created_by", user.id)
            .order("created_at", { ascending: false })
            .limit(100),
          supabase.from("attempts").select("id", { count: "exact", head: true }),
          supabase.from("attempts").select("id", { count: "exact", head: true }).eq("status", "submitted"),
          supabase
            .from("exam_pins")
            .select("id", { count: "exact", head: true })
            .eq("created_by", user.id)
            .eq("active", true),
        ]);

        const firstError =
          profileResult.error ||
          examsResult.error ||
          attemptsResult.error ||
          pendingResult.error ||
          pinsResult.error;

        if (firstError) throw firstError;

        const profile = profileResult.data;
        const profileName =
          profile?.display_name?.trim() ||
          [profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim();
        const metadataName =
          user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? user.email?.split("@")[0];

        setDisplayName(profileName || metadataName || "nauczycielu");
        setExams((examsResult.data ?? []) as Exam[]);
        setAttempts(attemptsResult.count ?? 0);
        setPendingReview(pendingResult.count ?? 0);
        setActivePins(pinsResult.count ?? 0);
        setLastUpdated(new Date());
      } catch (error) {
        console.error(error);
        const message = error instanceof Error ? error.message : "Nie udało się pobrać danych panelu.";
        setLoadError(message);
        if (manual) toast.error("Nie udało się odświeżyć panelu");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [navigate],
  );

  useEffect(() => {
    setOnline(navigator.onLine);
    void loadDashboard();

    const handleOnline = () => {
      setOnline(true);
      void loadDashboard(true);
    };
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [loadDashboard]);

  const published = exams.filter((exam) => exam.status === "published").length;
  const current = allNav.find((item) => item.k === tab) ?? allNav[0];
  const filteredNav = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return [];
    return allNav.filter((item) => item.l.toLowerCase().includes(query)).slice(0, 8);
  }, [search]);

  const selectTab = (nextTab: TabKey) => {
    setTab(nextTab);
    void navigate({ to: "/teacher", search: { tab: nextTab }, replace: true });
    setSearch("");
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Nie udało się wylogować");
      return;
    }
    await navigate({ to: "/", replace: true });
  };

  const renderTab = () => {
    if (tab === "pulpit") {
      return (
        <Pulpit
          exams={exams}
          published={published}
          attempts={attempts}
          pendingReview={pendingReview}
          activePins={activePins}
          loading={loading}
          lastUpdated={lastUpdated}
          go={selectTab}
          email={email}
          onRefresh={() => void loadDashboard(true)}
        />
      );
    }
    if (tab === "ai") return <AISection />;
    if (tab === "tutor") return <AiTutor />;
    if (tab === "plan") return <PlanLekcji />;
    if (tab === "egzaminy") return <Egzaminy />;
    if (tab === "sprawdziany") return <Sprawdziany />;
    if (tab === "bank") return <BankPytan />;
    if (tab === "klasy") return <Klasy />;
    if (tab === "zadania") return <Zadania />;
    if (tab === "kalendarz") return <Kalendarz />;
    if (tab === "live") return <LiveQuiz />;
    if (tab === "monitoring") return <Monitoring />;
    if (tab === "analityka") return <Analityka />;
    if (tab === "ranking") return <Ranking />;
    if (tab === "materialy") return <Materialy go={selectTab as (tab: string) => void} />;
    if (tab === "forum") return <Forum />;
    if (tab === "ustawienia") return <Ustawienia />;
    if (tab === "ogloszenia") return <Ogloszenia />;
    if (tab === "wiadomosci") return <Wiadomosci />;
    if (tab === "edziennik") return <EDziennik />;
    if (tab === "eksport") return <Eksport />;
    if (tab === "aiocen") return <AiOcen />;
    if (tab === "certyfikaty") return <Certyfikaty />;
    return null;
  };

  return (
    <div className="teacher-shell min-h-screen bg-[#f5f7fa] text-slate-950 dark:bg-[#111214] dark:text-slate-100">
      <Toaster position="top-center" theme={resolvedTheme} richColors />

      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Zamknij menu"
              className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-[2px] lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 w-[min(310px,88vw)] border-r border-slate-200 bg-white shadow-2xl lg:hidden"
              initial={reduceMotion ? false : { x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: reduceMotion ? 0.08 : 0.24, ease: [0.22, 1, 0.36, 1] }}
            >
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-md border border-slate-200 bg-white text-slate-600"
                aria-label="Zamknij menu"
              >
                <X className="h-4 w-4" />
              </button>
              <TeacherSidebar tab={tab} email={email} onSelect={selectTab} onLogout={logout} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="lg:min-h-screen">
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] overflow-hidden border-r border-slate-200 bg-white lg:block">
          <div className="h-full">
            <TeacherSidebar tab={tab} email={email} onSelect={selectTab} onLogout={logout} />
          </div>
        </aside>

        <main className="min-w-0 lg:ml-[280px]">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xl">
            <div className="flex min-h-16 flex-col gap-3 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between lg:px-7">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-md border border-slate-300 bg-white text-slate-700 lg:hidden"
                  aria-label="Otwórz menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
                    EduNex Workspace
                    <ChevronRight className="h-3.5 w-3.5" />
                    <span className="truncate text-[#0067b8]">{current.l}</span>
                  </div>
                  <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
                    {tab === "pulpit" ? `Dzień dobry, ${displayName}` : current.l}
                  </h1>
                </div>
              </div>

              <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 sm:w-[300px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Szukaj modułu..."
                    aria-label="Szukaj modułu"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-[#0067b8] focus:ring-1 focus:ring-[#0067b8]"
                  />
                  {search.trim() && (
                    <div className="absolute right-0 top-12 z-40 w-full overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-xl">
                      {filteredNav.length ? (
                        filteredNav.map((item) => {
                          const Icon = item.i;
                          return (
                            <button
                              key={item.k}
                              type="button"
                              onClick={() => selectTab(item.k)}
                              className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              <Icon className="h-4 w-4 text-[#0067b8]" />
                              {item.l}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-3 text-sm text-slate-500">Brak pasującego modułu.</div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <ThemeSwitcher compact />
                  <div className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-xs font-medium ${online ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
                    {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                    {online ? "Online" : "Brak sieci"}
                  </div>
                  <button
                    type="button"
                    onClick={() => void loadDashboard(true)}
                    disabled={refreshing || !online}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Odśwież</span>
                  </button>
                  <div className="hidden h-10 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-xs text-slate-600 xl:flex">
                    <Bell className="h-3.5 w-3.5 text-slate-500" />
                    {pendingReview} do oceny
                  </div>
                </div>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-5 lg:p-7">
            {loadError && (
              <div className="mb-5 flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  <div>
                    <div className="font-semibold">Nie udało się pobrać wszystkich danych</div>
                    <div className="mt-1 text-xs leading-5 text-red-800">{loadError}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void loadDashboard(true)}
                  className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-red-300 bg-white px-3 text-xs font-semibold text-red-800"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Spróbuj ponownie
                </button>
              </div>
            )}

            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
              <div className="inline-flex items-center gap-2">
                <Command className="h-3.5 w-3.5" />
                {allNav.length} moduły w jednym obszarze roboczym
              </div>
              <div>
                {lastUpdated ? `Dane zaktualizowane ${lastUpdated.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" })}` : "Ładowanie danych..."}
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.section
                key={tab}
                className="teacher-module-light"
                initial={reduceMotion ? false : { opacity: 0, y: 12, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8, filter: "blur(2px)" }}
                transition={{ duration: reduceMotion ? 0.08 : 0.24, ease: [0.22, 1, 0.36, 1] }}
              >
                <Suspense fallback={<ModuleFallback />}>{renderTab()}</Suspense>
              </motion.section>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
