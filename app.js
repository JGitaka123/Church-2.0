// Church 2.0 Main Application Controller
// Handles global state, CRUD operations, rendering, and Chart.js visualization

// ---- Rendering helpers -------------------------------------------------------
// esc(): escape untrusted text before it is interpolated into innerHTML. Every
// member name, email, phone, prayer request, chat message, and sermon note is
// user-controlled, so it MUST pass through esc() to prevent stored XSS.
function esc(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// mdInline(): fully escape first, then apply a tiny, safe Markdown subset so the
// AI engine's **bold**/*italic*/`code` render as HTML instead of literal asterisks.
function mdInline(text) {
    return esc(text)
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/\*([^*\n]+)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
}

// renderMarkdown(): block-level rendering for multi-line AI output — paragraphs,
// bullet lists ("- " or "• "), and line breaks. Safe: all text is escaped.
function renderMarkdown(text) {
    const lines = String(text == null ? '' : text).split('\n');
    let html = '';
    let inList = false;
    lines.forEach((line) => {
        const trimmed = line.trim();
        const bullet = trimmed.match(/^[-•]\s+(.*)$/);
        if (bullet) {
            if (!inList) { html += '<ul class="md-list">'; inList = true; }
            html += `<li>${mdInline(bullet[1])}</li>`;
        } else {
            if (inList) { html += '</ul>'; inList = false; }
            if (trimmed.length) html += `<p class="md-p">${mdInline(trimmed)}</p>`;
        }
    });
    if (inList) html += '</ul>';
    return html;
}

// Initialize Global State
const ChurchApp = {
    // 1. Centralized Mock Database
    db: {
        branches: [
            { id: 'b1', name: 'Nairobi HQ', location: 'HQ Center, Community Rd, Nairobi', code: 'NBO' },
            { id: 'b2', name: 'Dallas Branch', location: 'Plano Rd, Dallas, TX', code: 'DAL' },
            { id: 'b3', name: 'London Branch', location: 'Hyde Park Corner, London', code: 'LDN' }
        ],
        members: [
            { id: 'm1', branchId: 'b1', branchName: 'Nairobi HQ', firstName: 'John', lastName: 'Kamau', email: 'john.kamau@church2.org', phone: '+254712345678', familyId: 'fam_kamau', familyRole: 'Husband', spiritualMilestones: ['Baptized: 2018-04-12', 'Member: 2019-01-01'], volunteer_skills: ['Worship Vocals', 'Keyboard', 'Guitar'], engagement_score: 95 },
            { id: 'm2', branchId: 'b1', branchName: 'Nairobi HQ', firstName: 'Mary', lastName: 'Kamau', email: 'mary.kamau@church2.org', phone: '+254722345678', familyId: 'fam_kamau', familyRole: 'Wife', spiritualMilestones: ['Baptized: 2019-06-20'], volunteer_skills: ['Childcare', 'Greeting'], engagement_score: 88 },
            { id: 'm3', branchId: 'b1', branchName: 'Nairobi HQ', firstName: 'David', lastName: 'Onyango', email: 'david.onyango@email.com', phone: '+254733333333', familyId: 'fam_onyango', familyRole: 'Single', spiritualMilestones: ['Member: 2021-03-10'], volunteer_skills: ['Ushering', 'Security', 'First Aid'], engagement_score: 75 },
            { id: 'm4', branchId: 'b1', branchName: 'Nairobi HQ', firstName: 'Grace', lastName: 'Mwangi', email: 'grace.m@email.com', phone: '+254744444444', familyId: 'fam_mwangi', familyRole: 'Single', spiritualMilestones: ['Baptized: 2022-11-05'], volunteer_skills: ['Ushering', 'Greeting'], engagement_score: 62 },
            { id: 'm5', branchId: 'b2', branchName: 'Dallas Branch', firstName: 'Robert', lastName: 'Smith', email: 'robert.smith@email.com', phone: '+12145550100', familyId: 'fam_smith', familyRole: 'Husband', spiritualMilestones: ['Member: 2015-05-24'], volunteer_skills: ['Sound Engineering', 'Video Editing'], engagement_score: 92 },
            { id: 'm6', branchId: 'b2', branchName: 'Dallas Branch', firstName: 'Sarah', lastName: 'Smith', email: 'sarah.smith@email.com', phone: '+12145550101', familyId: 'fam_smith', familyRole: 'Wife', spiritualMilestones: ['Member: 2015-05-24'], volunteer_skills: ['Worship Vocals', 'Public Speaking'], engagement_score: 78 },
            { id: 'm7', branchId: 'b2', branchName: 'Dallas Branch', firstName: 'Emily', lastName: 'Watson', email: 'emily.w@email.com', phone: '+12145550222', familyId: 'fam_watson', familyRole: 'Single', spiritualMilestones: ['Baptized: 2024-02-14'], volunteer_skills: ['Greeting', 'Social Media'], engagement_score: 41 }, // Flagged at risk
            { id: 'm8', branchId: 'b3', branchName: 'London Branch', firstName: 'Michael', lastName: 'Patel', email: 'michael.patel@email.com', phone: '+442079460192', familyId: 'fam_patel', familyRole: 'Single', spiritualMilestones: ['Member: 2023-09-12'], volunteer_skills: ['Graphics', 'Video Editing', 'Website Support'], engagement_score: 84 },
            { id: 'm9', branchId: 'b3', branchName: 'London Branch', firstName: 'Jane', lastName: 'Adair', email: 'jane.adair@email.com', phone: '+442079460234', familyId: 'fam_adair', familyRole: 'Single', spiritualMilestones: [], volunteer_skills: ['Greeting', 'First Aid'], engagement_score: 35 }, // Flagged at risk
            { id: 'm10', branchId: 'b1', branchName: 'Nairobi HQ', firstName: 'Kennedy', lastName: 'Otieno', email: 'kennedy.o@email.com', phone: '+254755555555', familyId: 'fam_otieno', familyRole: 'Husband', spiritualMilestones: ['Baptized: 2010-08-15'], volunteer_skills: ['Youth Mentorship', 'Security'], engagement_score: 30 } // Flagged at risk
        ],
        transactions: [],
        attendance: [],
        recurringGifts: [],
        campaigns: [
            { id: 'camp1', name: 'Youth Center Renovation', goal: 8000, fundCategory: 'Project Donation', branchId: 'b1' }
        ],
        followUps: [
            { id: 'fu1', name: 'Peter Njoroge', branchId: 'b1', stage: 'New Guest', owner: 'Pastor Joseph', note: 'Visited Sunday service, filled connect card.' },
            { id: 'fu2', name: 'Linda Achieng', branchId: 'b1', stage: 'Contacted', owner: 'Grace Mwangi', note: 'Called; interested in a small group.' },
            { id: 'fu3', name: 'Tom Baker', branchId: 'b2', stage: 'Connected', owner: 'Robert Smith', note: 'Joined the Tuesday home group.' },
            { id: 'fu4', name: 'Aisha Khan', branchId: 'b3', stage: 'New Guest', owner: 'Michael Patel', note: 'First-time guest at London campus.' }
        ],
        groups: [
            { id: 'g1', name: 'Young Adults Life Group', branchId: 'b1', schedule: 'Tue 7:00 PM', description: "20s–30s community, study & fun.", memberIds: ['m1', 'm3'] },
            { id: 'g2', name: 'Marriage & Family', branchId: 'b1', schedule: 'Wed 6:30 PM', description: 'For couples growing together in faith.', memberIds: ['m2'] },
            { id: 'g3', name: "Men's Morning Prayer", branchId: 'b2', schedule: 'Sat 6:00 AM', description: 'Prayer, accountability & breakfast.', memberIds: ['m5'] },
            { id: 'g4', name: 'Women of Grace', branchId: 'b3', schedule: 'Thu 10:00 AM', description: 'Bible study & fellowship.', memberIds: ['m8'] }
        ],
        announcements: [
            { id: 'an1', title: 'Baptism Sunday — sign up now', body: 'We are holding a baptism service on the last Sunday of the month. Speak to a pastor or reply to register.', audience: 'all', channels: ['email', 'push'], recipients: 10, sentAt: '2026-07-06T09:00:00Z' }
        ],
        readingPlans: [
            { id: 'rp1', title: '7 Days of Peace', emoji: '🕊️', days: [
                { ref: 'John 14:27', text: 'Peace I leave with you; my peace I give to you.' },
                { ref: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in everything by prayer... present your requests to God.' },
                { ref: 'Isaiah 26:3', text: 'You keep him in perfect peace whose mind is stayed on you.' },
                { ref: 'Psalm 4:8', text: 'In peace I will both lie down and sleep; for you alone, O Lord, make me dwell in safety.' },
                { ref: 'Matthew 11:28', text: 'Come to me, all who labor and are heavy laden, and I will give you rest.' },
                { ref: 'Colossians 3:15', text: 'Let the peace of Christ rule in your hearts.' },
                { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace in believing.' }
            ]},
            { id: 'rp2', title: 'Foundations of Faith', emoji: '🌱', days: [
                { ref: 'Hebrews 11:1', text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.' },
                { ref: 'Ephesians 2:8', text: 'For by grace you have been saved through faith.' },
                { ref: 'Romans 10:17', text: 'So faith comes from hearing, and hearing through the word of Christ.' },
                { ref: 'James 2:17', text: 'So also faith by itself, if it does not have works, is dead.' },
                { ref: 'Mark 11:24', text: 'Whatever you ask in prayer, believe that you have received it, and it will be yours.' }
            ]}
        ],
        readingState: {},
        events: [
            { id: 'e1', branchId: 'b1', title: 'Youth Praise Night', description: 'An evening of worship, drama, and networking for young adults.', date: '2026-07-19', time: '18:00', rolesRequired: ['Worship Vocals', 'Keyboard', 'Guitar', 'Sound Engineering', 'Greeting'], volunteersSignedUp: ['m1'] },
            { id: 'e2', branchId: 'b2', title: 'Dallas Community Charity Drive', description: 'Providing food, clothing, and shelter assistance to local families.', date: '2026-07-25', time: '09:00', rolesRequired: ['Greeting', 'First Aid', 'Security'], volunteersSignedUp: ['m6'] },
            { id: 'e3', branchId: 'b1', title: 'HQ Sunday Worship Service', description: 'Main Sunday gathering at the HQ Center.', date: '2026-07-12', time: '10:30', rolesRequired: ['Ushering', 'Greeting', 'Sound Engineering', 'Worship Vocals', 'Security'], volunteersSignedUp: ['m3', 'm4'] }
        ],
        sermons: [
            { id: 's1', title: 'Walking by Faith, Not by Sight', preacher: 'Senior Pastor Joseph', date: '2026-07-05', branchName: 'Nairobi HQ', thumbnail: 'sermon_faith', duration: '42:15', mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
            { id: 's2', title: 'The Heart of a Faithful Steward', preacher: 'Pastor Robert Smith', date: '2026-06-28', branchName: 'Dallas Branch', thumbnail: 'sermon_steward', duration: '38:40', mediaUrl: 'https://www.w3schools.com/html/movie.mp4' }
        ],
        prayerRequests: [
            { id: 'pr1', memberId: 'm1', memberName: 'John Kamau', branchName: 'Nairobi HQ', text: 'Praying for my family as we plan to travel upcountry this week.', category: 'Family', route: 'Family Life & Marriage Ministry', status: 'Approved', timestamp: '2026-07-10T14:30:00Z' },
            { id: 'pr2', memberId: 'm7', memberName: 'Emily Watson', branchName: 'Dallas Branch', text: 'I am recovering from knee surgery and still in moderate pain.', category: 'Healing', route: 'Hospital & Home Care Ministry', status: 'Assigned', timestamp: '2026-07-11T09:15:00Z' }
        ]
    },

    // 2. Active Session Configuration
    session: {
        currentRole: 'hq_admin', // hq_admin, branch_admin, ministry_leader, member
        currentBranch: 'b1',
        activeTab: 'admin_dashboard', // dashboard, directory, financials, ministry, communications, settings, mobile_preview
        mfaVerified: true,
        selectedMemberId: null,
        selectedEventId: 'e3',
        simulatedMobileView: 'home', // home, sermons, bible, give, serve, chat
        bibleVersion: 'ESV'
    },

    // 3. Application Charts (Chart.js references)
    charts: {},

    // Demo accounts for the mock auth gate. In a real deployment these live in
    // a backend identity store; here they map a login to a role for RBAC.
    DEMO_USERS: [
        { email: 'admin@church2.org', password: 'grace', name: 'HQ Administrator', role: 'hq_admin', branchId: 'b1' },
        { email: 'dallas@church2.org', password: 'grace', name: 'Dallas Campus Admin', role: 'branch_admin', branchId: 'b2' },
        { email: 'worship@church2.org', password: 'grace', name: 'Worship Leader', role: 'ministry_leader', branchId: 'b1' },
        { email: 'john@church2.org', password: 'grace', name: 'John Kamau', role: 'member', branchId: 'b1' }
    ],

    // RBAC: which tabs each role may access. Enforced in renderAll — not just
    // hidden in the nav, so a member cannot reach an admin panel by any route.
    ROLE_TABS: {
        hq_admin: ['admin_dashboard', 'admin_directory', 'admin_financials', 'admin_attendance', 'admin_ministry', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'],
        branch_admin: ['admin_dashboard', 'admin_directory', 'admin_financials', 'admin_attendance', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'],
        ministry_leader: ['admin_dashboard', 'admin_attendance', 'admin_ministry', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'],
        member: ['mobile_preview']
    },

    // 4. Initialize Data & Render
    init() {
        this.loadDB();
        this.loadTheme();
        this.setupEventHandlers();

        // Auth gate: restore a saved session, else show the login screen.
        const session = this.loadSession();
        if (session) {
            this.applyUser(session);
            this.showApp();
            this.renderAll();
        } else {
            this.showAuthScreen('credentials');
        }

        // Register PWA Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('./sw.js').then((reg) => {
                    console.log('ServiceWorker registration successful with scope: ', reg.scope);
                }).catch((err) => {
                    console.error('ServiceWorker registration failed: ', err);
                });
            });
        }
    },

    // Persistence: Save state
    saveDB() {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('church2_db', JSON.stringify(this.db));
        }
    },

    // Persistence: Load state
    loadDB() {
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('church2_db');
            if (saved) {
                try {
                    this.db = JSON.parse(saved);
                    this.ensureSchema();
                    return;
                } catch (e) {
                    console.error("Error parsing saved DB:", e);
                }
            }
        }
        // Fallback: generate and save
        this.generateInitialTransactions();
        this.generateInitialAttendance();
        this.saveDB();
    },

    // Backfill collections added in later versions onto an older saved DB so
    // renderers never hit undefined. Attendance was added in v2.
    ensureSchema() {
        let changed = false;
        if (!Array.isArray(this.db.transactions)) { this.db.transactions = []; changed = true; }
        if (!Array.isArray(this.db.events)) { this.db.events = []; changed = true; }
        if (!Array.isArray(this.db.sermons)) { this.db.sermons = []; changed = true; }
        if (!Array.isArray(this.db.prayerRequests)) { this.db.prayerRequests = []; changed = true; }
        if (!Array.isArray(this.db.recurringGifts)) { this.db.recurringGifts = []; changed = true; }
        if (!Array.isArray(this.db.campaigns)) {
            this.db.campaigns = [{ id: 'camp1', name: 'Youth Center Renovation', goal: 8000, fundCategory: 'Project Donation', branchId: 'b1' }];
            changed = true;
        }
        if (!Array.isArray(this.db.followUps)) {
            this.db.followUps = [
                { id: 'fu1', name: 'Peter Njoroge', branchId: 'b1', stage: 'New Guest', owner: 'Pastor Joseph', note: 'Visited Sunday service, filled connect card.' },
                { id: 'fu2', name: 'Linda Achieng', branchId: 'b1', stage: 'Contacted', owner: 'Grace Mwangi', note: 'Called; interested in a small group.' },
                { id: 'fu3', name: 'Tom Baker', branchId: 'b2', stage: 'Connected', owner: 'Robert Smith', note: 'Joined the Tuesday home group.' },
                { id: 'fu4', name: 'Aisha Khan', branchId: 'b3', stage: 'New Guest', owner: 'Michael Patel', note: 'First-time guest at London campus.' }
            ];
            changed = true;
        }
        if (!Array.isArray(this.db.groups)) {
            this.db.groups = [
                { id: 'g1', name: 'Young Adults Life Group', branchId: 'b1', schedule: 'Tue 7:00 PM', description: "20s–30s community, study & fun.", memberIds: ['m1', 'm3'] },
                { id: 'g2', name: 'Marriage & Family', branchId: 'b1', schedule: 'Wed 6:30 PM', description: 'For couples growing together in faith.', memberIds: ['m2'] },
                { id: 'g3', name: "Men's Morning Prayer", branchId: 'b2', schedule: 'Sat 6:00 AM', description: 'Prayer, accountability & breakfast.', memberIds: ['m5'] },
                { id: 'g4', name: 'Women of Grace', branchId: 'b3', schedule: 'Thu 10:00 AM', description: 'Bible study & fellowship.', memberIds: ['m8'] }
            ];
            changed = true;
        }
        if (!Array.isArray(this.db.announcements)) {
            this.db.announcements = [
                { id: 'an1', title: 'Baptism Sunday — sign up now', body: 'We are holding a baptism service on the last Sunday of the month. Speak to a pastor or reply to register.', audience: 'all', channels: ['email', 'push'], recipients: 10, sentAt: '2026-07-06T09:00:00Z' }
            ];
            changed = true;
        }
        if (!Array.isArray(this.db.readingPlans)) {
            this.db.readingPlans = [
                { id: 'rp1', title: '7 Days of Peace', emoji: '🕊️', days: [
                    { ref: 'John 14:27', text: 'Peace I leave with you; my peace I give to you.' },
                    { ref: 'Philippians 4:6-7', text: 'Do not be anxious about anything, but in everything by prayer... present your requests to God.' },
                    { ref: 'Isaiah 26:3', text: 'You keep him in perfect peace whose mind is stayed on you.' },
                    { ref: 'Psalm 4:8', text: 'In peace I will both lie down and sleep; for you alone, O Lord, make me dwell in safety.' },
                    { ref: 'Matthew 11:28', text: 'Come to me, all who labor and are heavy laden, and I will give you rest.' },
                    { ref: 'Colossians 3:15', text: 'Let the peace of Christ rule in your hearts.' },
                    { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace in believing.' }
                ]},
                { id: 'rp2', title: 'Foundations of Faith', emoji: '🌱', days: [
                    { ref: 'Hebrews 11:1', text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.' },
                    { ref: 'Ephesians 2:8', text: 'For by grace you have been saved through faith.' },
                    { ref: 'Romans 10:17', text: 'So faith comes from hearing, and hearing through the word of Christ.' },
                    { ref: 'James 2:17', text: 'So also faith by itself, if it does not have works, is dead.' },
                    { ref: 'Mark 11:24', text: 'Whatever you ask in prayer, believe that you have received it, and it will be yours.' }
                ]}
            ];
            changed = true;
        }
        if (!this.db.readingState || typeof this.db.readingState !== 'object' || Array.isArray(this.db.readingState)) {
            this.db.readingState = {};
            changed = true;
        }
        if (!Array.isArray(this.db.attendance) || this.db.attendance.length === 0) {
            this.generateInitialAttendance();
            changed = true;
        }
        if (changed) this.saveDB();
    },

    // The Sundays we hold services on — most recent `count`, oldest first.
    getRecentServiceDates(count) {
        const dates = [];
        const anchor = new Date();
        anchor.setHours(0, 0, 0, 0);
        anchor.setDate(anchor.getDate() - anchor.getDay()); // back to most recent Sunday
        for (let i = 0; i < count; i++) {
            const d = new Date(anchor.getTime() - i * 7 * 24 * 60 * 60 * 1000);
            dates.push(d.toISOString().split('T')[0]);
        }
        return dates.reverse();
    },

    // Theme: Load state
    loadTheme() {
        if (typeof localStorage !== 'undefined') {
            const savedTheme = localStorage.getItem('church2_theme') || 'dark';
            document.body.className = savedTheme === 'dark' ? '' : 'theme-' + savedTheme;
            const themeSelect = document.getElementById('interface-theme-select');
            if (themeSelect) themeSelect.value = savedTheme;
        }
    },

    // ---- Auth gate (mock login + MFA + RBAC) --------------------------------
    loadSession() {
        if (typeof localStorage === 'undefined') return null;
        try {
            const raw = localStorage.getItem('church2_session');
            return raw ? JSON.parse(raw) : null;
        } catch (e) { return null; }
    },

    saveSession(user) {
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('church2_session', JSON.stringify(user));
        }
    },

    applyUser(user) {
        this.session.currentUser = user;
        this.session.currentRole = user.role;
        this.session.currentBranch = user.role === 'hq_admin' ? 'b1' : user.branchId;
        this.session.mfaVerified = true;
        this.session.activeTab = user.role === 'member' ? 'mobile_preview' : 'admin_dashboard';
        // Reflect the signed-in role in the simulator dropdown.
        const roleSel = document.getElementById('role-simulator-select');
        if (roleSel) roleSel.value = user.role;
    },

    showApp() {
        const auth = document.getElementById('auth-screen');
        const app = document.getElementById('app-container');
        if (auth) auth.style.display = 'none';
        if (app) app.style.display = 'flex';
    },

    showAuthScreen(step, ctx) {
        const auth = document.getElementById('auth-screen');
        const app = document.getElementById('app-container');
        if (app) app.style.display = 'none';
        if (!auth) return;
        auth.style.display = 'flex';

        if (step === 'mfa') {
            auth.innerHTML = `
                <div class="auth-card">
                    <div class="auth-brand"><span class="auth-logo">✝</span><span>Church 2.0</span></div>
                    <h2 class="auth-title">Two-factor verification</h2>
                    <p class="auth-sub">We texted a 6-digit code to the phone on file for <strong>${esc(ctx.email)}</strong>. Enter it to continue. <span class="auth-hint">(demo code: 123456)</span></p>
                    <form id="mfa-form" class="auth-form">
                        <input type="text" id="mfa-code" class="auth-input" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code" aria-label="6-digit code" required>
                        <p id="auth-error" class="auth-error" role="alert"></p>
                        <button type="submit" class="auth-btn">Verify &amp; sign in</button>
                        <button type="button" class="auth-link" id="mfa-back">← Back to login</button>
                    </form>
                </div>`;
            document.getElementById('mfa-form').onsubmit = (e) => { e.preventDefault(); this.handleMfa(ctx); };
            document.getElementById('mfa-back').onclick = () => this.showAuthScreen('credentials');
            document.getElementById('mfa-code').focus();
            return;
        }

        // credentials step
        auth.innerHTML = `
            <div class="auth-card">
                <div class="auth-brand"><span class="auth-logo">✝</span><span>Church 2.0</span></div>
                <h2 class="auth-title">Sign in to your ministry console</h2>
                <p class="auth-sub">Secure access to your church's data.</p>
                <form id="login-form" class="auth-form">
                    <label class="auth-label" for="login-email">Email</label>
                    <input type="email" id="login-email" class="auth-input" placeholder="you@church2.org" autocomplete="username" required>
                    <label class="auth-label" for="login-password">Password</label>
                    <input type="password" id="login-password" class="auth-input" placeholder="••••••••" autocomplete="current-password" required>
                    <p id="auth-error" class="auth-error" role="alert"></p>
                    <button type="submit" class="auth-btn">Continue</button>
                </form>
                <div class="auth-demo">
                    <span>Demo accounts (password <code>grace</code>):</span>
                    <div class="auth-demo-chips">
                        <button type="button" class="auth-demo-chip" data-email="admin@church2.org">HQ Admin</button>
                        <button type="button" class="auth-demo-chip" data-email="dallas@church2.org">Branch Admin</button>
                        <button type="button" class="auth-demo-chip" data-email="worship@church2.org">Ministry Leader</button>
                        <button type="button" class="auth-demo-chip" data-email="john@church2.org">Member</button>
                    </div>
                </div>
            </div>`;
        document.getElementById('login-form').onsubmit = (e) => { e.preventDefault(); this.handleLogin(); };
        auth.querySelectorAll('.auth-demo-chip').forEach(chip => {
            chip.onclick = () => {
                document.getElementById('login-email').value = chip.dataset.email;
                document.getElementById('login-password').value = 'grace';
            };
        });
    },

    handleLogin() {
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const err = document.getElementById('auth-error');
        const user = this.DEMO_USERS.find(u => u.email === email && u.password === password);
        if (!user) {
            if (err) err.textContent = 'Invalid email or password. Try a demo account below.';
            return;
        }
        // Proceed to MFA step.
        this.showAuthScreen('mfa', { email: user.email });
    },

    handleMfa(ctx) {
        const code = (document.getElementById('mfa-code').value || '').trim();
        const err = document.getElementById('auth-error');
        if (!/^\d{6}$/.test(code)) {
            if (err) err.textContent = 'Enter the 6-digit code.';
            return;
        }
        // Mock verification accepts the demo code.
        if (code !== '123456') {
            if (err) err.textContent = 'Incorrect code. (demo code: 123456)';
            return;
        }
        const user = this.DEMO_USERS.find(u => u.email === ctx.email);
        this.saveSession(user);
        this.applyUser(user);
        this.showApp();
        this.renderAll();
        this.toast(`Welcome, ${user.name}. 👋`);
    },

    logout() {
        if (typeof localStorage !== 'undefined') localStorage.removeItem('church2_session');
        this.session.currentUser = null;
        this.showAuthScreen('credentials');
    },

    // Helper: Generate historical transactions over the last 14 days
    generateInitialTransactions() {
        const categories = ['Tithe', 'Offering', 'Pledge', 'Project Donation'];
        const methods = ['Mobile Money', 'Credit Card', 'Bank Transfer'];
        const now = new Date();

        // Generate ~40 historical transactions
        for (let i = 0; i < 40; i++) {
            const memberIndex = Math.floor(Math.random() * this.db.members.length);
            const member = this.db.members[memberIndex];
            const amount = Math.floor(Math.random() * 450) + 50;
            const category = categories[Math.floor(Math.random() * categories.length)];
            const method = methods[Math.floor(Math.random() * methods.length)];
            
            // Random date in the last 14 days
            const daysAgo = Math.floor(Math.random() * 14);
            const txDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
            
            this.db.transactions.push({
                id: `t_${i}`,
                branchId: member.branchId,
                branchName: member.branchName,
                memberId: member.id,
                memberName: `${member.firstName} ${member.lastName}`,
                amount: amount,
                category: category,
                date: txDate.toISOString().split('T')[0],
                paymentMethod: method,
                receiptNumber: `REC-2026-${10000 + i}`
            });
        }
        
        // Sort transactions by date descending
        this.db.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    },

    // Helper: Seed real attendance records over the last 8 Sundays. These records
    // are the single source of truth for all attendance analytics — the dashboard
    // and AI briefing read them, never a random number.
    generateInitialAttendance() {
        this.db.attendance = [];
        const services = this.getRecentServiceDates(8); // oldest -> newest
        // Members deliberately given a recent absence streak so at-risk detection
        // has something real to surface.
        const streakIds = ['m7', 'm9', 'm10'];

        this.db.members.forEach(member => {
            const base = Math.min(0.95, Math.max(0.35, (member.engagement_score || 60) / 100));
            services.forEach((date, idx) => {
                const isRecent = idx >= services.length - 3; // last 3 services
                let present;
                if (streakIds.includes(member.id) && isRecent) {
                    present = false; // guaranteed 3-service absence streak
                } else {
                    present = Math.random() < base;
                }
                this.db.attendance.push({
                    id: `att_${member.id}_${date}`,
                    memberId: member.id,
                    branchId: member.branchId,
                    date,
                    present
                });
            });
        });
    },

    // 5. Setup Action Listeners
    setupEventHandlers() {
        // Interface Theme Switcher
        const themeSelectEl = document.getElementById('interface-theme-select');
        if (themeSelectEl) {
            themeSelectEl.addEventListener('change', (e) => {
                const theme = e.target.value;
                document.body.className = theme === 'dark' ? '' : 'theme-' + theme;
                if (typeof localStorage !== 'undefined') {
                    localStorage.setItem('church2_theme', theme);
                }
            });
        }

        // Role Selector Change
        document.getElementById('role-simulator-select').addEventListener('change', (e) => {
            this.session.currentRole = e.target.value;
            
            // Auto update active tab depending on role
            if (this.session.currentRole === 'member') {
                this.session.activeTab = 'mobile_preview';
            } else if (this.session.activeTab === 'mobile_preview') {
                this.session.activeTab = 'admin_dashboard';
            }
            
            this.renderAll();
        });

        // Branch Switcher Change
        document.getElementById('global-branch-select').addEventListener('change', (e) => {
            this.session.currentBranch = e.target.value;
            this.renderAll();
        });

        // Sidebar Navigation links
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(n => n.classList.remove('active'));
                link.classList.add('active');
                this.session.activeTab = link.dataset.tab;
                this.renderAll();
            });
        });

        // Search Bar Event
        document.getElementById('member-search-input').addEventListener('input', () => {
            this.renderMemberDirectory();
        });
        document.getElementById('member-branch-filter').addEventListener('change', () => {
            this.renderMemberDirectory();
        });

        // Add Member Form Submit
        document.getElementById('add-member-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleCreateMember();
        });

        // Record Transaction Form Submit
        document.getElementById('record-tx-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRecordTransaction();
        });

        // AI Sermon Repurpose Submit
        document.getElementById('ai-repurpose-btn').addEventListener('click', () => {
            this.handleSermonRepurpose();
        });

        // Mobile Chatbot Handler
        document.getElementById('mobile-chat-send-btn').addEventListener('click', () => {
            this.handleMobileChatSend();
        });
        document.getElementById('mobile-chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleMobileChatSend();
        });

        // Mobile Giving Form Submit
        document.getElementById('mobile-giving-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMobileGiving();
        });

        // Mobile Serve Sign up button trigger
        document.getElementById('volunteer-skills-signup-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleMobileVolunteerSignup();
        });

        // Sign out
        document.getElementById('logout-btn')?.addEventListener('click', () => this.logout());
    },

    // 6. Master Render Coordinator
    renderAll() {
        const role = this.session.currentRole;
        const branchId = this.session.currentBranch;

        // RBAC enforcement: if the current role isn't permitted the active tab,
        // redirect to that role's default landing tab. This is real access
        // control — not merely hiding nav links — so no route reaches a panel
        // the role can't see.
        const allowed = this.ROLE_TABS[role] || this.ROLE_TABS.member;
        if (!allowed.includes(this.session.activeTab)) {
            this.session.activeTab = (role === 'member') ? 'mobile_preview' : 'admin_dashboard';
        }
        const activeTab = this.session.activeTab;

        // Sync header displays. "global" is a valid selection (All Branches) that
        // has no matching branch record, so fall back to a friendly label instead
        // of dereferencing undefined and aborting the entire render.
        const branchObj = this.db.branches.find(b => b.id === branchId);
        const branchLabel = branchObj ? branchObj.name : (branchId === 'global' ? 'All Branches' : 'Unknown Campus');
        document.getElementById('active-branch-indicator').innerText = branchLabel;
        document.getElementById('active-role-indicator').innerText = role.toUpperCase().replace('_', ' ');

        // Update Branch Select styling (HQ admin can select any branch, other admins are locked)
        const branchSelect = document.getElementById('global-branch-select');
        if (role === 'hq_admin') {
            branchSelect.removeAttribute('disabled');
        } else {
            branchSelect.value = 'b1'; // For Dallas admin, restrict
            if (role === 'branch_admin') {
                this.session.currentBranch = 'b1'; // default Nairobi HQ for simplification
            }
            branchSelect.setAttribute('disabled', 'true');
        }

        // Sidebar link visibilities based on role
        const directoryLink = document.querySelector('.nav-link[data-tab="admin_directory"]');
        const financialsLink = document.querySelector('.nav-link[data-tab="admin_financials"]');
        const attendanceLink = document.querySelector('.nav-link[data-tab="admin_attendance"]');
        const ministryLink = document.querySelector('.nav-link[data-tab="admin_ministry"]');
        const followupsLink = document.querySelector('.nav-link[data-tab="admin_followups"]');
        const groupsLink = document.querySelector('.nav-link[data-tab="admin_groups"]');
        const communicationLink = document.querySelector('.nav-link[data-tab="admin_communications"]');
        const dashboardLink = document.querySelector('.nav-link[data-tab="admin_dashboard"]');
        const mobilePreviewLink = document.querySelector('.nav-link[data-tab="mobile_preview"]');

        // Reset sidebar active state
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.dataset.tab === activeTab) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        if (role === 'member') {
            // Hide all admin links
            directoryLink.style.display = 'none';
            financialsLink.style.display = 'none';
            attendanceLink.style.display = 'none';
            ministryLink.style.display = 'none';
            followupsLink.style.display = 'none';
            groupsLink.style.display = 'none';
            communicationLink.style.display = 'none';
            dashboardLink.style.display = 'none';
            mobilePreviewLink.style.display = 'flex';
        } else {
            directoryLink.style.display = 'flex';
            financialsLink.style.display = 'flex';
            attendanceLink.style.display = 'flex';
            ministryLink.style.display = 'flex';
            followupsLink.style.display = 'flex';
            groupsLink.style.display = 'flex';
            communicationLink.style.display = 'flex';
            dashboardLink.style.display = 'flex';
            mobilePreviewLink.style.display = 'flex';

            // Hide/Show branch financial options for Department/Ministry Leaders
            if (role === 'ministry_leader') {
                financialsLink.style.display = 'none';
            }
        }

        // Render main view panels
        const panels = ['admin_dashboard', 'admin_directory', 'admin_financials', 'admin_attendance', 'admin_ministry', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'];
        panels.forEach(p => {
            const panelEl = document.getElementById(p);
            if (panelEl) {
                panelEl.style.display = (p === activeTab) ? 'block' : 'none';
            }
        });

        // Trigger individual panel renders
        if (activeTab === 'admin_dashboard') {
            this.renderDashboard();
        } else if (activeTab === 'admin_directory') {
            this.renderMemberDirectory();
        } else if (activeTab === 'admin_financials') {
            this.renderFinancials();
        } else if (activeTab === 'admin_attendance') {
            this.renderAttendance();
        } else if (activeTab === 'admin_ministry') {
            this.renderMinistry();
        } else if (activeTab === 'admin_followups') {
            this.renderFollowUps();
        } else if (activeTab === 'admin_groups') {
            this.renderGroups();
        } else if (activeTab === 'admin_communications') {
            this.renderCommunications();
        } else if (activeTab === 'mobile_preview') {
            this.renderMobilePreview();
        }
    },

    // 7. Panel: Dashboard View Rendering
    renderDashboard() {
        const branchId = this.session.currentBranch;
        const role = this.session.currentRole;

        // Filter transactions/attendance for calculations. Scope to a single campus
        // unless "All Branches (Global)" is selected, in which case aggregate everything.
        let branchTx = this.db.transactions;
        let branchMembers = this.db.members;
        let branchAttendance = this.db.attendance || [];

        if (branchId && branchId !== 'global') {
            branchTx = this.db.transactions.filter(t => t.branchId === branchId);
            branchMembers = this.db.members.filter(m => m.branchId === branchId);
            branchAttendance = branchAttendance.filter(a => a.branchId === branchId);
        }

        // Compute AI Snapshot Metrics — all derived from real records, no randomness
        const snapshot = window.AIEngine.generateWeeklySnapshot(
            this.db.branches,
            branchMembers,
            branchTx,
            this.db.events,
            branchAttendance
        );

        // Update dashboard counters
        document.getElementById('dash-giving-total').innerText = `$${snapshot.thisWeekGiving.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('dash-giving-change').innerText = snapshot.givingDiffPercent;
        document.getElementById('dash-giving-change').className = snapshot.givingDiffPercent.startsWith('-') ? 'changedown' : 'changeup';

        document.getElementById('dash-attendance-total').innerText = snapshot.avgAttendance;
        document.getElementById('dash-attendance-change').innerText = snapshot.attendanceDiffPercent;
        document.getElementById('dash-attendance-change').className = snapshot.attendanceDiffPercent.startsWith('-') ? 'changedown' : 'changeup';

        document.getElementById('dash-members-total').innerText = branchMembers.length;

        // Render AI Ministry Health Executive Briefing card
        const aiSnapshotCard = document.getElementById('ai-snapshot-content');
        if (aiSnapshotCard) {
            aiSnapshotCard.innerHTML = `
                <div class="ai-header-badge">
                    <span class="sparkle-icon">✨</span> AI-GENERATED MONDAY BRIEFING
                </div>
                <p class="ai-report-title">Weekly Ministry Health Report</p>
                <div class="weekly-bulletin-ai md-body">${renderMarkdown(snapshot.bulletSummary)}</div>
                <div class="ai-exec-context md-body">
                    <strong>Executive Context:</strong> ${renderMarkdown(snapshot.executiveSnapshot)}
                </div>
                <div class="at-risk-container">
                    <span class="at-risk-heading">⚠️ CRITICAL CARE ALERTS (At-Risk Members)</span>
                    <ul class="at-risk-list">
                        ${snapshot.atRisk.length ? snapshot.atRisk.map(m => `<li>${esc(m)}</li>`).join('') : '<li class="muted-italic">No at-risk members this week — great job! 🎉</li>'}
                    </ul>
                </div>
            `;
        }

        // Render charts inside dashboard
        this.renderDashboardCharts(branchTx);
    },

    renderDashboardCharts(transactions) {
        // Chart.js is loaded from a CDN and may be unavailable (offline, blocked,
        // or the PWA running without a network). Degrade gracefully instead of
        // throwing "Chart is not defined" and aborting the rest of init().
        if (typeof Chart === 'undefined') {
            document.querySelectorAll('.chart-container-wrapper').forEach((wrap) => {
                if (!wrap.querySelector('.chart-fallback')) {
                    const note = document.createElement('div');
                    note.className = 'chart-fallback';
                    note.textContent = '📊 Charts are unavailable offline. Reconnect to view visual analytics.';
                    wrap.appendChild(note);
                }
            });
            return;
        }

        // Destroy existing charts to avoid redraw issues
        if (this.charts.giving) this.charts.giving.destroy();
        if (this.charts.categories) this.charts.categories.destroy();

        // 1. Giving trend chart (Past 7 days)
        const ctxGiving = document.getElementById('giving-trend-chart')?.getContext('2d');
        if (ctxGiving) {
            // Group transactions by date
            const dateLabels = [];
            const amounts = [];
            const now = new Date();

            for (let i = 6; i >= 0; i--) {
                const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
                const dateStr = d.toISOString().split('T')[0];
                dateLabels.push(d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
                
                const daySum = transactions
                    .filter(t => t.date === dateStr)
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0);
                amounts.push(daySum);
            }

            this.charts.giving = new Chart(ctxGiving, {
                type: 'line',
                data: {
                    labels: dateLabels,
                    datasets: [{
                        label: 'Daily Giving ($)',
                        data: amounts,
                        borderColor: '#6366f1',
                        backgroundColor: 'rgba(99, 102, 241, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: '#8b5cf6',
                        pointBorderColor: '#fff',
                        pointRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: { color: '#9ca3af' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#9ca3af' }
                        }
                    }
                }
            });
        }

        // 2. Fund allocation breakdown chart (Doughnut)
        const ctxCategories = document.getElementById('category-pie-chart')?.getContext('2d');
        if (ctxCategories) {
            const categories = ['Tithe', 'Offering', 'Pledge', 'Project Donation'];
            const categorySums = categories.map(cat => 
                transactions
                    .filter(t => t.category === cat)
                    .reduce((sum, t) => sum + parseFloat(t.amount), 0)
            );

            this.charts.categories = new Chart(ctxCategories, {
                type: 'doughnut',
                data: {
                    labels: categories,
                    datasets: [{
                        data: categorySums,
                        backgroundColor: [
                            'rgba(99, 102, 241, 0.85)',  // Tithe
                            'rgba(16, 185, 129, 0.85)', // Offering
                            'rgba(245, 158, 11, 0.85)',  // Pledge
                            'rgba(6, 182, 212, 0.85)'   // Project
                        ],
                        borderColor: 'rgba(28, 28, 45, 1)',
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: '#f3f4f6', font: { size: 11 } }
                        }
                    }
                }
            });
        }
    },

    // Panel: Attendance & Check-In
    renderAttendance() {
        const branchId = this.session.currentBranch;
        const inScope = (m) => (!branchId || branchId === 'global') ? true : m.branchId === branchId;
        const members = this.db.members.filter(inScope);
        const attendance = (this.db.attendance || []).filter(a => members.some(m => m.id === a.memberId));

        // Service dropdown (most recent first)
        const serviceDates = [...new Set((this.db.attendance || []).map(a => a.date))].sort().reverse();
        if (!this.session.selectedServiceDate || !serviceDates.includes(this.session.selectedServiceDate)) {
            this.session.selectedServiceDate = serviceDates[0] || null;
        }
        const select = document.getElementById('attendance-service-select');
        if (select) {
            select.innerHTML = serviceDates.map((d, i) =>
                `<option value="${esc(d)}"${d === this.session.selectedServiceDate ? ' selected' : ''}>${esc(this.formatServiceLabel(d))}${i === 0 ? ' (latest)' : ''}</option>`
            ).join('');
            select.onchange = (e) => { this.session.selectedServiceDate = e.target.value; this.renderAttendance(); };
        }

        const serviceDate = this.session.selectedServiceDate;
        const recordFor = (memberId) => (this.db.attendance || []).find(a => a.memberId === memberId && a.date === serviceDate);

        // Headcount for the selected service (in scope)
        const presentCount = members.filter(m => (recordFor(m.id) || {}).present).length;
        const headEl = document.getElementById('attendance-headcount');
        if (headEl) {
            const pct = members.length ? Math.round((presentCount / members.length) * 100) : 0;
            headEl.innerHTML = `<strong>${presentCount}</strong> of <strong>${members.length}</strong> present
                <span class="attendance-pct">${pct}%</span>
                <span class="attendance-when">· ${esc(this.formatServiceLabel(serviceDate) || 'no service selected')}</span>`;
        }

        // Roster rows
        const tbody = document.getElementById('attendance-tbody');
        if (tbody) {
            tbody.innerHTML = members.map(m => {
                const present = !!(recordFor(m.id) || {}).present;
                return `<tr>
                    <td>
                        <div class="member-profile-cell">
                            <div class="member-avatar">${esc((m.firstName[0] || '') + (m.lastName[0] || ''))}</div>
                            <span class="member-name">${esc(m.firstName)} ${esc(m.lastName)}</span>
                        </div>
                    </td>
                    <td><span class="branch-pill badge-${esc(m.branchId)}">${esc(m.branchName)}</span></td>
                    <td style="text-align:center;">
                        <span class="attendance-status ${present ? 'is-present' : 'is-absent'}">${present ? 'Present' : 'Absent'}</span>
                    </td>
                    <td style="text-align:right;">
                        <button class="attendance-toggle ${present ? 'on' : ''}" role="switch" aria-checked="${present}"
                            aria-label="Toggle attendance for ${esc(m.firstName)} ${esc(m.lastName)}"
                            onclick="ChurchApp.toggleAttendance('${esc(m.id)}')">
                            <span class="attendance-toggle-knob"></span>
                        </button>
                    </td>
                </tr>`;
            }).join('') || `<tr><td colspan="4" class="muted-italic" style="text-align:center; padding:24px;">No members in this scope.</td></tr>`;
        }

        // Trend + summary
        this.renderAttendanceChart(attendance, serviceDates);
        this.renderAttendanceSummary(members, attendance);
    },

    formatServiceLabel(dateStr) {
        if (!dateStr) return '';
        const d = new Date(dateStr + 'T00:00:00');
        return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    },

    toggleAttendance(memberId) {
        const serviceDate = this.session.selectedServiceDate;
        if (!serviceDate) return;
        this.db.attendance = this.db.attendance || [];
        let rec = this.db.attendance.find(a => a.memberId === memberId && a.date === serviceDate);
        const member = this.db.members.find(m => m.id === memberId);
        if (rec) {
            rec.present = !rec.present;
        } else if (member) {
            this.db.attendance.push({ id: `att_${memberId}_${serviceDate}`, memberId, branchId: member.branchId, date: serviceDate, present: true });
        }
        this.saveDB();
        this.renderAttendance();
    },

    renderAttendanceChart(attendance, serviceDatesDesc) {
        const wrap = document.getElementById('attendance-trend-chart')?.parentElement;
        if (typeof Chart === 'undefined') {
            if (wrap && !wrap.querySelector('.chart-fallback')) {
                const n = document.createElement('div');
                n.className = 'chart-fallback';
                n.textContent = '📊 Attendance chart is unavailable offline.';
                wrap.appendChild(n);
            }
            return;
        }
        const ctx = document.getElementById('attendance-trend-chart')?.getContext('2d');
        if (!ctx) return;
        if (this.charts.attendance) this.charts.attendance.destroy();

        const dates = [...serviceDatesDesc].sort(); // ascending
        const counts = dates.map(d => attendance.filter(a => a.date === d && a.present).length);
        const labels = dates.map(d => new Date(d + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));

        this.charts.attendance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Present',
                    data: counts,
                    backgroundColor: 'rgba(16, 185, 129, 0.55)',
                    borderColor: '#10b981',
                    borderWidth: 1.5,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { beginAtZero: true, ticks: { color: '#9ca3af', precision: 0 }, grid: { color: 'rgba(255,255,255,0.05)' } },
                    x: { ticks: { color: '#9ca3af' }, grid: { display: false } }
                }
            }
        });
    },

    renderAttendanceSummary(members, attendance) {
        const el = document.getElementById('attendance-summary');
        if (!el) return;
        // At-risk = 3+ consecutive most-recent absences
        const byMember = {};
        attendance.forEach(a => (byMember[a.memberId] = byMember[a.memberId] || []).push(a));
        const atRisk = members.filter(m => {
            const recs = (byMember[m.id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
            let streak = 0;
            for (const r of recs) { if (!r.present) streak++; else break; }
            return streak >= 3;
        });
        el.innerHTML = `
            <div class="attendance-summary-row">
                <span>⚠️ At-risk (3+ absences)</span>
                <strong>${atRisk.length}</strong>
            </div>
            ${atRisk.length ? `<ul class="at-risk-list" style="margin-top:8px;">
                ${atRisk.slice(0, 5).map(m => `<li>${esc(m.firstName)} ${esc(m.lastName)}</li>`).join('')}
            </ul>` : '<p class="muted-italic" style="margin-top:8px;">No members in an absence streak — healthy engagement. 🎉</p>'}`;
    },

    // Panel: Follow-Ups / Assimilation Pipeline (kanban)
    FOLLOWUP_STAGES: ['New Guest', 'Contacted', 'Connected', 'Member'],

    renderFollowUps() {
        const branchId = this.session.currentBranch;
        const inScope = (m) => (!branchId || branchId === 'global') ? true : m.branchId === branchId;
        const items = (this.db.followUps || []).filter(inScope);
        const board = document.getElementById('followup-board');
        if (!board) return;

        const stageMeta = {
            'New Guest': { icon: '👋', tone: 'guest' },
            'Contacted': { icon: '📞', tone: 'contacted' },
            'Connected': { icon: '🤝', tone: 'connected' },
            'Member': { icon: '⭐', tone: 'member' }
        };

        board.innerHTML = this.FOLLOWUP_STAGES.map((stage, sIdx) => {
            const inStage = items.filter(i => i.stage === stage);
            const cards = inStage.map(i => {
                const canBack = sIdx > 0;
                const canFwd = sIdx < this.FOLLOWUP_STAGES.length - 1;
                return `<div class="followup-card">
                    <div class="followup-card-top">
                        <strong>${esc(i.name)}</strong>
                        <span class="branch-pill badge-${esc(i.branchId)}">${esc((this.db.branches.find(b => b.id === i.branchId) || {}).name || '')}</span>
                    </div>
                    ${i.owner ? `<div class="followup-owner">👤 ${esc(i.owner)}</div>` : ''}
                    ${i.note ? `<p class="followup-note">${esc(i.note)}</p>` : ''}
                    <div class="followup-actions">
                        <button class="followup-move" ${canBack ? '' : 'disabled'} aria-label="Move ${esc(i.name)} back" onclick="ChurchApp.moveFollowUp('${esc(i.id)}', -1)">←</button>
                        <button class="followup-move fwd" ${canFwd ? '' : 'disabled'} aria-label="Advance ${esc(i.name)}" onclick="ChurchApp.moveFollowUp('${esc(i.id)}', 1)">${canFwd ? 'Advance →' : 'Assimilated ✓'}</button>
                    </div>
                </div>`;
            }).join('') || '<p class="followup-empty muted-italic">Empty</p>';

            return `<div class="followup-col tone-${stageMeta[stage].tone}">
                <div class="followup-col-head">
                    <span>${stageMeta[stage].icon} ${esc(stage)}</span>
                    <span class="followup-count">${inStage.length}</span>
                </div>
                <div class="followup-col-body">${cards}</div>
            </div>`;
        }).join('');

        const form = document.getElementById('add-followup-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('followup-name').value.trim();
                const owner = document.getElementById('followup-owner').value.trim();
                if (!name) return;
                const targetBranch = (branchId && branchId !== 'global') ? branchId : 'b1';
                this.db.followUps.unshift({
                    id: `fu_${Date.now()}`,
                    name, owner: owner || 'Unassigned',
                    branchId: targetBranch,
                    stage: 'New Guest',
                    note: ''
                });
                this.saveDB();
                form.reset();
                this.renderFollowUps();
                this.toast(`${name} added to the assimilation pipeline.`);
            };
        }
    },

    moveFollowUp(id, dir) {
        const item = (this.db.followUps || []).find(i => i.id === id);
        if (!item) return;
        const idx = this.FOLLOWUP_STAGES.indexOf(item.stage);
        const next = idx + dir;
        if (next < 0 || next >= this.FOLLOWUP_STAGES.length) return;
        item.stage = this.FOLLOWUP_STAGES[next];
        this.saveDB();
        this.renderFollowUps();
        if (item.stage === 'Member') this.toast(`🎉 ${item.name} is now a committed member!`);
    },

    // Panel: Small Groups (admin)
    renderGroups() {
        const branchId = this.session.currentBranch;
        const inScope = (g) => (!branchId || branchId === 'global') ? true : g.branchId === branchId;
        const groups = (this.db.groups || []).filter(inScope);
        const grid = document.getElementById('groups-grid');
        if (grid) {
            grid.innerHTML = groups.map(g => {
                const campus = (this.db.branches.find(b => b.id === g.branchId) || {}).name || '';
                const count = (g.memberIds || []).length;
                const roster = (g.memberIds || []).map(id => {
                    const m = this.db.members.find(mm => mm.id === id);
                    return m ? `${m.firstName} ${m.lastName}` : null;
                }).filter(Boolean);
                return `<div class="group-card">
                    <div class="group-card-head">
                        <h4>${esc(g.name)}</h4>
                        <span class="group-count">🫂 ${count}</span>
                    </div>
                    <div class="group-meta">
                        <span class="branch-pill badge-${esc(g.branchId)}">${esc(campus)}</span>
                        <span class="group-schedule">🗓️ ${esc(g.schedule || 'TBD')}</span>
                    </div>
                    ${g.description ? `<p class="group-desc">${esc(g.description)}</p>` : ''}
                    <div class="group-roster">${roster.length ? roster.map(n => `<span class="group-member-pill">${esc(n)}</span>`).join('') : '<span class="muted-italic">No members yet</span>'}</div>
                </div>`;
            }).join('') || '<p class="muted-italic" style="margin-top:12px;">No groups for this campus yet.</p>';
        }

        const form = document.getElementById('add-group-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const name = document.getElementById('group-name').value.trim();
                if (!name) return;
                this.db.groups.unshift({
                    id: `g_${Date.now()}`,
                    name,
                    branchId: document.getElementById('group-branch').value,
                    schedule: document.getElementById('group-schedule').value.trim(),
                    description: document.getElementById('group-desc').value.trim(),
                    memberIds: []
                });
                this.saveDB();
                form.reset();
                this.renderGroups();
                this.toast(`Group "${name}" created.`);
            };
        }
    },

    // Mobile: browse & self-join small groups (logged-in member m1)
    renderMobileGroups() {
        const container = document.getElementById('mobile-groups-list');
        if (!container) return;
        const me = this.db.members.find(m => m.id === 'm1');
        const myBranch = me ? me.branchId : 'b1';
        const groups = (this.db.groups || []).filter(g => g.branchId === myBranch);

        container.innerHTML = groups.map(g => {
            const joined = (g.memberIds || []).includes('m1');
            return `<div class="mobile-group-card">
                <div class="mobile-group-info">
                    <strong>${esc(g.name)}</strong>
                    <span>🗓️ ${esc(g.schedule || 'TBD')} · ${(g.memberIds || []).length} members</span>
                </div>
                <button class="mobile-group-btn${joined ? ' joined' : ''}" onclick="ChurchApp.toggleGroupJoin('${esc(g.id)}')">${joined ? 'Joined ✓' : 'Join'}</button>
            </div>`;
        }).join('') || '<p class="muted-italic" style="font-size:0.72rem;">No groups at your campus yet.</p>';
    },

    toggleGroupJoin(groupId) {
        const group = (this.db.groups || []).find(g => g.id === groupId);
        if (!group) return;
        group.memberIds = group.memberIds || [];
        const idx = group.memberIds.indexOf('m1');
        if (idx >= 0) {
            group.memberIds.splice(idx, 1);
            this.toast(`Left ${group.name}.`, 'info');
        } else {
            group.memberIds.push('m1');
            this.toast(`Joined ${group.name}! See you there. 🙌`);
        }
        this.saveDB();
        this.renderMobileGroups();
    },

    // 8. Panel: Member Directory View Rendering
    renderMemberDirectory() {
        const query = document.getElementById('member-search-input').value.toLowerCase();
        const branchFilter = document.getElementById('member-branch-filter').value;
        const tbody = document.getElementById('member-directory-tbody');
        tbody.innerHTML = '';

        const filteredMembers = this.db.members.filter(member => {
            const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
            const matchesQuery = fullName.includes(query) || member.email.toLowerCase().includes(query) || member.phone.includes(query);
            const matchesBranch = (branchFilter === 'all') || (member.branchId === branchFilter);
            return matchesQuery && matchesBranch;
        });

        filteredMembers.forEach(m => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="member-profile-cell">
                        <div class="member-avatar">${esc((m.firstName[0] || '') + (m.lastName[0] || ''))}</div>
                        <div>
                            <span class="member-name">${esc(m.firstName)} ${esc(m.lastName)}</span>
                            <span class="member-id">ID: ${esc(m.id)}</span>
                        </div>
                    </div>
                </td>
                <td><span class="branch-pill badge-${esc(m.branchId)}">${esc(m.branchName)}</span></td>
                <td>
                    <div class="member-email">${esc(m.email)}</div>
                    <div class="member-phone">${esc(m.phone)}</div>
                </td>
                <td>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${(m.volunteer_skills || []).map(s => `<span class="skill-tag">${esc(s)}</span>`).join('') || '<span class="muted-italic">—</span>'}
                    </div>
                </td>
                <td>
                    <div class="score-indicator-bar">
                        <div class="score-progress" style="width: ${m.engagement_score}%; background: ${m.engagement_score > 75 ? '#10b981' : (m.engagement_score > 50 ? '#f59e0b' : '#ef4444')};"></div>
                        <span class="score-text">${m.engagement_score}%</span>
                    </div>
                </td>
                <td>
                    <button class="action-btn-sm" onclick="ChurchApp.viewMemberDetails('${m.id}')">View Profile</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (filteredMembers.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #9ca3af; padding: 30px;">No members found matching the criteria.</td></tr>`;
        }
    },

    // 9. Panel: Member Details Modal Manager
    viewMemberDetails(memberId) {
        const member = this.db.members.find(m => m.id === memberId);
        if (!member) return;

        this.session.selectedMemberId = memberId;
        const modal = document.getElementById('member-detail-modal');
        
        // Find family members
        const familyList = this.db.members.filter(m => m.familyId === member.familyId && m.id !== member.id);

        // Fetch giving transactions for member
        const donations = this.db.transactions.filter(t => t.memberId === memberId);

        modal.innerHTML = `
            <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="member-modal-title">
                <div class="modal-header">
                    <h3 id="member-modal-title">Member Profile: ${esc(member.firstName)} ${esc(member.lastName)}</h3>
                    <button class="modal-close" aria-label="Close member profile" onclick="ChurchApp.closeModal('member-detail-modal')">×</button>
                </div>
                <div class="modal-body scroll-y">
                    <div class="member-detail-grid">
                        <div>
                            <h4>Contact Information</h4>
                            <p><strong>Email:</strong> ${esc(member.email)}</p>
                            <p><strong>Phone:</strong> ${esc(member.phone)}</p>
                            <p><strong>Primary Branch:</strong> ${esc(member.branchName)}</p>
                            <p><strong>Engagement Rating:</strong> ${esc(member.engagement_score)}%</p>
                        </div>
                        <div>
                            <h4>Family Connections</h4>
                            <p><strong>Family Unit ID:</strong> ${esc(member.familyId || 'None Linked')}</p>
                            <p><strong>Family Role:</strong> ${esc(member.familyRole || 'N/A')}</p>
                            <ul class="family-linked-list">
                                ${familyList.length > 0 ? familyList.map(f => `<li>${esc(f.firstName)} ${esc(f.lastName)} (${esc(f.familyRole)})</li>`).join('') : '<li class="muted-italic">No other family members linked.</li>'}
                            </ul>
                        </div>
                    </div>

                    <div class="milestones-section">
                        <h4>Spiritual Milestones</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                            ${member.spiritualMilestones.length > 0 ? member.spiritualMilestones.map(m => `<span class="milestone-pill">✨ ${esc(m)}</span>`).join('') : '<span class="muted-italic">No spiritual milestones logged.</span>'}
                        </div>
                        <div style="margin-top: 12px; display: flex; gap: 8px;">
                            <input type="text" id="new-milestone-input" placeholder="e.g. Confirmed: 2026-07-11" class="form-control" style="width: auto; flex-grow: 1;" aria-label="New spiritual milestone">
                            <button class="btn btn-primary-gradient" onclick="ChurchApp.addSpiritualMilestone()">Add Milestone</button>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <h4>Recent Giving Ledger</h4>
                            <button class="btn btn-secondary btn-sm" onclick="ChurchApp.viewGivingStatement('${esc(member.id)}')">📄 Giving Statement</button>
                        </div>
                        <table class="financial-table" style="margin-top: 8px;">
                            <thead>
                                <tr>
                                    <th>Receipt</th>
                                    <th>Date</th>
                                    <th>Category</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${donations.map(d => `
                                    <tr>
                                        <td><a href="#" onclick="ChurchApp.viewReceipt('${esc(d.id)}'); return false;">${esc(d.receiptNumber)}</a></td>
                                        <td>${esc(d.date)}</td>
                                        <td>${esc(d.category)}</td>
                                        <td style="color: #10b981; font-weight: bold;">$${parseFloat(d.amount).toFixed(2)}</td>
                                        <td>${esc(d.paymentMethod)}</td>
                                    </tr>
                                `).join('')}
                                ${donations.length === 0 ? '<tr><td colspan="5" style="text-align:center;" class="muted-italic">No transaction history found.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        this.openModal('member-detail-modal');
    },

    addSpiritualMilestone() {
        const input = document.getElementById('new-milestone-input');
        if (!input || !input.value.trim()) return;

        const milestone = input.value.trim();
        const member = this.db.members.find(m => m.id === this.session.selectedMemberId);
        if (member) {
            member.spiritualMilestones.push(milestone);
            // Boost engagement score slightly for milestone achievement
            member.engagement_score = Math.min(member.engagement_score + 5, 100);
            this.saveDB();
            
            // Re-render
            this.viewMemberDetails(member.id);
            this.renderMemberDirectory();
        }
    },

    handleCreateMember() {
        const firstName = document.getElementById('member-first-name').value.trim();
        const lastName = document.getElementById('member-last-name').value.trim();
        const email = document.getElementById('member-email').value.trim();
        const phone = document.getElementById('member-phone').value.trim();
        const branchId = document.getElementById('member-branch-select').value;
        const skillsText = document.getElementById('member-skills').value.trim();
        
        const branchObj = this.db.branches.find(b => b.id === branchId);
        const skillsArray = skillsText ? skillsText.split(',').map(s => s.trim()) : [];

        const newMember = {
            id: `m_${Date.now()}`,
            branchId: branchId,
            branchName: branchObj.name,
            firstName,
            lastName,
            email,
            phone,
            familyId: `fam_${lastName.toLowerCase()}_${Math.floor(Math.random() * 1000)}`,
            familyRole: 'Single',
            spiritualMilestones: ['Registered: ' + new Date().toISOString().split('T')[0]],
            volunteer_skills: skillsArray,
            engagement_score: 50
        };

        this.db.members.push(newMember);
        this.saveDB();
        document.getElementById('add-member-form').reset();
        
        // Notification simulation
        this.toast(`${firstName} ${lastName} enrolled in ${branchObj.name}.`);
        this.renderMemberDirectory();
    },

    // 10. Panel: Financials Ledger Rendering
    renderFinancials() {
        const branchId = this.session.currentBranch;
        const tbody = document.getElementById('financials-tbody');
        tbody.innerHTML = '';

        let filteredTx = this.db.transactions;
        if (branchId !== 'all' && branchId !== 'global') {
            filteredTx = this.db.transactions.filter(t => t.branchId === branchId);
        }

        // Render rows
        filteredTx.forEach(t => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><span style="font-family: monospace; font-weight: bold; color: #a5b4fc;">${esc(t.receiptNumber)}</span></td>
                <td><span class="branch-pill badge-${esc(t.branchId)}">${esc(t.branchName)}</span></td>
                <td>${esc(t.memberName || 'Anonymous')}</td>
                <td><span class="category-pill category-${esc((t.category || '').toLowerCase().replace(' ', ''))}">${esc(t.category)}</span></td>
                <td style="color: #10b981; font-weight: bold; text-align: right;">$${parseFloat(t.amount).toFixed(2)}</td>
                <td>${esc(t.date)}</td>
                <td>${esc(t.paymentMethod)}</td>
                <td>
                    <button class="action-btn-sm" onclick="ChurchApp.viewReceipt('${esc(t.id)}')">Receipt</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (filteredTx.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #9ca3af; padding: 30px;">No transactions logged.</td></tr>`;
        }

        // Bind quick export buttons
        document.getElementById('export-csv-btn').onclick = () => this.exportFinancialCSV(filteredTx);

        // Campaign progress + recurring-gift insights strip
        this.renderGivingInsights(branchId);
    },

    renderGivingInsights(branchId) {
        const el = document.getElementById('giving-insights');
        if (!el) return;
        const inScope = (bId) => (!branchId || branchId === 'global') ? true : bId === branchId;

        // Pledge campaigns: raised = sum of matching-fund transactions in scope
        const campaigns = (this.db.campaigns || []).filter(c => inScope(c.branchId) || (branchId === 'global'));
        const campaignCards = campaigns.map(c => {
            const raised = this.db.transactions
                .filter(t => t.category === c.fundCategory && inScope(t.branchId))
                .reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
            const pct = c.goal ? Math.min(100, Math.round((raised / c.goal) * 100)) : 0;
            const money = (n) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
            return `<div class="card-glass campaign-card">
                <div class="campaign-head">
                    <div>
                        <span class="campaign-eyebrow">🏗️ Pledge Campaign</span>
                        <h4>${esc(c.name)}</h4>
                    </div>
                    <span class="campaign-pct">${pct}%</span>
                </div>
                <div class="campaign-bar"><div class="campaign-bar-fill" style="width:${pct}%;"></div></div>
                <div class="campaign-figures"><strong>${money(raised)}</strong> raised of ${money(c.goal)} goal</div>
            </div>`;
        }).join('');

        // Active recurring gifts in scope
        const recurring = (this.db.recurringGifts || []).filter(r => r.active && inScope(r.branchId));
        const recurringTotal = recurring.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
        const recurringCard = `<div class="card-glass campaign-card">
            <span class="campaign-eyebrow">🔁 Recurring Giving</span>
            <h4>${recurring.length} active schedule${recurring.length === 1 ? '' : 's'}</h4>
            <div class="campaign-figures"><strong>$${recurringTotal.toFixed(2)}</strong> committed per cycle</div>
            ${recurring.length ? `<ul class="recurring-list">${recurring.slice(0, 3).map(r =>
                `<li>${esc(r.memberName)} — $${parseFloat(r.amount).toFixed(2)} ${esc(r.frequency)} (${esc(r.category)})</li>`).join('')}</ul>` : ''}
        </div>`;

        el.innerHTML = campaignCards + recurringCard;
    },

    // Printable, tax-ready annual giving statement for one member.
    viewGivingStatement(memberId) {
        const member = this.db.members.find(m => m.id === memberId);
        if (!member) return;
        const year = new Date().getFullYear();
        const gifts = this.db.transactions
            .filter(t => t.memberId === memberId && new Date(t.date).getFullYear() === year)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        const total = gifts.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
        const money = (n) => `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

        const byFund = {};
        gifts.forEach(t => { byFund[t.category] = (byFund[t.category] || 0) + (parseFloat(t.amount) || 0); });

        const modal = document.getElementById('receipt-modal');
        modal.innerHTML = `
            <div class="modal-card statement-card" role="dialog" aria-modal="true" aria-labelledby="statement-title">
                <div class="modal-header">
                    <h3 id="statement-title">${year} Annual Giving Statement</h3>
                    <button class="modal-close" aria-label="Close statement" onclick="ChurchApp.closeModal('receipt-modal')">×</button>
                </div>
                <div class="modal-body receipt-print-area scroll-y">
                    <div class="receipt-header">
                        <h2>CHURCH 2.0 ECOSYSTEM</h2>
                        <p>${esc(member.branchName)}</p>
                    </div>
                    <p style="margin-top:10px;"><strong>${esc(member.firstName)} ${esc(member.lastName)}</strong><br>
                    <span style="color:var(--text-secondary); font-size:0.8rem;">${esc(member.email)}</span></p>
                    <p style="font-size:0.75rem; color:var(--text-secondary); margin-top:8px;">
                        Tax-deductible contributions for the ${year} calendar year. No goods or services were provided in exchange for these gifts.
                    </p>
                    <hr style="border:0; border-top:1px dashed rgba(150,150,150,0.4); margin:14px 0;">
                    <table class="financial-table">
                        <thead><tr><th>Date</th><th>Fund</th><th>Method</th><th style="text-align:right;">Amount</th></tr></thead>
                        <tbody>
                            ${gifts.map(t => `<tr>
                                <td>${esc(t.date)}</td>
                                <td>${esc(t.category)}</td>
                                <td>${esc(t.paymentMethod)}</td>
                                <td style="text-align:right;">${money(parseFloat(t.amount))}</td>
                            </tr>`).join('') || `<tr><td colspan="4" class="muted-italic" style="text-align:center;">No ${year} contributions on record.</td></tr>`}
                        </tbody>
                    </table>
                    <div class="statement-by-fund">
                        ${Object.keys(byFund).map(f => `<span class="statement-fund-pill">${esc(f)}: ${money(byFund[f])}</span>`).join('')}
                    </div>
                    <div class="receipt-row total-row" style="margin-top:14px;">
                        <span style="font-size:1.05rem;">TOTAL ${year} CONTRIBUTIONS</span>
                        <strong style="color:#10b981; font-size:1.35rem;">${money(total)}</strong>
                    </div>
                    <p style="font-size:0.7rem; color:var(--text-secondary); margin-top:14px;">Church 2.0 is a registered place of worship. Retain this statement for your tax records.</p>
                </div>
                <div style="display:flex; gap:8px; margin-top:15px; justify-content:flex-end;">
                    <button class="btn btn-secondary" onclick="window.print()">Print / Save PDF</button>
                    <button class="btn btn-primary-gradient" onclick="ChurchApp.closeModal('receipt-modal')">Close</button>
                </div>
            </div>
        `;
        this.openModal('receipt-modal');
    },

    handleRecordTransaction() {
        const memberSelect = document.getElementById('tx-member-select');
        const memberId = memberSelect.value;
        const category = document.getElementById('tx-category-select').value;
        const amount = parseFloat(document.getElementById('tx-amount-input').value);
        const method = document.getElementById('tx-method-select').value;
        const date = document.getElementById('tx-date-input').value || new Date().toISOString().split('T')[0];

        if (isNaN(amount) || amount <= 0) return;

        let memberName = 'Anonymous';
        // When "All Branches (Global)" is active there is no single campus to file
        // an anonymous gift under, so default to the HQ campus (b1).
        let branchId = (this.session.currentBranch === 'all' || this.session.currentBranch === 'global')
            ? 'b1' : this.session.currentBranch;

        if (memberId !== 'anonymous') {
            const memberObj = this.db.members.find(m => m.id === memberId);
            if (memberObj) {
                memberName = `${memberObj.firstName} ${memberObj.lastName}`;
                branchId = memberObj.branchId;
                
                // Boost engagement score for giving
                memberObj.engagement_score = Math.min(memberObj.engagement_score + 4, 100);
            }
        }

        const branchObj = this.db.branches.find(b => b.id === branchId);

        const newTx = {
            id: `t_${Date.now()}`,
            branchId,
            branchName: branchObj.name,
            memberId: memberId === 'anonymous' ? null : memberId,
            memberName,
            amount,
            category,
            date,
            paymentMethod: method,
            receiptNumber: `REC-2026-${Math.floor(Math.random() * 90000) + 10000}`
        };

        this.db.transactions.unshift(newTx);
        this.saveDB();
        document.getElementById('record-tx-form').reset();
        
        // Reset defaults
        document.getElementById('tx-date-input').value = new Date().toISOString().split('T')[0];

        this.toast(`Logged $${amount.toFixed(2)} from ${memberName}. Receipt ${newTx.receiptNumber}.`);
        
        this.renderAll();
    },

    viewReceipt(txId) {
        const tx = this.db.transactions.find(t => t.id === txId);
        if (!tx) return;

        const modal = document.getElementById('receipt-modal');
        modal.innerHTML = `
            <div class="modal-card receipt-card" role="dialog" aria-modal="true" aria-labelledby="receipt-modal-title">
                <div class="receipt-seal">
                    <span>Approved<br>HQ System</span>
                </div>
                <div class="modal-header">
                    <h3 id="receipt-modal-title">STEWARDSHIP RECEIPT</h3>
                    <button class="modal-close" aria-label="Close receipt" onclick="ChurchApp.closeModal('receipt-modal')">×</button>
                </div>
                <div class="modal-body receipt-print-area">
                    <div class="receipt-header">
                        <h2>CHURCH 2.0 ECOSYSTEM</h2>
                        <p>${esc(tx.branchName)}</p>
                        <p style="font-size: 0.75rem; color:#9ca3af;">Branch Code: ${esc((tx.branchId || '').toUpperCase())}</p>
                    </div>
                    <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 15px 0;">
                    <div class="receipt-row">
                        <span>Receipt Number:</span>
                        <strong>${esc(tx.receiptNumber)}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Date Filed:</span>
                        <strong>${esc(tx.date)}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Donation Contributor:</span>
                        <strong>${esc(tx.memberName || 'Anonymous Partner')}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Giving Allocation:</span>
                        <strong class="category-pill">${esc(tx.category)}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Payment Channel:</span>
                        <strong>${esc(tx.paymentMethod)}</strong>
                    </div>
                    <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 15px 0;">
                    <div class="receipt-row total-row">
                        <span style="font-size: 1.1rem;">TOTAL AMOUNT RECEIVED:</span>
                        <strong style="color: #10b981; font-size: 1.4rem;">$${parseFloat(tx.amount).toFixed(2)}</strong>
                    </div>
                    
                    <div class="simulated-barcode">
                        <div class="thick"></div>
                        <div class="thin"></div>
                        <div class="space"></div>
                        <div class="thick"></div>
                        <div class="thick"></div>
                        <div class="thin"></div>
                        <div class="space"></div>
                        <div class="thin"></div>
                        <div class="thick"></div>
                        <div class="thin"></div>
                        <div class="space"></div>
                        <div class="thick"></div>
                        <div class="thin"></div>
                    </div>

                    <div class="receipt-footer">
                        <p>Thank you for your generous stewardship.</p>
                        <p style="font-size:0.7rem; color:#9ca3af; margin-top:8px;">Signed Electronically by Church 2.0 HQ Admin System</p>
                    </div>
                </div>
                <div style="display: flex; gap: 8px; margin-top: 15px; justify-content: flex-end;">
                    <button class="btn btn-secondary" onclick="window.print()">Print Receipt</button>
                    <button class="btn btn-primary-gradient" onclick="ChurchApp.closeModal('receipt-modal')">Close</button>
                </div>
            </div>
        `;
        this.openModal('receipt-modal');
    },

    exportFinancialCSV(transactions) {
        // Escape a CSV cell: double embedded quotes, and neutralize leading
        // =/+/-/@ so spreadsheet apps can't execute a value as a formula.
        const csvCell = (value) => {
            let s = String(value == null ? '' : value);
            if (/^[=+\-@]/.test(s)) s = "'" + s;
            return `"${s.replace(/"/g, '""')}"`;
        };

        const rows = [
            ['Receipt Number', 'Branch', 'Member Name', 'Category', 'Amount', 'Date', 'Payment Method'],
            ...transactions.map(t => [
                t.receiptNumber,
                t.branchName,
                t.memberName || 'Anonymous',
                t.category,
                parseFloat(t.amount).toFixed(2),
                t.date,
                t.paymentMethod
            ])
        ];

        const csv = rows.map(r => r.map(csvCell).join(',')).join('\r\n');

        // Use a Blob URL so commas/quotes survive without URI-encoding quirks.
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `church2_financial_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    },

    // 10. Panel: Ministry & Rota Rendering
    renderMinistry() {
        const selectEvent = document.getElementById('rota-event-select');
        const activeEventId = this.session.selectedEventId;
        selectEvent.value = activeEventId;

        // Sync dropdown list
        selectEvent.innerHTML = '';
        this.db.events.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.text = `${e.title} (${e.date})`;
            selectEvent.appendChild(opt);
        });
        selectEvent.value = activeEventId;

        // Render Rota details
        const event = this.db.events.find(e => e.id === activeEventId);
        if (!event) return;

        // Render list of required roles
        const requiredRolesContainer = document.getElementById('rota-required-roles');
        requiredRolesContainer.innerHTML = '';

        event.rolesRequired.forEach(role => {
            // Find signed up members for this role
            const signup = event.volunteersSignedUp.find(mId => {
                const member = this.db.members.find(m => m.id === mId);
                return member && member.volunteer_skills.includes(role);
            });
            const volunteerObj = signup ? this.db.members.find(m => m.id === signup) : null;

            const div = document.createElement('div');
            div.className = 'rota-role-card';
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <strong style="color: #a5b4fc; font-size: 0.95rem;">${esc(role)}</strong>
                        <p class="rota-status ${volunteerObj ? 'is-assigned' : 'is-unassigned'}">Status: ${volunteerObj ? '✅ Roster Assigned' : '⚠️ Unassigned'}</p>
                    </div>
                    <div>
                        ${volunteerObj ? `
                            <div class="volunteer-pill">
                                <span>${esc(volunteerObj.firstName)} ${esc(volunteerObj.lastName)}</span>
                                <button aria-label="Remove ${esc(volunteerObj.firstName)} ${esc(volunteerObj.lastName)} from ${esc(role)}" onclick="ChurchApp.removeVolunteerFromRole('${esc(event.id)}', '${esc(volunteerObj.id)}')" class="remove-vol-btn">×</button>
                            </div>
                        ` : `
                            <button class="action-btn-sm" onclick="ChurchApp.showMatchAI('${esc(event.id)}', '${esc(role).replace(/'/g, "\\'")}')">✨ AI Match</button>
                        `}
                    </div>
                </div>
            `;
            requiredRolesContainer.appendChild(div);
        });

        // Event listener to change event rota
        selectEvent.onchange = (e) => {
            this.session.selectedEventId = e.target.value;
            this.renderMinistry();
        };
    },

    removeVolunteerFromRole(eventId, volunteerId) {
        const event = this.db.events.find(e => e.id === eventId);
        if (event) {
            event.volunteersSignedUp = event.volunteersSignedUp.filter(v => v !== volunteerId);
            this.saveDB();
            this.renderMinistry();
        }
    },

    showMatchAI(eventId, role) {
        const event = this.db.events.find(e => e.id === eventId);
        const matches = window.AIEngine.matchVolunteersForEvent([role], this.db.members);
        
        const modal = document.getElementById('ai-matcher-modal');
        modal.innerHTML = `
            <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="matcher-modal-title">
                <div class="modal-header">
                    <h3 id="matcher-modal-title">AI Volunteer Matching System</h3>
                    <button class="modal-close" aria-label="Close volunteer matcher" onclick="ChurchApp.closeModal('ai-matcher-modal')">×</button>
                </div>
                <div class="modal-body">
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">Searching database for members with skill: <strong style="color:#8b5cf6;">${esc(role)}</strong> and solid engagement scoring index.</p>
                    <div class="matches-list">
                        ${matches.map(m => `
                            <div class="match-item">
                                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                                    <div>
                                        <strong>${esc(m.member.firstName)} ${esc(m.member.lastName)}</strong>
                                        <p style="font-size:0.75rem; color:var(--text-secondary);">Branch: ${esc(m.member.branchName)} | Engagement: ${esc(m.member.engagement_score)}%</p>
                                    </div>
                                    <div style="text-align:right;">
                                        <span class="match-percentage">${esc(m.score)}% Match</span>
                                        <button class="btn btn-primary-gradient btn-sm" style="margin-top:6px;" onclick="ChurchApp.assignVolunteerRole('${esc(event.id)}', '${esc(m.member.id)}')">Assign Role</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        ${matches.length === 0 ? '<p class="muted-italic" style="text-align:center;">No matching volunteers found in DB.</p>' : ''}
                    </div>
                </div>
            </div>
        `;
        this.openModal('ai-matcher-modal');
    },

    assignVolunteerRole(eventId, volunteerId) {
        const event = this.db.events.find(e => e.id === eventId);
        if (event) {
            if (!event.volunteersSignedUp.includes(volunteerId)) {
                event.volunteersSignedUp.push(volunteerId);
            }
            this.saveDB();
            this.closeModal('ai-matcher-modal');
            this.renderMinistry();
        }
    },

    // 11. Panel: Communications Dashboard Rendering
    renderCommunications() {
        const listContainer = document.getElementById('prayer-requests-list');
        listContainer.innerHTML = '';

        this.db.prayerRequests.forEach(pr => {
            const card = document.createElement('div');
            card.className = 'prayer-request-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                    <div>
                        <strong class="prayer-member">${esc(pr.memberName)}</strong>
                        <span class="branch-pill badge-b1" style="font-size: 0.7rem; margin-left: 8px;">${esc(pr.branchName)}</span>
                    </div>
                    <span class="category-pill prayer-category">🏷️ ${esc(pr.category)}</span>
                </div>
                <p class="prayer-text">"${esc(pr.text)}"</p>
                <div class="prayer-actions">
                    <span>Routed to: <strong>${esc(pr.route)}</strong></span>
                    <div>
                        <button class="action-btn-sm btn-approve" onclick="ChurchApp.approvePrayer('${esc(pr.id)}')">Approve</button>
                        <button class="action-btn-sm btn-dismiss" onclick="ChurchApp.deletePrayer('${esc(pr.id)}')">Dismiss</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });

        if (this.db.prayerRequests.length === 0) {
            listContainer.innerHTML = `<div class="empty-state">🙏<span>Inbox zero — no pending prayer requests.</span></div>`;
        }

        this.renderBroadcasts();
    },

    renderBroadcasts() {
        const log = document.getElementById('broadcast-log');
        if (log) {
            const items = (this.db.announcements || []);
            log.innerHTML = items.map(a => {
                const audience = a.audience === 'all' ? 'All Campuses' : ((this.db.branches.find(b => b.id === a.audience) || {}).name || a.audience);
                const when = a.sentAt ? new Date(a.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '';
                return `<div class="broadcast-item">
                    <div class="broadcast-item-head">
                        <strong>${esc(a.title)}</strong>
                        <span class="broadcast-when">${esc(when)}</span>
                    </div>
                    <p class="broadcast-body">${esc(a.body)}</p>
                    <div class="broadcast-tags">
                        <span class="broadcast-audience-pill">👥 ${esc(audience)}</span>
                        ${(a.channels || []).map(c => `<span class="broadcast-channel-pill">${c === 'email' ? '📧' : c === 'sms' ? '💬' : '🔔'} ${esc(c)}</span>`).join('')}
                        <span class="broadcast-reach">Delivered to ${esc(a.recipients)} members</span>
                    </div>
                </div>`;
            }).join('') || '<p class="muted-italic" style="font-size:0.8rem;">No broadcasts sent yet.</p>';
        }

        const form = document.getElementById('broadcast-form');
        if (form) {
            form.onsubmit = (e) => {
                e.preventDefault();
                const title = document.getElementById('broadcast-title').value.trim();
                const body = document.getElementById('broadcast-body').value.trim();
                const audience = document.getElementById('broadcast-audience').value;
                const channels = [...document.querySelectorAll('.broadcast-channel:checked')].map(c => c.value);
                if (!title || !body) return;
                if (channels.length === 0) { this.toast('Pick at least one channel.', 'error'); return; }

                const recipients = audience === 'all'
                    ? this.db.members.length
                    : this.db.members.filter(m => m.branchId === audience).length;

                this.db.announcements = this.db.announcements || [];
                this.db.announcements.unshift({
                    id: `an_${Date.now()}`,
                    title, body, audience, channels, recipients,
                    sentAt: new Date().toISOString()
                });
                this.saveDB();
                form.reset();
                document.querySelectorAll('.broadcast-channel').forEach(c => { c.checked = (c.value !== 'push'); });
                this.renderBroadcasts();
                this.toast(`📣 Broadcast sent to ${recipients} members via ${channels.join(', ')}.`);
            };
        }
    },

    approvePrayer(prId) {
        this.db.prayerRequests = this.db.prayerRequests.filter(p => p.id !== prId);
        this.saveDB();
        this.toast('Prayer request approved and routed to the prayer team.');
        this.renderCommunications();
    },

    deletePrayer(prId) {
        this.db.prayerRequests = this.db.prayerRequests.filter(p => p.id !== prId);
        this.saveDB();
        this.renderCommunications();
    },

    handleSermonRepurpose() {
        const title = document.getElementById('sermon-title-input').value.trim();
        const text = document.getElementById('sermon-notes-input').value.trim();

        if (!text) {
            this.toast('Please paste some sermon notes or transcript text first.', 'error');
            return;
        }

        const result = window.AIEngine.repurposeSermon(title, text);
        const resultsContainer = document.getElementById('ai-repurpose-results');
        
        resultsContainer.innerHTML = `
            <div class="repurposed-card animate-fade-in">
                <div class="ai-header-badge">✨ AI REPURPOSED SERMON KIT</div>
                <h4 class="kit-title">${esc(result.title)}</h4>
                <hr class="kit-divider">

                <h5 class="kit-subhead">3-Day Devotional Study Guide</h5>
                <div class="kit-devotional md-body">
                    ${renderMarkdown(result.devotional.day1)}
                    ${renderMarkdown(result.devotional.day2)}
                    ${renderMarkdown(result.devotional.day3)}
                </div>

                <h5 class="kit-subhead">Social Media Highlights</h5>
                <ul class="kit-list">
                    ${result.socialQuotes.map(q => `<li>${mdInline(q)}</li>`).join('')}
                </ul>

                <h5 class="kit-subhead">Small Group Study Questions</h5>
                <ol class="kit-list">
                    ${result.discussionQuestions.map(q => `<li>${mdInline(q)}</li>`).join('')}
                </ol>
            </div>
        `;
    },

    // 12. Panel: Member Mobile App Preview Simulation
    renderMobilePreview() {
        const view = this.session.simulatedMobileView;
        
        // Setup Active Subview View
        const subviews = ['mobile-home', 'mobile-sermons', 'mobile-bible', 'mobile-give', 'mobile-serve', 'mobile-chat'];
        subviews.forEach(sv => {
            const el = document.getElementById(sv);
            if (el) {
                el.style.display = (sv === `mobile-${view}`) ? 'block' : 'none';
            }
        });

        // Sync Mobile Navigation Active State
        const buttons = document.querySelectorAll('.mobile-tab-btn');
        buttons.forEach(btn => {
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Dynamic rendering based on views
        if (view === 'home') {
            this.renderMobileHome();
        } else if (view === 'sermons') {
            this.renderMobileSermons();
        } else if (view === 'bible') {
            this.renderMobileBible();
        } else if (view === 'give') {
            this.renderMobileGive();
        } else if (view === 'serve') {
            this.renderMobileServe();
        } else if (view === 'chat') {
            this.renderMobileChat();
        }
    },

    switchMobileView(viewName) {
        this.session.simulatedMobileView = viewName;
        this.renderMobilePreview();
    },

    renderMobileHome() {
        const eventsContainer = document.getElementById('mobile-upcoming-events');
        eventsContainer.innerHTML = '';

        this.db.events.forEach(e => {
            const div = document.createElement('div');
            div.className = 'mobile-event-card';
            const rsvped = (this.session.rsvpedEvents || []).includes(e.id);
            div.innerHTML = `
                <div class="mobile-event-top">
                    <strong>${esc(e.title)}</strong>
                    <span class="mobile-event-date">${esc(e.date)}</span>
                </div>
                <p class="mobile-event-desc">${esc(e.description)}</p>
                <div class="mobile-event-bottom">
                    <span class="mobile-event-time">⏰ ${esc(e.time)}</span>
                    <button class="mobile-rsvp-btn${rsvped ? ' is-rsvped' : ''}" ${rsvped ? 'disabled' : ''} onclick="ChurchApp.handleMobileRSVP('${esc(e.id)}')">${rsvped ? '✓ Going' : 'RSVP'}</button>
                </div>
            `;
            eventsContainer.appendChild(div);
        });

        this.renderMobileGroups();
    },

    handleMobileRSVP(eventId) {
        this.session.rsvpedEvents = this.session.rsvpedEvents || [];
        if (!this.session.rsvpedEvents.includes(eventId)) {
            this.session.rsvpedEvents.push(eventId);
        }
        this.renderMobileHome();
    },

    renderMobileSermons() {
        const container = document.getElementById('mobile-sermon-list');
        container.innerHTML = '';

        this.db.sermons.forEach(s => {
            const card = document.createElement('div');
            card.className = 'mobile-sermon-card';
            card.onclick = () => this.playMobileSermon(s.id);
            card.innerHTML = `
                <div class="mobile-sermon-thumb" style="background: linear-gradient(135deg, #1e1b4b, #311042); display:flex; justify-content:center; align-items:center;">
                    <span style="font-size:1.5rem;">🎬</span>
                </div>
                <div style="padding:10px;">
                    <strong style="font-size:0.85rem; color:var(--text-primary); display:block;">${esc(s.title)}</strong>
                    <span style="font-size:0.7rem; color:var(--text-secondary); display:block;">By ${esc(s.preacher)} | ${esc(s.duration)}</span>
                </div>
            `;
            container.appendChild(card);
        });
    },

    playMobileSermon(sermonId) {
        const sermon = this.db.sermons.find(s => s.id === sermonId);
        if (!sermon) return;

        const playerContainer = document.getElementById('mobile-sermon-player-container');
        playerContainer.style.display = 'block';
        playerContainer.innerHTML = `
            <div class="mobile-sermon-player" style="background: rgba(28,28,45,0.95); padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); margin-bottom:12px;">
                <video src="${encodeURI(sermon.mediaUrl)}" controls autoplay style="width:100%; border-radius:6px; max-height:120px;"></video>
                <div style="margin-top:8px;">
                    <strong style="font-size:0.85rem; color:#fff; display:block;">Playing: ${esc(sermon.title)}</strong>
                    <span style="font-size:0.7rem; color:#9ca3af;">Campus: ${esc(sermon.branchName)}</span>
                </div>
            </div>
        `;
    },

    // Deterministic Verse of the Day — same verse for everyone on a given date.
    renderVerseOfDay() {
        const el = document.getElementById('verse-of-day');
        if (!el) return;
        const pool = [
            { ref: 'Lamentations 3:22-23', text: 'His mercies never come to an end; they are new every morning.' },
            { ref: 'Joshua 1:9', text: 'Be strong and courageous. Do not be frightened, for the Lord your God is with you wherever you go.' },
            { ref: 'Psalm 118:24', text: 'This is the day that the Lord has made; let us rejoice and be glad in it.' },
            { ref: 'Proverbs 3:5-6', text: 'Trust in the Lord with all your heart, and do not lean on your own understanding.' },
            { ref: 'Zephaniah 3:17', text: 'The Lord your God is in your midst, a mighty one who will save.' },
            { ref: '2 Corinthians 12:9', text: 'My grace is sufficient for you, for my power is made perfect in weakness.' },
            { ref: 'Psalm 46:1', text: 'God is our refuge and strength, a very present help in trouble.' }
        ];
        const now = new Date();
        const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
        const v = pool[dayOfYear % pool.length];
        el.innerHTML = `
            <span class="votd-eyebrow">✨ Verse of the Day</span>
            <p class="votd-text">"${esc(v.text)}"</p>
            <span class="votd-ref">— ${esc(v.ref)}</span>`;
    },

    _todayStr() { return new Date().toISOString().split('T')[0]; },

    getReadingState() {
        this.db.readingState = this.db.readingState || {};
        if (!this.db.readingState.m1) {
            this.db.readingState.m1 = { streak: 0, lastReadDate: null, plans: {} };
        }
        return this.db.readingState.m1;
    },

    renderReadingPlans() {
        const state = this.getReadingState();
        const streakEl = document.getElementById('reading-streak');
        if (streakEl) {
            streakEl.innerHTML = state.streak > 0 ? `🔥 ${state.streak}-day streak` : '';
        }

        const container = document.getElementById('reading-plans');
        if (!container) return;
        container.innerHTML = (this.db.readingPlans || []).map(plan => {
            const done = state.plans[plan.id] || [];
            const total = plan.days.length;
            const pct = Math.round((done.length / total) * 100);
            // "Today's reading" = first uncompleted day, else the last day.
            let todayIdx = plan.days.findIndex((_, i) => !done.includes(i));
            if (todayIdx === -1) todayIdx = total - 1;
            const day = plan.days[todayIdx];
            const complete = done.includes(todayIdx);
            const finished = done.length === total;
            return `<div class="reading-plan-card">
                <div class="reading-plan-head">
                    <strong>${esc(plan.emoji)} ${esc(plan.title)}</strong>
                    <span class="reading-plan-progress">${done.length}/${total}</span>
                </div>
                <div class="reading-bar"><div class="reading-bar-fill" style="width:${pct}%;"></div></div>
                ${finished
                    ? `<p class="reading-done">✅ Plan complete — well done!</p>`
                    : `<div class="reading-today">
                        <span class="reading-day-label">Day ${todayIdx + 1}: ${esc(day.ref)}</span>
                        <p class="reading-day-text">"${esc(day.text)}"</p>
                        <button class="reading-mark-btn${complete ? ' done' : ''}" onclick="ChurchApp.markReadingDay('${esc(plan.id)}', ${todayIdx})">${complete ? 'Completed ✓' : 'Mark as read'}</button>
                    </div>`}
            </div>`;
        }).join('');
    },

    markReadingDay(planId, dayIdx) {
        const state = this.getReadingState();
        state.plans[planId] = state.plans[planId] || [];
        const arr = state.plans[planId];
        if (arr.includes(dayIdx)) return; // already read

        arr.push(dayIdx);

        // Update streak on the first reading of a new calendar day.
        const today = this._todayStr();
        if (state.lastReadDate !== today) {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            state.streak = (state.lastReadDate === yesterday) ? state.streak + 1 : 1;
            state.lastReadDate = today;
        }

        this.saveDB();
        this.renderReadingPlans();
        this.toast('📖 Reading complete. Keep the streak going!');
    },

    renderMobileBible() {
        this.renderVerseOfDay();
        this.renderReadingPlans();

        const verseContainer = document.getElementById('mobile-bible-verses');
        const searchInput = document.getElementById('mobile-bible-search').value.toLowerCase();
        const selectedBook = document.getElementById('mobile-bible-book').value;
        const selectedChapter = document.getElementById('mobile-bible-chapter').value;

        // Mock bible translation data
        const bibleData = [
            { ref: 'Malachi 3:10', text: 'Bring the full tithe into the storehouse, that there may be food in my house. And thereby put me to the test, says the Lord of hosts.' },
            { ref: 'Luke 12:34', text: 'For where your treasure is, there will your heart be also.' },
            { ref: 'Romans 12:1', text: 'I appeal to you therefore, brothers, by the mercies of God, to present your bodies as a living sacrifice, holy and acceptable to God.' },
            { ref: 'Proverbs 11:25', text: 'A generous soul will prosper; he who refreshes others will himself be refreshed.' },
            { ref: 'Hebrews 11:1', text: 'Now faith is the assurance of things hoped for, the conviction of things not seen.' },
            { ref: 'Ephesians 2:8', text: 'For by grace you have been saved through faith. And this is not your own doing; it is the gift of God.' },
            { ref: 'John 3:16', text: 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.' },
            { ref: 'Isaiah 40:31', text: 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.' },
            { ref: 'Philippians 4:13', text: 'I can do all things through him who strengthens me.' },
            { ref: 'Hebrews 11:6', text: 'And without faith it is impossible to please him, for whoever would draw near to God must believe that he exists and that he rewards those who seek him.' },
            { ref: '1 Corinthians 13:13', text: 'So now faith, hope, and love abide, these three; but the greatest of these is love.' }
        ];

        verseContainer.innerHTML = '';
        
        const filtered = bibleData.filter(v => {
            // Book match
            if (selectedBook !== 'all') {
                if (!v.ref.toLowerCase().includes(selectedBook.toLowerCase())) return false;
            }
            // Chapter match
            if (selectedChapter !== 'all') {
                const parts = v.ref.split(':');
                if (parts.length > 0) {
                    const chapterPart = parts[0].trim().split(' ').pop();
                    if (chapterPart !== selectedChapter) return false;
                }
            }
            // Search text match
            if (searchInput) {
                if (!v.ref.toLowerCase().includes(searchInput) && !v.text.toLowerCase().includes(searchInput)) return false;
            }
            return true;
        });

        filtered.forEach(v => {
            const p = document.createElement('div');
            p.className = 'mobile-bible-verse-item';
            p.innerHTML = `
                <strong style="font-size:0.8rem; color:#a5b4fc; display:block;">${esc(v.ref)} (${esc(this.session.bibleVersion)})</strong>
                <p style="font-size:0.8rem; color:var(--text-secondary); margin-top:2px;">"${esc(v.text)}"</p>
            `;
            verseContainer.appendChild(p);
        });

        if (filtered.length === 0) {
            verseContainer.innerHTML = `<div style="text-align:center; color:#9ca3af; padding:15px; font-size:0.75rem;">No verses found matching query.</div>`;
        }

        // Add bind events
        document.getElementById('mobile-bible-search').oninput = () => this.renderMobileBible();
        document.getElementById('mobile-bible-book').onchange = () => this.renderMobileBible();
        document.getElementById('mobile-bible-chapter').onchange = () => this.renderMobileBible();
        document.getElementById('mobile-bible-version').onchange = (e) => {
            this.session.bibleVersion = e.target.value;
            this.renderMobileBible();
        };
    },

    // Processing fee model used for the "cover the fees" option (card rate).
    givingFee(amount) {
        return Math.round((amount * 0.029 + 0.30) * 100) / 100;
    },

    renderMobileGive() {
        // Generates dropdown options for giving branches
        const select = document.getElementById('mobile-giving-branch');
        select.innerHTML = '';
        this.db.branches.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.id;
            opt.text = b.name;
            select.appendChild(opt);
        });

        const amountInput = document.getElementById('mobile-giving-amount');
        const feeLabel = document.getElementById('give-fees-amount');
        const coverFees = document.getElementById('mobile-giving-cover-fees');
        const updateFee = () => {
            const amt = parseFloat(amountInput.value) || 0;
            if (feeLabel) feeLabel.textContent = `$${this.givingFee(amt).toFixed(2)}`;
        };

        // Quick-amount chips
        document.querySelectorAll('#mobile-give .give-chip').forEach(chip => {
            chip.onclick = () => {
                amountInput.value = chip.dataset.amount;
                document.querySelectorAll('#mobile-give .give-chip').forEach(c => c.classList.remove('is-active'));
                chip.classList.add('is-active');
                updateFee();
            };
        });
        amountInput.oninput = () => {
            document.querySelectorAll('#mobile-give .give-chip').forEach(c => c.classList.remove('is-active'));
            updateFee();
        };
        if (coverFees) coverFees.onchange = updateFee;
        updateFee();
    },

    handleMobileGiving() {
        const branchId = document.getElementById('mobile-giving-branch').value;
        let amount = parseFloat(document.getElementById('mobile-giving-amount').value);
        const category = document.getElementById('mobile-giving-category').value;
        const method = document.getElementById('mobile-giving-method').value;
        const frequency = document.getElementById('mobile-giving-frequency').value;
        const coverFees = document.getElementById('mobile-giving-cover-fees').checked;

        if (isNaN(amount) || amount <= 0) return;

        let feeAdded = 0;
        if (coverFees) {
            feeAdded = this.givingFee(amount);
            amount = Math.round((amount + feeAdded) * 100) / 100;
        }

        const branchObj = this.db.branches.find(b => b.id === branchId);

        // Assume logged-in member John Kamau (m1) is doing the giving
        const loggedInMemberId = 'm1';
        const memberObj = this.db.members.find(m => m.id === loggedInMemberId);

        const newTx = {
            id: `t_${Date.now()}`,
            branchId,
            branchName: branchObj.name,
            memberId: loggedInMemberId,
            memberName: `${memberObj.firstName} ${memberObj.lastName}`,
            amount,
            category,
            date: new Date().toISOString().split('T')[0],
            paymentMethod: method,
            receiptNumber: `REC-2026-${Math.floor(Math.random() * 90000) + 10000}`
        };

        this.db.transactions.unshift(newTx);

        // Recurring schedule
        let recurringNote = '';
        if (frequency !== 'once') {
            this.db.recurringGifts = this.db.recurringGifts || [];
            const next = new Date();
            next.setDate(next.getDate() + (frequency === 'weekly' ? 7 : 30));
            this.db.recurringGifts.unshift({
                id: `rec_${Date.now()}`,
                memberId: loggedInMemberId,
                memberName: `${memberObj.firstName} ${memberObj.lastName}`,
                branchId,
                branchName: branchObj.name,
                amount,
                category,
                frequency,
                method,
                nextDate: next.toISOString().split('T')[0],
                active: true
            });
            recurringNote = `<p style="font-size:0.7rem; color:#34d399; margin-top:6px;">🔁 Recurring ${esc(frequency)} gift scheduled — next on ${esc(next.toISOString().split('T')[0])}.</p>`;
        }

        // Boost engagement index
        memberObj.engagement_score = Math.min(memberObj.engagement_score + 5, 100);
        this.saveDB();

        document.getElementById('mobile-giving-form').reset();

        // Generate simulated mobile success dialog
        const modal = document.getElementById('mobile-giving-success-overlay');
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div style="background: #1c1c2d; padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); width: 85%; max-width:280px; text-align:center;">
                <span style="font-size:3rem;">🎉</span>
                <h4 style="color:#fff; margin-top:10px;">Giving Successful!</h4>
                <p style="font-size:0.75rem; color:#9ca3af; margin-top:5px;">Thank you for your donation of <strong style="color:#fff;">$${amount.toFixed(2)}</strong> toward ${esc(category)}.${feeAdded ? ` <span style="color:#9ca3af;">(includes $${feeAdded.toFixed(2)} fees)</span>` : ''}</p>
                <p style="font-size:0.7rem; color:#a5b4fc; font-weight:bold; margin-top:8px;">Receipt Generated: ${esc(newTx.receiptNumber)}</p>
                ${recurringNote}
                <button class="btn btn-primary-gradient btn-sm" style="margin-top:15px; width:100%;" onclick="document.getElementById('mobile-giving-success-overlay').style.display='none'">Awesome</button>
            </div>
        `;

        this.renderAll();
    },

    renderMobileServe() {
        const openRolesContainer = document.getElementById('mobile-open-serve-roles');
        openRolesContainer.innerHTML = '';

        // Extract list of all open positions in upcoming events
        this.db.events.forEach(e => {
            e.rolesRequired.forEach(role => {
                // Check if someone has signed up
                const isAssigned = e.volunteersSignedUp.some(mId => {
                    const member = this.db.members.find(m => m.id === mId);
                    return member && member.volunteer_skills.includes(role);
                });

                if (!isAssigned) {
                    const div = document.createElement('div');
                    div.className = 'mobile-serve-item-card';
                    div.innerHTML = `
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <strong style="font-size:0.8rem; color:var(--text-primary); display:block;">${esc(role)}</strong>
                                <span style="font-size:0.7rem; color:var(--text-secondary);">Event: ${esc(e.title)}</span>
                                <span style="font-size:0.7rem; color:#a5b4fc; display:block;">Date: ${esc(e.date)}</span>
                            </div>
                            <button class="mobile-apply-btn" onclick="ChurchApp.handleMobileServeSignup('${esc(e.id)}', '${esc(role).replace(/'/g, "\\'")}')">Serve</button>
                        </div>
                    `;
                    openRolesContainer.appendChild(div);
                }
            });
        });

        if (openRolesContainer.innerHTML === '') {
            openRolesContainer.innerHTML = `<div class="empty-state small">✅<span>All volunteer slots are fully rostered. Thank you!</span></div>`;
        }

        // Render current member skills list
        const m1 = this.db.members.find(m => m.id === 'm1');
        const skillsContainer = document.getElementById('mobile-my-skills-list');
        skillsContainer.innerHTML = m1.volunteer_skills.map(s => `<span class="skill-tag">${esc(s)}</span>`).join('');
    },

    handleMobileServeSignup(eventId, role) {
        // Logged-in member John Kamau (m1) registers
        const event = this.db.events.find(e => e.id === eventId);
        const m1 = this.db.members.find(m => m.id === 'm1');
        
        if (event && m1) {
            // Check if member already has this skill, if not add it
            if (!m1.volunteer_skills.includes(role)) {
                m1.volunteer_skills.push(role);
            }

            if (!event.volunteersSignedUp.includes('m1')) {
                event.volunteersSignedUp.push('m1');
            }

            // Boost engagement index
            m1.engagement_score = Math.min(m1.engagement_score + 6, 100);
            this.saveDB();

            this.toast(`You're serving as ${role} for ${event.title}. Thank you!`);
            this.renderAll();
        }
    },

    handleMobileVolunteerSignup() {
        const input = document.getElementById('new-skill-input');
        if (!input || !input.value.trim()) return;

        const newSkill = input.value.trim();
        const m1 = this.db.members.find(m => m.id === 'm1');
        if (m1) {
            if (!m1.volunteer_skills.includes(newSkill)) {
                m1.volunteer_skills.push(newSkill);
            }
            this.saveDB();
            input.value = '';
            this.renderMobileServe();
        }
    },

    renderMobileChat() {
        const body = document.getElementById('mobile-chat-body');
        if (body.innerHTML.trim() === '') {
            // Seed welcome message
            body.innerHTML = `
                <div class="chat-bubble bot">
                    <p>Hello John! I am your <strong>Pastoral Care Assistant</strong>. Feel free to ask me anything about service schedules, digital tithing, community cell groups, or volunteering roles. 🕊️</p>
                    <span class="chat-time">${new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</span>
                </div>
            `;
        }
    },

    handleMobileChatSend() {
        const input = document.getElementById('mobile-chat-input');
        const text = input.value.trim();
        if (!text) return;

        const body = document.getElementById('mobile-chat-body');

        // Add user bubble
        const userDiv = document.createElement('div');
        userDiv.className = 'chat-bubble user';
        userDiv.innerHTML = `
            <p>${esc(text)}</p>
            <span class="chat-time">${new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</span>
        `;
        body.appendChild(userDiv);
        input.value = '';

        // Scroll chat
        body.scrollTop = body.scrollHeight;

        // Simulate AI Bot response after 600ms
        setTimeout(() => {
            const botResponse = window.AIEngine.getBotResponse(text);
            
            // Parse optional quick-reply buttons and strip those lines from the
            // spoken text so options render only as buttons (not duplicated inline).
            const options = [];
            const textLines = [];
            botResponse.split('\n').forEach(line => {
                const trimmed = line.trim();
                if (trimmed.startsWith('- **') && trimmed.includes('**')) {
                    options.push(trimmed.split('**')[1]);
                } else if (trimmed.startsWith('- ') && trimmed.length > 2) {
                    options.push(trimmed.substring(2));
                } else {
                    textLines.push(line);
                }
            });

            let buttonsHtml = '';
            if (options.length > 0) {
                buttonsHtml = `
                    <div class="chat-options-container">
                        ${options.map(opt => `
                            <button class="chat-option-btn" onclick="ChurchApp.handleChatOptionClick('${esc(opt).replace(/'/g, "\\'")}')">${esc(opt)}</button>
                        `).join('')}
                    </div>
                `;
            }

            const botDiv = document.createElement('div');
            botDiv.className = 'chat-bubble bot animate-fade-in';
            botDiv.innerHTML = `
                <div class="md-body chat-md">${renderMarkdown(textLines.join('\n'))}</div>
                ${buttonsHtml}
                <span class="chat-time">${new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</span>
            `;
            body.appendChild(botDiv);
            body.scrollTop = body.scrollHeight;
        }, 600);
    },

    handleChatOptionClick(optionValue) {
        const input = document.getElementById('mobile-chat-input');
        if (input) {
            input.value = optionValue;
            this.handleMobileChatSend();
        }
    },

    // UI Helpers
    _lastFocusedBeforeModal: null,

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        this._lastFocusedBeforeModal = document.activeElement;
        modal.style.display = 'flex';
        // Move focus into the dialog for keyboard/screen-reader users.
        const focusTarget = modal.querySelector('.modal-close, [autofocus], button, input, a[href]');
        if (focusTarget) focusTarget.focus();
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
        // Restore focus to whatever opened the modal.
        if (this._lastFocusedBeforeModal && typeof this._lastFocusedBeforeModal.focus === 'function') {
            this._lastFocusedBeforeModal.focus();
            this._lastFocusedBeforeModal = null;
        }
    },

    closeAnyOpenModal() {
        ['member-detail-modal', 'ai-matcher-modal', 'receipt-modal'].forEach((id) => {
            const modal = document.getElementById(id);
            if (modal && modal.style.display === 'flex') this.closeModal(id);
        });
    },

    // Non-blocking toast notification — replaces alert() for friendlier feedback.
    toast(message, type = 'success') {
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('role', 'status');
            document.body.appendChild(container);
        }
        const icon = type === 'error' ? '⚠️' : (type === 'info' ? 'ℹ️' : '✅');
        const el = document.createElement('div');
        el.className = `toast toast-${type}`;
        el.innerHTML = `<span class="toast-icon">${icon}</span><span>${esc(message)}</span>`;
        container.appendChild(el);
        setTimeout(() => {
            el.classList.add('leaving');
            setTimeout(() => el.remove(), 280);
        }, 3600);
    },

    // Direct submit prayer request from mobile app
    submitMobilePrayer() {
        const textarea = document.getElementById('mobile-prayer-textarea');
        const text = textarea.value.trim();
        if (!text) return;

        // Categorize via AI
        const categoryResult = window.AIEngine.categorizePrayerRequest(text);

        const newPrayer = {
            id: `pr_${Date.now()}`,
            memberId: 'm1',
            memberName: 'John Kamau',
            branchName: 'Nairobi HQ',
            text: text,
            category: categoryResult.category,
            route: categoryResult.route,
            status: 'Assigned',
            timestamp: new Date().toISOString()
        };

        this.db.prayerRequests.push(newPrayer);
        this.saveDB();
        textarea.value = '';

        this.toast(`Prayer received — categorized as “${categoryResult.category}” and routed to ${categoryResult.route}.`, 'info');

        this.renderAll();
    }
};

// Start application
window.onload = () => {
    // Expose BEFORE init so inline handlers and window.ChurchApp stay valid even
    // if init() throws (e.g. a missing dependency mid-render).
    window.ChurchApp = ChurchApp;

    // Close modals on Escape and on backdrop click — expected dialog behavior.
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') ChurchApp.closeAnyOpenModal();
    });
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) ChurchApp.closeModal(overlay.id);
        });
    });

    try {
        ChurchApp.init();
    } catch (err) {
        console.error('Church 2.0 failed to initialize:', err);
    }
};
