import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield, Users, GraduationCap, ArrowRight, Bell, BookOpen, FileText, BarChart3,
  Phone, HelpCircle, Sparkles, Lock, Globe, Award, CheckCircle2, Activity,
  Zap, Server, Cpu, Database, ExternalLink, Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "EduNex.pl — Państwowa platforma edukacyjna nowej generacji";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "EduNex.pl — nowoczesna państwowa platforma edukacyjna z AI. Egzaminy, materiały, raporty. Bezpieczeństwo klasy rządowej dla szkół, nauczycieli i uczniów.";
    if (meta) meta.setAttribute("content", desc);
  }, []);

  useEffect(() => {
    if (!loading && user && role) {
      const target = role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student";
      navigate(target, { replace: true });
    }
  }, [user, role, loading, navigate]);

  const loginCards = [
    {
      to: "/auth/admin",
      icon: Shield,
      title: "Administrator",
      desc: "Pełna kontrola nad platformą, audyty bezpieczeństwa, zarządzanie użytkownikami i rolami.",
      badge: "2FA · TOTP",
      tone: "red",
      cta: "Otwórz panel administratora",
      newWindow: true,
    },
    {
      to: "/auth/teacher",
      icon: Users,
      title: "Nauczyciel",
      desc: "Twórz egzaminy, generuj pytania przez AI, oceniaj prace i analizuj postępy klasy.",
      badge: "Bank pytań · AI",
      tone: "gold",
      cta: "Otwórz panel nauczyciela",
      newWindow: true,
    },
    {
      to: "/auth/student",
      icon: GraduationCap,
      title: "Uczeń",
      desc: "Wejdź na egzamin kodem PIN otrzymanym od nauczyciela. Bez rejestracji, w 3 sekundy.",
      badge: "PIN · Bez rejestracji",
      tone: "cyber",
      cta: "Wejdź na egzamin",
      newWindow: false,
    },
  ] as const;

  const navItems = [
    { icon: FileText, label: "Egzaminy" },
    { icon: BookOpen, label: "Materiały" },
    { icon: BarChart3, label: "Raporty" },
    { icon: HelpCircle, label: "Pomoc" },
    { icon: Phone, label: "Kontakt" },
  ];

  const features = [
    { icon: Sparkles, title: "AI dla edukacji", desc: "Generowanie pytań, ocena esejów, personalizacja ścieżki nauki." },
    { icon: Lock, title: "Bezpieczeństwo państwowe", desc: "2FA TOTP, RLS, szyfrowanie, pełne logi audytu wszystkich operacji." },
    { icon: Globe, title: "Wieloplatformowo", desc: "Pełna obsługa desktop/tablet/mobile. Tryb jasny i ciemny." },
    { icon: Award, title: "Standard MEN", desc: "Interfejs zgodny z WCAG 2.1 i wymaganiami oświaty publicznej." },
  ];

  const news = [
    { date: "20.04.2026", tag: "AKTUALIZACJA", title: "Nowy moduł AI dla generowania pytań dostępny dla wszystkich nauczycieli." },
    { date: "15.04.2026", tag: "FUNKCJA", title: "Rozszerzone raporty postępów uczniów z analizą trudności pytań." },
    { date: "10.04.2026", tag: "PREMIERA", title: "EduNex.pl uruchomiony — zapraszamy do rejestracji szkół z całej Polski." },
  ];

  const stats = [
    { icon: Users, value: "12 480+", label: "Aktywnych nauczycieli" },
    { icon: GraduationCap, value: "234 920+", label: "Uczniów na platformie" },
    { icon: FileText, value: "1.8M+", label: "Przeprowadzonych egzaminów" },
    { icon: Shield, value: "99.99%", label: "SLA dostępności" },
  ];

  // Tone -> design tokens (semantyczne, z design system)
  const toneStyles: Record<"red" | "gold" | "cyber", {
    iconBg: string; iconText: string; ring: string; cta: string; badge: string; glow: string; bar: string;
  }> = {
    red: {
      iconBg: "bg-[hsl(var(--flag-red))]",
      iconText: "text-white",
      ring: "hover:ring-[hsl(var(--flag-red))]",
      cta: "bg-[hsl(var(--flag-red))] hover:bg-[hsl(var(--flag-red)/0.9)] text-white shadow-red",
      badge: "bg-[hsl(var(--flag-red)/0.12)] text-[hsl(var(--flag-red))] border-[hsl(var(--flag-red)/0.3)]",
      glow: "from-[hsl(var(--flag-red)/0.25)] to-transparent",
      bar: "bg-[hsl(var(--flag-red))]",
    },
    gold: {
      iconBg: "bg-gold",
      iconText: "text-gold-foreground",
      ring: "hover:ring-gold",
      cta: "bg-gold hover:bg-gold/90 text-gold-foreground shadow-gold",
      badge: "bg-gold/15 text-gold-foreground border-gold/40 dark:text-gold",
      glow: "from-gold/25 to-transparent",
      bar: "bg-gold",
    },
    cyber: {
      iconBg: "bg-accent",
      iconText: "text-accent-foreground",
      ring: "hover:ring-accent",
      cta: "bg-accent hover:bg-accent/90 text-accent-foreground shadow-cyber",
      badge: "bg-accent/15 text-accent-foreground border-accent/40 dark:text-accent",
      glow: "from-accent/25 to-transparent",
      bar: "bg-accent",
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ======== STATE BANNER (pasek państwowy) ======== */}
      <div className="bg-primary-deep text-primary-foreground text-xs">
        <div className="container flex items-center justify-between h-9">
          <div className="flex items-center gap-3">
            <Flag className="h-3.5 w-3.5 text-gold" />
            <span className="font-medium tracking-wide">SERWIS PAŃSTWOWY · Rzeczpospolita Polska · Ministerstwo Edukacji</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-primary-foreground/70">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> System działa</span>
            <span className="font-mono">v2.6.0</span>
          </div>
        </div>
      </div>

      {/* ======== HEADER ======== */}
      <header className="sticky top-0 z-50 border-b border-border glass">
        <div className="container flex h-20 items-center justify-between">
          <Logo size="md" />
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button key={item.label} variant="ghost" className="text-sm font-semibold text-foreground/80 hover:text-foreground">
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="default" className="hidden sm:inline-flex bg-primary-deep hover:bg-primary text-primary-foreground font-semibold">
              <Link to="/auth/student">Wejdź na platformę</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ======== HERO ======== */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-grid opacity-40" />
        {/* Subtle scan line */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-60 animate-scan" />

        <div className="container relative py-20 lg:py-28">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {/* LEFT: copy */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7"
            >
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-6">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-xs font-semibold tracking-wide text-white uppercase">System produkcyjny · Online</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-extrabold text-white mb-6 leading-[1.02] text-balance">
                Edukacja przyszłości,<br />
                <span className="text-gradient-gold">już dziś dostępna.</span>
              </h1>

              <p className="text-lg md:text-xl text-white/85 mb-10 max-w-2xl leading-relaxed">
                Państwowa platforma edukacyjna nowej generacji. Egzaminy online, materiały, raporty postępów
                i sztuczna inteligencja — w jednym, bezpiecznym ekosystemie dla szkół, nauczycieli i uczniów.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Button size="lg" asChild className="bg-gold hover:bg-gold/90 text-gold-foreground shadow-gold font-bold text-base h-14 px-8 rounded-xl">
                  <Link to="/auth/student">
                    Rozpocznij egzamin <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="bg-white/5 border-white/30 text-white hover:bg-white/15 hover:text-white text-base font-semibold h-14 px-8 rounded-xl backdrop-blur-sm">
                  <Link to="/auth/teacher" target="_blank" rel="noopener">
                    Panel nauczyciela <ExternalLink className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/80">
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Zgodność WCAG 2.1 AA</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Szyfrowanie end-to-end</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> RODO compliant</span>
              </div>
            </motion.div>

            {/* RIGHT: HUD card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative rounded-2xl bg-primary-deep/60 border border-white/15 backdrop-blur-xl p-6 shadow-elegant overflow-hidden">
                <div className="absolute -top-32 -right-32 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
                <div className="absolute -bottom-32 -left-32 h-64 w-64 rounded-full bg-gold/20 blur-3xl" />

                <div className="relative">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="h-2.5 w-2.5 rounded-full bg-flag-red" />
                      <div className="h-2.5 w-2.5 rounded-full bg-warning" />
                      <div className="h-2.5 w-2.5 rounded-full bg-success" />
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-widest text-white/50">edunex://status</span>
                  </div>

                  <div className="space-y-3">
                    {[
                      { icon: Server, label: "API & Backend", value: "Operational", ok: true },
                      { icon: Database, label: "Baza danych", value: "Operational", ok: true },
                      { icon: Cpu, label: "AI Gateway", value: "Operational", ok: true },
                      { icon: Activity, label: "Latencja P95", value: "47 ms", ok: true },
                      { icon: Zap, label: "Egzaminy live", value: "1 284 sesje", ok: true },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="flex items-center gap-3">
                          <s.icon className="h-4 w-4 text-accent" />
                          <span className="text-sm text-white/90 font-medium">{s.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-white">{s.value}</span>
                          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 p-3 rounded-lg bg-accent/10 border border-accent/30 flex items-center gap-3">
                    <Sparkles className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="text-xs text-white/90">
                      AI Assistant aktywny dla <span className="font-mono text-accent">2 348</span> nauczycieli
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ======== STATS BAR ======== */}
      <section className="bg-card border-y border-border">
        <div className="container py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-accent-soft">
                  <s.icon className="h-5 w-5 text-accent-on-soft" />
                </div>
                <div>
                  <div className="font-display text-2xl font-extrabold text-foreground tabular-nums">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== 3 LOGIN CARDS — bardzo czytelne ======== */}
      <section className="container py-20 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-foreground/80 text-xs font-semibold tracking-wider uppercase mb-4">
            Wybierz panel
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-3 text-balance">
            Trzy oddzielne panele logowania
          </h2>
          <p className="text-lg text-muted-foreground text-balance">
            Każda rola ma własną, bezpieczną przestrzeń. Wybierz swój panel, aby przejść do logowania w nowym oknie.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {loginCards.map((card, i) => {
            const t = toneStyles[card.tone];
            return (
              <motion.div
                key={card.to}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6 }}
              >
                <a
                  href={card.to}
                  target={card.newWindow ? "_blank" : undefined}
                  rel={card.newWindow ? "noopener noreferrer" : undefined}
                  className={`group relative block h-full rounded-2xl bg-card border-2 border-border p-7 shadow-card hover:shadow-elegant ring-2 ring-transparent ${t.ring} transition-smooth overflow-hidden`}
                >
                  {/* Top color bar */}
                  <div className={`absolute top-0 inset-x-0 h-1.5 ${t.bar}`} />
                  {/* Background glow on hover */}
                  <div className={`absolute -top-32 -right-32 h-64 w-64 rounded-full bg-gradient-to-br ${t.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl`} />

                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`inline-flex p-3.5 rounded-xl ${t.iconBg} ${t.iconText} shadow-lg group-hover:scale-110 transition-spring`}>
                        <card.icon className="h-7 w-7" strokeWidth={2.2} />
                      </div>
                      {card.newWindow && (
                        <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          <ExternalLink className="h-3 w-3" />
                          Nowe okno
                        </div>
                      )}
                    </div>

                    <h3 className="text-2xl font-display font-extrabold text-foreground mb-2">{card.title}</h3>
                    <div className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md border ${t.badge} mb-4 font-mono uppercase tracking-wider`}>
                      {card.badge}
                    </div>

                    <p className="text-foreground/70 mb-6 leading-relaxed text-[15px]">{card.desc}</p>

                    <div className={`inline-flex items-center justify-center w-full gap-2 px-5 py-3 rounded-xl font-bold text-sm ${t.cta} transition-smooth group-hover:gap-3`}>
                      {card.cta}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </a>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ======== AKTUALNOŚCI + SKRÓTY ======== */}
      <section className="container py-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-accent-soft"><Bell className="h-5 w-5 text-accent-on-soft" /></div>
            <h2 className="text-3xl font-display font-extrabold text-foreground">Aktualności</h2>
          </div>
          <div className="space-y-3">
            {news.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="p-5 rounded-xl bg-card border border-border hover:border-accent/40 hover:shadow-card transition-smooth flex items-start gap-4"
              >
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-primary-deep text-primary-foreground tracking-wider">
                    {n.tag}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono mt-1.5">{n.date}</span>
                </div>
                <p className="text-foreground font-semibold flex-1 leading-snug">{n.title}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-gold/15"><Sparkles className="h-5 w-5 text-gold" /></div>
            <h2 className="text-3xl font-display font-extrabold text-foreground">Szybki start</h2>
          </div>
          <div className="relative p-6 rounded-2xl bg-gradient-primary text-white shadow-elegant overflow-hidden">
            <div className="absolute -bottom-20 -right-20 h-48 w-48 rounded-full bg-accent/30 blur-3xl" />
            <div className="relative">
              <h3 className="font-display text-xl font-extrabold mb-2">Pierwszy raz na EduNex?</h3>
              <p className="text-white/80 mb-6 text-sm leading-relaxed">
                Sprawdź panel pomocy lub skontaktuj się z administratorem swojej szkoły, aby otrzymać dane dostępowe.
              </p>
              <div className="space-y-2">
                <Button className="w-full justify-start bg-accent text-accent-foreground hover:bg-accent/90 font-semibold" asChild>
                  <Link to="/auth/student"><GraduationCap className="h-4 w-4 mr-2" /> Wejdź jako uczeń</Link>
                </Button>
                <Button variant="outline" className="w-full justify-start border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold" asChild>
                  <a href="/auth/register-teacher" target="_blank" rel="noopener noreferrer">
                    <Users className="h-4 w-4 mr-2" /> Zarejestruj nauczyciela
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== FEATURES ======== */}
      <section className="bg-secondary/50 border-y border-border py-20 lg:py-24">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-foreground mb-4 text-balance">
              Wszystko, czego potrzebuje <span className="text-gradient-cyber">nowoczesna szkoła</span>
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              EduNex.pl łączy bezpieczeństwo państwowych systemów z mocą sztucznej inteligencji.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.07 }}
                className="p-6 rounded-2xl bg-card border border-border hover:border-accent/40 hover:shadow-elegant transition-smooth group"
              >
                <div className="inline-flex p-3 rounded-xl bg-accent-soft mb-4 group-hover:scale-110 transition-spring">
                  <f.icon className="h-6 w-6 text-accent-on-soft" />
                </div>
                <h3 className="font-display font-extrabold text-xl text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA STRIP ======== */}
      <section className="bg-hero relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-80" />
        <div className="container relative py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-display font-extrabold text-white mb-4 text-balance">
            Gotowy, by wprowadzić swoją szkołę w XXI wiek?
          </h2>
          <p className="text-white/80 mb-8 max-w-xl mx-auto">
            Dołącz do tysięcy nauczycieli i uczniów, którzy już korzystają z państwowej platformy nowej generacji.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild className="bg-gold text-gold-foreground hover:bg-gold/90 font-bold h-12 px-8 shadow-gold">
              <a href="/auth/register-teacher" target="_blank" rel="noopener noreferrer">
                Zarejestruj szkołę
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white font-semibold h-12 px-8">
              <Link to="/auth/student">Wypróbuj demo</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="bg-primary-deep text-primary-foreground py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Logo size="md" variant="light" />
            <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
              <a href="#" className="hover:text-accent transition-smooth">Polityka prywatności</a>
              <a href="#" className="hover:text-accent transition-smooth">Regulamin</a>
              <a href="#" className="hover:text-accent transition-smooth">Dostępność WCAG</a>
              <a href="#" className="hover:text-accent transition-smooth">Kontakt</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-primary-foreground/10 text-sm text-primary-foreground/60 text-center">
            © {new Date().getFullYear()} EduNex.pl — Państwowa platforma edukacyjna. Wszystkie prawa zastrzeżone.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
