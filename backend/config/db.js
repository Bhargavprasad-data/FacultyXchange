import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Render provides SSL; ensure it works locally too
  ssl: { rejectUnauthorized: false },
});

const connectDB = async () => {
  try {
    // Test connection
    const client = await pool.connect();
    client.release();
    console.log('✅ PostgreSQL connected');
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error);
    process.exit(1);
  }
};

export default connectDB;
export { pool };
