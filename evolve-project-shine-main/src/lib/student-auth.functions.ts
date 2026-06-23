import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const PinSchema = z.object({
  first_name: z.string().trim().min(2).max(50),
  last_name: z.string().trim().min(2).max(50),
  pin: z.string().trim().regex(/^[0-9]{6}$/),
});

export const studentPinLogin = createServerFn({ method: "POST" })
  .inputValidator((input) => PinSchema.parse(input))
  .handler(async ({ data, request }) => {
    const { first_name, last_name, pin } = data;

    const { data: pinRow, error: pinErr } = await supabaseAdmin
      .from("exam_pins")
      .select("id, exam_id, active, max_uses, used_count, expires_at")
      .eq("pin_code", pin)
      .eq("active", true)
      .maybeSingle();

    if (pinErr) throw new Error(pinErr.message);
    if (!pinRow) throw new Error("Nieprawidłowy lub nieaktywny PIN");
    if (pinRow.expires_at && new Date(pinRow.expires_at) < new Date()) {
      throw new Error("PIN wygasł");
    }
    if (pinRow.max_uses != null && pinRow.used_count >= pinRow.max_uses) {
      throw new Error("PIN został już w pełni wykorzystany");
    }

    const { data: exam, error: examErr } = await supabaseAdmin
      .from("exams")
      .select("id, status, title, duration_minutes")
      .eq("id", pinRow.exam_id)
      .maybeSingle();

    if (examErr) throw new Error(examErr.message);
    if (!exam || exam.status !== "published") {
      throw new Error("Egzamin nie jest jeszcze opublikowany");
    }

    const student_name = `${first_name} ${last_name}`;

    const { data: existingAttempt } = await supabaseAdmin
      .from("attempts")
      .select("id, status")
      .eq("student_name", student_name)
      .eq("exam_id", pinRow.exam_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingAttempt) {
      if (existingAttempt.status === "submitted") {
        throw new Error("Już ukończyłeś ten egzamin. Ponowne podejście wymaga zgody nauczyciela.");
      }

      const { data: approval } = await supabaseAdmin
        .from("proctoring_events")
        .select("id")
        .eq("attempt_id", existingAttempt.id)
        .eq("event_type", "reentry_approved")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!approval) {
        throw new Error("Masz już rozpoczęte podejście do tego egzaminu. Nauczyciel musi zatwierdzić ponowne wejście.");
      }

      await supabaseAdmin
        .from("proctoring_events")
        .delete()
        .eq("id", approval.id);

      return {
        attempt_id: existingAttempt.id,
        exam_id: pinRow.exam_id,
        student_name,
        exam_title: exam.title,
        duration_minutes: exam.duration_minutes,
      };
    }

    const clientIp = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";

    const { data: attempt, error: attErr } = await supabaseAdmin
      .from("attempts")
      .insert({
        exam_id: pinRow.exam_id,
        pin_id: pinRow.id,
        student_name,
        status: "in_progress",
      })
      .select("id, exam_id")
      .single();

    if (attErr) throw new Error(attErr.message);

    await supabaseAdmin
      .from("exam_pins")
      .update({ used_count: pinRow.used_count + 1 })
      .eq("id", pinRow.id);

    await supabaseAdmin
      .from("proctoring_events")
      .insert({
        attempt_id: attempt.id,
        event_type: "exam_created",
        metadata: { ip: clientIp, student_name, first_name, last_name } as never,
      });

    return {
      attempt_id: attempt.id,
      exam_id: attempt.exam_id,
      student_name,
      exam_title: exam.title,
      duration_minutes: exam.duration_minutes,
    };
  });

/** Nauczyciel zatwierdza ponowne wejście ucznia do egzaminu. */
export const approveReentry = createServerFn({ method: "POST" })
  .inputValidator((i) => z.object({ attempt_id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("proctoring_events")
      .insert({
        attempt_id: data.attempt_id,
        event_type: "reentry_approved",
        metadata: { approved_at: new Date().toISOString() } as never,
      });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Sprawdza czy podejście zostało już zakończone. */
export const checkAttemptStatus = createServerFn({ method: "GET" })
  .inputValidator((i) => z.object({ attempt_id: z.string().uuid() }).parse(i))
  .handler(async ({ data }) => {
    const { data: attempt } = await supabaseAdmin
      .from("attempts")
      .select("status, student_name")
      .eq("id", data.attempt_id)
      .maybeSingle();
    if (!attempt) throw new Error("Podejście nie istnieje");
    return attempt;
  });
