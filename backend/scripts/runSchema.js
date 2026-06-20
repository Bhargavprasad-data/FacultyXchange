import { readFile } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

import { query } from '../config/pgClient.js';

(async () => {
  try {
    const sqlPath = path.join(__dirname, '../db/schema.sql');
    const sql = await readFile(sqlPath, 'utf8');
    
    // Split SQL by semicolon but ignore inside single quotes or comments if any.
    // For our clean schema file, splitting by semicolon is fine as long as we filter empty lines.
    const statements = sql
      .split(';')
      .map((q) => q.trim())
      .filter((q) => q.length > 0);

    console.log(`Executing ${statements.length} SQL statements...`);
    for (const statement of statements) {
      await query(statement);
    }
    console.log('✅ Database schema applied successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to apply database schema:', err);
    process.exit(1);
  }
})();
