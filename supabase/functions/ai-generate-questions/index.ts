import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

type QType =
  | "single_choice"
  | "multiple_choice"
  | "true_false"
  | "short_answer"
  | "fill_in_blank"
  | "numeric"
  | "essay"
  | "ordering";

interface GenQ {
  question_type: QType;
  prompt: string;
  options?: string[];
  correct: any;
  explanation?: string;
  difficulty?: "easy" | "medium" | "hard";
  points?: number;
  hint?: string;
  tags?: string[];
  bloom?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const {
      topic,
      count = 5,
      difficulty = "mixed",
      language = "pl",
      types = ["single_choice"],
      sourceText = "",
      audience = "",
      bloom = "mixed",
      style = "egzaminacyjny",
      includeExplanations = true,
    } = body || {};

    if (!topic || typeof topic !== "string") {
      return new Response(JSON.stringify({ error: "topic required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const n = Math.max(1, Math.min(30, Number(count) || 5));
    const typesList: QType[] = Array.isArray(types) && types.length ? types : ["single_choice"];

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const system = `Jesteś doświadczonym metodykiem i autorem pytań egzaminacyjnych. Tworzysz wysokiej jakości, merytoryczne pytania w języku ${language}.
Zasady:
- Pytania jednoznaczne, bez dwuznaczności i pytań podchwytliwych
- Dla single_choice: dokładnie 4 opcje, pole "correct" = indeks (0-3) poprawnej odpowiedzi
- Dla multiple_choice: 4-6 opcji, pole "correct" = tablica indeksów poprawnych (min 2)
- Dla true_false: pole "correct" = true lub false (bez options)
- Dla short_answer / fill_in_blank: pole "correct" = string (krótka odpowiedź)
- Dla numeric: pole "correct" = liczba (number)
- Dla ordering: pole "options" = elementy w POPRAWNEJ kolejności, pole "correct" = tablica indeksów w POPRAWNEJ kolejności [0,1,2,...]
- Dla essay: bez options, "correct" = wzorcowy zarys odpowiedzi (string)
- Każde pytanie zawiera krótkie "explanation" wyjaśniające odpowiedź${includeExplanations ? "" : " (opcjonalnie)"}
- Pole "difficulty": easy | medium | hard ${difficulty !== "mixed" ? `(użyj ${difficulty})` : "(różnicuj)"}
- Pole "points": 1 (easy), 2 (medium), 3 (hard)
- Pole "bloom" zgodne z taksonomią Blooma (pamiętanie/zrozumienie/zastosowanie/analiza/ocena/tworzenie)
- Styl: ${style}${audience ? `, odbiorca: ${audience}` : ""}`;

    const userMsg = `Wygeneruj ${n} pytań na temat: "${topic}".
Dozwolone typy pytań: ${typesList.join(", ")}.
${sourceText ? `Materiał źródłowy do oparcia pytań:\n"""${sourceText.slice(0, 8000)}"""\n` : ""}
Zwróć WYŁĄCZNIE wywołanie narzędzia generate_questions.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "generate_questions",
          description: "Zwraca wygenerowane pytania egzaminacyjne",
          parameters: {
            type: "object",
            properties: {
              questions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    question_type: {
                      type: "string",
                      enum: typesList,
                    },
                    prompt: { type: "string" },
                    options: { type: "array", items: { type: "string" } },
                    correct: {},
                    explanation: { type: "string" },
                    difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
                    points: { type: "number" },
                    hint: { type: "string" },
                    tags: { type: "array", items: { type: "string" } },
                    bloom: { type: "string" },
                  },
                  required: ["question_type", "prompt", "correct"],
                },
              },
            },
            required: ["questions"],
          },
        },
      },
    ];

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "generate_questions" } },
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      const status = resp.status === 429 || resp.status === 402 ? resp.status : 500;
      return new Response(JSON.stringify({ error: `AI gateway error: ${text}` }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await resp.json();
    const call = data?.choices?.[0]?.message?.tool_calls?.[0];
    let questions: GenQ[] = [];
    if (call?.function?.arguments) {
      try {
        const parsed = JSON.parse(call.function.arguments);
        questions = Array.isArray(parsed?.questions) ? parsed.questions : [];
      } catch (_) {
        // ignore
      }
    }

    return new Response(JSON.stringify({ questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
