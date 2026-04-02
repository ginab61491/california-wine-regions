// config.js — Environment configuration for daily wine email pipeline
// Set these as environment variables (GitHub Secrets) or in a .env file

// Load .env from parent directory if running locally
const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [key, ...val] = line.split('=');
    if (key && !key.startsWith('#') && val.length) {
      process.env[key.trim()] = val.join('=').trim();
    }
  });
}

module.exports = {
  // Anthropic (Claude) API
  ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY || 'YOUR_ANTHROPIC_API_KEY',
  CLAUDE_MODEL: 'claude-sonnet-4-6',

  // Mailchimp API
  MAILCHIMP_API_KEY: process.env.MAILCHIMP_API_KEY || '',
  MAILCHIMP_SERVER: process.env.MAILCHIMP_SERVER || 'us11',
  MAILCHIMP_LIST_ID: process.env.MAILCHIMP_LIST_ID || '02a4dd50dd',

  // From address (must be verified in Mailchimp)
  // Note: gina@somm-plicity.com is NOT verified in Mailchimp yet.
  // Using gmail until somm-plicity.com domain is authenticated in Mailchimp.
  FROM_NAME: 'Sommplicity',
  FROM_EMAIL: 'gina.biernacki@gmail.com',
  REPLY_TO: 'gina.biernacki@gmail.com',

  // Topics — must match the data-topic values in the signup form
  TOPICS: [
    { id: 'grapes',    name: 'Grape Varieties',    prompt: 'a specific grape variety — its origins, flavor profile, where it grows best, and what to look for when tasting' },
    { id: 'regions',   name: 'Wine Regions',        prompt: 'a specific wine region — its climate, terroir, key producers, signature styles, and what makes it unique' },
    { id: 'tasting',   name: 'Tasting Technique',   prompt: 'a wine tasting technique or sensory skill — how to identify aromas, assess structure, or improve blind tasting' },
    { id: 'pairing',   name: 'Food Pairing',        prompt: 'a food and wine pairing principle — why certain combinations work, how to match weight/acidity/tannin with dishes' },
    { id: 'winemaking',name: 'Winemaking',          prompt: 'a winemaking technique or process — fermentation, oak aging, malolactic conversion, or harvest decisions and how they shape the wine' },
    { id: 'history',   name: 'Wine History',         prompt: 'a fascinating moment in wine history — a pivotal event, legendary producer, or cultural tradition that shaped how we drink today' },
    { id: 'buying',    name: 'Buying & Value',       prompt: 'practical wine buying advice — how to find great value, read labels, navigate a wine list, or spot hidden gems under $25' },
    { id: 'cellar',    name: 'Cellaring & Aging',    prompt: 'wine storage and aging — which wines improve with age, proper cellaring conditions, or when to open a special bottle' },
    { id: 'exam',      name: 'Exam Prep (CMS/WSET)', prompt: 'a study topic for CMS or WSET exams — key facts about appellations, classification systems, or the systematic approach to tasting' },
  ],

  // Levels
  LEVELS: [
    { id: 'beginner',     name: 'Beginner',           prompt: 'Someone new to wine. Use simple language, avoid jargon, explain terms when used. Make it welcoming and fun. Think "your first wine class."' },
    { id: 'intermediate', name: 'Intermediate',        prompt: 'Someone who knows the basics and wants to go deeper. Use proper wine terminology, discuss terroir and technique. Think "WSET Level 2 student."' },
    { id: 'advanced',     name: 'Advanced / Studying', prompt: 'A serious wine student or working professional. Be precise with appellations, producer names, and technical detail. Think "CMS Certified or WSET Level 3 prep."' },
  ],

  // Trusted sources to reference
  TRUSTED_SOURCES: [
    'GuildSomm',
    'Wine Scholar Guild',
    'The Oxford Companion to Wine',
    'JancisRobinson.com',
    'Wine Folly',
    'Decanter',
    'Wine Spectator',
    'The World Atlas of Wine',
  ],
};
