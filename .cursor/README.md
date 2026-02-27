# Cursor Project Guidance

## What we are building
A penny challenge / 1p accumulator calculator website. Core: calculate sums for ranges/months using integer pence.

## Must-keep architecture
- Pure math in `src/lib/pennyChallenge.ts`
- UI in `src/components/*`
- Routes in `app/*`
- Validation in `src/lib/validation.ts`
- Share links parsed/validated from URL query params

## Testing expectations
- Unit tests cover math edge cases.
- At least one Playwright E2E flow.

## Security defaults
- Validate inputs
- Safe headers
- No floats for money
- Rate limit if any API routes exist