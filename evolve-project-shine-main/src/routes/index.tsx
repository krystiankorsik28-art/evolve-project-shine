import { useEffect, useMemo, useRef, useState, type ComponentType, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Cloud,
  Database,
  Eye,
  FileText,
  Fingerprint,
  Github,
  GraduationCap,
  Hash,
  KeyRound,
  Layers,
  Library,
  Lightbulb,
  Lock,
  Mail,
  Menu,
  Moon,
  Network,
  Palette,
  Play,
  Rocket,
  School,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  Target,
  Timer,
  Trophy,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/lib/theme";

type IconType = ComponentType<{ className?: string }>;

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "EduNex — nowoczesna platforma egzaminacyjna dla szkół" },
      {
        name: "description",
        content:
          "EduNex to profesjonalna platforma dla szkół: egzaminy online, sprawdziany, PIN dla ucznia, panel nauczyciela, AI, raporty, certyfikaty, bezpieczeństwo i integracje.",
      },
    ],
  }),
});

const stats = [
  ["99,9%", "gotowość platformy"],
  ["6 cyfr", "bezpieczny PIN ucznia"],
  ["AI", "generator pytań i analiza"],
  ["UE", "RODO i audyt zdarzeń"],
];

const pillars: { icon: IconType; title: string; text: string }[] = [
  { icon: ClipboardList, title: "Egzaminy i sprawdziany", text: "Twórz testy, sprawdziany, sesje PIN, limity czasu i różne typy pytań." },
  { icon: Users, title: "Panel nauczyciela", text: "Biblioteka prac, aktywne sesje, wyniki live, średnie, eksporty i klasy." },
  { icon: GraduationCap, title: "Panel ucznia", text: "Czytelny tryb egzaminu, timer, pasek postępu, media i ekran wyniku." },
  { icon: BrainCircuit, title: "AI w edukacji", text: "Asystent generowania pytań, ocena esejów, wskazówki i analiza słabych punktów." },
  { icon: ShieldCheck, title: "Bezpieczeństwo", text: "2FA, OTP, powiadomienia logowania, kontrola urządzeń i logi aktywności." },
  { icon: Database, title: "Supabase i dane", text: "Auth, storage multimediów, wyniki, próby egzaminacyjne i role użytkowników." },
];

const roles: { icon: IconType; title: string; desc: string; points: string[] }[] = [
  {
    icon: School,
    title: "Uczeń",
    desc: "Wchodzi kodem PIN albo kontem, rozwiązuje egzamin bez chaosu.",
    points: ["PIN 6-cyfrowy", "Timer i postęp", "Wynik po zakończeniu"],
  },
  {
    icon: Users,
    title: "Nauczyciel",
    desc: "Startuje sesje, kontroluje odpowiedzi i widzi wyniki klasy na żywo.",
    points: ["Generator PIN", "Biblioteka pytań", "Raporty i eksporty"],
  },
  {
    icon: Building2,
    title: "Admin szkoły",
    desc: "Zarządza użytkownikami, bezpieczeństwem, klasami i ustawieniami placówki.",
    points: ["2FA admina", "Role i uprawnienia", "Audyt zdarzeń"],
  },
];

const modules: { icon: IconType; label: string }[] = [
  { icon: FileText, label: "Testy wyboru" },
  { icon: Timer, label: "Limit czasu" },
  { icon: Hash, label: "Sesje PIN" },
  { icon: BookOpen, label: "Eseje" },
  { icon: Eye, label: "Podgląd live" },
  { icon: Bell, label: "Powiadomienia" },
  { icon: Cloud, label: "Storage plików" },
  { icon: BadgeCheck, label: "Certyfikaty" },
  { icon: Search, label: "Wyszukiwarka" },
  { icon: BarChart3, label: "Analityka" },
  { icon: KeyRound, label: "Reset OTP" },
  { icon: Network, label: "Integracje" },
];

const workflow = [
  { nr: "01", title: "Tworzysz egzamin", text: "Nauczyciel wybiera typ, pytania, punktację, multimedia i limit czasu." },
  { nr: "02", title: "Startujesz sesję", text: "System generuje PIN i aktywuje egzamin dla klasy lub wybranej grupy." },
  { nr: "03", title: "Uczeń rozwiązuje", text: "Uczeń wpisuje imię, nazwisko i PIN albo loguje się przez konto." },
  { nr: "04", title: "Analizujesz wyniki", text: "Panel pokazuje wynik, czas, średnią, problemy i gotowy raport." },
];

const security = ["2FA dla administratora", "OTP resetu hasła", "Powiadomienia o logowaniu", "Role i uprawnienia", "Rejestr aktywności", "RODO-ready architektura"];

const plans = [
  { name: "Klasa", price: "0 zł", tag: "Start", items: ["Podstawowe egzaminy", "PIN ucznia", "Wyniki klasy"] },
  { name: "Nauczyciel", price: "99 zł", tag: "Najlepszy start", items: ["Biblioteka pytań", "AI generator", "Raporty i eksport"] },
  { name: "Szkoła", price: "490 zł", tag: "Dla placówek", items: ["Wiele klas", "Panel admina", "Bezpieczeństwo 2FA"] },
];

const faqs = [
  ["Czy uczeń musi mieć konto?", "Nie zawsze. Do egzaminu może wejść szybkim kodem PIN wygenerowanym przez nauczyciela."],
  ["Czy można dodać obrazy, audio i wideo?", "Tak. System jest przygotowany pod multimedia i storage plików dla pytań oraz materiałów."],
  ["Czy platforma ma AI?", "Tak. EduNex może wspierać tworzenie pytań, analizę wyników i ocenę dłuższych odpowiedzi."],
  ["Czy można używać w szkole?", "Taki jest cel: role, panele, PIN, bezpieczeństwo, raporty i panel administracyjny."],
];

function Landing() {
  const { theme, setTheme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState(0);
  const [activeFaq, setActiveFaq] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const isLight = theme === "light";

  useEffect(() => {
    const stored = localStorage.getItem("edunex.home.theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, [setTheme]);

  useEffect(() => {
    localStorage.setItem("edunex.home.theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => {
      if (!progressRef.current) return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current.style.transform = `scaleX(${Math.min(window.scrollY / Math.max(max, 1), 1)})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const palette = useMemo(
    () => ({
      page: isLight ? "bg-[#f4f7fb] text-[#111827]" : "bg-[#020617] text-white",
      muted: isLight ? "text-slate-600" : "text-white/62",
      soft: isLight ? "border-slate-200 bg-white/84 shadow-[0_20px_80px_rgba(15,23,42,0.10)]" : "border-white/10 bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.35)]",
      soft2: isLight ? "border-slate-200 bg-white/68" : "border-white/10 bg-white/[0.04]",
      nav: isLight ? "border-slate-200 bg-white/78 text-slate-900" : "border-white/10 bg-[#020617]/78 text-white",
      chip: isLight ? "border-slate-200 bg-white text-slate-700" : "border-white/10 bg-white/[0.06] text-white/72",
    }),
    [isLight],
  );

  const goAuth = () => navigate({ to: "/auth" });

  return (
    <div className={`min-h-screen overflow-x-hidden selection:bg-[#0078d4]/30 ${palette.page}`}>
      <Toaster theme={isLight ? "light" : "dark"} position="top-center" />
      <div ref={progressRef} className="fixed left-0 top-0 z-[80] h-1 w-full origin-left scale-x-0 bg-[#0078d4]" />
      <Background isLight={isLight} />
      <TopNav isLight={isLight} palette={palette} menuOpen={menuOpen} setMenuOpen={setMenuOpen} toggle={toggle} />

      <main className="relative z-10">
        <section className="mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 pb-20 pt-32 sm:px-8 lg:px-10">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <Badge isLight={isLight} icon={Sparkles}>Platforma egzaminacyjna nowej generacji</Badge>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.07em] sm:text-7xl lg:text-[88px]">
                EduNex robi z egzaminów system klasy premium.
              </h1>
              <p className={`mt-7 max-w-2xl text-lg leading-8 sm:text-xl ${palette.muted}`}>
                Strona dla szkół, nauczycieli i uczniów: szybkie sesje PIN, panel nauczyciela, sprawdziany, AI, analityka, bezpieczeństwo i nowoczesny wygląd w jednym miejscu.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <button onClick={goAuth} className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0078d4] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,120,212,0.28)] transition hover:bg-[#106ebe]">
                  Przejdź do panelu <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
                <a href="#demo" className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold backdrop-blur transition ${palette.chip}`}>
                  <Play className="h-4 w-4" /> Zobacz demo systemu
                </a>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(([value, label]) => (
                  <div key={label} className={`rounded-2xl border p-4 backdrop-blur ${palette.soft2}`}>
                    <div className="text-2xl font-semibold tracking-tight">{value}</div>
                    <div className={`mt-1 text-xs ${palette.muted}`}>{label}</div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, delay: 0.1 }}>
              <HeroConsole isLight={isLight} palette={palette} />
            </motion.div>
          </div>
        </section>

        <TrustStrip isLight={isLight} palette={palette} />
        <PillarsSection isLight={isLight} palette={palette} />
        <RoleSection isLight={isLight} palette={palette} activeRole={activeRole} setActiveRole={setActiveRole} />
        <WorkflowSection isLight={isLight} palette={palette} />
        <DemoSection isLight={isLight} palette={palette} />
        <ModulesSection isLight={isLight} palette={palette} />
        <AISection isLight={isLight} palette={palette} />
        <SecuritySection isLight={isLight} palette={palette} />
        <PricingSection isLight={isLight} palette={palette} />
        <FAQSection isLight={isLight} palette={palette} activeFaq={activeFaq} setActiveFaq={setActiveFaq} />
        <ContactSection isLight={isLight} palette={palette} />
      </main>

      <StickyActions isLight={isLight} goAuth={goAuth} toggle={toggle} />
      <Footer isLight={isLight} palette={palette} />
    </div>
  );
}

function Background({ isLight }: { isLight: boolean }) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(circle at 18% 10%, rgba(0,120,212,0.16), transparent 26%), radial-gradient(circle at 78% 12%, rgba(80,230,255,0.14), transparent 28%), linear-gradient(135deg, #f8fbff, #eef4fb 45%, #ffffff)"
            : "radial-gradient(circle at 15% 8%, rgba(0,120,212,0.25), transparent 30%), radial-gradient(circle at 82% 6%, rgba(80,230,255,0.12), transparent 30%), radial-gradient(circle at 50% 92%, rgba(59,130,246,0.18), transparent 35%), linear-gradient(135deg, #020617, #06101e 45%, #01030a)",
        }}
      />
      <div
        className={`absolute inset-0 ${isLight ? "opacity-[0.35]" : "opacity-[0.18]"}`}
        style={{
          backgroundImage: isLight
            ? "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)"
            : "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <motion.div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-[#0078d4]/20 blur-3xl" animate={{ x: [0, 60, 10, 0], y: [0, -20, 25, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -right-24 top-40 h-[440px] w-[440px] rounded-full bg-cyan-400/14 blur-3xl" animate={{ x: [0, -40, 20, 0], y: [0, 35, -10, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function TopNav({ isLight, palette, menuOpen, setMenuOpen, toggle }: any) {
  const links = [
    ["Funkcje", "#funkcje"],
    ["Role", "#role"],
    ["Demo", "#demo"],
    ["AI", "#ai"],
    ["Cennik", "#cennik"],
  ];
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 sm:px-6">
      <nav className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 shadow-lg backdrop-blur-2xl ${palette.nav}`}>
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0078d4] text-white shadow-[0_12px_34px_rgba(0,120,212,0.3)]"><Sparkles className="h-5 w-5" /></div>
          <div>
            <div className="text-sm font-semibold leading-none">EduNex</div>
            <div className={`mt-1 text-[10px] uppercase tracking-[0.22em] ${isLight ? "text-slate-500" : "text-white/42"}`}>exam cloud</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {links.map(([label, href]) => (
            <a key={href} href={href} className={`rounded-full px-4 py-2 text-sm font-medium transition ${isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-950" : "text-white/62 hover:bg-white/8 hover:text-white"}`}>{label}</a>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button onClick={toggle} className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${palette.chip}`}>
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isLight ? "Ciemny" : "Jasny"}
          </button>
          <Link to="/auth" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0078d4] px-5 text-sm font-semibold text-white transition hover:bg-[#106ebe]">
            Logowanie <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <button onClick={() => setMenuOpen(!menuOpen)} className={`grid h-10 w-10 place-items-center rounded-full border lg:hidden ${palette.chip}`}>
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {menuOpen && (
        <div className={`mx-auto mt-3 max-w-7xl rounded-3xl border p-4 backdrop-blur-2xl lg:hidden ${palette.nav}`}>
          <div className="grid gap-2">
            {links.map(([label, href]) => <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold">{label}</a>)}
            <Link to="/auth" className="rounded-2xl bg-[#0078d4] px-4 py-3 text-center text-sm font-semibold text-white">Przejdź do logowania</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({ children, icon: Icon, isLight }: { children: string; icon: IconType; isLight: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${isLight ? "border-slate-200 bg-white text-slate-600" : "border-white/10 bg-white/[0.06] text-white/62"}`}>
      <Icon className="h-4 w-4 text-[#50a7f2]" /> {children}
    </span>
  );
}

function HeroConsole({ isLight, palette }: any) {
  return (
    <div className={`relative overflow-hidden rounded-[32px] border p-4 backdrop-blur-2xl ${palette.soft}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(0,120,212,0.20),transparent_32%)]" />
      <div className="relative rounded-[24px] border border-white/10 bg-[#020817] p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-yellow-300" /><span className="h-3 w-3 rounded-full bg-green-400" /></div>
          <span className="text-xs text-white/45">EduNex Teacher OS</span>
        </div>
        <div className="mt-6 grid gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between"><div><p className="text-xs text-white/45">Aktywna sesja</p><h3 className="mt-1 text-2xl font-semibold">Matematyka — Klasa 6</h3></div><div className="rounded-2xl bg-[#0078d4] px-4 py-2 text-xl font-bold">482 913</div></div>
            <div className="mt-5 h-2 rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-[#50e6ff]" initial={{ width: "18%" }} animate={{ width: "76%" }} transition={{ duration: 2.4, repeat: Infinity, repeatType: "reverse" }} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[["24", "uczniów"], ["86%", "średnia"], ["14m", "czas"]].map(([a, b]) => <div key={b} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"><div className="text-2xl font-semibold">{a}</div><div className="text-xs text-white/45">{b}</div></div>)}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold"><Bot className="h-4 w-4 text-[#50e6ff]" /> AI podpowiedź</div>
            <p className="text-sm leading-6 text-white/60">5 uczniów ma problem z zadaniem o polu figury. System proponuje krótką powtórkę po egzaminie.</p>
          </div>
        </div>
      </div>
      <div className={`mt-4 grid grid-cols-3 gap-3 text-center text-xs ${isLight ? "text-slate-600" : "text-white/55"}`}>
        <div className={`rounded-2xl border p-3 ${palette.soft2}`}>PIN</div>
        <div className={`rounded-2xl border p-3 ${palette.soft2}`}>AI</div>
        <div className={`rounded-2xl border p-3 ${palette.soft2}`}>Raport</div>
      </div>
    </div>
  );
}

function TrustStrip({ palette }: any) {
  return (
    <section className="relative z-10 border-y border-white/8 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-5 sm:px-8 lg:px-10">
        {["Supabase", "Vercel", "Google", "Microsoft", "GitHub", "AI", "RODO"].map((x) => <span key={x} className={`rounded-full border px-4 py-2 text-xs font-semibold ${palette.chip}`}>{x}</span>)}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, text, isLight }: { eyebrow: string; title: string; text: string; isLight: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <Badge isLight={isLight} icon={Sparkles}>{eyebrow}</Badge>
      <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{title}</h2>
      <p className={`mx-auto mt-5 max-w-2xl text-base leading-7 ${isLight ? "text-slate-600" : "text-white/62"}`}>{text}</p>
    </div>
  );
}

function PillarsSection({ isLight, palette }: any) {
  return (
    <section id="funkcje" className="relative px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} eyebrow="Funkcje" title="Cały system szkolny w jednym produkcie" text="Nie tylko landing. Strona pokazuje realny ekosystem: egzaminy, użytkowników, AI, dane, bezpieczeństwo i raporty." />
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pillars.map(({ icon: Icon, title, text }) => (
          <motion.div whileHover={{ y: -6 }} key={title} className={`rounded-[28px] border p-6 backdrop-blur-2xl ${palette.soft}`}>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0078d4] text-white"><Icon className="h-5 w-5" /></div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
            <p className={`mt-3 text-sm leading-6 ${palette.muted}`}>{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function RoleSection({ isLight, palette, activeRole, setActiveRole }: any) {
  const role = roles[activeRole];
  const Icon = role.icon;
  return (
    <section id="role" className="relative px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <Badge isLight={isLight} icon={Users}>Role użytkowników</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Każdy widzi dokładnie to, czego potrzebuje.</h2>
          <p className={`mt-5 leading-7 ${palette.muted}`}>Uczeń nie musi widzieć panelu nauczyciela. Nauczyciel ma swoje sesje i wyniki. Admin ma bezpieczeństwo i użytkowników.</p>
          <div className="mt-8 grid gap-3">
            {roles.map((r, i) => <button key={r.title} onClick={() => setActiveRole(i)} className={`rounded-2xl border p-4 text-left transition ${i === activeRole ? "border-[#0078d4] bg-[#0078d4]/12" : palette.soft2}`}><div className="font-semibold">{r.title}</div><div className={`mt-1 text-sm ${palette.muted}`}>{r.desc}</div></button>)}
          </div>
        </div>
        <div className={`rounded-[34px] border p-6 backdrop-blur-2xl ${palette.soft}`}>
          <div className="rounded-[26px] border border-white/10 bg-[#020817] p-6 text-white">
            <div className="flex items-center gap-4"><div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#0078d4]"><Icon className="h-8 w-8" /></div><div><div className="text-sm text-white/45">Widok panelu</div><h3 className="text-3xl font-semibold">{role.title}</h3></div></div>
            <div className="mt-8 grid gap-3">
              {role.points.map((p) => <div key={p} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4"><CheckCircle2 className="h-5 w-5 text-emerald-400" /><span>{p}</span></div>)}
            </div>
            <div className="mt-8 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-white/62">{role.desc}</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ isLight, palette }: any) {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} eyebrow="Proces" title="Od stworzenia testu do raportu" text="EduNex prowadzi cały proces egzaminacyjny bez ręcznego chaosu i bez zgubionych wyników." />
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-4">
        {workflow.map((w) => <div key={w.nr} className={`rounded-[28px] border p-6 ${palette.soft}`}><div className="text-sm font-semibold text-[#50a7f2]">{w.nr}</div><h3 className="mt-5 text-xl font-semibold">{w.title}</h3><p className={`mt-3 text-sm leading-6 ${palette.muted}`}>{w.text}</p></div>)}
      </div>
    </section>
  );
}

function DemoSection({ isLight, palette }: any) {
  return (
    <section id="demo" className="px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-2">
        <div>
          <Badge isLight={isLight} icon={Rocket}>Demo systemu</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Panel, który wygląda jak produkt, nie jak szkolny formularz.</h2>
          <p className={`mt-5 leading-7 ${palette.muted}`}>Na stronie głównej pokazujemy realne funkcje: aktywna sesja, wyniki, AI alert, lista uczniów i kontrola czasu.</p>
        </div>
        <div className={`rounded-[34px] border p-4 ${palette.soft}`}>
          <div className="rounded-[26px] border border-white/10 bg-[#020817] p-5 text-white">
            <div className="flex items-center justify-between"><h3 className="font-semibold">Sesja egzaminacyjna</h3><span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">LIVE</span></div>
            <div className="mt-5 grid gap-3">
              {["Anna Kowalska", "Michał Nowak", "Oliwia Zielińska", "Jan Wiśniewski"].map((name, i) => <div key={name} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-3"><span>{name}</span><span className="text-sm text-white/50">{[92, 84, 76, 68][i]}%</span></div>)}
            </div>
            <button onClick={() => toast.success("Demo: raport został wygenerowany") } className="mt-5 w-full rounded-2xl bg-[#0078d4] py-3 text-sm font-semibold">Generuj raport</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModulesSection({ isLight, palette }: any) {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} eyebrow="Moduły" title="Dużo funkcji ogólnych, które robią różnicę" text="Moduły zostały pokazane jako kafelki, żeby strona wyglądała bogato i jasno komunikowała zakres platformy." />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {modules.map(({ icon: Icon, label }) => <div key={label} className={`flex items-center gap-3 rounded-2xl border p-4 ${palette.soft2}`}><Icon className="h-5 w-5 text-[#50a7f2]" /><span className="text-sm font-semibold">{label}</span></div>)}
      </div>
    </section>
  );
}

function AISection({ isLight, palette }: any) {
  return (
    <section id="ai" className="px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
        <div className={`rounded-[34px] border p-8 ${palette.soft}`}>
          <Badge isLight={isLight} icon={BrainCircuit}>AI EduNex</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Asystent, który pomaga nauczycielowi, nie zastępuje szkoły.</h2>
          <p className={`mt-5 leading-7 ${palette.muted}`}>AI może generować pytania, analizować wyniki, oceniać odpowiedzi opisowe i wskazywać tematy do powtórki.</p>
        </div>
        <div className="grid gap-4">
          {[{ icon: Bot, title: "Generator pytań", text: "Na podstawie tematu, klasy i poziomu trudności." }, { icon: Lightbulb, title: "Analiza błędów", text: "Wskazuje, które zagadnienia sprawiają problem." }, { icon: FileText, title: "Ocena esejów", text: "Pomaga z kryteriami i sugestiami punktacji." }].map(({ icon: Icon, title, text }) => <div key={title} className={`rounded-[28px] border p-6 ${palette.soft}`}><Icon className="h-6 w-6 text-[#50a7f2]" /><h3 className="mt-4 text-xl font-semibold">{title}</h3><p className={`mt-2 text-sm leading-6 ${palette.muted}`}>{text}</p></div>)}
        </div>
      </div>
    </section>
  );
}

function SecuritySection({ isLight, palette }: any) {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} eyebrow="Bezpieczeństwo" title="Wygląd premium + fundament pod poważną szkołę" text="Strona komunikuje bezpieczeństwo: nie tylko ładny UI, ale też logowanie, 2FA, audyt i kontrola dostępu." />
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {security.map((s) => <div key={s} className={`flex items-center gap-3 rounded-2xl border p-5 ${palette.soft2}`}><Lock className="h-5 w-5 text-[#50a7f2]" /><span className="font-semibold">{s}</span></div>)}
      </div>
    </section>
  );
}

function PricingSection({ isLight, palette }: any) {
  return (
    <section id="cennik" className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} eyebrow="Pakiety" title="Gotowe pod szkołę, nauczyciela i klasę" text="Cennik jest prosty, ale wygląda jak produkt SaaS — można go później podpiąć pod płatności." />
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-3">
        {plans.map((p, i) => <div key={p.name} className={`rounded-[30px] border p-7 ${i === 1 ? "border-[#0078d4] bg-[#0078d4]/12" : palette.soft}`}><div className="flex items-center justify-between"><h3 className="text-2xl font-semibold">{p.name}</h3><span className="rounded-full bg-[#0078d4]/15 px-3 py-1 text-xs font-semibold text-[#50a7f2]">{p.tag}</span></div><div className="mt-6 text-4xl font-semibold">{p.price}</div><div className="mt-6 grid gap-3">{p.items.map((x) => <div key={x} className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> {x}</div>)}</div><Link to="/auth" className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#0078d4] px-5 py-3 text-sm font-semibold text-white">Wybierz <ArrowRight className="h-4 w-4" /></Link></div>)}
      </div>
    </section>
  );
}

function FAQSection({ isLight, palette, activeFaq, setActiveFaq }: any) {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} eyebrow="FAQ" title="Najważniejsze pytania od razu na stronie" text="Sekcja FAQ domyka landing i zmniejsza chaos informacyjny." />
      <div className="mx-auto max-w-4xl space-y-3">
        {faqs.map(([q, a], i) => <button key={q} onClick={() => setActiveFaq(activeFaq === i ? -1 : i)} className={`w-full rounded-3xl border p-5 text-left ${palette.soft2}`}><div className="flex items-center justify-between gap-4"><span className="font-semibold">{q}</span><ChevronDown className={`h-5 w-5 transition ${activeFaq === i ? "rotate-180" : ""}`} /></div>{activeFaq === i && <p className={`mt-4 text-sm leading-6 ${palette.muted}`}>{a}</p>}</button>)}
      </div>
    </section>
  );
}

function ContactSection({ isLight, palette }: any) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Wiadomość demo zapisana — formularz gotowy do podpięcia pod backend.");
  };
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <div className={`mx-auto grid max-w-7xl gap-8 rounded-[36px] border p-8 lg:grid-cols-[0.9fr_1.1fr] ${palette.soft}`}>
        <div><Badge isLight={isLight} icon={Mail}>Kontakt</Badge><h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Chcesz wdrożyć EduNex w szkole?</h2><p className={`mt-5 leading-7 ${palette.muted}`}>Formularz można później podpiąć pod Resend/Supabase. Teraz wygląda jak gotowa sekcja kontaktowa.</p></div>
        <form onSubmit={submit} className="grid gap-3">
          <input className={`rounded-2xl border px-4 py-3 outline-none ${isLight ? "border-slate-200 bg-white" : "border-white/12 bg-white/[0.055] text-white placeholder:text-white/40"}`} placeholder="Imię i nazwisko" />
          <input className={`rounded-2xl border px-4 py-3 outline-none ${isLight ? "border-slate-200 bg-white" : "border-white/12 bg-white/[0.055] text-white placeholder:text-white/40"}`} placeholder="E-mail" />
          <textarea className={`min-h-32 rounded-2xl border px-4 py-3 outline-none ${isLight ? "border-slate-200 bg-white" : "border-white/12 bg-white/[0.055] text-white placeholder:text-white/40"}`} placeholder="Wiadomość" />
          <button className="rounded-2xl bg-[#0078d4] px-5 py-3 text-sm font-semibold text-white">Wyślij wiadomość</button>
        </form>
      </div>
    </section>
  );
}

function StickyActions({ isLight, goAuth, toggle }: { isLight: boolean; goAuth: () => void; toggle: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#020617]/80 p-2 shadow-2xl backdrop-blur-2xl md:flex">
      <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white">{isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</button>
      <button onClick={goAuth} className="rounded-full bg-[#0078d4] px-5 py-2.5 text-sm font-semibold text-white">Otwórz panel</button>
    </div>
  );
}

function Footer({ isLight, palette }: any) {
  return (
    <footer className={`relative z-10 border-t px-5 py-10 sm:px-8 lg:px-10 ${isLight ? "border-slate-200" : "border-white/10"}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0078d4] text-white"><Sparkles className="h-5 w-5" /></div><div><div className="font-semibold">EduNex</div><div className={`text-xs ${palette.muted}`}>Nowoczesna platforma egzaminacyjna</div></div></div>
        <div className={`flex flex-wrap gap-3 text-sm ${palette.muted}`}><span>RODO</span><span>2FA</span><span>AI</span><span>PIN</span><span>Vercel</span><span>Supabase</span></div>
      </div>
    </footer>
  );
}
