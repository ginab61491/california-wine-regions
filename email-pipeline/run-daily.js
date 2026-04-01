// run-daily.js — Orchestrator: generate emails then send them
// This is what GitHub Actions calls each day

const { main: generate } = require('./generate-emails');
const { main: send } = require('./send-emails');

async function run() {
  const startTime = Date.now();
  console.log(`\n🍷 Daily Wine Email Pipeline — ${new Date().toISOString()}\n`);

  // Step 1: Generate
  console.log('STEP 1: Generating emails with Claude...\n');
  await generate();

  // Step 2: Send
  console.log('\nSTEP 2: Sending via Mailchimp...\n');
  await send();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n✓ Pipeline complete in ${elapsed}s`);
}

run().catch(err => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
