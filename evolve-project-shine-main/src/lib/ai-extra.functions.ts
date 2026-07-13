import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createGeminiProvider } from "./ai-gateway";
import { getGeminiLiteModel, getGeminiTextModel } from "./gemini-models";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/* =========================================================================
   AI EXTRA — dodatkowe funkcje AI rozbudowujące istniejący moduł.
   Wszystko jako createServerFn, więc bezpiecznie używa GEMINI_API_KEY
   po stronie serwera. Plik jest w pełni addytywny — nie modyfikuje
   istniejących ai.functions.ts ani ai-advanced.functions.ts.
   ========================================================================= */

const MODEL_FAST = getGeminiTextModel;
const MODEL_LITE = getGeminiLiteModel;
const MODEL_PRO = getGeminiTextModel;

function getModel(name: string = MODEL_FAST()) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("Brak GEMINI_API_KEY");
  return createGeminiProvider(key)(name);
}

const ALL_TYPES = [
  "single_choice", "multiple_choice", "true_false", "short_answer", "essay",
  "matching", "drag_drop", "fill_in_blank", "ordering", "numeric", "code",
] as const;

const QuestionSchema = z.object({
  prompt: z.string(),
  question_type: z.enum(ALL_TYPES),
  options: z.array(z.string()).optional().nullable(),
  correct_answer: z.union([z.string(), z.array(z.string()), z.boolean(), z.number()]),
  explanation: z.string(),
  difficulty: z.enum(["easy", "medium", "hard"]),
  points: z.number().min(0.5).max(10),
});

/* ============ 1. ULEPSZ ISTNIEJĄCE PYTANIE ============ */

const ImproveIn = z.object({
  prompt: z.string().min(3).max(4000),
  question_type: z.enum(ALL_TYPES),
  options: z.array(z.string()).optional().nullable(),
  correct_answer: z.union([z.string(), z.array(z.string()), z.boolean(), z.number()]),
  explanation: z.string().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export const aiImproveQuestion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ImproveIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel(MODEL_FAST());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          improved: QuestionSchema,
          changes: z.array(z.string()).min(1),
        }),
      }),
      prompt: `Jesteś metodykiem nauczania. Otrzymujesz pytanie egzaminacyjne i masz je ulepszyć:
- popraw jasność i precyzję sformułowania,
- usuń dwuznaczności,
- jeśli to test wyboru, popraw dystraktory tak by były wiarygodne i prawdopodobne (nie absurdalne),
- rozbuduj wyjaśnienie tak, by uczeń rozumiał DLACZEGO odpowiedź jest poprawna,
- zachowaj ten sam typ pytania i ten sam temat.
${data.notes ? `Uwagi nauczyciela: ${data.notes}` : ""}

Oryginał (JSON):
${JSON.stringify(data, null, 2)}

Zwróć ulepszoną wersję + listę 1-5 wprowadzonych zmian (po polsku).`,
    });
    return experimental_output;
  });

/* ============ 2. GENERATOR WIARYGODNYCH DYSTRAKTORÓW ============ */

const DistractorsIn = z.object({
  prompt: z.string().min(3).max(2000),
  correct_answer: z.string().min(1).max(500),
  count: z.number().int().min(2).max(8).default(3),
  subject: z.string().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
});

export const aiGenerateDistractors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => DistractorsIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel(MODEL_LITE());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          distractors: z.array(z.object({
            text: z.string(),
            why_plausible: z.string(),
            common_misconception: z.string().optional().nullable(),
          })).min(2),
        }),
      }),
      prompt: `Generujesz wiarygodne, NIEPOPRAWNE odpowiedzi (dystraktory) do pytania zamkniętego.
Dobre dystraktory: oparte na typowych błędach uczniów, podobnej długości i stylu co poprawna odpowiedź, nie są absurdalne.
Nie powtarzaj poprawnej odpowiedzi.

Pytanie: ${data.prompt}
${data.subject ? `Przedmiot: ${data.subject}` : ""}
Poprawna odpowiedź: ${data.correct_answer}
Poziom trudności: ${data.difficulty}
Liczba dystraktorów: ${data.count}

Dla każdego podaj: text (treść), why_plausible (czemu wygląda na poprawną), common_misconception (jaki błąd uczniowski wykorzystuje — może być null).`,
    });
    return experimental_output.distractors.slice(0, data.count);
  });

/* ============ 3. ZESTAW PYTAŃ WG TAKSONOMII BLOOMA ============ */

const BloomLevels = ["remember", "understand", "apply", "analyze", "evaluate", "create"] as const;

const BloomIn = z.object({
  topic: z.string().min(3).max(8000),
  subject: z.string().optional().nullable(),
  levels: z.array(z.enum(BloomLevels)).min(1).default(["remember", "understand", "apply", "analyze"]),
  per_level: z.number().int().min(1).max(5).default(2),
  language: z.string().default("pl"),
});

export const aiBloomTaxonomyQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => BloomIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel(MODEL_FAST());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          questions: z.array(QuestionSchema.extend({
            bloom_level: z.enum(BloomLevels),
            cognitive_demand: z.string(),
          })).min(1),
        }),
      }),
      prompt: `Wygeneruj zestaw pytań egzaminacyjnych zgodnie z taksonomią Blooma.
Temat: ${data.topic}
${data.subject ? `Przedmiot: ${data.subject}.` : ""}
Język: ${data.language}.
Poziomy: ${data.levels.join(", ")} — po ${data.per_level} pytania na każdym poziomie.

Mapowanie poziomów na typy pytań:
- remember → single_choice / true_false / fill_in_blank
- understand → short_answer / matching
- apply → numeric / short_answer / code
- analyze → multiple_choice / essay / ordering
- evaluate → essay / multiple_choice (z uzasadnieniem)
- create → essay / code / drag_drop

Reguły struktury options/correct_answer:
- single_choice: options=4 stringi, correct_answer=tekst poprawnej.
- multiple_choice: options=4-6, correct_answer=tablica tekstów.
- true_false: options=["Prawda","Fałsz"], correct_answer="Prawda"|"Fałsz".
- short_answer/essay/code: bez options.
- numeric: bez options, correct_answer=liczba jako string.
- ordering/drag_drop: options w poprawnej kolejności, correct_answer=[0,1,2,...].
- matching: options=["l::p",...], correct_answer=tablica indeksów.
- fill_in_blank: prompt z ___, correct_answer=tablica słów.

Dla każdego pytania dodaj: bloom_level, cognitive_demand (1 zdanie po polsku co uczeń musi zrobić).`,
    });
    return experimental_output.questions;
  });

/* ============ 4. WARIANTY PYTANIA (anty-ściąga) ============ */

const VariantsIn = z.object({
  base_prompt: z.string().min(3).max(4000),
  base_correct: z.string().min(1).max(1000),
  question_type: z.enum(ALL_TYPES),
  count: z.number().int().min(2).max(10).default(4),
});

export const aiQuestionVariants = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => VariantsIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel(MODEL_FAST());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          variants: z.array(QuestionSchema).min(2),
        }),
      }),
      prompt: `Wygeneruj ${data.count} RÓŻNYCH wariantów tego samego pytania (anty-ściąga — każdy uczeń dostaje inny wariant testujący tę samą wiedzę).
Każdy wariant ma:
- mierzyć identyczną umiejętność/wiedzę,
- mieć inną treść/liczby/kontekst,
- ten sam typ pytania: ${data.question_type},
- podobny poziom trudności.

Bazowe pytanie: ${data.base_prompt}
Bazowa poprawna odpowiedź: ${data.base_correct}

Zachowaj reguły struktury options/correct_answer dla typu ${data.question_type}.`,
    });
    return experimental_output.variants.slice(0, data.count);
  });

/* ============ 5. WYJAŚNIENIE DLA UCZNIA ============ */

const ExplainIn = z.object({
  question_prompt: z.string().min(3).max(4000),
  correct_answer: z.string().min(1).max(2000),
  student_answer: z.string().max(4000).optional().nullable(),
  subject: z.string().optional().nullable(),
  level: z.enum(["primary", "secondary", "high", "university"]).default("secondary"),
});

export const aiExplainAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ExplainIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel(MODEL_LITE());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          short_explanation: z.string(),
          step_by_step: z.array(z.string()).min(2),
          analogy: z.string().optional().nullable(),
          common_mistakes: z.array(z.string()).optional().nullable(),
          further_practice: z.array(z.string()).optional().nullable(),
        }),
      }),
      prompt: `Wytłumacz uczniowi (${data.level}) dlaczego poprawna odpowiedź jest poprawna. Po polsku, prostym językiem.
${data.subject ? `Przedmiot: ${data.subject}.` : ""}

Pytanie: ${data.question_prompt}
Poprawna odpowiedź: ${data.correct_answer}
${data.student_answer ? `Odpowiedź ucznia (do skomentowania): ${data.student_answer}` : ""}

Zwróć:
- short_explanation (1-2 zdania, intuicyjnie),
- step_by_step (2-6 kroków rozumowania),
- analogy (opcjonalna analogia z życia),
- common_mistakes (typowe pomyłki — opcjonalne),
- further_practice (2-3 podobne pytania do przećwiczenia — opcjonalne).`,
    });
    return experimental_output;
  });

/* ============ 6. STRESZCZENIE MATERIAŁU + SUGESTIE PYTAŃ ============ */

const SummarizeIn = z.object({
  text: z.string().min(50).max(40000),
  subject: z.string().optional().nullable(),
  generate_questions: z.number().int().min(0).max(20).default(5),
});

export const aiSummarizeMaterial = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => SummarizeIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel(MODEL_FAST());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          tldr: z.string(),
          key_points: z.array(z.string()).min(3).max(15),
          glossary: z.array(z.object({ term: z.string(), definition: z.string() })).max(20),
          suggested_questions: z.array(QuestionSchema).max(20),
          estimated_reading_time_min: z.number().int().min(1),
        }),
      }),
      prompt: `Przeanalizuj materiał dydaktyczny i przygotuj:
- tldr (3-5 zdań po polsku),
- key_points (3-15 punktów kluczowych),
- glossary (do 20 najważniejszych terminów + krótkie definicje),
- suggested_questions (DOKŁADNIE ${data.generate_questions} pytań egzaminacyjnych, różnych typów; jeśli 0 — zwróć pustą tablicę),
- estimated_reading_time_min (przybliżony czas czytania w minutach, ~200 słów/min).

${data.subject ? `Przedmiot: ${data.subject}.` : ""}

Reguły struktury options/correct_answer dla pytań:
- single_choice: options=4, correct_answer=tekst poprawnej.
- multiple_choice: options=4-6, correct_answer=tablica tekstów.
- true_false: options=["Prawda","Fałsz"], correct_answer="Prawda"|"Fałsz".
- short_answer/essay: bez options.
- numeric: correct_answer=liczba jako string.
- fill_in_blank: prompt z ___, correct_answer=tablica słów.

Materiał:
"""${data.text}"""`,
    });
    return experimental_output;
  });

/* ============ 7. KOREKTOR TREŚCI PYTAŃ (językowo + merytorycznie) ============ */

const ProofreadIn = z.object({
  text: z.string().min(3).max(8000),
  type: z.enum(["question", "explanation", "feedback", "general"]).default("question"),
});

export const aiProofread = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ProofreadIn.parse(i))
  .handler(async ({ data }) => {
    const model = getModel(MODEL_LITE());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          corrected: z.string(),
          issues: z.array(z.object({
            kind: z.enum(["grammar", "spelling", "style", "clarity", "factual", "other"]),
            description: z.string(),
            suggestion: z.string(),
          })),
          readability_score: z.number().min(0).max(100),
        }),
      }),
      prompt: `Sprawdź poniższy tekst (typ: ${data.type}, język: polski) pod kątem gramatyki, ortografii, stylu, jasności i ewentualnych błędów merytorycznych.
Zwróć:
- corrected (poprawiona wersja),
- issues (lista znalezionych problemów; może być pusta),
- readability_score (0-100, gdzie 100 = bardzo łatwe do zrozumienia dla ucznia).

Tekst:
"""${data.text}"""`,
    });
    return experimental_output;
  });

/* ============ 8. INSIGHT NAUCZYCIELA — analiza wyników egzaminu ============ */

const ExamInsightsIn = z.object({ exam_id: z.string().uuid() });

export const aiExamInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((i) => ExamInsightsIn.parse(i))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: attempts } = await supabase
      .from("attempts")
      .select("id,score,max_score,status,student_name")
      .eq("exam_id", data.exam_id);
    const { data: questions } = await supabase
      .from("questions")
      .select("id,prompt,question_type,points")
      .eq("exam_id", data.exam_id);

    const stats = (attempts ?? []).map((a) => ({
      student: a.student_name, score: a.score, max: a.max_score, status: a.status,
      pct: a.max_score ? Math.round(((a.score ?? 0) / a.max_score) * 100) : null,
    }));

    const model = getModel(MODEL_PRO());
    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          summary: z.string(),
          average_pct: z.number().min(0).max(100),
          pass_rate_pct: z.number().min(0).max(100),
          hardest_topics: z.array(z.string()),
          easiest_topics: z.array(z.string()),
          students_at_risk: z.array(z.string()),
          recommendations_for_teacher: z.array(z.string()).min(2),
          followup_lesson_topic: z.string(),
        }),
      }),
      prompt: `Jesteś analitykiem dydaktycznym. Przeanalizuj wyniki egzaminu (po polsku).
Pytania egzaminu (JSON):
${JSON.stringify((questions ?? []).map(q => ({ prompt: q.prompt, type: q.question_type, pts: q.points })), null, 2)}

Wyniki uczniów (JSON):
${JSON.stringify(stats, null, 2)}

Zwróć:
- summary (3-5 zdań),
- average_pct, pass_rate_pct (% zaliczeń, przyjmując 50% jako próg),
- hardest_topics / easiest_topics (na bazie typów i treści pytań — wnioskuj),
- students_at_risk (imiona/nazwy uczniów poniżej 50%),
- recommendations_for_teacher (2-5 konkretnych działań),
- followup_lesson_topic (temat lekcji powtórkowej).`,
    });
    return experimental_output;
  });
