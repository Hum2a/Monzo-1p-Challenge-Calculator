# Contributing to 1p Challenge Calculator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Getting Started

1. **Fork and clone** the repository
2. **Install dependencies**: `npm install`
3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   cp .dev.vars.example .dev.vars
   ```
4. **Generate Prisma client**: `npm run db:generate`
5. **Push schema** (if DB is configured): `npm run db:push`
6. **Start dev server**: `npm run dev`

## Development Workflow

- Create a **branch** from `main` for your changes (e.g. `feat/add-export`, `fix/date-range`)
- Make your changes
- Run **lint**: `npm run lint`
- Run **tests**: `npm run test`
- Run **E2E** (optional): `npm run test:e2e`
- Commit with clear messages (e.g. `feat: add CSV export`, `fix: off-by-one in month mode`)

## Pull Request Process

1. Ensure all tests pass and there are no lint errors
2. Update the README or docs if you change behavior
3. Add or update tests for new/changed logic
4. Open a PR with a clear description
5. Link any related issues

## Code Standards

- **TypeScript** – Use types; avoid `any`
- **Validation** – Use Zod for all external input (forms, API bodies)
- **Money** – Integer pence only; never floats
- **Security** – No secrets in client code; follow `.cursor/rules/security.mdc`
- **UI** – Mobile-first; follow `.cursor/rules/design.mdc`

## Questions?

Open an [issue](../../issues) for questions or suggestions.
