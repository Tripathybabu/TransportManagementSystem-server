import jwt from 'jsonwebtoken';

export function signToken({ id, role }) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');

  return jwt.sign({ sub: String(id), role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  });
}

export async function getUserFromRequest(req) {
  const header = req.headers.authorization;
  if (!header) return null;

  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET');

  try {
    const decoded = jwt.verify(token, secret);
    return {
      id: decoded.sub,
      role: decoded.role
    };
  } catch {
    return null;
  }
}
