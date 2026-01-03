# Backend (GraphQL + MongoDB)

## Setup

1. Copy env file

- Copy `.env.example` to `.env`

2. Install deps

- `npm install`

3. Seed an admin (optional)

- `node src/seed/seedAdmin.js`

You can also use:

- `npm run seed:admin`

4. Seed sample data (employees + shipments)

- `npm run seed:data`

5. Run

- `npm run dev`

GraphQL endpoint:

- `http://localhost:4000/graphql`

## Authentication

- Use `login` to obtain a JWT.
- Send it on every request as:

  - `Authorization: Bearer <token>`

## RBAC (role-based access)

- **admin**

  - Can `addShipment`
  - Can `updateShipment`
  - Can list/view shipments (no restrictions)

- **employee**

  - Can `listShipments` but only shipments where `assignedTo == me`
  - Can `shipment(id)` only if the shipment is assigned to them

## Example GraphQL operations

### Login

```graphql
mutation Login {
  login(input: { email: "admin@example.com", password: "Admin@123" }) {
    token
    employee {
      id
      email
      role
      name
    }
  }
}
```

### Add employee (admin)

```graphql
mutation AddEmployee {
  addEmployee(
    input: {
      email: "employee1@example.com"
      password: "Employee@123"
      role: employee
      name: "Employee One"
      age: 22
      class: "A"
      subjects: ["Math", "Science"]
      attendance: 200
    }
  ) {
    id
    email
    role
    name
  }
}
```

### List employees (admin)

```graphql
query ListEmployees {
  listEmployees {
    id
    email
    role
    name
    subjects
    attendance
  }
}
```

### Add shipment (admin)

```graphql
mutation AddShipment {
  addShipment(
    input: {
      reference: "REF-1001"
      status: "CREATED"
      origin: "Mumbai"
      destination: "Pune"
      scheduledAt: "2026-01-01T10:00:00.000Z"
    }
  ) {
    id
    reference
    status
    origin
    destination
    scheduledAt
  }
}
```

### Update shipment (admin)

```graphql
mutation UpdateShipment {
  updateShipment(id: "<shipmentId>", input: { status: "IN_TRANSIT" }) {
    id
    reference
    status
    updatedAt
  }
}
```

### List shipments with filters + pagination + sorting

```graphql
query ListShipments {
  listShipments(
    filter: { status: "CREATED", origin: "Mumbai" }
    pagination: { page: 1, pageSize: 10 }
    sort: { field: "scheduledAt", direction: desc }
  ) {
    nodes {
      id
      reference
      status
      scheduledAt
      assignedTo {
        id
        name
      }
    }
    pageInfo {
      page
      pageSize
      totalCount
      hasNextPage
    }
  }
}
```

### Get a single shipment

```graphql
query GetShipment {
  shipment(id: "<shipmentId>") {
    id
    reference
    status
    origin
    destination
    assignedTo {
      id
      name
      email
    }
  }
}
```

## Performance considerations implemented (Node.js + MongoDB)

- **Pagination is mandatory-capped**

  - `pageSize` is capped to `100` to reduce accidental high-memory queries.

- **Indexes on common query patterns**

  - `Shipment`: `reference` (unique), `status`, `scheduledAt`, `origin`, `destination`, `assignedTo`.
  - Compound indexes included for common filter/sort patterns.

- **Use of projections/lean reads**

  - Resolver queries use `lean()` to avoid Mongoose document hydration overhead.

- **N+1 mitigation**

  - `Shipment.assignedTo` uses `DataLoader` to batch employee lookups.

- **Validation at the boundary**

  - GraphQL inputs are validated using `zod`, returning `BAD_USER_INPUT` with details.
