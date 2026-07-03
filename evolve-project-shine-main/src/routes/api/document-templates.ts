import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

export const Route = createFileRoute("/api/document-templates")({
  server: {
    handlers: {
      GET: async () => {
        const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
        const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceKey) {
          return new Response(
            JSON.stringify({ ok: false, error: "Brak konfiguracji serwerowej Supabase dla dokumentów." }),
            { status: 500, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } },
          );
        }

        const supabase = createClient(supabaseUrl, serviceKey, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        const { data, error } = await supabase
          .from("document_templates")
          .select("id,code,title,audience,category,description,owner_label,status,requires_school_approval,updated_at,document_template_versions(version,body_md,change_note,approved_at,created_at)")
          .order("audience", { ascending: true })
          .order("title", { ascending: true });

        if (error) {
          return new Response(JSON.stringify({ ok: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
          });
        }

        return new Response(JSON.stringify({ ok: true, documents: data ?? [] }), {
          status: 200,
          headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
        });
      },
    },
  },
});
