import { useState } from "react";
import { Sparkles, Loader2, Presentation, FileText, Image, Palette, Sun, Moon, Eye, Download, Plus, ChevronRight, Star, Type, Layout, Monitor } from "lucide-react";
import { toast } from "sonner";

type Slide = { title: string; content: string; icon: string };

const THEMES = [
  { id: "dark-pro", label: "Dark Pro", gradient: "from-accent to-blue-500" },
  { id: "light-clean", label: "Light Clean", gradient: "from-accent to-blue-500" },
  { id: "gradient", label: "Gradient", gradient: "from-accent to-blue-500" },
];

export function AIPresentationGenerator() {
  const [topic, setTopic] = useState("");
  const [slides, setSlides] = useState<Slide[]>([]);
  const [generating, setGenerating] = useState(false);
  const [theme, setTheme] = useState("dark-pro");
  const [slideCount, setSlideCount] = useState("5");
  const [activeSlide, setActiveSlide] = useState(0);

  const generate = async () => {
    if (!topic.trim()) { toast.error("Wpisz temat prezentacji"); return; }
    setGenerating(true);
    setTimeout(() => {
      const demoSlides: Slide[] = [
        { title: topic, content: "Kompleksowa prezentacja na temat " + topic + ". Przegląd kluczowych zagadnień i najważniejszych koncepcji.", icon: "📚" },
        { title: "Wprowadzenie", content: "Czym jest " + topic + "? Definicja, kontekst historyczny i znaczenie we współczesnym świecie. Dlaczego ten temat jest istotny?", icon: "🎯" },
        { title: "Kluczowe koncepcje", content: "1. Podstawowe założenia\n2. Główne teorie i modele\n3. Najważniejsze definicje\n4. Relacje między pojęciami", icon: "💡" },
        { title: "Praktyczne zastosowania", content: "• Zastosowanie w edukacji\n• Wykorzystanie w biznesie\n• Implementacje technologiczne\n• Przykłady z życia codziennego", icon: "⚡" },
        { title: "Podsumowanie", content: "Najważniejsze wnioski:\n\n✅ " + topic + " ma szerokie zastosowanie\n✅ Kluczowe koncepcje są ze sobą powiązane\n✅ Warto zgłębić temat samodzielnie\n\nDziękuję za uwagę!", icon: "🏆" },
      ];
      setSlides(demoSlides);
      setActiveSlide(0);
      setGenerating(false);
      toast.success("Prezentacja gotowa!");
    }, 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
          <Presentation className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Presentation Generator</h2>
          <p className="text-xs text-white/40">Stwórz profesjonalną prezentację w kilka sekund</p>
        </div>
      </div>

      {slides.length === 0 ? (
        <div className="card-premium rounded-2xl p-6 space-y-4">
          <div>
            <label className="auth-label">Temat prezentacji</label>
            <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="Np. 'Sztuczna inteligencja w edukacji'" className="auth-input mt-1.5" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="auth-label">Liczba slajdów</label>
              <div className="flex gap-2 mt-1.5">
                {["3", "5", "7", "10"].map(n => (
                  <button key={n} onClick={() => setSlideCount(n)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all ${slideCount === n ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="auth-label">Motyw wizualny</label>
              <div className="flex gap-2 mt-1.5">
                {THEMES.map(t => (
                  <button key={t.id} onClick={() => setTheme(t.id)}
                    className={`flex-1 px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${theme === t.id ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>
                    {t.id === "dark-pro" ? <Moon className="w-3 h-3" /> : t.id === "light-clean" ? <Sun className="w-3 h-3" /> : <Palette className="w-3 h-3" />}
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button onClick={generate} disabled={generating} className="auth-submit flex items-center justify-center gap-2">
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generuj prezentację
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {slides.map((s, i) => (
                <button key={i} onClick={() => setActiveSlide(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeSlide === i ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setSlides([]); setTopic(""); }} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 hover:text-white/70 transition-all">Nowa</button>
              <button className="px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-medium hover:bg-accent/25 transition-all flex items-center gap-1.5"><Download className="w-3 h-3" />PDF</button>
            </div>
          </div>

          <div className={`relative overflow-hidden rounded-2xl min-h-[400px] p-8 bg-gradient-to-br ${theme === "dark-pro" ? THEMES[0].gradient : theme === "light-clean" ? THEMES[1].gradient : THEMES[2].gradient}`}>
            {theme === "light-clean" ? (
              <div className="text-black">
                <div className="text-4xl mb-4">{slides[activeSlide].icon}</div>
                <h3 className="text-2xl font-bold mb-4">{slides[activeSlide].title}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-700">{slides[activeSlide].content}</p>
              </div>
            ) : (
              <div className="text-white">
                <div className="text-4xl mb-4">{slides[activeSlide].icon}</div>
                <h3 className="text-2xl font-bold mb-4">{slides[activeSlide].title}</h3>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-white/70">{slides[activeSlide].content}</p>
              </div>
            )}
            <div className="absolute bottom-4 right-4 text-[10px] text-white/20 font-mono">{activeSlide + 1} / {slides.length}</div>
          </div>

          <div className="flex gap-2 justify-center">
            <button onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))} disabled={activeSlide === 0}
              className="px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs text-white/40 hover:text-white/70 transition-all disabled:opacity-30">Poprzedni</button>
            <button onClick={() => setActiveSlide(Math.min(slides.length - 1, activeSlide + 1))} disabled={activeSlide === slides.length - 1}
              className="px-4 py-2 rounded-xl bg-accent/15 text-accent text-xs font-medium hover:bg-accent/25 transition-all disabled:opacity-30">Następny</button>
          </div>
        </div>
      )}
    </div>
  );
}
