import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT;
export const dbPort = process.env.DB_PORT;
export const dbHost = process.env.DB_HOST;
export const dbPass = process.env.DB_PASS;
export const coinAPIRoot = process.env.COIN_API_ROOT;
export const coinAPIKey = process.env.COIN_API_KEY;
export const assetsUrl = process.env.ASSETS_URL;

export const ETH_WS_URL = process.env.ETH_WS_URL;
