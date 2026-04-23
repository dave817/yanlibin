/* ============================================================
   STYLE SWIPE — WebGL marble background + swipe card deck
   ============================================================ */

/* ── WebGL Marble Background ─────────────────────────────── */
function initMarbleGL(canvas) {
  const gl = canvas.getContext('webgl', { antialias: false, alpha: false });
  if (!gl) return null;

  const vert = `
    attribute vec2 a_pos;
    void main() {
      gl_Position = vec4(a_pos, 0.0, 1.0);
    }
  `;

  const frag = `
    precision highp float;
    uniform vec2  u_res;
    uniform float u_time;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 6; i++) {
        v += a * vnoise(p);
        p = p * 2.1 + vec2(1.3, 0.7);
        a *= 0.48;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_res;
      uv.y = 1.0 - uv.y;

      float t = u_time * 0.04;

      /* Swirling domain warp — two passes */
      vec2 q = vec2(fbm(uv * 2.8 + t), fbm(uv * 2.8 + vec2(5.2, 1.3) + t * 0.7));
      float f = fbm(uv * 2.2 + 1.7 * q + t * 0.25);

      /* Palette — warm cream / ivory */
      vec3 c1 = vec3(0.980, 0.965, 0.948); /* near-white warm  */
      vec3 c2 = vec3(0.938, 0.912, 0.882); /* parchment        */
      vec3 c3 = vec3(0.855, 0.820, 0.775); /* warm sand        */
      vec3 c4 = vec3(0.780, 0.740, 0.690); /* muted taupe vein */

      vec3 col = mix(c1, c2, smoothstep(0.25, 0.55, f));
      col      = mix(col, c3, smoothstep(0.50, 0.75, f) * 0.55);

      /* Subtle veining — sinusoidal, animated */
      float vein = smoothstep(0.46, 0.54,
        sin(uv.x * 6.0 + fbm(uv * 4.0 + t * 0.6) * 5.5)
      );
      col = mix(col, c4, vein * 0.22);

      /* Very faint radial vignette for depth */
      vec2  centre = uv - 0.5;
      float vignette = 1.0 - dot(centre, centre) * 0.35;
      col *= vignette;

      gl_FragColor = vec4(col, 1.0);
    }
  `;

  function compile(type, src) {
    const sh = gl.createShader(type);
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    return sh;
  }

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  /* Full-screen quad */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, 'a_pos');
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

  const uRes  = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  let raf;
  let resized = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio, 1.5);
    const w   = canvas.offsetWidth  * dpr | 0;
    const h   = canvas.offsetHeight * dpr | 0;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }

  const ro = new ResizeObserver(() => { resized = true; });
  ro.observe(canvas.parentElement);

  let start = performance.now();

  function render() {
    if (resized) { resize(); resized = false; }
    gl.uniform1f(uTime, (performance.now() - start) * 0.001);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(render);
  }

  resize();
  render();

  return () => { cancelAnimationFrame(raf); ro.disconnect(); };
}

/* ── Swipe Deck ──────────────────────────────────────────── */
class SwipeDeck {
  constructor(wrap) {
    this.wrap        = wrap;
    this.deck        = wrap.querySelector('#swipeDeck');
    this.emptyState  = wrap.querySelector('#swipeEmpty');
    this.lovedShelf  = wrap.querySelector('.style-swipe-loved');
    this.lovedItems  = wrap.querySelector('.style-swipe-loved__items');
    this.progressWrap = wrap.querySelector('.style-swipe-progress');
    this.btnLove     = wrap.querySelector('#btnLove');
    this.btnNope     = wrap.querySelector('#btnNope');

    this.cards       = Array.from(this.deck.querySelectorAll('.swipe-card'));
    this.total       = this.cards.length;
    this.topIdx      = this.total - 1; /* last child = top of visual stack */

    this.dragging    = false;
    this.startX      = 0;
    this.startY      = 0;
    this.dx          = 0;
    this.THRESHOLD   = 110; /* px to trigger a swipe */

    this.init();
  }

  /* ── Setup ── */
  init() {
    this.buildProgress();
    this.stackAll();
    this.bindButtons();
    this.bindCard();
  }

  buildProgress() {
    if (!this.progressWrap) return;
    this.dots = [];
    for (let i = 0; i < this.total; i++) {
      const d = document.createElement('span');
      d.className = 'style-swipe-progress__dot';
      this.progressWrap.appendChild(d);
      this.dots.push(d);
    }
    this.updateProgress();
  }

  updateProgress() {
    if (!this.dots) return;
    this.dots.forEach((d, i) => {
      d.classList.remove('is-active', 'is-done');
      if (i === this.topIdx)          d.classList.add('is-active');
      else if (i > this.topIdx)       d.classList.add('is-done');
    });
  }

  /* Stack cards visually: lower cards offset downward + smaller */
  stackAll() {
    this.cards.forEach((card, i) => {
      const offset = this.topIdx - i;       /* 0 = top, 1 = one below, etc. */
      this.applyStack(card, offset, false);
    });
  }

  applyStack(card, offset, animate) {
    if (animate) card.classList.add('is-animating');
    const y  = Math.min(offset, 3) * 9;
    const sc = 1 - Math.min(offset, 3) * 0.028;
    card.style.transform = `translateY(${y}px) scale(${sc})`;
    card.style.zIndex    = this.cards.length - offset;
    if (animate) {
      card.addEventListener('transitionend', () => card.classList.remove('is-animating'), { once: true });
    }
  }

  /* ── Top card helpers ── */
  get topCard() { return this.cards[this.topIdx] ?? null; }

  stamp(card) {
    return {
      love: card.querySelector('.swipe-card__stamp--love'),
      nope: card.querySelector('.swipe-card__stamp--nope'),
    };
  }

  clearStamps(card) {
    const s = this.stamp(card);
    s.love.style.opacity = '0';
    s.nope.style.opacity = '0';
  }

  /* ── Drag events ── */
  bindCard() {
    const card = this.topCard;
    if (!card) return;

    const onDown = (e) => {
      if (e.target.closest('a')) return;
      e.preventDefault();
      this.dragging = true;
      this.dx = 0;
      const pt = e.touches ? e.touches[0] : e;
      this.startX = pt.clientX;
      this.startY = pt.clientY;
      card.style.transition = 'none';
    };

    const onMove = (e) => {
      if (!this.dragging) return;
      e.preventDefault();
      const pt = e.touches ? e.touches[0] : e;
      this.dx = pt.clientX - this.startX;
      const dy = (pt.clientY - this.startY) * 0.08;
      const rot = this.dx * 0.04;

      card.style.transform = `translateX(${this.dx}px) translateY(${dy}px) rotate(${rot}deg)`;

      /* Stamp opacity */
      const ratio = Math.min(Math.abs(this.dx) / this.THRESHOLD, 1);
      const s = this.stamp(card);
      if (this.dx > 0) { s.love.style.opacity = ratio; s.nope.style.opacity = 0; }
      else             { s.nope.style.opacity = ratio; s.love.style.opacity = 0; }
    };

    const onUp = () => {
      if (!this.dragging) return;
      this.dragging = false;
      if (Math.abs(this.dx) >= this.THRESHOLD) {
        this.swipe(this.dx > 0 ? 'love' : 'nope');
      } else {
        /* Spring return */
        card.classList.add('is-animating');
        card.style.transform = `translateY(${(this.topIdx - this.topIdx) * 9}px) scale(1)`;
        this.clearStamps(card);
        card.addEventListener('transitionend', () => card.classList.remove('is-animating'), { once: true });
      }
      this.dx = 0;
    };

    card.addEventListener('mousedown',  onDown, { passive: false });
    card.addEventListener('touchstart', onDown, { passive: false });
    window.addEventListener('mousemove',  onMove, { passive: false });
    window.addEventListener('touchmove',  onMove, { passive: false });
    window.addEventListener('mouseup',  onUp);
    window.addEventListener('touchend', onUp);

    /* Stash cleanup refs */
    this._unbind = () => {
      card.removeEventListener('mousedown',  onDown);
      card.removeEventListener('touchstart', onDown);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('touchmove',  onMove);
      window.removeEventListener('mouseup',  onUp);
      window.removeEventListener('touchend', onUp);
    };
  }

  unbindCard() {
    if (this._unbind) { this._unbind(); this._unbind = null; }
  }

  /* ── Swipe action ── */
  swipe(direction) {
    const card = this.topCard;
    if (!card || card.dataset.flying) return;
    card.dataset.flying = '1';

    const flyX  = direction === 'love' ? window.innerWidth * 1.6 : -window.innerWidth * 1.6;
    const rot   = direction === 'love' ? 28 : -28;
    const cls   = direction === 'love' ? 'is-flying-right' : 'is-flying-left';

    /* Ensure stamp is full opacity before flying */
    const s = this.stamp(card);
    if (direction === 'love') { s.love.style.opacity = '1'; s.nope.style.opacity = '0'; }
    else                      { s.nope.style.opacity = '1'; s.love.style.opacity = '0'; }

    card.classList.add(cls);
    card.style.transform = `translateX(${flyX}px) rotate(${rot}deg)`;
    card.style.opacity   = '0';

    if (direction === 'love') this.addLoved(card);

    this.unbindCard();

    card.addEventListener('transitionend', () => {
      card.style.display = 'none';
      this.topIdx--;
      this.updateProgress();
      this.stackAll();

      if (this.topIdx < 0) {
        this.deck.style.display  = 'none';
        this.emptyState.style.display = 'flex';
        this.emptyState.classList.add('is-visible');
      } else {
        this.bindCard();
      }
    }, { once: true });
  }

  /* ── Button actions ── */
  bindButtons() {
    this.btnLove?.addEventListener('click', () => { if (this.topCard) this.swipe('love'); });
    this.btnNope?.addEventListener('click', () => { if (this.topCard) this.swipe('nope'); });
  }

  /* ── Loved shelf ── */
  addLoved(card) {
    const img  = card.querySelector('img');
    const url  = card.dataset.productUrl || '#';
    const name = card.querySelector('.swipe-card__name')?.textContent || '';

    const a    = document.createElement('a');
    a.href     = url;
    a.className = 'loved-item';
    a.title    = name;

    if (img) {
      const i    = document.createElement('img');
      i.src      = img.src;
      i.alt      = name;
      i.loading  = 'lazy';
      a.appendChild(i);
    }

    this.lovedItems.appendChild(a);
    this.lovedShelf.classList.add('has-items');
  }
}

/* ── Bootstrap ──────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const wrap = document.querySelector('.style-swipe-wrap');
  if (!wrap) return;

  /* WebGL marble canvas */
  const canvas = wrap.querySelector('.style-swipe-canvas');
  if (canvas) initMarbleGL(canvas);

  /* Swipe deck (only if there are cards) */
  const deck = wrap.querySelector('#swipeDeck');
  if (deck && deck.querySelectorAll('.swipe-card').length > 0) {
    new SwipeDeck(wrap);
  }
});
