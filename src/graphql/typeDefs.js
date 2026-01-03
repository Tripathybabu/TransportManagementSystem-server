import { DateTimeResolver } from 'graphql-scalars';

export const typeDefs = `#graphql
  scalar DateTime

  enum Role {
    admin
    employee
  }

  enum ShipmentSortField {
    createdAt
    updatedAt
    scheduledAt
    status
    reference
  }

  type Employee {
    id: ID!
    email: String!
    role: Role!

    name: String!
    age: Int
    class: String
    subjects: [String!]!
    attendance: Int

    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Shipment {
    id: ID!
    reference: String!
    status: String!
    origin: String!
    destination: String!
    scheduledAt: DateTime
    assignedTo: Employee

    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input ShipmentFilterInput {
    status: String
    origin: String
    destination: String
    assignedToId: ID
  }

  enum SortDirection {
    asc
    desc
  }

  input ShipmentSortInput {
    field: ShipmentSortField! = createdAt
    direction: SortDirection! = desc
  }

  input PaginationInput {
    page: Int! = 1
    pageSize: Int! = 20
  }

  type PageInfo {
    page: Int!
    pageSize: Int!
    totalCount: Int!
    hasNextPage: Boolean!
  }

  type ShipmentConnection {
    nodes: [Shipment!]!
    pageInfo: PageInfo!
  }

  input AddShipmentInput {
    reference: String!
    status: String!
    origin: String!
    destination: String!
    scheduledAt: DateTime
    assignedToId: ID
  }

  input UpdateShipmentInput {
    reference: String
    status: String
    origin: String
    destination: String
    scheduledAt: DateTime
    assignedToId: ID
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input AddEmployeeInput {
    email: String!
    password: String!
    role: Role! = employee

    name: String!
    age: Int
    class: String
    subjects: [String!]! = []
    attendance: Int
  }

  input UpdateEmployeeInput {
    email: String
    password: String
    role: Role

    name: String
    age: Int
    class: String
    subjects: [String!]
    attendance: Int
  }

  type AuthPayload {
    token: String!
    employee: Employee!
  }

  type Query {
    me: Employee
    listEmployees: [Employee!]!
    listShipments(
      filter: ShipmentFilterInput
      pagination: PaginationInput
      sort: ShipmentSortInput
    ): ShipmentConnection!
    shipment(id: ID!): Shipment
  }

  type Mutation {
    login(input: LoginInput!): AuthPayload!

    addEmployee(input: AddEmployeeInput!): Employee!
    updateEmployee(id: ID!, input: UpdateEmployeeInput!): Employee!

    addShipment(input: AddShipmentInput!): Shipment!
    updateShipment(id: ID!, input: UpdateShipmentInput!): Shipment!
  }
`;

export const scalarResolvers = {
  DateTime: DateTimeResolver
};
