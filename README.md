# 1p Challenge Calculator

A production-ready web app for the **1p Accumulator / Penny Challenge** savings plan. Calculate deposits for any date range, month, or custom period—with Monzo branding, mobile-first design, and optional account saving.

## Setup

```bash
npm install
cp .env.example .env.local
# Edit .env.local with your values
npm run db:generate
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production Stack

- **Cloudflare Workers** – Deployment via OpenNext adapter
- **Neon PostgreSQL** – Database (auth + saved states)
- **Auth.js (NextAuth v5)** – Magic link email auth (Resend)
- **Prisma** – ORM
- **Zod** – Validation
- **Tailwind + shadcn** – UI

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

## Features

- **3 modes:** Next N days, Month, Custom range  
- **Anonymous:** Use immediately with localStorage  
- **Account:** Sign in via magic link to save states to DB  
- **Save/Load:** Up to 10 saved states per user  
- **PWA:** Installable on mobile  

## Deployment (Cloudflare)

**Note:** Deploying from Windows can fail with `resvg.wasm?module` errors (WASM path handling). Use GitHub Actions (recommended) or WSL.

### Option A: GitHub Actions (recommended)

1. Push your repo to GitHub.
2. Add these **repository secrets** (Settings → Secrets and variables → Actions):
   - `CLOUDFLARE_API_TOKEN` – from [Cloudflare dashboard](https://dash.cloudflare.com/profile/api-tokens) (Create Token → Edit Cloudflare Workers)
   - `CLOUDFLARE_ACCOUNT_ID` – from Workers & Pages → Overview → Account ID
   - `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_RESEND_KEY`, `AUTH_RESEND_FROM`
3. Push to `main` – the workflow deploys automatically.

### Option B: Local deploy (WSL or Mac/Linux)

1. Create a Neon project and get `DATABASE_URL` + `DIRECT_URL`.
2. Create a Resend account, verify domain, get API key.
3. In Cloudflare Workers Build:
   - Build command: `npm run build:cf`
   - Output: `.open-next`
   - Set env vars: `AUTH_SECRET`, `AUTH_URL`, `DATABASE_URL`, `DIRECT_URL`, `AUTH_RESEND_KEY`
4. Deploy:
   ```bash
   npm run deploy
   ```
   Or connect GitHub to Workers Build for CI/CD.

## Cursor Rules

Project-specific AI rules in `.cursor/rules/`:

- `design.mdc` – UI and design system
- `database.mdc` – Prisma and DB
- `schema.mdc` – Validation
- `middleware.mdc` – Auth and security headers
- `frontend.mdc` – React components
- `backend.mdc` – API routes
- `deployment.mdc` – Cloudflare
- `security.mdc` – Security baseline (always apply)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Next.js build |
| `npm run build:cf` | Cloudflare build |
| `npm run deploy` | Deploy to Cloudflare |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to DB |
| `npm run test` | Unit tests |
| `npm run test:e2e` | Playwright E2E |

## Security

- Zod validation on all input
- Rate limiting on /api/save and /api/saved
- Security headers (CSP, X-Frame-Options, etc.)
- No secrets in client; env vars only
- Prisma for parameterized queries
- Auth.js for secure session

## License

MIT
