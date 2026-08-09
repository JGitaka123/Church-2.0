import { Router } from 'express';
import { query } from '../db/pool.js';
import { resolveScope } from '../auth.js';
import { mapEvent, wrap } from './util.js';

const router = Router();

router.get('/', wrap(async (req, res) => {
  const scope = resolveScope(req);
  const params = []; let where = '';
  if (scope) { params.push(scope); where = 'WHERE branch_id = $1'; }
  const { rows } = await query(`SELECT * FROM events ${where} ORDER BY date`, params);
  res.json(rows.map(mapEvent));
}));

export default router;
