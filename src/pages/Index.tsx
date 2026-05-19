import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  Shield, Users, GraduationCap, ArrowRight, Sparkles, Lock, Award,
  CheckCircle2, Zap, Brain, BarChart3, Radio, Activity, Server,
  Eye, FileCheck2, Cpu, Globe2, Database, Terminal, ShieldCheck,
  AlertTriangle, TrendingUp, KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

const Index = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    document.title = "EduNex — Państwowy System Egzaminacyjny Nowej Generacji";
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", "EduNex — bezpieczna platforma egzaminacyjna klasy enterprise. AI, anty-cheat, monitoring live, raporty, RBAC, audit logs.");
  }, []);

  useEffect(() => {
    if (!loading && user && role) {
      navigate(role === "admin" ? "/admin" : role === "teacher" ? "/teacher" : "/student", { replace: true });
    }
  }, [user, role, loading, navigate]);

  useEffect(() => {
    const i = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(i);
  }, []);

  const liveStats = [
    { label: "Aktywne sesje", value: 12847 + (tick % 17), icon: Activity, color: "text-cyan-400" },
    { label: "Egzaminy dziś", value: 3421 + (tick % 5), icon: FileCheck2, color: "text-blue-400" },
    { label: "Szkoły online", value: 1284, icon: Globe2, color: "text-emerald-400" },
    { label: "Uptime SLA", value: "99.99%", icon: Server, color: "text-amber-400" },
  ];

  const portals = [
    { to: "/auth/login-student", icon: GraduationCap, title: "Uczeń", desc: "Dołącz do egzaminu z kodem PIN", grad: "from-cyan-500 to-blue-600", badge: "PIN" },
    { to: "/auth/login-teacher", icon: Users, title: "Nauczyciel", desc: "Twórz egzaminy, monitoruj live", grad: "from-blue-600 to-indigo-700", badge: "AUTH" },
    { to: "/auth/login-admin", icon: Shield, title: "Administrator", desc: "Centrum dowodzenia systemem", grad: "from-indigo-600 to-violet-700", badge: "ROOT" },
  ];

  const features = [
    { icon: Brain, title: "AI Generator", desc: "20 pytań z odpowiedziami w 5 sekund." },
    { icon: Radio, title: "Live Quiz", desc: "Tryb real-time z PIN i rankingiem." },
    { icon: Eye, title: "Monitoring Live", desc: "Mapa aktywności wszystkich uczniów." },
    { icon: ShieldCheck, title: "Anty-cheat AI", desc: "Wykrywanie oszustw z risk-score." },
    { icon: BarChart3, title: "Analityka Enterprise", desc: "Heatmapy, porównania, eksport PDF." },
    { icon: Database, title: "Bank pytań", desc: "Tysiące pytań w kategoriach." },
    { icon: KeyRound, title: "RBAC + 2FA", desc: "Role, uprawnienia, audyt." },
    { icon: Cpu, title: "Cloud Infrastructure", desc: "Autoskalowanie, redundancja." },
  ];

  const securityFeatures = [
    { icon: Lock, label: "End-to-end encryption" },
    { icon: ShieldCheck, label: "ISO 27001 compliant" },
    { icon: Eye, label: "24/7 SOC monitoring" },
    { icon: FileCheck2, label: "Audit logs immutable" },
    { icon: AlertTriangle, label: "Real-time threat detection" },
    { icon: Database, label: "GDPR / RODO ready" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative h-16 w-16">
            <div className="absolute inset-0 rounded-full border-2 border-accent/30" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent animate-spin" />
            <div className="absolute inset-2 rounded-full bg-accent/20 animate-pulse" />
          </div>
          <p className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">Initializing system…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* ====== NAV ====== */}
      <header className="sticky top-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/70">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" variant="light" />
            <span className="hidden md:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono uppercase tracking-wider text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> system online
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            <a href="#features" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-smooth">Funkcje</a>
            <a href="#security" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-smooth">Bezpieczeństwo</a>
            <a href="#how" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-smooth">Jak działa</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/auth/login-student">
              <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 shadow-cyber">
                Rozpocznij <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ====== HERO ====== */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        {/* Animated grid */}
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-cyan-400/60"
            style={{ left: `${(i * 53) % 100}%`, top: `${(i * 37) % 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0.2, 1, 0.2] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.2 }}
          />
        ))}

        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="lg:col-span-7">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-card border border-border mb-6">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Państwowa platforma egzaminacyjna · v3.0</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-extrabold leading-[1.05] mb-6 tracking-tight">
                Nowoczesny<br />
                <span className="text-gradient-cyber">System Egzaminacyjny</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10 leading-relaxed">
                Bezpieczna platforma do przeprowadzania egzaminów online nowej generacji. AI, monitoring live, anty-cheat enterprise i raporty klasy ministerialnej.
              </p>

              <div className="flex flex-wrap gap-3">
                {portals.map((p) => (
                  <Link key={p.to} to={p.to}>
                    <Button size="lg" className={`bg-gradient-to-r ${p.grad} hover:opacity-95 shadow-lg group`}>
                      <p.icon className="mr-2 h-5 w-5" />
                      {p.title}
                      <span className="ml-2 px-1.5 py-0.5 rounded bg-black/30 text-[10px] font-mono">{p.badge}</span>
                    </Button>
                  </Link>
                ))}
              </div>

              {/* Live status bar */}
              <div className="mt-12 flex flex-wrap gap-x-8 gap-y-3 text-xs font-mono">
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> API: 24ms</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> DB: HEALTHY</span>
                <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" /> Edge: 14 regions</span>
                <span className="flex items-center gap-2 text-muted-foreground">SOC: monitoring 24/7</span>
              </div>
            </motion.div>

            {/* Right: Live dashboard mockup */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="lg:col-span-5 relative">
              <div className="absolute inset-0 bg-gradient-cyber blur-3xl opacity-30 rounded-full" />
              <div className="relative bg-card/80 backdrop-blur border border-border rounded-2xl p-5 shadow-elegant">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
                    </div>
                    <span className="text-xs font-mono text-muted-foreground ml-2">edunex://command-center</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">● LIVE</span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {liveStats.map((s) => (
                    <div key={s.label} className="bg-background/60 border border-border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <s.icon className={`h-3.5 w-3.5 ${s.color}`} />
                        <TrendingUp className="h-3 w-3 text-emerald-400" />
                      </div>
                      <div className="text-xl font-bold font-mono">{typeof s.value === "number" ? s.value.toLocaleString("pl") : s.value}</div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Mini chart */}
                <div className="bg-background/60 border border-border rounded-lg p-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase text-muted-foreground">Aktywność / 24h</span>
                    <span className="text-[10px] font-mono text-cyan-400">+12.4%</span>
                  </div>
                  <div className="flex items-end gap-1 h-16">
                    {[40, 65, 50, 80, 70, 90, 75, 95, 85, 70, 88, 100].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                        className="flex-1 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-sm"
                      />
                    ))}
                  </div>
                </div>

                {/* Terminal log */}
                <div className="bg-black/40 border border-border rounded-lg p-3 font-mono text-[10px] space-y-1">
                  <div className="text-emerald-400">[OK] auth.session verified · uid:****a82f</div>
                  <div className="text-cyan-400">[INFO] exam.live.start · pin:7421 · n=24</div>
                  <div className="text-amber-400">[WARN] tab_switch detected · attempt:#9921</div>
                  <div className="text-emerald-400">[OK] grading.ai completed in 1.2s</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ====== LIVE STATS BAR ====== */}
      <section className="border-y border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {liveStats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
              <div className="text-3xl font-bold font-mono">{typeof s.value === "number" ? s.value.toLocaleString("pl") : s.value}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ====== FEATURES ====== */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 mb-4">
              <Zap className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-mono uppercase tracking-wider text-accent">Funkcje systemu</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">Wszystko czego potrzebuje<br /><span className="text-gradient-cyber">nowoczesna szkoła</span></h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Od AI generowania pytań po enterprise-grade anty-cheat. Jeden system — wszystkie potrzeby.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
                className="group relative bg-card/60 backdrop-blur border border-border rounded-xl p-6 hover-lift hover:border-accent/50"
              >
                <div className="absolute inset-0 bg-gradient-cyber opacity-0 group-hover:opacity-5 rounded-xl transition-smooth" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center h-11 w-11 rounded-lg bg-gradient-to-br from-blue-600/20 to-cyan-500/20 border border-accent/30 mb-4">
                    <f.icon className="h-5 w-5 text-accent" />
                  </div>
                  <h3 className="text-lg font-display font-bold mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== SECURITY CENTER ====== */}
      <section id="security" className="py-24 relative bg-gradient-to-b from-background via-card/30 to-background">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-6 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-emerald-400">Security Center</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Bezpieczeństwo<br /><span className="text-gradient-cyber">klasy państwowej</span></h2>
              <p className="text-muted-foreground mb-8 text-lg">Architektura zero-trust. Szyfrowanie end-to-end. Monitoring SOC 24/7. Pełna zgodność z RODO i ISO 27001.</p>
              <div className="grid grid-cols-2 gap-3">
                {securityFeatures.map((s) => (
                  <div key={s.label} className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg">
                    <div className="h-8 w-8 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <s.icon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-sm font-medium">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal */}
            <div className="bg-black/80 border border-border rounded-xl p-5 font-mono text-xs shadow-elegant">
              <div className="flex items-center gap-2 mb-3 pb-3 border-b border-border">
                <Terminal className="h-4 w-4 text-emerald-400" />
                <span className="text-muted-foreground">edunex@soc:~$ security-monitor --live</span>
              </div>
              <div className="space-y-1.5">
                <div className="text-emerald-400">[2026-05-16 14:32:11] ✓ TLS handshake · AES-256-GCM</div>
                <div className="text-cyan-400">[2026-05-16 14:32:12] → auth: jwt verified · 2FA passed</div>
                <div className="text-emerald-400">[2026-05-16 14:32:13] ✓ session.create · rbac:teacher</div>
                <div className="text-amber-400">[2026-05-16 14:32:15] ⚠ suspicious: copy_attempt blocked</div>
                <div className="text-emerald-400">[2026-05-16 14:32:16] ✓ audit.log committed · immutable</div>
                <div className="text-cyan-400">[2026-05-16 14:32:18] → ai.risk_score: 0.12 (low)</div>
                <div className="text-emerald-400">[2026-05-16 14:32:20] ✓ exam.submit · graded by ai</div>
                <div className="text-muted-foreground">└─ all systems nominal · uptime 99.99%</div>
                <div className="text-emerald-400 flex items-center gap-1 pt-1">
                  <span className="h-2 w-2 rounded-sm bg-emerald-400 animate-pulse" /> awaiting events…
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== HOW IT WORKS ====== */}
      <section id="how" className="py-24">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">3 kroki do uruchomienia</h2>
            <p className="text-muted-foreground">Od rejestracji do pierwszego egzaminu — w 5 minut.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { n: "01", title: "Utwórz egzamin", desc: "Kreator pytań z AI lub bank gotowych pytań w 30+ kategoriach.", icon: FileCheck2 },
              { n: "02", title: "Wygeneruj PIN", desc: "Jeden klik — uczniowie dołączają kodem PIN bez rejestracji.", icon: KeyRound },
              { n: "03", title: "Analizuj wyniki", desc: "Heatmapy, AI insights, raporty PDF dla rodziców i kuratorium.", icon: BarChart3 },
            ].map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative bg-card border border-border rounded-xl p-6"
              >
                <div className="text-6xl font-display font-extrabold text-gradient-cyber opacity-30 absolute top-4 right-5">{s.n}</div>
                <s.icon className="h-8 w-8 text-accent mb-4" />
                <h3 className="text-xl font-display font-bold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== TESTIMONIALS ====== */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-6">
          <h2 className="text-center text-4xl font-display font-bold mb-16">Zaufały nam <span className="text-gradient-cyber">setki szkół</span></h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { who: "ZSO nr 4, Warszawa", role: "Dyrektor", text: "Egzaminy próbne z 200 uczniami jednocześnie. Zero problemów technicznych. Anty-cheat wykrył 3 próby ściągania." },
              { who: "LO im. Kopernika", role: "Nauczyciel matematyki", text: "AI Generator zaoszczędził mi 10h tygodniowo. Pytania są dobrej jakości i można je edytować." },
              { who: "Kuratorium Śląskie", role: "Wizytator", text: "Raporty PDF + heatmapy odpowiedzi — dokładnie to czego potrzebujemy do ewaluacji." },
            ].map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-card border border-border rounded-xl p-6 hover-lift"
              >
                <div className="flex gap-1 mb-3">{[...Array(5)].map((_, i) => <Award key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}</div>
                <p className="text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div className="pt-4 border-t border-border">
                  <div className="font-bold text-sm">{t.who}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ====== CTA ====== */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-cyber opacity-20" />
        <div className="container mx-auto px-6 relative text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-6">Gotowy na <span className="text-gradient-cyber">nową erę</span> egzaminów?</h2>
          <p className="text-muted-foreground text-lg mb-8">Wybierz swój panel poniżej. Konfiguracja w 60 sekund.</p>
          <div className="flex flex-wrap justify-center gap-3">
            {portals.map((p) => (
              <Link key={p.to} to={p.to}>
                <Button size="lg" className={`bg-gradient-to-r ${p.grad} hover:opacity-95 shadow-lg`}>
                  <p.icon className="mr-2 h-5 w-5" /> {p.title}
                </Button>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ====== FOOTER ====== */}
      <footer className="border-t border-border bg-background py-12">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-8">
          <div>
            <Logo size="sm" variant="light" />
            <p className="text-xs text-muted-foreground mt-3">Państwowy system egzaminacyjny nowej generacji.</p>
            <div className="flex items-center gap-2 mt-4 text-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-mono text-muted-foreground">All systems operational</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">Produkt</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-foreground">Funkcje</a></li>
              <li><a href="#security" className="hover:text-foreground">Bezpieczeństwo</a></li>
              <li><a href="#how" className="hover:text-foreground">Jak działa</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">Wsparcie</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Centrum pomocy</li>
              <li>Dokumentacja API</li>
              <li>Status systemu</li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3 text-sm">Prawne</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Polityka prywatności</li>
              <li>Regulamin</li>
              <li>RODO / GDPR</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-6 mt-8 pt-6 border-t border-border flex flex-wrap justify-between items-center gap-4 text-xs text-muted-foreground">
          <div>© 2026 EduNex.pl · Wszystkie prawa zastrzeżone</div>
          <div className="flex items-center gap-4 font-mono">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> ISO 27001</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> RODO</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-emerald-400" /> SOC 2</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
