import DataLoader from 'dataloader';
import { getUserFromRequest } from '../security/auth.js';
import { EmployeeModel } from '../models/Employee.js';

function createEmployeeLoader() {
  return new DataLoader(async (ids) => {
    const docs = await EmployeeModel.find({ _id: { $in: ids } }).lean();
    const map = new Map(docs.map((d) => [String(d._id), d]));
    return ids.map((id) => map.get(String(id)) || null);
  });
}

export async function buildContext({ req }) {
  const user = await getUserFromRequest(req);

  return {
    user,
    loaders: {
      employeeById: createEmployeeLoader()
    }
  };
}
