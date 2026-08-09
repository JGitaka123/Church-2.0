import crypto from 'node:crypto';

// Prefix + short random id, stable and URL-safe.
export const genId = (prefix) => `${prefix}_${crypto.randomBytes(8).toString('hex')}`;

// Row mappers: DB snake_case -> API camelCase (matches the frontend's shapes).
export const mapMember = (r) => ({
  id: r.id, branchId: r.branch_id, firstName: r.first_name, lastName: r.last_name,
  email: r.email, phone: r.phone, familyId: r.family_id, familyRole: r.family_role,
  engagement_score: r.engagement_score, volunteer_skills: r.volunteer_skills || [],
  spiritualMilestones: r.spiritual_milestones || [],
  branchName: r.branch_name || undefined,
});

export const mapTx = (r) => ({
  id: r.id, branchId: r.branch_id, branchName: r.branch_name || undefined, memberId: r.member_id,
  memberName: r.member_name, amount: Number(r.amount), category: r.category,
  date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
  paymentMethod: r.payment_method, receiptNumber: r.receipt_number,
});

export const mapGroup = (r) => ({
  id: r.id, branchId: r.branch_id, name: r.name, schedule: r.schedule,
  description: r.description, memberIds: r.member_ids || [],
});

export const mapFollowup = (r) => ({
  id: r.id, branchId: r.branch_id, name: r.name, stage: r.stage, owner: r.owner, note: r.note,
});

export const mapAnnouncement = (r) => ({
  id: r.id, title: r.title, body: r.body, audience: r.audience, channels: r.channels || [],
  recipients: r.recipients, sentAt: r.sent_at,
});

export const mapPrayer = (r) => ({
  id: r.id, memberId: r.member_id, memberName: r.member_name, branchName: r.branch_name,
  text: r.text, category: r.category, route: r.route, status: r.status,
});

export const mapEvent = (r) => ({
  id: r.id, branchId: r.branch_id, title: r.title, description: r.description,
  date: r.date instanceof Date ? r.date.toISOString().split('T')[0] : r.date,
  time: r.time, rolesRequired: r.roles_required || [], volunteersSignedUp: r.volunteers_signed_up || [],
});

// Wrap an async route so thrown errors reach the error middleware.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
