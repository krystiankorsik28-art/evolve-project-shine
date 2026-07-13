import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { getGeminiTextModel } from "@/lib/gemini-models";

/* =========================================================================
   STREAMING AI TUTOR (SSE, token po tokenie)
   POST /api/ai-tutor-stream
   Body: { thread_id: string, message: string, subject?: string | null }
   Header: Authorization: Bearer <supabase access token>

   Strumieniuje fragmenty odpowiedzi tutora w czasie rzeczywistym.
   Po zakończeniu strumienia zapisuje pełną wiadomość do ai_tutor_messages
   i aktualizuje updated_at na wątku.
   ========================================================================= */

type Body = { thread_id?: string; message?: string; subject?: string | null };

export const Route = createFileRoute("/api/ai-tutor-stream")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const auth = request.headers.get("authorization") ?? "";
          const token = auth.toLowerCase().startsWith("bearer ")
            ? auth.slice(7).trim()
            : "";
          if (!token) {
            return new Response(JSON.stringify({ error: "Brak autoryzacji" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }

          const SUPABASE_URL = process.env.SUPABASE_URL;
          const SUPABASE_PUBLISHABLE_KEY =
            process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.SUPABASE_ANON_KEY;
          const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
          if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
            return new Response(
              JSON.stringify({ error: "Brak konfiguracji Supabase" }),
              { status: 500, headers: { "Content-Type": "application/json" } },
            );
          }
          if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "Brak GEMINI_API_KEY" }), {
              status: 500,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Klient działający jako użytkownik (RLS aktywne).
          const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
            global: { headers: { Authorization: `Bearer ${token}` } },
            auth: { persistSession: false, autoRefreshToken: false },
          });

          const { data: userData, error: userErr } = await supabase.auth.getUser(token);
          if (userErr || !userData?.user) {
            return new Response(JSON.stringify({ error: "Niezalogowany" }), {
              status: 401,
              headers: { "Content-Type": "application/json" },
            });
          }
          const userId = userData.user.id;

          const body = (await request.json().catch(() => ({}))) as Body;
          const threadId = String(body.thread_id ?? "").trim();
          const message = String(body.message ?? "").trim();
          if (!threadId || !message) {
            return new Response(
              JSON.stringify({ error: "Wymagane: thread_id, message" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }
          if (message.length > 8000) {
            return new Response(
              JSON.stringify({ error: "Wiadomość zbyt długa (max 8000)" }),
              { status: 400, headers: { "Content-Type": "application/json" } },
            );
          }

          // Autoryzacja wątku
          const { data: thread } = await supabase
            .from("ai_tutor_threads")
            .select("id,user_id,subject")
            .eq("id", threadId)
            .maybeSingle();
          if (!thread || thread.user_id !== userId) {
            return new Response(JSON.stringify({ error: "Brak dostępu do wątku" }), {
              status: 403,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Zapisz wiadomość użytkownika
          await supabase.from("ai_tutor_messages").insert({
            thread_id: threadId, role: "user", content: message,
          });

          // Pobierz historię
          const { data: history } = await supabase
            .from("ai_tutor_messages")
            .select("role,content")
            .eq("thread_id", threadId)
            .order("created_at", { ascending: true })
            .limit(30);

          const subject = (body.subject ?? thread.subject) ?? null;
          const systemPrompt = `Jesteś AI Asystentem EduNex — asystentem nauczyciela wspierającym tworzenie egzaminów, lekcji i materiałów dydaktycznych dla polskich szkół.
${subject ? `Specjalizacja: ${subject}.` : ""}

CO MOŻESZ ROBIĆ:
- Tworzyć egzaminy, sprawdziany, kartkówki na dowolny temat i poziom
- Generować pytania różnych typów: jednokrotnego/wielokrotnego wyboru, prawda/fałsz, krótkiej odpowiedzi, otwarte, na dobieranie
- Tworzyć plany lekcji i konspekty
- Opracowywać materiały dydaktyczne i karty pracy
- Przygotowywać rubryki oceniania i klucze odpowiedzi
- Analizować wyniki egzaminów i sugerować poprawki

ZASADY:
- Gdy nauczyciel opisuje czego potrzebuje — wykonaj to od razu
- Używaj Markdown (nagłówki, listy, **pogrubienie**, kod \`tak\`)
- Wzory pisz w LaTeX między $...$ lub $$...$$
- Odpowiadaj zwięźle ale wyczerpująco. Pisz po polsku.

TON: profesjonalny, pomocny, rzeczowy. To asystent nauczyciela, nie ucznia.`;

          const systemInstruction = systemPrompt;
          const chatMessages = (history ?? []).map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

          const upstream = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${getGeminiTextModel()}:streamGenerateContent?alt=sse`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": GEMINI_API_KEY,
              },
              body: JSON.stringify({
                system_instruction: { parts: [{ text: systemInstruction }] },
                contents: chatMessages,
              }),
            },
          );

          if (!upstream.ok || !upstream.body) {
            const t = await upstream.text().catch(() => "");
            const status = upstream.status === 429 || upstream.status === 402 ? upstream.status : 500;
            const msg = upstream.status === 429
              ? "Przekroczono limit zapytań AI. Spróbuj za chwilę."
              : upstream.status === 402
                ? "Wyczerpano kredyty AI w workspace."
                : `Błąd Gemini API: ${t.slice(0, 200)}`;
            return new Response(JSON.stringify({ error: msg }), {
              status,
              headers: { "Content-Type": "application/json" },
            });
          }

          // Transform stream: przekazujemy SSE i jednocześnie składamy pełny tekst,
          // który zapiszemy po zakończeniu do bazy.
          const reader = upstream.body.getReader();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          let fullText = "";
          let buffer = "";

          const stream = new ReadableStream({
            async pull(controller) {
              const { done, value } = await reader.read();
              if (done) {
                // Zapisz pełną odpowiedź
                if (fullText.trim()) {
                  await supabase.from("ai_tutor_messages").insert({
                    thread_id: threadId, role: "assistant", content: fullText,
                  });
                  await supabase
                    .from("ai_tutor_threads")
                    .update({ updated_at: new Date().toISOString() })
                    .eq("id", threadId);
                }
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
                return;
              }
              buffer += decoder.decode(value, { stream: true });

              let idx: number;
              while ((idx = buffer.indexOf("\n")) !== -1) {
                let line = buffer.slice(0, idx);
                buffer = buffer.slice(idx + 1);
                if (line.endsWith("\r")) line = line.slice(0, -1);
                if (!line.startsWith("data: ")) continue;
                const payload = line.slice(6).trim();
                if (!payload || payload === "[DONE]") continue;
                try {
                  const parsed = JSON.parse(payload) as {
                    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
                  };
                  const piece = parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                  if (piece) {
                    fullText += piece;
                    const openaiChunk = `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`;
                    controller.enqueue(encoder.encode(openaiChunk));
                  }
                } catch {
                  buffer = line + "\n" + buffer;
                  break;
                }
              }
            },
            async cancel() {
              try { await reader.cancel(); } catch { /* noop */ }
            },
          });

          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        } catch (e) {
          console.error("ai-tutor-stream error:", e);
          return new Response(
            JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    },
  },
});
