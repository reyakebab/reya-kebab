export const ERC20 = [
  { "type":"function","name":"symbol","stateMutability":"view","inputs":[],"outputs":[{"type":"string"}]},
  { "type":"function","name":"decimals","stateMutability":"view","inputs":[],"outputs":[{"type":"uint8"}]},
  { "type":"function","name":"approve","stateMutability":"nonpayable","inputs":[{"type":"address"},{"type":"uint256"}],"outputs":[{"type":"bool"}]},
  { "type":"function","name":"allowance","stateMutability":"view","inputs":[{"type":"address"},{"type":"address"}],"outputs":[{"type":"uint256"}]},
  { "type":"function","name":"balanceOf","stateMutability":"view","inputs":[{"type":"address"}],"outputs":[{"type":"uint256"}]}
] as const;

export const IUniswapV2Factory = [
  { "type":"function","name":"getPair","stateMutability":"view","inputs":[{"type":"address"},{"type":"address"}],"outputs":[{"type":"address"}] },
  { "type":"function","name":"allPairsLength","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}] },
  { "type":"function","name":"allPairs","stateMutability":"view","inputs":[{"type":"uint256"}],"outputs":[{"type":"address"}] }
] as const;

export const IUniswapV2Pair = [
  { "type":"function","name":"getReserves","stateMutability":"view","inputs":[],"outputs":[{"type":"uint112"},{"type":"uint112"},{"type":"uint32"}] },
  { "type":"function","name":"token0","stateMutability":"view","inputs":[],"outputs":[{"type":"address"}] },
  { "type":"function","name":"token1","stateMutability":"view","inputs":[],"outputs":[{"type":"address"}] },
  { "type":"function","name":"totalSupply","stateMutability":"view","inputs":[],"outputs":[{"type":"uint256"}] }
] as const;

export const IUniswapV2Router02 = [
  { "type":"function","name":"getAmountsOut","stateMutability":"view","inputs":[{"name":"amountIn","type":"uint256"},{"name":"path","type":"address[]"}],"outputs":[{"name":"amounts","type":"uint256[]"}] },
  { "type":"function","name":"swapExactTokensForTokens","stateMutability":"nonpayable","inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"outputs":[{"name":"amounts","type":"uint256[]"}] }
] as const;

export const IUniswapV2Router02_more = [
  { "type":"function","name":"swapExactETHForTokens","stateMutability":"payable","inputs":[{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"outputs":[{"name":"amounts","type":"uint256[]"}] },
  { "type":"function","name":"swapExactTokensForETH","stateMutability":"nonpayable","inputs":[{"name":"amountIn","type":"uint256"},{"name":"amountOutMin","type":"uint256"},{"name":"path","type":"address[]"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"outputs":[{"name":"amounts","type":"uint256[]"}] },
  { "type":"function","name":"addLiquidity","stateMutability":"nonpayable","inputs":[{"name":"tokenA","type":"address"},{"name":"tokenB","type":"address"},{"name":"amountADesired","type":"uint256"},{"name":"amountBDesired","type":"uint256"},{"name":"amountAMin","type":"uint256"},{"name":"amountBMin","type":"uint256"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"outputs":[{"name":"amountA","type":"uint256"},{"name":"amountB","type":"uint256"},{"name":"liquidity","type":"uint256"}] },
  { "type":"function","name":"addLiquidityETH","stateMutability":"payable","inputs":[{"name":"token","type":"address"},{"name":"amountTokenDesired","type":"uint256"},{"name":"amountTokenMin","type":"uint256"},{"name":"amountETHMin","type":"uint256"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"outputs":[{"name":"amountToken","type":"uint256"},{"name":"amountETH","type":"uint256"},{"name":"liquidity","type":"uint256"}] },
  { "type":"function","name":"removeLiquidity","stateMutability":"nonpayable","inputs":[{"name":"tokenA","type":"address"},{"name":"tokenB","type":"address"},{"name":"liquidity","type":"uint256"},{"name":"amountAMin","type":"uint256"},{"name":"amountBMin","type":"uint256"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"outputs":[{"name":"amountA","type":"uint256"},{"name":"amountB","type":"uint256"}] },
  { "type":"function","name":"removeLiquidityETH","stateMutability":"nonpayable","inputs":[{"name":"token","type":"address"},{"name":"liquidity","type":"uint256"},{"name":"amountTokenMin","type":"uint256"},{"name":"amountETHMin","type":"uint256"},{"name":"to","type":"address"},{"name":"deadline","type":"uint256"}],"outputs":[{"name":"amountToken","type":"uint256"},{"name":"amountETH","type":"uint256"}] }
] as const;
