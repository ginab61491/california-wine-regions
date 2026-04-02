require('dotenv').config();
const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const cors = require('cors');
const compression = require('compression');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// GZIP compression for all responses
app.use(compression());

app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Static assets with cache headers (CSS, JS, images cached 7 days; HTML no-cache)
app.use(express.static(path.join(__dirname, 'public'), {
  maxAge: '7d',
  setHeaders(res, filePath) {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  },
}));

const SYSTEM_PROMPT = `You are an expert wine sommelier and educator with decades of experience.
You have deep knowledge of:
- Wine regions around the world (France, Italy, Spain, Germany, USA, Argentina, Chile, Australia, New Zealand, South Africa, and beyond)
- Grape varieties — both major and obscure — and their flavor profiles
- Winemaking techniques: fermentation, aging, oak treatment, natural wine, biodynamic methods
- Tasting notes: how to describe color, aroma, palate, and finish
- Food and wine pairing principles
- Wine vintages and how climate affects wine quality
- Wine service: temperature, glassware, decanting
- Wine regions' terroir, soil types, and microclimates

Respond in a warm, educational, and enthusiastic tone. Keep answers focused and informative.
When relevant, suggest related topics the user might want to explore.
Format responses with clear structure when helpful, but keep conversational for simple questions.
Never refuse a wine question — even basic ones deserve a thoughtful answer.`;

// SSE streaming chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.map(m => ({ role: m.role, content: m.content })),
    });

    stream.on('text', (text) => {
      if (!res.writableEnded) res.write(`data: ${JSON.stringify({ text })}\n\n`);
    });

    stream.on('error', (err) => {
      console.error('Stream error:', err.message);
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.end();
      }
    });

    stream.on('end', () => {
      if (!res.writableEnded) {
        res.write('data: [DONE]\n\n');
        res.end();
      }
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.write(`data: ${JSON.stringify({ error: 'Failed to connect to AI service. Check your API key.' })}\n\n`);
    res.end();
  }
});

// Wine analyzer endpoint — returns structured JSON descriptor analysis
app.post('/api/analyze-wine', async (req, res) => {
  const { wine } = req.body;

  if (!wine || !wine.name) {
    return res.status(400).json({ error: 'wine.name is required' });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured on server' });
  }

  const wineLabel = [wine.vintage, wine.name, wine.producer ? `by ${wine.producer}` : ''].filter(Boolean).join(' ');

  const prompt = `You are an expert wine sommelier. Analyze the wine: ${wineLabel}.

Based on how this wine is consistently described by trusted critics (Wine Spectator, Decanter, Robert Parker, Vinous, Jancis Robinson, James Suckling), explain why someone might love this wine. If the wine is not widely documented, draw on your deep sommelier knowledge of the grape variety, region, and style.

Respond ONLY with valid JSON — no markdown code fences, no commentary, just the raw JSON object:
{
  "intro": "2 sentences max. State what this wine is and why people love it. Plain language, no poetry.",
  "descriptors": [
    {
      "name": "2–4 word attribute name (e.g. 'Silky Tannins', 'Bright Acidity', 'Dark Fruit')",
      "category": "one of: texture, acidity, fruit, finish, aroma, body, oak, terroir, sweetness",
      "what_it_is": "1 sentence. Plain factual explanation of what causes this attribute. No metaphors.",
      "how_it_feels": "1 sentence. Concrete sensory description — what you actually taste or feel. No poetry.",
      "in_this_wine": "1 sentence. How critics specifically describe this in this wine."
    }
  ],
  "great_vintages": [list of years as integers — the best, most acclaimed vintages, up to 5],
  "notable_vintages": [list of years as integers — solid but not legendary vintages worth knowing, up to 4],
  "storage": {
    "drink_from": year as integer (earliest recommended drinking year from today),
    "drink_by": year as integer (latest recommended drinking year),
    "note": "1 sentence. Plain advice on when and why to open it."
  }
}

Include exactly 6 descriptors. Choose the most defining attributes. Only include descriptors well-documented across trusted sources.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const raw = message.content[0].text.trim();

    // Strip any accidental markdown code fences
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    const data = JSON.parse(cleaned);

    res.json(data);
  } catch (err) {
    console.error('Analyze wine error:', err);
    if (err instanceof SyntaxError) {
      return res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
    }
    res.status(500).json({ error: 'Failed to analyze wine. Check your API key.' });
  }
});

// Scan wine bottle photos — uses Claude vision to identify and research bottles
app.post('/api/scan-bottles', async (req, res) => {
  const { images } = req.body; // array of base64 data URLs

  if (!images || !images.length) {
    return res.status(400).json({ error: 'At least one image is required' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });
  }

  // Build content blocks: images + text prompt
  const content = [];
  for (const img of images.slice(0, 5)) {
    // Handle various data URL formats: image/jpeg, image/png, image/webp, image/heic, etc.
    const match = img.match(/^data:(image\/[^;,]+)[^,]*,(.+)$/);
    if (match) {
      // Normalize media type (Claude accepts jpeg, png, gif, webp)
      let mediaType = match[1].toLowerCase();
      if (mediaType === 'image/jpg') mediaType = 'image/jpeg';
      if (mediaType === 'image/heic' || mediaType === 'image/heif') mediaType = 'image/jpeg'; // HEIC gets re-encoded by browser
      content.push({
        type: 'image',
        source: { type: 'base64', media_type: mediaType, data: match[2] }
      });
    }
  }
  if (content.length === 0) {
    return res.status(400).json({ error: 'Could not process the uploaded images. Please try JPG or PNG format.' });
  }
  content.push({
    type: 'text',
    text: `You are a certified sommelier. Identify every wine bottle visible in the image(s).

For EACH bottle, provide detailed information. Respond ONLY with valid JSON — no markdown fences:
{
  "bottles": [
    {
      "name": "Full wine name as it appears on the label",
      "producer": "Producer / winery name",
      "vintage": "Year if visible, or 'NV' for non-vintage, or null if unreadable",
      "region": "Wine region and country (e.g. Napa Valley, California)",
      "grape": "Primary grape variety or blend",
      "type": "Red, White, Rosé, Sparkling, or Dessert",
      "tasting_notes": "2-3 sentences describing typical aromas and flavors from professional reviews. Reference style from trusted critics (Wine Spectator, Decanter, Robert Parker, Vinous, Jancis Robinson).",
      "food_pairing": "2-3 specific pairing suggestions",
      "price_range": "Approximate retail price range in USD (e.g. '$25-35', '$60-80')",
      "rating": "Average critic score if well-known (e.g. '92 pts Wine Spectator'), or null",
      "where_to_buy": "1-2 common retailers or sources (e.g. 'Wine.com, Total Wine, winery direct')",
      "sommelier_note": "1 sentence — a personal, expert-level insight about this wine that would be useful to know"
    }
  ]
}

If you cannot identify a bottle clearly, include it with what you can determine and set unknown fields to null. Be specific and accurate — only reference information you are confident about.`
  });

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      messages: [{ role: 'user', content }],
    });

    const raw = message.content[0].text.trim();
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    let data;
    try {
      data = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('JSON parse failed, raw response:', raw.substring(0, 200));
      // Try to extract partial JSON
      const match = cleaned.match(/\{"bottles"\s*:\s*\[[\s\S]*\]\s*\}/);
      if (match) {
        data = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ error: 'Could not identify bottles. Try a clearer photo of the label.' });
      }
    }
    res.json(data);
  } catch (err) {
    console.error('Scan bottles error:', err.message || err);
    if (err.status === 401) {
      return res.status(500).json({ error: 'API key issue. Please contact support.' });
    }
    if (err.status === 429) {
      return res.status(500).json({ error: 'Too many requests. Please wait a moment and try again.' });
    }
    res.status(500).json({ error: 'Failed to scan bottles. Please try again.' });
  }
});

// Study tools — generate flashcards, quizzes, or podcast scripts
const STUDY_SYSTEM = `You are a certified sommelier and wine educator. All responses must be:
- Factual and verifiable across multiple trusted wine sources (GuildSomm, The Oxford Companion to Wine, Wine Scholar Guild, Jancis Robinson, WSET textbooks)
- At the level expected on the Court of Master Sommeliers Certified Sommelier exam
- No creative embellishment, speculation, or opinion — only established wine facts
- If a fact cannot be confirmed across multiple sources, do not include it`;

app.post('/api/study/flashcards', async (req, res) => {
  const { category, topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      temperature: 0,
      system: STUDY_SYSTEM,
      messages: [{ role: 'user', content: `Generate 12 flashcards for studying ${category || 'wine topic'}: "${topic}" at Certified Sommelier exam level. Respond ONLY with valid JSON:\n{"cards":[{"front":"Question or term","back":"Answer — concise, factual, exam-level detail"}]}` }],
    });
    const raw = message.content[0].text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Flashcard error:', err);
    res.status(500).json({ error: 'Failed to generate flashcards' });
  }
});

app.post('/api/study/quiz', async (req, res) => {
  const { category, topic } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      temperature: 0,
      system: STUDY_SYSTEM,
      messages: [{ role: 'user', content: `Generate 8 multiple-choice questions about ${category || 'wine topic'}: "${topic}" at Certified Sommelier exam level. Each question should have 4 options with exactly one correct answer. Respond ONLY with valid JSON:\n{"questions":[{"question":"...","options":["A","B","C","D"],"correct":0,"explanation":"1 sentence explaining the correct answer with source reference"}]}` }],
    });
    const raw = message.content[0].text.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Quiz error:', err);
    res.status(500).json({ error: 'Failed to generate quiz' });
  }
});

app.post('/api/study/podcast', async (req, res) => {
  const { category, topic, duration, style } = req.body;
  if (!topic) return res.status(400).json({ error: 'Topic is required' });
  const wordCount = (duration || 10) * 150; // ~150 words per minute
  const styleDesc = { lecture: 'a focused educational lecture by a sommelier instructor', conversational: 'a conversation between two sommelier hosts discussing the topic', 'quiz-show': 'a quiz-show format where a host asks questions and explains answers' }[style] || 'an educational lecture';
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      temperature: 0,
      system: STUDY_SYSTEM,
      messages: [{ role: 'user', content: `Write a ${duration || 10}-minute wine education podcast script (~${wordCount} words) about ${category || 'wine topic'}: "${topic}" in the style of ${styleDesc}. Target audience: Certified Sommelier exam candidates. Be detailed, factual, and engaging. Include specific appellations, producers, and technical details. Format as plain text with speaker labels if conversational. Do not include stage directions or sound effects.` }],
    });
    res.json({ script: message.content[0].text.trim(), topic, duration, style });
  } catch (err) {
    console.error('Podcast error:', err);
    res.status(500).json({ error: 'Failed to generate podcast' });
  }
});

// Subscribe to daily wine emails — adds contact to Mailchimp
app.post('/api/subscribe', async (req, res) => {
  const { email, name, level, topics } = req.body;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' });
  }

  const MC_KEY = process.env.MAILCHIMP_API_KEY || '';
  const MC_SERVER = process.env.MAILCHIMP_SERVER || 'us11';
  const MC_LIST = process.env.MAILCHIMP_LIST_ID || '02a4dd50dd';

  try {
    const response = await fetch(`https://${MC_SERVER}.api.mailchimp.com/3.0/lists/${MC_LIST}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from('x:' + MC_KEY).toString('base64')}`,
      },
      body: JSON.stringify({
        email_address: email,
        status: 'subscribed',
        merge_fields: {
          FNAME: name || '',
          LEVEL: level || '',
          TOPICS: (topics || []).join(','),
        },
      }),
    });

    const data = await response.json();

    if (data.status === 'subscribed' || data.status === 400) {
      res.json({ ok: true });
    } else {
      res.status(400).json({ error: data.title || 'Subscription failed' });
    }
  } catch (err) {
    console.error('Mailchimp error:', err);
    res.status(500).json({ error: 'Failed to subscribe. Try again later.' });
  }
});

// ── Wine Diary — per-user storage ─────────────────────
const fs = require('fs');
const DIARY_DIR = path.join(__dirname, 'data', 'diaries');
if (!fs.existsSync(DIARY_DIR)) fs.mkdirSync(DIARY_DIR, { recursive: true });

function diaryPath(email) {
  // Sanitize email to safe filename
  const safe = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
  return path.join(DIARY_DIR, safe + '.json');
}

// Get diary entries
app.get('/api/diary', (req, res) => {
  const email = req.query.email;
  if (!email) return res.status(400).json({ error: 'email required' });
  const file = diaryPath(email);
  try {
    if (fs.existsSync(file)) {
      const entries = JSON.parse(fs.readFileSync(file, 'utf8'));
      res.json(entries);
    } else {
      res.json([]);
    }
  } catch {
    res.json([]);
  }
});

// Save diary entries
app.post('/api/diary', (req, res) => {
  const { email, entries } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });
  if (!Array.isArray(entries)) return res.status(400).json({ error: 'entries array required' });
  try {
    fs.writeFileSync(diaryPath(email), JSON.stringify(entries, null, 2));
    res.json({ ok: true });
  } catch (err) {
    console.error('Diary save error:', err);
    res.status(500).json({ error: 'Failed to save diary' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🍷 Wine Education Site running at http://localhost:${PORT}`);
  console.log(`   API key configured: ${process.env.ANTHROPIC_API_KEY ? 'Yes' : 'NO — set ANTHROPIC_API_KEY in .env'}\n`);
});
