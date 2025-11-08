# Kebab Swap MVP (Reya)

Uniswap v2-style DEX on Reya chain (chainId 1729). Contracts from @uniswap/v2-core and @uniswap/v2-periphery.
Router wraps ETH via WETH at 0x6B48C2e6A32077ec17e8Ba0d98fFc676dfab1A30.

## Quickstart

1) Copy `.env.example` to `.env` and fill values (PRIVATE_KEY, FACTORY after deploy, etc.).
2) `npm i`
3) `npm run deploy:factory`
4) export FACTORY=0x...; `npm run deploy:router`
5) `npm run set:feeTo`
6) Create pairs: `TOKEN_A=0x... TOKEN_B=0x... npm run create:pair`

### Liquidity & Swap helpers
```bash
# Add liquidity (example: 0.5 WETH + 500 KEBAB)
export ROUTER=0xYourRouter
export TOKEN_A=0x6B48C2e6A32077ec17e8Ba0d98fFc676dfab1A30
export TOKEN_B=0x49d753C5B7C6D23262d4259aC863FfE10aBD9F2a
export AMOUNT_A=0.5
export AMOUNT_B=500
npm run -s ts-node scripts/add-liquidity.ts

# Swap (e.g., 1 WETH -> KEBAB)
export TOKEN_IN=0x6B48C2e6A32077ec17e8Ba0d98fFc676dfab1A30
export TOKEN_OUT=0x49d753C5B7C6D23262d4259aC863FfE10aBD9F2a
export AMOUNT_IN=1
npm run -s ts-node scripts/swap-exact-tokens.ts
```

## Production (Docker)
```bash
export NEXT_PUBLIC_FACTORY=0xYourFactory
export NEXT_PUBLIC_ROUTER=0xYourRouter
docker compose up --build -d
```

## Analytics API
- `/api/analytics` scans recent blocks for Swap events on WETH-KEBAB and WETH-RUSD pairs.
- Extend this by adding more pairs or hooking a subgraph for full history.

## Quick Deploy (one command)
```bash
cd kebab-swap-mvp
cp .env.example .env  # set PRIVATE_KEY
./scripts/deploy-mainnet.sh
# then
cd frontend && cp .env.local.example .env.local && \ 
  sed -i.bak "s|NEXT_PUBLIC_FACTORY=.*|NEXT_PUBLIC_FACTORY=$FACTORY|" .env.local && \ 
  sed -i.bak "s|NEXT_PUBLIC_ROUTER=.*|NEXT_PUBLIC_ROUTER=$ROUTER|" .env.local && \ 
npm i && npm run build && npm start
```

## Vercel Deploy
- Push the repo to GitHub.
- In Vercel, import the `frontend/` folder, set two env vars:
  - `NEXT_PUBLIC_FACTORY` = 0xYourFactory
  - `NEXT_PUBLIC_ROUTER` = 0xYourRouter
- Deploy.
