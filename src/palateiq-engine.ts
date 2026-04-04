/**
 * palateiq-engine.ts — Adaptive Elo scoring engine for Palate IQ
 *
 * Pure logic module with no UI or storage dependencies.
 * Handles Elo rating, card selection, level progression, and session tracking.
 */

// ── Types ───────────────────────────────────────────────

export type Domain =
  | 'grape_varieties'
  | 'regions_appellations'
  | 'tasting_sensory'
  | 'winemaking'
  | 'food_pairing'
  | 'history_culture'
  | 'service_business'
  | 'blind_tasting'
  | 'producer_knowledge';

export type CardFormat =
  | 'multiple_choice'
  | 'map_pin'
  | 'match_pairs'
  | 'image_id'
  | 'odd_one_out'
  | 'scenario';

export type Confidence = 'established' | 'consensus' | 'emerging';

export interface Card {
  id: string;
  domain: Domain;
  difficulty: number;        // Elo difficulty 100–2500
  level: number;             // 1–11
  format: CardFormat;
  question: string;
  options: string[];
  correct: number | number[];
  explanation: string;
  sources: string;
  confidence: Confidence;
  tags: string[];
  map_data?: { region: string; svg_id: string };
  pairs?: { left: string[]; right: string[] };
  image_url?: string;
}

export interface PlayerStats {
  elo: number;
  streak: number;
  bestStreak: number;
  totalCorrect: number;
  totalAnswered: number;
  todayCount: number;
  todayDate: string;
  seenIds: string[];
  domainElo: Partial<Record<Domain, number>>;
  domainCorrect: Partial<Record<Domain, number>>;
  domainAnswered: Partial<Record<Domain, number>>;
  levelUnlocked: number;
}

export interface AnswerResult {
  correct: boolean;
  eloDelta: number;
  newElo: number;
  newStreak: number;
  newLevel: number;
  previousLevel: number;
  leveledUp: boolean;
  domainEloDelta: number;
  newDomainElo: number;
}

export interface CardSelection {
  card: Card;
  poolSize: number;
  unseenCount: number;
}

export interface LevelInfo {
  level: number;
  eloMin: number;
  eloMax: number;
  progress: number;          // 0–1 within current level
  cardsAtLevel: number;
  isMaxLevel: boolean;
}

export interface SessionSummary {
  cardsAnswered: number;
  correct: number;
  accuracy: number;
  eloDelta: number;
  startElo: number;
  endElo: number;
  startLevel: number;
  endLevel: number;
  streakHigh: number;
  domainBreakdown: Array<{
    domain: Domain;
    answered: number;
    correct: number;
  }>;
}

// ── Constants ───────────────────────────────────────────

const MAX_LEVEL = 11;
const DEFAULT_ELO = 1000;
const DEFAULT_K = 32;

/**
 * Level thresholds: index i is the minimum Elo for level (i+1).
 * Level 1:  0–249
 * Level 2:  250–399
 * Level 3:  400–549
 * Level 4:  550–699
 * Level 5:  700–899
 * Level 6:  900–1099
 * Level 7:  1100–1299
 * Level 8:  1300–1499
 * Level 9:  1500–1699
 * Level 10: 1700–1999
 * Level 11: 2000–2500
 */
const LEVEL_THRESHOLDS: readonly number[] = [
  0, 250, 400, 550, 700, 900, 1100, 1300, 1500, 1700, 2000, 2500,
];

// ── Elo Math ────────────────────────────────────────────

/**
 * Compute the expected probability of the player answering correctly.
 * Standard Elo formula: E = 1 / (1 + 10^((D_card - D_player) / 400))
 */
export function expectedScore(playerElo: number, cardDifficulty: number): number {
  return 1 / (1 + Math.pow(10, (cardDifficulty - playerElo) / 400));
}

/**
 * Calculate new Elo after an answer.
 * @param playerElo    Current player rating
 * @param cardDifficulty  Card's difficulty rating
 * @param won          Whether the player answered correctly
 * @param K            K-factor (sensitivity). Default 32.
 * @returns            New player Elo rating
 */
export function calculateElo(
  playerElo: number,
  cardDifficulty: number,
  won: boolean,
  K: number = DEFAULT_K,
): number {
  const expected = expectedScore(playerElo, cardDifficulty);
  const actual = won ? 1 : 0;
  return playerElo + K * (actual - expected);
}

/**
 * Adaptive K-factor: lower K at extreme ratings for stability,
 * higher K for new players to converge faster.
 */
export function adaptiveK(playerElo: number, totalAnswered: number): number {
  // New players (< 30 answers): K=48 for fast convergence
  if (totalAnswered < 30) return 48;
  // Established players at extreme ratings: K=24 for stability
  if (playerElo < 400 || playerElo > 2000) return 24;
  // Standard: K=32
  return DEFAULT_K;
}

/**
 * Calculate Elo with adaptive K-factor.
 */
export function calculateAdaptiveElo(
  playerElo: number,
  cardDifficulty: number,
  won: boolean,
  totalAnswered: number,
): number {
  const K = adaptiveK(playerElo, totalAnswered);
  return calculateElo(playerElo, cardDifficulty, won, K);
}

// ── Level System ────────────────────────────────────────

/**
 * Convert Elo rating to level (1–11).
 */
export function eloToLevel(elo: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (elo >= LEVEL_THRESHOLDS[i]) return Math.min(i + 1, MAX_LEVEL);
  }
  return 1;
}

/**
 * Get the Elo range for a given level.
 */
export function levelEloRange(level: number): { min: number; max: number } {
  const clamped = Math.max(1, Math.min(MAX_LEVEL, level));
  const min = LEVEL_THRESHOLDS[clamped - 1];
  const max = (LEVEL_THRESHOLDS[clamped] ?? 2500) - 1;
  return { min, max };
}

/**
 * Get full level info for a player.
 */
export function getLevelInfo(elo: number, cards: Card[]): LevelInfo {
  const level = eloToLevel(elo);
  const { min: eloMin, max: eloMax } = levelEloRange(level);
  const range = eloMax - eloMin + 1;
  const progress = Math.max(0, Math.min(1, (elo - eloMin) / range));
  const cardsAtLevel = cards.filter(c => c.level === level).length;

  return {
    level,
    eloMin,
    eloMax,
    progress,
    cardsAtLevel,
    isMaxLevel: level >= MAX_LEVEL,
  };
}

/**
 * Get the maximum level constant.
 */
export function getMaxLevel(): number {
  return MAX_LEVEL;
}

/**
 * Get all level thresholds.
 */
export function getLevelThresholds(): readonly number[] {
  return LEVEL_THRESHOLDS;
}

// ── Card Selection ──────────────────────────────────────

/**
 * Filter cards by domain and/or level.
 */
export function filterCards(
  cards: Card[],
  domain?: Domain | 'all',
  level?: number,
): Card[] {
  let pool = cards;
  if (domain && domain !== 'all') {
    pool = pool.filter(c => c.domain === domain);
  }
  if (level && level > 0) {
    pool = pool.filter(c => c.level === level);
  }
  return pool;
}

/**
 * Weight a card based on distance from player Elo.
 * Closer difficulty = higher weight = more likely to be selected.
 * @param spreadFactor  Controls selection spread. Lower = tighter clustering around Elo.
 *                      Default 200.
 */
export function cardWeight(
  playerElo: number,
  cardDifficulty: number,
  spreadFactor: number = 200,
): number {
  const dist = Math.abs(cardDifficulty - playerElo);
  return 1 / (1 + dist / spreadFactor);
}

/**
 * Select the next card adaptively based on player Elo.
 *
 * Strategy:
 * 1. Filter by domain/level if specified
 * 2. Prefer unseen cards (if enough remain)
 * 3. Weight by proximity to player Elo
 * 4. Weighted random selection
 *
 * @returns CardSelection with the chosen card and pool metadata, or null if no cards available
 */
export function selectCard(
  cards: Card[],
  stats: PlayerStats,
  domain: Domain | 'all' = 'all',
  level: number = 0,
): CardSelection | null {
  const pool = filterCards(cards, domain, level);
  if (pool.length === 0) return null;

  const seenSet = new Set(stats.seenIds);
  const unseen = pool.filter(c => !seenSet.has(c.id));
  const source = unseen.length > 10 ? unseen : pool;

  // Use domain-specific Elo if filtering by domain
  const playerElo = (domain !== 'all' && stats.domainElo[domain])
    ? stats.domainElo[domain]!
    : stats.elo;

  const weighted = source.map(c => ({
    card: c,
    weight: cardWeight(playerElo, c.difficulty),
  }));

  const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
  let r = Math.random() * totalWeight;

  for (const w of weighted) {
    r -= w.weight;
    if (r <= 0) {
      return { card: w.card, poolSize: pool.length, unseenCount: unseen.length };
    }
  }

  // Fallback to last card
  const last = weighted[weighted.length - 1];
  return { card: last.card, poolSize: pool.length, unseenCount: unseen.length };
}

/**
 * Get the card at a specific index within a filtered pool (for browsing mode).
 */
export function getCardAtIndex(
  cards: Card[],
  index: number,
  domain: Domain | 'all' = 'all',
  level: number = 0,
): CardSelection | null {
  const pool = filterCards(cards, domain, level);
  if (pool.length === 0) return null;
  const clamped = ((index % pool.length) + pool.length) % pool.length;
  return { card: pool[clamped], poolSize: pool.length, unseenCount: 0 };
}

// ── Answer Processing ───────────────────────────────────

/**
 * Process an answer and return the result with updated stats.
 * Does NOT mutate the input stats — returns a new stats object.
 */
export function processAnswer(
  card: Card,
  correct: boolean,
  stats: PlayerStats,
): { result: AnswerResult; newStats: PlayerStats } {
  const previousLevel = eloToLevel(stats.elo);
  const K = adaptiveK(stats.elo, stats.totalAnswered);

  // Global Elo
  const newElo = calculateElo(stats.elo, card.difficulty, correct, K);
  const eloDelta = newElo - stats.elo;

  // Domain Elo
  const domainElo = stats.domainElo[card.domain] ?? DEFAULT_ELO;
  const newDomainElo = calculateElo(domainElo, card.difficulty, correct, K);
  const domainEloDelta = newDomainElo - domainElo;

  const newLevel = eloToLevel(newElo);
  const newStreak = correct ? stats.streak + 1 : 0;

  const newStats: PlayerStats = {
    ...stats,
    elo: newElo,
    streak: newStreak,
    bestStreak: Math.max(stats.bestStreak, newStreak),
    totalCorrect: stats.totalCorrect + (correct ? 1 : 0),
    totalAnswered: stats.totalAnswered + 1,
    todayCount: stats.todayCount + 1,
    seenIds: stats.seenIds.includes(card.id)
      ? stats.seenIds
      : [...stats.seenIds, card.id],
    domainElo: {
      ...stats.domainElo,
      [card.domain]: newDomainElo,
    },
    domainCorrect: {
      ...stats.domainCorrect,
      [card.domain]: (stats.domainCorrect[card.domain] ?? 0) + (correct ? 1 : 0),
    },
    domainAnswered: {
      ...stats.domainAnswered,
      [card.domain]: (stats.domainAnswered[card.domain] ?? 0) + 1,
    },
    levelUnlocked: Math.max(stats.levelUnlocked, newLevel),
  };

  const result: AnswerResult = {
    correct,
    eloDelta,
    newElo,
    newStreak,
    newLevel,
    previousLevel,
    leveledUp: newLevel > previousLevel,
    domainEloDelta,
    newDomainElo,
  };

  return { result, newStats };
}

// ── Answer Checking ─────────────────────────────────────

/**
 * Check if a multiple choice / odd-one-out / scenario answer is correct.
 */
export function checkAnswer(card: Card, selectedIndex: number): boolean {
  if (Array.isArray(card.correct)) {
    return card.correct.includes(selectedIndex);
  }
  return card.correct === selectedIndex;
}

/**
 * Check if match_pairs answers are all correct.
 * @param userMatches  Map of left index → right index selected by user
 * @returns Object with overall correctness and per-pair results
 */
export function checkPairsAnswer(
  card: Card,
  userMatches: Record<number, number>,
): { allCorrect: boolean; pairResults: boolean[]; correctCount: number } {
  if (!card.pairs || !Array.isArray(card.correct)) {
    return { allCorrect: false, pairResults: [], correctCount: 0 };
  }

  const correctArr = card.correct as number[];
  const pairResults: boolean[] = [];
  let correctCount = 0;

  for (let i = 0; i < card.pairs.left.length; i++) {
    const isCorrect = userMatches[i] === correctArr[i];
    pairResults.push(isCorrect);
    if (isCorrect) correctCount++;
  }

  return {
    allCorrect: correctCount === card.pairs.left.length,
    pairResults,
    correctCount,
  };
}

// ── Stats Helpers ───────────────────────────────────────

/**
 * Create default player stats.
 */
export function createDefaultStats(): PlayerStats {
  return {
    elo: DEFAULT_ELO,
    streak: 0,
    bestStreak: 0,
    totalCorrect: 0,
    totalAnswered: 0,
    todayCount: 0,
    todayDate: new Date().toDateString(),
    seenIds: [],
    domainElo: {},
    domainCorrect: {},
    domainAnswered: {},
    levelUnlocked: 1,
  };
}

/**
 * Reset today's count if the date has changed.
 */
export function resetDailyCount(stats: PlayerStats): PlayerStats {
  const today = new Date().toDateString();
  if (stats.todayDate !== today) {
    return { ...stats, todayCount: 0, todayDate: today };
  }
  return stats;
}

/**
 * Get accuracy as a number 0–1, or null if no answers yet.
 */
export function getAccuracy(stats: PlayerStats): number | null {
  if (stats.totalAnswered === 0) return null;
  return stats.totalCorrect / stats.totalAnswered;
}

/**
 * Get domain-specific accuracy, or null if no answers in that domain.
 */
export function getDomainAccuracy(stats: PlayerStats, domain: Domain): number | null {
  const answered = stats.domainAnswered[domain] ?? 0;
  if (answered === 0) return null;
  return (stats.domainCorrect[domain] ?? 0) / answered;
}

/**
 * Get a summary of domain performance.
 */
export function getDomainSummary(stats: PlayerStats): Array<{
  domain: Domain;
  elo: number;
  level: number;
  accuracy: number | null;
  answered: number;
}> {
  const domains: Domain[] = [
    'grape_varieties', 'regions_appellations', 'tasting_sensory',
    'winemaking', 'food_pairing', 'history_culture',
    'service_business', 'blind_tasting', 'producer_knowledge',
  ];

  return domains.map(domain => {
    const elo = stats.domainElo[domain] ?? DEFAULT_ELO;
    return {
      domain,
      elo,
      level: eloToLevel(elo),
      accuracy: getDomainAccuracy(stats, domain),
      answered: stats.domainAnswered[domain] ?? 0,
    };
  });
}

// ── Session Tracking ────────────────────────────────────

/**
 * Track a study session. Create at start, update per answer, summarize at end.
 */
export class Session {
  private startElo: number;
  private startLevel: number;
  private answers: Array<{ domain: Domain; correct: boolean }> = [];
  private streakHigh = 0;
  private currentStreak = 0;

  constructor(stats: PlayerStats) {
    this.startElo = stats.elo;
    this.startLevel = eloToLevel(stats.elo);
  }

  recordAnswer(domain: Domain, correct: boolean): void {
    this.answers.push({ domain, correct });
    if (correct) {
      this.currentStreak++;
      this.streakHigh = Math.max(this.streakHigh, this.currentStreak);
    } else {
      this.currentStreak = 0;
    }
  }

  summarize(stats: PlayerStats): SessionSummary {
    const correct = this.answers.filter(a => a.correct).length;
    const total = this.answers.length;

    // Domain breakdown
    const domainMap = new Map<Domain, { answered: number; correct: number }>();
    for (const a of this.answers) {
      const entry = domainMap.get(a.domain) ?? { answered: 0, correct: 0 };
      entry.answered++;
      if (a.correct) entry.correct++;
      domainMap.set(a.domain, entry);
    }

    return {
      cardsAnswered: total,
      correct,
      accuracy: total > 0 ? correct / total : 0,
      eloDelta: stats.elo - this.startElo,
      startElo: this.startElo,
      endElo: stats.elo,
      startLevel: this.startLevel,
      endLevel: eloToLevel(stats.elo),
      streakHigh: this.streakHigh,
      domainBreakdown: Array.from(domainMap.entries()).map(([domain, data]) => ({
        domain,
        ...data,
      })),
    };
  }
}

// ── Card Pool Analytics ─────────────────────────────────

/**
 * Get card counts by level.
 */
export function cardCountsByLevel(cards: Card[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const c of cards) {
    counts[c.level] = (counts[c.level] ?? 0) + 1;
  }
  return counts;
}

/**
 * Get card counts by domain.
 */
export function cardCountsByDomain(cards: Card[]): Partial<Record<Domain, number>> {
  const counts: Partial<Record<Domain, number>> = {};
  for (const c of cards) {
    counts[c.domain] = (counts[c.domain] ?? 0) + 1;
  }
  return counts;
}

/**
 * Get cards the player has NOT seen yet, optionally filtered.
 */
export function unseenCards(
  cards: Card[],
  stats: PlayerStats,
  domain?: Domain | 'all',
  level?: number,
): Card[] {
  const pool = filterCards(cards, domain, level);
  const seenSet = new Set(stats.seenIds);
  return pool.filter(c => !seenSet.has(c.id));
}

/**
 * Estimate how many more correct answers are needed to reach the next level.
 */
export function answersToNextLevel(
  stats: PlayerStats,
  averageCardDifficulty?: number,
): number | null {
  const level = eloToLevel(stats.elo);
  if (level >= MAX_LEVEL) return null;

  const nextThreshold = LEVEL_THRESHOLDS[level];
  const gap = nextThreshold - stats.elo;
  if (gap <= 0) return 0;

  // Estimate using average gain per correct answer
  const cardDiff = averageCardDifficulty ?? stats.elo; // assume matching difficulty
  const K = adaptiveK(stats.elo, stats.totalAnswered);
  const expectedGain = K * (1 - expectedScore(stats.elo, cardDiff));

  return Math.ceil(gap / expectedGain);
}
