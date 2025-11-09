export const CAM = {
  FACTORY_V2: process.env.NEXT_PUBLIC_CAM_FACTORY_V2 as `0x${string}`,
  ROUTER_V2: process.env.NEXT_PUBLIC_CAM_ROUTER_V2 as `0x${string}`,
  FACTORY_V3: process.env.NEXT_PUBLIC_CAM_FACTORY_V3 as `0x${string}`,
  SWAPROUTER_V3: process.env.NEXT_PUBLIC_CAM_SWAPROUTER_V3 as `0x${string}`,
  POSITION_MANAGER_V3: process.env.NEXT_PUBLIC_CAM_POSITION_MANAGER_V3 as `0x${string}`,
  QUOTER_V3: process.env.NEXT_PUBLIC_CAM_QUOTER_V3 as `0x${string}`,
  WETH: process.env.NEXT_PUBLIC_WETH as `0x${string}`,
} as const;
