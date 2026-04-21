// Edge function: generowanie pytań przez Lovable AI
// Tryby zapisu:
//   - exam_id: wstawia do tabeli questions (egzamin)
//   - to_bank=true: wstawia do question_bank
//   - brak: zwraca pytania bez zapisu
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const QUESTION_TYPES = [
  "single_choice", "multiple_choice", "true_false", "short_answer",
  "essay", "matching", "drag_drop", "fill_in_blank", "ordering", "numeric", "code", "hotspot",
] as const;

const SCHEMA = {
  type: "object",
  properties: {
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question_type: { type: "string", enum: QUESTION_TYPES as unknown as string[] },
          prompt: { type: "string" },
          options: {},
          correct_answer: {},
          explanation: { type: "string" },
          difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
          points: { type: "number" },
        },
        required: ["question_type", "prompt", "difficulty", "points"],
      },
    },
  },
  required: ["questions"],
};

async function callAI(systemPrompt: string, userPrompt: string, useSchema = true) {
  const body: Record<string, unknown> = {
    model: "google/gemini-3-flash-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  };
  if (useSchema) {
    body.tools = [{
      type: "function",
      function: {
        name: "emit_questions",
        description: "Zwraca pytania w ustalonym formacie",
        parameters: SCHEMA,
      },
    }];
    body.tool_choice = { type: "function", function: { name: "emit_questions" } };
  }

  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (r.status === 429) throw new Error("429:Rate limit");
  if (r.status === 402) throw new Error("402:Payment required");
  if (!r.ok) throw new Error(`AI gateway ${r.status}: ${await r.text()}`);
  const j = await r.json();
  if (useSchema) {
    const args = j.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    if (!args) throw new Error("Brak tool_calls w odpowiedzi AI");
    return JSON.parse(args);
  }
  return j.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const authHeader = req.headers.get("authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await admin.auth.getUser(token);
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { data: ok } = await admin.rpc("is_approved_teacher", { _user_id: user.id });
    if (!ok) return new Response(JSON.stringify({ error: "Not approved teacher" }), { status: 403, headers: corsHeaders });

    const body = await req.json();
    const mode: string = body.mode ?? "topic";

    let result: { questions?: unknown[]; text?: string } = {};

    if (mode === "topic") {
      const {
        topic, count = 5, difficulty = "medium", language = "pl",
        types, question_type, extra_context = "",
      } = body;
      const allowedTypes: string[] = Array.isArray(types) ? types : [question_type ?? "single_choice"];
      const sys = `Jesteś ekspertem dydaktyki. Generujesz wysokiej jakości pytania egzaminacyjne w języku ${language}.
Format correct_answer dla typów:
- single_choice: liczba (indeks)
- multiple_choice: tablica indeksów [0,2]
- true_false: 0 (Prawda) lub 1 (Fałsz), opcje ["Prawda","Fałsz"]
- short_answer: string z poprawną odpowiedzią
- essay: string z wzorcową odpowiedzią/kryteriami
- numeric: {value, tolerance, unit}
- matching: opcje [{left,right}], correct_answer = mapowanie
- drag_drop: opcje [{item,target}]
- fill_in_blank: prompt z {{1}}, {{2}}, correct_answer = ["odp1","odp2"]
- ordering: opcje = elementy w poprawnej kolejności
- code: {language, expected_output, solution}
- hotspot: {x, y, radius, image_url}
Każde pytanie ma 'explanation' (1-3 zdania).`;
      const user_p = `Wygeneruj ${count} pytań na temat: "${topic}". Trudność: ${difficulty}. Dozwolone typy: ${allowedTypes.join(", ")}. ${extra_context ? "Dodatkowy kontekst: " + extra_context : ""}`;
      result = await callAI(sys, user_p);
    } else if (mode === "from_text") {
      const { text, count = 5, types = ["single_choice"] } = body;
      const sys = `Jesteś ekspertem dydaktyki. Tworzysz pytania na podstawie podanego materiału.`;
      result = await callAI(sys, `Materiał:\n${text}\n\nWygeneruj ${count} pytań typów: ${types.join(", ")}`);
    } else if (mode === "paraphrase") {
      const { prompt } = body;
      const sys = "Sparafrazuj pytanie zachowując sens i poprawność merytoryczną. Zwróć JEDNO pytanie.";
      result = await callAI(sys, `Pytanie: "${prompt}"\nZwróć JSON {questions:[{...}]} z jednym pytaniem o tym samym typie i correct_answer.`);
    } else if (mode === "translate") {
      const { prompt, options = [], target_lang = "en" } = body;
      const sys = `Przetłumacz pytanie na ${target_lang}, zachowując terminologię techniczną.`;
      result = await callAI(sys, `Pytanie: ${prompt}\nOpcje: ${JSON.stringify(options)}`);
    } else if (mode === "validate") {
      const { prompt, options = [], correct_answer } = body;
      const sys = "Jesteś recenzentem testów. Sprawdź poprawność merytoryczną, jednoznaczność i poprawność oznaczonej odpowiedzi. Format: STATUS: OK|UWAGI \\n KOMENTARZ: ...";
      const text = await callAI(sys, `Pytanie: ${prompt}\nOpcje: ${JSON.stringify(options)}\nOznaczona poprawna: ${JSON.stringify(correct_answer)}`, false);
      return new Response(JSON.stringify({ success: true, text: String(text) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } else {
      return new Response(JSON.stringify({ error: "unknown mode" }), { status: 400, headers: corsHeaders });
    }

    const questions = (result.questions ?? []) as Array<Record<string, unknown>>;

    // Persist if requested
    if (body.exam_id && questions.length > 0) {
      // Check exam ownership
      const { data: exam } = await admin.from("exams").select("created_by").eq("id", body.exam_id).maybeSingle();
      if (!exam || exam.created_by !== user.id) {
        return new Response(JSON.stringify({ error: "Exam not found or not owned" }), { status: 403, headers: corsHeaders });
      }
      const { count: existing } = await admin.from("questions").select("*", { count: "exact", head: true }).eq("exam_id", body.exam_id);
      const rows = questions.map((q, i) => ({
        exam_id: body.exam_id,
        question_type: q.question_type as string,
        prompt: q.prompt as string,
        options: (q.options ?? []) as never,
        correct_answer: (q.correct_answer ?? null) as never,
        explanation: (q.explanation ?? null) as string | null,
        difficulty: (q.difficulty ?? "medium") as string,
        points: (q.points ?? 1) as number,
        order_index: (existing ?? 0) + i,
        ai_generated: true,
      }));
      const { error: insErr } = await admin.from("questions").insert(rows);
      if (insErr) throw new Error(insErr.message);
      return new Response(JSON.stringify({ success: true, count: rows.length, questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (body.to_bank && questions.length > 0) {
      const rows = questions.map((q) => ({
        question_type: q.question_type as string,
        prompt: q.prompt as string,
        options: (q.options ?? []) as never,
        correct_answer: (q.correct_answer ?? null) as never,
        explanation: (q.explanation ?? null) as string | null,
        difficulty: (q.difficulty ?? "medium") as string,
        points: (q.points ?? 1) as number,
        category_id: (body.category_id ?? null) as string | null,
        language: (body.language ?? "pl") as string,
        ai_generated: true,
        created_by: user.id,
      }));
      const { error: insErr } = await admin.from("question_bank").insert(rows);
      if (insErr) throw new Error(insErr.message);
      return new Response(JSON.stringify({ success: true, count: rows.length, questions }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, count: questions.length, questions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown";
    const status = msg.startsWith("429") ? 429 : msg.startsWith("402") ? 402 : 500;
    console.error("generate-questions error", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
