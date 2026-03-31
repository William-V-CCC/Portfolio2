import pkg from 'pg';
import process from 'node:process';
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // now works
  ssl: { rejectUnauthorized: false },
});

// deno-lint-ignore no-explicit-any
export async function query(text: string, params?: any[]) {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } finally {
    client.release();
  }
}