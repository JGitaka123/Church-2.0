import { Router } from 'express';
import { query } from '../db/pool.js';
import { resolveScope, requireRole } from '../auth.js';
import { wrap } from './util.js';

const router = Router();

// All attendance records in scope (the client computes per-service views).
router.get('/', wrap(async (req, res) => {
  const scope = resolveScope(req);
  const params = [];
  let where = '';
  if (scope) { params.push(scope); where = 'WHERE branch_id = $1'; }
  const { rows } = await query(`SELECT * FROM attendance ${where}`, params);
  res.json(rows.map((r) => ({
    id: r.id, memberId: r.member_id, branchId: r.branch_id,
    date: r.service_date instanceof Date ? r.service_date.toISOString().split('T')[0] : r.service_date,
    present: r.present,
    arrivalMode: r.arrival_mode || '',
  })));
}));

// Toggle/record a member's attendance for a service date (upsert).
router.put('/', requireRole('hq_admin', 'branch_admin', 'ministry_leader'), wrap(async (req, res) => {
  const scope = resolveScope(req);
  const { memberId, date, present, arrivalMode = null } = req.body || {};
  if (!memberId || !date) return res.status(400).json({ error: 'memberId and date are required' });
  const { rows: m } = await query('SELECT branch_id FROM members WHERE id=$1', [memberId]);
  if (!m[0]) return res.status(404).json({ error: 'Member not found' });
  if (scope && m[0].branch_id !== scope) return res.status(403).json({ error: 'Out of scope' });

  const id = `att_${memberId}_${date}`;
  const { rows } = await query(
    `INSERT INTO attendance (id,member_id,branch_id,service_date,present,arrival_mode)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (member_id, service_date) DO UPDATE
       SET present = EXCLUDED.present, arrival_mode = EXCLUDED.arrival_mode RETURNING *`,
    [id, memberId, m[0].branch_id, date, Boolean(present), arrivalMode || null]
  );
  const r = rows[0];
  res.json({ id: r.id, memberId: r.member_id, branchId: r.branch_id, date,
             present: r.present, arrivalMode: r.arrival_mode || '' });
}));

export default router;
