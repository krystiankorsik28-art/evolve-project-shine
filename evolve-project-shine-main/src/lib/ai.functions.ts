import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createGeminiProvider } from "./ai-gateway";
import {
  createGeminiGenerateContentBody,
  getGeminiGenerateContentUrl,
} from "./gemini-native";
import { getGeminiImageModel, getGeminiTextModel } from "./gemini-models";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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

const PhotoInput = z.object({
  image_base64: z.string().min(10),
  description: z.string().trim().min(1).max(2000),
  language: z.string().default("pl"),
});

/** Wyciąga pytanie z obrazka + opisu nauczyciela. */
export const aiQuestionFromPhoto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => PhotoInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Brak GEMINI_API_KEY");

    const model = createGeminiProvider(key)(getGeminiTextModel());

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({ schema: QuestionSchema }),
      messages: [
        {
          role: "system",
          content:
            "Jesteś asystentem nauczyciela. Analizujesz zdjęcie (np. fotografię zadania z podręcznika, tablicy, kartki) oraz krótki opis nauczyciela, i tworzysz na ich podstawie wysokiej jakości pytanie egzaminacyjne. Pisz w języku polskim, chyba że opis sugeruje inny. Dobierz typ pytania zgodnie z treścią.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: `Opis od nauczyciela: ${data.description}\nUtwórz najlepsze możliwe pytanie egzaminacyjne na podstawie tego obrazka i opisu.` },
            { type: "image", image: data.image_base64 },
          ],
        },
      ],
    });

    return experimental_output;
  });

const TextInput = z.object({
  topic: z.string().min(3).max(8000),
  mode: z.enum(["topic", "material"]).default("topic"),
  count: z.number().int().min(1).max(30).default(5),
  difficulty: z.enum(["easy", "medium", "hard"]).default("medium"),
  language: z.string().default("pl"),
  types: z.array(z.enum(ALL_TYPES)).min(1).default(["single_choice", "true_false", "short_answer"]),
  style: z.enum(["exam", "quiz", "test"]).default("exam"),
  subject: z.string().optional().nullable(),
});

export const aiGenerateQuestions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => TextInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Brak GEMINI_API_KEY");

    const model = createGeminiProvider(key)(getGeminiTextModel());

    const typeHelp = `Dozwolone typy: ${data.types.join(", ")}.
Reguły struktury (POLE options/correct_answer):
- single_choice: options=4 stringi, correct_answer=tekst poprawnej opcji.
- multiple_choice: options=4-6 stringów, correct_answer=tablica tekstów poprawnych opcji.
- true_false: options=["Prawda","Fałsz"], correct_answer="Prawda" lub "Fałsz".
- short_answer: bez options, correct_answer=krótki tekst.
- essay: bez options, correct_answer="" (ocena ręczna).
- numeric: bez options, correct_answer=liczba jako string, np. "42.5".
- ordering: options=elementy W POPRAWNEJ kolejności, correct_answer=tablica indeksów [0,1,2,...].
- fill_in_blank: prompt ma luki w formacie ___ (3 podkreślenia), options nie używane, correct_answer=tablica słów-odpowiedzi po kolei.
- matching: options=["lewa::prawa","lewa2::prawa2",...], correct_answer=tablica indeksów dopasowań.
- drag_drop: jak ordering.
- code: bez options, correct_answer=przykładowe rozwiązanie kodu (ocena ręczna).`;

    const styleHint = data.style === "quiz" ? "Krótkie, dynamiczne, bardziej rozrywkowe."
      : data.style === "test" ? "Szybkie pytania sprawdzające wiedzę." : "Pytania egzaminacyjne, precyzyjne, akademickie.";

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({ questions: z.array(QuestionSchema).min(1).max(30) }),
      }),
      prompt: `${data.mode === "material" ? "Na podstawie poniższego materiału" : "Z tematu"}: """${data.topic}"""
${data.subject ? `Przedmiot: ${data.subject}.` : ""}
Wygeneruj DOKŁADNIE ${data.count} pytań. Poziom trudności: ${data.difficulty}. Język: ${data.language}. Styl: ${styleHint}
${typeHelp}
Dbaj o jakość, brak duplikatów, jasne wyjaśnienia. Nie dodawaj numeracji w treści.`,
    });

    return experimental_output.questions;
  });

const ImageGenInput = z.object({
  prompt: z.string().min(3).max(500),
});

/** Generuje obrazek do pytania (np. ilustracja diagramu, mapy myśli). */
export const aiGenerateQuestionImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => ImageGenInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Brak GEMINI_API_KEY");

    const res = await fetch(
      getGeminiGenerateContentUrl(getGeminiImageModel()),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key,
        },
        body: JSON.stringify(createGeminiGenerateContentBody({
          contents: [
            {
              parts: [
                {
                  text: `Edukacyjna ilustracja: ${data.prompt}. Czysty styl, dobra czytelność, bez tekstu.`,
                },
              ],
            },
          ],
          generationConfig: {
            responseModalities: ["IMAGE"],
          },
        })),
      },
    );

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Gemini Image API ${res.status}: ${t.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{ inlineData?: { data?: string; mimeType?: string } }>;
        };
      }>;
    };
    const image = json.candidates?.[0]?.content?.parts?.find((part) => part.inlineData?.data)?.inlineData;
    if (!image?.data) throw new Error("Brak obrazka w odpowiedzi Gemini");
    return { image_url: `data:${image.mimeType || "image/png"};base64,${image.data}` };
  });

/* ───────────────────────────── AI EXAM AGENT ─────────────────────────────
   Wolny prompt + dowolna liczba obrazków → AI rozumie intencję nauczyciela
   i zwraca listę pytań (opcjonalnie z `attach_image_index` wskazującym,
   które ze zdjęć przypisać do danego pytania jako media_url). Klient po
   stronie UI uploaduje zdjęcia do bucket-a i podstawia URL-e.            */
const AgentInput = z.object({
  instruction: z.string().trim().min(3).max(4000),
  images_base64: z.array(z.string().min(10)).max(8).default([]),
  subject: z.string().optional().nullable(),
  language: z.string().default("pl"),
});

const AgentQuestionSchema = QuestionSchema.extend({
  attach_image_index: z.number().int().min(0).nullable().optional(),
});

export const aiExamAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => AgentInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Brak GEMINI_API_KEY");

    const model = createGeminiProvider(key)(getGeminiTextModel());

    const imgCount = data.images_base64.length;
    const imageHelp = imgCount > 0
      ? `Otrzymujesz ${imgCount} obrazków (indeksowane od 0). Jeśli polecenie sugeruje, że konkretne zadanie/treść pochodzi z konkretnego obrazka, ustaw "attach_image_index" na ten indeks — obrazek zostanie przypisany jako ilustracja pytania. Jeśli obrazek to ogólny kontekst, zostaw null.`
      : `Brak obrazków — generuj wyłącznie z opisu.`;

    const userContent: Array<{ type: "text"; text: string } | { type: "image"; image: string }> = [
      { type: "text", text: `Polecenie nauczyciela: """${data.instruction}"""\n${data.subject ? `Przedmiot: ${data.subject}.\n` : ""}${imageHelp}\nWygeneruj odpowiednią liczbę wysokiej jakości pytań egzaminacyjnych zgodnie z poleceniem.` },
      ...data.images_base64.map((b64) => ({ type: "image" as const, image: b64 })),
    ];

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          summary: z.string(),
          questions: z.array(AgentQuestionSchema).min(1).max(30),
        }),
      }),
      messages: [
        {
          role: "system",
          content:
            "Jesteś inteligentnym asystentem nauczyciela. Analizujesz polecenie (po polsku) oraz załączone obrazki i decydujesz, jakie pytania utworzyć. Rozumiesz polecenia takie jak: 'dodaj te 3 zadania ze zdjęcia jako pytania otwarte', 'zrób 5 testowych z tego materiału, dołącz zdjęcie jako ilustrację', 'na podstawie tego diagramu utwórz pytanie wielokrotnego wyboru' itp. Wybieraj typy pytań tak, by jak najlepiej oddać intencję. Dla każdego pytania możesz przypisać indeks obrazka (attach_image_index). Schemat options/correct_answer: single_choice→options=tablica, correct_answer=tekst poprawnej opcji; multiple_choice→correct_answer=tablica tekstów; true_false→options=['Prawda','Fałsz']; short_answer/numeric/essay/code→bez options; fill_in_blank→prompt z ___ , correct_answer=tablica słów; ordering/drag_drop→options w poprawnej kolejności, correct_answer=[0,1,2,...]; matching→options=['l::p',...], correct_answer=tablica indeksów.",
        },
        { role: "user", content: userContent },
      ],
    });

    return experimental_output;
  });

/* ───────────────────────────── AI ESSAY GRADER ─────────────────────────────
   Ocenianie pytań otwartych/esejów z rubryką. Zwraca punkty, feedback,
   ocenione kryteria. Można zapisać do tabeli ai_gradings.                  */
const EssayGradeInput = z.object({
  prompt: z.string().min(1).max(8000),
  answer: z.string().min(1).max(20000),
  max_points: z.number().min(0.5).max(50).default(10),
  rubric: z.string().max(4000).optional().nullable(),
  language: z.string().default("pl"),
});

const RubricItemSchema = z.object({
  criterion: z.string(),
  score: z.number().min(0),
  max: z.number().min(0),
  comment: z.string(),
});

export const aiGradeEssay = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => EssayGradeInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Brak GEMINI_API_KEY");
    const model = createGeminiProvider(key)(getGeminiTextModel());

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          total_score: z.number(),
          max_score: z.number(),
          percent: z.number().min(0).max(100),
          confidence: z.number().min(0).max(1),
          feedback: z.string(),
          rubric: z.array(RubricItemSchema),
          strengths: z.array(z.string()).max(6),
          improvements: z.array(z.string()).max(6),
        }),
      }),
      messages: [
        {
          role: "system",
          content:
            "Jesteś rzetelnym egzaminatorem. Oceniasz odpowiedź ucznia zgodnie z rubryką (jeśli podano) lub typową rubryką akademicką (treść, język, struktura, argumentacja, poprawność). Bądź sprawiedliwy, ale wymagający. Pisz po polsku, chyba że poproszono o inny język.",
        },
        {
          role: "user",
          content: `Pytanie/treść zadania:\n"""${data.prompt}"""\n\nMaksymalna liczba punktów: ${data.max_points}\n${data.rubric ? `Rubryka oceniania:\n"""${data.rubric}"""\n` : "Użyj domyślnej rubryki: treść (40%), argumentacja (25%), struktura (15%), język (15%), oryginalność (5%).\n"}\nOdpowiedź ucznia:\n"""${data.answer}"""\n\nOceń odpowiedź, zwróć szczegółowe oceny kryteriów, mocne i słabe strony, konstruktywny feedback.`,
        },
      ],
    });

    return experimental_output;
  });

/* ───────────────────────────── AI EXAM INSIGHTS ─────────────────────────────
   Analiza statystyk egzaminu — wnioski, słabe pytania, rekomendacje.       */
const InsightsInput = z.object({
  exam_title: z.string().min(1).max(300),
  stats: z.object({
    attempts: z.number(),
    avg_percent: z.number(),
    pass_rate: z.number(),
    median_percent: z.number().optional(),
    per_question: z.array(z.object({
      prompt: z.string().max(500),
      correct_rate: z.number().min(0).max(1),
      avg_time_sec: z.number().optional(),
    })).max(50),
  }),
  language: z.string().default("pl"),
});

export const aiExamInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => InsightsInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("Brak GEMINI_API_KEY");
    const model = createGeminiProvider(key)(getGeminiTextModel());

    const { experimental_output } = await generateText({
      model,
      experimental_output: Output.object({
        schema: z.object({
          summary: z.string(),
          difficulty_rating: z.enum(["za_latwy", "odpowiedni", "wymagajacy", "za_trudny"]),
          weak_questions: z.array(z.object({ index: z.number(), reason: z.string() })).max(10),
          recommendations: z.array(z.string()).max(8),
          next_steps: z.array(z.string()).max(6),
        }),
      }),
      prompt: `Przeanalizuj wyniki egzaminu "${data.exam_title}".
Statystyki: ${data.stats.attempts} podejść, średnia ${data.stats.avg_percent.toFixed(1)}%, zdawalność ${data.stats.pass_rate.toFixed(1)}%.
Pytania (poprawność %):
${data.stats.per_question.map((q, i) => `${i + 1}. [${Math.round(q.correct_rate * 100)}%] ${q.prompt.slice(0, 180)}`).join("\n")}
Daj nauczycielowi konkretne wnioski: ocenę trudności, które pytania są problematyczne i dlaczego (np. niejasne polecenie, za trudne dla poziomu, błąd w kluczu), rekomendacje poprawek i co zrobić z klasą dalej.`,
    });

    return experimental_output;
  });
