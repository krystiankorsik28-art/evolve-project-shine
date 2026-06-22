import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "Czy EduNex jest zgodny z RODO i wytycznymi MEN?",
    a: "Tak. Platforma jest w pełni zgodna z RODO, wytycznymi MEN i standardami ISO 27001. Dane przetwarzane są wyłącznie w serwerach na terenie UE. Posiadamy procedury DPIA i wyznaczonego DPO.",
  },
  {
    q: "Jak działa AI w EduNex? Czy to bezpieczne?",
    a: "AI wykorzystuje routing multi-model (Gemini, GPT-4o, Claude) przez nasz własny gateway. Żadne dane uczniów nie są wykorzystywane do treningu modeli. Wszystko jest szyfrowane end-to-end i logowane w celach audytowych.",
  },
  {
    q: "Ile czasu zajmuje wdrożenie w szkole?",
    a: "Podstawowe wdrożenie trwa 24-48 godzin. Import danych z SIO, dzienników elektronicznych i systemów szkolnych jest zautomatyzowany. Oferujemy dedykowane wsparcie onboardingowe dla każdej szkoły.",
  },
  {
    q: "Czy mogę przetestować platformę przed zakupem?",
    a: "Tak — oferujemy darmowy plan z pełnym dostępem do podstawowych funkcji. Nie wymagamy karty kredytowej. Plan PRO możesz testować przez 14 dni za darmo.",
  },
  {
    q: "Jakie przedmioty obsługuje AI Generator?",
    a: "Wszystkie przedmioty szkolne: matematyka, fizyka, chemia, biologia, polski, angielski, historia, WOS, informatyka i wiele innych. AI generuje pytania otwarte, zamknięte, wielokrotnego wyboru, z uzupełnianiem i praktyczne.",
  },
  {
    q: "Czy platforma działa na telefonach i tabletach?",
    a: "Tak — EduNex jest w pełni responsywny i zoptymalizowany pod urządzenia mobilne. Uczniowie mogą rozwiązywać egzaminy na telefonie, tablecie i komputerze z identycznym komfortem.",
  },
  {
    q: "Jak wygląda wsparcie techniczne?",
    a: "Oferujemy wsparcie 24/7 przez chat, email i telefon. Czas odpowiedzi dla planów PRO: < 2h. Enterprise: dedykowany opiekun + SLA 99.99%. Baza wiedzy z 500+ artykułami.",
  },
  {
    q: "Czy mogę zintegrować EduNex z dziennikiem elektronicznym?",
    a: "Tak — obsługujemy integracje z Vulcan, Librus, Synergia, Teams i Google Classroom. API REST/GraphQL umożliwia integrację z dowolnym systemem.",
  },
];

function FAQItem({
  item,
  isOpen,
  toggle,
}: {
  item: (typeof FAQ_ITEMS)[0];
  isOpen: boolean;
  toggle: () => void;
}) {
  return (
    <div
      className="rounded-xl transition-all duration-300"
      style={{
        background: isOpen ? "oklch(0.06 0.02 270)" : "oklch(0.04 0.01 270)",
        border: isOpen ? "1px solid oklch(0.72 0.16 200 / 0.2)" : "1px solid oklch(0.12 0.02 270)",
      }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
      >
        <span className="text-sm font-medium text-white pr-4">{item.q}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0"
        >
          <ChevronDown
            className="w-4 h-4"
            style={{ color: isOpen ? "oklch(0.78 0.15 200)" : "oklch(1 0 0 / 0.3)" }}
          />
        </motion.span>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p
              className="px-5 pb-5 text-sm leading-relaxed"
              style={{ color: "oklch(1 0 0 / 0.5)" }}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function FAQSectionPremium() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} id="faq" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
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
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Najczęstsze pytania
          </h2>
          <p className="mt-3 text-sm" style={{ color: "oklch(1 0 0 / 0.4)" }}>
            Odpowiedzi na pytania, które słyszymy najczęściej od szkół i nauczycieli.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-3"
        >
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              item={item}
              isOpen={openIdx === i}
              toggle={() => setOpenIdx(openIdx === i ? null : i)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
