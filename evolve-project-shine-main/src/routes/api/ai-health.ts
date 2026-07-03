import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai-health")({
  server: {
    handlers: {
      GET: async () => {
        const checks = {
          gemini: Boolean(process.env.GEMINI_API_KEY),
          supabaseUrl: Boolean(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL),
          supabaseKey: Boolean(
            process.env.SUPABASE_PUBLISHABLE_KEY ||
            process.env.SUPABASE_ANON_KEY ||
            process.env.VITE_SUPABASE_PUBLISHABLE_KEY
          ),
        };

        const ok = checks.gemini && checks.supabaseUrl && checks.supabaseKey;

        return new Response(
          JSON.stringify({
            ok,
            service: "EduNex AI Tutor",
            checks,
            message: ok
              ? "AI Tutor ma podstawową konfigurację środowiskową."
              : "Brakuje jednej lub więcej zmiennych środowiskowych wymaganych przez AI Tutor.",
          }),
          {
            status: ok ? 200 : 500,
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
