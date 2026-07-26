import { randomUUID } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { sendEmail, otpEmailHtml } from "@/lib/email.server";

// In-memory OTP store is isolated per server instance. Replace with a durable,
// single-use store before enabling multi-region production verification.
const otpStore = new Map<string, { code: string; expires: number; email: string }>();

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/** Generuje i wysyła 6-cyfrowy kod OTP na e-mail administratora. */
export const sendAdminOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: user } = await context.supabase.auth.getUser();
    const email = user.user?.email;
    if (!email) throw new Error("Nie znaleziono adresu e-mail");

    const code = generateCode();
    const key = sanitizeEmail(email);
    const expires = Date.now() + 10 * 60 * 1000;

    const delivery = await sendEmail({
      to: email,
      subject: "Kod weryfikacyjny EduNex",
      html: otpEmailHtml(code),
      text: `Kod weryfikacyjny EduNex: ${code}. Kod jest ważny przez 10 minut.`,
      tags: [
        { name: "category", value: "admin-otp" },
        { name: "system", value: "identity" },
      ],
      idempotencyKey: `admin-otp/${user.user?.id || key}/${randomUUID()}`,
    });

    if (!delivery.ok) {
      throw new Error(delivery.error || "Nie udało się wysłać kodu weryfikacyjnego.");
    }

    // Store the code only after the provider accepted the message. Never log OTP values.
    otpStore.set(key, { code, expires, email });
    return { ok: true };
  });

/** Weryfikuje 6-cyfrowy kod OTP. */
export const verifyAdminOtp = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().regex(/^\d{6}$/) }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: user } = await context.supabase.auth.getUser();
    const email = user.user?.email;
    if (!email) throw new Error("Nie znaleziono adresu e-mail");

    const key = sanitizeEmail(email);
    const stored = otpStore.get(key);
    if (!stored) throw new Error("Nie wygenerowano kodu. Zażądaj nowego.");
    if (Date.now() > stored.expires) {
      otpStore.delete(key);
      throw new Error("Kod wygasł. Zażądaj nowego.");
    }
    if (stored.code !== data.code) throw new Error("Nieprawidłowy kod");

    otpStore.delete(key);
    return { ok: true };
  });

/** Legacy: statyczny kod dostępu z env (wsparcie wsteczne). */
export const verifyAdminAccessCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ code: z.string().regex(/^\d{6}$/) }).parse(input))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_ACCESS_CODE;
    if (!expected || !/^\d{6}$/.test(expected)) {
      throw new Error("Starszy kod dostępu administratora nie jest skonfigurowany.");
    }

    const a = data.code;
    if (a.length !== expected.length) throw new Error("Nieprawidłowy kod dostępu");
    let diff = 0;
    for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ expected.charCodeAt(i);
    if (diff !== 0) throw new Error("Nieprawidłowy kod dostępu");
    return { ok: true };
  });
