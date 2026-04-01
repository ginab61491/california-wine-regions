// wine-regions.js — Interactive SVG world wine regions map (D3 + Natural Earth)

const REGIONS = [
  // ── FRANCE ──────────────────────────────────────────────
  {
    id: 'bordeaux', name: 'Bordeaux', country: 'France',
    lat: 44.8, lon: -0.6,
    tags: ['cabernet', 'upscale', 'food', 'city', 'top-20'],
    fun: 'The Bordeaux classification hasn\'t changed since 1855 — except for one promotion: Mouton Rothschild finally made it to First Growth in 1973.',
    famousFor: 'Left Bank Cabernet Sauvignon blends and Right Bank Merlot — the most traded fine wine region in the world.',
    nearestCity: { name: 'Bordeaux city', distance: '30 min from city center', logistics: 'Fly into Bordeaux-Mérignac (BOD); TGV from Paris takes 2hrs. Car rental recommended for châteaux visits.' },
    price: '$$$', priceReason: 'Top châteaux command global prestige premiums. However, Bordeaux AOC and second-label wines offer excellent value starting under $20.',
    examRegion: true,
    badges: ['top-20', 'exam', 'prestigious', 'foodie', 'city-base'],
    grapes: ['Cabernet Sauvignon', 'Merlot', 'Cabernet Franc', 'Sauvignon Blanc', 'Sémillon'],
    styles: ['Red Bordeaux Blends', 'Sauternes (botrytised sweet)', 'Dry white (Graves)'],
    climate: 'Maritime / Oceanic',
    soil: 'Gravel, clay, limestone',
    description: 'One of the world\'s most celebrated regions, split by the Gironde estuary. The Left Bank (Médoc, Graves) is built on Cabernet Sauvignon atop gravel; the Right Bank (St-Émilion, Pomerol) favors Merlot on clay and limestone. Sauternes produces legendary botrytis-affected sweet wines.',
    notable: ['Château Pétrus', 'Château Margaux', 'Château Latour', 'Château d\'Yquem', 'Pomerol'],
  },
  {
    id: 'burgundy', name: 'Burgundy', country: 'France',
    lat: 47.2, lon: 4.8,
    tags: ['pinot-noir', 'chardonnay', 'upscale', 'food', 'top-20'],
    fun: 'La Romanée vineyard in Burgundy covers just 0.85 acres — it\'s the smallest appellation in the world, producing fewer than 400 bottles a year.',
    famousFor: 'Pinot Noir and Chardonnay expressed through one of wine\'s most complex appellation hierarchies — Grand Cru to regional.',
    nearestCity: { name: 'Dijon', distance: '20 min from Dijon', logistics: 'TGV from Paris takes 1.5hrs to Dijon. Bike-friendly wine routes run the length of the Côte d\'Or.' },
    price: '$$$', priceReason: 'Tiny production, immense global demand, and centuries of prestige. Village-level wines remain accessible; Grand Cru bottles can cost thousands.',
    examRegion: true,
    badges: ['top-20', 'exam', 'prestigious', 'foodie', 'scenic'],
    grapes: ['Pinot Noir', 'Chardonnay', 'Gamay', 'Aligoté'],
    styles: ['Red Burgundy (Pinot Noir)', 'White Burgundy (Chardonnay)', 'Beaujolais (Gamay)'],
    climate: 'Continental',
    soil: 'Limestone, clay, marl',
    description: 'Burgundy is the spiritual home of Pinot Noir and Chardonnay. Its complex system of Grands Crus and Premiers Crus reflects centuries of observation about how terroir shapes wine. The Côte d\'Or is packed with some of the world\'s most expensive and sought-after wines.',
    notable: ['Domaine de la Romanée-Conti', 'Gevrey-Chambertin', 'Puligny-Montrachet', 'Chablis Grand Cru'],
  },
  {
    id: 'champagne', name: 'Champagne', country: 'France',
    lat: 49.0, lon: 4.0,
    tags: ['sparkling', 'upscale', 'city', 'food', 'top-20'],
    fun: 'About 312 million bottles of Champagne are produced every year — and around 80% is consumed within France itself.',
    famousFor: 'The only region that can legally produce Champagne — the world\'s most iconic sparkling wine, made via méthode champenoise.',
    nearestCity: { name: 'Reims', distance: '45 min from Reims', logistics: 'TGV from Paris takes just 45 min to Reims. The great houses are clustered in Reims and Épernay, both easy to explore on foot.' },
    price: '$$$', priceReason: 'Labor-intensive production, decades of aging for prestige cuvées, and the power of brand heritage drive prices. Non-vintage bottles start around $40.',
    examRegion: true,
    badges: ['top-20', 'exam', 'prestigious', 'city-base'],
    grapes: ['Chardonnay', 'Pinot Noir', 'Pinot Meunier'],
    styles: ['Non-vintage Champagne', 'Vintage Champagne', 'Blanc de Blancs', 'Rosé Champagne'],
    climate: 'Cool Continental',
    soil: 'Chalk, limestone',
    description: 'The only region that can legally call its wine Champagne. The cool climate and chalk soils create high-acid base wines ideal for the méthode champenoise. Blanc de Blancs (100% Chardonnay) is precise and mineral; Blanc de Noirs uses red grapes for weight.',
    notable: ['Krug', 'Dom Pérignon', 'Salon', 'Bollinger', 'Taittinger Comtes de Champagne'],
  },
  {
    id: 'rhone', name: 'Rhône Valley', country: 'France',
    lat: 44.8, lon: 4.8,
    tags: ['syrah', 'food', 'casual', 'top-20'],
    fun: 'Châteauneuf-du-Pape was the first French wine to receive its own AOC designation, in 1936 — and it allows 18 different grape varieties in the blend.',
    famousFor: 'Hermitage and Côte-Rôtie Syrah in the north, Châteauneuf-du-Pape Grenache blends in the south — two completely different wine worlds.',
    nearestCity: { name: 'Lyon', distance: '1hr from Lyon (north Rhône)', logistics: 'Fly into Lyon-Saint Exupéry (LYS). TGV connections excellent. Car recommended for vineyard access along the Rhône.' },
    price: '$$', priceReason: 'Wide range — everyday Côtes du Rhône under $15 to prestigious Hermitage. Most wines offer outstanding value for the quality.',
    examRegion: true,
    badges: ['top-20', 'exam', 'foodie', 'scenic'],
    grapes: ['Syrah', 'Grenache', 'Mourvèdre', 'Viognier', 'Marsanne', 'Roussanne'],
    styles: ['Northern Rhône Syrah', 'Southern Rhône blends (GSM)', 'Condrieu (Viognier)'],
    climate: 'Continental (North), Mediterranean (South)',
    soil: 'Granite (North), galets roulés, limestone (South)',
    description: 'The Rhône is two distinct wine worlds. The steep granite slopes of the North (Hermitage, Côte-Rôtie) produce profound single-varietal Syrah. The hot, windswept South (Châteauneuf-du-Pape) blends Grenache with Syrah and Mourvèdre for rich, spiced wines.',
    notable: ['Château Rayas', 'Guigal La Landonne', 'Hermitage', 'Condrieu', 'Gigondas'],
  },
  {
    id: 'alsace', name: 'Alsace', country: 'France',
    lat: 48.2, lon: 7.3,
    tags: ['riesling', 'offbeat', 'food'],
    fun: 'Alsace is the only French wine region that labels wines by grape variety rather than place name — a German tradition left over from centuries of border-shifting.',
    famousFor: 'Aromatic dry whites — Riesling, Gewürztraminer, Pinot Gris — from the rain-sheltered slopes of the Vosges mountains.',
    nearestCity: { name: 'Strasbourg', distance: '30 min from Strasbourg', logistics: 'Fly into Strasbourg (SXB) or Basel (BSL). The scenic Route des Vins runs the full length of the region — ideal for self-driving.' },
    price: '$$', priceReason: 'Excellent quality-to-price ratio. Grand Cru bottlings cost more but are modest compared to equivalent Burgundy whites.',
    examRegion: true,
    badges: ['exam', 'foodie', 'scenic'],
    grapes: ['Riesling', 'Gewürztraminer', 'Pinot Gris', 'Pinot Blanc', 'Muscat'],
    styles: ['Dry aromatic whites', 'Vendanges Tardives (late harvest)', 'Crémant d\'Alsace'],
    climate: 'Semi-Continental (rain shadow)',
    soil: 'Granite, sandstone, limestone, clay',
    description: 'Sheltered by the Vosges mountains, Alsace is one of France\'s driest regions, producing rich, aromatic whites that are often bone dry. Riesling here shows stony minerality; Gewürztraminer is opulent with rose and lychee.',
    notable: ['Trimbach Clos Sainte-Hune', 'Zind-Humbrecht', 'Hugel', 'Marcel Deiss'],
  },
  {
    id: 'loire', name: 'Loire Valley', country: 'France',
    lat: 47.4, lon: 0.5,
    tags: ['sauvignon-blanc', 'chenin-blanc', 'casual', 'offbeat', 'budget'],
    fun: 'The Loire Valley is France\'s longest river and its wine region stretches 1,000km — longer than any other wine region in the world.',
    famousFor: 'Sancerre and Pouilly-Fumé Sauvignon Blanc, and Chenin Blanc in every form — from bone dry to legendary Moelleux.',
    nearestCity: { name: 'Tours', distance: '20 min from Tours', logistics: 'TGV from Paris takes 1hr to Tours. Bike-friendly wine trail follows the river. Wine and châteaux tourism easily combined.' },
    price: '$', priceReason: 'Loire offers some of France\'s best value — elegant wines at a fraction of Burgundy prices. Muscadet is among the world\'s best-value whites.',
    examRegion: true,
    badges: ['exam', 'budget-friendly', 'scenic', 'city-base'],
    grapes: ['Sauvignon Blanc', 'Chenin Blanc', 'Cabernet Franc', 'Melon de Bourgogne'],
    styles: ['Sancerre & Pouilly-Fumé (Sauvignon Blanc)', 'Vouvray (Chenin Blanc)', 'Muscadet'],
    climate: 'Oceanic to Continental',
    soil: 'Flint (Sancerre), tuffeau limestone, schist',
    description: 'France\'s Garden of Kings stretches along the Loire river from the Atlantic to central France. Sancerre and Pouilly-Fumé define the crisp, mineral style of Sauvignon Blanc. Chenin Blanc in Vouvray and Savennières ranges from bone dry to legendary sweet Moelleux.',
    notable: ['Henri Bourgeois (Sancerre)', 'Didier Dagueneau (Pouilly-Fumé)', 'Domaine Huet (Vouvray)'],
  },

  // ── ITALY ────────────────────────────────────────────────
  {
    id: 'tuscany', name: 'Tuscany', country: 'Italy',
    lat: 43.5, lon: 11.0,
    tags: ['sangiovese', 'food', 'upscale', 'city', 'top-20'],
    fun: 'The "Super Tuscans" were born as rebels — producers who broke DOC rules in the 1970s and had to sell world-class wines as humble "table wine" on the label.',
    famousFor: 'Chianti Classico and Brunello di Montalcino — Sangiovese expressions that define Italian fine wine — and the rule-breaking Super Tuscans.',
    nearestCity: { name: 'Florence', distance: '1hr from Florence', logistics: 'Fly into Florence (FLR) or Pisa (PSA). Car recommended for the Chianti hills. Many agriturismos offer vineyard accommodation.' },
    price: '$$', priceReason: 'Range is wide — entry Chianti starts under $20, while Brunello and Super Tuscans reach hundreds. Excellent mid-range options throughout.',
    examRegion: true,
    badges: ['top-20', 'exam', 'prestigious', 'foodie', 'scenic', 'city-base'],
    grapes: ['Sangiovese', 'Cabernet Sauvignon', 'Merlot', 'Vernaccia'],
    styles: ['Chianti Classico', 'Brunello di Montalcino', 'Vino Nobile di Montepulciano', 'Super Tuscans'],
    climate: 'Mediterranean / Continental',
    soil: 'Galestro (schistous clay), alberese (clay-limestone)',
    description: 'Tuscany\'s soul grape is Sangiovese, expressing differently across its appellations. Chianti Classico offers sour cherry and earthy savory notes; Brunello di Montalcino produces Tuscany\'s most age-worthy reds. The "Super Tuscans" broke DOC rules in the 1970s by blending Bordeaux varieties.',
    notable: ['Sassicaia', 'Ornellaia', 'Biondi-Santi', 'Antinori Tignanello', 'Soldera'],
  },
  {
    id: 'piedmont', name: 'Piedmont', country: 'Italy',
    lat: 44.7, lon: 8.0,
    tags: ['nebbiolo', 'food', 'upscale', 'top-20'],
    fun: 'Barolo must be aged a minimum of 3 years before release (5 for Riserva). Some traditional producers hold bottles for a decade before selling — earning Barolo the nickname "The Wine of Kings."',
    famousFor: 'Barolo and Barbaresco — the King and Queen of Italian wine — made from Nebbiolo with extraordinary aging potential.',
    nearestCity: { name: 'Turin', distance: '45 min from Turin (Torino)', logistics: 'Fly into Turin (TRN) or Milan (MXP, 1.5hr drive). Car strongly recommended in the Langhe hills. Alba is an ideal base.' },
    price: '$$$', priceReason: 'Barolo requires years of aging before release. Top producers like Giacomo Conterno and Gaja command prestige prices. Barbera and Dolcetto offer the same terroir at far lower cost.',
    examRegion: true,
    badges: ['top-20', 'exam', 'prestigious', 'foodie'],
    grapes: ['Nebbiolo', 'Barbera', 'Dolcetto', 'Moscato', 'Arneis'],
    styles: ['Barolo', 'Barbaresco', 'Barbera d\'Asti', 'Moscato d\'Asti'],
    climate: 'Continental',
    soil: 'Calcareous marl, Helvetian (Barolo), Tortonian (Barbaresco)',
    description: 'Piedmont is Italy\'s Burgundy, with Nebbiolo playing the role of Pinot Noir — both demanding and majestic. Barolo and Barbaresco, the "King and Queen" of Italian wine, reward patience with profound complexity of rose, tar, and red fruit.',
    notable: ['Giacomo Conterno', 'Bruno Giacosa', 'Gaja', 'Vietti', 'Bartolo Mascarello'],
  },
  {
    id: 'veneto', name: 'Veneto', country: 'Italy',
    lat: 45.4, lon: 11.0,
    tags: ['amarone', 'prosecco', 'budget', 'city', 'food'],
    fun: 'Prosecco overtook Champagne as the world\'s best-selling sparkling wine in 2013 — and it hasn\'t looked back since.',
    famousFor: 'Amarone della Valpolicella — made from partially dried grapes — and Prosecco, Italy\'s beloved and best-selling sparkling wine.',
    nearestCity: { name: 'Venice', distance: '1hr from Venice', logistics: 'Fly into Venice Marco Polo (VCE). Car recommended for Valpolicella. Verona is an ideal base with its own attractions.' },
    price: '$', priceReason: 'Prosecco and entry Valpolicella are among Italy\'s best-value wines. Amarone commands more due to its labor-intensive production method.',
    examRegion: true,
    badges: ['exam', 'budget-friendly', 'foodie', 'city-base'],
    grapes: ['Corvina', 'Rondinella', 'Glera', 'Garganega', 'Pinot Grigio'],
    styles: ['Amarone', 'Valpolicella', 'Prosecco', 'Soave'],
    climate: 'Continental / Lake-influenced',
    soil: 'Volcanic, basalt, alluvial',
    description: 'The Veneto is Italy\'s most productive wine region. Amarone della Valpolicella — made from partially dried (appassimento) Corvina grapes — is one of Italy\'s greatest wines: rich, powerful, and complex. Prosecco from Conegliano-Valdobbiadene is Italy\'s beloved sparkling wine.',
    notable: ['Dal Forno Romano (Amarone)', 'Quintarelli', 'Masi', 'Allegrini'],
  },
  {
    id: 'etna', name: 'Etna', country: 'Italy',
    lat: 37.73, lon: 15.0,
    emerging: true,
    tags: ['offbeat', 'emerging', 'food', 'upscale'],
    fun: 'Some Etna vines grow on an active volcano — and pre-phylloxera vines survive here because the volcanic soil naturally prevented the root louse from spreading.',
    famousFor: 'Nerello Mascalese from ancient volcanic vines — elegant, terroir-driven reds often compared to Burgundy in character.',
    nearestCity: { name: 'Catania', distance: '40 min from Catania', logistics: 'Fly into Catania (CTA). Car essential. Most wineries are on the volcano\'s northern slopes around Randazzo and Castiglione di Sicilia.' },
    price: '$$', priceReason: 'Steep volcanic terrain requires hand-harvesting. Still excellent quality-to-price compared to equivalent prestige in Burgundy or Barolo.',
    examRegion: false,
    badges: ['emerging', 'scenic', 'foodie'],
    grapes: ['Nerello Mascalese', 'Nerello Cappuccio', 'Carricante', 'Catarratto'],
    styles: ['Etna Rosso (Nerello Mascalese)', 'Etna Bianco (Carricante)', 'Volcanic mineral whites'],
    climate: 'Mediterranean / Altitude-cooled',
    soil: 'Volcanic basalt, volcanic ash',
    description: 'Etna is Sicily\'s most exciting wine region — a live volcano where ancient vines cling to steep basalt terraces at up to 1,000m altitude. Nerello Mascalese produces hauntingly elegant, Burgundy-like reds with volcanic minerality and silky tannins.',
    notable: ['Benanti', 'Cornelissen', 'Terre Nere', 'Passopisciaro', 'Gulfi'],
  },

  // ── SPAIN ────────────────────────────────────────────────
  {
    id: 'rioja', name: 'Rioja', country: 'Spain',
    lat: 42.5, lon: -2.5,
    tags: ['tempranillo', 'food', 'budget', 'city', 'top-20'],
    fun: 'Rioja Gran Reserva wines are held back for a minimum of 5 years before release — some traditional estates sell wines they\'ve been aging for over a decade.',
    famousFor: 'Elegant, oak-aged Tempranillo — Spain\'s most iconic red wine with a centuries-long tradition of aging in American oak.',
    nearestCity: { name: 'Logroño', distance: '15 min from Logroño', logistics: 'Fly into Bilbao (BIO, 1.5hr drive) or Madrid (MAD, 3hr). The wine city of Haro has clustered historic bodegas all within walking distance.' },
    price: '$', priceReason: 'Rioja offers extraordinary quality for the price. Gran Reservas often cost less than much simpler Bordeaux or Burgundy wines.',
    examRegion: true,
    badges: ['top-20', 'exam', 'budget-friendly', 'foodie'],
    grapes: ['Tempranillo', 'Garnacha', 'Graciano', 'Mazuelo', 'Viura'],
    styles: ['Joven (unoaked)', 'Crianza', 'Reserva', 'Gran Reserva'],
    climate: 'Mediterranean / Continental',
    soil: 'Clay-limestone, alluvial, iron-rich',
    description: 'Spain\'s most famous wine region produces elegant, age-worthy reds based on Tempranillo. The classification system centers on oak aging: Crianza gets 1 year in oak, Gran Reserva gets 5+ years. Modern producers blend classic elegance with new-wave freshness.',
    notable: ['La Rioja Alta', 'Muga', 'Marqués de Riscal', 'CVNE', 'Artadi'],
  },
  {
    id: 'ribera', name: 'Ribera del Duero', country: 'Spain',
    lat: 41.6, lon: -3.7,
    tags: ['tempranillo', 'upscale', 'food'],
    fun: 'At 800–1,000m altitude, Ribera del Duero experiences 30°C temperature swings between day and night — giving wines both the power of a hot climate and the freshness of a cool one.',
    famousFor: 'Bold, high-altitude Tempranillo-based reds — including Spain\'s most legendary wine, Vega Sicilia Único.',
    nearestCity: { name: 'Valladolid', distance: '45 min from Valladolid', logistics: 'Fly into Madrid (MAD, 2hr drive) or Valladolid (VLL). Car required across the plateau. Peñafiel castle is a regional highlight.' },
    price: '$$', priceReason: 'Quality Ribera wines offer strong value versus Bordeaux. Top names like Pingus and Vega Sicilia are prestige-priced due to scarcity.',
    examRegion: true,
    badges: ['exam', 'prestigious', 'foodie'],
    grapes: ['Tempranillo (Tinto Fino)', 'Cabernet Sauvignon', 'Merlot', 'Albillo'],
    styles: ['Powerful, age-worthy reds', 'Crianza', 'Reserva', 'Gran Reserva'],
    climate: 'Extreme Continental (high altitude)',
    soil: 'Limestone, clay, chalk',
    description: 'Ribera del Duero sits on Spain\'s high meseta plateau and produces bold, structured Tempranillo-based reds that rival the world\'s finest. The region rose from obscurity to international fame in just a few decades, driven by Vega Sicilia\'s legendary reputation.',
    notable: ['Vega Sicilia Único', 'Pingus', 'Bodegas Aalto', 'Pesquera', 'Emilio Moro'],
  },
  {
    id: 'priorat', name: 'Priorat', country: 'Spain',
    lat: 41.1, lon: 0.8,
    tags: ['offbeat', 'upscale'],
    fun: 'Priorat was so depopulated by the 1980s that only a handful of families still farmed its ancient vines. A group of five friends secretly made wine together in 1989 and sparked a global sensation.',
    famousFor: 'Deeply concentrated Grenache and Carignan from ancient black-slate (llicorella) terraces — Spain\'s most dramatic and prestigious wine.',
    nearestCity: { name: 'Barcelona', distance: '1.5hr from Barcelona', logistics: 'Fly into Barcelona (BCN). Car required through mountain passes. Small region easily covered in a weekend from the city.' },
    price: '$$$', priceReason: 'Extreme terraced viticulture, tiny production, and world-class reputation. One of only two DOCa regions in Spain alongside Rioja.',
    examRegion: true,
    badges: ['exam', 'prestigious', 'scenic'],
    grapes: ['Grenache', 'Carignan', 'Cabernet Sauvignon', 'Syrah'],
    styles: ['Powerful concentrated reds', 'Old-vine Grenache', 'Carignan blends'],
    climate: 'Mediterranean / Continental',
    soil: 'Llicorella (dark slate and quartz)',
    description: 'Priorat\'s dramatic terraced vineyards sit on unique llicorella (black slate) soils. Old-vine Grenache and Carignan here produce some of Spain\'s most concentrated and mineral wines. Only 2 Spanish regions hold the DOCa classification: Rioja and Priorat.',
    notable: ['Álvaro Palacios L\'Ermita', 'Clos Mogador', 'Clos de l\'Obac', 'Mas Doix'],
  },
  {
    id: 'sherry', name: 'Jerez (Sherry)', country: 'Spain',
    lat: 36.7, lon: -6.1,
    tags: ['offbeat', 'budget', 'food', 'casual'],
    fun: 'A 30-year-old VORS Amontillado Sherry — one of the world\'s most complex wines — often costs less than a young Bordeaux. It\'s the most undervalued wine on Earth.',
    famousFor: 'Fino, Manzanilla, Amontillado, and Pedro Ximénez — a uniquely complex range of fortified wines made under flor yeast via the solera system.',
    nearestCity: { name: 'Seville', distance: '1hr from Seville', logistics: 'Fly into Seville (SVQ) or Jerez (XRY, small airport). The Sherry Triangle — Jerez, Sanlúcar, El Puerto — is compact and easy to navigate.' },
    price: '$', priceReason: 'Dramatically undervalued — world-class complexity at $10–$30. VORS aged Sherries remain the most extraordinary bargains in the wine world.',
    examRegion: true,
    badges: ['exam', 'budget-friendly', 'foodie'],
    grapes: ['Palomino Fino', 'Pedro Ximénez', 'Moscatel'],
    styles: ['Fino', 'Manzanilla', 'Amontillado', 'Oloroso', 'Pedro Ximénez'],
    climate: 'Mediterranean / Semi-Arid',
    soil: 'Albariza (chalky white limestone)',
    description: 'Sherry is among the world\'s most complex and underappreciated wines. Made using the solera system of fractional blending, Fino and Manzanilla are bone-dry and protected by flor (yeast); Pedro Ximénez is a luscious raisin-sweet nectar.',
    notable: ['González Byass Tío Pepe', 'Valdespino Inocente', 'Equipo Navazos', 'Lustau'],
  },

  // ── GERMANY ──────────────────────────────────────────────
  {
    id: 'mosel', name: 'Mosel', country: 'Germany',
    lat: 50.0, lon: 7.0,
    tags: ['riesling', 'offbeat', 'upscale', 'top-20'],
    fun: 'The steep slate slopes of the Mosel must be farmed almost entirely by hand — mechanization is impossible on gradients up to 70%. Every grape is hand-picked.',
    famousFor: 'Ethereal, low-alcohol Rieslings with electric acidity and hauntingly mineral slate character — wines that age for decades.',
    nearestCity: { name: 'Trier', distance: '20 min from Trier', logistics: 'Fly into Frankfurt (FRA, 2hr drive) or Luxembourg (LUX, 1hr). The scenic Mosel River valley is ideal for road or river cruise exploration.' },
    price: '$$', priceReason: 'Hand-harvesting steep slate slopes is expensive. Top single-vineyard Auslesen command auction prices; Kabinett and village wines are surprisingly affordable.',
    examRegion: true,
    badges: ['top-20', 'exam', 'scenic', 'prestigious'],
    grapes: ['Riesling', 'Pinot Blanc', 'Pinot Gris', 'Elbling'],
    styles: ['Kabinett', 'Spätlese', 'Auslese', 'Trockenbeerenauslese', 'Eiswein'],
    climate: 'Cool Continental',
    soil: 'Blue and red Devon slate',
    description: 'The steep slate slopes of the Mosel produce some of the world\'s most ethereal wines. Mosel Riesling is distinguished by its electric acidity, low alcohol, and hauntingly floral slate minerality. Even Kabinett can age for decades.',
    notable: ['Egon Müller (Scharzhofberger)', 'Joh. Jos. Prüm', 'Dr. Loosen', 'Keller'],
  },
  {
    id: 'rheingau', name: 'Rheingau', country: 'Germany',
    lat: 50.0, lon: 8.2,
    tags: ['riesling', 'offbeat'],
    fun: 'Schloss Johannisberg is said to be the oldest dedicated Riesling estate in the world, with vineyard records tracing back to 817 AD — when Charlemagne reportedly ordered the planting.',
    famousFor: 'Fuller-bodied, south-facing Rieslings from the Rhine\'s northern bank — historically Germany\'s most prestigious white wine region.',
    nearestCity: { name: 'Frankfurt', distance: '45 min from Frankfurt', logistics: 'Frankfurt (FRA) is Germany\'s main international hub. Rhine ferry, train, and road all provide easy access to the region.' },
    price: '$$', priceReason: 'Comparable to Mosel in pricing. Quality estate wines are reasonably priced versus similar French whites.',
    examRegion: true,
    badges: ['exam', 'scenic', 'city-base'],
    grapes: ['Riesling', 'Pinot Noir (Spätburgunder)'],
    styles: ['Dry Riesling (Trocken)', 'Classic Spätlese', 'Sekt (sparkling)'],
    climate: 'Mild Continental',
    soil: 'Quartzite, slate, loess',
    description: 'South-facing vineyards on the Rhine\'s northern bank produce fuller, richer Rieslings than the Mosel. The Rheingau is historically Germany\'s most prestigious region, associated with Schloss (estate) wines for centuries. Assmannshausen produces Germany\'s best Pinot Noir.',
    notable: ['Robert Weil', 'Schloss Johannisberg', 'Georg Breuer', 'Weingut Künstler'],
  },

  // ── AUSTRIA ──────────────────────────────────────────────
  {
    id: 'wachau', name: 'Wachau', country: 'Austria',
    lat: 48.38, lon: 15.42,
    emerging: true,
    tags: ['riesling', 'offbeat', 'upscale', 'food'],
    fun: 'The Wachau has its own classification unique in the wine world — Steinfeder, Federspiel, and Smaragd (named after local birds and a lizard) — instead of any other country\'s system.',
    famousFor: 'Grüner Veltliner and Riesling of unmatched precision from a UNESCO World Heritage Danube gorge.',
    nearestCity: { name: 'Vienna', distance: '1.5hr from Vienna', logistics: 'Fly into Vienna (VIE). Train to Krems then local transport. A scenic river boat from Vienna is a memorable alternative.' },
    price: '$$', priceReason: 'Smaragd-level wines rival top Mosel and Alsace Riesling at similar or lower prices. Exceptional value for the quality on offer.',
    examRegion: true,
    badges: ['exam', 'scenic', 'foodie'],
    grapes: ['Grüner Veltliner', 'Riesling'],
    styles: ['Smaragd (powerful dry white)', 'Federspiel', 'Steinfeder'],
    climate: 'Cool Continental',
    soil: 'Gneiss, granite, loess terraces',
    description: 'The Wachau is a UNESCO World Heritage gorge of the Danube river, producing two of the world\'s great white wine grapes. Grüner Veltliner here delivers white pepper, citrus, and stone fruit with minerality; Riesling rivals the Mosel in precision and longevity.',
    notable: ['F.X. Pichler', 'Rudi Pichler', 'Knoll', 'Alzinger', 'Hirtzberger'],
  },

  // ── PORTUGAL ─────────────────────────────────────────────
  {
    id: 'douro', name: 'Douro Valley', country: 'Portugal',
    lat: 41.1, lon: -7.5,
    tags: ['port', 'offbeat', 'budget', 'food', 'december', 'top-20'],
    fun: 'The Douro was the world\'s first officially demarcated wine region, mapped in 1756 — a full century before Bordeaux\'s 1855 classification.',
    famousFor: 'Vintage Port — the world\'s most celebrated fortified wine — and increasingly acclaimed dry table wines from dramatic schist terraces.',
    nearestCity: { name: 'Porto', distance: '1hr from Porto', logistics: 'Fly into Porto (OPO). The scenic Douro train follows the river. Quintas (wine estates) offer riverside accommodation throughout the valley.' },
    price: '$', priceReason: 'Douro table wines and entry Port are excellent value. Vintage Port from top shippers commands more but ages spectacularly for decades.',
    examRegion: true,
    badges: ['top-20', 'exam', 'scenic', 'budget-friendly', 'foodie'],
    grapes: ['Touriga Nacional', 'Touriga Franca', 'Tinta Roriz', 'Tinta Barroca'],
    styles: ['Port (Vintage, Tawny, Ruby)', 'Douro table wines (DOC Douro)'],
    climate: 'Extreme Continental',
    soil: 'Schist (xisto)',
    description: 'The Douro cuts through Portugal\'s dramatic interior, carved into terraced schist vineyards. It is the home of Port, the world\'s most famous fortified wine. Dry table wines from the same grapes have become world-class in their own right.',
    notable: ['Quinta do Crasto', 'Niepoort', 'Ramos Pinto', 'Churchill\'s', 'Graham\'s Vintage Port'],
  },
  {
    id: 'alentejo', name: 'Alentejo', country: 'Portugal',
    lat: 38.55, lon: -7.9,
    emerging: true,
    tags: ['offbeat', 'emerging', 'budget', 'food'],
    fun: 'Alentejo produces roughly half of the world\'s cork — the very same trees protecting the stoppers of the world\'s finest wines grow in these vineyards.',
    famousFor: 'Warm, generous Portuguese reds of remarkable value from a sun-baked landscape of cork oaks and olive trees.',
    nearestCity: { name: 'Évora', distance: '30 min from Évora', logistics: 'Fly into Lisbon (LIS, 1.5hr drive). Car recommended across the rolling plains. Many quintas offer agrotourism stays.' },
    price: '$', priceReason: 'Alentejo delivers some of Europe\'s best-value wines — complex, food-friendly reds well under $20.',
    examRegion: false,
    badges: ['emerging', 'budget-friendly', 'foodie'],
    grapes: ['Aragonez', 'Alicante Bouschet', 'Trincadeira', 'Antão Vaz', 'Arinto'],
    styles: ['Warm, rich reds', 'Aromatic whites', 'Rosé'],
    climate: 'Hot Mediterranean / Continental',
    soil: 'Schist, granite, clay',
    description: 'Alentejo is Portugal\'s vast, sun-baked interior — a rolling landscape of cork oaks, olive trees, and ancient vineyards. It produces generous, fruit-forward reds at remarkable value, and has become one of Portugal\'s most exciting emerging regions.',
    notable: ['Esporão Reserva', 'Herdade do Mouchão', 'João Portugal Ramos', 'Cartuxa'],
  },

  // ── USA ──────────────────────────────────────────────────
  {
    id: 'napa', name: 'Napa Valley', country: 'USA',
    lat: 38.5, lon: -122.4,
    tags: ['cabernet', 'upscale', 'city', 'food', 'top-20'],
    fun: 'At the 1976 "Judgment of Paris" blind tasting, Napa wines beat top Bordeaux and Burgundy — shocking the wine world and making international headlines overnight.',
    famousFor: 'Cabernet Sauvignon that changed the world in 1976 — still producing America\'s most celebrated, age-worthy red wines.',
    nearestCity: { name: 'San Francisco', distance: '1hr from San Francisco', logistics: 'Fly into SFO or OAK. Car recommended. Many tour operators run day trips from SF. Napa town is an excellent hotel base.' },
    price: '$$$', priceReason: 'Prestige, global demand, and cult winery culture drive prices. Cult bottles sell for thousands; excellent Napa Cab starts around $50–$100.',
    examRegion: true,
    badges: ['top-20', 'exam', 'prestigious', 'foodie', 'city-base'],
    grapes: ['Cabernet Sauvignon', 'Merlot', 'Chardonnay', 'Sauvignon Blanc', 'Zinfandel'],
    styles: ['Napa Cabernet Sauvignon', 'Chardonnay', 'Bordeaux-style blends'],
    climate: 'Mediterranean (Valley fog)',
    soil: 'Alluvial fans, volcanic, clay',
    description: 'Napa Valley catapulted California to global wine fame at the 1976 Paris tasting. Its valley floor and volcanic mountainside AVAs produce plush, full-bodied Cabernet Sauvignon with ripe cassis, cedar, and tobacco. Sub-appellations like Oakville, Rutherford, and Stag\'s Leap each have distinct personalities.',
    notable: ['Screaming Eagle', 'Harlan Estate', 'Opus One', 'Caymus', 'Ridge Monte Bello'],
  },
  {
    id: 'sonoma', name: 'Sonoma County', country: 'USA',
    lat: 38.5, lon: -122.8,
    tags: ['pinot-noir', 'chardonnay', 'casual', 'food', 'city'],
    fun: 'California\'s wine story really began in Sonoma — the first commercial winery in California opened in Sonoma Town Square in 1857, before Napa was even planted.',
    famousFor: 'Diverse, artisan-driven wines — from Russian River Pinot Noir to Dry Creek Zinfandel — at better value than Napa next door.',
    nearestCity: { name: 'San Francisco', distance: '1.5hr from San Francisco', logistics: 'Fly into SFO or STS (Sonoma County Airport). Car recommended. Healdsburg is an outstanding base town for the region.' },
    price: '$$', priceReason: 'More diverse and generally better-valued than Napa. Top Russian River Pinots approach Napa prices; most Sonoma wines offer strong quality-to-price.',
    examRegion: true,
    badges: ['exam', 'foodie', 'city-base', 'scenic'],
    grapes: ['Pinot Noir', 'Chardonnay', 'Zinfandel', 'Cabernet Sauvignon', 'Syrah'],
    styles: ['Russian River Pinot Noir & Chardonnay', 'Dry Creek Zinfandel', 'Sonoma Coast Pinot'],
    climate: 'Mediterranean / Oceanic',
    soil: 'Diverse: Goldridge sandy loam, clay, volcanic',
    description: 'Sonoma is Napa\'s cooler, more diverse neighbor. The Russian River Valley\'s marine fog produces exceptional Pinot Noir and Chardonnay. Dry Creek Valley is Zinfandel country. Sonoma Coast AVA pushes to the Pacific cliffs for California\'s most elegant cool-climate wines.',
    notable: ['Williams Selyem', 'Kosta Browne', 'Rochioli', 'Ridge (Lytton Springs)', 'Littorai'],
  },
  {
    id: 'willamette', name: 'Willamette Valley', country: 'USA',
    lat: 45.2, lon: -123.0,
    tags: ['pinot-noir', 'offbeat', 'casual'],
    fun: 'Burgundy producer Robert Drouhin was so convinced by Willamette\'s potential that he secretly bought land there in 1987 — before most Americans had even heard of the region.',
    famousFor: 'Oregon Pinot Noir — earthy, elegant, and Burgundy-like — on volcanic Jory soils with outstanding value versus French equivalents.',
    nearestCity: { name: 'Portland', distance: '45 min from Portland', logistics: 'Fly into Portland (PDX). Car recommended. Many Dundee Hills wineries are within 45 minutes of the city — easy for a day trip.' },
    price: '$$', priceReason: 'Oregon Pinot Noir competes with entry Burgundy at lower prices. Top producers are approaching Burgundy village-level pricing.',
    examRegion: true,
    badges: ['exam', 'scenic', 'foodie'],
    grapes: ['Pinot Noir', 'Pinot Gris', 'Chardonnay', 'Pinot Blanc'],
    styles: ['Oregon Pinot Noir', 'Pinot Gris', 'Chardonnay'],
    climate: 'Oceanic / Cool Maritime',
    soil: 'Jory volcanic, Willakenzie marine sedimentary, Laurelwood loess',
    description: 'Oregon\'s Willamette Valley is America\'s answer to Burgundy. The cool climate and volcanic soils produce Pinot Noir with elegance, red fruit, and earthy complexity that can rival great Burgundy. Sub-AVAs include Dundee Hills, Eola-Amity Hills, and Chehalem Mountains.',
    notable: ['Eyrie Vineyards', 'Domaine Drouhin Oregon', 'Adelsheim', 'Evening Land', 'Ponzi'],
  },
  {
    id: 'finger-lakes', name: 'Finger Lakes', country: 'USA',
    lat: 42.7, lon: -76.9,
    emerging: true,
    tags: ['riesling', 'pinot-noir', 'emerging', 'budget', 'offbeat', 'casual'],
    fun: 'Finger Lakes Rieslings have regularly beaten German Rieslings in blind tastings — yet a top bottle costs a fraction of the price. It\'s one of the wine world\'s best-kept secrets.',
    famousFor: 'Riesling that rivals Germany and Alsace in quality — America\'s most exciting white wine region, still flying under the radar.',
    nearestCity: { name: 'Rochester', distance: '1hr from Rochester', logistics: 'Fly into Rochester (ROC) or Syracuse (SYR). Car essential. Seneca and Cayuga lakes are the main wine routes — both scenic and uncrowded.' },
    price: '$', priceReason: 'One of wine\'s great bargains — German-quality Rieslings at a fraction of the price. The region\'s low profile keeps prices accessible.',
    examRegion: false,
    badges: ['emerging', 'budget-friendly'],
    grapes: ['Riesling', 'Pinot Noir', 'Cabernet Franc', 'Gewürztraminer', 'Chardonnay'],
    styles: ['Dry Riesling', 'Off-dry Riesling', 'Cool-climate Pinot Noir', 'Ice Wine'],
    climate: 'Cool Continental (lake-moderated)',
    soil: 'Shale, silt, limestone',
    description: 'The Finger Lakes of upstate New York produce some of America\'s most exciting Rieslings, shaped by deep glacier-carved lakes that moderate the harsh continental climate. The region draws comparisons to Alsace and Mosel — serious minerality at accessible prices.',
    notable: ['Dr. Konstantin Frank', 'Hermann J. Wiemer', 'Red Newt Cellars', 'Ravines Wine Cellars'],
  },
  {
    id: 'paso', name: 'Paso Robles', country: 'USA',
    lat: 35.63, lon: -120.69,
    emerging: true,
    tags: ['syrah', 'casual', 'budget', 'offbeat'],
    fun: 'Paso Robles was a stagecoach stop on El Camino Real in the 1700s. Its wine scene only exploded in the 2000s — it\'s now one of California\'s fastest-growing wine regions.',
    famousFor: 'Bold California Rhône varieties — Syrah, Grenache, Mourvèdre — with a laid-back, direct-to-consumer winery culture.',
    nearestCity: { name: 'San Luis Obispo', distance: '30 min from San Luis Obispo', logistics: 'Fly into SBP (San Luis Obispo) or LAX (3.5hr drive). Most wineries on the west side off Highway 46.' },
    price: '$', priceReason: 'Paso offers California quality at accessible prices. GSM blends and Zinfandels in the $20–$40 range regularly outperform wines costing twice as much elsewhere.',
    examRegion: false,
    badges: ['emerging', 'casual', 'budget-friendly'],
    grapes: ['Zinfandel', 'Cabernet Sauvignon', 'Grenache', 'Syrah', 'Viognier'],
    styles: ['Rhône blends', 'Zinfandel', 'Cabernet Sauvignon', 'GSM blends'],
    climate: 'Continental Mediterranean',
    soil: 'Calcareous shale, sandy loam',
    description: 'Paso Robles is California\'s wild frontier wine country — hot days and cool nights shape bold, fruit-forward reds. Its Rhône-variety wines (Syrah, Grenache, Mourvèdre) are some of California\'s most exciting. The laid-back winery scene and direct-to-consumer culture make it a wine lover\'s playground.',
    notable: ['Saxum Vineyards', 'Justin Winery', 'Daou Vineyards', 'Tablas Creek', 'L\'Aventure'],
  },

  // ── CANADA ───────────────────────────────────────────────
  {
    id: 'okanagan', name: 'Okanagan Valley', country: 'Canada',
    lat: 49.7, lon: -119.4,
    emerging: true,
    tags: ['riesling', 'offbeat', 'emerging', 'casual', 'december'],
    fun: 'The Okanagan is Canada\'s only true desert wine region — summer temperatures can rival Napa, while winters drop cold enough to make world-class ice wine from frozen grapes.',
    famousFor: 'Canada\'s wine oasis — a surprising desert valley producing world-class Riesling, Pinot Gris, and iconic ice wine.',
    nearestCity: { name: 'Kelowna', distance: '20 min from Kelowna', logistics: 'Fly into Kelowna (YLW). Car recommended. Most wineries clustered along Lake Okanagan south of Kelowna. Scenic lake-and-vineyard drives throughout.' },
    price: '$$', priceReason: 'Canadian production costs are higher due to climate and labor. Prices fair for quality, with ice wine a specialty worth seeking out.',
    examRegion: false,
    badges: ['emerging', 'scenic'],
    grapes: ['Pinot Gris', 'Chardonnay', 'Riesling', 'Merlot', 'Cabernet Franc', 'Syrah'],
    styles: ['Riesling', 'Pinot Gris', 'Bordeaux blends', 'Ice Wine'],
    climate: 'Semi-arid desert / Cool nights',
    soil: 'Glacial till, sandy loam, alluvial',
    description: 'British Columbia\'s Okanagan Valley is a surprising desert oasis of world-class wine, surrounded by mountains and glacial lakes. The extreme temperature variation between day and night preserves aromatic intensity, producing elegant Riesling, Pinot Gris, and surprisingly structured reds.',
    notable: ['Mission Hill', 'Quails\' Gate', 'Osoyoos Larose', 'Painted Rock', 'Blue Mountain'],
  },

  // ── MEXICO ───────────────────────────────────────────────
  {
    id: 'mexico', name: 'Valle de Guadalupe', country: 'Mexico',
    lat: 32.08, lon: -116.6,
    emerging: true,
    tags: ['offbeat', 'emerging', 'food', 'upscale', 'casual', 'december'],
    fun: 'Valle de Guadalupe is home to "La Ruta del Vino" — Mexico\'s answer to Napa Valley, where world-class chef-driven restaurants sit directly in the vineyards. Food and wine tourism here is exploding.',
    famousFor: 'Mexico\'s Baja California wine scene — bold experimental wines paired with world-class open-air restaurants right in the vineyards.',
    nearestCity: { name: 'San Diego', distance: '90 min from San Diego', logistics: 'Drive from San Diego via Tijuana border crossing. Toll road Hwy 1D to Ensenada, then valley. US passport required. Most visits are day trips or overnight stays.' },
    price: '$', priceReason: 'Excellent value — bold wines at $15–$40 served alongside extraordinary food. Quality is surging without prestige pricing catching up yet.',
    examRegion: false,
    badges: ['emerging', 'foodie', 'casual', 'budget-friendly'],
    grapes: ['Nebbiolo', 'Tempranillo', 'Cabernet Sauvignon', 'Zinfandel', 'Chardonnay', 'Sauvignon Blanc'],
    styles: ['Baja Mediterranean blends', 'Nebbiolo', 'Robust reds', 'Aromatic whites'],
    climate: 'Mediterranean semi-arid',
    soil: 'Granite, sandy loam',
    description: 'Just 90 minutes south of San Diego, Valle de Guadalupe in Baja California is Mexico\'s most exciting wine region — a place where tradition meets creativity, world-class chefs cook alongside vines, and the winemaking is unapologetically bold and experimental.',
    notable: ['Adobe Guadalupe', 'Casa de Piedra', 'Monte Xanic', 'Vena Cava', 'Bodegas Henri Lurton'],
  },

  // ── ARGENTINA ────────────────────────────────────────────
  {
    id: 'mendoza', name: 'Mendoza', country: 'Argentina',
    lat: -32.9, lon: -68.8,
    tags: ['malbec', 'upscale', 'food', 'budget', 'december', 'top-20'],
    fun: 'Mendoza\'s vineyards sit at 600–1,400m altitude. At that elevation, UV intensity is so extreme it turns grape skins thick and inky — giving Malbec its spectacular deep color and concentration.',
    famousFor: 'Malbec at altitude — the grape that transformed Argentina\'s wine identity and earned global recognition.',
    nearestCity: { name: 'Mendoza city', distance: '30 min from Mendoza city', logistics: 'Fly into El Plumerillo (MDZ). Car recommended. Most wineries in Luján de Cuyo and Maipú are accessible from the city.' },
    price: '$', priceReason: 'Argentina\'s currency dynamics make top-quality Malbec extraordinarily affordable. Uco Valley high-altitude wines are the new prestige tier, still at accessible prices.',
    examRegion: true,
    badges: ['top-20', 'exam', 'budget-friendly', 'scenic'],
    grapes: ['Malbec', 'Cabernet Sauvignon', 'Torrontés', 'Bonarda', 'Chardonnay'],
    styles: ['High-altitude Malbec', 'Luján de Cuyo Malbec', 'Sparkling Torrontés'],
    climate: 'High-altitude Semi-Arid',
    soil: 'Sandy-clay, alluvial, calcareous',
    description: 'Mendoza sits in the Andes rain shadow at 600–1,400m elevation. The altitude gives intense UV, cool nights, and long growing seasons — perfect for Malbec. The high-altitude Uco Valley (Tupungato) produces increasingly acclaimed, elegant Malbec.',
    notable: ['Cheval des Andes', 'Catena Zapata Adrianna', 'Achaval Ferrer', 'Zuccardi'],
  },

  // ── CHILE ────────────────────────────────────────────────
  {
    id: 'casablanca', name: 'Central Valley', country: 'Chile',
    lat: -33.8, lon: -70.9,
    tags: ['carmenere', 'budget', 'food', 'december'],
    fun: 'Carménère was thought to be extinct after phylloxera wiped it out of Bordeaux in the 1860s. It was "rediscovered" growing in Chile in 1994 — misidentified as Merlot for over 130 years.',
    famousFor: 'Carménère — a Bordeaux variety extinct in France, rediscovered growing in Chile — and Maipo Cabernet Sauvignon.',
    nearestCity: { name: 'Santiago', distance: '30 min from Santiago', logistics: 'Fly into Santiago (SCL). Maipo Valley wineries a short drive south. Casablanca Valley 1hr west along the coast road.' },
    price: '$', priceReason: 'Chile provides some of the world\'s best wine values — consistent quality at $10–$25 across most varieties.',
    examRegion: true,
    badges: ['exam', 'budget-friendly', 'city-base'],
    grapes: ['Carménère', 'Cabernet Sauvignon', 'Sauvignon Blanc', 'Chardonnay', 'Syrah'],
    styles: ['Maipo Cabernet Sauvignon', 'Carménère', 'Casablanca Sauvignon Blanc'],
    climate: 'Mediterranean / Pacific-cooled valleys',
    soil: 'Alluvial, clay, granite',
    description: 'Chile\'s wine heartland stretches down the Central Valley from Santiago. Maipo Valley is famed for Cabernet Sauvignon. The coastal Casablanca and San Antonio valleys are cooled by Pacific fog, ideal for aromatic whites. Chile is also the guardian of Carménère, lost from Bordeaux after phylloxera.',
    notable: ['Almaviva', 'Seña', 'Concha y Toro Don Melchor', 'Casa Marin', 'Lapostolle'],
  },

  // ── AUSTRALIA ────────────────────────────────────────────
  {
    id: 'barossa', name: 'Barossa Valley', country: 'Australia',
    lat: -34.5, lon: 138.9,
    tags: ['shiraz', 'upscale', 'casual', 'december', 'top-20'],
    fun: 'Some Barossa Shiraz vines were planted in the 1840s — making them among the oldest continuously producing vines in the world. Phylloxera never reached the Barossa.',
    famousFor: 'Some of the world\'s oldest Shiraz vines — concentrated, full-bodied wines with extraordinary depth and history.',
    nearestCity: { name: 'Adelaide', distance: '1hr from Adelaide', logistics: 'Fly into Adelaide (ADL). Car recommended. Tanunda and Nuriootpa are the main towns with winery clusters. Easy day trip from the city.' },
    price: '$$', priceReason: 'Entry Barossa Shiraz is excellent value. Top old-vine bottlings like Penfolds Grange and Henschke Hill of Grace command premiums due to vineyard age and prestige.',
    examRegion: true,
    badges: ['top-20', 'exam', 'prestigious', 'scenic'],
    grapes: ['Shiraz', 'Grenache', 'Mourvèdre', 'Cabernet Sauvignon', 'Riesling', 'Semillon'],
    styles: ['Barossa Shiraz', 'GSM Blends', 'Eden Valley Riesling'],
    climate: 'Hot, dry Mediterranean',
    soil: 'Brown loam over red clay, sandy loam',
    description: 'The Barossa Valley is Australia\'s most famous wine region, home to some of the world\'s oldest Shiraz vines. Barossa Shiraz is opulent, full-bodied, and rich with dark fruit, chocolate, and pepper. The adjacent Eden Valley (higher elevation) produces mineral Riesling.',
    notable: ['Penfolds Grange', 'Henschke Hill of Grace', 'Torbreck RunRig', 'Rockford Basket Press'],
  },
  {
    id: 'margaret', name: 'Margaret River', country: 'Australia',
    lat: -33.9, lon: 115.1,
    tags: ['cabernet', 'upscale', 'december', 'offbeat'],
    fun: 'Margaret River was only recommended as a wine region in 1965 by a doctor (Dr. John Gladstones) who noticed its climate closely resembled Bordeaux. He was right.',
    famousFor: 'Bordeaux-style Cabernet Sauvignon and Chardonnay from a maritime Indian Ocean peninsula — Australia\'s most elegant fine wine region.',
    nearestCity: { name: 'Perth', distance: '3hr from Perth', logistics: 'Fly into Perth (PER). Car required for the 3hr drive south. Some organized wine tours available from Perth. The town of Margaret River is a pleasant base.' },
    price: '$$', priceReason: 'Margaret River wines are quality-priced — not as expensive as comparable Napa, but firmly in the mid-range for Australian wines.',
    examRegion: true,
    badges: ['exam', 'scenic', 'prestigious'],
    grapes: ['Cabernet Sauvignon', 'Merlot', 'Chardonnay', 'Sauvignon Blanc', 'Sémillon'],
    styles: ['Cabernet Sauvignon (Bordeaux-style)', 'Chardonnay', 'SBS blends'],
    climate: 'Maritime Mediterranean',
    soil: 'Gravelly loam over clay',
    description: 'A finger of land jutting into the Indian Ocean, Margaret River\'s maritime climate closely mirrors Bordeaux. It produces Australia\'s finest Cabernet Sauvignon — structured and long-lived — alongside elegant Chardonnay and distinctive Sauvignon Blanc–Sémillon blends.',
    notable: ['Leeuwin Estate Art Series', 'Moss Wood', 'Cullen Diana Madeline', 'Vasse Felix'],
  },
  {
    id: 'coonawarra', name: 'Coonawarra', country: 'Australia',
    lat: -37.3, lon: 140.8,
    tags: ['cabernet', 'upscale'],
    fun: 'Coonawarra\'s famous terra rossa — a thin strip of red soil over white limestone — is only 15km long and 2km wide, yet produces some of Australia\'s most distinctive Cabernet Sauvignon.',
    famousFor: 'Cabernet Sauvignon on terra rossa — a ribbon of red soil over limestone that produces some of Australia\'s most distinctive reds.',
    nearestCity: { name: 'Adelaide', distance: '4hr from Adelaide', logistics: 'Long drive south from Adelaide. Alternatively fly into Mount Gambier (MGB) via Melbourne for closer access. Car required in the region.' },
    price: '$$', priceReason: 'Coonawarra Cabernet occupies the premium-to-fine-wine tier of Australian reds — world-class quality well worth the price.',
    examRegion: true,
    badges: ['exam', 'prestigious'],
    grapes: ['Cabernet Sauvignon', 'Shiraz', 'Merlot', 'Riesling', 'Chardonnay'],
    styles: ['Cabernet Sauvignon (terra rossa style)', 'Shiraz', 'Cool-climate Riesling'],
    climate: 'Cool Maritime / Continental',
    soil: 'Terra rossa over limestone (rendzina)',
    description: 'Coonawarra is one of Australia\'s most geographically distinct wine regions — a narrow cigar of famous terra rossa (red soil over limestone) that imparts a unique savory, earthy character to its Cabernet Sauvignon. Cooler than Barossa, wines here are more structured and restrained.',
    notable: ['Wynns Coonawarra Estate', 'Balnaves', 'Penley Estate', 'Parker Coonawarra Estate'],
  },
  {
    id: 'clare', name: 'Clare Valley', country: 'Australia',
    lat: -33.8, lon: 138.6,
    tags: ['riesling', 'offbeat', 'budget'],
    fun: 'Clare Valley Riesling ages magnificently — bottles from 10–20 years old develop into rich, toasty, complex wines. Yet they\'re released young at budget prices almost no one takes seriously enough.',
    famousFor: 'Riesling with electric lime and citrus acidity — Australia\'s finest expression of the grape, built for long aging.',
    nearestCity: { name: 'Adelaide', distance: '2hr from Adelaide', logistics: 'Car required north from Adelaide. Often combined with Barossa Valley in a 2-day trip. Small, walkable towns throughout the valley.' },
    price: '$', priceReason: 'Clare Valley Riesling is exceptional value — serious, ageable whites at $20–$40. One of wine\'s great bargains.',
    examRegion: true,
    badges: ['exam', 'budget-friendly'],
    grapes: ['Riesling', 'Shiraz', 'Cabernet Sauvignon', 'Grenache'],
    styles: ['Dry Riesling (lime and mineral)', 'Aged Riesling', 'Shiraz'],
    climate: 'Cool Continental (altitude-moderated)',
    soil: 'Red-brown sandy loam, limestone, slate',
    description: 'Clare Valley sits 130km north of Adelaide and produces some of Australia\'s most acclaimed Riesling — crisp, zesty, and intensely mineral. Unlike many whites, Clare Rieslings age beautifully for 10–20+ years, developing complexity and richness. The Polish Hill and Watervale sub-zones have distinct styles.',
    notable: ['Grosset Polish Hill', 'Kilikanoon', 'Jim Barry Armagh', 'Leasingham'],
  },
  {
    id: 'eden', name: 'Eden Valley', country: 'Australia',
    lat: -34.5, lon: 139.0,
    tags: ['riesling', 'shiraz', 'offbeat'],
    fun: 'Eden Valley sits on a plateau 500m above the Barossa Valley — the same Shiraz grapes grown just kilometers apart taste completely different due to the altitude and temperature drop.',
    famousFor: 'High-altitude Riesling and elegant cool-climate Shiraz — the elevated, cool counterpart to the powerful Barossa Valley below.',
    nearestCity: { name: 'Adelaide', distance: '1.5hr from Adelaide', logistics: 'Car required. Eden Valley sits on the plateau above Barossa. Easily combined with a Barossa visit on the same trip.' },
    price: '$$', priceReason: 'Eden Valley wines are fairly priced. Altitude-driven elegance and the prestige of top producers like Henschke slightly elevate pricing above Clare Valley.',
    examRegion: true,
    badges: ['exam', 'scenic'],
    grapes: ['Riesling', 'Shiraz', 'Chardonnay', 'Cabernet Sauvignon'],
    styles: ['Riesling', 'Cool-climate Shiraz', 'Chardonnay'],
    climate: 'Cool Continental (high altitude)',
    soil: 'Sandy loam over granite, grey-brown clay',
    description: 'Eden Valley sits on the Barossa Ranges plateau at 400–600m above sea level, giving significantly cooler temperatures than the Barossa floor. It is home to Henschke Hill of Grace, one of Australia\'s most celebrated wines from pre-phylloxera Shiraz vines. The cooler climate also produces Australia\'s most refined Riesling outside of Clare Valley.',
    notable: ['Henschke Hill of Grace', 'Pewsey Vale', 'Mountadam', 'Forbes & Forbes'],
  },

  // ── NEW ZEALAND ──────────────────────────────────────────
  {
    id: 'marlborough', name: 'Marlborough', country: 'New Zealand',
    lat: -41.5, lon: 173.9,
    tags: ['sauvignon-blanc', 'casual', 'budget', 'december', 'top-20'],
    fun: 'Before 1973, Marlborough had zero vineyards. Cloudy Bay\'s first vintage in 1985 launched the global Sauvignon Blanc craze — and the region now produces 75% of all New Zealand wine.',
    famousFor: 'The wine that defined a country — Marlborough Sauvignon Blanc is New Zealand\'s global calling card with its iconic passionfruit and citrus character.',
    nearestCity: { name: 'Blenheim', distance: '15 min from Blenheim', logistics: 'Fly into Blenheim (BHE) or Nelson (NSN, 1.5hr). Wellington–Picton ferry (3.5hr) is a scenic option. The flat wine valley is easily bikeable.' },
    price: '$', priceReason: 'Marlborough Sauvignon Blanc is brilliant value — one of the world\'s most recognizable styles at highly accessible prices.',
    examRegion: true,
    badges: ['top-20', 'exam', 'budget-friendly', 'scenic'],
    grapes: ['Sauvignon Blanc', 'Pinot Noir', 'Chardonnay', 'Pinot Gris', 'Riesling'],
    styles: ['Sauvignon Blanc', 'Marlborough Pinot Noir'],
    climate: 'Cool Maritime / Sunny',
    soil: 'Alluvial gravel, clay',
    description: 'Marlborough put New Zealand on the global wine map. Its intense, vibrant Sauvignon Blanc — with signature passionfruit, capsicum, and citrus — became an international phenomenon. The Wairau and Awatere valleys have distinct styles.',
    notable: ['Cloudy Bay', 'Fromm', 'Dog Point', 'Seresin', 'Craggy Range Te Muna'],
  },
  {
    id: 'central-otago', name: 'Central Otago', country: 'New Zealand',
    lat: -45.0, lon: 169.3,
    emerging: true,
    tags: ['pinot-noir', 'offbeat', 'upscale', 'scenic', 'december'],
    fun: 'Central Otago is the world\'s southernmost commercial wine region — its extreme latitude (45°S) gives an impossibly long growing season and intense, spicy Pinot Noir unlike anywhere else.',
    famousFor: 'Pinot Noir from the world\'s southernmost commercial wine region — intense, spicy, and utterly distinctive.',
    nearestCity: { name: 'Queenstown', distance: '30 min from Queenstown', logistics: 'Fly into Queenstown (ZQN). Bannockburn, Gibbston Valley, and Cromwell are the main sub-zones, all accessible by car from Queenstown.' },
    price: '$$', priceReason: 'New Zealand production costs and the unique extreme-latitude position make Central Otago Pinot mid-range but outstanding value versus comparable Burgundy.',
    examRegion: true,
    badges: ['exam', 'scenic', 'emerging'],
    grapes: ['Pinot Noir', 'Chardonnay', 'Riesling', 'Pinot Gris', 'Gewürztraminer'],
    styles: ['Central Otago Pinot Noir', 'Riesling', 'Chardonnay'],
    climate: 'Continental (southernmost commercial region)',
    soil: 'Schist, loess, alluvial gravels',
    description: 'Central Otago is New Zealand\'s most dramatic wine region — a landlocked valley of mountains, gorges, and glacial lakes at 45°S latitude. Its continental climate gives extreme temperature variation, producing Pinot Noir of remarkable intensity, spice, and structure. Sub-regions include Bannockburn, Gibbston, and Cromwell.',
    notable: ['Felton Road', 'Mt. Difficulty', 'Ata Rangi', 'Rippon', 'Quartz Reef'],
  },
  {
    id: 'hawkes-bay', name: "Hawke's Bay", country: 'New Zealand',
    lat: -39.5, lon: 176.9,
    tags: ['cabernet', 'syrah', 'food', 'casual'],
    fun: "The Gimblett Gravels in Hawke's Bay were nearly turned into a gravel quarry in the 1980s. A geologist spotted the viticultural potential just in time — it's now New Zealand's most prestigious red wine sub-region.",
    famousFor: "Gimblett Gravels Bordeaux blends and Syrah — New Zealand's finest red wine heartland.",
    nearestCity: { name: 'Napier', distance: '20 min from Napier', logistics: "Fly into Hawke's Bay (NPE). Art Deco city Napier is the ideal base. Bike tours are popular across the flat Gimblett Gravels — an easy and scenic way to visit wineries." },
    price: '$$', priceReason: "Hawke's Bay wines offer strong quality-to-price — comparable to entry Bordeaux at better value.",
    examRegion: true,
    badges: ['exam', 'foodie', 'scenic'],
    grapes: ['Cabernet Sauvignon', 'Merlot', 'Syrah', 'Chardonnay', 'Sauvignon Blanc'],
    styles: ['Bordeaux-style reds (Gimblett Gravels)', 'Syrah', 'Chardonnay'],
    climate: 'Warm Maritime',
    soil: 'Gimblett Gravels (free-draining alluvial), silt loam',
    description: "Hawke's Bay on New Zealand's North Island is the country's second-largest wine region and its red wine capital. The Gimblett Gravels is a warm, well-drained sub-zone that produces structured Bordeaux blends and Syrah that can rival wines from warmer world regions. Chardonnay is also excellent.",
    notable: ['Craggy Range', 'Trinity Hill', 'Te Mata Estate', 'Sacred Hill', 'Sileni'],
  },

  // ── SOUTH AFRICA ─────────────────────────────────────────
  {
    id: 'stellenbosch', name: 'Stellenbosch', country: 'South Africa',
    lat: -33.9, lon: 18.9,
    tags: ['cabernet', 'pinotage', 'food', 'city', 'budget', 'december', 'top-20'],
    fun: 'Pinotage — South Africa\'s own grape — was created at Stellenbosch University in 1925 by crossing Pinot Noir and Cinsault. It\'s the only major variety that originated in Africa.',
    famousFor: 'South Africa\'s Bordeaux — dramatic mountain-ringed vineyards producing Cabernet Sauvignon, Cape Blends, and the uniquely South African Pinotage.',
    nearestCity: { name: 'Cape Town', distance: '45 min from Cape Town', logistics: 'Fly into Cape Town (CPT). Car recommended. Wine routes are well-signposted. Franschhoek and Paarl are both nearby for multi-region visits.' },
    price: '$', priceReason: 'South African wines offer exceptional value — world-class quality at prices well below European equivalents due to favorable exchange rates.',
    examRegion: true,
    badges: ['top-20', 'exam', 'scenic', 'budget-friendly', 'foodie', 'city-base'],
    grapes: ['Cabernet Sauvignon', 'Pinotage', 'Syrah', 'Chenin Blanc', 'Sauvignon Blanc'],
    styles: ['Bordeaux-style reds', 'Pinotage', 'Cape Blends', 'Chenin Blanc'],
    climate: 'Mediterranean',
    soil: 'Decomposed granite, clay, shale',
    description: 'Stellenbosch is South Africa\'s most prestigious wine region, ringed by dramatic mountains. It excels in Cabernet Sauvignon and Bordeaux blends. South Africa\'s own Pinotage (a 1925 crossing of Pinot Noir and Cinsault) is also at its best here.',
    notable: ['Kanonkop Paul Sauer', 'Meerlust Rubicon', 'Vergelegen', 'Jordan'],
  },
  {
    id: 'swartland', name: 'Swartland', country: 'South Africa',
    lat: -33.35, lon: 18.65,
    emerging: true,
    tags: ['offbeat', 'emerging', 'budget', 'casual'],
    fun: 'The "Swartland Revolution" starting around 2010 attracted a wave of young winemakers who transformed the region from bulk wine country into one of the world\'s most exciting natural wine frontiers.',
    famousFor: 'Old-vine Chenin Blanc and Rhône blends from South Africa\'s natural wine epicenter — a region that went from unknown to internationally celebrated in a decade.',
    nearestCity: { name: 'Cape Town', distance: '1hr from Cape Town', logistics: 'Car recommended. Malmesbury is the main town. Easily combined with a Cape Winelands trip.' },
    price: '$', priceReason: 'Swartland wines punch far above their price point — world-class natural wines from Sadie Family and Mullineux at $20–$50.',
    examRegion: false,
    badges: ['emerging', 'budget-friendly', 'foodie'],
    grapes: ['Chenin Blanc', 'Grenache', 'Syrah', 'Cinsault', 'Mourvèdre', 'Carignan'],
    styles: ['Old-vine Chenin Blanc', 'Rhône-style blends', 'Natural wines', 'Skin-contact whites'],
    climate: 'Hot Mediterranean / Dry',
    soil: 'Granite, shale, Malmsbury clay',
    description: 'Swartland is South Africa\'s natural wine epicenter — a wild, dry region of ancient bush vines where a new generation of winemakers is making minimal-intervention wines that have taken the global wine world by storm. Chenin Blanc here is extraordinary.',
    notable: ['Eben Sadie (Sadie Family)', 'Mullineux', 'Intellego', 'AA Badenhorst', 'Thorne & Daughters'],
  },
  {
    id: 'walker-bay', name: 'Walker Bay', country: 'South Africa',
    lat: -34.4, lon: 19.3,
    emerging: true,
    tags: ['pinot-noir', 'offbeat', 'emerging', 'upscale'],
    fun: 'Hermanus in Walker Bay is known as one of the world\'s best land-based whale watching spots — from June to December, Southern Right Whales calve just meters from the cliffs above the vineyards.',
    famousFor: 'Cool-coastal Pinot Noir and Chardonnay from the Hemel-en-Aarde Valley — South Africa\'s answer to Burgundy.',
    nearestCity: { name: 'Cape Town', distance: '1.5hr from Cape Town', logistics: 'Car required south along the coast. Hermanus is the main town and a destination in its own right for whale watching and restaurants.' },
    price: '$$', priceReason: 'Walker Bay wines are mid-range — quality is world-class especially from top Hemel-en-Aarde producers like Hamilton Russell and Creation.',
    examRegion: true,
    badges: ['exam', 'scenic', 'emerging', 'foodie'],
    grapes: ['Pinot Noir', 'Chardonnay', 'Syrah', 'Sauvignon Blanc'],
    styles: ['Pinot Noir (Hemel-en-Aarde)', 'Chardonnay', 'Syrah'],
    climate: 'Cool Maritime (ocean-influenced)',
    soil: 'Shale, clay, decomposed granite',
    description: 'Walker Bay on the Cape\'s south coast produces South Africa\'s most Burgundian wines. The Hemel-en-Aarde (Heaven on Earth) Valley is the main sub-region, where Hamilton Russell pioneered world-class Pinot Noir and Chardonnay in the 1970s. The cool ocean influence from Walker Bay creates some of Africa\'s most elegant fine wines.',
    notable: ['Hamilton Russell Vineyards', 'Creation Wines', 'Bouchard Finlayson', 'Newton Johnson'],
  },
];

// Group by country for filter buttons
const COUNTRIES = [...new Set(REGIONS.map(r => r.country))];

// Country bounding boxes for map zoom [lon-min, lat-min, lon-max, lat-max]
const COUNTRY_BOUNDS = {
  'France':        [-5.1, 42.3, 8.3, 51.1],
  'Italy':         [6.6, 36.6, 18.5, 47.1],
  'Spain':         [-9.4, 35.9, 4.3, 43.8],
  'Germany':       [5.9, 47.3, 15.0, 55.1],
  'Austria':       [9.5, 46.4, 17.2, 49.0],
  'Portugal':      [-9.5, 37.0, -6.2, 42.2],
  'USA':           [-125.0, 25.0, -66.9, 49.4],
  'Canada':        [-140.0, 42.0, -52.6, 60.0],
  'Mexico':        [-118.5, 14.5, -86.7, 32.7],
  'Argentina':     [-73.6, -55.1, -53.6, -22.0],
  'Chile':         [-75.7, -56.0, -66.4, -17.5],
  'Australia':     [113.2, -39.2, 153.6, -10.7],
  'New Zealand':   [166.4, -47.3, 178.6, -34.4],
  'South Africa':  [16.5, -34.8, 33.0, -22.1],
};

// ── Preference chips ─────────────────────────────────────
const PREFERENCE_CHIPS = [
  { id: 'pinot',    label: 'I love Pinot Noir',                  filterType: 'tags',   tags: ['pinot-noir'] },
  { id: 'offbeat',  label: 'Off the beaten path',                filterType: 'tags',   tags: ['offbeat', 'emerging'] },
  { id: 'emerging', label: 'Up and coming regions',              filterType: 'tags',   tags: ['emerging'] },
  { id: 'upscale',  label: 'Upscale & fine dining',              filterType: 'tags',   tags: ['upscale'] },
  { id: 'food',     label: 'World-class food scene',             filterType: 'tags',   tags: ['food'] },
  { id: 'city',     label: 'Close to a major city',              filterType: 'city',   tags: ['city'] },
  { id: 'budget',   label: 'Budget-friendly wines',              filterType: 'tags',   tags: ['budget'] },
  { id: 'casual',   label: 'Relaxed & low-key vibe',             filterType: 'tags',   tags: ['casual'] },
  { id: 'december', label: 'Great for December travel',          filterType: 'tags',   tags: ['december'] },
  { id: 'top20',    label: 'Top 20 wine regions',                filterType: 'tags',   tags: ['top-20'] },
  { id: 'exam',     label: 'WSET & sommelier exam regions',      filterType: 'exam' },
  { id: 'price1',   label: '$ Budget-priced wines',              filterType: 'price',  price: '$' },
  { id: 'price2',   label: '$$ Mid-range wines',                 filterType: 'price',  price: '$$' },
  { id: 'price3',   label: '$$$ Premium & prestige',             filterType: 'price',  price: '$$$' },
  { id: 'custom',   label: '',                                   filterType: 'custom' },
];

// ── Region photo lookup ──────────────────────────────────
// Curated Unsplash search terms per region
const REGION_PHOTOS = {
  'bordeaux':       'bordeaux,chateau,gironde,france',
  'burgundy':       'burgundy,vineyard,cote-dor,france',
  'champagne':      'champagne,reims,epernay,vineyard',
  'rhone':          'rhone,hermitage,france,vineyard',
  'alsace':         'alsace,colmar,vineyard,france',
  'loire':          'loire,chateau,vineyard,france',
  'tuscany':        'tuscany,chianti,hills,italy',
  'piedmont':       'piedmont,barolo,langhe,italy',
  'veneto':         'veneto,verona,italy,vineyard',
  'etna':           'etna,volcano,sicily,italy',
  'rioja':          'rioja,vineyard,spain,wine',
  'ribera':         'castilla,spain,vineyard,meseta',
  'priorat':        'priorat,terraced,slate,spain',
  'sherry':         'jerez,andalusia,spain,bodega',
  'mosel':          'mosel,river,steep,germany',
  'rheingau':       'rhine,castle,germany,vineyard',
  'wachau':         'wachau,danube,austria,terraces',
  'douro':          'douro,portugal,terraces,valley',
  'alentejo':       'alentejo,cork,portugal,plains',
  'napa':           'napa,valley,california,vineyard',
  'sonoma':         'sonoma,california,vineyard,wine',
  'willamette':     'willamette,oregon,vineyard,pinot',
  'finger-lakes':   'finger-lakes,new-york,lake,vineyard',
  'paso':           'paso-robles,california,vineyard',
  'okanagan':       'okanagan,canada,lake,vineyard',
  'mexico':         'baja-california,mexico,guadalupe,vineyard',
  'mendoza':        'mendoza,andes,argentina,malbec',
  'casablanca':     'chile,andes,vineyard,wine',
  'barossa':        'barossa,australia,shiraz,vineyard',
  'margaret':       'western-australia,margaret-river,ocean',
  'coonawarra':     'coonawarra,australia,vineyard,cabernet',
  'clare':          'south-australia,vineyard,hills,riesling',
  'eden':           'barossa,australia,ranges,vineyard',
  'marlborough':    'marlborough,new-zealand,sauvignon,vineyard',
  'central-otago':  'central-otago,queenstown,mountains,vineyard',
  'hawkes-bay':     'hawkes-bay,napier,new-zealand,vineyard',
  'stellenbosch':   'stellenbosch,south-africa,mountain,vineyard',
  'swartland':      'swartland,cape,south-africa,vineyard',
  'walker-bay':     'hermanus,south-africa,coast,whale',
};

function regionPhotoUrl(regionId, w = 800, h = 400) {
  const q = REGION_PHOTOS[regionId];
  return q ? `https://source.unsplash.com/featured/${w}x${h}/?${q}` : null;
}

// Per-chip "why" reason generator
function getFilterReason(region, pref) {
  switch (pref.id) {
    case 'pinot':    return 'Known for exceptional Pinot Noir';
    case 'offbeat':  return region.emerging ? 'Up and coming — less explored, more authentic' : 'A lesser-known gem for adventurous wine lovers';
    case 'emerging': return 'Rapidly gaining global recognition';
    case 'upscale':  return 'World-class estates and fine dining experiences';
    case 'food':     return 'Outstanding local cuisine and wine culture';
    case 'city':     return region.nearestCity ? `Near ${region.nearestCity.name} — ${region.nearestCity.distance}` : 'Close to a major city';
    case 'budget':   return 'Excellent wine quality at approachable prices';
    case 'casual':   return 'Laid-back wineries with a relaxed, welcoming vibe';
    case 'december': return 'Ideal climate and timing for December visits';
    case 'top20':    return 'Recognized as one of the world\'s top 20 wine regions';
    case 'exam':     return 'Covered in WSET Level 3 & CMS Certified curriculum';
    case 'price1':   return region.priceReason || 'Budget-friendly wine region';
    case 'price2':   return region.priceReason || 'Mid-range pricing';
    case 'price3':   return region.priceReason || 'Premium and prestige wines';
    default:         return '';
  }
}

// Badge display config
const BADGE_CONFIG = {
  'top-20':       { label: 'Top 20',        color: '#7B2D8B', bg: 'rgba(123,45,139,0.12)' },
  'exam':         { label: 'WSET / CMS',    color: '#1A5276', bg: 'rgba(26,82,118,0.12)' },
  'prestigious':  { label: 'Prestigious',   color: '#7D6608', bg: 'rgba(125,102,8,0.12)' },
  'budget-friendly': { label: 'Great Value', color: '#1E8449', bg: 'rgba(30,132,73,0.12)' },
  'foodie':       { label: 'Food Scene',    color: '#A04000', bg: 'rgba(160,64,0,0.12)' },
  'scenic':       { label: 'Scenic',        color: '#1A5276', bg: 'rgba(26,82,118,0.12)' },
  'city-base':    { label: 'City Base',     color: '#555555', bg: 'rgba(85,85,85,0.12)' },
  'casual':       { label: 'Low-key',       color: '#2E4057', bg: 'rgba(46,64,87,0.12)' },
  'emerging':     { label: 'Emerging',      color: '#2E7D42', bg: 'rgba(61,138,78,0.12)' },
  'natural-wine': { label: 'Natural Wine',  color: '#4A7B4B', bg: 'rgba(74,123,75,0.12)' },
};

// ─────────────────────────────────────────────────────────
class WineRegions {
  constructor() {
    this.activeRegion    = null;
    this.activeFilter    = 'All';
    this.activePref      = null;
    this.projection      = null;
    this.markerGroup     = null;
    this.tooltip         = null;
    this.zoom            = null;
    this.currentScale    = 1;
  }

  async init() {
    this.markerGroup   = document.getElementById('region-markers');
    this.infoDefault   = document.querySelector('.region-info-default');
    this.infoDetail    = document.getElementById('region-info-detail');
    this.detailContent = document.getElementById('region-detail-content');
    this.filtersEl     = document.getElementById('region-filters');
    this.loadingEl     = document.getElementById('map-loading');
    this.tooltip       = document.getElementById('map-tooltip');

    const width  = 960;
    const height = 480;

    const projection = d3.geoNaturalEarth1()
      .scale(160)
      .translate([width / 2, height / 2]);

    const pathGen = d3.geoPath().projection(projection);
    this.projection = projection;

    // Ocean sphere
    const sphere = document.getElementById('map-sphere');
    sphere.setAttribute('d', pathGen({ type: 'Sphere' }));

    // Graticule
    const graticule = d3.geoGraticule().step([30, 30])();
    const gratEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    gratEl.setAttribute('d', pathGen(graticule));
    gratEl.setAttribute('class', 'graticule-path');
    document.getElementById('map-graticule').appendChild(gratEl);

    // Load world data
    try {
      const world = await d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json');

      const countriesGroup = document.getElementById('map-countries');
      topojson.feature(world, world.objects.countries).features.forEach(feature => {
        const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        p.setAttribute('d', pathGen(feature));
        p.setAttribute('class', 'country-path');
        countriesGroup.appendChild(p);
      });

      const borderEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      borderEl.setAttribute('d', pathGen(
        topojson.mesh(world, world.objects.countries, (a, b) => a !== b)
      ));
      borderEl.setAttribute('class', 'country-border');
      document.getElementById('map-borders').appendChild(borderEl);

    } catch (err) {
      console.error('World map data failed to load:', err);
    } finally {
      if (this.loadingEl) this.loadingEl.style.display = 'none';
    }

    this.setupZoom();
    this.buildFilters();
    this.buildCountryLabels();
    this.buildMarkers();
    this.buildExplorer();

    document.getElementById('region-back-btn').addEventListener('click', () => {
      this.clearActive();
      this.showDefault();
    });
  }

  // ── Country labels ───────────────────────────────────────
  buildCountryLabels() {
    const COUNTRY_LABELS = [
      { name: 'France',       lat: 46.5,  lon:  2.3 },
      { name: 'Italy',        lat: 42.5,  lon: 12.5 },
      { name: 'Spain',        lat: 40.0,  lon: -3.5 },
      { name: 'Germany',      lat: 51.2,  lon: 10.5 },
      { name: 'Austria',      lat: 47.5,  lon: 14.5 },
      { name: 'Portugal',     lat: 39.5,  lon: -8.0 },
      { name: 'USA',          lat: 38.0,  lon:-100.0 },
      { name: 'Canada',       lat: 56.0,  lon: -96.0 },
      { name: 'Mexico',       lat: 24.0,  lon: -102.0 },
      { name: 'Argentina',    lat: -38.0, lon: -65.0 },
      { name: 'Chile',        lat: -35.0, lon: -71.0 },
      { name: 'Australia',    lat: -25.0, lon: 134.0 },
      { name: 'New Zealand',  lat: -41.5, lon: 172.5 },
      { name: 'South Africa', lat: -29.0, lon:  25.0 },
    ];

    const labelsGroup = document.getElementById('map-country-labels');
    if (!labelsGroup) return;

    COUNTRY_LABELS.forEach(({ name, lat, lon }) => {
      const [x, y] = this.projection([lon, lat]);
      if (!x || !y || isNaN(x) || isNaN(y)) return;
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', x);
      txt.setAttribute('y', y);
      txt.setAttribute('class', 'country-label');
      txt.textContent = name;
      labelsGroup.appendChild(txt);
    });
  }

  // ── Zoom ────────────────────────────────────────────────
  setupZoom() {
    this.zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on('start', () => this.hideTooltip())
      .on('zoom', (event) => {
        this.currentScale = event.transform.k;
        d3.select('#map-zoom-group').attr('transform', event.transform);
        const k = event.transform.k;
        d3.selectAll('.region-marker').each(function() {
          const cx = +this.querySelector('circle').getAttribute('cx');
          const cy = +this.querySelector('circle').getAttribute('cy');
          d3.select(this).attr('transform',
            `translate(${cx},${cy}) scale(${1 / k}) translate(${-cx},${-cy})`
          );
        });
      });

    d3.select('#world-map').call(this.zoom);

    document.getElementById('zoom-in').addEventListener('click', () => {
      d3.select('#world-map').transition().duration(300).call(this.zoom.scaleBy, 1.6);
    });
    document.getElementById('zoom-out').addEventListener('click', () => {
      d3.select('#world-map').transition().duration(300).call(this.zoom.scaleBy, 0.625);
    });
    document.getElementById('zoom-reset').addEventListener('click', () => {
      d3.select('#world-map').transition().duration(400).call(this.zoom.transform, d3.zoomIdentity);
    });
  }

  zoomToCountry(country) {
    const bounds = COUNTRY_BOUNDS[country];
    if (!bounds) return;
    const width = 960, height = 480;
    const [x0, y0] = this.projection([bounds[0], bounds[3]]);
    const [x1, y1] = this.projection([bounds[2], bounds[1]]);
    const dx = Math.abs(x1 - x0) || 1;
    const dy = Math.abs(y1 - y0) || 1;
    const cx = (x0 + x1) / 2;
    const cy = (y0 + y1) / 2;
    const scale = Math.min(8, 0.85 / Math.max(dx / width, dy / height));
    const tx = width / 2 - scale * cx;
    const ty = height / 2 - scale * cy;
    d3.select('#world-map')
      .transition().duration(750)
      .call(this.zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }

  // ── Tooltip ─────────────────────────────────────────────
  showTooltip(event, region) {
    const wrapper = document.querySelector('.map-wrapper');
    const rect = wrapper.getBoundingClientRect();
    const brief = region.description.split('.')[0] + '.';
    const grapes = region.grapes.slice(0, 2).join(', ');

    const badgesHtml = (region.badges || []).slice(0, 3).map(b => {
      const cfg = BADGE_CONFIG[b];
      if (!cfg) return '';
      return `<span style="display:inline-block;background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}33;border-radius:8px;font-size:0.6rem;font-weight:600;padding:1px 7px;margin:0 2px 2px 0;">${cfg.label}</span>`;
    }).join('');

    const photoUrl = regionPhotoUrl(region.id, 280, 120);
    const photoHtml = photoUrl
      ? `<div class="tooltip-photo"><img src="${photoUrl}" alt="${region.name}" loading="lazy" onerror="this.parentElement.style.display='none'" /></div>`
      : '';

    this.tooltip.innerHTML = `
      ${photoHtml}
      <div class="tooltip-body">
        ${region.emerging ? '<div class="tooltip-emerging">🌱 Emerging Region</div>' : ''}
        <div class="tooltip-name">${region.name}</div>
        <div class="tooltip-country">${region.country}</div>
        ${badgesHtml ? `<div style="margin:4px 0;">${badgesHtml}</div>` : ''}
        <div class="tooltip-desc">${brief}</div>
        <div class="tooltip-grapes">🍇 ${grapes}</div>
        ${region.fun ? `<div class="tooltip-fun">💡 ${region.fun}</div>` : ''}
      </div>
    `;

    let x = event.clientX - rect.left + 14;
    let y = event.clientY - rect.top + 14;
    if (x + 280 > rect.width) x = event.clientX - rect.left - 280;
    if (y + 220 > rect.height) y = event.clientY - rect.top - 220;

    this.tooltip.style.left  = Math.max(4, x) + 'px';
    this.tooltip.style.top   = Math.max(4, y) + 'px';
    this.tooltip.style.display = 'block';
  }

  hideTooltip() {
    if (this.tooltip) this.tooltip.style.display = 'none';
  }

  // ── Markers ─────────────────────────────────────────────
  buildMarkers() {
    this.markerGroup.innerHTML = '';

    REGIONS.forEach(region => {
      const [x, y] = this.projection([region.lon, region.lat]);
      if (!x || !y || isNaN(x) || isNaN(y)) return;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('region-marker');
      if (region.emerging) g.classList.add('emerging-marker');
      g.setAttribute('data-id', region.id);
      g.setAttribute('data-country', region.country);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', '6');

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', x);
      label.setAttribute('y', y - 10);
      label.textContent = region.name;

      g.appendChild(circle);
      g.appendChild(label);

      g.addEventListener('mouseenter', (e) => this.showTooltip(e, region));
      g.addEventListener('mousemove', (e) => {
        const wrapper = document.querySelector('.map-wrapper');
        const rect = wrapper.getBoundingClientRect();
        let lx = e.clientX - rect.left + 14;
        let ly = e.clientY - rect.top  + 14;
        if (lx + 280 > rect.width)  lx = e.clientX - rect.left - 280;
        if (ly + 220 > rect.height) ly = e.clientY - rect.top  - 220;
        this.tooltip.style.left = Math.max(4, lx) + 'px';
        this.tooltip.style.top  = Math.max(4, ly) + 'px';
      });
      g.addEventListener('mouseleave', () => this.hideTooltip());
      g.addEventListener('click', () => this.selectRegion(region, g));

      this.markerGroup.appendChild(g);
    });
  }

  // ── Country filter ───────────────────────────────────────
  buildFilters() {
    this.filtersEl.innerHTML = '';
    const allBtn = this.makeFilterBtn('All', true);
    this.filtersEl.appendChild(allBtn);
    COUNTRIES.forEach(country => {
      this.filtersEl.appendChild(this.makeFilterBtn(country, false));
    });
  }

  makeFilterBtn(label, active) {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (active ? ' active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => {
      this.activeFilter = label;
      this.filtersEl.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.updateMarkerVisibility();
      if (label !== 'All') this.zoomToCountry(label);
      else d3.select('#world-map').transition().duration(400).call(this.zoom.transform, d3.zoomIdentity);
    });
    return btn;
  }

  updateMarkerVisibility() {
    this.markerGroup.querySelectorAll('.region-marker').forEach(marker => {
      const country = marker.getAttribute('data-country');
      marker.style.display = (this.activeFilter === 'All' || country === this.activeFilter) ? '' : 'none';
    });
  }

  // ── Region selection ─────────────────────────────────────
  selectRegion(region, markerEl) {
    this.markerGroup.querySelectorAll('.region-marker').forEach(m => m.classList.remove('active'));
    if (markerEl) markerEl.classList.add('active');
    this.activeRegion = region.id;
    this.hideTooltip();
    this.showDetail(region);
  }

  clearActive() {
    this.markerGroup.querySelectorAll('.region-marker').forEach(m => m.classList.remove('active'));
    this.activeRegion = null;
  }

  showDefault() {
    this.infoDefault.style.display = 'block';
    this.infoDetail.style.display  = 'none';
  }

  showDetail(region) {
    this.infoDefault.style.display = 'none';
    this.infoDetail.style.display  = 'block';

    const badgesHtml = (region.badges || []).map(b => {
      const cfg = BADGE_CONFIG[b];
      if (!cfg) return '';
      return `<span style="display:inline-block;background:${cfg.bg};color:${cfg.color};border:1px solid ${cfg.color}55;border-radius:10px;font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:2px 9px;margin:0 4px 4px 0;">${cfg.label}</span>`;
    }).join('');

    const priceHtml = region.price ? `
      <div class="region-price-row">
        <span class="region-price-tier">${region.price}</span>
        <span class="region-price-label"> typical price range</span>
        ${region.priceReason ? `<p class="region-price-reason">${region.priceReason}</p>` : ''}
      </div>` : '';

    const cityHtml = region.nearestCity ? `
      <div class="region-city-row">
        <span class="region-city-icon">📍</span>
        <strong>${region.nearestCity.name}</strong> — ${region.nearestCity.distance}
        <p class="region-city-logistics">${region.nearestCity.logistics}</p>
      </div>` : '';

    const examHtml = region.examRegion ? `
      <div class="region-exam-badge">📚 Covered in WSET Level 3 &amp; CMS Certified curriculum</div>` : '';

    const heroUrl = regionPhotoUrl(region.id, 800, 380);
    const heroHtml = heroUrl ? `
      <div class="region-hero-photo">
        <img src="${heroUrl}" alt="${region.name} vineyard" loading="lazy"
             onerror="this.parentElement.style.display='none'" />
        <div class="region-hero-overlay">
          <h2>${region.name}</h2>
          <span class="region-country-badge-hero">${region.country}</span>
        </div>
      </div>` : `<h2>${region.name}</h2><span class="region-country-badge">${region.country}</span>`;

    this.detailContent.innerHTML = `
      <div class="region-detail">
        ${heroHtml}
        ${badgesHtml ? `<div class="region-badges">${badgesHtml}</div>` : ''}
        ${region.famousFor ? `<p class="region-famous-for"><strong>Known for:</strong> ${region.famousFor}</p>` : ''}
        <p class="region-desc">${region.description}</p>
        ${region.fun ? `<p class="region-fun-fact">💡 <em>${region.fun}</em></p>` : ''}
        ${priceHtml}
        ${cityHtml}
        ${examHtml}
        <div class="region-meta-grid">
          <div class="meta-card">
            <div class="meta-card-label">Climate</div>
            <div class="meta-card-value">${region.climate}</div>
          </div>
          <div class="meta-card">
            <div class="meta-card-label">Soils</div>
            <div class="meta-card-value">${region.soil}</div>
          </div>
        </div>
        <p class="region-section-label">Key Grape Varieties</p>
        <div class="grape-tags">
          ${region.grapes.map(g => `<span class="grape-tag">${g}</span>`).join('')}
        </div>
        <p class="region-section-label" style="margin-top:14px;">Wine Styles</p>
        <div class="style-tags">
          ${region.styles.map(s => `<span class="style-tag">${s}</span>`).join('')}
        </div>
        <div class="notable-section">
          <p class="region-section-label">Notable Wines &amp; Producers</p>
          <ul class="notable-list">
            ${region.notable.map(n => `<li>${n}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  // ── Region Explorer ──────────────────────────────────────
  buildExplorer() {
    const chipsEl = document.getElementById('explorer-chips');
    chipsEl.innerHTML = '';

    PREFERENCE_CHIPS.forEach(pref => {
      if (pref.filterType === 'custom') {
        // Custom chip: text input + search button
        const wrapper = document.createElement('div');
        wrapper.className = 'explorer-chip explorer-chip-custom';
        wrapper.innerHTML = `
          <span class="chip-custom-icon">✏️</span>
          <input type="text" class="chip-custom-input" placeholder="Type your own filter…" spellcheck="false" />
        `;
        const input = wrapper.querySelector('.chip-custom-input');
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
              document.querySelectorAll('.explorer-chip').forEach(c => c.classList.remove('active'));
              wrapper.classList.add('active');
              this.filterByText(text, this.showExplorerResults.bind(this), null);
            }
          }
        });
        wrapper.addEventListener('click', (e) => {
          if (e.target === input) return;
          input.focus();
        });
        chipsEl.appendChild(wrapper);
        return;
      }

      const chip = document.createElement('button');
      chip.className = 'explorer-chip';
      chip.dataset.prefId = pref.id;
      chip.textContent = pref.label;

      chip.addEventListener('click', () => this.toggleChip(chip, pref));
      chipsEl.appendChild(chip);
    });
  }

  toggleChip(chip, pref) {
    const isActive = chip.classList.contains('active');
    document.querySelectorAll('.explorer-chip').forEach(c => c.classList.remove('active'));

    if (!isActive) {
      chip.classList.add('active');
      this.activePref = pref;
      this.filterByPreference(pref);
    } else {
      this.activePref = null;
      document.getElementById('explorer-results').style.display = 'none';
    }
  }

  filterByPreference(pref) {
    let matches = [];

    if (pref.filterType === 'exam') {
      matches = REGIONS.filter(r => r.examRegion === true);
    } else if (pref.filterType === 'price') {
      matches = REGIONS.filter(r => r.price === pref.price);
    } else if (pref.filterType === 'city') {
      matches = REGIONS.filter(r => r.tags && r.tags.includes('city'));
    } else {
      matches = REGIONS.filter(r => r.tags && r.tags.some(t => pref.tags.includes(t)));
    }

    this.showExplorerResults(matches, pref);
  }

  filterByText(text, callback, pref) {
    const stopWords = new Set(['i', 'want', 'to', 'a', 'an', 'the', 'and', 'or', 'in', 'on', 'be', 'close', 'my', 'me', 'is', 'of', 'for', 'like', 'love', 'am', 'im', 'up', 'low', 'key']);
    const keywords = text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    if (!keywords.length) { callback([], pref); return; }

    const matches = REGIONS.filter(r => {
      const haystack = [
        r.name, r.country,
        ...r.grapes,
        ...r.styles,
        ...(r.tags || []),
        r.description,
        r.famousFor || '',
      ].join(' ').toLowerCase();
      return keywords.some(k => haystack.includes(k));
    });

    callback(matches, pref);
  }

  showExplorerResults(matches, pref) {
    const resultsEl = document.getElementById('explorer-results');

    if (!matches.length) {
      resultsEl.innerHTML = '<p class="explorer-no-results">No regions matched. Try a different preference or keyword.</p>';
    } else {
      resultsEl.innerHTML = `
        <div class="explorer-result-label">Regions for you — click any card to explore</div>
        <div class="explorer-result-cards">
          ${matches.map(r => this.explorerCard(r, pref)).join('')}
        </div>
      `;
      resultsEl.querySelectorAll('.explorer-result-card').forEach(card => {
        card.addEventListener('click', () => {
          const region = REGIONS.find(r => r.id === card.dataset.regionId);
          if (region) {
            const marker = this.markerGroup.querySelector(`[data-id="${region.id}"]`);
            this.selectRegion(region, marker);
            document.getElementById('region-info-panel').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
      });
    }

    resultsEl.style.display = 'block';
  }

  explorerCard(region, pref) {
    const brief = region.description.split('.')[0] + '.';
    const emergingBadge = region.emerging ? '<span class="emerging-badge">🌱 Emerging</span>' : '';
    const examBadge = region.examRegion ? '<span class="exam-badge">📚 WSET/CMS</span>' : '';
    const priceBadge = region.price ? `<span class="price-badge">${region.price}</span>` : '';
    const reason = pref ? getFilterReason(region, pref) : '';

    const photoUrl = regionPhotoUrl(region.id, 480, 180);
    const thumbHtml = photoUrl
      ? `<div class="explorer-card-thumb"><img src="${photoUrl}" alt="${region.name}" loading="lazy" onerror="this.parentElement.style.display='none'" /></div>`
      : '';

    const cityInfo = (pref && pref.filterType === 'city' && region.nearestCity)
      ? `<div class="explorer-card-city">📍 <strong>${region.nearestCity.name}</strong> — ${region.nearestCity.distance}<br><span class="explorer-card-logistics">${region.nearestCity.logistics}</span></div>`
      : '';

    const priceInfo = (pref && pref.filterType === 'price' && region.priceReason)
      ? `<div class="explorer-card-price-reason">${region.priceReason}</div>`
      : '';

    return `
      <div class="explorer-result-card" data-region-id="${region.id}">
        ${thumbHtml}
        <div class="explorer-card-body">
          <div class="explorer-card-header">
            <strong>${region.name}</strong>
            <span class="explorer-card-country">${region.country}</span>
            ${priceBadge}${emergingBadge}${examBadge}
          </div>
          ${reason ? `<div class="explorer-card-reason">✓ ${reason}</div>` : ''}
          <p class="explorer-card-desc">${brief}</p>
          ${cityInfo}
          ${priceInfo}
          <div class="grape-tags">
            ${region.grapes.slice(0, 3).map(g => `<span class="grape-tag">${g}</span>`).join('')}
          </div>
        </div>
      </div>
    `;
  }
}
