import { useState, type ComponentType } from "react";
import {
  ArrowRight,
  Bookmark,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  Info,
  KeyRound,
  Link2,
  LockKeyhole,
  ShieldCheck,
  Star,
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
  const [activeSubTab, setActiveSubTab] = useState<"portals" | "export">("portals");
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
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-slate-950">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Bezpieczne centrum dostępu
                </div>
                <h2 className="text-2xl font-semibold tracking-tight">E‑dziennik i eksport ocen</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Otwieraj oficjalne portale dzienników bezpośrednio i przenoś oceny do systemu
                  szkoły bez zawodnych ramek logowania.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-px bg-slate-200">
            <StatusCard icon={ShieldCheck} label="Połączenie" value="Oficjalne portale" />
            <StatusCard icon={KeyRound} label="Logowanie" value="Po stronie dostawcy" />
          </div>
        </div>
      </section>

      <nav
        className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-1 shadow-sm"
        aria-label="Sekcje E-dziennika"
      >
        <div className="flex min-w-max gap-1">
          <SubTabButton
            active={activeSubTab === "portals"}
            onClick={() => setActiveSubTab("portals")}
            icon={Globe}
            label="Portale dzienników"
          />
          <SubTabButton
            active={activeSubTab === "export"}
            onClick={() => setActiveSubTab("export")}
            icon={FileSpreadsheet}
            label="Eksport ocen"
          />
        </div>
      </nav>

      {activeSubTab === "portals" ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#0067b8]">
                  <Building2 className="h-4 w-4" />
                  System szkoły
                </div>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">
                  Wybierz dostawcę dziennika
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Portal otworzy się w bezpiecznej, osobnej karcie. Dane logowania nie przechodzą
                  przez EduNex.
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
