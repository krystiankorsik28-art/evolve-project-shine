import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Users, FileText, Award, Bell, Download,
  BarChart3, Clock, CheckCircle2, XCircle, Loader2,
  TrendingUp, GraduationCap, BookOpen, CalendarDays,
  AlertCircle, UserCheck, Mail, Phone, MapPin,
  ChevronRight, Search, Filter, Settings, LogOut,
  Sparkles, Trophy, Star, Activity, Eye,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_authenticated/parent")({
  component: ParentDashboard,
  head: () => ({ meta: [{ title: "Panel rodzica | EduNex" }] }),
});

type ChildSummary = {
  id: string;
  name: string;
  class: string;
  school: string;
  avatar: string;
  avgScore: number;
  examsPassed: number;
  examsTotal: number;
  attendance: number;
  streak: number;
};

type ExamResult = {
  id: string;
  exam_title: string;
  subject: string;
  score: number;
  max_score: number;
  percent: number;
  passed: boolean;
  date: string;
};

type Alert = {
  id: string;
  type: "warning" | "info" | "success" | "danger";
  message: string;
  date: string;
  child: string;
};

const MOCK_CHILDREN: ChildSummary[] = [
  { id: "c1", name: "Kacper Korsik", class: "8A", school: "Szkoła Podstawowa nr 3", avatar: "KK", avgScore: 78, examsPassed: 12, examsTotal: 15, attendance: 94, streak: 5 },
  { id: "c2", name: "Zuzanna Korsik", class: "5B", school: "Szkoła Podstawowa nr 3", avatar: "ZK", avgScore: 92, examsPassed: 8, examsTotal: 9, attendance: 98, streak: 12 },
];

const MOCK_EXAMS: ExamResult[] = [
  { id: "e1", exam_title: "Matematyka — Ułamki", subject: "Matematyka", score: 18, max_score: 20, percent: 90, passed: true, date: "2025-06-15" },
  { id: "e2", exam_title: "Język Polski — Lektury", subject: "Język Polski", score: 14, max_score: 20, percent: 70, passed: true, date: "2025-06-12" },
  { id: "e3", exam_title: "Fizyka — Ruch", subject: "Fizyka", score: 8, max_score: 15, percent: 53, passed: false, date: "2025-06-10" },
  { id: "e4", exam_title: "Angielski — Grammar", subject: "Język Angielski", score: 19, max_score: 20, percent: 95, passed: true, date: "2025-06-08" },
  { id: "e5", exam_title: "Chemia — Pierwiastki", subject: "Chemia", score: 16, max_score: 20, percent: 80, passed: true, date: "2025-06-05" },
  { id: "e6", exam_title: "Biologia — Komórki", subject: "Biologia", score: 12, max_score: 15, percent: 80, passed: true, date: "2025-06-03" },
  { id: "e7", exam_title: "Historia — II Wojna", subject: "Historia", score: 10, max_score: 20, percent: 50, passed: false, date: "2025-06-01" },
];

const MOCK_ALERTS: Alert[] = [
  { id: "a1", type: "warning", message: "Kacper — niska frekwencja z matematyki (68%)", date: "2025-06-20", child: "Kacper" },
  { id: "a2", type: "success", message: "Zuzanna — poprawa wyniku z angielskiego o 15%!", date: "2025-06-19", child: "Zuzanna" },
  { id: "a3", type: "info", message: "Nowy sprawdzian z chemii — 27 czerwca", date: "2025-06-18", child: "Kacper" },
  { id: "a4", type: "danger", message: "Kacper — nieobecność na sprawdzianie z fizyki", date: "2025-06-17", child: "Kacper" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 200, damping: 20 } },
};

const weekDays = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];

function ParentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ email?: string; name?: string } | null>(null);
  const [checking, setChecking] = useState(true);
  const [selectedChild, setSelectedChild] = useState<string>("all");
  const [activeView, setActiveView] = useState<"overview" | "exams" | "attendance" | "alerts">("overview");

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate({ to: "/auth" }); return; }
      setUser({
        email: session.user.email,
        name: session.user.user_metadata?.first_name
          ? `${session.user.user_metadata.first_name} ${session.user.user_metadata.last_name || ""}`
          : session.user.email,
      });
      setChecking(false);
    };
    check();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const filteredChildren = selectedChild === "all"
    ? MOCK_CHILDREN
    : MOCK_CHILDREN.filter((c) => c.id === selectedChild);

  const allExams = MOCK_EXAMS;
  const passedExams = allExams.filter((e) => e.passed);
  const failedExams = allExams.filter((e) => !e.passed);
  const avgAllScore = Math.round(allExams.reduce((a, e) => a + e.percent, 0) / allExams.length);

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

      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-cyan-400/60 uppercase font-mono mb-1">Parent Dashboard</div>
          <h1 className="text-xl font-semibold">Control Center</h1>
          <p className="text-sm text-white/40 mt-0.5">Monitor progress, attendance, and results for your children.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={logout} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white/50 hover:text-white transition">
            <LogOut className="w-3.5 h-3.5" /> Sign out
          </button>
        </div>
      </motion.div>

      {/* Child selector */}
      <motion.div variants={itemVariants} className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setSelectedChild("all")}
          className={`shrink-0 px-4 py-2 rounded-xl text-xs font-medium border transition ${
            selectedChild === "all"
              ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-300"
              : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:text-white/70"
          }`}
        >
          <Users className="w-3.5 h-3.5 inline mr-1.5" />All Children
        </button>
        {MOCK_CHILDREN.map((c) => (
          <button key={c.id} onClick={() => setSelectedChild(c.id)}
            className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border transition ${
              selectedChild === c.id
                ? "bg-cyan-400/10 border-cyan-400/30 text-cyan-300"
                : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:text-white/70"
            }`}
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[8px] font-bold text-white">
              {c.avatar}
            </div>
            {c.name.split(" ")[0]}
          </button>
        ))}
      </motion.div>

      {/* Sub-nav */}
      <motion.div variants={itemVariants} className="flex items-center gap-1 mb-6 bg-white/[0.03] rounded-xl p-1 border border-white/[0.06] w-fit">
        {[
          { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
          { id: "exams" as const, label: "Results", icon: FileText },
          { id: "attendance" as const, label: "Attendance", icon: CalendarDays },
          { id: "alerts" as const, label: "Alerts", icon: Bell },
        ].map((v) => (
          <button key={v.id} onClick={() => setActiveView(v.id)}
            className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition ${
              activeView === v.id ? "text-white" : "text-white/40 hover:text-white/70"
            }`}
          >
            {activeView === v.id && <motion.div layoutId="parent-tab" className="absolute inset-0 bg-white/[0.08] rounded-lg" />}
            <v.icon className="w-3.5 h-3.5 relative z-10" />
            <span className="relative z-10">{v.label}</span>
          </button>
        ))}
      </motion.div>

      {activeView === "overview" && (
        <motion.div key="overview" variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">

          {/* Children summary cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {filteredChildren.map((child, ci) => (
              <motion.div key={child.id} variants={itemVariants} custom={ci}
                className="rounded-2xl border border-white/[0.06] bg-gradient-to-br from-[#0c0c1a] to-[#0a0a12] p-5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white">
                    {child.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{child.name}</div>
                    <div className="text-xs text-white/40">{child.class} · {child.school}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <div className="text-lg font-semibold text-emerald-400">{child.avgScore}%</div>
                    <div className="text-[10px] text-white/40">Avg Score</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <div className="text-lg font-semibold text-cyan-400">{child.examsPassed}/{child.examsTotal}</div>
                    <div className="text-[10px] text-white/40">Passed</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <div className="text-lg font-semibold text-amber-400">{child.attendance}%</div>
                    <div className="text-[10px] text-white/40">Attendance</div>
                  </div>
                  <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                    <div className="text-lg font-semibold text-violet-400">{child.streak}</div>
                    <div className="text-[10px] text-white/40">Streak</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Performance chart (mini bar) */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <h2 className="text-sm font-semibold">Recent Performance</h2>
              </div>
              <span className="text-xs text-white/40">Last 7 exams</span>
            </div>
            <div className="space-y-3">
              {allExams.slice(0, 7).map((exam) => (
                <div key={exam.id} className="flex items-center gap-3">
                  <div className="w-20 shrink-0 text-[10px] text-white/40 font-mono">
                    {new Date(exam.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-white/70 truncate">{exam.exam_title}</span>
                      <span className={`text-[10px] font-mono shrink-0 ml-2 ${exam.passed ? "text-emerald-400" : "text-pink-400"}`}>
                        {exam.percent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${exam.percent}%` }}
                        transition={{ duration: 1, delay: 0.1, ease: "easeOut" }}
                        className={`h-full rounded-full ${exam.passed ? "bg-emerald-400" : "bg-pink-400"}`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Alerts preview */}
          <motion.div variants={itemVariants} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold">Recent Alerts</h2>
              </div>
              <button onClick={() => setActiveView("alerts")} className="text-xs text-cyan-400/60 hover:text-cyan-400">View all</button>
            </div>
            <div className="space-y-2">
              {MOCK_ALERTS.slice(0, 3).map((alert) => (
                <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-xl border ${
                  alert.type === "danger" ? "border-pink-400/20 bg-pink-400/5" :
                  alert.type === "warning" ? "border-amber-400/20 bg-amber-400/5" :
                  alert.type === "success" ? "border-emerald-400/20 bg-emerald-400/5" :
                  "border-cyan-400/20 bg-cyan-400/5"
                }`}>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    alert.type === "danger" ? "bg-pink-400/20 text-pink-300" :
                    alert.type === "warning" ? "bg-amber-400/20 text-amber-300" :
                    alert.type === "success" ? "bg-emerald-400/20 text-emerald-300" :
                    "bg-cyan-400/20 text-cyan-300"
                  }`}>
                    <AlertCircle className="w-3 h-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/70">{alert.message}</div>
                    <div className="text-[10px] text-white/30 mt-0.5">{new Date(alert.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}

      {activeView === "exams" && (
        <motion.div key="exams" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-2xl font-semibold font-mono">{allExams.length}</div>
              <div className="text-xs text-white/40">Total Exams</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-2xl font-semibold font-mono text-emerald-400">{passedExams.length}</div>
              <div className="text-xs text-white/40">Passed</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-2xl font-semibold font-mono text-pink-400">{failedExams.length}</div>
              <div className="text-xs text-white/40">Failed</div>
            </div>
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <div className="text-2xl font-semibold font-mono text-cyan-400">{avgAllScore}%</div>
              <div className="text-xs text-white/40">Average</div>
            </div>
          </div>

          {/* Exam list */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] divide-y divide-white/[0.04]">
            {allExams.map((exam) => (
              <div key={exam.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.01] transition">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  exam.passed ? "bg-emerald-500/15 text-emerald-300" : "bg-pink-500/15 text-pink-300"
                }`}>
                  {exam.passed ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{exam.exam_title}</div>
                  <div className="text-xs text-white/40 mt-0.5">{exam.subject} · {new Date(exam.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-semibold font-mono ${exam.passed ? "text-emerald-400" : "text-pink-400"}`}>
                    {exam.percent}%
                  </div>
                  <div className="text-[10px] text-white/30">{exam.score}/{exam.max_score}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Export button */}
          <div className="flex justify-end">
            <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 text-xs font-medium hover:bg-emerald-500/20 transition">
              <Download className="w-3.5 h-3.5" /> Export Results (PDF)
            </button>
          </div>
        </motion.div>
      )}

      {activeView === "attendance" && (
        <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {filteredChildren.map((child) => (
            <div key={child.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                  {child.avatar}
                </div>
                <div>
                  <h3 className="text-sm font-semibold">{child.name}</h3>
                  <p className="text-xs text-white/40">{child.class}</p>
                </div>
                <div className="ml-auto">
                  <div className="text-lg font-semibold font-mono text-emerald-400">{child.attendance}%</div>
                  <div className="text-[10px] text-white/30 text-right">Attendance</div>
                </div>
              </div>

              {/* Week grid */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {weekDays.map((day, i) => (
                  <div key={i} className="text-center">
                    <div className="text-[10px] text-white/30 mb-1">{day}</div>
                    <div className="aspect-square rounded-lg flex items-center justify-center text-xs font-mono bg-emerald-500/20 text-emerald-300">
                      {i + 10}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  Present (18 days)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                  Absent (1 day)
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  Late (1 day)
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {activeView === "alerts" && (
        <motion.div key="alerts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">All Alerts</h2>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {MOCK_ALERTS.length} active
            </div>
          </div>
          <div className="space-y-2">
            {MOCK_ALERTS.map((alert) => (
              <div key={alert.id} className={`rounded-xl border p-4 ${
                alert.type === "danger" ? "border-pink-400/20 bg-pink-400/5" :
                alert.type === "warning" ? "border-amber-400/20 bg-amber-400/5" :
                alert.type === "success" ? "border-emerald-400/20 bg-emerald-400/5" :
                "border-cyan-400/20 bg-cyan-400/5"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    alert.type === "danger" ? "bg-pink-400/20 text-pink-300" :
                    alert.type === "warning" ? "bg-amber-400/20 text-amber-300" :
                    alert.type === "success" ? "bg-emerald-400/20 text-emerald-300" :
                    "bg-cyan-400/20 text-cyan-300"
                  }`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white/80">{alert.message}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-white/30">{new Date(alert.date).toLocaleDateString()}</span>
                      <span className="text-[10px] text-cyan-400/60">{alert.child}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
