const AUTH_REDIRECT_PATHS = new Set(["/auth/callback", "/auth/reset-password"]);

export function authRedirectUrl(path: string) {
  const safePath = AUTH_REDIRECT_PATHS.has(path) ? path : "/auth/callback";
  return new URL(safePath, window.location.origin).toString();
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function publicSignInError() {
  return "Nie udało się potwierdzić danych logowania. Sprawdź dane lub skorzystaj z odzyskiwania dostępu.";
}

export function ssoDomainFrom(value: string) {
  const normalized = value.trim().toLowerCase();
  const domain = normalized.includes("@") ? normalized.split("@").pop() || "" : normalized;
  return /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(domain)
    ? domain
    : "";
}
