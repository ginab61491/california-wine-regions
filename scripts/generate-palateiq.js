#!/usr/bin/env node
// generate-palateiq.js — Batch card generator for Palate IQ using Anthropic API
// Usage: node scripts/generate-palateiq.js <domain> [startLevel] [endLevel]
// Example: node scripts/generate-palateiq.js grape_varieties 1 3

require('dotenv').config();
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs');
const path = require('path');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Config ──────────────────────────────────────────────

const DOMAINS = {
  grape_varieties:      { target: 300, prefix: 'GV' },
  regions_appellations: { target: 350, prefix: 'RA' },
  tasting_sensory:      { target: 200, prefix: 'TS' },
  winemaking:           { target: 200, prefix: 'WM' },
  food_pairing:         { target: 150, prefix: 'FP' },
  history_culture:      { target: 150, prefix: 'HC' },
  service_business:     { target: 150, prefix: 'SB' },
  blind_tasting:        { target: 200, prefix: 'BT' },
};

const LEVEL_CONFIG = {
  1:  { elo: [100, 300],   cards: 0.09 },   // ~9% of domain total
  2:  { elo: [300, 500],   cards: 0.09 },
  3:  { elo: [500, 700],   cards: 0.12 },
  4:  { elo: [700, 900],   cards: 0.12 },
  5:  { elo: [900, 1100],  cards: 0.13 },
  6:  { elo: [1100, 1300], cards: 0.13 },
  7:  { elo: [1300, 1500], cards: 0.12 },
  8:  { elo: [1500, 1700], cards: 0.10 },
  9:  { elo: [1700, 1900], cards: 0.05 },
  10: { elo: [2000, 2500], cards: 0.10 },
};

const SYSTEM_PROMPT = `You are a Master Sommelier and WSET Diploma holder generating flashcard questions for wine education. Your cards will be used by students ranging from absolute beginners to Master Sommelier candidates.

ACCURACY STANDARDS:
Every fact must be verifiable in at least two of the following sources:
- The Oxford Companion to Wine (Jancis Robinson & Julia Harding)
- Wine Grapes (Jancis Robinson, Julia Harding & José Vouillamoz)
- The World Atlas of Wine (Hugh Johnson & Jancis Robinson)
- GuildSomm (Court of Master Sommeliers educational platform)
- WSET Study Materials (Levels 2, 3, and Diploma)
- The Wine Bible (Karen MacNeil)
- Wine Science (Jamie Goode)

If you are not certain a fact is established and agreed upon in the wine education community, do not include it. Err on the side of accuracy over cleverness.

EXPLANATION STYLE:
Explanations should sound like a sommelier teaching at a tasting — warm, specific, and memorable. Not dry textbook prose. Include one memorable hook per explanation that helps the fact stick. Keep to 1-3 sentences.

DISTRACTOR QUALITY:
Wrong answer options (distractors) must be plausible. A student at the target level should genuinely hesitate between options. Never include obviously absurd distractors.

REGIONAL SPECIFICITY:
For questions about specific regions, always specify WHICH classification or regulatory framework you're asking about — don't assume universal knowledge of a single system.

GRAPE PARENTAGE:
Only cite DNA-confirmed relationships (Meredith/Bowers at UC Davis, José Vouillamoz's research). Never include folk etymology or unconfirmed historical claims as fact.

TASTING VOCABULARY:
Use the WSET Systematic Approach to Tasting (SAT) vocabulary and the Court of Master Sommeliers deductive tasting grid as canonical references.

CONFIDENCE LEVELS:
- "established": textbook fact, universally agreed (levels 1-7 only)
- "consensus": widely accepted among professionals, minor debate possible (levels 8-10 allowed)
- Never include "emerging" claims without explicit labeling`;

const DOMAIN_TOPICS = {
  grape_varieties: `GRAPE VARIETIES — Topics to cover:
- Major international varieties: Cabernet Sauvignon, Merlot, Pinot Noir, Syrah/Shiraz, Chardonnay, Sauvignon Blanc, Riesling, Pinot Grigio/Gris, Gewürztraminer, Chenin Blanc, Viognier, Sémillon, Muscat, Grenache/Garnacha, Mourvèdre, Tempranillo, Sangiovese, Nebbiolo, Barbera, Malbec, Zinfandel/Primitivo, Cabernet Franc, Petit Verdot, Gamay, Touriga Nacional
- Regional specialties: Grüner Veltliner, Albariño, Assyrtiko, Nerello Mascalese, Aglianico, Blaufränkisch, Furmint, Tannat, Carmenère, País/Listán Prieto, Xinomavro, Godello
- DNA-confirmed parentage relationships
- Characteristic aromas (use WSET SAT: primary, secondary, tertiary)
- Viticultural needs (climate, soil, vigor, ripening)
- Key clones and mutations
- Phenolic and structural characteristics
- Classic regions for each variety`,

  regions_appellations: `REGIONS & APPELLATIONS — Topics to cover:
- France: Bordeaux (1855 Classification, Left/Right Bank, satellite appellations), Burgundy (Grand Cru/Premier Cru/Village hierarchy, specific vineyard sites), Rhône (Northern vs Southern, key appellations), Loire (Sancerre, Vouvray, Muscadet, Chinon), Alsace (Grand Cru, varietal labeling), Champagne (villages, Côte des Blancs/Montagne de Reims), Languedoc-Roussillon, Jura, Provence
- Italy: Piedmont (Barolo/Barbaresco MGA, Roero, Asti), Tuscany (Chianti Classico, Brunello, Bolgheri, Vino Nobile, Super Tuscans), Veneto (Amarone, Soave, Valpolicella), Sicily, Campania, Friuli, Alto Adige
- Spain: Rioja (classification system), Ribera del Duero, Priorat, Rías Baixas, Jerez (sherry styles), Penedès
- Germany: Prädikat system, VDP classification, Mosel/Rheingau/Pfalz/Nahe
- Portugal: Douro/Port, Madeira, Vinho Verde, Alentejo, Dão
- USA: Napa Valley (sub-AVAs, Stags Leap District), Sonoma, Willamette Valley, Santa Barbara, Walla Walla, Finger Lakes
- Australia: Barossa, McLaren Vale, Hunter Valley, Margaret River, Yarra Valley, Clare/Eden Valley
- New Zealand: Marlborough, Central Otago, Hawke's Bay
- Argentina: Mendoza, Uco Valley
- Chile: major valleys
- South Africa: Stellenbosch, Swartland, Constantia
- Austria: Wachau (Steinfeder/Federspiel/Smaragd), Kamptal, Burgenland
- Greece: Santorini, Naoussa`,

  tasting_sensory: `TASTING & SENSORY — Topics to cover:
- WSET Systematic Approach to Tasting (SAT) structure and vocabulary
- CMS deductive tasting grid methodology
- Primary aromas (varietal character), secondary aromas (winemaking), tertiary aromas (aging)
- Wine faults: TCA/cork taint, Brettanomyces, volatile acidity, reduction, oxidation, heat damage, lightstrike
- Color assessment: what color tells you about age, grape variety, climate, winemaking
- Sweetness, acidity, tannin, body, alcohol, finish assessment
- Aroma compounds: thiols, esters, pyrazines, terpenes, TDN, rotundone, sotolon
- Structural balance and quality assessment
- Sensory science: retronasal olfaction, taste vs flavor, adaptation, cross-modal perception`,

  winemaking: `WINEMAKING — Topics to cover:
- Alcoholic fermentation (yeast strains, temperature control, stuck fermentation)
- Malolactic conversion (bacteria, impact on flavor and texture)
- Oak aging: French vs American vs Hungarian, toast levels, new vs used, barrel size
- Sparkling wine: traditional method, Charmat/tank method, transfer method, ancestrale
- Fortification: Port (styles, vintage vs tawny), Sherry (biological vs oxidative aging, solera), VDN
- Sweet wine: late harvest, botrytis/noble rot, eiswein/ice wine, passito/appassimento, vin de paille
- Viticultural practices: pruning systems, canopy management, yield control, harvest decisions
- Organic, biodynamic, natural winemaking definitions and practices
- Maceration: cold soak, extended maceration, carbonic/semi-carbonic, whole cluster
- SO2 chemistry, fining agents, filtration
- Alternative vessels: concrete, amphora, stainless steel, acacia wood`,

  food_pairing: `FOOD PAIRING — Topics to cover:
- Fundamental principles: acid/fat, tannin/protein, sweetness/salt, weight matching
- Classic regional pairings (what grows together goes together)
- Difficult-to-pair foods: artichoke (cynarin), asparagus, chocolate, very spicy food, vinegar
- Sauce-driven pairing logic (pair to the sauce, not the protein)
- Cheese and wine: why they work, classic matches, blue cheese + sweet wine
- Umami interactions with wine (how umami affects tannin perception)
- How cooking method affects pairing (grilled vs poached vs raw)
- Bridge ingredients and flavor echoing
- Sparkling wine versatility
- Dessert wine pairing (wine should be sweeter than the dish)`,

  history_culture: `HISTORY & CULTURE — Topics to cover:
- Phylloxera crisis (1860s-1900s) and grafting solution
- 1855 Bordeaux Classification and its one amendment
- Judgment of Paris 1976 (Spurrier, specific wines)
- History of Champagne (Dom Pérignon myths vs reality, widow Clicquot)
- Ancient winemaking: Georgia qvevri (8,000 years), Roman viticulture, Greek influence
- Key wine laws: French AOC (1935), Italian DOC (1963), American AVA system
- Prohibition (1920-1933) and aftermath on American wine
- Notable figures: Pasteur, Tchelistcheff, Robert Parker, Jancis Robinson, Robert Mondavi
- Terroir concept development
- New World vs Old World historical development
- Globalization of wine styles`,

  service_business: `SERVICE & BUSINESS — Topics to cover:
- Wine service sequence: presentation, opening, pouring, temperature
- Decanting: when, why, double decanting, young vs old wines
- Proper storage conditions (temperature, humidity, light, vibration, orientation)
- Serving temperatures by wine type
- Glassware selection and its impact
- Reading wine labels: Old World (place-based) vs New World (variety-based)
- Wine faults at the table: how to identify and handle diplomatically
- Restaurant wine program: markup structure, by-the-glass management, inventory
- Sommelier ethics: recommendation without pretension
- Vintage charts and their limitations
- Wine investment basics
- Closure types: cork, screwcap, synthetic (pros/cons)`,

  blind_tasting: `BLIND TASTING — Topics to cover:
- CMS deductive method: sight → nose → palate → initial conclusion → final conclusion
- Climate markers: cool climate (high acid, lower alcohol, green/citrus fruit) vs warm (ripe fruit, higher alcohol, lower acid)
- Oak identification: vanilla, toast, coconut, dill (American), cedar, spice (French)
- Age indicators: color evolution (purple→garnet→tawny for reds; green→gold→amber for whites), tertiary aromas
- Classic varietal markers: Cab Sauv (bell pepper/cassis/pyrazines), Riesling (petrol/TDN), Sauvignon Blanc (grapefruit/gooseberry/thiols), Pinot Noir (red fruit/earth), Syrah (black pepper/rotundone)
- New World vs Old World style markers
- Structural analysis as identification clues (acid, tannin, alcohol, body)
- Common blind tasting traps and how to avoid them
- Grid methodology for sparkling, fortified, sweet wines`,
};

// ── Generation ──────────────────────────────────────────

async function generateBatch(domain, levelStart, levelEnd, batchSize, existingQuestions) {
  const config = DOMAINS[domain];
  const levelRange = [];
  for (let l = levelStart; l <= levelEnd; l++) {
    const lc = LEVEL_CONFIG[l];
    const count = Math.ceil(config.target * lc.cards);
    levelRange.push({ level: l, eloMin: lc.elo[0], eloMax: lc.elo[1], count });
  }

  const formatDistribution = `Distribute formats across cards:
- ~55% "multiple_choice" (4 options, "correct" is the 0-based index of the right answer)
- ~20% "odd_one_out" (4 options, "correct" is the 0-based index of the item that does NOT belong, question should ask which doesn't fit)
- ~15% "match_pairs" (include "pairs": {"left": ["A","B","C","D"], "right": ["W","X","Y","Z"]}, "correct": [i,j,k,l] where each number is the index into "right" that matches the corresponding "left" item. "options" should be an empty array [])
- ~10% "scenario" (real-world situation, 4 options, "correct" is 0-based index)`;

  const levelInstructions = levelRange.map(l => {
    let extra = l.level <= 7 ? 'confidence must be "established"' : 'confidence can be "established" or "consensus"';
    if (l.level === 10) {
      extra += `. LEVEL 10 = Advanced Sommelier to Master Sommelier exam level. These are the hardest questions in the system. Topics should include: obscure vineyard sites and their specific soil compositions, micro-appellations, rare indigenous grape varieties and their DNA parentage, specific vintage conditions and their effects, edge-case winemaking chemistry, historical minutiae that only MS candidates would study, cross-regional comparisons requiring deep knowledge of multiple wine laws, specific producers' techniques and their influence on style. Every distractor must be extremely plausible — only deep expertise should distinguish the correct answer.`;
    }
    return `Level ${l.level} (Elo ${l.eloMin}-${l.eloMax}): Generate ${l.count} cards. ${extra}`;
  }).join('\n');

  const existingList = existingQuestions.length > 0
    ? `\n\nDO NOT repeat or closely paraphrase any of these existing questions:\n${existingQuestions.slice(-50).map(q => `- ${q}`).join('\n')}`
    : '';

  const prompt = `Generate exactly ${batchSize} wine education flashcards for the domain "${domain}".

${DOMAIN_TOPICS[domain]}

LEVEL DISTRIBUTION:
${levelInstructions}

FORMAT DISTRIBUTION:
${formatDistribution}

CARD SCHEMA (output as a JSON array):
{
  "id": "${config.prefix}-NNN",
  "domain": "${domain}",
  "difficulty": <number within the Elo range for this level>,
  "level": <1-10>,
  "format": "multiple_choice" | "odd_one_out" | "match_pairs" | "scenario",
  "question": "<question text>",
  "options": ["A", "B", "C", "D"],
  "correct": <0-based index or array of indices for match_pairs>,
  "explanation": "<1-3 sentences, warm sommelier teaching voice, one memorable hook>",
  "sources": "<Source 1; Source 2>",
  "confidence": "established" | "consensus",
  "tags": ["tag1", "tag2", "tag3"]
}

For match_pairs format, also include:
  "pairs": {"left": [...], "right": [...]},
  "options": []

NUMBER THE IDS STARTING FROM ${config.prefix}-${String(existingQuestions.length + 1).padStart(3, '0')}.

Output ONLY the JSON array. No markdown, no code fences, no explanation.${existingList}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 16000,
    temperature: 0.7,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].text.trim();
  // Strip markdown fences if present
  const jsonStr = text.replace(/^```json?\s*/, '').replace(/```\s*$/, '');
  return JSON.parse(jsonStr);
}

// ── Validation ──────────────────────────────────────────

function validateBatch(cards, domain, existingQuestions) {
  const errors = [];
  const config = DOMAINS[domain];
  const questions = new Set(existingQuestions.map(q => q.toLowerCase().trim()));

  for (const card of cards) {
    if (!card.id || !card.id.startsWith(config.prefix)) {
      errors.push(`${card.id || 'MISSING'}: bad ID prefix`);
    }
    if (card.domain !== domain) {
      errors.push(`${card.id}: wrong domain "${card.domain}"`);
    }
    if (!card.question || card.question.length < 10) {
      errors.push(`${card.id}: missing/short question`);
    }
    if (!['multiple_choice', 'odd_one_out', 'match_pairs', 'scenario'].includes(card.format)) {
      errors.push(`${card.id}: invalid format "${card.format}"`);
    }
    if (card.format === 'match_pairs') {
      if (!card.pairs || !card.pairs.left || !card.pairs.right) {
        errors.push(`${card.id}: match_pairs missing pairs field`);
      } else if (!Array.isArray(card.correct) || card.correct.length !== card.pairs.left.length) {
        errors.push(`${card.id}: match_pairs correct array length mismatch`);
      }
    } else {
      if (!Array.isArray(card.options) || card.options.length < 3) {
        errors.push(`${card.id}: missing/short options`);
      }
      if (typeof card.correct !== 'number' || card.correct < 0 || card.correct >= (card.options || []).length) {
        errors.push(`${card.id}: correct index out of bounds`);
      }
    }
    if (!card.explanation || card.explanation.length < 20) {
      errors.push(`${card.id}: missing/short explanation`);
    }
    const sentences = card.explanation ? card.explanation.split(/[.!?]+/).filter(s => s.trim()).length : 0;
    if (sentences > 4) {
      errors.push(`${card.id}: explanation too long (${sentences} sentences)`);
    }
    if (!card.sources || !card.sources.includes(';')) {
      errors.push(`${card.id}: sources must have 2 citations separated by ";"`);
    }
    if (!['established', 'consensus'].includes(card.confidence)) {
      errors.push(`${card.id}: invalid confidence`);
    }
    if (card.level <= 7 && card.confidence !== 'established') {
      errors.push(`${card.id}: level ${card.level} must be "established"`);
    }
    if (!card.level || card.level < 1 || card.level > 10) {
      errors.push(`${card.id}: invalid level`);
    }
    const lc = LEVEL_CONFIG[card.level];
    if (lc && (card.difficulty < lc.elo[0] || card.difficulty > lc.elo[1])) {
      errors.push(`${card.id}: difficulty ${card.difficulty} outside level ${card.level} range [${lc.elo[0]}-${lc.elo[1]}]`);
    }

    // Fuzzy duplicate check
    const qLower = card.question.toLowerCase().trim();
    if (questions.has(qLower)) {
      errors.push(`${card.id}: duplicate question`);
    }
    questions.add(qLower);
  }

  return errors;
}

// ── Main ────────────────────────────────────────────────

async function main() {
  const domain = process.argv[2];
  const startLevel = parseInt(process.argv[3]) || 1;
  const endLevel = parseInt(process.argv[4]) || 10;

  if (!domain || !DOMAINS[domain]) {
    console.log('Usage: node scripts/generate-palateiq.js <domain> [startLevel] [endLevel]');
    console.log('Domains:', Object.keys(DOMAINS).join(', '));
    process.exit(1);
  }

  const config = DOMAINS[domain];
  const outDir = path.join(__dirname, '..', 'public', 'data');
  const outFile = path.join(outDir, `palateiq-${domain}.json`);

  // Load existing cards for this domain
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(outFile, 'utf8')); } catch {}
  const existingQuestions = existing.map(c => c.question);

  console.log(`\n🍷 Palate IQ Card Generator`);
  console.log(`   Domain: ${domain} (${config.prefix})`);
  console.log(`   Levels: ${startLevel}-${endLevel}`);
  console.log(`   Existing: ${existing.length} cards`);

  // Calculate cards needed per level range
  let totalNeeded = 0;
  for (let l = startLevel; l <= endLevel; l++) {
    totalNeeded += Math.ceil(config.target * LEVEL_CONFIG[l].cards);
  }
  console.log(`   Target new: ~${totalNeeded} cards\n`);

  // Generate in batches of ~25 cards per API call
  const BATCH_SIZE = 15;
  let allNew = [];
  let batchNum = 0;

  for (let l = startLevel; l <= endLevel; l += 2) {
    const lEnd = Math.min(l + 1, endLevel);
    let needed = 0;
    for (let ll = l; ll <= lEnd; ll++) {
      needed += Math.ceil(config.target * LEVEL_CONFIG[ll].cards);
    }

    // Split into batches
    while (needed > 0) {
      const size = Math.min(BATCH_SIZE, needed);
      batchNum++;
      console.log(`   Batch ${batchNum}: levels ${l}-${lEnd}, ${size} cards...`);

      try {
        const cards = await generateBatch(domain, l, lEnd, size, existingQuestions.concat(allNew.map(c => c.question)));
        const errors = validateBatch(cards, domain, existingQuestions.concat(allNew.map(c => c.question)));

        if (errors.length > 0) {
          console.log(`   ⚠️  ${errors.length} validation issues:`);
          errors.slice(0, 5).forEach(e => console.log(`      - ${e}`));
          if (errors.length > 5) console.log(`      ... and ${errors.length - 5} more`);
        }

        // Keep cards that pass basic checks (have id, question, and correct format)
        const valid = cards.filter(c => c.id && c.question && c.domain === domain);
        allNew.push(...valid);
        console.log(`   ✓  Generated ${valid.length} valid cards (${allNew.length} total)\n`);

        needed -= size;
      } catch (err) {
        console.log(`   ✗  Batch failed: ${err.message}`);
        if (err.message.includes('rate')) {
          console.log('   Waiting 60s for rate limit...');
          await new Promise(r => setTimeout(r, 60000));
        } else {
          needed -= size; // Skip this batch on non-rate errors
        }
      }

      // Small delay between batches
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  // Merge with existing and write
  const merged = existing.concat(allNew);
  // Re-number IDs sequentially
  merged.forEach((c, i) => {
    c.id = `${config.prefix}-${String(i + 1).padStart(3, '0')}`;
  });

  fs.writeFileSync(outFile, JSON.stringify(merged, null, 2));
  console.log(`\n✅ Done! ${merged.length} total cards written to ${outFile}`);

  // Summary
  const levels = {};
  merged.forEach(c => levels[c.level] = (levels[c.level] || 0) + 1);
  console.log('\nBy level:', JSON.stringify(levels));
  const formats = {};
  merged.forEach(c => formats[c.format] = (formats[c.format] || 0) + 1);
  console.log('By format:', JSON.stringify(formats));
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
