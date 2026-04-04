"use strict";
/**
 * palateiq-engine.test.ts — Unit tests for the Elo engine
 * Run: npx ts-node src/palateiq-engine.test.ts
 */
Object.defineProperty(exports, "__esModule", { value: true });
const palateiq_engine_js_1 = require("./palateiq-engine.js");
let passed = 0;
let failed = 0;
function assert(condition, msg) {
    if (condition) {
        passed++;
    }
    else {
        failed++;
        console.error(`  ✗ FAIL: ${msg}`);
    }
}
function approxEqual(a, b, epsilon = 0.01) {
    return Math.abs(a - b) < epsilon;
}
// ── Test Data ───────────────────────────────────────────
function makeCard(overrides = {}) {
    return {
        id: 'TEST-001',
        domain: 'grape_varieties',
        difficulty: 1000,
        level: 5,
        format: 'multiple_choice',
        question: 'Test question?',
        options: ['A', 'B', 'C', 'D'],
        correct: 1,
        explanation: 'Test explanation.',
        sources: 'Source A; Source B',
        confidence: 'established',
        tags: ['test'],
        ...overrides,
    };
}
function makeCards() {
    return [
        makeCard({ id: 'GV-001', domain: 'grape_varieties', difficulty: 200, level: 1 }),
        makeCard({ id: 'GV-002', domain: 'grape_varieties', difficulty: 500, level: 3 }),
        makeCard({ id: 'GV-003', domain: 'grape_varieties', difficulty: 1000, level: 6 }),
        makeCard({ id: 'RA-001', domain: 'regions_appellations', difficulty: 300, level: 2 }),
        makeCard({ id: 'RA-002', domain: 'regions_appellations', difficulty: 1500, level: 9 }),
        makeCard({ id: 'WM-001', domain: 'winemaking', difficulty: 800, level: 5 }),
        makeCard({ id: 'PK-001', domain: 'producer_knowledge', difficulty: 2200, level: 11 }),
    ];
}
// ── Elo Math Tests ──────────────────────────────────────
console.log('\n── Elo Math ──');
// Equal ratings → 50% expected
assert(approxEqual((0, palateiq_engine_js_1.expectedScore)(1000, 1000), 0.5), 'Equal ratings → 0.5 expected');
// Player much stronger → high expected
assert((0, palateiq_engine_js_1.expectedScore)(1500, 500) > 0.9, 'Player 1500 vs card 500 → >90% expected');
// Player much weaker → low expected
assert((0, palateiq_engine_js_1.expectedScore)(500, 1500) < 0.1, 'Player 500 vs card 1500 → <10% expected');
// Win against equal → Elo goes up
const eloAfterWin = (0, palateiq_engine_js_1.calculateElo)(1000, 1000, true);
assert(eloAfterWin > 1000, `Win vs equal → Elo up (${eloAfterWin.toFixed(1)})`);
assert(approxEqual(eloAfterWin, 1016, 1), 'Win vs equal → ~1016');
// Loss against equal → Elo goes down
const eloAfterLoss = (0, palateiq_engine_js_1.calculateElo)(1000, 1000, false);
assert(eloAfterLoss < 1000, `Loss vs equal → Elo down (${eloAfterLoss.toFixed(1)})`);
assert(approxEqual(eloAfterLoss, 984, 1), 'Loss vs equal → ~984');
// Win against harder card → bigger gain
const gainHard = (0, palateiq_engine_js_1.calculateElo)(1000, 1500, true) - 1000;
const gainEasy = (0, palateiq_engine_js_1.calculateElo)(1000, 500, true) - 1000;
assert(gainHard > gainEasy, `Beating harder card gives more Elo (${gainHard.toFixed(1)} > ${gainEasy.toFixed(1)})`);
// Zero-sum property: win gain + loss penalty ≈ 0 at equal ratings
assert(approxEqual(eloAfterWin + eloAfterLoss, 2000, 1), 'Zero-sum at equal ratings');
// ── Adaptive K ──────────────────────────────────────────
console.log('\n── Adaptive K ──');
assert((0, palateiq_engine_js_1.adaptiveK)(1000, 5) === 48, 'New player K=48');
assert((0, palateiq_engine_js_1.adaptiveK)(1000, 50) === 32, 'Established player K=32');
assert((0, palateiq_engine_js_1.adaptiveK)(300, 50) === 24, 'Low Elo extreme K=24');
assert((0, palateiq_engine_js_1.adaptiveK)(2100, 50) === 24, 'High Elo extreme K=24');
// ── Level System ────────────────────────────────────────
console.log('\n── Level System ──');
assert((0, palateiq_engine_js_1.eloToLevel)(0) === 1, 'Elo 0 → Level 1');
assert((0, palateiq_engine_js_1.eloToLevel)(100) === 1, 'Elo 100 → Level 1');
assert((0, palateiq_engine_js_1.eloToLevel)(249) === 1, 'Elo 249 → Level 1');
assert((0, palateiq_engine_js_1.eloToLevel)(250) === 2, 'Elo 250 → Level 2');
assert((0, palateiq_engine_js_1.eloToLevel)(999) === 6, 'Elo 999 → Level 6');
assert((0, palateiq_engine_js_1.eloToLevel)(1000) === 6, 'Elo 1000 → Level 6');
assert((0, palateiq_engine_js_1.eloToLevel)(2000) === 11, 'Elo 2000 → Level 11');
assert((0, palateiq_engine_js_1.eloToLevel)(2500) === 11, 'Elo 2500 → Level 11');
assert((0, palateiq_engine_js_1.getMaxLevel)() === 11, 'Max level is 11');
const range5 = (0, palateiq_engine_js_1.levelEloRange)(5);
assert(range5.min === 700, 'Level 5 min = 700');
assert(range5.max === 899, 'Level 5 max = 899');
const range11 = (0, palateiq_engine_js_1.levelEloRange)(11);
assert(range11.min === 2000, 'Level 11 min = 2000');
assert(range11.max === 2499, 'Level 11 max = 2499');
const cards = makeCards();
const info = (0, palateiq_engine_js_1.getLevelInfo)(1000, cards);
assert(info.level === 6, 'Level info: level 6 at Elo 1000');
assert(info.progress >= 0 && info.progress <= 1, 'Level info: progress in range');
assert(info.cardsAtLevel === 1, 'Level info: 1 card at level 6');
// ── Card Filtering ──────────────────────────────────────
console.log('\n── Card Filtering ──');
assert((0, palateiq_engine_js_1.filterCards)(cards).length === 7, 'No filter → all cards');
assert((0, palateiq_engine_js_1.filterCards)(cards, 'grape_varieties').length === 3, 'Filter by grape_varieties');
assert((0, palateiq_engine_js_1.filterCards)(cards, 'all').length === 7, 'Filter by "all" → all cards');
assert((0, palateiq_engine_js_1.filterCards)(cards, 'all', 1).length === 1, 'Filter by level 1');
assert((0, palateiq_engine_js_1.filterCards)(cards, 'grape_varieties', 1).length === 1, 'Filter by domain + level');
assert((0, palateiq_engine_js_1.filterCards)(cards, 'producer_knowledge', 11).length === 1, 'Producer level 11');
// ── Card Weights ────────────────────────────────────────
console.log('\n── Card Weights ──');
const w1 = (0, palateiq_engine_js_1.cardWeight)(1000, 1000);
const w2 = (0, palateiq_engine_js_1.cardWeight)(1000, 500);
assert(w1 > w2, 'Closer card has higher weight');
assert(approxEqual(w1, 1.0, 0.01), 'Same Elo weight ≈ 1.0');
// ── Card Selection ──────────────────────────────────────
console.log('\n── Card Selection ──');
const stats = (0, palateiq_engine_js_1.createDefaultStats)();
const sel = (0, palateiq_engine_js_1.selectCard)(cards, stats);
assert(sel !== null, 'Selection returns a card');
assert(sel.poolSize === 7, 'Pool size is 7');
const selDomain = (0, palateiq_engine_js_1.selectCard)(cards, stats, 'winemaking');
assert(selDomain !== null, 'Domain filter returns card');
assert(selDomain.card.domain === 'winemaking', 'Selected card matches domain');
const selEmpty = (0, palateiq_engine_js_1.selectCard)(cards, stats, 'food_pairing');
assert(selEmpty === null, 'Empty pool returns null');
// Browse mode
const browse = (0, palateiq_engine_js_1.getCardAtIndex)(cards, 0, 'all', 1);
assert(browse !== null, 'Browse returns card');
assert(browse.card.level === 1, 'Browse card at level 1');
const browse2 = (0, palateiq_engine_js_1.getCardAtIndex)(cards, 100, 'all', 1);
assert(browse2 !== null, 'Browse wraps around');
// ── Answer Processing ───────────────────────────────────
console.log('\n── Answer Processing ──');
const card = makeCard({ difficulty: 1000 });
const { result, newStats } = (0, palateiq_engine_js_1.processAnswer)(card, true, stats);
assert(result.correct === true, 'Result shows correct');
assert(result.newElo > 1000, 'Elo increased');
assert(result.eloDelta > 0, 'Positive Elo delta');
assert(result.newStreak === 1, 'Streak = 1');
assert(newStats.totalAnswered === 1, 'Total answered = 1');
assert(newStats.totalCorrect === 1, 'Total correct = 1');
assert(newStats.seenIds.includes(card.id), 'Card marked as seen');
assert(newStats.domainElo.grape_varieties !== undefined, 'Domain Elo set');
assert(newStats.domainAnswered.grape_varieties === 1, 'Domain answered = 1');
// Incorrect answer
const { result: r2, newStats: ns2 } = (0, palateiq_engine_js_1.processAnswer)(card, false, newStats);
assert(r2.correct === false, 'Result shows incorrect');
assert(r2.newStreak === 0, 'Streak reset to 0');
assert(ns2.totalAnswered === 2, 'Total answered = 2');
assert(ns2.totalCorrect === 1, 'Total correct still 1');
// Level up detection
const almostLevel2 = { ...(0, palateiq_engine_js_1.createDefaultStats)(), elo: 245 };
const easyCard = makeCard({ difficulty: 200 });
const { result: r3 } = (0, palateiq_engine_js_1.processAnswer)(easyCard, true, almostLevel2);
assert(r3.leveledUp === true, 'Level up detected');
assert(r3.newLevel > r3.previousLevel, 'New level > previous');
// ── Answer Checking ─────────────────────────────────────
console.log('\n── Answer Checking ──');
assert((0, palateiq_engine_js_1.checkAnswer)(makeCard({ correct: 2 }), 2) === true, 'Correct MC answer');
assert((0, palateiq_engine_js_1.checkAnswer)(makeCard({ correct: 2 }), 1) === false, 'Wrong MC answer');
const pairsCard = makeCard({
    format: 'match_pairs',
    correct: [2, 0, 3, 1],
    pairs: { left: ['A', 'B', 'C', 'D'], right: ['W', 'X', 'Y', 'Z'] },
});
const pResult = (0, palateiq_engine_js_1.checkPairsAnswer)(pairsCard, { 0: 2, 1: 0, 2: 3, 3: 1 });
assert(pResult.allCorrect === true, 'All pairs correct');
assert(pResult.correctCount === 4, 'Pair count = 4');
const pResult2 = (0, palateiq_engine_js_1.checkPairsAnswer)(pairsCard, { 0: 0, 1: 1, 2: 2, 3: 3 });
assert(pResult2.allCorrect === false, 'Wrong pairs detected');
assert(pResult2.correctCount < 4, 'Some pairs wrong');
// ── Stats Helpers ───────────────────────────────────────
console.log('\n── Stats Helpers ──');
const defaultStats = (0, palateiq_engine_js_1.createDefaultStats)();
assert(defaultStats.elo === 1000, 'Default Elo = 1000');
assert(defaultStats.streak === 0, 'Default streak = 0');
assert(defaultStats.levelUnlocked === 1, 'Default level unlocked = 1');
assert((0, palateiq_engine_js_1.getAccuracy)(defaultStats) === null, 'No answers → null accuracy');
const withAnswers = { ...defaultStats, totalCorrect: 7, totalAnswered: 10 };
assert(approxEqual((0, palateiq_engine_js_1.getAccuracy)(withAnswers), 0.7), 'Accuracy = 70%');
// Daily reset
const yesterday = { ...defaultStats, todayCount: 5, todayDate: 'old date' };
const reset = (0, palateiq_engine_js_1.resetDailyCount)(yesterday);
assert(reset.todayCount === 0, 'Daily count reset');
assert(reset.todayDate === new Date().toDateString(), 'Date updated');
const noReset = (0, palateiq_engine_js_1.resetDailyCount)(defaultStats);
assert(noReset.todayCount === 0, 'Same day not reset');
// Domain accuracy
const domainStats = {
    ...defaultStats,
    domainCorrect: { grape_varieties: 8 },
    domainAnswered: { grape_varieties: 10 },
};
assert(approxEqual((0, palateiq_engine_js_1.getDomainAccuracy)(domainStats, 'grape_varieties'), 0.8), 'Domain accuracy 80%');
assert((0, palateiq_engine_js_1.getDomainAccuracy)(domainStats, 'winemaking') === null, 'Unplayed domain → null');
// Domain summary
const summary = (0, palateiq_engine_js_1.getDomainSummary)(domainStats);
assert(summary.length === 9, 'Summary has 9 domains');
const gv = summary.find(d => d.domain === 'grape_varieties');
assert(gv.answered === 10, 'Summary answered count');
// ── Session Tracking ────────────────────────────────────
console.log('\n── Session Tracking ──');
const session = new palateiq_engine_js_1.Session(defaultStats);
session.recordAnswer('grape_varieties', true);
session.recordAnswer('grape_varieties', true);
session.recordAnswer('regions_appellations', false);
session.recordAnswer('grape_varieties', true);
const endStats = { ...defaultStats, elo: 1050 };
const sessionSummary = session.summarize(endStats);
assert(sessionSummary.cardsAnswered === 4, 'Session: 4 cards');
assert(sessionSummary.correct === 3, 'Session: 3 correct');
assert(approxEqual(sessionSummary.accuracy, 0.75), 'Session: 75% accuracy');
assert(sessionSummary.eloDelta === 50, 'Session: +50 Elo');
assert(sessionSummary.streakHigh === 2, 'Session: streak high = 2');
assert(sessionSummary.domainBreakdown.length === 2, 'Session: 2 domains');
// ── Card Pool Analytics ─────────────────────────────────
console.log('\n── Analytics ──');
const counts = (0, palateiq_engine_js_1.cardCountsByLevel)(cards);
assert(counts[1] === 1, '1 card at level 1');
assert(counts[11] === 1, '1 card at level 11');
const domainCounts = (0, palateiq_engine_js_1.cardCountsByDomain)(cards);
assert(domainCounts.grape_varieties === 3, '3 grape_varieties cards');
assert(domainCounts.producer_knowledge === 1, '1 producer card');
const unseen = (0, palateiq_engine_js_1.unseenCards)(cards, defaultStats);
assert(unseen.length === 7, 'All unseen for new player');
const partialSeen = { ...defaultStats, seenIds: ['GV-001', 'GV-002'] };
assert((0, palateiq_engine_js_1.unseenCards)(cards, partialSeen).length === 5, '5 unseen after seeing 2');
const toNext = (0, palateiq_engine_js_1.answersToNextLevel)(defaultStats);
assert(toNext !== null && toNext > 0, 'Answers to next level > 0');
const maxStats = { ...defaultStats, elo: 2500 };
assert((0, palateiq_engine_js_1.answersToNextLevel)(maxStats) === null, 'Max level → null');
// ── Results ─────────────────────────────────────────────
console.log(`\n${'═'.repeat(40)}`);
console.log(`  ${passed} passed, ${failed} failed`);
console.log(`${'═'.repeat(40)}\n`);
process.exit(failed > 0 ? 1 : 0);
//# sourceMappingURL=palateiq-engine.test.js.map