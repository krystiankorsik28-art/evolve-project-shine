import { useState, useEffect } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import {
  Sparkles, User, GraduationCap, Building2, BookOpen, BarChart3, BrainCircuit, CheckCircle2,
  ArrowRight, ArrowLeft, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { OnboardingBg } from "@/components/three/OnboardingBg";

export const Route = createFileRoute("/onboarding")({
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth", replace: true });
  },
  component: OnboardingPage,
  head: () => ({ meta: [{ title: "Welcome — EduNex" }] }),
});

const STEPS = [
  { id: "profile", icon: User, label: "Profile" },
  { id: "role", icon: GraduationCap, label: "Role" },
  { id: "school", icon: Building2, label: "School" },
  { id: "workspace", icon: BookOpen, label: "Workspace" },
  { id: "ai", icon: BrainCircuit, label: "AI Setup" },
  { id: "ready", icon: CheckCircle2, label: "Ready" },
];

const ROLES = [
  { id: "student", label: "Student", icon: GraduationCap, desc: "Take exams, learn with AI", color: "neon" },
  { id: "teacher", label: "Teacher", icon: BookOpen, desc: "Create exams, monitor classes", color: "neon-blue" },
  { id: "parent", label: "Parent", icon: User, desc: "Monitor your child's progress", color: "neon-purple" },
  { id: "admin", label: "Admin", icon: Building2, desc: "Manage your school", color: "neon-pink" },
];

const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "History", "Geography", "Literature", "Computer Science", "Art", "Music", "Languages", "Economics"];

const AI_STYLES = [
  { id: "formal", label: "Formal", desc: "Professional, structured explanations" },
  { id: "friendly", label: "Friendly", desc: "Warm, encouraging tone" },
  { id: "creative", label: "Creative", desc: "Visual, story-based learning" },
  { id: "concise", label: "Concise", desc: "Short, direct answers" },
];

function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [avatar, setAvatar] = useState(0);
  const [role, setRole] = useState("");
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

  const avatars = ["#00ff88", "#4488ff", "#8844ff", "#ff4488", "#ffaa00", "#ff6688"];

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { navigate({ to: "/auth", replace: true }); return; }
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
        role,
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
    await new Promise((r) => setTimeout(r, 500));
    setBusy(false);
    toast.success("Welcome to EduNex!");
    const dash = { student: "/student/dashboard", teacher: "/teacher", parent: "/parent/dashboard", admin: "/admin" };
    navigate({ to: dash[role as keyof typeof dash] || "/student/dashboard" });
  };

  const canProceed = () => {
    switch (step) {
      case 0: return fname.trim().length > 0;
      case 1: return role !== "";
      case 2: return createSchool ? schoolName.trim().length > 0 : selectedSchool !== null;
      case 3: return subjects.length > 0 && level !== "";
      case 4: return aiStyle !== "" && aiConsent;
      default: return true;
    }
  };

  const toggleSubject = (s: string) => {
    setSubjects((p) => p.includes(s) ? p.filter((x) => x !== s) : [...p, s]);
  };

  const toggleDay = (d: string) => {
    setSchedule((p) => p.includes(d) ? p.filter((x) => x !== d) : [...p, d]);
  };

  const mockSchools = [
    "Zespół Szkół nr 1 im. Kopernika", "Liceum Ogólnokształcące nr 3",
    "Szkoła Podstawowa nr 5", "Technikum Informatyczne nr 7",
    "EduNex International School", "Akademia Future",
  ];
  const filteredSchools = mockSchools.filter((s) => s.toLowerCase().includes(schoolQuery.toLowerCase()));

  if (!user) {
    return <div className="min-h-screen bg-bg flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-neon" /></div>;
  }

  return (
    <div className="min-h-screen text-white flex flex-col relative">
      <OnboardingBg />
      <Toaster theme="dark" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-black/40 backdrop-blur-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center shadow-[0_0_15px_oklch(0.85_0.18_160_/_0.3)]">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-semibold">EduNex</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <span>Step {step + 1} of 6</span>
            <button onClick={() => complete()} className="text-neon/60 hover:text-neon ml-2">Skip</button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 px-6 py-6">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                i === step ? "bg-neon text-black shadow-[0_0_15px_oklch(0.85_0.18_160_/_0.5)]" : i < step ? "bg-neon/20 text-neon" : "bg-white/[0.04] text-white/30"
              }`}>
                {i < step ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && <div className={`w-12 h-0.5 rounded ${i < step ? "bg-neon/40" : "bg-white/[0.06]"}`} />}
            </div>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center px-6 pb-16">
          <div className="w-full max-w-lg">
            {step === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold neon-text">Welcome to EduNex</h1>
                  <p className="text-sm text-fg-muted mt-1">Let&apos;s set up your profile</p>
                </div>
                <div className="flex items-center justify-center gap-3">
                  {avatars.map((c, i) => (
                    <button key={c} onClick={() => setAvatar(i)}
                      className={`w-12 h-12 rounded-full transition-all ${avatar === i ? "ring-2 ring-neon ring-offset-2 ring-offset-bg scale-110 shadow-[0_0_15px_oklch(0.85_0.18_160_/_0.3)]" : "opacity-50 hover:opacity-80"}`}
                      style={{ background: c }}
                    />
                  ))}
                </div>
                <input type="text" value={fname} onChange={(e) => setFname(e.target.value)} placeholder="First name"
                  className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 focus:shadow-[0_0_10px_oklch(0.85_0.18_160_/_0.1)] transition-all" />
                <input type="text" value={lname} onChange={(e) => setLname(e.target.value)} placeholder="Last name"
                  className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 focus:shadow-[0_0_10px_oklch(0.85_0.18_160_/_0.1)] transition-all" />
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold neon-text">What&apos;s your role?</h1>
                  <p className="text-sm text-fg-muted mt-1">Choose how you&apos;ll use EduNex</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ROLES.map((r) => (
                    <button key={r.id} onClick={() => setRole(r.id)}
                      className={`p-5 rounded-xl border text-left transition-all ${
                        role === r.id
                          ? `border-${r.color}/40 bg-${r.color}/5 shadow-[0_0_15px_oklch(0.85_0.18_160_/_0.1)]`
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.15]"
                      }`}
                    >
                      <r.icon className={`w-6 h-6 mb-2 ${role === r.id ? `text-${r.color}` : "text-white/40"}`} />
                      <div className={`text-sm font-medium ${role === r.id ? "text-white" : "text-white/60"}`}>{r.label}</div>
                      <div className="text-xs text-fg-subtle mt-1">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold neon-text">Your School</h1>
                  <p className="text-sm text-fg-muted mt-1">Find or create your school</p>
                </div>
                {!createSchool ? (
                  <div className="space-y-3">
                    <input type="text" value={schoolQuery} onChange={(e) => setSchoolQuery(e.target.value)} placeholder="Search for your school..."
                      className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 focus:shadow-[0_0_10px_oklch(0.85_0.18_160_/_0.1)] transition-all" />
                    <div className="max-h-40 overflow-y-auto space-y-1">
                      {filteredSchools.map((s) => (
                        <button key={s} onClick={() => setSelectedSchool(s)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-all ${
                            selectedSchool === s ? "bg-neon/10 border border-neon/30 text-neon" : "border border-white/[0.04] text-white/60 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <button onClick={() => setCreateSchool(true)} className="text-xs text-neon/60 hover:text-neon transition-colors">
                      Can&apos;t find your school? Create one
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input type="text" value={schoolName} onChange={(e) => setSchoolName(e.target.value)} placeholder="School name"
                      className="w-full h-11 px-4 text-sm rounded-xl bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-fg-subtle outline-none focus:border-neon/40 transition-all" />
                    <button onClick={() => setCreateSchool(false)} className="text-xs text-neon/60 hover:text-neon transition-colors">
                      Search existing schools
                    </button>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold neon-text">Set up your workspace</h1>
                  <p className="text-sm text-fg-muted mt-1">Choose subjects and your level</p>
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-2">Subjects</p>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button key={s} onClick={() => toggleSubject(s)}
                        className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                          subjects.includes(s) ? "border-neon/40 bg-neon/10 text-neon" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-2">Your level</p>
                  <div className="space-y-2">
                    {[
                      { id: "beginner", label: "Beginner", desc: "New to these subjects" },
                      { id: "intermediate", label: "Intermediate", desc: "Some knowledge, room to grow" },
                      { id: "advanced", label: "Advanced", desc: "Confident and ready for challenges" },
                    ].map((opt) => (
                      <button key={opt.id} onClick={() => setLevel(opt.id)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                          level === opt.id ? "border-neon/40 bg-neon/10" : "border-white/[0.08] bg-white/[0.02] hover:border-white/20"
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${level === opt.id ? "bg-neon text-black" : "bg-white/[0.04] text-white/40"}`}>
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm font-medium">{opt.label}</div>
                          <div className="text-xs text-fg-muted">{opt.desc}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-2">Study schedule</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                      <button key={d} onClick={() => toggleDay(d)}
                        className={`flex-1 min-w-[70px] py-2.5 rounded-xl text-sm border transition-all ${
                          schedule.includes(d) ? "border-neon/40 bg-neon/10 text-neon" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    {["15", "30", "45", "60", "90", "120"].map((t) => (
                      <button key={t} onClick={() => setTimePerDay(t)}
                        className={`flex-1 py-2.5 rounded-xl text-sm border transition-all ${
                          timePerDay === t ? "border-neon/40 bg-neon/10 text-neon" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                        }`}
                      >
                        {t}m
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold neon-text">AI Tutor Setup</h1>
                  <p className="text-sm text-fg-muted mt-1">Personalize your AI learning experience</p>
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-2">AI Language</p>
                  <div className="flex gap-2">
                    {[
                      { id: "pl", label: "Polish", flag: "🇵🇱" },
                      { id: "en", label: "English", flag: "🇬🇧" },
                      { id: "uk", label: "Ukrainian", flag: "🇺🇦" },
                    ].map((l) => (
                      <button key={l.id} onClick={() => setAiLang(l.id)}
                        className={`flex-1 py-3 rounded-xl text-sm border transition-all ${
                          aiLang === l.id ? "border-neon/40 bg-neon/10 text-neon" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                        }`}
                      >
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-fg-muted mb-2">AI Response Style</p>
                  <div className="grid grid-cols-2 gap-2">
                    {AI_STYLES.map((s) => (
                      <button key={s.id} onClick={() => setAiStyle(s.id)}
                        className={`p-4 rounded-xl text-sm border text-left transition-all ${
                          aiStyle === s.id ? "border-neon/40 bg-neon/10 text-neon" : "border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/20"
                        }`}
                      >
                        <div className="font-medium mb-1">{s.label}</div>
                        <div className="text-[10px] text-fg-muted">{s.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={aiConsent} onChange={(e) => setAiConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-white/20 bg-white/[0.04] text-neon focus:ring-neon/40" />
                  <span className="text-xs text-fg-muted">
                    I agree to AI processing of my learning data to provide personalized tutoring
                  </span>
                </label>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6 text-center">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-neon to-neon-blue flex items-center justify-center shadow-[0_0_30px_oklch(0.85_0.18_160_/_0.3)]">
                  <CheckCircle2 className="w-10 h-10 text-black" />
                </div>
                <h1 className="text-2xl font-bold neon-text">You&apos;re all set!</h1>
                <p className="text-sm text-fg-muted max-w-sm mx-auto">
                  Your profile is ready. Let&apos;s start your learning journey with EduNex.
                </p>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 space-y-2 text-left backdrop-blur-sm">
                  <div className="flex justify-between text-sm"><span className="text-fg-muted">Name</span><span>{fname} {lname}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-fg-muted">Role</span><span className="capitalize text-neon">{role}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-fg-muted">School</span><span>{selectedSchool || schoolName || "—"}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-fg-muted">Subjects</span><span>{subjects.length} selected</span></div>
                  <div className="flex justify-between text-sm"><span className="text-fg-muted">Level</span><span className="capitalize">{level}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-fg-muted">AI Style</span><span className="capitalize">{aiStyle}</span></div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-white/[0.06] px-6 py-4 flex items-center justify-between bg-black/40 backdrop-blur-2xl">
          <button onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs text-white/50 hover:text-white disabled:opacity-30 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back
          </button>
          {step < 5 ? (
            <button onClick={() => canProceed() && setStep(step + 1)} disabled={!canProceed()}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium bg-neon text-black rounded-lg hover:bg-neon/90 disabled:opacity-30 transition shadow-[0_0_15px_oklch(0.85_0.18_160_/_0.3)]"
            >
              Continue <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button onClick={complete} disabled={busy}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium bg-neon text-black rounded-lg hover:bg-neon/90 disabled:opacity-30 transition shadow-[0_0_15px_oklch(0.85_0.18_160_/_0.3)]"
            >
              {busy ? "Setting up..." : "Start learning"} {!busy && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
