import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT;
export const dbPort = process.env.DB_PORT;
export const dbHost = process.env.DB_HOST;
export const dbPass = process.env.DB_PASS;
export const dbName = process.env.DB_NAME;
export const dbUser = process.env.DB_USERNAME;
export const coinAPIRoot = process.env.COIN_API_ROOT;
export const coinAPIKey = process.env.COIN_API_KEY;
export const assetsUrl = process.env.ASSETS_URL;

export const ETH_WS_URL = process.env.ETH_WS_URL;
export const BSC_WS_URL = process.env.BSC_WS_URL;
export const AVAX_WS_URL = process.env.AVAX_WS_URL;
export const BITGERT_WS_URL = process.env.BITGERT_WS_URL;
export const SOLANA_CLUSTER = process.env.SOLANA_CLUSTER;
