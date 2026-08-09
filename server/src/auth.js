import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export const hashPassword = (plain) => bcrypt.hash(plain, config.bcryptRounds);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

export function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role, branchId: user.branch_id, name: user.name },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// Authentication middleware: verifies the Bearer token and attaches req.user.
export function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Role gate: allow only the listed roles.
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ error: 'Insufficient permissions' });
  }
  next();
};

// Resolve the branch scope for a request. HQ admins may target any campus via
// ?branch=; everyone else is hard-locked to their own branch server-side.
// Returns null to mean "all branches" (HQ global), or a branch id string.
export function resolveScope(req) {
  if (req.user.role === 'hq_admin') {
    const target = req.query.branch;
    if (!target || target === 'global') return null; // all campuses
    return target;
  }
  return req.user.branchId; // locked to own campus
}
