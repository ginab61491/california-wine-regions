// flavor-wheel.js — Interactive canvas-based wine flavor wheel

const WHEEL_DATA = [
  {
    name: 'Fruity',
    color: '#C0392B',
    description: 'Fruit-forward flavors are the most immediately recognizable in wine. They can range from bright fresh fruit in young wines to concentrated dried fruit in older or fortified wines.',
    wineExamples: ['Beaujolais', 'Pinot Noir', 'Riesling', 'Grenache'],
    subcategories: [
      { name: 'Red Berry',    color: '#E74C3C', notes: 'Strawberry, raspberry, redcurrant, cranberry, pomegranate' },
      { name: 'Dark Berry',   color: '#C0392B', notes: 'Blackberry, blueberry, blackcurrant, dark cherry, boysenberry' },
      { name: 'Stone Fruit',  color: '#E67E22', notes: 'Peach, apricot, nectarine, plum, cherry, damson' },
      { name: 'Tropical',     color: '#F39C12', notes: 'Mango, pineapple, passion fruit, guava, lychee, papaya' },
      { name: 'Citrus',       color: '#F1C40F', notes: 'Lemon, lime, grapefruit, orange zest, mandarin, yuzu' },
      { name: 'Dried Fruit',  color: '#E59866', notes: 'Raisin, prune, fig, dried apricot, sultana, dates' },
    ],
  },
  {
    name: 'Floral',
    color: '#8E44AD',
    description: 'Floral aromas add elegance and delicacy. They are most prominent in aromatic white varieties and certain Rhône reds, often fading with age.',
    wineExamples: ['Viognier', 'Gewürztraminer', 'Muscat', 'Nebbiolo'],
    subcategories: [
      { name: 'Rose',         color: '#E91E8C', notes: 'Fresh rose petal, rose water, dried rose, rosewater Turkish delight' },
      { name: 'Violet',       color: '#9B59B6', notes: 'Violet, iris, lavender, purple flower' },
      { name: 'White Flower', color: '#BB8FCE', notes: 'Jasmine, elderflower, honeysuckle, acacia, orange blossom' },
      { name: 'Blossom',      color: '#C39BD3', notes: 'Cherry blossom, apple blossom, wisteria, peony, magnolia' },
    ],
  },
  {
    name: 'Spicy',
    color: '#D35400',
    description: 'Spice notes arise from the grape variety itself, from oak treatment, or develop with age. They add complexity and warmth.',
    wineExamples: ['Syrah/Shiraz', 'Zinfandel', 'Gewürztraminer', 'Grüner Veltliner'],
    subcategories: [
      { name: 'Black Pepper', color: '#E59866', notes: 'Freshly ground black pepper, white pepper, grains of paradise' },
      { name: 'Warm Spice',   color: '#CA6F1E', notes: 'Cinnamon, clove, nutmeg, allspice, cardamom, ginger' },
      { name: 'Anise',        color: '#A04000', notes: 'Star anise, licorice, fennel seed, tarragon, absinthe' },
      { name: 'Herbal',       color: '#784212', notes: 'Mint, eucalyptus, bay leaf, thyme, sage, rosemary, dill' },
    ],
  },
  {
    name: 'Earthy',
    color: '#795548',
    description: 'Earthy notes give wine a sense of place — its terroir. They are often associated with Old World styles and develop with bottle age.',
    wineExamples: ['Burgundy Pinot Noir', 'Barolo', 'Rioja', 'Brunello'],
    subcategories: [
      { name: 'Forest Floor', color: '#8D6E63', notes: 'Mushroom, truffle, fallen leaves, compost, undergrowth, moss' },
      { name: 'Leather',      color: '#A1887F', notes: 'Saddle leather, tobacco, cigar box, shoe polish, hide' },
      { name: 'Animal',       color: '#BCAAA4', notes: 'Game, barnyard, wet wool, fur, farm, aged cheese rind' },
      { name: 'Soil',         color: '#6D4C41', notes: 'Clay, dust, gravel, chalk, pencil shavings, limestone' },
    ],
  },
  {
    name: 'Oak & Wood',
    color: '#B8860B',
    description: 'Oak influence from barrel aging is one of the most recognizable winemaking signatures. New oak gives vanilla and toast; old oak adds subtle tannin and oxygen exchange.',
    wineExamples: ['Napa Cabernet', 'White Burgundy', 'Rioja Reserva', 'Oaked Chardonnay'],
    subcategories: [
      { name: 'Vanilla',  color: '#DAA520', notes: 'Vanilla, cream, custard, crème brûlée, butterscotch, toffee' },
      { name: 'Toast',    color: '#CD853F', notes: 'Toast, brioche, bread crust, charcoal, wood smoke' },
      { name: 'Cedar',    color: '#A0522D', notes: 'Cedar, cigar box, sandalwood, pine, pencil lead' },
      { name: 'Coconut',  color: '#D2691E', notes: 'Coconut, almond, hazelnut, marzipan, praline, nougat' },
    ],
  },
  {
    name: 'Mineral',
    color: '#546E7A',
    description: 'Minerality is one of wine\'s most debated qualities. While its origin is contested, it evokes a sense of the land — stony, precise, and often found in cool-climate wines.',
    wineExamples: ['Chablis', 'Mosel Riesling', 'Pouilly-Fumé', 'Santorini Assyrtiko'],
    subcategories: [
      { name: 'Flint',  color: '#78909C', notes: 'Gunflint, struck match, steel, metallic, sparks' },
      { name: 'Slate',  color: '#546E7A', notes: 'Wet slate, pencil lead, graphite, lead' },
      { name: 'Chalk',  color: '#90A4AE', notes: 'Chalk, limestone, calcium, crushed rock, oyster shell' },
      { name: 'Saline', color: '#B0BEC5', notes: 'Sea salt, brine, ocean breeze, oyster, iodine' },
    ],
  },
  {
    name: 'Savory',
    color: '#2E7D32',
    description: 'Savory and umami notes add fascinating complexity. They often emerge with age or from specific regions and winemaking approaches.',
    wineExamples: ['Sangiovese', 'Tempranillo', 'Mencia', 'Southern Rhône'],
    subcategories: [
      { name: 'Olive',   color: '#388E3C', notes: 'Green olive, olive brine, tapenade, black olive, kalamata' },
      { name: 'Smoke',   color: '#1B5E20', notes: 'Wood smoke, campfire ash, charcoal, smoked meat, gunpowder' },
      { name: 'Umami',   color: '#43A047', notes: 'Miso, soy sauce, dried mushroom, dried meat, fish sauce' },
      { name: 'Vegetal', color: '#66BB6A', notes: 'Bell pepper, asparagus, cut grass, tomato leaf, green olive' },
    ],
  },
  {
    name: 'Sweet & Rich',
    color: '#AD1457',
    description: 'Sweet and confectionery notes can come from ripe fruit, residual sugar, botrytis, or bottle age. They add richness and approachability.',
    wineExamples: ['Sauternes', 'Amarone', 'Port', 'Oaked Chardonnay'],
    subcategories: [
      { name: 'Honey',      color: '#F57F17', notes: 'Honey, beeswax, honeycomb, pollen, royal jelly, mead' },
      { name: 'Caramel',    color: '#E65100', notes: 'Caramel, toffee, butterscotch, brown sugar, molasses' },
      { name: 'Dried Fruit',color: '#C62828', notes: 'Raisin, prune, fig, dried plum, candied orange peel, marmalade' },
      { name: 'Chocolate',  color: '#4E342E', notes: 'Dark chocolate, cocoa, mocha, coffee, espresso, tiramisu' },
    ],
  },
];

// ─────────────────────────────────────────────────────────────

class FlavorWheel {
  constructor() {
    this.canvas = null;
    this.ctx    = null;
    this.selectedMain = null;
    this.selectedSub  = null;
    this.hoveredMain  = null;
    this.hoveredSub   = null;

    // Geometry — larger wheel
    this.cx = 320;
    this.cy = 320;
    this.r0 = 70;   // center label
    this.r1 = 150;  // inner ring inner
    this.r2 = 240;  // inner ring outer / outer ring inner
    this.r3 = 312;  // outer ring outer

    // Flavor profile tracking
    this.profileFlavors = [];
  }

  init() {
    this.canvas = document.getElementById('flavor-wheel');
    if (!this.canvas) return;
    this.ctx    = this.canvas.getContext('2d');

    this.canvas.addEventListener('mousemove', e => this.onMouseMove(e));
    this.canvas.addEventListener('click',     e => this.onClick(e));
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredMain = null;
      this.hoveredSub  = null;
      this.draw();
    });

    document.getElementById('wheel-back-btn').addEventListener('click', () => {
      this.selectedMain = null;
      this.selectedSub  = null;
      this.draw();
      this.showDefault();
    });

    // Reset button
    const resetBtn = document.getElementById('wheel-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.selectedMain = null;
        this.selectedSub  = null;
        this.hoveredMain  = null;
        this.hoveredSub   = null;
        this.profileFlavors = [];
        this.updateProfile();
        this.draw();
        this.showDefault();
      });
    }

    this.buildLegend();
    this.draw();
  }

  // ── Geometry helpers ───────────────────────────────────────

  startAngle(mainIdx) {
    return (mainIdx / WHEEL_DATA.length) * Math.PI * 2 - Math.PI / 2;
  }

  endAngle(mainIdx) {
    return ((mainIdx + 1) / WHEEL_DATA.length) * Math.PI * 2 - Math.PI / 2;
  }

  subStartAngle(mainIdx, subIdx) {
    const category = WHEEL_DATA[mainIdx];
    const mainSpan = this.endAngle(mainIdx) - this.startAngle(mainIdx);
    const subSpan  = mainSpan / category.subcategories.length;
    return this.startAngle(mainIdx) + subIdx * subSpan;
  }

  subEndAngle(mainIdx, subIdx) {
    const category = WHEEL_DATA[mainIdx];
    const mainSpan = this.endAngle(mainIdx) - this.startAngle(mainIdx);
    const subSpan  = mainSpan / category.subcategories.length;
    return this.startAngle(mainIdx) + (subIdx + 1) * subSpan;
  }

  // ── Drawing ────────────────────────────────────────────────

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Outer glow
    const glow = ctx.createRadialGradient(this.cx, this.cy, this.r3 - 20, this.cx, this.cy, this.r3 + 30);
    glow.addColorStop(0, 'rgba(201,169,110,0.0)');
    glow.addColorStop(1, 'rgba(201,169,110,0.0)');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw outer ring segments (subcategories)
    WHEEL_DATA.forEach((cat, i) => {
      cat.subcategories.forEach((sub, j) => {
        const sa = this.subStartAngle(i, j);
        const ea = this.subEndAngle(i, j);
        const isHov = this.hoveredSub  && this.hoveredSub.main === i && this.hoveredSub.sub === j;
        const isSel = this.selectedSub && this.selectedSub.main === i && this.selectedSub.sub === j;

        ctx.beginPath();
        ctx.moveTo(this.cx, this.cy);
        ctx.arc(this.cx, this.cy, this.r3, sa, ea);
        ctx.arc(this.cx, this.cy, this.r2, ea, sa, true);
        ctx.closePath();

        let alpha = isHov || isSel ? 1 : 0.82;
        ctx.fillStyle = this.hexToRgba(sub.color, alpha);
        ctx.fill();

        if (isHov || isSel) {
          // Gold inner glow effect
          ctx.shadowColor = 'rgba(201,169,97,0.6)';
          ctx.shadowBlur = 12;
          ctx.strokeStyle = 'rgba(255,255,255,0.95)';
          ctx.lineWidth = 2.5;
        } else {
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.strokeStyle = 'rgba(255,255,255,0.4)';
          ctx.lineWidth = 1;
        }
        ctx.stroke();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;

        // Sub label — larger, more readable
        const midAngle  = (sa + ea) / 2;
        const labelR    = (this.r2 + this.r3) / 2;
        const lx = this.cx + labelR * Math.cos(midAngle);
        const ly = this.cy + labelR * Math.sin(midAngle);
        const arcSpan   = ea - sa;
        const arcLength = arcSpan * labelR;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(midAngle + Math.PI / 2);

        const fontSize = Math.min(11.5, arcLength / sub.name.length * 1.2);
        if (fontSize > 5.5) {
          const fontWeight = (isHov || isSel) ? '600' : '400';
          ctx.font = `${fontWeight} ${fontSize}px 'Montserrat', Arial, sans-serif`;
          ctx.fillStyle = (isHov || isSel) ? 'rgba(255,255,255,1)' : 'rgba(255,255,255,0.9)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(sub.name, 0, 0);
        }
        ctx.restore();
      });
    });

    // Draw inner ring segments (main categories)
    WHEEL_DATA.forEach((cat, i) => {
      const sa = this.startAngle(i);
      const ea = this.endAngle(i);
      const isHov = this.hoveredMain === i;
      const isSel = this.selectedMain === i;

      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.arc(this.cx, this.cy, this.r2, sa, ea);
      ctx.arc(this.cx, this.cy, this.r1, ea, sa, true);
      ctx.closePath();

      let alpha = isHov || isSel ? 1 : 0.9;
      ctx.fillStyle = this.hexToRgba(cat.color, alpha);
      ctx.fill();

      if (isHov || isSel) {
        ctx.strokeStyle = 'rgba(255,255,255,1)';
        ctx.lineWidth = 2.5;
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Main label
      const midAngle = (sa + ea) / 2;
      const labelR   = (this.r1 + this.r2) / 2;
      const lx = this.cx + labelR * Math.cos(midAngle);
      const ly = this.cy + labelR * Math.sin(midAngle);

      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(midAngle + Math.PI / 2);
      ctx.font = 'bold 11px Arial, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.97)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 3;
      ctx.fillText(cat.name, 0, 0);
      ctx.restore();
    });

    // Center circle
    const grad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.r1);
    grad.addColorStop(0,   '#4A1520');
    grad.addColorStop(0.6, '#722F37');
    grad.addColorStop(1,   '#8B3A44');
    ctx.beginPath();
    ctx.arc(this.cx, this.cy, this.r1, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = 'rgba(201,169,110,0.7)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Center text
    ctx.font = 'bold 13px Georgia, serif';
    ctx.fillStyle = '#C9A96E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 4;
    ctx.fillText('WINE', this.cx, this.cy - 9);
    ctx.fillText('FLAVORS', this.cx, this.cy + 9);
    ctx.shadowBlur = 0;
  }

  // ── Hit testing ────────────────────────────────────────────

  hitTest(x, y) {
    const dx  = x - this.cx;
    const dy  = y - this.cy;
    const r   = Math.sqrt(dx * dx + dy * dy);
    let   ang = Math.atan2(dy, dx);
    // Normalize to 0..2π starting from -π/2
    ang = ((ang + Math.PI / 2) + Math.PI * 2) % (Math.PI * 2);
    const frac = ang / (Math.PI * 2);

    if (r < this.r0) return null;

    if (r >= this.r1 && r <= this.r2) {
      const mainIdx = Math.floor(frac * WHEEL_DATA.length);
      return { type: 'main', main: mainIdx };
    }

    if (r >= this.r2 && r <= this.r3) {
      const mainIdx = Math.floor(frac * WHEEL_DATA.length);
      const cat     = WHEEL_DATA[mainIdx];
      const mainStart = mainIdx / WHEEL_DATA.length;
      const mainEnd   = (mainIdx + 1) / WHEEL_DATA.length;
      const subFrac   = (frac - mainStart) / (mainEnd - mainStart);
      const subIdx    = Math.floor(subFrac * cat.subcategories.length);
      return { type: 'sub', main: mainIdx, sub: Math.min(subIdx, cat.subcategories.length - 1) };
    }

    return null;
  }

  onMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const hit = this.hitTest(x, y);
    let changed = false;

    if (!hit) {
      if (this.hoveredMain !== null || this.hoveredSub !== null) changed = true;
      this.hoveredMain = null;
      this.hoveredSub  = null;
      this.canvas.style.cursor = 'default';
    } else if (hit.type === 'main') {
      if (this.hoveredMain !== hit.main || this.hoveredSub !== null) changed = true;
      this.hoveredMain = hit.main;
      this.hoveredSub  = null;
      this.canvas.style.cursor = 'pointer';
    } else {
      if (this.hoveredSub?.main !== hit.main || this.hoveredSub?.sub !== hit.sub) changed = true;
      this.hoveredMain = null;
      this.hoveredSub  = { main: hit.main, sub: hit.sub };
      this.canvas.style.cursor = 'pointer';
    }

    if (changed) this.draw();
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width  / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top)  * scaleY;

    const hit = this.hitTest(x, y);
    if (!hit) return;

    if (hit.type === 'main') {
      this.selectedMain = hit.main;
      this.selectedSub  = null;
      this.showCategoryDetail(hit.main);
      this.addToProfile(WHEEL_DATA[hit.main].name);
    } else {
      this.selectedMain = null;
      this.selectedSub  = { main: hit.main, sub: hit.sub };
      this.showSubcategoryDetail(hit.main, hit.sub);
      this.addToProfile(WHEEL_DATA[hit.main].subcategories[hit.sub].name);
    }
    this.draw();
  }

  // ── Info panel ─────────────────────────────────────────────

  showDefault() {
    document.querySelector('.wheel-info-default').style.display = 'block';
    document.getElementById('wheel-info-detail').style.display  = 'none';
  }

  showCategoryDetail(mainIdx) {
    const cat = WHEEL_DATA[mainIdx];
    document.querySelector('.wheel-info-default').style.display = 'none';
    const detail = document.getElementById('wheel-info-detail');
    detail.style.display = 'block';

    const content = document.getElementById('wheel-detail-content');
    content.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <span style="display:inline-block;width:20px;height:20px;border-radius:50%;background:${cat.color};flex-shrink:0;"></span>
        <h2 style="margin:0;color:${cat.color};">${cat.name}</h2>
      </div>
      <p class="category-desc">${cat.description}</p>

      <p class="region-section-label">Subcategories</p>
      <div class="subcategory-list">
        ${cat.subcategories.map(sub => `
          <div class="subcategory-item" style="border-left-color:${sub.color}">
            <div class="subcategory-name">${sub.name}</div>
            <div class="subcategory-notes">${sub.notes}</div>
          </div>
        `).join('')}
      </div>

      <div class="wines-that-show">
        <h4>Wines that show this character</h4>
        <div>
          ${cat.wineExamples.map(w => `<span class="wine-tag">${w}</span>`).join('')}
        </div>
      </div>
    `;
  }

  showSubcategoryDetail(mainIdx, subIdx) {
    const cat = WHEEL_DATA[mainIdx];
    const sub = cat.subcategories[subIdx];

    document.querySelector('.wheel-info-default').style.display = 'none';
    const detail = document.getElementById('wheel-info-detail');
    detail.style.display = 'block';

    const content = document.getElementById('wheel-detail-content');
    content.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <span style="display:inline-block;width:16px;height:16px;border-radius:50%;background:${sub.color};flex-shrink:0;"></span>
        <h2 style="margin:0;font-size:1.3rem;color:${sub.color};">${sub.name}</h2>
      </div>
      <p style="font-size:0.8rem;color:var(--text-light);margin-bottom:14px;font-family:'Arial',sans-serif;">
        Part of <strong style="color:${cat.color}">${cat.name}</strong>
      </p>

      <div class="pairing-notes" style="border-color:${sub.color};margin-bottom:18px;">
        <p style="font-size:0.9rem;">${sub.notes}</p>
      </div>

      <p style="font-size:0.85rem;color:var(--text-mid);margin-bottom:16px;">${cat.description}</p>

      <div class="wines-that-show">
        <h4>Wines that show ${cat.name} character</h4>
        <div>
          ${cat.wineExamples.map(w => `<span class="wine-tag">${w}</span>`).join('')}
        </div>
      </div>

      <div style="margin-top:18px;padding-top:14px;border-top:1px solid var(--cream-dark);">
        <p class="region-section-label">Other ${cat.name} Subcategories</p>
        ${cat.subcategories
          .filter((_, i) => i !== subIdx)
          .map(s => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="width:8px;height:8px;border-radius:50%;background:${s.color};flex-shrink:0;"></span>
              <span style="font-size:0.82rem;font-family:'Arial',sans-serif;color:var(--text-mid);">${s.name}</span>
            </div>
          `).join('')}
      </div>
    `;
  }

  buildLegend() {
    const legendEl = document.getElementById('wheel-legend');
    legendEl.innerHTML = WHEEL_DATA.map((cat, i) => `
      <div class="legend-item" data-idx="${i}">
        <span class="legend-swatch" style="background:${cat.color}"></span>
        <span class="legend-label">${cat.name}</span>
      </div>
    `).join('');

    legendEl.querySelectorAll('.legend-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.idx);
        this.selectedMain = idx;
        this.selectedSub  = null;
        this.draw();
        this.showCategoryDetail(idx);
      });
    });
  }

  // ── Flavor Profile ─────────────────────────────────────────

  addToProfile(name) {
    if (!this.profileFlavors.includes(name)) {
      this.profileFlavors.push(name);
      if (this.profileFlavors.length > 8) this.profileFlavors.shift();
      this.updateProfile();
    }
  }

  updateProfile() {
    const el = document.getElementById('wheel-profile-flavors');
    if (!el) return;
    if (this.profileFlavors.length === 0) {
      el.innerHTML = '<span class="wheel-profile-empty">Click flavors to build your profile</span>';
    } else {
      el.innerHTML = this.profileFlavors.map(f =>
        `<span class="wheel-profile-flavor">${f}</span>`
      ).join('');
    }
  }

  hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
