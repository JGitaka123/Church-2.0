// Maximum Miracle Centre — Client-Side Ministry Intelligence Simulation
// Designed to mimic advanced Natural Language Processing and Analytics

const AIEngine = {
    // 1. Bible Quiz Sub-engine
    QuizManager: {
        active: false,
        questionIndex: 0,
        score: 0,
        questions: [
            { q: "How many books are in the Bible?", a: "66", options: ["55", "66", "72", "84"] },
            { q: "Which book contains the verse: 'For where your treasure is, there will your heart be also'?", a: "Luke", options: ["Matthew", "Mark", "Luke", "John"] },
            { q: "By what means are we saved according to Ephesians 2:8?", a: "Grace through faith", options: ["Good deeds", "Grace through faith", "Tradition", "Strict laws"] },
            { q: "Which prophet was swallowed by a great fish?", a: "Jonah", options: ["Jonah", "Elijah", "Isaiah", "Moses"] },
            { q: "What is the longest chapter in the Bible?", a: "Psalm 119", options: ["Psalm 23", "Psalm 119", "Genesis 1", "John 3"] }
        ],
        startQuiz() {
            this.active = true;
            this.questionIndex = 0;
            this.score = 0;
            return `📖 **Bible Trivia Quiz Started!**\n\nAnswer the questions by typing the correct option or word.\n\n*Question 1*: ${this.questions[0].q}\nOptions:\n${this.questions[0].options.map(o => `- **${o}**`).join("\n")}`;
        },
        handleAnswer(answerText) {
            const currentQ = this.questions[this.questionIndex];
            const normalizedUser = answerText.trim().toLowerCase();
            const normalizedCorrect = currentQ.a.toLowerCase();

            // Require a real answer: an empty string makes includes() trivially true,
            // which would mark blank submissions correct.
            let isCorrect = normalizedUser.length > 0 &&
                (normalizedUser.includes(normalizedCorrect) || normalizedCorrect.includes(normalizedUser));

            if (!isCorrect) {
                const matchedOpt = currentQ.options.find(opt => normalizedUser.includes(opt.toLowerCase()));
                if (matchedOpt && matchedOpt.toLowerCase() === normalizedCorrect) {
                    isCorrect = true;
                }
            }

            if (isCorrect) {
                this.score++;
                answerText = `✅ **Correct!**`;
            } else {
                answerText = `❌ **Incorrect.** The correct answer was: **${currentQ.a}**.`;
            }

            this.questionIndex++;

            if (this.questionIndex < this.questions.length) {
                const nextQ = this.questions[this.questionIndex];
                return `${answerText}\n\n*Question ${this.questionIndex + 1}*: ${nextQ.q}\nOptions:\n${nextQ.options.map(o => `- **${o}**`).join("\n")}`;
            } else {
                const finalScore = this.score;
                this.active = false;
                let feedback = "Excellent! You have a deep understanding of scripture. 🌟";
                if (finalScore < 3) feedback = "Good effort! Keep studying scripture to grow in knowledge. 📖";
                return `${answerText}\n\n🏁 **Quiz Finished!**\nYour Final Score: **${finalScore} / ${this.questions.length}**\n\n${feedback}`;
            }
        }
    },

    // 2. Study Plan Sub-engine
    StudyPlanManager: {
        plans: {
            grace: {
                topic: "Grace",
                days: [
                    { day: 1, ref: "Ephesians 2:8", focus: "Salvation is a gift, not earned by deeds." },
                    { day: 2, ref: "Romans 3:24", focus: "Justified freely by His grace through redemption." },
                    { day: 3, ref: "2 Corinthians 12:9", focus: "God's grace is sufficient in our weakness." },
                    { day: 4, ref: "Titus 2:11", focus: "Grace teaches us to live godly lives." },
                    { day: 5, ref: "Hebrews 4:16", focus: "Approach the throne of grace with confidence." }
                ]
            },
            faith: {
                topic: "Faith",
                days: [
                    { day: 1, ref: "Hebrews 11:1", focus: "The assurance of things hoped for." },
                    { day: 2, ref: "Romans 10:17", focus: "Faith comes by hearing the word of God." },
                    { day: 3, ref: "James 2:17", focus: "Faith without works is dead." },
                    { day: 4, ref: "Matthew 17:20", focus: "Faith as small as a mustard seed moves mountains." },
                    { day: 5, ref: "Hebrews 11:6", focus: "Without faith, it is impossible to please God." }
                ]
            },
            love: {
                topic: "Love",
                days: [
                    { day: 1, ref: "1 Corinthians 13:4-7", focus: "Patience, kindness, and endurance of love." },
                    { day: 2, ref: "John 3:16", focus: "God's ultimate demonstration of love." },
                    { day: 3, ref: "1 John 4:19", focus: "We love because He first loved us." },
                    { day: 4, ref: "Luke 10:27", focus: "Love the Lord and love your neighbor." },
                    { day: 5, ref: "Romans 13:10", focus: "Love is the fulfillment of the law." }
                ]
            },
            stewardship: {
                topic: "Stewardship",
                days: [
                    { day: 1, ref: "Malachi 3:10", focus: "Bringing tithes into the storehouse." },
                    { day: 2, ref: "Luke 12:34", focus: "Where your treasure is, there your heart is." },
                    { day: 3, ref: "Proverbs 11:25", focus: "A generous soul will prosper." },
                    { day: 4, ref: "2 Corinthians 9:7", focus: "God loves a cheerful giver." },
                    { day: 5, ref: "1 Peter 4:10", focus: "Use whatever gift you received to serve." }
                ]
            }
        },
        generateStudyPlan(topicInput) {
            const cleaned = (topicInput || '').trim().toLowerCase();
            let plan = this.plans[cleaned];

            if (!plan) {
                for (const key in this.plans) {
                    if (cleaned.includes(key) || key.includes(cleaned)) {
                        plan = this.plans[key];
                        break;
                    }
                }
            }

            if (!plan) {
                plan = {
                    topic: "General Spiritual Growth",
                    days: [
                        { day: 1, ref: "Psalm 119:105", focus: "God's word is a lamp to guide our feet." },
                        { day: 2, ref: "Philippians 4:6", focus: "Do not worry; present requests to God." },
                        { day: 3, ref: "Proverbs 3:5", focus: "Trust in the Lord with all your heart." },
                        { day: 4, ref: "Isaiah 40:31", focus: "Waiting on the Lord renews strength." },
                        { day: 5, ref: "Galatians 5:22", focus: "Walking in the fruit of the Spirit." }
                    ]
                };
            }

            return `📅 **Personalized 5-Day Study Plan: [${plan.topic}]**\n\nHere is your custom devotional plan to read and reflect on this week:\n\n${plan.days.map(d => `*Day ${d.day}*: **${d.ref}**\n- *Focus*: ${d.focus}`).join("\n\n")}\n\n*Tip: Study these scriptures inside the app's Scripture tab!*`;
        }
    },

    // 3. Chatbot Answer Engine Mappings
    chatbotResponses: [
        {
            keywords: ['service', 'time', 'worship', 'schedule', 'when'],
            response: "Our weekly services are: \n- **1st Service**: 7:00 AM - 9:30 AM\n- **2nd Service**: 10:00 AM - 12:30 PM\n- **Youth & Young Adults**: Sundays 2:00 PM\n- **Midweek Service**: Wednesdays at 5:30 PM (in person and on NURU TV)."
        },
        {
            keywords: ['give', 'giving', 'tithe', 'offering', 'pledge', 'money', 'donate', 'payment'],
            response: "You can tithe, give an offering, or support a project from the **Giving** tab in the app. M-Pesa is the fastest way — choose your campus and fund, enter the amount in shillings, and confirm the STK prompt on your phone. A digital receipt is saved to your giving history straight away."
        },
        {
            keywords: ['volunteer', 'serve', 'ushers', 'choir', 'worship', 'tech', 'sign up'],
            response: "We would love to have you serve! In the app's **Serve** tab, you can view open roles like Ushers, Worship Team, and Media/Tech. The AI can also analyze your profile skills to recommend the perfect fit for you. Sign up today!"
        },
        {
            keywords: ['location', 'branch', 'branches', 'where', 'address'],
            response: "Maximum Miracle Centre is one church meeting in several places:\n1. **Nairobi CBD**: Embassy Cinema, Latema Road, off Tom Mboya Street.\n2. **Kawangware**: Kawangware, Nairobi.\n3. **Nakuru**: Langa Langa, Kanu Street.\nSelect your campus in your profile to stay updated with local events."
        },
        {
            keywords: ['prayer', 'pray', 'request', 'pastor', 'help'],
            response: "Prayer is the backbone of our church. Go to the Home feed in the app and tap **Submit Prayer Request**. You can type your request, choose to make it anonymous, and the system's AI will tag it (e.g., Healing, Grief, Finance) and route it immediately to our dedicated pastoral care team."
        },
        {
            keywords: ['group', 'small group', 'cell', 'fellowship', 'community'],
            response: "Home fellowships meet through the week across Nairobi and Nakuru. Tap **Connect** on the home feed to find a group near you — Young Adults, Family Life & Marriage, Men's Morning Prayer or Women of Grace."
        },
        {
            keywords: ['hello', 'hi', 'hey', 'greetings'],
            response: "Hello! I am your **Pastoral Care Assistant**. How can I help you today? You can ask me about service times, giving links, events, volunteering, or submitting a prayer request!"
        },
        {
            keywords: ['grace', 'salvation', 'forgiveness', 'sin', 'repent'],
            response: "We believe that salvation is by grace through faith, a free gift of God. Forgiveness is always available to those who seek it with a sincere heart. God's grace is sufficient for you!"
        },
        {
            keywords: ['faith', 'trust', 'believe', 'hope'],
            response: "Faith is the assurance of things hoped for, the conviction of things not seen (Hebrews 11:1). Trust in the Lord with all your heart, and do not lean on your own understanding."
        },
        {
            keywords: ['jesus', 'christ', 'god', 'lord'],
            response: "Jesus Christ is the center of our community. He is our Savior, Lord, and Shepherd, who guides us in path of righteousness."
        }
    ],

    getBotResponse(messageText) {
        const query = messageText.toLowerCase();

        // 1. If a quiz session is active, evaluate answer
        if (this.QuizManager.active) {
            return this.QuizManager.handleAnswer(messageText);
        }

        // 2. Launch quiz
        if (query.includes('quiz') || query.includes('trivia') || query.includes('start quiz')) {
            return this.QuizManager.startQuiz();
        }

        // 3. Launch study plans
        if (query.startsWith('plan ') || query.includes('study plan')) {
            let topic = '';
            if (query.includes('study plan')) {
                topic = query.split('study plan')[1];
            } else {
                topic = query.split('plan')[1];
            }
            return this.StudyPlanManager.generateStudyPlan(topic);
        }
        if (query === 'plan') {
            return "📖 **Personalized Study Plan Builder**\n\nTo generate a study plan, type: `plan <topic>` (for example: `plan grace`, `plan faith`, `plan love`, `plan stewardship`).";
        }

        // 4. Default responses
        for (const item of this.chatbotResponses) {
            if (item.keywords.some(kw => query.includes(kw))) {
                return item.response;
            }
        }
        return "Thank you for reaching out. I'm not fully sure about that detail, but you can check the digital bulletin or contact the church office at info@maximummiracle.org. Would you like to submit a prayer request instead?";
    },

    // 2. Weekly Ministry Health Snapshot Compiler
    // Every figure below is derived from real transaction & attendance records
    // for the given scope. No Math.random(), no hardcoded percentages.
    generateWeeklySnapshot(branches, members, transactions, events, attendance) {
        attendance = Array.isArray(attendance) ? attendance : [];

        // Helper: format a signed percentage, or a friendly label when there is
        // no prior-period baseline to compare against (avoids fake "+X%").
        const pctChange = (current, previous) => {
            if (!previous || previous === 0) {
                return current > 0 ? { text: 'new', up: true, hasBaseline: false }
                                   : { text: '0%', up: true, hasBaseline: false };
            }
            const pct = ((current - previous) / previous) * 100;
            const sign = pct >= 0 ? '+' : '';
            return { text: `${sign}${pct.toFixed(1)}%`, up: pct >= 0, hasBaseline: true };
        };

        // ---- Giving: this week vs last week, from real transactions ----
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        let thisWeekGiving = 0;
        let lastWeekGiving = 0;
        const thisWeekGiverIds = new Set();
        const fundTotals = {};

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            const amt = parseFloat(t.amount) || 0;
            if (tDate >= sevenDaysAgo) {
                thisWeekGiving += amt;
                if (t.memberId) thisWeekGiverIds.add(t.memberId);
                fundTotals[t.category] = (fundTotals[t.category] || 0) + amt;
            } else if (tDate >= fourteenDaysAgo && tDate < sevenDaysAgo) {
                lastWeekGiving += amt;
            }
        });
        const giving = pctChange(thisWeekGiving, lastWeekGiving);

        // ---- Attendance: counts per service date, from real records ----
        const presentByDate = {};
        attendance.forEach(a => {
            if (!(a.date in presentByDate)) presentByDate[a.date] = 0;
            if (a.present) presentByDate[a.date] += 1;
        });
        const serviceDates = Object.keys(presentByDate).sort(); // ascending
        const latestCount = serviceDates.length ? presentByDate[serviceDates[serviceDates.length - 1]] : 0;
        const prevCount = serviceDates.length > 1 ? presentByDate[serviceDates[serviceDates.length - 2]] : 0;
        const avgAttendance = serviceDates.length
            ? Math.round(serviceDates.reduce((s, d) => s + presentByDate[d], 0) / serviceDates.length)
            : 0;
        const attendance7 = pctChange(latestCount, prevCount);

        // ---- At-risk: real absence streaks (last 3 services all absent) ----
        const byMember = {};
        attendance.forEach(a => {
            (byMember[a.memberId] = byMember[a.memberId] || []).push(a);
        });
        const atRiskMembers = members.filter(m => {
            const recs = (byMember[m.id] || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date));
            const last3 = recs.slice(-3);
            return last3.length >= 3 && last3.every(r => !r.present);
        }).slice(0, 5).map(m => {
            const fName = m.firstName || m.first_name || '';
            const lName = m.lastName || m.last_name || '';
            const missed = (byMember[m.id] || []).slice().sort((a, b) => new Date(b.date) - new Date(a.date));
            let streak = 0;
            for (const r of missed) { if (!r.present) streak++; else break; }
            return `${fName} ${lName} (${m.branchName || 'Unknown campus'}) — absent ${streak} consecutive services`;
        });

        // ---- Participation & top fund, from real data ----
        const participationPct = members.length
            ? Math.round((thisWeekGiverIds.size / members.length) * 100) : 0;
        const topFund = Object.keys(fundTotals).sort((a, b) => fundTotals[b] - fundTotals[a])[0] || null;

        // Use the app-wide currency formatter so the briefing reads in the same
        // currency as every other figure on screen; fall back only if brand.js
        // hasn't loaded (e.g. this module under a bare Node test runner).
        const money = (n) => (typeof window !== 'undefined' && window.money)
            ? window.money(n)
            : `Ksh ${Math.round(n).toLocaleString('en-KE')}`;

        // ---- Natural-language summaries (real numbers only) ----
        const givingLine = giving.hasBaseline
            ? `Giving is at **${money(thisWeekGiving)}** (${giving.text} vs last week).`
            : `Giving is at **${money(thisWeekGiving)}** (no prior-week giving to compare against).`;
        const attLine = serviceDates.length
            ? (attendance7.hasBaseline
                ? `Latest service attendance was **${latestCount}** (${attendance7.text} vs the prior service), averaging **${avgAttendance}** over the last ${serviceDates.length} services.`
                : `Latest service attendance was **${latestCount}** (first service on record).`)
            : `No attendance has been recorded yet.`;

        const weeklySummaryText = `• **Financials**: ${givingLine}
• **Attendance**: ${attLine}
• **Care Alerts**: **${atRiskMembers.length}** member(s) flagged for a 3+ service absence streak. Pastoral care outreach is recommended.`;

        const trendWord = giving.hasBaseline ? (giving.up ? 'increase' : 'decrease') : 'result';
        const execParts = [
            `Giving this week totaled **${money(thisWeekGiving)}**` +
                (giving.hasBaseline ? `, a ${giving.text} ${trendWord} versus last week.` : ` (no prior-week baseline).`),
            `**${participationPct}%** of members in this scope gave this week` +
                (topFund ? `, with **${topFund}** the largest fund.` : '.'),
            serviceDates.length
                ? `Average attendance across the last ${serviceDates.length} services is **${avgAttendance}**.`
                : `No attendance records exist for this scope yet.`,
            `**${atRiskMembers.length}** member(s) have missed 3+ consecutive services and are recommended for follow-up.`
        ];

        return {
            thisWeekGiving,
            givingDiffPercent: giving.text,
            avgAttendance,
            attendanceDiffPercent: attendance7.hasBaseline ? attendance7.text : (serviceDates.length ? 'new' : '—'),
            participationPct,
            topFund,
            atRisk: atRiskMembers,
            bulletSummary: weeklySummaryText,
            executiveSnapshot: execParts.join(' ')
        };
    },

    // 3. Sermon Repurposer
    repurposeSermon(title, transcriptText) {
        if (!transcriptText || transcriptText.trim().length < 10) {
            transcriptText = "We are called to live generously. Not just with our wallets, but with our time, our energy, and our forgiveness. When we open our hands, we allow God to fill them. Trust is the foundation of stewardship.";
        }

        // Extract key words for devotionals
        const sentences = transcriptText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
        const mainPoint = sentences[0] || "Live generously.";
        const subPoint = sentences[Math.min(sentences.length - 1, 1)] || "Stewardship is about trust.";
        
        return {
            title: title || "Sunday Sermon Study Plan",
            devotional: {
                day1: `**Day 1: ${mainPoint}**\n*Read*: Luke 12:34\n*Reflection*: When we reflect on today's sermon, we see that what we value shows where our heart is. Take 5 minutes today to write down what you hold closest to your heart. Are you holding them with an open hand or a clenched fist?`,
                day2: `**Day 2: ${subPoint}**\n*Read*: Malachi 3:10\n*Reflection*: Trust is built in small, consistent actions. God asks us to test Him in our faithfulness. Think of one area of your time or finances where you can trust God more this week.`,
                day3: `**Day 3: Living with Open Hands**\n*Read*: Proverbs 11:25\n*Reflection*: A generous soul will prosper. Generosity isn't a transaction; it's a transformation of our character. How can you show unexpected generosity to a neighbor or coworker today?`
            },
            socialQuotes: [
                `"${mainPoint}" — Preached at Maximum Miracle Centre`,
                `"Generosity isn't about the size of our bank accounts, it's about the state of our hearts."`,
                `"${subPoint} Open hands let God fill us with grace."`
            ],
            discussionQuestions: [
                `Pastor highlighted: "${mainPoint}". How does this challenge your current daily routine?`,
                "What is the biggest obstacle to living a life of true stewardship (time, talent, or treasure)?",
                "Share a time when you experienced someone's generosity that changed your perspective."
            ]
        };
    },

    // 4. Prayer Request Tagging & Routing
    categorizePrayerRequest(text) {
        if (!text) return { category: 'General', route: 'Pastoral Staff', confidence: 1.0, tags: [] };

        let scoreHealing = 0;
        let scoreFinancial = 0;
        let scoreGrief = 0;
        let scoreFamily = 0;

        const tags = [];

        // Match whole words only, so "parent" doesn't trip the "rent" keyword and
        // "reason"/"season" don't trip "son". Multi-word phrases match as phrases.
        const hasWord = (w) => {
            const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
        };
        const scoreWords = (words) => {
            let s = 0;
            words.forEach(w => {
                if (hasWord(w)) { s += 2; tags.push(w); }
            });
            return s;
        };

        scoreHealing = scoreWords(['sick', 'illness', 'cancer', 'pain', 'hospital', 'doctor', 'surgery', 'healing', 'disease', 'recovery', 'health', 'pneumonia', 'covid']);
        scoreFinancial = scoreWords(['job', 'money', 'debt', 'finance', 'rent', 'bills', 'unemployed', 'business', 'financial', 'mortgage', 'poverty']);
        scoreGrief = scoreWords(['died', 'passed away', 'loss', 'grief', 'funeral', 'mourning', 'death', 'lost', 'passed']);
        scoreFamily = scoreWords(['marriage', 'husband', 'wife', 'son', 'daughter', 'children', 'divorce', 'family', 'parent', 'relationship', 'kids']);

        let category = 'General';
        let route = 'Pastoral Care Team';
        let maxScore = Math.max(scoreHealing, scoreFinancial, scoreGrief, scoreFamily);

        if (maxScore > 0) {
            if (maxScore === scoreHealing) {
                category = 'Healing';
                route = 'Hospital & Home Care Ministry';
            } else if (maxScore === scoreFinancial) {
                category = 'Financial';
                route = 'Benevolence & Stewardship Committee';
            } else if (maxScore === scoreGrief) {
                category = 'Grief';
                route = 'Grief Support & Counseling Department';
            } else if (maxScore === scoreFamily) {
                category = 'Family';
                route = 'Family Life & Marriage Ministry';
            }
        }

        const confidence = maxScore > 0 ? Math.min(0.7 + (maxScore * 0.05), 0.99) : 0.65;

        return {
            category,
            route,
            confidence: confidence.toFixed(2),
            tags: [...new Set(tags)]
        };
    },

    // 5. Volunteer Matcher
    matchVolunteersForEvent(eventReqSkills, membersList) {
        // Normalize to a list of non-empty role strings. Return the SAME
        // {member, score, matchedSkills} shape in every branch so callers that
        // read m.member/m.score don't hit undefined on the fallback path.
        const roles = (eventReqSkills || []).map(s => String(s).trim()).filter(Boolean);
        if (roles.length === 0) {
            return membersList.slice(0, 3).map(member => ({ member, score: 0, matchedSkills: [] }));
        }

        const matches = [];

        membersList.forEach(member => {
            let matchedSkillsCount = 0;
            const matchedSkills = [];

            if (member.volunteer_skills && Array.isArray(member.volunteer_skills)) {
                roles.forEach(reqSkill => {
                    const found = member.volunteer_skills.some(memberSkill =>
                        memberSkill.toLowerCase().includes(reqSkill.toLowerCase()) ||
                        reqSkill.toLowerCase().includes(memberSkill.toLowerCase())
                    );
                    if (found) {
                        matchedSkillsCount++;
                        matchedSkills.push(reqSkill);
                    }
                });
            }

            if (matchedSkillsCount > 0) {
                // Calculate match score based on skills matched and engagement score
                const skillWeight = matchedSkillsCount * 30;
                const engagementWeight = (member.engagement_score || 50) * 0.4;
                const totalScore = skillWeight + engagementWeight;

                matches.push({
                    member,
                    score: Math.min(Math.round(totalScore), 100),
                    matchedSkills
                });
            }
        });

        // Sort descending by score
        return matches.sort((a, b) => b.score - a.score);
    }
};

// Export for browser and Node environments
if (typeof window !== 'undefined') {
    window.AIEngine = AIEngine;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIEngine;
}
