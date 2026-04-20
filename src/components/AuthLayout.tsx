import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { motion } from "framer-motion";

export function AuthLayout({
  children,
  title,
  subtitle,
  icon: Icon,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Lewy panel — branding */}
      <div className="md:w-1/2 lg:w-2/5 relative bg-hero overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <motion.div
          className="absolute top-20 -right-20 h-80 w-80 rounded-full bg-accent/20 blur-3xl"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity }}
        />
        <div className="relative z-10 h-full flex flex-col p-8 lg:p-12">
          <Link to="/" className="inline-flex">
            <Logo size="md" variant="light" />
          </Link>
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex p-4 rounded-2xl bg-accent shadow-gold mb-6">
                <Icon className="h-8 w-8 text-accent-foreground" />
              </div>
              <h1 className="text-4xl lg:text-5xl font-display font-bold text-primary-foreground mb-4 leading-tight">
                {title}
              </h1>
              <p className="text-lg text-primary-foreground/80">{subtitle}</p>
            </motion.div>
          </div>
          <div className="text-sm text-primary-foreground/50">
            © {new Date().getFullYear()} EduNex.pl
          </div>
        </div>
      </div>

      {/* Prawy panel — formularz */}
      <div className="md:w-1/2 lg:w-3/5 flex flex-col">
        <div className="flex justify-between items-center p-6">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-smooth">
            <ArrowLeft className="h-4 w-4" /> Powrót
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
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
