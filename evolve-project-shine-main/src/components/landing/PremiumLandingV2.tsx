import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Brain,
  Building2,
  CalendarDays,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileText,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Network,
  ShieldCheck,
  Sparkles,
  UsersRound,
  WandSparkles,
  Zap,
} from "lucide-react";

const nav = [
  ["Platforma", "#platforma"],
  ["Dla kogo", "#role"],
  ["Moduły", "#moduly"],
  ["Dokumenty", "#dokumenty"],
  ["Cennik", "#cennik"],
] as const;

const stats = [
  ["PIN", "wejście ucznia bez konta"],
  ["AI", "generator, tutor i ocena opisowa"],
  ["RODO", "dokumenty dla szkoły i IOD"],
  ["LIVE", "wyniki i sesje w czasie rzeczywistym"],
] as const;

const roleCards = [
  {
    icon: GraduationCap,
    title: "Nauczyciel",
    text: "Tworzy sprawdziany, uruchamia sesje PIN, obserwuje wyniki live, korzysta z AI i eksportuje raporty.",
    points: ["kreator egzaminu", "wyniki live", "AI Tutor", "eksport PDF/CSV"],
    href: "/auth/teacher",
  },
  {
    icon: BookOpenCheck,
    title: "Uczeń",
    text: "Wchodzi imieniem, nazwiskiem i kodem PIN. Widzi timer, postęp, multimedia i jasny ekran oddania pracy.",
    points: ["PIN bez konta", "timer", "postęp", "prosty interfejs"],
    href: "/auth/student",
  },
  {
    icon: Building2,
    title: "Szkoła / dyrekcja",
    text: "Ma wgląd w klasy, nauczycieli, wyniki, dokumenty, wdrożenie, status bezpieczeństwa i administrację.",
    points: ["role", "klasy", "audyt", "centrum dokumentów"],
    href: "/moduly",
  },
  {
    icon: ShieldCheck,
    title: "IOD / administrator",
    text: "Kontroluje dokumentację RODO, uprawnienia, procedury incydentów, matrycę ról i checklisty techniczne.",
    points: ["DPA", "RODO", "retencja", "procedury"],
    href: "/centrum-dokumentow",
  },
] as const;

const modules = [
  {
    icon: ClipboardCheck,
    title: "Egzaminy online",
    text: "Sesje PIN, pytania zamknięte, opisowe, multimedia, limity czasu i przejrzysty tryb pracy ucznia.",
  },
  {
    icon: LayoutDashboard,
    title: "Panel nauczyciela",
    text: "Aktywna sesja, duży PIN, oddane prace, średnia klasy, status live, eksport i szybka decyzja.",
  },
  {
    icon: BookOpenCheck,
    title: "E-dziennik",
    text: "Klasy, uczniowie, lekcje, frekwencja, oceny, zadania, kalendarz, ogłoszenia i wiadomości.",
  },
  {
    icon: FileText,
    title: "Centrum dokumentów",
    text: "Pakiet wdrożeniowy, regulamin, DPA, informacja RODO, matryca ról, procedura incydentu i checklisty.",
  },
  {
    icon: Brain,
    title: "AI Tutor",
    text: "Pomoc dla nauczyciela: generowanie pytań, konspekty, analiza odpowiedzi, propozycje ocen i feedback.",
  },
  {
    icon: ShieldCheck,
    title: "Bezpieczeństwo",
    text: "2FA, OTP, role, logi, RLS w Supabase, rozdzielenie danych szkoły i kontrola dostępu.",
  },
] as const;

const workflow = [
  ["01", "Utwórz sprawdzian", "Nauczyciel tworzy test ręcznie albo z pomocą AI. Dodaje typy pytań, multimedia i próg zaliczenia."],
  ["02", "Uruchom sesję PIN", "System generuje 6-cyfrowy PIN. Uczeń nie musi mieć konta, jeśli szkoła wybiera tryb szybkiej sesji."],
  ["03", "Zbieraj odpowiedzi live", "Panel pokazuje postęp, liczbę oddanych prac, średnią, alerty oraz czas pracy uczniów."],
  ["04", "Zamknij i raportuj", "Wyniki trafiają do tabel, eksportów, E-dziennika i analiz AI. Dokumenty pozostają w centrum zgodności."],
] as const;

const documentItems = [
  ["Pakiet wdrożeniowy szkoły", "role, klasy, administrator, kontakt techniczny"],
  ["Umowa powierzenia DPA", "zakres danych, retencja, podprocesorzy"],
  ["Informacja RODO", "uczeń, rodzic, nauczyciel, IOD"],
  ["Matryca ról", "dostęp do wyników, klas, raportów i AI"],
  ["Procedura incydentu", "reakcja, komunikacja, dowody, raport"],
  ["Checklista techniczna", "Vercel, Supabase, AI, E-dziennik, eksporty"],
] as const;

const security = [
  "role i uprawnienia",
  "2FA dla kont administracyjnych",
  "OTP reset hasła",
  "logi bezpieczeństwa",
  "RLS w Supabase",
  "separacja danych szkoły",
  "kontrola sesji PIN",
  "procedura incydentu",
] as const;

const aiFeatures = [
  ["Generator pytań", "Tworzenie testów i wariantów pytań pod temat lekcji."],
  ["Ocena opisowa", "Sugestie punktacji, feedback i wykrywanie braków w odpowiedzi."],
  ["Analiza klasy", "Najtrudniejsze pytania, średnia, ryzyka i rekomendacje powtórek."],
  ["Plan lekcji", "Konspekty, ćwiczenia i szybkie materiały dla nauczyciela."],
] as const;

const plans = [
  { name: "Klasa", price: "0 zł", tag: "start", features: ["Sesje PIN", "Proste sprawdziany", "Panel ucznia", "Podstawowe wyniki"] },
  { name: "Nauczyciel", price: "99 zł", tag: "najlepszy start", featured: true, features: ["AI Tutor", "Wyniki live", "Eksport PDF/CSV", "Biblioteka pytań", "Sesje egzaminacyjne"] },
  { name: "Szkoła", price: "490 zł", tag: "dla placówki", features: ["E-dziennik", "Role i klasy", "Centrum dokumentów", "2FA i audyt", "Raporty zbiorcze"] },
  { name: "Enterprise", price: "indywidualnie", tag: "sieci szkół", features: ["SSO", "API", "procedury IOD", "wdrożenie dedykowane", "opieka techniczna"] },
] as const;

const faq = [
  ["Czy uczeń musi mieć konto?", "Nie w trybie sesji PIN. Uczeń może wejść imieniem, nazwiskiem i 6-cyfrowym kodem sesji."],
  ["Czy to jest tylko strona marketingowa?", "Nie. Landing prowadzi do realnych modułów: logowania, E-dziennika, Centrum dokumentów, AI i paneli."],
  ["Czy AI samo wystawia oceny?", "AI pomaga nauczycielowi, ale decyzja końcowa powinna pozostać po stronie człowieka i szkoły."],
  ["Po co Centrum dokumentów?", "Żeby szkoła, IOD i administrator mieli jedno miejsce na RODO, DPA, role, procedury i checklisty."],
] as const;

function GlowOrb({ className }: { className: string }) {
  return <div className={`pointer-events-none absolute rounded-full blur-3xl ${className}`} />;
}

function SectionHeading({ eyebrow, title, text, center = false }: { eyebrow: string; title: string; text: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200/72">{eyebrow}</div>
      <h2 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">{title}</h2>
      <p className="mt-5 text-base leading-8 text-white/62">{text}</p>
    </div>
  );
}

function MetricCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.055] p-4 backdrop-blur-xl">
      <div className="text-2xl font-semibold tracking-[-0.04em] text-white">{value}</div>
      <div className="mt-1 text-xs leading-5 text-white/52">{label}</div>
    </div>
  );
}

function ProductMockup() {
  return (
    <div className="relative min-h-[540px] overflow-hidden rounded-[36px] border border-white/12 bg-[#081220]/86 p-4 shadow-[0_40px_140px_rgba(0,0,0,.44)] backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(80,230,255,.20),transparent_34%),radial-gradient(circle_at_12%_82%,rgba(0,120,212,.22),transparent_38%)]" />
      <div className="relative rounded-[28px] border border-white/10 bg-[#020617]/72 p-4">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-[#0067b8]">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">EduNex OS</div>
              <div className="text-xs text-white/45">Kokpit nauczyciela</div>
            </div>
          </div>
          <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-100">Sesja LIVE</div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            ["PIN", "482 913"],
            ["Oddane", "27/31"],
            ["Średnia", "78%"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/36">{label}</div>
              <div className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{value}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1.1fr_.9fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-white">Analiza klasy</div>
                <div className="text-xs text-white/42">wyniki w czasie rzeczywistym</div>
              </div>
              <BarChart3 className="h-5 w-5 text-sky-200" />
            </div>
            <div className="flex h-40 items-end gap-2 rounded-2xl bg-[#020617]/65 p-3">
              {[42, 74, 58, 86, 64, 92, 71, 80].map((height, index) => (
                <motion.div
                  key={index}
                  className="w-full rounded-t-xl bg-white/80"
                  initial={{ height: 12 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 0.8, delay: index * 0.05 }}
                />
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {[
              [Brain, "AI Tutor", "utworzono 10 pytań"],
              [ShieldCheck, "Bezpieczeństwo", "2FA aktywne"],
              [FileText, "Dokumenty", "7 szablonów RODO"],
            ].map(([Icon, title, text]) => {
              const C = Icon as typeof Brain;
              return (
                <div key={title as string} className="rounded-2xl border border-white/10 bg-white/[0.055] p-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[#0067b8]"><C className="h-5 w-5" /></div>
                    <div>
                      <div className="text-sm font-semibold text-white">{title as string}</div>
                      <div className="text-xs text-white/45">{text as string}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="relative mt-3 grid gap-3 sm:grid-cols-3">
        {[
          [CalendarDays, "E-dziennik", "lekcje i oceny"],
          [UsersRound, "Klasy", "31 uczniów"],
          [BadgeCheck, "Audyt", "RLS aktywne"],
        ].map(([Icon, title, text]) => {
          const C = Icon as typeof CalendarDays;
          return (
            <div key={title as string} className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
              <C className="h-5 w-5 text-sky-100" />
              <div className="mt-4 text-sm font-semibold text-white">{title as string}</div>
              <div className="mt-1 text-xs text-white/44">{text as string}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PremiumLandingV2() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#030712] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_8%,rgba(0,120,212,.34),transparent_30%),radial-gradient(circle_at_84%_8%,rgba(80,230,255,.18),transparent_28%),linear-gradient(135deg,#020617,#07111f_44%,#0f172a)]" />
        <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.12)_1px,transparent_1px)] [background-size:48px_48px]" />
        <GlowOrb className="left-[-8rem] top-24 h-72 w-72 bg-sky-500/22" />
        <GlowOrb className="right-[-10rem] top-1/3 h-80 w-80 bg-cyan-300/14" />
      </div>

      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030712]/72 backdrop-blur-2xl">
        <nav className="mx-auto flex max-w-7xl items-center gap-4 px-5 py-3 sm:px-8 lg:px-10">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#0067b8] shadow-[0_18px_60px_rgba(80,230,255,.18)]">
              <Zap className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold leading-5 text-white">EduNex</span>
              <span className="block text-xs text-white/45">School Operating System</span>
            </span>
          </Link>
          <div className="hidden flex-1 items-center justify-center gap-1 lg:flex">
            {nav.map(([label, href]) => (
              <a key={href} href={href} className="rounded-xl px-3 py-2 text-sm font-medium text-white/62 hover:bg-white/[0.07] hover:text-white">
                {label}
              </a>
            ))}
          </div>
          <Link to="/auth" className="ml-auto rounded-xl border border-white/12 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white/82 hover:bg-white/[0.1] lg:ml-0">
            Logowanie
          </Link>
          <Link to="/auth/teacher" className="hidden items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#07111f] hover:bg-white/90 sm:inline-flex">
            Panel nauczyciela <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <main>
        <section className="relative border-b border-white/10">
          <div className="mx-auto grid min-h-[86vh] max-w-7xl items-center gap-10 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10">
            <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[0.07] px-4 py-2 text-sm font-semibold text-sky-100">
                <Sparkles className="h-4 w-4" /> Premium platforma egzaminacyjna dla szkół
              </div>
              <h1 className="mt-7 max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.07em] text-white sm:text-6xl lg:text-7xl">
                EduNex jako kompletny system szkoły: egzaminy, AI, E-dziennik i dokumenty.
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-white/66 sm:text-lg">
                Nowoczesny landing, który nie udaje produktu. Każda sekcja prowadzi do realnego modułu: sesje PIN, panel nauczyciela, panel ucznia, E-dziennik, Centrum dokumentów, bezpieczeństwo i AI Tutor.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/auth/teacher" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-[#07111f] shadow-[0_20px_80px_rgba(255,255,255,.12)] hover:bg-white/90">
                  Uruchom panel nauczyciela <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/moduly" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.065] px-6 py-4 font-semibold text-white/84 hover:bg-white/[0.1]">
                  Zobacz centrum modułów <Network className="h-5 w-5" />
                </Link>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {stats.map(([value, label]) => <MetricCard key={value} value={value} label={label} />)}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
              <ProductMockup />
            </motion.div>
          </div>
        </section>

        <section id="platforma" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Platforma"
              title="Nie jedna podstrona. Cały system operacyjny dla szkoły."
              text="Strona główna pokazuje produkt jak SaaS klasy enterprise: kto używa systemu, co dostaje, jak wygląda proces, gdzie jest bezpieczeństwo i gdzie są dokumenty."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Egzamin", "Utwórz sprawdzian, wybierz typy pytań, dodaj multimedia i ustaw czas."],
                ["Sesja", "Wygeneruj PIN, pokaż uczniom kod i obserwuj start w czasie rzeczywistym."],
                ["Wyniki", "Zbieraj odpowiedzi, średnią klasy, statusy i eksporty PDF/CSV."],
                ["Zgodność", "Dokumenty, RODO, DPA, role, logi i procedury w jednym miejscu."],
              ].map(([title, text]) => (
                <div key={title} className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <div className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-100/70">{title}</div>
                  <p className="mt-4 text-sm leading-7 text-white/62">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="role" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Dla kogo"
              title="Każda rola ma własny powód, żeby używać EduNex."
              text="Nauczyciel nie powinien widzieć panelu administratora, uczeń nie powinien widzieć bałaganu, a IOD potrzebuje dokumentów i procedur, nie marketingu."
              center
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roleCards.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.title} to={item.href} className="group rounded-[30px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_24px_90px_rgba(0,0,0,.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0067b8] shadow-lg"><Icon className="h-6 w-6" /></div>
                    <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-white/58">{item.text}</p>
                    <div className="mt-5 flex flex-wrap gap-2">
                      {item.points.map((point) => <span key={point} className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-1 text-[11px] font-semibold text-white/55">{point}</span>)}
                    </div>
                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-100">Otwórz <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" /></div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        <section id="moduly" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Moduły produktu"
              title="Rozbudowana główna pokazuje funkcje, nie tylko hasło."
              text="To jest mapa systemu: egzaminy, panele, E-dziennik, dokumenty, AI i bezpieczeństwo. Każdy moduł jest opisany jako konkretna funkcja produktu."
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 shadow-[0_24px_90px_rgba(0,0,0,.18)] backdrop-blur-xl">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0067b8]"><Icon className="h-6 w-6" /></div>
                    <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/58">{item.text}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section id="workflow" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Proces"
              title="Od pomysłu nauczyciela do raportu szkoły."
              text="EduNex ma opowiadać pełny przepływ pracy: przygotowanie, sesja, odpowiedzi, ocena, raport i dokumentacja."
              center
            />
            <div className="mt-10 grid gap-4 lg:grid-cols-4">
              {workflow.map(([number, title, text]) => (
                <div key={number} className="rounded-[28px] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <div className="text-4xl font-semibold tracking-[-0.06em] text-white/18">{number}</div>
                  <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="dokumenty" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <SectionHeading
                eyebrow="Centrum dokumentów"
                title="Dokumenty dla szkoły, IOD i administratora."
                text="To był Twój ważny pomysł, więc jest pokazany jako duży filar produktu, nie drobny dodatek. Szkoła widzi, że EduNex myśli o wdrożeniu, RODO i odpowiedzialności."
              />
              <Link to="/centrum-dokumentow" className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-[#07111f] hover:bg-white/90">
                Otwórz Centrum dokumentów <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {documentItems.map(([title, text]) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl">
                  <FileText className="h-5 w-5 text-sky-100" />
                  <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ai" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
            <div className="rounded-[34px] border border-white/10 bg-white/[0.045] p-5 shadow-[0_34px_120px_rgba(0,0,0,.32)] backdrop-blur-xl">
              <div className="grid gap-3 sm:grid-cols-2">
                {aiFeatures.map(([title, text]) => (
                  <div key={title} className="rounded-3xl border border-white/10 bg-[#020617]/55 p-5">
                    <Brain className="h-6 w-6 text-sky-200" />
                    <h3 className="mt-6 text-lg font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-white/55">{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <SectionHeading
                eyebrow="AI Tutor"
                title="AI jako pomoc nauczyciela, nie czarna skrzynka."
                text="Landing pokazuje AI uczciwie: generator, analiza, sugestie ocen i rekomendacje. Decyzja końcowa nadal należy do człowieka i szkoły."
              />
              <Link to="/api/ai-health" className="mt-8 inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.065] px-6 py-4 font-semibold text-white/84 hover:bg-white/[0.1]">
                Sprawdź konfigurację AI <WandSparkles className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>

        <section id="bezpieczenstwo" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div>
              <SectionHeading
                eyebrow="Bezpieczeństwo"
                title="Wygląd premium plus argumenty dla szkoły."
                text="Strona ma robić efekt wizualny, ale też dawać dyrekcji i administratorowi konkret: role, audyt, 2FA, RLS, logi, dokumenty i procedury."
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {security.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] p-4 text-sm text-white/72 backdrop-blur-xl">
                  <Check className="h-5 w-5 shrink-0 text-emerald-300" /> {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cennik" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="Cennik"
              title="Od klasy do całej szkoły."
              text="Prosty model SaaS: zacznij od sprawdzianów, potem dołóż E-dziennik, dokumenty, AI i wdrożenie szkoły."
              center
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {plans.map((plan) => (
                <div key={plan.name} className={`rounded-[30px] border p-5 backdrop-blur-xl ${plan.featured ? "border-sky-300/35 bg-sky-300/[0.09] shadow-[0_28px_100px_rgba(80,230,255,.12)]" : "border-white/10 bg-white/[0.045]"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/54">{plan.tag}</span>
                  </div>
                  <div className="mt-6 text-3xl font-semibold tracking-[-0.05em] text-white">{plan.price}</div>
                  <div className="mt-5 space-y-3">
                    {plan.features.map((feature) => <div key={feature} className="flex items-center gap-2 text-sm text-white/62"><Check className="h-4 w-4 text-emerald-300" /> {feature}</div>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="border-b border-white/10 px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow="FAQ"
              title="Najważniejsze pytania szkoły od razu na głównej."
              text="To skraca drogę od zachwytu wizualnego do zrozumienia, że system ma sens operacyjny i prawny."
              center
            />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {faq.map(([question, answer]) => (
                <div key={question} className="rounded-[28px] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl">
                  <h3 className="text-lg font-semibold text-white">{question}</h3>
                  <p className="mt-3 text-sm leading-7 text-white/58">{answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 py-20 sm:px-8 lg:px-10">
          <div className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.06] p-8 shadow-[0_34px_120px_rgba(0,0,0,.32)] backdrop-blur-xl lg:p-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.18em] text-sky-200/72">Start</div>
                <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">EduNex ma wyglądać jak produkt za miliony, ale działać dla prawdziwej szkoły.</h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/62">Nowa główna pokazuje pełny system: egzaminy, panele, E-dziennik, AI, dokumenty, wdrożenie, zgodność i bezpieczeństwo.</p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Link to="/auth/teacher" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 font-semibold text-[#07111f] hover:bg-white/90">
                  Wejdź do panelu <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/moduly" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.065] px-6 py-4 font-semibold text-white/84 hover:bg-white/[0.1]">
                  Centrum modułów <Network className="h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} EduNex. System egzaminacyjny, E-dziennik i Centrum dokumentów.</div>
          <div className="flex flex-wrap gap-4">
            <Link to="/centrum-dokumentow" className="hover:text-white">Dokumenty</Link>
            <Link to="/edziennik" className="hover:text-white">E-dziennik</Link>
            <Link to="/moduly" className="hover:text-white">Moduły</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
