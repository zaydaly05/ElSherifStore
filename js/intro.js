/*
 * Intro screen: the logo is cut into blocks that fly in and connect to each
 * other while the page loads, then the screen fades away.
 * Shown once per browser session; "تخطي" or Esc skips it.
 */
(() => {
  'use strict';

  const intro = document.getElementById('intro');
  if (!intro) return;
  const root = document.documentElement;

  const done = () => {
    root.classList.remove('intro-on');
    intro.remove();
  };

  let seen = false;
  try { seen = sessionStorage.getItem('es-intro-seen') === '1'; } catch (e) { /* storage blocked */ }
  if (seen) { done(); return; }
  try { sessionStorage.setItem('es-intro-seen', '1'); } catch (e) { /* storage blocked */ }

  root.classList.add('intro-on');

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 6; // 6 × 6 blocks
  const SRC = 'assets/logo.webp';
  const logo = document.getElementById('intro-logo');
  const links = document.getElementById('intro-links');
  const bar = document.getElementById('intro-bar');
  const pct = document.getElementById('intro-pct');
  const label = document.getElementById('intro-text');

  const t0 = performance.now();
  const MIN_TIME = reduceMotion ? 900 : 3300; // let the assembly finish before leaving
  const MAX_TIME = 9000; // never hold the page longer than this
  let pageLoaded = document.readyState === 'complete';
  let locked = 0;
  let shown = 0;
  let leaving = false;

  /* ---- blocks ---- */
  const tiles = [];
  const frag = document.createDocumentFragment();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      const t = document.createElement('span');
      t.className = 'intro-tile';
      t.style.left = `${(c / N) * 100}%`;
      t.style.top = `${(r / N) * 100}%`;
      t.style.width = `${100 / N}%`;
      t.style.height = `${100 / N}%`;
      t.style.backgroundImage = `url("${SRC}")`;
      t.style.backgroundSize = `${N * 100}% ${N * 100}%`;
      t.style.backgroundPosition = `${(c / (N - 1)) * 100}% ${(r / (N - 1)) * 100}%`;
      // start scattered around the screen
      const ang = Math.random() * Math.PI * 2;
      const dist = 55 + Math.random() * 45;
      t.style.setProperty('--fx', `${Math.cos(ang) * dist}vw`);
      t.style.setProperty('--fy', `${Math.sin(ang) * dist}vh`);
      t.style.setProperty('--fr', `${(Math.random() - 0.5) * 540}deg`);
      t.style.setProperty('--fz', `${Math.round(Math.random() * 600 - 300)}px`);
      frag.appendChild(t);
      tiles.push({ el: t, r, c, on: false });
    }
  }
  logo.appendChild(frag);

  /* ---- connection lines between neighbouring blocks ---- */
  const svgNS = 'http://www.w3.org/2000/svg';
  links.setAttribute('viewBox', `0 0 ${N} ${N}`);
  const connect = (a, b) => {
    const line = document.createElementNS(svgNS, 'line');
    line.setAttribute('x1', a.c + 0.5);
    line.setAttribute('y1', a.r + 0.5);
    line.setAttribute('x2', b.c + 0.5);
    line.setAttribute('y2', b.r + 0.5);
    line.setAttribute('pathLength', '1');
    links.appendChild(line);
  };
  const neighbours = (t) =>
    tiles.filter((o) => o.on && Math.abs(o.r - t.r) + Math.abs(o.c - t.c) === 1);

  /* ---- assembly order: from the centre outwards, with a little randomness ---- */
  const mid = (N - 1) / 2;
  const order = tiles
    .map((t) => ({ t, k: Math.hypot(t.r - mid, t.c - mid) + Math.random() * 1.2 }))
    .sort((a, b) => a.k - b.k)
    .map((o) => o.t);

  const FLY = reduceMotion ? 0 : 850;
  const SPREAD = reduceMotion ? 0 : 1500;
  order.forEach((t, i) => {
    const delay = 250 + (SPREAD * i) / order.length;
    t.el.style.transitionDelay = `${delay}ms`;
    setTimeout(() => {
      t.on = true;
      t.el.classList.add('locked');
      neighbours(t).forEach((n) => connect(t, n));
      locked++;
      if (locked === tiles.length) setTimeout(() => intro.classList.add('assembled'), 250);
    }, delay + FLY);
  });

  // kick off the flight on the next frame so the scattered start state paints first
  requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('go')));

  /* ---- progress ---- */
  window.addEventListener('load', () => { pageLoaded = true; });

  const tick = () => {
    if (leaving) return;
    const elapsed = performance.now() - t0;
    const target = Math.min(100, (locked / tiles.length) * 85 + (pageLoaded ? 15 : 0));
    shown += (target - shown) * 0.12;
    if (target - shown < 0.5) shown = target;
    const v = Math.round(shown);
    bar.style.width = `${v}%`;
    pct.textContent = `${v}%`;
    label.textContent = v >= 100 ? 'SYSTEM READY' : locked < tiles.length ? 'CONNECTING BLOCKS' : 'LOADING ASSETS';

    if ((v >= 100 && elapsed >= MIN_TIME) || elapsed >= MAX_TIME) return leave();
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  function leave() {
    if (leaving) return;
    leaving = true;
    intro.classList.add('assembled', 'leaving');
    setTimeout(done, reduceMotion ? 200 : 900);
  }

  document.getElementById('intro-skip').addEventListener('click', leave);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') leave(); });
})();
