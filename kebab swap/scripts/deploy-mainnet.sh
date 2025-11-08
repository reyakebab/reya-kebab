#!/usr/bin/env bash
set -euo pipefail
if [ ! -f .env ]; then
  echo "Missing .env. Copy .env.example to .env and set PRIVATE_KEY, FEE_TO, WETH, KEBAB"; exit 1;
fi
echo "Installing deps..."; npm i > /dev/null
echo "Deploying Factory..."; FACTORY=$(node -e "require('dotenv').config(); const { spawnSync }=require('node:child_process'); const r=spawnSync('npx', ['hardhat','run','scripts/deploy-factory.ts','--network','reya'],{stdio:'pipe'}); const s=r.stdout.toString(); const m=s.match(/Factory deployed to:\s*(0x[a-fA-F0-9]{40})/); if(!m) { console.log(s); process.exit(1);} console.log(m[1]);"); export FACTORY
echo "Factory: $FACTORY"
echo "Deploying Router..."; ROUTER=$(FACTORY=$FACTORY node -e "require('dotenv').config(); process.env.FACTORY=process.env.FACTORY||process.argv[1]; const { spawnSync }=require('node:child_process'); const r=spawnSync('npx', ['hardhat','run','scripts/deploy-router.ts','--network','reya'],{stdio:'pipe', env:{...process.env, FACTORY: process.env.FACTORY}}); const s=r.stdout.toString(); const m=s.match(/Router deployed to:\s*(0x[a-fA-F0-9]{40})/); if(!m){ console.log(s); process.exit(1);} console.log(m[1]);", "$FACTORY"); export ROUTER
echo "Router: $ROUTER"
echo "Setting feeTo..."; FACTORY=$FACTORY npx hardhat run scripts/set-fee-to.ts --network reya
echo "Done. Paste these into frontend/.env.local:"
echo "NEXT_PUBLIC_FACTORY=$FACTORY"
echo "NEXT_PUBLIC_ROUTER=$ROUTER"
