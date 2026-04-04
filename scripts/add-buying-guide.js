// add-buying-guide.js — Add buying links and guidance for all producers
const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, '..', 'public', 'data', 'producers.json');
const data = JSON.parse(fs.readFileSync(file, 'utf8'));

// Reliable search URL patterns (these will always resolve to a search page)
function wineComSearch(name) {
  return `https://www.wine.com/search?query=${encodeURIComponent(name)}`;
}
function wineSearcherSearch(name) {
  return `https://www.wine-searcher.com/find/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '+'))}`;
}
function vivinoSearch(name) {
  return `https://www.vivino.com/search/wines?q=${encodeURIComponent(name)}`;
}

// Producers with known reliable retail links
const DIRECT_LINKS = {
  // These are widely available and reliably stocked on wine.com
  // Using wine.com search links which always work
};

// Hard-to-find / allocated guidance
const ALLOCATION_GUIDE = {
  'Screaming Eagle': 'Mailing list only. Secondary market: auction houses (Hart Davis Hart, Acker Merrall & Condit) or Benchmark Wine Group.',
  'Harlan Estate': 'Mailing list allocation. Secondary: Benchmark Wine Group, WineBid, or fine wine retailers like K&L Wine Merchants.',
  'Sine Qua Non': 'Mailing list only (years-long waitlist). Secondary market: WineBid, Vinfolio.',
  'Bond Estates': 'Direct allocation from winery mailing list. Secondary: auction houses.',
  'Marcassin': 'Mailing list only (closed to new members). Occasionally at auction.',
  'Domaine de la Romanee-Conti': 'Allocated through select importers and fine wine shops. Try: Chambers Street Wines (NYC), K&L Wine Merchants (CA), Flatiron Wines (NYC). Auction: Christie\'s, Sotheby\'s.',
  'Domaine Leroy': 'Very limited production. Fine wine retailers and auction houses. Try: Chambers Street Wines, Rare Wine Co.',
  'Domaine Coche-Dury': 'Extremely allocated. Fine wine shops with Burgundy allocations. Auction is the most reliable source.',
  'Petrus': 'Allocated through Bordeaux negociants. Fine wine retailers: Millesima, Berry Bros & Rudd. Auction houses.',
  'Chateau Le Pin': 'Tiny production (~600 cases). Auction only for most buyers: Christie\'s, Sotheby\'s, Hart Davis Hart.',
  'Dominio de Pingus': 'Very limited. Spanish wine specialists or auction. Try: Jose Pastor Selections.',
  'Giacomo Conterno': 'Limited allocation through Italian wine importers. Try: Chambers Street Wines, Vino Italiano selections.',
  'Chateau Rayas': 'Notoriously limited. Kermit Lynch Wine Merchant (importer) or fine wine auctions.',
  'Jacques Selosse': 'Grower Champagne with tiny production. Specialty wine shops: Chambers Street, The Source (UK).',
  'Egon Muller': 'Very limited, especially Scharzhofberger TBA. Auction for top wines. German wine specialists for Kabinett/Spatlese.',
  'Giuseppe Quintarelli': 'No longer in production (estate wines only from existing stock). Auction houses and Italian fine wine specialists.',
  'Hundred Acre': 'Mailing list. Secondary: WineBid, Benchmark.',
  'Salon': 'Only produced in exceptional vintages. Fine wine retailers or Champagne specialists.',
  'Chateau Ausone': 'Allocated through Bordeaux negociants. Fine wine shops: Millesima, JJ Buckley.',
  'Dalla Valle': 'Mailing list allocation. Secondary market retailers.',
  'Colgin': 'Mailing list only. Secondary: auction houses, Benchmark Wine Group.',
  'Bryant Family': 'Mailing list. Secondary market: WineBid.',
  'Scarecrow': 'Mailing list only (long waitlist). Auction: Hart Davis Hart.',
  'Georges Roumier': 'Extremely allocated Burgundy. Auction is most reliable. Fine wine shops occasionally.',
  'Sylvain Cathiard': 'Very limited Burgundy allocation. Auction or Burgundy-specialist retailers.',
  'Dugat-Py': 'Tiny production. Burgundy specialists or auction.',
  'Domaine Armand Rousseau': 'Allocated through importers. Try: Martine\'s Wines, fine wine auction.',
};

data.producers.forEach(p => {
  // Check if we have specific allocation guidance
  if (ALLOCATION_GUIDE[p.name]) {
    p.buyingGuide = {
      type: 'limited',
      note: ALLOCATION_GUIDE[p.name]
    };
    return;
  }

  const avail = p.availability;

  if (avail === 'easy-to-find' || avail === 'widely-available') {
    // Widely available — provide search links
    p.buyingGuide = {
      type: 'retail',
      note: 'Widely available at major wine retailers.',
      links: [
        { name: 'Wine.com', url: wineComSearch(p.name) },
        { name: 'Wine Searcher', url: wineSearcherSearch(p.name) },
        { name: 'Vivino', url: vivinoSearch(p.name) }
      ]
    };
  } else if (avail === 'limited') {
    // Limited — search links + guidance
    p.buyingGuide = {
      type: 'limited-retail',
      note: 'Available at specialty wine shops and online retailers, though not always in stock.',
      links: [
        { name: 'Wine Searcher', url: wineSearcherSearch(p.name) },
        { name: 'Wine.com', url: wineComSearch(p.name) }
      ]
    };
  } else if (avail === 'hard-to-find' || avail === 'allocated') {
    // Hard to find — Wine Searcher is the best tool + general guidance
    const country = p.country;
    let note = 'Limited production. Check Wine Searcher for current availability, or ask your local fine wine shop.';
    if (country === 'France') note = 'Limited production. Try Wine Searcher, or French wine importers and fine wine retailers.';
    if (country === 'Italy') note = 'Limited production. Try Wine Searcher, or Italian wine specialists like Vino Italiano.';
    if (country === 'USA') note = 'Often sold through mailing lists or allocated to restaurants. Check Wine Searcher or the winery website directly.';

    p.buyingGuide = {
      type: 'hard-to-find',
      note: note,
      links: [
        { name: 'Wine Searcher', url: wineSearcherSearch(p.name) }
      ]
    };
  } else {
    // Fallback
    p.buyingGuide = {
      type: 'retail',
      note: 'Search online wine retailers for availability.',
      links: [
        { name: 'Wine Searcher', url: wineSearcherSearch(p.name) }
      ]
    };
  }
});

fs.writeFileSync(file, JSON.stringify(data, null, 2));

// Stats
const types = {};
data.producers.forEach(p => types[p.buyingGuide.type] = (types[p.buyingGuide.type]||0)+1);
console.log(`Done! ${data.producers.length} producers updated.`);
console.log('By type:', JSON.stringify(types));

// Samples
console.log('\nSamples:');
['Ridge Vineyards', 'Screaming Eagle', 'Cloudy Bay', 'Domaine de la Romanee-Conti', 'Bodegas Muga'].forEach(name => {
  const p = data.producers.find(x => x.name === name);
  if (p) {
    console.log(`\n${p.name} (${p.buyingGuide.type}):`);
    console.log(`  ${p.buyingGuide.note}`);
    if (p.buyingGuide.links) console.log(`  Links: ${p.buyingGuide.links.map(l => l.name).join(', ')}`);
  }
});
