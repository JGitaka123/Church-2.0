import { Router } from 'express';
import { query } from '../db/pool.js';
import { resolveScope, requireRole } from '../auth.js';
import { genId, mapMember, wrap } from './util.js';

const router = Router();

// List members, always scoped to the caller's permitted campus.
router.get('/', wrap(async (req, res) => {
  const scope = resolveScope(req); // null = all (HQ global) else branch id
  const search = (req.query.search || '').toString().trim().toLowerCase();
  const params = [];
  const where = [];
  if (scope) { params.push(scope); where.push(`m.branch_id = $${params.length}`); }
  if (search) {
    params.push(`%${search}%`);
    const p = `$${params.length}`;
    where.push(`(lower(m.first_name || ' ' || m.last_name) LIKE ${p} OR lower(coalesce(m.email,'')) LIKE ${p} OR coalesce(m.phone,'') LIKE ${p})`);
  }
  const sql = `SELECT m.*, b.name AS branch_name FROM members m JOIN branches b ON b.id = m.branch_id
               ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY m.last_name, m.first_name`;
  const { rows } = await query(sql, params);
  res.json(rows.map(mapMember));
}));

router.get('/:id', wrap(async (req, res) => {
  const scope = resolveScope(req);
  const { rows } = await query('SELECT m.*, b.name AS branch_name FROM members m JOIN branches b ON b.id=m.branch_id WHERE m.id=$1', [req.params.id]);
  const m = rows[0];
  if (!m) return res.status(404).json({ error: 'Member not found' });
  if (scope && m.branch_id !== scope) return res.status(403).json({ error: 'Out of scope' });
  res.json(mapMember(m));
}));

// Create a member (admins only). Branch is forced to the caller's scope unless HQ.
router.post('/', requireRole('hq_admin', 'branch_admin'), wrap(async (req, res) => {
  const scope = resolveScope(req);
  const { firstName, lastName, email, phone, volunteer_skills = [], branchId,
          maritalStatus = null, background = null, expectations = null } = req.body || {};
  if (!firstName || !lastName) return res.status(400).json({ error: 'First and last name are required' });
  const targetBranch = scope || branchId || 'b1';
  const id = genId('m');
  const { rows } = await query(
    `INSERT INTO members (id,branch_id,first_name,last_name,email,phone,volunteer_skills,engagement_score,
                          marital_status,background,expectations)
     VALUES ($1,$2,$3,$4,$5,$6,$7,60,$8,$9,$10) RETURNING *`,
    [id, targetBranch, firstName, lastName, email || null, phone || null,
     Array.isArray(volunteer_skills) ? volunteer_skills : [],
     maritalStatus || null, background || null, expectations || null]
  );
  const { rows: b } = await query('SELECT name FROM branches WHERE id=$1', [targetBranch]);
  res.status(201).json(mapMember({ ...rows[0], branch_name: b[0]?.name }));
}));

// Remove a member (administrators only, and only from their own campus).
// Agreed 17 Aug 2026: nobody below administrator may alter the roll.
router.delete('/:id', requireRole('hq_admin', 'branch_admin'), wrap(async (req, res) => {
  const scope = resolveScope(req);
  const { rows } = await query('SELECT branch_id FROM members WHERE id=$1', [req.params.id]);
  const existing = rows[0];
  if (!existing) return res.status(404).json({ error: 'Member not found' });
  if (scope && existing.branch_id !== scope) return res.status(403).json({ error: 'Out of scope' });
  // Attendance rows reference the member; clear them so the delete is clean.
  await query('DELETE FROM attendance WHERE member_id=$1', [req.params.id]);
  await query('DELETE FROM members WHERE id=$1', [req.params.id]);
  res.status(204).end();
}));

export default router;
