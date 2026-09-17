<div align="center">

<img src="public/Monzo-Emblem-Light.png" alt="Monzo" width="64" />

# 1p Challenge Calculator

*Monzo-inspired savings calculator*

[![CI](https://github.com/Hum2a/monzo-1p-challenge-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/Hum2a/monzo-1p-challenge-calculator/actions/workflows/ci.yml)
[![Deploy](https://github.com/Hum2a/monzo-1p-challenge-calculator/actions/workflows/deploy-cloudflare.yml/badge.svg)](https://github.com/Hum2a/monzo-1p-challenge-calculator/actions/workflows/deploy-cloudflare.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![Cloudflare](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)](https://workers.cloudflare.com/)

A production-ready web app for the **1p Accumulator / Penny Challenge** savings plan. Calculate deposits for any date range, month, or custom period—with Monzo branding, mobile-first design, and optional account saving.

*[Report Bug](../../issues) · [Request Feature](../../issues) · [Contributing](CONTRIBUTING.md)*

</div>

---

## Features

- **3 modes:** Next N days, Month, Custom range  
- **Anonymous:** Use immediately with localStorage  
- **Account:** Sign in via magic link to save states to DB  
- **Save/Load:** Up to 10 saved states per user  
- **PWA:** Installable on mobile  

## Quick Start

```bash
npm install
cp .env.example .env.local
cp .dev.vars.example .dev.vars
# Edit .env.local and .dev.vars with your values
npm run db:generate
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Local Cloudflare preview

To run the app in the Cloudflare Workers runtime locally (closer to production):

```bash
npm run preview
```

Uses `.dev.vars` for secrets (copy from `.dev.vars.example`).

## Production Stack

| Layer | Tech |
|-------|------|
| Hosting | **Cloudflare Workers** (OpenNext adapter) |
| Database | **Neon PostgreSQL** (auth + saved states) |
| Auth | **Auth.js (NextAuth v5)** – magic link (Resend) |
| ORM | **Prisma** |
| Validation | **Zod** |
| UI | **Tailwind + shadcn** with Motion, Animate UI / Magic UI / React Bits–style accents |

Copy-first motion components live under `src/components/animate-ui`, `magicui`, and `react-bits` (keeps the Worker bundle small vs bulk UI kits).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes (prod) | `openssl rand -base64 32` |
| `AUTH_URL` | Yes (prod) | `https://monzo-1p-challenge-calculator.online` |
| `DATABASE_URL` | Yes (prod) | Neon pooled connection string |
| `DIRECT_URL` | Yes (prod) | Neon direct connection string |
| `AUTH_RESEND_KEY` | Yes (prod) | Resend API key (magic links + monthly emails) |
| `AUTH_RESEND_FROM` | No | Default: `1p Challenge <noreply@monzo-1p-challenge-calculator.online>` |
| `CRON_SECRET` | Yes (prod) | Bearer token for `/api/cron/monthly-transfer` |

### Monthly transfer emails

Monthly emails are **on by default** for accounts. Users can turn them off under **Monthly transfer email** on the calculator. On the 1st of each month at **08:00 UTC**, [GitHub Actions](.github/workflows/monthly-transfer-email.yml) calls `/api/cron/monthly-transfer` (Cloudflare Worker cron triggers are disabled on Free — 5 crons/account limit).

Ensure repo secrets include `AUTH_URL` and `CRON_SECRET`. You can also run manually via **Actions → Monthly transfer emails → Run workflow**, or:

```bash
# Production deploy always syncs Cloudflare secrets from .dev.vars.production, then builds and deploys
npm run deploy

# Manually fire the monthly email job (uses CRON_SECRET + AUTH_URL)
npm run cron:trigger
npm run cron:trigger -- https://monzo-1p-challenge-calculator.online
```

## How the Math Works

- **Day 1** = 1p, **Day k** = k pence  
- **Sum days a to b:** (b(b+1) − (a−1)a) / 2 pence  
- **364 days:** £664.30 | **365 days:** £667.95  
- Integer pence only—no floats

## Deployment (Cloudflare)

**Notes:**
- **Free tier:** Workers are limited to 3 MiB. A `scripts/replace-og-for-cf.mjs` step swaps `@vercel/og` for a stub (~2.1 MB saved) to stay under the limit.
- **Windows:** Deploying locally can fail with `resvg.wasm?module` path errors. Use GitHub Actions (recommended) or WSL.

### Option A: GitHub Actions (recommended)

1. Push your repo to GitHub.
2. Add these **repository secrets** (Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN` – from [Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens) (Create Token → Edit Cloudflare Workers)
   - `CLOUDFLARE_ACCOUNT_ID` – from Workers & Pages → Overview → Account ID
   - `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`, `CRON_SECRET`
3. Push to `main` – the workflow deploys automatically.

### Option B: Deploy from terminal with production vars (WSL or Mac/Linux)

1. Copy the production template and fill in your values:
   ```bash
   cp .dev.vars.production.example .dev.vars.production
   # Edit .dev.vars.production with real production secrets
   ```
2. Run `npm run deploy` – **syncs Cloudflare secrets first** from `.dev.vars.production`, then builds and deploys.
   - Use `npm run deploy -- --no-secrets` only if secrets are already set and you want to skip the upload step.

*(Windows can fail on deploy—use WSL or GitHub Actions.)*

**Note:** `npm run deploy`, `npm run deploy:prod`, and `npm run deploy:cf` all use the same script and sync secrets by default.

### Option C: Cloudflare Workers Build (connect Git)

**Important:** Use **Workers** (not Pages). Create → Workers & Pages → Workers → Create Worker → Connect to Git.

1. **Build command:** `npm run build:workers` (or `npx opennextjs-cloudflare build && node scripts/replace-og-for-cf.mjs`)
2. **Deploy command:** `npx wrangler deploy` (default)
3. **Framework preset:** None (or override if it defaults to Next.js)
4. **Build variables:** Add `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`, `CRON_SECRET`
5. Push to trigger deploy. Cloudflare builds on Linux (avoids Windows issues).

**If you used Pages by mistake:** Cloudflare **Pages** expects `pages_build_output_dir` and uses the deprecated `@cloudflare/next-on-pages` adapter. This project uses **Workers** (OpenNext). Create a new **Worker** project: Workers & Pages → Workers → Create → Connect to Git. Use the build command above.

#### Troubleshooting: "Output directory .vercel/output/static not found"

This error means the repo is connected to **Cloudflare Pages**, not Workers. Pages looks for static output; this app outputs a Worker bundle (`.open-next/`).

**Fix:** Create a **Worker** project and connect the same repo:

1. Go to [Workers & Pages](https://dash.cloudflare.com/?to=/:account/workers-and-pages)
2. Click **Create** → **Worker** (not "Pages")
3. Choose **Connect to Git** → select your repo
4. Set **Build command:** `npm ci && npx opennextjs-cloudflare build && node scripts/replace-og-for-cf.mjs`
5. Set **Deploy command:** `npx wrangler deploy` (or leave default)
6. Add build variables (secrets) for `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`, `CRON_SECRET`
7. Save. You can delete or ignore the old Pages project.

#### Troubleshooting: "Could not find compiled Open Next config"

This means the build command is wrong. Cloudflare Workers Build must use **OpenNext**, not plain Next.js. Set the build command to:

```
npm run build:workers
```

Do **not** use `npm run build` (that runs `next build` and produces the wrong output).

#### Troubleshooting: "Application error" when sending magic link

The Worker needs runtime secrets (AUTH_SECRET, AUTH_URL, DATABASE_URL, DIRECT_URL, AUTH_RESEND_KEY, AUTH_RESEND_FROM, CRON_SECRET). If they are missing, auth or monthly emails will fail.

- **GitHub Actions:** The workflow uploads secrets **before** deploy. Ensure all 7 vars are set in repo Settings → Secrets and variables → Actions. `AUTH_URL` must be `https://monzo-1p-challenge-calculator.online`.
- **Cloudflare Workers Build (connect Git):** Add secrets in the dashboard: Workers & Pages → your Worker → Settings → Variables and Secrets → Add variable (encrypted).
- **Manual deploy:** Run `npm run deploy` (loads `.dev.vars.production` and uploads secrets) or set them once: `npx wrangler secret put AUTH_SECRET`, etc.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Next.js build |
| `npm run build:cf` | Cloudflare build |
| `npm run build:workers` | Cloudflare build + OG stub (for Workers Build) |
| `npm run deploy` | Sync Cloudflare secrets from `.dev.vars.production`, then build + deploy |
| `npm run deploy:cf` | Same as `deploy` (secrets synced first) |
| `npm run deploy:prod` | Alias of `npm run deploy` |
| `npm run cron:trigger` | Manually run the monthly transfer email job |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run lint` | ESLint |
| `npm run test` | Unit tests (Vitest) |
| `npm run test:e2e` | Playwright E2E |

## Project Structure

```
.cursor/rules/     # AI rules (design, DB, schema, security, etc.)
.github/           # CI/CD, issue templates, PR template
app/               # Next.js app router
prisma/            # Schema and migrations
src/               # Components, lib
```

## Security

- Zod validation on all input
- Rate limiting on `/api/save` and `/api/saved`
- Security headers (CSP, X-Frame-Options, etc.)
- No secrets in client; env vars only
- Prisma for parameterized queries
- Auth.js for secure session

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) for community standards.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history.

## License

[MIT](LICENSE)

---
