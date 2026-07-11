// Church 2.0 Node-based Unit Test Suite
// Verifies core algorithms, calculation pipelines, and NLP categorization

const AIEngine = require('./ai-engine');

let passedTestsCount = 0;
let failedTestsCount = 0;

function assert(condition, message) {
    if (condition) {
        passedTestsCount++;
        console.log(`  ✅ PASS: ${message}`);
    } else {
        failedTestsCount++;
        console.error(`  ❌ FAIL: ${message}`);
    }
}

console.log("=== STARTING CHURCH 2.0 UNIT TEST RUNNER ===\n");

// ----------------------------------------------------
// TEST GROUP 1: Chatbot Answer Engine
// ----------------------------------------------------
console.log("Test Group 1: Chatbot Response Engine");
try {
    const serviceResponse = AIEngine.getBotResponse("When are the Sunday service schedules held?");
    assert(serviceResponse.includes("First Service") && serviceResponse.includes("10:30 AM"), 
        "Chatbot maps service time keywords correctly.");

    const givingResponse = AIEngine.getBotResponse("How can I tithe or make an offering?");
    assert(givingResponse.includes("securely tithe") && givingResponse.includes("Giving"), 
        "Chatbot maps giving keywords correctly.");

    const graceResponse = AIEngine.getBotResponse("What does the church believe about salvation and grace?");
    assert(graceResponse.includes("grace through faith") && graceResponse.includes("grace is sufficient"), 
        "Chatbot maps theological keywords (grace) correctly.");

    const fallbackResponse = AIEngine.getBotResponse("Random unrelated message here");
    assert(fallbackResponse.includes("unrelated") || fallbackResponse.includes("Office") || fallbackResponse.includes("Pastoral"), 
        "Chatbot responds with standard office details on fallbacks.");
} catch (e) {
    failedTestsCount++;
    console.error("  ❌ FAIL: Chatbot group crashed with error:", e);
}
console.log("");

// ----------------------------------------------------
// TEST GROUP 2: Weekly Snapshot Calculations
// ----------------------------------------------------
console.log("Test Group 2: Weekly Financial & Attendance Analytics");
try {
    const mockBranches = [{ id: 'b1', name: 'HQ' }];
    const mockMembers = [
        { id: 'm1', branchId: 'b1', firstName: 'John', lastName: 'Kamau', engagement_score: 95 },
        { id: 'm2', branchId: 'b1', firstName: 'Jane', lastName: 'Adair', engagement_score: 30 } // Flagged at risk
    ];
    
    // Create transactions for this week and last week
    const now = new Date();
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const mockTransactions = [
        { id: 't1', amount: 1000, category: 'Tithe', date: twoDaysAgo },
        { id: 't2', amount: 500, category: 'Offering', date: twoDaysAgo },
        { id: 't3', amount: 800, category: 'Tithe', date: tenDaysAgo }
    ];
    const mockEvents = [];

    const report = AIEngine.generateWeeklySnapshot(mockBranches, mockMembers, mockTransactions, mockEvents);

    assert(report.thisWeekGiving === 1500, "Weekly snapshot aggregates this week's giving amounts correctly.");
    assert(report.atRisk.some(m => m.includes("Jane Adair")), "At-risk tracker correctly flags members with engagement scores below 45%.");
    assert(report.bulletSummary.includes("Giving is at"), "Snapshot compiles a structured bulleted summary text block.");
} catch (e) {
    failedTestsCount++;
    console.error("  ❌ FAIL: Snapshot calculations crashed with error:", e);
}
console.log("");

// ----------------------------------------------------
// TEST GROUP 3: Sermon Repurposing
// ----------------------------------------------------
console.log("Test Group 3: AI Sermon Repurposing Generator");
try {
    const title = "Generosity & Faith";
    const transcript = "Trust is the key component of our relationship with God. When we hold things loosely, we align with grace.";
    const result = AIEngine.repurposeSermon(title, transcript);

    assert(result.title === title, "Repurposer copies title parameter correctly.");
    assert(result.devotional.day1.includes("Day 1:"), "Repurposer builds multi-day study devotions.");
    assert(result.socialQuotes.length >= 2, "Repurposer extracts highlight social quotes.");
    assert(result.discussionQuestions.length >= 2, "Repurposer creates small group discussions.");
} catch (e) {
    failedTestsCount++;
    console.error("  ❌ FAIL: Sermon repurposer crashed with error:", e);
}
console.log("");

// ----------------------------------------------------
// TEST GROUP 4: Prayer Request Categorization
// ----------------------------------------------------
console.log("Test Group 4: AI Prayer Request Routing & Categorization");
try {
    // Healing test
    const healingResult = AIEngine.categorizePrayerRequest("Please pray for my mother. She is in the hospital undergoing critical surgery.");
    assert(healingResult.category === "Healing" && healingResult.route.includes("Hospital"), 
        "Routes hospital and surgery requests to Healing / Hospital Care.");

    // Finance test
    const financeResult = AIEngine.categorizePrayerRequest("Pray that my business recovers, I need money to pay off accumulated bills and rent.");
    assert(financeResult.category === "Financial" && financeResult.route.includes("Benevolence"), 
        "Routes money, bills, and rent requests to Financial / Benevolence Care.");

    // Family test
    const familyResult = AIEngine.categorizePrayerRequest("Pray for counseling for our marriage. My husband and I are struggling to connect.");
    assert(familyResult.category === "Family" && familyResult.route.includes("Family Life"), 
        "Routes marriage and husband requests to Family Life Care.");
} catch (e) {
    failedTestsCount++;
    console.error("  ❌ FAIL: Prayer routing crashed with error:", e);
}
console.log("");

// ----------------------------------------------------
// TEST GROUP 5: Volunteer Matching Score
// ----------------------------------------------------
console.log("Test Group 5: AI Volunteer Matching Recommendations");
try {
    const mockMembers = [
        { id: 'm1', firstName: 'John', lastName: 'Kamau', volunteer_skills: ['Keyboard', 'Worship Vocals'], engagement_score: 90 },
        { id: 'm2', firstName: 'Sarah', lastName: 'Jenkins', volunteer_skills: ['Greeting'], engagement_score: 80 }
    ];

    const matchWorship = AIEngine.matchVolunteersForEvent(['Worship Vocals'], mockMembers);
    assert(matchWorship.length > 0 && matchWorship[0].member.id === 'm1', 
        "Ranks volunteers with matching skills on top.");
    assert(matchWorship[0].score > 60, 
        "Computes a weighted scoring index combining skill match and member engagement rating.");
} catch (e) {
    failedTestsCount++;
    console.error("  ❌ FAIL: Volunteer matcher crashed with error:", e);
}
console.log("");

// ----------------------------------------------------
// TEST RESULTS SUMMARY
// ----------------------------------------------------
console.log("=== TEST EXECUTION COMPLETE ===");
console.log(`Passed: ${passedTestsCount} test cases`);
console.log(`Failed: ${failedTestsCount} test cases`);

if (failedTestsCount > 0) {
    console.error("\n❌ BUILD FAILURE: Some test cases did not pass.");
    process.exit(1);
} else {
    console.log("\n🚀 BUILD SUCCESS: All core algorithms validate successfully.");
    process.exit(0);
}
