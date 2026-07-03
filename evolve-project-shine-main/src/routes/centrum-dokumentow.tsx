import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, CheckCircle2, ClipboardCheck, Database, FileText, LockKeyhole, Search, ShieldCheck, UserCog } from "lucide-react";

export const Route = createFileRoute("/centrum-dokumentow")({
  component: DocumentCenter,
  head: () => ({
    meta: [
      { title: "Centrum dokumentów — EduNex" },
      { name: "description", content: "Dokumenty wdrożeniowe EduNex dla szkoły, IOD i administratora." },
    ],
  }),
});

const groups = [
  {
    id: "school",
    label: "Szkoła",
    icon: Building2,
    caption: "Pakiet wdrożenia dla dyrekcji i sekretariatu",
    docs: [
      ["Pakiet wdrożeniowy", "Zakres uruchomienia, lista ról, klasy, nauczyciele, kontakt techniczny i tryb zgłoszeń."],
      ["Regulamin platformy", "Zasady korzystania z egzaminów, sesji PIN, materiałów, raportów i kont użytkowników."],
      ["Instrukcja nauczyciela", "Tworzenie sprawdzianu, start sesji, wyniki live, eksporty i bezpieczne użycie AI."],
    ],
  },
  {
    id: "iod",
    label: "IOD / RODO",
    icon: ShieldCheck,
    caption: "Dokumentacja prywatności i powierzenia danych",
    docs: [
      ["Umowa powierzenia", "Zakres danych, cele przetwarzania, retencja, podprocesorzy i zakończenie usługi."],
      ["Informacja RODO", "Administrator danych, kontakt IOD, podstawy prawne, prawa użytkowników i okresy przechowywania."],
      ["Rejestr ryzyk", "Procesy: egzaminy, wyniki, AI Tutor, e-dziennik, audyt i dostęp administracyjny."],
    ],
  },
  {
    id: "admin",
    label: "Administrator",
    icon: UserCog,
    caption: "Role, bezpieczeństwo, audyt i utrzymanie systemu",
    docs: [
      ["Matryca uprawnień", "Uczeń, nauczyciel, rodzic, dyrektor i administrator — kto widzi dane i kto zatwierdza decyzje."],
      ["Procedura incydentu", "Klasyfikacja zdarzeń, zabezpieczenie logów, powiadomienie IOD i działania naprawcze."],
      ["Checklista techniczna", "Logowanie, SSO, PIN, Supabase, AI Tutor, e-dziennik, eksporty i test produkcji."],
    ],
  },
] as const;

function DocumentCenter() {
  const [active, setActive] = useState<(typeof groups)[number]["id"]>("school");
  const [query, setQuery] = useState("");
  const group = groups.find((g) => g.id === active) ?? groups[0];
  const Icon = group.icon;

  const docs = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return group.docs;
    return group.docs.filter(([title, text]) => `${title} ${text}`.toLowerCase().includes(q));
  }, [group, query]);

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_16%_12%,rgba(0,120,212,.34),transparent_32%),radial-gradient(circle_at_86%_8%,rgba(80,230,255,.16),transparent_28%),linear-gradient(135deg,#020617,#07111f_48%,#0f172a)]" />
      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.07] px-4 py-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Strona główna
          </Link>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/25 bg-emerald-300/10 px-4 py-2 text-xs font-semibold text-emerald-100">
            <CheckCircle2 className="h-4 w-4" /> Centrum zgodności i wdrożenia
          </span>
        </div>

        <section className="rounded-[32px] border border-white/10 bg-white/[.055] p-6 shadow-[0_32px_120px_rgba(0,0,0,.38)] backdrop-blur-xl lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_.9fr] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/[.07] px-3 py-1 text-xs font-semibold uppercase tracking-[.18em] text-sky-100">
                <LockKeyhole className="h-3.5 w-3.5" /> Dokumentacja instytucjonalna
              </div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-[-.055em] sm:text-5xl lg:text-6xl">
                Centrum dokumentów dla szkoły, IOD i administratora.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
                Jedno miejsce na dokumenty wdrożeniowe, RODO, procedury bezpieczeństwa, role systemowe i checklisty techniczne. Poważnie, czytelnie i bez sztucznego marketingu.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-[#020617]/45 p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#0078d4] shadow-[0_18px_40px_rgba(0,120,212,.32)]">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Aktualny pakiet: {group.label}</div>
                  <div className="mt-1 text-xs leading-5 text-white/55">{group.caption}</div>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-white/62">
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3">RODO</div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3">Audyt</div>
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3">Role</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-3 rounded-[28px] border border-white/10 bg-white/[.045] p-4 backdrop-blur-xl lg:sticky lg:top-6 lg:h-fit">
            {groups.map((item) => {
              const GIcon = item.icon;
              const isActive = item.id === active;
              return (
                <button key={item.id} onClick={() => setActive(item.id)} className={`w-full rounded-2xl border p-4 text-left transition ${isActive ? "border-[#50e6ff]/45 bg-[#0078d4]/20" : "border-white/10 bg-white/[.035] hover:bg-white/[.07]"}`}>
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-xl ${isActive ? "bg-[#0078d4]" : "bg-white/[.07]"}`}>
                      <GIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-1 text-xs leading-5 text-white/52">{item.caption}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </aside>

          <div className="space-y-5">
            <div className="flex flex-col gap-3 rounded-[24px] border border-white/10 bg-white/[.045] p-4 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold tracking-[-.03em]">{group.label}</h2>
                <p className="mt-1 text-sm text-white/55">{docs.length} dokumenty / procedury w tym pakiecie</p>
              </div>
              <label className="relative block w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/38" />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Szukaj dokumentu..." className="h-11 w-full rounded-2xl border border-white/10 bg-[#020617]/45 pl-10 pr-4 text-sm text-white outline-none focus:border-[#50e6ff]/50" />
              </label>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {docs.map(([title, text]) => (
                <article key={title} className="rounded-[28px] border border-white/10 bg-white/[.048] p-5 shadow-[0_24px_80px_rgba(0,0,0,.22)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-white/18">
                  <div className="flex items-start gap-4">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white text-[#0067b8] shadow-lg">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold tracking-[-.025em]">{title}</h3>
                      <p className="mt-2 text-sm leading-6 text-white/62">{text}</p>
                      <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[.12em] text-white/55">
                        <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1">wersja robocza</span>
                        <span className="rounded-full border border-white/10 bg-white/[.04] px-3 py-1">do zatwierdzenia</span>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="rounded-[28px] border border-sky-300/18 bg-sky-300/[.07] p-5 text-sm leading-6 text-sky-50/82">
              <div className="mb-2 flex items-center gap-2 font-semibold text-sky-100">
                <ClipboardCheck className="h-4 w-4" /> Standard wdrożenia
              </div>
              Dokumenty są bazą operacyjną. Przed użyciem w realnej szkole powinny zostać uzupełnione o dane placówki, faktycznego administratora danych, kontakt IOD, retencję i aktywne integracje.
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
