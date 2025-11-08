import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, Address } from "viem";
import { reya } from "../../../lib/reya";
import { ADDRESSES } from "../../../lib/addresses";
import { IUniswapV2Factory } from "../../../lib/abis";

const client = createPublicClient({ chain: reya, transport: http() });

const SwapEvent = parseAbiItem('event Swap(address indexed sender,uint amount0In,uint amount1In,uint amount0Out,uint amount1Out,address indexed to)');

async function getPair(tokenA: Address, tokenB: Address) {
  return await client.readContract({ address: ADDRESSES.FACTORY as Address, abi: IUniswapV2Factory, functionName: "getPair", args: [tokenA, tokenB] }) as Address;
}

export async function GET() {
  try {
    const current = await client.getBlockNumber();
    const fromBlock = current - 10000n; // ~ recent window
    const pairs: Address[] = [];
    const WETH = ADDRESSES.WETH as Address;
    if (ADDRESSES.KEBAB) pairs.push(await getPair(ADDRESSES.KEBAB as Address, WETH));
    if (ADDRESSES.RUSD)  pairs.push(await getPair(ADDRESSES.RUSD as Address, WETH));

    const logs = await Promise.all(pairs.filter(p=>p && p !== '0x0000000000000000000000000000000000000000').map(pair => client.getLogs({ address: pair, event: SwapEvent, fromBlock })));
    const flat = logs.flat();

    // Aggregate rough volume in token units per pair
    const agg: Record<string, { swaps: number, tokenVolIn: string, tokenVolOut: string }> = {};
    for (const l of flat) {
      const key = (l.address as string).toLowerCase();
      const v = agg[key] || { swaps: 0, tokenVolIn: "0", tokenVolOut: "0" };
      // amount0/1 are raw; leave as strings to avoid bignum lib. Frontend can format.
      v.swaps += 1;
      // @ts-ignore
      v.tokenVolIn = (BigInt(v.tokenVolIn) + (l.args.amount0In + l.args.amount1In)).toString();
      // @ts-ignore
      v.tokenVolOut = (BigInt(v.tokenVolOut) + (l.args.amount0Out + l.args.amount1Out)).toString();
      agg[key] = v;
    }

    return NextResponse.json({ fromBlock: `-${Number(current - fromBlock)}`, pairs, totals: agg });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "analytics_failed" }, { status: 500 });
  }
}
