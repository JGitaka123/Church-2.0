import { Router } from 'express';
import { query } from '../db/pool.js';
import { resolveScope, requireRole } from '../auth.js';
import { genId, mapFollowup, wrap } from './util.js';

const router = Router();
const STAGES = ['New Guest', 'Contacted', 'Connected', 'Member'];

router.get('/', wrap(async (req, res) => {
  const scope = resolveScope(req);
  const params = []; let where = '';
  if (scope) { params.push(scope); where = 'WHERE branch_id = $1'; }
  const { rows } = await query(`SELECT * FROM followups ${where} ORDER BY created_at DESC`, params);
  res.json(rows.map(mapFollowup));
}));

router.post('/', requireRole('hq_admin', 'branch_admin', 'ministry_leader'), wrap(async (req, res) => {
  const scope = resolveScope(req);
  const { name, owner, branchId } = req.body || {};
  if (!name) return res.status(400).json({ error: 'Guest name is required' });
  const target = scope || branchId || 'b1';
  const { rows } = await query(
    'INSERT INTO followups (id,branch_id,name,stage,owner,note) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [genId('fu'), target, name, 'New Guest', owner || 'Unassigned', '']
  );
  res.status(201).json(mapFollowup(rows[0]));
}));

// Advance/regress a guest through the pipeline.
router.patch('/:id', requireRole('hq_admin', 'branch_admin', 'ministry_leader'), wrap(async (req, res) => {
  const { stage } = req.body || {};
  if (!STAGES.includes(stage)) return res.status(400).json({ error: 'Invalid stage' });
  const { rows } = await query('UPDATE followups SET stage=$1 WHERE id=$2 RETURNING *', [stage, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Follow-up not found' });
  res.json(mapFollowup(rows[0]));
}));

export default router;
