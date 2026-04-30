import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface Body {
  first_name?: string;
  last_name?: string;
  pin?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: Body = await req.json().catch(() => ({}));
    const first_name = (body.first_name ?? "").trim();
    const last_name = (body.last_name ?? "").trim();
    const pin = (body.pin ?? "").trim();

    if (first_name.length < 2 || last_name.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "Imię i nazwisko muszą mieć co najmniej 2 znaki" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (!/^[0-9]{6}$/.test(pin)) {
      return new Response(
        JSON.stringify({ success: false, error: "PIN musi składać się z dokładnie 6 cyfr" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Znajdź aktywny PIN
    const { data: pinRow, error: pinErr } = await supabase
      .from("exam_pins")
      .select("id, exam_id, active, max_uses, used_count, expires_at")
      .eq("pin_code", pin)
      .eq("active", true)
      .maybeSingle();

    if (pinErr) throw pinErr;
    if (!pinRow) {
      return new Response(
        JSON.stringify({ success: false, error: "Nieprawidłowy lub nieaktywny PIN" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (pinRow.expires_at && new Date(pinRow.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: "PIN wygasł" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (pinRow.max_uses != null && pinRow.used_count >= pinRow.max_uses) {
      return new Response(
        JSON.stringify({ success: false, error: "PIN został już w pełni wykorzystany" }),
        { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Sprawdź, że egzamin jest opublikowany
    const { data: exam, error: examErr } = await supabase
      .from("exams")
      .select("id, status")
      .eq("id", pinRow.exam_id)
      .maybeSingle();

    if (examErr) throw examErr;
    if (!exam || exam.status !== "published") {
      return new Response(
        JSON.stringify({ success: false, error: "Egzamin nie jest dostępny" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const student_name = `${first_name} ${last_name}`;

    // Utwórz attempt
    const { data: attempt, error: attErr } = await supabase
      .from("attempts")
      .insert({
        exam_id: pinRow.exam_id,
        pin_id: pinRow.id,
        student_name,
        status: "in_progress",
      })
      .select("id, exam_id")
      .single();

    if (attErr) throw attErr;

    // Zwiększ used_count
    await supabase
      .from("exam_pins")
      .update({ used_count: pinRow.used_count + 1 })
      .eq("id", pinRow.id);

    return new Response(
      JSON.stringify({
        success: true,
        attempt_id: attempt.id,
        exam_id: attempt.exam_id,
        student_name,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Błąd serwera";
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
