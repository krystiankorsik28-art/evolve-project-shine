import { useState, useRef, useEffect } from "react";
import { ExternalLink, Globe, ArrowLeft, ArrowRight, RotateCw, Bookmark, Monitor, Smartphone, Info, ExternalLink as LinkIcon, ShieldAlert, WifiOff, Zap, Settings as SettingsIcon, Save, X } from "lucide-react";
import { Eksport } from "./Eksport";

const PROXY_URL_KEY = "edunex-proxy-url";
const DEFAULT_PROXY_URL = "http://proxy.edunex.pl";

function getStoredProxyUrl(): string {
  try { return localStorage.getItem(PROXY_URL_KEY) || DEFAULT_PROXY_URL; } catch { return DEFAULT_PROXY_URL; }
}

function storeProxyUrl(url: string) {
  try { localStorage.setItem(PROXY_URL_KEY, url); } catch { /* noop */ }
}

const PRESETS = [
  { name: "Vulcan UONET+", url: "https://uonetplus.vulcan.net.pl/", color: "bg-emerald-500" },
  { name: "Librus Synergia", url: "https://synergia.librus.pl/", color: "bg-blue-500" },
  { name: "Librus Dzienniczek+", url: "https://dzienniczek.librus.pl/", color: "bg-blue-600" },
  { name: "EduPage", url: "https://www.edupage.org/", color: "bg-orange-500" },
  { name: "Google Classroom", url: "https://classroom.google.com/", color: "bg-green-500" },
];

const BLOCKED_DOMAINS = ["librus.pl", "vulcan.net.pl", "uonetplus.vulcan.net.pl", "synergia.librus.pl", "dzienniczek.librus.pl", "portal.librus.pl"];

function needsProxy(u: string) {
  try {
    const hostname = new URL(u).hostname;
    return BLOCKED_DOMAINS.some((d) => hostname.endsWith(d) || hostname === d);
  } catch { return false; }
}

export function EDziennik() {
  const [url, setUrl] = useState("https://uonetplus.vulcan.net.pl/");
  const [rawUrl, setRawUrl] = useState(""); // the real URL the user wants to visit
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [activeSubTab, setActiveSubTab] = useState<"browser" | "export">("browser");
  const [proxyMode, setProxyMode] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [proxyUrl, setProxyUrl] = useState(getStoredProxyUrl);
  const [showSettings, setShowSettings] = useState(false);
  const [editingProxyUrl, setEditingProxyUrl] = useState(getStoredProxyUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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

  const navigate = (u: string) => {
    const normalized = u.startsWith("http") ? u : `https://${u}`;
    setUrl(normalized);
    setRawUrl(normalized);
    setLoading(true);
    setIframeError(false);
    setIframeLoaded(false);
    setTimeout(() => {
      setLoading(false);
    }, 300);
  };

  const go = () => navigate(url);
  const reload = () => { if (rawUrl) navigate(rawUrl); };

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const historyRef = useRef<string[]>([]);
  const historyIdxRef = useRef(-1);

  useEffect(() => {
    if (!rawUrl) return;
    historyRef.current.push(rawUrl);
    historyIdxRef.current = historyRef.current.length - 1;
    setCanGoBack(historyIdxRef.current > 0);
    setCanGoForward(false);
  }, [rawUrl]);

  const goBack = () => {
    if (historyIdxRef.current > 0) {
      historyIdxRef.current--;
      const u = historyRef.current[historyIdxRef.current];
      setUrl(u);
      setRawUrl(u);
      setCanGoBack(historyIdxRef.current > 0);
      setCanGoForward(true);
    }
  };
  const goForward = () => {
    if (historyIdxRef.current < historyRef.current.length - 1) {
      historyIdxRef.current++;
      const u = historyRef.current[historyIdxRef.current];
      setUrl(u);
      setRawUrl(u);
      setCanGoBack(true);
      setCanGoForward(historyIdxRef.current < historyRef.current.length - 1);
    }
  };

  const openInNewTab = (u: string) => {
    window.open(u, "_blank", "noopener");
  };

  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
  };

  const isBlocked = proxyMode && needsProxy(url);
  const iframeSrc = buildIframeSrc(rawUrl);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-accent/10 to-accent/10 p-6 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-white">e-Dziennik — przeglądarka</h2>
            <p className="text-xs text-white/50">Zaloguj się do swojego dziennika elektronicznego bezpośrednio z poziomu EduNex</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowSettings(!showSettings)} className={`p-2 rounded-lg text-xs transition ${showSettings ? "bg-cyan-500/20 text-cyan-300" : "text-white/50 hover:text-white hover:bg-white/5"}`} title="Ustawienia proxy">
            <SettingsIcon className="w-4 h-4" />
          </button>
          <button onClick={() => setViewMode("desktop")} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${viewMode === "desktop" ? "bg-cyan-500 text-black" : "bg-white/5 text-white/50 hover:text-white"}`}><Monitor className="w-3.5 h-3.5 inline mr-1" />Desktop</button>
          <button onClick={() => setViewMode("mobile")} className={`px-3 py-1.5 rounded-lg text-xs font-mono transition ${viewMode === "mobile" ? "bg-cyan-500 text-black" : "bg-white/5 text-white/50 hover:text-white"}`}><Smartphone className="w-3.5 h-3.5 inline mr-1" />Mobilny</button>
        </div>
      </div>

      {/* Proxy settings panel */}
      {showSettings && (
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2"><SettingsIcon className="w-4 h-4 text-cyan-400" />Ustawienia proxy</h3>
            <button onClick={() => setShowSettings(false)} className="text-white/30 hover:text-white/60 transition"><ExternalLink className="w-4 h-4 rotate-45" /></button>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-white/50 font-mono">Adres serwera proxy</label>
            <div className="flex gap-2">
              <input
                value={editingProxyUrl}
                onChange={(e) => setEditingProxyUrl(e.target.value)}
                placeholder="https://proxy.edunex.pl"
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 font-mono outline-none focus:border-cyan-500/50 transition"
              />
              <button onClick={saveProxySettings} className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold transition flex items-center gap-1.5">
                <Save className="w-4 h-4" />Zapisz
              </button>
            </div>
            <p className="text-[10px] text-white/30 font-mono">
              Domyślnie: <code className="text-cyan-400/60">http://proxy.edunex.pl</code> (nazwa.pl)
            </p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-white/30">
            <span className={`inline-block w-1.5 h-1.5 rounded-full ${proxyUrl !== DEFAULT_PROXY_URL ? "bg-emerald-400" : "bg-white/20"}`} />
            Aktualny: <code className="text-white/50 font-mono">{proxyUrl}</code>
          </div>
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-1 border-b border-white/10 pb-0.5">
        <button onClick={() => setActiveSubTab("browser")} className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all ${activeSubTab === "browser" ? "bg-white/5 text-white border border-white/10 border-b-transparent" : "text-white/40 hover:text-white/70"}`}>
          <Globe className="w-4 h-4 inline mr-1.5" />Przeglądarka
        </button>
        <button onClick={() => setActiveSubTab("export")} className={`px-4 py-2.5 rounded-t-lg text-sm font-medium transition-all ${activeSubTab === "export" ? "bg-white/5 text-white border border-white/10 border-b-transparent" : "text-white/40 hover:text-white/70"}`}>
          <LinkIcon className="w-4 h-4 inline mr-1.5" />Eksport ocen
        </button>
      </div>

      {activeSubTab === "browser" ? (
        <>
          {/* Presets */}
          <div className="flex flex-wrap gap-1.5">
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => navigate(p.url)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${rawUrl.startsWith(p.url) ? "bg-cyan-500/20 text-cyan-300 border border-accent/30" : "bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/[0.08] border border-white/10"}`}>
                <span className={`w-2 h-2 rounded-full ${p.color}`} />{p.name}
              </button>
            ))}
          </div>

          {/* Address bar */}
          <div className="flex items-center gap-2">
            <button onClick={goBack} disabled={!canGoBack} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <button onClick={goForward} disabled={!canGoForward} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:cursor-not-allowed transition">
              <ArrowRight className="w-4 h-4" />
            </button>
            <button onClick={reload} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition">
              <RotateCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
              <Globe className="w-3.5 h-3.5 text-white/30 shrink-0" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
                placeholder="Wpisz adres e-dziennika..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/30 font-mono"
              />
            </div>
            <button onClick={go} disabled={!url.trim()} className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-sm font-semibold transition disabled:opacity-50">
              Przejdź
            </button>
          </div>

          {/* Proxy mode toggle + status bar */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" checked={proxyMode} onChange={() => setProxyMode(!proxyMode)} className="sr-only peer" />
                  <div className="w-9 h-5 rounded-full bg-white/10 peer-checked:bg-cyan-500 transition after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:rounded-full after:bg-white after:transition peer-checked:after:translate-x-4" />
                </div>
                <span className="text-xs text-white/60 font-mono"><Zap className="w-3 h-3 inline mr-0.5" />Proxy</span>
              </label>
              {proxyMode && (
                <span className="text-[10px] text-emerald-400/70 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />Aktywny
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-white/30">
              <span className={`inline-block w-2 h-2 rounded-full ${iframeLoaded ? "bg-emerald-400" : "bg-white/20"}`} />
              {iframeLoaded ? "Połączono" : iframeError ? "Błąd" : "Gotowy"}
            </div>
          </div>

          {/* Info box */}
          {!proxyMode && needsProxy(url) && (
            <div className="rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-xs text-red-200/80 flex gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-red-300 mt-0.5" />
              <div><b className="text-red-200">Ta strona blokuje iframe.</b> Włącz Proxy powyżej lub otwórz w nowej karcie.</div>
            </div>
          )}
          {proxyMode && (
            <div className="rounded-lg border border-amber-400/20 bg-amber-500/5 p-3 text-xs text-amber-100/70 flex gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-300 mt-0.5" />
              <div>Proxy omija blokadę iframe, ale niektóre funkcje (logowanie, redirecty) mogą nie działać idealnie. <b className="text-amber-200">Jeśli strona się nie ładuje, otwórz ją w nowej karcie</b>.</div>
            </div>
          )}

          {/* Iframe */}
          <div className={`rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden ${viewMode === "mobile" ? "max-w-[375px] mx-auto" : ""}`}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/[0.03]">
              <span className="text-[10px] font-mono text-white/30 truncate max-w-[80%]">{rawUrl || "gotowy"}</span>
              <div className="flex items-center gap-2">
                {proxyMode && rawUrl && <span className="text-[9px] font-mono text-cyan-400/60">PROXY</span>}
                {rawUrl && (
                  <a onClick={() => openInNewTab(rawUrl)} className="text-cyan-300 hover:text-cyan-200 transition cursor-pointer" title="Otwórz w nowej karcie (bez proxy)">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
            {rawUrl ? (
              <div className="relative">
                {loading && (
                  <div className="absolute inset-0 z-10 bg-[#070b17]/80 grid place-items-center">
                    <div className="flex items-center gap-2 text-white/60 text-sm font-mono">
                      <RotateCw className="w-5 h-5 animate-spin" /> Ładowanie...
                    </div>
                  </div>
                )}
                {iframeError && (
                  <div className="absolute inset-0 z-10 bg-[#070b17]/90 grid place-items-center">
                    <div className="text-center p-8 max-w-md">
                      <div className="w-14 h-14 mx-auto rounded-2xl bg-red-500/20 border border-red-400/30 grid place-items-center mb-4">
                        <WifiOff className="w-6 h-6 text-red-300" />
                      </div>
                      <p className="text-white/80 text-sm font-semibold mb-1">Nie można załadować strony</p>
                      <p className="text-white/40 text-xs mb-4">Serwer odrzucił połączenie (ERR_BLOCKED_BY_RESPONSE). Strona blokuje wyświetlanie w ramce.</p>
                      <div className="flex flex-wrap justify-center gap-2">
                        <button onClick={() => openInNewTab(rawUrl)} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-900 text-xs font-semibold transition">
                          <ExternalLink className="w-3.5 h-3.5" />Otwórz w nowej karcie
                        </button>
                        <button onClick={reload} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs transition border border-white/10">
                          <RotateCw className="w-3.5 h-3.5" />Spróbuj ponownie
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <iframe
                  ref={iframeRef}
                  src={iframeSrc}
                  className={`w-full h-[600px] ${proxyMode ? "bg-white" : "bg-white"}`}
                  sandbox="allow-scripts allow-forms allow-same-origin allow-popups"
                  title="e-Dziennik"
                  onError={handleIframeError}
                  onLoad={handleIframeLoad}
                />
              </div>
            ) : (
              <div className="h-[400px] grid place-items-center text-center p-8">
                <div className="space-y-3">
                  <Globe className="w-12 h-12 mx-auto text-white/20" />
                  <p className="text-white/40 text-sm">Wpisz adres swojego e-dziennika i kliknij <b className="text-cyan-300 font-semibold">Przejdź</b></p>
                  <p className="text-white/30 text-xs">Obsługiwane: Vulcan UONET+, Librus Synergia, EduPage, Google Classroom, i inne</p>
                </div>
              </div>
            )}
          </div>

          {/* Bookmark buttons */}
          <div className="flex flex-wrap gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/30 self-center mr-1"><Bookmark className="w-3 h-3 inline mr-1" />Szybkie linki:</span>
            {PRESETS.map((p) => (
              <button key={p.name} onClick={() => openInNewTab(p.url)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/[0.04] hover:bg-white/[0.08] text-xs text-white/50 hover:text-white transition border border-white/10">
                <ExternalLink className="w-3 h-3" />{p.name}
              </button>
            ))}
          </div>
        </>
      ) : (
        <Eksport />
      )}
    </div>
  );
}
