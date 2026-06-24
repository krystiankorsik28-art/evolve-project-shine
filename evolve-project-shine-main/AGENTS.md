# EduNex.pl — Polish Education Platform

## Project Overview
Polish-language teacher/student/admin platform with Gemini AI, Vercel hosting, Supabase auth, dark UI, exam creation, AI tutoring, certificate system, email OTP, and crypto/card payment integration via NexaPay.

**Domain:** edunex.pl (via nazwa.pl)
**GitHub:** https://github.com/krystiankorsik28-art/evolve-project
**Vercel:** Connected to GitHub (auto-deploy on push to main)

## Tech Stack
- **Framework:** TanStack Start (React + Vite)
- **Build:** Bun (configured in vercel.json: `bun run build`)
- **Auth:** Supabase (project: `mrkgwbcqbcjwuwcbhizy`)
- **AI:** Gemini 1.5 Flash (`gemini-1.5-flash` model, supports images)
- **Email:** Resend (via fetch API, no SDK)
- **Payments:** NexaPay (DirectCryptoPay widget from CDN)
- **PDF:** jspdf
- **QR:** qrserver.com (external API)
- **DNS:** nazwa.pl

## Environment Variables (in `.env` locally, Vercel for production)
```
VITE_SUPABASE_PROJECT_ID="mrkgwbcqbcjwuwcbhizy"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ya2d3YmNxYmNqd3V3Y2JoaXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5MjU5NzQsImV4cCI6MjA5MjUwMTk3NH0.4WTLZIF0YBiDslpXULuuoFD5jVw1a7XmZ-dOMvQHzqg"
VITE_SUPABASE_URL="https://mrkgwbcqbcjwuwcbhizy.supabase.co"
RESEND_API_KEY="re_GR4dCMHG_9uenunBS98WJknFMNWpAFtnu"
```
**GEMINI_API_KEY must be set manually in Vercel dashboard** (not in .env).

## DNS Configuration (nazwa.pl) — ALL VERIFIED ✅
| Type | Name | Value | Status |
|------|------|-------|--------|
| TXT | `send` | `v=spf1 include:amazonses.com ~all` | ✅ |
| TXT | `_dmarc` | `v=DMARC1; p=none;` | ✅ |
| TXT | `resend._domainkey` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDP9GotxK1R/K0+SPD1i1UWPVMqEkpYCNjNbdD74MFCEA+KMsecoLassf4LlqDmvDz0hFROqB0JzwHLsHJALuIW9RB+7ktXE6tD6vSR3S+kHMMWjl0t8IccwMwU+l5Q/Nsv4B4nwuWAws2c0oc/NR7FLGgAF7oUODzZTJQ3xo1m/wIDAQAB` | ✅ |
| MX | `send` | `10 feedback-smtp.eu-west-1.amazonses.com` | ✅ |

- MX was tricky in nazwa.pl — final format that worked: **Nazwa: `send.edunex.pl`, Typ: MX, Wartość: `10 feedback-smtp.eu-west-1.amazonses.com`** (without trailing dot)
- Resend domain verification: **PASSED ✅**

## Proxy Server (nazwa.pl CloudHosting Pro)
- **Location:** `proxy-server/` — standalone Node.js proxy (package.json + server.js)
- **Port:** 3000 (configurable via `PORT` env)
- **Deploy:** Upload via FTP to nazwa.pl, configure subdomain `proxy.edunex.pl` with Node.js interpreter
- **Endpoint:** `GET /?url=https://target.com/page` — strips X-Frame-Options/CSP, returns HTML
- **Health:** `GET /health` returns `{"status":"ok"}`
- **Guide:** `proxy-deploy.md` — step-by-step deployment instructions
- **Configurable URL:** In EDziennik.tsx, click gear icon to set custom proxy server URL (saved to localStorage)

## Key Files
- `src/lib/email.ts` — Email templates + Resend fetch integration (falls back to console log)
- `src/lib/admin.functions.ts` — Admin OTP (send/verify), in-memory Map store (10min TTL)
- `src/components/NexaPayCheckout.tsx` — DCP widget (`integrationId: "int_kqqi2y8cfym5"`)
- `src/lib/certificate.ts` — Certificate serial (`EDX-XXXXXX-XXXXXX`), QR, PDF
- `src/routes/auth.admin.tsx` — 3-step admin OTP flow
- `src/routes/auth.student.tsx` — 3-tab student auth (login/register/PIN)
- `src/routes/student.dashboard.tsx` — Student dashboard
- `src/routes/student.exam.$attemptId.tsx` — Exam runner with Welcome/Review/Results
- `src/routes/_authenticated.teacher.tsx` — Teacher panel (Monitoring, Egzaminy, Certyfikaty)
- `src/routes/index.tsx` — Landing page with 7 pricing plans
- `vercel.json` — Bun build config
- `opencode.json` — OpenCode config with Playwright MCP

## Pricing Plans
1. **Klasa** — 0 zł (free)
2. **Korepetytor** — 49 zł
3. **Nauczyciel** — 99 zł
4. **Szkoła** — 490 zł
5. **Szkoła Plus ⭐** — 890 zł
6. **Dzielnica** — 2990 zł
7. **Kuratorium** — indywidualnie (kontakt)

Paid plans use NexaPayCheckout (DCP widget), free plan redirects to `/auth/teacher`, Kuratorium scrolls to kontakt section.

## Important Notes
- `.env` is now in `.gitignore` — **DO NOT commit secrets**
- Email sender: `EduNex <noreply@edunex.pl>` via Resend
- Admin OTP is in-memory (lost on server restart) — demo only
- Certificates: serial `EDX-{attemptIdHash}-{scoreHash}` (deterministic, verifiable without DB)
- `category` column in `exams` table: `NULL` = egzamin, `"sprawdzian"` = sprawdzian
- All AI calls use `gemini-3.5-flash`
- NexaPay: `integrationId: "int_kqqi2y8cfym5"`, widget from `https://api.directcryptopay.com/widget/dcp-widget.umd.js`

## Playwright MCP (Configured)
- Installed: `@playwright/mcp` (dev dependency)
- Browser: Chromium (installed via `npx playwright install chromium`)
- Config: `opencode.json` — restart OpenCode to activate
- After restart, I can control browser (click, navigate, screenshot, etc.)

## computer-control MCP (Custom System)
A full AI computer control system with modular architecture:
- **Browser Layer**: Playwright-based (Chromium, Chrome, Opera GX, Edge) — navigate, click, type, scroll, screenshot, evaluate JS
- **Fallback Layer**: PyAutoGUI-based — mouse/keyboard control, desktop screenshots, cursor position, scroll
- **MCP Server**: Custom Node.js server implementing MCP protocol over stdio
- **Location**: `computer-control/` directory
- **Setup**: `cd computer-control && node scripts/setup.js` (or run `scripts/setup.ps1` / `scripts/setup.bat`)
- **Python deps**: `pip install pyautogui pillow`
- **Activated**: via `opencode.json` mcp.computer-control

## Next Steps After Restart
1. Verify Vercel deployment is live
2. Test OTP email flow via Resend
3. Test NexaPay payment widget
4. Test AI Tutor functionality
5. Configure and test computer-control system
6. Consider upgrading to Stripe for native PLN support
7. Consider moving DNS to Cloudflare for easier management

## User Info
- Owner: Krystian Korsik
- GitHub: krystiankorsik28-art
- Domain registered at nazwa.pl
- Resend API key active, domain verified
- Very friendly and trusting — likes to experiment with new tools
- Wants maximum integration between AI assistant and his PC
- Recently configured Playwright MCP + computer-control MCP for full browser + desktop automation
