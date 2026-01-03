import mongoose from 'mongoose';
import { ShipmentModel } from '../../models/Shipment.js';
import { EmployeeModel } from '../../models/Employee.js';
import { requireRole } from '../../security/rbac.js';
import { forbidden, unauthenticated } from '../../security/errors.js';
import { paginationSchema, shipmentFilterSchema, shipmentSortSchema } from '../validation.js';
import { badUserInput } from '../../security/errors.js';

function buildShipmentMongoFilter({ filter, user }) {
  const mongoFilter = {};

  if (filter?.status) mongoFilter.status = filter.status;
  if (filter?.origin) mongoFilter.origin = filter.origin;
  if (filter?.destination) mongoFilter.destination = filter.destination;
  if (filter?.assignedToId) mongoFilter.assignedTo = new mongoose.Types.ObjectId(filter.assignedToId);

  if (user?.role === 'employee') {
    mongoFilter.assignedTo = new mongoose.Types.ObjectId(user.id);
  }

  return mongoFilter;
}

function normalizeSort(sort) {
  const field = sort?.field ?? 'createdAt';
  const direction = sort?.direction === 'asc' ? 1 : -1;

  const allowed = new Set(['createdAt', 'updatedAt', 'scheduledAt', 'status', 'reference']);
  return {
    [allowed.has(field) ? field : 'createdAt']: direction,
    _id: direction
  };
}

function parseOrThrow(schema, value) {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    throw badUserInput('Validation failed', parsed.error.flatten());
  }
  return parsed.data;
}

export const Query = {
  me: async (_p, _a, ctx) => {
    if (!ctx.user) return null;
    return EmployeeModel.findById(ctx.user.id).lean();
  },

  listEmployees: async (_p, _a, ctx) => {
    requireRole(ctx.user, ['admin']);
    return EmployeeModel.find({}).sort({ createdAt: -1, _id: -1 }).lean();
  },

  listShipments: async (_p, args, ctx) => {
    if (!ctx.user) throw unauthenticated();

    const filter = parseOrThrow(shipmentFilterSchema, args.filter);
    const pagination = parseOrThrow(paginationSchema, args.pagination);
    const sortInput = parseOrThrow(shipmentSortSchema, args.sort);

    const mongoFilter = buildShipmentMongoFilter({ filter, user: ctx.user });
    const { page, pageSize } = pagination;
    const sort = normalizeSort(sortInput);

    const skip = (page - 1) * pageSize;

    const [nodes, totalCount] = await Promise.all([
      ShipmentModel.find(mongoFilter).sort(sort).skip(skip).limit(pageSize).lean(),
      ShipmentModel.countDocuments(mongoFilter)
    ]);

    const hasNextPage = skip + nodes.length < totalCount;

    return {
      nodes,
      pageInfo: {
        page,
        pageSize,
        totalCount,
        hasNextPage
      }
    };
  },

  shipment: async (_p, args, ctx) => {
    if (!ctx.user) throw unauthenticated();

    const doc = await ShipmentModel.findById(args.id).lean();
    if (!doc) return null;

    if (ctx.user.role === 'employee') {
      if (!doc.assignedTo || String(doc.assignedTo) !== String(ctx.user.id)) {
        throw forbidden();
      }
    }

    return doc;
  }
};
