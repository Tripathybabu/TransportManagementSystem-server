import { scalarResolvers } from './typeDefs.js';
import { Query } from './resolvers/queries.js';
import { Mutation } from './resolvers/mutations.js';
import { Employee, Shipment } from './resolvers/types.js';

export const resolvers = {
  ...scalarResolvers,

  Query,
  Mutation,
  Shipment,
  Employee
};
