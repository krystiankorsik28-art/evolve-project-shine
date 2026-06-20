import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";

const TESTIMONIALS = [
  { n: "Katarzyna Mazurek", r: "Matematyka · XIV LO Warszawa", t: "Przed EduNex układałam testy w Wordzie. Teraz robię to dwa razy szybciej. Generator AI to game changer.", color: "from-accent to-blue-500" },
  { n: "Paweł Górski", r: "Wicedyrektor · III LO Gdynia", t: "Monitoring na żywo to przełom — od razu widzę, kto potrzebuje pomocy, a kto ściąga.", color: "from-violet-500 to-fuchsia-500" },
  { n: "Magdalena Adamczyk", r: "Polonistka · V LO Kraków", t: "Uczeń widzi wynik od razu i wie co poprawić. Oszczędzam 10 godzin tygodniowo na sprawdzaniu.", color: "from-emerald-500 to-teal-500" },
  { n: "Tomasz Wróblewski", r: "Dyrektor · ZSE Poznań", t: "Spełnia wszystkie wymogi RODO. Koszty druku spadły o 90%, a wyniki są od razu w systemie.", color: "from-amber-500 to-orange-500" },
];

const VARIANTS = {
  enter: (d: number) => ({ x: d > 0 ? 200 : -200, opacity: 0, scale: 0.95 }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (d: number) => ({ x: d > 0 ? -200 : 200, opacity: 0, scale: 0.95 }),
};

export default function TestimonialsSection() {
  const [[idx, dir], setIdx] = useState([0, 0]);

  const paginate = useCallback((d: number) => {
    setIdx(([i]) => [(i + d + TESTIMONIALS.length) % TESTIMONIALS.length, d]);
  }, []);

  useEffect(() => {
    const iv = setInterval(() => paginate(1), 5000);
    return () => clearInterval(iv);
  }, [paginate]);

  return (
    <section id="opinie" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[120px]" />
        <div className="absolute bottom-1/3 left-1/4 w-64 h-64 rounded-full bg-violet-500/5 blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{
              background: "oklch(1 0 0 / 0.04)",
              border: "1px solid oklch(1 0 0 / 0.06)",
              color: "oklch(1 0 0 / 0.5)",
            }}
          >
            Opinie
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Co mówią{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              nauczyciele
            </span>
          </h2>
        </motion.div>

        <div className="relative mt-12">
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: "oklch(0.08 0.03 270 / 0.4)",
              border: "1px solid oklch(1 0 0 / 0.06)",
              backdropFilter: "blur(12px)",
              minHeight: "260px",
            }}
          >
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={idx}
                custom={dir}
                variants={VARIANTS}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="p-8 sm:p-10"
              >
                <Quote className="w-8 h-8 mb-4" style={{ color: "oklch(0.7 0.15 200 / 0.3)" }} />
                <blockquote className="text-base sm:text-lg leading-relaxed" style={{ color: "oklch(1 0 0 / 0.75)" }}>
                  {TESTIMONIALS[idx].t}
                </blockquote>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full grid place-items-center text-sm font-semibold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${TESTIMONIALS[idx].color.replace("from-", "").replace("to-", "").split(" ")[0]}, ${TESTIMONIALS[idx].color.split(" ")[1]})`,
                    }}
                  >
                    {TESTIMONIALS[idx].n[0]}
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-sm text-white/90">{TESTIMONIALS[idx].n}</div>
                    <div className="text-xs" style={{ color: "oklch(1 0 0 / 0.4)" }}>{TESTIMONIALS[idx].r}</div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute top-1/2 -translate-y-1/2 left-3 z-10">
              <button
                onClick={() => paginate(-1)}
                className="w-9 h-9 rounded-full grid place-items-center transition-all duration-200"
                style={{
                  background: "oklch(0.1 0.04 270 / 0.8)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                  color: "oklch(1 0 0 / 0.5)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.15 0.05 270 / 0.8)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.8)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.1 0.04 270 / 0.8)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.5)"; }}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
            <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10">
              <button
                onClick={() => paginate(1)}
                className="w-9 h-9 rounded-full grid place-items-center transition-all duration-200"
                style={{
                  background: "oklch(0.1 0.04 270 / 0.8)",
                  border: "1px solid oklch(1 0 0 / 0.08)",
                  color: "oklch(1 0 0 / 0.5)",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(0.15 0.05 270 / 0.8)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.8)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(0.1 0.04 270 / 0.8)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.5)"; }}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx([i, i > idx ? 1 : -1])}
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: i === idx ? "24px" : "8px",
                  background: i === idx ? "oklch(0.7 0.15 200 / 0.6)" : "oklch(1 0 0 / 0.15)",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
