import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from './models/Faculty.js';
import connectDB from './config/db.js';

dotenv.config();

connectDB();

const seedData = async () => {
  try {
    await Faculty.deleteMany();

    const adminUser = {
      name: 'Admin User',
      facultyId: 'admin123',
      department: 'Admin',
      email: 'admin@college.edu',
      password: 'password123',
      role: 'Admin',
    };

    const cseFaculty1 = {
      name: 'Dr. John Doe',
      facultyId: 'cse001',
      department: 'CSE',
      email: 'john@college.edu',
      password: 'password123',
      role: 'Faculty',
    };

    const cseFaculty2 = {
      name: 'Prof. Jane Smith',
      facultyId: 'cse002',
      department: 'CSE',
      email: 'jane@college.edu',
      password: 'password123',
      role: 'Faculty',
    };
    
    const eceFaculty1 = {
      name: 'Dr. Alice Brown',
      facultyId: 'ece001',
      department: 'ECE',
      email: 'alice@college.edu',
      password: 'password123',
      role: 'Faculty',
    };

    await Faculty.create(adminUser);
    await Faculty.create(cseFaculty1);
    await Faculty.create(cseFaculty2);
    await Faculty.create(eceFaculty1);

    console.log('Data Imported!');
    process.exit();
  } catch (error) {
    console.error(`${error}`);
    process.exit(1);
  }
};

seedData();
