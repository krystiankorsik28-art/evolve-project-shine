import process from "node:process";

type EmailTag = {
  name: string;
  value: string;
};

export type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string | string[];
  tags?: EmailTag[];
  idempotencyKey?: string;
};

export type SendEmailResult = {
  ok: boolean;
  id?: string;
  error?: string;
};

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

const RESEND_ENDPOINT = "https://api.resend.com/emails";
const EMAIL_TIMEOUT_MS = 12_000;

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => {
    const replacements: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#039;",
      '"': "&quot;",
    };
    return replacements[character] ?? character;
  });
}

function safeHttpUrl(value: string): string {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "https://edunex.pl";
    return escapeHtml(url.toString());
  } catch {
    return "https://edunex.pl";
  }
}

function normalizeRecipients(value: string | string[]): string[] {
  const recipients = Array.isArray(value) ? value : [value];
  return recipients
    .map((recipient) => recipient.trim().toLowerCase())
    .filter((recipient, index, list) => Boolean(recipient) && list.indexOf(recipient) === index);
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim() || "noreply@edunex.pl";
  const fromName = process.env.RESEND_FROM_NAME?.trim() || "EduNex";
  const replyTo = process.env.RESEND_REPLY_TO?.trim() || "support@edunex.pl";

  return {
    apiKey,
    from: `${fromName} <${fromEmail}>`,
    replyTo,
  };
}

function wrapHtml(options: {
  eyebrow: string;
  title: string;
  intro: string;
  content: string;
  footerNote?: string;
}): string {
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>${escapeHtml(options.title)}</title>
  </head>
  <body style="margin:0;background:#eef2f6;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#0f172a;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(options.intro)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#eef2f6;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid #dbe3ec;border-radius:18px;overflow:hidden;box-shadow:0 18px 55px rgba(15,23,42,.08);">
            <tr>
              <td style="padding:28px 32px;background:#071426;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <div style="font-size:20px;font-weight:800;letter-spacing:-.02em;color:#ffffff;">EduNex</div>
                      <div style="margin-top:3px;font-size:10px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:#93c5fd;">Secure Education Platform</div>
                    </td>
                    <td align="right">
                      <span style="display:inline-block;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:7px 11px;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#dbeafe;">${escapeHtml(options.eyebrow)}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:34px 32px 30px;">
                <h1 style="margin:0;font-size:27px;line-height:1.2;letter-spacing:-.035em;color:#0f172a;">${escapeHtml(options.title)}</h1>
                <p style="margin:13px 0 0;font-size:15px;line-height:1.7;color:#475569;">${escapeHtml(options.intro)}</p>
                <div style="margin-top:26px;">${options.content}</div>
                <div style="margin-top:30px;padding-top:22px;border-top:1px solid #e2e8f0;">
                  <p style="margin:0;font-size:12px;line-height:1.6;color:#64748b;">${escapeHtml(options.footerNote || "Ta wiadomość została wysłana automatycznie przez bezpieczną infrastrukturę EduNex.")}</p>
                </div>
              </td>
            </tr>
          </table>
          <div style="max-width:620px;padding:18px 18px 0;text-align:center;font-size:11px;line-height:1.6;color:#64748b;">
            EduNex · Platforma edukacyjna i egzaminacyjna<br />© ${year} EduNex. Wiadomość systemowa.
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function otpEmailHtml(code: string): string {
  const safeCode = escapeHtml(code.replace(/\D/g, "").slice(0, 6));
  return wrapHtml({
    eyebrow: "Kod dostępu",
    title: "Potwierdź logowanie do EduNex",
    intro: "Użyj jednorazowego kodu, aby dokończyć weryfikację konta administracyjnego.",
    content: `
      <div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:14px;padding:23px;text-align:center;">
        <div style="font-size:11px;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:#1d4ed8;">Kod ważny przez 10 minut</div>
        <div style="margin-top:10px;font-family:'Courier New',monospace;font-size:34px;line-height:1;font-weight:800;letter-spacing:10px;color:#0f172a;">${safeCode}</div>
      </div>
      <p style="margin:18px 0 0;font-size:13px;line-height:1.7;color:#64748b;">Nie udostępniaj kodu innym osobom. Pracownik EduNex nigdy nie poprosi o jego podanie.</p>
    `,
    footerNote: "Jeżeli nie próbowałeś się zalogować, zignoruj wiadomość i sprawdź aktywne sesje swojego konta.",
  });
}

export function passwordResetEmailHtml(resetUrl: string): string {
  const safeUrl = safeHttpUrl(resetUrl);
  return wrapHtml({
    eyebrow: "Bezpieczeństwo konta",
    title: "Ustaw nowe hasło",
    intro: "Otrzymaliśmy żądanie zmiany hasła do Twojego konta EduNex.",
    content: `
      <div style="text-align:center;">
        <a href="${safeUrl}" style="display:inline-block;border-radius:9px;background:#0067b8;padding:14px 24px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Przejdź do zmiany hasła</a>
      </div>
      <p style="margin:20px 0 0;font-size:13px;line-height:1.7;color:#64748b;word-break:break-word;">Przycisk nie działa? Skopiuj adres do przeglądarki:<br /><a href="${safeUrl}" style="color:#0067b8;">${safeUrl}</a></p>
    `,
    footerNote: "Jeśli nie prosiłeś o zmianę hasła, nie otwieraj odnośnika. Twoje dotychczasowe hasło pozostaje aktywne.",
  });
}

export function examResultEmailHtml(
  studentName: string,
  examTitle: string,
  score: number,
  maxScore: number,
  percent: number,
  passed: boolean,
  certificateUrl?: string,
): string {
  const safeStudentName = escapeHtml(studentName);
  const safeExamTitle = escapeHtml(examTitle);
  const safeScore = Number.isFinite(score) ? score : 0;
  const safeMaxScore = Number.isFinite(maxScore) ? maxScore : 0;
  const safePercent = Math.max(0, Math.min(100, Number.isFinite(percent) ? percent : 0));
  const certificateButton = certificateUrl
    ? `<div style="margin-top:22px;text-align:center;"><a href="${safeHttpUrl(certificateUrl)}" style="display:inline-block;border-radius:9px;background:#0067b8;padding:13px 22px;font-size:14px;font-weight:700;color:#ffffff;text-decoration:none;">Pobierz certyfikat</a></div>`
    : "";

  return wrapHtml({
    eyebrow: passed ? "Egzamin zaliczony" : "Wynik egzaminu",
    title: "Twój wynik jest gotowy",
    intro: `Zakończono ocenianie egzaminu „${examTitle}”.`,
    content: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dbe3ec;border-radius:14px;background:#f8fafc;">
        <tr><td style="padding:21px 22px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Uczeń</td><td align="right" style="padding:21px 22px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;color:#0f172a;">${safeStudentName}</td></tr>
        <tr><td style="padding:21px 22px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#64748b;">Egzamin</td><td align="right" style="padding:21px 22px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;color:#0f172a;">${safeExamTitle}</td></tr>
        <tr><td style="padding:21px 22px;font-size:13px;color:#64748b;">Wynik</td><td align="right" style="padding:21px 22px;font-size:22px;font-weight:800;color:${passed ? "#047857" : "#b91c1c"};">${safePercent}% <span style="font-size:12px;font-weight:600;color:#64748b;">(${safeScore}/${safeMaxScore})</span></td></tr>
      </table>
      ${certificateButton}
    `,
  });
}

export function loginAlertEmailHtml(details: {
  occurredAt: string;
  ipAddress?: string;
  device?: string;
  location?: string;
}): string {
  const occurredAt = escapeHtml(details.occurredAt);
  const ipAddress = escapeHtml(details.ipAddress || "Nieustalony");
  const device = escapeHtml(details.device || "Nieustalone urządzenie");
  const location = escapeHtml(details.location || "Nieustalona");

  return wrapHtml({
    eyebrow: "Alert bezpieczeństwa",
    title: "Nowe logowanie do konta",
    intro: "Odnotowaliśmy nowe poprawne logowanie do Twojego konta EduNex.",
    content: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dbe3ec;border-radius:14px;background:#f8fafc;">
        <tr><td style="padding:16px 19px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Data i czas</td><td align="right" style="padding:16px 19px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f172a;">${occurredAt}</td></tr>
        <tr><td style="padding:16px 19px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Urządzenie</td><td align="right" style="padding:16px 19px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f172a;">${device}</td></tr>
        <tr><td style="padding:16px 19px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Adres IP</td><td align="right" style="padding:16px 19px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f172a;">${ipAddress}</td></tr>
        <tr><td style="padding:16px 19px;font-size:12px;color:#64748b;">Lokalizacja</td><td align="right" style="padding:16px 19px;font-size:13px;font-weight:700;color:#0f172a;">${location}</td></tr>
      </table>
    `,
    footerNote: "Jeżeli to nie byłeś Ty, natychmiast zmień hasło i zakończ pozostałe sesje konta.",
  });
}

export function contactMessageEmailHtml(data: {
  name: string;
  email: string;
  topic: string;
  message: string;
}): string {
  return wrapHtml({
    eyebrow: "Formularz kontaktowy",
    title: "Nowa wiadomość z edunex.pl",
    intro: `Wiadomość została wysłana przez ${data.name}.`,
    content: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #dbe3ec;border-radius:14px;background:#f8fafc;">
        <tr><td style="padding:15px 18px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">Nadawca</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f172a;">${escapeHtml(data.name)}</td></tr>
        <tr><td style="padding:15px 18px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#64748b;">E-mail</td><td align="right" style="padding:15px 18px;border-bottom:1px solid #e2e8f0;font-size:13px;font-weight:700;color:#0f172a;">${escapeHtml(data.email)}</td></tr>
        <tr><td style="padding:15px 18px;font-size:12px;color:#64748b;">Temat</td><td align="right" style="padding:15px 18px;font-size:13px;font-weight:700;color:#0f172a;">${escapeHtml(data.topic)}</td></tr>
      </table>
      <div style="margin-top:18px;border:1px solid #dbe3ec;border-radius:14px;background:#ffffff;padding:19px;font-size:14px;line-height:1.75;color:#334155;white-space:pre-wrap;">${escapeHtml(data.message)}</div>
    `,
  });
}

export async function sendEmail(payload: EmailPayload): Promise<SendEmailResult> {
  const config = getEmailConfig();
  const recipients = normalizeRecipients(payload.to);

  if (!config.apiKey) {
    console.error("[EMAIL] RESEND_API_KEY is not configured");
    return { ok: false, error: "Usługa e-mail nie jest jeszcze skonfigurowana." };
  }

  if (recipients.length === 0) {
    return { ok: false, error: "Nie podano prawidłowego odbiorcy wiadomości." };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), EMAIL_TIMEOUT_MS);

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
    };
    if (payload.idempotencyKey) headers["Idempotency-Key"] = payload.idempotencyKey;

    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      signal: controller.signal,
      body: JSON.stringify({
        from: payload.from || config.from,
        to: recipients,
        subject: payload.subject,
        html: payload.html,
        ...(payload.text ? { text: payload.text } : {}),
        reply_to: payload.replyTo || config.replyTo,
        ...(payload.tags?.length ? { tags: payload.tags } : {}),
      }),
    });

    const result = (await response.json().catch(() => ({}))) as ResendResponse;
    if (!response.ok) {
      const reason = result.message || result.name || `Resend API zwróciło HTTP ${response.status}`;
      console.error("[EMAIL] Resend request failed", { status: response.status, reason });
      return { ok: false, error: reason };
    }

    return { ok: true, id: result.id };
  } catch (error) {
    const reason = error instanceof Error && error.name === "AbortError"
      ? "Przekroczono czas wysyłania wiadomości."
      : error instanceof Error
        ? error.message
        : "Nieznany błąd wysyłania wiadomości.";
    console.error("[EMAIL] Delivery failed", { reason });
    return { ok: false, error: reason };
  } finally {
    clearTimeout(timeout);
  }
}
