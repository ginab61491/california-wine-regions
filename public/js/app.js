// app.js — Navigation controller and app initialization

document.addEventListener('DOMContentLoaded', () => {
  // ── Elements ──────────────────────────────────────────
  const sections      = document.querySelectorAll('.section');
  const mainContent   = document.getElementById('main-content');
  const topnav        = document.getElementById('topnav');
  const breadcrumb    = document.getElementById('breadcrumb');
  const mobileNav     = document.getElementById('mobile-nav');
  const mobileOverlay = document.getElementById('mobile-nav-overlay');
  const hamburgerBtn  = document.getElementById('hamburger-btn');
  const mobileClose   = document.getElementById('mobile-nav-close');

  // Section label map for breadcrumbs
  const sectionLabels = {
    grapes:      'Wine Grapes',
    catrip:      'Plan a California Trip',
    caregions:   'Explore California Wine Country',
    regions:     'Wine Regions of the World',
    events:      'Bay Area Wine Events',
    dailywine:   'Daily Wine Emails',
    wheel:       'Flavor Wheel',
    pairing:     'Food Pairing',
    analyzer:    'I Love This Wine',
    preferences: 'My Account',
    diary:       'My Wine Diary',
    vault:       'My Wine Vault',
    recs:        'Recommendations',
    about:       'About Sommplicity',
    chat:        'Sommelier AI',
  };

  // Section → parent group for dropdown active states
  const sectionGroups = {
    grapes: 'Learn', dailywine: 'Learn', wheel: 'Learn', pairing: 'Learn', regions: 'Learn',
    exam: 'Study',
    catrip: 'Visit', caregions: 'Visit', events: 'Visit',
    analyzer: 'Sip', diary: 'Sip', vault: 'Sip', recs: 'Sip',
    preferences: 'Sip',
    about: 'About',
  };

  let currentSection = null;

  // ── Show Home ──────────────────────────────────────────
  function showHome() {
    sections.forEach(s => s.classList.remove('active'));
    mainContent.classList.remove('section-active');
    mainContent.scrollTop = 0;
    currentSection = null;
    updateHeaderState();
    updateBreadcrumb(null);
    clearActiveNav();
  }

  // ── Switch Section ─────────────────────────────────────
  function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    mainContent.classList.add('section-active');

    const target = document.getElementById(`${sectionId}-section`);
    if (target) target.classList.add('active');

    mainContent.scrollTop = 0;
    currentSection = sectionId;
    updateHeaderState();
    updateBreadcrumb(sectionId);
    updateActiveNav(sectionId);
    closeMobileNav();

    // Lazy-init components
    if (sectionId === 'wheel' && !window._wheelInit) {
      window._wheelInit = true;
      window.flavorWheel && window.flavorWheel.init();
    }
    if (sectionId === 'regions' && !window._regionsInit) {
      window._regionsInit = true;
      window.wineRegions && window.wineRegions.init();
    }
    if (sectionId === 'pairing' && !window._pairingInit) {
      window._pairingInit = true;
      window.foodPairing && window.foodPairing.init();
    }
    if (sectionId === 'analyzer' && !window._analyzerInit) {
      window._analyzerInit = true;
      window.wineAnalyzer && window.wineAnalyzer.init();
    }
    if (sectionId === 'catrip' && !window._catripInit) {
      window._catripInit = true;
      window.caTripPlanner && window.caTripPlanner.init();
    }
    if (sectionId === 'caregions' && !window._caregionsInit) {
      window._caregionsInit = true;
      window.caTripPlanner && window.caTripPlanner.buildRegionsGuide();
    }
  }

  // ── Header state (transparent on home, solid on sections) ──
  function updateHeaderState() {
    if (!currentSection) {
      // Home page: transparent header over hero
      topnav.classList.add('topnav--transparent');
      topnav.classList.remove('topnav--scrolled');
      checkHomeScroll();
    } else {
      topnav.classList.remove('topnav--transparent', 'topnav--scrolled');
    }
  }

  function checkHomeScroll() {
    if (currentSection) return;
    if (mainContent.scrollTop > 80) {
      topnav.classList.remove('topnav--transparent');
      topnav.classList.add('topnav--scrolled');
    } else {
      topnav.classList.add('topnav--transparent');
      topnav.classList.remove('topnav--scrolled');
    }
  }
  mainContent.addEventListener('scroll', checkHomeScroll);

  // ── Breadcrumb ──
  function updateBreadcrumb(sectionId) {
    if (!sectionId) {
      breadcrumb.classList.remove('visible');
      breadcrumb.innerHTML = '';
      return;
    }
    const label = sectionLabels[sectionId] || sectionId;
    breadcrumb.innerHTML = `<a id="bc-home">Home</a><span class="breadcrumb-sep">/</span><span class="breadcrumb-current">${label}</span>`;
    breadcrumb.classList.add('visible');
    document.getElementById('bc-home').addEventListener('click', showHome);
  }

  // ── Active state on nav links ──
  function clearActiveNav() {
    document.querySelectorAll('.topnav-link, .topnav-menu-item, .mobile-nav-link').forEach(el => {
      el.classList.remove('active');
    });
  }

  function updateActiveNav(sectionId) {
    clearActiveNav();
    // Highlight menu items
    document.querySelectorAll(`.topnav-menu-item[data-section="${sectionId}"]`).forEach(el => el.classList.add('active'));
    document.querySelectorAll(`.mobile-nav-link[data-section="${sectionId}"]`).forEach(el => el.classList.add('active'));
    // Highlight parent dropdown trigger
    const groupName = sectionGroups[sectionId];
    if (groupName) {
      document.querySelectorAll('.topnav-link').forEach(link => {
        if (link.textContent.trim() === groupName) link.classList.add('active');
      });
    }
    // Direct link (About)
    document.querySelectorAll(`.topnav-link[data-section="${sectionId}"]`).forEach(el => el.classList.add('active'));
  }

  // ── Click handlers: all [data-section] links ──
  document.querySelectorAll('[data-section]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      switchSection(el.dataset.section);
    });
  });

  // Brand → home
  document.getElementById('nav-home').addEventListener('click', showHome);

  // ── Mobile hamburger ──
  function openMobileNav() {
    mobileNav.classList.add('open');
    mobileOverlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeMobileNav() {
    mobileNav.classList.remove('open');
    mobileOverlay.classList.remove('open');
    document.body.style.overflow = '';
  }
  hamburgerBtn.addEventListener('click', openMobileNav);
  mobileClose.addEventListener('click', closeMobileNav);
  mobileOverlay.addEventListener('click', closeMobileNav);

  // ── Initialize all components on load ──────────────────
  window.chatBot       = new ChatBot();
  window.flavorWheel   = new FlavorWheel();
  window.wineRegions   = new WineRegions();
  window.foodPairing   = new FoodPairing();
  window.wineAnalyzer  = new WineAnalyzer();
  window.caTripPlanner = new CaTripPlanner();

  // Start on home page
  updateHeaderState();

  // ── Lazy image fade-in ──
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); }
    else { img.addEventListener('load', () => img.classList.add('loaded')); }
  });

  // ── Scroll reveal: staggered fade-in for home cards ──
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        entry.target.style.animationDelay = `${i * 100}ms`;
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.home-card').forEach(card => {
    card.classList.add('scroll-reveal');
    revealObserver.observe(card);
  });

  // ── Photo gallery lightbox ──
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  if (lightbox) {
    document.querySelectorAll('.home-gallery-item img').forEach(img => {
      img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeLightbox() {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
    }
    lightboxClose.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
  }
});
