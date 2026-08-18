import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from './config.js';
import { query } from './db/pool.js';

export const hashPassword = (plain) => bcrypt.hash(plain, config.bcryptRounds);
export const verifyPassword = (plain, hash) => bcrypt.compare(plain, hash);

// `tv` pins the token to a specific generation of the account's session. See
// issueSession() for why.
export function signToken(user, tokenVersion) {
  return jwt.sign(
    {
      sub: user.id, email: user.email, role: user.role,
      branchId: user.branch_id, name: user.name,
      tv: tokenVersion === undefined ? (user.token_version || 0) : tokenVersion,
    },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// Start a session, ending any other session on the same account.
//
// Agreed 17 Aug 2026: one person logged in at a time. Signing in bumps the
// account's token_version, and authenticate() rejects any token carrying an
// older value — so the previous device is signed out the moment someone else
// (or the same person elsewhere) signs in. Enforced on the server, because a
// client-side check would be trivial to sidestep.
export async function issueSession(user) {
  const { rows } = await query(
    'UPDATE users SET token_version = token_version + 1 WHERE id = $1 RETURNING token_version',
    [user.id]
  );
  return signToken(user, rows[0].token_version);
}

// Authentication middleware: verifies the Bearer token, confirms it is still
// the account's current session, and attaches req.user.
export async function authenticate(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Authentication required' });

  let claims;
  try {
    claims = jwt.verify(token, config.jwtSecret);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  try {
    const { rows } = await query('SELECT token_version FROM users WHERE id = $1', [claims.sub]);
    if (!rows[0]) return res.status(401).json({ error: 'Account no longer exists' });
    if ((claims.tv || 0) !== rows[0].token_version) {
      // Signature is valid but a newer session has superseded this one.
      return res.status(401).json({
        error: 'Signed out because this account was used on another device.',
        code: 'session_superseded',
      });
    }
  } catch (e) {
    return next(e);
  }

  req.user = claims;
  next();
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
