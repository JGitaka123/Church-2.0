import { Router } from 'express';
import { query } from '../db/pool.js';
import { requireRole } from '../auth.js';
import { genId, mapAnnouncement, wrap } from './util.js';

const router = Router();

router.get('/', wrap(async (_req, res) => {
  const { rows } = await query('SELECT * FROM announcements ORDER BY sent_at DESC');
  res.json(rows.map(mapAnnouncement));
}));

// Send a broadcast. Recipient count is computed server-side from the audience.
router.post('/', requireRole('hq_admin', 'branch_admin'), wrap(async (req, res) => {
  const { title, body, audience = 'all', channels = [] } = req.body || {};
  if (!title || !body) return res.status(400).json({ error: 'Title and message are required' });
  if (!Array.isArray(channels) || channels.length === 0) return res.status(400).json({ error: 'Pick at least one channel' });

  const countSql = audience === 'all'
    ? await query('SELECT count(*)::int AS n FROM members')
    : await query('SELECT count(*)::int AS n FROM members WHERE branch_id = $1', [audience]);
  const recipients = countSql.rows[0].n;

  const { rows } = await query(
    'INSERT INTO announcements (id,title,body,audience,channels,recipients) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
    [genId('an'), title, body, audience, channels, recipients]
  );
  res.status(201).json(mapAnnouncement(rows[0]));
}));

export default router;
