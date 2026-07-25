import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { sendEmail } from "@/lib/email";

const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email().max(200),
  topic: z.enum([
    "Wdrożenie w szkole",
    "Egzaminy i sesje PIN",
    "NexDziennik",
    "NexAI",
    "Oferta dla instytucji",
    "Bezpieczeństwo i integracje",
  ]),
  message: z.string().min(5).max(4000),
  website: z.string().max(200).optional(),
});

const contactRateLimit = new Map<string, { count: number; resetAt: number }>();

function enforceRateLimit(email: string) {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const current = contactRateLimit.get(key);
  if (!current || now > current.resetAt) {
    contactRateLimit.set(key, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return;
  }
  if (current.count >= 3)
    throw new Error("Zbyt wiele wiadomości. Spróbuj ponownie za kilka minut.");
  current.count += 1;
}

function escapeHtml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[character] ??
      character,
  );
}

export const submitContact = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Schema.parse(d))
  .handler(async ({ data }) => {
    if (data.website) return { ok: true, stored: false, emailed: false };
    enforceRateLimit(data.email);
    let stored = false;
    try {
      const client = supabaseAdmin as unknown as {
        from: (t: string) => {
          insert: (row: Record<string, unknown>) => Promise<{ error: { message?: string } | null }>;
        };
      };
      const { error } = await client.from("contact_messages").insert({
        name: data.name,
        email: data.email,
        topic: data.topic,
        message: data.message,
      });
      if (error) throw new Error(error.message || "Nie udało się zapisać zgłoszenia.");
      stored = true;
    } catch (e) {
      console.error("[CONTACT] Database insert failed:", (e as Error).message);
    }

    const safe = {
      name: escapeHtml(data.name),
      email: escapeHtml(data.email),
      topic: escapeHtml(data.topic),
      message: escapeHtml(data.message).replace(/\n/g, "<br />"),
    };
    const emailConfigured = Boolean(process.env.RESEND_API_KEY);
    const email = emailConfigured
      ? await sendEmail({
          to: "kontakt@edunex.pl",
          subject: `Nowe zgłoszenie EduNex: ${data.topic}`,
          html: `<div style="font-family:Segoe UI,Arial,sans-serif;color:#0f172a"><h1>Nowe zgłoszenie ze strony EduNex</h1><p><strong>Osoba:</strong> ${safe.name}</p><p><strong>E-mail:</strong> ${safe.email}</p><p><strong>Temat:</strong> ${safe.topic}</p><hr /><p>${safe.message}</p></div>`,
        })
      : { ok: false, error: "RESEND_API_KEY is not configured" };

    if (!stored && !email.ok) throw new Error("Nie udało się przyjąć wiadomości.");
    return { ok: true, stored, emailed: emailConfigured && email.ok };
  });
