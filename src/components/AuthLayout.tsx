import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export type AuthAccent = "red" | "gold" | "cyber";

const accentMap: Record<AuthAccent, {
  iconBg: string; iconText: string; chip: string; label: string; bar: string; glow: string;
}> = {
  red: {
    iconBg: "bg-[hsl(var(--flag-red))]",
    iconText: "text-white",
    chip: "bg-white/10 text-white border-white/30",
    label: "PANEL ADMINISTRATORA",
    bar: "bg-[hsl(var(--flag-red))]",
    glow: "bg-[hsl(var(--flag-red)/0.35)]",
  },
  gold: {
    iconBg: "bg-gold",
    iconText: "text-gold-foreground",
    chip: "bg-white/10 text-white border-gold/50",
    label: "PANEL NAUCZYCIELA",
    bar: "bg-gold",
    glow: "bg-gold/35",
  },
  cyber: {
    iconBg: "bg-accent",
    iconText: "text-accent-foreground",
    chip: "bg-white/10 text-white border-accent/50",
    label: "PANEL UCZNIA",
    bar: "bg-accent",
    glow: "bg-accent/35",
  },
};

export function AuthLayout({
  children,
  title,
  subtitle,
  icon: Icon,
  accent = "cyber",
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: AuthAccent;
}) {
  const a = accentMap[accent];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* ============ LEWY PANEL — branding ============ */}
      <div className="md:w-1/2 lg:w-[45%] relative bg-hero overflow-hidden">
        {/* Tło: mesh + grid + animowany akcent koloru roli */}
        <div className="absolute inset-0 bg-mesh opacity-90" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <motion.div
          className={`absolute -top-20 -right-20 h-96 w-96 rounded-full ${a.glow} blur-3xl`}
          animate={{ scale: [1, 1.15, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className={`absolute -bottom-32 -left-20 h-96 w-96 rounded-full ${a.glow} blur-3xl`}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Kolorowy pasek roli na górze */}
        <div className={`absolute top-0 inset-x-0 h-1.5 ${a.bar}`} />

        <div className="relative z-10 h-full flex flex-col p-8 lg:p-12 min-h-screen">
          <Link to="/" className="inline-flex">
            <Logo size="md" variant="light" />
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${a.chip} mb-6 backdrop-blur-md`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="text-[11px] font-bold tracking-[0.18em]">{a.label}</span>
              </div>

              <div className={`inline-flex p-4 rounded-2xl ${a.iconBg} ${a.iconText} shadow-2xl mb-7`}>
                <Icon className="h-9 w-9" />
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-display font-extrabold text-white mb-5 leading-[1.05] text-balance">
                {title}
              </h1>
              <p className="text-base lg:text-lg text-white/85 leading-relaxed">{subtitle}</p>

              <div className="mt-10 flex items-center gap-3 text-white/70 text-xs font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                Bezpieczne połączenie · TLS 1.3 · RODO
              </div>
            </motion.div>
          </div>

          <div className="text-xs text-white/50 font-mono">
            © {new Date().getFullYear()} EduNex.pl · v2.6.0
          </div>
        </div>
      </div>

      {/* ============ PRAWY PANEL — formularz ============ */}
      <div className="md:w-1/2 lg:w-[55%] flex flex-col bg-background">
        <div className="flex justify-between items-center p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-smooth">
            <ArrowLeft className="h-4 w-4" /> Powrót do strony głównej
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <div className="rounded-2xl bg-card border border-border shadow-elegant p-8">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
