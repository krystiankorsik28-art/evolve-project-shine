import React, { useEffect, useMemo, useRef, useState, Suspense } from "react";
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
import { AuthProvider } from "@/lib/auth/auth-context";

const lazyLoad = <T,>(fn: () => Promise<{ [K in keyof T]: unknown }>, name: keyof T) =>
  React.lazy(() => fn().then(m => ({ default: m[name] })));

export type Exam = { id: string; title: string; subject: string | null; status: string; created_at: string };
export type TabKey =
  | "pulpit" | "egzaminy" | "ai" | "aiocen" | "tutor" | "plan" | "bank" | "klasy" | "zadania" | "kalendarz"
  | "live" | "monitoring" | "analityka" | "ranking" | "materialy" | "forum" | "ustawienia"
  | "ogloszenia" | "wiadomosci" | "eksport" | "edziennik" | "sprawdziany" | "certyfikaty";

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
const AICodeMentor = lazyLoad(() => import("@/components/ai/AICodeMentor"), "AICodeMentor");
const AICourseGenerator = lazyLoad(() => import("@/components/ai/AICourseGenerator"), "AICourseGenerator");
const AIPresentationGenerator = lazyLoad(() => import("@/components/ai/AIPresentationGenerator"), "AIPresentationGenerator");
const AIPlagiarismDetector = lazyLoad(() => import("@/components/ai/AIPlagiarismDetector"), "AIPlagiarismDetector");
const AIProgressAnalyzer = lazyLoad(() => import("@/components/ai/AIProgressAnalyzer"), "AIProgressAnalyzer");
const AIMaterialRecommender = lazyLoad(() => import("@/components/ai/AIMaterialRecommender"), "AIMaterialRecommender");

import { Pulpit } from "@/components/teacher/PulpitSection";
import { AISection } from "@/components/teacher/AISection";
import { Certyfikaty } from "@/components/teacher/CertyfikatySection";

export const Route = createFileRoute("/_authenticated/teacher")({
  component: TeacherPanel,
  head: () => ({ meta: [{ title: "Panel nauczyciela | EduNex.pl" }] }),
});

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
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-fg)] flex">

      <Toaster theme={light ? "light" : "dark"} />
      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <aside className={`${collapsed ? "w-[68px]" : "w-64"} transition-all duration-300 bg-[var(--surface)]/90 backdrop-blur-xl border-r border-[var(--border)] flex flex-col sticky top-0 h-screen`}>
          <div className="h-14 flex items-center gap-2.5 px-4 border-b border-[var(--border)]">
            <Logo size="sm" />
            {!collapsed && <span className="text-sm font-semibold text-[var(--color-fg)]">EduNex</span>}
            <button onClick={() => setCollapsed((v) => !v)}
              className="w-7 h-7 grid place-items-center rounded-md text-[var(--color-fg-subtle)] hover:text-[var(--color-fg)] hover:bg-white/5 transition shrink-0 ml-auto"
            >
              {collapsed ? <PanelLeft className="w-4 h-4"/> : <PanelLeftClose className="w-4 h-4"/>}
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-4 overflow-y-auto scrollbar-thin">
            {NAV_GROUPS.map((group) => (
              <div key={group.label}>
                {!collapsed && (
                  <div className="px-3 pb-1 text-[10px] tracking-[0.15em] text-[var(--color-fg-subtle)] font-mono uppercase">{group.label}</div>
                )}
                <div className="space-y-0.5">
                  {group.items.map((n) => {
                    const active = tab === n.k;
                    return (
                      <button key={n.k} onClick={() => setTab(n.k)} title={collapsed ? n.l : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition relative ${
                          active ? "bg-[var(--accent)]/10 text-[var(--accent)] font-medium" : "text-[var(--color-fg-muted)] hover:text-[var(--color-fg)] hover:bg-white/[0.04]"
                        } ${collapsed ? "justify-center" : ""}`}
                      >
                        {active && !collapsed && <span className="absolute -left-2 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r bg-[var(--accent)]" />}
                        <n.i className={`w-4 h-4 shrink-0 ${active ? "text-[var(--accent)]" : ""}`} />
                        {!collapsed && (
                          <>
                            <span className="flex-1 text-left truncate">{n.l}</span>
                            {n.badge && (
                              <span className={`text-[9px] font-mono tracking-wider px-1.5 py-0.5 rounded ${
                                n.badge === "LIVE" ? "bg-pink-500/20 text-pink-300" : "bg-[var(--accent)]/15 text-[var(--accent)]"
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

          <div className="p-3 border-t border-[var(--border)] space-y-2">
            {!collapsed ? (
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-white/[0.03] border border-[var(--border)]">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent)] to-blue-500 grid place-items-center text-[var(--color-bg)] font-bold text-sm">{userInitial}</div>
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] tracking-[0.15em] text-[var(--accent)]/60 font-mono">TEACHER</div>
                  <div className="text-xs text-[var(--color-fg-muted)] truncate">{email || "teacher@edunex.pl"}</div>
                </div>
              </div>
            ) : (
              <div className="w-8 h-8 mx-auto rounded-lg bg-gradient-to-br from-[var(--accent)] to-blue-500 grid place-items-center text-[var(--color-bg)] font-bold text-sm">{userInitial}</div>
            )}
            <button onClick={logout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--color-fg-subtle)] hover:text-[var(--color-fg-muted)] hover:bg-white/[0.04] transition ${collapsed ? "justify-center" : ""}`}>
              <LogOut className="w-4 h-4"/> {!collapsed && "Sign out"}
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Topbar */}
          <div className="h-14 border-b border-[var(--border)] bg-[var(--color-bg)]/80 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[10px] font-mono tracking-[0.12em] text-[var(--color-fg-subtle)] uppercase">
                  <span>EduNex</span>
                  <ChevronRight className="w-3 h-3"/>
                  <span className="text-[var(--accent)]/60">{currentNav?.l ?? "Dashboard"}</span>
                </div>
                <h1 className="text-base font-medium text-[var(--color-fg)] truncate">
                  {tab === "pulpit" ? `${greet}, ${displayName}` : currentNav?.l}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => { setSearchOpen(true); setNotifOpen(false); }}
                className="hidden md:inline-flex items-center gap-2 h-9 pl-3 pr-2 rounded-lg bg-white/[0.04] border border-[var(--border)] hover:bg-white/[0.06] text-xs text-[var(--color-fg-muted)] transition"
              >
                <Search className="w-3.5 h-3.5"/>
                <span>Szukaj sekcji…</span>
                <span className="ml-3 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] font-mono text-[var(--color-fg-muted)]"><Command className="w-2.5 h-2.5"/>K</span>
              </button>
              <div className="relative" ref={notifRef}>
                <button onClick={() => { setNotifOpen((v) => !v); setSearchOpen(false); }}
                  className={`relative w-9 h-9 grid place-items-center rounded-lg hover:bg-white/[0.06] transition ${notifOpen ? "bg-white/10 text-[var(--color-fg)]" : "text-[var(--color-fg-muted)]"}`}
                >
                  <Bell className="w-4 h-4"/>
                  {notifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 ring-2 ring-[var(--color-bg)]"/>}
                </button>
                {notifOpen && (
                  <div className="absolute right-0 top-11 w-80 rounded-xl border border-white/10 bg-[var(--surface-elevated)]/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                      <div className="text-sm font-medium text-[var(--color-fg)]">Powiadomienia</div>
                      <span className="text-[10px] font-mono text-[var(--color-fg-subtle)]">{notifications.length} new</span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-xs text-[var(--color-fg-subtle)]">Brak powiadomień</div>
                      ) : notifications.map((n) => (
                        <button key={n.id} onClick={() => { setTab("egzaminy"); setNotifOpen(false); }}
                          className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition"
                        >
                          <div className="text-sm text-[var(--color-fg)]/80 truncate">{n.title}</div>
                          <div className="flex items-center justify-between mt-1 text-[10px] text-[var(--color-fg-subtle)] font-mono">
                            <span>{n.sub}</span><span>{n.when}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { toggle(); }}
                className={`w-9 h-9 grid place-items-center rounded-lg hover:bg-white/[0.06] transition ${light ? "bg-amber-400/15 text-amber-300" : "text-[var(--color-fg-muted)]"}`}
              >
                {light ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
              </button>
            </div>
          </div>

          {/* Command palette overlay */}
          {searchOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm grid place-items-start pt-32 px-4" onClick={() => setSearchOpen(false)}>
              <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/95 backdrop-blur-xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-3 border-b border-[var(--border)] flex items-center gap-2">
                  <Search className="w-4 h-4 text-[var(--color-fg-subtle)]"/>
                  <input
                    autoFocus
                    value={searchQ}
                    onChange={(e) => setSearchQ(e.target.value)}
                    placeholder="Szybkie przejście — wpisz nazwę sekcji…"
                    className="flex-1 bg-transparent outline-none text-sm text-[var(--color-fg)] placeholder-[var(--color-fg-subtle)]"
                  />
                  <kbd className="text-[10px] font-mono text-[var(--color-fg-muted)] px-1.5 py-0.5 rounded bg-white/5 border border-white/10">ESC</kbd>
                </div>
                <div className="max-h-80 overflow-y-auto py-1">
                  {searchResults.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-[var(--color-fg-muted)]">Brak wyników</div>
                  ) : searchResults.map((n) => (
                    <button
                      key={n.k}
                      onClick={() => { setTab(n.k); setSearchOpen(false); setSearchQ(""); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[var(--color-fg)]/80 hover:bg-white/5 transition"
                    >
                      <n.i className="w-4 h-4 text-[var(--accent)]"/>
                      <span className="flex-1 text-left">{n.l}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[var(--color-fg-subtle)]"/>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          <div className="p-6 lg:p-8 min-h-0">
            <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-[var(--accent)]"/></div>}>
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

/* Components extracted to:
   - src/components/teacher/PulpitSection.tsx
   - src/components/teacher/AISection.tsx
   - src/components/teacher/CertyfikatySection.tsx
*/
