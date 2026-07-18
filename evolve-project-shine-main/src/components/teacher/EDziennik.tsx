import { useState, type ComponentType } from "react";
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Bookmark,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  ExternalLink,
  FileSpreadsheet,
  GraduationCap,
  Globe,
  Info,
  KeyRound,
  Link2,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { Eksport } from "./Eksport";

const CUSTOM_URL_KEY = "edunex-edziennik-custom-url";

const PROVIDERS = [
  {
    name: "Vulcan UONET+",
    shortName: "V",
    url: "https://uonetplus.vulcan.net.pl/",
    description: "Dziennik, frekwencja, oceny i komunikacja szkoły.",
    color: "bg-emerald-600",
    featured: true,
  },
  {
    name: "Librus Synergia",
    shortName: "L",
    url: "https://synergia.librus.pl/",
    description: "Bezpośrednie logowanie do panelu Synergia.",
    color: "bg-blue-700",
    featured: true,
  },
  {
    name: "Librus Dzienniczek+",
    shortName: "L+",
    url: "https://dzienniczek.librus.pl/",
    description: "Szybki dostęp do dzienniczka i wiadomości.",
    color: "bg-sky-700",
    featured: false,
  },
  {
    name: "EduPage",
    shortName: "E",
    url: "https://www.edupage.org/",
    description: "Plan, zastępstwa, oceny i materiały szkolne.",
    color: "bg-amber-600",
    featured: false,
  },
  {
    name: "Google Classroom",
    shortName: "G",
    url: "https://classroom.google.com/",
    description: "Klasy, zadania i materiały Google Workspace.",
    color: "bg-emerald-700",
    featured: false,
  },
] as const;

function getStoredCustomUrl() {
  try {
    return window.localStorage.getItem(CUSTOM_URL_KEY) || "";
  } catch {
    return "";
  }
}

function normalizeExternalUrl(value: string) {
  const candidate = value.trim();
  if (!candidate) return null;

  try {
    const parsed = new URL(candidate.startsWith("http") ? candidate : `https://${candidate}`);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function openExternalJournal(value: string) {
  const normalized = normalizeExternalUrl(value);
  if (!normalized) {
    toast.error("Wpisz poprawny adres strony dziennika.");
    return false;
  }

  window.open(normalized, "_blank", "noopener,noreferrer");
  return true;
}

export function EDziennik() {
  const [activeSubTab, setActiveSubTab] = useState<"nex" | "portals" | "export">("nex");
  const [customUrl, setCustomUrl] = useState(getStoredCustomUrl);

  const openCustomUrl = () => {
    if (!openExternalJournal(customUrl)) return;
    try {
      window.localStorage.setItem(CUSTOM_URL_KEY, normalizeExternalUrl(customUrl) || customUrl);
    } catch {
      // Opening the portal still works when local storage is restricted.
    }
  };

  return (
    <div className="space-y-6 text-slate-950">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-px bg-slate-200 lg:grid-cols-[1fr_360px]">
          <div className="bg-slate-950 px-5 py-6 text-white sm:px-7">
            <div className="flex items-start gap-4">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-[#0067b8]">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  E-dziennik od EduNex
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">NexDziennik</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Własne centrum codziennej pracy szkoły: lekcje, frekwencja, oceny, zadania,
                  komunikacja i raporty w jednym spokojnym widoku.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-200">
            <StatusCard icon={ShieldCheck} label="Dane" value="W ekosystemie EduNex" />
            <StatusCard icon={KeyRound} label="Dostęp" value="Zgodny z rolą" />
          </div>
        </div>
      </section>

      <nav
        className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        aria-label="Sekcje NexDziennika"
      >
        <div className="flex min-w-max gap-1">
          <SubTabButton
            active={activeSubTab === "nex"}
            onClick={() => setActiveSubTab("nex")}
            icon={Sparkles}
            label="NexDziennik"
          />
          <SubTabButton
            active={activeSubTab === "portals"}
            onClick={() => setActiveSubTab("portals")}
            icon={Globe}
            label="Integracje zewnętrzne"
          />
          <SubTabButton
            active={activeSubTab === "export"}
            onClick={() => setActiveSubTab("export")}
            icon={FileSpreadsheet}
            label="Eksport ocen"
          />
        </div>
      </nav>

      {activeSubTab === "nex" ? (
        <NexJournalOverview />
      ) : activeSubTab === "portals" ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0067b8]">
                  <Building2 className="h-4 w-4" />
                  System szkoły
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Połącz poprzedni dziennik
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Opcjonalne integracje pomagają w migracji i dostępie do starszych danych.
                  NexDziennik pozostaje głównym środowiskiem pracy.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Gotowe do użycia
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {PROVIDERS.map((provider) => (
                <article
                  key={provider.name}
                  className="group relative flex min-h-48 flex-col rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
                >
                  {provider.featured && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-blue-700">
                      <Star className="h-3 w-3" />
                      Popularny
                    </span>
                  )}
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-lg text-sm font-bold text-white shadow-sm ${provider.color}`}
                  >
                    {provider.shortName}
                  </div>
                  <h4 className="mt-4 text-base font-semibold text-slate-950">{provider.name}</h4>
                  <p className="mt-1 flex-1 text-sm leading-6 text-slate-600">
                    {provider.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => openExternalJournal(provider.url)}
                    className="mt-4 inline-flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 transition group-hover:border-slate-950 group-hover:bg-slate-950 group-hover:text-white"
                  >
                    Otwórz portal
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-4 lg:grid-cols-[1fr_360px]">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                openCustomUrl();
              }}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-700">
                  <Link2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-950">Inny system dziennika</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    Wklej oficjalny adres udostępniony przez szkołę.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <input
                  value={customUrl}
                  onChange={(event) => setCustomUrl(event.target.value)}
                  inputMode="url"
                  autoComplete="url"
                  placeholder="https://dziennik.twoja-szkola.pl"
                  aria-label="Adres innego systemu dziennika"
                  className="h-11 min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 font-mono text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-[#0067b8] focus:ring-2 focus:ring-[#0067b8]/15"
                />
                <button
                  type="submit"
                  disabled={!customUrl.trim()}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0067b8] px-4 text-sm font-semibold text-white transition hover:bg-[#005a9e] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Otwórz
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>

            <aside className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-blue-950 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Info className="h-4 w-4 text-blue-700" />
                Dlaczego osobna karta?
              </div>
              <p className="mt-3 text-sm leading-6 text-blue-900/80">
                Vulcan i Librus chronią logowanie przed osadzaniem w iframe. Bezpośrednie otwarcie
                eliminuje blokady CSP, problemy z cookies i niezabezpieczone proxy HTTP.
              </p>
            </aside>
          </section>

          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-2 font-semibold uppercase tracking-wide">
              <Bookmark className="h-3.5 w-3.5" />
              Szybki dostęp
            </span>
            {PROVIDERS.slice(0, 3).map((provider) => (
              <button
                key={provider.name}
                type="button"
                onClick={() => openExternalJournal(provider.url)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {provider.name}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <Eksport />
      )}
    </div>
  );
}

const TODAY_LESSONS = [
  { time: "08:00", subject: "Matematyka", className: "2B", room: "204", status: "Zakończona" },
  { time: "09:50", subject: "Matematyka", className: "1A", room: "204", status: "Teraz" },
  { time: "11:45", subject: "Koło naukowe", className: "3A", room: "Lab 2", status: "Za 1 h" },
] as const;

const JOURNAL_METRICS = [
  {
    label: "Obecność dziś",
    value: "93,8%",
    detail: "+1,4% vs. tydzień",
    icon: UserCheck,
    tone: "text-emerald-700 bg-emerald-50",
  },
  {
    label: "Oceny do wpisania",
    value: "12",
    detail: "2 sprawdziany",
    icon: TrendingUp,
    tone: "text-blue-700 bg-blue-50",
  },
  {
    label: "Prace do sprawdzenia",
    value: "18",
    detail: "najbliższy termin jutro",
    icon: ClipboardCheck,
    tone: "text-violet-700 bg-violet-50",
  },
  {
    label: "Nowe wiadomości",
    value: "5",
    detail: "2 wymagają odpowiedzi",
    icon: BellRing,
    tone: "text-amber-700 bg-amber-50",
  },
] as const;

const QUICK_ACTIONS = [
  { icon: GraduationCap, title: "Wpisz oceny", description: "Otwórz arkusz ocen aktywnej klasy" },
  {
    icon: UserCheck,
    title: "Sprawdź obecność",
    description: "Uzupełnij frekwencję bieżącej lekcji",
  },
  {
    icon: MessageSquareText,
    title: "Napisz wiadomość",
    description: "Skontaktuj się z klasą lub rodzicem",
  },
] as const;

function NexJournalOverview() {
  return (
    <div className="space-y-5">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {JOURNAL_METRICS.map((item) => {
          const Icon = item.icon;
          return (
            <article
              key={item.label}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
                    {item.value}
                  </p>
                </div>
                <span className={`grid h-10 w-10 place-items-center rounded-xl ${item.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-xs text-slate-500">{item.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.12fr_.88fr]">
        <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4 sm:px-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.11em] text-[#0067b8]">
                <CalendarDays className="h-4 w-4" />
                Plan na dziś
              </div>
              <h3 className="mt-1 text-lg font-semibold text-slate-950">Środa, 18 lipca</h3>
            </div>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              3 lekcje
            </span>
          </div>
          <div className="divide-y divide-slate-100">
            {TODAY_LESSONS.map((lesson) => (
              <div
                key={`${lesson.time}-${lesson.className}`}
                className="grid grid-cols-[58px_1fr_auto] items-center gap-4 px-5 py-4 sm:px-6"
              >
                <div className="font-mono text-xs font-semibold text-slate-500">{lesson.time}</div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{lesson.subject}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Klasa {lesson.className} · sala {lesson.room}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                    lesson.status === "Teraz"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {lesson.status}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.11em] text-[#0067b8]">
                Klasa 2B
              </div>
              <h3 className="mt-2 text-lg font-semibold text-slate-950">
                Sygnały wymagające uwagi
              </h3>
            </div>
            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>
          <div className="mt-6 space-y-3">
            {[
              ["Frekwencja", "3 uczniów poniżej 80%", "bg-amber-500"],
              ["Zadania", "5 zaległych oddań", "bg-violet-500"],
              ["Postęp", "średnia klasy wzrosła o 0,3", "bg-emerald-500"],
            ].map(([label, detail, color]) => (
              <div
                key={label}
                className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4"
              >
                <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${color}`} />
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{detail}</span>
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {QUICK_ACTIONS.map(({ icon: Icon, title, description }) => (
          <button
            key={title}
            type="button"
            onClick={() =>
              toast.info(`${title}: moduł jest przygotowany do podłączenia do danych klasy.`)
            }
            className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-[#0067b8]/40 hover:shadow-md"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-slate-100 text-[#0067b8] transition group-hover:bg-[#0067b8] group-hover:text-white">
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-slate-950">{title}</span>
              <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
            </span>
          </button>
        ))}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-950">
        <span className="flex items-center gap-3">
          <Clock3 className="h-5 w-5 shrink-0 text-[#0067b8]" />
          NexDziennik synchronizuje widoki klas, ocen, obecności i zadań w jednym środowisku EduNex.
        </span>
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-blue-800">
          <CheckCircle2 className="h-4 w-4" />
          Wszystkie moduły gotowe
        </span>
      </div>
    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col justify-center bg-white p-4">
      <Icon className="h-4 w-4 text-[#0067b8]" />
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-xs font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function SubTabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        active
          ? "bg-slate-100 text-slate-950"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}
