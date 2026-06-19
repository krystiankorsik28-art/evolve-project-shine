import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "@tanstack/react-router";

const TRUST_ITEMS = [
  "Nie potrzebujesz karty kredytowej",
  "Bez zobowiązań — anuluj w każdej chwili",
  "Dane szyfrowane TLS 1.3",
];

export default function FinalCTA() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="relative py-24 sm:py-32 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.7 0.15 200 / 0.08) 0%, transparent 60%)",
          }}
        />
        <div className="absolute inset-0" style={{
          backgroundImage: "radial-gradient(oklch(1 0 0 / 0.03) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.97 }}
          animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-3xl p-10 sm:p-16"
          style={{
            background: "linear-gradient(135deg, oklch(0.15 0.05 270 / 0.6), oklch(0.1 0.04 260 / 0.8))",
            border: "1px solid oklch(1 0 0 / 0.06)",
            backdropFilter: "blur(20px)",
          }}
        >
          <div className="absolute -inset-[1px] rounded-3xl pointer-events-none opacity-50"
            style={{
              background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.15), transparent 40%, transparent 60%, oklch(0.7 0.15 200 / 0.15))",
              zIndex: -1,
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "oklch(1 0 0 / 0.04)",
              border: "1px solid oklch(1 0 0 / 0.06)",
            }}
          >
            <span className="relative flex w-2 h-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full" style={{ background: "oklch(0.7 0.15 200)" }} />
              <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: "oklch(0.7 0.15 200)" }} />
            </span>
            <span className="text-xs" style={{ color: "oklch(1 0 0 / 0.5)" }}>
              Zaczynamy za 2 minuty
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05]"
          >
            <span className="text-white">Gotowy na przyszłość</span><br />
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              edukacji?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-4 text-base sm:text-lg max-w-lg mx-auto"
            style={{ color: "oklch(1 0 0 / 0.45)" }}
          >
            Dołącz do 36 000+ nauczycieli i uczniów, którzy już korzystają z EduNex.
            Plan Klasa jest całkowicie darmowy.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Link
              to="/auth/teacher"
              className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-3.5 text-sm font-medium rounded-xl transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))",
                color: "#fff",
                boxShadow: "0 0 24px oklch(0.7 0.15 200 / 0.25)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 40px oklch(0.7 0.15 200 / 0.4)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 0 24px oklch(0.7 0.15 200 / 0.25)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              Rozpocznij za darmo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2"
          >
            {TRUST_ITEMS.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 text-xs"
                style={{ color: "oklch(1 0 0 / 0.3)" }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "oklch(0.7 0.15 200 / 0.5)" }} />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
