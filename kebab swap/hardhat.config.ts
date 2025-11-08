import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const REYA_RPC = process.env.REYA_RPC || "https://rpc.reya.network";
const REYA_CHAIN_ID = parseInt(process.env.REYA_CHAIN_ID || "1729");
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x" + "0".repeat(64);

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: { optimizer: { enabled: true, runs: 999999 } }
  },
  networks: {
    reya: {
      url: REYA_RPC,
      chainId: REYA_CHAIN_ID,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: { apiKey: "" }
};

export default config;
