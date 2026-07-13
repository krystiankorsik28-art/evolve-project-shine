import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createGeminiProvider } from "./ai-gateway";
import { getGeminiLiteModel, getGeminiTextModel } from "./gemini-models";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const getModel = (m = getGeminiTextModel()) => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Brak GEMINI_API_KEY");
  return createGeminiProvider(key)(m);
};

const SUPPORTED_QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "short_answer",
  "essay",
] as const;
type SupportedQuestionType = (typeof SUPPORTED_QUESTION_TYPES)[number];

/* ============ AI TUTOR (streaming chat) ============ */

const TutorIn = z.object({
  thread_id: z.string().uuid(),
  message: z.string().min(1).max(8000),
  subject: z.string().optional().nullable(),
  image: z.object({
    mime_type: z.string(),
    data: z.string(),
  }).optional(),
});

const EXAM_TOOLS = {
  function_declarations: [{
    name: "createExam",
        description: "Tworzy egzamin lub sprawdzian w systemie EduNex i zapisuje go na koncie nauczyciela. Użyj tej funkcji gdy nauczyciel poprosi o stworzenie egzaminu, sprawdzianu, kartkówki lub testu.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string", description: "Tytuł egzaminu/sprawdzianu" },
        subject: { type: "string", description: "Przedmiot (np. Matematyka, Fizyka, Polski)" },
        category: { type: "string", enum: ["egzamin", "sprawdzian"], description: "Typ: 'egzamin' dla dużych testów (zakładka Egzaminy) lub 'sprawdzian' dla kartkówek (zakładka Sprawdziany). Domyślnie: egzamin." },
        description: { type: "string", description: "Opis lub instrukcja dla uczniów" },
        duration_minutes: { type: "number", description: "Czas trwania w minutach, domyślnie 45" },
        passing_score: { type: "number", description: "Próg zaliczenia 0-100, domyślnie 50" },
        questions: {
          type: "array",
          description: "Lista pytań — DOKŁADNIE tyle, ile na zdjęciu/ile poprosił nauczyciel. Nie dodawaj więcej!",
          items: {
            type: "object",
            properties: {
              prompt: { type: "string", description: "Treść pytania" },
              question_type: {
                type: "string",
                enum: ["single_choice", "multiple_choice", "true_false", "short_answer", "essay"],
                description: "Typ pytania: single_choice=jednokrotny wybór, multiple_choice=wielokrotny, true_false=prawda/fałsz, short_answer=krótka odpowiedź, essay=esej"
              },
              points: { type: "number", description: "Liczba punktów, domyślnie 1" },
              difficulty: { type: "string", enum: ["easy", "medium", "hard"], description: "Poziom trudności" },
              options: {
                type: "array",
                description: "Lista opcji odpowiedzi (tylko dla single_choice, multiple_choice i true_false). Np. [\"Opcja A\", \"Opcja B\", \"Opcja C\", \"Opcja D\"] lub dla true_false: [\"Prawda\", \"Fałsz\"]",
                items: { type: "string" }
              },
              correct_answer: {
                description: "Poprawna odpowiedź. Dla single_choice: litera (\"a\"), dla true_false: \"t\" lub \"f\", dla short_answer: tekst"
              },
              explanation: { type: "string", description: "Wyjaśnienie poprawnej odpowiedzi (opcjonalne)" },
            },
            required: ["prompt", "question_type", "points"]
          }
        }
      },
      required: ["title", "subject", "questions"]
    }
  }]
};

export const aiTutorReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => TutorIn.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: thread } = await supabase
      .from("ai_tutor_threads").select("id,user_id,subject").eq("id", data.thread_id).maybeSingle();
    if (!thread || thread.user_id !== userId) throw new Error("Brak dostępu do wątku");

    await supabase.from("ai_tutor_messages").insert({
      thread_id: data.thread_id, role: "user", content: data.image ? `${data.message}\n[Załącznik: obraz]` : data.message,
    });

    const { data: history } = await supabase
      .from("ai_tutor_messages").select("role,content")
      .eq("thread_id", data.thread_id).order("created_at", { ascending: true }).limit(30);

    const subject = data.subject ?? thread.subject ?? null;
    const sys = `Jesteś AI Asystentem EduNex — asystentem nauczyciela wspierającym tworzenie egzaminów, lekcji i materiałów dydaktycznych dla polskich szkół.
${subject ? `Specjalizacja: ${subject}.` : ""}

CO MOŻESZ ROBIĆ:
- GENEROWAĆ treść egzaminów, sprawdzianów, kartkówek na dowolny temat i poziom
- GENEROWAĆ pytania różnych typów: jednokrotnego/wielokrotnego wyboru, prawda/fałsz, krótkiej odpowiedzi, otwarte, na dobieranie
- Tworzyć plany lekcji i konspekty
- Opracowywać materiały dydaktyczne i karty pracy
- Przygotowywać rubryki oceniania i klucze odpowiedzi
- Analizować wyniki egzaminów i sugerować poprawki
- Generować zadania domowe i ćwiczenia wyrównujące
- Analizować zdjęcia (wykresy, tekst, notatki odręczne)

GDY NAUCZYCIEL PROSI O STWORZENIE EGZAMINU LUB SPRAWDZIANU:
Użyj funkcji createExam — ona zapisze go bezpośrednio na koncie nauczyciela.
- Jeśli nauczyciel mówi "egzamin" → category: "egzamin" (trafi do zakładki Egzaminy)
- Jeśli nauczyciel mówi "sprawdzian", "kartkówka", "test" → category: "sprawdzian" (trafi do zakładki Sprawdziany)
- Gdy dostajesz ZDJĘCIE sprawdzianu/egzaminu → przeczytaj pytania i utwórz DOKŁADNIE tyle pytań ile jest na zdjęciu, ani więcej
- Nie mów że nie możesz, po prostu zrób to.

ZASADY:
- Gdy nauczyciel opisuje czego potrzebuje — wykonaj to od razu, bez zadawania dodatkowych pytań
- Liczba pytań w createExam musi być DOKŁADNIE taka, jaką podał nauczyciel lub ile widzisz na zdjęciu — ani mniej, ani więcej
- Używaj Markdown (nagłówki, listy, **pogrubienie**, \`kod\` inline)
- Matematyka: LaTeX między $...$ (inline) lub $$...$$ (bloki)
- Odpowiadaj zwięźle ale wyczerpująco
- Pisz zawsze po polsku

TON: profesjonalny, pomocny, rzeczowy. To asystent nauczyciela, nie ucznia.`;

    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Brak GEMINI_API_KEY");

    const systemInstruction = sys;
    type GeminiPart = { text: string } | { inline_data: { mime_type: string; data: string } };
    const chatMessages: Array<{ role: string; parts: GeminiPart[] }> = (history ?? []).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const userParts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [{ text: data.message }];
    if (data.image) {
      userParts.push({ inline_data: { mime_type: data.image.mime_type, data: data.image.data } });
    }
    chatMessages.push({ role: "user", parts: userParts });

    const upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/${getGeminiTextModel()}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: chatMessages,
          tools: [EXAM_TOOLS],
        }),
      },
    );

    if (!upstream.ok) {
      const t = await upstream.text();
      throw new Error(`Gemini API ${upstream.status}: ${t.slice(0, 200)}`);
    }

    const json = (await upstream.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string; functionCall?: { name: string; args: Record<string, unknown> } }> } }>;
    };
    const part = json.candidates?.[0]?.content?.parts?.[0];

    // Handle function call from Gemini
    if (part?.functionCall?.name === "createExam") {
      const args = part.functionCall.args as {
        title: string; subject: string; category?: string; description?: string;
        duration_minutes?: number; passing_score?: number;
        questions: Array<{ prompt: string; question_type: string; points: number; difficulty?: string; options?: unknown; correct_answer?: unknown; explanation?: string | null }>;
      };

      const cat = args.category === "sprawdzian" ? "sprawdzian" : "egzamin";
      const { data: exam, error } = await supabase
        .from("exams")
        .insert({
          title: args.title,
          subject: args.subject,
          description: args.description || null,
          duration_minutes: args.duration_minutes || 45,
          passing_score: args.passing_score ?? 50,
          status: "draft",
          created_by: userId,
          category: cat,
        } as never)
        .select("id")
        .single();
      if (error) throw new Error("Nie udało się utworzyć egzaminu: " + error.message);

      const normalizeOpts = (qtype: string, opts: unknown): string[] => {
        if (Array.isArray(opts)) return opts.filter((o): o is string => typeof o === "string" && o.length > 0);
        if (opts && typeof opts === "object") return Object.values(opts).filter((v): v is string => typeof v === "string" && v.length > 0);
        if (qtype === "true_false") return ["Prawda", "Fałsz"];
        return [];
      };
      const normalizeAnswer = (_qtype: string, answer: unknown, opts: string[]): string | string[] | null => {
        if (answer === null || answer === undefined) return null;
        if (typeof answer === "string") {
          if (opts.length > 0) {
            if (opts.includes(answer)) return answer;
            const keyIdx = "abcdefghij".indexOf(answer.toLowerCase());
            if (keyIdx >= 0 && keyIdx < opts.length) return opts[keyIdx];
          }
          return answer;
        }
        if (Array.isArray(answer)) return answer.filter((a): a is string => typeof a === "string");
        return null;
      };

      let qCount = 0;
      for (const q of (args.questions ?? [])) {
        if (!q.prompt || !q.question_type) continue;
        const questionType: SupportedQuestionType = SUPPORTED_QUESTION_TYPES.includes(
          q.question_type as SupportedQuestionType,
        )
          ? (q.question_type as SupportedQuestionType)
          : "short_answer";
        const difficulty = q.difficulty === "easy" || q.difficulty === "hard" ? q.difficulty : "medium";
        const opts = normalizeOpts(questionType, q.options);
        const ans = normalizeAnswer(questionType, q.correct_answer, opts);
        const { error: qErr } = await supabase.from("questions").insert({
          exam_id: exam.id, order_index: qCount,
          prompt: q.prompt, question_type: questionType, points: q.points ?? 1,
          difficulty,
          options: opts, correct_answer: ans,
          explanation: q.explanation ?? null,
        });
        if (qErr) continue;
        qCount++;
      }

      const zakladka = cat === "sprawdzian" ? "**Sprawdziany**" : "**Egzaminy**";
      const full = `✅ ${cat === "sprawdzian" ? "Sprawdzian" : "Egzamin"} **"${args.title}"** został utworzony z **${qCount} pytaniami** i zapisany na Twoim koncie (status: szkic).\n\nMożesz go edytować i opublikować w zakładce ${zakladka}.`;

      await supabase.from("ai_tutor_messages").insert({
        thread_id: data.thread_id, role: "assistant", content: full,
      });
      await supabase.from("ai_tutor_threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", data.thread_id);

      return { content: full, examId: exam.id };
    }

    // Normal text response
    const full = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!full) throw new Error("Pusta odpowiedź AI");

    await supabase.from("ai_tutor_messages").insert({
      thread_id: data.thread_id, role: "assistant", content: full,
    });
    await supabase.from("ai_tutor_threads")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", data.thread_id);

    return { content: full };
  });

export const aiTutorCreateThread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => z.object({ title: z.string().max(120).default("Nowa rozmowa"), subject: z.string().max(80).optional().nullable() }).parse(i))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await supabase.from("ai_tutor_threads").insert({
      user_id: userId, title: data.title || "Nowa rozmowa", subject: data.subject ?? null,
    }).select("id,title,subject,created_at,updated_at").single();
    if (error) throw new Error(error.message);
    return row;
  });

/* ============ AUTO-GRADING ============ */

const GradeIn = z.object({ answer_id: z.string().uuid() });

export const aiGradeAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => GradeIn.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: ans, error } = await supabase
      .from("answers")
      .select("id,attempt_id,question_id,response,questions(prompt,correct_answer,explanation,question_type,points)")
      .eq("id", data.answer_id).maybeSingle();
    if (error || !ans) throw new Error(error?.message ?? "Brak odpowiedzi");

    type Qref = { prompt: string; correct_answer: unknown; explanation: string | null; question_type: string; points: number };
    const q = (ans as unknown as { questions: Qref }).questions;
    const max = Number(q.points || 1);

    const model = getModel();
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          score: z.number().min(0).max(max),
          confidence: z.number().min(0).max(1),
          feedback: z.string(),
          strengths: z.array(z.string()).optional(),
          mistakes: z.array(z.string()).optional(),
        }),
      }),
      prompt: `Jesteś rzetelnym nauczycielem oceniającym odpowiedź ucznia.
Pytanie (${q.question_type}): ${q.prompt}
Wzorcowa odpowiedź / klucz: ${JSON.stringify(q.correct_answer)}
Wyjaśnienie pomocnicze: ${q.explanation ?? "(brak)"}
Maks. punktów: ${max}

Odpowiedź ucznia:
"""${String((ans as { response: unknown }).response ?? "")}"""

Oceń od 0 do ${max} (możesz przyznać ułamki). Bądź sprawiedliwy ale wymagający.
Daj zwięzły, konstruktywny feedback po polsku.`,
    });

    const row = {
      answer_id: ans.id, attempt_id: (ans as { attempt_id: string }).attempt_id, question_id: (ans as { question_id: string }).question_id,
      ai_score: experimental_output.score, max_score: max, confidence: experimental_output.confidence,
      feedback: experimental_output.feedback,
      rubric: { strengths: experimental_output.strengths ?? [], mistakes: experimental_output.mistakes ?? [] },
    };
    const { data: saved, error: e2 } = await supabase.from("ai_gradings").insert(row).select().single();
    if (e2) throw new Error(e2.message);
    return saved;
  });

/* ============ AI PREDICTIONS (ANALYTICS) ============ */

const PredIn = z.object({ student_id: z.string().uuid(), exam_id: z.string().uuid().optional().nullable() });

export const aiPredictStudent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => PredIn.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: attempts } = await supabase
      .from("attempts").select("id,exam_id,score,max_score,started_at,submitted_at,status,exams(title,subject)")
      .eq("student_id", data.student_id).order("started_at", { ascending: false }).limit(30);

    const summary = (attempts ?? []).map((a) => {
      const ex = (a as unknown as { exams: { title: string; subject: string | null } | null }).exams;
      return { exam: ex?.title, subject: ex?.subject, score: a.score, max: a.max_score, status: a.status, when: a.started_at };
    });

    const model = getModel();
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          predicted_score: z.number().min(0).max(100),
          risk_level: z.enum(["low","medium","high"]),
          strengths: z.array(z.string()).min(1),
          weaknesses: z.array(z.string()).min(1),
          recommendations: z.array(z.string()).min(1),
          analysis: z.string(),
        }),
      }),
      prompt: `Jesteś analitykiem edukacyjnym. Na podstawie historii podejść ucznia (poniżej JSON) wykonaj:
- predicted_score: przewidywany wynik (%) najbliższego egzaminu w skali 0-100,
- risk_level: niskie/średnie/wysokie ryzyko niezaliczenia,
- mocne i słabe strony (po polsku),
- 3-5 konkretnych rekomendacji dla ucznia,
- krótka analiza (3-5 zdań, po polsku).

Dane:
${JSON.stringify(summary, null, 2)}`,
    });

    const ins = {
      student_id: data.student_id, exam_id: data.exam_id ?? null,
      predicted_score: experimental_output.predicted_score,
      risk_level: experimental_output.risk_level,
      strengths: experimental_output.strengths,
      weaknesses: experimental_output.weaknesses,
      recommendations: experimental_output.recommendations,
      analysis: experimental_output.analysis,
    };
    const { data: saved } = await supabase.from("ai_predictions").insert(ins).select().single();
    return saved ?? ins;
  });

/* ============ LESSON PLAN AI ============ */

const PlanIn = z.object({
  topic: z.string().min(3).max(500),
  subject: z.string().max(80).optional().nullable(),
  grade: z.string().max(30).optional().nullable(),
  duration_minutes: z.number().int().min(15).max(180).default(45),
});

export const aiGenerateLessonPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => PlanIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel();
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          title: z.string(),
          objectives: z.array(z.string()).min(3),
          phases: z.array(z.object({
            name: z.string(),
            duration_min: z.number(),
            description: z.string(),
            activities: z.array(z.string()),
          })).min(3),
          materials: z.array(z.string()),
          homework: z.string(),
          assessment: z.string(),
        }),
      }),
      prompt: `Stwórz wybitny, gotowy do druku konspekt lekcji zgodny z podstawą programową MEN.
Temat: ${data.topic}
${data.subject ? `Przedmiot: ${data.subject}.` : ""}
${data.grade ? `Klasa/poziom: ${data.grade}.` : ""}
Czas trwania: ${data.duration_minutes} min.

WYMAGANIA:
- Tytuł: konkretny, atrakcyjny dla ucznia (nie generyczny).
- Cele (3-6) sformułowane operacyjnie wg taksonomii Blooma — zaczynaj od czasowników: "uczeń wyjaśnia", "porównuje", "stosuje", "analizuje", "tworzy".
- Fazy (4-6): obowiązkowo zawierają: (1) Wprowadzenie/rekapitulacja, (2) Wprowadzenie nowego materiału, (3) Ćwiczenia praktyczne, (4) Podsumowanie/ewaluacja. Sumę czasów dopasuj do ${data.duration_minutes} min.
- Każda faza: nazwa, czas, opis (2-3 zdania), 3-5 konkretnych aktywności (z metodą: dyskusja, praca w parach, pokaz, mini-wykład, eksperyment, gra dydaktyczna itp.).
- Materiały: konkretne — podręcznik z numerem strony jeśli możliwe, narzędzia online (z nazwami), karty pracy.
- Praca domowa: zróżnicowana (zadanie podstawowe + dla chętnych), realistyczna czasowo.
- Ocenianie: kryteria sukcesu + sposób (formująca/sumująca), z konkretnymi punktami lub poziomami.

Cały tekst po polsku, w stylu profesjonalnego scenariusza nauczyciela.`,
    });
    return experimental_output;
  });

/* ============ LIBRARY: AI SEMANTIC SEARCH (tsvector + AI rerank) ============ */

const SearchIn = z.object({ query: z.string().min(2).max(300) });

export const aiLibrarySearch = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => SearchIn.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows } = await supabase
      .from("ai_library_chunks").select("id,title,summary,content,tags,material_id")
      .textSearch("search_tsv", data.query.split(/\s+/).join(" | "), { type: "websearch" })
      .limit(20);
    if (!rows || rows.length === 0) return { results: [], answer: "Nie znaleziono materiałów." };

    const model = getModel(getGeminiLiteModel());
    const { text } = await generateText({
      model,
      prompt: `Jesteś bibliotekarzem AI. Odpowiedz krótko po polsku na pytanie nauczyciela na podstawie fragmentów biblioteki.
Pytanie: ${data.query}
Fragmenty (JSON):
${JSON.stringify(rows.slice(0,8).map(r => ({ title: r.title, summary: r.summary, snippet: String(r.content).slice(0,400) })))}
Format: 2-4 zdania, wskazując które materiały warto otworzyć (po tytułach).`,
    });
    return { results: rows, answer: text };
  });
