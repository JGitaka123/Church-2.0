// Church 2.0 Main Application Controller
// Handles global state, CRUD operations, rendering, and Chart.js visualization

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

    // 4. Initialize Data & Render
    init() {
        this.loadDB();
        this.loadTheme();
        this.setupEventHandlers();
        this.renderAll();
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
                    return;
                } catch (e) {
                    console.error("Error parsing saved DB:", e);
                }
            }
        }
        // Fallback: generate and save
        this.generateInitialTransactions();
        this.saveDB();
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
    },

    // 6. Master Render Coordinator
    renderAll() {
        const role = this.session.currentRole;
        const branchId = this.session.currentBranch;
        const activeTab = this.session.activeTab;

        // Sync header displays
        const branchObj = this.db.branches.find(b => b.id === branchId);
        document.getElementById('active-branch-indicator').innerText = branchObj.name;
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
        const ministryLink = document.querySelector('.nav-link[data-tab="admin_ministry"]');
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
            ministryLink.style.display = 'none';
            communicationLink.style.display = 'none';
            dashboardLink.style.display = 'none';
            mobilePreviewLink.style.display = 'flex';
        } else {
            directoryLink.style.display = 'flex';
            financialsLink.style.display = 'flex';
            ministryLink.style.display = 'flex';
            communicationLink.style.display = 'flex';
            dashboardLink.style.display = 'flex';
            mobilePreviewLink.style.display = 'flex';

            // Hide/Show branch financial options for Department/Ministry Leaders
            if (role === 'ministry_leader') {
                financialsLink.style.display = 'none';
            }
        }

        // Render main view panels
        const panels = ['admin_dashboard', 'admin_directory', 'admin_financials', 'admin_ministry', 'admin_communications', 'mobile_preview'];
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
        } else if (activeTab === 'admin_ministry') {
            this.renderMinistry();
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

        // Filter transactions for calculations
        let branchTx = this.db.transactions;
        let branchMembers = this.db.members;
        
        if (branchId !== 'all' && role !== 'hq_admin') {
            branchTx = this.db.transactions.filter(t => t.branchId === branchId);
            branchMembers = this.db.members.filter(m => m.branchId === branchId);
        } else if (branchId !== 'all' && branchId !== 'global') {
            branchTx = this.db.transactions.filter(t => t.branchId === branchId);
            branchMembers = this.db.members.filter(m => m.branchId === branchId);
        }

        // Compute AI Snapshot Metrics
        const snapshot = window.AIEngine.generateWeeklySnapshot(
            this.db.branches,
            branchMembers,
            branchTx,
            this.db.events
        );

        // Update dashboard counters
        document.getElementById('dash-giving-total').innerText = `$${snapshot.thisWeekGiving.toLocaleString(undefined, {minimumFractionDigits: 2})}`;
        document.getElementById('dash-giving-change').innerText = snapshot.givingDiffPercent;
        document.getElementById('dash-giving-change').className = snapshot.givingDiffPercent.startsWith('+') ? 'changeup' : 'changedown';

        document.getElementById('dash-attendance-total').innerText = snapshot.avgAttendance;
        document.getElementById('dash-attendance-change').innerText = snapshot.attendanceDiffPercent;
        document.getElementById('dash-attendance-change').className = snapshot.attendanceDiffPercent.startsWith('+') ? 'changeup' : 'changedown';

        document.getElementById('dash-members-total').innerText = branchMembers.length;

        // Render AI Ministry Health Executive Briefing card
        const aiSnapshotCard = document.getElementById('ai-snapshot-content');
        if (aiSnapshotCard) {
            aiSnapshotCard.innerHTML = `
                <div class="ai-header-badge">
                    <span class="sparkle-icon">✨</span> AI-GENERATED MONDAY BRIEFING
                </div>
                <p style="margin-top: 10px; font-weight: 500; font-size: 1.1rem; color: #f3f4f6;">Weekly Ministry Health Report</p>
                <div class="weekly-bulletin-ai">
                    <div style="font-size: 0.95rem; color: #d1d5db; line-height: 1.6; white-space: pre-wrap;">${snapshot.bulletSummary}</div>
                </div>
                <p style="margin-top: 15px; color: #9ca3af; font-size: 0.85rem; line-height: 1.5; font-style: italic;">
                    <strong>Executive Context:</strong> ${snapshot.executiveSnapshot}
                </p>
                <div class="at-risk-container">
                    <span style="font-size: 0.85rem; font-weight: bold; color: #f59e0b; display: block; margin-bottom: 8px;">⚠️ CRITICAL CARE ALERTS (At-Risk Members)</span>
                    <ul class="at-risk-list">
                        ${snapshot.atRisk.map(m => `<li>${m}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Render charts inside dashboard
        this.renderDashboardCharts(branchTx);
    },

    renderDashboardCharts(transactions) {
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
                        <div class="member-avatar">${m.firstName[0]}${m.lastName[0]}</div>
                        <div>
                            <span class="member-name">${m.firstName} ${m.lastName}</span>
                            <span style="font-size: 0.75rem; color: #9ca3af; display: block;">ID: ${m.id}</span>
                        </div>
                    </div>
                </td>
                <td><span class="branch-pill badge-${m.branchId}">${m.branchName}</span></td>
                <td>
                    <div style="font-size: 0.85rem; color: #e5e7eb;">${m.email}</div>
                    <div style="font-size: 0.75rem; color: #9ca3af;">${m.phone}</div>
                </td>
                <td>
                    <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                        ${m.volunteer_skills.map(s => `<span class="skill-tag">${s}</span>`).join('')}
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
            <div class="modal-card">
                <div class="modal-header">
                    <h3>Member Profile File: ${member.firstName} ${member.lastName}</h3>
                    <button class="modal-close" onclick="ChurchApp.closeModal('member-detail-modal')">×</button>
                </div>
                <div class="modal-body scroll-y">
                    <div class="member-detail-grid">
                        <div>
                            <h4>Contact Information</h4>
                            <p><strong>Email:</strong> ${member.email}</p>
                            <p><strong>Phone:</strong> ${member.phone}</p>
                            <p><strong>Primary Branch:</strong> ${member.branchName}</p>
                            <p><strong>Engagement Rating:</strong> ${member.engagement_score}%</p>
                        </div>
                        <div>
                            <h4>Family Connections</h4>
                            <p><strong>Family Unit ID:</strong> ${member.familyId || 'None Linked'}</p>
                            <p><strong>Family Role:</strong> ${member.familyRole || 'N/A'}</p>
                            <ul class="family-linked-list">
                                ${familyList.length > 0 ? familyList.map(f => `<li>${f.firstName} ${f.lastName} (${f.familyRole})</li>`).join('') : '<li style="color:#9ca3af; font-style:italic;">No other family members linked.</li>'}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="milestones-section">
                        <h4>Spiritual Milestones</h4>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px;">
                            ${member.spiritualMilestones.length > 0 ? member.spiritualMilestones.map(m => `<span class="milestone-pill">✨ ${m}</span>`).join('') : '<span style="color:#9ca3af; font-style:italic;">No spiritual milestones logged.</span>'}
                        </div>
                        <div style="margin-top: 12px; display: flex; gap: 8px;">
                            <input type="text" id="new-milestone-input" placeholder="e.g. Confirmed: 2026-07-11" class="form-control" style="width: auto; flex-grow: 1;">
                            <button class="btn btn-primary-gradient" onclick="ChurchApp.addSpiritualMilestone()">Add Milestone</button>
                        </div>
                    </div>

                    <div style="margin-top: 20px;">
                        <h4>Recent Giving Ledger</h4>
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
                                        <td><a href="#" onclick="ChurchApp.viewReceipt('${d.id}'); return false;">${d.receiptNumber}</a></td>
                                        <td>${d.date}</td>
                                        <td>${d.category}</td>
                                        <td style="color: #10b981; font-weight: bold;">$${d.amount.toFixed(2)}</td>
                                        <td>${d.paymentMethod}</td>
                                    </tr>
                                `).join('')}
                                ${donations.length === 0 ? '<tr><td colspan="5" style="text-align:center; color:#9ca3af;">No transaction history found.</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
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
        alert(`Success: Member ${firstName} ${lastName} has been enrolled in ${branchObj.name}.`);
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
                <td><span style="font-family: monospace; font-weight: bold; color: #a5b4fc;">${t.receiptNumber}</span></td>
                <td><span class="branch-pill badge-${t.branchId}">${t.branchName}</span></td>
                <td>${t.memberName || 'Anonymous'}</td>
                <td><span class="category-pill category-${t.category.toLowerCase().replace(' ', '')}">${t.category}</span></td>
                <td style="color: #10b981; font-weight: bold; text-align: right;">$${parseFloat(t.amount).toFixed(2)}</td>
                <td>${t.date}</td>
                <td>${t.paymentMethod}</td>
                <td>
                    <button class="action-btn-sm" onclick="ChurchApp.viewReceipt('${t.id}')">Receipt</button>
                </td>
            `;
            tbody.appendChild(tr);
        });

        if (filteredTx.length === 0) {
            tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: #9ca3af; padding: 30px;">No transactions logged.</td></tr>`;
        }

        // Bind quick export buttons
        document.getElementById('export-csv-btn').onclick = () => this.exportFinancialCSV(filteredTx);
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
        let branchId = this.session.currentBranch === 'all' ? 'b1' : this.session.currentBranch;
        
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

        alert(`Success: Logged $${amount} donation from ${memberName}. Receipt generated: ${newTx.receiptNumber}`);
        
        this.renderAll();
    },

    viewReceipt(txId) {
        const tx = this.db.transactions.find(t => t.id === txId);
        if (!tx) return;

        const modal = document.getElementById('receipt-modal');
        modal.innerHTML = `
            <div class="modal-card receipt-card">
                <div class="modal-header">
                    <h3>STEVARDSHIP RECEIPT</h3>
                    <button class="modal-close" onclick="ChurchApp.closeModal('receipt-modal')">×</button>
                </div>
                <div class="modal-body receipt-print-area">
                    <div class="receipt-header">
                        <h2>CHURCH 2.0 ECOSYSTEM</h2>
                        <p>${tx.branchName}</p>
                        <p style="font-size: 0.75rem; color:#9ca3af;">Branch Code: ${tx.branchId.toUpperCase()}</p>
                    </div>
                    <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 15px 0;">
                    <div class="receipt-row">
                        <span>Receipt Number:</span>
                        <strong>${tx.receiptNumber}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Date Filed:</span>
                        <strong>${tx.date}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Donation Contributor:</span>
                        <strong>${tx.memberName || 'Anonymous Partner'}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Giving Allocation:</span>
                        <strong class="category-pill">${tx.category}</strong>
                    </div>
                    <div class="receipt-row">
                        <span>Payment Channel:</span>
                        <strong>${tx.paymentMethod}</strong>
                    </div>
                    <hr style="border: 0; border-top: 1px dashed rgba(255,255,255,0.15); margin: 15px 0;">
                    <div class="receipt-row total-row">
                        <span style="font-size: 1.1rem;">TOTAL AMOUNT RECEIVED:</span>
                        <strong style="color: #10b981; font-size: 1.4rem;">$${tx.amount.toFixed(2)}</strong>
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
        modal.style.display = 'flex';
    },

    exportFinancialCSV(transactions) {
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Receipt Number,Branch,Member Name,Category,Amount,Date,Payment Method\n";
        
        transactions.forEach(t => {
            const row = [
                t.receiptNumber,
                t.branchName,
                t.memberName || 'Anonymous',
                t.category,
                t.amount,
                t.date,
                t.paymentMethod
            ].map(val => `"${val}"`).join(",");
            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `church2_financial_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link); // Required for FF
        link.click();
        document.body.removeChild(link);
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
                        <strong style="color: #a5b4fc; font-size: 0.95rem;">${role}</strong>
                        <p style="font-size: 0.75rem; color: #9ca3af;">Status: ${volunteerObj ? '✅ Roster Assigned' : '⚠️ UNASSIGNED'}</p>
                    </div>
                    <div>
                        ${volunteerObj ? `
                            <div class="volunteer-pill">
                                <span>${volunteerObj.firstName} ${volunteerObj.lastName}</span>
                                <button onclick="ChurchApp.removeVolunteerFromRole('${event.id}', '${volunteerObj.id}')" class="remove-vol-btn">×</button>
                            </div>
                        ` : `
                            <button class="action-btn-sm" onclick="ChurchApp.showMatchAI('${event.id}', '${role}')">✨ AI Match</button>
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
            <div class="modal-card">
                <div class="modal-header">
                    <h3>AI Volunteer Matching System</h3>
                    <button class="modal-close" onclick="ChurchApp.closeModal('ai-matcher-modal')">×</button>
                </div>
                <div class="modal-body">
                    <p style="font-size:0.85rem; color:#9ca3af; margin-bottom:12px;">Searching database for members with skill: <strong style="color:#6366f1;">${role}</strong> and solid engagement scoring index.</p>
                    <div class="matches-list">
                        ${matches.map(m => `
                            <div class="match-item">
                                <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                                    <div>
                                        <strong>${m.member.firstName} ${m.member.lastName}</strong>
                                        <p style="font-size:0.75rem; color:#9ca3af;">Branch: ${m.member.branchName} | Engagement: ${m.member.engagement_score}%</p>
                                    </div>
                                    <div style="text-align:right;">
                                        <span class="match-percentage">${m.score}% Match</span>
                                        <button class="btn btn-primary-gradient btn-sm" style="margin-top:6px;" onclick="ChurchApp.assignVolunteerRole('${event.id}', '${m.member.id}')">Assign Role</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                        ${matches.length === 0 ? '<p style="color:#9ca3af; font-style:italic; text-align:center;">No matching volunteers found in DB.</p>' : ''}
                    </div>
                </div>
            </div>
        `;
        modal.style.display = 'flex';
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
                <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                    <div>
                        <strong style="color: #f3f4f6; font-size: 0.95rem;">${pr.memberName}</strong>
                        <span class="branch-pill badge-b1" style="font-size: 0.7rem; margin-left: 8px;">${pr.branchName}</span>
                    </div>
                    <span class="category-pill" style="background: rgba(99,102,241,0.25); color: #a5b4fc; font-size:0.75rem;">🏷️ ${pr.category}</span>
                </div>
                <p class="prayer-text">"${pr.text}"</p>
                <div style="margin-top: 10px; display:flex; justify-content:space-between; align-items:center; font-size: 0.75rem; color: #9ca3af;">
                    <span>Routed to: <strong>${pr.route}</strong></span>
                    <div>
                        <button class="action-btn-sm" style="background:#10b981; color:#fff;" onclick="ChurchApp.approvePrayer('${pr.id}')">Approve</button>
                        <button class="action-btn-sm" style="background:#ef4444; color:#fff;" onclick="ChurchApp.deletePrayer('${pr.id}')">Dismiss</button>
                    </div>
                </div>
            `;
            listContainer.appendChild(card);
        });

        if (this.db.prayerRequests.length === 0) {
            listContainer.innerHTML = `<div style="text-align:center; color:#9ca3af; padding:20px;">No pending prayer requests.</div>`;
        }
    },

    approvePrayer(prId) {
        this.db.prayerRequests = this.db.prayerRequests.filter(p => p.id !== prId);
        this.saveDB();
        alert("Prayer request approved and routed to departmental prayer lists.");
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
            alert("Please paste some sermon notes or transcript text first.");
            return;
        }

        const result = window.AIEngine.repurposeSermon(title, text);
        const resultsContainer = document.getElementById('ai-repurpose-results');
        
        resultsContainer.innerHTML = `
            <div class="repurposed-card animate-fade-in">
                <div class="ai-header-badge">✨ AI REPURPOSED SERMON KIT</div>
                <h4 style="margin: 10px 0 6px 0; color:#fff;">${result.title}</h4>
                <hr style="border: 0; border-top:1px solid rgba(255,255,255,0.08); margin: 10px 0;">
                
                <h5 style="color:#a5b4fc; margin-bottom:5px;">3-Day Devotional Study Guide</h5>
                <div style="font-size:0.85rem; color:#d1d5db; line-height:1.5; background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; margin-bottom:12px; white-space:pre-wrap;">
                    ${result.devotional.day1}
                    \n\n
                    ${result.devotional.day2}
                    \n\n
                    ${result.devotional.day3}
                </div>

                <h5 style="color:#a5b4fc; margin-bottom:5px;">Social Media Highlights</h5>
                <ul style="font-size:0.85rem; color:#d1d5db; margin-left:15px; margin-bottom:12px;">
                    ${result.socialQuotes.map(q => `<li style="margin-bottom:5px;">${q}</li>`).join('')}
                </ul>

                <h5 style="color:#a5b4fc; margin-bottom:5px;">Small Group Study Questions</h5>
                <ol style="font-size:0.85rem; color:#d1d5db; margin-left:15px;">
                    ${result.discussionQuestions.map(q => `<li style="margin-bottom:5px;">${q}</li>`).join('')}
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
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <strong>${e.title}</strong>
                    <span style="font-size:0.7rem; color:#6366f1;">${e.date}</span>
                </div>
                <p style="font-size:0.75rem; color:#9ca3af; margin: 4px 0 8px 0;">${e.description}</p>
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-size:0.7rem; color:#a5b4fc;">⏰ ${e.time}</span>
                    <button class="mobile-rsvp-btn" onclick="ChurchApp.handleMobileRSVP('${e.id}')">RSVP</button>
                </div>
            `;
            eventsContainer.appendChild(div);
        });
    },

    handleMobileRSVP(eventId) {
        alert("You are registered! Added to 'My Events' and synchronized with device calendar.");
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
                    <strong style="font-size:0.85rem; color:#f3f4f6; display:block;">${s.title}</strong>
                    <span style="font-size:0.7rem; color:#9ca3af; display:block;">By ${s.preacher} | ${s.duration}</span>
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
                <video src="${sermon.mediaUrl}" controls autoplay style="width:100%; border-radius:6px; max-height:120px;"></video>
                <div style="margin-top:8px;">
                    <strong style="font-size:0.85rem; color:#fff; display:block;">Playing: ${sermon.title}</strong>
                    <span style="font-size:0.7rem; color:#9ca3af;">Campus: ${sermon.branchName}</span>
                </div>
            </div>
        `;
    },

    renderMobileBible() {
        const verseContainer = document.getElementById('mobile-bible-verses');
        const searchInput = document.getElementById('mobile-bible-search').value.toLowerCase();
        
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
        
        const filtered = bibleData.filter(v => 
            v.ref.toLowerCase().includes(searchInput) || 
            v.text.toLowerCase().includes(searchInput)
        );

        filtered.forEach(v => {
            const p = document.createElement('div');
            p.className = 'mobile-bible-verse-item';
            p.innerHTML = `
                <strong style="font-size:0.8rem; color:#a5b4fc; display:block;">${v.ref} (${this.session.bibleVersion})</strong>
                <p style="font-size:0.8rem; color:#d1d5db; margin-top:2px;">"${v.text}"</p>
            `;
            verseContainer.appendChild(p);
        });

        if (filtered.length === 0) {
            verseContainer.innerHTML = `<div style="text-align:center; color:#9ca3af; padding:15px; font-size:0.75rem;">No verses found matching query.</div>`;
        }

        // Add bind events
        document.getElementById('mobile-bible-search').oninput = () => this.renderMobileBible();
        document.getElementById('mobile-bible-version').onchange = (e) => {
            this.session.bibleVersion = e.target.value;
            this.renderMobileBible();
        };
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
    },

    handleMobileGiving() {
        const branchId = document.getElementById('mobile-giving-branch').value;
        const amount = parseFloat(document.getElementById('mobile-giving-amount').value);
        const category = document.getElementById('mobile-giving-category').value;
        const method = document.getElementById('mobile-giving-method').value;

        if (isNaN(amount) || amount <= 0) return;

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
                <p style="font-size:0.75rem; color:#9ca3af; margin-top:5px;">Thank you for your donation of **$${amount.toFixed(2)}** toward ${category}.</p>
                <p style="font-size:0.7rem; color:#a5b4fc; font-weight:bold; margin-top:8px;">Receipt Generated: ${newTx.receiptNumber}</p>
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
                                <strong style="font-size:0.8rem; color:#fff; display:block;">${role}</strong>
                                <span style="font-size:0.7rem; color:#9ca3af;">Event: ${e.title}</span>
                                <span style="font-size:0.7rem; color:#a5b4fc; display:block;">Date: ${e.date}</span>
                            </div>
                            <button class="mobile-apply-btn" onclick="ChurchApp.handleMobileServeSignup('${e.id}', '${role}')">Serve</button>
                        </div>
                    `;
                    openRolesContainer.appendChild(div);
                }
            });
        });

        if (openRolesContainer.innerHTML === '') {
            openRolesContainer.innerHTML = `<div style="text-align:center; color:#9ca3af; font-size:0.75rem; padding:20px;">All volunteer slots are fully rostered! Thank you!</div>`;
        }

        // Render current member skills list
        const m1 = this.db.members.find(m => m.id === 'm1');
        const skillsContainer = document.getElementById('mobile-my-skills-list');
        skillsContainer.innerHTML = m1.volunteer_skills.map(s => `<span class="skill-tag">${s}</span>`).join('');
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

            alert(`Thank you for serving! You are assigned to role: ${role} for event: ${event.title}.`);
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
            <p>${text}</p>
            <span class="chat-time">${new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</span>
        `;
        body.appendChild(userDiv);
        input.value = '';

        // Scroll chat
        body.scrollTop = body.scrollHeight;

        // Simulate AI Bot response after 600ms
        setTimeout(() => {
            const botResponse = window.AIEngine.getBotResponse(text);
            const botDiv = document.createElement('div');
            botDiv.className = 'chat-bubble bot animate-fade-in';
            botDiv.innerHTML = `
                <p>${botResponse}</p>
                <span class="chat-time">${new Date().toLocaleTimeString(undefined, {hour: '2-digit', minute:'2-digit'})}</span>
            `;
            body.appendChild(botDiv);
            body.scrollTop = body.scrollHeight;
        }, 600);
    },

    // UI Helpers
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
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

        alert(`Prayer Request submitted! AI analyzed this request as Category: [${categoryResult.category}] and successfully routed it to the [${categoryResult.route}].`);
        
        this.renderAll();
    }
};

// Start application
window.onload = () => {
    ChurchApp.init();
    
    // Globally expose modal close and helper events
    window.ChurchApp = ChurchApp;
};
