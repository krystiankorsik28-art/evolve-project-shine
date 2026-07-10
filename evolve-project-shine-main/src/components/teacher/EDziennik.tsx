import { useEffect, useRef, useState, type ComponentType, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  FileSpreadsheet,
  Globe,
  Info,
  LockKeyhole,
  Monitor,
  RotateCw,
  Save,
  Settings as SettingsIcon,
  ShieldAlert,
  Smartphone,
  WifiOff,
  X,
  Zap,
} from "lucide-react";
import { Eksport } from "./Eksport";

const PROXY_URL_KEY = "edunex-proxy-url";
const DEFAULT_PROXY_URL = "http://proxy.edunex.pl";

function getStoredProxyUrl(): string {
  try {
    return localStorage.getItem(PROXY_URL_KEY) || DEFAULT_PROXY_URL;
  } catch {
    return DEFAULT_PROXY_URL;
  }
}

function storeProxyUrl(url: string) {
  try {
    localStorage.setItem(PROXY_URL_KEY, url);
  } catch {
    // Local storage can be unavailable in restricted browser contexts.
  }
}

const PRESETS = [
  { name: "Vulcan UONET+", url: "https://uonetplus.vulcan.net.pl/", tone: "bg-emerald-600" },
  { name: "Librus Synergia", url: "https://synergia.librus.pl/", tone: "bg-blue-700" },
  { name: "Librus Dzienniczek+", url: "https://dzienniczek.librus.pl/", tone: "bg-sky-700" },
  { name: "EduPage", url: "https://www.edupage.org/", tone: "bg-amber-600" },
  { name: "Google Classroom", url: "https://classroom.google.com/", tone: "bg-emerald-700" },
];

const BLOCKED_DOMAINS = [
  "librus.pl",
  "vulcan.net.pl",
  "uonetplus.vulcan.net.pl",
  "synergia.librus.pl",
  "dzienniczek.librus.pl",
  "portal.librus.pl",
];

function needsProxy(value: string) {
  try {
    const hostname = new URL(value).hostname;
    return BLOCKED_DOMAINS.some((domain) => hostname.endsWith(domain) || hostname === domain);
  } catch {
    return false;
  }
}

export function EDziennik() {
  const [url, setUrl] = useState("https://uonetplus.vulcan.net.pl/");
  const [rawUrl, setRawUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeSubTab, setActiveSubTab] = useState<"browser" | "export">("browser");
  const [proxyMode, setProxyMode] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [proxyUrl, setProxyUrl] = useState(getStoredProxyUrl);
  const [showSettings, setShowSettings] = useState(false);
  const [editingProxyUrl, setEditingProxyUrl] = useState(getStoredProxyUrl);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);

  const buildIframeSrc = (targetUrl: string) => {
    if (!targetUrl) return "";
    if (proxyMode) return `${proxyUrl}?url=${encodeURIComponent(targetUrl)}`;
    return targetUrl;
  };

  const saveProxySettings = () => {
    storeProxyUrl(editingProxyUrl);
    setProxyUrl(editingProxyUrl);
    setShowSettings(false);
  };

  const navigate = (value: string) => {
    const normalized = value.startsWith("http") ? value : `https://${value}`;
    setUrl(normalized);
    setRawUrl(normalized);
    setLoading(true);
    setIframeError(false);
    setIframeLoaded(false);
    window.setTimeout(() => setLoading(false), 300);
  };

  const go = () => navigate(url);
  const reload = () => {
    if (rawUrl) navigate(rawUrl);
  };

  useEffect(() => {
    if (!rawUrl) return;
    historyRef.current.push(rawUrl);
    historyIdxRef.current = historyRef.current.length - 1;
    setCanGoBack(historyIdxRef.current > 0);
    setCanGoForward(false);
  }, [rawUrl]);

  const goBack = () => {
    if (historyIdxRef.current > 0) {
      historyIdxRef.current -= 1;
      const previous = historyRef.current[historyIdxRef.current];
      setUrl(previous);
      setRawUrl(previous);
      setCanGoBack(historyIdxRef.current > 0);
      setCanGoForward(true);
    }
  };

  const goForward = () => {
    if (historyIdxRef.current < historyRef.current.length - 1) {
      historyIdxRef.current += 1;
      const next = historyRef.current[historyIdxRef.current];
      setUrl(next);
      setRawUrl(next);
      setCanGoBack(true);
      setCanGoForward(historyIdxRef.current < historyRef.current.length - 1);
    }
  };

  const openInNewTab = (targetUrl: string) => {
    window.open(targetUrl, "_blank", "noopener");
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
  };

  const iframeSrc = buildIframeSrc(rawUrl);
  const blockedWithoutProxy = !proxyMode && needsProxy(url);
  const proxyRecommended = proxyMode && needsProxy(url);

  return (
    <div className="space-y-6 text-slate-950">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-px bg-slate-200 lg:grid-cols-[1fr_auto]">
          <div className="bg-slate-950 px-5 py-5 text-white sm:px-6">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-white text-slate-950">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/75">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Moduł integracji z e-dziennikiem
                </div>
                <h2 className="text-xl font-semibold">e-Dziennik i eksport ocen</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  Otwieraj system dziennika w kontrolowanym widoku lub przygotuj plik ocen do importu w Vulcan, Librus albo arkuszu kalkulacyjnym.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white p-4 lg:w-[360px]">
            <button
              onClick={() => setShowSettings((value) => !value)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                showSettings
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <SettingsIcon className="h-3.5 w-3.5" />
              Proxy
            </button>
            <ViewModeButton active={viewMode === "desktop"} onClick={() => setViewMode("desktop")} icon={Monitor} label="Desktop" />
            <ViewModeButton active={viewMode === "mobile"} onClick={() => setViewMode("mobile")} icon={Smartphone} label="Mobilny" />
          </div>
        </div>

        {showSettings && (
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
              <div className="flex-1">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">Adres serwera proxy</label>
                  <button onClick={() => setShowSettings(false)} className="text-slate-400 transition hover:text-slate-700" aria-label="Zamknij ustawienia proxy">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <input
                  value={editingProxyUrl}
                  onChange={(event) => setEditingProxyUrl(event.target.value)}
                  placeholder="https://proxy.edunex.pl"
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-mono text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
                <p className="mt-2 text-xs text-slate-500">
                  Domyślnie: <code className="rounded bg-white px-1.5 py-0.5 text-slate-700">{DEFAULT_PROXY_URL}</code>
                </p>
              </div>
              <button
                onClick={saveProxySettings}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <Save className="h-4 w-4" />
                Zapisz ustawienia
              </button>
            </div>
          </div>
        )}
      </section>

      <nav className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
        <div className="flex min-w-max gap-1">
          <SubTabButton active={activeSubTab === "browser"} onClick={() => setActiveSubTab("browser")} icon={Globe} label="Przeglądarka dziennika" />
          <SubTabButton active={activeSubTab === "export"} onClick={() => setActiveSubTab("export")} icon={FileSpreadsheet} label="Eksport ocen" />
        </div>
      </nav>

      {activeSubTab === "browser" ? (
        <section className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => navigate(preset.url)}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                    rawUrl.startsWith(preset.url)
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <span className={`h-2 w-2 rounded-full ${preset.tone}`} />
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">
              <div className="flex items-center gap-1">
                <IconButton onClick={goBack} disabled={!canGoBack} label="Wstecz" icon={ArrowLeft} />
                <IconButton onClick={goForward} disabled={!canGoForward} label="Dalej" icon={ArrowRight} />
                <IconButton onClick={reload} label="Odśwież" icon={RotateCw} spinning={loading} />
              </div>

              <div className="flex min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                <Globe className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={(event) => event.key === "Enter" && go()}
                  placeholder="Wpisz adres e-dziennika"
                  className="min-w-0 flex-1 bg-transparent font-mono text-sm text-slate-900 outline-none placeholder:text-slate-400"
                />
              </div>

              <button
                onClick={go}
                disabled={!url.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-45"
              >
                Przejdź
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-700">
                <span className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${proxyMode ? "bg-blue-700" : "bg-slate-300"}`}>
                  <input
                    type="checkbox"
                    checked={proxyMode}
                    onChange={() => setProxyMode((value) => !value)}
                    className="sr-only"
                  />
                  <span className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${proxyMode ? "left-6" : "left-1"}`} />
                </span>
                <span className="inline-flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-blue-700" />
                  Proxy iframe
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
                  iframeLoaded ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${iframeLoaded ? "bg-emerald-600" : "bg-slate-300"}`} />
                  {iframeLoaded ? "Połączono" : iframeError ? "Błąd ładowania" : "Gotowy"}
                </span>
                {proxyRecommended && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-blue-700">
                    <CheckCircle2 className="h-3 w-3" />
                    Proxy zalecany dla tej domeny
                  </span>
                )}
              </div>
            </div>

            {blockedWithoutProxy && (
              <Notice tone="danger" icon={ShieldAlert}>
                Ta domena najczęściej blokuje osadzanie w iframe. Włącz proxy albo otwórz dziennik w nowej karcie.
              </Notice>
            )}

            {proxyMode && (
              <Notice tone="warning" icon={Info}>
                Proxy może pomóc przy blokadzie iframe, ale część zewnętrznych logowań może wymagać otwarcia systemu w osobnej karcie.
              </Notice>
            )}

            <div className={`overflow-hidden bg-white ${viewMode === "mobile" ? "mx-auto max-w-[390px] border-x border-slate-200" : ""}`}>
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-2">
                <span className="truncate font-mono text-xs text-slate-500">{rawUrl || "Nie wybrano adresu"}</span>
                <div className="flex items-center gap-2">
                  {proxyMode && rawUrl && (
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">PROXY</span>
                  )}
                  {rawUrl && (
                    <button onClick={() => openInNewTab(rawUrl)} className="text-slate-500 transition hover:text-slate-950" title="Otwórz w nowej karcie">
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {rawUrl ? (
                <div className="relative">
                  {loading && (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-white/85">
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm">
                        <RotateCw className="h-4 w-4 animate-spin text-blue-700" />
                        Ładowanie...
                      </div>
                    </div>
                  )}

                  {iframeError && (
                    <div className="absolute inset-0 z-20 grid place-items-center bg-white/95 p-6">
                      <div className="max-w-md text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-rose-50 text-rose-700">
                          <WifiOff className="h-5 w-5" />
                        </div>
                        <h3 className="mt-4 text-sm font-semibold text-slate-950">Nie można załadować strony w ramce</h3>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          Zewnętrzny system może blokować osadzenie. Najpewniejsza ścieżka to otwarcie go w nowej karcie.
                        </p>
                        <div className="mt-4 flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => openInNewTab(rawUrl)}
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                            Otwórz w nowej karcie
                          </button>
                          <button
                            onClick={reload}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                            Spróbuj ponownie
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <iframe
                    ref={iframeRef}
                    src={iframeSrc}
                    className="h-[640px] w-full bg-white"
                    sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                    title="e-Dziennik"
                    onError={handleIframeError}
                    onLoad={handleIframeLoad}
                  />
                </div>
              ) : (
                <div className="grid min-h-[420px] place-items-center p-8 text-center">
                  <div className="max-w-md">
                    <div className="mx-auto grid h-12 w-12 place-items-center rounded-lg bg-slate-100 text-slate-500">
                      <Globe className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-sm font-semibold text-slate-950">Wybierz system dziennika</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Skorzystaj z szybkiego linku albo wpisz własny adres dziennika elektronicznego.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Bookmark className="h-3.5 w-3.5" />
              Szybkie linki
            </span>
            {PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() => openInNewTab(preset.url)}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {preset.name}
              </button>
            ))}
          </div>
        </section>
      ) : (
        <Eksport />
      )}
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
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition ${
        active ? "bg-slate-100 text-slate-950" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function ViewModeButton({
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
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-slate-950 bg-slate-950 text-white"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function IconButton({
  onClick,
  disabled,
  label,
  icon: Icon,
  spinning,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  icon: ComponentType<{ className?: string }>;
  spinning?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
      title={label}
      aria-label={label}
    >
      <Icon className={`h-4 w-4 ${spinning ? "animate-spin" : ""}`} />
    </button>
  );
}

function Notice({
  tone,
  icon: Icon,
  children,
}: {
  tone: "warning" | "danger";
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  const classes = tone === "warning"
    ? "border-amber-200 bg-amber-50 text-amber-900"
    : "border-rose-200 bg-rose-50 text-rose-900";

  return (
    <div className={`flex gap-3 border-b px-4 py-3 text-sm leading-6 ${classes}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
