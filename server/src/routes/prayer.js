import { Router } from 'express';
import { query } from '../db/pool.js';
import { resolveScope, requireRole } from '../auth.js';
import { genId, mapPrayer, wrap } from './util.js';

const router = Router();

// Prayer requests are scoped by campus (sensitive pastoral content).
router.get('/', wrap(async (req, res) => {
  const scope = resolveScope(req);
  let where = ''; const params = [];
  if (scope) {
    const { rows: b } = await query('SELECT name FROM branches WHERE id=$1', [scope]);
    params.push(b[0]?.name || '');
    where = 'WHERE branch_name = $1';
  }
  const { rows } = await query(`SELECT * FROM prayer_requests ${where} ORDER BY created_at DESC`, params);
  res.json(rows.map(mapPrayer));
}));

// Members submit prayer requests from the mobile app.
router.post('/', wrap(async (req, res) => {
  const { memberId, memberName, branchName, text, category, route } = req.body || {};
  if (!text) return res.status(400).json({ error: 'Prayer text is required' });
  const { rows } = await query(
    `INSERT INTO prayer_requests (id,member_id,member_name,branch_name,text,category,route,status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,'Assigned') RETURNING *`,
    [genId('pr'), memberId || null, memberName || 'Member', branchName || 'Nairobi CBD', text, category || 'General', route || 'Pastoral Care Team']
  );
  res.status(201).json(mapPrayer(rows[0]));
}));

// Approve/dismiss removes it from the active inbox.
router.delete('/:id', requireRole('hq_admin', 'branch_admin', 'ministry_leader'), wrap(async (req, res) => {
  await query('DELETE FROM prayer_requests WHERE id=$1', [req.params.id]);
  res.json({ ok: true });
}));

export default router;
