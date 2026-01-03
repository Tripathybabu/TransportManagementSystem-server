import bcrypt from 'bcryptjs';
import { EmployeeModel } from '../../models/Employee.js';
import { ShipmentModel } from '../../models/Shipment.js';
import { requireRole } from '../../security/rbac.js';
import { badUserInput, notFound } from '../../security/errors.js';
import { login } from '../../security/login.js';
import { addEmployeeSchema, addShipmentSchema, loginSchema, updateEmployeeSchema, updateShipmentSchema } from '../validation.js';

function parseOrThrow(schema, value) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw badUserInput('Validation failed', parsed.error.flatten());
  }
  return parsed.data;
}

export const Mutation = {
  login: async (_p, args) => {
    const input = parseOrThrow(loginSchema, args.input);
    return login(input);
  },

  addEmployee: async (_p, args, ctx) => {
    requireRole(ctx.user, ['admin']);

    const input = parseOrThrow(addEmployeeSchema, args.input);
    const existing = await EmployeeModel.findOne({ email: input.email }).lean();
    if (existing) throw badUserInput('Email already exists');

    const passwordHash = await bcrypt.hash(input.password, 10);
    const created = await EmployeeModel.create({
      email: input.email,
      passwordHash,
      role: input.role,
      name: input.name,
      age: input.age ?? undefined,
      class: input.class ?? undefined,
      subjects: input.subjects,
      attendance: input.attendance ?? undefined
    });

    return EmployeeModel.findById(created._id).lean();
  },

  updateEmployee: async (_p, args, ctx) => {
    requireRole(ctx.user, ['admin']);

    const input = parseOrThrow(updateEmployeeSchema, args.input);
    const update = { ...input };

    if (update.password) {
      update.passwordHash = await bcrypt.hash(update.password, 10);
      delete update.password;
    }

    if (update.email) {
      const existing = await EmployeeModel.findOne({ email: update.email, _id: { $ne: args.id } }).lean();
      if (existing) throw badUserInput('Email already exists');
    }

    const updated = await EmployeeModel.findByIdAndUpdate(args.id, update, { new: true }).lean();
    if (!updated) throw notFound('Employee not found');
    return updated;
  },

  addShipment: async (_p, args, ctx) => {
    requireRole(ctx.user, ['admin']);

    const input = parseOrThrow(addShipmentSchema, args.input);

    const created = await ShipmentModel.create({
      ...input,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      assignedTo: input.assignedToId ?? null
    });

    return ShipmentModel.findById(created._id).lean();
  },

  updateShipment: async (_p, args, ctx) => {
    requireRole(ctx.user, ['admin']);

    const input = parseOrThrow(updateShipmentSchema, args.input);

    const update = { ...input };
    if ('assignedToId' in update) {
      update.assignedTo = update.assignedToId ?? null;
      delete update.assignedToId;
    }

    if ('scheduledAt' in update) {
      update.scheduledAt = update.scheduledAt ? new Date(update.scheduledAt) : null;
    }

    const updated = await ShipmentModel.findByIdAndUpdate(args.id, update, { new: true }).lean();
    if (!updated) throw notFound('Shipment not found');
    return updated;
  }
};
