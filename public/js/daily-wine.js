// daily-wine.js — Daily Wine Email subscription form

document.addEventListener('DOMContentLoaded', () => {
  let selectedLevel = null;
  const selectedTopics = new Set();

  // Level selection (single select)
  document.querySelectorAll('.dw-level-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.dw-level-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedLevel = btn.dataset.level;
    });
  });

  // Topic toggles (multi select)
  document.querySelectorAll('.dw-topic-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const topic = btn.dataset.topic;
      if (selectedTopics.has(topic)) {
        selectedTopics.delete(topic);
        btn.classList.remove('active');
      } else {
        selectedTopics.add(topic);
        btn.classList.add('active');
      }
    });
  });

  // Subscribe
  const subBtn = document.getElementById('dw-subscribe-btn');
  if (subBtn) {
    subBtn.addEventListener('click', async () => {
      const email = document.getElementById('dw-email').value.trim();
      const name = document.getElementById('dw-name').value.trim();

      if (!email || !email.includes('@')) {
        alert('Please enter a valid email address.');
        return;
      }
      if (!selectedLevel) {
        alert('Please select your wine knowledge level.');
        return;
      }

      // Disable button while submitting
      subBtn.disabled = true;
      subBtn.textContent = 'Subscribing...';

      try {
        const res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            name,
            level: selectedLevel,
            topics: [...selectedTopics],
          }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Subscription failed');
        }
      } catch (err) {
        subBtn.disabled = false;
        subBtn.textContent = 'Subscribe — It\'s Free';
        alert('Could not subscribe: ' + err.message);
        return;
      }

      // Save locally so account page can read it
      localStorage.setItem('sommplicity_daily_sub', JSON.stringify({
        email, name, level: selectedLevel, topics: [...selectedTopics]
      }));

      // Show success
      const formSection = document.querySelector('.dailywine-form-section');
      formSection.innerHTML = `
        <div class="dw-success">
          <h2>You're Subscribed</h2>
          <p>Welcome${name ? ', ' + name : ''}! You'll start receiving daily bite-size wine lessons at <strong>${email}</strong>, tailored to your <strong>${selectedLevel}</strong> level.</p>
          <p style="margin-top:12px;font-size:0.8rem;color:var(--ink-xlight)">Each email is curated by a certified sommelier from trusted sources like GuildSomm, Wine Scholar Guild, The Oxford Companion to Wine, and more.</p>
        </div>
      `;
    });
  }
});
