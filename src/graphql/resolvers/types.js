export const Shipment = {
  id: (s) => String(s._id ?? s.id),
  assignedTo: async (s, _a, ctx) => {
    if (!s.assignedTo) return null;
    return ctx.loaders.employeeById.load(String(s.assignedTo));
  }
};

export const Employee = {
  id: (e) => String(e._id ?? e.id)
};
