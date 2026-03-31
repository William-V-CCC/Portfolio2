import pkg from 'pg';
import process from "node:process";
const { Pool } = pkg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL || "postgresql://neondb_owner:npg_hpb8Nz3eivVn@ep-delicate-bread-anwv51e3-pooler.c-6.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require", // your Neon connection string
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