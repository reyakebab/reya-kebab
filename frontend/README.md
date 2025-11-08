# Kebab Swap — Next.js (Reya + Camelot)
Single-tenant DEX UI using Camelot v2 liquidity on Reya.

## Run locally
```bash
npm i
npm run dev
# http://localhost:3000
```

## Env (optional)
Provide these in Vercel (Production + Preview + Dev) or `.env.local`:
```
NEXT_PUBLIC_FACTORY=0x7d8c6B58BA2d40FC6E34C25f9A488067Fe0D2dB4
NEXT_PUBLIC_ROUTER=0x18E621B64d7808c3C47bccbbD7485d23F257D26f
```

If not set, the app falls back to those defaults.

## Deploy on Vercel
- Import the repo, **Root Directory = `frontend/`**
- Set the two env vars (or rely on defaults)
- Deploy
