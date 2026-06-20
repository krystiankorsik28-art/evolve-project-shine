import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import {
  GraduationCap, Users, Shield, ArrowRight, ArrowUpRight, CheckCircle2, BookOpen,
  Mail, Phone, MapPin, Send, Loader2, Menu, X, FileText, ClipboardList,
  Library, BarChart3, Lock, Calendar, Sparkles, Zap, Globe2, Activity,   ShieldCheck, ChevronUp, Code2, Presentation,
  BrainCircuit, Bot, Database, Smartphone, Wifi, Cloud, Download, Upload,
  Timer, Clock, Award, Medal, Star, Trophy, Target, Eye,
  Search, Filter, LayoutDashboard, Share2, Github,
  School, BookMarked, MessageSquare,
  DollarSign, BadgeCheck, Verified, Monitor,
  Laptop, Rocket, Flag, Compass, PenTool,
  ArrowLeft, Play, ChevronRight, ChevronDown, Plus, Tablet, Headphones, Bell,
  Lightbulb, Cable, Workflow, GripVertical, Puzzle, ScrollText, Heart, KeyRound, Video,
  Infinity, Computer, Notebook, Radio, GitBranch,
  ScanFace, Building2, Scale, Fingerprint, Tv, Globe, Paintbrush,
  SmartphoneNfc, Sun, Moon, Palette,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { submitContact } from "@/lib/contact.functions";
import { NexaPayCheckout } from "@/components/NexaPayCheckout";
import IntroAnimation from "@/components/IntroAnimation";
import NavBar2 from "@/components/landing/NavBar2";
import HeroSection from "@/components/landing/HeroSection";
import StatsSection from "@/components/landing/StatsSection";
import HowItWorksSection from "@/components/landing/HowItWorks";
import FinalCTA from "@/components/landing/FinalCTA";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import PricingSection from "@/components/landing/PricingSection";
import FeaturesSection from "@/components/landing/FeaturesSection";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "EduNex — Globalna platforma edukacyjna nowej generacji z AI" },
      { name: "description", content: "EduNex — globalna platforma edukacyjna nowej generacji. Egzaminy online, AI Tutor, kursy, certyfikacja i zarządzanie szkołami. Dla uczniów, nauczycieli, szkół i firm na całym świecie." },
    ],
  }),
});

/* ──── Confetti ──── */
function burstConfetti(e: React.MouseEvent) {
  const colors = ["#22d3ee", "#06b6d4", "#0891b2", "#67e8f9", "#22d3ee", "#06b6d4"];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement("div");
    el.className = "confetti-piece";
    const color = colors[Math.floor(Math.random() * colors.length)];
    el.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;width:${4 + Math.random() * 4}px;height:${4 + Math.random() * 4}px;background:${color};animation-delay:${Math.random() * 0.2}s;animation-duration:${1.2 + Math.random() * 0.8}s`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2500);
  }
}

/* ──── Ripple ──── */
function addRipple(e: React.MouseEvent) {
  const t = e.currentTarget as HTMLElement;
  const r = document.createElement("span");
  r.className = "ripple-effect";
  const rect = t.getBoundingClientRect();
  r.style.left = `${e.clientX - rect.left}px`;
  r.style.top = `${e.clientY - rect.top}px`;
  t.appendChild(r);
  setTimeout(() => r.remove(), 700);
}

/* ──── Text Reveal ──── */
function TextReveal({ text, className = "" }: { text: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setRevealed(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <span ref={ref} className={className} style={{ display: "inline" }}>
      {text.split(" ").map((w, i) => (
        <span key={i} className="inline-block" style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0) rotate(0deg)" : "translateY(40px) rotate(4deg)",
          transition: `opacity 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s, transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i * 0.06}s`
        }}>
          {w}{i < text.split(" ").length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </span>
  );
}

/* ──── Particle Background ──── */
function Landing() {
  const { setTheme } = useTheme();
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setTheme("dark") }, []);

  /* ──── IntersectionObserver with stagger ──── */
  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          const children = e.target.querySelectorAll(".stagger-item");
          children.forEach((c, i) => {
            const delay = Math.min(i, 12);
            (c as HTMLElement).style.transitionDelay = `${delay * 0.06}s`;
          });
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -60px 0px" });
    setTimeout(() => {
      document.querySelectorAll(".reveal, .reveal-scale, .reveal-left, .reveal-right").forEach((el) => obs.observe(el));
      if (document.documentElement.getBoundingClientRect().top > -200) {
        document.querySelectorAll(".reveal, .reveal-scale, .reveal-left, .reveal-right").forEach((el) => {
          if (el.getBoundingClientRect().top < window.innerHeight + 200) el.classList.add("revealed");
        });
      }
    }, 100);
    return () => obs.disconnect();
  }, []);

  /* ──── Scroll Progress ──── */
  const progRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const f = () => {
      if (!progRef.current) return;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      progRef.current.style.transform = `scaleX(${Math.min(window.scrollY / h, 1)})`;
    };
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);

  /* ──── Cursor Glow ──── */
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const f = (e: MouseEvent) => {
      if (!glowRef.current) return;
      glowRef.current.style.left = `${e.clientX}px`;
      glowRef.current.style.top = `${e.clientY}px`;
    };
    window.addEventListener("mousemove", f, { passive: true });
    return () => window.removeEventListener("mousemove", f);
  }, []);

  /* ──── Magnetic Buttons ──── */
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const btns = document.querySelectorAll<HTMLElement>(".magnetic-btn");
    const f = (e: MouseEvent) => {
      const btn = e.currentTarget as HTMLElement;
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2) * 0.15;
      const y = (e.clientY - r.top - r.height / 2) * 0.15;
      btn.style.translate = `${x}px ${y}px`;
    };
    const reset = (e: MouseEvent) => { (e.currentTarget as HTMLElement).style.translate = "0px 0px"; };
    btns.forEach(b => { b.addEventListener("mousemove", f); b.addEventListener("mouseleave", reset); });
    return () => { btns.forEach(b => { b.removeEventListener("mousemove", f); b.removeEventListener("mouseleave", reset); }); };
  }, [loaded]);

  /* ──── Sparkle Trail ──── */
  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    let timeout: ReturnType<typeof setTimeout>;
    const f = (e: MouseEvent) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const s = document.createElement("div");
        s.className = "sparkle";
        s.style.left = `${e.clientX}px`; s.style.top = `${e.clientY}px`;
        s.style.background = `oklch(0.75 0.18 ${200 + Math.random() * 130})`;
        document.body.appendChild(s);
        setTimeout(() => s.remove(), 700);
      }, 60);
    };
    window.addEventListener("mousemove", f, { passive: true });
    return () => { window.removeEventListener("mousemove", f); clearTimeout(timeout); };
  }, []);

  return (
    <>
      <IntroAnimation onDone={() => setLoaded(true)} />
      <div className={`min-h-screen bg-canvas selection:bg-accent/30 selection:text-white overflow-x-hidden ${loaded ? "opacity-100" : "opacity-0"} transition-opacity duration-700`}>
        <div ref={progRef} className="scroll-progress" />
        <div ref={glowRef} className="spotlight max-lg:hidden" />
        <Toaster theme="dark" />
        <CookieBanner />
        <NavBar2 />
        <main className="relative z-10">
          <HeroSection />
          <StatsSection />
          <HowItWorksSection />
          <FeaturesSection />
          <DemoShowcase />
          <ForWhomFlow />
          <ComparisonShowcase />
          <AchievementsFlow />
          <AIPlatformFlow />
          <AiDemoShowcase />
          <SecurityFlow />
          <TestimonialsSection />
          <PricingSection />
          <FAQFlow />
          <FinalCTA />
          <NewsletterFlow />
          <ContactFlow />
        </main>
        <StickyCta />
        <FooterFlow />
      </div>
    </>
  );
}

function CookieBanner() {
  const [v, setV] = useState(true);
  useEffect(() => { if (typeof window !== "undefined" && localStorage.getItem("cookies-ok")) setV(false); }, []);
  if (!v) return null;
  return (
    <div className="fixed bottom-0 inset-x-0 z-50 bg-black/70 backdrop-blur-2xl border-t border-white/[0.06] cookie-banner">
      <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-white/50">Używamy plików cookie, aby zapewnić najlepsze doświadczenia.</p>
        <button onClick={() => { localStorage.setItem("cookies-ok", "1"); setV(false) }} className="btn-primary text-xs">Akceptuję</button>
      </div>
    </div>
  );
}






/* ──── FEATURES ──── */

/* ──── DEMO ──── */
const QUIZ_DATA = [
  { q: "Ile wynosi pole kwadratu o boku 5 cm?", opts: [["25 cm²", true], ["20 cm²", false], ["10 cm²", false], ["30 cm²", false]], explain: "Pole = 5 × 5 = 25 cm²" },
  { q: "Która liczba jest podzielna przez 3?", opts: [["124", false], ["327", true], ["401", false], ["550", false]], explain: "3+2+7=12, a 12 dzieli się przez 3" },
  { q: "Jaki jest pierwiastek kwadratowy z 144?", opts: [["10", false], ["14", false], ["12", true], ["16", false]], explain: "12 × 12 = 144" },
];
function DemoShowcase() {
  const [step, setStep] = useState<"start" | "q1" | "q2" | "q3" | "done">("start");
  const [answers, setAnswers] = useState<boolean[]>([false, false, false]);
  const [correct, setCorrect] = useState<boolean | null>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const startTime = useRef(0);
  const qi = step === "q1" ? 0 : step === "q2" ? 1 : step === "q3" ? 2 : 0;
  const qData = step.startsWith("q") ? QUIZ_DATA[qi] : null;
  const score = answers.filter(Boolean).length;
  const pick = (isCorrect: boolean) => {
    const now = Date.now();
    if (startTime.current) setTotalTime((t) => t + (now - startTime.current));
    setCorrect(isCorrect);
    setShowExplain(true);
    setTimeout(() => {
      const newAnswers = [...answers];
      newAnswers[qi] = isCorrect;
      setAnswers(newAnswers);
      setCorrect(null);
      setShowExplain(false);
      if (step === "q1") setStep("q2");
      else if (step === "q2") setStep("q3");
      else if (step === "q3") { setStep("done"); burstConfetti({ clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as React.MouseEvent); }
      startTime.current = Date.now();
    }, 900);
  };
  const restart = () => { setStep("start"); setAnswers([false, false, false]); setCorrect(null); setShowExplain(false); setTotalTime(0); };
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">Demo na żywo</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Rozwiąż mini egzamin" /></h2>
          <p className="mt-3 text-white/40 text-sm">Zobacz jak działa platforma — 3 pytania z matematyki pod presją czasu.</p>
        </div>
        <div className="reveal-scale max-w-xl mx-auto">
          <div className="card-premium rounded-2xl p-8 sm:p-10 relative overflow-hidden">
            {step === "start" && (
              <div className="text-center" style={{ animation: "quizFade 0.4s ease-out" }}>
                <div className="w-20 h-20 mx-auto rounded-[24px] bg-gradient-to-br from-accent to-violet-500 grid place-items-center mb-6 shadow-lg"><Notebook className="w-8 h-8 text-black"/></div>
                <h3 className="text-2xl font-bold">Matematyka — Klasa 6</h3>
                <div className="mt-3 flex justify-center gap-4 text-xs text-white/40">
                  <span className="flex items-center gap-1"><Timer className="w-3.5 h-3.5"/>~30s na pytanie</span>
                  <span className="flex items-center gap-1"><Target className="w-3.5 h-3.5"/>3 pytania</span>
                </div>
                <button onClick={() => { startTime.current = Date.now(); setStep("q1"); }} className="mt-8 btn-shine inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-medium text-sm bg-white text-black hover:bg-white/90 transition-all shadow-sm magnetic-btn">Rozpocznij quiz <Play className="w-4 h-4"/></button>
              </div>
            )}
            {qData && (step === "q1" || step === "q2" || step === "q3") && (
              <div key={step} style={{ animation: "quizFade 0.35s ease-out" }}>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="w-2 h-2 rounded-full bg-accent"/>
                    Pytanie {qi + 1}/3
                  </div>
                  <div className="flex items-center gap-1 text-xs text-white/30 font-mono">
                    <Timer className="w-3 h-3"/> {totalTime > 0 ? `${Math.round(totalTime / 1000)}s` : "00s"}
                  </div>
                </div>
                <div className="flex gap-1 mb-6">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex-1 h-1 rounded-full bg-white/[0.06] overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${i < qi ? "bg-accent" : i === qi && correct === true ? "bg-emerald-400" : i === qi && correct === false ? "bg-rose-400" : i === qi ? "bg-white/20" : ""}`}
                        style={{ width: i === qi ? "100%" : i < qi ? "100%" : "0%" }} />
                    </div>
                  ))}
                </div>
                <p className="text-lg sm:text-xl font-medium text-white/90 leading-relaxed">{qData.q}</p>
                <div className="mt-5 grid gap-2.5">
                  {qData.opts.map(([t, isC]) => {
                    const selected = correct !== null;
                    const isThis = selected && isC;
                    const isWrong = selected && correct === false && isC === false;
                    return (
                      <button key={t as string} disabled={selected}
                        onClick={() => pick(isC as boolean)}
                        className={`text-left px-5 py-3.5 rounded-xl border text-sm transition-all duration-300 ${selected ? (isThis ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : "border-white/[0.04] bg-white/[0.01] text-white/30") : "border-white/[0.06] bg-white/[0.02] text-white/60 hover:border-accent/30 hover:bg-accent/[0.04] hover:text-white hover:scale-[1.01]"}`}>
                        <span className="flex items-center gap-3">
                          {selected && isThis && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                          {selected && !isThis && !isC && <X className="w-4 h-4 text-rose-400/50 shrink-0" />}
                          {t as string}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {showExplain && <div className="mt-4 text-xs text-accent/60 animate-pulse">{qData.explain}</div>}
              </div>
            )}
            {step === "done" && (
              <div className="text-center" style={{ animation: "quizFade 0.5s ease-out" }}>
                <div className="w-24 h-24 mx-auto rounded-[28px] grid place-items-center mb-6 shadow-lg bg-gradient-to-br from-accent to-blue-500"
                  style={{ animation: "splashPulse 1.5s ease-in-out infinite" }}>
                  {score === 3 ? <Award className="w-10 h-10 text-black"/> : score >= 2 ? <Star className="w-10 h-10 text-black"/> : <Target className="w-10 h-10 text-black"/>}
                </div>
                <h3 className="text-2xl font-bold">{score === 3 ? "Perfect! 🎉" : score >= 2 ? "Dobra robota! 👏" : "Spróbuj jeszcze raz 💪"}</h3>
                <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm">
                  <span className="text-white/40">Wynik:</span>
                  <span className={`font-bold font-mono ${score === 3 ? "text-emerald-300" : score >= 2 ? "text-accent" : "text-amber-300"}`}>{score}/3</span>
                </div>
                {totalTime > 0 && <p className="mt-2 text-xs text-white/30 font-mono">Czas: {Math.round(totalTime / 1000)}s</p>}
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button onClick={restart} className="px-6 py-2.5 rounded-full text-sm font-medium border border-white/[0.08] text-white/50 hover:text-white hover:bg-white/[0.04] transition-all">Rozwiąż ponownie</button>
                  <Link to="/auth/teacher" className="btn-shine inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 transition-all shadow-sm">Załóż konto <ArrowRight className="w-4 h-4"/></Link>
                </div>
              </div>
            )}
          </div>
          <div className="mt-4 text-center text-xs text-white/30">W rzeczywistym egzaminie AI sprawdza odpowiedzi otwarte i wykrywa ściąganie.</div>
        </div>
        <style>{`@keyframes quizFade { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div className="mt-16 reveal">
          <div className="card-premium rounded-2xl p-6 sm:p-8">
            <div className="grid lg:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2"><Radio className="w-5 h-5 text-accent"/> Monitoring na żywo</h3>
                <p className="mt-2 text-sm text-white/40">Widzisz postęp każdego ucznia w czasie rzeczywistym. AI wykrywa nieprawidłowości.</p>
                <ul className="mt-4 space-y-2 text-sm text-white/50">
                  {[["Postęp na żywo", "Widzisz kto skończył, a kto utknął"], ["Wykrywanie ściągania", "AI analizuje ruchy myszy i ostrzega"], ["Kontrola zdalna", "Możesz zatrzymać lub przedłużyć egzamin"]].map(([t, d]) => (
                    <li key={t} className="flex gap-2"><span className="grad-dot"/><div><span className="text-white/80">{t}</span> — {d}</div></li>
                  ))}
                </ul>
              </div>
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-accent/5 to-fuchsia-400/5 rounded-3xl blur-xl" />
                <div className="relative rounded-2xl bg-[oklch(0.06_0.03_270)] border border-white/[0.06] overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/[0.06]">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/60"/><span className="w-2.5 h-2.5 rounded-full bg-amber-500/60"/><span className="w-2.5 h-2.5 rounded-full bg-emerald-500/60"/>
                    <span className="ml-2 text-[9px] text-white/30 font-mono">Panel · monitoring</span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                      <div className="flex items-center gap-2"><span className="pulse-dot"><span className="w-1.5 h-1.5 rounded-full bg-accent block"/></span><span className="text-xs text-white/50">Na żywo: <span className="text-white font-medium">24 uczniów</span></span></div>
                      <span className="text-xs text-white/40">Średnia: <span className="text-accent font-mono">73%</span></span>
                    </div>
                    {[
                      { n: "Kowalski J.", p: 88, c: "#34d399" }, { n: "Nowak A.", p: 72, c: "#22d3ee" },
                      { n: "Wiśniewska Z.", p: 95, c: "#34d399" }, { n: "Kamiński P.", p: 45, c: "#fb7185" },
                      { n: "Lewandowska M.", p: 68, c: "#fbbf24" },
                    ].map((s) => (
                      <div key={s.n} className="flex items-center gap-3">
                        <span className="text-xs text-white/50 w-20 truncate">{s.n}</span>
                        <div className="flex-1 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className="h-full rounded-full prog-fill" style={{ width: `${s.p}%`, background: s.c, opacity: 0.7 }} />
                        </div>
                        <span className="text-xs font-mono w-8 text-right text-white/50">{s.p}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──── FOR WHOM ──── */
function ForWhomFlow() {
  const cards = [
    { icon: GraduationCap, accent: "from-accent to-blue-500", to: "/auth/student", title: "Uczeń", lines: ["Wejście PIN-em bez konta", "Czysty interfejs egzaminu", "Wynik widoczny od razu", "Certyfikat PDF + QR"] },
    { icon: Users, accent: "from-accent to-blue-500", to: "/auth/teacher", title: "Nauczyciel", lines: ["Pytania z AI w 3 sekundy", "Klasy, oceny, dziennik", "Monitoring na żywo", "Eksport PDF/Excel"] },
    { icon: ShieldCheck, accent: "from-accent to-blue-500", to: "/auth/admin", title: "Dyrekcja", lines: ["Zatwierdzanie nauczycieli", "Raporty zbiorcze", "Audyt i statystyki", "Wgląd w wyniki szkoły"] },
    { icon: Heart, accent: "from-accent to-blue-500", to: "/auth/parent", title: "Rodzic", lines: ["Wgląd w wyniki dziecka", "Powiadomienia e-mail", "Raport postępów", "Konsultacje online"] },
  ];
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">Dla kogo</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Cztery perspektywy, jedna platforma" /></h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to={c.to} className="group card-premium rounded-2xl p-6 hover:-translate-y-1 stagger-item">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.accent} grid place-items-center mb-4 shadow-sm transition-transform duration-300 group-hover:scale-110`}>
                  <c.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-lg font-bold">{c.title}</h3>
                <ul className="mt-3 space-y-2 text-sm text-white/50">
                  {c.lines.map((l) => (
                    <li key={l} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-accent/40 shrink-0 mt-0.5"/>{l}</li>
                  ))}
                </ul>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-white/30 group-hover:text-accent transition-colors">
                  Przejdź <ArrowUpRight className="w-3 h-3"/>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──── COMPARISON ──── */
function ComparisonShowcase() {
  const rows = [
    { l: "Czas przygotowania egzaminu", t: "2–4 godziny", e: "3 minuty", icon: Timer },
    { l: "Sprawdzanie prac", t: "5–15 godzin", e: "0.3s (automat)", icon: FileText },
    { l: "Koszty druku / mies.", t: "200–500 zł", e: "0 zł", icon: DollarSign },
    { l: "Ryzyko ściągania", t: "Wysokie", e: "AI wykrywa", icon: ShieldCheck },
    { l: "Dostęp do wyników", t: "1–2 tygodnie", e: "Natychmiast", icon: Zap },
    { l: "Archiwizacja", t: "Segregator", e: "Chmura · RODO", icon: Database },
    { l: "Certyfikaty", t: "Ręcznie", e: "PDF + QR auto", icon: ScrollText },
    { l: "Analiza statystyk", t: "Excel ręcznie", e: "Automatyczne wykresy", icon: BarChart3 },
    { l: "Kontrola postępów", t: "Brak", e: "Na żywo · dashboard", icon: Activity },
    { l: "Migracja danych", t: "Godziny", e: "Import 1 klik", icon: Upload },
  ];
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">Porównanie</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Tradycyjnie vs EduNex" /></h2>
        </div>
        <div className="reveal space-y-3 relative">
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(180deg, transparent 0%, oklch(0.7 0.15 200 / 0.04) 2%, transparent 5%)",
              backgroundSize: "100% 20%",
            }}
            animate={{ backgroundPosition: ["0% 0%", "0% 100%", "0% 0%"] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />
          <div className="flex items-center gap-3 px-4 sm:px-6 py-2 text-xs text-white/40 font-medium relative">
            <span className="w-8 shrink-0" />
            <span className="flex-1">Obszar</span>
            <span className="w-28 sm:w-36 text-right text-rose-300/50">Tradycyjnie</span>
            <span className="w-28 sm:w-40 text-right text-accent/70">EduNex</span>
          </div>
          {rows.map((r, i) => (
              <div key={r.l} className="card-premium rounded-2xl px-4 sm:px-6 py-3 hover:-translate-y-[1px] transition-all cursor-default hover-glow stagger-item" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent/10 to-violet-400/10 grid place-items-center shrink-0">
                  <r.icon className="w-3.5 h-3.5 text-accent/60" />
                </div>
                <span className="flex-1 text-white/70 text-xs sm:text-sm font-medium">{r.l}</span>
                <span className="w-28 sm:w-36 text-right text-rose-300/40 text-xs sm:text-sm flex items-center justify-end gap-1">
                  <X className="w-3 h-3 opacity-50 shrink-0"/>{r.t}
                </span>
                <span className="w-28 sm:w-40 text-right text-cyan-200/80 text-xs sm:text-sm flex items-center justify-end gap-1 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/70 shrink-0"/>{r.e}
                </span>
              </div>
            </div>
          ))}
          <div className="text-center pt-2">
            <Link to="/auth/teacher" className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium text-accent/70 hover:text-cyan-200 transition-colors">
              Zobacz pełne porównanie <ArrowRight className="w-3 h-3"/>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──── ACHIEVEMENTS ──── */
const ACHIEVEMENTS = [
  { icon: Trophy, value: "847+", label: "Egzaminów dziennie", color: "from-accent to-blue-500" },
  { icon: School, value: "128+", label: "Aktywnych szkół", color: "from-accent to-blue-500" },
  { icon: Award, value: "18 920", label: "Certyfikatów", color: "from-accent to-blue-500" },
  { icon: Heart, value: "97.8%", label: "Zadowolonych uczniów", color: "from-accent to-blue-500" },
];
function AchievementsFlow() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">Osiągnięcia</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Platforma w liczbach" /></h2>
          <p className="mt-3 text-white/40 text-sm">Ponad 36 000 użytkowników i ciągle rośniemy.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {ACHIEVEMENTS.map((a, i) => (
              <div key={a.label} className={`reveal card-premium rounded-2xl p-6 text-center hover:-translate-y-1 hover-glow stagger-item ${i === 0 || i === 5 ? "sm:col-span-1" : ""}`} style={{ animationDelay: `${i * 0.06}s` }}>
              <div className={`w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br ${a.color} grid place-items-center mb-4`}>
                <a.icon className="w-6 h-6 text-black" />
              </div>
              <div className="text-3xl sm:text-4xl font-bold">
                <span className={`bg-gradient-to-r ${a.color} bg-clip-text text-transparent`}>{a.value}</span>
              </div>
              <div className="text-xs text-white/40 mt-1.5 font-medium">{a.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──── AI PLATFORM SHOWCASE ──── */
function AIPlatformFlow() {
  const capabilities = [
    { icon: BrainCircuit, title: "AI Tutor", desc: "24/7 asystent do nauki matematyki, języków, programowania", active: true },
    { icon: FileText, title: "AI Generator", desc: "Generuj pytania egzaminacyjne z tematu, zdjęcia lub ilustracji", active: true },
    { icon: Sparkles, title: "AI Ocenianie", desc: "Automatyczna ocena wypracowań i odpowiedzi otwartych", active: true },
    { icon: Code2, title: "Code Mentor", desc: "Nauka programowania z interaktywnym asystentem kodu", active: true },
    { icon: BarChart3, title: "Progress Analyzer", desc: "Analiza postępów z predykcją wyników AI", active: true },
    { icon: ShieldCheck, title: "Plagiarism Detector", desc: "Wykrywanie plagiatów i AI-generated content", active: false },
    { icon: BookOpen, title: "Course Generator", desc: "Automatyczne tworzenie kursów z dowolnego tematu", active: false },
    { icon: Presentation, title: "Presentation Maker", desc: "Generowanie prezentacji z AI w kilka sekund", active: false },
  ];

  return (
    <section className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center max-w-3xl mx-auto mb-16">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">Platforma AI</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight">
            <TextReveal text="Potęga sztucznej inteligencji w edukacji" />
          </h2>
          <p className="mt-3 text-white/40 text-sm max-w-2xl mx-auto">
            EduNex wykorzystuje najnowsze modele AI do automatyzacji nauczania, oceniania i personalizacji ścieżek edukacyjnych.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {capabilities.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`card-premium rounded-2xl p-5 hover:-translate-y-1 stagger-item transition-all ${!c.active ? 'opacity-50' : ''}`}
            >
              <motion.div
                animate={c.active ? { boxShadow: ["0 0 0px oklch(0.7 0.15 200 / 0)", "0 0 20px oklch(0.7 0.15 200 / 0.15)", "0 0 0px oklch(0.7 0.15 200 / 0)"] } : {}}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className={`w-10 h-10 rounded-xl grid place-items-center mb-4 ${c.active ? 'bg-gradient-to-br from-accent to-blue-500' : 'bg-white/[0.04]'}`}
              >
                <c.icon className={`w-5 h-5 ${c.active ? 'text-black' : 'text-white/30'}`} />
              </motion.div>
              <h3 className="text-sm font-semibold text-white">{c.title}</h3>
              <p className="text-xs text-white/40 mt-1.5 leading-relaxed">{c.desc}</p>
              <div className="mt-3 flex items-center gap-1.5">
                {c.active ? (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-300/70 font-medium">Dostępne</span>
                  </>
                ) : (
                  <>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400/50" />
                    <span className="text-[10px] text-amber-300/50 font-medium">Wkrótce</span>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="reveal-scale mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[Bot, BrainCircuit, Zap].map((Icon, i) => (
                  <div key={i} className={`w-9 h-9 rounded-full border-2 border-[oklch(0.06_0.03_270)] grid place-items-center ${i === 0 ? 'bg-accent/20 text-accent' : i === 1 ? 'bg-violet-500/20 text-violet-300' : 'bg-amber-500/20 text-amber-300'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-medium text-white/80">Modele AI: Gemini 3.5 Flash · GPT-4o · Claude 3.5</div>
                <div className="text-xs text-white/30 mt-0.5">Własny gateway AI z automatycznym routingiem i fallbackiem</div>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>99.9% uptime</span>
              <span className="w-1 h-1 rounded-full bg-white/20" />
              <Zap className="w-3.5 h-3.5 text-accent" />
              <span>&lt;200ms latency</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──── INTERACTIVE AI DEMO ──── */
function AiDemoShowcase() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    { role: "ai", content: "Cześć! Jestem AI Tutor EduNex. Mogę pomóc w nauce matematyki, języków, programowania i nie tylko. O co chcesz zapytać?" }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  const DEMO_RESPONSES: Record<string, string> = {
    matematyka: "Funkcja kwadratowa to f(x) = ax² + bx + c, gdzie a ≠ 0. Jej wykresem jest parabola. Wierzchołek ma współrzędne W(p, q), gdzie p = -b/(2a), q = -Δ/(4a). Δ = b² - 4ac nazywamy wyróżnikiem. Chcesz przećwiczyć na przykładzie?",
    angielski: "Sure! 'Present Perfect' używamy gdy mówimy o przeszłych wydarzeniach mających wpływ na teraźniejszość. Struktura: have/has + past participle. Przykład: 'I have visited Paris.' W przeciwieństwie do Past Simple, tu ważny jest efekt, nie czas wykonania.",
    programowanie: "W Pythonie list comprehension to elegancki sposób tworzenia list: [x**2 for x in range(10) if x % 2 == 0] zwróci kwadraty parzystych liczb od 0 do 9. To szybsze i czytelniejsze niż tradycyjna pętla for.",
    domyślne: "Świetne pytanie! Na platformie EduNex możesz korzystać z AI do generowania kursów, testów, analizy postępów i personalizowanych planów nauki. AI Code Mentor pomoże Ci w programowaniu, a AI Teacher w przygotowaniu materiałów.",
  };

  const handleSend = () => {
    const q = input.trim().toLowerCase();
    if (!q || busy) return;
    setMessages(prev => [...prev, { role: "user", content: input.trim() }]);
    setInput("");
    setBusy(true);
    setTimeout(() => {
      const answer = Object.entries(DEMO_RESPONSES).find(([key]) => q.includes(key))?.[1] || DEMO_RESPONSES.domyślne;
      setMessages(prev => [...prev, { role: "ai", content: answer }]);
      setBusy(false);
    }, 1200);
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <section id="ai-demo" className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">AI Demo</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Porozmawiaj z AI Tuturem" /></h2>
          <p className="mt-3 text-white/40 text-sm">Zadaj pytanie o matematykę, języki, programowanie — AI odpowiada w czasie rzeczywistym.</p>
        </div>
        <div className="reveal-scale max-w-2xl mx-auto">
          <div className="card-premium rounded-2xl overflow-hidden border border-white/[0.08]">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] bg-white/[0.02]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-accent to-violet-500 grid place-items-center">
                  <BrainCircuit className="w-4 h-4 text-black" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white/90">AI Tutor</div>
                  <div className="flex items-center gap-1.5">
                    <span className="status-dot online" />
                    <span className="text-[10px] text-white/30">Online · EduNex AI</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-white/30">
                <Sparkles className="w-3 h-3 text-accent" />Powered by Gemini
              </div>
            </div>
            <div ref={chatRef} className="h-72 overflow-y-auto p-5 space-y-4 scroll-smooth">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`} style={{ animation: "chatFade 0.3s ease-out" }}>
                  {m.role === "ai" && (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-violet-500 grid place-items-center shrink-0 mt-0.5">
                      <BrainCircuit className="w-3.5 h-3.5 text-black" />
                    </div>
                  )}
                  <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-accent/15 text-white/90 rounded-tr-md"
                      : "bg-white/[0.04] border border-white/[0.06] text-white/70 rounded-tl-md"
                  }`}>
                    {m.content}
                  </div>
                  {m.role === "user" && (
                    <div className="w-7 h-7 rounded-lg bg-white/[0.06] grid place-items-center shrink-0 mt-0.5">
                      <span className="text-[10px] text-white/50 font-medium">U</span>
                    </div>
                  )}
                </div>
              ))}
              {busy && (
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent to-violet-500 grid place-items-center shrink-0">
                    <BrainCircuit className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-white/[0.04] border border-white/[0.06]">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 p-3 border-t border-white/[0.06] bg-white/[0.01]">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSend()} placeholder="Zapytaj AI o matematykę, angielski, programowanie..." className="flex-1 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-accent/30 transition-all" />
              <button onClick={handleSend} disabled={busy || !input.trim()} className="p-2.5 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-30 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-center gap-4 text-[10px] text-white/30">
            <span>Zapytaj o: <button onClick={() => setInput("matematyka")} className="text-accent/70 hover:text-accent underline underline-offset-2">matematykę</button></span>
            <span><button onClick={() => setInput("angielski")} className="text-accent/70 hover:text-accent underline underline-offset-2">angielski</button></span>
            <span><button onClick={() => setInput("programowanie")} className="text-accent/70 hover:text-accent underline underline-offset-2">programowanie</button></span>
          </div>
        </div>
      </div>
      <style>{`@keyframes chatFade { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </section>
  );
}

/* ──── GLOBAL & ENTERPRISE ──── */
/* ──── SECURITY ──── */
const SECURITY_ITEMS = [
  { icon: Lock, title: "Szyfrowanie TLS 1.3", desc: "Dane przesyłane z szyfrowaniem klasy bankowej. Certyfikat SSL automatycznie odnawiany.", color: "from-accent to-blue-500" },
  { icon: Shield, title: "Ochrona przed atakami", desc: "WAF, DDoS protection, rate limiting. Monitoring 24/7 przez zespół bezpieczeństwa.", color: "from-accent to-blue-500" },
  { icon: Fingerprint, title: "RODO — pełna zgodność", desc: "Umowa powierzenia danych, dziennik audytu, prawo do bycia zapomnianym.", color: "from-accent to-blue-500" },
  { icon: Database, title: "Backupy co 6h", desc: "Automatyczne kopie na 3 niezależnych serwerach w różnych lokalizacjach w UE.", color: "from-accent to-blue-500" },
  { icon: ScanFace, title: "Tryb egzaminacyjny", desc: "Blokada skrótów, pełny ekran, monitoring aktywności, losowanie pytań.", color: "from-accent to-blue-500" },
  { icon: Building2, title: "Serwery w Polsce", desc: "Dane przechowywane w Warszawie i Krakowie. Poza jurysdykcją CLOUD Act.", color: "from-accent to-blue-500" },
  { icon: Users, title: "Kontrola dostępu RBAC", desc: "Role: admin, dyrektor, nauczyciel. 2FA dla administratora, dostęp tylko do własnych zasobów.", color: "from-accent to-blue-500" },
  { icon: Radio, title: "Monitoring 24/7", desc: "Automatyczne skanowanie podatności, testy penetracyjne co kwartał, SOC.", color: "from-accent to-blue-500" },
];
function SecurityFlow() {
  return (
    <section className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">Bezpieczeństwo</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Dane bezpieczne jak w banku" /></h2>
          <p className="mt-3 text-white/40 text-sm">Certyfikaty, szyfrowanie i procedury — wszystko, czego wymaga nowoczesna szkoła.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SECURITY_ITEMS.map((it, i) => (
            <motion.div
              key={it.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="card-premium rounded-2xl p-6 hover:-translate-y-1 hover-glow"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${it.color} grid place-items-center mb-4`}><it.icon className="w-5 h-5 text-black"/></div>
              <h3 className="font-semibold text-sm text-white/90">{it.title}</h3>
              <p className="mt-1.5 text-xs text-white/50 leading-relaxed">{it.desc}</p>
            </motion.div>
          ))}
        </div>
        <div className="reveal mt-8 grid grid-cols-3 sm:grid-cols-6 gap-3 max-w-2xl mx-auto">
          {[["Zgodność z MEN", Scale], ["RODO", Shield], ["ISO 27001", ShieldCheck], ["TLS 1.3", Lock], ["Serwery UE", Globe], ["99.98% SLA", Activity]].map(([n, I]) => (
            <div key={n as string} className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] transition-all">
              <I className="w-5 h-5 text-accent/60"/><span className="text-[10px] text-white/50 text-center font-medium">{n as string}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──── TESTIMONIALS ──── */

/* ──── PRICING ──── */

/* ──── FAQ ──── */
const FAQ = [
  { q: "Czy uczniowie muszą zakładać konto?", a: "Nie. Uczeń wchodzi przeglądarką, wpisuje PIN i imię. Konto nie jest wymagane — zero rejestracji." },
  { q: "Czy mogę wgrać pytania z dokumentu?", a: "Tak. Wspieramy import z Worda, PDF oraz Excel. Możesz też wczytać zdjęcie — AI odczyta pytania automatycznie." },
  { q: "Jak szybko mogę zacząć?", a: "Rejestracja trwa 2 minuty. Dla planu Klasa — dostęp od razu, bez karty płatniczej." },
  { q: "Jak AI wykrywa ściąganie?", a: "AI analizuje ruchy myszy, wykrywa opuszczanie okna, porównuje odpowiedzi uczniów i wysyła alerty na żywo." },
  { q: "Czy platforma działa na telefonie?", a: "Tak. EduNex działa w każdej przeglądarce — komputer, tablet, telefon. Bez instalacji." },
  { q: "Czy mogę przetestować przed zakupem?", a: "Tak. Plan Klasa jest całkowicie darmowy — bez limitu czasu, bez karty, bez zobowiązań." },
];
function FAQFlow() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="reveal text-center mb-14">
          <span className="section-label inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm">FAQ</span>
          <h2 className="mt-6 text-4xl sm:text-5xl font-bold tracking-tight"><TextReveal text="Wątpliwości? Wyjaśniamy" /></h2>
        </div>
        <div className="reveal space-y-3">
          {FAQ.map((it, i) => (
            <div key={it.q} className="card-premium rounded-2xl overflow-hidden">
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors hover:bg-white/[0.02]">
                <span className="text-sm font-medium text-white/80 pr-4">{it.q}</span>
                <span className={`shrink-0 w-7 h-7 rounded-full bg-white/[0.04] border border-white/[0.06] grid place-items-center transition-all duration-300 ${open === i ? "border-accent/30 text-accent rotate-45" : "text-white/30"}`}>
                  <Plus className="w-3.5 h-3.5"/>
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ease-out ${open === i ? "max-h-48" : "max-h-0"}`}>
                <p className="px-6 pb-4 text-sm text-white/50 leading-relaxed">{it.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ──── BLOG + MARQUEE PARTNERS ──── */

/* ──── NEWSLETTER ──── */
function NewsletterFlow() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); if (!email.trim()) return; setSent(true); toast.success("Zapisano do newslettera!"); setEmail(""); };
  return (
    <section className="relative py-24 overflow-hidden">
      <div className="max-w-lg mx-auto px-4 sm:px-6 text-center">
        <div className="reveal">
          {sent ? (
            <div className="card-premium rounded-2xl p-8"><CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3"/><h2 className="text-2xl font-bold text-emerald-300">Jesteś zapisany!</h2><p className="mt-2 text-sm text-white/50">Nowości i porady — raz na dwa tygodnie.</p></div>
          ) : (
            <>
              <Bell className="w-7 h-7 text-accent mx-auto mb-4"/>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Bądź na bieżąco</h2>
              <p className="mt-3 text-white/40 text-sm">Nowe funkcje, porady i aktualności — raz na dwa tygodnie, zero spamu.</p>
              <form onSubmit={onSubmit} className="mt-6 flex items-center gap-2 max-w-sm mx-auto">
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="Twój e-mail" className="flex-1 px-5 py-3 rounded-full bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/30 transition-all" />
                <button type="submit" className="btn-shine px-5 py-3 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 transition-all shrink-0 magnetic-btn"><Send className="w-4 h-4"/></button>
              </form>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

/* ──── CONTACT ──── */
function ContactFlow() {
  const submit = useServerFn(submitContact);
  const [busy, setBusy] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setBusy(true);
    try {
      await submit({ data: { name: String(fd.get("name") ?? ""), email: String(fd.get("email") ?? ""), subject: String(fd.get("subject") ?? "Zapytanie"), message: String(fd.get("message") ?? "") } });
      toast.success("Wiadomość wysłana. Odezwiemy się w 24h.");
      (e.target as HTMLFormElement).reset();
    } catch (err) { toast.error(err instanceof Error ? err.message : "Błąd wysyłki"); } finally { setBusy(false); }
  };
  return (
    <section id="kontakt" className="relative py-28 sm:py-36 overflow-hidden section-premium">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="reveal card-premium rounded-2xl p-6 sm:p-10">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <span className="section-label inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06] text-white/50 backdrop-blur-sm mb-4">Kontakt</span>
              <h2 className="text-3xl font-bold tracking-tight">Napisz do nas</h2>
              <p className="mt-2 text-sm text-white/40">Odpowiadamy w 24h w dni robocze.</p>
              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex gap-3"><Mail className="w-5 h-5 text-accent shrink-0 mt-0.5"/><div><div className="text-white/80">kontakt@edunex.pl</div><div className="text-xs text-white/40">Sekretariat</div></div></li>
                <li className="flex gap-3"><Phone className="w-5 h-5 text-accent shrink-0 mt-0.5"/><div><div className="text-white/80">+48 22 100 12 34</div><div className="text-xs text-white/40">Pon–Pt, 8:00–16:00</div></div></li>
              </ul>
            </div>
            <form onSubmit={onSubmit} className="lg:col-span-3 grid sm:grid-cols-2 gap-3">
              <input name="name" required placeholder="Imię i nazwisko" className="sm:col-span-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/30 transition-all" />
              <input name="email" type="email" required placeholder="E-mail" className="sm:col-span-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/30 transition-all" />
              <input name="subject" placeholder="Temat" className="sm:col-span-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/30 transition-all" />
              <textarea name="message" rows={4} required placeholder="Treść wiadomości" className="sm:col-span-2 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent/30 transition-all resize-none" />
              <div className="sm:col-span-2 flex items-center justify-between gap-3">
                <p className="text-xs text-white/40">Zgoda na kontakt zwrotny.</p>
                <button disabled={busy} type="submit" className="btn-shine inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 disabled:opacity-50 transition-all relative magnetic-btn">
                  {busy ? <Loader2 className="w-4 h-4 animate-spin"/> : <Send className="w-4 h-4"/>} Wyślij
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──── STICKY CTA ──── */
function StickyCta() {
  const [visible, setVisible] = useState(false);
  const lastRef = useRef(0);
  useEffect(() => {
    const f = () => {
      const s = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      const pct = s / h;
      if (pct > 0.15 && pct < 0.85) {
        if (s > lastRef.current) setVisible(true);
        else setVisible(false);
      } else {
        setVisible(false);
      }
      lastRef.current = s;
    };
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`sticky-cta-wrap ${visible ? "visible" : ""}`}>
      <div className="bg-black/70 backdrop-blur-2xl border-t border-white/[0.06] py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="pulse-dot"><span className="w-1.5 h-1.5 rounded-full bg-accent block" /></span>
            <span className="text-sm text-white/60 max-sm:hidden"><span className="text-white font-medium">Ponad 36 000</span> użytkowników już korzysta</span>
            <span className="text-sm text-white/60 sm:hidden">36 000+ użytkowników</span>
          </div>
          <Link to="/auth/teacher" className="btn-shine inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium bg-white text-black hover:bg-white/90 transition-all shadow-sm shrink-0 magnetic-btn">
            Rozpocznij za darmo <ArrowRight className="w-4 h-4"/>
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ──── FOOTER ──── */
function FooterFlow() {
  const [showTop, setShowTop] = useState(false);
  useEffect(() => { const f = () => setShowTop(window.scrollY > 400); window.addEventListener("scroll", f, { passive: true }); return () => window.removeEventListener("scroll", f); }, []);
  return (
    <footer className="relative border-t border-white/[0.06] pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.01] to-transparent" />
      {showTop && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-white/[0.06] border border-white/[0.06] text-white/50 grid place-items-center hover:bg-white/[0.1] hover:text-white transition-all backdrop-blur-md">
          <ChevronUp className="w-4 h-4" />
        </button>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-accent to-fuchsia-500 p-[1.5px] shadow-lg">
                <div className="w-full h-full rounded-[10px] bg-[oklch(0.06_0.03_270)] grid place-items-center">
                  <svg viewBox="0 0 24 24" className="w-4.5 h-4.5" fill="none" stroke="url(#logoGradF)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <defs><linearGradient id="logoGradF" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#22d3ee"/><stop offset="50%" stopColor="#a78bfa"/><stop offset="100%" stopColor="#f472b6"/></linearGradient></defs>
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                  </svg>
                </div>
              </div>
              <div className="font-semibold text-base">EduNex</div>
            </div>
            <p className="mt-3 text-xs text-white/40 leading-relaxed max-w-xs">Nowoczesna platforma egzaminacyjna dla polskich szkół. Zgodna z wytycznymi MEN i RODO.</p>
            <div className="mt-4 flex items-center gap-2">
              {[Github, MessageSquare].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 rounded-full bg-white/[0.04] border border-white/[0.06] grid place-items-center text-white/30 hover:text-white hover:bg-white/[0.08] transition-all"><Icon className="w-3.5 h-3.5"/></a>
              ))}
            </div>
          </div>
          <div>
            <div className="section-label text-white/30 mb-4">Platforma</div>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/auth/student" className="hover:text-white transition-colors">Uczeń</Link></li>
              <li><Link to="/auth/teacher" className="hover:text-white transition-colors">Nauczyciel</Link></li>
              <li><a href="#funkcje" className="hover:text-white transition-colors">Funkcje</a></li>
              <li><a href="#cennik" className="hover:text-white transition-colors">Cennik</a></li>
            </ul>
          </div>
          <div>
            <div className="section-label text-white/30 mb-4">Dokumenty</div>
            <ul className="space-y-2 text-sm text-white/40">
              <li><Link to="/dokumenty" className="hover:text-white transition-colors">Regulamin</Link></li>
              <li><Link to="/dokumenty" className="hover:text-white transition-colors">Polityka prywatności</Link></li>
              <li><Link to="/dokumenty" className="hover:text-white transition-colors">RODO</Link></li>
            </ul>
          </div>
          <div>
            <div className="section-label text-white/30 mb-4">Kontakt</div>
            <ul className="space-y-2 text-sm text-white/40">
              <li>kontakt@edunex.pl</li>
              <li>+48 22 100 12 34</li>
            </ul>
            <div className="mt-4 text-[10px] text-white/20 font-mono">
              <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-accent"/>online</span>
              <span className="ml-2">v11.1</span>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/[0.06] text-center text-xs text-white/30">
          &copy; {new Date().getFullYear()} EduNex · Projekt edukacyjny dla polskich szkół
        </div>
      </div>
    </footer>
  );
}
