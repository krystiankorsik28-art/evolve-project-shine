import { useState, useRef, useEffect } from "react";
import { Play, RotateCcw, Copy, Check, Terminal, Code2, Sparkles, Loader2, ChevronRight, Lightbulb, Bug, BookOpen } from "lucide-react";
import { toast } from "sonner";

const LANGUAGES = [
  { id: "python", label: "Python", icon: "Py" },
  { id: "javascript", label: "JavaScript", icon: "JS" },
  { id: "typescript", label: "TypeScript", icon: "TS" },
  { id: "html", label: "HTML/CSS", icon: "HT" },
  { id: "java", label: "Java", icon: "Jv" },
  { id: "cpp", label: "C++", icon: "C+" },
];

const INITIAL_CODE: Record<string, string> = {
  python: '# Witaj w AI Code Mentor!\n# Zacznij od napisania funkcji, która oblicza silnię:\ndef factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)\n\nprint(factorial(5))',
  javascript: '// AI Code Mentor — JavaScript\n// Napisz funkcję, która odwraca string:\nfunction reverseString(str) {\n    return str.split("").reverse().join("");\n}\n\nconsole.log(reverseString("EduNex"));',
  typescript: '// AI Code Mentor — TypeScript\ninterface User {\n    name: string;\n    age: number;\n    role: "student" | "teacher";\n}\n\nconst user: User = { name: "Jan", age: 17, role: "student" };\nconsole.log(user);',
  html: '<!-- AI Code Mentor — HTML/CSS -->\n<!DOCTYPE html>\n<html>\n<head>\n    <style>\n        .card { padding: 20px; border-radius: 12px;\n                background: linear-gradient(135deg, #667eea, #764ba2);\n                color: white; font-family: sans-serif; }\n    </style>\n</head>\n<body>\n    <div class="card">\n        <h1>Witaj w EduNex!</h1>\n        <p>AI Code Mentor pomoże Ci w nauce.</p>\n    </div>\n</body>\n</html>',
  java: '// AI Code Mentor — Java\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Witaj w EduNex AI Code Mentor!");\n        \n        for (int i = 1; i <= 10; i++) {\n            System.out.println(i + "² = " + (i * i));\n        }\n    }\n}',
  cpp: '// AI Code Mentor — C++\n#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    vector<int> numbers = {1, 2, 3, 4, 5};\n    int sum = 0;\n    \n    for (int n : numbers) {\n        sum += n;\n    }\n    \n    cout << "Suma: " << sum << endl;\n    cout << "Średnia: " << (float)sum / numbers.size() << endl;\n    return 0;\n}',
};

const AI_SUGGESTIONS = [
  { label: "Wyjaśnij ten kod", prompt: "Wyjaśnij krok po kroku jak działa ten kod" },
  { label: "Znajdź błędy", prompt: "Przeanalizuj ten kod i znajdź potencjalne błędy lub problemy" },
  { label: "Optymalizuj", prompt: "Zoptymalizuj ten kod pod kątem wydajności" },
  { label: "Dodaj testy", prompt: "Napisz testy jednostkowe dla tego kodu" },
];

export function AICodeMentor() {
  const [lang, setLang] = useState("python");
  const [code, setCode] = useState(INITIAL_CODE.python);
  const [output, setOutput] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [aiBusy, setAiBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setCode(INITIAL_CODE[lang] || INITIAL_CODE.python);
    setOutput("");
    setAiResponse("");
    setShowAi(false);
  }, [lang]);

  const runCode = () => {
    setOutput("");
    if (lang === "html") {
      setOutput("📄 Podgląd HTML otworzy się w nowej zakładce (demo)");
      return;
    }
    try {
      if (lang === "javascript" || lang === "typescript") {
        const logs: string[] = [];
        const mockConsole = { log: (...args: any[]) => logs.push(args.map(String).join(" ")) };
        const fn = new Function("console", code);
        fn(mockConsole);
        setOutput(logs.join("\n") || "✅ Kod wykonany pomyślnie (brak outputu)");
      } else {
        setOutput(`⚡ Symulacja wykonania ${lang.toUpperCase()}\n✅ Kod skompilowany i uruchomiony pomyślnie\n📊 Czas wykonania: ~0.02s`);
      }
    } catch (e: any) {
      setOutput(`❌ Błąd: ${e.message}`);
    }
  };

  const askAI = async (prompt: string) => {
    setAiBusy(true);
    setShowAi(true);
    setAiResponse("");
    const fullPrompt = `${prompt}:\n\n\`\`\`${lang}\n${code}\n\`\`\``;
    setTimeout(() => {
      const demoResponses: Record<string, string> = {
        "Wyjaśnij": "**Analiza kodu:**\n1. Funkcja `factorial(n)` to rekurencyjna implementacja silni\n2. Warunek bazowy: jeśli `n <= 1`, zwraca 1\n3. Krok rekurencyjny: `n * factorial(n - 1)`\n4. Wywołanie `factorial(5)` oblicza: 5 × 4 × 3 × 2 × 1 = **120**\n\n📚 **Koncepcje:** rekurencja, funkcje, warunki brzegowe",
        "znajdź": "**Przegląd kodu:**\n✅ Brak błędów składniowych\n⚠️ **Uwaga:** Dla dużych `n` (>1000) może wystąpić `RecursionError` - rozważ implementację iteracyjną\n💡 **Sugestia:** Dodaj type hints i walidację wejścia",
        "optymalizuj": "**Optymalizacja:**\n```python\ndef factorial(n: int) -> int:\n    result = 1\n    for i in range(2, n + 1):\n        result *= i\n    return result\n```\n✅ Zalety: brak ryzyka przepełnienia stosu, szybszy dla dużych n, typowanie",
        "testy": "**Testy jednostkowe:**\n```python\ndef test_factorial():\n    assert factorial(0) == 1\n    assert factorial(1) == 1\n    assert factorial(5) == 120\n    assert factorial(10) == 3628800\n    print('✅ Wszystkie testy przeszły!')\n```",
      };
      const key = Object.keys(demoResponses).find(k => prompt.includes(k)) || "";
      setAiResponse(demoResponses[key] || demoResponses["Wyjaśnij"]);
      setAiBusy(false);
    }, 1500);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Skopiowano kod");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
            <Code2 className="w-5 h-5 text-black" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">AI Code Mentor</h2>
            <p className="text-xs text-white/40">Nauka programowania z asystentem AI</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {LANGUAGES.map(l => (
          <button key={l.id} onClick={() => setLang(l.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all
              ${lang === l.id ? 'bg-accent/15 text-accent border border-accent/20' : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:border-white/20 hover:text-white/60'}`}>
            <span className="w-4 h-4 rounded bg-white/[0.06] grid place-items-center text-[8px] font-mono">{l.icon}</span>
            {l.label}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card-premium rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Terminal className="w-3.5 h-3.5" />{lang.toUpperCase()}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={copyCode} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Kopiuj">
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
              <button onClick={() => setCode(INITIAL_CODE[lang])} className="p-1.5 rounded-lg hover:bg-white/5 text-white/30 hover:text-white/60 transition-all" title="Resetuj">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <textarea ref={editorRef} value={code} onChange={e => setCode(e.target.value)}
            className="w-full h-72 p-4 bg-[oklch(0.04_0.02_260)] text-white/80 font-mono text-xs leading-relaxed resize-none focus:outline-none border-0"
            spellCheck={false} />
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] text-white/20 font-mono">{code.split("\n").length} linii</div>
            <button onClick={runCode} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/15 text-accent text-xs font-medium hover:bg-accent/25 transition-all">
              <Play className="w-3 h-3" /> Uruchom
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-premium rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2 text-xs text-white/40">
              <Terminal className="w-3.5 h-3.5" />Output
            </div>
            <pre className="min-h-[100px] text-xs font-mono text-white/60 whitespace-pre-wrap">{output || "Kliknij 'Uruchom' aby zobaczyć wynik..."}</pre>
          </div>

          <div className="flex flex-wrap gap-2">
            {AI_SUGGESTIONS.map(s => (
              <button key={s.label} onClick={() => askAI(s.label)} disabled={aiBusy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-white/50 hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-50">
                {s.label === "Wyjaśnij ten kod" && <BookOpen className="w-3 h-3" />}
                {s.label === "Znajdź błędy" && <Bug className="w-3 h-3" />}
                {s.label === "Optymalizuj" && <Sparkles className="w-3 h-3" />}
                {s.label === "Dodaj testy" && <Lightbulb className="w-3 h-3" />}
                {s.label}
              </button>
            ))}
          </div>

          {showAi && (
            <div className="card-premium rounded-2xl p-4 border-accent/10" style={{ animation: "fadeUp 0.3s ease-out" }}>
              <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-accent to-blue-500 grid place-items-center">
                  <Sparkles className="w-3 h-3 text-black" />
                </div>
                <span className="text-xs font-medium text-white/80">AI Mentor</span>
                {aiBusy && <Loader2 className="w-3 h-3 animate-spin text-accent ml-auto" />}
              </div>
              {aiBusy ? (
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-white/30 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              ) : (
                <div className="text-xs text-white/60 leading-relaxed whitespace-pre-wrap">{aiResponse}</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
