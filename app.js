// Maximum Miracle Centre — main application controller
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
            { id: 'b1', name: 'Nairobi CBD', location: 'Embassy Cinema, Latema Road, off Tom Mboya Street, Nairobi', code: 'NRB' },
            { id: 'b2', name: 'Kawangware', location: 'Kawangware, Nairobi', code: 'KWG' },
            { id: 'b3', name: 'Nakuru', location: 'Langa Langa, Kanu Street, Nakuru', code: 'NKR' }
        ],
        members: [
            { id: 'm1', branchId: 'b1', branchName: 'Nairobi CBD', firstName: 'John', lastName: 'Kamau', email: 'john.kamau@maximummiracle.org', phone: '+254712345678', familyId: 'fam_kamau', familyRole: 'Husband', spiritualMilestones: ['Baptized: 2018-04-12', 'Member: 2019-01-01'], volunteer_skills: ['Worship Vocals', 'Keyboard', 'Guitar'], engagement_score: 95, maritalStatus: 'Married', background: 'Led worship at a fellowship in Thika for six years; works as a sound technician in the CBD.', expectations: 'To grow the worship team and mentor younger musicians.' },
            { id: 'm2', branchId: 'b1', branchName: 'Nairobi CBD', firstName: 'Mary', lastName: 'Kamau', email: 'mary.kamau@maximummiracle.org', phone: '+254722345678', familyId: 'fam_kamau', familyRole: 'Wife', spiritualMilestones: ['Baptized: 2019-06-20'], volunteer_skills: ['Childcare', 'Greeting'], engagement_score: 88, maritalStatus: 'Married', background: "Primary school teacher; ran a children's holiday programme before joining.", expectations: "To help build up the children's ministry." },
            { id: 'm3', branchId: 'b1', branchName: 'Nairobi CBD', firstName: 'David', lastName: 'Onyango', email: 'david.onyango@email.com', phone: '+254733333333', familyId: 'fam_onyango', familyRole: 'Single', spiritualMilestones: ['Member: 2021-03-10'], volunteer_skills: ['Ushering', 'Security', 'First Aid'], engagement_score: 75 },
            { id: 'm4', branchId: 'b1', branchName: 'Nairobi CBD', firstName: 'Grace', lastName: 'Mwangi', email: 'grace.m@email.com', phone: '+254744444444', familyId: 'fam_mwangi', familyRole: 'Single', spiritualMilestones: ['Baptized: 2022-11-05'], volunteer_skills: ['Ushering', 'Greeting'], engagement_score: 62 },
            { id: 'm5', branchId: 'b2', branchName: 'Kawangware', firstName: 'Samuel', lastName: 'Kariuki', email: 'samuel.kariuki@email.com', phone: '+254701223344', familyId: 'fam_kariuki', familyRole: 'Husband', spiritualMilestones: ['Member: 2015-05-24'], volunteer_skills: ['Sound Engineering', 'Video Editing'], engagement_score: 92 },
            { id: 'm6', branchId: 'b2', branchName: 'Kawangware', firstName: 'Esther', lastName: 'Kariuki', email: 'esther.kariuki@email.com', phone: '+254701223355', familyId: 'fam_kariuki', familyRole: 'Wife', spiritualMilestones: ['Member: 2015-05-24'], volunteer_skills: ['Worship Vocals', 'Public Speaking'], engagement_score: 78 },
            { id: 'm7', branchId: 'b2', branchName: 'Kawangware', firstName: 'Faith', lastName: 'Wanjiku', email: 'faith.wanjiku@email.com', phone: '+254702334455', familyId: 'fam_wanjiku', familyRole: 'Single', spiritualMilestones: ['Baptized: 2024-02-14'], volunteer_skills: ['Greeting', 'Social Media'], engagement_score: 41, maritalStatus: 'Single', background: 'Recent graduate, works in a salon in Kawangware. New to church life.', expectations: 'To find community and a small group close to home.' }, // Flagged at risk
            { id: 'm8', branchId: 'b3', branchName: 'Nakuru', firstName: 'Peter', lastName: 'Kiprono', email: 'peter.kiprono@email.com', phone: '+254703445566', familyId: 'fam_kiprono', familyRole: 'Single', spiritualMilestones: ['Member: 2023-09-12'], volunteer_skills: ['Graphics', 'Video Editing', 'Website Support'], engagement_score: 84 },
            { id: 'm9', branchId: 'b3', branchName: 'Nakuru', firstName: 'Alice', lastName: 'Chebet', email: 'alice.chebet@email.com', phone: '+254704556677', familyId: 'fam_chebet', familyRole: 'Single', spiritualMilestones: [], volunteer_skills: ['Greeting', 'First Aid'], engagement_score: 35 }, // Flagged at risk
            { id: 'm10', branchId: 'b1', branchName: 'Nairobi CBD', firstName: 'Kennedy', lastName: 'Otieno', email: 'kennedy.o@email.com', phone: '+254755555555', familyId: 'fam_otieno', familyRole: 'Husband', spiritualMilestones: ['Baptized: 2010-08-15'], volunteer_skills: ['Youth Mentorship', 'Security'], engagement_score: 30 } // Flagged at risk
        ],
        transactions: [],
        attendance: [],
        // A few standing orders so the recurring-giving panel demonstrates the
        // feature out of the box. Members here are from the handcrafted core.
        recurringGifts: [
            { id: 'rec_seed_1', memberId: 'm1', memberName: 'John Kamau', branchId: 'b1', branchName: 'Nairobi CBD', amount: 5000, category: 'Tithe', frequency: 'monthly', method: 'M-Pesa', nextDate: '2026-08-01', active: true },
            { id: 'rec_seed_2', memberId: 'm2', memberName: 'Mary Kamau', branchId: 'b1', branchName: 'Nairobi CBD', amount: 1500, category: 'Offering', frequency: 'weekly', method: 'M-Pesa', nextDate: '2026-07-20', active: true },
            { id: 'rec_seed_3', memberId: 'm5', memberName: 'Samuel Kariuki', branchId: 'b2', branchName: 'Kawangware', amount: 3000, category: 'Tithe', frequency: 'monthly', method: 'Bank Transfer', nextDate: '2026-08-05', active: true },
            { id: 'rec_seed_4', memberId: 'm8', memberName: 'Peter Kiprono', branchId: 'b3', branchName: 'Nakuru', amount: 2000, category: 'Project Donation', frequency: 'monthly', method: 'M-Pesa', nextDate: '2026-08-03', active: true }
        ],
        // One campaign per fund category — `raised` is summed from matching
        // transactions, so two campaigns sharing a category would double-count.
        // `raisedOffset` carries the funds banked before this app's transaction
        // window; without it a months-long capital appeal reads as ~0%.
        campaigns: [
            { id: 'camp1', name: "Children's Home Support Fund", goal: 1500000, raisedOffset: 940000, fundCategory: 'Project Donation', branchId: 'b1' },
            { id: 'camp2', name: 'NURU TV Broadcast Equipment', goal: 850000, raisedOffset: 410000, fundCategory: 'Pledge', branchId: 'b1' }
        ],
        followUps: [
            { id: 'fu1', name: 'Peter Njoroge', branchId: 'b1', stage: 'New Guest', owner: 'Pastor Joseph', note: 'First-time guest at 2nd Service, filled a connect card.' },
            { id: 'fu2', name: 'Linda Achieng', branchId: 'b1', stage: 'Contacted', owner: 'Grace Mwangi', note: 'Called; interested in joining a home fellowship.' },
            { id: 'fu3', name: 'Brian Mutua', branchId: 'b2', stage: 'Connected', owner: 'Samuel Kariuki', note: 'Joined the Tuesday Kawangware home fellowship.' },
            { id: 'fu4', name: 'Janet Cherono', branchId: 'b3', stage: 'New Guest', owner: 'Peter Kiprono', note: 'Walked in at the Nakuru campus after watching NURU TV.' }
        ],
        groups: [
            { id: 'g1', name: 'Young Adults Fellowship', branchId: 'b1', schedule: 'Tue 6:30 PM', description: '20s–30s community — Bible study, mentorship and fellowship.', memberIds: ['m1', 'm3'] },
            { id: 'g2', name: 'Family Life & Marriage', branchId: 'b1', schedule: 'Wed 5:30 PM', description: 'For couples growing together in faith.', memberIds: ['m2'] },
            { id: 'g3', name: 'Intercessors Fellowship', branchId: 'b1', schedule: 'Fri 6:00 AM', description: 'Corporate prayer for the church, the city and the nation.', memberIds: [] },
            { id: 'g4', name: "Men's Morning Prayer", branchId: 'b2', schedule: 'Sat 6:00 AM', description: 'Prayer, accountability and breakfast.', memberIds: ['m5'] },
            { id: 'g5', name: 'Kawangware Home Fellowship', branchId: 'b2', schedule: 'Tue 6:00 PM', description: 'Midweek fellowship in homes around the campus.', memberIds: [] },
            { id: 'g6', name: 'Women of Grace', branchId: 'b3', schedule: 'Thu 10:00 AM', description: 'Bible study and fellowship.', memberIds: ['m8'] },
            { id: 'g7', name: 'Nakuru Youth Fellowship', branchId: 'b3', schedule: 'Sat 4:00 PM', description: 'Teens and young adults — worship, mentorship and sport.', memberIds: [] }
        ],
        announcements: [
            { id: 'an1', title: 'Baptism Sunday — register now', body: 'Maximum Miracle Centre is holding a baptism service on the last Sunday of the month at the Nairobi CBD campus. Speak to a pastor or reply to register.', audience: 'all', channels: ['sms', 'push'], recipients: 10, sentAt: '2026-07-06T09:00:00Z' }
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
            { id: 'e2', branchId: 'b2', title: 'Kawangware Community Outreach', description: 'Food, clothing and medical support for families around the Kawangware campus.', date: '2026-07-25', time: '09:00', rolesRequired: ['Greeting', 'First Aid', 'Security'], volunteersSignedUp: ['m6'] },
            { id: 'e3', branchId: 'b1', title: 'Sunday 2nd Service — Nairobi CBD', description: 'Main Sunday gathering at Embassy Cinema, Latema Road.', date: '2026-07-12', time: '10:00', rolesRequired: ['Ushering', 'Greeting', 'Sound Engineering', 'Worship Vocals', 'Security'], volunteersSignedUp: ['m3', 'm4'] }
        ],
        sermons: [
            { id: 's1', title: 'Walking by Faith, Not by Sight', preacher: 'Bishop Joseph Mwangi', date: '2026-07-05', branchName: 'Nairobi CBD', thumbnail: 'sermon_faith', duration: '42:15', mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
            { id: 's2', title: 'The Heart of a Faithful Steward', preacher: 'Pastor Samuel Kariuki', date: '2026-06-28', branchName: 'Kawangware', thumbnail: 'sermon_steward', duration: '38:40', mediaUrl: 'https://www.w3schools.com/html/movie.mp4' }
        ],
        prayerRequests: [
            { id: 'pr1', memberId: 'm1', memberName: 'John Kamau', branchName: 'Nairobi CBD', text: 'Praying for my family as we plan to travel upcountry this week.', category: 'Family', route: 'Family Life & Marriage Ministry', status: 'Approved', timestamp: '2026-07-10T14:30:00Z' },
            { id: 'pr2', memberId: 'm7', memberName: 'Faith Wanjiku', branchName: 'Kawangware', text: 'I am recovering from knee surgery and still in moderate pain.', category: 'Healing', route: 'Hospital & Home Care Ministry', status: 'Assigned', timestamp: '2026-07-11T09:15:00Z' }
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
        { email: 'admin@maximummiracle.org', password: 'grace', name: 'HQ Administrator', role: 'hq_admin', branchId: 'b1' },
        { email: 'kawangware@maximummiracle.org', password: 'grace', name: 'Kawangware Campus Admin', role: 'branch_admin', branchId: 'b2' },
        { email: 'worship@maximummiracle.org', password: 'grace', name: 'Worship Leader', role: 'ministry_leader', branchId: 'b1' },
        { email: 'john@maximummiracle.org', password: 'grace', name: 'John Kamau', role: 'member', branchId: 'b1' }
    ],

    // RBAC: which tabs each role may access. Enforced in renderAll — not just
    // hidden in the nav, so a member cannot reach an admin panel by any route.
    ROLE_TABS: {
        hq_admin: ['admin_dashboard', 'admin_directory', 'admin_financials', 'admin_attendance', 'admin_ministry', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'],
        branch_admin: ['admin_dashboard', 'admin_directory', 'admin_financials', 'admin_attendance', 'admin_ministry', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'],
        ministry_leader: ['admin_dashboard', 'admin_attendance', 'admin_ministry', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'],
        member: ['mobile_preview']
    },

    // 4. Initialize Data & Render
    init() {
        this.loadDB();
        this.loadTheme();
        this.setupEventHandlers();

        // Auth gate. When the production API is configured, restore the session
        // from the stored token (validated against the server); otherwise use
        // the standalone localStorage demo session.
        if (window.Church2API && Church2API.isEnabled()) {
            this.initApiAuth();
        } else {
            const session = this.loadSession();
            if (session) {
                this.applyUser(session);
                this.showApp();
                this.renderAll();
            } else if (this.wantsPreviewEntry()) {
                this.enterPreview();
            } else {
                this.showAuthScreen('credentials');
            }
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
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem('church2_db', JSON.stringify(this.db));
        } catch (e) {
            // Most likely QuotaExceededError — surface it instead of throwing
            // uncaught mid-action (which would abort the surrounding handler).
            console.error('Could not persist data:', e);
            if (this.toast) this.toast('Local storage is full — recent changes may not be saved.', 'error');
        }
    },

    // Bump whenever the seeded demo dataset itself changes shape or content
    // (campuses, people, currency). A saved DB stamped with an older version is
    // discarded and re-seeded so returning demo visitors don't keep stale data.
    // In API mode this is moot — the server's data replaces it on hydrate.
    SEED_VERSION: 5,

    // Persistence: Load state
    loadDB() {
        // Snapshot the pristine seed before a saved DB overwrites it, so
        // ensureSchema can backfill from one source of truth.
        const seed = this.db;
        if (typeof localStorage !== 'undefined') {
            const saved = localStorage.getItem('church2_db');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    // Guard against valid-but-wrong JSON (e.g. "null", an array,
                    // a string) that would break ensureSchema/renderers.
                    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.members)) {
                        throw new Error('Saved DB is not a valid database object');
                    }
                    if (parsed.__seedVersion !== this.SEED_VERSION) {
                        throw new Error('Saved DB predates the current seed');
                    }
                    this.db = parsed;
                    this.ensureSchema(seed);
                    return;
                } catch (e) {
                    console.error("Error parsing saved DB, regenerating:", e);
                    this.db = seed;
                }
            }
        }
        // Fallback: generate and save
        this.db.__seedVersion = this.SEED_VERSION;
        this.generateCongregation();
        this.generateInitialTransactions();
        this.generateInitialAttendance();
        this.saveDB();
    },

    // Backfill collections added in later versions onto an older saved DB so
    // renderers never hit undefined. Attendance was added in v2. `seed` is the
    // pristine dataset from the class literal.
    ensureSchema(seed) {
        seed = seed || {};
        let changed = false;
        if (this.db.__seedVersion !== this.SEED_VERSION) { this.db.__seedVersion = this.SEED_VERSION; changed = true; }
        if (!Array.isArray(this.db.transactions)) { this.db.transactions = []; changed = true; }
        if (!Array.isArray(this.db.events)) { this.db.events = []; changed = true; }
        if (!Array.isArray(this.db.sermons)) { this.db.sermons = []; changed = true; }
        if (!Array.isArray(this.db.prayerRequests)) { this.db.prayerRequests = []; changed = true; }
        if (!Array.isArray(this.db.recurringGifts)) { this.db.recurringGifts = []; changed = true; }
        // Backfill the rest straight from the pristine seed — one source of
        // truth, so rebranding the dataset never has to be done twice.
        ['branches', 'campaigns', 'followUps', 'groups', 'announcements', 'readingPlans'].forEach((key) => {
            if (!Array.isArray(this.db[key])) {
                this.db[key] = JSON.parse(JSON.stringify(seed[key] || []));
                changed = true;
            }
        });
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
            let savedTheme = localStorage.getItem('church2_theme') || 'dark';
            // The old neon theme was retired in favour of the on-brand
            // Midnight theme; migrate anyone still holding the old value so
            // they don't land on a class that no longer has styles.
            if (savedTheme === 'cyber') {
                savedTheme = 'midnight';
                localStorage.setItem('church2_theme', savedTheme);
            }
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

    // A client opening a preview link should land in the app, not on a login
    // form. `?preview` (or #preview) does that.
    //
    // Deliberately impossible to reach once a real backend is configured:
    // apiEnabled() means live data behind real credentials, and no URL
    // parameter may ever bypass that. In standalone mode there is nothing to
    // protect — every record on screen is seeded sample data.
    wantsPreviewEntry() {
        if (this.apiEnabled()) return false;
        const q = window.location.search + window.location.hash;
        return /(^|[?&#])preview\b/.test(q);
    },

    // Sign straight in as the HQ administrator, the role that shows the whole
    // product. The auth gate is still there — signing out reveals it.
    enterPreview() {
        const user = this.DEMO_USERS.find((u) => u.role === 'hq_admin');
        if (!user) { this.showAuthScreen('credentials'); return; }
        const { password, ...safe } = user;
        this.saveSession(safe);
        this.applyUser(safe);
        this.showApp();
        this.renderAll();
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
        this.renderDemoBanner();
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
                    <div class="auth-brand"><span class="auth-logo"><svg class="svg-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v15M7.5 9.2h9"/><path d="M5.6 19.4c1.7-2.2 3.8-3.3 6.4-3.3s4.7 1.1 6.4 3.3" opacity="0.85"/></svg></span><span>Maximum Miracle Centre</span></div>
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
                <div class="auth-brand"><span class="auth-logo"><svg class="svg-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4v15M7.5 9.2h9"/><path d="M5.6 19.4c1.7-2.2 3.8-3.3 6.4-3.3s4.7 1.1 6.4 3.3" opacity="0.85"/></svg></span><span>Maximum Miracle Centre</span></div>
                <h2 class="auth-title">Sign in to your ministry console</h2>
                <p class="auth-sub">Secure access to your church's data.</p>
                <form id="login-form" class="auth-form">
                    <label class="auth-label" for="login-email">Email</label>
                    <input type="email" id="login-email" class="auth-input" placeholder="you@maximummiracle.org" autocomplete="username" required>
                    <label class="auth-label" for="login-password">Password</label>
                    <input type="password" id="login-password" class="auth-input" placeholder="••••••••" autocomplete="current-password" required>
                    <p id="auth-error" class="auth-error" role="alert"></p>
                    <button type="submit" class="auth-btn">Continue</button>
                </form>
                ${this.apiEnabled() ? '' : `
                <button type="button" class="auth-btn auth-preview-btn" id="enter-preview-btn">
                    Open the preview &rarr;
                </button>
                <p class="auth-demo-notice"><strong>Sample data.</strong>
                    Nothing here is ${esc((window.MMC_BRAND && MMC_BRAND.name) || 'the church')}'s real
                    membership or giving, and giving is recorded rather than charged. Or sign in
                    below with any account to see the login flow.</p>`}
                <div class="auth-demo">
                    <span>Demo accounts (password <code>grace</code>):</span>
                    <div class="auth-demo-chips">
                        <button type="button" class="auth-demo-chip" data-email="admin@maximummiracle.org">HQ Admin</button>
                        <button type="button" class="auth-demo-chip" data-email="kawangware@maximummiracle.org">Campus Admin</button>
                        <button type="button" class="auth-demo-chip" data-email="worship@maximummiracle.org">Ministry Leader</button>
                        <button type="button" class="auth-demo-chip" data-email="john@maximummiracle.org">Member</button>
                    </div>
                </div>
            </div>`;
        document.getElementById('login-form').onsubmit = (e) => { e.preventDefault(); this.handleLogin(); };
        const previewBtn = document.getElementById('enter-preview-btn');
        if (previewBtn) previewBtn.onclick = () => this.enterPreview();

        auth.querySelectorAll('.auth-demo-chip').forEach(chip => {
            chip.onclick = () => {
                document.getElementById('login-email').value = chip.dataset.email;
                document.getElementById('login-password').value = 'grace';
            };
        });
    },

    // Restore an API-backed session from the stored token (production mode).
    initApiAuth() {
        if (Church2API.getToken()) {
            Church2API.me()
                .then(({ user }) => { this.applyUser(user); this.showApp(); this.hydrateThenRender(); })
                .catch(() => { Church2API.logout(); this.showAuthScreen('credentials'); });
        } else {
            this.showAuthScreen('credentials');
        }
    },

    _finishApiLogin(user) {
        // The JWT is already stored by the API client; never persist the password.
        this.applyUser(user);
        this.showApp();
        this.hydrateThenRender();
        this.toast(`Welcome, ${user.name}. 👋`);
    },

    // ----- Backend data layer -------------------------------------------------
    // In production the app is backend-backed: this.db is hydrated from Postgres
    // on login and every mutation is mirrored to the API. In standalone demo mode
    // (no apiBase configured) all of this is a no-op and the localStorage flow
    // below is used unchanged.
    apiEnabled() { return Boolean(window.Church2API && Church2API.isEnabled()); },

    // Who may change the membership roll. Agreed 17 Aug: adding and removing
    // members is the administrator's job alone — ministry leaders and members
    // may read the roll but never alter it. Checked at every mutation as well
    // as when drawing the UI, because a hidden button is not a permission.
    isAdmin() {
        return this.session.currentRole === 'hq_admin' || this.session.currentRole === 'branch_admin';
    },

    // How someone travelled to the service. Motorcycle is labelled for Kenya,
    // where a boda is the everyday equivalent of a bus fare.
    ARRIVAL_MODES: ['Car', 'Motorcycle (boda)', 'Bicycle', 'Walked', 'Other'],

    // Marital status options offered at registration; '' means not disclosed.
    MARITAL_STATUSES: ['Single', 'Married', 'Engaged', 'Widowed', 'Separated', 'Divorced'],

    // The role shown beside a name on the check-in sheet. Members serve under
    // their primary ministry skill; everyone else is simply a member.
    serviceRole(member) {
        const skills = member.volunteer_skills || [];
        return skills.length ? skills[0] : 'Member';
    },

    // A promise-based confirm so destructive actions get a real dialog rather
    // than a blocking window.confirm(), which the rest of the app avoids.
    confirmAction({ title, body, confirmLabel = 'Confirm', danger = true }) {
        return new Promise((resolve) => {
            const modal = document.getElementById('confirm-modal');
            if (!modal) { resolve(false); return; }
            modal.querySelector('#confirm-title').textContent = title;
            modal.querySelector('#confirm-body').textContent = body;
            const ok = modal.querySelector('#confirm-ok');
            const cancel = modal.querySelector('#confirm-cancel');
            ok.textContent = confirmLabel;
            ok.className = danger ? 'btn btn-danger' : 'btn btn-primary-gradient';
            const finish = (answer) => {
                ok.onclick = null;
                cancel.onclick = null;
                this.closeModal('confirm-modal');
                resolve(answer);
            };
            ok.onclick = () => finish(true);
            cancel.onclick = () => finish(false);
            this.openModal('confirm-modal');
        });
    },

    // One session per account. When the server rejects our token because the
    // account signed in somewhere else, drop straight back to the login screen
    // and say why — a silent failure would look like the app was broken.
    handleSessionLost(message) {
        if (this._sessionLostHandled) return;
        this._sessionLostHandled = true;
        if (typeof localStorage !== 'undefined') localStorage.removeItem('church2_session');
        this.session.currentUser = null;
        this.showAuthScreen('credentials');
        const err = document.getElementById('auth-error');
        if (err) err.textContent = message || 'Your session ended. Please sign in again.';
        this._sessionLostHandled = false;
    },

    // Standalone mode means every name, gift and attendance mark on screen is
    // seeded sample data. Say so where a client previewing the console cannot
    // miss it — mistaking these figures for the church's own records would be
    // the worst possible first impression.
    renderDemoBanner() {
        const bar = document.getElementById('demo-banner');
        if (!bar) return;
        if (this.apiEnabled() || sessionStorage.getItem('church2_demo_notice') === 'hidden') {
            bar.hidden = true;
            return;
        }
        const name = (window.MMC_BRAND && MMC_BRAND.name) || 'this church';
        bar.querySelector('.demo-banner-text').innerHTML =
            `<strong>Sample data.</strong> These members, gifts and attendance records are ` +
            `illustrative — none of ${esc(name)}'s real information is in this preview, and ` +
            `giving is recorded here, not charged.`;
        bar.hidden = false;
        bar.querySelector('.demo-banner-close').onclick = () => {
            sessionStorage.setItem('church2_demo_notice', 'hidden');
            bar.hidden = true;
        };
    },

    // Paint immediately with whatever we have, then refresh from the server.
    // First paint is never blocked on the network; a slow/failed fetch just
    // leaves the current data in place.
    hydrateThenRender() {
        this.renderAll();
        if (!this.apiEnabled()) return;
        this.hydrateFromApi().then(() => this.renderAll()).catch(() => {});
    },

    // Pull the shared dataset into this.db so every existing (synchronous) view
    // reflects Postgres. Scope is enforced server-side; we request the full
    // permitted set with 'global' and let the client's campus filter narrow it,
    // exactly as in standalone mode. A slice is only replaced when its fetch
    // succeeded, so a partial outage degrades gracefully. Never throws.
    async hydrateFromApi() {
        if (!this.apiEnabled()) return;
        const g = 'global';
        const grab = (p) => p.then((r) => r).catch((e) => { console.error('Hydrate failed:', e); return undefined; });
        const [members, transactions, attendance, groups, followUps, announcements, prayerRequests, events] = await Promise.all([
            grab(Church2API.members(g)),
            grab(Church2API.transactions(g)),
            grab(Church2API.attendance(g)),
            grab(Church2API.groups(g)),
            grab(Church2API.followups(g)),
            grab(Church2API.announcements()),
            grab(Church2API.prayerRequests(g)),
            grab(Church2API.events(g)),
        ]);
        // Members drive most member-centric views; only replace with a non-empty
        // set so an unseeded/misconfigured backend can't blank the whole UI.
        if (Array.isArray(members) && members.length) this.db.members = members;
        if (Array.isArray(transactions)) this.db.transactions = transactions;
        if (Array.isArray(attendance)) this.db.attendance = attendance;
        if (Array.isArray(groups)) this.db.groups = groups;
        if (Array.isArray(followUps)) this.db.followUps = followUps;
        if (Array.isArray(announcements)) this.db.announcements = announcements;
        if (Array.isArray(prayerRequests)) this.db.prayerRequests = prayerRequests;
        if (Array.isArray(events) && events.length) this.db.events = events;
    },

    // Fire an API write in the background. The local optimistic update has
    // already rendered, so we only surface failures. `onOk` reconciles any
    // server-assigned id back onto the optimistic record. Never throws.
    apiWrite(promiseFactory, onOk) {
        if (!this.apiEnabled()) return;
        Promise.resolve().then(promiseFactory)
            .then((r) => { if (onOk) try { onOk(r); } catch (e) { console.error(e); } })
            .catch((e) => {
                console.error('Sync failed:', e);
                if (this.toast) this.toast('Saved locally, but not synced to the server.', 'error');
            });
    },

    handleLogin() {
        const email = document.getElementById('login-email').value.trim().toLowerCase();
        const password = document.getElementById('login-password').value;
        const err = document.getElementById('auth-error');

        // Production: authenticate against the real API.
        if (window.Church2API && Church2API.isEnabled()) {
            Church2API.login(email, password)
                .then((r) => {
                    if (r.mfaRequired) this.showAuthScreen('mfa', { email, ticket: r.ticket });
                    else if (r.token) { Church2API.completePasswordLogin(r); this._finishApiLogin(r.user); }
                })
                .catch((e) => { if (err) err.textContent = e.message || 'Sign in failed.'; });
            return;
        }

        // Demo: match a local account.
        const user = this.DEMO_USERS.find(u => u.email === email && u.password === password);
        if (!user) {
            if (err) err.textContent = 'Invalid email or password. Try a demo account below.';
            return;
        }
        this.showAuthScreen('mfa', { email: user.email });
    },

    handleMfa(ctx) {
        const code = (document.getElementById('mfa-code').value || '').trim();
        const err = document.getElementById('auth-error');
        if (!/^\d{6}$/.test(code)) {
            if (err) err.textContent = 'Enter the 6-digit code.';
            return;
        }

        // Production: verify the code with the API and receive the access token.
        if (window.Church2API && Church2API.isEnabled()) {
            Church2API.verifyMfa(ctx.ticket, code)
                .then((r) => this._finishApiLogin(r.user))
                .catch((e) => { if (err) err.textContent = e.message || 'Incorrect code.'; });
            return;
        }

        // Demo verification accepts the demo code.
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
        if (window.Church2API && Church2API.isEnabled()) Church2API.logout();
        this.session.currentUser = null;
        this.showAuthScreen('credentials');
    },

    // Helper: Generate historical transactions over the last 14 days
    // Ten members makes every chart and average look like a toy. A real MMC
    // campus roll runs into the hundreds, so we grow the handcrafted core (m1–m10,
    // referenced by groups, events and prayer requests) into a congregation of a
    // believable size. Names are drawn from common Kenyan given/family names.
    generateCongregation() {
        const FIRST = ['Alice', 'Benard', 'Brenda', 'Caleb', 'Carolyne', 'Collins', 'Cynthia', 'Daniel',
            'Dennis', 'Dorcas', 'Edwin', 'Elizabeth', 'Emmanuel', 'Eunice', 'Evans', 'Gladys', 'Griffin',
            'Hellen', 'Ian', 'Irene', 'Isaac', 'Jackline', 'James', 'Joan', 'Joseph', 'Josphat', 'Judy',
            'Kevin', 'Lilian', 'Lucy', 'Martin', 'Mercy', 'Moses', 'Naomi', 'Nelson', 'Nancy', 'Patrick',
            'Pauline', 'Purity', 'Rose', 'Ruth', 'Silas', 'Sharon', 'Stephen', 'Susan', 'Timothy',
            'Valentine', 'Victor', 'Winnie', 'Zachary'];
        const LAST = ['Achieng', 'Barasa', 'Cheruiyot', 'Chepkoech', 'Gitonga', 'Kimani', 'Kiplagat',
            'Kirui', 'Koech', 'Langat', 'Maina', 'Makau', 'Mbugua', 'Mburu', 'Mutiso', 'Muthoni',
            'Mwende', 'Nyakundi', 'Njuguna', 'Nyambura', 'Obara', 'Ochieng', 'Odhiambo', 'Okoth',
            'Omondi', 'Ondiek', 'Owuor', 'Rotich', 'Sang', 'Wafula', 'Waweru', 'Wekesa'];
        const SKILLS = ['Ushering', 'Greeting', 'Worship Vocals', 'Keyboard', 'Guitar', 'Drums',
            'Sound Engineering', 'Video Editing', 'Graphics', 'Childcare', 'Youth Mentorship',
            'Intercession', 'First Aid', 'Security', 'Social Media', 'Hospitality', 'Public Speaking'];
        const ROLES = ['Single', 'Husband', 'Wife'];
        const MARITAL = ['Single', 'Married', 'Married', 'Engaged', 'Widowed', ''];
        const BEFORE = [
            'Ran a small shop in the estate before joining.',
            'Teacher at a nearby primary school.',
            'Worked upcountry in farming; moved to the city last year.',
            'Boda operator; joined after a friend invited him.',
            'Tailor with her own workshop.',
            'Studied at a technical college; now looking for work.',
            'Served as an usher at a previous church.',
            'Nurse at a clinic in the neighbourhood.',
            '',
        ];
        const HOPES = [
            'To grow in the word and find a home group.',
            'To serve somewhere practical.',
            'To bring the whole family into church life.',
            'To be discipled and eventually lead.',
            'Prayer support through a difficult season.',
            'To use their skills for the media team.',
            '',
        ];

        // Weighted so the CBD mother church carries most of the roll.
        const spread = [
            { branchId: 'b1', count: 78 },
            { branchId: 'b2', count: 41 },
            { branchId: 'b3', count: 27 }
        ];
        const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
        let n = this.db.members.length;

        spread.forEach(({ branchId, count }) => {
            const branch = this.db.branches.find(b => b.id === branchId);
            for (let i = 0; i < count; i++) {
                n += 1;
                const firstName = pick(FIRST);
                const lastName = pick(LAST);
                const skills = [...new Set([pick(SKILLS), pick(SKILLS)])];
                // Engagement clusters high — most of a congregation is engaged —
                // with a genuine tail so the at-risk analytics have real subjects.
                const roll = Math.random();
                const engagement = roll < 0.12 ? 20 + Math.floor(Math.random() * 25)
                    : roll < 0.35 ? 45 + Math.floor(Math.random() * 25)
                    : 70 + Math.floor(Math.random() * 30);
                this.db.members.push({
                    id: `m${n}`,
                    branchId,
                    branchName: branch ? branch.name : '',
                    firstName,
                    lastName,
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${n}@email.com`,
                    phone: `+2547${String(10000000 + Math.floor(Math.random() * 89999999))}`,
                    familyId: `fam_${lastName.toLowerCase()}_${n}`,
                    familyRole: pick(ROLES),
                    spiritualMilestones: Math.random() < 0.6
                        ? [`Member: ${2012 + Math.floor(Math.random() * 13)}-0${1 + Math.floor(Math.random() * 9)}-1${Math.floor(Math.random() * 9)}`]
                        : [],
                    volunteer_skills: skills,
                    engagement_score: engagement,
                    maritalStatus: pick(MARITAL),
                    background: pick(BEFORE),
                    expectations: pick(HOPES)
                });
            }
        });

        // Enrol roughly half of each campus into that campus's groups. Groups
        // seeded with two or three named members look empty next to an 83-person
        // campus roll, which misreads as "nobody uses this feature".
        this.db.branches.forEach((branch) => {
            const groups = this.db.groups.filter(g => g.branchId === branch.id);
            if (!groups.length) return;
            const pool = this.db.members.filter(m => m.branchId === branch.id);
            pool.forEach((m, i) => {
                if (Math.random() > 0.5) return;
                const g = groups[i % groups.length];
                if (!g.memberIds.includes(m.id)) g.memberIds.push(m.id);
            });
        });
    },

    generateInitialTransactions() {
        // Amount bands are in Kenyan Shillings and differ by category — a tithe
        // is a far larger cheque than a Sunday offering, and flattening them
        // would make the giving analytics meaningless.
        const bands = {
            'Tithe': [2000, 25000],
            'Offering': [100, 2000],
            'Pledge': [1000, 15000],
            'Project Donation': [500, 10000]
        };
        const categories = Object.keys(bands);
        // Weighted to reflect Kenyan giving: M-Pesa carries the clear majority.
        const methods = ['M-Pesa', 'M-Pesa', 'M-Pesa', 'M-Pesa', 'Bank Transfer', 'Cash', 'Card'];
        const now = new Date();

        // Roughly one gift per member over the fortnight, so the giving totals
        // stay proportional to the size of the congregation.
        const txCount = Math.max(40, Math.round(this.db.members.length * 1.4));
        for (let i = 0; i < txCount; i++) {
            const memberIndex = Math.floor(Math.random() * this.db.members.length);
            const member = this.db.members[memberIndex];
            const category = categories[Math.floor(Math.random() * categories.length)];
            const [lo, hi] = bands[category];
            // Round to the nearest 50 shillings — real giving lands on round numbers.
            const amount = Math.round((Math.random() * (hi - lo) + lo) / 50) * 50;
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
                const ARRIVALS = ['Car', 'Motorcycle (boda)', 'Bicycle', 'Walked', 'Walked', 'Other'];
                this.db.attendance.push({
                    id: `att_${member.id}_${date}`,
                    memberId: member.id,
                    branchId: member.branchId,
                    date,
                    present,
                    arrivalMode: present ? ARRIVALS[Math.floor(Math.random() * ARRIVALS.length)] : ''
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
                // Chart.js paints to a canvas and can't inherit the new CSS
                // tokens, so the charts need recolouring. Do it in place rather
                // than via renderAll(): a full re-render destroys and rebuilds
                // every chart, and the rebuild animates up from zero, so the
                // canvas is visibly blank for a beat on every theme switch.
                this.applyChartTheme();
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
    // Live theme tokens for canvas-drawn charts, which can't inherit CSS.
    chartTheme() {
        const css = getComputedStyle(document.body);
        const read = (name, fallback) => (css.getPropertyValue(name) || '').trim() || fallback;
        const light = document.body.classList.contains('theme-light');
        return {
            tick: read('--text-secondary', '#9ca3af'),
            grid: light ? 'rgba(15, 23, 42, 0.08)' : 'rgba(255,255,255,0.05)',
            surface: light ? '#ffffff' : '#0b1220',
            legend: read('--text-primary', '#f3f4f6')
        };
    },

    // Recolour the live charts for the current theme without rebuilding them.
    // `update('none')` skips the entry animation, so there is no blank frame.
    applyChartTheme() {
        const ct = this.chartTheme();

        const giving = this.charts.giving;
        if (giving) {
            const sc = giving.options.scales;
            sc.y.ticks.color = ct.tick;
            sc.y.grid.color = ct.grid;
            sc.x.ticks.color = ct.tick;
            giving.update('none');
        }

        const categories = this.charts.categories;
        if (categories) {
            categories.data.datasets[0].borderColor = ct.surface;
            categories.options.plugins.legend.labels.color = ct.legend;
            categories.update('none');
        }

        const attendance = this.charts.attendance;
        if (attendance) {
            const sc = attendance.options.scales;
            sc.y.ticks.color = ct.tick;
            sc.y.grid.color = ct.grid;
            sc.x.ticks.color = ct.tick;
            attendance.update('none');
        }
    },

    // Fill every campus <select> from db.branches so the campus list lives in
    // exactly one place. Selects keep any leading "all"/"global" option and
    // their current value where it is still valid.
    populateCampusSelects() {
        document.querySelectorAll('select[data-campus-select]').forEach((sel) => {
            const previous = sel.value;
            const keep = [...sel.options].filter(o => o.value === 'all' || o.value === 'global');
            sel.innerHTML = '';
            keep.forEach(o => sel.appendChild(o));
            this.db.branches.forEach((b) => {
                const opt = document.createElement('option');
                opt.value = b.id;
                opt.textContent = b.name;
                sel.appendChild(opt);
            });
            if (previous && [...sel.options].some(o => o.value === previous)) sel.value = previous;
        });

        // Member pickers list the people actually on the books, scoped to the
        // campus in view so a branch admin can't record giving for another campus.
        const scope = this.session.currentBranch;
        const inScope = this.db.members.filter(m => scope === 'global' || m.branchId === scope);
        document.querySelectorAll('select[data-member-select]').forEach((sel) => {
            const previous = sel.value;
            const keep = [...sel.options].filter(o => o.value === 'anonymous');
            sel.innerHTML = '';
            keep.forEach(o => sel.appendChild(o));
            inScope.forEach((m) => {
                const opt = document.createElement('option');
                opt.value = m.id;
                opt.textContent = `${m.firstName} ${m.lastName}`;
                sel.appendChild(opt);
            });
            if (previous && [...sel.options].some(o => o.value === previous)) sel.value = previous;
        });
    },

    renderAll() {
        this.populateCampusSelects();
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

        // The "Simulated Role" preview control is a super-admin-only affordance.
        // Hiding it for other signed-in users closes an escalation path: a member
        // must not be able to switch themselves into an admin role.
        const roleSimWrap = document.getElementById('role-simulator-select')?.closest('div');
        if (roleSimWrap) {
            const isSuperAdmin = !this.session.currentUser || this.session.currentUser.role === 'hq_admin';
            roleSimWrap.style.display = isSuperAdmin ? '' : 'none';
        }

        // Branch scope: HQ admin roams all campuses; every other role is locked
        // to the campus they actually administer (from their signed-in account),
        // not a hardcoded default.
        const branchSelect = document.getElementById('global-branch-select');
        if (role === 'hq_admin') {
            branchSelect.removeAttribute('disabled');
            // Keep the control showing the scope actually in force. The options
            // are rebuilt from the database on every render, which resets the
            // element to its first option ("All Branches") — so without this the
            // selector claimed a global view while the data was one campus.
            if (branchSelect.value !== this.session.currentBranch) {
                branchSelect.value = this.session.currentBranch;
            }
        } else {
            const homeBranch = (this.session.currentUser && this.session.currentUser.branchId) || 'b1';
            this.session.currentBranch = homeBranch;
            branchSelect.value = homeBranch;
            branchSelect.setAttribute('disabled', 'true');
        }

        // Adding members is the administrator's job (agreed 17 Aug), so the
        // enlist form is not offered to anyone else. handleCreateMember()
        // re-checks — this only removes the temptation.
        const addCard = document.getElementById('member-add-card');
        if (addCard) addCard.style.display = this.isAdmin() ? '' : 'none';

        // Sidebar link visibility is driven entirely by ROLE_TABS — the single
        // source of truth — so the nav can never show a link the RBAC check at
        // the top of renderAll would immediately bounce.
        const allowedTabs = this.ROLE_TABS[role] || this.ROLE_TABS.member;
        document.querySelectorAll('.nav-link').forEach(link => {
            const tab = link.dataset.tab;
            link.style.display = allowedTabs.includes(tab) ? 'flex' : 'none';
            link.classList.toggle('active', tab === activeTab);
        });

        // Render main view panels
        const panels = ['admin_dashboard', 'admin_directory', 'admin_financials', 'admin_attendance', 'admin_ministry', 'admin_followups', 'admin_groups', 'admin_communications', 'mobile_preview'];
        panels.forEach(p => {
            const panelEl = document.getElementById(p);
            if (panelEl) {
                panelEl.style.display = (p === activeTab) ? 'block' : 'none';
            }
        });

        // Only the active panel re-renders, so a panel the current role may not
        // open keeps whatever markup it had when someone else was signed in —
        // including admin-only controls such as Remove. They are inert (every
        // mutation re-checks permission) but leaving them in the document is
        // the sort of thing that quietly becomes a real hole later, so clear
        // out the dynamic content of anything this role cannot reach.
        const PANEL_CONTENT = {
            admin_directory: ['member-directory-tbody'],
            admin_financials: ['financials-tbody', 'contribution-summary', 'giving-insights'],
            admin_attendance: ['attendance-tbody', 'attendance-arrival', 'attendance-summary'],
            admin_ministry: ['rota-required-roles', 'prayer-requests-list'],
            admin_followups: ['followup-board'],
            admin_groups: ['groups-grid'],
            admin_communications: ['broadcast-log'],
        };
        Object.entries(PANEL_CONTENT).forEach(([tab, ids]) => {
            if (allowedTabs.includes(tab)) return;
            ids.forEach((id) => {
                const node = document.getElementById(id);
                if (node) node.innerHTML = '';
            });
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
        document.getElementById('dash-giving-total').innerText = money(snapshot.thisWeekGiving);
        document.getElementById('dash-giving-change').innerText = snapshot.givingDiffPercent;
        document.getElementById('dash-giving-change').className = snapshot.givingDiffPercent.startsWith('-') ? 'changedown' : 'changeup';

        document.getElementById('dash-attendance-total').innerText = snapshot.avgAttendance;
        document.getElementById('dash-attendance-change').innerText = snapshot.attendanceDiffPercent;
        document.getElementById('dash-attendance-change').className = snapshot.attendanceDiffPercent.startsWith('-') ? 'changedown' : 'changeup';

        document.getElementById('dash-members-total').innerText = branchMembers.length;
        // Label the scope honestly — "Across campuses" is wrong when a single
        // campus is selected, and the count would look like a church-wide total.
        const scopeLabel = document.getElementById('dash-members-scope');
        if (scopeLabel) {
            const b = this.db.branches.find(x => x.id === this.session.currentBranch);
            scopeLabel.innerText = b ? `At ${b.name}` : 'Across all campuses';
        }

        // Render AI Ministry Health Executive Briefing card
        const aiSnapshotCard = document.getElementById('ai-snapshot-content');
        if (aiSnapshotCard) {
            aiSnapshotCard.innerHTML = `
                <div class="ai-header-badge">
                    <svg class="badge-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z"/><path d="M18.5 15.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/></svg> AI-GENERATED MONDAY BRIEFING
                </div>
                <p class="ai-report-title">Weekly Ministry Health Report</p>
                <div class="weekly-bulletin-ai md-body">${renderMarkdown(snapshot.bulletSummary)}</div>
                <div class="ai-exec-context md-body">
                    <strong>Executive Context:</strong> ${renderMarkdown(snapshot.executiveSnapshot)}
                </div>
                <div class="at-risk-container">
                    <span class="at-risk-heading"><svg class="inline-ico warn-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 15.5H3z"/><path d="M12 10v4M12 17.2v.1"/></svg> CRITICAL CARE ALERTS (At-Risk Members)</span>
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
                    note.textContent = 'Charts are unavailable offline. Reconnect to view visual analytics.';
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

            const ct = this.chartTheme();
            this.charts.giving = new Chart(ctxGiving, {
                type: 'line',
                data: {
                    labels: dateLabels,
                    datasets: [{
                        label: `Daily Giving (${MMC_BRAND.currency.symbol})`,
                        data: amounts,
                        borderColor: MMC_BRAND.palette.royalLight,
                        backgroundColor: 'rgba(59, 130, 246, 0.14)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointBackgroundColor: MMC_BRAND.palette.gold,
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
                            // Anchor at zero: a floating baseline visually
                            // exaggerates ordinary week-to-week variation.
                            beginAtZero: true,
                            grid: { color: ct.grid },
                            ticks: { color: ct.tick, callback: (v) => MMC_BRAND.moneyShort(v) }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: ct.tick }
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

            const ctc = this.chartTheme();
            this.charts.categories = new Chart(ctxCategories, {
                type: 'doughnut',
                data: {
                    labels: categories,
                    datasets: [{
                        data: categorySums,
                        // Royal-and-gold brand ramp rather than a generic
                        // rainbow, so the chart reads as MMC at a glance.
                        backgroundColor: [
                            'rgba(29, 78, 216, 0.90)',   // Tithe — royal
                            'rgba(240, 180, 41, 0.90)',  // Offering — gold
                            'rgba(96, 165, 250, 0.90)',  // Pledge — light royal
                            'rgba(200, 137, 15, 0.90)'   // Project — deep gold
                        ],
                        borderColor: ctc.surface,
                        borderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right',
                            labels: { color: ctc.legend, font: { size: 11 } }
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

        // Roster rows. A register of a hundred-plus people is worked through in a
        // hurry at the door, so: search to jump to a name, the role beside it so
        // an usher recognises who they are looking at, the whole row as the
        // check-in target, and travel recorded in the same pass.
        const filter = (this.session.attendanceFilter || '').trim().toLowerCase();
        const visible = filter
            ? members.filter((m) =>
                `${m.firstName} ${m.lastName}`.toLowerCase().includes(filter) ||
                this.serviceRole(m).toLowerCase().includes(filter))
            : members;

        const tbody = document.getElementById('attendance-tbody');
        if (tbody) {
            tbody.innerHTML = visible.map(m => {
                const rec = recordFor(m.id) || {};
                const present = !!rec.present;
                const arrival = rec.arrivalMode || '';
                const name = `${m.firstName} ${m.lastName}`;
                const options = ['<option value="">How did they travel?</option>']
                    .concat(this.ARRIVAL_MODES.map((mode) =>
                        `<option value="${esc(mode)}"${mode === arrival ? ' selected' : ''}>${esc(mode)}</option>`))
                    .join('');
                return `<tr class="${present ? 'is-present' : ''}" onclick="ChurchApp.toggleAttendance('${esc(m.id)}')">
                    <td>
                        <div class="member-profile-cell">
                            <div class="member-avatar">${esc((m.firstName[0] || '') + (m.lastName[0] || ''))}</div>
                            <span class="member-name">${esc(name)}</span>
                        </div>
                    </td>
                    <td><span class="role-pill">${esc(this.serviceRole(m))}</span></td>
                    <td><span class="branch-pill badge-${esc(m.branchId)}">${esc(m.branchName)}</span></td>
                    <td>
                        <select class="select-custom arrival-select" ${present ? '' : 'disabled'}
                            aria-label="How ${esc(name)} arrived"
                            onclick="event.stopPropagation()"
                            onchange="event.stopPropagation(); ChurchApp.setArrivalMode('${esc(m.id)}', this.value)">
                            ${options}
                        </select>
                    </td>
                    <td style="text-align:right;">
                        <button class="attendance-toggle ${present ? 'on' : ''}" role="switch" aria-checked="${present}"
                            aria-label="Mark ${esc(name)} ${present ? 'absent' : 'present'}"
                            onclick="event.stopPropagation(); ChurchApp.toggleAttendance('${esc(m.id)}')">
                            <span class="attendance-toggle-knob"></span>
                        </button>
                    </td>
                </tr>`;
            }).join('') || `<tr><td colspan="5" class="muted-italic" style="text-align:center; padding:24px;">${
                filter ? 'Nobody on this register matches that search.' : 'No members in this scope.'
            }</td></tr>`;
        }

        // Search and bulk controls. Re-bound each render because the panel's
        // markup is static but its handlers depend on the current scope.
        const search = document.getElementById('attendance-search');
        if (search) {
            search.value = this.session.attendanceFilter || '';
            search.oninput = (e) => {
                this.session.attendanceFilter = e.target.value;
                this.renderAttendance();
            };
        }
        const allPresent = document.getElementById('attendance-all-present');
        if (allPresent) allPresent.onclick = () => this.setAllAttendance(visible, true);
        const allAbsent = document.getElementById('attendance-all-absent');
        if (allAbsent) allAbsent.onclick = () => this.setAllAttendance(visible, false);

        // Trend + summary
        this.renderAttendanceChart(attendance, serviceDates);
        this.renderAttendanceSummary(members, attendance);
        this.renderArrivalSummary(members, serviceDate);
    },

    // How the congregation travelled to the selected service. Useful for
    // planning parking, boda bays and walking-distance outreach.
    renderArrivalSummary(members, serviceDate) {
        const el = document.getElementById('attendance-arrival');
        if (!el) return;
        const records = (this.db.attendance || []).filter(
            (a) => a.date === serviceDate && a.present && members.some((m) => m.id === a.memberId));
        if (!records.length) {
            el.innerHTML = '<h4>How they arrived</h4><p class="muted-italic" style="font-size:0.78rem;">Nobody checked in yet for this service.</p>';
            return;
        }
        const counts = {};
        this.ARRIVAL_MODES.forEach((m) => { counts[m] = 0; });
        let unrecorded = 0;
        records.forEach((r) => {
            if (r.arrivalMode && counts[r.arrivalMode] !== undefined) counts[r.arrivalMode] += 1;
            else unrecorded += 1;
        });
        const max = Math.max(1, ...Object.values(counts), unrecorded);
        const row = (label, n) => `<div class="arrival-row">
            <span class="arrival-label">${esc(label)}</span>
            <span class="arrival-bar"><span style="width:${Math.round((n / max) * 100)}%"></span></span>
            <span class="arrival-count">${n}</span>
        </div>`;
        el.innerHTML = '<h4>How they arrived</h4>'
            + this.ARRIVAL_MODES.map((m) => row(m, counts[m])).join('')
            + (unrecorded ? row('Not recorded', unrecorded) : '');
    },

    // Mark everyone currently listed. Operates on the filtered view, so a
    // search for "Ushering" followed by "Mark all present" checks in the ushers
    // and nobody else.
    setAllAttendance(members, present) {
        const serviceDate = this.session.selectedServiceDate;
        if (!serviceDate || !members.length) return;
        this.db.attendance = this.db.attendance || [];
        members.forEach((m) => {
            const rec = this.db.attendance.find((a) => a.memberId === m.id && a.date === serviceDate);
            if (rec) {
                rec.present = present;
                if (!present) rec.arrivalMode = '';
            } else {
                this.db.attendance.push({
                    id: `att_${m.id}_${serviceDate}`, memberId: m.id, branchId: m.branchId,
                    date: serviceDate, present, arrivalMode: '',
                });
            }
            this.apiWrite(() => Church2API.setAttendance({ memberId: m.id, date: serviceDate, present }));
        });
        this.saveDB();
        this.toast(`${members.length} ${members.length === 1 ? 'person' : 'people'} marked ${present ? 'present' : 'absent'}.`);
        this.renderAttendance();
    },

    // Record how somebody travelled. Only meaningful for someone present, which
    // is why the control is disabled until they are checked in.
    setArrivalMode(memberId, mode) {
        const serviceDate = this.session.selectedServiceDate;
        if (!serviceDate) return;
        const rec = (this.db.attendance || []).find((a) => a.memberId === memberId && a.date === serviceDate);
        if (!rec || !rec.present) return;
        rec.arrivalMode = mode;
        this.saveDB();
        this.apiWrite(() => Church2API.setAttendance({
            memberId, date: serviceDate, present: true, arrivalMode: mode,
        }));
        this.renderArrivalSummary(
            this.db.members.filter((m) => {
                const b = this.session.currentBranch;
                return !b || b === 'global' || m.branchId === b;
            }),
            serviceDate
        );
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
            // A travel note on someone marked absent is stale data, not history.
            if (!rec.present) rec.arrivalMode = '';
        } else if (member) {
            this.db.attendance.push({ id: `att_${memberId}_${serviceDate}`, memberId, branchId: member.branchId, date: serviceDate, present: true, arrivalMode: '' });
        }
        this.saveDB();
        this.apiWrite(() => Church2API.setAttendance({ memberId, date: serviceDate, present: rec ? rec.present : true }));
        this.renderAttendance();
    },

    renderAttendanceChart(attendance, serviceDatesDesc) {
        const wrap = document.getElementById('attendance-trend-chart')?.parentElement;
        if (typeof Chart === 'undefined') {
            if (wrap && !wrap.querySelector('.chart-fallback')) {
                const n = document.createElement('div');
                n.className = 'chart-fallback';
                n.textContent = 'Attendance chart is unavailable offline.';
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

        const cta = this.chartTheme();
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
                    y: { beginAtZero: true, ticks: { color: cta.tick, precision: 0 }, grid: { color: cta.grid } },
                    x: { ticks: { color: cta.tick }, grid: { display: false } }
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
                <span><svg class="inline-ico warn-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l9 15.5H3z"/><path d="M12 10v4M12 17.2v.1"/></svg> At-risk (3+ absences)</span>
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
                    ${i.owner ? `<div class="followup-owner"><svg class="inline-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4"/><path d="M5.5 20c0-3.4 2.9-5.4 6.5-5.4s6.5 2 6.5 5.4"/></svg> ${esc(i.owner)}</div>` : ''}
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
                const item = {
                    id: `fu_${Date.now()}`,
                    name, owner: owner || 'Unassigned',
                    branchId: targetBranch,
                    stage: 'New Guest',
                    note: ''
                };
                this.db.followUps.unshift(item);
                this.saveDB();
                this.apiWrite(() => Church2API.createFollowup({ name, owner: item.owner, branchId: targetBranch }), (srv) => { if (srv && srv.id) item.id = srv.id; });
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
        this.apiWrite(() => Church2API.moveFollowup(item.id, item.stage));
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
                        <span class="group-count"><svg class="inline-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="8.2" cy="9" r="3"/><circle cx="16.6" cy="10" r="2.3"/><path d="M2.6 19c0-3 2.4-4.9 5.6-4.9 1.6 0 3 .5 4 1.3"/><path d="M14.6 14.7c2.6.2 4.8 1.9 4.8 4.6"/></svg> ${count}</span>
                    </div>
                    <div class="group-meta">
                        <span class="branch-pill badge-${esc(g.branchId)}">${esc(campus)}</span>
                        <span class="group-schedule"><svg class="inline-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path d="M3.5 9.5h17M8 3.4v3.2M16 3.4v3.2"/></svg> ${esc(g.schedule || 'TBD')}</span>
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
                const group = {
                    id: `g_${Date.now()}`,
                    name,
                    branchId: document.getElementById('group-branch').value,
                    schedule: document.getElementById('group-schedule').value.trim(),
                    description: document.getElementById('group-desc').value.trim(),
                    memberIds: []
                };
                this.db.groups.unshift(group);
                this.saveDB();
                this.apiWrite(() => Church2API.createGroup({ name, branchId: group.branchId, schedule: group.schedule, description: group.description }), (srv) => { if (srv && srv.id) group.id = srv.id; });
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
        this.apiWrite(() => Church2API.toggleGroupMember(group.id, 'm1'));
        this.renderMobileGroups();
    },

    // 8. Panel: Member Directory View Rendering
    renderMemberDirectory() {
        const query = document.getElementById('member-search-input').value.toLowerCase();
        const branchFilter = document.getElementById('member-branch-filter').value;
        const tbody = document.getElementById('member-directory-tbody');
        tbody.innerHTML = '';

        // Respect the active campus scope: a campus-locked admin can only ever see
        // their own members, regardless of the in-panel filter.
        const scope = this.session.currentBranch;
        const scoped = (scope && scope !== 'global') ? scope : null;

        const filteredMembers = this.db.members.filter(member => {
            if (scoped && member.branchId !== scoped) return false;
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
                    ${this.isAdmin() ? `<button class="action-btn-sm action-btn-danger"
                        onclick="ChurchApp.removeMember('${esc(m.id)}')"
                        aria-label="Remove ${esc(m.firstName)} ${esc(m.lastName)} from the roll">Remove</button>` : ''}
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
                            <p><strong>Marital Status:</strong> ${esc(member.maritalStatus || 'Not stated')}</p>
                            <ul class="family-linked-list">
                                ${familyList.length > 0 ? familyList.map(f => `<li>${esc(f.firstName)} ${esc(f.lastName)} (${esc(f.familyRole)})</li>`).join('') : '<li class="muted-italic">No other family members linked.</li>'}
                            </ul>
                        </div>
                    </div>

                    <div class="profile-narrative">
                        <div>
                            <h5>Before Joining</h5>
                            ${member.background
                                ? `<p>${esc(member.background)}</p>`
                                : '<p class="empty">Not recorded at registration.</p>'}
                        </div>
                        <div>
                            <h5>Expectations</h5>
                            ${member.expectations
                                ? `<p>${esc(member.expectations)}</p>`
                                : '<p class="empty">Not recorded at registration.</p>'}
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
                                        <td style="color: #10b981; font-weight: bold;">${money(parseFloat(d.amount))}</td>
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

    // Remove someone from the roll. Administrators only, confirmed first, and
    // their attendance history goes with them so no orphan records are left
    // pointing at a member who no longer exists.
    async removeMember(memberId) {
        if (!this.isAdmin()) {
            this.toast('Only an administrator can remove members.', 'error');
            return;
        }
        const member = this.db.members.find((m) => m.id === memberId);
        if (!member) return;
        const name = `${member.firstName} ${member.lastName}`;

        const confirmed = await this.confirmAction({
            title: `Remove ${name}?`,
            body: `${name} will be taken off the membership roll along with their `
                + `attendance history. Giving already recorded is kept for the financial `
                + `record. This cannot be undone.`,
            confirmLabel: 'Remove member',
        });
        if (!confirmed) return;

        this.db.members = this.db.members.filter((m) => m.id !== memberId);
        this.db.attendance = (this.db.attendance || []).filter((a) => a.memberId !== memberId);
        (this.db.groups || []).forEach((g) => {
            g.memberIds = (g.memberIds || []).filter((id) => id !== memberId);
        });
        this.saveDB();
        this.apiWrite(() => Church2API.removeMember(memberId));
        this.toast(`${name} removed from the roll.`);
        this.renderAll();
    },

    handleCreateMember() {
        // Enforced here as well as in the UI: hiding the form is presentation,
        // this is the rule.
        if (!this.isAdmin()) {
            this.toast('Only an administrator can add members.', 'error');
            return;
        }
        const firstName = document.getElementById('member-first-name').value.trim();
        const lastName = document.getElementById('member-last-name').value.trim();
        const email = document.getElementById('member-email').value.trim();
        const phone = document.getElementById('member-phone').value.trim();
        const branchId = document.getElementById('member-branch-select').value;
        const skillsText = document.getElementById('member-skills').value.trim();
        const maritalStatus = document.getElementById('member-marital-status').value;
        const background = document.getElementById('member-background').value.trim();
        const expectations = document.getElementById('member-expectations').value.trim();

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
            engagement_score: 50,
            // Captured at registration so the administrator has context on who
            // this person is, not just how to reach them.
            maritalStatus,
            background,
            expectations
        };

        this.db.members.push(newMember);
        this.saveDB();
        this.apiWrite(
            () => Church2API.createMember({ firstName, lastName, email, phone, volunteer_skills: skillsArray,
                branchId, maritalStatus, background, expectations }),
            (srv) => { if (srv && srv.id) newMember.id = srv.id; }
        );
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
                <td><span class="receipt-no" style="font-family: monospace; font-weight: bold; color: #93c5fd;">${esc(t.receiptNumber)}</span></td>
                <td><span class="branch-pill badge-${esc(t.branchId)}">${esc(t.branchName)}</span></td>
                <td>${esc(t.memberName || 'Anonymous')}</td>
                <td><span class="category-pill category-${esc((t.category || '').toLowerCase().replace(' ', ''))}">${esc(t.category)}</span></td>
                <td class="amount-cell" style="color: #10b981; font-weight: bold; text-align: right;">${money(parseFloat(t.amount))}</td>
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
        this.renderContributionSummary(branchId);
        this.renderGivingInsights(branchId);
    },

    // Contributions, standing on their own.
    //
    // Agreed 17 Aug 2026: money is not tied to projects, attendance or
    // individual activities. This panel therefore reads nothing but the
    // transaction ledger — no campaign, no register, no event — and answers the
    // two questions the administrator actually asked for: what has each person
    // given, and what is the total.
    renderContributionSummary(branchId) {
        const el = document.getElementById('contribution-summary');
        if (!el) return;
        const inScope = (bId) => (!branchId || branchId === 'global') ? true : bId === branchId;

        const gifts = (this.db.transactions || []).filter((t) => inScope(t.branchId));
        const total = gifts.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

        // Individual totals, largest first.
        const byGiver = new Map();
        gifts.forEach((t) => {
            const key = t.memberId || 'anonymous';
            const entry = byGiver.get(key) || { name: t.memberName || 'Anonymous', total: 0, count: 0 };
            entry.total += parseFloat(t.amount) || 0;
            entry.count += 1;
            byGiver.set(key, entry);
        });
        const givers = [...byGiver.values()].sort((a, b) => b.total - a.total);
        const shown = this.session.showAllGivers ? givers : givers.slice(0, 8);

        const rows = shown.map((g) => `<tr>
            <td>${esc(g.name)}</td>
            <td class="num">${g.count}</td>
            <td class="num amount-cell">${money(g.total)}</td>
        </tr>`).join('') || '<tr><td colspan="3" class="muted-italic" style="text-align:center;">No contributions recorded in this scope.</td></tr>';

        const moreBtn = givers.length > 8
            ? `<button type="button" class="btn btn-secondary btn-sm" id="toggle-all-givers">${
                  this.session.showAllGivers ? 'Show top 8 only' : `Show all ${givers.length} givers`
              }</button>`
            : '';

        el.innerHTML = `
            <div class="card-glass contribution-totals">
                <span class="contribution-eyebrow">Total Contributions</span>
                <div class="contribution-total">${money(total)}</div>
                <p class="contribution-meta">${gifts.length} contribution${gifts.length === 1 ? '' : 's'}
                   from ${givers.length} ${givers.length === 1 ? 'giver' : 'givers'}</p>
            </div>
            <div class="card-glass contribution-people">
                <div class="contribution-head">
                    <h3>Individual Contributions</h3>
                    ${moreBtn}
                </div>
                <div class="table-responsive">
                    <table class="financial-table">
                        <thead><tr><th>Member</th><th class="num">Gifts</th><th class="num">Total given</th></tr></thead>
                        <tbody>${rows}</tbody>
                    </table>
                </div>
            </div>`;

        const toggle = document.getElementById('toggle-all-givers');
        if (toggle) toggle.onclick = () => {
            this.session.showAllGivers = !this.session.showAllGivers;
            this.renderContributionSummary(branchId);
        };
    },

    renderGivingInsights(branchId) {
        const el = document.getElementById('giving-insights');
        if (!el) return;
        const inScope = (bId) => (!branchId || branchId === 'global') ? true : bId === branchId;

        // Standing orders are money, not a project, so they belong here. Pledge
        // campaigns used to sit alongside them, deriving "raised" by summing
        // transactions in a matching fund — exactly the money-to-project link
        // the 17 Aug meeting asked us to break. The campaign records remain in
        // the database untouched, pending Thursday's decision on where (and
        // whether) project fundraising should live.
        const recurring = (this.db.recurringGifts || []).filter((r) => r.active && inScope(r.branchId));
        const recurringTotal = recurring.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0);
        el.innerHTML = `<div class="card-glass campaign-card">
            <span class="campaign-eyebrow"><svg class="inline-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9a8 8 0 0 1 13.5-3.5L20 8"/><path d="M20 4v4h-4"/><path d="M20 15a8 8 0 0 1-13.5 3.5L4 16"/><path d="M4 20v-4h4"/></svg> Recurring Giving</span>
            <h4>${recurring.length} active schedule${recurring.length === 1 ? '' : 's'}</h4>
            <div class="campaign-figures"><strong>${window.money(recurringTotal)}</strong> committed per cycle</div>
            ${recurring.length ? `<ul class="recurring-list">${recurring.slice(0, 3).map((r) =>
                `<li>${esc(r.memberName)} — ${window.money(parseFloat(r.amount))} ${esc(r.frequency)} (${esc(r.category)})</li>`).join('')}</ul>` : ''}
        </div>`;
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
        const money = (n) => window.money(n);

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
                        <h2>${esc(MMC_BRAND.name.toUpperCase())}</h2>
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
                    <p style="font-size:0.7rem; color:var(--text-secondary); margin-top:14px;">${esc(MMC_BRAND.name)} is a registered place of worship. Retain this statement for your records.</p>
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

        if (isNaN(amount) || amount <= 0) { this.toast('Enter a valid contribution amount greater than Ksh 0.', 'error'); return; }

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
        this.apiWrite(
            () => Church2API.recordTransaction({ memberId, amount, category, paymentMethod: method, date, memberName, branchId }),
            (srv) => { if (srv && srv.id) { newTx.id = srv.id; if (srv.receiptNumber) newTx.receiptNumber = srv.receiptNumber; } }
        );
        document.getElementById('record-tx-form').reset();
        
        // Reset defaults
        document.getElementById('tx-date-input').value = new Date().toISOString().split('T')[0];

        this.toast(`Logged ${money(amount)} from ${memberName}. Receipt ${newTx.receiptNumber}.`);
        
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
                        <h2>${esc(MMC_BRAND.name.toUpperCase())}</h2>
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
                        <strong style="color: #10b981; font-size: 1.4rem;">${money(parseFloat(tx.amount))}</strong>
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
                        <p style="font-size:0.7rem; color:#9ca3af; margin-top:8px;">Signed electronically by the ${esc(MMC_BRAND.shortName)} HQ admin system</p>
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

        // Scope events to the active campus so a campus admin only rosters their
        // own events (and can't assign another campus's members).
        const scope = this.session.currentBranch;
        const events = this.db.events.filter(e => !scope || scope === 'global' || e.branchId === scope);

        // Keep the selected event valid within the current scope.
        let activeEventId = this.session.selectedEventId;
        if (!events.some(e => e.id === activeEventId)) {
            activeEventId = events.length ? events[0].id : null;
            this.session.selectedEventId = activeEventId;
        }

        // Sync dropdown list
        selectEvent.innerHTML = '';
        events.forEach(e => {
            const opt = document.createElement('option');
            opt.value = e.id;
            opt.text = `${e.title} (${e.date})`;
            selectEvent.appendChild(opt);
        });
        selectEvent.value = activeEventId;

        const requiredRolesEmpty = document.getElementById('rota-required-roles');
        if (!activeEventId) {
            if (requiredRolesEmpty) requiredRolesEmpty.innerHTML = '<p class="muted-italic">No events scheduled for this campus yet.</p>';
            selectEvent.onchange = null;
            return;
        }

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
                        <strong style="color: #93c5fd; font-size: 0.95rem;">${esc(role)}</strong>
                        <p class="rota-status ${volunteerObj ? 'is-assigned' : 'is-unassigned'}">Status: ${volunteerObj ? '✅ Roster Assigned' : '⚠️ Unassigned'}</p>
                    </div>
                    <div>
                        ${volunteerObj ? `
                            <div class="volunteer-pill">
                                <span>${esc(volunteerObj.firstName)} ${esc(volunteerObj.lastName)}</span>
                                <button aria-label="Remove ${esc(volunteerObj.firstName)} ${esc(volunteerObj.lastName)} from ${esc(role)}" onclick="ChurchApp.removeVolunteerFromRole('${esc(event.id)}', '${esc(volunteerObj.id)}')" class="remove-vol-btn">×</button>
                            </div>
                        ` : `
                            <button class="action-btn-sm" onclick="ChurchApp.showMatchAI('${esc(event.id)}', '${esc(role).replace(/'/g, "\\'")}')"><svg class="inline-ico" viewBox="0 0 24 24" aria-hidden="true" style="fill:currentColor;stroke:none;"><path d="M12 4l1.4 4 4 1.4-4 1.4L12 15l-1.4-4.2L6.6 9.4l4-1.4z"/></svg> AI Match</button>
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
        // Only suggest volunteers from the event's own campus.
        const pool = event ? this.db.members.filter(m => m.branchId === event.branchId) : this.db.members;
        const matches = window.AIEngine.matchVolunteersForEvent([role], pool);
        
        const modal = document.getElementById('ai-matcher-modal');
        modal.innerHTML = `
            <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="matcher-modal-title">
                <div class="modal-header">
                    <h3 id="matcher-modal-title">AI Volunteer Matching System</h3>
                    <button class="modal-close" aria-label="Close volunteer matcher" onclick="ChurchApp.closeModal('ai-matcher-modal')">×</button>
                </div>
                <div class="modal-body">
                    <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:12px;">Searching database for members with skill: <strong style="color:#60a5fa;">${esc(role)}</strong> and solid engagement scoring index.</p>
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

        // Prayer requests are sensitive pastoral content — scope them to the
        // active campus so a campus admin never sees another campus's requests.
        const scope = this.session.currentBranch;
        const scopeName = (scope && scope !== 'global')
            ? (this.db.branches.find(b => b.id === scope) || {}).name : null;
        const prayers = this.db.prayerRequests.filter(pr => !scopeName || pr.branchName === scopeName);

        prayers.forEach(pr => {
            const branchId = (this.db.branches.find(b => b.name === pr.branchName) || {}).id || 'b1';
            const card = document.createElement('div');
            card.className = 'prayer-request-card';
            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:8px;">
                    <div>
                        <strong class="prayer-member">${esc(pr.memberName)}</strong>
                        <span class="branch-pill badge-${esc(branchId)}" style="font-size: 0.7rem; margin-left: 8px;">${esc(pr.branchName)}</span>
                    </div>
                    <span class="category-pill prayer-category"><svg class="inline-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 13.5l-7 7a2 2 0 0 1-2.8 0l-6.2-6.2a2 2 0 0 1-.5-1.9l1.4-5.6a2 2 0 0 1 1.5-1.5l5.6-1.4a2 2 0 0 1 1.9.5l6.2 6.2a2 2 0 0 1-.1 2.9z"/><circle cx="9" cy="9" r="1.3"/></svg> ${esc(pr.category)}</span>
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

        if (prayers.length === 0) {
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
                const announcement = {
                    id: `an_${Date.now()}`,
                    title, body, audience, channels, recipients,
                    sentAt: new Date().toISOString()
                };
                this.db.announcements.unshift(announcement);
                this.saveDB();
                this.apiWrite(() => Church2API.sendAnnouncement({ title, body, audience, channels }), (srv) => { if (srv && srv.id) announcement.id = srv.id; });
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
        this.apiWrite(() => Church2API.dismissPrayer(prId));
        this.toast('Prayer request approved and routed to the prayer team.');
        this.renderCommunications();
    },

    deletePrayer(prId) {
        this.db.prayerRequests = this.db.prayerRequests.filter(p => p.id !== prId);
        this.saveDB();
        this.apiWrite(() => Church2API.dismissPrayer(prId));
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
                <div class="ai-header-badge"><svg class="badge-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z"/><path d="M18.5 15.5l.7 1.9 1.9.7-1.9.7-.7 1.9-.7-1.9-1.9-.7 1.9-.7z"/></svg> AI REPURPOSED SERMON KIT</div>
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
                // 'flex', not 'block': .mobile-app-body is a flex column and a
                // block override collapses children that rely on flex sizing
                // (the chat transcript would shrink to its content).
                el.style.display = (sv === `mobile-${view}`) ? 'flex' : 'none';
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
                    <span class="mobile-event-time"><svg class="inline-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg> ${esc(e.time)}</span>
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
            <span class="votd-eyebrow"><svg class="badge-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l1.7 4.8 4.8 1.7-4.8 1.7L12 16.5l-1.7-4.8L5.5 10l4.8-1.7z"/></svg> Verse of the Day</span>
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
                <strong style="font-size:0.8rem; color:#93c5fd; display:block;">${esc(v.ref)} (${esc(this.session.bibleVersion)})</strong>
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
    /**
     * Transaction charge for the "cover the charge" option, in shillings.
     * M-Pesa paybill charges are borne by the payer under Safaricom's tariff,
     * so only card carries a percentage fee the church would otherwise absorb.
     */
    givingFee(amount, method) {
        const m = method || (window.MMC_BRAND && MMC_BRAND.giving.defaultMethod) || 'M-Pesa';
        if (m !== 'Card') return 0;
        const f = (window.MMC_BRAND && MMC_BRAND.giving.fees) || { cardPercent: 0.029, cardFlat: 30 };
        return Math.round(amount * f.cardPercent + f.cardFlat);
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
        const methodSel = document.getElementById('mobile-giving-method');
        const feesRow = document.getElementById('cover-fees-row');
        const mpesaHint = document.getElementById('mpesa-hint');

        // Surface the paybill from the brand config rather than hardcoding it.
        // Until the church confirms its live short code, show NO number at all:
        // a plausible-looking but wrong paybill is how a member's tithe ends up
        // in a stranger's account. `shortCodeConfirmed` gates this.
        const brand = window.MMC_BRAND;
        const hintText = document.getElementById('mpesa-hint-text');
        if (brand && hintText) {
            const mpesa = brand.giving.mpesa;
            if (mpesa.shortCodeConfirmed) {
                hintText.innerHTML = `You'll get an STK prompt on your phone to confirm. `
                    + `Paybill <strong>${esc(mpesa.paybill)}</strong>, `
                    + `account <strong>${esc(mpesa.accountName)}</strong>.`;
                mpesaHint.classList.remove('is-unconfirmed');
            } else {
                hintText.textContent =
                    'M-Pesa giving is not live yet — the church\u2019s paybill is still being '
                    + 'confirmed. Please give in person or by bank transfer for now.';
                mpesaHint.classList.add('is-unconfirmed');
            }
        }

        const updateFee = () => {
            const amt = parseFloat(amountInput.value) || 0;
            const method = methodSel ? methodSel.value : 'M-Pesa';
            const fee = this.givingFee(amt, method);
            if (feeLabel) feeLabel.textContent = money(fee);
            // Only card carries a charge the church would absorb, so the
            // cover-the-charge option is meaningless for the other rails.
            if (feesRow) feesRow.style.display = fee > 0 ? '' : 'none';
            if (fee === 0 && coverFees) coverFees.checked = false;
            if (mpesaHint) mpesaHint.style.display = method === 'M-Pesa' ? '' : 'none';
        };
        if (methodSel) methodSel.onchange = updateFee;

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

        if (isNaN(amount) || amount <= 0) { this.toast('Enter a valid amount greater than Ksh 0.', 'error'); return; }

        let feeAdded = 0;
        if (coverFees) {
            feeAdded = this.givingFee(amount, method);
            amount = Math.round(amount + feeAdded);
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
        this.apiWrite(
            () => Church2API.recordTransaction({ memberId: loggedInMemberId, amount, category, paymentMethod: method, date: newTx.date, branchId }),
            (srv) => { if (srv && srv.id) { newTx.id = srv.id; if (srv.receiptNumber) newTx.receiptNumber = srv.receiptNumber; } }
        );

        document.getElementById('mobile-giving-form').reset();

        // Generate simulated mobile success dialog
        const modal = document.getElementById('mobile-giving-success-overlay');
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div style="background: #1c1c2d; padding:20px; border-radius:12px; border:1px solid rgba(255,255,255,0.1); width: 85%; max-width:280px; text-align:center;">
                <span style="font-size:3rem;">🎉</span>
                <h4 style="color:#fff; margin-top:10px;">Giving Successful!</h4>
                <p style="font-size:0.75rem; color:#9ca3af; margin-top:5px;">Thank you for your donation of <strong style="color:#fff;">${money(amount)}</strong> toward ${esc(category)}.${feeAdded ? ` <span style="color:#9ca3af;">(includes ${money(feeAdded)} transaction charge)</span>` : ''}</p>
                <p style="font-size:0.7rem; color:#93c5fd; font-weight:bold; margin-top:8px;">Receipt Generated: ${esc(newTx.receiptNumber)}</p>
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
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px;">
                            <div style="min-width:0;">
                                <strong style="font-size:0.8rem; color:var(--text-primary); display:block;">${esc(role)}</strong>
                                <span style="font-size:0.7rem; color:var(--text-secondary); display:block;">Event: ${esc(e.title)}</span>
                                <span style="font-size:0.7rem; color:var(--accent-gold); display:block;">Date: ${esc(e.date)}</span>
                            </div>
                            <button class="mobile-apply-btn" style="flex:0 0 auto;" onclick="ChurchApp.handleMobileServeSignup('${esc(e.id)}', '${esc(role).replace(/'/g, "\\'")}')">Serve</button>
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
        // Check for a rendered bubble, not for empty innerHTML — the markup ships
        // with an HTML comment placeholder, which is never the empty string.
        if (!body.querySelector('.chat-bubble')) {
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

        // Trap Tab focus within the dialog so keyboard users can't tab into the
        // page behind the overlay.
        this._trapHandler = (e) => {
            if (e.key !== 'Tab') return;
            const focusables = modal.querySelectorAll('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])');
            if (!focusables.length) return;
            const first = focusables[0];
            const last = focusables[focusables.length - 1];
            if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
            else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
        };
        modal.addEventListener('keydown', this._trapHandler);
    },

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            if (this._trapHandler) { modal.removeEventListener('keydown', this._trapHandler); this._trapHandler = null; }
        }
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
            // Derive the campus from the member record rather than hardcoding
            // one, so the prayer routes to the right campus after a rebrand.
            branchName: (this.db.members.find(m => m.id === 'm1') || {}).branchName
                || (this.db.branches[0] && this.db.branches[0].name) || 'Main Campus',
            text: text,
            category: categoryResult.category,
            route: categoryResult.route,
            status: 'Assigned',
            timestamp: new Date().toISOString()
        };

        this.db.prayerRequests.push(newPrayer);
        this.saveDB();
        this.apiWrite(
            () => Church2API.submitPrayer({ memberId: 'm1', memberName: newPrayer.memberName, branchName: newPrayer.branchName, text, category: newPrayer.category, route: newPrayer.route }),
            (srv) => { if (srv && srv.id) newPrayer.id = srv.id; }
        );
        textarea.value = '';

        this.toast(`Prayer received — categorized as “${categoryResult.category}” and routed to ${categoryResult.route}.`, 'info');

        this.renderAll();
    }
};

// Start application.
//
// DOMContentLoaded, not window.onload: `load` waits for every subresource, so a
// slow webfont request held the whole app hostage — the console booted ~13s
// late even after the stylesheet was moved off the render path. Chart.js is
// loaded with `defer`, which guarantees it has executed by DOMContentLoaded, so
// nothing this needs is still outstanding at this point.
const bootChurchApp = () => {
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

    // The API client calls this when the server rejects our token — most often
    // because the account was signed in somewhere else.
    window.onChurch2SessionLost = (message) => ChurchApp.handleSessionLost(message);

    try {
        ChurchApp.init();
    } catch (err) {
        console.error('Church 2.0 failed to initialize:', err);
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootChurchApp, { once: true });
} else {
    // Script parsed after the document was already ready — boot immediately.
    bootChurchApp();
}
