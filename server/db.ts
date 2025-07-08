import pkg from 'pg';
const { Pool } = pkg;
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema.js";

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/cashpot_gaming';

export const pool = new Pool({ connectionString: databaseUrl });
export const db = drizzle(pool, { schema });