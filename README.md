# 1p Challenge Calculator

A production-ready web app for the **1p Accumulator / Penny Challenge** savings plan. Calculate how much to deposit for any date range, month, or custom period—with mobile-first design and shareable links.

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How the Math Works

The penny challenge uses a simple arithmetic series:

- **Day 1** = 1p  
- **Day k** = k pence  

**Total for days a to b (inclusive):**

$$\text{Sum} = \frac{b(b+1) - (a-1)a}{2} \text{ pence}$$

Example: Days 60–90 = 60 + 61 + … + 90 = **2,325p** (£23.25).

**Full challenge totals:**
- **364 days:** £664.30  
- **365 days:** £667.95  

All calculations use **integer pence** end-to-end—no floats.

## Features

- **3 modes:** Next N days, Month, Custom range  
- **Challenge config:** Start date (default Jan 1), length (364 or 365 days)  
- **Daily breakdown:** Toggle to see each day’s amount  
- **Currency:** GBP or pence-only display  
- **Advanced:** "I'm on day X" for mid-challenge planning  
- **Copy result** & **Share link** (URL encodes params)  
- **PWA:** Installable on mobile  
- **localStorage:** Persists settings (no account required)  

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # UI components (Calculator, DailyBreakdown, ui/*)
├── lib/
│   ├── pennyChallenge.ts   # Pure math (tested)
│   ├── validation.ts       # Zod schemas for inputs
│   └── utils.ts            # cn() etc.
```

## Testing

```bash
# Unit tests (Vitest)
npm run test

# E2E (Playwright)
npm run test:e2e

# If dev server already running (avoids lock conflict):
# E2E_SKIP_SERVER=1 npm run test:e2e
```

## Deployment (Vercel)

1. Push to GitHub and import the repo in Vercel.  
2. Deploy. No extra env vars needed for the basic app.  
3. Optional: Add `NEXT_PUBLIC_ANALYTICS_ID` if you enable analytics.  

For DB/Auth (phase 2):
- Set `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DATABASE_URL`
- Use secure cookies; see Auth.js docs.

## Security Notes

- **Input validation:** All query params and form inputs validated with Zod.  
- **Integer pence:** No float money math.  
- **Headers:** CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy.  
- **Secrets:** Never logged or exposed to the client.  

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run Playwright E2E tests |

## License

MIT
