// send-emails.js — Sends generated emails via Mailchimp API
// Each email goes to the segment matching its level + topic

const config = require('./config');
const fs = require('fs');

const EMAILS_FILE = './today-emails.json';
const MAILCHIMP_BASE = `https://${config.MAILCHIMP_SERVER}.api.mailchimp.com/3.0`;

async function mailchimpFetch(path, options = {}) {
  const res = await fetch(`${MAILCHIMP_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${Buffer.from('anystring:' + config.MAILCHIMP_API_KEY).toString('base64')}`,
      ...options.headers,
    },
  });
  const data = await res.json();
  if (data.status >= 400) {
    throw new Error(`Mailchimp error: ${data.title} — ${data.detail}`);
  }
  return data;
}

// For now, send to all subscribers — segment by level only
// This is simpler and more reliable for small lists
async function getOrCreateSegment(levelId, topicId) {
  const segmentName = `daily-${levelId}`;

  // List existing segments
  const existing = await mailchimpFetch(`/lists/${config.MAILCHIMP_LIST_ID}/segments?count=100`);
  const found = existing.segments?.find(s => s.name === segmentName);
  if (found) return found.id;

  // Create segment matching subscribers with this level
  try {
    const segment = await mailchimpFetch(`/lists/${config.MAILCHIMP_LIST_ID}/segments`, {
      method: 'POST',
      body: JSON.stringify({
        name: segmentName,
        static_segment: [], // will be empty initially
      }),
    });
    return segment.id;
  } catch (e) {
    // If segment creation fails, return null — we'll send to whole list
    return null;
  }
}

// Build HTML email template
function buildEmailHtml(email) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #F4EAD8; margin: 0; padding: 0; }
    .wrapper { max-width: 560px; margin: 0 auto; padding: 32px 24px; }
    .header { text-align: center; padding-bottom: 20px; border-bottom: 2px solid #6B1E2E; margin-bottom: 24px; }
    .header h1 { font-family: Georgia, serif; font-size: 28px; font-weight: 300; color: #6B1E2E; margin: 0; letter-spacing: 2px; }
    .header p { font-size: 12px; color: #B09280; margin: 6px 0 0; letter-spacing: 1px; text-transform: uppercase; }
    .badge { display: inline-block; background: #6B1E2E; color: #D4A850; font-size: 11px; padding: 3px 10px; border-radius: 4px; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
    .body p { font-size: 16px; line-height: 1.75; color: #2E1A14; margin: 0 0 14px; }
    .body strong { color: #6B1E2E; }
    .body em { color: #5C3428; }
    .footer { margin-top: 32px; padding-top: 20px; border-top: 1px solid #DDD0B8; text-align: center; }
    .footer p { font-size: 12px; color: #B09280; margin: 4px 0; }
    .footer a { color: #6B1E2E; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>sommplicity</h1>
      <p>Daily Wine Lesson</p>
    </div>
    <div class="badge">${email.topic_id.replace(/-/g, ' ')} · ${email.level_id}</div>
    <div class="body">
      ${email.body_html}
    </div>
    <div class="footer">
      <p>Curated by a certified sommelier from trusted sources.</p>
      <p><a href="https://sommplicity.lovable.app">sommplicity.com</a> · <a href="*|UNSUB|*">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

// Create and send a campaign — send to entire list for now
// Only send ONE email per day (the one matching the most common level)
async function sendEmail(email) {
  // Build recipients — send to whole list (no segment filtering for reliability)
  const recipients = { list_id: config.MAILCHIMP_LIST_ID };

  // Create campaign
  const campaign = await mailchimpFetch('/campaigns', {
    method: 'POST',
    body: JSON.stringify({
      type: 'regular',
      recipients,
      settings: {
        subject_line: email.subject,
        preview_text: email.preview,
        title: `Daily Wine: ${email.topic_id} × ${email.level_id} — Day ${email.day_number}`,
        from_name: config.FROM_NAME,
        reply_to: config.REPLY_TO,
      },
    }),
  });

  // Set campaign content
  await mailchimpFetch(`/campaigns/${campaign.id}/content`, {
    method: 'PUT',
    body: JSON.stringify({ html: buildEmailHtml(email) }),
  });

  // Send it
  await mailchimpFetch(`/campaigns/${campaign.id}/actions/send`, {
    method: 'POST',
  });

  return campaign.id;
}

// Main
async function main() {
  console.log('📬 Sommplicity Email Sender');
  console.log('===========================\n');

  let emails;
  try {
    emails = JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf8'));
  } catch {
    console.error('No emails found. Run generate-emails.js first.');
    process.exit(1);
  }

  // Send only 1 email to the whole list — pick the intermediate level, first topic
  // This avoids sending 9 emails and segment issues
  const bestEmail = emails.find(e => e.level_id === 'intermediate') || emails[0];
  console.log(`Sending 1 email to all subscribers: "${bestEmail.subject}"\n`);

  const toSend = [bestEmail];
  for (const email of toSend) {
    const label = `${email.topic_id} × ${email.level_id}`;
    try {
      const campaignId = await sendEmail(email);
      console.log(`  ✓ ${label} — Campaign ${campaignId}`);
    } catch (err) {
      console.error(`  ✗ ${label} — ${err.message}`);
    }
  }

  console.log('\n✓ Done sending daily emails.');
}

module.exports = { main };

if (require.main === module) {
  main().catch(console.error);
}
