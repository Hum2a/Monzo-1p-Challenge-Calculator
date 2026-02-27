<div align="center">

# 1p Challenge Calculator

[![CI](https://github.com/GITHUB_OWNER/monzo-1p-challenge-calculator/actions/workflows/ci.yml/badge.svg)](https://github.com/GITHUB_OWNER/monzo-1p-challenge-calculator/actions/workflows/ci.yml)
[![Deploy](https://github.com/GITHUB_OWNER/monzo-1p-challenge-calculator/actions/workflows/deploy-cloudflare.yml/badge.svg)](https://github.com/GITHUB_OWNER/monzo-1p-challenge-calculator/actions/workflows/deploy-cloudflare.yml)
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
| UI | **Tailwind + shadcn** |

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AUTH_SECRET` | Yes (prod) | `openssl rand -base64 32` |
| `AUTH_URL` | Yes (prod) | Full URL of your site |
| `DATABASE_URL` | Yes (prod) | Neon pooled connection string |
| `DIRECT_URL` | Yes (prod) | Neon direct connection string |
| `AUTH_RESEND_KEY` | Yes (prod) | Resend API key |
| `AUTH_RESEND_FROM` | No | Sender email (default: Resend onboarding) |

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
   - `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`
3. Push to `main` – the workflow deploys automatically.

### Option B: Deploy from terminal with production vars (WSL or Mac/Linux)

1. Copy the production template and fill in your values:
   ```bash
   cp .dev.vars.production.example .dev.vars.production
   # Edit .dev.vars.production with real production secrets
   ```
2. Run `npm run deploy:prod` – loads vars, uploads secrets to Cloudflare, then builds and deploys.
   - Use `npm run deploy:prod -- --no-secrets` to skip uploading secrets (e.g. if already set in the dashboard).

*(Windows can fail on deploy—use WSL or GitHub Actions.)*

**Alternative (manual secrets):** Set secrets in Cloudflare once, then `npm run deploy`:
   ```bash
   npx wrangler secret put AUTH_SECRET
   npx wrangler secret put AUTH_URL
   # ... etc
   ```

### Option C: Cloudflare Workers Build (connect Git)

**Important:** Use **Workers** (not Pages). Create → Workers & Pages → Workers → Create Worker → Connect to Git.

1. **Build command:** `npm ci && npx opennextjs-cloudflare build && node scripts/replace-og-for-cf.mjs`
2. **Deploy command:** `npx wrangler deploy` (default)
3. **Framework preset:** None (or override if it defaults to Next.js)
4. **Build variables:** Add `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`
5. Push to trigger deploy. Cloudflare builds on Linux (avoids Windows issues).

**If you used Pages by mistake:** Pages uses the deprecated `@cloudflare/next-on-pages` adapter. Set **Framework preset** to **None** and use the build command above. Or create a **Worker** project instead.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Next.js build |
| `npm run build:cf` | Cloudflare build |
| `npm run deploy` | Deploy to Cloudflare |
| `npm run deploy:prod` | Deploy using vars from `.dev.vars.production` |
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

<sub>Replace `GITHUB_OWNER` in the badge URLs above with your GitHub username.</sub>
