// ca-wine-trip.js — California Wine Trip Planner
// Rebuilt from conversation history

// ─── Filter Sliders ─────────────────────────────────────
// PRIMARY FILTERS — always visible
const TRIP_SLIDERS_PRIMARY = [
  { id: 'vibe', leftLabel: 'Intimate & Family-Owned', rightLabel: 'Polished & Established', leftTags: ['intimate', 'family-owned'], rightTags: ['commercial', 'prestigious'] },
  { id: 'budget', leftLabel: 'Budget-Friendly', rightLabel: 'Splurge-Worthy', leftTags: ['budget-price'], rightTags: ['splurge-price'] },
  { id: 'remoteness', leftLabel: 'Close to Town', rightLabel: 'Remote & Scenic', leftTags: ['near-town'], rightTags: ['remote', 'scenic'] },
];
// SECONDARY FILTERS — collapsible
const TRIP_SLIDERS_SECONDARY = [
  { id: 'quality', leftLabel: 'Wine Focused', rightLabel: 'Vibe Focused', leftTags: ['sommelier-fave'], rightTags: ['tour', 'scenic'] },
  { id: 'learning', leftLabel: 'Educational', rightLabel: 'Casual & Fun', leftTags: ['educational', 'tour'], rightTags: ['social', 'casual'] },
];
const TRIP_SLIDERS = [...TRIP_SLIDERS_PRIMARY, ...TRIP_SLIDERS_SECONDARY];

// ─── Subregions ─────────────────────────────────────────
const SUBREGIONS = {
  'Napa Valley': ['Carneros','Yountville','Oakville','Rutherford','St. Helena','Stags Leap District','Howell Mountain','Spring Mountain District','Mount Veeder','Calistoga','Coombsville'],
  'Sonoma County': ['Sonoma Valley','Russian River Valley','Dry Creek Valley','Alexander Valley','Sonoma Coast','Green Valley','Petaluma Gap'],
  'Healdsburg': ['Healdsburg Plaza','Russian River Valley','Dry Creek Valley','Alexander Valley'],
  'Paso Robles': ['Adelaida District (Westside)','Templeton Gap','Downtown Paso','Eastside'],
};

const SUBREGION_NEIGHBORS = {
  'Howell Mountain': { 'Spring Mountain District': 20, 'Calistoga': 25, 'St. Helena': 20 },
  'Spring Mountain District': { 'Howell Mountain': 20, 'St. Helena': 15, 'Rutherford': 20 },
  'Mount Veeder': { 'Carneros': 25, 'Stags Leap District': 30, 'Yountville': 25 },
  'Carneros': { 'Yountville': 20, 'Stags Leap District': 20, 'Sonoma Valley': 20 },
  'Stags Leap District': { 'Oakville': 15, 'Carneros': 20, 'Yountville': 15 },
  'Oakville': { 'Rutherford': 10, 'Stags Leap District': 15, 'Yountville': 15 },
  'Rutherford': { 'Oakville': 10, 'St. Helena': 10 },
  'St. Helena': { 'Rutherford': 10, 'Calistoga': 15 },
  'Calistoga': { 'St. Helena': 15, 'Howell Mountain': 25 },
  'Yountville': { 'Oakville': 15, 'Stags Leap District': 15, 'Carneros': 20 },
  'Russian River Valley': { 'Dry Creek Valley': 25, 'Green Valley': 15, 'Sonoma Valley': 30 },
  'Dry Creek Valley': { 'Russian River Valley': 25, 'Alexander Valley': 20 },
  'Alexander Valley': { 'Dry Creek Valley': 20, 'Russian River Valley': 30 },
  'Sonoma Valley': { 'Carneros': 20, 'Russian River Valley': 30 },
  'Sonoma Coast': { 'Russian River Valley': 35, 'Petaluma Gap': 25 },
  'Sonoma Coast (Fort Ross–Seaview)': { 'Sonoma Coast': 30, 'Russian River Valley': 50 },
  'Adelaida District (Westside)': { 'Templeton Gap': 25, 'Downtown Paso': 30 },
  'Templeton Gap': { 'Adelaida District (Westside)': 25, 'Downtown Paso': 15 },
  'Downtown Paso': { 'Templeton Gap': 15, 'Adelaida District (Westside)': 30 },
};

const TRANSPORT_ADVICE = {
  car: 'Renting a car gives you full flexibility. Budget $60–$100/day from SFO. A designated driver is strongly recommended.',
  driver: 'A private driver is the most relaxed option. $300–$600 for a full day. Worth it for groups of 4+.',
  uber: 'Uber/Lyft works in Napa town areas but is unreliable in Sonoma and non-existent in Paso Robles.',
  tour: 'Guided tours handle all logistics. $150–$350/person. Great for first-timers.',
};

// ─── Food Recommendations ───────────────────────────────
const FOOD_RECS = {
  'Napa Valley': {
    quick: [
      { name: 'Bouchon Bakery', location: 'Yountville', note: "Thomas Keller's casual bakery.", time: '20 min', rating: 4.6, priceRange: '$', specialty: 'Croissants, TKO cookies', minutesOffRoute: 0, orderAhead: true, typicalWait: '5–15 min line weekends', url: 'https://www.bouchonbakery.com', bookingLead: 'Order ahead online to skip line' },
      { name: 'Oakville Grocery', location: 'Oakville', note: 'Legendary deli since 1881.', time: '25 min', rating: 4.4, priceRange: '$', specialty: 'Picnic provisions, charcuterie', minutesOffRoute: 0, orderAhead: true, typicalWait: 'Usually no wait', url: 'https://www.oakvillegrocery.com', bookingLead: 'Walk in or order ahead' },
      { name: 'Giugni & Son', location: 'St. Helena', note: 'Iconic Italian deli since 1946.', time: '15 min', rating: 4.7, priceRange: '$', specialty: 'Italian subs, house-made salami', minutesOffRoute: 5, orderAhead: false, typicalWait: '10–20 min line at lunch', url: 'https://www.giugnis.com', bookingLead: 'Walk in — arrive before 11:30 AM' },
    ],
    sitdown: [
      { name: 'The French Laundry', location: 'Yountville', note: "Three Michelin stars. Virtually impossible reservation.", time: '3–4 hrs', rating: 4.7, priceRange: '$$$$', specialty: 'Nine-course tasting menu', minutesOffRoute: 0, orderAhead: false, typicalWait: 'Extremely difficult', url: 'https://www.thomaskeller.com/tfl', reservationUrl: 'https://www.exploretock.com/thefrenchlaundry', bookingLead: 'Book exactly 60 days ahead at midnight PT. Sells out in seconds.' },
      { name: 'Press', location: 'St. Helena', note: 'Definitive Napa steakhouse.', time: '2 hrs', rating: 4.6, priceRange: '$$$', specialty: 'USDA prime steak, Napa Cab pairings', minutesOffRoute: 5, url: 'https://www.pressnapavalley.com', reservationUrl: 'https://www.opentable.com/press-st-helena', bookingLead: 'Book 1–2 weeks ahead for weekends' },
    ],
    scenic: [
      { name: 'Auberge du Soleil', location: 'Rutherford', note: 'Best view in Napa Valley.', time: '2 hrs', rating: 4.7, priceRange: '$$$$', specialty: 'Valley views, brunch', minutesOffRoute: 10, url: 'https://aubergedusoleil.aubergeresorts.com/dining', reservationUrl: 'https://www.opentable.com/auberge-du-soleil', bookingLead: 'Book 2–3 weeks ahead for terrace' },
    ],
  },
  'Sonoma County': {
    quick: [
      { name: 'Shed', location: 'Healdsburg', note: 'Farm-to-counter café.', time: '45 min', rating: 4.5, priceRange: '$$', specialty: 'Grain bowls, fermented foods', minutesOffRoute: 0 },
      { name: 'Noble Folk Ice Cream', location: 'Healdsburg', note: 'Artisan ice cream.', time: '15 min', rating: 4.8, priceRange: '$', specialty: 'Seasonal wine country flavors', minutesOffRoute: 0 },
    ],
    sitdown: [
      { name: 'Single Thread', location: 'Healdsburg', note: 'Three Michelin stars.', time: '4 hrs', rating: 4.8, priceRange: '$$$$', specialty: '11-course kaiseki', minutesOffRoute: 0, url: 'https://www.singlethreadfarms.com', reservationUrl: 'https://www.exploretock.com/singlethread', bookingLead: 'Book 30–60 days ahead via Tock' },
      { name: 'Valette', location: 'Healdsburg', note: 'Farm-to-table on the plaza.', time: '2 hrs', rating: 4.7, priceRange: '$$$', specialty: 'Californian, Sonoma pairings', minutesOffRoute: 0, url: 'https://www.valettehealdsburg.com', reservationUrl: 'https://www.opentable.com/valette', bookingLead: 'Book 1–2 weeks for weekends' },
    ],
    scenic: [
      { name: 'Barndiva', location: 'Healdsburg', note: 'Garden dining, great cocktails.', time: '2 hrs', rating: 4.5, priceRange: '$$$', specialty: 'Garden patio, seasonal plates', minutesOffRoute: 0, url: 'https://www.barndiva.com', reservationUrl: 'https://www.opentable.com/barndiva', bookingLead: 'Book 1 week for garden patio' },
    ],
  },
  'Healdsburg': {
    quick: [
      { name: 'Shed', location: 'Healdsburg Plaza', note: 'Farm-to-counter café.', time: '45 min', rating: 4.5, priceRange: '$$', specialty: 'Grain bowls, fermented foods', minutesOffRoute: 0 },
      { name: 'Downtown Bakery', location: 'Healdsburg', note: 'Institution since 1987.', time: '20 min', rating: 4.6, priceRange: '$', specialty: 'Morning buns, pastries', minutesOffRoute: 0 },
    ],
    sitdown: [
      { name: 'Single Thread', location: 'Healdsburg', note: 'Three Michelin stars.', time: '4 hrs', rating: 4.8, priceRange: '$$$$', specialty: '11-course kaiseki', minutesOffRoute: 0, url: 'https://www.singlethreadfarms.com', reservationUrl: 'https://www.exploretock.com/singlethread', bookingLead: 'Book 30–60 days ahead' },
      { name: 'Valette', location: 'Healdsburg Plaza', note: 'Outstanding wine list.', time: '2 hrs', rating: 4.7, priceRange: '$$$', specialty: 'Farm-to-table', minutesOffRoute: 0 },
    ],
    scenic: [
      { name: 'Barndiva', location: 'Healdsburg', note: 'Beautiful garden patio.', time: '2 hrs', rating: 4.5, priceRange: '$$$', specialty: 'Garden patio, cocktails', minutesOffRoute: 0 },
    ],
  },
  'Paso Robles': {
    quick: [
      { name: 'Fish Gaucho', location: 'Downtown Paso', note: 'Excellent tacos and ceviche.', time: '45 min', rating: 4.5, priceRange: '$', specialty: 'Fish tacos, margaritas', minutesOffRoute: 5 },
    ],
    sitdown: [
      { name: 'Les Petites Canailles', location: 'Paso Robles', note: 'French bistro downtown.', time: '2 hrs', rating: 4.7, priceRange: '$$$', specialty: 'French bistro, local wine', minutesOffRoute: 5 },
    ],
    scenic: [
      { name: 'The Restaurant at JUSTIN', location: 'JUSTIN Winery', note: 'Estate dining.', time: '2 hrs', rating: 4.7, priceRange: '$$$', specialty: 'Estate farm-to-table', minutesOffRoute: 15 },
    ],
  },
};

// ─── Wineries Database ──────────────────────────────────
const WINERIES = [
  // === NAPA VALLEY ===
  { id: 'domaine-carneros', name: 'Domaine Carneros', region: 'Napa Valley', subregion: 'Carneros', price: 'mid', tastingCost: '$40–$65', grapes: ['sparkling', 'pinot'], tags: ['scenic', 'social', 'near-town', 'prestigious', 'walk-in'], sfDrive: 55, googleRating: 4.6, reviewCount: '4200', website: 'domainecarneros.com', bookingNote: 'Walk-ins welcome; terrace reservations recommended on weekends', description: 'A French château perched on a Carneros hilltop making méthode traditionnelle sparkling wine. The terrace is one of the most photographed spots in wine country.', mustTaste: 'Le Rêve Blanc de Blancs', funFact: 'Owned by Taittinger of Champagne — one of the only Champagne houses with a California estate.', tip: 'Go for the terrace experience with a glass of bubbly — it\'s the most glamorous casual tasting in Napa.' },
  { id: 'stags-leap', name: "Stag's Leap Wine Cellars", region: 'Napa Valley', subregion: 'Stags Leap District', price: 'splurge', tastingCost: '$75–$150', grapes: ['cab'], tags: ['historic', 'prestigious', 'scenic', 'sommelier-fave'], sfDrive: 75, googleRating: 4.7, reviewCount: '1800', website: 'stagsleapwinecellars.com', bookingNote: 'By appointment only', description: "The winery that beat Bordeaux in the 1976 Judgment of Paris. This is hallowed ground for wine lovers. The cave tastings are exceptional.", mustTaste: 'Cask 23 Cabernet', funFact: "The 1973 S.L.V. Cabernet beat the greatest wines of Bordeaux blind — it changed the wine world forever.", tip: 'Book the estate tour — you\'re walking on the most historic vineyard soil in California.' },
  { id: 'opus-one', name: 'Opus One', region: 'Napa Valley', subregion: 'Oakville', price: 'splurge', tastingCost: '$100–$200', grapes: ['cab'], tags: ['prestigious', 'scenic', 'commercial'], sfDrive: 80, googleRating: 4.6, reviewCount: '2500', website: 'opusonewinery.com', bookingNote: 'By appointment only — book well in advance', description: 'The legendary Mondavi-Rothschild joint venture. The modernist building is stunning and the single wine they make is one of Napa\'s most iconic.', mustTaste: 'Opus One', tip: 'Expensive but a bucket-list experience for wine lovers. The architecture alone is worth the visit.' },
  { id: 'domaine-chandon', name: 'Domaine Chandon', region: 'Napa Valley', subregion: 'Yountville', price: 'mid', tastingCost: '$30–$60', grapes: ['sparkling'], tags: ['social', 'near-town', 'commercial', 'walk-in'], sfDrive: 72, googleRating: 4.5, reviewCount: '3800', website: 'chandon.com', bookingNote: 'Walk-ins welcome', description: 'Moët & Chandon\'s California outpost. Beautiful grounds, great sparkling wine, and the most social tasting room in Yountville.', mustTaste: 'Étoile Brut', tip: 'Great for groups — the garden is perfect for a relaxed afternoon with bubbly.' },
  { id: 'robert-mondavi', name: 'Robert Mondavi Winery', region: 'Napa Valley', subregion: 'Oakville', price: 'mid', tastingCost: '$35–$70', grapes: ['cab'], tags: ['historic', 'tour', 'commercial', 'walk-in'], sfDrive: 80, googleRating: 4.5, reviewCount: '4500', website: 'robertmondaviwinery.com', bookingNote: 'Walk-ins welcome; tours require reservation', description: 'The winery that put Napa Valley on the world stage. The mission-style arch is iconic and the tours are among the best in the valley.', mustTaste: 'Reserve Cabernet', tip: 'The tours are excellent for understanding Napa history.' },
  { id: 'far-niente', name: 'Far Niente', region: 'Napa Valley', subregion: 'Oakville', price: 'splurge', tastingCost: '$85–$150', grapes: ['cab', 'chardonnay'], tags: ['prestigious', 'scenic', 'intimate'], sfDrive: 80, googleRating: 4.8, reviewCount: '1200', website: 'farniente.com', bookingNote: 'By appointment only', description: 'A beautifully restored 1885 stone winery with manicured gardens and a classic car collection. Pure Napa luxury.', mustTaste: 'Estate Chardonnay', tip: 'The gardens and car collection are highlights beyond the wine.' },
  { id: 'frogs-leap', name: "Frog's Leap", region: 'Napa Valley', subregion: 'Rutherford', price: 'mid', tastingCost: '$30–$55', grapes: ['cab'], tags: ['family-owned', 'casual', 'educational', 'walk-in'], sfDrive: 80, googleRating: 4.7, reviewCount: '2200', website: 'frogsleap.com', bookingNote: 'Walk-ins welcome on weekdays', description: 'Organic and dry-farmed since the 1980s. One of Napa\'s most likeable, unpretentious wineries with a beautiful red barn.', mustTaste: 'Rutherford Cabernet', tip: 'The most fun, down-to-earth tasting in Napa. The red barn is charming.' },
  { id: 'schramsberg', name: 'Schramsberg Vineyards', region: 'Napa Valley', subregion: 'Calistoga', price: 'mid-splurge', tastingCost: '$75–$125', grapes: ['sparkling'], tags: ['tour', 'historic', 'intimate'], sfDrive: 92, googleRating: 4.8, reviewCount: '1600', website: 'schramsberg.com', bookingNote: 'By appointment only', description: 'America\'s most historic sparkling wine producer. The cave tour through 2 miles of tunnels is unforgettable.', mustTaste: 'J. Schram Brut', tip: 'The cave tour is one of the best experiences in Napa — don\'t skip it.' },
  { id: 'shafer', name: 'Shafer Vineyards', region: 'Napa Valley', subregion: 'Stags Leap District', price: 'splurge', tastingCost: '$95–$175', grapes: ['cab'], tags: ['sommelier-fave', 'intimate', 'prestigious'], sfDrive: 75, googleRating: 4.9, reviewCount: '800', website: 'shafervineyards.com', bookingNote: 'By appointment only — book well in advance', description: 'Hillside Stags Leap estate making some of the most consistently excellent Cabernet in California. Hillside Select is legendary.', mustTaste: 'Hillside Select Cabernet', tip: 'Book as far ahead as you can — this fills up fast.' },
  { id: 'joseph-phelps', name: 'Joseph Phelps Vineyards', region: 'Napa Valley', subregion: 'St. Helena', price: 'splurge', tastingCost: '$80–$150', grapes: ['cab'], tags: ['prestigious', 'scenic', 'intimate'], sfDrive: 85, googleRating: 4.7, reviewCount: '1400', website: 'josephphelps.com', bookingNote: 'By appointment only', description: 'Home of Insignia — Napa\'s original Bordeaux-style blend and still one of its greatest. The terrace view is stunning.', mustTaste: 'Insignia', tip: 'The terrace tasting at sunset is one of the great Napa experiences.' },
  { id: 'hess-collection', name: 'The Hess Collection', region: 'Napa Valley', subregion: 'Mount Veeder', price: 'mid', tastingCost: '$30–$55', grapes: ['cab'], tags: ['scenic', 'tour', 'educational', 'walk-in'], sfDrive: 70, googleRating: 4.6, reviewCount: '2800', website: 'hesscollection.com', bookingNote: 'Walk-ins welcome', description: 'A mountain winery with a world-class contemporary art collection. Two experiences in one — exceptional wine and museum-quality art.', mustTaste: 'Mount Veeder Cabernet', tip: 'The art museum is free and genuinely impressive. Allow extra time.' },
  { id: 'mayacamas', name: 'Mayacamas Vineyards', region: 'Napa Valley', subregion: 'Mount Veeder', price: 'splurge', tastingCost: '$75–$125', grapes: ['cab'], tags: ['sommelier-fave', 'intimate', 'remote', 'historic', 'family-owned'], sfDrive: 78, googleRating: 4.8, reviewCount: '450', website: 'mayacamas.com', bookingNote: 'By appointment only', description: 'A legendary mountain estate making powerful, age-worthy Cabernet since 1889. Winding road, dramatic setting, extraordinary wine.', mustTaste: 'Estate Cabernet Sauvignon', tip: 'The drive is steep — take it slow. The estate at the top is one of the most stunning in Napa.' },
  { id: 'hall', name: 'HALL Wines', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid-splurge', tastingCost: '$50–$90', grapes: ['cab'], tags: ['scenic', 'tour', 'commercial', 'walk-in'], sfDrive: 85, googleRating: 4.6, reviewCount: '3200', website: 'hallwines.com', bookingNote: 'Walk-ins welcome; cave tours require reservation', description: 'Modern art meets wine at HALL. The giant chrome rabbit sculpture is a landmark and the cave tour is excellent.', mustTaste: 'Kathryn Hall Cabernet', tip: 'The chrome bunny is a must-see photo op.' },
  { id: 'darioush', name: 'Darioush', region: 'Napa Valley', subregion: 'Stags Leap District', price: 'splurge', tastingCost: '$80–$150', grapes: ['cab'], tags: ['prestigious', 'scenic', 'commercial'], sfDrive: 75, googleRating: 4.6, reviewCount: '1800', website: 'darioush.com', bookingNote: 'By appointment recommended', description: 'A Persian-inspired palace with towering columns. The architecture is jaw-dropping and the Cabernet is consistently excellent.', mustTaste: 'Signature Cabernet', tip: 'The building is unlike anything else in Napa — worth visiting for the architecture alone.' },
  { id: 'inglenook', name: 'Inglenook', region: 'Napa Valley', subregion: 'Rutherford', price: 'mid-splurge', tastingCost: '$55–$100', grapes: ['cab'], tags: ['historic', 'tour', 'scenic', 'prestigious'], sfDrive: 80, googleRating: 4.7, reviewCount: '2000', website: 'inglenook.com', bookingNote: 'By appointment recommended', description: 'Francis Ford Coppola\'s restored historic estate. One of Napa\'s most beautiful and historic properties.', mustTaste: 'Rubicon', tip: 'The history tour is fascinating — this estate has been making wine since 1879.' },
  // More Napa
  { id: 'silver-oak-napa', name: 'Silver Oak', region: 'Napa Valley', subregion: 'Oakville', price: 'splurge', tastingCost: '$50–$80', grapes: ['cab'], tags: ['prestigious', 'commercial', 'scenic'], sfDrive: 80, googleRating: 4.7, reviewCount: '3200', website: 'silveroak.com', bookingNote: 'Walk-ins welcome', description: 'One of the most recognized Cabernet houses in Napa. American oak aging gives a lush style. The LEED-certified winery is stunning.', mustTaste: 'Napa Valley Cabernet', tip: 'The new tasting room is architecturally spectacular.' },
  { id: 'beringer', name: 'Beringer Vineyards', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid', tastingCost: '$35–$75', grapes: ['cab', 'chardonnay'], tags: ['historic', 'tour', 'commercial', 'walk-in'], sfDrive: 85, googleRating: 4.5, reviewCount: '4100', website: 'beringer.com', bookingNote: 'Walk-ins welcome; tours available', description: 'Oldest continuously operating Napa winery (1876). The Rhine House is a California landmark.', mustTaste: 'Private Reserve Cabernet', tip: 'The Rhine House tour is worth it for the history.' },
  { id: 'cakebread', name: 'Cakebread Cellars', region: 'Napa Valley', subregion: 'Rutherford', price: 'mid-splurge', tastingCost: '$45–$85', grapes: ['cab', 'chardonnay'], tags: ['family-owned', 'educational', 'prestigious'], sfDrive: 82, googleRating: 4.7, reviewCount: '1800', website: 'cakebread.com', bookingNote: 'By appointment only', description: 'Beloved family winery known for exceptional Chardonnay and Cabernet.', mustTaste: 'Reserve Chardonnay', tip: 'Book the garden tour for food pairings.' },
  { id: 'caymus', name: 'Caymus Vineyards', region: 'Napa Valley', subregion: 'Rutherford', price: 'splurge', tastingCost: '$65–$150', grapes: ['cab'], tags: ['prestigious', 'family-owned', 'intimate'], sfDrive: 82, googleRating: 4.6, reviewCount: '1500', website: 'caymus.com', bookingNote: 'By appointment only', description: 'One of Napa\'s most iconic Cabernets. Rich, opulent, unapologetically bold.', mustTaste: 'Special Selection Cabernet', tip: 'Special Selection tasting is expensive but worth it.' },
  { id: 'duckhorn', name: 'Duckhorn Vineyards', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid-splurge', tastingCost: '$50–$95', grapes: ['merlot', 'cab'], tags: ['prestigious', 'scenic', 'educational'], sfDrive: 85, googleRating: 4.6, reviewCount: '1600', website: 'duckhorn.com', bookingNote: 'By appointment recommended', description: 'Proved Merlot could be world-class in Napa. Refined tastings, consistently excellent.', mustTaste: 'Three Palms Merlot', tip: 'Don\'t skip the Merlot — it will change your mind.' },
  { id: 'corison', name: 'Corison Winery', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid-splurge', tastingCost: '$50–$75', grapes: ['cab'], tags: ['sommelier-fave', 'intimate', 'family-owned'], sfDrive: 85, googleRating: 4.8, reviewCount: '320', website: 'corison.com', bookingNote: 'By appointment only', description: 'Cathy Corison makes the most elegant, age-worthy Cabernet in Napa. A sommelier darling.', mustTaste: 'Kronos Vineyard Cabernet', tip: 'For finesse over power in Cabernet.' },
  { id: 'plumpjack', name: 'PlumpJack Winery', region: 'Napa Valley', subregion: 'Oakville', price: 'splurge', tastingCost: '$55–$100', grapes: ['cab'], tags: ['prestigious', 'intimate'], sfDrive: 80, googleRating: 4.7, reviewCount: '800', website: 'plumpjack.com', bookingNote: 'By appointment only', description: 'Boutique Oakville estate. Small production, exceptional Cabernet, irreverent spirit.', mustTaste: 'Estate Cabernet', tip: 'One of the first to use screwcaps on premium Cab.' },
  { id: 'castello', name: 'Castello di Amorosa', region: 'Napa Valley', subregion: 'Calistoga', price: 'mid', tastingCost: '$40–$75', grapes: ['cab'], tags: ['tour', 'scenic', 'commercial', 'social', 'walk-in'], sfDrive: 95, googleRating: 4.6, reviewCount: '8500', website: 'castellodiamorosa.com', bookingNote: 'Walk-ins welcome', description: 'A 121,000 sq ft medieval Tuscan castle. Disneyland for wine lovers — over the top but fun.', mustTaste: 'Il Barone Cabernet', tip: 'Kids love it, adults love it. The full castle tour is worth it.' },
  { id: 'v-sattui', name: 'V. Sattui Winery', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid', tastingCost: '$35–$60', grapes: ['cab'], tags: ['social', 'near-town', 'commercial', 'walk-in'], sfDrive: 85, googleRating: 4.5, reviewCount: '5600', website: 'vsattui.com', bookingNote: 'Walk-ins welcome', description: 'The most popular picnic stop in Napa with a huge deli. Festive, social, great for groups.', mustTaste: 'Madeira', tip: 'Come for the picnic — buy from the deli and sit in the grounds.' },
  { id: 'frank-family', name: 'Frank Family Vineyards', region: 'Napa Valley', subregion: 'Calistoga', price: 'mid', tastingCost: '$40–$70', grapes: ['cab', 'chardonnay'], tags: ['social', 'near-town', 'walk-in'], sfDrive: 95, googleRating: 4.7, reviewCount: '2400', website: 'frankfamilyvineyards.com', bookingNote: 'Walk-ins welcome', description: 'Generous pours, friendly staff, beautiful Craftsman-style tasting room. Great for first-timers.', mustTaste: 'Reserve Cabernet', tip: 'One of the friendliest tasting rooms in Napa.' },
  { id: 'trefethen', name: 'Trefethen Family Vineyards', region: 'Napa Valley', subregion: 'Oak Knoll District', price: 'mid', tastingCost: '$40–$65', grapes: ['chardonnay', 'cab'], tags: ['family-owned', 'historic', 'scenic', 'walk-in'], sfDrive: 72, googleRating: 4.7, reviewCount: '1400', website: 'trefethen.com', bookingNote: 'Walk-ins welcome', description: 'Beautiful estate in the historic Eshcol winery. Family farming since 1968.', mustTaste: 'Estate Dry Riesling', tip: 'Their Riesling is one of Napa\'s best-kept secrets.' },
  { id: 'spring-mountain', name: 'Spring Mountain Vineyard', region: 'Napa Valley', subregion: 'Spring Mountain District', price: 'splurge', tastingCost: '$75–$125', grapes: ['cab'], tags: ['historic', 'scenic', 'intimate', 'remote'], sfDrive: 88, googleRating: 4.8, reviewCount: '650', website: 'springmountainvineyard.com', bookingNote: 'By appointment only', description: 'Magnificent historic estate with Victorian gardens and mountain Cabernet. The most dramatic setting in Napa.', mustTaste: 'Estate Cabernet', tip: 'The drive is steep but the estate is jaw-dropping.' },
  { id: 'stony-hill', name: 'Stony Hill Vineyard', region: 'Napa Valley', subregion: 'Spring Mountain District', price: 'mid-splurge', tastingCost: '$50–$75', grapes: ['chardonnay'], tags: ['sommelier-fave', 'intimate', 'family-owned', 'remote', 'historic'], sfDrive: 90, googleRating: 4.8, reviewCount: '280', website: 'stonyhillvineyard.com', bookingNote: 'By appointment only', description: 'Legendary estate making restrained, Burgundian Chardonnay since 1952. No oak, no butter, pure precision.', mustTaste: 'Estate Chardonnay', tip: 'One of the most authentic old-Napa experiences left.' },
  { id: 'robert-craig', name: 'Robert Craig Winery', region: 'Napa Valley', subregion: 'Howell Mountain', price: 'splurge', tastingCost: '$60–$100', grapes: ['cab'], tags: ['sommelier-fave', 'remote', 'intimate'], sfDrive: 92, googleRating: 4.8, reviewCount: '350', website: 'robertcraigwine.com', bookingNote: 'By appointment only', description: 'Mountain Cabernet specialist. Powerful, structured wines that reward patience.', mustTaste: 'Howell Mountain Cabernet', tip: 'For serious Cab lovers — wines built to age 20+ years.' },
  { id: 'smith-madrone', name: 'Smith-Madrone Vineyards', region: 'Napa Valley', subregion: 'Spring Mountain District', price: 'mid', tastingCost: '$40–$60', grapes: ['cab'], tags: ['family-owned', 'intimate', 'remote', 'historic'], sfDrive: 90, googleRating: 4.8, reviewCount: '250', website: 'smithmadrone.com', bookingNote: 'By appointment only — call ahead', description: 'Brothers Stu and Charlie Smith have been making mountain wines since 1971. Authentic, personal, no-frills.', mustTaste: 'Spring Mountain Riesling', tip: 'A true hidden gem — the Riesling is world-class and nobody knows about it.' },

  // === SONOMA COUNTY ===
  { id: 'rochioli', name: 'Rochioli Vineyards', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$40–$75', grapes: ['pinot'], tags: ['sommelier-fave', 'family-owned', 'intimate', 'walk-in'], sfDrive: 75, googleRating: 4.8, reviewCount: '900', website: 'rochioli.com', bookingNote: 'Walk-ins welcome at tasting room', description: 'The Rochioli family pioneered Pinot Noir in Russian River Valley. Mailing list wines are some of the most sought-after in California.', mustTaste: 'Estate Pinot Noir', tip: 'The tasting room is friendly and unpretentious. The estate wines are allocated by mailing list.' },
  { id: 'williams-selyem', name: 'Williams Selyem', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'splurge', tastingCost: '$75–$150', grapes: ['pinot'], tags: ['sommelier-fave', 'intimate', 'prestigious'], sfDrive: 72, googleRating: 4.9, reviewCount: '621', website: 'williamsselyem.com', bookingNote: 'Mailing list members only', description: 'Started in a garage, now one of the most celebrated Pinot Noir producers in the world. Allocation only.', mustTaste: 'Rochioli Vineyard Pinot Noir', tip: 'Join the mailing list and be patient.' },
  { id: 'gary-farrell', name: 'Gary Farrell Vineyards', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$45–$80', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'intimate', 'sommelier-fave'], sfDrive: 75, googleRating: 4.8, reviewCount: '800', website: 'garyfarrellwinery.com', bookingNote: 'By appointment only', description: 'Hilltop estate with one of the best views in Russian River Valley. Elegant, site-specific Pinot and Chardonnay.', mustTaste: 'Hallberg Vineyard Pinot Noir', tip: 'The hilltop view is worth the visit alone.' },
  { id: 'littorai', name: 'Littorai', region: 'Sonoma County', subregion: 'Sonoma Coast', price: 'splurge', tastingCost: '$60–$100', grapes: ['pinot', 'chardonnay'], tags: ['sommelier-fave', 'intimate', 'remote'], sfDrive: 85, googleRating: 4.9, reviewCount: '300', website: 'littorai.com', bookingNote: 'By appointment only', description: 'Ted Lemon trained in Burgundy and makes some of the most Burgundian wines in California. Biodynamic farming.', mustTaste: 'The Haven Vineyard Pinot Noir', tip: 'A pilgrimage for Burgundy lovers.' },
  { id: 'peay', name: 'Peay Vineyards', region: 'Sonoma County', subregion: 'Sonoma Coast (Fort Ross–Seaview)', price: 'mid-splurge', tastingCost: '$50–$80', grapes: ['pinot'], tags: ['sommelier-fave', 'remote', 'scenic', 'family-owned', 'intimate'], sfDrive: 95, googleRating: 4.9, reviewCount: '200', website: 'peayvineyards.com', bookingNote: 'By appointment only — mailing list', description: 'Extreme Sonoma Coast — remote, windswept, and making some of the most complex Pinot Noir in California.', mustTaste: 'Pomarium Estate Pinot Noir', tip: 'Very remote. Download offline maps and fill gas before heading out.' },
  { id: 'hirsch', name: 'Hirsch Vineyards', region: 'Sonoma County', subregion: 'Sonoma Coast (Fort Ross–Seaview)', price: 'splurge', tastingCost: '$65–$100', grapes: ['pinot'], tags: ['sommelier-fave', 'remote', 'scenic', 'family-owned', 'intimate'], sfDrive: 100, googleRating: 4.9, reviewCount: '180', website: 'hirschvineyards.com', bookingNote: 'By appointment only', description: 'David Hirsch planted this extreme coastal vineyard in 1980. The wines are unlike anything else — savory, complex, wild.', mustTaste: 'Reserve Pinot Noir', tip: 'The most remote winery in Sonoma. Plan the drive carefully.' },
  { id: 'iron-horse', name: 'Iron Horse Vineyards', region: 'Sonoma County', subregion: 'Green Valley', price: 'mid', tastingCost: '$30–$55', grapes: ['sparkling', 'pinot'], tags: ['scenic', 'family-owned', 'walk-in'], sfDrive: 70, googleRating: 4.7, reviewCount: '1800', website: 'ironhorsevineyards.com', bookingNote: 'Walk-ins welcome', description: 'Outstanding sparkling wine from Green Valley with panoramic views. The outdoor tasting is relaxed and beautiful.', mustTaste: 'Wedding Cuvée', tip: 'The view from the tasting terrace is one of the best in Sonoma.' },
  { id: 'merry-edwards', name: 'Merry Edwards Winery', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$40–$70', grapes: ['pinot'], tags: ['sommelier-fave', 'intimate', 'walk-in'], sfDrive: 72, googleRating: 4.7, reviewCount: '900', website: 'merryedwards.com', bookingNote: 'Walk-ins welcome', description: 'One of the pioneering women winemakers in California. Her Sauvignon Blanc is legendary and the Pinots are exceptional.', mustTaste: 'Sauvignon Blanc', tip: 'The Sauvignon Blanc is a sleeper — one of the best in California.' },
  { id: 'gundlach-bundschu', name: 'Gundlach Bundschu', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['cab', 'pinot'], tags: ['historic', 'scenic', 'social', 'walk-in'], sfDrive: 52, googleRating: 4.6, reviewCount: '2200', website: 'gunbun.com', bookingNote: 'Walk-ins welcome', description: 'California\'s oldest family winery (1858). Fun, irreverent, with a great outdoor amphitheater and caves.', mustTaste: 'Vintage Reserve', tip: 'The cave tasting is excellent value. Near Sonoma Plaza — ideal for a day in town.' },
  { id: 'benziger', name: 'Benziger Family Winery', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['cab'], tags: ['tour', 'educational', 'scenic', 'family-owned', 'walk-in'], sfDrive: 55, googleRating: 4.6, reviewCount: '2800', website: 'benziger.com', bookingNote: 'Walk-ins welcome', description: 'A biodynamic estate with one of the best winery tours in California. The tram ride through the vineyards is outstanding.', mustTaste: 'Estate Cabernet', tip: 'The biodynamic tram tour is worth every penny. Great for learning.' },
  { id: 'kistler', name: 'Kistler Vineyards', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'splurge', tastingCost: '$75–$125', grapes: ['chardonnay', 'pinot'], tags: ['sommelier-fave', 'prestigious', 'intimate'], sfDrive: 75, googleRating: 4.9, reviewCount: '400', website: 'kistlervineyards.com', bookingNote: 'By appointment only — mailing list', description: 'One of California\'s most celebrated Chardonnay and Pinot Noir producers. Burgundian in philosophy.', mustTaste: 'Vine Hill Vineyard Chardonnay', tip: 'Extremely hard to get an appointment. Join the mailing list.' },
  { id: 'scribe', name: 'Scribe Winery', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid-splurge', tastingCost: '$45–$85', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'social'], sfDrive: 55, googleRating: 4.5, reviewCount: '1800', website: 'scribewinery.com', bookingNote: 'By appointment only — book 2+ weeks ahead', description: 'Hacienda-style estate with young, design-forward energy. The outdoor tastings with charcuterie are Instagram-famous.', mustTaste: 'Skin-contact Chardonnay', tip: 'Book well ahead — one of the hardest reservations in Sonoma.' },
  { id: 'hanzell', name: 'Hanzell Vineyards', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'splurge', tastingCost: '$75–$125', grapes: ['chardonnay', 'pinot'], tags: ['historic', 'sommelier-fave', 'intimate', 'scenic'], sfDrive: 55, googleRating: 4.8, reviewCount: '350', website: 'hanzell.com', bookingNote: 'By appointment only', description: 'Founded 1957, pioneered temperature-controlled fermentation. A living piece of wine history.', mustTaste: 'Estate Chardonnay', tip: 'The oldest continuously producing Pinot vineyard in the New World.' },
  { id: 'gloria-ferrer', name: 'Gloria Ferrer', region: 'Sonoma County', subregion: 'Carneros', price: 'mid', tastingCost: '$30–$55', grapes: ['sparkling', 'pinot'], tags: ['scenic', 'social', 'near-town', 'walk-in'], sfDrive: 50, googleRating: 4.5, reviewCount: '3200', website: 'gloriaferrer.com', bookingNote: 'Walk-ins welcome', description: 'Spanish-owned sparkling house with gorgeous Carneros views. Terrace with bubbly is quintessential Sonoma.', mustTaste: 'Royal Cuvée Brut', tip: 'Start your day here — sparkling wine with the morning view is unforgettable.' },
  { id: 'st-francis', name: 'St. Francis Winery', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid', tastingCost: '$25–$55', grapes: ['cab', 'zin'], tags: ['scenic', 'social', 'near-town', 'walk-in'], sfDrive: 55, googleRating: 4.6, reviewCount: '2800', website: 'stfranciswinery.com', bookingNote: 'Walk-ins welcome', description: 'Beautiful bell tower estate with Sonoma Mountain views. The food and wine pairing experience is one of the best values.', mustTaste: 'Old Vines Zinfandel', tip: 'The food pairing lunch is exceptional value.' },
  { id: 'dutton-goldfield', name: 'Dutton-Goldfield', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['pinot', 'chardonnay'], tags: ['family-owned', 'educational', 'intimate', 'walk-in'], sfDrive: 72, googleRating: 4.7, reviewCount: '600', website: 'duttongoldfield.com', bookingNote: 'Walk-ins welcome', description: 'Partnership between legendary grower Steve Dutton and winemaker Dan Goldfield. Fantastic Pinot at honest prices.', mustTaste: 'Dutton Ranch Pinot Noir', tip: 'World-class wines without the Napa markup.' },
  { id: 'failla', name: 'Failla Wines', region: 'Sonoma County', subregion: 'Sonoma Coast', price: 'mid-splurge', tastingCost: '$55–$100', grapes: ['pinot'], tags: ['sommelier-fave', 'intimate', 'family-owned'], sfDrive: 85, googleRating: 4.8, reviewCount: '500', website: 'faillaestates.com', bookingNote: 'By appointment only', description: 'Ehren Jordan makes critically lauded Pinot Noir and Syrah. Precise, savory, built for the dinner table.', mustTaste: 'Sonoma Coast Pinot Noir', tip: 'A sommelier favorite — the wines are refined and food-friendly.' },

  // === HEALDSBURG ===
  { id: 'a-rafanelli', name: 'A. Rafanelli Winery', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$25–$40', grapes: ['zin', 'cab'], tags: ['family-owned', 'intimate', 'sommelier-fave'], sfDrive: 80, googleRating: 4.9, reviewCount: '500', website: 'arafanelliwinery.com', bookingNote: 'By appointment only — call to arrange', description: 'The holy grail of Dry Creek Zinfandel. Three generations of family winemaking, no frills, extraordinary quality.', mustTaste: 'Dry Creek Zinfandel', tip: 'Call well ahead — this is one of the most coveted appointments in Sonoma.' },
  { id: 'unti', name: 'Unti Vineyards', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$20–$35', grapes: ['zin'], tags: ['family-owned', 'intimate', 'casual'], sfDrive: 80, googleRating: 4.8, reviewCount: '400', website: 'untivineyards.com', bookingNote: 'By appointment recommended', description: 'Mick Unti makes outstanding Mediterranean varieties — Grenache, Mourvèdre, Sangiovese — in Dry Creek.', mustTaste: 'Grenache', tip: 'If you love Rhône varieties, Unti is a must-visit.' },
  { id: 'seghesio', name: 'Seghesio Family Vineyards', region: 'Healdsburg', subregion: 'Alexander Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['zin'], tags: ['family-owned', 'historic', 'near-town', 'walk-in'], sfDrive: 78, googleRating: 4.6, reviewCount: '1200', website: 'seghesio.com', bookingNote: 'Walk-ins welcome in Healdsburg tasting room', description: 'Five generations of Italian-American winemaking. Their old-vine Zinfandel is a Sonoma benchmark.', mustTaste: 'Old Vine Zinfandel', tip: 'The tasting room on the Healdsburg plaza is convenient and welcoming.' },
  { id: 'jordan', name: 'Jordan Vineyard & Winery', region: 'Healdsburg', subregion: 'Alexander Valley', price: 'mid-splurge', tastingCost: '$45–$80', grapes: ['cab'], tags: ['prestigious', 'scenic', 'tour'], sfDrive: 82, googleRating: 4.7, reviewCount: '1500', website: 'jordanwinery.com', bookingNote: 'By appointment only', description: 'A Bordeaux-inspired château making elegant Cabernet at a fraction of comparable Napa prices. The estate tour is exceptional.', mustTaste: 'Alexander Valley Cabernet', tip: 'The estate tour with food pairings is one of the best in all of wine country.' },
  { id: 'dry-creek-vineyard', name: 'Dry Creek Vineyard', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['zin'], tags: ['family-owned', 'scenic', 'casual', 'walk-in'], sfDrive: 80, googleRating: 4.6, reviewCount: '1500', website: 'drycreekvineyard.com', bookingNote: 'Walk-ins welcome', description: 'The winery that made Dry Creek Valley famous for Zinfandel. Relaxed, picnic-friendly grounds.', mustTaste: 'Heritage Vines Zinfandel', tip: 'Great for a relaxed afternoon with a picnic on the lawn.' },
  { id: 'ridge-lytton', name: 'Ridge Lytton Springs', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['zin'], tags: ['sommelier-fave', 'historic', 'educational', 'walk-in'], sfDrive: 80, googleRating: 4.7, reviewCount: '900', website: 'ridgewine.com', bookingNote: 'Walk-ins welcome weekdays', description: 'Ridge\'s Lytton Springs Zinfandel blend is legendary. No-frills tasting room — all about the wine.', mustTaste: 'Lytton Springs', tip: 'A sommelier pilgrimage. The wine speaks for itself.' },
  { id: 'flowers', name: 'Flowers Vineyard & Winery', region: 'Healdsburg', subregion: 'Sonoma Coast', price: 'mid-splurge', tastingCost: '$45–$80', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'sommelier-fave', 'remote'], sfDrive: 85, googleRating: 4.7, reviewCount: '700', website: 'flowerswinery.com', bookingNote: 'By appointment — book online', description: 'Estate is on a remote coastal ridge but tasting is done in Healdsburg. Some of the most dramatic coastal Pinot in California.', mustTaste: 'Sonoma Coast Pinot Noir', tip: 'The Healdsburg tasting room is in town — no need to drive to the ridge.' },
  { id: 'ferrari-carano', name: 'Ferrari-Carano', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['cab', 'chardonnay'], tags: ['scenic', 'social', 'walk-in', 'near-town'], sfDrive: 78, googleRating: 4.5, reviewCount: '3200', website: 'ferrari-carano.com', bookingNote: 'Walk-ins welcome', description: 'Italian-inspired estate with stunning gardens and a wide range of wines. One of the most photogenic wineries.', mustTaste: 'Trésor Red Blend', tip: 'Walk the gardens — spectacular in spring and summer.' },
  { id: 'mauritson', name: 'Mauritson Wines', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['zin'], tags: ['family-owned', 'intimate', 'near-town', 'walk-in'], sfDrive: 80, googleRating: 4.8, reviewCount: '500', website: 'mauritsonwines.com', bookingNote: 'Walk-ins welcome', description: 'Six generations of Sonoma farming. Outstanding Zinfandel from heritage vineyards.', mustTaste: 'Rockpile Zinfandel', tip: 'Ask about the family history — six generations on the same land.' },
  { id: 'papapietro-perry', name: 'Papapietro Perry', region: 'Healdsburg', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['pinot'], tags: ['intimate', 'family-owned', 'sommelier-fave'], sfDrive: 78, googleRating: 4.8, reviewCount: '400', website: 'papapietro-perry.com', bookingNote: 'By appointment recommended', description: 'Small husband-and-wife Pinot Noir specialist. Hand-crafted, personal, remarkably consistent.', mustTaste: '777 Clones Pinot Noir', tip: 'Tiny tasting room, big wines. Best-kept Pinot secret in the region.' },
  { id: 'medlock-ames', name: 'Medlock Ames', region: 'Healdsburg', subregion: 'Alexander Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['cab', 'merlot'], tags: ['scenic', 'casual', 'family-owned', 'walk-in'], sfDrive: 82, googleRating: 4.7, reviewCount: '600', website: 'medlockames.com', bookingNote: 'Walk-ins welcome', description: 'Organic estate with a bar in a converted historic schoolhouse. Relaxed and friendly.', mustTaste: 'Bell Mountain Cabernet', tip: 'The old schoolhouse bar is charming.' },
  { id: 'stonestreet', name: 'Stonestreet Estate', region: 'Healdsburg', subregion: 'Alexander Valley', price: 'mid-splurge', tastingCost: '$45–$85', grapes: ['cab', 'chardonnay'], tags: ['scenic', 'remote', 'prestigious'], sfDrive: 85, googleRating: 4.7, reviewCount: '600', website: 'stonestreet.com', bookingNote: 'By appointment only', description: '5,000-acre mountain estate at 2,400 feet. Dramatic drive, mountain-grown wines unlike the valley below.', mustTaste: 'Upper Barn Chardonnay', tip: 'The mountain tour is unforgettable — tasting at cloud level.' },

  // === PASO ROBLES ===
  { id: 'saxum', name: 'Saxum Vineyards', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'splurge', tastingCost: '$60–$100', grapes: ['cab'], tags: ['sommelier-fave', 'scenic', 'remote', 'intimate'], sfDrive: 210, googleRating: 4.9, reviewCount: '300', website: 'saxumvineyards.com', bookingNote: 'By appointment only — mailing list', description: 'Justin Smith makes some of the most extraordinary wines in California. Allocation only and worth every effort.', mustTaste: 'James Berry Vineyard', tip: 'The most sought-after wines in Paso — join the mailing list immediately.' },
  { id: 'tablas-creek', name: 'Tablas Creek Vineyard', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$25–$50', grapes: ['cab'], tags: ['educational', 'scenic', 'family-owned', 'walk-in'], sfDrive: 210, googleRating: 4.7, reviewCount: '1500', website: 'tablascreek.com', bookingNote: 'Walk-ins welcome', description: 'Partnership between the Perrins of Château de Beaucastel and importer Robert Haas. The American Rhône benchmark.', mustTaste: 'Esprit de Tablas', tip: 'The farm tour is excellent for understanding Rhône varieties in California.' },
  { id: 'justin', name: 'JUSTIN Vineyards', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$30–$60', grapes: ['cab'], tags: ['scenic', 'tour', 'commercial', 'walk-in'], sfDrive: 210, googleRating: 4.6, reviewCount: '3500', website: 'justinwine.com', bookingNote: 'Walk-ins welcome', description: 'Paso\'s most well-known winery with a luxury inn and restaurant on-site. Isosceles is the flagship Bordeaux blend.', mustTaste: 'Isosceles', tip: 'Stay the night at the JUST Inn for the full estate experience.' },
  { id: 'daou', name: 'DAOU Vineyards', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$35–$75', grapes: ['cab'], tags: ['scenic', 'prestigious', 'commercial'], sfDrive: 210, googleRating: 4.7, reviewCount: '2800', website: 'daouvineyards.com', bookingNote: 'By appointment recommended', description: 'Mountaintop estate with 360-degree views and serious Cabernet. The tasting room feels like a resort.', mustTaste: 'Soul of a Lion', tip: 'The hilltop view at sunset is spectacular.' },
  { id: 'epoch', name: 'Epoch Estate Wines', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$30–$60', grapes: ['cab'], tags: ['scenic', 'family-owned', 'intimate'], sfDrive: 210, googleRating: 4.8, reviewCount: '600', website: 'epochwines.com', bookingNote: 'By appointment recommended', description: 'Small-production westside estate with ancient ocean-floor soils. Elegant wines with real sense of place.', mustTaste: 'Ingenuity Red Blend', tip: 'The soil story here is fascinating — ask about the limestone.' },
  { id: 'halter-ranch', name: 'Halter Ranch', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$25–$50', grapes: ['cab'], tags: ['scenic', 'tour', 'family-owned', 'walk-in'], sfDrive: 215, googleRating: 4.7, reviewCount: '1200', website: 'halterranch.com', bookingNote: 'Walk-ins welcome', description: 'A 2,000-acre ranch with an ancestral oak tree, sustainable farming, and excellent estate wines.', mustTaste: 'Ancestor Estate Red', tip: 'The ranch tour is a unique California experience.' },
  { id: 'calcareous', name: 'Calcareous Vineyard', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$20–$40', grapes: ['cab'], tags: ['scenic', 'casual', 'walk-in'], sfDrive: 215, googleRating: 4.7, reviewCount: '1000', website: 'calcareous.com', bookingNote: 'Walk-ins welcome', description: 'Named for the limestone soils. Great value wines with stunning westside hilltop views.', mustTaste: 'Estate Syrah', tip: 'Excellent value and the view from the terrace is wonderful.' },
  { id: 'booker', name: 'Booker Vineyard', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'splurge', tastingCost: '$50–$100', grapes: ['cab'], tags: ['sommelier-fave', 'intimate', 'remote'], sfDrive: 210, googleRating: 4.9, reviewCount: '300', website: 'bookerwines.com', bookingNote: 'By appointment only — mailing list', description: 'Eric Jensen makes some of the most sought-after wines in Paso. Dark, brooding reds. Allocation-based.', mustTaste: 'My Favorite Neighbor', tip: 'Join the mailing list — intimate and special.' },
  { id: 'denner', name: 'Denner Vineyards', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$40–$75', grapes: ['cab'], tags: ['scenic', 'prestigious', 'tour'], sfDrive: 210, googleRating: 4.8, reviewCount: '800', website: 'dennervineyards.com', bookingNote: 'By appointment recommended', description: 'Spectacular estate with limestone caves and panoramic views. Serious wines at a fraction of Napa prices.', mustTaste: 'The Ditch Digger', tip: 'The cave tour and hilltop sunset are exceptional.' },
  { id: 'adelaida', name: 'Adelaida Vineyards', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$25–$50', grapes: ['cab', 'pinot'], tags: ['scenic', 'family-owned', 'remote', 'walk-in'], sfDrive: 215, googleRating: 4.7, reviewCount: '600', website: 'adelaida.com', bookingNote: 'Walk-ins welcome', description: 'High-elevation estate with limestone soils producing elegant wines that defy Paso stereotypes.', mustTaste: 'Viking Estate Pinot Noir', tip: 'The elevation wines are unlike anything else in Paso.' },
  { id: 'eberle', name: 'Eberle Winery', region: 'Paso Robles', subregion: 'Eastside', price: 'mid', tastingCost: '$15–$35', grapes: ['cab'], tags: ['tour', 'walk-in', 'near-town', 'casual'], sfDrive: 200, googleRating: 4.6, reviewCount: '2500', website: 'eberlewinery.com', bookingNote: 'Walk-ins welcome; cave tours free', description: 'Pioneer of Paso Robles. Free cave tours and generous tastings. No pretense, just good wine.', mustTaste: 'Estate Cabernet', tip: 'Free cave tour — best value in wine country.' },
  { id: 'niner', name: 'Niner Wine Estates', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$25–$50', grapes: ['cab'], tags: ['scenic', 'social', 'walk-in'], sfDrive: 210, googleRating: 4.7, reviewCount: '1500', website: 'ninerwine.com', bookingNote: 'Walk-ins welcome; restaurant on-site', description: 'Sustainable estate with beautiful restaurant and panoramic views. Great lunch-and-wine experience.', mustTaste: 'Heart Hill Cabernet', tip: 'The on-site restaurant is excellent — plan lunch here.' },
  { id: 'linne-calodo', name: 'Linne Calodo', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'splurge', tastingCost: '$50–$80', grapes: ['cab'], tags: ['sommelier-fave', 'intimate'], sfDrive: 210, googleRating: 4.9, reviewCount: '250', website: 'linnecalodo.com', bookingNote: 'By appointment only', description: 'Matt Trevisan makes powerful Rhône and Bordeaux blends. Allocation-only, consistently top producer.', mustTaste: 'Problem Child', tip: 'Fun wine names, serious wines. Buy what you can.' },
  { id: 'cass', name: 'Cass Winery', region: 'Paso Robles', subregion: 'Templeton Gap', price: 'mid', tastingCost: '$25–$50', grapes: ['cab'], tags: ['scenic', 'social', 'walk-in'], sfDrive: 200, googleRating: 4.6, reviewCount: '1800', website: 'casswines.com', bookingNote: 'Walk-ins welcome', description: 'Beautiful estate with café, bocce courts, and relaxed resort vibe. One of the best lunch spots in Paso.', mustTaste: 'Backbone Syrah', tip: 'Come for lunch — the café is outstanding.' },

  // === OTHER REGIONS ===
  { id: 'ridge-monte-bello', name: 'Ridge Monte Bello', region: 'Santa Cruz Mountains', subregion: 'Monte Bello Ridge', price: 'splurge', tastingCost: '$50–$100', grapes: ['cab'], tags: ['sommelier-fave', 'scenic', 'historic', 'remote'], sfDrive: 55, googleRating: 4.8, reviewCount: '1200', website: 'ridgewine.com', bookingNote: 'Walk-ins welcome weekends', description: 'One of the greatest wines in the world, made on a mountain ridge above Silicon Valley. The view is breathtaking.', mustTaste: 'Monte Bello Cabernet', tip: 'Narrow mountain road but the views and wine are world-class.' },
  { id: 'wente', name: 'Wente Vineyards', region: 'Livermore Valley', subregion: 'Livermore Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['chardonnay'], tags: ['historic', 'commercial', 'scenic', 'walk-in'], sfDrive: 45, googleRating: 4.5, reviewCount: '2800', website: 'wentevineyards.com', bookingNote: 'Walk-ins welcome', description: 'America\'s oldest continuously operating family winery. The Wente clone of Chardonnay is planted throughout California.', mustTaste: 'Riva Ranch Chardonnay', tip: 'The closest quality wine country to SF — easy day trip from the East Bay.' },
  { id: 'goldeneye', name: 'Goldeneye Winery', region: 'Anderson Valley', subregion: 'Anderson Valley', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['pinot'], tags: ['scenic', 'intimate', 'walk-in'], sfDrive: 130, googleRating: 4.7, reviewCount: '800', website: 'goldeneyewinery.com', bookingNote: 'Walk-ins welcome', description: 'Duckhorn\'s Anderson Valley outpost making exceptional cool-climate Pinot Noir in a beautiful setting.', mustTaste: 'Confluence Vineyard Pinot Noir', tip: 'Anderson Valley is a hidden gem — far fewer crowds than Napa or Sonoma.' },
  { id: 'navarro', name: 'Navarro Vineyards', region: 'Anderson Valley', subregion: 'Anderson Valley', price: 'budget', tastingCost: 'Free', grapes: ['pinot'], tags: ['family-owned', 'intimate', 'casual', 'walk-in'], sfDrive: 165, googleRating: 4.8, reviewCount: '1200', website: 'navarrowine.com', bookingNote: 'Walk-ins always welcome — tastes are free', description: 'Anderson Valley institution since 1974. Impeccable Gewürztraminer, Pinot Gris, Pinot Noir. Zero pretense.', mustTaste: 'Méthode à l\'Ancienne Pinot Noir', tip: 'Free tastes — the most generous hospitality in wine country. Their mailing list ships directly.' },
  // ═══ ADDITIONAL NAPA VALLEY (50 more) ═══
  { id: 'pine-ridge', name: 'Pine Ridge Vineyards', region: 'Napa Valley', subregion: 'Stags Leap District', price: 'mid-splurge', tastingCost: '$45–$90', grapes: ['cab'], tags: ['scenic', 'educational', 'intimate'], sfDrive: 78, googleRating: 4.6, reviewCount: '1200', website: 'pineridgevineyards.com', bookingNote: 'By appointment recommended', description: 'Elegant Stags Leap Cabernet from volcanic soils. Cave tours are excellent and less crowded than neighbors.', mustTaste: 'Stags Leap District Cabernet', tip: 'The cave tour is excellent value.' },
  { id: 'rutherford-hill', name: 'Rutherford Hill', region: 'Napa Valley', subregion: 'Rutherford', price: 'mid', tastingCost: '$40–$70', grapes: ['cab', 'merlot'], tags: ['scenic', 'tour', 'near-town', 'walk-in'], sfDrive: 80, googleRating: 4.5, reviewCount: '2200', website: 'rutherfordhill.com', bookingNote: 'Walk-ins welcome', description: 'Known for exceptional Merlot and one of Napa\'s most impressive cave systems. Hilltop views outstanding.', mustTaste: 'Reserve Merlot', tip: 'The cave tour is one of the best in Napa.' },
  { id: 'charles-krug', name: 'Charles Krug', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid', tastingCost: '$40–$65', grapes: ['cab'], tags: ['historic', 'family-owned', 'tour', 'walk-in'], sfDrive: 85, googleRating: 4.5, reviewCount: '1900', website: 'charleskrug.com', bookingNote: 'Walk-ins welcome', description: 'Napa\'s oldest winery (1861), run by the Peter Mondavi family. Understated, great value.', mustTaste: 'Vintage Selection Cabernet', tip: 'Great value for Napa — reserves punch above their price.' },
  { id: 'peju', name: 'PEJU Province Winery', region: 'Napa Valley', subregion: 'Rutherford', price: 'mid', tastingCost: '$35–$65', grapes: ['cab'], tags: ['family-owned', 'scenic', 'near-town', 'walk-in'], sfDrive: 80, googleRating: 4.5, reviewCount: '2800', website: 'peju.com', bookingNote: 'Walk-ins welcome', description: 'Colorful, family-run winery with beautiful gardens and a 50-foot tower. One of the most welcoming stops.', mustTaste: 'Province Cabernet', tip: 'Great for first-timers — warm staff, beautiful grounds.' },
  { id: 'paraduxx', name: 'Paraduxx', region: 'Napa Valley', subregion: 'Yountville', price: 'mid-splurge', tastingCost: '$45–$80', grapes: ['cab'], tags: ['scenic', 'social', 'near-town', 'walk-in'], sfDrive: 75, googleRating: 4.6, reviewCount: '900', website: 'paraduxx.com', bookingNote: 'Walk-ins welcome', description: 'Duckhorn\'s red blend label with terrace, bocce courts, and relaxed Yountville vibe.', mustTaste: 'Proprietary Red Blend', tip: 'Come for the terrace and bocce — most fun, relaxed spot in the valley.' },
  { id: 'whitehall-lane', name: 'Whitehall Lane', region: 'Napa Valley', subregion: 'Rutherford', price: 'mid', tastingCost: '$35–$60', grapes: ['cab'], tags: ['family-owned', 'near-town', 'walk-in'], sfDrive: 82, googleRating: 4.6, reviewCount: '1100', website: 'whitehalllane.com', bookingNote: 'Walk-ins welcome', description: 'Family-owned Rutherford estate making approachable, fruit-forward Cabernet at fair prices.', mustTaste: 'Leonardini Cabernet', tip: 'Solid Napa Cab without the attitude or price of neighbors.' },
  { id: 'acacia', name: 'Acacia Vineyard', region: 'Napa Valley', subregion: 'Carneros', price: 'mid', tastingCost: '$30–$50', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'intimate', 'walk-in'], sfDrive: 55, googleRating: 4.5, reviewCount: '600', website: 'acaciavineyard.com', bookingNote: 'Walk-ins welcome', description: 'Carneros specialist with elegant Pinot Noir and Chardonnay. Peaceful, uncrowded, beautiful views.', mustTaste: 'Carneros Pinot Noir', tip: 'A quiet alternative to the crowded Napa Valley floor.' },
  { id: 'etude', name: 'Etude Wines', region: 'Napa Valley', subregion: 'Carneros', price: 'mid-splurge', tastingCost: '$40–$75', grapes: ['pinot', 'cab'], tags: ['educational', 'intimate', 'scenic'], sfDrive: 55, googleRating: 4.6, reviewCount: '700', website: 'etudewines.com', bookingNote: 'Appointments recommended', description: 'Founded by Tony Soter, now making refined Carneros Pinot and Napa Cab. Thoughtful, terroir-driven wines.', mustTaste: 'Grace Benoist Ranch Pinot Noir', tip: 'The comparative tasting is educational and delicious.' },
  { id: 'markham', name: 'Markham Vineyards', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid', tastingCost: '$30–$55', grapes: ['cab', 'merlot'], tags: ['historic', 'near-town', 'walk-in'], sfDrive: 85, googleRating: 4.4, reviewCount: '800', website: 'markhamvineyards.com', bookingNote: 'Walk-ins welcome', description: 'Historic stone winery (1874) making reliable Napa Cabernet at reasonable prices.', mustTaste: 'Reserve Cabernet', tip: 'Good value in an expensive neighborhood.' },
  { id: 'freemark-abbey', name: 'Freemark Abbey', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid-splurge', tastingCost: '$40–$75', grapes: ['cab'], tags: ['historic', 'educational', 'prestigious'], sfDrive: 85, googleRating: 4.6, reviewCount: '900', website: 'freemarkabbey.com', bookingNote: 'By appointment recommended', description: 'One of the original Napa wineries (1886). Was in the famous 1976 Judgment of Paris tasting. Serious, age-worthy wines.', mustTaste: 'Sycamore Vineyard Cabernet', tip: 'Ask about the Judgment of Paris connection — real Napa history.' },
  { id: 'stags-leap-winery', name: 'Stags\' Leap Winery', region: 'Napa Valley', subregion: 'Stags Leap District', price: 'mid-splurge', tastingCost: '$50–$85', grapes: ['cab', 'petite sirah'], tags: ['historic', 'scenic', 'intimate'], sfDrive: 75, googleRating: 4.7, reviewCount: '800', website: 'stagsleap.com', bookingNote: 'By appointment', description: 'Not to be confused with Stag\'s Leap Wine Cellars — this is the other historic estate. Beautiful manor house and outstanding Petite Sirah.', mustTaste: 'The Leap Cabernet', tip: 'The Petite Sirah is a hidden gem — one of the best in California.' },
  { id: 'chateau-montelena', name: 'Chateau Montelena', region: 'Napa Valley', subregion: 'Calistoga', price: 'mid-splurge', tastingCost: '$50–$85', grapes: ['cab', 'chardonnay'], tags: ['historic', 'scenic', 'prestigious'], sfDrive: 95, googleRating: 4.7, reviewCount: '2400', website: 'montelena.com', bookingNote: 'By appointment recommended', description: 'The Chardonnay that won the 1976 Judgment of Paris. A stone castle with Chinese gardens and a lake. Iconic.', mustTaste: 'Estate Cabernet', tip: 'Walk the Chinese gardens — stunning setting for a Napa winery.' },
  { id: 'cliff-lede', name: 'Cliff Lede Vineyards', region: 'Napa Valley', subregion: 'Stags Leap District', price: 'splurge', tastingCost: '$60–$100', grapes: ['cab'], tags: ['prestigious', 'scenic', 'intimate'], sfDrive: 75, googleRating: 4.7, reviewCount: '1000', website: 'cliffledevineyards.com', bookingNote: 'By appointment only', description: 'Rock-and-roll themed Stags Leap estate. Each vineyard block named after a classic rock song. Serious wine, fun spirit.', mustTaste: 'Poetry Cabernet', tip: 'The rock music theme carries through everything — unique and memorable.' },
  { id: 'silverado-vineyards', name: 'Silverado Vineyards', region: 'Napa Valley', subregion: 'Stags Leap District', price: 'mid', tastingCost: '$40–$65', grapes: ['cab'], tags: ['scenic', 'family-owned', 'walk-in'], sfDrive: 75, googleRating: 4.6, reviewCount: '1500', website: 'silveradovineyards.com', bookingNote: 'Walk-ins welcome', description: 'Disney family-owned estate with sweeping valley views. Consistently good Cab at fair Napa prices.', mustTaste: 'SOLO Cabernet', tip: 'The hilltop terrace view is one of the best free views in Napa.' },
  { id: 'groth', name: 'Groth Vineyards', region: 'Napa Valley', subregion: 'Oakville', price: 'mid-splurge', tastingCost: '$50–$80', grapes: ['cab'], tags: ['prestigious', 'intimate', 'family-owned'], sfDrive: 80, googleRating: 4.7, reviewCount: '600', website: 'grothwines.com', bookingNote: 'By appointment only', description: 'First Napa Cabernet to receive 100 points from Robert Parker (1985 Reserve). Quiet, understated excellence.', mustTaste: 'Reserve Cabernet', tip: 'A 100-point winery without the 100-point attitude.' },
  { id: 'honig', name: 'Honig Vineyard', region: 'Napa Valley', subregion: 'Rutherford', price: 'mid', tastingCost: '$35–$55', grapes: ['cab'], tags: ['family-owned', 'educational', 'intimate'], sfDrive: 80, googleRating: 4.7, reviewCount: '700', website: 'honigwine.com', bookingNote: 'By appointment', description: 'Sustainable, solar-powered family winery. Their Sauvignon Blanc is one of the best in Napa. Low-key and personal.', mustTaste: 'Rutherford Cabernet', tip: 'The Sauvignon Blanc is outstanding and way under the radar.' },
  { id: 'hall-rutherford', name: 'HALL Rutherford', region: 'Napa Valley', subregion: 'Rutherford', price: 'splurge', tastingCost: '$75–$125', grapes: ['cab'], tags: ['prestigious', 'scenic', 'tour'], sfDrive: 82, googleRating: 4.7, reviewCount: '600', website: 'hallwines.com', bookingNote: 'By appointment only', description: 'HALL\'s mountain estate with stunning Austrian-designed caves carved into the hillside. Premium, concentrated Cabernet.', mustTaste: 'Kathryn Hall Cabernet', tip: 'The cave experience at Rutherford is more intimate than the St. Helena location.' },
  { id: 'louis-martini', name: 'Louis M. Martini', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid', tastingCost: '$30–$55', grapes: ['cab'], tags: ['historic', 'commercial', 'walk-in'], sfDrive: 85, googleRating: 4.5, reviewCount: '1200', website: 'louismartini.com', bookingNote: 'Walk-ins welcome', description: 'A storied Napa name since 1933. Now owned by Gallo but the heritage wines, especially Monte Rosso, remain excellent.', mustTaste: 'Monte Rosso Cabernet', tip: 'Monte Rosso vineyard wines are the gems — ask specifically for those.' },
  { id: 'flora-springs', name: 'Flora Springs', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid', tastingCost: '$35–$60', grapes: ['cab'], tags: ['family-owned', 'intimate', 'near-town'], sfDrive: 85, googleRating: 4.6, reviewCount: '500', website: 'florasprings.com', bookingNote: 'By appointment recommended', description: 'Three-generation family winery in a beautifully restored stone cellar. Trilogy red blend is the flagship.', mustTaste: 'Trilogy', tip: 'The stone cellar tasting room has real charm.' },
  { id: 'nickel-and-nickel', name: 'Nickel & Nickel', region: 'Napa Valley', subregion: 'Oakville', price: 'splurge', tastingCost: '$75–$125', grapes: ['cab'], tags: ['prestigious', 'intimate', 'scenic'], sfDrive: 80, googleRating: 4.8, reviewCount: '500', website: 'nickelandnickel.com', bookingNote: 'By appointment only', description: 'Single-vineyard specialists — every wine is from one vineyard, one variety. A beautifully restored 1880s farmstead.', mustTaste: 'John C. Sullenger Cabernet', tip: 'The single-vineyard comparison is one of the most educational tastings in Napa.' },
  { id: 'la-jota', name: 'La Jota Vineyard', region: 'Napa Valley', subregion: 'Howell Mountain', price: 'splurge', tastingCost: '$60–$100', grapes: ['cab'], tags: ['sommelier-fave', 'remote', 'intimate', 'historic'], sfDrive: 92, googleRating: 4.8, reviewCount: '250', website: 'lajotavineyardco.com', bookingNote: 'By appointment only', description: 'One of Howell Mountain\'s original estates (1890s). Powerful, structured mountain Cabernet that ages beautifully.', mustTaste: 'Howell Mountain Cabernet', tip: 'A sommelier pilgrimage on Howell Mountain — these wines need time.' },
  { id: 'anderson-conn', name: 'Anderson\'s Conn Valley', region: 'Napa Valley', subregion: 'St. Helena', price: 'mid-splurge', tastingCost: '$40–$70', grapes: ['cab'], tags: ['family-owned', 'intimate', 'remote'], sfDrive: 88, googleRating: 4.7, reviewCount: '300', website: 'connvalleyvineyards.com', bookingNote: 'By appointment only', description: 'Hidden in a small valley east of St. Helena. Todd Anderson makes serious estate Cab in complete obscurity.', mustTaste: 'Estate Reserve Cabernet', tip: 'If you want to feel like you discovered something nobody knows about, come here.' },
  { id: 'cain', name: 'Cain Vineyard', region: 'Napa Valley', subregion: 'Spring Mountain District', price: 'mid-splurge', tastingCost: '$50–$80', grapes: ['cab'], tags: ['remote', 'scenic', 'intimate', 'sommelier-fave'], sfDrive: 90, googleRating: 4.7, reviewCount: '200', website: 'cainfive.com', bookingNote: 'By appointment only', description: 'A mountain estate making one of Napa\'s most intellectual Bordeaux blends. The view from the tasting room is jaw-dropping.', mustTaste: 'Cain Five', tip: 'The mountain drive is an adventure — the view at the top is the reward.' },
  { id: 'viader', name: 'Viader Vineyards', region: 'Napa Valley', subregion: 'Howell Mountain', price: 'splurge', tastingCost: '$65–$100', grapes: ['cab'], tags: ['intimate', 'family-owned', 'sommelier-fave', 'remote'], sfDrive: 92, googleRating: 4.8, reviewCount: '250', website: 'viader.com', bookingNote: 'By appointment only', description: 'Delia Viader\'s steep hillside vineyard produces one of Napa\'s most elegant Cabernet blends. Argentine-born, Bordeaux-trained.', mustTaste: 'VIADER', tip: 'One of the few women founders in Napa\'s top tier.' },
  { id: 'swanson', name: 'Swanson Vineyards', region: 'Napa Valley', subregion: 'Rutherford', price: 'mid-splurge', tastingCost: '$45–$80', grapes: ['cab'], tags: ['intimate', 'scenic'], sfDrive: 80, googleRating: 4.5, reviewCount: '400', website: 'swansonvineyards.com', bookingNote: 'By appointment', description: 'Known for an unconventional salon-style tasting experience. Quirky, elegant, and memorable.', mustTaste: 'Alexis Cabernet', tip: 'The salon experience is unlike any other tasting in Napa.' },
  // ═══ ADDITIONAL SONOMA COUNTY (50 more) ═══
  { id: 'macrostie', name: 'MacRostie Winery', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$30–$55', grapes: ['chardonnay', 'pinot'], tags: ['scenic', 'intimate', 'near-town'], sfDrive: 70, googleRating: 4.7, reviewCount: '900', website: 'macrostiewinery.com', bookingNote: 'Walk-ins welcome', description: 'Hilltop estate with panoramic vineyard views and elegant, food-friendly wines. The terrace is spectacular.', mustTaste: 'Wildcat Mountain Chardonnay', tip: 'Grab a terrace seat for sunset — incredible view.' },
  { id: 'deloach', name: 'DeLoach Vineyards', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$25–$45', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'casual', 'walk-in', 'educational'], sfDrive: 72, googleRating: 4.6, reviewCount: '1200', website: 'deloachvineyards.com', bookingNote: 'Walk-ins welcome', description: 'Biodynamic estate with gardens, beehives, chickens. Great intro to natural winemaking.', mustTaste: 'OFS Pinot Noir', tip: 'Ask about the biodynamic practices — fascinating garden tour.' },
  { id: 'sonoma-cutrer', name: 'Sonoma-Cutrer', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$30–$50', grapes: ['chardonnay', 'pinot'], tags: ['scenic', 'commercial', 'walk-in'], sfDrive: 70, googleRating: 4.6, reviewCount: '1800', website: 'sonomacutrer.com', bookingNote: 'Walk-ins welcome', description: 'One of America\'s most popular Chardonnays. Beautiful estate with a croquet lawn.', mustTaste: 'Russian River Ranches Chardonnay', tip: 'Play croquet on the lawn between tastings — free and fun.' },
  { id: 'ramey', name: 'Ramey Wine Cellars', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$45–$80', grapes: ['chardonnay', 'cab'], tags: ['sommelier-fave', 'educational', 'intimate'], sfDrive: 75, googleRating: 4.8, reviewCount: '350', website: 'rameywine.com', bookingNote: 'By appointment only', description: 'David Ramey trained in Burgundy — his Chardonnays are among the most Burgundian in California.', mustTaste: 'Ritchie Vineyard Chardonnay', tip: 'The comparative tasting is brilliant for understanding vineyard sites.' },
  { id: 'patz-hall', name: 'Patz & Hall', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid-splurge', tastingCost: '$40–$70', grapes: ['pinot', 'chardonnay'], tags: ['sommelier-fave', 'intimate', 'educational'], sfDrive: 55, googleRating: 4.7, reviewCount: '500', website: 'patzhall.com', bookingNote: 'By appointment only', description: 'Single-vineyard specialist sourcing from the best sites in Sonoma. Thoughtful, terroir-driven.', mustTaste: 'Hyde Vineyard Chardonnay', tip: 'Single-vineyard comparison tasting is educational and delicious.' },
  { id: 'kunde', name: 'Kunde Family Winery', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid', tastingCost: '$25–$45', grapes: ['cab', 'chardonnay'], tags: ['family-owned', 'scenic', 'walk-in', 'casual'], sfDrive: 58, googleRating: 4.6, reviewCount: '2100', website: 'kunde.com', bookingNote: 'Walk-ins welcome', description: 'Five generations on 1,850 acres. The mountaintop ATV tour has 360-degree views.', mustTaste: 'Century Vines Zinfandel', tip: 'Book the mountaintop ATV tour — best views in Sonoma.' },
  { id: 'ravenswood', name: 'Ravenswood Winery', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'budget', tastingCost: '$20–$35', grapes: ['zin'], tags: ['historic', 'casual', 'near-town', 'walk-in'], sfDrive: 55, googleRating: 4.4, reviewCount: '1500', website: 'ravenswood-wine.com', bookingNote: 'Walk-ins welcome', description: '"No Wimpy Wines" — put old-vine Zinfandel on the map. Affordable and unapologetically bold.', mustTaste: 'Old Vine Zinfandel', tip: 'Great for Zin lovers on a budget.' },
  { id: 'buena-vista', name: 'Buena Vista Winery', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid', tastingCost: '$30–$55', grapes: ['chardonnay', 'pinot'], tags: ['historic', 'tour', 'near-town', 'walk-in'], sfDrive: 52, googleRating: 4.4, reviewCount: '2500', website: 'buenavistawinery.com', bookingNote: 'Walk-ins welcome', description: 'California\'s first premium winery (1857). The historic cave tours are fascinating.', mustTaste: 'The Count Founder\'s Red', tip: 'Walk through the oldest wine caves in California.' },
  { id: 'walter-hansel', name: 'Walter Hansel Winery', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$30–$50', grapes: ['pinot', 'chardonnay'], tags: ['family-owned', 'intimate', 'sommelier-fave'], sfDrive: 72, googleRating: 4.8, reviewCount: '250', website: 'walterhanselwinery.com', bookingNote: 'By appointment only', description: 'Tiny family operation making outstanding single-vineyard Pinot and Chardonnay. Zero pretense, exceptional quality.', mustTaste: 'Cahill Lane Vineyard Pinot Noir', tip: 'Old-school Russian River — small, family-run, wines punch above their price.' },
  { id: 'freeman', name: 'Freeman Vineyard', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$40–$65', grapes: ['pinot', 'chardonnay'], tags: ['intimate', 'family-owned', 'sommelier-fave'], sfDrive: 75, googleRating: 4.8, reviewCount: '300', website: 'freemanwinery.com', bookingNote: 'By appointment only', description: 'Ken and Akiko Freeman make exquisite Pinot and Chardonnay with Japanese precision and Sonoma soul.', mustTaste: 'Akiko\'s Cuvée Pinot Noir', tip: 'The Japanese-Sonoma fusion of philosophy is unique and the wines are beautiful.' },
  { id: 'lynmar', name: 'Lynmar Estate', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$40–$75', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'intimate', 'educational'], sfDrive: 72, googleRating: 4.7, reviewCount: '600', website: 'lynmarestate.com', bookingNote: 'By appointment recommended', description: 'Gorgeous estate with chef\'s garden and exceptional single-vineyard Pinot. The food-and-wine pairing is outstanding.', mustTaste: 'Quail Hill Pinot Noir', tip: 'The food pairing experience with garden ingredients is one of the best in Russian River.' },
  { id: 'arista', name: 'Arista Winery', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$35–$65', grapes: ['pinot'], tags: ['scenic', 'intimate', 'family-owned'], sfDrive: 75, googleRating: 4.8, reviewCount: '500', website: 'aristawinery.com', bookingNote: 'By appointment recommended', description: 'Japanese garden meets Russian River Pinot. Beautiful, serene setting with exceptional wines.', mustTaste: 'Ferrington Vineyard Pinot Noir', tip: 'The Japanese garden is stunning — allow time to walk the grounds.' },
  { id: 'hartford', name: 'Hartford Family Winery', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$35–$60', grapes: ['pinot', 'chardonnay', 'zin'], tags: ['family-owned', 'intimate', 'sommelier-fave'], sfDrive: 78, googleRating: 4.7, reviewCount: '400', website: 'hartfordwines.com', bookingNote: 'By appointment', description: 'Don Hartford and Jennifer Jackson-Hartford make old-vine Zin and cool-climate Pinot from heritage sites across Sonoma and Mendocino.', mustTaste: 'Highwire Vineyard Zinfandel', tip: 'The old-vine Zinfandels are extraordinary — some of the oldest vines in California.' },
  { id: 'joseph-swan', name: 'Joseph Swan Vineyards', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$25–$40', grapes: ['pinot', 'zin'], tags: ['historic', 'intimate', 'family-owned', 'sommelier-fave'], sfDrive: 75, googleRating: 4.8, reviewCount: '200', website: 'josephswanvineyards.com', bookingNote: 'By appointment', description: 'A legendary Russian River pioneer. Joel Peterson of Ravenswood fame started here. Small, personal, extraordinary.', mustTaste: 'Trenton Estate Pinot Noir', tip: 'This is where the Russian River Pinot story began. A pilgrimage site.' },
  { id: 'siduri', name: 'Siduri Wines', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['pinot'], tags: ['educational', 'intimate', 'walk-in'], sfDrive: 75, googleRating: 4.6, reviewCount: '400', website: 'siduri.com', bookingNote: 'Walk-ins welcome in Healdsburg', description: 'Adam Lee sources Pinot Noir from dozens of top vineyards across the West Coast. A Pinot education in one tasting.', mustTaste: 'Pisoni Vineyard Pinot Noir', tip: 'The multi-vineyard tasting is the best way to learn about Pinot Noir terroir.' },
  { id: 'fort-ross', name: 'Fort Ross Vineyard', region: 'Sonoma County', subregion: 'Sonoma Coast (Fort Ross–Seaview)', price: 'mid-splurge', tastingCost: '$40–$65', grapes: ['pinot', 'chardonnay'], tags: ['remote', 'scenic', 'intimate', 'family-owned'], sfDrive: 100, googleRating: 4.8, reviewCount: '250', website: 'fortrossvineyard.com', bookingNote: 'By appointment only', description: 'Extreme Sonoma Coast at 1,700 feet with ocean views. Some of the most dramatic Pinot Noir in California.', mustTaste: 'Estate Pinot Noir', tip: 'Very remote — check directions and fill gas. The view is once-in-a-lifetime.' },
  { id: 'martinelli', name: 'Martinelli Winery', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid-splurge', tastingCost: '$35–$60', grapes: ['pinot', 'zin'], tags: ['family-owned', 'historic', 'intimate'], sfDrive: 75, googleRating: 4.7, reviewCount: '400', website: 'martinelliwinery.com', bookingNote: 'By appointment', description: 'Five generations farming in Russian River Valley. Their Jackass Hill Zinfandel comes from 130+ year old vines.', mustTaste: 'Jackass Hill Zinfandel', tip: 'The oldest Zinfandel vines in Russian River Valley are here.' },
  { id: 'cobb', name: 'Cobb Wines', region: 'Sonoma County', subregion: 'Sonoma Coast', price: 'mid-splurge', tastingCost: '$40–$65', grapes: ['pinot'], tags: ['sommelier-fave', 'intimate', 'remote'], sfDrive: 85, googleRating: 4.9, reviewCount: '150', website: 'cobbwines.com', bookingNote: 'By appointment only', description: 'Ross Cobb makes Sonoma Coast Pinot with incredible restraint and precision. A sommelier darling.', mustTaste: 'Coastlands Vineyard Pinot Noir', tip: 'Tiny production, exceptional quality. If you can get an appointment, don\'t hesitate.' },
  { id: 'red-car', name: 'Red Car Wine', region: 'Sonoma County', subregion: 'Sonoma Coast', price: 'mid', tastingCost: '$25–$45', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'casual', 'walk-in'], sfDrive: 55, googleRating: 4.5, reviewCount: '500', website: 'redcarwine.com', bookingNote: 'Walk-ins welcome in Sebastopol', description: 'Cool-climate specialist with a laid-back tasting room in The Barlow district, Sebastopol.', mustTaste: 'Estate Pinot Noir', tip: 'In The Barlow — combine with other tastings and food spots in the district.' },
  { id: 'trois-noix', name: 'Trois Noix', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid', tastingCost: '$25–$40', grapes: ['cab', 'pinot'], tags: ['intimate', 'family-owned', 'walk-in'], sfDrive: 55, googleRating: 4.7, reviewCount: '200', website: 'troisnoix.com', bookingNote: 'Walk-ins welcome', description: 'Small-production wines by a husband-and-wife team. Personal, genuine, and great value.', mustTaste: 'Russian River Pinot Noir', tip: 'The kind of personal, discovery experience that makes wine country special.' },
  { id: 'balletto', name: 'Balletto Vineyards', region: 'Sonoma County', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['pinot', 'chardonnay'], tags: ['family-owned', 'casual', 'walk-in'], sfDrive: 70, googleRating: 4.6, reviewCount: '800', website: 'ballettovineyards.com', bookingNote: 'Walk-ins welcome', description: 'The Balletto family farms 700+ acres of premium Russian River vineyards. Fantastic value wines.', mustTaste: 'Estate Pinot Noir', tip: 'Best value Pinot in Russian River — seriously underpriced for the quality.' },
  // ═══ ADDITIONAL HEALDSBURG / DRY CREEK / ALEXANDER (30 more) ═══
  { id: 'fritz', name: 'Fritz Underground Winery', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['zin'], tags: ['family-owned', 'intimate'], sfDrive: 80, googleRating: 4.7, reviewCount: '400', website: 'fritzwinery.com', bookingNote: 'By appointment recommended', description: 'Built into a hillside — entire winery underground. Quirky, personal, excellent Zinfandel.', mustTaste: 'Estate Zinfandel', tip: 'Underground caves stay naturally cool — perfect on hot days.' },
  { id: 'michel-schlumberger', name: 'Michel-Schlumberger', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['cab'], tags: ['scenic', 'intimate', 'family-owned'], sfDrive: 80, googleRating: 4.7, reviewCount: '350', website: 'michelschlumberger.com', bookingNote: 'By appointment only', description: '100-acre benchland estate with Spanish Colonial architecture. Peaceful, unhurried, excellent Cabernet.', mustTaste: 'Estate Cabernet', tip: 'Feels like stepping into old California.' },
  { id: 'silver-oak-alexander', name: 'Silver Oak Alexander Valley', region: 'Healdsburg', subregion: 'Alexander Valley', price: 'mid-splurge', tastingCost: '$40–$70', grapes: ['cab'], tags: ['prestigious', 'scenic', 'near-town', 'walk-in'], sfDrive: 82, googleRating: 4.7, reviewCount: '1800', website: 'silveroak.com', bookingNote: 'Walk-ins welcome', description: 'Silver Oak\'s Alexander Valley estate. More relaxed than Oakville. Great value Cab.', mustTaste: 'Alexander Valley Cabernet', tip: 'Half the price of the Napa bottling and arguably more approachable.' },
  { id: 'trione', name: 'Trione Vineyards', region: 'Healdsburg', subregion: 'Alexander Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['cab', 'pinot'], tags: ['scenic', 'family-owned', 'walk-in'], sfDrive: 82, googleRating: 4.7, reviewCount: '350', website: 'trionewinery.com', bookingNote: 'Walk-ins welcome', description: 'Three generations farming Alexander Valley. Beautiful estate, welcoming, unpretentious.', mustTaste: 'Block 21 Cabernet', tip: 'Great picnic spot — bring lunch and enjoy the lawn.' },
  { id: 'ridge-geyserville', name: 'Ridge Geyserville', region: 'Healdsburg', subregion: 'Alexander Valley', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['zin'], tags: ['sommelier-fave', 'historic', 'educational', 'walk-in'], sfDrive: 82, googleRating: 4.7, reviewCount: '800', website: 'ridgewine.com', bookingNote: 'Walk-ins welcome weekdays', description: 'Ridge\'s Geyserville blend is legendary. No-frills tasting — all about the wine.', mustTaste: 'Geyserville Blend', tip: 'A sommelier pilgrimage. The wine speaks for itself.' },
  { id: 'lambert-bridge', name: 'Lambert Bridge', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid-splurge', tastingCost: '$35–$60', grapes: ['cab'], tags: ['scenic', 'intimate', 'family-owned'], sfDrive: 80, googleRating: 4.7, reviewCount: '400', website: 'lambertbridge.com', bookingNote: 'By appointment', description: 'Elegant Dry Creek estate with beautiful gardens and a tasting room inside a redwood barrel room.', mustTaste: 'Estate Cabernet', tip: 'The barrel room is atmospheric — one of the prettiest in Dry Creek.' },
  { id: 'quivira', name: 'Quivira Vineyards', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['zin'], tags: ['family-owned', 'educational', 'casual', 'walk-in'], sfDrive: 80, googleRating: 4.7, reviewCount: '600', website: 'quivirawine.com', bookingNote: 'Walk-ins welcome', description: 'Biodynamic and organic farming with a farm store, beehives, and pigs. Wine country meets working farm.', mustTaste: 'Dry Creek Zinfandel', tip: 'The farm store sells produce, honey, and eggs alongside wine. Unique.' },
  { id: 'preston', name: 'Preston Farm & Winery', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$20–$35', grapes: ['zin'], tags: ['family-owned', 'casual', 'walk-in'], sfDrive: 82, googleRating: 4.7, reviewCount: '500', website: 'prestonvineyards.com', bookingNote: 'Walk-ins welcome', description: 'A real working farm that also makes wine. Bread from the wood-fired oven, olive oil, and unpretentious wines.', mustTaste: 'Madame Preston Red', tip: 'Buy the bread. Seriously — the wood-fired sourdough is legendary.' },
  { id: 'mazzocco', name: 'Mazzocco Sonoma', region: 'Healdsburg', subregion: 'Dry Creek Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['zin'], tags: ['casual', 'walk-in', 'near-town'], sfDrive: 78, googleRating: 4.6, reviewCount: '500', website: 'mazzocco.com', bookingNote: 'Walk-ins welcome', description: 'Laid-back tasting room right on Dry Creek Road. Known for approachable Zins and a friendly bar.', mustTaste: 'Dry Creek Zinfandel', tip: 'Easygoing stop — no appointment needed, friendly pour.' },
  { id: 'locals', name: 'Locals Tasting Room', region: 'Healdsburg', subregion: 'Healdsburg Plaza', price: 'mid', tastingCost: '$15–$30', grapes: ['pinot', 'zin'], tags: ['near-town', 'casual', 'walk-in', 'educational'], sfDrive: 78, googleRating: 4.6, reviewCount: '400', website: 'tastelocalwines.com', bookingNote: 'Walk-ins welcome', description: 'A collective tasting room on the plaza featuring 10+ small local producers. Taste across the region without driving.', mustTaste: 'Ask the staff for today\'s favorites', tip: 'Perfect for a rainy day or if you want to taste many producers in one stop.' },
  { id: 'la-crema', name: 'La Crema Estate', region: 'Healdsburg', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$30–$55', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'social', 'commercial', 'walk-in'], sfDrive: 75, googleRating: 4.5, reviewCount: '1200', website: 'lacrema.com', bookingNote: 'Walk-ins welcome', description: 'One of California\'s most popular Pinot Noir brands, with a beautiful tasting estate and food program.', mustTaste: 'Russian River Pinot Noir', tip: 'The food and wine pairing is well done and reasonably priced.' },
  { id: 'rodney-strong', name: 'Rodney Strong Vineyards', region: 'Healdsburg', subregion: 'Russian River Valley', price: 'mid', tastingCost: '$25–$50', grapes: ['cab', 'pinot'], tags: ['commercial', 'scenic', 'walk-in'], sfDrive: 75, googleRating: 4.5, reviewCount: '2000', website: 'rodneystrong.com', bookingNote: 'Walk-ins welcome', description: 'A Sonoma institution with consistent wines across the range. The Concert series on the lawn is popular.', mustTaste: 'Reserve Cabernet', tip: 'Check for summer concerts — wine and live music on the lawn.' },

  // ═══ ADDITIONAL PASO ROBLES (40 more) ═══
  { id: 'turley-paso', name: 'Turley Wine Cellars', region: 'Paso Robles', subregion: 'Templeton Gap', price: 'mid-splurge', tastingCost: '$35–$60', grapes: ['zin'], tags: ['sommelier-fave', 'historic', 'intimate'], sfDrive: 205, googleRating: 4.8, reviewCount: '500', website: 'turleywinecellars.com', bookingNote: 'By appointment only', description: 'Larry Turley\'s old-vine Zinfandel program is legendary. Some vines are 100+ years old.', mustTaste: 'Pesenti Vineyard Zinfandel', tip: 'If you love Zinfandel, this is the pilgrimage site.' },
  { id: 'law-estate', name: 'LAW Estate Wines', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'splurge', tastingCost: '$60–$100', grapes: ['cab'], tags: ['prestigious', 'scenic', 'intimate'], sfDrive: 210, googleRating: 4.9, reviewCount: '200', website: 'lawestatewines.com', bookingNote: 'By appointment only', description: 'Luxury estate with stunning architecture. Serious winemaking, resort-level experience.', mustTaste: 'The Nines', tip: 'Feels like a Napa First Growth transplanted to Paso.' },
  { id: 'brecon', name: 'Brecon Estate', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$25–$50', grapes: ['cab'], tags: ['scenic', 'family-owned', 'intimate', 'remote'], sfDrive: 215, googleRating: 4.8, reviewCount: '300', website: 'breconestate.com', bookingNote: 'By appointment recommended', description: 'Welsh-named estate on the far westside with stunning rolling hills. Intimate, personal wines.', mustTaste: 'Estate Syrah', tip: 'One of the most beautiful drives in Paso.' },
  { id: 'peachy-canyon', name: 'Peachy Canyon', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$20–$40', grapes: ['zin'], tags: ['family-owned', 'casual', 'walk-in'], sfDrive: 205, googleRating: 4.6, reviewCount: '1200', website: 'peachycanyon.com', bookingNote: 'Walk-ins welcome', description: 'Beckett family making Zinfandel since 1988. Laid-back, affordable, consistently excellent.', mustTaste: 'Incredible Red Zinfandel', tip: 'Great value Zin — crowd-pleaser and very affordable.' },
  { id: 'villacreek', name: 'Villa Creek Cellars', region: 'Paso Robles', subregion: 'Templeton Gap', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['cab'], tags: ['sommelier-fave', 'intimate'], sfDrive: 200, googleRating: 4.8, reviewCount: '300', website: 'villacreekcellars.com', bookingNote: 'By appointment recommended', description: 'Cris Cherry makes soulful Rhône varieties. A sommelier favorite that flies under the radar.', mustTaste: 'Avenger Garnacha', tip: 'The insider\'s pick in Paso.' },
  { id: 'torrin', name: 'Torrin Vineyard', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['cab'], tags: ['intimate', 'family-owned', 'remote'], sfDrive: 215, googleRating: 4.8, reviewCount: '150', website: 'torrinvineyards.com', bookingNote: 'By appointment only', description: 'Tiny production, meticulous winemaking. The Torrin name means "thunder" in Gaelic.', mustTaste: 'The Maven GSM', tip: 'Ultra-small production — if you can visit, buy what you can.' },
  { id: 'thacher', name: 'Thacher Winery', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$20–$40', grapes: ['cab'], tags: ['family-owned', 'casual', 'walk-in'], sfDrive: 210, googleRating: 4.7, reviewCount: '500', website: 'thacherwinery.com', bookingNote: 'Walk-ins welcome', description: 'Family-run westside estate with a quirky tasting room in a converted barn. Fun, genuine, great wines.', mustTaste: 'Controlled Burn Red', tip: 'The barn tasting room has real character — fun and unpretentious.' },
  { id: 'chronic', name: 'Chronic Cellars', region: 'Paso Robles', subregion: 'Templeton Gap', price: 'mid', tastingCost: '$15–$30', grapes: ['zin'], tags: ['casual', 'social', 'walk-in'], sfDrive: 200, googleRating: 4.5, reviewCount: '1500', website: 'chroniccellars.com', bookingNote: 'Walk-ins welcome', description: 'Skull-branded bottles, laid-back vibes, approachable wines. The antithesis of wine snobbery.', mustTaste: 'Purple Paradise', tip: 'Fun labels, no pretense, good wine at fair prices.' },
  { id: 'jdusi', name: 'J. Dusi Wines', region: 'Paso Robles', subregion: 'Eastside', price: 'mid', tastingCost: '$15–$30', grapes: ['zin'], tags: ['family-owned', 'historic', 'casual', 'walk-in'], sfDrive: 200, googleRating: 4.7, reviewCount: '400', website: 'jdusiwines.com', bookingNote: 'Walk-ins welcome', description: 'The Dusi family has been growing grapes in Paso since 1945. Their old-vine Zinfandel is a benchmark.', mustTaste: 'Estate Zinfandel', tip: 'Heritage vines, heritage family — real Paso Robles history.' },
  { id: 'kukkula', name: 'Kukkula Winery', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['cab'], tags: ['scenic', 'intimate', 'family-owned'], sfDrive: 215, googleRating: 4.8, reviewCount: '250', website: 'kukkulawine.com', bookingNote: 'By appointment', description: 'Finnish name meaning "hilltop" — and the hilltop setting delivers. Rhône varieties with real elegance.', mustTaste: 'Sisu GSM', tip: 'The name means "courage" in Finnish — the wines live up to it.' },
  { id: 'austin-hope', name: 'Austin Hope Winery', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$30–$60', grapes: ['cab'], tags: ['prestigious', 'scenic', 'commercial'], sfDrive: 210, googleRating: 4.7, reviewCount: '1200', website: 'austinhope.com', bookingNote: 'Walk-ins welcome', description: 'The Hope family has been farming Paso since the 1970s. Austin Hope Cabernet has become a steakhouse staple.', mustTaste: 'Austin Hope Cabernet', tip: 'One of the most recognized Paso labels — widely available but worth visiting the source.' },
  { id: 'l-aventure', name: 'L\'Aventure', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'splurge', tastingCost: '$50–$90', grapes: ['cab'], tags: ['sommelier-fave', 'prestigious', 'intimate'], sfDrive: 210, googleRating: 4.9, reviewCount: '350', website: 'laventurewinery.com', bookingNote: 'By appointment only', description: 'Stephan Asseo left Bordeaux to make wine without rules in Paso. His blends are among the most acclaimed on the Central Coast.', mustTaste: 'Optimus', tip: 'A French winemaker who chose Paso over Bordeaux — that tells you everything.' },
  { id: 'herman-story', name: 'Herman Story Wines', region: 'Paso Robles', subregion: 'Templeton Gap', price: 'mid-splurge', tastingCost: '$25–$50', grapes: ['cab'], tags: ['intimate', 'sommelier-fave'], sfDrive: 200, googleRating: 4.8, reviewCount: '300', website: 'hermanstorywines.com', bookingNote: 'By appointment', description: 'Russell From (yes, that\'s his name) makes powerful, dark Rhône-inspired wines with irreverent labels.', mustTaste: 'Casual Encounter Grenache', tip: 'The labels and wine names are fun but the wines are dead serious.' },
  { id: 'dilecta', name: 'Dilecta Wines', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['cab'], tags: ['intimate', 'family-owned'], sfDrive: 210, googleRating: 4.8, reviewCount: '150', website: 'dilectawines.com', bookingNote: 'By appointment', description: 'Small-production Paso estate wines with real restraint and elegance. The anti-blockbuster approach.', mustTaste: 'Estate Red Blend', tip: 'Tiny production — if you like what you taste, buy it there.' },
  { id: 'alta-colina', name: 'Alta Colina Vineyard', region: 'Paso Robles', subregion: 'Adelaida District (Westside)', price: 'mid', tastingCost: '$25–$45', grapes: ['cab'], tags: ['scenic', 'family-owned', 'remote', 'walk-in'], sfDrive: 215, googleRating: 4.7, reviewCount: '400', website: 'altacolina.com', bookingNote: 'Walk-ins welcome', description: 'High-elevation westside estate with panoramic views. The drive up the dirt road is an adventure.', mustTaste: 'Toasted Slope Syrah', tip: 'Dirt road access — but the view from the top is worth every bump.' },
  { id: 'opolo', name: 'Opolo Vineyards', region: 'Paso Robles', subregion: 'Eastside', price: 'mid', tastingCost: '$20–$40', grapes: ['cab'], tags: ['scenic', 'social', 'commercial', 'walk-in'], sfDrive: 200, googleRating: 4.6, reviewCount: '2000', website: 'opolo.com', bookingNote: 'Walk-ins welcome', description: 'Popular hilltop estate with lodge, events, and a lively atmosphere. Great for groups and celebrations.', mustTaste: 'Mountain Zinfandel', tip: 'Stay at the hilltop lodge for a full immersion experience.' },
  { id: 'still-waters', name: 'Still Waters Vineyards', region: 'Paso Robles', subregion: 'Eastside', price: 'mid', tastingCost: '$15–$30', grapes: ['cab'], tags: ['family-owned', 'casual', 'walk-in'], sfDrive: 200, googleRating: 4.6, reviewCount: '300', website: 'stillwatersvineyards.com', bookingNote: 'Walk-ins welcome', description: 'Family-owned estate with a peaceful setting and honest, well-made wines at fair prices.', mustTaste: 'Estate Merlot', tip: 'Great value and a peaceful break from the busier westside wineries.' },

  // ═══ ADDITIONAL OTHER REGIONS (30 more) ═══
  { id: 'bonny-doon', name: 'Bonny Doon Vineyard', region: 'Santa Cruz Mountains', subregion: 'Santa Cruz', price: 'mid', tastingCost: '$15–$30', grapes: ['cab'], tags: ['sommelier-fave', 'casual', 'walk-in'], sfDrive: 75, googleRating: 4.5, reviewCount: '800', website: 'bonnydoonvineyard.com', bookingNote: 'Walk-ins welcome', description: 'Randall Grahm\'s iconoclastic winery. Pioneer of Rhône varieties in California, natural wine advocate, and genuine eccentric.', mustTaste: 'Le Cigare Volant', tip: 'The tasting room in downtown Santa Cruz is funky and fun.' },
  { id: 'mount-eden', name: 'Mount Eden Vineyards', region: 'Santa Cruz Mountains', subregion: 'Santa Cruz Mountains', price: 'splurge', tastingCost: '$50–$80', grapes: ['chardonnay', 'pinot'], tags: ['sommelier-fave', 'historic', 'remote', 'intimate'], sfDrive: 60, googleRating: 4.8, reviewCount: '200', website: 'mounteden.com', bookingNote: 'By appointment only', description: 'One of California\'s greatest estates, perched at 2,000 feet. The Chardonnay rivals the best white Burgundy.', mustTaste: 'Estate Chardonnay', tip: 'A pilgrimage for serious wine lovers. The estate is magnificent.' },
  { id: 'thomas-fogarty', name: 'Thomas Fogarty Winery', region: 'Santa Cruz Mountains', subregion: 'Santa Cruz Mountains', price: 'mid', tastingCost: '$25–$45', grapes: ['pinot', 'chardonnay'], tags: ['scenic', 'intimate', 'walk-in'], sfDrive: 45, googleRating: 4.6, reviewCount: '800', website: 'fogartywinery.com', bookingNote: 'Walk-ins welcome', description: 'Stunning panoramic views from the terrace overlooking the Bay. Excellent Pinot and very close to Silicon Valley.', mustTaste: 'Estate Pinot Noir', tip: 'The view from the terrace is one of the most spectacular in the Bay Area.' },
  { id: 'roederer', name: 'Roederer Estate', region: 'Anderson Valley', subregion: 'Anderson Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['sparkling'], tags: ['prestigious', 'scenic', 'walk-in'], sfDrive: 140, googleRating: 4.6, reviewCount: '1000', website: 'roedererestate.com', bookingNote: 'Walk-ins welcome', description: 'Louis Roederer\'s California sparkling wine house. The same family that makes Cristal Champagne.', mustTaste: 'L\'Ermitage Brut', tip: 'L\'Ermitage rivals actual Champagne at a fraction of the price.' },
  { id: 'handley', name: 'Handley Cellars', region: 'Anderson Valley', subregion: 'Anderson Valley', price: 'mid', tastingCost: '$15–$30', grapes: ['pinot', 'chardonnay'], tags: ['family-owned', 'intimate', 'walk-in'], sfDrive: 155, googleRating: 4.7, reviewCount: '400', website: 'handleycellars.com', bookingNote: 'Walk-ins welcome', description: 'Milla Handley was one of the first female winemakers in California. Intimate, personal, excellent Pinot.', mustTaste: 'Estate Pinot Noir', tip: 'A pioneer for women in wine — the wines are outstanding and the story is inspiring.' },
  { id: 'husch', name: 'Husch Vineyards', region: 'Anderson Valley', subregion: 'Anderson Valley', price: 'budget', tastingCost: '$10–$20', grapes: ['pinot'], tags: ['family-owned', 'casual', 'walk-in'], sfDrive: 150, googleRating: 4.6, reviewCount: '600', website: 'huschvineyards.com', bookingNote: 'Walk-ins welcome', description: 'Anderson Valley\'s first bonded winery (1971). Incredibly friendly and one of the best values in California.', mustTaste: 'Knoll Pinot Noir', tip: 'The best deal in Anderson Valley — fantastic wine at shockingly low prices.' },
  { id: 'calera', name: 'Calera Wine Company', region: 'San Benito County', subregion: 'Mt. Harlan', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['pinot'], tags: ['sommelier-fave', 'historic', 'remote', 'intimate'], sfDrive: 100, googleRating: 4.7, reviewCount: '300', website: 'calerawine.com', bookingNote: 'By appointment', description: 'Josh Jensen found limestone identical to Burgundy\'s on Mt. Harlan and planted Pinot Noir. The single-vineyard wines are legendary.', mustTaste: 'Jensen Vineyard Pinot Noir', tip: 'The California Romanée-Conti — limestone Pinot at its finest.' },
  { id: 'au-bon-climat', name: 'Au Bon Climat', region: 'Santa Barbara', subregion: 'Santa Maria Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['pinot', 'chardonnay'], tags: ['sommelier-fave', 'historic', 'educational'], sfDrive: 230, googleRating: 4.6, reviewCount: '400', website: 'aubonclimat.com', bookingNote: 'Walk-ins welcome in tasting room', description: 'Jim Clendenen\'s legacy — Burgundian-style wines from Santa Barbara. A sommelier icon who passed in 2021.', mustTaste: 'Nuits-Blanches Chardonnay', tip: 'A tribute visit to one of California\'s most influential winemakers.' },
  { id: 'sea-smoke', name: 'Sea Smoke', region: 'Santa Barbara', subregion: 'Sta. Rita Hills', price: 'splurge', tastingCost: '$60–$100', grapes: ['pinot'], tags: ['prestigious', 'intimate', 'sommelier-fave'], sfDrive: 240, googleRating: 4.8, reviewCount: '300', website: 'seasmoke.com', bookingNote: 'By appointment only — mailing list', description: 'Allocation-only Pinot from the foggy Sta. Rita Hills. Among the most sought-after Pinot in California.', mustTaste: 'Ten Pinot Noir', tip: 'Allocation only — join the mailing list. Worth the drive to Santa Barbara.' },
  { id: 'sanford', name: 'Sanford Winery', region: 'Santa Barbara', subregion: 'Sta. Rita Hills', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['pinot', 'chardonnay'], tags: ['historic', 'scenic', 'educational', 'walk-in'], sfDrive: 240, googleRating: 4.6, reviewCount: '800', website: 'sanfordwinery.com', bookingNote: 'Walk-ins welcome', description: 'Richard Sanford planted the first Pinot Noir in the Sta. Rita Hills in 1971. The adobe tasting room is beautiful.', mustTaste: 'Sanford & Benedict Vineyard Pinot Noir', tip: 'The original Santa Barbara Pinot vineyard — important piece of California wine history.' },
  { id: 'firestone', name: 'Firestone Vineyard', region: 'Santa Barbara', subregion: 'Santa Ynez Valley', price: 'mid', tastingCost: '$20–$40', grapes: ['cab'], tags: ['historic', 'scenic', 'commercial', 'walk-in'], sfDrive: 220, googleRating: 4.4, reviewCount: '1500', website: 'firestonewine.com', bookingNote: 'Walk-ins welcome', description: 'The first estate winery in Santa Barbara County (1972). Beautiful hilltop location, solid wines, great views.', mustTaste: 'Reserve Cabernet', tip: 'A piece of Santa Barbara wine history with sweeping valley views.' },
  { id: 'bedrock', name: 'Bedrock Wine Co.', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid', tastingCost: '$25–$45', grapes: ['zin'], tags: ['sommelier-fave', 'historic', 'intimate'], sfDrive: 52, googleRating: 4.8, reviewCount: '350', website: 'bedrockwineco.com', bookingNote: 'By appointment', description: 'Morgan Twain-Peterson is the son of Ravenswood founder Joel Peterson. He makes the most exciting old-vine wines in Sonoma today.', mustTaste: 'Bedrock Vineyard Heritage Red', tip: 'The Heritage Red is a field blend from vines planted in 1888. Living history in a glass.' },
  { id: 'arnot-roberts', name: 'Arnot-Roberts', region: 'Sonoma County', subregion: 'Sonoma Valley', price: 'mid-splurge', tastingCost: '$35–$60', grapes: ['cab'], tags: ['sommelier-fave', 'intimate'], sfDrive: 55, googleRating: 4.8, reviewCount: '200', website: 'arnotroberts.com', bookingNote: 'By appointment', description: 'Duncan Arnot Meyers and Nathan Roberts make some of the most compelling, terroir-driven wines in California. Natural wine with precision.', mustTaste: 'Clary Ranch Syrah', tip: 'The sommeliers\' sommelier wine. If you trust your server\'s wine picks, you\'ll love this.' },
  { id: 'sandhi', name: 'Sandhi Wines', region: 'Santa Barbara', subregion: 'Sta. Rita Hills', price: 'mid-splurge', tastingCost: '$30–$55', grapes: ['chardonnay', 'pinot'], tags: ['sommelier-fave', 'intimate'], sfDrive: 240, googleRating: 4.7, reviewCount: '200', website: 'sandhiwines.com', bookingNote: 'By appointment', description: 'Rajat Parr (legendary sommelier) makes restrained, mineral Chardonnay and Pinot. The opposite of big California style.', mustTaste: 'Sanford & Benedict Chardonnay', tip: 'If you want to understand what California can do when it restrains itself, taste Sandhi.' },
  { id: 'domaine-de-la-cote', name: 'Domaine de la Côte', region: 'Santa Barbara', subregion: 'Sta. Rita Hills', price: 'splurge', tastingCost: '$50–$80', grapes: ['pinot'], tags: ['sommelier-fave', 'intimate', 'prestigious'], sfDrive: 240, googleRating: 4.9, reviewCount: '150', website: 'domainedelacote.com', bookingNote: 'By appointment only', description: 'Rajat Parr and Sashi Moorman\'s biodynamic Pinot Noir estate. The most Burgundian wines in California.', mustTaste: 'Bloom\'s Field Pinot Noir', tip: 'The closest California gets to great Burgundy. A sommelier pilgrimage.' },
];

// Remove duplicates by id
const seenIds = new Set();
const WINERIES_DEDUPED = WINERIES.filter(w => {
  if (seenIds.has(w.id)) return false;
  seenIds.add(w.id);
  return true;
});

// Auto-tag walk-in and last-minute, add default hours
WINERIES_DEDUPED.forEach(w => {
  const note = (w.bookingNote || '').toLowerCase();
  if (note.includes('walk-in') || note.includes('walk-ins welcome')) {
    if (!w.tags.includes('walk-in')) w.tags.push('walk-in');
    if (!w.tags.includes('last-minute')) w.tags.push('last-minute');
  }
  if (note.includes('recommended') && !note.includes('only')) {
    if (!w.tags.includes('last-minute')) w.tags.push('last-minute');
  }
  if (!w.openHour) w.openHour = 10;
  if (!w.closeHour) w.closeHour = 16.5;
  if (!w.tastingHours) w.tastingHours = '10:00 AM – 4:30 PM';
  w.lastBooking = w.closeHour - 1.5;
  const lowSignal = ['Sonoma Coast', 'Sonoma Coast (Fort Ross–Seaview)', 'Mount Veeder', 'Spring Mountain District', 'Howell Mountain', 'Diamond Mountain', 'Monte Bello Ridge'];
  w.lowCell = lowSignal.includes(w.subregion);
});

// ─── Region guide data ──────────────────────────────────
const CA_REGIONS_GUIDE = [
  { id: 'napa', name: 'Napa Valley', emoji: '🏔️', color: '#B8625C', tagline: "California's most prestigious wine region", bestFor: 'Cabernet Sauvignon, Chardonnay, prestige dining', atmosphere: 'Upscale, resort-like, world-famous', sfDrive: '75–100 min', overview: 'Napa Valley is 35 miles long and barely 5 miles wide, yet it produces some of the world\'s most celebrated wines. Cabernet Sauvignon is king.', subregions: [
    { name: 'Carneros', description: 'Coolest, southernmost part. Pacific fog creates ideal conditions for Pinot Noir and sparkling wine.', bestFor: 'Pinot Noir, sparkling wine', mustKnow: 'Domaine Carneros and Etude are the stars.' },
    { name: 'Yountville', description: 'The culinary heart of Napa. Thomas Keller\'s French Laundry is here.', bestFor: 'Restaurant-and-winery combos', mustKnow: 'Book dinner well in advance.' },
    { name: 'Stags Leap District', description: 'Site of the 1976 Judgment of Paris victory.', bestFor: 'Iconic Cabernet, wine history', mustKnow: "Stag's Leap Wine Cellars, Shafer, Darioush." },
    { name: 'Oakville', description: 'The golden mile of Napa.', bestFor: 'The pinnacle of Napa Cabernet', mustKnow: 'More 100-point wines per acre than almost anywhere.' },
    { name: 'Rutherford', description: 'Home of legendary Rutherford Dust.', bestFor: 'Historic estates, heritage Napa', mustKnow: 'Inglenook, Beaulieu, and Caymus.' },
    { name: 'St. Helena', description: 'Charming small town with excellent restaurants.', bestFor: 'Walking a wine town', mustKnow: 'HALL Wines and Charles Krug are both here.' },
    { name: 'Calistoga', description: 'Most relaxed, rustic town in Napa. Famous for hot springs.', bestFor: 'Laid-back Napa, spa retreats', mustKnow: "Schramsberg's cave tours are a must." },
    { name: 'Howell Mountain', description: 'High-elevation above the fog. Powerfully structured Cabernets.', bestFor: 'Serious wine collectors', mustKnow: 'La Jota and Robert Craig are key names.' },
    { name: 'Spring Mountain District', description: 'Wild, forested mountain slopes.', bestFor: 'Adventurous wine lovers', mustKnow: 'Smith-Madrone is a legendary secret.' },
  ]},
  { id: 'sonoma', name: 'Sonoma County', emoji: '🌲', color: '#5EA86B', tagline: 'Cooler, more diverse, and more laid-back than Napa', bestFor: 'Pinot Noir, Chardonnay, Zinfandel, value', atmosphere: 'Diverse, down-to-earth, farm-country', sfDrive: '50–90+ min', overview: "Sonoma County is nearly three times the size of Napa Valley with far more climate diversity.", subregions: [
    { name: 'Sonoma Valley', description: 'The historic heart. Town of Sonoma with its beautiful plaza.', bestFor: 'History, town of Sonoma, SF day trips', mustKnow: 'Sonoma Plaza is one of California\'s most charming squares.' },
    { name: 'Russian River Valley', description: 'Spiritual home of California Pinot Noir. Cool, fog-drenched.', bestFor: 'Serious Pinot Noir, Chardonnay', mustKnow: 'Healdsburg is the nearby base.' },
    { name: 'Dry Creek Valley', description: 'Narrow valley known for old-vine Zinfandel.', bestFor: 'Zinfandel lovers, picnic tastings', mustKnow: 'Ridge Lytton Springs and Rafanelli.' },
    { name: 'Alexander Valley', description: 'Warm, wide valley producing full-bodied Cabernet.', bestFor: 'Cabernet at Sonoma prices', mustKnow: 'Jordan makes one of California\'s great Cabs.' },
    { name: 'Sonoma Coast', description: 'Wild, windswept, dramatic Pinot Noir. Winding roads, ocean views.', bestFor: 'Wine adventurers', mustKnow: 'Hirsch and Flowers are legendary. Not a casual day trip.' },
  ]},
  { id: 'healdsburg', name: 'Healdsburg', emoji: '🏡', color: '#C9A65A', tagline: 'Relaxed, low-key, and draws a local crowd', bestFor: 'Base camp for Russian River, Dry Creek & Alexander Valley', atmosphere: 'Refined small town, walkable plaza, Michelin-star restaurants', sfDrive: '75–80 min', overview: "Healdsburg sits at the convergence of three major AVAs. The Plaza is surrounded by tasting rooms from top producers.", subregions: [
    { name: 'Healdsburg Plaza', description: 'Town center with tasting rooms from dozens of top producers.', bestFor: 'Walking, hotel base, rainy day tasting', mustKnow: 'Book Single Thread weeks in advance.' },
    { name: 'Dry Creek Valley', description: 'Old-vine Zinfandel and family farms. 20 min from plaza.', bestFor: 'Zinfandel, Rafanelli, Ridge', mustKnow: 'A. Rafanelli is the holy grail — appointment only.' },
    { name: 'Russian River Valley', description: 'Fog-cooled home of California\'s finest Pinot. 15 min from Healdsburg.', bestFor: 'Rochioli, Williams Selyem, Gary Farrell', mustKnow: 'Book ahead — best producers require appointments.' },
  ]},
  { id: 'paso-robles', name: 'Paso Robles', emoji: '☀️', color: '#C9885A', tagline: "California's most exciting emerging wine destination", bestFor: 'Rhône varieties, Cabernet Sauvignon, value', atmosphere: 'Rugged, agricultural, cowboy-country cool', sfDrive: '3–3.5 hours', overview: "Paso Robles is the American Rhône Valley — vast region of limestone soils and wild temperature swings. Prices are a fraction of Napa.", subregions: [
    { name: 'Adelaida District (Westside)', description: 'Limestone hills with the most serious wines. Winding roads, dramatic.', bestFor: 'Best-in-class Rhône and Bordeaux blends', mustKnow: 'Saxum, Booker, and Linne Calodo are cult favorites.' },
    { name: 'Templeton Gap', description: 'Where coastal air funnels through the Santa Lucia range.', bestFor: 'Balanced wines, moderate climate', mustKnow: 'Tablas Creek is the benchmark.' },
    { name: 'Downtown Paso', description: 'Charming town square with tasting rooms and restaurants.', bestFor: 'Walking, no-drive tasting day', mustKnow: 'Fish Gaucho for tacos, multiple tasting rooms on the square.' },
  ]},
];

// ═══════════════════════════════════════════
// CaTripPlanner Class
// ═══════════════════════════════════════════
class CaTripPlanner {
  constructor() {
    this.selectedRegion = null;
    this.selectedSubregion = null;
    this.sliderValues = {};
    this.badgeFilters = new Set();
    this.tripSelected = [];
    this.selectedTransport = 'car';
    this.tripDays = 1;
    this.customActivities = [];
    this.lockedStops = {};
    this.selectedMealSpots = { breakfast: null, lunch: null, dinner: null };
    TRIP_SLIDERS.forEach(s => { this.sliderValues[s.id] = 50; });
  }

  init() {
    this.buildRegionSelector();
    this.buildSliders();
    this.wireLogistics();
    document.getElementById('find-wineries-btn').addEventListener('click', () => this.findWineries());
    document.getElementById('back-to-map-btn').addEventListener('click', () => {
      document.getElementById('catrip-results-state').style.display = 'none';
      document.getElementById('catrip-map-state').style.display = 'flex';
    });
    document.getElementById('go-to-step2-btn').addEventListener('click', () => {
      document.getElementById('step2-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    this.buildItinerary();
  }

  buildRegionSelector() {
    document.querySelectorAll('.region-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const wasActive = btn.classList.contains('active');
        document.querySelectorAll('.region-select-btn').forEach(b => b.classList.remove('active'));
        if (wasActive) {
          this.selectedRegion = null;
          document.getElementById('subregion-panel').style.display = 'none';
        } else {
          btn.classList.add('active');
          this.selectedRegion = btn.dataset.region;
          this.selectedSubregion = null;
          this.buildSubregionChips();
          document.getElementById('subregion-panel').style.display = 'block';
        }
      });
    });
  }

  buildSubregionChips() {
    const chipsEl = document.getElementById('subregion-chips');
    const subs = SUBREGIONS[this.selectedRegion] || [];
    chipsEl.innerHTML = '';
    subs.forEach(sub => {
      const chip = document.createElement('button');
      chip.className = 'subregion-chip';
      chip.textContent = sub;
      chip.addEventListener('click', () => {
        const isActive = chip.classList.contains('active');
        document.querySelectorAll('.subregion-chip').forEach(c => c.classList.remove('active'));
        if (!isActive) { chip.classList.add('active'); this.selectedSubregion = sub; }
        else { this.selectedSubregion = null; }
      });
      chipsEl.appendChild(chip);
    });
  }

  buildSliders() {
    const container = document.getElementById('trip-sliders');
    container.innerHTML = '';
    const _buildSliderRow = (slider) => {
      const row = document.createElement('div');
      row.className = 'slider-row';
      row.innerHTML = `<div class="slider-inline-row"><span class="slider-left">${slider.leftLabel}</span><input type="range" min="0" max="100" value="50" class="trip-slider" data-slider-id="${slider.id}" /><span class="slider-right">${slider.rightLabel}</span></div>`;
      row.querySelector('.trip-slider').addEventListener('input', (e) => { this.sliderValues[slider.id] = parseInt(e.target.value); });
      return row;
    };
    TRIP_SLIDERS_PRIMARY.forEach(s => container.appendChild(_buildSliderRow(s)));
    const secondaryWrap = document.createElement('div');
    secondaryWrap.innerHTML = '<button class="secondary-toggle-btn" id="toggle-secondary">More preferences ▾</button>';
    const secondaryList = document.createElement('div');
    secondaryList.className = 'secondary-filters-list';
    secondaryList.style.display = 'none';
    TRIP_SLIDERS_SECONDARY.forEach(s => secondaryList.appendChild(_buildSliderRow(s)));
    secondaryWrap.appendChild(secondaryList);
    container.appendChild(secondaryWrap);
    secondaryWrap.querySelector('#toggle-secondary').addEventListener('click', () => {
      const isHidden = secondaryList.style.display === 'none';
      secondaryList.style.display = isHidden ? 'flex' : 'none';
      secondaryWrap.querySelector('#toggle-secondary').textContent = isHidden ? 'Fewer preferences ▴' : 'More preferences ▾';
    });
    const toggleSection = document.createElement('div');
    toggleSection.className = 'practical-toggles';
    toggleSection.innerHTML = '<div class="s-label" style="margin-bottom:4px">Practical</div><div class="toggle-row"><label class="toggle-chip"><input type="checkbox" class="badge-toggle" data-filter="walk-in" /> Allows Walk-Ins</label><label class="toggle-chip"><input type="checkbox" class="badge-toggle" data-filter="last-minute" /> Last Minute Friendly</label></div>';
    container.appendChild(toggleSection);
    toggleSection.querySelectorAll('.badge-toggle').forEach(cb => {
      cb.addEventListener('change', () => { if (cb.checked) this.badgeFilters.add(cb.dataset.filter); else this.badgeFilters.delete(cb.dataset.filter); });
    });
    const extraSection = document.createElement('div');
    extraSection.innerHTML = '<div style="margin-top:6px"><div class="s-label" style="margin-bottom:4px">Close to</div><input type="text" id="proximity-input" class="logistics-input" placeholder="e.g. Healdsburg Plaza" style="font-size:0.68rem;padding:5px 10px" /></div><button class="clear-filters-btn" id="clear-all-filters">Clear all</button>';
    container.appendChild(extraSection);
    document.getElementById('clear-all-filters').addEventListener('click', () => {
      container.querySelectorAll('.trip-slider').forEach(s => { s.value = 50; this.sliderValues[s.dataset.sliderId] = 50; });
      this.badgeFilters.clear();
      toggleSection.querySelectorAll('.badge-toggle').forEach(cb => { cb.checked = false; });
      this.selectedRegion = null; this.selectedSubregion = null;
      document.querySelectorAll('.region-select-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('subregion-panel').style.display = 'none';
      const p = document.getElementById('proximity-input'); if (p) p.value = '';
    });
  }

  findWineries() {
    document.getElementById('catrip-map-state').style.display = 'none';
    document.getElementById('catrip-results-state').style.display = 'flex';
    const scored = WINERIES_DEDUPED.map(w => {
      let score = 0;
      w._matchReasons = []; w._filterNotes = [];
      if (this.selectedRegion) {
        if (w.region === this.selectedRegion) score += 3;
        else if (this.selectedRegion === 'Healdsburg' && w.region === 'Sonoma County' && ['Russian River Valley','Dry Creek Valley','Alexander Valley'].includes(w.subregion)) score += 2;
        else return { winery: w, score: -999 };
      }
      if (this.selectedSubregion) {
        if (w.subregion === this.selectedSubregion) score += 4;
        else { const neighbors = SUBREGION_NEIGHBORS[this.selectedSubregion] || {}; const d = neighbors[w.subregion]; if (d !== undefined) { w._neighborNote = `~${d} min from ${this.selectedSubregion}`; score += 1; } else return { winery: w, score: -999 }; }
      }
      const wTags = new Set(w.tags || []); const wGrapes = new Set(w.grapes || []);
      TRIP_SLIDERS.forEach(slider => {
        const val = this.sliderValues[slider.id] || 50;
        if (val < 38) { let m = false; slider.leftTags.forEach(t => { if (wTags.has(t)) { score += 3; m = true; w._matchReasons.push(`Matches "${slider.leftLabel}"`); } }); slider.rightTags.forEach(t => { if (wTags.has(t)) { score -= 2; w._filterNotes.push(`Leans toward "${slider.rightLabel}"`); } }); if (val < 20 && !m && slider.leftTags.length) { score -= 4; w._filterNotes.push(`Not known for "${slider.leftLabel}"`); } }
        else if (val > 62) { let m = false; slider.rightTags.forEach(t => { if (wTags.has(t)) { score += 3; m = true; w._matchReasons.push(`Matches "${slider.rightLabel}"`); } }); slider.leftTags.forEach(t => { if (wTags.has(t)) { score -= 2; w._filterNotes.push(`Leans toward "${slider.leftLabel}"`); } }); if (val > 80 && !m && slider.rightTags.length) { score -= 4; w._filterNotes.push(`Not known for "${slider.rightLabel}"`); } }
      });
      const budgetVal = this.sliderValues['budget'] || 50;
      if (budgetVal < 30) { if (['budget','mid'].includes(w.price)) { score += 4; w._matchReasons.push('Fits budget preference'); } if (w.price === 'splurge') { score -= 7; w._filterNotes.push('Splurge-level tasting — above budget preference'); } }
      else if (budgetVal > 70) { if (['splurge','mid-splurge'].includes(w.price)) { score += 4; w._matchReasons.push('Premium experience'); } if (w.price === 'budget') { score -= 7; w._filterNotes.push('Budget-oriented'); } }
      if (this.badgeFilters.size > 0) {
        const bn = {'walk-in':'Walk-Ins','last-minute':'Last Minute Friendly'};
        this.badgeFilters.forEach(f => { if (wTags.has(f)) { score += 5; w._matchReasons.push(`Tagged "${bn[f]||f}"`); } else { score -= 6; w._filterNotes.push(`Not tagged "${bn[f]||f}"`); } });
      }
      const proxInput = document.getElementById('proximity-input');
      const proxVal = proxInput ? proxInput.value.trim().toLowerCase() : '';
      if (proxVal) { const s = (w.subregion||'').toLowerCase(); if (s.includes(proxVal) || (w.region||'').toLowerCase().includes(proxVal)) { score += 5; w._matchReasons.push(`Close to "${proxInput.value.trim()}"`); } else w._filterNotes.push(`Not close to "${proxInput.value.trim()}"`); }
      if (wTags.has('sommelier-fave')) w._matchReasons.push('Sommelier-recommended');
      if (wTags.has('historic')) w._matchReasons.push('Historic estate');
      if (wTags.has('family-owned')) w._matchReasons.push('Family-owned, personal experience');
      if (wTags.has('walk-in') && !w._matchReasons.some(r => r.includes('Walk'))) w._matchReasons.push('Walk-ins welcome');
      w._matchReasons = [...new Set(w._matchReasons)].slice(0, 5);
      w._filterNotes = [...new Set(w._filterNotes)];
      return { winery: w, score };
    }).filter(s => s.score > -999).sort((a, b) => b.score - a.score);
    this.renderResults(scored);
  }

  renderResults(scored) {
    const resultsEl = document.getElementById('trip-results');
    const countEl = document.getElementById('winery-count-label');
    countEl.textContent = `${scored.length} winer${scored.length === 1 ? 'y' : 'ies'} found`;
    const maxScore = Math.max(...scored.map(s => s.score), 1);
    resultsEl.innerHTML = scored.map(({ winery: w, score }) => this.wineryCard(w, score, maxScore)).join('');
    resultsEl.querySelectorAll('.winery-add-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleTrip(btn.dataset.wineryId, btn); });
    });
    resultsEl.querySelectorAll('.winery-result-card').forEach(card => {
      card.style.cursor = 'pointer';
      card.addEventListener('click', (e) => {
        if (e.target.closest('.winery-add-btn') || e.target.closest('a')) return;
        const w = WINERIES_DEDUPED.find(x => x.id === card.dataset.wineryId);
        if (w) this._showWineryPopup(w);
      });
    });
  }

  wineryCard(w, score, maxScore) {
    const priceLabel = { splurge: '$$$', 'mid-splurge': '$$–$$$', mid: '$$', budget: '$' }[w.price] || '$$';
    const driveText = w.sfDrive >= 180 ? `${(w.sfDrive / 60).toFixed(1)} hrs` : `${w.sfDrive} min`;
    const isInTrip = this.tripSelected.some(t => t.id === w.id);
    const TAG_LABELS = { 'intimate': 'Intimate', 'family-owned': 'Family-Owned', 'prestigious': 'Prestigious', 'scenic': 'Stunning Scenery', 'tour': 'Great Tour', 'sommelier-fave': 'Sommelier Pick', 'historic': 'Historic Estate', 'cult-fave': 'Cult Favorite', 'educational': 'Educational', 'casual': 'Casual Vibes', 'social': 'Party-Friendly' };
    const TAG_PRIORITY = ['sommelier-fave','cult-fave','historic','prestigious','scenic','tour','family-owned','intimate','educational'];
    const topTags = TAG_PRIORITY.filter(t => (w.tags||[]).includes(t)).slice(0, 3).map(t => `<span class="winery-top-tag">${TAG_LABELS[t]||t}</span>`).join('');
    const sentences = w.description.match(/[^.!]+[.!]+/g) || [w.description];
    const tagline = sentences.slice(0, 2).join(' ').trim();
    return `<div class="winery-result-card" data-winery-id="${w.id}">
      <div class="winery-card-top"><div class="winery-card-info">
        <div class="winery-name">${w.name}<span class="winery-name-meta">${w.tastingCost || priceLabel}${w.googleRating ? ` · ⭐${w.googleRating}` : ''}${w.website ? ` · <a href="https://${w.website}" target="_blank" class="winery-name-link" onclick="event.stopPropagation()">Visit ↗</a>` : ''}</span></div>
        <div class="winery-location">${w.subregion} · ${driveText}</div>
      </div><button class="winery-add-btn ${isInTrip ? 'added' : ''}" data-winery-id="${w.id}">${isInTrip ? '✓' : '+'}</button></div>
      ${topTags ? `<div class="winery-top-tags">${topTags}</div>` : ''}
      <p class="winery-tagline">${tagline}</p>
      <button class="winery-expand-btn">Expand</button>
    </div>`;
  }

  _showWineryPopup(w) {
    const existing = document.getElementById('winery-popup'); if (existing) existing.remove();
    const TL = { 'intimate':'Intimate','family-owned':'Family-Owned','prestigious':'Prestigious','scenic':'Scenery','tour':'Great Tour','sommelier-fave':'Sommelier Pick','historic':'Historic','cult-fave':'Cult Favorite','social':'Party-Friendly','educational':'Educational','casual':'Casual' };
    const tags = (w.tags||[]).slice(0,6).map(t => `<span class="popup-tag">${TL[t]||t}</span>`).join('');
    const s = w.description.match(/[^.!]+[.!]+/g)||[w.description]; const tagline = s.slice(0,2).join(' ');
    const pl = {splurge:'$$$','mid-splurge':'$$–$$$',mid:'$$',budget:'$'}[w.price]||'$$';
    const popup = document.createElement('div'); popup.id = 'winery-popup'; popup.className = 'winery-popup-overlay';
    popup.innerHTML = `<div class="winery-popup"><button class="winery-popup-close">×</button>
      <div class="winery-popup-header"><h2>${w.name}</h2><div class="winery-popup-meta">${w.subregion} · ${w.region} · ${pl}${w.googleRating ? ` · ⭐ ${w.googleRating} (${w.reviewCount})` : ''}</div></div>
      <p class="winery-popup-desc">${tagline}</p><div class="winery-popup-tags">${tags}</div>
      <div class="winery-popup-details">
        <div class="winery-popup-row"><strong>Must taste:</strong> ${w.mustTaste}</div>
        ${w.tastingCost ? `<div class="winery-popup-row"><strong>Tasting:</strong> ${w.tastingCost}</div>` : ''}
        ${w.bookingNote ? `<div class="winery-popup-row"><strong>Booking:</strong> ${w.bookingNote}</div>` : ''}
        <div class="winery-popup-row">💡 ${w.tip}</div>
        ${w.funFact ? `<div class="winery-popup-row">⭐ ${w.funFact}</div>` : ''}
      </div>
      ${w._matchReasons && w._matchReasons.length ? `<div class="winery-popup-match-reasons"><div class="match-reasons-label">Why this is a great match:</div>${w._matchReasons.map(r=>`<div class="match-reason-item">✓ ${r}</div>`).join('')}</div>` : ''}
      ${w._filterNotes && w._filterNotes.length ? `<div class="winery-popup-filter-notes"><div class="filter-notes-label">Potential gaps:</div>${w._filterNotes.map(n=>`<div class="filter-note-item">• ${n}</div>`).join('')}</div>` : `<div class="winery-popup-perfect-match">✓ Strong match across all preferences</div>`}
      ${w.website ? `<a href="https://${w.website}" target="_blank" class="winery-popup-link">Visit ${w.website} ↗</a>` : ''}
    </div>`;
    document.body.appendChild(popup);
    popup.querySelector('.winery-popup-close').addEventListener('click', () => popup.remove());
    popup.addEventListener('click', (e) => { if (e.target === popup) popup.remove(); });
  }

  toggleTrip(wineryId, btn) {
    const winery = WINERIES_DEDUPED.find(w => w.id === wineryId); if (!winery) return;
    const idx = this.tripSelected.findIndex(w => w.id === wineryId);
    if (idx >= 0) { this.tripSelected.splice(idx, 1); if (btn) { btn.textContent = '+'; btn.classList.remove('added'); } }
    else { this.tripSelected.push(winery); if (btn) { btn.textContent = '✓'; btn.classList.add('added'); } }
    this.renderTripBuilder();
  }

  renderTripBuilder() {
    const nextBtn = document.getElementById('go-to-step2-btn');
    const builderSection = document.getElementById('trip-builder-section');
    if (this.tripSelected.length) { builderSection.style.display = 'block'; nextBtn.style.display = 'block'; } else { builderSection.style.display = 'none'; }
    const step2List = document.getElementById('step2-winery-list');
    if (step2List) {
      if (!this.tripSelected.length) { step2List.innerHTML = '<span class="step2-empty-msg">Add wineries from Step 1 above</span>'; }
      else {
        step2List.innerHTML = this.tripSelected.map(w => `<div class="step2-winery-chip"><span>${w.name}</span><span class="chip-time">${w.tastingCost||''}</span>${w.website ? `<a href="https://${w.website}" target="_blank" class="chip-book" onclick="event.stopPropagation()">Book</a>` : ''}<button class="chip-remove" data-winery-id="${w.id}">×</button></div>`).join('');
        step2List.querySelectorAll('.chip-remove').forEach(btn => { btn.addEventListener('click', () => { const ab = document.querySelector(`.winery-add-btn[data-winery-id="${btn.dataset.wineryId}"]`); this.toggleTrip(btn.dataset.wineryId, ab); }); });
      }
    }
    this.buildItinerary();
  }

  wireLogistics() {
    this.tripDays = 1;
    document.querySelectorAll('.trip-day-btn').forEach(btn => { btn.addEventListener('click', () => { document.querySelectorAll('.trip-day-btn').forEach(b => b.classList.remove('active')); btn.classList.add('active'); this.tripDays = parseInt(btn.dataset.days); }); });
    const startSelect = document.getElementById('start-location');
    const startCustom = document.getElementById('start-location-custom');
    if (startSelect) startSelect.addEventListener('change', () => { startCustom.style.display = startSelect.value === 'custom' ? 'block' : 'none'; });
    document.getElementById('build-itinerary-btn').addEventListener('click', () => { this.buildItinerary(); const el = document.getElementById('trip-itinerary'); if (el.innerHTML.trim()) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    const mapsBtn = document.getElementById('open-maps-btn'); if (mapsBtn) mapsBtn.addEventListener('click', () => this.openMaps());
    document.querySelectorAll('.meal-style-btn').forEach(btn => { btn.addEventListener('click', () => { const m = btn.dataset.meal; document.querySelectorAll(`.meal-style-btn[data-meal="${m}"]`).forEach(b => b.classList.remove('active')); btn.classList.add('active'); }); });
    ['breakfast','lunch','dinner'].forEach(meal => {
      const cb = document.getElementById(`plan-${meal}`);
      if (cb) cb.addEventListener('change', () => { const wrap = document.getElementById(`${meal}-style-wrap`); if (wrap) wrap.style.display = cb.checked ? 'block' : 'none'; });
    });
    this.customActivities = [];
    const actBtn = document.getElementById('custom-activity-add-btn');
    const actInput = document.getElementById('custom-activity-input');
    if (actBtn) { actBtn.addEventListener('click', () => { const v = actInput.value.trim(); if (!v) return; this.customActivities.push(v); actInput.value = ''; this._renderCustomActivities(); }); }
  }

  _renderCustomActivities() {
    const list = document.getElementById('custom-activities-list');
    if (!list) return;
    list.innerHTML = this.customActivities.map((a, i) => { const name = typeof a === 'string' ? a : a.name; return `<div class="custom-activity-chip"><span>${name}</span><button data-idx="${i}">×</button></div>`; }).join('');
    list.querySelectorAll('button').forEach(btn => { btn.addEventListener('click', () => { this.customActivities.splice(parseInt(btn.dataset.idx), 1); this._renderCustomActivities(); this.buildItinerary(); }); });
  }

  _getStartLocation() {
    const sel = document.getElementById('start-location');
    if (sel && sel.value === 'custom') return document.getElementById('start-location-custom').value.trim() || 'San Francisco, CA';
    return sel ? sel.value : 'San Francisco, CA';
  }

  _snapToSlot(h) { const hr = Math.floor(h); const m = Math.ceil(((h - hr) * 60) / 15) * 15; return m >= 60 ? hr + 1 : hr + m / 60; }
  _toTimeValue(h) { const s = this._snapToSlot(h); const hr = Math.floor(s); const m = Math.round((s - hr) * 60); return `${hr.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}`; }
  _formatTime(h) { const s = this._snapToSlot(h); const hr = Math.floor(s); const m = Math.round((s - hr) * 60); const p = hr >= 12 ? 'PM' : 'AM'; const d = hr > 12 ? hr - 12 : (hr === 0 ? 12 : hr); return `${d}:${m.toString().padStart(2,'0')} ${p}`; }

  _getMealRec(type) {
    const region = this.selectedRegion || (this.tripSelected[0] && this.tripSelected[0].region) || 'Napa Valley';
    const recs = (FOOD_RECS[region] || FOOD_RECS['Napa Valley'])[type] || [];
    return recs.length ? recs[Math.floor(Math.random() * recs.length)] : null;
  }

  _getSelectedMealSpot(meal) { return this.selectedMealSpots[meal] || null; }

  buildItinerary() {
    const el = document.getElementById('trip-itinerary');
    const actionsEl = document.getElementById('itinerary-actions');
    const start = this._getStartLocation();
    const accommodation = document.getElementById('accommodation-input') ? document.getElementById('accommodation-input').value.trim() : '';
    const days = this.tripDays || 1;
    if (!this.tripSelected.length) {
      el.innerHTML = '<div class="itinerary-placeholder"><div class="itinerary-placeholder-icon">🗺️</div><div class="itinerary-placeholder-text">Select wineries in Step 1 to build your itinerary here</div></div>';
      if (actionsEl) actionsEl.style.display = 'none'; return;
    }
    if (actionsEl) actionsEl.style.display = 'flex';
    const planBreakfast = document.getElementById('plan-breakfast')?.checked;
    const planLunch = document.getElementById('plan-lunch')?.checked;
    const planDinner = document.getElementById('plan-dinner')?.checked;
    const perDay = Math.ceil(this.tripSelected.length / days);
    const dayGroups = [];
    for (let d = 0; d < days; d++) dayGroups.push(this.tripSelected.slice(d * perDay, (d + 1) * perDay));
    const startTimeEl = document.getElementById('trip-start-time');
    const firstTastingHour = startTimeEl ? parseFloat(startTimeEl.value) : 10;
    const scheduleErrors = [];
    const scheduleHtml = dayGroups.map((wineries, dayIdx) => {
      const firstW = wineries[0];
      const firstDriveMin = firstW ? Math.max(15, Math.min(firstW.sfDrive, 120)) : 30;
      const startFrom = dayIdx === 0 ? start : (accommodation || start);
      let departHour = firstTastingHour;
      if (planBreakfast && dayIdx === 0) departHour -= 0.75;
      departHour -= firstDriveMin / 60;
      departHour = this._snapToSlot(Math.max(departHour, 7));
      let currentHour = departHour;
      const dayLabel = days > 1 ? `<div class="itinerary-day-header">Day ${dayIdx + 1}</div>` : '';
      const stops = [];
      stops.push(`<div class="itinerary-stop itinerary-start"><div class="itinerary-time">${this._formatTime(currentHour)}</div><div class="itinerary-stop-info"><div class="itinerary-stop-name">Depart from ${startFrom}</div></div></div>`);
      let initialDriveAdded = false;
      if (!planBreakfast || dayIdx > 0) {
        if (firstW) {
          stops.push(`<div class="itinerary-stop itinerary-drive-stop"><div class="itinerary-drive-info"><span class="drive-icon">🚗</span><span class="drive-text">${firstDriveMin} min drive to ${firstW.name}</span></div></div>`);
          initialDriveAdded = true;
        }
      }
      if (planBreakfast && dayIdx === 0) {
        const bfRec = this._getSelectedMealSpot('breakfast') || this._getMealRec('quick');
        stops.push(`<div class="itinerary-stop itinerary-meal-stop" style="min-height:55px"><div class="itinerary-time">${this._formatTime(currentHour)}</div><div class="itinerary-stop-info"><div class="itinerary-stop-name">🍳 Breakfast${bfRec ? ': ' + bfRec.name : ''}</div></div></div>`);
        currentHour += 0.75;
      }
      let lastScheduledWinery = null;
      wineries.forEach((w, i) => {
        const skipDrive = (i === 0 && initialDriveAdded);
        const prevW = lastScheduledWinery;
        const prevDrive = (!prevW || i === 0) ? w.sfDrive : Math.abs(w.sfDrive - prevW.sfDrive) + 15;
        const driveMin = skipDrive ? 0 : Math.max(15, Math.min(prevDrive, 120));
        const arrivalHour = currentHour + driveMin / 60;
        let scheduledHour = this._snapToSlot(arrivalHour);
        if (scheduledHour < w.openHour) scheduledHour = w.openHour;
        if (scheduledHour > w.lastBooking) {
          scheduleErrors.push({ winery: w.name, msg: `<strong>${w.name}</strong> cannot be scheduled — arrives ${this._formatTime(scheduledHour)}, last booking ${this._formatTime(w.lastBooking)}.`, suggestion: 'Remove a winery or add another day.' });
          return;
        }
        if (!skipDrive) {
          const prevName = prevW ? prevW.name : startFrom;
          stops.push(`<div class="itinerary-stop itinerary-drive-stop"><div class="itinerary-drive-info"><span class="drive-icon">🚗</span><span class="drive-text">${driveMin} min drive to ${w.name}</span></div></div>`);
        }
        currentHour = scheduledHour; lastScheduledWinery = w;
        const leaveByHour = this._snapToSlot(scheduledHour + 1.5);
        const bookLink = w.website ? `<a href="https://${w.website}" target="_blank" class="itinerary-book-link" onclick="event.stopPropagation()">Reserve ↗</a>` : '';
        stops.push(`<div class="itinerary-stop itinerary-winery-stop" style="min-height:75px" data-winery-id="${w.id}" draggable="true">
          <div class="stop-time-range"><input type="time" class="stop-time-input" value="${this._toTimeValue(scheduledHour)}" /><span class="stop-time-dash">–</span><input type="time" class="stop-end-input" value="${this._toTimeValue(leaveByHour)}" /></div>
          <div class="itinerary-stop-info"><div class="itinerary-stop-name"><span class="winery-stop-icon">🍷</span> ${w.name}</div><div class="itinerary-stop-sub">${w.subregion} · ${w.tastingCost||'varies'} ${bookLink}</div><div class="itinerary-duration">~90 min · Leave by ${this._formatTime(leaveByHour)}</div><div class="itinerary-hours">Open ${w.tastingHours}</div>${w.lowCell ? '<div class="itinerary-signal-flag">📵 Low cell</div>' : ''}</div>
          <div class="stop-actions"><button class="stop-lock-btn ${this.lockedStops['winery-'+w.id] !== undefined ? 'locked' : ''}" data-lock-key="winery-${w.id}" data-lock-time="${scheduledHour}">${this.lockedStops['winery-'+w.id] !== undefined ? '🔒' : '🔓'}</button><button class="stop-remove-btn" data-stop-type="winery" data-stop-id="${w.id}">×</button></div>
        </div>`);
        currentHour = this._snapToSlot(scheduledHour + 1.5);
        if (planLunch && i === 1 && currentHour >= 12 && currentHour < 14.5) {
          const rec = this._getSelectedMealSpot('lunch') || this._getMealRec('quick');
          stops.push(`<div class="itinerary-stop itinerary-meal-stop" style="min-height:55px"><div class="itinerary-time">${this._formatTime(currentHour)}</div><div class="itinerary-stop-info"><div class="itinerary-stop-name">🍽️ Lunch${rec ? ': '+rec.name : ''}</div></div></div>`);
          currentHour += 1.25;
        }
      });
      if (planDinner && currentHour >= 17 && currentHour < 20) {
        const rec = this._getSelectedMealSpot('dinner') || this._getMealRec('sitdown');
        stops.push(`<div class="itinerary-stop itinerary-meal-stop" style="min-height:55px"><div class="itinerary-time">${this._formatTime(currentHour)}</div><div class="itinerary-stop-info"><div class="itinerary-stop-name">🍽️ Dinner${rec ? ': '+rec.name : ''}</div></div></div>`);
      }
      // Custom activities
      if (this.customActivities && this.customActivities.length && dayIdx === dayGroups.length - 1) {
        this.customActivities.forEach(a => { const name = typeof a === 'string' ? a : a.name; currentHour = this._snapToSlot(currentHour + 0.25); stops.push(`<div class="itinerary-stop itinerary-activity-stop"><div class="itinerary-time">${this._formatTime(currentHour)}</div><div class="itinerary-stop-info"><div class="itinerary-stop-name">${name}</div></div></div>`); currentHour += 0.75; });
      }
      // Return drive
      const returnTo = accommodation || start;
      const lastW = lastScheduledWinery || wineries[wineries.length - 1];
      const returnMin = lastW ? Math.max(20, Math.min(lastW.sfDrive, 120)) : 45;
      stops.push(`<div class="itinerary-stop itinerary-drive-stop"><div class="itinerary-drive-info"><span class="drive-icon">🚗</span><span class="drive-text">${returnMin} min drive to ${returnTo}</span></div></div>`);
      const arriveHome = this._snapToSlot(currentHour + returnMin / 60);
      stops.push(`<div class="itinerary-stop itinerary-start"><div class="itinerary-time">${this._formatTime(arriveHome)}</div><div class="itinerary-stop-info"><div class="itinerary-stop-name">Arrive at ${returnTo}</div></div></div>`);
      return `${dayLabel}<div class="itinerary-timeline">${stops.join('')}</div>`;
    }).join('');
    const errorHtml = scheduleErrors.length ? `<div class="itinerary-errors-banner" id="itinerary-errors-banner"><div class="itinerary-errors-header"><div class="itinerary-errors-title">⚠️ ${scheduleErrors.length} winer${scheduleErrors.length===1?'y':'ies'} could not be scheduled</div><button class="itinerary-errors-dismiss" id="dismiss-errors-btn">Dismiss</button></div>${scheduleErrors.map(e=>`<div class="itinerary-error-item"><div class="itinerary-error">${e.msg}</div><div class="itinerary-error-suggestion">${e.suggestion}</div></div>`).join('')}</div>` : '';
    el.innerHTML = `${errorHtml}<div class="itinerary-schedule">${scheduleHtml}<div class="schedule-command-bar"><div class="schedule-command-label">Update your schedule</div><div class="schedule-command-row"><input type="text" id="schedule-command-input" class="schedule-command-input" placeholder="e.g. Add coffee stop, remove winery, start earlier..." /><button class="schedule-command-btn" id="schedule-command-btn">Apply</button></div><div class="schedule-command-status" id="schedule-command-status"></div></div></div>`;
    // Wire events
    const dismissBtn = document.getElementById('dismiss-errors-btn');
    if (dismissBtn) dismissBtn.addEventListener('click', () => document.getElementById('itinerary-errors-banner').remove());
    el.querySelectorAll('.stop-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); const t = btn.dataset.stopType; const id = btn.dataset.stopId;
        if (t === 'winery') { const ab = document.querySelector(`.winery-add-btn[data-winery-id="${id}"]`); if (ab) this.toggleTrip(id, ab); else { this.tripSelected = this.tripSelected.filter(w => w.id !== id); this.renderTripBuilder(); } }
      });
    });
    el.querySelectorAll('.stop-lock-btn').forEach(btn => {
      btn.addEventListener('click', (e) => { e.stopPropagation(); const key = btn.dataset.lockKey; const time = parseFloat(btn.dataset.lockTime);
        if (this.lockedStops[key] !== undefined) delete this.lockedStops[key]; else this.lockedStops[key] = time;
        this.buildItinerary();
      });
    });
    // Drag and drop
    el.querySelectorAll('.itinerary-winery-stop').forEach(stop => {
      stop.addEventListener('dragstart', (e) => { stop.classList.add('dragging'); e.dataTransfer.setData('text/plain', stop.dataset.wineryId); });
      stop.addEventListener('dragend', () => stop.classList.remove('dragging'));
    });
    el.querySelectorAll('.itinerary-stop').forEach(dt => {
      dt.addEventListener('dragover', (e) => { e.preventDefault(); dt.classList.add('drag-over'); });
      dt.addEventListener('dragleave', () => dt.classList.remove('drag-over'));
      dt.addEventListener('drop', (e) => { e.preventDefault(); dt.classList.remove('drag-over');
        const draggedId = e.dataTransfer.getData('text/plain'); if (!draggedId) return;
        const allWS = [...el.querySelectorAll('.itinerary-winery-stop')];
        const fromIdx = this.tripSelected.findIndex(w => w.id === draggedId);
        let toIdx = allWS.indexOf(dt);
        if (toIdx < 0) toIdx = this.tripSelected.length - 1;
        if (fromIdx < 0 || fromIdx === toIdx) return;
        const [moved] = this.tripSelected.splice(fromIdx, 1);
        this.tripSelected.splice(toIdx, 0, moved);
        this.buildItinerary();
      });
    });
    this._wireCommandBar();
  }

  _wireCommandBar() {
    const cmdBtn = document.getElementById('schedule-command-btn');
    const cmdInput = document.getElementById('schedule-command-input');
    const cmdStatus = document.getElementById('schedule-command-status');
    if (!cmdBtn) return;
    const handle = () => {
      const raw = cmdInput.value.trim(); const cmd = raw.toLowerCase(); if (!cmd) return; cmdStatus.textContent = '';
      if (cmd.startsWith('add ')) { this.customActivities.push(raw.replace(/^add\s+/i,'')); this._renderCustomActivities(); cmdInput.value = ''; this.buildItinerary(); return; }
      if (cmd.includes('remove') || cmd.includes('delete')) { const t = cmd.replace(/remove|delete/gi,'').trim(); const m = this.tripSelected.find(w => w.name.toLowerCase().includes(t)); if (m) { this.tripSelected = this.tripSelected.filter(w => w.id !== m.id); this.renderTripBuilder(); } else cmdStatus.textContent = `Couldn't find "${t}"`; cmdInput.value = ''; return; }
      if (cmd.includes('swap') || cmd.includes('replace')) { const parts = cmd.split(/swap|replace|with|for/i).map(s=>s.trim()).filter(Boolean); if (parts.length>=2) { const o = this.tripSelected.find(w=>w.name.toLowerCase().includes(parts[0])); const n = WINERIES_DEDUPED.find(w=>w.name.toLowerCase().includes(parts[1])&&!this.tripSelected.some(t=>t.id===w.id)); if (o&&n) { const i = this.tripSelected.findIndex(w=>w.id===o.id); this.tripSelected[i] = n; this.renderTripBuilder(); } } cmdInput.value = ''; return; }
      if (cmd.includes('earlier')||cmd.includes('later')) { const sel = document.getElementById('trip-start-time'); if (cmd.includes('earlier')&&sel.selectedIndex>0) sel.selectedIndex--; if (cmd.includes('later')&&sel.selectedIndex<sel.options.length-1) sel.selectedIndex++; cmdInput.value = ''; this.buildItinerary(); return; }
      cmdStatus.textContent = 'Try: "add coffee stop", "remove Opus One", "swap X with Y", "start earlier"'; cmdInput.value = '';
    };
    cmdBtn.addEventListener('click', handle);
    cmdInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handle(); });
  }

  openMaps() {
    const start = this._getStartLocation(); if (!this.tripSelected.length) return;
    const enc = encodeURIComponent; const dest = enc(this.tripSelected[this.tripSelected.length-1].name+', California');
    const waypoints = this.tripSelected.slice(0,-1).map(w=>enc(w.name+', California')).join('|');
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${enc(start)}&destination=${dest}${waypoints ? `&waypoints=${waypoints}` : ''}`, '_blank');
  }

  // ── Regions guide ──────────────────────────────────────
  buildRegionsGuide() {
    const guideEl = document.getElementById('ca-regions-guide'); if (!guideEl) return;
    guideEl.innerHTML = '';
    this._wireMapHover();
    CA_REGIONS_GUIDE.forEach(region => {
      const card = document.createElement('div'); card.className = 'rg-card'; card.dataset.regionId = region.id; card.style.borderTopColor = region.color;
      card.innerHTML = `<button class="rg-header" aria-expanded="false"><div class="rg-header-left"><div class="rg-name">${region.name}</div><div class="rg-tagline">${region.tagline}</div></div><span class="rg-chevron">Explore →</span></button>
        <div class="rg-body" hidden><div class="rg-meta-row"><span>🍇 ${region.bestFor}</span><span>🚗 ${region.sfDrive}</span></div><p class="rg-overview">${region.overview}</p>
        <div class="rg-subregions">${region.subregions.map(sub=>`<div class="rg-sub" style="border-left:3px solid ${region.color}"><div class="rg-sub-name"><span class="rg-sub-dot" style="background:${region.color}"></span>${sub.name}</div><p class="rg-sub-desc">${sub.description}</p><div class="rg-sub-footer"><strong>Best for:</strong> ${sub.bestFor} · <strong>Know:</strong> ${sub.mustKnow}</div></div>`).join('')}</div></div>`;
      const header = card.querySelector('.rg-header'); const body = card.querySelector('.rg-body'); const chevron = card.querySelector('.rg-chevron');
      header.addEventListener('click', () => { const isOpen = !body.hidden; body.hidden = isOpen; chevron.textContent = isOpen ? 'Explore →' : 'Close ×'; card.classList.toggle('open', !isOpen); });
      guideEl.appendChild(card);
    });
    document.querySelectorAll('.callout-name-link').forEach(link => {
      link.addEventListener('click', (e) => { e.preventDefault(); const card = document.querySelector(`.rg-card[data-region-id="${link.dataset.cardId}"]`);
        if (card) { const h = card.querySelector('.rg-header'); const b = card.querySelector('.rg-body'); if (b.hidden) h.click(); card.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      });
    });
  }

  _wireMapHover() {
    const mapDiv = document.getElementById('ca-wine-leaflet-map');
    if (!mapDiv || typeof L === 'undefined') return;
    if (this._leafletMap) return;
    const map = L.map('ca-wine-leaflet-map', { center: [38.40, -122.55], zoom: 9, zoomControl: false, scrollWheelZoom: true, attributionControl: false });
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_nolabels/{z}/{x}/{y}{r}.png', { maxZoom: 18, subdomains: 'abcd' }).addTo(map);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png', { maxZoom: 18, subdomains: 'abcd', opacity: 0.35 }).addTo(map);
    const regions = [
      { id: 'napa', name: 'NAPA VALLEY', center: [38.30, -122.26], color: '#C4602A', tagline: "California's most prestigious wine region", bestFor: 'Cabernet Sauvignon, Chardonnay', sfDrive: '75–100 min' },
      { id: 'sonoma', name: 'SONOMA', center: [38.32, -122.72], color: '#5C7A52', tagline: 'Cooler, diverse, laid-back', bestFor: 'Pinot Noir, Chardonnay, Zinfandel', sfDrive: '50–90 min' },
      { id: 'healdsburg', name: 'HEALDSBURG', center: [38.62, -122.87], color: '#C4922A', tagline: 'Relaxed, low-key, local crowd', bestFor: 'Russian River, Dry Creek, Alexander Valley', sfDrive: '75–80 min' },
      { id: 'paso-robles', name: 'PASO ROBLES', center: [35.63, -120.69], color: '#8A6DAC', tagline: "Exciting emerging destination", bestFor: 'Rhône varieties, value', sfDrive: '3–3.5 hrs' },
    ];
    regions.forEach(r => {
      const icon = L.divIcon({ html: `<span class="map-region-text" style="color:${r.color}">${r.name}</span>`, className: 'region-label-icon', iconAnchor: [50, 8] });
      const marker = L.marker(r.center, { icon }).addTo(map);
      marker.bindTooltip(`<div style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;font-weight:600;color:${r.color}">${r.name}</div><div style="font-family:'Lora',serif;font-size:0.75rem;font-style:italic;color:#5C3428">${r.tagline}</div><div style="font-family:'Montserrat',sans-serif;font-size:0.65rem;color:#8A6050">🍇 ${r.bestFor} · 🚗 ${r.sfDrive}</div>`, { className: 'wine-region-tooltip', direction: 'top', offset: [0, -12] });
      marker.on('click', () => { const card = document.querySelector(`.rg-card[data-region-id="${r.id}"]`); if (card) { const h = card.querySelector('.rg-header'); const b = card.querySelector('.rg-body'); if (b.hidden) h.click(); card.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
    });
    const subLocs = [
      { name: 'Carneros', center: [38.22, -122.34], color: '#C4602A' },
      { name: 'Yountville', center: [38.36, -122.20], color: '#C4602A' },
      { name: 'Stags Leap', center: [38.40, -122.15], color: '#C4602A' },
      { name: 'St. Helena', center: [38.52, -122.15], color: '#C4602A' },
      { name: 'Calistoga', center: [38.60, -122.20], color: '#C4602A' },
      { name: 'Sonoma Valley', center: [38.24, -122.52], color: '#5C7A52' },
      { name: 'Russian River', center: [38.48, -122.95], color: '#5C7A52' },
      { name: 'Sonoma Coast', center: [38.38, -123.08], color: '#5C7A52' },
      { name: 'Dry Creek', center: [38.68, -123.00], color: '#C4922A' },
      { name: 'Alexander Vly', center: [38.74, -122.84], color: '#C4922A' },
    ];
    const subMarkers = [];
    subLocs.forEach(s => {
      const icon = L.divIcon({ html: `<span class="map-subregion-text" style="color:${s.color}">${s.name}</span>`, className: 'region-label-icon', iconAnchor: [30, 6] });
      const m = L.marker(s.center, { icon, interactive: false }); subMarkers.push(m);
      if (map.getZoom() >= 10) m.addTo(map);
    });
    map.on('zoomend', () => { const z = map.getZoom(); subMarkers.forEach(m => { if (z >= 10 && !map.hasLayer(m)) map.addLayer(m); if (z < 10 && map.hasLayer(m)) map.removeLayer(m); }); });
    const sfIcon = L.divIcon({ html: '<div style="background:#B09280;width:8px;height:8px;border-radius:50%;border:1.5px solid #FBF5EE"></div>', className: '', iconSize: [8, 8], iconAnchor: [4, 4] });
    L.marker([37.78, -122.42], { icon: sfIcon }).addTo(map).bindTooltip('San Francisco', { permanent: true, direction: 'right', className: 'sf-label-tooltip', offset: [6, 0] });
    this._leafletMap = map;
    setTimeout(() => map.invalidateSize(), 200);
  }
}
