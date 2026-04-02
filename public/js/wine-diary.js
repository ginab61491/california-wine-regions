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

  // ── Quick Scan ──────────────────────────────────────────
  const scanInput = document.getElementById('diary-scan-input');
  const scanPreviews = document.getElementById('diary-scan-previews');
  const scanBtn = document.getElementById('diary-scan-btn');
  const scanStatus = document.getElementById('diary-scan-status');
  const scanResults = document.getElementById('diary-scan-results');
  let scanImages = [];

  if (scanInput) {
    scanInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      if (!files.length) return;

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          scanImages.push(ev.target.result);
          const img = document.createElement('img');
          img.src = ev.target.result;
          img.className = 'diary-scan-thumb';
          img.alt = 'Wine bottle photo';
          scanPreviews.appendChild(img);
          scanBtn.disabled = false;
        };
        reader.readAsDataURL(file);
      });
    });

    scanBtn.addEventListener('click', async () => {
      if (!scanImages.length) return;

      scanBtn.disabled = true;
      scanBtn.textContent = 'Scanning...';
      scanStatus.textContent = 'Identifying bottles with AI — this may take a moment...';
      scanResults.innerHTML = '';

      try {
        const res = await fetch('/api/scan-bottles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: scanImages }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Scan failed');
        }

        const data = await res.json();
        const bottles = data.bottles || [];

        if (!bottles.length) {
          scanStatus.textContent = 'No bottles could be identified. Try a clearer photo.';
        } else {
          scanStatus.textContent = `Found ${bottles.length} bottle${bottles.length > 1 ? 's' : ''}.`;
          renderScanResults(bottles);
        }
      } catch (err) {
        scanStatus.textContent = 'Error: ' + err.message;
      }

      scanBtn.textContent = 'Scan Bottles';
      scanBtn.disabled = scanImages.length === 0;
    });

    // Drag and drop
    const dropzone = document.getElementById('diary-scan-dropzone');
    dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--gold)'; });
    dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.style.borderColor = '';
      scanInput.files = e.dataTransfer.files;
      scanInput.dispatchEvent(new Event('change'));
    });
  }

  function renderScanResults(bottles) {
    scanResults.innerHTML = bottles.map((b, i) => `
      <div class="scan-bottle-card">
        <div class="scan-bottle-name">${b.name || 'Unknown Wine'}</div>
        <div class="scan-bottle-meta">${[b.producer, b.vintage, b.region, b.grape, b.type].filter(Boolean).join(' · ')}</div>
        <div class="scan-bottle-grid">
          ${b.price_range ? `<div class="scan-bottle-field"><span class="scan-bottle-field-label">Price</span><span class="scan-bottle-field-value">${b.price_range}</span></div>` : ''}
          ${b.rating ? `<div class="scan-bottle-field"><span class="scan-bottle-field-label">Rating</span><span class="scan-bottle-field-value">${b.rating}</span></div>` : ''}
          ${b.where_to_buy ? `<div class="scan-bottle-field"><span class="scan-bottle-field-label">Where to Buy</span><span class="scan-bottle-field-value">${b.where_to_buy}</span></div>` : ''}
          ${b.food_pairing ? `<div class="scan-bottle-field"><span class="scan-bottle-field-label">Pairs With</span><span class="scan-bottle-field-value">${b.food_pairing}</span></div>` : ''}
        </div>
        ${b.tasting_notes ? `<div class="scan-bottle-notes">${b.tasting_notes}</div>` : ''}
        ${b.sommelier_note ? `<div class="scan-bottle-somm">${b.sommelier_note}</div>` : ''}
        <div class="scan-bottle-actions">
          <button class="scan-add-diary-btn" data-scan-idx="${i}">Add to Diary</button>
        </div>
      </div>
    `).join('');

    // Wire "Add to Diary" buttons
    scanResults.querySelectorAll('.scan-add-diary-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.scanIdx);
        const b = bottles[idx];
        const entry = {
          id: Date.now() + idx,
          name: b.name || 'Unknown Wine',
          producer: b.producer || '',
          region: b.region || '',
          date: new Date().toISOString().split('T')[0],
          rating: 0,
          occasion: '',
          notes: b.tasting_notes || '',
          review: [b.rating, b.price_range, b.sommelier_note].filter(Boolean).join(' · '),
          photo: scanImages[0] || null,
        };
        entries.unshift(entry);
        saveEntries();
        renderEntries();
        btn.textContent = 'Added';
        btn.disabled = true;
        btn.style.background = 'var(--gold)';
        btn.style.color = '#fff';
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
