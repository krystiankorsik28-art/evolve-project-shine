import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate, Link, redirect } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import {
  GraduationCap, LogOut, User, KeyRound, Loader2,
  Clock, CheckCircle2, XCircle, BookOpen, ArrowLeft,
  History, Zap, Award, Download, ExternalLink,
  LayoutDashboard, FileText, Trophy, Settings, Sparkles,
  Bot, TrendingUp, Flame, Brain, ChevronRight,
  Menu, PanelLeftClose, PanelLeft, Star,
  Target, Gift, Medal, BadgeCheck, Layers,
  CalendarDays, BellRing, ArrowRight, CircleCheck,
  Lightbulb, BookMarked, ScrollText,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSerial, getQrUrl, downloadCertPdf } from "@/lib/certificate";
import { toast } from "sonner";
import { studentPinLogin } from "@/lib/student-auth.functions";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/student/dashboard")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", replace: true });
  },
  component: StudentDashboard,
  head: () => ({ meta: [{ title: "Panel ucznia | EduNex" }] }),
});

type AttemptSummary = {
  id: string;
  exam_title: string;
  status: string;
  score: number | null;
  max_score: number | null;
  percent: number | null;
  passed: boolean | null;
  started_at: string;
};

type Achievement = {
  id: string;
  title: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  unlocked: boolean;
  progress: number;
  color: string;
};

type DailyGoal = {
  id: string;
  label: string;
  done: boolean;
  xp: number;
};

type RoadmapMilestone = {
  id: string;
  label: string;
  date: string;
  passed: boolean;
};

const ACHIEVEMENTS: Achievement[] = [
  { id: "first_exam", title: "First Steps", desc: "Complete your first exam", icon: Star, unlocked: true, progress: 1, color: "from-amber-400 to-yellow-500" },
  { id: "perfect_score", title: "Perfect Score", desc: "Get 100% on any exam", icon: Medal, unlocked: false, progress: 0.6, color: "from-emerald-400 to-teal-500" },
  { id: "streak_7", title: "Week Warrior", desc: "7-day study streak", icon: Flame, unlocked: true, progress: 1, color: "from-orange-400 to-red-500" },
  { id: "ten_exams", title: "Dedicated", desc: "Complete 10 exams", icon: Trophy, unlocked: false, progress: 0.3, color: "from-violet-400 to-purple-500" },
  { id: "speed_demon", title: "Speed Demon", desc: "Finish an exam in under 10min", icon: Zap, unlocked: false, progress: 0, color: "from-cyan-400 to-blue-500" },
  { id: "knowledge_seeker", title: "Knowledge Seeker", desc: "Try 3 different subjects", icon: BookOpen, unlocked: true, progress: 1, color: "from-pink-400 to-rose-500" },
  { id: "cert_collector", title: "Certificate Collector", desc: "Earn 5 certificates", icon: Award, unlocked: false, progress: 0.4, color: "from-indigo-400 to-purple-500" },
  { id: "ai_master", title: "AI Master", desc: "Ask the AI Tutor 20 questions", icon: Brain, unlocked: false, progress: 0.25, color: "from-sky-400 to-cyan-500" },
];

const DAILY_GOALS: DailyGoal[] = [
  { id: "g1", label: "Complete one practice exam", done: true, xp: 50 },
  { id: "g2", label: "Review 3 incorrect answers", done: true, xp: 30 },
  { id: "g3", label: "Ask AI Tutor a question", done: false, xp: 20 },
  { id: "g4", label: "Improve a subject score", done: false, xp: 40 },
];

const ROADMAP: RoadmapMilestone[] = [
  { id: "r1", label: "First Exam Completed", date: "2025-01-15", passed: true },
  { id: "r2", label: "3 Exams Passed", date: "2025-02-10", passed: true },
  { id: "r3", label: "Level 5 Reached", date: "2025-03-22", passed: true },
  { id: "r4", label: "First Certificate", date: "", passed: false },
  { id: "r5", label: "10 Exams Completed", date: "", passed: false },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

function StudentDashboard() {
  const navigate = useNavigate();
  const login = useServerFn(studentPinLogin);

  const [user, setUser] = useState<{ id: string; email?: string; first_name?: string; last_name?: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [pinLoading, setPinLoading] = useState(false);
  const [history, setHistory] = useState<AttemptSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [tab, setTab] = useState<string>("dashboard");
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMsg, setAiMsg] = useState("");
  const [aiChat, setAiChat] = useState<{ role: string; text: string }[]>([]);

  const streak = 7;
  const points = 1250;
  const level = 4;
  const nextLevelPoints = 2000;
  const progress = Math.round((points / nextLevelPoints) * 100);
  const passedCount = history.filter((h) => h.passed === true).length;
  const avgScore = history.filter((h) => h.score != null).length
    ? Math.round(history.filter((h) => h.score != null).reduce((a, h) => a + (h.percent ?? 0), 0) / history.filter((h) => h.score != null).length)
    : 0;

  const dailyProgress = Math.round((DAILY_GOALS.filter((g) => g.done).length / DAILY_GOALS.length) * 100);

  const quickTopics = ["Fizyka", "Matematyka", "Chemia", "Biologia", "Historia", "Angielski"];

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate({ to: "/auth/student" });
        return;
      }
      const meta = session.user.user_metadata || {};
      if (!meta.onboarding_completed) {
        navigate({ to: "/onboarding" });
        return;
      }
      setUser({
        id: session.user.id,
        email: session.user.email,
        first_name: meta.first_name || "",
        last_name: meta.last_name || "",
      });
      setChecking(false);
    };
    check();
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("attempts")
        .select("id, exam_id, status, score, max_score, percent, passed, created_at")
        .eq("student_name", `${user.first_name} ${user.last_name}`)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) {
        const examIds = [...new Set(data.map((a) => a.exam_id).filter(Boolean))];
        const { data: exams } = await supabase
          .from("exams")
          .select("id, title")
          .in("id", examIds);
        const titleMap: Record<string, string> = {};
        for (const e of exams ?? []) titleMap[e.id] = e.title;
        setHistory(data.map((a) => ({
          id: a.id,
          exam_title: titleMap[a.exam_id] ?? "Unknown exam",
          status: a.status,
          score: a.score,
          max_score: a.max_score,
          percent: a.percent,
          passed: a.passed,
          started_at: a.created_at,
        } as AttemptSummary)));
      }
      setLoadingHistory(false);
    })();
  }, [user]);

  const displayName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.email || "Student";

  const pin = pinDigits.join("");
  const pinReady = pin.length === 6;

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinReady) { toast.error("Enter full 6-digit PIN"); return; }
    setPinLoading(true);
    try {
      const nameParts = displayName.split(" ");
      const res = await login({
        data: {
          first_name: nameParts[0] || "Student",
          last_name: nameParts.slice(1).join(" ") || "",
          pin,
        },
      });
      sessionStorage.setItem("edunex_student", JSON.stringify({ ...res }));
      toast.success(`Exam: ${res.exam_title}`);
      await navigate({ to: "/student/exam/$attemptId", params: { attemptId: res.attempt_id } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error");
      setPinLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const sendAiMsg = () => {
    if (!aiMsg.trim()) return;
    setAiChat((p) => [...p, { role: "user", text: aiMsg }]);
    setTimeout(() => {
      const replies = [
        "That's a great question! Let me break it down for you step by step.",
        "Here's what you need to know about this topic...",
        "Think of it this way — it's much simpler than it seems!",
        "I'd recommend starting with the basics. Have you covered the core concepts yet?",
      ];
      setAiChat((p) => [...p, { role: "ai", text: replies[Math.floor(Math.random() * replies.length)] }]);
    }, 800);
    setAiMsg("");
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0a0a12] text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="visible">
      <Toaster theme="dark" />

      {/* Top navigation tabs */}
      <div className="flex items-center gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit overflow-x-auto">
        {[
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "exams", label: "Exams", icon: FileText },
          { id: "certificates", label: "Certificates", icon: Award },
          { id: "settings", label: "Settings", icon: Settings },
        ].map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              tab === t.id ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {tab === t.id && (
              <motion.div layoutId="tab-bg" className="absolute inset-0 bg-white/[0.08] rounded-lg" />
            )}
            <t.icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{t.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {tab === "dashboard" && (
          <motion.div key="dashboard" variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

            {/* Hero */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0c0c1a] via-[#0a0a12] to-[#0c0c1a] p-6 lg:p-8">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-cyan-400/5 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-violet-400/5 blur-3xl" />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3 mb-4">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                  >
                    <GraduationCap className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <div className="text-[10px] tracking-[0.2em] text-cyan-400/60 uppercase font-mono">Student Dashboard</div>
                    <motion.h1 initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                      className="text-xl font-semibold mt-0.5"
                    >
                      Welcome back, {displayName.split(" ")[0]}!
                    </motion.h1>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-xs text-white/30">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </div>
              </div>
              <p className="text-sm text-white/40 max-w-md">Enter a PIN to start an exam, or explore your progress below.</p>
            </motion.div>

            {/* Stats row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard icon={Zap} label="Total XP" value={String(points)} sub={`${progress}% to Lv.${level + 1}`} color="from-cyan-400 to-blue-500" />
              <StatCard icon={Flame} label="Day Streak" value={String(streak)} sub="days" color="from-amber-400 to-orange-500" />
              <StatCard icon={Trophy} label="Passed" value={String(passedCount)} sub="exams" color="from-emerald-400 to-teal-500" />
              <StatCard icon={TrendingUp} label="Avg. Score" value={avgScore ? `${avgScore}%` : "—"} sub={avgScore ? "overall" : "no data"} color="from-violet-400 to-purple-500" />
            </motion.div>

            {/* Level + PIN + Daily Goals row */}
            <motion.div variants={itemVariants} className="grid lg:grid-cols-5 gap-5">
              {/* Level ring */}
              <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
                <h2 className="text-sm font-semibold text-white/70 mb-4">Level Progress</h2>
                <div className="flex flex-col items-center">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="mb-3">
                    <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                    <motion.circle cx="70" cy="70" r="60" fill="none" stroke="url(#levelGrad)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 60}`}
                      initial={{ strokeDashoffset: `${2 * Math.PI * 60}` }}
                      animate={{ strokeDashoffset: `${2 * Math.PI * 60 * (1 - progress / 100)}` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      transform="rotate(-90 70 70)"
                    />
                    <defs>
                      <linearGradient id="levelGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                    </defs>
                    <text x="70" y="64" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">Lv.{level}</text>
                    <text x="70" y="84" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="10">{points} / {nextLevelPoints} XP</text>
                  </svg>
                  <div className="flex items-center justify-center gap-3 text-xs text-white/40">
                    <div className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> {passedCount} passed</div>
                    <div className="flex items-center gap-1"><BookOpen className="w-3 h-3 text-cyan-400" /> {history.length} total</div>
                  </div>
                </div>
              </div>

              {/* PIN + Daily Goals */}
              <div className="lg:col-span-3 space-y-4">
                {/* PIN card */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0">
                      <KeyRound className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">Start an Exam</h2>
                      <p className="text-xs text-white/40">Enter the 6-digit PIN from your teacher</p>
                    </div>
                  </div>
                  <form onSubmit={handlePinSubmit} className="flex flex-col sm:flex-row items-end gap-4">
                    <div className="flex gap-2 flex-1">
                      {pinDigits.map((d, i) => (
                        <input key={i} inputMode="numeric" maxLength={1} value={d}
                          onChange={(e) => {
                            const v = e.target.value.replace(/\D/g, "").slice(-1);
                            const next = [...pinDigits]; next[i] = v; setPinDigits(next);
                            if (v && i < 5) document.getElementById(`sp-${i+1}`)?.focus();
                          }}
                          onKeyDown={(e) => { if (e.key === "Backspace" && !d && i > 0) document.getElementById(`sp-${i-1}`)?.focus(); }}
                          id={`sp-${i}`}
                          className="w-full max-w-[48px] aspect-square text-center text-lg font-mono bg-white/[0.04] border border-white/[0.08] rounded-lg outline-none focus:border-cyan-400/40 transition-all"
                          autoComplete="off"
                        />
                      ))}
                    </div>
                    <button type="submit" disabled={!pinReady || pinLoading}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-medium bg-white text-[#0a0a12] hover:bg-white/90 disabled:opacity-30 transition-all shrink-0"
                    >
                      {pinLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                      {pinLoading ? "Checking..." : "Start"}
                    </button>
                  </form>
                </div>

                {/* Daily Goals */}
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      <h2 className="text-sm font-semibold">Daily Goals</h2>
                    </div>
                    <span className="text-[10px] text-white/40 font-mono">{dailyProgress}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/[0.06] rounded-full mb-3 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${dailyProgress}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    {DAILY_GOALS.map((g) => (
                      <div key={g.id} className="flex items-center gap-2.5 py-1.5">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          g.done ? "bg-cyan-400 border-cyan-400" : "border-white/[0.15]"
                        }`}>
                          {g.done && <CheckCircle2 className="w-3 h-3 text-[#0a0a12]" />}
                        </div>
                        <span className={`text-xs ${g.done ? "text-white/50 line-through" : "text-white/70"}`}>{g.label}</span>
                        <span className="ml-auto text-[10px] text-cyan-400/60 font-mono">+{g.xp} XP</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Gamification: Achievements grid */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-amber-400" />
                  <h2 className="text-sm font-semibold">Achievements</h2>
                </div>
                <span className="text-[10px] text-white/40">{ACHIEVEMENTS.filter((a) => a.unlocked).length}/{ACHIEVEMENTS.length} unlocked</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ACHIEVEMENTS.map((a) => (
                  <div key={a.id} className={`relative rounded-xl p-3 border transition ${
                    a.unlocked ? "border-white/[0.08] bg-white/[0.03]" : "border-white/[0.04] bg-white/[0.01] opacity-40"
                  }`}>
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center mb-2 ${
                      !a.unlocked && "grayscale"
                    }`}>
                      <a.icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="text-xs font-medium text-white/80">{a.title}</div>
                    <div className="text-[10px] text-white/40 mt-0.5">{a.desc}</div>
                    {!a.unlocked && a.progress > 0 && (
                      <div className="mt-2 w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-white/20 rounded-full" style={{ width: `${a.progress * 100}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Progress Roadmap + AI Tutor row */}
            <motion.div variants={itemVariants} className="grid lg:grid-cols-5 gap-5">
              {/* Roadmap */}
              <div className="lg:col-span-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold">Progress Roadmap</h2>
                </div>
                <div className="relative pl-6 space-y-0">
                  {ROADMAP.map((m, i) => (
                    <div key={m.id} className="relative pb-5 last:pb-0">
                      {i < ROADMAP.length - 1 && (
                        <div className={`absolute left-[7px] top-3 w-[1px] h-full ${
                          m.passed ? "bg-emerald-500/40" : "bg-white/[0.06]"
                        }`} />
                      )}
                      <div className={`absolute left-0 top-1.5 w-[15px] h-[15px] rounded-full border-2 ${
                        m.passed
                          ? "bg-emerald-400 border-emerald-400"
                          : "bg-[#0a0a12] border-white/[0.15]"
                      } flex items-center justify-center`}>
                        {m.passed && <CheckCircle2 className="w-3 h-3 text-[#0a0a12]" />}
                      </div>
                      <div className="ml-4">
                        <div className={`text-xs font-medium ${m.passed ? "text-white/80" : "text-white/30"}`}>{m.label}</div>
                        <div className="text-[10px] text-white/30 mt-0.5">
                          {m.date ? new Date(m.date).toLocaleDateString() : "Not yet"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Tutor */}
              <div className="lg:col-span-3 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                      className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center"
                    >
                      <Brain className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
                    </motion.div>
                    <div>
                      <h2 className="text-sm font-semibold">AI Tutor</h2>
                      <p className="text-xs text-white/40">Ask me anything about your subjects</p>
                    </div>
                  </div>
                  <button onClick={() => setAiOpen(!aiOpen)} className="text-xs text-cyan-400/60 hover:text-cyan-400 transition whitespace-nowrap">
                    {aiOpen ? "Close" : "Open chat"}
                  </button>
                </div>

                {/* Quick topics */}
                <div className="flex gap-1.5 flex-wrap mb-3">
                  {quickTopics.map((t) => (
                    <button key={t} onClick={() => { setAiMsg(t); setAiOpen(true); }}
                      className="px-2.5 py-1 rounded-md bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-cyan-300 hover:border-cyan-400/20 transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                {aiOpen && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-3">
                    <div className="max-h-44 overflow-y-auto space-y-2 bg-black/20 rounded-xl p-3 custom-scroll">
                      <AnimatePresence mode="popLayout">
                        {aiChat.length === 0 && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/30 text-center py-4">
                            Start a conversation with your AI assistant
                          </motion.p>
                        )}
                        {aiChat.map((m, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}
                          >
                            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs ${
                              m.role === "user" ? "bg-cyan-400/15 text-cyan-200" : "bg-white/[0.04] text-white/70"
                            }`}>
                              {m.text}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <div className="flex gap-2">
                      <input value={aiMsg} onChange={(e) => setAiMsg(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendAiMsg()}
                        placeholder="Ask anything..." className="flex-1 h-9 px-3 text-xs rounded-lg bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-400/40 transition-colors"
                      />
                      <motion.button whileTap={{ scale: 0.95 }} onClick={sendAiMsg}
                        className="px-3 py-1.5 rounded-lg bg-white text-[#0a0a12] text-xs font-medium hover:bg-white/90 transition whitespace-nowrap"
                      >
                        Send
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Smart Reminders */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-amber-400/15 bg-gradient-to-br from-amber-400/5 via-transparent to-transparent p-5">
              <div className="flex items-center gap-2 mb-4">
                <BellRing className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold">Smart Reminders</h2>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center shrink-0">
                    <BookMarked className="w-4 h-4 text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/80">Pending Review</div>
                    <div className="text-[10px] text-white/40 mt-0.5">3 topics to review this week</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0">
                    <ScrollText className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/80">Upcoming Exam</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Mathematics — Friday 10:00</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-xl bg-white/[0.03] border border-white/[0.06] p-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-400/10 border border-violet-400/20 flex items-center justify-center shrink-0">
                    <Lightbulb className="w-4 h-4 text-violet-300" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-white/80">Study Tip</div>
                    <div className="text-[10px] text-white/40 mt-0.5">Review your last 3 incorrect answers</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Exam history preview */}
            <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-white/40" />
                  <h2 className="text-sm font-semibold">Exam History</h2>
                </div>
                <button onClick={() => setTab("exams")} className="text-xs text-cyan-400/60 hover:text-cyan-400">View all</button>
              </div>
              {loadingHistory ? (
                <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-cyan-400" /></div>
              ) : history.length === 0 ? (
                <div className="py-10 text-center">
                  <BookOpen className="w-8 h-8 mx-auto text-white/20 mb-2" />
                  <p className="text-sm text-white/50">No exam history yet</p>
                  <p className="text-xs text-white/30 mt-1">Use a PIN from your teacher to start your first exam.</p>
                </div>
              ) : (
                <div className="divide-y divide-white/[0.04]">
                  {history.slice(0, 5).map((h) => (
                    <div key={h.id} className="flex items-center gap-3 px-6 py-3 hover:bg-white/[0.01] transition">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                        h.passed === true ? "bg-emerald-500/15 text-emerald-300" :
                        h.passed === false ? "bg-pink-500/15 text-pink-300" :
                        "bg-white/5 text-white/40"
                      }`}>
                        {h.passed === true ? <CheckCircle2 className="w-4 h-4" /> :
                         h.passed === false ? <XCircle className="w-4 h-4" /> :
                         <Clock className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{h.exam_title}</div>
                        <div className="text-[11px] text-white/40">
                          {new Date(h.started_at).toLocaleDateString()}
                          {h.score != null && <> · {h.score}/{h.max_score} ({h.percent}%)</>}
                        </div>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        h.status === "submitted" ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/25" :
                        h.status === "in_progress" ? "text-amber-300 bg-amber-500/10 border-amber-400/25" :
                        "text-white/30 bg-white/5 border-white/10"
                      }`}>
                        {h.status === "submitted" ? "Completed" : h.status === "in_progress" ? "In progress" : h.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {tab === "exams" && (
          <motion.div key="exams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-lg font-semibold">All Exams</h2>
            {history.length === 0 ? (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
                <BookOpen className="w-10 h-10 mx-auto text-white/20 mb-3" />
                <p className="text-sm text-white/50">No exams yet</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
                {history.map((h) => (
                  <div key={h.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.01] transition">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      h.passed === true ? "bg-emerald-500/15 text-emerald-300" :
                      h.passed === false ? "bg-pink-500/15 text-pink-300" :
                      "bg-white/5 text-white/40"
                    }`}>
                      {h.passed === true ? <CheckCircle2 className="w-5 h-5" /> :
                       h.passed === false ? <XCircle className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{h.exam_title}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {new Date(h.started_at).toLocaleDateString()} · {h.score != null ? `${h.score}/${h.max_score} (${h.percent}%)` : "Not scored"}
                      </div>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                      h.status === "submitted" ? "text-emerald-300 bg-emerald-500/10 border-emerald-400/25" :
                      h.status === "in_progress" ? "text-amber-300 bg-amber-500/10 border-amber-400/25" :
                      "text-white/30 bg-white/5 border-white/10"
                    }`}>
                      {h.status === "submitted" ? "Completed" : h.status === "in_progress" ? "In progress" : h.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {tab === "certificates" && (
          <motion.div key="certificates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-lg font-semibold">Certificates</h2>
            {history.some((h) => h.passed === true) ? (
              <div className="rounded-2xl border border-emerald-400/20 bg-gradient-to-br from-emerald-500/5 to-transparent divide-y divide-white/[0.04]">
                {history.filter((h) => h.passed === true).map((h) => {
                  const serial = generateSerial({
                    attempt_id: h.id,
                    exam_title: h.exam_title,
                    student_name: displayName,
                    score: h.score ?? 0,
                    max_score: h.max_score ?? 0,
                    percent: h.percent ?? 0,
                    passed: true,
                    completed_at: h.started_at,
                  });
                  return (
                    <div key={h.id} className="flex items-center gap-4 px-6 py-4">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center">
                        <Award className="w-5 h-5 text-emerald-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium">{h.exam_title}</div>
                        <div className="text-xs text-white/40 font-mono mt-0.5">{serial}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => downloadCertPdf({
                          attempt_id: h.id, exam_title: h.exam_title, student_name: displayName,
                          score: h.score ?? 0, max_score: h.max_score ?? 0, percent: h.percent ?? 0,
                          passed: true, completed_at: h.started_at,
                        }, serial)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-900 text-xs font-semibold transition"
                        >
                          <Download className="w-3.5 h-3.5" /> PDF
                        </button>
                        <Link to={`/verify/${serial}`} target="_blank" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/50 transition">
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center">
                <Award className="w-10 h-10 mx-auto text-white/20 mb-3" />
                <p className="text-sm text-white/50">No certificates yet</p>
                <p className="text-xs text-white/30 mt-1">Pass an exam to earn your first certificate.</p>
              </div>
            )}
          </motion.div>
        )}

        {tab === "settings" && (
          <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <h2 className="text-lg font-semibold">Settings</h2>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-4">
              <div>
                <label className="text-xs text-white/40 block mb-1">Name</label>
                <div className="text-sm text-white/80">{displayName}</div>
              </div>
              <div>
                <label className="text-xs text-white/40 block mb-1">Email</label>
                <div className="text-sm text-white/80">{user?.email || "—"}</div>
              </div>
              <button onClick={handleLogout} className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-pink-400/70 bg-pink-400/10 rounded-lg hover:bg-pink-400/20 transition">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub: string; color: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const numValue = parseInt(value) || 0;

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const step = Math.max(1, Math.floor(numValue / 30));
    const timer = setInterval(() => {
      start += step;
      if (start >= numValue) {
        setDisplayValue(numValue);
        clearInterval(timer);
      } else {
        setDisplayValue(start);
      }
    }, duration / 30);
    return () => clearInterval(timer);
  }, [numValue]);

  return (
    <motion.div whileHover={{ y: -2 }} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 hover:border-white/[0.12] transition">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="text-xl font-semibold font-mono">{value.includes("%") ? value : displayValue || value}</div>
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-[10px] text-white/20 mt-0.5">{sub}</div>
    </motion.div>
  );
}
