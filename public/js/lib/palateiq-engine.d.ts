/**
 * palateiq-engine.ts — Adaptive Elo scoring engine for Palate IQ
 *
 * Pure logic module with no UI or storage dependencies.
 * Handles Elo rating, card selection, level progression, and session tracking.
 */
export type Domain = 'grape_varieties' | 'regions_appellations' | 'tasting_sensory' | 'winemaking' | 'food_pairing' | 'history_culture' | 'service_business' | 'blind_tasting' | 'producer_knowledge';
export type CardFormat = 'multiple_choice' | 'map_pin' | 'match_pairs' | 'image_id' | 'odd_one_out' | 'scenario';
export type Confidence = 'established' | 'consensus' | 'emerging';
export interface Card {
    id: string;
    domain: Domain;
    difficulty: number;
    level: number;
    format: CardFormat;
    question: string;
    options: string[];
    correct: number | number[];
    explanation: string;
    sources: string;
    confidence: Confidence;
    tags: string[];
    map_data?: {
        region: string;
        svg_id: string;
    };
    pairs?: {
        left: string[];
        right: string[];
    };
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
    progress: number;
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
/**
 * Compute the expected probability of the player answering correctly.
 * Standard Elo formula: E = 1 / (1 + 10^((D_card - D_player) / 400))
 */
export declare function expectedScore(playerElo: number, cardDifficulty: number): number;
/**
 * Calculate new Elo after an answer.
 * @param playerElo    Current player rating
 * @param cardDifficulty  Card's difficulty rating
 * @param won          Whether the player answered correctly
 * @param K            K-factor (sensitivity). Default 32.
 * @returns            New player Elo rating
 */
export declare function calculateElo(playerElo: number, cardDifficulty: number, won: boolean, K?: number): number;
/**
 * Adaptive K-factor: lower K at extreme ratings for stability,
 * higher K for new players to converge faster.
 */
export declare function adaptiveK(playerElo: number, totalAnswered: number): number;
/**
 * Calculate Elo with adaptive K-factor.
 */
export declare function calculateAdaptiveElo(playerElo: number, cardDifficulty: number, won: boolean, totalAnswered: number): number;
/**
 * Convert Elo rating to level (1–11).
 */
export declare function eloToLevel(elo: number): number;
/**
 * Get the Elo range for a given level.
 */
export declare function levelEloRange(level: number): {
    min: number;
    max: number;
};
/**
 * Get full level info for a player.
 */
export declare function getLevelInfo(elo: number, cards: Card[]): LevelInfo;
/**
 * Get the maximum level constant.
 */
export declare function getMaxLevel(): number;
/**
 * Get all level thresholds.
 */
export declare function getLevelThresholds(): readonly number[];
/**
 * Filter cards by domain and/or level.
 */
export declare function filterCards(cards: Card[], domain?: Domain | 'all', level?: number): Card[];
/**
 * Weight a card based on distance from player Elo.
 * Closer difficulty = higher weight = more likely to be selected.
 * @param spreadFactor  Controls selection spread. Lower = tighter clustering around Elo.
 *                      Default 200.
 */
export declare function cardWeight(playerElo: number, cardDifficulty: number, spreadFactor?: number): number;
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
export declare function selectCard(cards: Card[], stats: PlayerStats, domain?: Domain | 'all', level?: number): CardSelection | null;
/**
 * Get the card at a specific index within a filtered pool (for browsing mode).
 */
export declare function getCardAtIndex(cards: Card[], index: number, domain?: Domain | 'all', level?: number): CardSelection | null;
/**
 * Process an answer and return the result with updated stats.
 * Does NOT mutate the input stats — returns a new stats object.
 */
export declare function processAnswer(card: Card, correct: boolean, stats: PlayerStats): {
    result: AnswerResult;
    newStats: PlayerStats;
};
/**
 * Check if a multiple choice / odd-one-out / scenario answer is correct.
 */
export declare function checkAnswer(card: Card, selectedIndex: number): boolean;
/**
 * Check if match_pairs answers are all correct.
 * @param userMatches  Map of left index → right index selected by user
 * @returns Object with overall correctness and per-pair results
 */
export declare function checkPairsAnswer(card: Card, userMatches: Record<number, number>): {
    allCorrect: boolean;
    pairResults: boolean[];
    correctCount: number;
};
/**
 * Create default player stats.
 */
export declare function createDefaultStats(): PlayerStats;
/**
 * Reset today's count if the date has changed.
 */
export declare function resetDailyCount(stats: PlayerStats): PlayerStats;
/**
 * Get accuracy as a number 0–1, or null if no answers yet.
 */
export declare function getAccuracy(stats: PlayerStats): number | null;
/**
 * Get domain-specific accuracy, or null if no answers in that domain.
 */
export declare function getDomainAccuracy(stats: PlayerStats, domain: Domain): number | null;
/**
 * Get a summary of domain performance.
 */
export declare function getDomainSummary(stats: PlayerStats): Array<{
    domain: Domain;
    elo: number;
    level: number;
    accuracy: number | null;
    answered: number;
}>;
/**
 * Track a study session. Create at start, update per answer, summarize at end.
 */
export declare class Session {
    private startElo;
    private startLevel;
    private answers;
    private streakHigh;
    private currentStreak;
    constructor(stats: PlayerStats);
    recordAnswer(domain: Domain, correct: boolean): void;
    summarize(stats: PlayerStats): SessionSummary;
}
/**
 * Get card counts by level.
 */
export declare function cardCountsByLevel(cards: Card[]): Record<number, number>;
/**
 * Get card counts by domain.
 */
export declare function cardCountsByDomain(cards: Card[]): Partial<Record<Domain, number>>;
/**
 * Get cards the player has NOT seen yet, optionally filtered.
 */
export declare function unseenCards(cards: Card[], stats: PlayerStats, domain?: Domain | 'all', level?: number): Card[];
/**
 * Estimate how many more correct answers are needed to reach the next level.
 */
export declare function answersToNextLevel(stats: PlayerStats, averageCardDifficulty?: number): number | null;
