import bcrypt from 'bcryptjs';
import { EmployeeModel } from '../models/Employee.js';
import { signToken } from './auth.js';
import { badUserInput } from './errors.js';

export async function login({ email, password }) {
  const user = await EmployeeModel.findOne({ email }).select('+passwordHash').lean();
  if (!user) throw badUserInput('Invalid credentials');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw badUserInput('Invalid credentials');

  const token = signToken({ id: user._id, role: user.role });

  const safeUser = await EmployeeModel.findById(user._id).lean();
  return { token, employee: safeUser };
}
