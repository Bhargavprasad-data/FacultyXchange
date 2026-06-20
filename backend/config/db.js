import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

const connectDB = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    client.release();
    console.log('✅ PostgreSQL connected');

    // Run schema setup automatically
    const sqlPath = path.join(__dirname, '../db/schema.sql');
    const sql = await readFile(sqlPath, 'utf8');
    const statements = sql
      .split(';')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    for (const statement of statements) {
      await pool.query(statement);
    }
    console.log('✅ Database schema initialized/verified');
  } catch (error) {
    console.error('❌ PostgreSQL connection/initialization error:', error);
    process.exit(1);
  }
};

export default connectDB;
export { pool };
