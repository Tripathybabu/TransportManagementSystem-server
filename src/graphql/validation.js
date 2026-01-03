import { z } from 'zod';

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ObjectId');

export const paginationSchema = z
  .object({
    page: z.number().int().min(1).default(1),
    pageSize: z.number().int().min(1).max(100).default(20)
  })
  .default({ page: 1, pageSize: 20 });

export const shipmentFilterSchema = z
  .object({
    status: z.string().trim().min(1).optional(),
    origin: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    assignedToId: objectId.optional()
  })
  .optional();

export const shipmentSortSchema = z
  .object({
    field: z.enum(['createdAt', 'updatedAt', 'scheduledAt', 'status', 'reference']).default('createdAt'),
    direction: z.enum(['asc', 'desc']).default('desc')
  })
  .optional();

export const addShipmentSchema = z.object({
  reference: z.string().trim().min(1),
  status: z.string().trim().min(1),
  origin: z.string().trim().min(1),
  destination: z.string().trim().min(1),
  scheduledAt: z.string().datetime().optional().nullable(),
  assignedToId: objectId.optional().nullable()
});

export const updateShipmentSchema = z
  .object({
    reference: z.string().trim().min(1).optional(),
    status: z.string().trim().min(1).optional(),
    origin: z.string().trim().min(1).optional(),
    destination: z.string().trim().min(1).optional(),
    scheduledAt: z.string().datetime().optional().nullable(),
    assignedToId: objectId.optional().nullable()
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required');

export const addEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'employee']).default('employee'),
  name: z.string().trim().min(1),
  age: z.number().int().min(0).max(150).optional().nullable(),
  class: z.string().trim().min(1).optional().nullable(),
  subjects: z.array(z.string().trim().min(1)).default([]),
  attendance: z.number().int().min(0).max(366).optional().nullable()
});

export const updateEmployeeSchema = z
  .object({
    email: z.string().email().optional(),
    password: z.string().min(8).optional(),
    role: z.enum(['admin', 'employee']).optional(),
    name: z.string().trim().min(1).optional(),
    age: z.number().int().min(0).max(150).optional().nullable(),
    class: z.string().trim().min(1).optional().nullable(),
    subjects: z.array(z.string().trim().min(1)).optional(),
    attendance: z.number().int().min(0).max(366).optional().nullable()
  })
  .refine((v) => Object.keys(v).length > 0, 'At least one field is required');

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});
