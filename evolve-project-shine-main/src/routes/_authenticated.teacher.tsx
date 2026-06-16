import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, FileText, Sparkles, Library, Users, ClipboardList, Bell,
  Calendar, Radio, Activity, BarChart3, Trophy, BookOpen, MessagesSquare,
  Settings, LogOut, Search, Plus, Camera, Brain, Loader2,
  Image as ImageIcon, Wand2, ChevronRight, CalendarClock, Command,
  TrendingUp, TrendingDown, Zap, ArrowUpRight, CheckCircle2, Clock,
  PanelLeftClose, PanelLeft, ShieldCheck, Megaphone, MessageCircle, Database,
  ScrollText, Award, ExternalLink, Globe, Code2, Presentation, Moon, Sun,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/lib/theme";
import { Logo } from "@/components/Logo";
import { Egzaminy } from "@/components/teacher/Egzaminy";
import { BankPytan } from "@/components/teacher/BankPytan";
import { Klasy } from "@/components/teacher/Klasy";
import { Zadania } from "@/components/teacher/Zadania";
import { Kalendarz } from "@/components/teacher/Kalendarz";
import { LiveQuiz } from "@/components/teacher/LiveQuiz";
import { Monitoring } from "@/components/teacher/Monitoring";
import { Analityka, Ranking, Materialy, Forum, Ustawienia } from "@/components/teacher/Pozostale";
import { AiTutor } from "@/components/teacher/AiTutor";
import { PlanLekcji } from "@/components/teacher/PlanLekcji";
import { Ogloszenia } from "@/components/teacher/Ogloszenia";
import { Wiadomosci } from "@/components/teacher/Wiadomosci";
import { Eksport } from "@/components/teacher/Eksport";
import { EDziennik } from "@/components/teacher/EDziennik";
import { AiOcen } from "@/components/teacher/AiOcen";
import { Sprawdziany } from "@/components/teacher/Sprawdziany";
import { AuthProvider } from "@/lib/auth/auth-context";
import { AICodeMentor } from "@/components/ai/AICodeMentor";
import { AICourseGenerator } from "@/components/ai/AICourseGenerator";
import { AIPresentationGenerator } from "@/components/ai/AIPresentationGenerator";
import { AIPlagiarismDetector } from "@/components/ai/AIPlagiarismDetector";
import { AIProgressAnalyzer } from "@/components/ai/AIProgressAnalyzer";
import { AIMaterialRecommender } from "@/components/ai/AIMaterialRecommender";

export const Route = createFileRoute("/_authenticated/teacher")({
  component: TeacherPanel,
  head: () => ({ meta: [{ title: "Panel nauczyciela | EduNex.pl" }] }),
});

type Exam = { id: string; title: string; subject: string | null; status: string; created_at: string };
type TabKey =
  | "pulpit" | "egzaminy" | "ai" | "aiocen" | "tutor" | "plan" | "bank" | "klasy" | "zadania" | "kalendarz"
  | "live" | "monitoring" | "analityka" | "ranking" | "materialy" | "forum" | "ustawienia"
  | "ogloszenia" | "wiadomosci" | "eksport" | "edziennik" | "sprawdziany" | "certyfikaty";

type NavItem = { k: TabKey; l: string; i: React.ComponentType<{ className?: string }>; badge?: string };
type NavGroup = { label: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Przegląd",
    items: [
      { k: "pulpit", l: "Pulpit", i: LayoutDashboard },
      { k: "analityka", l: "Analityka", i: BarChart3 },
      { k: "ranking", l: "Ranking", i: Trophy },
      { k: "certyfikaty", l: "Certyfikaty", i: Award, badge: "NEW" },
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
    label: "AI",
    items: [
      { k: "ai", l: "AI Generator", i: Sparkles, badge: "NEW" },
      { k: "aiocen", l: "AI Ocenianie", i: Wand2, badge: "AI" },
      { k: "tutor", l: "AI Tutor", i: Brain },
    ],
  },
  {
    label: "Klasa",
    items: [
      { k: "klasy", l: "Klasy", i: Users },
      { k: "plan", l: "Szkoła", i: CalendarClock },
      { k: "kalendarz", l: "Kalendarz", i: Calendar },
    ],
  },
  {
    label: "Sesje",
    items: [
      { k: "live", l: "Live Quiz", i: Radio, badge: "LIVE" },
      { k: "monitoring", l: "Monitoring", i: Activity },
    ],
  },
  {
    label: "Komunikacja",
    items: [
      { k: "ogloszenia", l: "Ogłoszenia", i: Megaphone, badge: "NEW" },
      { k: "wiadomosci", l: "Wiadomości", i: MessageCircle },
    ],
  },
  {
    label: "Dziennik",
    items: [
      { k: "edziennik", l: "e-Dziennik", i: Globe, badge: "NEW" },
      { k: "eksport", l: "Eksport ocen", i: Database },
    ],
  },
  {
    label: "Społeczność",
    items: [
      { k: "forum", l: "Forum", i: MessagesSquare },
      { k: "ustawienia", l: "Ustawienia", i: Settings },
    ],
  },
];

const ALL_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);

function TeacherPanel() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [exams, setExams] = useState<Exam[]>([]);
  const [tab, setTab] = useState<TabKey>("pulpit");
  const [attempts, setAttempts] = useState<number>(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [collapsed, setCollapsed] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const { theme, toggle } = useTheme();
  const light = theme === "light";
  const notifRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        setNotifOpen(false);
      }
      if (e.key === "Escape") { setSearchOpen(false); setNotifOpen(false); }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onClick); document.removeEventListener("keydown", onKey); };
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) { setEmail(user.email ?? ""); setDisplayName(user.user_metadata?.display_name ?? user.user_metadata?.full_name ?? ((user.email ?? "").split("@")[0] || "nauczycielu")); }
      const { data } = await supabase.from("exams").select("id,title,subject,status,created_at").order("created_at", { ascending: false }).limit(50);
      setExams((data ?? []) as Exam[]);
      const { count } = await supabase.from("attempts").select("id", { count: "exact", head: true });
      setAttempts(count ?? 0);
    })();
  }, []);

  const logout = async () => { await supabase.auth.signOut(); await navigate({ to: "/" }); };
  const published = exams.filter((e) => e.status === "published").length;
  const userInitial = (email[0] ?? "Z").toUpperCase();
  const greet = now.getHours() < 12 ? "Dzień dobry" : now.getHours() < 18 ? "Dzień dobry" : "Dobry wieczór";

  const notifications = exams.slice(0, 5).map((e) => ({
    id: e.id,
    title: e.title,
    sub: e.status === "published" ? "Opublikowany" : "Wersja robocza",
    when: new Date(e.created_at).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" }),
  }));
  const searchResults = ALL_NAV.filter((n) => n.l.toLowerCase().includes(searchQ.toLowerCase()));
  const currentNav = ALL_NAV.find((n) => n.k === tab);

  return (
    <div className="min-h-screen bg-[#0a0a12] text-slate-200 flex">

      <Toaster theme={light ? "light" : "dark"} />
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <aside className={`${collapsed ? "w-[68px]" : "w-64"} transition-all duration-300 bg-[#0c0c16]/90 backdrop-blur-xl border-r border-white/[0.06] flex flex-col sticky top-0 h-screen`}>
          <div className="h-14 flex items-center gap-2.5 px-4 border-b border-white/[0.06]">
            <Logo size="sm" />
            {!collapsed && <span className="text-sm font-semibold text-white">EduNex</span>}
            <button onClick={() => setCollapsed((v) => !v)}
              className="w-7 h-7 grid place-items-center rounded-md text-white/30 hover:text-white hover:bg-white/5 transition shrink-0 ml-auto"
            >
              {collapsed ? <PanelLeft className="w-4 h-4"/> : <PanelLeftClose className="w-4 h-4"/>}
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto scrollbar-thin">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <div className="px-3 pb-1 text-[10px] tracking-[0.15em] text-white/25 font-mono uppercase">{group.label}</div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((n) => {
                    const active = tab === n.k;
                    return (
                      <button key={n.k} onClick={() => setTab(n.k)} title={collapsed ? n.l : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition relative ${
                          active ? "bg-white/[0.08] text-white font-medium" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        {active && !collapsed && <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-cyan-400" />}
                        <n.i className={`w-4 h-4 shrink-0 ${active ? "text-cyan-300" : ""}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{n.l}</span>
                            {n.badge && (
                              <span className={`text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded ${
                                n.badge === "LIVE" ? "bg-pink-500/20 text-pink-300" : "bg-cyan-500/15 text-cyan-300"
                              }`}>{n.badge}</span>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          <div className="p-3 border-t border-white/[0.06] space-y-2">
            {!collapsed ? (
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-[#0a0a12] font-bold text-sm">{userInitial}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] tracking-[0.15em] text-cyan-400/60 font-mono">TEACHER</div>
                  <div className="text-xs text-white/70 truncate">{email || "teacher@edunex.pl"}</div>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 grid place-items-center text-[#0a0a12] font-bold text-sm">{userInitial}</div>
            )}
            <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition ${collapsed ? "justify-center" : ""}`}>
              <LogOut className="w-4 h-4"/> {!collapsed && "Sign out"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <div className="h-14 border-b border-white/[0.06] bg-[#0a0a12]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.12em] text-white/30 uppercase">
                  <span>EduNex</span>
                  <ChevronRight className="w-3 h-3"/>
                  <span className="text-cyan-400/60">{currentNav?.l ?? "Dashboard"}</span>
                </div>
                <h1 className="text-base font-medium text-white truncate">
                  {tab === "pulpit" ? `${greet}, ${displayName}` : currentNav?.l}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => { setSearchOpen(true); setNotifOpen(false); }}
                className="hidden md:inline-flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.06] text-xs text-white/40 transition"
              >
                <Search className="w-3.5 h-3.5"/>
                <span>Search sections…</span>
                <span className="ml-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-white/40"><Command className="w-2.5 h-2.5"/>K</span>
              </button>
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setNotifOpen((v) => !v); setSearchOpen(false); }}
                  className={`relative w-9 h-9 grid place-items-center rounded-lg hover:bg-white/[0.06] transition ${notifOpen ? "bg-white/10 text-white" : "text-white/40"}`}
                >
                  <Bell className="w-4 h-4"/>
                  {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-[#0a0a12]"/>}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-11 w-80 rounded-xl border border-white/10 bg-[#0c0c16]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <div className="text-sm font-medium text-white">Notifications</div>
                      <span className="text-[10px] font-mono text-white/30">{notifications.length} new</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-white/30">No notifications</div>
                      ) : notifications.map((n) => (
                        <button key={n.id} onClick={() => { setTab("egzaminy"); setNotifOpen(false); }}
                          className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <div className="text-sm text-white/80 truncate">{n.title}</div>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-white/30 font-mono">
                            <span>{n.sub}</span><span>{n.when}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { toggle(); }}
                className={`w-9 h-9 grid place-items-center rounded-lg hover:bg-white/[0.06] transition ${light ? "bg-amber-400/15 text-amber-300" : "text-white/40"}`}
              >
                {light ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
              </button>
            </div>
          </div>

          {/* Command palette overlay */}
          {searchOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-start pt-32 px-4" onClick={() => setSearchOpen(false)}>
              <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#0b1224]/95 backdrop-blur-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-3 border-b border-white/5 flex items-center gap-2">
                  <Search className="w-4 h-4 text-white/30"/>
                  <input
                    autoFocus
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Szybkie przejście — wpisz nazwę sekcji…"
                    className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30"
                  />
                  <kbd className="text-[10px] font-mono text-white/40 px-1.5 py-0.5 rounded bg-white/5 border border-white/10">ESC</kbd>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-white/40">Brak wyników</div>
                  ) : searchResults.map((n) => (
                    <button
                      key={n.k}
                      onClick={() => { setTab(n.k); setSearchOpen(false); setSearchQ(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:bg-white/5 transition"
                    >
                      <n.i className="w-4 h-4 text-accent"/>
                      <span className="flex-1 text-left">{n.l}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-white/30"/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 lg:p-8 min-h-0">
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
          </div>
        </main>
        </div>
      </div>

  );
}

/* ============================ PULPIT ============================ */
function Pulpit({ exams, published, attempts, go, email }: { exams: Exam[]; published: number; attempts: number; go: (t: TabKey) => void; email: string }) {
  const drafts = exams.length - published;
  const recent = exams.slice(0, 6);

  // synthetic activity sparkline based on created_at distribution
  const spark = useMemo(() => {
    const days = 12;
    const buckets = new Array(days).fill(0);
    const now = Date.now();
    exams.forEach((e) => {
      const d = Math.floor((now - new Date(e.created_at).getTime()) / (1000*60*60*24));
      if (d >= 0 && d < days) buckets[days - 1 - d] += 1;
    });
    if (buckets.every((b) => b === 0)) return [1,2,1,3,2,4,3,5,4,6,5,7];
    return buckets;
  }, [exams]);

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-gradient-to-br from-[#0d1530] via-[#0a0f1f] to-[#0a0f1f] p-6 lg:p-8">
        <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_55%),radial-gradient(circle_at_bottom_left,rgba(167,139,250,0.18),transparent_55%)]"/>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-cyan-400/10 blur-3xl"/>
        {/* Polish Eagle watermark */}
        <div className="absolute -top-4 -right-4 w-20 h-24 opacity-[0.08] pointer-events-none">
          <svg viewBox="0 0 400 500" fill="white" className="w-full h-full">
            <path d="M200 20C180 20 160 35 155 55L150 70C145 80 140 85 130 90L120 95C110 100 105 110 105 120L105 135C105 145 110 150 120 150L125 150C130 150 135 145 140 140L145 135C150 130 155 130 160 135L165 140C170 145 175 145 180 140L185 135C190 130 195 130 200 135C205 130 210 130 215 135L220 140C225 145 230 145 235 140L240 135C245 130 250 130 255 135L260 140C265 145 270 150 275 150L280 150C290 150 295 145 295 135L295 120C295 110 290 100 280 95L270 90C260 85 255 80 250 70L245 55C240 35 220 20 200 20Z" />
            <path d="M170 160L175 155C180 150 185 150 190 155L195 160C200 165 200 175 195 180L190 185C185 190 180 190 175 185L170 180C165 175 165 165 170 160Z" />
            <path d="M210 160L215 155C220 150 225 150 230 155L235 160C240 165 240 175 235 180L230 185C225 190 220 190 215 185L210 180C205 175 205 165 210 160Z" />
            <path d="M185 200L190 195C195 190 205 190 210 195L215 200C220 205 220 215 215 220L210 225C205 230 195 230 190 225L185 220C180 215 180 205 185 200Z" />
            <path d="M160 230L165 225C170 220 180 220 185 225L190 230C195 235 195 245 190 250L185 255C180 260 170 260 165 255L160 250C155 245 155 235 160 230Z" />
            <path d="M220 230L225 225C230 220 240 220 245 225L250 230C255 235 255 245 250 250L245 255C240 260 230 260 225 255L220 250C215 245 215 235 220 230Z" />
            <path d="M175 265L180 260C185 255 195 255 200 260L205 265C210 270 210 280 205 285L200 290C195 295 185 295 180 290L175 285C170 280 170 270 175 265Z" />
            <path d="M195 295L200 290C205 290 210 295 210 300L210 310C210 315 205 320 200 320C195 320 190 315 190 310L190 300C190 295 195 295 195 295Z" />
            <path d="M120 310C120 310 130 330 150 340C160 345 170 345 180 340L185 335C190 330 195 330 200 335C205 330 210 330 215 335L220 340C230 345 240 345 250 340C270 330 280 310 280 310L275 315C270 325 260 335 250 340C240 345 230 348 220 348L215 350C210 352 205 352 200 350L185 350C180 352 175 352 170 350L160 348C145 345 135 340 125 330C120 320 120 310 120 310Z" />
            <path d="M140 350C140 350 155 365 175 375C185 380 195 382 200 380C205 382 215 380 225 375C245 365 260 350 260 350L255 355C245 368 230 378 215 385C210 388 205 388 200 385C195 388 190 388 185 385C170 378 155 368 145 355L140 350Z" />
            <rect x="160" y="30" width="80" height="8" rx="2" />
          </svg>
        </div>
        <div className="relative flex flex-col lg:flex-row lg:items-center gap-6 justify-between">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-[0.2em] text-red-300 uppercase">
              <ShieldCheck className="w-3 h-3"/> Panel Nauczyciela · EduNex
            </div>
            <h2 className="text-2xl lg:text-3xl font-display font-bold text-white leading-tight">
              Twoja klasa czeka. <span className="bg-gradient-to-r from-accent via-white to-accent bg-clip-text text-transparent">Zacznijmy nową lekcję.</span>
            </h2>
            <p className="text-sm text-white/55">Wygeneruj egzamin AI w 60 sekund, uruchom Live Quiz w czasie rzeczywistym lub przejdź do analityki postępów uczniów.</p>
            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={() => go("ai")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-semibold text-sm transition shadow-lg shadow-accent/20">
                <Sparkles className="w-4 h-4"/> Nowy egzamin AI
              </button>
              <button onClick={() => go("live")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition">
                <Radio className="w-4 h-4 text-pink-300"/> Uruchom Live Quiz
              </button>
              <button onClick={() => go("monitoring")} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm transition">
                <Activity className="w-4 h-4 text-emerald-300"/> Monitoring
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <Sparkline values={spark} />
          </div>
        </div>
      </div>

      {/* Quick create bar */}
      <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gradient-to-r from-accent/5 via-accent/5 to-accent/5 border border-white/10">
        <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 self-center mr-2">Szybkie tworzenie:</span>
        <button onClick={() => go("ai")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-accent text-xs transition">
          <Sparkles className="w-3.5 h-3.5" />Egzamin AI
        </button>
        <button onClick={() => go("egzaminy")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs transition">
          <Plus className="w-3.5 h-3.5" />Nowy egzamin
        </button>
        <button onClick={() => go("sprawdziany")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs transition">
          <ScrollText className="w-3.5 h-3.5" />Nowy sprawdzian
        </button>
        <button onClick={() => go("klasy")} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs transition">
          <Users className="w-3.5 h-3.5" />Dodaj klasę
        </button>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI icon={FileText} label="Moje egzaminy" value={exams.length} delta="+2" trend="up" color="from-accent to-blue-600"/>
        <KPI icon={CheckCircle2} label="Opublikowane" value={published} delta={`${exams.length ? Math.round((published/exams.length)*100) : 0}%`} trend="up" color="from-accent to-blue-600"/>
        <KPI icon={Users} label="Podejścia uczniów" value={attempts} delta="+12" trend="up" color="from-accent to-blue-600"/>
        <KPI icon={Zap} label="Aktywność" value={`${spark.reduce((a,b)=>a+b,0)}/12d`} delta="stabilnie" trend="flat" color="from-accent to-blue-600"/>
        <KPI icon={ScrollText} label="Sprawdziany" value={0} delta="nowość" trend="flat" color="from-accent to-blue-600"/>
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-5">
        {/* Recent exams */}
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="flex items-center gap-2 text-lg font-display font-bold text-white"><FileText className="w-5 h-5 text-sky-400"/>Ostatnie egzaminy</h3>
              <p className="text-xs text-white/45">{exams.length} egzaminów · {published} opublikowanych · {drafts} szkiców</p>
            </div>
            <button onClick={() => go("egzaminy")} className="inline-flex items-center gap-1 text-xs text-accent hover:text-cyan-200 transition">
              Zobacz wszystkie <ArrowUpRight className="w-3.5 h-3.5"/>
            </button>
          </div>
          {recent.length === 0 ? (
            <EmptyState
              icon={Sparkles}
              title="Brak egzaminów"
              desc="Wygeneruj pierwszy egzamin za pomocą AI — wystarczy temat i 30 sekund."
              cta="Stwórz z AI"
              onClick={() => go("ai")}
            />
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {recent.map((e) => (
                <button
                  key={e.id}
                  onClick={() => go("egzaminy")}
                  className="w-full flex items-center gap-4 py-3 text-left hover:bg-white/[0.02] -mx-2 px-2 rounded-lg transition group"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent/20 to-accent/10 border border-white/10 grid place-items-center text-accent shrink-0">
                    <FileText className="w-4 h-4"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{e.title}</div>
                    <div className="text-[11px] text-white/40 font-mono mt-0.5 flex items-center gap-2">
                      <Clock className="w-3 h-3"/>
                      {new Date(e.created_at).toLocaleString("pl-PL", { dateStyle: "medium", timeStyle: "short" })}
                      {e.subject && <><span>·</span><span>{e.subject}</span></>}
                    </div>
                  </div>
                  <StatusPill status={e.status}/>
                  <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition"/>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Side column */}
        <div className="space-y-5">
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/15 via-accent/5 to-accent/5 backdrop-blur p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="flex items-center gap-2 text-base font-display font-bold text-accent"><Activity className="w-4 h-4"/>Live monitoring</h3>
              <span className="text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded bg-accent/20 text-accent border border-accent/30">ACTIVE</span>
            </div>
            <p className="text-xs text-white/55 mb-4">Obserwuj uczniów w trakcie egzaminu w czasie rzeczywistym — postęp i wykrywanie nieuczciwych zachowań.</p>
            <button onClick={() => go("monitoring")} className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-accent hover:bg-accent/80 text-slate-900 font-semibold text-sm transition">
              Otwórz monitoring <ChevronRight className="w-4 h-4"/>
            </button>
          </div>

          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur p-6">
            <h3 className="flex items-center gap-2 text-base font-display font-bold text-white mb-3"><Zap className="w-4 h-4 text-amber-300"/>Szybkie akcje</h3>
            <div className="grid grid-cols-2 gap-2">
              <QuickAction icon={Brain} label="AI Tutor" onClick={() => go("tutor")} />
              <QuickAction icon={Library} label="Bank pytań" onClick={() => go("bank")} />
              <QuickAction icon={ClipboardList} label="Zadania" onClick={() => go("zadania")} />
              <QuickAction icon={Calendar} label="Kalendarz" onClick={() => go("kalendarz")} />
              <QuickAction icon={Users} label="Klasy" onClick={() => go("klasy")} />
              <QuickAction icon={BookOpen} label="Materiały" onClick={() => go("materialy")} />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="flex items-center gap-2 text-base font-display font-bold text-white"><BarChart3 className="w-4 h-4 text-sky-400"/>Aktywność (ostatnie 12 dni)</h3>
            <span className="text-[10px] font-mono text-white/40">UPDATED · {new Date().toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"})}</span>
          </div>
          <BarChart values={spark}/>
        </div>
          <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/15 via-accent/10 to-accent/5 p-6">
          <h3 className="flex items-center gap-2 text-base font-display font-bold text-white mb-2"><Brain className="w-4 h-4 text-accent"/>AI Tutor 24/7</h3>
          <p className="text-xs text-white/55 mb-4">Twój asystent dostępny w każdej chwili — pomaga generować scenariusze lekcji, wyjaśnia trudne tematy i przygotowuje uczniów.</p>
            <button onClick={() => go("tutor")} className="w-full inline-flex justify-center items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:brightness-110 text-slate-900 font-semibold text-sm transition">
            Porozmawiaj z AI <ChevronRight className="w-4 h-4"/>
          </button>
          <div className="mt-4 text-[10px] font-mono text-white/30 tracking-wider">{email ? `ID · ${email}` : ""}</div>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, delta, trend, color }: { icon: React.ComponentType<{className?:string}>; label: string; value: number | string; delta: string; trend: "up"|"down"|"flat"; color: string }) {
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Activity;
  const trendColor = trend === "up" ? "text-emerald-400 bg-emerald-500/10 border-emerald-400/20" : trend === "down" ? "text-pink-400 bg-pink-500/10 border-pink-400/20" : "text-white/50 bg-white/5 border-white/10";
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur p-5 group hover:border-white/[0.12] transition">
      <div className={`absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br ${color} opacity-20 blur-2xl group-hover:opacity-30 transition`} />
      <div className="flex items-start justify-between relative">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} grid place-items-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white"/>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded border ${trendColor}`}>
          <TrendIcon className="w-3 h-3"/>{delta}
        </span>
      </div>
      <div className="mt-4 text-3xl font-display font-bold text-white tracking-tight">{value}</div>
      <div className="text-xs text-white/45 mt-0.5">{label}</div>
    </div>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const w = 280, h = 90, pad = 6;
  const max = Math.max(...values, 1);
  const step = (w - pad*2) / (values.length - 1);
  const pts = values.map((v, i) => [pad + i*step, h - pad - (v/max) * (h - pad*2)] as const);
  const d = pts.map((p, i) => `${i===0?"M":"L"} ${p[0]} ${p[1]}`).join(" ");
  const area = `${d} L ${pts[pts.length-1][0]} ${h-pad} L ${pts[0][0]} ${h-pad} Z`;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-mono tracking-wider text-accent">TWORZENIE EGZAMINÓW · 12D</span>
        <span className="text-[10px] font-mono text-white/40">{values.reduce((a,b)=>a+b,0)} total</span>
      </div>
      <svg width={w} height={h} className="block">
        <defs>
          <linearGradient id="spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgb(34 211 238)" stopOpacity="0.6"/>
            <stop offset="100%" stopColor="rgb(34 211 238)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#spark)"/>
        <path d={d} fill="none" stroke="rgb(34 211 238)" strokeWidth="1.75" strokeLinecap="round"/>
        {pts.map((p,i) => <circle key={i} cx={p[0]} cy={p[1]} r="2" fill="rgb(167 139 250)"/>)}
      </svg>
    </div>
  );
}

function BarChart({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-2 h-40">
      {values.map((v, i) => {
        const h = Math.max(6, (v/max)*100);
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 group">
            <div className="w-full rounded-t-md bg-gradient-to-t from-accent/60 to-accent/40 hover:from-accent hover:to-blue-500 transition-all relative" style={{ height: `${h}%` }}>
              <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono text-white/60 opacity-0 group-hover:opacity-100 transition">{v}</span>
            </div>
            <span className="text-[9px] font-mono text-white/30">d-{values.length-i}</span>
          </div>
        );
      })}
    </div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: React.ComponentType<{className?:string}>; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-start gap-2 p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-cyan-400/30 transition group">
      <Icon className="w-4 h-4 text-accent group-hover:scale-110 transition"/>
      <span className="text-xs text-white/80 font-medium">{label}</span>
    </button>
  );
}

function StatusPill({ status }: { status: string }) {
  const s = status === "published"
    ? { l: "Opublikowany", c: "text-emerald-300 bg-emerald-500/10 border-emerald-400/25" }
    : status === "archived"
      ? { l: "Zarchiwizowany", c: "text-white/40 bg-white/5 border-white/10" }
      : { l: "Szkic", c: "text-amber-300 bg-amber-500/10 border-amber-400/25" };
  return <span className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded border ${s.c}`}>{s.l}</span>;
}

function EmptyState({ icon: Icon, title, desc, cta, onClick }: { icon: React.ComponentType<{className?:string}>; title: string; desc: string; cta: string; onClick: () => void }) {
  return (
    <div className="py-10 text-center">
      <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-accent/20 border border-white/10 grid place-items-center mb-3">
        <Icon className="w-5 h-5 text-accent"/>
      </div>
      <div className="text-sm font-semibold text-white">{title}</div>
      <div className="text-xs text-white/45 mt-1 max-w-sm mx-auto">{desc}</div>
      <button onClick={onClick} className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-semibold transition">
        <Sparkles className="w-3.5 h-3.5"/>{cta}
      </button>
    </div>
  );
}

/* ============================ AI ============================ */
type AiQ = {
  prompt: string;
  question_type: "multiple_choice" | "true_false" | "short_answer" | "essay";
  options?: string[];
  correct_answer: string | string[] | boolean;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
};

const AI_SUB_TABS = [
  { id: "generator", label: "AI Generator", icon: Sparkles },
  { id: "codementor", label: "AI Code Mentor", icon: Code2 },
  { id: "coursegen", label: "AI Course Generator", icon: BookOpen },
  { id: "presentation", label: "AI Presentation", icon: Presentation },
  { id: "plagiarism", label: "Plagiarism Detector", icon: ShieldCheck },
  { id: "progress", label: "AI Progress Analyzer", icon: BarChart3 },
  { id: "materials", label: "AI Material Recommender", icon: BookOpen },
];

function AISection() {
  const [aiTab, setAiTab] = useState("generator");
  const [mode, setMode] = useState<"photo" | "topic" | "image">("topic");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 bg-white/[0.02] border border-white/[0.06] rounded-2xl p-1.5">
        {AI_SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setAiTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all
              ${aiTab === t.id ? 'bg-accent/15 text-accent border border-accent/20 shadow-sm' : 'text-white/40 hover:text-white/70 border border-transparent'}`}>
            <t.icon className="w-3.5 h-3.5" />{t.label}
          </button>
        ))}
      </div>

      {aiTab === "generator" && (
        <>
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 p-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center"><Sparkles className="w-5 h-5 text-slate-900"/></div>
              <div>
                <h2 className="text-xl font-display font-bold text-white">AI Generator</h2>
                <p className="text-xs text-white/50">Gemini · pytania ze zdjęcia, z tematu, lub ilustracje do pytań — z zapisem do banku lub bezpośrednio do egzaminu.</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <TabBtn active={mode==="topic"} onClick={()=>setMode("topic")} icon={Brain} label="Z tematu"/>
            <TabBtn active={mode==="photo"} onClick={()=>setMode("photo")} icon={Camera} label="Ze zdjęcia"/>
            <TabBtn active={mode==="image"} onClick={()=>setMode("image")} icon={ImageIcon} label="Ilustracja"/>
          </div>
          {mode === "topic" && <AIGenerate />}
          {mode === "photo" && <AIPhoto />}
          {mode === "image" && <AIImage />}
        </>
      )}
      {aiTab === "codementor" && <AICodeMentor />}
      {aiTab === "coursegen" && <AICourseGenerator />}
      {aiTab === "presentation" && <AIPresentationGenerator />}
      {aiTab === "plagiarism" && <AIPlagiarismDetector />}
      {aiTab === "progress" && <AIProgressAnalyzer />}
      {aiTab === "materials" && <AIMaterialRecommender />}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: ()=>void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition ${active?"bg-cyan-500 text-slate-900":"bg-white/5 text-white/70 hover:bg-white/10 border border-white/10"}`}>
      <Icon className="w-4 h-4"/>{label}
    </button>
  );
}

async function saveQuestionsToBank(qs: AiQ[]) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Nie zalogowano");
  const rows = qs.map(q => ({
    prompt: q.prompt,
    question_type: q.question_type,
    options: q.options ?? [],
    correct_answer: q.correct_answer as unknown as never,
    explanation: q.explanation,
    difficulty: q.difficulty,
    points: q.points,
    ai_generated: true,
    created_by: user.id,
  }));
  const { error } = await supabase.from("question_bank").insert(rows);
  if (error) throw new Error(error.message);
}

async function saveQuestionsToExam(qs: AiQ[], examId: string) {
  const { data: existing } = await supabase.from("questions").select("order_index").eq("exam_id", examId).order("order_index", { ascending: false }).limit(1);
  const startIdx = ((existing?.[0]?.order_index as number | undefined) ?? -1) + 1;
  const rows = qs.map((q, i) => ({
    exam_id: examId,
    prompt: q.prompt,
    question_type: q.question_type,
    options: q.options ?? [],
    correct_answer: q.correct_answer as unknown as never,
    explanation: q.explanation,
    difficulty: q.difficulty,
    points: q.points,
    ai_generated: true,
    order_index: startIdx + i,
  }));
  const { error } = await supabase.from("questions").insert(rows);
  if (error) throw new Error(error.message);
}

function ResultActions({ qs, single }: { qs: AiQ[]; single?: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [examId, setExamId] = useState<string>("");
  const [exams, setExamsLocal] = useState<Array<{ id: string; title: string }>>([]);
  useEffect(() => {
    supabase.from("exams").select("id,title").order("created_at", { ascending: false }).limit(100)
      .then(({ data }) => setExamsLocal((data ?? []) as Array<{ id: string; title: string }>));
  }, []);
  const bank = async () => { setBusy("bank"); try { await saveQuestionsToBank(qs); toast.success(`Dodano do banku (${qs.length})`); } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); } finally { setBusy(null); } };
  const exam = async () => { if (!examId) return toast.error("Wybierz egzamin"); setBusy("exam"); try { await saveQuestionsToExam(qs, examId); toast.success(`Dodano do egzaminu`); } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); } finally { setBusy(null); } };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <button disabled={busy!==null} onClick={bank} className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold disabled:opacity-50">
        {busy==="bank" ? "Zapisuję..." : `Zapisz do banku${single?"":` (${qs.length})`}`}
      </button>
      <select value={examId} onChange={e=>setExamId(e.target.value)} className="px-2 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white">
        <option value="" className="bg-slate-900">— wybierz egzamin —</option>
        {exams.map(e => <option key={e.id} value={e.id} className="bg-slate-900">{e.title}</option>)}
      </select>
      <button disabled={busy!==null || !examId} onClick={exam} className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-semibold disabled:opacity-50">
        {busy==="exam" ? "Zapisuję..." : "Dodaj do egzaminu"}
      </button>
    </div>
  );
}

function QPreview({ q, idx }: { q: AiQ; idx: number }) {
  const correct = Array.isArray(q.correct_answer) ? q.correct_answer.join(", ") : String(q.correct_answer);
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-accent">PYT. {idx+1} · {q.question_type.toUpperCase()} · {q.difficulty.toUpperCase()} · {q.points}p</span>
      </div>
      <div className="text-sm text-white font-medium">{q.prompt}</div>
      {q.options && q.options.length > 0 && (
        <ul className="text-xs text-white/70 space-y-0.5 pl-4 list-disc">{q.options.map((o,i)=><li key={i}>{o}</li>)}</ul>
      )}
      <div className="text-xs text-emerald-300"><b>Odp:</b> {correct}</div>
      {q.explanation && <div className="text-xs text-white/50 italic">{q.explanation}</div>}
    </div>
  );
}

function AIImage() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState<string>("");
  const generate = async () => {
    if (!prompt.trim()) return toast.error("Wpisz opis ilustracji");
    setLoading(true);
    try {
      const { aiGenerateQuestionImage } = await import("@/lib/ai.functions");
      const out = await aiGenerateQuestionImage({ data: { prompt } });
      setUrl(out.image_url);
      toast.success("Wygenerowano ilustrację");
    } catch (e) { toast.error(e instanceof Error ? e.message : "Błąd"); } finally { setLoading(false); }
  };
  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-accent mb-2 block font-mono">Opis ilustracji</span>
          <textarea rows={5} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="np. Schemat układu krwionośnego człowieka" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white placeholder-white/30"/>
        </label>
        <button disabled={loading} onClick={generate} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-bold px-5 py-3 rounded-xl disabled:opacity-50">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>} {loading ? "Generuję..." : "Wygeneruj ilustrację"}
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><ImageIcon className="w-4 h-4 text-accent"/>Podgląd</h3>
        {url ? (
          <div className="space-y-3">
            <img src={url} alt="generated" className="w-full rounded-lg border border-white/10"/>
            <a href={url} download="ilustracja.png" className="inline-block px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-900 text-xs font-semibold">Pobierz</a>
          </div>
        ) : (<p className="text-sm text-white/40">Ilustracja pojawi się tutaj.</p>)}
      </div>
    </div>
  );
}

function AIPhoto() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiQ | null>(null);

  const onFile = (f: File | null) => {
    setFile(f);
    if (f) { const r = new FileReader(); r.onload = () => setPreview(r.result as string); r.readAsDataURL(f); }
    else setPreview("");
  };

  const generate = async () => {
    if (!file || !desc) { toast.error("Dodaj zdjęcie i opis"); return; }
    setLoading(true);
    try {
      const { aiQuestionFromPhoto } = await import("@/lib/ai.functions");
      const out = await aiQuestionFromPhoto({ data: { image_base64: preview, description: desc } });
      setResult(out as AiQ);
      toast.success("Pytanie wygenerowane");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd AI");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-accent mb-2 font-mono">Krok 1</div>
          <label className="block border-2 border-dashed border-white/15 rounded-xl p-8 text-center cursor-pointer hover:border-cyan-400/40 hover:bg-white/[0.02] transition">
            <input type="file" accept="image/*" onChange={(e)=>onFile(e.target.files?.[0] ?? null)} className="hidden"/>
            {preview ? <img src={preview} alt="podgląd" className="max-h-64 mx-auto rounded-lg"/> : (<><ImageIcon className="w-10 h-10 mx-auto text-white/30 mb-2"/><p className="text-sm text-white/50">Kliknij lub przeciągnij zdjęcie zadania</p></>)}
          </label>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wider text-violet-300 mb-2 font-mono">Krok 2</div>
          <textarea rows={3} value={desc} onChange={(e)=>setDesc(e.target.value)} placeholder="np. Pytanie ABCD do klasy 2 LO o sile tarcia." className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white placeholder-white/30"/>
        </div>
        <button disabled={loading} onClick={generate} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-bold px-5 py-3 rounded-xl disabled:opacity-50 transition hover:scale-[1.01]">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4"/>} {loading ? "AI pracuje..." : "Wygeneruj pytanie"}
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent"/>Wynik</h3>
        {result ? (<><QPreview q={result} idx={0}/><ResultActions qs={[result]} single/></>) : (<p className="text-sm text-white/40">Wynik pojawi się tutaj.</p>)}
      </div>
    </div>
  );
}

function AIGenerate() {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy"|"medium"|"hard">("medium");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiQ[] | null>(null);

  const generate = async () => {
    if (!topic) { toast.error("Wpisz temat"); return; }
    setLoading(true);
    try {
      const { aiGenerateQuestions } = await import("@/lib/ai.functions");
      const out = await aiGenerateQuestions({ data: { topic, count, difficulty } });
      setResult(out as AiQ[]);
      toast.success(`Wygenerowano ${count} pytań`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Błąd AI");
    } finally { setLoading(false); }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-accent mb-2 block font-mono">Temat</span>
          <input value={topic} onChange={(e)=>setTopic(e.target.value)} placeholder="np. II wojna światowa — 1939" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white placeholder-white/30"/>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-violet-300 mb-2 block font-mono">Liczba pytań</span>
            <input type="number" min={1} max={30} value={count} onChange={(e)=>setCount(Number(e.target.value))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white"/>
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-wider text-emerald-300 mb-2 block font-mono">Trudność</span>
            <select value={difficulty} onChange={(e)=>setDifficulty(e.target.value as "easy"|"medium"|"hard")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg outline-none focus:border-cyan-400/50 text-white">
              <option value="easy" className="bg-slate-900">Łatwa</option>
              <option value="medium" className="bg-slate-900">Średnia</option>
              <option value="hard" className="bg-slate-900">Trudna</option>
            </select>
          </label>
        </div>
        <button disabled={loading} onClick={generate} className="w-full inline-flex justify-center items-center gap-2 bg-gradient-to-r from-accent to-blue-500 text-slate-900 font-bold px-5 py-3 rounded-xl disabled:opacity-50 hover:scale-[1.01] transition">
          {loading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Brain className="w-4 h-4"/>} {loading ? "AI pracuje..." : "Wygeneruj"}
        </button>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2"><Sparkles className="w-4 h-4 text-accent"/>Wynik</h3>
        {result ? (
          <div className="space-y-2 max-h-[500px] overflow-auto pr-1">
            {result.map((q,i) => <QPreview key={i} q={q} idx={i}/>)}
            <ResultActions qs={result}/>
          </div>
        ) : (<p className="text-sm text-white/40">Wynik pojawi się tutaj.</p>)}
      </div>
    </div>
  );
}

/* ============================ CERTYFIKATY ============================ */
function Certyfikaty() {
  const [attempts, setAttempts] = useState<Array<{
    id: string; exam_title: string; student_name: string;
    score: number; max_score: number; percent: number; submitted_at: string;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) { setLoading(false); return; }
      const { data: exams } = await supabase.from("exams").select("id, title").eq("created_by", user.user.id);
      if (!exams || exams.length === 0) { setLoading(false); return; }
      const examIds = exams.map((e) => e.id);
      const { data } = await supabase
        .from("attempts")
        .select("id, exam_id, student_name, score, max_score, percent, submitted_at")
        .in("exam_id", examIds)
        .eq("status", "submitted")
        .eq("passed", true)
        .order("submitted_at", { ascending: false })
        .limit(100);
      const titleMap: Record<string, string> = {};
      for (const e of exams) titleMap[e.id] = e.title;
      if (data) setAttempts(data.map((a) => ({ ...a, exam_title: titleMap[a.exam_id] ?? "Nieznany" })));
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-accent/10 p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
            <Award className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">Certyfikaty uczniów</h2>
            <p className="text-xs text-white/50">Wystawione certyfikaty za zaliczone egzaminy</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-cyan-400"/></div>
      ) : attempts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-400/20 grid place-items-center mb-3">
            <Award className="w-5 h-5 text-amber-300" />
          </div>
          <p className="text-sm text-white/70">Brak certyfikatów</p>
          <p className="text-xs text-white/40 mt-1">Certyfikaty pojawią się, gdy uczniowie zaliczą egzaminy.</p>
        </div>
      ) : (
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-white/50 uppercase tracking-wider">
                  <th className="text-left p-4 font-medium">Uczeń</th>
                  <th className="text-left p-4 font-medium">Egzamin</th>
                  <th className="text-left p-4 font-medium">Wynik</th>
                  <th className="text-left p-4 font-medium">Data</th>
                  <th className="text-left p-4 font-medium">Certyfikat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attempts.map((a) => {
                  const raw = `${a.id}-${a.score}-${Math.round(a.percent)}-edunex-cert-v1`;
                  let hash = 0;
                  for (let i = 0; i < raw.length; i++) hash = ((hash << 5) - hash) + raw.charCodeAt(i);
                  const h = Math.abs(hash).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
                  const id = a.id.replace(/-/g, "").slice(0, 6).toUpperCase();
                  const serial = `EDX-${id}-${h}`;
                  return (
                    <tr key={a.id} className="hover:bg-white/[0.01] transition">
                      <td className="p-4 text-white/90">{a.student_name}</td>
                      <td className="p-4 text-white/70">{a.exam_title}</td>
                      <td className="p-4">
                        <span className="text-emerald-300 font-mono">{a.score}/{a.max_score} ({Math.round(a.percent)}%)</span>
                      </td>
                      <td className="p-4 text-white/50 text-[11px]">
                        {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString("pl-PL") : "-"}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <a
                            href={`/verify/${serial}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-accent text-xs hover:bg-cyan-500/20 transition"
                          >
                            <ExternalLink className="w-3 h-3" />Sprawdź
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
