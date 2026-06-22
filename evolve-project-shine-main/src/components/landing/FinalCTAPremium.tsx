import { useRef } from "react";
import { Link } from "@tanstack/react-router";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Sparkles, Rocket } from "lucide-react";

export default function FinalCTAPremium() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative py-32 sm:py-40 overflow-hidden">
      {/* Gradient bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 50%, oklch(0.6 0.18 230 / 0.08), transparent 60%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 30% 80%, oklch(0.55 0.2 270 / 0.05), transparent 50%)",
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-8"
            style={{
              background: "oklch(0.72 0.16 200 / 0.08)",
              border: "1px solid oklch(0.72 0.16 200 / 0.2)",
              color: "oklch(0.78 0.15 200)",
            }}
          >
            <Rocket className="w-3.5 h-3.5" />
            Gotowy na przyszłość?
          </div>

          <h2 className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white leading-tight">
            Zbuduj szkołę{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.8 0.14 195), oklch(0.65 0.2 250))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              jutra
            </span>
            <br />
            <span className="text-white">już dzisiaj</span>
          </h2>

          <p
            className="mt-6 text-base sm:text-lg max-w-xl mx-auto"
            style={{ color: "oklch(1 0 0 / 0.5)" }}
          >
            Dołącz do ponad 120 szkół, które już transformują edukację z AI. Bez karty kredytowej.
            Pełen dostęp w 60 sekund.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/auth/teacher"
              className="magnetic-btn group inline-flex items-center gap-2.5 px-10 py-5 text-base font-semibold rounded-xl transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.16 200), oklch(0.55 0.22 250))",
                color: "#fff",
                boxShadow:
                  "0 6px 40px oklch(0.6 0.18 230 / 0.4), 0 0 80px oklch(0.72 0.16 200 / 0.15)",
              }}
            >
              <Sparkles className="w-5 h-5" />
              Rozpocznij za darmo
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          <p className="mt-6 text-xs" style={{ color: "oklch(1 0 0 / 0.3)" }}>
            Darmowy plan na zawsze · Brak wymaganej karty · Setup w 60 sekund
          </p>
        </motion.div>
      </div>
    </section>
  );
}
