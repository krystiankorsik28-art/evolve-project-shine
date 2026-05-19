import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { attempt_id, responses } = await req.json();
    if (!attempt_id) {
      return new Response(JSON.stringify({ success: false, error: "Brak attempt_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const { data: attempt, error: attErr } = await admin
      .from("attempts").select("id, exam_id, status").eq("id", attempt_id).maybeSingle();
    if (attErr) throw attErr;
    if (!attempt) throw new Error("Podejście nie istnieje");
    if (attempt.status !== "in_progress") {
      return new Response(JSON.stringify({ success: true, already: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: questions, error: qErr } = await admin
      .from("questions").select("id, question_type, correct_answer, points")
      .eq("exam_id", attempt.exam_id);
    if (qErr) throw qErr;

    let totalScore = 0;
    let maxScore = 0;
    const answerRows: Array<Record<string, unknown>> = [];

    for (const q of questions ?? []) {
      const points = Number(q.points ?? 1);
      maxScore += points;
      const userAns = (responses ?? {})[q.id];
      let isCorrect: boolean | null = null;
      let awarded = 0;

      if (userAns !== undefined && userAns !== null) {
        const ca = q.correct_answer as unknown;
        try {
          if (q.question_type === "single_choice" || q.question_type === "true_false") {
            isCorrect = Number(userAns) === Number(ca);
          } else if (q.question_type === "multiple_choice") {
            const a = Array.isArray(userAns) ? [...userAns].sort() : [];
            const b = Array.isArray(ca) ? [...(ca as number[])].sort() : [];
            isCorrect = a.length === b.length && a.every((v, i) => v === b[i]);
          } else if (q.question_type === "short_answer") {
            const accepted = String(ca ?? "").split("|").map((s) => s.trim().toLowerCase());
            isCorrect = accepted.includes(String(userAns).trim().toLowerCase());
          }
          if (isCorrect === true) awarded = points;
        } catch { isCorrect = null; }
      }
      totalScore += awarded;

      answerRows.push({
        attempt_id, question_id: q.id, response: userAns ?? null,
        is_correct: isCorrect, points_awarded: awarded, graded_by_ai: false,
      });
    }

    if (answerRows.length > 0) {
      const { error: insErr } = await admin.from("answers").insert(answerRows);
      if (insErr) throw insErr;
    }

    const percent = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 0;
    const { data: exam } = await admin.from("exams").select("passing_score").eq("id", attempt.exam_id).maybeSingle();
    const passed = percent >= Number(exam?.passing_score ?? 50);

    const { error: updErr } = await admin.from("attempts").update({
      status: "submitted", submitted_at: new Date().toISOString(), graded_at: new Date().toISOString(),
      score: totalScore, max_score: maxScore, percent, passed,
    }).eq("id", attempt_id);
    if (updErr) throw updErr;

    return new Response(JSON.stringify({ success: true, score: totalScore, max_score: maxScore, percent, passed }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Błąd serwera";
    console.error("submit-attempt error", msg);
    return new Response(JSON.stringify({ success: false, error: msg }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
