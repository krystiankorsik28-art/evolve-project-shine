import { useState } from "react";
import { Sparkles, Loader2, BookOpen, Video, FileText, Headphones, Globe2, Star, ThumbsUp, Clock, Download, Play, ExternalLink, Filter, Search, ChevronRight, CheckCircle2, GraduationCap, Lightbulb } from "lucide-react";
import { toast } from "sonner";

type Material = {
  id: number;
  title: string;
  type: "video" | "article" | "interactive" | "audio" | "pdf";
  subject: string;
  level: string;
  duration: string;
  rating: number;
  url: string;
  relevance: number;
  description: string;
};

const ALL_MATERIALS: Material[] = [
  { id: 1, title: "Wprowadzenie do rachunku prawdopodobieństwa", type: "video", subject: "Matematyka", level: "Średniozaawansowany", duration: "45 min", rating: 4.8, url: "#", relevance: 96, description: "Kompleksowe omówienie podstaw rachunku prawdopodobieństwa z przykładami" },
  { id: 2, title: "Trygonometria — wzory i zadania", type: "article", subject: "Matematyka", level: "Początkujący", duration: "30 min", rating: 4.5, url: "#", relevance: 92, description: "Najważniejsze wzory trygonometryczne wraz z rozwiązaniami zadań" },
  { id: 3, title: "Prawa Newtona — symulacja", type: "interactive", subject: "Fizyka", level: "Średniozaawansowany", duration: "20 min", rating: 4.9, url: "#", relevance: 88, description: "Interaktywna symulacja pokazująca działanie praw dynamiki Newtona" },
  { id: 4, title: "Czasy gramatyczne w angielskim", type: "video", subject: "Angielski", level: "Początkujący", duration: "60 min", rating: 4.6, url: "#", relevance: 85, description: "Szczegółowe omówienie czasów gramatycznych z ćwiczeniami" },
  { id: 5, title: "Reakcje chemiczne — podcast", type: "audio", subject: "Chemia", level: "Zaawansowany", duration: "35 min", rating: 4.3, url: "#", relevance: 82, description: "Omówienie typów reakcji chemicznych i mechanizmów" },
  { id: 6, title: "Funkcje kwadratowe — PDF", type: "pdf", subject: "Matematyka", level: "Średniozaawansowany", duration: "45 min", rating: 4.7, url: "#", relevance: 79, description: "Materiały do samodzielnej nauki funkcji kwadratowych" },
  { id: 7, title: "DNA i RNA — animacja 3D", type: "interactive", subject: "Biologia", level: "Średniozaawansowany", duration: "15 min", rating: 4.9, url: "#", relevance: 76, description: "Interaktywna animacja struktury DNA i RNA" },
  { id: 8, title: "Rozbiór gramatyczny zdania", type: "video", subject: "Polski", level: "Początkujący", duration: "40 min", rating: 4.4, url: "#", relevance: 73, description: "Nauka rozbioru gramatycznego i logicznego zdań" },
  { id: 9, title: "II Wojna Światowa — dokument", type: "pdf", subject: "Historia", level: "Zaawansowany", duration: "90 min", rating: 4.8, url: "#", relevance: 70, description: "Szczegółowe opracowanie wydarzeń II Wojny Światowej" },
  { id: 10, title: "Programowanie w Pythonie od podstaw", type: "video", subject: "Informatyka", level: "Początkujący", duration: "120 min", rating: 4.9, url: "#", relevance: 94, description: "Kurs programowania w Pythonie dla początkujących" },
];

const TYPE_ICONS = { video: Play, article: FileText, interactive: GraduationCap, audio: Headphones, pdf: FileText };
const TYPE_LABELS = { video: "Wideo", article: "Artykuł", interactive: "Interaktywne", audio: "Audio", pdf: "PDF" };
const SUBJECTS = [...new Set(ALL_MATERIALS.map(m => m.subject))];
const LEVELS = ["Początkujący", "Średniozaawansowany", "Zaawansowany"];

export function AIMaterialRecommender() {
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [search, setSearch] = useState("");
  const [recommending, setRecommending] = useState(false);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [saved, setSaved] = useState<number[]>([]);

  const recommend = async () => {
    if (!subject && !search) { toast.error("Wybierz przedmiot lub wpisz czego szukasz"); return; }
    setRecommending(true);
    setTimeout(() => {
      let filtered = ALL_MATERIALS.filter(m => {
        if (subject && m.subject !== subject) return false;
        if (level && m.level !== level) return false;
        if (search) return m.title.toLowerCase().includes(search.toLowerCase()) || m.subject.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
        return true;
      });
      filtered.sort((a, b) => b.relevance - a.relevance);
      setMaterials(filtered);
      setRecommending(false);
      toast.success(`Znaleziono ${filtered.length} materiałów`);
    }, 1000);
  };

  const toggleSaved = (id: number) => {
    setSaved(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    toast.success(saved.includes(id) ? "Usunięto z zapisanych" : "Dodano do zapisanych");
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
          <BookOpen className="w-5 h-5 text-black" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Material Recommender</h2>
          <p className="text-xs text-white/40">Inteligentne rekomendacje materiałów edukacyjnych</p>
        </div>
      </div>

      <div className="card-premium rounded-2xl p-5 space-y-4">
        <div>
          <label className="auth-label">Wyszukaj materiał</label>
          <div className="relative mt-1.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Szukaj materiałów, tematów, zagadnień..." className="auth-input pl-9" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="auth-label">Przedmiot</label>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {SUBJECTS.map(s => (
                <button key={s} onClick={() => setSubject(subject === s ? "" : s)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${subject === s ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="auth-label">Poziom</label>
            <div className="flex gap-1.5 mt-1.5">
              {LEVELS.map(l => (
                <button key={l} onClick={() => setLevel(level === l ? "" : l)}
                  className={`flex-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${level === l ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20'}`}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        <button onClick={recommend} disabled={recommending} className="auth-submit flex items-center justify-center gap-2">
          {recommending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {recommending ? "AI szuka materiałów..." : "Znajdź materiały z AI"}
        </button>
      </div>

      {(materials.length > 0 || recommending) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/30 font-medium uppercase tracking-wider">Rekomendowane materiały ({materials.length})</span>
            <div className="flex items-center gap-1 text-[10px] text-white/30">
              <Filter className="w-3 h-3" />Sortowane według trafności
            </div>
          </div>

          {recommending ? (
            <div className="card-premium rounded-2xl p-8 text-center">
              <Loader2 className="w-5 h-5 animate-spin text-accent mx-auto mb-2" />
              <p className="text-xs text-white/40">AI analizuje preferencje i dobiera materiały...</p>
            </div>
          ) : (
            materials.map(m => {
              const TypeIcon = TYPE_ICONS[m.type];
              return (
                <div key={m.id} className="card-premium rounded-2xl p-4 hover:border-white/10 transition-all">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center shrink-0
                      ${m.type === "video" ? 'bg-rose-500/10 text-rose-300' :
                        m.type === "article" ? 'bg-blue-500/10 text-blue-300' :
                        m.type === "interactive" ? 'bg-accent/10 text-accent' :
                        m.type === "audio" ? 'bg-purple-500/10 text-purple-300' :
                        'bg-amber-500/10 text-amber-300'}`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-sm font-semibold text-white">{m.title}</h4>
                          <p className="text-xs text-white/40 mt-0.5">{m.description}</p>
                        </div>
                        <button onClick={() => toggleSaved(m.id)}
                          className={`shrink-0 p-1.5 rounded-lg transition-all ${saved.includes(m.id) ? 'bg-accent/15 text-accent' : 'bg-white/[0.03] text-white/20 hover:text-white/50'}`}>
                          <Star className={`w-3.5 h-3.5 ${saved.includes(m.id) ? 'fill-accent' : ''}`} />
                        </button>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/[0.04] text-white/30">{TYPE_LABELS[m.type]}</span>
                        <span className="text-[10px] text-white/30">{m.subject}</span>
                        <span className="text-[10px] text-white/30">·</span>
                        <div className="flex items-center gap-1 text-[10px] text-amber-300">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />{m.rating}
                        </div>
                        <span className="text-[10px] text-white/30">·</span>
                        <div className="flex items-center gap-1 text-[10px] text-white/30">
                          <Clock className="w-2.5 h-2.5" />{m.duration}
                        </div>
                        <span className="text-[10px] text-white/30">·</span>
                        <div className="flex items-center gap-1 text-[10px] text-emerald-300">
                          <Sparkles className="w-2.5 h-2.5" />{m.relevance}% trafności
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
