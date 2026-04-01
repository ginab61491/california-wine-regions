// app.js — Navigation controller and app initialization

document.addEventListener('DOMContentLoaded', () => {
  // ── Navigation ──────────────────────────────────────────
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');

  function switchSection(sectionId) {
    sections.forEach(s => s.classList.remove('active'));
    navItems.forEach(n => n.classList.remove('active'));

    const target = document.getElementById(`${sectionId}-section`);
    const navItem = document.querySelector(`[data-section="${sectionId}"]`);

    if (target) target.classList.add('active');
    if (navItem) navItem.classList.add('active');

    // Lazy-init diagrams when first visited
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

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchSection(item.dataset.section);
    });
  });

  // ── Initialize all components on load ──────────────────
  window.chatBot       = new ChatBot();
  window.flavorWheel   = new FlavorWheel();
  window.wineRegions   = new WineRegions();
  window.foodPairing   = new FoodPairing();
  window.wineAnalyzer  = new WineAnalyzer();
  window.caTripPlanner = new CaTripPlanner();

  // Init CA trip planner right away (it's the default section)
  window._catripInit = true;
  caTripPlanner.init();
});
