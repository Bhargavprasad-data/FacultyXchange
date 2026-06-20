import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import { query } from './config/pgClient.js';
import bcrypt from 'bcryptjs';

const seedData = async () => {
  try {
    // Clear data from tables
    await query('DELETE FROM compensation_class');
    await query('DELETE FROM notification');
    await query('DELETE FROM substitute_class');
    await query('DELETE FROM timetable');
    await query('DELETE FROM faculty');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    const customAdminHashedPassword = await bcrypt.hash('Bhargav11@prasad', salt);

    const users = [
      {
        name: 'Admin User',
        facultyId: 'admin123',
        department: 'Admin',
        email: 'admin@college.edu',
        password: hashedPassword,
        role: 'Admin',
      },
      {
        name: 'Admin Bhargav Upper',
        facultyId: '23331A4462',
        department: 'Admin',
        email: '23331A4462@college.edu',
        password: customAdminHashedPassword,
        role: 'Admin',
      },
      {
        name: 'Admin Bhargav Lower',
        facultyId: '23331a4462',
        department: 'Admin',
        email: '23331a4462@college.edu',
        password: customAdminHashedPassword,
        role: 'Admin',
      },
      {
        name: 'Dr. John Doe',
        facultyId: 'cse001',
        department: 'CSE',
        email: 'john@college.edu',
        password: hashedPassword,
        role: 'Faculty',
      },
      {
        name: 'Prof. Jane Smith',
        facultyId: 'cse002',
        department: 'CSE',
        email: 'jane@college.edu',
        password: hashedPassword,
        role: 'Faculty',
      },
      {
        name: 'Dr. Alice Brown',
        facultyId: 'ece001',
        department: 'ECE',
        email: 'alice@college.edu',
        password: hashedPassword,
        role: 'Faculty',
      }
    ];

    for (const u of users) {
      await query(
        'INSERT INTO faculty (name, "facultyId", department, email, password, role) VALUES ($1, $2, $3, $4, $5, $6)',
        [u.name, u.facultyId, u.department, u.email, u.password, u.role]
      );
    }

    console.log('✅ Seed Data Imported successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error}`);
    process.exit(1);
  }
};

seedData();
