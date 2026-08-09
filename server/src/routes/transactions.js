import { Router } from 'express';
import { query } from '../db/pool.js';
import { resolveScope, requireRole } from '../auth.js';
import { genId, mapTx, wrap } from './util.js';

const router = Router();

router.get('/', wrap(async (req, res) => {
  const scope = resolveScope(req);
  const params = [];
  let where = '';
  if (scope) { params.push(scope); where = `WHERE t.branch_id = $1`; }
  const { rows } = await query(
    `SELECT t.*, b.name AS branch_name FROM transactions t JOIN branches b ON b.id=t.branch_id ${where} ORDER BY t.date DESC, t.created_at DESC`,
    params
  );
  res.json(rows.map(mapTx));
}));

// Record a contribution. Admins/ministry leaders; branch forced to scope.
router.post('/', requireRole('hq_admin', 'branch_admin', 'ministry_leader', 'member'), wrap(async (req, res) => {
  const scope = resolveScope(req);
  const { memberId, amount, category, paymentMethod, date, memberName, branchId } = req.body || {};
  const amt = Number(amount);
  if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'A valid amount greater than 0 is required' });

  let targetBranch = scope || branchId || 'b1';
  let name = memberName || 'Anonymous';
  if (memberId && memberId !== 'anonymous') {
    const { rows } = await query('SELECT branch_id, first_name, last_name FROM members WHERE id=$1', [memberId]);
    if (rows[0]) { targetBranch = scope || rows[0].branch_id; name = `${rows[0].first_name} ${rows[0].last_name}`; }
  }
  const id = genId('t');
  const receipt = `REC-2026-${Math.floor(Math.random() * 90000) + 10000}`;
  const { rows } = await query(
    `INSERT INTO transactions (id,branch_id,member_id,member_name,amount,category,date,payment_method,receipt_number)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [id, targetBranch, memberId && memberId !== 'anonymous' ? memberId : null, name, amt, category || 'Offering', date || new Date().toISOString().split('T')[0], paymentMethod || 'Cash', receipt]
  );
  const { rows: b } = await query('SELECT name FROM branches WHERE id=$1', [targetBranch]);
  res.status(201).json(mapTx({ ...rows[0], branch_name: b[0]?.name }));
}));

export default router;
