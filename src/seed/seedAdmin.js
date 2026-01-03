import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { EmployeeModel } from '../models/Employee.js';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('Missing MONGODB_URI');

await mongoose.connect(mongoUri, {
  autoIndex: process.env.NODE_ENV !== 'production'
});

const email = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

const existing = await EmployeeModel.findOne({ email }).lean();
if (!existing) {
  const passwordHash = await bcrypt.hash(password, 10);
  await EmployeeModel.create({
    email,
    passwordHash,
    role: 'admin',
    name: 'Admin',
    age: 30,
    class: 'N/A',
    subjects: [],
    attendance: 0
  });
  console.log(`Seeded admin: ${email} / ${password}`);
} else {
  console.log(`Admin already exists: ${email}`);
}

await mongoose.disconnect();
