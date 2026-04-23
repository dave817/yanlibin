/* ============================================================
   OREO BEAUTY — swipe deck + WebGL marble shader + bottle SVG
   ============================================================ */

/* ── Product catalogue ─────────────────────────────────── */
const PRODUCTS = [
  { id: 'shampoo',   series: 'Cacao · Hair', nameLead: 'Crush',   nameTail: 'Cacao',   variant: 'Restorative Shampoo',    price: 28, size: '380 ml',  desc: 'Deep clean meets slow repair. Cacao butter, rice protein.',        bottle: 'cacao-dark'    },
  { id: 'cond',      series: 'Vanilla · Hair', nameLead: 'Dream',  nameTail: 'Vanilla', variant: 'Softening Conditioner',  price: 26, size: '260 ml',  desc: 'A second-skin film of vanilla and sweet almond. Detangles slowly.', bottle: 'vanilla-cream' },
  { id: 'scrub',     series: 'Cacao · Body', nameLead: 'Crushed', nameTail: 'Cacao',    variant: 'Exfoliating Polish',     price: 32, size: '200 ml',  desc: 'Crushed cacao nib over a warmed oil base. Grounding, specific.',    bottle: 'cacao-stone'   },
  { id: 'fizz',      series: 'Harvest · Bath', nameLead: 'Fizzle', nameTail: 'Harvest',  variant: 'Effervescent Soak',      price: 24, size: '6 × 80 g',desc: 'Mineral salts, cacao husk, bitter orange. A slow-release bath.',    bottle: 'harvest-copper'},
  { id: 'drizzle',   series: 'Cacao · Body', nameLead: 'Drizzle', nameTail: 'Body',     variant: 'Illuminating Oil',       price: 38, size: '100 ml',  desc: 'Pressed cacao oil, ten drops of Madagascan vanilla absolute.',      bottle: 'cacao-gold'    },
  { id: 'serum',     series: 'Cacao · Face', nameLead: 'Silk',    nameTail: 'Cocoa',    variant: 'Radiance Serum',         price: 68, size: '30 ml',   desc: 'A nightly conversation between cacao polyphenols and niacinamide.', bottle: 'serum-dark'    },
  { id: 'balm',      series: 'Midnight · Face', nameLead: 'Midnight', nameTail: 'Repair', variant: 'Overnight Balm',       price: 52, size: '50 ml',   desc: 'An heirloom cold cream, reimagined. Warm it between palms.',        bottle: 'balm-jar'      },
  { id: 'mist',      series: 'Vanilla · Face', nameLead: 'Velvet', nameTail: 'Glow',    variant: 'Hydrating Mist',         price: 32, size: '150 ml',  desc: 'Vanilla water and white tea. Between steps, or any time.',          bottle: 'mist-tall'     },
];

/* ── SVG bottle renderer ───────────────────────────────── */
const BOTTLE_VARIANTS = {
  'cacao-dark':    { cap: '#2A1810', body: 'linear-gradient(180deg,#4A3321,#6B4423 50%,#3D2817)', label: '#F5F0E6', accent: '#B8935E', shape: 'shampoo' },
  'vanilla-cream': { cap: '#CEB481', body: 'linear-gradient(180deg,#F0E5CA,#E8D9BB 50%,#D4C194)', label: '#FAF6EC', accent: '#6B4423', shape: 'shampoo' },
  'cacao-stone':   { cap: '#3D2817', body: 'linear-gradient(180deg,#6B4423,#8B5E35 55%,#5A3720)', label: '#EDE6D6', accent: '#B8935E', shape: 'jar'      },
  'harvest-copper':{ cap: '#6B3E1A', body: 'linear-gradient(180deg,#B8935E,#8F6A3E 60%,#6B4423)', label: '#FAF6EC', accent: '#3D2817', shape: 'box'      },
  'cacao-gold':    { cap: '#3D2817', body: 'linear-gradient(180deg,#D4B385,#B8935E 50%,#8F6A3E)', label: '#2A1810', accent: '#2A1810', shape: 'tall'     },
  'serum-dark':    { cap: '#1A130C', body: 'linear-gradient(180deg,#3A2D1F,#1A130C 55%,#0F0906)', label: '#D4B385', accent: '#B8935E', shape: 'dropper'  },
  'balm-jar':      { cap: '#B8935E', body: 'linear-gradient(180deg,#E8D9BB,#CEB481)',              label: '#2A1810', accent: '#6B4423', shape: 'jar'      },
  'mist-tall':     { cap: '#2A1810', body: 'linear-gradient(180deg,#F5F0E6,#EDE6D6 55%,#D4C194)',  label: '#2A1810', accent: '#6B4423', shape: 'tall'     },
};

function renderBottle(p, opts = {}) {
  const v = BOTTLE_VARIANTS[p.bottle] || BOTTLE_VARIANTS['cacao-dark'];
  const small = opts.small;
  const labelFontSize   = small ? 6  : 9;
  const brandFontSize   = small ? 4  : 5.5;
  const variantFontSize = small ? 3.5 : 4.5;
  const sizeFontSize    = small ? 3  : 3.5;

  const shape = v.shape || 'shampoo';
  // Different silhouettes
  const silhouette = {
    shampoo: `<rect x="20" y="14" width="60" height="12" rx="1.5" fill="${v.cap}" />
              <rect x="16" y="26" width="68" height="150" rx="8" fill="url(#body-${p.id})"/>`,
    jar:     `<rect x="10" y="18" width="80" height="14" rx="2" fill="${v.cap}" />
              <rect x="8"  y="32" width="84" height="120" rx="12" fill="url(#body-${p.id})"/>`,
    tall:    `<rect x="30" y="10" width="40" height="14" rx="1" fill="${v.cap}" />
              <rect x="22" y="24" width="56" height="170" rx="4" fill="url(#body-${p.id})"/>`,
    box:     `<rect x="12" y="20" width="76" height="150" rx="3" fill="url(#body-${p.id})"/>`,
    dropper: `<rect x="38" y="6"  width="24" height="20" rx="2" fill="${v.cap}" />
              <rect x="32" y="24" width="36" height="6"  fill="${v.cap}" opacity="0.5"/>
              <rect x="24" y="30" width="52" height="140" rx="3" fill="url(#body-${p.id})"/>`,
  }[shape];

  // gradient stops derived from the CSS linear-gradient
  const stops = v.body.match(/#[A-Fa-f0-9]{6}/g) || ['#000000', '#000000'];
  const gradStops = stops.map((c, i) => `<stop offset="${(i / (stops.length - 1)) * 100}%" stop-color="${c}"/>`).join('');

  // Nib specks / texture inside bottle
  const speckles = shape === 'jar'
    ? `<g opacity="0.35">${Array.from({length: 14}).map(() => {
        const cx = 20 + Math.random() * 60;
        const cy = 44 + Math.random() * 90;
        const r  = 0.6 + Math.random() * 1.4;
        return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${v.accent}"/>`;
      }).join('')}</g>`
    : '';

  const labelY = shape === 'jar' ? 64 : 62;
  const labelH = shape === 'jar' ? 70 : 82;

  return `
<svg viewBox="0 0 100 200" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" style="width:100%;height:100%;max-height:100%;">
  <defs>
    <linearGradient id="body-${p.id}" x1="0" y1="0" x2="0" y2="1">${gradStops}</linearGradient>
    <linearGradient id="gloss-${p.id}" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%"  stop-color="#fff" stop-opacity="0.10"/>
      <stop offset="18%" stop-color="#fff" stop-opacity="0"/>
      <stop offset="82%" stop-color="#000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000" stop-opacity="0.20"/>
    </linearGradient>
  </defs>

  <!-- bottle body -->
  ${silhouette}
  <!-- gloss overlay -->
  <rect x="16" y="26" width="68" height="150" rx="8" fill="url(#gloss-${p.id})"/>

  ${speckles}

  <!-- paper label -->
  <rect x="22" y="${labelY}" width="56" height="${labelH}" fill="${v.label}" opacity="0.96" rx="1"/>
  <line x1="24" y1="${labelY + 4}" x2="76" y2="${labelY + 4}" stroke="${v.accent}" stroke-width="0.3" opacity="0.4"/>
  <line x1="24" y1="${labelY + labelH - 4}" x2="76" y2="${labelY + labelH - 4}" stroke="${v.accent}" stroke-width="0.3" opacity="0.4"/>

  <!-- label text -->
  <text x="50" y="${labelY + 12}" text-anchor="middle" font-family="Fraunces, Georgia" font-weight="500" font-size="${brandFontSize}" fill="${v.accent}" letter-spacing="0.5">OREO BEAUTY</text>
  <text x="50" y="${labelY + 24}" text-anchor="middle" font-family="Fraunces, Georgia" font-style="italic" font-weight="400" font-size="${labelFontSize}" fill="${v.accent}">${p.nameLead}</text>
  <text x="50" y="${labelY + 24 + labelFontSize + 2}" text-anchor="middle" font-family="Fraunces, Georgia" font-weight="500" font-size="${labelFontSize}" fill="${v.accent}" letter-spacing="0.3">${p.nameTail.toUpperCase()}</text>
  <text x="50" y="${labelY + 24 + labelFontSize + 2 + variantFontSize + 4}" text-anchor="middle" font-family="Geist, sans-serif" font-weight="400" font-size="${variantFontSize}" fill="${v.accent}" opacity="0.75">${p.variant}</text>
  <text x="50" y="${labelY + labelH - 8}" text-anchor="middle" font-family="Geist Mono, monospace" font-weight="400" font-size="${sizeFontSize}" fill="${v.accent}" opacity="0.65" letter-spacing="0.4">${p.size.toUpperCase()}</text>
</svg>`;
}

/* ── WebGL marble background ────────────────────────── */
function initMarble(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) { canvas.style.background = 'linear-gradient(180deg, #FAF6EC, #EDE6D6)'; return; }

  const vert = `
    attribute vec2 a_pos;
    void main() { gl_Position = vec4(a_pos, 0.0, 1.0); }
  `;
  const frag = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;

    float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
    float vn(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                 mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
    }
    float fbm(vec2 p) {
      float v = 0.0, a = 0.55;
      for (int i = 0; i < 6; i++) { v += a * vn(p); p = p * 2.05 + vec2(1.7, 0.3); a *= 0.48; }
      return v;
    }
    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      float aspect = u_res.x / u_res.y;
      vec2 uva = uv; uva.x *= aspect;

      float t = u_time * 0.035;

      // Two-pass domain warp for marble veining
      vec2 q = vec2(fbm(uva * 2.0 + t),
                    fbm(uva * 2.0 + vec2(4.1, 1.2) + t * 0.9));
      float f = fbm(uva * 2.4 + 1.6 * q + t * 0.2);

      // Warm parchment palette
      vec3 c1 = vec3(0.980, 0.965, 0.925); // paper
      vec3 c2 = vec3(0.945, 0.918, 0.862); // cream
      vec3 c3 = vec3(0.878, 0.835, 0.765); // sand
      vec3 c4 = vec3(0.720, 0.680, 0.615); // warm taupe
      vec3 c5 = vec3(0.419, 0.267, 0.137); // deep cacao hint

      vec3 col = mix(c1, c2, smoothstep(0.2,  0.55, f));
      col      = mix(col, c3, smoothstep(0.5,  0.78, f) * 0.65);
      col      = mix(col, c4, smoothstep(0.72, 0.92, f) * 0.45);

      // Veining — sinusoidal, domain-warped
      float vein = smoothstep(0.48, 0.52,
        sin(uva.x * 5.5 + fbm(uva * 3.5 + t * 0.5) * 5.8));
      col = mix(col, c5, vein * 0.08);

      // Gentle vignette
      vec2 c = uv - 0.5;
      col *= 1.0 - dot(c, c) * 0.22;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn('shader:', gl.getShaderInfoLog(s));
    }
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uRes  = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  let dirty = true;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const w = Math.floor(canvas.offsetWidth * dpr);
    const h = Math.floor(canvas.offsetHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w; canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uRes, w, h);
    }
  };

  const ro = new ResizeObserver(() => { dirty = true; });
  ro.observe(canvas.parentElement);

  const start = performance.now();
  const tick = () => {
    if (dirty) { resize(); dirty = false; }
    gl.uniform1f(uTime, (performance.now() - start) / 1000);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(tick);
  };
  resize(); tick();
}

/* ── Swipe Deck ────────────────────────────────────── */
class Deck {
  constructor(el, opts) {
    this.el        = el;
    this.products  = opts.products;
    this.onSwipe   = opts.onSwipe;
    this.onEmpty   = opts.onEmpty;
    this.onAdvance = opts.onAdvance;

    this.cards     = [];
    this.topIdx    = 0;              /* index into products; 0 = first visible */
    this.THRESH    = 110;

    this.render();
    this.stack();
    this.bindTop();
  }

  render() {
    // Cards in DOM order: index 0 (deepest) ... index N-1 (topmost)
    const frag = document.createDocumentFragment();
    this.products.forEach((p, i) => {
      const card = document.createElement('article');
      card.className = 'card';
      card.setAttribute('aria-label', `${p.nameLead} ${p.nameTail} — ${p.variant}`);
      card.innerHTML = `
        <span class="card__stamp card__stamp--love" aria-hidden="true">LOVE</span>
        <span class="card__stamp card__stamp--nope" aria-hidden="true">SKIP</span>
        <div class="card__media"><div class="card__bottle">${renderBottle(p)}</div></div>
        <div class="card__body">
          <p class="card__series">${p.series}</p>
          <h3 class="card__name"><em>${p.nameLead}</em> ${p.nameTail}</h3>
          <p class="card__price">$${p.price.toFixed(2)}</p>
          <p class="card__desc">${p.variant}. ${p.desc}</p>
        </div>`;
      this.el.appendChild(card);
      this.cards.push(card);
    });
  }

  stack() {
    this.cards.forEach((card, i) => {
      if (i < this.topIdx) { card.style.display = 'none'; return; }
      const offset = i - this.topIdx;           /* 0 = top, 1 = one behind */
      const y  = Math.min(offset, 3) * 10;
      const sc = 1 - Math.min(offset, 3) * 0.03;
      card.style.transform = `translateY(${y}px) scale(${sc})`;
      card.style.opacity = offset > 3 ? 0 : 1;
      card.style.zIndex = this.products.length - offset;
    });
  }

  get top() { return this.cards[this.topIdx] || null; }

  bindTop() {
    const card = this.top;
    if (!card) return;

    let dragging = false;
    let sx = 0, sy = 0, dx = 0, dy = 0, pid = null;

    const loveStamp = card.querySelector('.card__stamp--love');
    const nopeStamp = card.querySelector('.card__stamp--nope');

    const update = (mx, my) => {
      dx = mx - sx;
      dy = (my - sy) * 0.08;
      const rot = dx * 0.04;
      card.style.transform = `translateX(${dx}px) translateY(${dy}px) rotate(${rot}deg)`;
      const r = Math.min(Math.abs(dx) / this.THRESH, 1);
      if (dx > 0) { loveStamp.style.opacity = r; nopeStamp.style.opacity = 0; }
      else        { nopeStamp.style.opacity = r; loveStamp.style.opacity = 0; }
    };

    const onDown = (e) => {
      if (pid !== null) return;
      if (e.target.closest('a')) return;
      pid = e.pointerId;
      card.setPointerCapture?.(pid);
      dragging = true;
      sx = e.clientX; sy = e.clientY; dx = 0;
      card.classList.remove('is-anim', 'is-fly');
      card.style.transition = 'none';
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!dragging || e.pointerId !== pid) return;
      update(e.clientX, e.clientY);
      e.preventDefault();
    };
    const onUp = (e) => {
      if (!dragging || e.pointerId !== pid) return;
      dragging = false;
      card.releasePointerCapture?.(pid);
      pid = null;
      if (Math.abs(dx) >= this.THRESH) {
        this.fly(dx > 0 ? 'love' : 'nope');
      } else {
        card.classList.add('is-anim');
        card.style.transform = `translateY(0) scale(1)`;
        loveStamp.style.opacity = 0;
        nopeStamp.style.opacity = 0;
      }
      dx = 0;
    };

    card.addEventListener('pointerdown', onDown);
    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerup',   onUp);
    card.addEventListener('pointercancel', onUp);

    this._cleanup = () => {
      card.removeEventListener('pointerdown', onDown);
      card.removeEventListener('pointermove', onMove);
      card.removeEventListener('pointerup',   onUp);
      card.removeEventListener('pointercancel', onUp);
    };
  }

  fly(dir) {
    const card = this.top;
    if (!card || card.dataset.flown) return;
    card.dataset.flown = '1';

    const flyX = (dir === 'love' ? 1 : -1) * (window.innerWidth + 220);
    const rot  = (dir === 'love' ? 1 : -1) * 28;

    const loveStamp = card.querySelector('.card__stamp--love');
    const nopeStamp = card.querySelector('.card__stamp--nope');
    if (dir === 'love') { loveStamp.style.opacity = 1; nopeStamp.style.opacity = 0; }
    else                { nopeStamp.style.opacity = 1; loveStamp.style.opacity = 0; }

    card.classList.add('is-fly');
    card.style.transform = `translateX(${flyX}px) rotate(${rot}deg)`;
    card.style.opacity = 0;

    this._cleanup?.();
    this.onSwipe?.(dir, this.products[this.topIdx]);

    let done = false;
    const handled = () => {
      if (done) return;
      done = true;
      card.style.display = 'none';
      this.topIdx++;
      this.onAdvance?.(this.topIdx);
      this.stack();
      if (this.topIdx >= this.products.length) { this.onEmpty?.(); return; }
      this.bindTop();
    };
    card.addEventListener('transitionend', handled, { once: true });
    setTimeout(handled, 700);
  }

  trigger(dir) { if (this.top && !this.top.dataset.flown) this.fly(dir); }

  reset() {
    this.cards.forEach(c => {
      c.style.display = '';
      c.classList.remove('is-anim', 'is-fly');
      c.style.opacity = 1;
      c.removeAttribute('data-flown');
      const love = c.querySelector('.card__stamp--love');
      const nope = c.querySelector('.card__stamp--nope');
      if (love) love.style.opacity = 0;
      if (nope) nope.style.opacity = 0;
    });
    this.topIdx = 0;
    this.stack();
    this.bindTop();
  }
}

/* ── Bootstrap ─────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {

  /* Nav scroll state (subtle shadow on scroll) */
  const nav = document.querySelector('[data-nav]');
  if (nav) {
    const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* WebGL marble */
  const marble = document.querySelector('.swipe__marble');
  if (marble) initMarble(marble);

  /* Shop grid */
  const shopGrid = document.getElementById('shopGrid');
  if (shopGrid) {
    shopGrid.innerHTML = PRODUCTS.map(p => `
      <li class="grid__item">
        <a href="#" class="grid__media" aria-label="${p.nameLead} ${p.nameTail}">
          ${renderBottle(p, { small: true })}
        </a>
        <div class="grid__body">
          <p class="grid__series">${p.series}</p>
          <h3 class="grid__name"><em>${p.nameLead}</em> ${p.nameTail}</h3>
          <p class="grid__price">$${p.price.toFixed(2)}</p>
        </div>
      </li>
    `).join('');
  }

  /* Swipe deck */
  const deckEl  = document.getElementById('deck');
  const emptyEl = document.getElementById('deckEmpty');
  const progEl  = document.getElementById('progress');
  const lovedEl = document.getElementById('loved');
  const lovedList = document.getElementById('lovedList');
  const lovedCount = document.getElementById('lovedCount');
  const resetBtn = document.getElementById('deckReset');

  if (!deckEl) return;

  // Build progress ticks
  const ticks = PRODUCTS.map(() => {
    const t = document.createElement('span');
    t.className = 'progress__tick';
    progEl.appendChild(t);
    return t;
  });

  // Initialize current tick
  ticks[0]?.classList.add('is-current');

  const loved = [];

  const markHistory = (dir, p) => {
    // Mark the tick for this product
    const idx = PRODUCTS.findIndex(x => x.id === p.id);
    const tick = ticks[idx];
    tick?.classList.remove('is-current');
    tick?.classList.add(dir === 'love' ? 'is-love' : 'is-nope');
  };

  const addLoved = (p) => {
    loved.push(p);
    const li = document.createElement('li');
    li.className = 'loved__item';
    li.style.background = 'var(--cream)';
    li.innerHTML = renderBottle(p, { small: true });
    li.title = `${p.nameLead} ${p.nameTail}`;
    lovedList.appendChild(li);
    lovedEl.classList.add('is-on');
    lovedCount.textContent = loved.length;
  };

  const deck = new Deck(deckEl, {
    products: PRODUCTS,
    onSwipe: (dir, p) => {
      markHistory(dir, p);
      if (dir === 'love') addLoved(p);
    },
    onAdvance: (topIdx) => {
      ticks.forEach(t => t.classList.remove('is-current'));
      if (topIdx < PRODUCTS.length) ticks[topIdx]?.classList.add('is-current');
    },
    onEmpty: () => {
      emptyEl.hidden = false;
      ticks.forEach(t => t.classList.remove('is-current'));
    },
  });

  // Action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => deck.trigger(btn.dataset.action));
  });

  // Keyboard (←, →)
  document.addEventListener('keydown', (e) => {
    if (!emptyEl.hidden) return;
    if (e.key === 'ArrowLeft')  deck.trigger('nope');
    if (e.key === 'ArrowRight') deck.trigger('love');
  });

  // Reset
  resetBtn?.addEventListener('click', () => {
    emptyEl.hidden = true;
    loved.length = 0;
    lovedList.innerHTML = '';
    lovedEl.classList.remove('is-on');
    lovedCount.textContent = '0';
    ticks.forEach(t => t.classList.remove('is-love', 'is-nope', 'is-current'));
    ticks[0]?.classList.add('is-current');
    deck.reset();
  });
});
