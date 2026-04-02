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
      occasion: document.getElementById('diary-occasion').value,
      food: (document.getElementById('diary-food') || {}).value || '',
      price: (document.getElementById('diary-price') || {}).value || '',
      location: (document.getElementById('diary-location') || {}).value || '',
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
    if (document.getElementById('diary-food')) document.getElementById('diary-food').value = '';
    if (document.getElementById('diary-price')) document.getElementById('diary-price').value = '';
    if (document.getElementById('diary-location')) document.getElementById('diary-location').value = '';
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
    const header = document.getElementById('diary-history-header');
    const empty = document.getElementById('diary-empty');

    if (!entries.length) {
      if (header) header.style.display = 'none';
      empty.style.display = 'block';
      container.innerHTML = '';
      return;
    }

    if (header) header.style.display = 'block';
    empty.style.display = 'none';

    // Search and sort
    const searchEl = document.getElementById('diary-search');
    const sortEl = document.getElementById('diary-sort');
    const query = searchEl ? searchEl.value.trim().toLowerCase() : '';
    const sortBy = sortEl ? sortEl.value : 'newest';

    let display = [...entries];

    // Filter by search
    if (query) {
      display = display.filter(e => {
        const hay = `${e.name} ${e.producer} ${e.region} ${e.notes} ${e.review} ${e.occasion}`.toLowerCase();
        return hay.includes(query);
      });
    }

    // Sort
    if (sortBy === 'newest') display.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    else if (sortBy === 'oldest') display.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    else if (sortBy === 'highest') display.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    else if (sortBy === 'name') display.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    // Stats
    const statsEl = document.getElementById('diary-stats');
    if (statsEl) {
      const rated = entries.filter(e => e.rating > 0);
      const avgRating = rated.length ? (rated.reduce((s, e) => s + e.rating, 0) / rated.length).toFixed(1) : '—';
      statsEl.innerHTML = `<span>${entries.length} wine${entries.length !== 1 ? 's' : ''} logged</span><span>Avg rating: ${avgRating}/5</span>`;
    }

    container.innerHTML = display.map(e => `
      <div class="diary-entry" data-id="${e.id}">
        <div class="diary-entry-photo">
          ${e.photo
            ? `<img src="${e.photo}" alt="${e.name}" loading="lazy" />`
            : `<span class="diary-entry-photo-empty"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 22h8M12 15v7M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg></span>`
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
          ${e.food || e.price || e.location ? `<div class="diary-entry-details">${e.food ? `<span>${e.food}</span>` : ''}${e.price ? `<span>$${e.price}</span>` : ''}${e.location ? `<span>${e.location}</span>` : ''}</div>` : ''}
          ${e.notes ? `<div class="diary-entry-notes">${e.notes}</div>` : ''}
          ${e.review ? `<div class="diary-entry-review">${e.review}</div>` : ''}
          <button class="diary-entry-delete" data-id="${e.id}">Remove</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.diary-entry-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (!confirm('Remove this entry?')) return;
        const id = parseInt(btn.dataset.id);
        entries = entries.filter(e => e.id !== id);
        await saveEntries();
        renderEntries();
      });
    });
  }

  // Wire search and sort
  const diarySearch = document.getElementById('diary-search');
  const diarySort = document.getElementById('diary-sort');
  if (diarySearch) diarySearch.addEventListener('input', () => renderEntries());
  if (diarySort) diarySort.addEventListener('change', () => renderEntries());

  // ── Quick Scan ──────────────────────────────────────────
  let scanImages = [];
  let scanDates = []; // extracted from EXIF or file metadata

  function initScan() {
    const scanInput = document.getElementById('diary-scan-input');
    const scanPreviews = document.getElementById('diary-scan-previews');
    const scanBtn = document.getElementById('diary-scan-btn');
    const scanStatus = document.getElementById('diary-scan-status');
    const scanResults = document.getElementById('diary-scan-results');
    const dropzone = document.getElementById('diary-scan-dropzone');
    const cameraInput = document.getElementById('diary-camera-input');
    if (!scanInput || !scanBtn) return;

    // Camera input feeds into the same scan flow
    if (cameraInput) {
      cameraInput.addEventListener('change', (e) => {
        addFiles(e.target.files);
        cameraInput.value = '';
      });
    }

    function getPhotoDate(file) {
      if (file.lastModified) return new Date(file.lastModified).toISOString().split('T')[0];
      return new Date().toISOString().split('T')[0];
    }

    // Resize image to max 1200px wide before converting to base64
    // This prevents huge phone photos from causing request failures
    function resizeImage(file) {
      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        img.onload = () => {
          URL.revokeObjectURL(url);
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
          if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }
          const canvas = document.createElement('canvas');
          canvas.width = w; canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => {
          URL.revokeObjectURL(url);
          // Fallback: read as-is
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(file);
        };
        img.src = url;
      });
    }

    function addFiles(files) {
      Array.from(files).forEach(async (file) => {
        if (!file.type.startsWith('image/')) return;
        const photoDate = getPhotoDate(file);
        const dataUrl = await resizeImage(file);
        const idx = scanImages.length;
        scanImages.push(dataUrl);
        scanDates.push(photoDate);

        const wrap = document.createElement('div');
        wrap.className = 'diary-scan-thumb-wrap';
        wrap.dataset.idx = idx;
        wrap.innerHTML = `<img src="${dataUrl}" class="diary-scan-thumb" alt="Wine bottle photo" /><button class="diary-scan-thumb-remove" title="Remove">&times;</button>`;
        wrap.querySelector('.diary-scan-thumb-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          scanImages[idx] = null;
          scanDates[idx] = null;
          wrap.remove();
          if (scanImages.filter(Boolean).length === 0) scanBtn.disabled = true;
        });
        scanPreviews.appendChild(wrap);
        scanBtn.disabled = false;
      });
    }

    scanInput.addEventListener('change', (e) => {
      addFiles(e.target.files);
      scanInput.value = ''; // reset so same file can be re-selected
    });

    // Drag and drop
    if (dropzone) {
      dropzone.addEventListener('dragover', (e) => { e.preventDefault(); dropzone.style.borderColor = 'var(--gold)'; });
      dropzone.addEventListener('dragleave', () => { dropzone.style.borderColor = ''; });
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.style.borderColor = '';
        addFiles(e.dataTransfer.files);
      });
    }

    scanBtn.addEventListener('click', async () => {
      const activeImages = scanImages.filter(Boolean);
      if (!activeImages.length) { scanStatus.textContent = 'Please upload at least one photo first.'; return; }

      scanBtn.disabled = true;
      scanBtn.textContent = 'Scanning...';
      scanStatus.textContent = 'Identifying bottles — this may take 10-15 seconds...';
      scanResults.innerHTML = '';

      try {
        // Use AbortController for timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 60000); // 60s timeout

        const res = await fetch('/api/scan-bottles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ images: activeImages }),
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!res.ok) {
          let errMsg = `Server error (${res.status})`;
          try { const errData = await res.json(); errMsg = errData.error || errMsg; } catch {}
          if (res.status === 413) errMsg = 'Image too large. Try a smaller photo.';
          if (res.status === 500) errMsg = 'Server error — please try again in a moment.';
          throw new Error(errMsg);
        }

        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { throw new Error('Unexpected response from server. Please try again.'); }
        const bottles = data.bottles || [];

        if (!bottles.length) {
          scanStatus.textContent = 'No bottles could be identified. Try a photo with a clear, visible label.';
        } else {
          scanStatus.textContent = `Found ${bottles.length} bottle${bottles.length > 1 ? 's' : ''}.`;
          renderScanResults(bottles, scanResults);
        }
      } catch (err) {
        if (err.name === 'AbortError') {
          scanStatus.textContent = 'Request timed out. Try with a single, smaller photo.';
        } else {
          scanStatus.textContent = 'Error: ' + err.message;
        }
        console.error('Scan error:', err);
      }

      scanBtn.textContent = 'Scan Bottles';
      scanBtn.disabled = scanImages.filter(Boolean).length === 0;
    });
  }

  function renderScanResults(bottles, scanResults) {
    // Use earliest photo date as default
    const defaultDate = scanDates.filter(Boolean)[0] || new Date().toISOString().split('T')[0];

    scanResults.innerHTML = bottles.map((b, i) => `
      <div class="scan-bottle-card">
        <div class="scan-bottle-name">${b.name || 'Unknown Wine'}</div>
        <div class="scan-bottle-meta">${[b.producer, b.vintage, b.region, b.grape, b.type].filter(Boolean).join(' · ')}</div>
        <div class="scan-bottle-date-row">
          <label class="scan-bottle-date-label">Date tasted</label>
          <input type="date" class="scan-bottle-date" data-scan-idx="${i}" value="${defaultDate}" />
        </div>
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
        const dateInput = scanResults.querySelector(`.scan-bottle-date[data-scan-idx="${idx}"]`);
        const date = dateInput ? dateInput.value : defaultDate;
        const entry = {
          id: Date.now() + idx,
          name: b.name || 'Unknown Wine',
          producer: b.producer || '',
          region: b.region || '',
          date: date,
          rating: 0,
          occasion: '',
          notes: b.tasting_notes || '',
          review: [b.rating, b.price_range, b.sommelier_note].filter(Boolean).join(' · '),
          photo: scanImages.filter(Boolean)[0] || null,
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

  // Init scan on load and also when diary tab becomes active
  initScan();

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
