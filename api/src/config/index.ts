require('dotenv').config();

export const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
export const PORT = process.env.PORT || 5000;
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT: number = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
export const DB_NAME = process.env.DB_NAME || 'mathgame';
export const DB_USER = process.env.DB_USER || 'mathgame';
export const DB_PASS = process.env.DB_PASS || 'mathgame';
export const DB_DIALECT = process.env.DB_DIALECT || 'postgres';
