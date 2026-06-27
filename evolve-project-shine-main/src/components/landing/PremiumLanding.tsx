import { useEffect, useMemo, useRef, useState, type ComponentType } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
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
  GraduationCap,
  Hash,
  KeyRound,
  Layers,
  Library,
  Lightbulb,
  Loader2,
  Lock,
  Mail,
  Menu,
  Moon,
  Network,
  Radio,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Timer,
  Trophy,
  Users,
  Workflow,
  X,
  Zap,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { useTheme } from "@/lib/theme";

type IconType = ComponentType<{ className?: string }>;
type Palette = ReturnType<typeof createPalette>;

type Plan = {
  name: string;
  monthly: number | null;
  tag: string;
  desc: string;
  limits: string;
  cta: string;
  featured?: boolean;
  features: string[];
};

const navLinks = [
  ["Start", "#platforma"],
  ["Demo", "#panele"],
  ["AI", "#ai"],
  ["Cennik", "#cennik"],
  ["FAQ", "#faq"],
];

const heroStats = [
  ["PIN", "wejście ucznia"],
  ["AI", "generator pytań"],
  ["LIVE", "podgląd klasy"],
  ["2FA", "bezpieczne konta"],
];

const platformBlocks: { icon: IconType; title: string; text: string }[] = [
  {
    icon: ClipboardList,
    title: "Egzaminy online",
    text: "Twórz testy, sprawdziany i egzaminy końcowe z punktacją, limitem czasu i automatycznym zapisem wyników.",
  },
  {
    icon: Hash,
    title: "Sesje PIN",
    text: "Uczeń wpisuje imię, nazwisko i 6-cyfrowy kod. Bez zakładania konta przy szybkim sprawdzianie.",
  },
  {
    icon: Library,
    title: "Biblioteka pytań",
    text: "Gotowe zestawy, własne pytania, kategorie, poziomy trudności i ponowne używanie materiałów.",
  },
  {
    icon: BarChart3,
    title: "Raporty live",
    text: "Wyniki, średnia, czas pracy, postęp klasy i szybka analiza problematycznych zadań.",
  },
  {
    icon: Cloud,
    title: "Multimedia",
    text: "Pytania z obrazem, plikiem, audio, wideo i materiałami pomocniczymi w storage.",
  },
  {
    icon: BadgeCheck,
    title: "Potwierdzenia",
    text: "Po zakończeniu testu system może wygenerować wynik, PDF albo numer weryfikacyjny.",
  },
];

const panels = [
  {
    icon: GraduationCap,
    title: "Panel ucznia",
    subtitle: "Prosty, szybki i odporny na chaos",
    features: [
      "Wejście kodem PIN",
      "Timer i pasek postępu",
      "Pytania z multimediami",
      "Ekran wyniku",
    ],
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
  {
    nr: "01",
    title: "Projektujesz",
    text: "Dodajesz pytania, multimedia, punktację, limit czasu i ustawienia dostępności.",
  },
  {
    nr: "02",
    title: "Uruchamiasz",
    text: "System tworzy sesję i kod PIN dla uczniów lub grupy klasowej.",
  },
  {
    nr: "03",
    title: "Monitorujesz",
    text: "Nauczyciel widzi postęp, aktywność, czas i oddane prace w czasie rzeczywistym.",
  },
  {
    nr: "04",
    title: "Analizujesz",
    text: "Raport pokazuje wyniki, średnie, trudne pytania i rekomendacje do powtórki.",
  },
];

const aiCards: { icon: IconType; title: string; text: string }[] = [
  {
    icon: Bot,
    title: "Generator pytań",
    text: "AI tworzy pytania do tematu, klasy, poziomu i wymaganego typu odpowiedzi.",
  },
  {
    icon: BrainCircuit,
    title: "Ocena opisowa",
    text: "Pomoc przy esejach, kryteriach, punktacji i komentarzach dla ucznia.",
  },
  {
    icon: Lightbulb,
    title: "Rekomendacje",
    text: "System wskazuje działy, które wymagają powtórzenia po sprawdzianie.",
  },
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

const plans: Plan[] = [
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
    features: [
      "AI generator pytań",
      "Wyniki live",
      "Sprawdziany i egzaminy",
      "Eksport PDF/CSV",
      "Sesje klasowe",
    ],
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
    features: [
      "AI rozszerzone",
      "Audyt zdarzeń",
      "Certyfikaty",
      "Priorytet wsparcia",
      "Większy storage",
    ],
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
    features: [
      "Dedykowana konfiguracja",
      "Integracje",
      "Zgodność formalna",
      "Raporty strategiczne",
      "Wsparcie premium",
    ],
  },
];

const faqs = [
  [
    "Czy uczeń musi mieć konto?",
    "Nie. Może wejść szybkim kodem PIN, jeśli nauczyciel uruchomi sesję egzaminacyjną.",
  ],
  [
    "Czy da się używać pytań z multimediami?",
    "Tak. System jest przygotowany pod obrazy, pliki, audio, wideo i materiały pomocnicze.",
  ],
  [
    "Czy są raporty dla nauczyciela?",
    "Tak. Panel pokazuje wyniki, średnie, czas pracy, aktywność i oddane prace.",
  ],
  [
    "Czy można podpiąć płatności?",
    "Tak. Sekcja cennika jest gotowa pod przyciski zakupu lub kontakt wdrożeniowy.",
  ],
];

function createPalette(isLight: boolean) {
  return {
    page: isLight ? "bg-[#f3f6fb] text-[#0f172a]" : "bg-[#020617] text-white",
    muted: isLight ? "text-slate-600" : "text-white/62",
    faint: isLight ? "text-slate-500" : "text-white/45",
    nav: isLight
      ? "border-white/70 bg-white/78 text-slate-950"
      : "border-white/10 bg-[#020617]/78 text-white",
    card: isLight
      ? "border-white/80 bg-white/86 shadow-[0_28px_90px_rgba(15,23,42,0.12)]"
      : "border-white/10 bg-white/[0.055] shadow-[0_24px_90px_rgba(0,0,0,0.35)]",
    card2: isLight ? "border-white/70 bg-white/70" : "border-white/10 bg-white/[0.04]",
    chip: isLight
      ? "border-[#d2d0ce] bg-white/86 text-slate-700"
      : "border-white/10 bg-white/[0.06] text-white/72",
    input: isLight
      ? "border-[#d2d0ce] bg-white text-slate-950 placeholder:text-slate-400"
      : "border-white/12 bg-white/[0.055] text-white placeholder:text-white/40",
  };
}

const sectionAnim = {
  hidden: { opacity: 0, y: 28, filter: "blur(8px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export function PremiumLanding() {
  const { theme, setTheme, toggle } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activePanel, setActivePanel] = useState(1);
  const [annual, setAnnual] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [showIntro, setShowIntro] = useState(true);
  const [authTransition, setAuthTransition] = useState(false);
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
    const t = window.setTimeout(() => setShowIntro(false), 1500);
    return () => window.clearTimeout(t);
  }, []);

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

  const goAuth = () => {
    if (authTransition) return;
    setAuthTransition(true);
    window.setTimeout(() => navigate({ to: "/auth" }), 760);
  };

  return (
    <div className={`min-h-screen overflow-x-hidden selection:bg-[#0078d4]/30 ${palette.page}`}>
      <Toaster theme={isLight ? "light" : "dark"} position="top-center" />
      <motion.div
        ref={progressRef}
        className="fixed left-0 top-0 z-[90] h-1 w-full origin-left scale-x-0 bg-gradient-to-r from-[#0078d4] via-[#50e6ff] to-[#0078d4]"
      />
      <Background isLight={isLight} />

      <AnimatePresence>
        {showIntro && <IntroOverlay onSkip={() => setShowIntro(false)} />}
      </AnimatePresence>
      <AnimatePresence>{authTransition && <AuthTransitionOverlay />}</AnimatePresence>

      <NavBarClean
        palette={palette}
        isLight={isLight}
        toggle={toggle}
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        goAuth={goAuth}
      />

      <main className="relative z-10">
        <Hero palette={palette} isLight={isLight} goAuth={goAuth} />
        <InstitutionStrip palette={palette} />
        <PlatformSection palette={palette} isLight={isLight} />
        <PanelSectionClean
          palette={palette}
          isLight={isLight}
          activePanel={activePanel}
          setActivePanel={setActivePanel}
        />
        <WorkflowSection palette={palette} isLight={isLight} />
        <AISection palette={palette} isLight={isLight} />
        <ModulesSection palette={palette} isLight={isLight} />
        <SecuritySection palette={palette} isLight={isLight} />
        <PricingSection
          palette={palette}
          isLight={isLight}
          annual={annual}
          setAnnual={setAnnual}
          goAuth={goAuth}
        />
        <FAQSection
          palette={palette}
          isLight={isLight}
          activeFaq={activeFaq}
          setActiveFaq={setActiveFaq}
        />
        <ContactSection palette={palette} isLight={isLight} />
      </main>

      <StickyDock isLight={isLight} toggle={toggle} goAuth={goAuth} />
      <Footer palette={palette} isLight={isLight} />
    </div>
  );
}

function IntroOverlay({ onSkip }: { onSkip: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[120] grid place-items-center overflow-hidden bg-[#020617] text-white"
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(18px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(0,120,212,0.38),transparent_34%),radial-gradient(circle_at_18%_78%,rgba(80,230,255,0.18),transparent_32%),linear-gradient(135deg,#020617,#07111f,#01030a)]" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "54px 54px",
        }}
      />
      <motion.div
        className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#50e6ff] to-transparent"
        animate={{ scaleX: [0, 1, 0.8], opacity: [0, 1, 0] }}
        transition={{ duration: 1.45, ease: [0.16, 1, 0.3, 1] }}
      />
      <motion.div
        className="relative z-10 mx-5 max-w-4xl rounded-[34px] border border-white/10 bg-white/[0.06] p-8 text-center shadow-[0_40px_140px_rgba(0,0,0,0.55)] backdrop-blur-2xl sm:p-12"
        initial={{ scale: 0.92, y: 26, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[28px] bg-[#0078d4] shadow-[0_0_80px_rgba(0,120,212,0.75)]"
          animate={{ y: [0, -6, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.45, repeat: Infinity, ease: "easeInOut" }}
        >
          <Sparkles className="h-9 w-9" />
        </motion.div>
        <div className="text-xs font-bold uppercase tracking-[0.38em] text-[#50e6ff]">EduNex</div>
        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.06em] sm:text-7xl">
          Platforma gotowa
        </h2>
        <p className="mt-4 text-lg font-semibold text-white/72">Bezpieczne egzaminy online</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {["Panel ucznia", "Panel nauczyciela", "Bezpieczeństwo"].map((x, i) => (
            <motion.div
              key={x}
              className="rounded-2xl border border-white/10 bg-white/[0.05] p-4 text-sm font-semibold text-white/72"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 + i * 0.11 }}
            >
              {x}
            </motion.div>
          ))}
        </div>
        <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#0078d4] via-[#50e6ff] to-[#0078d4]"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
          />
        </div>
        <button
          onClick={onSkip}
          className="mt-6 rounded-full border border-white/10 px-5 py-2 text-xs font-semibold text-white/55 transition hover:bg-white/10 hover:text-white"
        >
          Pomiń animację
        </button>
      </motion.div>
    </motion.div>
  );
}

function AuthTransitionOverlay() {
  return (
    <motion.div
      className="fixed inset-0 z-[115] grid place-items-center overflow-hidden bg-[#020617] text-white"
      initial={{ opacity: 0, clipPath: "circle(0% at 50% 50%)" }}
      animate={{ opacity: 1, clipPath: "circle(140% at 50% 50%)" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(0,120,212,0.38),transparent_30%),linear-gradient(135deg,#020617,#06101e,#01030a)]" />
      <motion.div
        className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#50e6ff] to-transparent"
        animate={{ scaleX: [0, 1, 0.45], opacity: [0, 1, 0.55] }}
        transition={{ duration: 0.65, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="relative z-10 text-center"
        initial={{ y: 18, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, delay: 0.08 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 0.85, repeat: Infinity, ease: "linear" }}
          className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full border border-[#50e6ff]/35 bg-white/[0.055] shadow-[0_0_70px_rgba(80,230,255,0.45)]"
        >
          <Loader2 className="h-9 w-9 text-[#50e6ff]" />
        </motion.div>
        <div className="text-xs font-bold uppercase tracking-[0.32em] text-[#50e6ff]">
          Bezpieczne przejście
        </div>
        <div className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
          Ładowanie panelu logowania
        </div>
        <p className="mt-2 text-sm text-white/55">Przenoszę do bramy logowania EduNex...</p>
      </motion.div>
    </motion.div>
  );
}

function Background({ isLight }: { isLight: boolean }) {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0"
        style={{
          background: isLight
            ? "radial-gradient(circle at 18% 12%, rgba(0,103,184,0.16), transparent 28%), radial-gradient(circle at 82% 0%, rgba(80,132,214,0.16), transparent 26%), linear-gradient(135deg, rgba(255,255,255,0.96), rgba(233,239,248,0.92))"
            : "radial-gradient(circle at 15% 8%, rgba(0,120,212,0.30), transparent 31%), radial-gradient(circle at 82% 6%, rgba(80,230,255,0.13), transparent 31%), radial-gradient(circle at 48% 94%, rgba(37,99,235,0.20), transparent 38%), linear-gradient(135deg, #020617, #07111f 48%, #01030a)",
        }}
      />
      <div
        className={`absolute inset-0 ${isLight ? "opacity-[0.32]" : "opacity-[0.18]"}`}
        style={{
          backgroundImage: isLight
            ? "linear-gradient(rgba(15,23,42,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,0.05) 1px, transparent 1px)"
            : "linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />
      <FloatingOrbs />
      <DataParticles isLight={isLight} />
      <SignalRings />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.08),transparent)]" />
    </div>
  );
}

function FloatingOrbs() {
  return (
    <>
      <motion.div
        className="absolute -left-24 top-24 h-96 w-96 rounded-full bg-[#0078d4]/25 blur-3xl"
        animate={{ x: [0, 60, 10, 0], y: [0, -20, 25, 0], scale: [1, 1.1, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -right-24 top-40 h-[460px] w-[460px] rounded-full bg-cyan-400/16 blur-3xl"
        animate={{ x: [0, -40, 20, 0], y: [0, 35, -10, 0], scale: [1, 0.92, 1.08, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 h-80 w-80 rounded-full bg-blue-500/12 blur-3xl"
        animate={{ x: [0, -120, 80, 0], y: [0, -35, 15, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />
    </>
  );
}

function DataParticles({ isLight }: { isLight: boolean }) {
  const items = [
    "PIN",
    "AI",
    "2FA",
    "OTP",
    "LIVE",
    "EXAM",
    "PDF",
    "AUTH",
    "RODO",
    "SEC",
    "01",
    "10",
  ];
  return (
    <div className="absolute inset-0 overflow-hidden opacity-55">
      {items.map((item, i) => (
        <motion.div
          key={`${item}-${i}`}
          className={`absolute rounded-full border px-3 py-1 text-[10px] font-bold tracking-[0.18em] ${isLight ? "border-slate-300/45 bg-white/35 text-slate-500" : "border-white/10 bg-white/[0.035] text-[#50e6ff]/60"}`}
          style={{ left: `${(i * 8 + 6) % 96}%`, top: `${(i * 17 + 8) % 88}%` }}
          animate={{ y: [0, -22, 14, 0], x: [0, 14, -8, 0], opacity: [0.2, 0.72, 0.28] }}
          transition={{
            duration: 9 + (i % 5),
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.22,
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
}

function SignalRings() {
  return (
    <div className="absolute right-[8%] top-[22%] h-72 w-72">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute inset-0 rounded-full border border-[#50e6ff]/20"
          animate={{ scale: [0.35, 1.6], opacity: [0.42, 0] }}
          transition={{ duration: 4.6, repeat: Infinity, delay: i * 1.05, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function NavBar({
  palette,
  isLight,
  toggle,
  menuOpen,
  setMenuOpen,
  goAuth,
}: {
  palette: Palette;
  isLight: boolean;
  toggle: () => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  goAuth: () => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 sm:px-6">
      <nav
        className={`mx-auto flex max-w-7xl items-center justify-between rounded-full border px-4 py-3 shadow-lg backdrop-blur-2xl ${palette.nav}`}
      >
        <Link to="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0078d4] text-white shadow-[0_12px_34px_rgba(0,120,212,0.32)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold leading-none">EduNex</div>
            <div className={`mt-1 text-[10px] uppercase tracking-[0.22em] ${palette.faint}`}>
              exam cloud
            </div>
          </div>
        </Link>
        <div className="hidden items-center gap-1 lg:flex">
          {navLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${isLight ? "text-slate-600 hover:bg-slate-100 hover:text-slate-950" : "text-white/62 hover:bg-white/[0.08] hover:text-white"}`}
            >
              {label}
            </a>
          ))}
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            onClick={toggle}
            className={`inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition ${palette.chip}`}
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isLight ? "Ciemny" : "Jasny"}
          </button>
          <button
            onClick={goAuth}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-[#0078d4] px-5 text-sm font-semibold text-white transition hover:bg-[#106ebe]"
          >
            Logowanie <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className={`grid h-10 w-10 place-items-center rounded-full border lg:hidden ${palette.chip}`}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>
      {menuOpen && (
        <div
          className={`mx-auto mt-3 max-w-7xl rounded-3xl border p-4 backdrop-blur-2xl lg:hidden ${palette.nav}`}
        >
          <div className="grid gap-2">
            {navLinks.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-semibold"
              >
                {label}
              </a>
            ))}
            <button
              onClick={goAuth}
              className="rounded-2xl bg-[#0078d4] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Przejdź do logowania
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function NavBarClean({
  palette,
  isLight,
  toggle,
  menuOpen,
  setMenuOpen,
  goAuth,
}: {
  palette: Palette;
  isLight: boolean;
  toggle: () => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  goAuth: () => void;
}) {
  return (
    <header className="fixed left-0 right-0 top-4 z-50 px-4 sm:px-6">
      <nav
        className={`mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border px-3 shadow-[0_18px_70px_rgba(0,0,0,0.24)] backdrop-blur-2xl sm:px-4 ${palette.nav}`}
      >
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#0078d4] text-white shadow-[0_12px_34px_rgba(0,120,212,0.32)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <div className="text-sm font-black leading-none tracking-tight">EduNex</div>
            <div
              className={`mt-1 text-[10px] font-bold uppercase tracking-[0.18em] ${palette.faint}`}
            >
              egzaminy AI
            </div>
          </div>
        </Link>

        <div className="hidden items-center rounded-xl border border-white/10 bg-white/[0.035] p-1 lg:flex">
          {navLinks.map(([label, href]) => (
            <a
              key={href}
              href={href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                isLight
                  ? "text-slate-600 hover:bg-white hover:text-slate-950"
                  : "text-white/62 hover:bg-white/[0.09] hover:text-white"
              }`}
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className={`grid h-10 w-10 place-items-center rounded-xl border text-sm font-semibold transition ${palette.chip}`}
            aria-label="Zmien motyw"
          >
            {isLight ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
          <button
            onClick={goAuth}
            className="hidden h-10 items-center gap-2 rounded-xl bg-[#0078d4] px-4 text-sm font-bold text-white shadow-[0_10px_30px_rgba(0,120,212,0.30)] transition hover:bg-[#106ebe] sm:inline-flex"
          >
            Logowanie <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className={`grid h-10 w-10 place-items-center rounded-xl border lg:hidden ${palette.chip}`}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div
          className={`mx-auto mt-3 max-w-7xl rounded-2xl border p-3 backdrop-blur-2xl lg:hidden ${palette.nav}`}
        >
          <div className="grid gap-2">
            {navLinks.map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold"
              >
                {label}
              </a>
            ))}
            <button
              onClick={goAuth}
              className="rounded-xl bg-[#0078d4] px-4 py-3 text-center text-sm font-semibold text-white"
            >
              Przejdz do logowania
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

function Badge({
  children,
  icon: Icon,
  isLight,
}: {
  children: string;
  icon: IconType;
  isLight: boolean;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${isLight ? "border-[#d2d0ce] bg-white/82 text-slate-600" : "border-white/10 bg-white/[0.06] text-white/62"}`}
    >
      <Icon className="h-4 w-4 text-[#50a7f2]" /> {children}
    </span>
  );
}

function Hero({
  palette,
  isLight,
  goAuth,
}: {
  palette: Palette;
  isLight: boolean;
  goAuth: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[94vh] max-w-7xl flex-col justify-center px-5 pb-20 pt-36 sm:px-6">
      <div className="grid items-center gap-10 lg:grid-cols-[1.06fr_0.94fr]">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionAnim}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex flex-wrap gap-3">
            <Badge icon={ShieldCheck} isLight={isLight}>
              Platforma egzaminacyjna
            </Badge>
            <Badge icon={Radio} isLight={isLight}>
              Wyniki live
            </Badge>
          </div>
          <h1 className="mt-7 max-w-5xl text-5xl font-semibold tracking-[-0.07em] sm:text-7xl lg:text-8xl">
            Egzaminy online, które wyglądają jak system klasy państwowej.
          </h1>
          <p className={`mt-7 max-w-2xl text-lg leading-8 sm:text-xl ${palette.muted}`}>
            EduNex łączy szybkie sesje PIN, panel nauczyciela, panel ucznia, AI, raporty i
            bezpieczeństwo w jednym nowoczesnym systemie dla szkół.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <button
              onClick={goAuth}
              className="edunex-pulse-ring inline-flex items-center gap-2 rounded-full bg-[#0078d4] px-7 py-4 text-sm font-bold text-white shadow-[0_18px_50px_rgba(0,120,212,0.35)] transition hover:-translate-y-0.5 hover:bg-[#106ebe]"
            >
              Przejdź do logowania <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#platforma"
              className={`inline-flex items-center gap-2 rounded-full border px-7 py-4 text-sm font-bold transition ${palette.chip}`}
            >
              Zobacz funkcje <ChevronDown className="h-4 w-4" />
            </a>
          </div>
          <HeroStatsBar palette={palette} />
        </motion.div>
        <HeroDeviceClean palette={palette} isLight={isLight} />
      </div>
    </section>
  );
}

function HeroStatsBar({ palette }: { palette: Palette }) {
  return (
    <div
      className={`mt-10 grid gap-2 rounded-2xl border p-2 backdrop-blur-xl sm:grid-cols-4 ${palette.card2}`}
    >
      {heroStats.map(([value, label], i) => (
        <motion.div
          key={value}
          className="rounded-xl px-4 py-3"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 + i * 0.08 }}
        >
          <div className="text-lg font-black tracking-[-0.02em] text-[#50e6ff]">{value}</div>
          <div className={`mt-0.5 text-xs font-semibold ${palette.faint}`}>{label}</div>
        </motion.div>
      ))}
    </div>
  );
}

function HeroDevice({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <motion.div
      className="edunex-holo-border edunex-ultra-scan rounded-[34px] border p-4 backdrop-blur-2xl md:p-6 lg:p-8"
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`rounded-[28px] border p-5 ${palette.card}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#0078d4]">
              Sesja aktywna
            </div>
            <div className="mt-2 text-4xl font-black tracking-[-0.05em]">PIN 482 913</div>
          </div>
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0078d4] text-white">
            <Lock className="h-7 w-7" />
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          {["Matematyka - sprawdzian", "24 uczniów online", "Średnia klasy 84%"].map((x, i) => (
            <motion.div
              key={x}
              className={`rounded-2xl border p-4 ${palette.card2}`}
              animate={{ x: [0, i % 2 ? 4 : -4, 0] }}
              transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold">{x}</span>
                <span className={`text-xs ${isLight ? "text-slate-500" : "text-white/45"}`}>
                  LIVE
                </span>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="mt-6 h-36 overflow-hidden rounded-3xl border border-white/10 bg-[#020617] p-4 text-white">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-[#50e6ff]">
            <Zap className="h-4 w-4" /> Analiza AI
          </div>
          <div className="mt-5 grid gap-2">
            {[78, 92, 64, 86].map((w, i) => (
              <div key={i} className="h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#0078d4] to-[#50e6ff]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${w}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroDeviceClean({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  const rows = [
    { icon: ClipboardList, label: "Sprawdzian", value: "Matematyka", meta: "aktywny" },
    { icon: Users, label: "Uczniowie", value: "24 online", meta: "na zywo" },
    { icon: BarChart3, label: "Srednia", value: "84%", meta: "klasa" },
  ];

  return (
    <motion.div
      className="rounded-[28px] border border-white/20 p-4 backdrop-blur-2xl md:p-5 lg:p-6"
      initial={{ opacity: 0, y: 30, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`rounded-2xl border p-5 ${palette.card}`}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#50e6ff]">
              Sesja aktywna
            </div>
            <div className="mt-2 text-4xl font-black tracking-[-0.05em]">PIN 482 913</div>
            <div className={`mt-2 text-sm ${palette.faint}`}>Jedno wejscie dla calej klasy.</div>
          </div>
          <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[#0078d4] text-white">
            <Lock className="h-7 w-7" />
          </div>
        </div>

        <div className="mt-6 grid gap-3">
          {rows.map(({ icon: Icon, label, value, meta }) => (
            <div key={label} className={`rounded-xl border p-4 ${palette.card2}`}>
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 text-[#50e6ff]" />
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-bold uppercase tracking-[0.18em] ${palette.faint}`}>
                    {label}
                  </div>
                  <div className="mt-1 font-semibold">{value}</div>
                </div>
                <span
                  className={`text-xs font-bold uppercase ${isLight ? "text-slate-500" : "text-white/45"}`}
                >
                  {meta}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[#020617] p-4 text-white">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#50e6ff]">
            <Zap className="h-4 w-4" /> Analiza AI
          </div>
          <div className="mt-5 grid gap-2">
            {[78, 92, 64, 86].map((w, i) => (
              <div key={i} className="h-2.5 overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-[#0078d4] to-[#50e6ff]"
                  initial={{ width: 0 }}
                  whileInView={{ width: `${w}%` }}
                  transition={{ duration: 0.8, delay: i * 0.1 }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  text,
  palette,
}: {
  eyebrow: string;
  title: string;
  text: string;
  palette: Palette;
}) {
  return (
    <motion.div
      className="mx-auto max-w-3xl text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionAnim}
      transition={{ duration: 0.65 }}
    >
      <div className="text-xs font-bold uppercase tracking-[0.28em] text-[#0078d4]">{eyebrow}</div>
      <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">{title}</h2>
      <p className={`mt-5 text-lg leading-8 ${palette.muted}`}>{text}</p>
    </motion.div>
  );
}

function InstitutionStrip({ palette }: { palette: Palette }) {
  return (
    <section className="px-5">
      <div
        className={`mx-auto grid max-w-7xl gap-3 rounded-[32px] border p-4 sm:grid-cols-4 ${palette.card2}`}
      >
        {["Szkoły", "Nauczyciele", "Uczniowie", "Administratorzy"].map((x) => (
          <div key={x} className="rounded-3xl px-5 py-4 text-center">
            <div className="text-sm font-bold uppercase tracking-[0.2em] text-[#0078d4]">
              EduNex
            </div>
            <div className="mt-1 text-lg font-semibold">{x}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlatformSection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section id="platforma" className="mx-auto max-w-7xl px-5 py-28">
      <SectionTitle
        eyebrow="Platforma"
        title="Wszystko do egzaminów w jednym miejscu"
        text="Od tworzenia pytań, przez sesję PIN, po raporty i eksport wyników."
        palette={palette}
      />
      <div className="mt-14 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platformBlocks.map((item, i) => (
          <FeatureCard
            key={item.title}
            {...item}
            palette={palette}
            isLight={isLight}
            delay={i * 0.05}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
  palette,
  isLight,
  delay,
}: {
  icon: IconType;
  title: string;
  text: string;
  palette: Palette;
  isLight: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className={`group rounded-[30px] border p-6 backdrop-blur-xl transition hover:-translate-y-1 ${palette.card}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      variants={sectionAnim}
      transition={{ duration: 0.55, delay }}
    >
      <div className="mb-6 grid h-12 w-12 place-items-center rounded-2xl bg-[#0078d4] text-white shadow-[0_14px_40px_rgba(0,120,212,0.30)]">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-xl font-bold tracking-[-0.03em]">{title}</h3>
      <p className={`mt-3 leading-7 ${isLight ? "text-slate-600" : "text-white/58"}`}>{text}</p>
    </motion.div>
  );
}

function PanelSection({
  palette,
  isLight,
  activePanel,
  setActivePanel,
}: {
  palette: Palette;
  isLight: boolean;
  activePanel: number;
  setActivePanel: (v: number) => void;
}) {
  const panel = panels[activePanel];
  const Icon = panel.icon;
  return (
    <section id="panele" className="px-5 py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionTitle
            eyebrow="Panele"
            title="Trzy widoki dla szkoły"
            text="Uczeń ma prosty egzamin, nauczyciel ma centrum dowodzenia, a admin ma kontrolę nad całością."
            palette={palette}
          />
          <div className="mt-8 grid gap-3">
            {panels.map((p, i) => (
              <button
                key={p.title}
                onClick={() => setActivePanel(i)}
                className={`rounded-3xl border p-5 text-left transition ${activePanel === i ? "border-[#0078d4] bg-[#0078d4] text-white" : palette.card2}`}
              >
                <div className="font-bold">{p.title}</div>
                <div
                  className={`mt-1 text-sm ${activePanel === i ? "text-white/72" : palette.faint}`}
                >
                  {p.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>
        <motion.div
          key={panel.title}
          className={`rounded-[36px] border p-8 ${palette.card}`}
          initial={{ opacity: 0, x: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid h-16 w-16 place-items-center rounded-3xl bg-[#0078d4] text-white">
            <Icon className="h-8 w-8" />
          </div>
          <h3 className="mt-7 text-4xl font-semibold tracking-[-0.05em]">{panel.title}</h3>
          <p className={`mt-3 text-lg ${palette.muted}`}>{panel.subtitle}</p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {panel.features.map((f) => (
              <div key={f} className={`rounded-2xl border p-4 ${palette.card2}`}>
                <CheckCircle2 className="mb-3 h-5 w-5 text-[#0078d4]" />
                <span className="font-semibold">{f}</span>
              </div>
            ))}
          </div>
          <div
            className={`mt-8 rounded-3xl border p-5 ${isLight ? "bg-slate-950 text-white" : "bg-white text-slate-950"}`}
          >
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#50e6ff]">
              Podgląd systemu
            </div>
            <div className="mt-3 grid gap-2">
              {["Sesja 482913", "Oddane prace: 18/24", "Średnia: 84%"].map((x) => (
                <div key={x} className="rounded-2xl bg-white/10 p-3 font-semibold">
                  {x}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function PanelSectionClean({
  palette,
  activePanel,
  setActivePanel,
}: {
  palette: Palette;
  isLight: boolean;
  activePanel: number;
  setActivePanel: (v: number) => void;
}) {
  const panel = panels[activePanel];
  const Icon = panel.icon;

  return (
    <section id="panele" className="px-5 py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionTitle
            eyebrow="Panele"
            title="Trzy widoki dla szkoly"
            text="Uczen ma prosty egzamin, nauczyciel ma centrum dowodzenia, a admin ma kontrole nad caloscia."
            palette={palette}
          />
          <div className={`mt-8 grid gap-2 rounded-2xl border p-2 ${palette.card2}`}>
            {panels.map((p, i) => (
              <button
                key={p.title}
                onClick={() => setActivePanel(i)}
                className={`rounded-xl px-4 py-3 text-left transition ${
                  activePanel === i
                    ? "bg-[#0078d4] text-white shadow-[0_18px_44px_rgba(0,120,212,0.22)]"
                    : "text-inherit hover:bg-white/[0.06]"
                }`}
              >
                <div className="font-bold">{p.title}</div>
                <div
                  className={`mt-1 text-sm ${activePanel === i ? "text-white/72" : palette.faint}`}
                >
                  {p.subtitle}
                </div>
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={panel.title}
          className={`rounded-[30px] border p-6 ${palette.card}`}
          initial={{ opacity: 0, x: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#0078d4] text-white">
            <Icon className="h-7 w-7" />
          </div>
          <h3 className="mt-6 text-4xl font-semibold tracking-[-0.05em]">{panel.title}</h3>
          <p className={`mt-3 text-lg ${palette.muted}`}>{panel.subtitle}</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {panel.features.map((f) => (
              <div key={f} className={`rounded-xl border p-4 ${palette.card2}`}>
                <CheckCircle2 className="mb-3 h-5 w-5 text-[#50e6ff]" />
                <span className="font-semibold">{f}</span>
              </div>
            ))}
          </div>
          <div className="mt-8 rounded-2xl border border-white/10 bg-[#020617] p-5 text-white shadow-[0_22px_80px_rgba(0,0,0,0.28)]">
            <div className="text-xs font-bold uppercase tracking-[0.24em] text-[#50e6ff]">
              Podglad systemu
            </div>
            <div className="mt-4 grid gap-2">
              {["Sesja 482913", "Oddane prace: 18/24", "Srednia: 84%"].map((x) => (
                <div
                  key={x}
                  className="rounded-xl border border-white/10 bg-white/[0.055] p-3 font-semibold"
                >
                  {x}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function WorkflowSection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24">
      <SectionTitle
        eyebrow="Proces"
        title="Od pytań do raportu"
        text="Cały przepływ egzaminu jest szybki i czytelny."
        palette={palette}
      />
      <div className="mt-14 grid gap-4 md:grid-cols-4">
        {workflow.map((w, i) => (
          <motion.div
            key={w.nr}
            className={`rounded-[30px] border p-6 ${palette.card}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={sectionAnim}
            transition={{ delay: i * 0.07 }}
          >
            <div className="text-5xl font-black text-[#0078d4]">{w.nr}</div>
            <h3 className="mt-6 text-xl font-bold">{w.title}</h3>
            <p className={`mt-3 leading-7 ${isLight ? "text-slate-600" : "text-white/58"}`}>
              {w.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function AISection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section id="ai" className="px-5 py-24">
      <div className={`mx-auto max-w-7xl rounded-[44px] border p-6 md:p-10 ${palette.card}`}>
        <SectionTitle
          eyebrow="AI"
          title="Inteligentna pomoc dla nauczyciela"
          text="AI ma pomagać w tworzeniu pytań, analizie wyników i komentarzach do odpowiedzi."
          palette={palette}
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {aiCards.map((card, i) => (
            <FeatureCard
              key={card.title}
              {...card}
              palette={palette}
              isLight={isLight}
              delay={i * 0.08}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModulesSection({ palette }: { palette: Palette; isLight: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24">
      <SectionTitle
        eyebrow="Moduły"
        title="Rozbudowany zestaw funkcji"
        text="System ma być gotowy pod testy, sprawdziany, egzaminy, multimedia i integracje."
        palette={palette}
      />
      <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {modules.map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            className={`rounded-3xl border p-5 ${palette.card2}`}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.035 }}
          >
            <Icon className="mb-4 h-6 w-6 text-[#0078d4]" />
            <div className="font-bold">{label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function SecuritySection({ palette }: { palette: Palette; isLight: boolean }) {
  return (
    <section id="bezpieczenstwo" className="px-5 py-24">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <SectionTitle
          eyebrow="Bezpieczeństwo"
          title="Logowanie, OTP, role i audyt"
          text="System jest projektowany pod realne użycie w szkole, dlatego bezpieczeństwo i kontrola dostępu są w centrum."
          palette={palette}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {securityItems.map((x, i) => (
            <motion.div
              key={x}
              className={`rounded-3xl border p-5 ${palette.card}`}
              initial={{ opacity: 0, x: 18 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <ShieldCheck className="mb-4 h-6 w-6 text-[#0078d4]" />
              <div className="font-bold">{x}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection({
  palette,
  isLight,
  annual,
  setAnnual,
  goAuth,
}: {
  palette: Palette;
  isLight: boolean;
  annual: boolean;
  setAnnual: (v: boolean) => void;
  goAuth: () => void;
}) {
  const price = (p: Plan) =>
    p.monthly === null
      ? "Indywidualnie"
      : p.monthly === 0
        ? "0 zł"
        : `${Math.round(p.monthly * (annual ? 0.8 : 1))} zł`;
  return (
    <section id="cennik" className="mx-auto max-w-7xl px-5 py-28">
      <SectionTitle
        eyebrow="Cennik"
        title="Pakiety od klasy po instytucję"
        text="Czytelny cennik dla nauczyciela, szkoły i większych wdrożeń."
        palette={palette}
      />
      <div className="mt-8 flex justify-center">
        <div className={`rounded-full border p-1 ${palette.card2}`}>
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2 text-sm font-bold ${!annual ? "bg-[#0078d4] text-white" : palette.faint}`}
          >
            Miesięcznie
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-5 py-2 text-sm font-bold ${annual ? "bg-[#0078d4] text-white" : palette.faint}`}
          >
            Rocznie -20%
          </button>
        </div>
      </div>
      <div className="mt-12 grid gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {plans.map((p, i) => (
          <motion.div
            key={p.name}
            className={`rounded-[32px] border p-6 ${p.featured ? "border-[#0078d4] bg-[#0078d4] text-white shadow-[0_30px_90px_rgba(0,120,212,0.28)]" : palette.card}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04 }}
          >
            <div
              className={`text-xs font-bold uppercase tracking-[0.2em] ${p.featured ? "text-white/70" : "text-[#0078d4]"}`}
            >
              {p.tag}
            </div>
            <h3 className="mt-3 text-2xl font-bold">{p.name}</h3>
            <p className={`mt-2 min-h-12 text-sm ${p.featured ? "text-white/72" : palette.muted}`}>
              {p.desc}
            </p>
            <div className="mt-5 text-4xl font-black">{price(p)}</div>
            <div className={`mt-1 text-xs ${p.featured ? "text-white/62" : palette.faint}`}>
              {p.monthly === null ? p.limits : `${p.limits} / miesiąc`}
            </div>
            <div className="mt-6 grid gap-2">
              {p.features.map((f) => (
                <div key={f} className="flex items-center gap-2 text-sm font-semibold">
                  <CheckCircle2 className="h-4 w-4" /> {f}
                </div>
              ))}
            </div>
            <button
              onClick={goAuth}
              className={`mt-7 w-full rounded-full px-5 py-3 text-sm font-bold transition ${p.featured ? "bg-white text-[#0078d4]" : isLight ? "bg-slate-950 text-white" : "bg-white text-slate-950"}`}
            >
              {p.cta}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQSection({
  palette,
  activeFaq,
  setActiveFaq,
}: {
  palette: Palette;
  isLight: boolean;
  activeFaq: number;
  setActiveFaq: (v: number) => void;
}) {
  return (
    <section id="faq" className="mx-auto max-w-4xl px-5 py-24">
      <SectionTitle
        eyebrow="FAQ"
        title="Najczęstsze pytania"
        text="Najważniejsze informacje dla szybkiego startu."
        palette={palette}
      />
      <div className="mt-10 grid gap-3">
        {faqs.map(([q, a], i) => (
          <div key={q} className={`rounded-3xl border ${palette.card2}`}>
            <button
              onClick={() => setActiveFaq(activeFaq === i ? -1 : i)}
              className="flex w-full items-center justify-between p-5 text-left font-bold"
            >
              <span>{q}</span>
              <ChevronDown
                className={`h-5 w-5 transition ${activeFaq === i ? "rotate-180" : ""}`}
              />
            </button>
            <AnimatePresence>
              {activeFaq === i && (
                <motion.p
                  className={`px-5 pb-5 leading-7 ${palette.muted}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                >
                  {a}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}

function ContactSection({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24">
      <div className={`rounded-[44px] border p-8 text-center md:p-14 ${palette.card}`}>
        <Mail className="mx-auto h-10 w-10 text-[#0078d4]" />
        <h2 className="mt-5 text-4xl font-semibold tracking-[-0.05em] sm:text-6xl">
          Chcesz wdrożyć EduNex?
        </h2>
        <p className={`mx-auto mt-5 max-w-2xl text-lg leading-8 ${palette.muted}`}>
          System jest przygotowywany pod szkoły, nauczycieli i większe wdrożenia. Kontakt może
          prowadzić do konfiguracji demo, cennika lub integracji.
        </p>
        <a
          href="mailto:kontakt@edunex.pl"
          className={`mt-8 inline-flex rounded-full px-7 py-4 text-sm font-bold ${isLight ? "bg-slate-950 text-white" : "bg-white text-slate-950"}`}
        >
          kontakt@edunex.pl
        </a>
      </div>
    </section>
  );
}

function StickyDock({
  isLight,
  toggle,
  goAuth,
}: {
  isLight: boolean;
  toggle: () => void;
  goAuth: () => void;
}) {
  return (
    <div className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#020617]/76 p-2 text-white shadow-2xl backdrop-blur-2xl">
      <button
        onClick={toggle}
        className="grid h-11 w-11 place-items-center rounded-full bg-white/10"
      >
        {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </button>
      <button
        onClick={goAuth}
        className="inline-flex h-11 items-center gap-2 rounded-full bg-[#0078d4] px-5 text-sm font-bold"
      >
        Logowanie <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}

function Footer({ palette, isLight }: { palette: Palette; isLight: boolean }) {
  return (
    <footer
      className={`relative z-10 border-t px-5 py-10 ${isLight ? "border-slate-200" : "border-white/10"}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="font-bold">EduNex</div>
        <div className={palette.faint}>Platforma egzaminacyjna online dla szkół</div>
        <div className={palette.faint}>© 2026</div>
      </div>
    </footer>
  );
}
