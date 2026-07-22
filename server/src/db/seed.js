import bcrypt from 'bcryptjs';
import { pool, withTransaction } from './pool.js';
import { migrate } from './migrate.js';
import { config } from '../config.js';

// Seeds the demo dataset used by the app (3 campuses, 10 members, 4 login
// accounts, giving, attendance, events, groups, etc). Destructive: it wipes and
// repopulates the data tables. Run once after migrate on a fresh database.

const BRANCHES = [
  { id: 'b1', name: 'Nairobi HQ', location: 'HQ Center, Community Rd, Nairobi', code: 'NBO' },
  { id: 'b2', name: 'Dallas Branch', location: 'Plano Rd, Dallas, TX', code: 'DAL' },
  { id: 'b3', name: 'London Branch', location: 'Hyde Park Corner, London', code: 'LDN' },
];

const MEMBERS = [
  { id: 'm1', branch_id: 'b1', first_name: 'John', last_name: 'Kamau', email: 'john.kamau@church2.org', phone: '+254712345678', family_id: 'fam_kamau', family_role: 'Husband', spiritual_milestones: ['Baptized: 2018-04-12', 'Member: 2019-01-01'], volunteer_skills: ['Worship Vocals', 'Keyboard', 'Guitar'], engagement_score: 95 },
  { id: 'm2', branch_id: 'b1', first_name: 'Mary', last_name: 'Kamau', email: 'mary.kamau@church2.org', phone: '+254722345678', family_id: 'fam_kamau', family_role: 'Wife', spiritual_milestones: ['Baptized: 2019-06-20'], volunteer_skills: ['Childcare', 'Greeting'], engagement_score: 88 },
  { id: 'm3', branch_id: 'b1', first_name: 'David', last_name: 'Onyango', email: 'david.onyango@email.com', phone: '+254733333333', family_id: 'fam_onyango', family_role: 'Single', spiritual_milestones: ['Member: 2021-03-10'], volunteer_skills: ['Ushering', 'Security', 'First Aid'], engagement_score: 75 },
  { id: 'm4', branch_id: 'b1', first_name: 'Grace', last_name: 'Mwangi', email: 'grace.m@email.com', phone: '+254744444444', family_id: 'fam_mwangi', family_role: 'Single', spiritual_milestones: ['Baptized: 2022-11-05'], volunteer_skills: ['Ushering', 'Greeting'], engagement_score: 62 },
  { id: 'm5', branch_id: 'b2', first_name: 'Robert', last_name: 'Smith', email: 'robert.smith@email.com', phone: '+12145550100', family_id: 'fam_smith', family_role: 'Husband', spiritual_milestones: ['Member: 2015-05-24'], volunteer_skills: ['Sound Engineering', 'Video Editing'], engagement_score: 92 },
  { id: 'm6', branch_id: 'b2', first_name: 'Sarah', last_name: 'Smith', email: 'sarah.smith@email.com', phone: '+12145550101', family_id: 'fam_smith', family_role: 'Wife', spiritual_milestones: ['Member: 2015-05-24'], volunteer_skills: ['Worship Vocals', 'Public Speaking'], engagement_score: 78 },
  { id: 'm7', branch_id: 'b2', first_name: 'Emily', last_name: 'Watson', email: 'emily.w@email.com', phone: '+12145550222', family_id: 'fam_watson', family_role: 'Single', spiritual_milestones: ['Baptized: 2024-02-14'], volunteer_skills: ['Greeting', 'Social Media'], engagement_score: 41 },
  { id: 'm8', branch_id: 'b3', first_name: 'Michael', last_name: 'Patel', email: 'michael.patel@email.com', phone: '+442079460192', family_id: 'fam_patel', family_role: 'Single', spiritual_milestones: ['Member: 2023-09-12'], volunteer_skills: ['Graphics', 'Video Editing', 'Website Support'], engagement_score: 84 },
  { id: 'm9', branch_id: 'b3', first_name: 'Jane', last_name: 'Adair', email: 'jane.adair@email.com', phone: '+442079460234', family_id: 'fam_adair', family_role: 'Single', spiritual_milestones: [], volunteer_skills: ['Greeting', 'First Aid'], engagement_score: 35 },
  { id: 'm10', branch_id: 'b1', first_name: 'Kennedy', last_name: 'Otieno', email: 'kennedy.o@email.com', phone: '+254755555555', family_id: 'fam_otieno', family_role: 'Husband', spiritual_milestones: ['Baptized: 2010-08-15'], volunteer_skills: ['Youth Mentorship', 'Security'], engagement_score: 30 },
];

// Demo login accounts. Passwords come from SEED_PASSWORD (default "grace" for
// local dev) and are bcrypt-hashed before storage.
const USERS = [
  { email: 'admin@church2.org', name: 'HQ Administrator', role: 'hq_admin', branch_id: 'b1' },
  { email: 'dallas@church2.org', name: 'Dallas Campus Admin', role: 'branch_admin', branch_id: 'b2' },
  { email: 'worship@church2.org', name: 'Worship Leader', role: 'ministry_leader', branch_id: 'b1' },
  { email: 'john@church2.org', name: 'John Kamau', role: 'member', branch_id: 'b1' },
];

const EVENTS = [
  { id: 'e1', branch_id: 'b1', title: 'Youth Praise Night', description: 'An evening of worship, drama, and networking for young adults.', date: '2026-07-19', time: '18:00', roles_required: ['Worship Vocals', 'Keyboard', 'Guitar', 'Sound Engineering', 'Greeting'], volunteers_signed_up: ['m1'] },
  { id: 'e2', branch_id: 'b2', title: 'Dallas Community Charity Drive', description: 'Providing food, clothing, and shelter assistance to local families.', date: '2026-07-25', time: '09:00', roles_required: ['Greeting', 'First Aid', 'Security'], volunteers_signed_up: ['m6'] },
  { id: 'e3', branch_id: 'b1', title: 'HQ Sunday Worship Service', description: 'Main Sunday gathering at the HQ Center.', date: '2026-07-12', time: '10:30', roles_required: ['Ushering', 'Greeting', 'Sound Engineering', 'Worship Vocals', 'Security'], volunteers_signed_up: ['m3', 'm4'] },
];

const GROUPS = [
  { id: 'g1', branch_id: 'b1', name: 'Young Adults Life Group', schedule: 'Tue 7:00 PM', description: '20s–30s community, study & fun.', member_ids: ['m1', 'm3'] },
  { id: 'g2', branch_id: 'b1', name: 'Marriage & Family', schedule: 'Wed 6:30 PM', description: 'For couples growing together in faith.', member_ids: ['m2'] },
  { id: 'g3', branch_id: 'b2', name: "Men's Morning Prayer", schedule: 'Sat 6:00 AM', description: 'Prayer, accountability & breakfast.', member_ids: ['m5'] },
  { id: 'g4', branch_id: 'b3', name: 'Women of Grace', schedule: 'Thu 10:00 AM', description: 'Bible study & fellowship.', member_ids: ['m8'] },
];

const FOLLOWUPS = [
  { id: 'fu1', branch_id: 'b1', name: 'Peter Njoroge', stage: 'New Guest', owner: 'Pastor Joseph', note: 'Visited Sunday service, filled connect card.' },
  { id: 'fu2', branch_id: 'b1', name: 'Linda Achieng', stage: 'Contacted', owner: 'Grace Mwangi', note: 'Called; interested in a small group.' },
  { id: 'fu3', branch_id: 'b2', name: 'Tom Baker', stage: 'Connected', owner: 'Robert Smith', note: 'Joined the Tuesday home group.' },
  { id: 'fu4', branch_id: 'b3', name: 'Aisha Khan', stage: 'New Guest', owner: 'Michael Patel', note: 'First-time guest at London campus.' },
];

const PRAYERS = [
  { id: 'pr1', member_id: 'm1', member_name: 'John Kamau', branch_name: 'Nairobi HQ', text: 'Praying for my family as we plan to travel upcountry this week.', category: 'Family', route: 'Family Life & Marriage Ministry', status: 'Approved' },
  { id: 'pr2', member_id: 'm7', member_name: 'Emily Watson', branch_name: 'Dallas Branch', text: 'I am recovering from knee surgery and still in moderate pain.', category: 'Healing', route: 'Hospital & Home Care Ministry', status: 'Assigned' },
];

const CAMPAIGNS = [
  { id: 'camp1', name: 'Youth Center Renovation', goal: 8000, fund_category: 'Project Donation', branch_id: 'b1' },
];

function recentSundays(count) {
  const dates = [];
  const anchor = new Date();
  anchor.setUTCHours(0, 0, 0, 0);
  anchor.setUTCDate(anchor.getUTCDate() - anchor.getUTCDay());
  for (let i = 0; i < count; i++) {
    const d = new Date(anchor.getTime() - i * 7 * 86400000);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates.reverse();
}

async function seed() {
  await migrate();
  const password = process.env.SEED_PASSWORD || 'grace';
  const hash = await bcrypt.hash(password, config.bcryptRounds);

  await withTransaction(async (c) => {
    await c.query(`TRUNCATE branches, users, members, transactions, attendance, events, groups, followups, announcements, prayer_requests, campaigns, recurring_gifts RESTART IDENTITY CASCADE`);

    for (const b of BRANCHES) {
      await c.query('INSERT INTO branches (id,name,location,code) VALUES ($1,$2,$3,$4)', [b.id, b.name, b.location, b.code]);
    }
    for (const u of USERS) {
      await c.query('INSERT INTO users (email,password_hash,name,role,branch_id) VALUES ($1,$2,$3,$4,$5)', [u.email, hash, u.name, u.role, u.branch_id]);
    }
    for (const m of MEMBERS) {
      await c.query(
        `INSERT INTO members (id,branch_id,first_name,last_name,email,phone,family_id,family_role,engagement_score,volunteer_skills,spiritual_milestones)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [m.id, m.branch_id, m.first_name, m.last_name, m.email, m.phone, m.family_id, m.family_role, m.engagement_score, m.volunteer_skills, m.spiritual_milestones]
      );
    }

    // Transactions — ~40 over the last 14 days
    const cats = ['Tithe', 'Offering', 'Pledge', 'Project Donation'];
    const methods = ['Mobile Money', 'Credit Card', 'Bank Transfer'];
    const now = Date.now();
    for (let i = 0; i < 40; i++) {
      const m = MEMBERS[Math.floor(Math.random() * MEMBERS.length)];
      const amount = Math.floor(Math.random() * 450) + 50;
      const daysAgo = Math.floor(Math.random() * 14);
      const date = new Date(now - daysAgo * 86400000).toISOString().split('T')[0];
      await c.query(
        `INSERT INTO transactions (id,branch_id,member_id,member_name,amount,category,date,payment_method,receipt_number)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [`t_${i}`, m.branch_id, m.id, `${m.first_name} ${m.last_name}`, amount, cats[i % cats.length], date, methods[i % methods.length], `REC-2026-${10000 + i}`]
      );
    }

    // Attendance — 8 Sundays, with a recent absence streak for m7/m9/m10.
    // Insert sequentially: the transaction shares one client, so queries must
    // not overlap.
    const services = recentSundays(8);
    const streak = ['m7', 'm9', 'm10'];
    for (const m of MEMBERS) {
      const base = Math.min(0.95, Math.max(0.35, m.engagement_score / 100));
      for (let idx = 0; idx < services.length; idx++) {
        const date = services[idx];
        const recent = idx >= services.length - 3;
        const present = streak.includes(m.id) && recent ? false : Math.random() < base;
        await c.query('INSERT INTO attendance (id,member_id,branch_id,service_date,present) VALUES ($1,$2,$3,$4,$5)', [`att_${m.id}_${date}`, m.id, m.branch_id, date, present]);
      }
    }

    for (const e of EVENTS) {
      await c.query('INSERT INTO events (id,branch_id,title,description,date,time,roles_required,volunteers_signed_up) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [e.id, e.branch_id, e.title, e.description, e.date, e.time, e.roles_required, e.volunteers_signed_up]);
    }
    for (const g of GROUPS) {
      await c.query('INSERT INTO groups (id,branch_id,name,schedule,description,member_ids) VALUES ($1,$2,$3,$4,$5,$6)', [g.id, g.branch_id, g.name, g.schedule, g.description, g.member_ids]);
    }
    for (const f of FOLLOWUPS) {
      await c.query('INSERT INTO followups (id,branch_id,name,stage,owner,note) VALUES ($1,$2,$3,$4,$5,$6)', [f.id, f.branch_id, f.name, f.stage, f.owner, f.note]);
    }
    for (const p of PRAYERS) {
      await c.query('INSERT INTO prayer_requests (id,member_id,member_name,branch_name,text,category,route,status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)', [p.id, p.member_id, p.member_name, p.branch_name, p.text, p.category, p.route, p.status]);
    }
    for (const cp of CAMPAIGNS) {
      await c.query('INSERT INTO campaigns (id,name,goal,fund_category,branch_id) VALUES ($1,$2,$3,$4,$5)', [cp.id, cp.name, cp.goal, cp.fund_category, cp.branch_id]);
    }
    await c.query(
      `INSERT INTO announcements (id,title,body,audience,channels,recipients) VALUES ($1,$2,$3,$4,$5,$6)`,
      ['an1', 'Baptism Sunday — sign up now', 'We are holding a baptism service on the last Sunday of the month. Speak to a pastor or reply to register.', 'all', ['email', 'push'], 10]
    );
  });

  console.log(`✓ Seeded. Demo login password: "${password}" (set SEED_PASSWORD to override).`);
}

seed()
  .then(() => pool.end())
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  });
