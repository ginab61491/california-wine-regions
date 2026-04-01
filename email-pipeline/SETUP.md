# Daily Wine Email Pipeline — Setup Guide

## How It Works

Every day at 6 AM Pacific, a GitHub Action:
1. Picks 3 topics (rotates through all 9 so content stays fresh)
2. Generates 9 emails via Claude API (3 topics × 3 levels = 9 emails)
3. Sends each email to the matching Mailchimp segment

Subscribers only receive emails matching their **level** AND one of their **selected topics**.

**Cost: ~$5-8/month** for Claude API. Mailchimp is free up to 500 subscribers.

---

## Step 1: Mailchimp Setup

1. Create a free account at [mailchimp.com](https://mailchimp.com)
2. Create an **Audience** (your subscriber list)
3. Add these **merge fields** to your audience (Audience → Settings → Audience fields):
   - `LEVEL` (text) — stores: beginner, intermediate, or advanced
   - `TOPICS` (text) — stores comma-separated topic IDs like: grapes,regions,tasting
   - `FNAME` (text) — first name (usually exists by default)
4. Get your **API key**: Account → Extras → API keys → Create a key
5. Get your **List ID**: Audience → Settings → Audience name and defaults (it's the alphanumeric string)
6. Note your **server prefix**: it's the part after the dash in your API key (e.g. if key ends in `-us21`, server is `us21`)

## Step 2: Anthropic API Setup

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an account and add $5 in credits
3. Go to API Keys → Create key

## Step 3: GitHub Secrets

In your GitHub repo: Settings → Secrets and variables → Actions → New repository secret

Add these 4 secrets:
- `ANTHROPIC_API_KEY` — your Claude API key
- `MAILCHIMP_API_KEY` — your Mailchimp API key
- `MAILCHIMP_SERVER` — e.g. `us21`
- `MAILCHIMP_LIST_ID` — your audience/list ID

## Step 4: Connect the Signup Form

Update `public/js/daily-wine.js` to POST subscriber data to Mailchimp when they subscribe.
Replace the `localStorage.setItem(...)` block with a fetch call to your server or use
Mailchimp's embedded form action URL.

Simple approach — add a server endpoint in `server.js`:

```js
app.post('/api/subscribe', express.json(), async (req, res) => {
  const { email, name, level, topics } = req.body;
  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER;
  const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;

  await fetch(`https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from('x:' + MAILCHIMP_API_KEY).toString('base64')}`,
    },
    body: JSON.stringify({
      email_address: email,
      status: 'subscribed',
      merge_fields: {
        FNAME: name,
        LEVEL: level,
        TOPICS: topics.join(','),
      },
    }),
  });

  res.json({ ok: true });
});
```

Then in `daily-wine.js`, replace localStorage with:
```js
fetch('/api/subscribe', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(subscription),
});
```

## Step 5: Test

1. Run locally first: `cd email-pipeline && node run-daily.js`
2. Check the output — it should generate 9 emails and print their subjects
3. Push to GitHub and trigger the workflow manually (Actions tab → Daily Wine Email → Run workflow)

## Step 6: You're Done!

The pipeline runs automatically every morning. Subscribers get personalized daily wine lessons based on their level and interests. You never need to touch it.
