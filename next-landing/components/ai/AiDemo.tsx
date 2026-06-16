"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Bot, User, Loader2 } from "lucide-react";
import { GlassPanel } from "@/components/ui/GlassPanel";

const DEMO_RESPONSES: Record<string, string> = {
  matematyka: "Great choice! Let's start with quadratic equations. I'll break it down step by step. First, remember the standard form: **ax² + bx + c = 0**. Try solving x² - 5x + 6 = 0 — what are the factors?",
  angielski: "I am your AI English tutor. Let's practice with a short text. Read this: 'The future of education is adaptive and personalized.' Now, can you rewrite this sentence in the passive voice?",
  programowanie: "Let's learn Python recursion! Consider the Fibonacci sequence: F(n) = F(n-1) + F(n-2). Here's a buggy implementation — can you spot the issue?\n\n```python\ndef fib(n):\n    return fib(n-1) + fib(n-2)\n```",
  domyślne: "I'm EduNex AI Tutor. I can help you with:\n\n📐 **Mathematics** — algebra, calculus, geometry\n📝 **Language Arts** — grammar, essay writing\n💻 **Programming** — Python, JavaScript, algorithms\n🔬 **Sciences** — physics, chemistry, biology\n\nWhat would you like to learn today?",
};

const QUICK_TOPICS = ["matematyka", "angielski", "programowanie"];

export function AiDemo() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([
    { role: "ai", text: DEMO_RESPONSES.domyślne },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setBusy(true);
    await new Promise((r) => setTimeout(r, 1000));
    const lower = text.toLowerCase();
    let reply = DEMO_RESPONSES.domyślne;
    for (const key of QUICK_TOPICS) {
      if (lower.includes(key)) { reply = DEMO_RESPONSES[key]; break; }
    }
    setMessages((prev) => [...prev, { role: "ai", text: reply }]);
    setBusy(false);
  };

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-glass-border bg-glass backdrop-blur-md text-xs text-cyan-400 mb-4">
            <Bot className="w-3 h-3" />
            AI Tutor Demo
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Meet Your AI Tutor
          </h2>
          <p className="mt-4 text-white/40 max-w-md mx-auto">
            Powered by Gemini. Try it yourself — ask about math, English, or programming.
          </p>
        </motion.div>

        <GlassPanel className="p-0 overflow-hidden">
          <div ref={chatRef} className="h-[400px] overflow-y-auto p-4 sm:p-6 space-y-4 scroll-smooth">
            <AnimatePresence mode="popLayout">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    msg.role === "ai" ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-white/10"
                  }`}>
                    {msg.role === "ai" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white/60" />}
                  </div>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "ai" ? "bg-white/[0.04] text-white/80" : "bg-cyan-500/10 text-cyan-300"
                  }`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {busy && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-3"
                >
                  <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white/[0.04] rounded-2xl px-4 py-3">
                    <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="border-t border-glass-border p-4 sm:p-6">
            <div className="flex gap-2 flex-wrap mb-3">
              {QUICK_TOPICS.map((t) => (
                <button
                  key={t}
                  onClick={() => send(t)}
                  disabled={busy}
                  className="px-3 py-1 text-xs rounded-full border border-glass-border bg-glass backdrop-blur-sm text-white/50 hover:text-white hover:border-white/20 transition-colors disabled:opacity-40"
                >
                  {t}
                </button>
              ))}
            </div>
            <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything about education..."
                disabled={busy}
                className="flex-1 bg-white/[0.04] border border-glass-border rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center disabled:opacity-40 hover:shadow-lg hover:shadow-cyan-500/25 transition-shadow"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
