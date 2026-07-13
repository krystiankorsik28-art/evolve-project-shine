import { createFileRoute } from "@tanstack/react-router";
import { getGeminiTextModel } from "@/lib/gemini-models";

export const Route = createFileRoute("/api/ai-health")({
  server: {
    handlers: {
      GET: async () => {
        const geminiKey = process.env.GEMINI_API_KEY;
        const geminiModel = getGeminiTextModel();
        let geminiModelAvailable = false;

        if (geminiKey) {
          try {
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/${geminiModel}`,
              {
                headers: { "x-goog-api-key": geminiKey },
                signal: AbortSignal.timeout(8000),
              },
            );
            geminiModelAvailable = response.ok;
          } catch {
            geminiModelAvailable = false;
          }
        }

        const checks = {
          geminiKey: Boolean(geminiKey),
          geminiModel: geminiModelAvailable,
          supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
          supabaseKey: Boolean(
            process.env.SUPABASE_PUBLISHABLE_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          ),
        };

        const ok =
          checks.geminiKey && checks.geminiModel && checks.supabaseUrl && checks.supabaseKey;

        return new Response(
          JSON.stringify({
            ok,
            service: "EduNex AI Tutor",
            model: geminiModel,
            checks,
            message: ok
              ? "AI Tutor ma poprawną konfigurację i dostępny model Gemini."
              : "Konfiguracja AI jest niepełna albo wybrany model Gemini jest niedostępny.",
          }),
          {
            status: ok ? 200 : 503,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store",
            },
          },
        );
      },
    },
  },
});
