# EduNex — szablony wiadomości Supabase Auth

Poniższe szablony są przeznaczone do wklejenia w `Supabase → Authentication → Email Templates`.

## Wspólny styl

Każdy szablon jest transakcyjny, ma jeden główny cel i nie zawiera treści marketingowych.

---

## Confirm signup

**Temat:** `Potwierdź konto EduNex`

```html
<!doctype html><html lang="pl"><body style="margin:0;background:#eef2f6;font-family:Arial,sans-serif;color:#0f172a"><table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #dbe3ec;border-radius:16px;overflow:hidden"><tr><td style="padding:26px 30px;background:#071426;color:#fff"><strong style="font-size:20px">EduNex</strong><div style="margin-top:4px;font-size:10px;letter-spacing:.14em;color:#93c5fd">IDENTITY</div></td></tr><tr><td style="padding:32px 30px"><h1 style="margin:0;font-size:26px">Potwierdź adres e-mail</h1><p style="font-size:15px;line-height:1.7;color:#475569">Kliknij poniższy przycisk, aby potwierdzić konto przypisane do adresu {{ .Email }}.</p><p style="margin:26px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#0067b8;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:8px">Potwierdź konto</a></p><p style="font-size:12px;line-height:1.6;color:#64748b">Jeżeli nie zakładałeś konta EduNex, zignoruj tę wiadomość.</p></td></tr></table></td></tr></table></body></html>
```

---

## Reset password

**Temat:** `Zmień hasło do EduNex`

```html
<!doctype html><html lang="pl"><body style="margin:0;background:#eef2f6;font-family:Arial,sans-serif;color:#0f172a"><table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #dbe3ec;border-radius:16px;overflow:hidden"><tr><td style="padding:26px 30px;background:#071426;color:#fff"><strong style="font-size:20px">EduNex</strong><div style="margin-top:4px;font-size:10px;letter-spacing:.14em;color:#93c5fd">BEZPIECZEŃSTWO KONTA</div></td></tr><tr><td style="padding:32px 30px"><h1 style="margin:0;font-size:26px">Ustaw nowe hasło</h1><p style="font-size:15px;line-height:1.7;color:#475569">Otrzymaliśmy żądanie zmiany hasła do konta {{ .Email }}.</p><p style="margin:26px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#0067b8;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:8px">Przejdź do zmiany hasła</a></p><p style="font-size:12px;line-height:1.6;color:#64748b">Jeżeli nie prosiłeś o zmianę hasła, nie otwieraj odnośnika i zignoruj wiadomość.</p></td></tr></table></td></tr></table></body></html>
```

---

## Invite user

**Temat:** `Zaproszenie do EduNex`

```html
<!doctype html><html lang="pl"><body style="margin:0;background:#eef2f6;font-family:Arial,sans-serif;color:#0f172a"><table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #dbe3ec;border-radius:16px;overflow:hidden"><tr><td style="padding:26px 30px;background:#071426;color:#fff"><strong style="font-size:20px">EduNex</strong><div style="margin-top:4px;font-size:10px;letter-spacing:.14em;color:#93c5fd">ZAPROSZENIE</div></td></tr><tr><td style="padding:32px 30px"><h1 style="margin:0;font-size:26px">Otrzymałeś zaproszenie</h1><p style="font-size:15px;line-height:1.7;color:#475569">Administrator placówki zaprosił adres {{ .Email }} do systemu EduNex.</p><p style="margin:26px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#0067b8;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:8px">Przyjmij zaproszenie</a></p><p style="font-size:12px;line-height:1.6;color:#64748b">Uprawnienia zostaną nadane zgodnie z rolą zatwierdzoną przez placówkę.</p></td></tr></table></td></tr></table></body></html>
```

---

## Magic link / OTP

**Temat:** `Bezpieczne logowanie do EduNex`

```html
<!doctype html><html lang="pl"><body style="margin:0;background:#eef2f6;font-family:Arial,sans-serif;color:#0f172a"><table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #dbe3ec;border-radius:16px;overflow:hidden"><tr><td style="padding:26px 30px;background:#071426;color:#fff"><strong style="font-size:20px">EduNex</strong><div style="margin-top:4px;font-size:10px;letter-spacing:.14em;color:#93c5fd">BEZPIECZNE LOGOWANIE</div></td></tr><tr><td style="padding:32px 30px"><h1 style="margin:0;font-size:26px">Dokończ logowanie</h1><p style="font-size:15px;line-height:1.7;color:#475569">Użyj przycisku lub jednorazowego kodu, aby zalogować się do konta {{ .Email }}.</p><p style="margin:26px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#0067b8;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:8px">Zaloguj się do EduNex</a></p><div style="border:1px solid #bfdbfe;background:#eff6ff;border-radius:12px;padding:20px;text-align:center"><div style="font-size:11px;color:#1d4ed8;font-weight:700">KOD JEDNORAZOWY</div><div style="margin-top:8px;font-family:monospace;font-size:30px;font-weight:800;letter-spacing:8px">{{ .Token }}</div></div><p style="font-size:12px;line-height:1.6;color:#64748b">Nie przekazuj kodu innym osobom.</p></td></tr></table></td></tr></table></body></html>
```

---

## Change email

**Temat:** `Potwierdź nowy adres e-mail EduNex`

```html
<!doctype html><html lang="pl"><body style="margin:0;background:#eef2f6;font-family:Arial,sans-serif;color:#0f172a"><table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #dbe3ec;border-radius:16px;overflow:hidden"><tr><td style="padding:26px 30px;background:#071426;color:#fff"><strong style="font-size:20px">EduNex</strong><div style="margin-top:4px;font-size:10px;letter-spacing:.14em;color:#93c5fd">ZMIANA ADRESU</div></td></tr><tr><td style="padding:32px 30px"><h1 style="margin:0;font-size:26px">Potwierdź nowy adres</h1><p style="font-size:15px;line-height:1.7;color:#475569">Potwierdź zmianę adresu konta na {{ .NewEmail }}.</p><p style="margin:26px 0"><a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#0067b8;color:#fff;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:8px">Potwierdź zmianę</a></p><p style="font-size:12px;line-height:1.6;color:#64748b">Jeżeli nie zlecałeś zmiany, zignoruj wiadomość i sprawdź bezpieczeństwo konta.</p></td></tr></table></td></tr></table></body></html>
```

---

## Reauthentication

**Temat:** `{{ .Token }} — kod bezpieczeństwa EduNex`

```html
<!doctype html><html lang="pl"><body style="margin:0;background:#eef2f6;font-family:Arial,sans-serif;color:#0f172a"><table width="100%" cellpadding="0" cellspacing="0" style="padding:28px 12px"><tr><td align="center"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#fff;border:1px solid #dbe3ec;border-radius:16px;overflow:hidden"><tr><td style="padding:26px 30px;background:#071426;color:#fff"><strong style="font-size:20px">EduNex</strong><div style="margin-top:4px;font-size:10px;letter-spacing:.14em;color:#93c5fd">POTWIERDZENIE TOŻSAMOŚCI</div></td></tr><tr><td style="padding:32px 30px"><h1 style="margin:0;font-size:26px">Kod bezpieczeństwa</h1><p style="font-size:15px;line-height:1.7;color:#475569">Wpisz poniższy kod, aby zatwierdzić chronioną operację.</p><div style="margin:26px 0;border:1px solid #bfdbfe;background:#eff6ff;border-radius:12px;padding:22px;text-align:center"><div style="font-family:monospace;font-size:32px;font-weight:800;letter-spacing:9px">{{ .Token }}</div></div><p style="font-size:12px;line-height:1.6;color:#64748b">Kod jest jednorazowy. Nie udostępniaj go innym osobom.</p></td></tr></table></td></tr></table></body></html>
```
