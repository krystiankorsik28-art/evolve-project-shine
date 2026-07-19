# EduNex — Resend + Supabase Auth

Ten dokument opisuje produkcyjną konfigurację e-mail dla `edunex.pl`.

## Zakres

- wiadomości uwierzytelniające Supabase Auth: potwierdzenie konta, reset hasła, zaproszenia, zmiana adresu i reautoryzacja,
- wiadomości aplikacyjne EduNex wysyłane bezpośrednio przez Resend API,
- markowe adresy nadawców bez tworzenia osobnych skrzynek pocztowych dla każdego adresu.

## Proponowane adresy nadawców

| Zastosowanie | Nadawca |
| --- | --- |
| Supabase Auth | `EduNex Identity <identity@edunex.pl>` |
| Kody bezpieczeństwa | `EduNex Security <security@edunex.pl>` |
| Wyniki egzaminów | `EduNex Wyniki <wyniki@edunex.pl>` |
| Powiadomienia systemowe | `EduNex <noreply@edunex.pl>` |

Po zweryfikowaniu domeny w Resend można wysyłać z dowolnego adresu w `@edunex.pl`. Skrzynka musi istnieć tylko wtedy, gdy ma odbierać odpowiedzi. `RESEND_REPLY_TO` ustaw wyłącznie na działającą skrzynkę lub alias.

## 1. Resend

1. Dodaj domenę `edunex.pl` w Resend.
2. Skopiuj dokładne rekordy DNS wygenerowane dla domeny. Nie zgaduj wartości DKIM, SPF ani MX.
3. Dodaj rekordy w panelu DNS nazwa.pl bez usuwania obecnych rekordów poczty, Vercela ani strony.
4. Po statusie `Verified` utwórz klucz API przeznaczony wyłącznie dla EduNex.

## 2. Zmienne środowiskowe Vercel

Ustaw dla `Production`, `Preview` i `Development`:

```text
RESEND_API_KEY=<sekretny klucz Resend>
RESEND_FROM_EMAIL=noreply@edunex.pl
RESEND_FROM_NAME=EduNex
RESEND_REPLY_TO=<istniejąca skrzynka lub pozostaw nieustawione>
```

Klucza `RESEND_API_KEY` nie wolno dodawać z prefiksem `VITE_`, umieszczać w kodzie ani commitować do repozytorium.

## 3. Supabase Custom SMTP

Projekt: `EduNex.pl` (`mrkgwbcqbcjwuwcbhizy`).

W `Authentication → Email → SMTP Settings` ustaw:

```text
Enable Custom SMTP: włączone
Sender email: identity@edunex.pl
Sender name: EduNex Identity
Host: smtp.resend.com
Port: 587
Username: resend
Password: ten sam klucz API Resend
```

Port `587` korzysta z STARTTLS. Alternatywnie można użyć portu `465` z połączeniem TLS od początku.

Po zapisaniu:

- pozostaw potwierdzanie adresów e-mail włączone,
- włącz powiadomienia bezpieczeństwa o zmianie hasła i adresu,
- ustaw rozsądne limity wysyłania,
- włącz CAPTCHA dla publicznej rejestracji i odzyskiwania konta.

## 4. Szablony Supabase Auth

Hosted Supabase wymaga wklejenia szablonów w `Authentication → Email Templates`. Do linków używaj `{{ .ConfirmationURL }}`, a do kodów jednorazowych `{{ .Token }}`.

Minimalne tematy:

```text
Confirm signup: Potwierdź konto EduNex
Invite user: Zaproszenie do EduNex
Magic link: Bezpieczne logowanie do EduNex
Change email: Potwierdź nowy adres e-mail
Reset password: Zmień hasło do EduNex
Reauthentication: {{ .Token }} — kod bezpieczeństwa EduNex
```

## 5. Test produkcyjny

Wykonaj kolejno:

1. reset hasła na prywatny adres Gmail/Outlook,
2. potwierdzenie nowego konta,
3. kod OTP administratora,
4. sprawdzenie nagłówków SPF, DKIM i DMARC,
5. sprawdzenie folderu spam,
6. test linku powrotnego do `https://edunex.pl/auth/reset-password`.

Wiadomość uznaj za poprawnie wdrożoną dopiero wtedy, gdy Resend pokazuje status dostarczenia, Supabase Auth nie zgłasza błędu SMTP, a link kończy pełny proces na produkcyjnej domenie.
