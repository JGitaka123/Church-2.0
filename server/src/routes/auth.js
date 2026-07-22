import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { config } from '../config.js';
import { verifyPassword, signToken, authenticate } from '../auth.js';

const router = Router();

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, branchId: u.branch_id });

// Step 1 — validate credentials. If MFA is enabled, return a short-lived ticket
// the client exchanges for a full token after entering the code.
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [String(email).toLowerCase()]);
    const user = rows[0];
    // Constant-ish response to avoid user enumeration.
    const ok = user && (await verifyPassword(password, user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' });

    if (user.mfa_enabled) {
      const ticket = jwt.sign({ sub: user.id, purpose: 'mfa' }, config.jwtSecret, { expiresIn: '5m' });
      return res.json({ mfaRequired: true, ticket });
    }
    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// Step 2 — verify the MFA code and issue the access token.
// NOTE: this is a mock TOTP check (accepts the demo code) wired for a real
// authenticator/OTP provider later — swap the code comparison for TOTP verify.
router.post('/mfa', async (req, res, next) => {
  try {
    const { ticket, code } = req.body || {};
    if (!ticket || !code) return res.status(400).json({ error: 'Ticket and code are required' });

    let payload;
    try {
      payload = jwt.verify(ticket, config.jwtSecret);
    } catch {
      return res.status(401).json({ error: 'Verification session expired — please sign in again.' });
    }
    if (payload.purpose !== 'mfa') return res.status(400).json({ error: 'Invalid ticket' });

    const expected = process.env.MFA_DEMO_CODE || '123456';
    if (String(code) !== expected) return res.status(401).json({ error: 'Incorrect code' });

    const { rows } = await query('SELECT * FROM users WHERE id = $1', [payload.sub]);
    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Account not found' });
    return res.json({ token: signToken(user), user: publicUser(user) });
  } catch (e) {
    next(e);
  }
});

// Current identity from a valid token.
router.get('/me', authenticate, (req, res) => {
  res.json({ user: { id: req.user.sub, email: req.user.email, name: req.user.name, role: req.user.role, branchId: req.user.branchId } });
});

export default router;
