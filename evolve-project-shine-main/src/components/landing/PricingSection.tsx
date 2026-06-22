import { useState, useRef, useEffect } from "react";
import { motion, useInView, animate, useMotionValue, useTransform } from "framer-motion";
import {
  CheckCircle2,
  Star,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  CreditCard,
  Crown,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { NexaPayCheckout } from "@/components/NexaPayCheckout";

const PLANS = [
  {
    name: "Klasa",
    price: "0",
    sub: "na zawsze",
    tagline: "Idealny na start",
    popular: false,
    icon: Sparkles,
    lines: [
      "Do 35 uczniów",
      "Bank pytań 300+",
      "Egzaminy bez limitu",
      "Podstawowe raporty",
      "Wsparcie e-mail",
    ],
    cta: "Rozpocznij za darmo",
    to: "/auth/teacher",
  },
  {
    name: "Nauczyciel",
    price: "99",
    sub: "/mies",
    tagline: "Wybór profesjonalistów",
    popular: true,
    icon: Zap,
    lines: [
      "Do 60 uczniów",
      "Bank pytań 3000+",
      "Egzaminy bez limitu",
      "Generator AI 200 zapytań",
      "Monitoring na żywo",
      "Wsparcie priorytetowe",
      "API REST",
    ],
    cta: "Wybierz Nauczyciel",
  },
  {
    name: "Szkoła",
    price: "490",
    sub: "/mies",
    tagline: "Dla całej placówki",
    popular: false,
    icon: ShieldCheck,
    lines: [
      "Do 300 uczniów",
      "Bank pytań bez limitu",
      "Anti-cheat + monitoring",
      "API REST + integracje",
      "Panel dyrekcji",
      "Wsparcie 24/7",
    ],
    cta: "Wybierz Szkoła",
  },
  {
    name: "Enterprise",
    price: "Indywidualnie",
    sub: "",
    tagline: "Skala bez granic",
    popular: false,
    icon: Crown,
    lines: [
      "Nieograniczona liczba użytkowników",
      "Dedykowany serwer",
      "SLA 99,99%",
      "Szkolenia stacjonarne",
      "Priorytetowe wsparcie 24/7",
    ],
    cta: "Poproś o wycenę",
    contact: true,
  },
];

const TRUST = [
  { icon: ShieldCheck, label: "30 dni gwarancji zwrotu" },
  { icon: CreditCard, label: "Karta, przelew lub krypto" },
  { icon: Zap, label: "Aktywacja w 2 minuty" },
  { icon: Star, label: "Bez ukrytych kosztów" },
];

function AnimatedPrice({ value, animateNow }: { value: string; animateNow: boolean }) {
  const isNumeric = /^\d+$/.test(value);
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());
  const [display, setDisplay] = useState(isNumeric ? "0" : value);

  useEffect(() => {
    if (!isNumeric) {
      setDisplay(value);
      return;
    }
    if (!animateNow) return;
    const controls = animate(mv, parseInt(value), { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, animateNow, isNumeric, mv, rounded]);

  return <>{display}</>;
}

function PricingCard({
  pl,
  index,
  yearly,
  sectionInView,
}: {
  pl: (typeof PLANS)[number];
  index: number;
  yearly: boolean;
  sectionInView: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const Icon = pl.icon;

  const yearlyPrice = (p: string) => {
    if (p === "0" || p === "Indywidualnie") return p;
    return String(Math.round(parseInt(p) * 0.8));
  };

  const price =
    yearly && pl.price !== "0" && pl.price !== "Indywidualnie" ? yearlyPrice(pl.price) : pl.price;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="relative rounded-3xl p-7 sm:p-8 flex flex-col h-full group will-change-transform"
      style={{
        marginTop: pl.popular ? "-12px" : "0",
        background: pl.popular
          ? "linear-gradient(165deg, oklch(0.12 0.05 250), oklch(0.06 0.03 260))"
          : "oklch(0.05 0.015 270)",
        border: pl.popular
          ? "1px solid oklch(0.72 0.16 200 / 0.4)"
          : "1px solid oklch(0.15 0.02 270)",
        boxShadow: pl.popular
          ? "0 24px 70px oklch(0.6 0.18 230 / 0.3), 0 0 60px oklch(0.72 0.16 200 / 0.12)"
          : "0 8px 30px oklch(0 0 0 / 0.5)",
        transition:
          "transform 0.35s cubic-bezier(0.16,1,0.3,1), border-color 0.35s, box-shadow 0.35s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = pl.popular
          ? "translateY(-8px) scale(1.015)"
          : "translateY(-8px)";
        if (!pl.popular) e.currentTarget.style.borderColor = "oklch(0.72 0.16 200 / 0.25)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0) scale(1)";
        if (!pl.popular) e.currentTarget.style.borderColor = "oklch(0.15 0.02 270)";
      }}
    >
      {pl.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-20">
          <span
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider text-white"
            style={{
              background: "linear-gradient(135deg, oklch(0.72 0.16 200), oklch(0.6 0.2 250))",
              boxShadow: "0 6px 24px oklch(0.65 0.18 230 / 0.5)",
            }}
          >
            <Star className="w-3 h-3 fill-white" />
            Najpopularniejszy
          </span>
        </div>
      )}

      <div className="relative z-10 flex flex-col h-full">
        {/* header */}
        <div className="flex items-center gap-3">
          <span
            className="grid place-items-center w-10 h-10 rounded-xl shrink-0"
            style={{
              background: pl.popular
                ? "linear-gradient(135deg, oklch(0.72 0.16 200 / 0.25), oklch(0.6 0.2 250 / 0.15))"
                : "oklch(0.1 0.02 270)",
              border: pl.popular
                ? "1px solid oklch(0.72 0.16 200 / 0.3)"
                : "1px solid oklch(0.18 0.02 270)",
            }}
          >
            <Icon
              className="w-5 h-5"
              style={{ color: pl.popular ? "oklch(0.78 0.15 200)" : "oklch(1 0 0 / 0.55)" }}
            />
          </span>
          <div>
            <h3 className="text-base font-semibold text-white">{pl.name}</h3>
            <p className="text-[11px]" style={{ color: "oklch(1 0 0 / 0.4)" }}>
              {pl.tagline}
            </p>
          </div>
        </div>

        {/* price */}
        <div className="mt-6 flex items-baseline gap-1">
          {pl.price !== "Indywidualnie" && (
            <span className="text-2xl font-semibold text-white/50">zł</span>
          )}
          <span
            className={`leading-none font-bold tracking-tight text-white ${pl.price === "Indywidualnie" ? "text-3xl sm:text-[2rem]" : "text-5xl sm:text-[3.4rem]"}`}
          >
            <AnimatedPrice value={price} animateNow={sectionInView} />
          </span>
          <span className="text-sm font-medium" style={{ color: "oklch(1 0 0 / 0.35)" }}>
            {yearly && pl.sub === "/mies" ? "/rok" : pl.sub}
          </span>
        </div>
        <div className="mt-1.5 h-4 text-xs" style={{ color: "oklch(0.78 0.15 200 / 0.85)" }}>
          {yearly && pl.price !== "0" && pl.price !== "Indywidualnie"
            ? `${pl.price} zł/mies rozliczane rocznie`
            : ""}
        </div>

        {/* features */}
        <div className="mt-6 pt-5 flex-1" style={{ borderTop: "1px solid oklch(0.15 0.02 270)" }}>
          <ul className="space-y-3 text-sm">
            {pl.lines.map((l, li) => (
              <motion.li
                key={l}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 + 0.2 + li * 0.05, duration: 0.4 }}
                className="flex gap-3 items-start"
              >
                <span
                  className="grid place-items-center w-[18px] h-[18px] rounded-full mt-0.5 shrink-0"
                  style={{
                    background: pl.popular ? "oklch(0.72 0.16 200 / 0.18)" : "oklch(0.12 0.02 270)",
                  }}
                >
                  <CheckCircle2
                    className="w-3 h-3"
                    style={{ color: pl.popular ? "oklch(0.78 0.15 200)" : "oklch(1 0 0 / 0.5)" }}
                  />
                </span>
                <span style={{ color: pl.popular ? "oklch(1 0 0 / 0.88)" : "oklch(1 0 0 / 0.6)" }}>
                  {l}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* cta */}
        <div className="mt-8">
          {pl.price === "0" && (
            <Link
              to={pl.to || "/auth/teacher"}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, oklch(0.72 0.16 200), oklch(0.55 0.22 250))",
                color: "#fff",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 30px oklch(0.6 0.18 230 / 0.5)";
                e.currentTarget.style.transform = "translateY(-1px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              {pl.cta} <ArrowRight className="w-4 h-4" />
            </Link>
          )}
          {pl.price !== "0" && pl.price !== "Indywidualnie" && (
            <NexaPayCheckout
              planName={pl.name}
              amount={yearly ? yearlyPrice(pl.price) + " zł" : pl.price + " zł"}
              amountUsd={String(Math.round(parseInt(pl.price) / 4))}
            />
          )}
          {pl.price === "Indywidualnie" && (
            <button
              onClick={() =>
                document.getElementById("kontakt")?.scrollIntoView({ behavior: "smooth" })
              }
              className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-300"
              style={{
                border: "1px solid oklch(0.72 0.16 200 / 0.25)",
                color: "oklch(0.78 0.15 200)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.72 0.16 200 / 0.5)";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.background = "oklch(0.72 0.16 200 / 0.08)";
                e.currentTarget.style.boxShadow = "0 0 20px oklch(0.6 0.18 230 / 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "oklch(0.72 0.16 200 / 0.25)";
                e.currentTarget.style.color = "oklch(0.78 0.15 200)";
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {pl.cta}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function PricingSection() {
  const [yearly, setYearly] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} id="cennik" className="relative py-28 sm:py-36 overflow-hidden">
      {/* ambient aurora */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[700px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.6 0.18 230 / 0.07) 0%, transparent 60%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[600px] h-[600px] rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.16 200 / 0.05) 0%, transparent 65%)",
            filter: "blur(30px)",
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12"
        >
          <span
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs mb-6"
            style={{
              background: "oklch(0.72 0.16 200 / 0.08)",
              border: "1px solid oklch(0.72 0.16 200 / 0.18)",
              color: "oklch(0.78 0.15 200)",
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cennik
          </span>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white text-balance">
            Wybierz swój{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.8 0.14 195), oklch(0.6 0.2 250))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              plan mocy
            </span>
          </h2>
          <p
            className="mt-4 text-base max-w-xl mx-auto text-pretty"
            style={{ color: "oklch(1 0 0 / 0.45)" }}
          >
            Od pojedynczej klasy po całą sieć szkół. Skaluj się wtedy, gdy chcesz — bez ukrytych
            kosztów.
          </p>
        </motion.div>

        {/* toggle */}
        <div className="flex items-center justify-center gap-4 mb-14">
          <span
            className="text-sm font-medium transition-colors"
            style={{ color: yearly ? "oklch(1 0 0 / 0.4)" : "oklch(1 0 0 / 0.9)" }}
          >
            Miesięcznie
          </span>
          <button
            onClick={() => setYearly(!yearly)}
            className="relative w-14 h-7 rounded-full transition-all duration-300"
            style={{
              background: yearly ? "oklch(0.72 0.16 200)" : "oklch(1 0 0 / 0.12)",
              boxShadow: yearly ? "0 0 20px oklch(0.72 0.16 200 / 0.5)" : "none",
            }}
            role="switch"
            aria-checked={yearly}
            aria-label="Przełącz rozliczenie roczne"
          >
            <span
              className="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300"
              style={{ transform: yearly ? "translateX(28px)" : "translateX(0)" }}
            />
          </button>
          <span
            className="text-sm font-medium transition-colors flex items-center gap-2"
            style={{ color: yearly ? "oklch(1 0 0 / 0.9)" : "oklch(1 0 0 / 0.4)" }}
          >
            Rocznie
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "oklch(0.72 0.16 200 / 0.18)", color: "oklch(0.78 0.15 200)" }}
            >
              Oszczędź 20%
            </span>
          </span>
        </div>

        {/* cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
          {PLANS.map((pl, i) => (
            <PricingCard key={pl.name} pl={pl} index={i} yearly={yearly} sectionInView={inView} />
          ))}
        </div>

        {/* trust bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
        >
          {TRUST.map((t) => {
            const TI = t.icon;
            return (
              <div
                key={t.label}
                className="flex items-center gap-2 text-sm"
                style={{ color: "oklch(1 0 0 / 0.5)" }}
              >
                <TI className="w-4 h-4" style={{ color: "oklch(0.78 0.15 200 / 0.8)" }} />
                {t.label}
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
