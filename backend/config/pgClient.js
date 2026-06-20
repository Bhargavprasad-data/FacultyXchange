import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // optional SSL for Render
  ssl: { rejectUnauthorized: false },
});

export const query = (text, params) => pool.query(text, params);
export const getClient = async () => await pool.connect();
