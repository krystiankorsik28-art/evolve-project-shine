import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Users, GraduationCap, ArrowRight, Bell, BookOpen, FileText, BarChart3, Phone, HelpCircle, Sparkles, Lock, Globe, Award } from "lucide-react";
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
    document.title = "EduNex.pl — Państwowa platforma edukacyjna";
    const meta = document.querySelector('meta[name="description"]');
    const desc = "EduNex.pl — nowoczesna państwowa platforma edukacyjna online. Egzaminy, materiały, raporty, AI dla nauczycieli, uczniów i administratorów.";
    if (meta) meta.setAttribute("content", desc);
    else {
      const m = document.createElement("meta"); m.name = "description"; m.content = desc; document.head.appendChild(m);
    }
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
      desc: "Pełne zarządzanie systemem, audyty bezpieczeństwa, użytkownicy.",
      color: "from-primary-deep to-primary",
      badge: "2FA wymagane",
    },
    {
      to: "/auth/teacher",
      icon: Users,
      title: "Nauczyciel",
      desc: "Tworzenie egzaminów, bank pytań, raporty, AI dla treści.",
      color: "from-primary to-primary-glow",
      badge: "Bank pytań + AI",
    },
    {
      to: "/auth/student",
      icon: GraduationCap,
      title: "Uczeń",
      desc: "Logowanie kodem PIN, dostęp do egzaminów i materiałów.",
      color: "from-accent to-warning",
      badge: "Dostęp przez PIN",
    },
  ];

  const navItems = [
    { icon: FileText, label: "Egzaminy" },
    { icon: BookOpen, label: "Materiały" },
    { icon: BarChart3, label: "Raporty" },
    { icon: HelpCircle, label: "Pomoc" },
    { icon: Phone, label: "Kontakt" },
  ];

  const features = [
    { icon: Sparkles, title: "AI dla edukacji", desc: "Generowanie pytań, ocena esejów, personalizacja ścieżki nauki." },
    { icon: Lock, title: "Bezpieczeństwo", desc: "2FA, RLS, szyfrowane dane, pełne logi audytu wszystkich operacji." },
    { icon: Globe, title: "Wieloplatformowo", desc: "Dostęp z desktopu i urządzeń mobilnych. Tryb jasny i ciemny." },
    { icon: Award, title: "Standard państwowy", desc: "Profesjonalny interfejs zgodny z wymaganiami oświaty publicznej." },
  ];

  const news = [
    { date: "20.04.2026", title: "Nowy moduł AI dla generowania pytań dostępny dla nauczycieli." },
    { date: "15.04.2026", title: "Aktualizacja systemu: rozszerzone raporty postępów uczniów." },
    { date: "10.04.2026", title: "EduNex.pl uruchomiony — zapraszamy do rejestracji szkół." },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/50 glass">
        <div className="container flex h-20 items-center justify-between">
          <Logo size="md" />
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Button key={item.label} variant="ghost" className="text-sm font-medium">
                <item.icon className="h-4 w-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="default" className="hidden sm:inline-flex">
              <Link to="/auth/student">Wejdź na platformę</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden bg-hero">
        <div className="absolute inset-0 bg-mesh opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-glow/20 via-transparent to-transparent" />

        {/* Pływające elementy */}
        <motion.div
          className="absolute top-20 right-10 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 h-96 w-96 rounded-full bg-primary-glow/20 blur-3xl"
          animate={{ y: [0, 20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="container relative py-24 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 backdrop-blur-md mb-8">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-medium text-primary-foreground/90">System gotowy do użytku produkcyjnego</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-display font-bold text-primary-foreground mb-6 text-balance leading-[1.05]">
              Edukacja przyszłości <br />
              <span className="text-gradient-gold">już dziś dostępna</span>
            </h1>

            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10 max-w-2xl mx-auto text-balance">
              Państwowa platforma edukacyjna z pełnym wsparciem AI. Egzaminy, materiały, raporty postępów —
              wszystko w jednym, bezpiecznym ekosystemie dla szkół, nauczycieli i uczniów.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-gold text-base h-12 px-8">
                <Link to="/auth/student">
                  Rozpocznij egzamin <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base h-12 px-8 backdrop-blur-sm">
                <Link to="/auth/teacher">Panel nauczyciela</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trzy ścieżki logowania */}
      <section className="container py-20 lg:py-28 -mt-20 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          {loginCards.map((card, i) => (
            <motion.div
              key={card.to}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
            >
              <Link to={card.to} className="group block">
                <div className="relative h-full p-8 rounded-2xl bg-card border border-border shadow-card hover:shadow-elegant transition-smooth overflow-hidden">
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-smooth`} />

                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${card.color} shadow-elegant mb-6 group-hover:scale-110 transition-smooth`}>
                    <card.icon className="h-7 w-7 text-primary-foreground" strokeWidth={2} />
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-2xl font-display font-bold">{card.title}</h3>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-accent-soft text-accent-foreground font-medium">
                      {card.badge}
                    </span>
                  </div>

                  <p className="text-muted-foreground mb-6 leading-relaxed">{card.desc}</p>

                  <div className="flex items-center text-primary font-semibold group-hover:gap-3 gap-2 transition-smooth">
                    Zaloguj się <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-smooth" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Aktualności + Powiadomienia */}
      <section className="container py-16 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-6 w-6 text-accent" />
            <h2 className="text-3xl font-display font-bold">Aktualności i ogłoszenia</h2>
          </div>
          <div className="space-y-4">
            {news.map((n, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="p-6 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-card transition-smooth"
              >
                <div className="flex items-start gap-4">
                  <div className="text-xs font-mono text-muted-foreground bg-secondary px-3 py-1.5 rounded-md whitespace-nowrap">
                    {n.date}
                  </div>
                  <p className="text-foreground font-medium">{n.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="h-6 w-6 text-accent" />
            <h2 className="text-3xl font-display font-bold">Skróty</h2>
          </div>
          <div className="p-6 rounded-2xl bg-gradient-primary text-primary-foreground shadow-elegant">
            <h3 className="font-display text-xl mb-2">Pierwszy raz na EduNex?</h3>
            <p className="text-primary-foreground/80 mb-6 text-sm">
              Sprawdź panel pomocy lub skontaktuj się z administratorem swojej szkoły, aby otrzymać dane dostępowe.
            </p>
            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" asChild>
                <Link to="/auth/student"><GraduationCap className="h-4 w-4 mr-2" /> Wejdź jako uczeń</Link>
              </Button>
              <Button variant="outline" className="w-full justify-start border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
                <Link to="/auth/register-teacher"><Users className="h-4 w-4 mr-2" /> Zarejestruj nauczyciela</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/40 py-20 lg:py-28">
        <div className="container">
          <div className="max-w-2xl mx-auto text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4 text-balance">
              Wszystko, czego potrzebuje nowoczesna szkoła
            </h2>
            <p className="text-lg text-muted-foreground text-balance">
              EduNex.pl łączy bezpieczeństwo państwowych systemów z mocą sztucznej inteligencji.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="p-6 rounded-2xl bg-card border border-border hover:shadow-elegant transition-smooth group"
              >
                <div className="inline-flex p-3 rounded-xl bg-accent-soft mb-4 group-hover:scale-110 transition-smooth">
                  <f.icon className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="font-display font-bold text-xl mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-deep text-primary-foreground py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Logo size="md" variant="light" />
            <div className="flex flex-wrap gap-6 text-sm text-primary-foreground/70">
              <a href="#" className="hover:text-accent transition-smooth">Polityka prywatności</a>
              <a href="#" className="hover:text-accent transition-smooth">Regulamin</a>
              <a href="#" className="hover:text-accent transition-smooth">Dostępność</a>
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
