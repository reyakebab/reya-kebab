# KebabSwap (Reya) — Starter

Minimal Next.js starter wired for a sleek DEX UI using your branding. **You must fill verified Camelot addresses for Reya in `.env.local` before deploying.**

## Quickstart

```bash
pnpm i
cp .env.example .env.local
# edit .env.local with Camelot addresses + WETH
pnpm dev
```

## Deploy

- Push to GitHub and import the repo into **Vercel**.
- Set Environment Variables from `.env.local` in the Vercel project.
- Production URL will serve `/swap`.
