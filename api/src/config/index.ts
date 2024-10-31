require('dotenv').config();

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const SESSION_SECRET = process.env.SESSION_SECRET || 'secret';
export const JWT_SECRET = process.env.JWT_SECRET || 'secret';
export const MATHGAME_COOKIE = process.env.MATHGAME_COOKIE || 'mathtoken';
export const PORT = process.env.PORT || 5000;
export const SSL_PORT = process.env.SSL_PORT || 5443;
export const SSL_BASE_DIR = process.env.SSL_BASE_DIR || '/app/mathgame.com.au';
export const SSL_ENABLED = process.env.SSL_ENABLED ? process.env.SSL_ENABLED === 'true' : false;
export const DB_HOST = process.env.DB_HOST || 'localhost';
export const DB_PORT: number = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;
export const DB_NAME = process.env.DB_NAME || 'mathgame';
export const DB_USER = process.env.DB_USER || 'mathgame';
export const DB_PASS = process.env.DB_PASS || 'mathgame';
export const DB_DIALECT = process.env.DB_DIALECT || 'postgres';
export const SLACK_POST_URL = process.env.SLACK_POST_URL || undefined;
