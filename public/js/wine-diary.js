// wine-diary.js — Personal wine tasting journal (syncs to account)

document.addEventListener('DOMContentLoaded', () => {
  let selectedRating = 0;
  let photoData = null;
  let entries = [];

  function getUserEmail() {
    try {
      const user = JSON.parse(localStorage.getItem('sommplicity_user') || 'null');
      return user ? user.email : null;
    } catch { return null; }
  }

  // Load entries — from server if signed in, otherwise localStorage
  async function loadEntries() {
    const email = getUserEmail();
    if (email) {
      try {
        const res = await fetch('/api/diary?email=' + encodeURIComponent(email));
        if (res.ok) {
          entries = await res.json();
          // Also cache locally
          localStorage.setItem('sommplicity_diary', JSON.stringify(entries));
          renderEntries();
          return;
        }
      } catch {}
    }
    // Fallback to localStorage
    try { entries = JSON.parse(localStorage.getItem('sommplicity_diary') || '[]'); }
    catch { entries = []; }
    renderEntries();
  }

  // Save entries — to server if signed in, always to localStorage
  async function saveEntries() {
    localStorage.setItem('sommplicity_diary', JSON.stringify(entries));
    const email = getUserEmail();
    if (email) {
      try {
        await fetch('/api/diary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, entries })
        });
      } catch {}
    }
  }

  // Star rating
  document.querySelectorAll('.diary-star').forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.rating);
      document.querySelectorAll('.diary-star').forEach(s => {
        s.classList.toggle('active', parseInt(s.dataset.rating) <= selectedRating);
      });
    });
    star.addEventListener('mouseenter', () => {
      const hoverVal = parseInt(star.dataset.rating);
      document.querySelectorAll('.diary-star').forEach(s => {
        s.style.color = parseInt(s.dataset.rating) <= hoverVal ? 'var(--gold-light)' : '';
      });
    });
    star.addEventListener('mouseleave', () => {
      document.querySelectorAll('.diary-star').forEach(s => { s.style.color = ''; });
    });
  });

  // Photo upload
  const photoInput = document.getElementById('diary-photo');
  const photoPreview = document.getElementById('diary-photo-preview');
  const photoPlaceholder = document.getElementById('diary-photo-placeholder');

  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      photoData = ev.target.result;
      photoPreview.src = photoData;
      photoPreview.style.display = 'block';
      photoPlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
  });

  // Set default date to today
  const dateInput = document.getElementById('diary-date');
  dateInput.value = new Date().toISOString().split('T')[0];

  // Submit
  document.getElementById('diary-submit-btn').addEventListener('click', async () => {
    const name = document.getElementById('diary-wine-name').value.trim();
    if (!name) { alert('Please enter a wine name.'); return; }

    const entry = {
      id: Date.now(),
      name,
      producer: document.getElementById('diary-producer').value.trim(),
      region: document.getElementById('diary-region').value.trim(),
      date: dateInput.value,
      rating: selectedRating,
      occasion: document.getElementById('diary-occasion').value.trim(),
      notes: document.getElementById('diary-notes').value.trim(),
      review: document.getElementById('diary-review').value.trim(),
      photo: photoData
    };

    entries.unshift(entry);
    await saveEntries();
    renderEntries();
    resetForm();
  });

  function resetForm() {
    document.getElementById('diary-wine-name').value = '';
    document.getElementById('diary-producer').value = '';
    document.getElementById('diary-region').value = '';
    document.getElementById('diary-occasion').value = '';
    document.getElementById('diary-notes').value = '';
    document.getElementById('diary-review').value = '';
    dateInput.value = new Date().toISOString().split('T')[0];
    selectedRating = 0;
    document.querySelectorAll('.diary-star').forEach(s => s.classList.remove('active'));
    photoData = null;
    photoPreview.style.display = 'none';
    photoPlaceholder.style.display = 'block';
    photoInput.value = '';
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function renderEntries() {
    const container = document.getElementById('diary-entries');
    const title = document.getElementById('diary-entries-title');
    const empty = document.getElementById('diary-empty');

    if (!entries.length) {
      title.style.display = 'none';
      empty.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    title.style.display = 'block';
    empty.style.display = 'none';

    container.innerHTML = entries.map(e => `
      <div class="diary-entry" data-id="${e.id}">
        <div class="diary-entry-photo">
          ${e.photo
            ? `<img src="${e.photo}" alt="${e.name}" />`
            : `<span class="diary-entry-photo-empty">🍷</span>`
          }
        </div>
        <div class="diary-entry-content">
          <div class="diary-entry-top">
            <div>
              <div class="diary-entry-name">${e.name}</div>
              <div class="diary-entry-meta">${[e.producer, e.region].filter(Boolean).join(' · ')}</div>
            </div>
            <span class="diary-entry-date">${formatDate(e.date)}</span>
          </div>
          ${e.rating ? `<div class="diary-entry-stars">${'★'.repeat(e.rating)}${'☆'.repeat(5 - e.rating)}</div>` : ''}
          ${e.occasion ? `<div class="diary-entry-occasion">${e.occasion}</div>` : ''}
          ${e.notes ? `<div class="diary-entry-notes">${e.notes}</div>` : ''}
          ${e.review ? `<div class="diary-entry-review">${e.review}</div>` : ''}
          <button class="diary-entry-delete" data-id="${e.id}">Remove</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.diary-entry-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = parseInt(btn.dataset.id);
        entries = entries.filter(e => e.id !== id);
        await saveEntries();
        renderEntries();
      });
    });
  }

  // Reload when user signs in/out
  window.addEventListener('sommplicity-auth-change', () => loadEntries());

  // Reload when switching to the diary tab
  const observer = new MutationObserver(() => {
    const section = document.getElementById('diary-section');
    if (section && section.classList.contains('active')) loadEntries();
  });
  const section = document.getElementById('diary-section');
  if (section) observer.observe(section, { attributes: true, attributeFilter: ['class'] });

  loadEntries();
});
