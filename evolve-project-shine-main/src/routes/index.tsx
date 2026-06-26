import { useEffect, useMemo, useRef, useState, type ComponentType, type FormEvent } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  BrainCircuit,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Cloud,
  Database,
  Eye,
  FileText,
  Fingerprint,
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
type Palette = ReturnType<typeof createPalette>;

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "EduNex — państwowa jakość egzaminów online" },
      {
        name: "description",
        content:
          "EduNex to nowoczesna platforma egzaminacyjna dla szkół: sprawdziany, egzaminy, PIN ucznia, panel nauczyciela, AI, raporty, cennik i bezpieczeństwo.",
      },
    ],
  }),
});

const navLinks = [
  ["Platforma", "#platforma"],
  ["Panele", "#panele"],
  ["AI", "#ai"],
  ["Bezpieczeństwo", "#bezpieczenstwo"],
  ["Cennik", "#cennik"],
  ["FAQ", "#faq"],
];

const heroStats = [
  ["6 cyfr", "PIN ucznia"],
  ["2FA", "dla admina"],
  ["AI", "pytania i analiza"],
  ["LIVE", "wyniki klasy"],
];

const platformBlocks: { icon: IconType; title: string; text: string }[] = [
  { icon: ClipboardList, title: "Egzaminy online", text: "Twórz testy, sprawdziany, kartkówki i egzaminy końcowe z punktacją oraz limitem czasu." },
  { icon: Hash, title: "Sesje PIN", text: "Uczeń wpisuje imię, nazwisko i 6-cyfrowy kod. Bez zbędnych kont przy szybkim egzaminie." },
  { icon: Library, title: "Biblioteka pytań", text: "Gotowe zestawy, własne pytania, kategorie, poziomy trudności i ponowne używanie materiałów." },
  { icon: BarChart3, title: "Raporty live", text: "Wyniki, średnia, czas pracy, postęp klasy i szybka analiza problematycznych zadań." },
  { icon: Cloud, title: "Multimedia", text: "Pytania z obrazem, plikiem, audio, wideo i materiałami pomocniczymi w storage." },
  { icon: BadgeCheck, title: "Certyfikaty", text: "Po zakończeniu testu system może wygenerować potwierdzenie, PDF albo numer weryfikacyjny." },
];

const panels = [
  {
    icon: GraduationCap,
    title: "Panel ucznia",
    subtitle: "Prosty, szybki i odporny na chaos",
    features: ["Wejście kodem PIN", "Timer i pasek postępu", "Pytania z multimediami", "Ekran wyniku"],
  },
  {
    icon: Users,
    title: "Panel nauczyciela",
    subtitle: "Centrum dowodzenia klasą",
    features: ["Generator sesji", "Podgląd odpowiedzi", "Biblioteka egzaminów", "Eksport wyników"],
  },
  {
    icon: Building2,
    title: "Panel administratora",
    subtitle: "Kontrola szkoły i bezpieczeństwa",
    features: ["Role i uprawnienia", "2FA i logi", "Zarządzanie klasami", "Audyt aktywności"],
  },
];

const workflow = [
  { nr: "01", title: "Projektujesz", text: "Dodajesz pytania, multimedia, punktację, limit czasu i ustawienia dostępności." },
  { nr: "02", title: "Uruchamiasz", text: "System tworzy sesję i kod PIN dla uczniów lub grupy klasowej." },
  { nr: "03", title: "Monitorujesz", text: "Nauczyciel widzi postęp, aktywność, czas i oddane prace w czasie rzeczywistym." },
  { nr: "04", title: "Analizujesz", text: "Raport pokazuje wyniki, średnie, trudne pytania i rekomendacje do powtórki." },
];

const aiCards: { icon: IconType; title: string; text: string }[] = [
  { icon: Bot, title: "Generator pytań", text: "AI tworzy pytania do tematu, klasy, poziomu i wymaganego typu odpowiedzi." },
  { icon: BrainCircuit, title: "Ocena opisowa", text: "Pomoc przy esejach, kryteriach, punktacji i komentarzach dla ucznia." },
  { icon: Lightbulb, title: "Rekomendacje", text: "System wskazuje działy, które wymagają powtórzenia po sprawdzianie." },
];

const securityItems = [
  "2FA dla administratora i nauczyciela",
  "OTP resetu hasła przez e-mail",
  "Powiadomienia o nowym logowaniu",
  "Role: uczeń, nauczyciel, rodzic, admin",
  "Audyt zdarzeń i aktywności",
  "RODO-ready architektura danych",
  "Storage dla plików egzaminacyjnych",
  "Ograniczenia sesji i kodów PIN",
];

const modules: { icon: IconType; label: string }[] = [
  { icon: FileText, label: "Pytania wyboru" },
  { icon: CheckCircle2, label: "Prawda / fałsz" },
  { icon: BookOpen, label: "Eseje" },
  { icon: Timer, label: "Limity czasu" },
  { icon: Eye, label: "Podgląd live" },
  { icon: Bell, label: "Powiadomienia" },
  { icon: KeyRound, label: "OTP reset" },
  { icon: Database, label: "Supabase" },
  { icon: Search, label: "Wyszukiwarka" },
  { icon: CalendarClock, label: "Sesje klasowe" },
  { icon: Network, label: "Integracje" },
  { icon: Trophy, label: "Certyfikaty" },
];

const plans = [
  {
    name: "Klasa",
    monthly: 0,
    tag: "Darmowy start",
    desc: "Dla jednej klasy lub szybkich testów próbnych.",
    limits: "1 nauczyciel · podstawowe limity",
    cta: "Zacznij za darmo",
    features: ["Sesje PIN", "Podstawowe wyniki", "Proste sprawdziany", "Panel ucznia"],
  },
  {
    name: "Korepetytor",
    monthly: 49,
    tag: "Indywidualnie",
    desc: "Dla korepetytorów i małych grup.",
    limits: "do 60 uczniów miesięcznie",
    cta: "Wybierz Korepetytor",
    features: ["Biblioteka testów", "Raport ucznia", "Eksport wyników", "Branding podstawowy"],
  },
  {
    name: "Nauczyciel",
    monthly: 99,
    tag: "Najpopularniejszy",
    desc: "Najlepszy pakiet dla aktywnego nauczyciela.",
    limits: "do 250 uczniów miesięcznie",
    cta: "Wybierz Nauczyciel",
    featured: true,
    features: ["AI generator pytań", "Wyniki live", "Sprawdziany i egzaminy", "Eksport PDF/CSV", "Sesje klasowe"],
  },
  {
    name: "Szkoła",
    monthly: 490,
    tag: "Placówka",
    desc: "Dla szkoły z wieloma klasami i nauczycielami.",
    limits: "do 25 nauczycieli",
    cta: "Wybierz Szkoła",
    features: ["Panel admina", "Role i klasy", "2FA", "Raporty zbiorcze", "Wiele bibliotek"],
  },
  {
    name: "Szkoła Plus",
    monthly: 890,
    tag: "Premium",
    desc: "Dla placówek, które chcą pełny system i AI.",
    limits: "do 80 nauczycieli",
    cta: "Wybierz Plus",
    features: ["AI rozszerzone", "Audyt zdarzeń", "Certyfikaty", "Priorytet wsparcia", "Większy storage"],
  },
  {
    name: "Dzielnica",
    monthly: 2990,
    tag: "Sieć szkół",
    desc: "Dla wielu placówek zarządzanych centralnie.",
    limits: "wiele szkół i adminów",
    cta: "Kontakt wdrożeniowy",
    features: ["Multi-school", "Panel centralny", "Raporty porównawcze", "SLA", "Onboarding"],
  },
  {
    name: "Kuratorium",
    monthly: null,
    tag: "Enterprise",
    desc: "Największy wariant dla instytucji i wdrożeń specjalnych.",
    limits: "indywidualne limity i umowa",
    cta: "Umów rozmowę",
    features: ["Dedykowana konfiguracja", "Integracje", "Zgodność formalna", "Raporty strategiczne", "Wsparcie premium"],
  },
];

const faqs = [
  ["Czy cennik jest już normalny?", "Tak. Strona ma teraz 7 pakietów: Klasa, Korepetytor, Nauczyciel, Szkoła, Szkoła Plus, Dzielnica i Kuratorium."],
  ["Czy jest przełącznik miesięcznie / rocznie?", "Tak. Roczny wariant pokazuje rabat i obniżoną cenę w pakietach płatnych."],
  ["Czy uczeń musi mieć konto?", "Nie. Może wejść szybkim kodem PIN, jeśli nauczyciel uruchomi sesję egzaminacyjną."],
  ["Czy można później podpiąć płatności?", "Tak. Sekcja cennika jest przygotowana pod przyciski zakupu lub kontakt z wdrożeniem."],
];

function createPalette(isLight: boolean) {
  return {
    page: isLight ? "bg-[#f6f9fd] text-[#0f172a]" : "bg-[#020617] text-white",
    muted: isLight ? "text-slate-600" : "text-white/62",
    faint: isLight ? "text-slate-500" : "text-white/45",
    nav: isLight ? "border-slate-200 bg-white/82 text-slate-950" : "border-white/10 bg-[#020617]/78 text-white",
    card: isLight ? "border-slate-200 bg-white/88 shadow-[0_24px_90px_rgba(15,23,42,0.10)]" : "border-white/10 bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.35)]",
    card2: isLight ? "border-slate-200 bg-white/70" : "border-white/10 bg-white/[0.04]",
    chip: isLight ? "border-slate-200 bg-white text-slate-700" : "border-white/10 bg-white/[0.06] text-white/72",
    input: isLight ? "border-slate-200 bg-white text-slate-950 placeholder:text-slate-400" : "border-white/12 bg-white/[0.055] text-white placeholder:text-white/40",
  };
}

function Landing() {
  const { theme, setTheme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(1);
  const [annual, setAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const progressRef = useRef<HTMLDivElement>(null);
  const isLight = theme === "light";
  const palette = useMemo(() => createPalette(isLight), [isLight]);

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

  const goAuth = () => navigate({ to: "/auth" });

  return (
    <div className={`min-h-screen overflow-x-hidden selection:bg-[#0078d4]/30 ${palette.page}`}>
      <Toaster theme={isLight ? "light" : "dark"} position="top-center" />
      <div ref={progressRef} className="fixed left-0 top-0 z-[90] h-1 w-full origin-left scale-x-0 bg-[#0078d4]" />
      <Background isLight={isLight} />
      <NavBar palette={palette} isLight={isLight} toggle={toggle} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

      <main className="relative z-10">
        <Hero palette={palette} isLight={isLight} goAuth={goAuth} />
        <InstitutionStrip palette={palette} />
        <PlatformSection palette={palette} isLight={isLight} />
        <PanelSection palette={palette} isLight={isLight} activePanel={activePanel} setActivePanel={setActivePanel} />
        <WorkflowSection palette={palette} isLight={isLight} />
        <AISection palette={palette} isLight={isLight} />
        <ModulesSection palette={palette} isLight={isLight} />
        <SecuritySection palette={palette} isLight={isLight} />
        <PricingSection palette={palette} isLight={isLight} annual={annual} setAnnual={setAnnual} />
        <FAQSection palette={palette} isLight={isLight} activeFaq={activeFaq} setActiveFaq={setActiveFaq} />
        <ContactSection palette={palette} isLight={isLight} />
      </main>

      <StickyDock isLight={isLight} toggle={toggle} goAuth={goAuth} />
      <Footer palette={palette} isLight={isLight} />
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
            ? "radial-gradient(circle at 18% 8%, rgba(0,120,212,0.16), transparent 28%), radial-gradient(circle at 82% 10%, rgba(80,230,255,0.13), transparent 28%), linear-gradient(135deg, #fbfdff, #eef5ff 46%, #ffffff)"
            : "radial-gradient(circle at 15% 8%, rgba(0,120,212,0.30), transparent 31%), radial-gradient(circle at 82% 6%, rgba(80,230,255,0.13), transparent 31%), radial-gradient(circle at 48% 94%, rgba(37,99,235,0.20), transparent 38%), linear-gradient(135deg, #020617, #07111f 48%, #01030a)",
        }}
      />
      <div
        className={`absolute inset-0 ${isLight ? "opacity-[0.34]" : "opacity-[0.18]"}`}
        style={{
          backgroundImage: isLight
            ? "linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px)"
            : "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <motion.div className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-[#0078d4]/25 blur-3xl" animate={{ x: [0, 60, 10, 0], y: [0, -20, 25, 0] }} transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }} />
      <motion.div className="absolute -right-24 top-40 h-[460px] w-[460px] rounded-full bg-cyan-400/16 blur-3xl" animate={{ x: [0, -40, 20, 0], y: [0, 35, -10, 0] }} transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }} />
    </div>
  );
}

function NavBar({ palette, isLight, toggle, menuOpen, setMenuOpen }: { palette: Palette; isLight: boolean; toggle: () => void; menuOpen: boolean; setMenuOpen: (v: boolean) => void }) {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 sm:px-6">
      <nav className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 shadow-lg backdrop-blur-2xl ${palette.nav}`}>
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0078d4] text-white shadow-[0_12px_34px_rgba(0,120,212,0.32)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">EduNex</div>
            <div className={`mt-1 text-[10px] uppercase tracking-[0.22em] ${palette.faint}`}>exam cloud</div>
          </div>
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map(([label, href]) => (
            <a key={href} href={href} className={`rounded-full px-4 py-2 text-sm font-medium transition ${isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-950" : "text-white/62 hover:bg-white/8 hover:text-white"}`}>
              {label}
            </a>
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
            {navLinks.map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)} className="rounded-2xl px-4 py-3 text-sm font-semibold">
                {label}
              </a>
            ))}
            <Link to="/auth" className="rounded-2xl bg-[#0078d4] px-4 py-3 text-center text-sm font-semibold text-white">
              Przejdź do logowania
            </Link>
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

function Hero({ palette, isLight, goAuth }: { palette: Palette; isLight: boolean; goAuth: () => void }) {
  return (
    <section className="mx-auto flex min-h-[94vh] max-w-7xl flex-col justify-center px-5 pb-20 pt-32 sm:px-8 lg:px-10">
      <div className="grid items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <Badge isLight={isLight} icon={ShieldCheck}>Państwowa jakość dla szkoły</Badge>
          <h1 className="mt-7 max-w-5xl text-5xl font-semibold leading-[0.94] tracking-[-0.075em] sm:text-7xl lg:text-[88px]">
            Strona główna EduNex przebudowana jak produkt premium.
          </h1>
          <p className={`mt-7 max-w-2xl text-lg leading-8 sm:text-xl ${palette.muted}`}>
            Nowy landing pokazuje system egzaminacyjny od A do Z: panele, egzaminy, sprawdziany, AI, bezpieczeństwo, raporty i naprawiony cennik z realnymi pakietami.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button onClick={goAuth} className="group inline-flex items-center justify-center gap-2 rounded-full bg-[#0078d4] px-6 py-3.5 text-sm font-semibold text-white shadow-[0_18px_42px_rgba(0,120,212,0.30)] transition hover:bg-[#106ebe]">
              Otwórz panel <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </button>
            <a href="#cennik" className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold backdrop-blur transition ${palette.chip}`}>
              Zobacz cennik <BadgeCheck className="h-4 w-4" />
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {heroStats.map(([value, label]) => (
              <div key={label} className={`rounded-2xl border p-4 backdrop-blur ${palette.card2}`}>
                <div className="text-2xl font-semibold tracking-tight">{value}</div>
                <div className={`mt-1 text-xs ${palette.muted}`}>{label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.65, delay: 0.1 }}>
          <HeroDashboard palette={palette} />
        </motion.div>
      </div>
    </section>
  );
}

function HeroDashboard({ palette }: { palette: Palette }) {
  return (
    <div className={`relative overflow-hidden rounded-[34px] border p-4 backdrop-blur-2xl ${palette.card}`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_10%,rgba(0,120,212,0.20),transparent_32%)]" />
      <div className="relative rounded-[28px] border border-white/10 bg-[#020817] p-5 text-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-yellow-300" />
            <span className="h-3 w-3 rounded-full bg-green-400" />
          </div>
          <span className="text-xs text-white/45">EduNex Command Center</span>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/38">Aktywna sesja</p>
              <h3 className="mt-2 text-2xl font-semibold">Sprawdzian — Matematyka</h3>
            </div>
            <div className="rounded-2xl bg-[#0078d4] px-5 py-3 text-2xl font-bold">482 913</div>
          </div>
          <div className="mt-5 h-2 rounded-full bg-white/10">
            <motion.div className="h-full rounded-full bg-[#50e6ff]" initial={{ width: "26%" }} animate={{ width: "82%" }} transition={{ duration: 2.8, repeat: Infinity, repeatType: "reverse" }} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[["28", "uczniów"], ["87%", "średnia"], ["11m", "czas"]].map(([a, b]) => (
            <div key={b} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="text-2xl font-semibold">{a}</div>
              <div className="text-xs text-white/45">{b}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3">
          {["AI wykryło trudne zadanie nr 7", "4 uczniów wymaga dogrywki", "Raport PDF gotowy do eksportu"].map((x) => (
            <div key={x} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/72">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" /> {x}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InstitutionStrip({ palette }: { palette: Palette }) {
  return (
    <section className="relative z-10 border-y border-white/8 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 px-5 sm:px-8 lg:px-10">
        {["Szkoły", "Nauczyciele", "Uczniowie", "Rodzice", "Dyrekcja", "AI", "Supabase", "Vercel"].map((x) => (
          <span key={x} className={`rounded-full border px-4 py-2 text-xs font-semibold ${palette.chip}`}>{x}</span>
        ))}
      </div>
    </section>
  );
}

function SectionHeader({ eyebrow, title, text, icon, isLight }: { eyebrow: string; title: string; text: string; icon: IconType; isLight: boolean }) {
  return (
    <div className="mx-auto mb-12 max-w-3xl text-center">
      <Badge isLight={isLight} icon={icon}>{eyebrow}</Badge>
      <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">{title}</h2>
      <p className={`mx-auto mt-5 max-w-2xl text-base leading-7 ${isLight ? "text-slate-600" : "text-white/62"}`}>{text}</p>
    </div>
  );
}

function PlatformSection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section id="platforma" className="relative px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} icon={Layers} eyebrow="Platforma" title="Cała strona pokazuje teraz prawdziwy system" text="Nie tylko ładny hero. Landing ma opisy modułów, proces, role, AI, bezpieczeństwo i sensowny cennik." />
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platformBlocks.map(({ icon: Icon, title, text }) => (
          <motion.div whileHover={{ y: -6 }} key={title} className={`rounded-[28px] border p-6 backdrop-blur-2xl ${palette.card}`}>
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0078d4] text-white"><Icon className="h-5 w-5" /></div>
            <h3 className="mt-6 text-xl font-semibold tracking-tight">{title}</h3>
            <p className={`mt-3 text-sm leading-6 ${palette.muted}`}>{text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function PanelSection({ palette, isLight, activePanel, setActivePanel }: { palette: Palette; isLight: boolean; activePanel: number; setActivePanel: (n: number) => void }) {
  const panel = panels[activePanel];
  const Icon = panel.icon;
  return (
    <section id="panele" className="relative px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.88fr_1.12fr]">
        <div>
          <Badge isLight={isLight} icon={Users}>Panele</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Uczeń, nauczyciel i admin mają własne centrum pracy.</h2>
          <p className={`mt-5 leading-7 ${palette.muted}`}>Każda rola widzi tylko to, co ma sens. To robi wrażenie na stronie i porządkuje cały produkt.</p>
          <div className="mt-8 grid gap-3">
            {panels.map((p, i) => (
              <button key={p.title} onClick={() => setActivePanel(i)} className={`rounded-2xl border p-4 text-left transition ${i === activePanel ? "border-[#0078d4] bg-[#0078d4]/12" : palette.card2}`}>
                <div className="font-semibold">{p.title}</div>
                <div className={`mt-1 text-sm ${palette.muted}`}>{p.subtitle}</div>
              </button>
            ))}
          </div>
        </div>

        <div className={`rounded-[34px] border p-6 backdrop-blur-2xl ${palette.card}`}>
          <div className="rounded-[28px] border border-white/10 bg-[#020817] p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#0078d4]"><Icon className="h-8 w-8" /></div>
              <div>
                <div className="text-sm text-white/45">Aktywny widok</div>
                <h3 className="text-3xl font-semibold">{panel.title}</h3>
              </div>
            </div>
            <div className="mt-8 grid gap-3">
              {panel.features.map((p) => (
                <div key={p} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" /> <span>{p}</span>
                </div>
              ))}
            </div>
            <div className="mt-8 rounded-2xl bg-white/[0.04] p-4 text-sm leading-6 text-white/62">{panel.subtitle}. Panel wygląda nowocześnie, ale jest prosty do używania w szkole.</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} icon={Workflow} eyebrow="Proces" title="Od sprawdzianu do raportu w 4 krokach" text="Landing teraz tłumaczy, jak system działa od strony nauczyciela i ucznia." />
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-4">
        {workflow.map((w) => (
          <div key={w.nr} className={`rounded-[28px] border p-6 ${palette.card}`}>
            <div className="text-sm font-semibold text-[#50a7f2]">{w.nr}</div>
            <h3 className="mt-5 text-xl font-semibold">{w.title}</h3>
            <p className={`mt-3 text-sm leading-6 ${palette.muted}`}>{w.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function AISection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section id="ai" className="px-5 py-24 sm:px-8 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_1fr]">
        <div className={`rounded-[34px] border p-8 ${palette.card}`}>
          <Badge isLight={isLight} icon={BrainCircuit}>AI EduNex</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">AI ma wyglądać jak realna funkcja, nie ozdoba.</h2>
          <p className={`mt-5 leading-7 ${palette.muted}`}>Sekcja AI pokazuje praktyczne zastosowania: pytania, ocena opisowa i rekomendacje do powtórek.</p>
        </div>
        <div className="grid gap-4">
          {aiCards.map(({ icon: Icon, title, text }) => (
            <div key={title} className={`rounded-[28px] border p-6 ${palette.card}`}>
              <Icon className="h-6 w-6 text-[#50a7f2]" />
              <h3 className="mt-4 text-xl font-semibold">{title}</h3>
              <p className={`mt-2 text-sm leading-6 ${palette.muted}`}>{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} icon={Library} eyebrow="Moduły" title="Dużo funkcji, ale pokazanych czysto" text="Kafelki modułów dają wrażenie dużego systemu bez rozwalania czytelności strony." />
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {modules.map(({ icon: Icon, label }) => (
          <div key={label} className={`flex items-center gap-3 rounded-2xl border p-4 ${palette.card2}`}>
            <Icon className="h-5 w-5 text-[#50a7f2]" /> <span className="text-sm font-semibold">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function SecuritySection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section id="bezpieczenstwo" className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} icon={ShieldCheck} eyebrow="Bezpieczeństwo" title="Szkolny system musi wyglądać poważnie i działać bezpiecznie" text="Na stronie mocniej pokazane są 2FA, OTP, role, audyt, storage i kontrola dostępu." />
      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 lg:grid-cols-4">
        {securityItems.map((s) => (
          <div key={s} className={`flex items-center gap-3 rounded-2xl border p-5 ${palette.card2}`}>
            <Lock className="h-5 w-5 shrink-0 text-[#50a7f2]" /> <span className="text-sm font-semibold">{s}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection({ palette, isLight, annual, setAnnual }: { palette: Palette; isLight: boolean; annual: boolean; setAnnual: (v: boolean) => void }) {
  const price = (monthly: number | null) => {
    if (monthly === null) return "Indywidualnie";
    if (monthly === 0) return "0 zł";
    return `${annual ? Math.round(monthly * 0.8) : monthly} zł`;
  };

  return (
    <section id="cennik" className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} icon={BadgeCheck} eyebrow="Cennik" title="Cennik naprawiony — teraz wygląda jak SaaS premium" text="Siedem pakietów, roczny rabat, wyróżniony plan i jasny opis, dla kogo jest każdy wariant." />

      <div className="mx-auto mb-8 flex max-w-7xl flex-col items-center justify-between gap-4 rounded-[28px] border p-4 sm:flex-row ${palette.card2}">
        <div>
          <div className="font-semibold">Rozliczenie</div>
          <div className={`text-sm ${palette.muted}`}>Rocznie pokazuje około 20% taniej dla pakietów płatnych.</div>
        </div>
        <div className={`grid grid-cols-2 rounded-full border p-1 ${palette.chip}`}>
          <button onClick={() => setAnnual(false)} className={`rounded-full px-5 py-2 text-sm font-semibold ${!annual ? "bg-[#0078d4] text-white" : ""}`}>Miesięcznie</button>
          <button onClick={() => setAnnual(true)} className={`rounded-full px-5 py-2 text-sm font-semibold ${annual ? "bg-[#0078d4] text-white" : ""}`}>Rocznie -20%</button>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => (
          <motion.div
            key={p.name}
            whileHover={{ y: -6 }}
            className={`relative rounded-[30px] border p-6 backdrop-blur-2xl ${p.featured ? "border-[#0078d4] bg-[#0078d4]/14 shadow-[0_26px_90px_rgba(0,120,212,0.20)]" : palette.card}`}
          >
            {p.featured && <div className="absolute -top-3 left-6 rounded-full bg-[#0078d4] px-4 py-1.5 text-xs font-bold text-white">NAJLEPSZY WYBÓR</div>}
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight">{p.name}</h3>
                <p className={`mt-2 text-sm leading-6 ${palette.muted}`}>{p.desc}</p>
              </div>
              <span className="rounded-full bg-[#0078d4]/15 px-3 py-1 text-xs font-semibold text-[#50a7f2]">{p.tag}</span>
            </div>
            <div className="mt-6">
              <div className="text-4xl font-semibold tracking-tight">{price(p.monthly)}</div>
              {p.monthly !== null && <div className={`mt-1 text-xs ${palette.faint}`}>/ miesiąc {annual && p.monthly > 0 ? "przy płatności rocznej" : ""}</div>}
            </div>
            <div className={`mt-4 rounded-2xl border p-3 text-xs font-semibold ${palette.card2}`}>{p.limits}</div>
            <div className="mt-6 grid gap-3">
              {p.features.map((x) => (
                <div key={x} className="flex items-start gap-2 text-sm leading-5">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" /> {x}
                </div>
              ))}
            </div>
            <Link to="/auth" className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${p.featured ? "bg-[#0078d4] text-white hover:bg-[#106ebe]" : "border border-[#0078d4]/30 text-[#50a7f2] hover:bg-[#0078d4]/10"}`}>
              {p.cta} <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQSection({ palette, isLight, activeFaq, setActiveFaq }: { palette: Palette; isLight: boolean; activeFaq: number; setActiveFaq: (n: number) => void }) {
  return (
    <section id="faq" className="px-5 py-24 sm:px-8 lg:px-10">
      <SectionHeader isLight={isLight} icon={Search} eyebrow="FAQ" title="Najważniejsze pytania od razu wyjaśnione" text="FAQ domyka stronę i wyjaśnia najważniejsze rzeczy o PIN, cenniku i wdrożeniu." />
      <div className="mx-auto max-w-4xl space-y-3">
        {faqs.map(([q, a], i) => (
          <button key={q} onClick={() => setActiveFaq(activeFaq === i ? -1 : i)} className={`w-full rounded-3xl border p-5 text-left ${palette.card2}`}>
            <div className="flex items-center justify-between gap-4">
              <span className="font-semibold">{q}</span>
              <ChevronDown className={`h-5 w-5 transition ${activeFaq === i ? "rotate-180" : ""}`} />
            </div>
            {activeFaq === i && <p className={`mt-4 text-sm leading-6 ${palette.muted}`}>{a}</p>}
          </button>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    toast.success("Wiadomość demo zapisana — formularz gotowy do podpięcia pod backend.");
  };
  return (
    <section className="px-5 py-24 sm:px-8 lg:px-10">
      <div className={`mx-auto grid max-w-7xl gap-8 rounded-[36px] border p-8 lg:grid-cols-[0.9fr_1.1fr] ${palette.card}`}>
        <div>
          <Badge isLight={isLight} icon={Mail}>Kontakt</Badge>
          <h2 className="mt-5 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Gotowe pod rozmowę ze szkołą albo firmą.</h2>
          <p className={`mt-5 leading-7 ${palette.muted}`}>Formularz jest częścią nowego landingu. Można go później podpiąć pod Resend, Supabase albo CRM.</p>
        </div>
        <form onSubmit={submit} className="grid gap-3">
          <input className={`rounded-2xl border px-4 py-3 outline-none ${palette.input}`} placeholder="Imię i nazwisko" />
          <input className={`rounded-2xl border px-4 py-3 outline-none ${palette.input}`} placeholder="E-mail" />
          <textarea className={`min-h-32 rounded-2xl border px-4 py-3 outline-none ${palette.input}`} placeholder="Wiadomość" />
          <button className="rounded-2xl bg-[#0078d4] px-5 py-3 text-sm font-semibold text-white">Wyślij wiadomość</button>
        </form>
      </div>
    </section>
  );
}

function StickyDock({ isLight, toggle, goAuth }: { isLight: boolean; toggle: () => void; goAuth: () => void }) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 hidden -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#020617]/80 p-2 shadow-2xl backdrop-blur-2xl md:flex">
      <button onClick={toggle} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white">{isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</button>
      <button onClick={goAuth} className="rounded-full bg-[#0078d4] px-5 py-2.5 text-sm font-semibold text-white">Otwórz panel</button>
    </div>
  );
}

function Footer({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <footer className={`relative z-10 border-t px-5 py-10 sm:px-8 lg:px-10 ${isLight ? "border-slate-200" : "border-white/10"}`}>
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0078d4] text-white"><Sparkles className="h-5 w-5" /></div>
          <div>
            <div className="font-semibold">EduNex</div>
            <div className={`text-xs ${palette.muted}`}>Nowoczesna platforma egzaminacyjna</div>
          </div>
        </div>
        <div className={`flex flex-wrap gap-3 text-sm ${palette.muted}`}>
          <span>RODO</span><span>2FA</span><span>AI</span><span>PIN</span><span>Vercel</span><span>Supabase</span>
        </div>
      </div>
    </footer>
  );
}
