import dotenv from 'dotenv';

dotenv.config();

export const port = process.env.PORT;
export const dbPort = process.env.DB_PORT;
export const dbHost = process.env.DB_HOST;
export const dbPass = process.env.DB_PASS;
