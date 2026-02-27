# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly:

1. **Do not** open a public issue
2. **Email** the maintainer(s) with details, or use GitHub’s [Security Advisories](../../security/advisories/new) if enabled
3. Include: steps to reproduce, impact, and suggested fix (if any)
4. Allow time for a fix before public disclosure

### What We Care About

- Authentication/session handling (Auth.js, magic links)
- Input validation (Zod schemas, SQL injection via Prisma)
- Secrets exposure (env vars, tokens in client)
- Rate limiting and abuse of `/api/save` and `/api/saved`
- Security headers (CSP, X-Frame-Options, etc.)

Thank you for helping keep this project secure.
