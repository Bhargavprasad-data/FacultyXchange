import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { readFile } from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: 5432,
    };

const pool = new Pool({
  ...poolConfig,
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

    // Seed default admin user if none exists
    const { rowCount } = await pool.query('SELECT * FROM faculty WHERE role = $1', ['Admin']);
    if (rowCount === 0) {
      const bcrypt = await import('bcryptjs');
      const salt = await bcrypt.default.genSalt(10);
      const hashedPassword = await bcrypt.default.hash('Bhargav11@prasad', salt);
      
      await pool.query(
        'INSERT INTO faculty (name, "facultyId", department, email, password, role) VALUES ($1, $2, $3, $4, $5, $6)',
        ['Admin', '23331A4462', 'Administration', 'admin@example.com', hashedPassword, 'Admin']
      );
      console.log('✅ Default Admin user seeded successfully');
    }
  } catch (error) {
    console.error('❌ PostgreSQL connection/initialization error:', error);
    process.exit(1);
  }
};

export default connectDB;
export { pool };
