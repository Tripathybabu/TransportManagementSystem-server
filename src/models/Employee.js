import mongoose from 'mongoose';

const EmployeeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ['admin', 'employee'], required: true, index: true },

    name: { type: String, required: true },
    age: { type: Number },
    class: { type: String },
    subjects: { type: [String], default: [] },
    attendance: { type: Number }
  },
  { timestamps: true }
);

export const EmployeeModel = mongoose.model('Employee', EmployeeSchema);
