// food-pairing.js — Interactive food and wine pairing guide

const WINES = [
  {
    id: 'cab-sauv',
    name: 'Cabernet Sauvignon',
    emoji: '🍷',
    type: 'Red',
    profile: 'Full-bodied, tannic, dark fruit, cedar, cassis',
    foods: [
      { name: 'Ribeye Steak',      emoji: '🥩', reason: 'Fat in the beef softens tannins; the wine\'s structure cuts through richness.' },
      { name: 'Lamb Chops',        emoji: '🍖', reason: 'Classic pairing — earthy lamb harmonizes with Cab\'s cedar and dark fruit.' },
      { name: 'Aged Cheddar',      emoji: '🧀', reason: 'Bold cheese needs a bold wine; the salt and fat balance tannic grip.' },
      { name: 'Dark Chocolate',    emoji: '🍫', reason: '70%+ dark chocolate mirrors the wine\'s bitterness and depth.' },
      { name: 'Mushroom Risotto',  emoji: '🍄', reason: 'Earthy mushrooms echo the wine\'s forest floor and cedar notes.' },
      { name: 'Venison',           emoji: '🦌', reason: 'Gamey, lean red meat needs the structure that Cab Sauvignon provides.' },
    ],
    avoid: ['Delicate fish', 'Light salads', 'Spicy Thai dishes', 'Sushi'],
    serving: ['Serve at 17–19°C (62–66°F)', 'Decant for 1–2 hours to open up', 'Use large Bordeaux glasses', 'Pairs well with candles and conversation'],
    notes: 'The golden rule: match boldness with boldness. Cabernet\'s firm tannins are tamed by proteins and fats. Avoid anything too delicate or acidic that would be overwhelmed by the wine\'s weight.',
  },
  {
    id: 'pinot-noir',
    name: 'Pinot Noir',
    emoji: '🍷',
    type: 'Red',
    profile: 'Light-medium body, silky, red fruit, earthy, spice',
    foods: [
      { name: 'Roast Duck',       emoji: '🦆', reason: 'Duck\'s fat and earthy flavor are the perfect foil for Pinot\'s silky texture.' },
      { name: 'Salmon',           emoji: '🐟', reason: 'Rich, oily fish can hold up to a light red — the classic "fish with red wine" exception.' },
      { name: 'Grilled Chicken',  emoji: '🍗', reason: 'Versatile poultry matches Pinot\'s lighter body and bright fruit.' },
      { name: 'Brie / Camembert', emoji: '🧀', reason: 'Creamy, bloomy-rind cheese harmonizes with Pinot\'s earthy, mushroomy notes.' },
      { name: 'Mushroom Pasta',   emoji: '🍝', reason: 'Earthy umami of mushrooms is a natural complement to Pinot\'s terroir character.' },
      { name: 'Tuna Tartare',     emoji: '🐟', reason: 'High-quality raw tuna has enough richness to partner with a light Pinot.' },
    ],
    avoid: ['Heavy stews', 'Very spicy food', 'Strong blue cheese', 'Oysters'],
    serving: ['Serve at 15–17°C (59–63°F)', 'Use Burgundy-shaped glasses (wide bowl)', 'Light decanting (30 min) for young wines', 'Avoid too much heat — it flattens the fruit'],
    notes: 'Pinot Noir is the most food-friendly red. Its lighter body and bright acidity work with dishes that would overwhelm other reds. Avoid anything too powerful or spicy.',
  },
  {
    id: 'chardonnay',
    name: 'Chardonnay',
    emoji: '🥂',
    type: 'White',
    profile: 'Full-bodied, rich, citrus, stone fruit, vanilla (if oaked)',
    foods: [
      { name: 'Lobster',           emoji: '🦞', reason: 'Butter-poached lobster meets its match in a rich, oaked Chardonnay.' },
      { name: 'Roast Chicken',     emoji: '🍗', reason: 'A Sunday classic — the wine\'s weight mirrors the richness of roast poultry.' },
      { name: 'Creamy Pasta',      emoji: '🍝', reason: 'Butter and cream sauces need the wine\'s similar richness and texture.' },
      { name: 'Soft Goat Cheese',  emoji: '🧀', reason: 'Tangy chèvre provides refreshing contrast to a rich, buttery Chardonnay.' },
      { name: 'Scallops',          emoji: '🍤', reason: 'Delicate bivalves suit a more mineral, unoaked Chablis-style Chardonnay.' },
      { name: 'Risotto',           emoji: '🍚', reason: 'The creamy texture mirrors the wine; mushroom or seafood risotto works best.' },
    ],
    avoid: ['Raw oysters (use Chablis instead)', 'Very spicy curries', 'Sushi', 'Bitter greens'],
    serving: ['Serve at 10–12°C (50–54°F)', 'Don\'t over-chill — it mutes aroma', 'White Burgundy glasses (not too large)', 'Unoaked styles (Chablis) suit lighter dishes'],
    notes: 'The style of Chardonnay matters as much as the grape. Lean, mineral Chablis suits oysters and seafood; rich, oaked Napa Chardonnay calls for lobster and cream.',
  },
  {
    id: 'sauvignon-blanc',
    name: 'Sauvignon Blanc',
    emoji: '🥂',
    type: 'White',
    profile: 'Crisp, high acid, citrus, grass, gooseberry, minerality',
    foods: [
      { name: 'Goat Cheese Salad', emoji: '🥗', reason: 'The classic pairing from the Loire — acidity cuts the fat, citrus complements tang.' },
      { name: 'Oysters',           emoji: '🦪', reason: 'Mineral, briny wine echoes the ocean salinity of fresh oysters.' },
      { name: 'Grilled Asparagus', emoji: '🌿', reason: 'Herbaceous notes in both wine and vegetable create a harmonious match.' },
      { name: 'Sushi',             emoji: '🍣', reason: 'Clean acidity and citrus cut through raw fish perfectly.' },
      { name: 'Thai Green Curry',  emoji: '🍛', reason: 'Zippy acidity refreshes the palate against spice; citrus notes echo lime leaves.' },
      { name: 'Grilled Sea Bass',  emoji: '🐟', reason: 'Delicate white fish calls for a lean, mineral white wine.' },
    ],
    avoid: ['Full-flavored red meats', 'Chocolate', 'Heavy cream sauces', 'Aged hard cheeses'],
    serving: ['Serve well-chilled: 8–10°C (46–50°F)', 'Narrow white wine glass preserves aromatics', 'Drink young — most don\'t improve with age', 'Perfect as an aperitif with light nibbles'],
    notes: 'Sauvignon Blanc\'s high acidity makes it a natural partner for tangy, herbaceous, or seafood-based dishes. Its intensity means it can handle moderate spice better than most whites.',
  },
  {
    id: 'riesling',
    name: 'Riesling',
    emoji: '🥂',
    type: 'White',
    profile: 'High acid, floral, citrus, stone fruit, mineral (dry to sweet)',
    foods: [
      { name: 'Pork Belly',        emoji: '🥩', reason: 'Acidity cuts through fat; a touch of sweetness complements Asian glazes.' },
      { name: 'Peking Duck',       emoji: '🦆', reason: 'The classic pairing — sweet-ish plum sauce matches off-dry Riesling beautifully.' },
      { name: 'Spicy Thai Food',   emoji: '🌶️', reason: 'Riesling is the go-to for spicy food — residual sweetness tames heat.' },
      { name: 'Indian Curry',      emoji: '🍛', reason: 'Off-dry Riesling is one of few wines that work with complex spiced curries.' },
      { name: 'Smoked Salmon',     emoji: '🐟', reason: 'Smokiness and oiliness are balanced by Riesling\'s citrus and minerality.' },
      { name: 'Sushi & Sashimi',   emoji: '🍣', reason: 'Delicate, precise flavors echo the purity of high-quality raw fish.' },
    ],
    avoid: ['Very tannic red wines (serve separately)', 'Rich cream-based sauces', 'Strong blue cheese with dry styles'],
    serving: ['Serve at 8–10°C (46–50°F)', 'Narrow aromatic glass preserves floral notes', 'German styles: check label for dry (Trocken) or off-dry', 'Alsace Rieslings are generally drier than German'],
    notes: 'Riesling is arguably the world\'s most food-versatile wine. Its acidity, fruit, and (often) touch of sweetness make it uniquely capable of matching difficult-to-pair dishes like spicy Asian food.',
  },
  {
    id: 'champagne',
    name: 'Champagne & Sparkling',
    emoji: '🥂',
    type: 'Sparkling',
    profile: 'Effervescent, high acid, yeast, brioche, citrus, mineral',
    foods: [
      { name: 'Oysters',            emoji: '🦪', reason: 'One of the great pairings — mineral, saline bubbles mirror ocean oysters.' },
      { name: 'Fried Chicken',      emoji: '🍗', reason: 'The Krug-approved pairing — acidity and bubbles cut through fried fat perfectly.' },
      { name: 'Caviar',             emoji: '🫧', reason: 'The ultimate luxury pairing — saltiness of caviar flatters the wine\'s minerality.' },
      { name: 'Smoked Salmon Blini', emoji: '🐟', reason: 'Classic celebration food — smoke, cream, and bubbles are a natural trio.' },
      { name: 'Tempura',            emoji: '🍤', reason: 'Light batter and delicate fillings suit Champagne\'s delicacy and effervescence.' },
      { name: 'Salty Potato Chips', emoji: '🥔', reason: 'Surprisingly wonderful — salt and fat make Champagne seem richer and more complex.' },
    ],
    avoid: ['Heavy red meat stews', 'Very sweet desserts (unless using sweet sparkling)', 'Strong curry'],
    serving: ['Serve very cold: 7–9°C (45–48°F)', 'Use tulip flutes or even wide Burgundy glasses for complex bottles', 'Open slowly to preserve bubbles', 'Vintage Champagne can be cellared 10–20+ years'],
    notes: 'The bubbles, acidity, and yeast character of Champagne make it uniquely versatile. The rule of thumb: if something feels festive or if you\'re not sure what to open, Champagne rarely disappoints.',
  },
  {
    id: 'syrah',
    name: 'Syrah / Shiraz',
    emoji: '🍷',
    type: 'Red',
    profile: 'Full-bodied, pepper, dark fruit, olive, smoke, savory',
    foods: [
      { name: 'Lamb Shoulder',    emoji: '🍖', reason: 'Roasted lamb is Syrah\'s most classic partner — earthy, rich, and complementary.' },
      { name: 'Game Birds',       emoji: '🦢', reason: 'Gamey, dark-meated birds echo the wine\'s earthy and savory depth.' },
      { name: 'Beef Burger',      emoji: '🍔', reason: 'A great everyday pairing — grilled beef matches Syrah\'s pepper and fruit.' },
      { name: 'Grilled Sausages', emoji: '🌭', reason: 'Charcuterie and cured meats are natural friends of Rhône-style Syrah.' },
      { name: 'Olive Tapenade',   emoji: '🫒', reason: 'The olive note in Northern Rhône Syrah is literal — tapenade is a mirror pairing.' },
      { name: 'Aged Manchego',    emoji: '🧀', reason: 'Salty, slightly tangy hard cheese cuts through Syrah\'s rich tannin.' },
    ],
    avoid: ['Delicate white fish', 'Light salads', 'Sweet desserts', 'Cream-based dishes'],
    serving: ['Serve at 17–19°C (62–66°F)', 'Northern Rhône Syrah benefits from 1–2 hour decanting', 'Australian Shiraz is more approachable young', 'Large-bowled glasses work well'],
    notes: 'Northern Rhône Syrah (Hermitage, Côte-Rôtie) is elegant and savory; Australian Shiraz tends to be richer and fruit-forward. Both love grilled and roasted meats.',
  },
  {
    id: 'malbec',
    name: 'Malbec',
    emoji: '🍷',
    type: 'Red',
    profile: 'Full-bodied, velvety tannins, plum, violet, chocolate',
    foods: [
      { name: 'Asado / BBQ',       emoji: '🔥', reason: 'Argentina\'s national dish with its national wine — a perfect cultural pairing.' },
      { name: 'Short Ribs',        emoji: '🥩', reason: 'Braised, fatty beef needs Malbec\'s soft tannins and ripe plum fruit.' },
      { name: 'Empanadas',         emoji: '🥟', reason: 'The spiced meat filling is a classic Argentine pairing with Malbec.' },
      { name: 'Dark Chocolate',    emoji: '🍫', reason: 'Malbec\'s chocolate notes are literally mirrored in dark cocoa.' },
      { name: 'Chimichurri Steak', emoji: '🥩', reason: 'The herbaceous sauce and charred beef are made for Argentine Malbec.' },
      { name: 'Pizza',             emoji: '🍕', reason: 'An accessible everyday pairing — the fruit and soft tannins work with tomato and cheese.' },
    ],
    avoid: ['Delicate fish and seafood', 'Light aromatic dishes', 'Very acidic preparations'],
    serving: ['Serve at 16–18°C (61–64°F)', 'Young Malbec benefits from 30–60 min decanting', 'Standard Bordeaux glass', 'Mendoza Malbec from high-altitude vineyards ages well (10+ years)'],
    notes: 'Malbec is the world\'s most approachable full-bodied red. Its soft tannins and lush fruit make it less aggressive than Cabernet Sauvignon, working beautifully with grilled meats.',
  },
  {
    id: 'rose',
    name: 'Rosé',
    emoji: '🌸',
    type: 'Rosé',
    profile: 'Crisp, dry, red berry, citrus, floral, fresh',
    foods: [
      { name: 'Grilled Prawns',   emoji: '🍤', reason: 'Seafood and dry Provence rosé is a summer classic on the Côte d\'Azur.' },
      { name: 'Niçoise Salad',    emoji: '🥗', reason: 'The classic Provençal dish has its perfect wine companion in Provence rosé.' },
      { name: 'Charcuterie Board',emoji: '🧀', reason: 'Rosé bridges red and white — it handles the variety of a charcuterie spread.' },
      { name: 'Pizza Margherita', emoji: '🍕', reason: 'Fresh tomatoes and mozzarella are bright enough for a pink wine.' },
      { name: 'Ratatouille',      emoji: '🫑', reason: 'The Provençal vegetable dish and Provence rosé share their homeland.' },
      { name: 'Sushi',            emoji: '🍣', reason: 'Delicate and crisp, dry rosé is one of the best wines with Japanese cuisine.' },
    ],
    avoid: ['Very heavy red meats', 'Strong game', 'Very rich cream sauces', 'Overpowering spices'],
    serving: ['Serve well-chilled: 8–10°C (46–50°F)', 'Drink young (within 1–3 years of vintage)', 'White wine glass works well', 'Perfect poolside, picnic, or summer aperitif'],
    notes: 'Dry rosé is one of the most food-versatile wines. Provence rosé (Grenache-based) is the benchmark — pale, dry, and crisp. Avoid sweet rosé (white Zinfandel style) with savory food.',
  },
  {
    id: 'port',
    name: 'Port & Dessert Wines',
    emoji: '🍫',
    type: 'Fortified / Sweet',
    profile: 'Rich, sweet, dark fruit, chocolate, nutty (Tawny), dried fruit',
    foods: [
      { name: 'Stilton Blue Cheese',  emoji: '🧀', reason: 'The classic British pairing — salt and pungency of blue cheese with sweet Port is iconic.' },
      { name: 'Walnut Cake',          emoji: '🎂', reason: 'Tawny Port\'s nutty, caramel notes are echoed in walnut and pecan desserts.' },
      { name: 'Dark Chocolate Tart',  emoji: '🍫', reason: 'Mirror pairing — the wine\'s chocolate notes echo the dessert\'s cocoa.' },
      { name: 'Crème Brûlée',         emoji: '🍮', reason: 'Sauternes-style sweet wines with crème brûlée is one of gastronomy\'s great pairings.' },
      { name: 'Roquefort',            emoji: '🧀', reason: 'Sauternes and Roquefort — France\'s legendary sweet-wine-and-cheese pairing.' },
      { name: 'Christmas Pudding',    emoji: '🎄', reason: 'Vintage Port and Christmas pudding: the quintessential British festive pairing.' },
    ],
    avoid: ['Light white fish', 'Salads', 'Anything too acidic', 'Dry cheese rinds'],
    serving: ['Serve slightly chilled: 12–14°C for Port, 8–10°C for Sauternes', 'Use small dessert wine glasses', 'Vintage Port needs decanting (older vintages 2+ hours)', 'Tawny Port is lighter and can be served slightly cooler'],
    notes: 'The rule for sweet wines: the wine should be at least as sweet as the dessert, or serve with savory contrasts (blue cheese, foie gras). Never pair sweet wine with bitter desserts.',
  },
];

const FOODS = [
  {
    id: 'steak',
    name: 'Steak & Red Meat',
    emoji: '🥩',
    category: 'Meat',
    wines: [
      { name: 'Cabernet Sauvignon', emoji: '🍷', reason: 'Tannins are softened by the fat in beef; bold flavors match bold structure.' },
      { name: 'Malbec',             emoji: '🍷', reason: 'Soft tannins and ripe plum fruit complement grilled and charred beef.' },
      { name: 'Syrah/Shiraz',       emoji: '🍷', reason: 'Pepper and savory notes in Syrah are natural companions to grilled red meat.' },
      { name: 'Barolo',             emoji: '🍷', reason: 'The Italian classic — Barolo\'s high tannins are tamed by a fine bistecca.' },
      { name: 'Bordeaux Blend',     emoji: '🍷', reason: 'The original steak wine — Cabernet Sauvignon-dominant blends were built for beef.' },
    ],
    avoid: ['Delicate whites', 'Champagne', 'Moscato', 'Riesling'],
    tip: 'Match the weight of your cut: a delicate filet calls for Pinot Noir; a fatty ribeye deserves Cabernet Sauvignon.',
  },
  {
    id: 'fish',
    name: 'Fish & Seafood',
    emoji: '🐟',
    category: 'Seafood',
    wines: [
      { name: 'Chablis (Chardonnay)', emoji: '🥂', reason: 'Mineral, unoaked Chardonnay is the classic with oysters and delicate fish.' },
      { name: 'Sauvignon Blanc',      emoji: '🥂', reason: 'Citrus and mineral notes harmonize beautifully with most seafood.' },
      { name: 'Champagne',            emoji: '🥂', reason: 'Bubbles, acidity, and minerality make Champagne outstanding with seafood.' },
      { name: 'Muscadet',             emoji: '🥂', reason: 'The classic Loire white for oysters — crisp, mineral, slightly saline.' },
      { name: 'Pinot Grigio',         emoji: '🥂', reason: 'Light, clean, and neutral — the safe bet for all fish dishes.' },
    ],
    avoid: ['Tannic reds', 'Oaked Chardonnay (with delicate fish)', 'Port', 'Zinfandel'],
    tip: 'Rich, oily fish (salmon, tuna) can handle a light Pinot Noir or a full oaked Chardonnay. Delicate white fish needs crisp, mineral whites.',
  },
  {
    id: 'chicken',
    name: 'Chicken & Poultry',
    emoji: '🍗',
    category: 'Meat',
    wines: [
      { name: 'White Burgundy',      emoji: '🥂', reason: 'Chardonnay and roast chicken is a classic — the wine\'s richness matches roasted poultry.' },
      { name: 'Pinot Noir',          emoji: '🍷', reason: 'Light red that doesn\'t overwhelm; earthy notes complement roasted skin.' },
      { name: 'Viognier',            emoji: '🥂', reason: 'Floral, stone fruit aromas complement spiced chicken dishes brilliantly.' },
      { name: 'Dry Rosé',            emoji: '🌸', reason: 'Versatile and food-friendly, rosé works with nearly any chicken preparation.' },
      { name: 'Grüner Veltliner',    emoji: '🥂', reason: 'Austria\'s great white — peppery, crisp, and pairs well with herb-roasted chicken.' },
    ],
    avoid: ['Very tannic reds', 'Very sweet wines', 'Heavy Amarone-style wines'],
    tip: 'The sauce matters more than the meat with chicken. Creamy sauce → Chardonnay; tomato sauce → Italian reds; Asian spice → Riesling.',
  },
  {
    id: 'cheese',
    name: 'Cheese',
    emoji: '🧀',
    category: 'Dairy',
    wines: [
      { name: 'Sauternes (with blue cheese)', emoji: '🥂', reason: 'The Roquefort-Sauternes pairing is one of gastronomy\'s great classics.' },
      { name: 'Port (with Stilton)',   emoji: '🍫', reason: 'Britain\'s greatest pairing — the sweetness tames the pungency of blue cheese.' },
      { name: 'Champagne (with soft cheese)', emoji: '🥂', reason: 'Bubbles and acidity cut through brie and camembert beautifully.' },
      { name: 'Pinot Noir (with brie)', emoji: '🍷', reason: 'Earthy, light Pinot echoes the mushroomy notes in bloomy-rind cheeses.' },
      { name: 'Cabernet (with aged cheddar)', emoji: '🍷', reason: 'Bold aged cheese needs bold wine; the fat and salt balance Cab\'s tannins.' },
    ],
    avoid: ['Avoid wine entirely with very strong artisanal cheeses — they can make wine taste metallic'],
    tip: 'White wine generally pairs better with cheese than red wine, despite tradition. The tannins in red can clash with dairy proteins. When in doubt, choose a sweet white or sparkling.',
  },
  {
    id: 'pasta',
    name: 'Pasta & Pizza',
    emoji: '🍝',
    category: 'Italian',
    wines: [
      { name: 'Chianti Classico',    emoji: '🍷', reason: 'Sangiovese\'s high acidity cuts through tomato-based sauces beautifully.' },
      { name: 'Barbera d\'Asti',     emoji: '🍷', reason: 'Juicy, food-friendly Barbera is the everyday Italian table wine.' },
      { name: 'Pinot Grigio',        emoji: '🥂', reason: 'Clean and neutral — the default white for most pasta dishes.' },
      { name: 'Vermentino',          emoji: '🥂', reason: 'Herbal, citrusy Vermentino is wonderful with seafood pasta.' },
      { name: 'Montepulciano d\'Abruzzo', emoji: '🍷', reason: 'Rustic, juicy, and affordable — the ideal everyday pizza wine.' },
    ],
    avoid: ['Very tannic full-bodied reds with delicate cream sauces', 'Sweet wines with savory pasta'],
    tip: 'Match the sauce: tomato-based → Italian reds; cream-based → white Burgundy or unoaked Chardonnay; pesto → Vermentino or Sauvignon Blanc.',
  },
  {
    id: 'spicy',
    name: 'Spicy Food',
    emoji: '🌶️',
    category: 'Asian',
    wines: [
      { name: 'Off-dry Riesling',    emoji: '🥂', reason: 'Residual sweetness tames spice; high acidity refreshes after each bite.' },
      { name: 'Gewürztraminer',      emoji: '🥂', reason: 'Floral, slightly sweet — its exuberance holds up to bold spice.' },
      { name: 'Sparkling Wine',      emoji: '🥂', reason: 'Bubbles cleanse the palate; low-alcohol fizz (Moscato) soothes spice.' },
      { name: 'Sauvignon Blanc',     emoji: '🥂', reason: 'High acidity and citrus cut through spice; citrus notes echo lime and lemongrass.' },
      { name: 'Grenache (off-dry)',  emoji: '🍷', reason: 'Low tannin and ripe fruit avoid amplifying heat — the best red choice for spicy food.' },
    ],
    avoid: ['High-tannin reds (amplify heat)', 'High-alcohol reds (make spice unbearable)', 'Oaky wines'],
    tip: 'Alcohol and tannin magnify the sensation of spice. Choose low-alcohol, low-tannin, or slightly sweet wines. Dry reds are generally a poor choice with very spicy food.',
  },
  {
    id: 'chocolate',
    name: 'Chocolate & Dessert',
    emoji: '🍫',
    category: 'Dessert',
    wines: [
      { name: 'Vintage Port',        emoji: '🍫', reason: 'Rich, sweet, and complex — Vintage Port is chocolate\'s greatest wine companion.' },
      { name: 'Banyuls',             emoji: '🍫', reason: 'France\'s fortified Grenache from Roussillon — made for chocolate by design.' },
      { name: 'Maury',               emoji: '🍷', reason: 'Another Roussillon natural sweet wine — deep, dark, and chocolatey.' },
      { name: 'PX Sherry',           emoji: '🍫', reason: 'Pedro Ximénez — a liquid raisin — poured over ice cream is magnificent.' },
      { name: 'Recioto della Valpolicella', emoji: '🍷', reason: 'Italy\'s sweet Corvina-based wine harmonizes with bitter dark chocolate.' },
    ],
    avoid: ['Dry reds (clash with sweetness)', 'High-acid whites', 'Champagne (fine with chocolate mousse, clashes with solid chocolate)'],
    tip: 'The cardinal rule: your wine must be at least as sweet as your dessert. A dry red next to a chocolate cake tastes sour and thin. Match sweetness with sweetness.',
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian & Vegan',
    emoji: '🥦',
    category: 'Vegetarian',
    wines: [
      { name: 'Pinot Noir',          emoji: '🍷', reason: 'Earthy, light-bodied red that pairs brilliantly with mushroom and root vegetable dishes.' },
      { name: 'Grüner Veltliner',    emoji: '🥂', reason: 'Its vegetable and herb notes are a natural fit for plant-based cuisine.' },
      { name: 'Côtes du Rhône Blanc',emoji: '🥂', reason: 'Grenache Blanc and Roussanne produce rich whites that work with hearty veggie dishes.' },
      { name: 'Natural / Orange Wine',emoji: '🥂', reason: 'Skin-contact whites have texture and grip that can handle complex vegetarian dishes.' },
      { name: 'Verdicchio',          emoji: '🥂', reason: 'Italian white with herbal notes and bright acidity for salads and grilled vegetables.' },
    ],
    avoid: ['Very tannic full reds (without meat proteins to soften them)', 'Very heavy fortified wines'],
    tip: 'Think about what would replace the meat: for mushroom-based dishes, think earthy reds; for roasted roots and squash, think full whites; for bright salads, think crisp whites.',
  },
];

// ─────────────────────────────────────────────────────────────

class FoodPairing {
  constructor() {
    this.mode = 'wine-to-food'; // or 'food-to-wine'
    this.selected = null;
  }

  init() {
    this.wineGrid    = document.getElementById('wine-grid');
    this.foodGrid    = document.getElementById('food-grid');
    this.wineSelector= document.getElementById('wine-selector');
    this.foodSelector= document.getElementById('food-selector');
    this.resultsEl   = document.getElementById('pairing-results');

    this.buildWineGrid();
    this.buildFoodGrid();

    document.querySelectorAll('.pairing-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.pairing-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.mode = tab.dataset.mode;
        this.switchMode();
      });
    });
  }

  switchMode() {
    this.selected = null;
    if (this.mode === 'wine-to-food') {
      this.wineSelector.style.display = '';
      this.foodSelector.style.display = 'none';
    } else {
      this.wineSelector.style.display = 'none';
      this.foodSelector.style.display = '';
    }
    this.showPlaceholder();
    // Clear active states
    document.querySelectorAll('.selector-btn').forEach(b => b.classList.remove('active'));
  }

  buildWineGrid() {
    WINES.forEach(wine => {
      const btn = this.makeSelectorBtn(wine.emoji, wine.name, wine.type);
      btn.addEventListener('click', () => {
        document.querySelectorAll('#wine-grid .selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.showWineResult(wine);
      });
      this.wineGrid.appendChild(btn);
    });
  }

  buildFoodGrid() {
    FOODS.forEach(food => {
      const btn = this.makeSelectorBtn(food.emoji, food.name, food.category);
      btn.addEventListener('click', () => {
        document.querySelectorAll('#food-grid .selector-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.showFoodResult(food);
      });
      this.foodGrid.appendChild(btn);
    });
  }

  makeSelectorBtn(emoji, label, type) {
    const btn = document.createElement('button');
    btn.className = 'selector-btn';
    btn.innerHTML = `
      <span class="btn-emoji">${emoji}</span>
      <span class="btn-label">${label}</span>
      <span class="btn-type">${type}</span>
    `;
    return btn;
  }

  showPlaceholder() {
    this.resultsEl.innerHTML = `
      <div class="pairing-placeholder">
        <div class="placeholder-icon">🥂</div>
        <h3>Make a Selection</h3>
        <p>Choose a wine style or food to see pairing suggestions with explanations of why they work.</p>
      </div>
    `;
  }

  showWineResult(wine) {
    this.resultsEl.innerHTML = `
      <div class="pairing-result-header">
        <div class="pairing-result-emoji">${wine.emoji}</div>
        <div class="pairing-result-title">
          <h2>${wine.name}</h2>
          <p><em>${wine.profile}</em></p>
        </div>
      </div>

      <div class="pairing-notes">
        <p>${wine.notes}</p>
      </div>

      <p class="pairing-section-title">🍽️ Perfect Food Pairings</p>
      <div class="pairings-grid">
        ${wine.foods.map(f => `
          <div class="pairing-card">
            <div class="pairing-card-emoji">${f.emoji}</div>
            <div class="pairing-card-name">${f.name}</div>
            <div class="pairing-card-desc">${f.reason}</div>
          </div>
        `).join('')}
      </div>

      <p class="pairing-section-title">🚫 Foods to Avoid</p>
      <div class="avoid-grid" style="margin-bottom:24px;">
        ${wine.avoid.map(a => `<span class="avoid-tag">${a}</span>`).join('')}
      </div>

      <div class="serving-tips">
        <h4>🌡️ Serving Tips</h4>
        <ul>
          ${wine.serving.map(s => `<li>${s}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  showFoodResult(food) {
    this.resultsEl.innerHTML = `
      <div class="pairing-result-header">
        <div class="pairing-result-emoji">${food.emoji}</div>
        <div class="pairing-result-title">
          <h2>${food.name}</h2>
          <p><em>${food.category} dish</em></p>
        </div>
      </div>

      <div class="pairing-notes">
        <p>${food.tip}</p>
      </div>

      <p class="pairing-section-title">🍷 Recommended Wines</p>
      <div class="pairings-grid">
        ${food.wines.map(w => `
          <div class="pairing-card">
            <div class="pairing-card-emoji">${w.emoji}</div>
            <div class="pairing-card-name">${w.name}</div>
            <div class="pairing-card-desc">${w.reason}</div>
          </div>
        `).join('')}
      </div>

      <p class="pairing-section-title">🚫 Wines to Avoid</p>
      <div class="avoid-grid">
        ${food.avoid.map(a => `<span class="avoid-tag">${a}</span>`).join('')}
      </div>
    `;
  }
}
