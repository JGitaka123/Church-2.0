import { Router } from 'express';
import { query } from '../db/pool.js';
import { resolveScope, requireRole } from '../auth.js';
import { genId, mapGroup, wrap } from './util.js';

const router = Router();

router.get('/', wrap(async (req, res) => {
  const scope = resolveScope(req);
  const params = []; let where = '';
  if (scope) { params.push(scope); where = 'WHERE branch_id = $1'; }
  const { rows } = await query(`SELECT * FROM groups ${where} ORDER BY name`, params);
  res.json(rows.map(mapGroup));
}));

router.post('/', requireRole('hq_admin', 'branch_admin', 'ministry_leader'), wrap(async (req, res) => {
  const scope = resolveScope(req);
  const { name, schedule, description, branchId } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Group name is required' });
  const target = scope || branchId || 'b1';
  const id = genId('g');
  const { rows } = await query(
    'INSERT INTO groups (id,branch_id,name,schedule,description,member_ids) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [id, target, name, schedule || null, description || null, []]
  );
  res.status(201).json(mapGroup(rows[0]));
}));

// Join/leave: toggles the member in the group's roster.
router.post('/:id/toggle-member', wrap(async (req, res) => {
  const { memberId } = req.body || {};
  if (!memberId) return res.status(400).json({ error: 'memberId is required' });
  const { rows } = await query('SELECT * FROM groups WHERE id=$1', [req.params.id]);
  const g = rows[0];
  if (!g) return res.status(404).json({ error: 'Group not found' });
  const ids = g.member_ids || [];
  const next = ids.includes(memberId) ? ids.filter((x) => x !== memberId) : [...ids, memberId];
  const { rows: upd } = await query('UPDATE groups SET member_ids=$1 WHERE id=$2 RETURNING *', [next, g.id]);
  res.json(mapGroup(upd[0]));
}));

export default router;
