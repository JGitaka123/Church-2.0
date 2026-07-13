// Church 2.0 AI Engine - Client-Side Ministry Intelligence Simulation
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
            response: "Sunday services are held at: \n- **First Service**: 8:00 AM - 9:30 AM\n- **Second Service (HQ)**: 10:30 AM - 12:00 PM\n- **Youth & Young Adults**: 2:00 PM - 4:00 PM\n- **Midweek Prayer**: Wednesdays at 6:30 PM (online & in-person)."
        },
        {
            keywords: ['give', 'giving', 'tithe', 'offering', 'pledge', 'money', 'donate', 'payment'],
            response: "You can securely tithe, give offerings, or contribute to specific projects in the **Giving** tab here in the app! Simply select your branch, enter the amount, select the fund, and confirm. A digital receipt will be automatically generated and saved to your profile history."
        },
        {
            keywords: ['volunteer', 'serve', 'ushers', 'choir', 'worship', 'tech', 'sign up'],
            response: "We would love to have you serve! In the app's **Serve** tab, you can view open roles like Ushers, Worship Team, and Media/Tech. The AI can also analyze your profile skills to recommend the perfect fit for you. Sign up today!"
        },
        {
            keywords: ['location', 'branch', 'branches', 'where', 'address'],
            response: "We are 'One Church, Multiple Locations'. Currently active branches:\n1. **Nairobi HQ**: Main Campus, Community Center road.\n2. **Dallas Branch**: Plano Rd, Dallas, TX.\n3. **London Branch**: Hyde Park Corner, London.\nSelect your branch in your profile to stay updated with local events."
        },
        {
            keywords: ['prayer', 'pray', 'request', 'pastor', 'help'],
            response: "Prayer is the backbone of our church. Go to the Home feed in the app and tap **Submit Prayer Request**. You can type your request, choose to make it anonymous, and the system's AI will tag it (e.g., Healing, Grief, Finance) and route it immediately to our dedicated pastoral care team."
        },
        {
            keywords: ['group', 'small group', 'cell', 'fellowship', 'community'],
            response: "Small groups meet weekly on Tuesdays and Thursdays across different neighborhoods and online. Tap **Connect** on the home feed to find a group that fits your location or demographic (e.g., Men's fellowship, Couples, Campus group)."
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
        return "Thank you for reaching out. I'm not fully sure about that detail, but you can check our digital bulletin or contact the Church Office directly at info@church2.org. Would you like to submit a prayer request instead?";
    },

    // 2. Weekly Ministry Health Snapshot Compiler
    generateWeeklySnapshot(branches, members, transactions, events) {
        // Calculate total giving this week vs last week (simulated)
        // Assume transactions before 7 days are "last week"
        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        let thisWeekGiving = 0;
        let lastWeekGiving = 0;
        let titheCount = 0;

        transactions.forEach(t => {
            const tDate = new Date(t.date);
            if (tDate >= sevenDaysAgo) {
                thisWeekGiving += parseFloat(t.amount);
                if (t.category === 'Tithe') titheCount++;
            } else if (tDate >= fourteenDaysAgo && tDate < sevenDaysAgo) {
                lastWeekGiving += parseFloat(t.amount);
            }
        });

        // Add dummy base value if no transactions to make it look realistic
        if (thisWeekGiving === 0) thisWeekGiving = 8450.00;
        if (lastWeekGiving === 0) lastWeekGiving = 7920.00;

        const givingDiffPercent = (((thisWeekGiving - lastWeekGiving) / lastWeekGiving) * 100).toFixed(1);
        const givingSign = givingDiffPercent >= 0 ? '+' : '';

        // Calculate attendance metrics
        const avgAttendanceThisWeek = 385 + Math.floor(Math.random() * 40);
        const avgAttendanceLastWeek = 370 + Math.floor(Math.random() * 20);
        const attendanceDiffPercent = (((avgAttendanceThisWeek - avgAttendanceLastWeek) / avgAttendanceLastWeek) * 100).toFixed(1);
        const attendanceSign = attendanceDiffPercent >= 0 ? '+' : '';

        // Find at-risk members (engagement score < 45)
        const atRiskMembers = members
            .filter(m => m.engagement_score < 45)
            .slice(0, 3)
            .map(m => {
                const fName = m.firstName || m.first_name || '';
                const lName = m.lastName || m.last_name || '';
                return `${fName} ${lName} (${m.branchName || 'Nairobi HQ'}) - Engagement Score: ${m.engagement_score}%`;
            });

        // Summary generation
        const weeklySummaryText = `Weekly Ministry Health Report:
• **Financials**: Giving is at **$${thisWeekGiving.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}** (${givingSign}${givingDiffPercent}% compared to last week).
• **Attendance**: Average service attendance was **${avgAttendanceThisWeek}** (${attendanceSign}${attendanceDiffPercent}%).
• **Care Alerts**: ${atRiskMembers.length} members flagged for slipping attendance/engagement. Pastoral care outreach is recommended.`;

        const executiveSnapshot = `The church saw a steady **${givingDiffPercent >= 0 ? 'increase' : 'decrease'}** in total donations this week, totaling **$${thisWeekGiving.toLocaleString()}**. Tithe compliance was at approximately 82% of regular givers.
Average attendance across all physical campuses peaked during the 10:30 AM service. Our online stream also recorded an 8% rise in unique IP addresses.
The AI Care alert system flags **${atRiskMembers.length}** members whose engagement index has dropped below the threshold of 45%. We suggest scheduling follow-up calls for these individuals.`;

        return {
            thisWeekGiving,
            givingDiffPercent: `${givingSign}${givingDiffPercent}%`,
            avgAttendance: avgAttendanceThisWeek,
            attendanceDiffPercent: `${attendanceSign}${attendanceDiffPercent}%`,
            atRisk: atRiskMembers,
            bulletSummary: weeklySummaryText,
            executiveSnapshot: executiveSnapshot
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
                `"${mainPoint}" — Preached at Church 2.0`,
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

        const query = text.toLowerCase();
        let scoreHealing = 0;
        let scoreFinancial = 0;
        let scoreGrief = 0;
        let scoreFamily = 0;
        
        const tags = [];

        // Healing keywords
        const healingWords = ['sick', 'illness', 'cancer', 'pain', 'hospital', 'doctor', 'surgery', 'healing', 'disease', 'recovery', 'health', 'pneumonia', 'covid'];
        healingWords.forEach(w => {
            if (query.includes(w)) {
                scoreHealing += 2;
                tags.push(w);
            }
        });

        // Financial keywords
        const financialWords = ['job', 'money', 'debt', 'finance', 'rent', 'bills', 'unemployed', 'business', 'financial', 'mortgage', 'poverty'];
        financialWords.forEach(w => {
            if (query.includes(w)) {
                scoreFinancial += 2;
                tags.push(w);
            }
        });

        // Grief keywords
        const griefWords = ['died', 'passed away', 'loss', 'grief', 'funeral', 'mourning', 'death', 'lost', 'passed'];
        griefWords.forEach(w => {
            if (query.includes(w)) {
                scoreGrief += 2;
                tags.push(w);
            }
        });

        // Family keywords
        const familyWords = ['marriage', 'husband', 'wife', 'son', 'daughter', 'children', 'divorce', 'family', 'parent', 'relationship', 'kids'];
        familyWords.forEach(w => {
            if (query.includes(w)) {
                scoreFamily += 2;
                tags.push(w);
            }
        });

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
