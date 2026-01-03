export function requireRole(user, allowedRoles) {
  if (!user) {
    const err = new Error('Unauthorized');
    err.code = 'UNAUTHENTICATED';
    throw err;
  }
  if (!allowedRoles.includes(user.role)) {
    const err = new Error('Forbidden');
    err.code = 'FORBIDDEN';
    throw err;
  }
}
