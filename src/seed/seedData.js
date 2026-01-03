import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { EmployeeModel } from '../models/Employee.js';
import { ShipmentModel } from '../models/Shipment.js';

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) throw new Error('Missing MONGODB_URI');

await mongoose.connect(mongoUri, {
  autoIndex: process.env.NODE_ENV !== 'production'
});

async function upsertEmployee({ email, password, role, name, age, class: className, subjects, attendance }) {
  const existing = await EmployeeModel.findOne({ email }).select('+passwordHash').lean();
  if (existing) return existing;

  const passwordHash = await bcrypt.hash(password, 10);
  const created = await EmployeeModel.create({
    email,
    passwordHash,
    role,
    name,
    age,
    class: className,
    subjects,
    attendance
  });

  return EmployeeModel.findById(created._id).lean();
}

async function upsertShipment({ reference, status, origin, destination, scheduledAt, assignedToId }) {
  const existing = await ShipmentModel.findOne({ reference }).lean();
  if (existing) return existing;

  const created = await ShipmentModel.create({
    reference,
    status,
    origin,
    destination,
    scheduledAt,
    assignedTo: assignedToId ?? null
  });

  return ShipmentModel.findById(created._id).lean();
}

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@123';

const admin = await upsertEmployee({
  email: adminEmail,
  password: adminPassword,
  role: 'admin',
  name: 'Admin',
  age: 30,
  class: 'N/A',
  subjects: [],
  attendance: 0
});

const employee1 = await upsertEmployee({
  email: 'employee1@example.com',
  password: 'Employee@123',
  role: 'employee',
  name: 'Employee One',
  age: 22,
  class: 'A',
  subjects: ['Math', 'Science'],
  attendance: 220
});

const employee2 = await upsertEmployee({
  email: 'employee2@example.com',
  password: 'Employee@123',
  role: 'employee',
  name: 'Employee Two',
  age: 25,
  class: 'B',
  subjects: ['English', 'History'],
  attendance: 180
});

const now = new Date();
const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

await Promise.all([
  upsertShipment({
    reference: 'REF-1001',
    status: 'CREATED',
    origin: 'Mumbai',
    destination: 'Pune',
    scheduledAt: daysFromNow(1),
    assignedToId: employee1?._id
  }),
  upsertShipment({
    reference: 'REF-1002',
    status: 'IN_TRANSIT',
    origin: 'Delhi',
    destination: 'Jaipur',
    scheduledAt: daysFromNow(2),
    assignedToId: employee1?._id
  }),
  upsertShipment({
    reference: 'REF-1003',
    status: 'DELIVERED',
    origin: 'Bengaluru',
    destination: 'Chennai',
    scheduledAt: daysFromNow(-2),
    assignedToId: employee2?._id
  }),
  upsertShipment({
    reference: 'REF-1004',
    status: 'PENDING',
    origin: 'Hyderabad',
    destination: 'Goa',
    scheduledAt: daysFromNow(5),
    assignedToId: employee2?._id
  }),
  upsertShipment({
    reference: 'REF-1005',
    status: 'CANCELLED',
    origin: 'Kolkata',
    destination: 'Patna',
    scheduledAt: null,
    assignedToId: null
  })
]);

console.log(`Seeded sample data. Admin: ${adminEmail} / ${adminPassword}`);
console.log('Employee: employee1@example.com / Employee@123');
console.log('Employee: employee2@example.com / Employee@123');

await mongoose.disconnect();
