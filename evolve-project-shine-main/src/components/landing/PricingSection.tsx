import { useState } from "react";
import { motion, useInView } from "framer-motion";
import { CheckCircle2, Star, ArrowRight, Loader2 } from "lucide-react";
import { Link, useNavigate } from "@tanstack/react-router";
import { NexaPayCheckout } from "@/components/NexaPayCheckout";

const PLANS = [
  {
    name: "Klasa",
    price: "0",
    sub: "na zawsze",
    popular: false,
    lines: ["Do 35 uczniów", "Bank pytań 300+", "Egzaminy bez limitu", "Podstawowe raporty", "Wsparcie e-mail"],
    cta: "Rozpocznij za darmo",
    to: "/auth/teacher",
    highlight: false,
  },
  {
    name: "Nauczyciel",
    price: "99",
    sub: "/mies",
    popular: true,
    lines: ["Do 60 uczniów", "Bank pytań 3000+", "Egzaminy bez limitu", "Generator AI 200 zapytań", "Monitoring na żywo", "Wsparcie priorytetowe", "API REST"],
    cta: "Wybierz Nauczyciel",
    highlight: true,
  },
  {
    name: "Szkoła",
    price: "490",
    sub: "/mies",
    popular: false,
    lines: ["Do 300 uczniów", "Bank pytań bez limitu", "Anti-cheat + monitoring", "API REST + integracje", "Panel dyrekcji", "Wsparcie 24/7"],
    cta: "Wybierz Szkoła",
    highlight: false,
  },
  {
    name: "Enterprise",
    price: "Indywidualnie",
    sub: "",
    popular: false,
    lines: ["Nieograniczona liczba użytkowników", "Dedykowany serwer", "SLA 99,99%", "Szkolenia stacjonarne", "Priorytetowe wsparcie 24/7"],
    cta: "Poproś o wycenę",
    highlight: false,
    contact: true,
  },
];

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const navigate = useNavigate();

  const yearlyPrice = (p: string) => {
    if (p === "0" || p === "Indywidualnie") return p;
    return String(Math.round(parseInt(p) * 0.8));
  };

  return (
    <section id="cennik" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full"
          style={{ background: "radial-gradient(circle, oklch(0.7 0.15 200 / 0.04) 0%, transparent 60%)" }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{ background: "oklch(1 0 0 / 0.04)", border: "1px solid oklch(1 0 0 / 0.06)", color: "oklch(1 0 0 / 0.5)" }}>
            Cennik
          </span>
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-white">
            Wybierz swój{" "}
            <span style={{
              background: "linear-gradient(135deg, oklch(0.75 0.15 200), oklch(0.6 0.2 240))",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>plan</span>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            Płatność kartą, przelewem lub krypto · bez ukrytych kosztów
          </p>
        </motion.div>

        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="text-sm font-medium transition-colors" style={{ color: yearly ? "oklch(1 0 0 / 0.4)" : "oklch(1 0 0 / 0.9)" }}>
            Miesięcznie
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-14 h-7 rounded-full transition-all duration-300"
            style={{
              background: yearly ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.12)",
              boxShadow: yearly ? "0 0 16px oklch(0.7 0.15 200 / 0.4)" : "none",
            }}
            role="switch"
            aria-checked={yearly}
          >
            <span
              className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
              style={{ transform: yearly ? "translateX(28px)" : "translateX(0)" }}
            />
          </button>
          <span className="text-sm font-medium transition-colors flex items-center gap-2"
            style={{ color: yearly ? "oklch(1 0 0 / 0.9)" : "oklch(1 0 0 / 0.4)" }}>
            Rocznie
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "oklch(0.7 0.15 200 / 0.15)", color: "oklch(0.75 0.15 200)" }}>
              -20%
            </span>
          </span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {PLANS.map((pl, i) => {
            const price = yearly && pl.price !== "0" && pl.price !== "Indywidualnie" ? yearlyPrice(pl.price) : pl.price;
            return (
              <motion.div
                key={pl.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="relative rounded-2xl p-7 sm:p-8 flex flex-col h-full transition-all duration-300 group"
                style={{
                  background: pl.popular
                    ? "linear-gradient(135deg, oklch(0.12 0.04 270 / 0.8), oklch(0.08 0.03 260 / 0.6))"
                    : "oklch(0.08 0.03 270 / 0.3)",
                  border: pl.popular
                    ? "1px solid oklch(0.7 0.15 200 / 0.3)"
                    : "1px solid oklch(1 0 0 / 0.06)",
                  boxShadow: pl.popular ? "0 0 40px oklch(0.7 0.15 200 / 0.15)" : "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  if (pl.popular) e.currentTarget.style.boxShadow = "0 0 60px oklch(0.7 0.15 200 / 0.25)";
                  else e.currentTarget.style.borderColor = "oklch(0.7 0.15 200 / 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  if (pl.popular) e.currentTarget.style.boxShadow = "0 0 40px oklch(0.7 0.15 200 / 0.15)";
                  else e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.06)";
                }}
              >
                {pl.popular && (
                  <>
                    <div className="absolute -inset-[1px] rounded-2xl pointer-events-none opacity-40"
                      style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200 / 0.3), transparent 40%, transparent 60%, oklch(0.7 0.15 200 / 0.3))", zIndex: -1 }} />
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-white"
                        style={{ background: "linear-gradient(135deg, oklch(0.7 0.15 200), oklch(0.6 0.2 240))", boxShadow: "0 0 20px oklch(0.7 0.15 200 / 0.3)" }}>
                        <Star className="w-2.5 h-2.5 fill-white" />Popularny
                      </span>
                    </div>
                  </>
                )}

                <h3 className="text-base font-semibold" style={{ color: "oklch(1 0 0 / 0.7)" }}>{pl.name}</h3>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-5xl sm:text-6xl font-bold tracking-tight text-white">
                    {price}
                  </span>
                  <span className="text-sm font-medium" style={{ color: "oklch(1 0 0 / 0.35)" }}>
                    {yearly && pl.sub === "/mies" ? "/rok" : pl.sub}
                  </span>
                </div>
                {yearly && pl.price !== "0" && pl.price !== "Indywidualnie" && (
                  <div className="mt-1 text-xs" style={{ color: "oklch(0.7 0.15 200 / 0.8)" }}>
                    {pl.price} zł/mies przy płatności rocznej
                  </div>
                )}

                <div className="mt-6 pt-5 flex-1" style={{ borderTop: "1px solid oklch(1 0 0 / 0.06)" }}>
                  <ul className="space-y-3 text-sm">
                    {pl.lines.map((l) => (
                      <li key={l} className="flex gap-3 items-start">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0"
                          style={{ color: pl.popular ? "oklch(0.7 0.15 200)" : "oklch(1 0 0 / 0.25)" }} />
                        <span style={{ color: pl.popular ? "oklch(1 0 0 / 0.85)" : "oklch(1 0 0 / 0.55)" }}>
                          {l}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8">
                  {pl.price === "0" && (
                    <Link to={pl.to || "/auth/teacher"}
                      className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                      style={{
                        background: "oklch(1 0 0 / 0.9)",
                        color: "oklch(0.06 0.03 270)",
                        boxShadow: "0 0 20px oklch(1 0 0 / 0.1)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 1)"; e.currentTarget.style.boxShadow = "0 0 30px oklch(1 0 0 / 0.2)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "oklch(1 0 0 / 0.9)"; e.currentTarget.style.boxShadow = "0 0 20px oklch(1 0 0 / 0.1)"; }}
                    >
                      {pl.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  )}
                  {pl.price !== "0" && pl.price !== "Indywidualnie" && (
                    <NexaPayCheckout planName={pl.name} amount={yearly ? yearlyPrice(pl.price) + " zł" : pl.price + " zł"} amountUsd={String(Math.round(parseInt(pl.price) / 4))} />
                  )}
                  {pl.price === "Indywidualnie" && (
                    <button
                      onClick={() => document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth" })}
                      className="w-full py-3 rounded-xl text-sm font-semibold transition-all duration-300"
                      style={{
                        border: "1px solid oklch(1 0 0 / 0.15)",
                        color: "oklch(1 0 0 / 0.6)",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.3)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.9)"; e.currentTarget.style.background = "oklch(1 0 0 / 0.04)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "oklch(1 0 0 / 0.15)"; e.currentTarget.style.color = "oklch(1 0 0 / 0.6)"; e.currentTarget.style.background = "transparent"; }}
                    >
                      {pl.cta}
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
