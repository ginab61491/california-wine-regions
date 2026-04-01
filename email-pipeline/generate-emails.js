// generate-emails.js — Uses Claude API to generate daily wine emails
// Generates one email per topic × level combination for today's rotation

const config = require('./config');

const TOPIC_HISTORY_FILE = './topic-history.json';
const OUTPUT_FILE = './today-emails.json';
const fs = require('fs');

// Pick today's topics (rotate through all, 3 per day)
function pickTodaysTopics() {
  let history = [];
  try { history = JSON.parse(fs.readFileSync(TOPIC_HISTORY_FILE, 'utf8')); } catch {}

  // Sort topics by how recently they were used (least recent first)
  const sorted = [...config.TOPICS].sort((a, b) => {
    const aLast = history.lastIndexOf(a.id);
    const bLast = history.lastIndexOf(b.id);
    return aLast - bLast; // -1 (never used) comes first
  });

  const picked = sorted.slice(0, 3);

  // Update history
  history.push(...picked.map(t => t.id));
  if (history.length > 50) history = history.slice(-50);
  fs.writeFileSync(TOPIC_HISTORY_FILE, JSON.stringify(history, null, 2));

  return picked;
}

// Generate a single email via Claude API
async function generateEmail(topic, level, dayNumber) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: config.CLAUDE_MODEL,
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `You are a certified sommelier writing a short daily wine education email for the "Sommplicity" newsletter.

TODAY'S TOPIC CATEGORY: ${topic.name}
Write about: ${topic.prompt}

READER LEVEL: ${level.name}
Tone guidance: ${level.prompt}

RULES:
- Keep it to 150-250 words (2-3 minute read)
- Pick ONE specific, interesting subtopic within the category (not a broad overview)
- Start with a compelling hook or surprising fact
- Include one actionable takeaway or "try this" suggestion
- Only use information that would be found in these trusted sources: ${config.TRUSTED_SOURCES.join(', ')}
- Do NOT make up producer names, statistics, or facts — be accurate
- Write in a warm, knowledgeable tone — like a friend who happens to be a sommelier
- Do NOT use the word "delve" or "journey" or "elevate"
- End with a one-line sign-off like "Until tomorrow, 🍷 Gina"

FORMAT your response as JSON:
{
  "subject": "catchy email subject line (under 60 chars)",
  "preview": "preview text for inbox (under 90 chars)",
  "body_html": "the email body as simple HTML (use <p>, <strong>, <em> tags only)",
  "topic_id": "${topic.id}",
  "level_id": "${level.id}",
  "day_number": ${dayNumber}
}

Return ONLY valid JSON, no other text.`
      }],
    }),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Claude API error: ${data.error.message}`);
  }

  const text = data.content[0].text.trim();
  // Parse JSON from response (handle possible markdown code fences)
  const jsonStr = text.replace(/^```json?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(jsonStr);
}

// Main: generate all emails for today
async function main() {
  console.log('🍷 Sommplicity Daily Wine Email Generator');
  console.log('=========================================\n');

  const topics = pickTodaysTopics();
  console.log(`Today's topics: ${topics.map(t => t.name).join(', ')}\n`);

  // Calculate day number (days since Jan 1 2026)
  const dayNumber = Math.floor((Date.now() - new Date('2026-01-01').getTime()) / 86400000);

  const emails = [];

  for (const topic of topics) {
    for (const level of config.LEVELS) {
      console.log(`  Generating: ${topic.name} × ${level.name}...`);
      try {
        const email = await generateEmail(topic, level, dayNumber);
        emails.push(email);
        console.log(`    ✓ Subject: "${email.subject}"`);
      } catch (err) {
        console.error(`    ✗ Error: ${err.message}`);
      }
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(emails, null, 2));
  console.log(`\n✓ Generated ${emails.length} emails → ${OUTPUT_FILE}`);
  return emails;
}

module.exports = { main, generateEmail, pickTodaysTopics };

if (require.main === module) {
  main().catch(console.error);
}
