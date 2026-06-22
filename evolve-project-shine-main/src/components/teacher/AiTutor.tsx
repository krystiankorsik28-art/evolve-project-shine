import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { aiTutorReply, aiTutorCreateThread } from "@/lib/ai-advanced.functions";
import { Brain, Plus, Send, Loader2, Trash2, Sparkles, BookOpen, ImageUp, X } from "lucide-react";
import { toast } from "sonner";
import { VoiceInput } from "@/components/VoiceInput";
import { confirmDialog } from "@/components/ConfirmDialog";

type Thread = { id: string; title: string; subject: string | null; updated_at: string };
type Msg = { id?: string; role: "user" | "assistant" | "system"; content: string };

const SUBJECTS = [
  "",
  "Matematyka",
  "Fizyka",
  "Chemia",
  "Biologia",
  "Polski",
  "Angielski",
  "Historia",
  "Geografia",
  "Informatyka",
];

const QUICK_PROMPTS = [
  { label: "Scenariusz lekcji", prompt: "Stwórz szczegółowy scenariusz lekcji na temat: " },
  { label: "Wyjaśnij temat", prompt: "Wyjaśnij w prosty sposób uczniowi temat: " },
  { label: "Ćwiczenia", prompt: "Zaproponuj 5 ćwiczeń praktycznych do tematu: " },
  { label: "Karta pracy", prompt: "Stwórz kartę pracy dla ucznia na temat: " },
  { label: "Quiz ustny", prompt: "Przygotuj 10 pytań do quizu ustnego na temat: " },
  { label: "Motywacja", prompt: "Jak zmotywować uczniów do nauki tematu: " },
];

export function AiTutor() {
  const create = useServerFn(aiTutorCreateThread);
  const reply = useServerFn(aiTutorReply);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [subject, setSubject] = useState<string>("");
  const [image, setImage] = useState<{
    name: string;
    preview: string;
    data: string;
    mime_type: string;
  } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const loadThreads = async () => {
    const { data } = await supabase
      .from("ai_tutor_threads")
      .select("id,title,subject,updated_at")
      .order("updated_at", { ascending: false });
    setThreads((data ?? []) as Thread[]);
  };
  useEffect(() => {
    loadThreads();
  }, []);

  const loadMessages = async (id: string) => {
    const { data } = await supabase
      .from("ai_tutor_messages")
      .select("id,role,content")
      .eq("thread_id", id)
      .order("created_at", { ascending: true });
    setMessages(
      (data ?? []).map((m) => ({ id: m.id, role: m.role as Msg["role"], content: m.content })),
    );
  };

  const selectThread = async (id: string) => {
    setActiveId(id);
    await loadMessages(id);
  };

  const newThread = async () => {
    try {
      const t = await create({
        data: {
          title: subject ? `Nowa rozmowa (${subject})` : "Nowa rozmowa",
          subject: subject || null,
        },
      });
      await loadThreads();
      setActiveId(t.id);
      setMessages([]);
      toast.success("Nowy wątek utworzony");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd");
    }
  };

  const deleteThread = async (id: string) => {
    if (!(await confirmDialog({ description: "Usunąć wątek?" }))) return;
    await supabase.from("ai_tutor_threads").delete().eq("id", id);
    setThreads((p) => p.filter((t) => t.id !== id));
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  };

  const send = async () => {
    if (!input.trim() && !image) return;
    let tid = activeId;
    if (!tid) {
      const t = await create({
        data: { title: input.slice(0, 60) || "Nowa rozmowa", subject: subject || null },
      });
      tid = t.id;
      await loadThreads();
      setActiveId(tid);
    }
    const userText = input || "";
    const img = image;
    setInput("");
    setImage(null);
    const dispText = img ? userText + "\n[Załącznik: obraz]" : userText;
    setMessages((p) => [
      ...p,
      { role: "user", content: dispText },
      { role: "assistant", content: "" },
    ]);
    setBusy(true);
    try {
      const payload: {
        thread_id: string;
        message: string;
        subject?: string | null;
        image?: { mime_type: string; data: string };
      } = { thread_id: tid, message: userText, subject: subject || null };
      if (img) payload.image = { mime_type: img.mime_type, data: img.data };
      const res = (await reply({ data: payload })) as { content: string; examId?: string };
      setMessages((p) => {
        const cp = [...p];
        const last = cp[cp.length - 1];
        if (last && last.role === "assistant")
          cp[cp.length - 1] = { ...last, content: res.content };
        return cp;
      });
      if (res.examId) {
        toast.success("Egzamin został utworzony!", { duration: 5000 });
      }
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      loadThreads();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Błąd AI");
      setMessages((p) => p.slice(0, -2));
    } finally {
      setBusy(false);
    }
  };

  const pickFile = () => fileRef.current?.click();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Maksymalny rozmiar pliku to 10 MB");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Obsługiwane tylko obrazy");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1];
      setImage({ name: file.name, preview: result, data: base64, mime_type: file.type });
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length]);

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-180px)] min-h-[500px]">
      {/* Sidebar wątków */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col">
        <div className="p-3 border-b border-white/5 space-y-2">
          <button
            onClick={newThread}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-accent to-blue-500 hover:from-accent/80 hover:to-blue-500/80 text-white text-sm font-semibold"
          >
            <Plus className="w-4 h-4" />
            Nowa rozmowa
          </button>
          <select
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-xs text-white"
          >
            {SUBJECTS.map((s) => (
              <option key={s} value={s} className="bg-slate-900">
                {s || "Wszystkie przedmioty"}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1 min-h-0">
          {threads.length === 0 && (
            <div className="text-xs text-white/40 p-3">Brak rozmów. Zacznij nową.</div>
          )}
          {threads.map((t) => (
            <div
              key={t.id}
              className={`group flex items-center gap-1 rounded-lg ${activeId === t.id ? "bg-cyan-500/10 border border-accent/20" : "hover:bg-white/5 border border-transparent"}`}
            >
              <button
                onClick={() => selectThread(t.id)}
                className="flex-1 text-left px-3 py-2 min-w-0"
              >
                <div className="text-sm text-white truncate">{t.title}</div>
                {t.subject && (
                  <div className="text-[10px] text-cyan-300/70 font-mono">{t.subject}</div>
                )}
              </button>
              <button
                onClick={() => deleteThread(t.id)}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-white/40 hover:text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] flex flex-col">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">AI Tutor</div>
              <div className="text-[11px] text-white/40">
                Asystent nauczyciela — scenariusze, wyjaśnienia, ćwiczenia
              </div>
            </div>
          </div>
          {busy && (
            <div className="flex items-center gap-1.5 text-xs text-accent">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Generuję...
            </div>
          )}
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-accent/20 to-blue-500/20 border border-accent/20 grid place-items-center mb-4">
                <Sparkles className="w-8 h-8 text-cyan-400/60" />
              </div>
              <div className="text-white/70 text-sm font-medium mb-1">
                Witaj! Jestem Twoim asystentem AI.
              </div>
              <div className="text-white/40 text-xs mb-5">
                Pomogę Ci przygotować materiały, wytłumaczę tematy i stworzę ćwiczenia.
              </div>
              <div className="text-[10px] uppercase tracking-wider text-white/30 font-mono mb-3">
                Szybkie podpowiedzi
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 max-w-2xl mx-auto">
                {QUICK_PROMPTS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setInput(s.prompt)}
                    className="text-xs text-left p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] hover:border-accent/20 text-white/70 transition-all group"
                  >
                    <Sparkles className="w-3.5 h-3.5 inline mr-1.5 text-cyan-300/60 group-hover:text-cyan-300 transition" />
                    {s.label}
                  </button>
                ))}
              </div>
              <div className="mt-4 grid sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {[
                  "Wyjaśnij wzór skróconego mnożenia (a+b)²",
                  "Co to jest fotosynteza?",
                  "Pomóż mi zrozumieć drugą wojnę światową",
                  "Jak rozwiązać równanie kwadratowe?",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="text-xs text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 transition"
                  >
                    <BookOpen className="w-3.5 h-3.5 inline mr-1.5 text-cyan-300/50" />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in-0 slide-in-from-bottom-2 duration-300`}
            >
              {m.role === "assistant" && (
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/30 to-blue-500/30 grid place-items-center mr-2 mt-1 shrink-0">
                  <Brain className="w-3.5 h-3.5 text-accent" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-medium shadow-lg shadow-cyan-500/10" : "bg-white/[0.04] text-white/90 border border-white/[0.06]"}`}
              >
                {m.content || (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-xs text-white/40">Myślę...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-white/5">
          {image && (
            <div className="mb-2 flex items-center gap-2 p-2 rounded-lg bg-white/5 border border-white/10">
              <img src={image.preview} alt="" className="w-10 h-10 rounded object-cover" />
              <span className="text-xs text-white/70 truncate flex-1">{image.name}</span>
              <button
                type="button"
                onClick={() => setImage(null)}
                className="p-1 text-white/40 hover:text-rose-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Napisz lub podyktuj wiadomość... (Enter wysyła)"
                rows={2}
                className="w-full px-3 py-2 pr-32 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/40 resize-none"
              />
              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={pickFile}
                  className="p-1.5 rounded-lg text-white/40 hover:text-cyan-300 hover:bg-white/5 transition"
                  title="Załącz obraz"
                >
                  <ImageUp className="w-4 h-4" />
                </button>
                <VoiceInput size="sm" value={input} onChange={setInput} />
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onFileChange}
              />
            </div>
            <button
              onClick={send}
              disabled={busy || (!input.trim() && !image)}
              className="h-[60px] px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-semibold disabled:opacity-50 inline-flex items-center gap-2"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
