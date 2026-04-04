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
    producers:   'Producer Profiles',
    study:       'Classes & Certifications',
    cmsprep:     'Certified Sommelier Prep',
    wset3prep:   'WSET Level 3 Prep',
    catrip:      'Plan a California Trip',
    caregions:   'Explore California Wine Country',
    regions:     'Wine Regions of the World',
    events:      'Bay Area Wine Events',
    dailywine:   'Daily Wine Emails',
    pairing:     'Food Pairing',
    analyzer:    'My Favorites',
    preferences: 'My Account',
    diary:       'Upload Your Bottle',
    palate:      'Understand My Palate',
    vault:       'My Tasting History',
    recs:        'Recommendations',
    about:       'About Sommplicity',
    chat:        'Sommelier AI',
    palateiq:    'Palate IQ',
    grapeorplace: 'Grape or Place?',
    labelschool:  'Label School',
    grapeclimate: 'Grape & Climate',
    lineup:       'The Lineup',
    climateslider: 'Climate Slider',
    dinnerrescue: 'Dinner Rescue',
    growyourvine: 'Grow Your Vine',
  };

  // Section → parent group for dropdown active states
  const sectionGroups = {
    grapes: 'Learn', dailywine: 'Learn', pairing: 'Learn', regions: 'Learn', producers: 'Learn', palateiq: 'Learn', grapeorplace: 'Learn', labelschool: 'Learn', grapeclimate: 'Learn', lineup: 'Learn', climateslider: 'Learn', dinnerrescue: 'Learn', growyourvine: 'Learn',
    study: 'Study', cmsprep: 'Study', wset3prep: 'Study',
    catrip: 'Visit', caregions: 'Visit', events: 'Visit',
    analyzer: 'Sip', diary: 'Sip', palate: 'Sip', vault: 'Sip', recs: 'Sip',
    preferences: 'Sip',
    about: 'About',
  };

  let currentSection = null;

  // ── Route map: sectionId → URL path ───────────────────
  const sectionRoutes = {
    grapes:      '/learn/grapes',
    producers:   '/learn/producers',
    regions:     '/learn/regions',
    pairing:     '/learn/food-pairing',
    dailywine:   '/learn/daily-emails',
    palateiq:    '/learn/palate-iq',
    grapeorplace: '/learn/grape-or-place',
    labelschool:  '/learn/label-school',
    grapeclimate: '/learn/grape-climate',
    lineup:       '/learn/the-lineup',
    climateslider: '/learn/climate-slider',
    dinnerrescue: '/learn/dinner-rescue',
    growyourvine: '/learn/grow-your-vine',
    study:       '/study/classes',
    cmsprep:     '/study/cms-prep',
    wset3prep:   '/study/wset3-prep',
    catrip:      '/visit/plan-trip',
    caregions:   '/visit/wine-country',
    events:      '/visit/events',
    analyzer:    '/sip/favorites',
    diary:       '/sip/upload-bottle',
    palate:      '/sip/my-palate',
    vault:       '/sip/tasting-history',
    recs:        '/sip/recommendations',
    preferences: '/sip/account',
    about:       '/about',
    chat:        '/chat',
  };
  // Reverse map: path → sectionId
  const routeToSection = {};
  for (const [id, path] of Object.entries(sectionRoutes)) {
    routeToSection[path] = id;
  }

  function sectionToHash(sectionId) {
    return '#' + (sectionRoutes[sectionId] || '/' + sectionId);
  }

  function hashToSection(hash) {
    const path = (hash || '').replace(/^#/, '');
    return routeToSection[path] || null;
  }

  // ── Show Home ──────────────────────────────────────────
  function showHome(pushState) {
    sections.forEach(s => s.classList.remove('active'));
    mainContent.classList.remove('section-active');
    mainContent.scrollTop = 0;
    currentSection = null;
    updateHeaderState();
    updateBreadcrumb(null);
    clearActiveNav();
    if (pushState !== false) {
      history.pushState({ section: null }, '', '#/');
    }
  }

  // ── Switch Section ─────────────────────────────────────
  function switchSection(sectionId, pushState) {
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

    if (pushState !== false) {
      history.pushState({ section: sectionId }, '', sectionToHash(sectionId));
    }

    // Lazy-init components
    if (sectionId === 'regions' && !window._regionsInit) {
      window._regionsInit = true;
      window.wineRegions && window.wineRegions.init();
    }
    if (sectionId === 'pairing' && !window._pairingInit) {
      window._pairingInit = true;
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

  // ── Popstate: back/forward button support ─────────────
  window.addEventListener('popstate', (e) => {
    const section = e.state ? e.state.section : hashToSection(location.hash);
    if (section) {
      switchSection(section, false);
    } else {
      showHome(false);
    }
  });

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
    document.getElementById('bc-home').addEventListener('click', () => showHome());
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
  document.getElementById('nav-home').addEventListener('click', () => showHome());

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
  window.wineRegions   = new WineRegions();
  // FoodPairing replaced by pairing-explorer.js
  window.wineAnalyzer  = new WineAnalyzer();
  window.caTripPlanner = new CaTripPlanner();

  // ── Deep link: load section from URL hash on page load ──
  const initialSection = hashToSection(location.hash);
  if (initialSection) {
    switchSection(initialSection, false);
    // Replace initial history entry so back doesn't double
    history.replaceState({ section: initialSection }, '', sectionToHash(initialSection));
  } else {
    showHome(false);
    history.replaceState({ section: null }, '', location.hash || '#/');
  }

  // ── Topnav auth state ──
  function updateTopnavAuth() {
    const user = JSON.parse(localStorage.getItem('sommplicity_user') || 'null');
    const signInBtn = document.getElementById('topnav-signin-btn');
    const userBtn = document.getElementById('topnav-user-btn');
    const avatar = document.getElementById('topnav-user-avatar');
    const nameEl = document.getElementById('topnav-user-name');
    if (!signInBtn || !userBtn) return;
    if (user) {
      signInBtn.style.display = 'none';
      userBtn.style.display = 'flex';
      if (avatar) avatar.src = user.picture || '';
      if (nameEl) nameEl.textContent = (user.name || 'Account').split(' ')[0];
    } else {
      signInBtn.style.display = '';
      userBtn.style.display = 'none';
    }
  }
  updateTopnavAuth();
  window.addEventListener('sommplicity-auth-change', updateTopnavAuth);

  // ── Lazy image fade-in ──
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete) { img.classList.add('loaded'); }
    else { img.addEventListener('load', () => img.classList.add('loaded')); }
  });

  // ── Home feature tabs ──
  document.querySelectorAll('.home-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.home-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.home-tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      const panel = document.getElementById('tab-' + tab.dataset.tab);
      if (panel) panel.classList.add('active');
    });
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
