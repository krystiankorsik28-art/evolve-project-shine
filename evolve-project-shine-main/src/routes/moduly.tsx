import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Brain,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

export const Route = createFileRoute("/moduly")({
  component: ModulesHub,
  head: () => ({
    meta: [
      { title: "Moduły — EduNex" },
      {
        name: "description",
        content:
          "Centrum modułów EduNex: logowanie, NexDziennik, dokumenty, AI Tutor i panele systemowe.",
      },
    ],
  }),
});

const modules = [
  {
    title: "Panel logowania",
    description: "Microsoft-style wejście dla nauczyciela, administratora, ucznia i szkoły.",
    href: "/auth",
    icon: LockKeyhole,
    label: "Dostęp",
  },
  {
    title: "NexDziennik",
    description: "Klasy, uczniowie, lekcje, frekwencja, oceny, zadania, kalendarz i ogłoszenia.",
    href: "/edziennik",
    icon: BookOpenCheck,
    label: "Szkoła",
  },
  {
    title: "Centrum dokumentów",
    description: "Dokumenty dla szkoły, IOD i administratora: RODO, role, procedury i checklisty.",
    href: "/centrum-dokumentow",
    icon: FileText,
    label: "IOD",
  },
  {
    title: "AI Tutor health",
    description: "Szybki test konfiguracji AI: Gemini i zmienne Supabase po stronie Vercel.",
    href: "/api/ai-health",
    icon: Brain,
    label: "AI",
  },
];

function ModulesHub() {
  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(0,120,212,.34),transparent_32%),radial-gradient(circle_at_84%_8%,rgba(80,230,255,.16),transparent_28%),linear-gradient(135deg,#020617,#07111f_48%,#0f172a)]" />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.07] px-4 py-2 text-sm font-semibold text-white/75 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Strona główna
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-300/25 bg-sky-300/10 px-4 py-2 text-xs font-semibold text-sky-100">
            <LayoutDashboard className="h-4 w-4" /> Centrum systemu
          </span>
        </div>

        <section className="rounded-[32px] border border-white/10 bg-white/[.055] p-6 shadow-[0_32px_120px_rgba(0,0,0,.38)] backdrop-blur-xl lg:p-10">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.07] px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-sky-100">
              <ShieldCheck className="h-3.5 w-3.5" /> EduNex OS
            </div>
            <h1 className="text-4xl font-semibold tracking-[-.055em] sm:text-5xl lg:text-6xl">
              Centrum modułów EduNex.
            </h1>
            <p className="mt-5 text-base leading-7 text-white/68 sm:text-lg">
              Szybkie wejście do najważniejszych części systemu: logowania, NexDziennika, dokumentów
              szkoły/IOD oraz diagnostyki AI Tutor.
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {modules.map((item) => {
            const Icon = item.icon;
            const isApi = item.href.startsWith("/api/");
            const card = (
              <article className="h-full rounded-[28px] border border-white/10 bg-white/[.048] p-5 shadow-[0_24px_80px_rgba(0,0,0,.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/18">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#0067b8] shadow-lg">
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1 text-[11px] font-semibold uppercase tracking-[.12em] text-white/55">
                    {item.label}
                  </span>
                </div>
                <h2 className="mt-6 text-xl font-semibold tracking-[-.03em]">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/58">{item.description}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-100">
                  Otwórz <ArrowRight className="h-4 w-4" />
                </div>
              </article>
            );
            return isApi ? (
              <a key={item.href} href={item.href}>
                {card}
              </a>
            ) : (
              <Link key={item.href} to={item.href}>
                {card}
              </Link>
            );
          })}
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[.045] p-5 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">Docelowy układ produktu</h2>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Landing pokazuje wartość, logowanie daje dostęp, a moduły prowadzą do realnych
                funkcji szkoły.
              </p>
            </div>
            <Link
              to="/auth/teacher"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-[#07111f] hover:bg-white/90"
            >
              Wejdź jako nauczyciel <GraduationCap className="h-5 w-5" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
