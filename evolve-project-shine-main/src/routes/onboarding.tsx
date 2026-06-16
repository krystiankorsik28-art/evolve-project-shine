import { useState, useEffect } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, User, Target, BookOpen, BarChart3, Calendar, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2, GraduationCap, Zap, Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/onboarding")({
  component: OnboardingPage,
  head: () => ({ meta: [{ title: "Welcome — EduNex" }] }),
});

const STEPS = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "goals", icon: Target, label: "Goals" },
  { id: "subjects", icon: BookOpen, label: "Subjects" },
  { id: "level", icon: BarChart3, label: "Level" },
  { id: "schedule", icon: Calendar, label: "Schedule" },
  { id: "ready", icon: CheckCircle2, label: "Ready" },
];

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "Literature", "Computer Science", "Art", "Music", "Languages", "Economics"];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [avatar, setAvatar] = useState<number>(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [level, setLevel] = useState<string>("");
  const [schedule, setSchedule] = useState<string[]>([]);
  const [timePerDay, setTimePerDay] = useState("30");

  const avatars = ["#06b6d4", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate({ to: "/auth/student" }); return; }
      setUser(data.user);
      const meta = data.user.user_metadata || {};
      setFname(meta.first_name || "");
      setLname(meta.last_name || "");
    });
  }, [navigate]);

  const complete = async () => {
    setBusy(true);
    await supabase.auth.updateUser({
      data: {
        onboarding_completed: true,
        avatar_color: avatars[avatar],
        learning_goals: goals,
        subjects,
        skill_level: level,
        schedule_days: schedule,
        time_per_day: timePerDay,
      },
    });
    await new Promise((r) => setTimeout(r, 500));
    setBusy(false);
    toast.success("Welcome to EduNex!");
    navigate({ to: "/student/dashboard" });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return fname.trim().length > 0;
      case 1: return goals.length > 0;
      case 2: return subjects.length > 0;
      case 3: return level !== "";
      case 4: return schedule.length > 0;
      default: return true;
    }
  };

  const toggleGoal = (g: string) => {
    setGoals((p) => p.includes(g) ? p.filter((x) => x !== g) : [...p, g]);
  };

  const toggleSubject = (s: string) => {
    setSubjects((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  };

  const toggleDay = (d: string) => {
    setSchedule((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);
  };

  if (!user) {
    return <div className="min-h-screen bg-[#0a0a12] flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-cyan-400" /></div>;
  }

  return (
    <div className="min-h-screen bg-[#0a0a12] text-white flex flex-col">
      <Toaster theme="dark" />

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-semibold">EduNex</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30">
          <span>Step {step + 1} of 6</span>
          <button onClick={() => navigate({ to: "/student/dashboard" })} className="text-cyan-400/60 hover:text-cyan-400 ml-2">Skip</button>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-center gap-3 px-6 py-6">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
              i === step ? "bg-cyan-400 text-[#0a0a12]" : i < step ? "bg-emerald-500/20 text-emerald-400" : "bg-white/[0.04] text-white/30"
            }`}>
              {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            {i < STEPS.length - 1 && <div className={`w-12 h-0.5 rounded ${i < step ? "bg-emerald-500/40" : "bg-white/[0.06]"}`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-16">
        <div className="w-full max-w-lg">
          {step === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Welcome to EduNex</h1>
                <p className="text-sm text-white/40 mt-1">Let&apos;s set up your profile</p>
              </div>
              <div className="flex items-center justify-center gap-3">
                {avatars.map((c, i) => (
                  <button key={c} onClick={() => setAvatar(i)}
                    className={`w-12 h-12 rounded-full transition-all ${avatar === i ? "ring-2 ring-white ring-offset-2 ring-offset-[#0a0a12] scale-110" : "opacity-50 hover:opacity-80"}`}
                    style={{ background: c }}
                  />
                ))}
              </div>
              <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="First name" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
              <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Last name" className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 outline-none focus:border-cyan-500/40 transition-colors" />
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">What are your goals?</h1>
                <p className="text-sm text-white/40 mt-1">Select all that apply</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Improve grades", "Prepare for exams", "Learn new subjects", "Build skills", "Get certified", "Track progress"].map((g) => (
                  <button key={g} onClick={() => toggleGoal(g)}
                    className={`p-4 rounded-xl text-sm text-left border transition-all ${
                      goals.includes(g) ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/[0.08] bg-white/[0.02] text-white/70 hover:border-white/20"
                    }`}
                  >
                    <div className="font-medium">{g}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Choose your subjects</h1>
                <p className="text-sm text-white/40 mt-1">Pick the subjects you&apos;re studying</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <button key={s} onClick={() => toggleSubject(s)}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                      subjects.includes(s) ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Your skill level</h1>
                <p className="text-sm text-white/40 mt-1">How would you describe yourself?</p>
              </div>
              <div className="space-y-3">
                {[
                  { id: "beginner", label: "Beginner", desc: "New to these subjects", icon: GraduationCap },
                  { id: "intermediate", label: "Intermediate", desc: "Some knowledge, room to grow", icon: Zap },
                  { id: "advanced", label: "Advanced", desc: "Confident and ready for challenges", icon: Trophy },
                ].map((opt) => (
                  <button key={opt.id} onClick={() => setLevel(opt.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                      level === opt.id ? "border-cyan-400/40 bg-cyan-400/10" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${level === opt.id ? "bg-cyan-400 text-[#0a0a12]" : "bg-white/[0.04] text-white/40"}`}>
                      <opt.icon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{opt.label}</div>
                      <div className="text-xs text-white/40">{opt.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold">Your schedule</h1>
                <p className="text-sm text-white/40 mt-1">When do you study?</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <button key={d} onClick={() => toggleDay(d)}
                    className={`flex-1 min-w-[70px] py-3 rounded-xl text-sm border transition-all ${
                      schedule.includes(d) ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <label className="text-xs text-white/40">Minutes per day</label>
                <div className="flex gap-2">
                  {["15", "30", "45", "60", "90", "120"].map((t) => (
                    <button key={t} onClick={() => setTimePerDay(t)}
                      className={`flex-1 py-3 rounded-xl text-sm border transition-all ${
                        timePerDay === t ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                      }`}
                    >
                      {t}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold">You&apos;re all set!</h1>
              <p className="text-sm text-white/40 max-w-sm mx-auto">
                Your profile is ready. Start exploring exams, tracking progress, and achieving your goals with EduNex.
              </p>
              <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl p-4 space-y-2 text-left">
                <div className="flex justify-between text-sm"><span className="text-white/40">Name</span><span>{fname} {lname}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/40">Goals</span><span>{goals.length} selected</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/40">Subjects</span><span>{subjects.length} selected</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/40">Level</span><span className="capitalize">{level}</span></div>
                <div className="flex justify-between text-sm"><span className="text-white/40">Schedule</span><span>{schedule.length}d · {timePerDay}m/day</span></div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/[0.06] px-6 py-4 flex items-center justify-between">
        <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-white/50 hover:text-white disabled:opacity-30 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        {step < 5 ? (
          <button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 disabled:opacity-30 transition"
          >
            Continue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button onClick={complete} disabled={busy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium bg-white text-[#0a0a12] rounded-lg hover:bg-white/90 disabled:opacity-30 transition"
          >
            {busy ? "Setting up..." : "Start learning"} {!busy && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        )}
      </div>
    </div>
  );
}
