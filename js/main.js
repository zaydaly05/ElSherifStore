(() => {
  'use strict';

  const DATA = window.ES_DATA;
  if (!DATA) return;
  const { store, products, categories, tiers, personas, gallery } = DATA;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const icon = (name, cls = 'i') => `<svg class="${cls}" aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const waUrl = (num, text) => `https://wa.me/${num}${text ? `?text=${encodeURIComponent(text)}` : ''}`;

  const MSG = {
    store: 'أهلاً El Sherif Store، عايز أستفسر عن الاشتراكات المتاحة.',
    founder: 'أهلاً أستاذ محمد، محتاج استشارة تساعدني أختار الاشتراك المناسب ليا.',
    product: (name) => `أهلاً El Sherif Store، عايز أستفسر عن اشتراك ${name}.`,
    consult: (name) => `أهلاً أستاذ محمد، محتاج استشارة بخصوص اشتراك ${name}.`,
  };
  const storeWa = (text = MSG.store) => waUrl(store.whatsapp.wa, text);
  const founderWa = (text = MSG.founder) => waUrl(store.founder.wa, text);

  /* ---------- WhatsApp links ---------- */
  function wireWhatsApp(root = document) {
    $$('[data-wa]', root).forEach((a) => {
      const who = a.dataset.wa;
      const text = a.dataset.msg;
      a.href = who === 'founder' ? founderWa(text || MSG.founder) : storeWa(text || MSG.store);
      a.target = '_blank';
      a.rel = 'noopener';
    });
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $('#nav');
    const toggle = $('#nav-toggle');
    const links = $('#nav-links');

    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const setOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
    };
    toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    document.addEventListener('click', (e) => {
      if (links.classList.contains('open') && !e.target.closest('#nav')) setOpen(false);
    });

    // highlight the section currently on screen
    if (!('IntersectionObserver' in window)) return;
    const navLinks = $$('a[href^="#"]', links);
    const sections = navLinks.map((a) => $(a.getAttribute('href'))).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ---------- Hero typing ---------- */
  function initTyping() {
    const el = $('#typed');
    if (!el) return;
    const words = ['ChatGPT Plus', 'Gemini Pro', 'Claude Pro', 'Perplexity Pro', 'SuperGrok', 'CapCut Pro', 'Canva Pro', 'ElevenLabs', 'LinkedIn Premium'];
    let w = 0;

    if (reduceMotion) {
      setInterval(() => { w = (w + 1) % words.length; el.textContent = words[w]; }, 2400);
      return;
    }

    let i = words[0].length;
    let deleting = true;
    const tick = () => {
      const word = words[w];
      if (deleting) {
        i--;
        el.textContent = word.slice(0, i);
        if (i <= 0) { deleting = false; w = (w + 1) % words.length; return setTimeout(tick, 280); }
        return setTimeout(tick, 38);
      }
      i++;
      el.textContent = word.slice(0, i);
      if (i >= word.length) { deleting = true; return setTimeout(tick, 1700); }
      return setTimeout(tick, 80);
    };
    setTimeout(tick, 1800);
  }

  /* ---------- Hero network canvas ---------- */
  function initNetwork() {
    const canvas = $('#net');
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const colors = ['0,240,255', '139,92,246', '255,43,214'];
    const LINK = 130;
    let w = 0, h = 0, pts = [], raf = 0, visible = true;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      w = rect.width; h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(90, Math.max(28, (w * h) / 15000)));
      pts = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.6 + 0.7,
        c: colors[(Math.random() * colors.length) | 0],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      for (const p of pts) {
        if (!reduceMotion) {
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > w) p.vx *= -1;
          if (p.y < 0 || p.y > h) p.vy *= -1;
        }
      }
      for (let a = 0; a < pts.length; a++) {
        const p = pts[a];
        for (let b = a + 1; b < pts.length; b++) {
          const q = pts[b];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(${p.c},${(1 - d / LINK) * 0.32})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        const md = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        if (md < 170) {
          ctx.strokeStyle = `rgba(0,240,255,${(1 - md / 170) * 0.6})`;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (const p of pts) {
        ctx.fillStyle = `rgba(${p.c},0.15)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${p.c},0.95)`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = () => {
      draw();
      if (visible && !reduceMotion) raf = requestAnimationFrame(loop);
    };

    resize();
    loop();

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => { resize(); if (reduceMotion) draw(); }, 150);
    });

    const hero = canvas.parentElement;
    hero.addEventListener('pointermove', (e) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });

    if ('IntersectionObserver' in window && !reduceMotion) {
      new IntersectionObserver(([entry]) => {
        const was = visible;
        visible = entry.isIntersecting;
        if (visible && !was) { cancelAnimationFrame(raf); loop(); }
      }).observe(hero);
    }
  }

  /* ---------- Ticker ---------- */
  function initTicker() {
    const track = $('#ticker');
    if (!track) return;
    const names = ['ChatGPT', 'Gemini Pro', 'Claude', 'Perplexity Pro', 'SuperGrok', 'CapCut Pro', 'Canva Pro', 'ElevenLabs', 'LinkedIn Premium', 'Veo 3.1', 'NotebookLM', 'Claude Code', 'Deep Research', 'Nano Banana Pro'];
    const row = names.map((n) => `<span>${esc(n)}</span>`).join('');
    track.innerHTML = row + row;
  }

  /* ---------- Products ---------- */
  function productCard(p) {
    return `
      <article class="p-card reveal" style="--c:${p.color}" data-id="${p.id}" data-cats="${p.cats.join(' ')}"
        tabindex="0" role="button" aria-label="تفاصيل اشتراك ${esc(p.name)}">
        <div class="p-top">
          <span class="mono" aria-hidden="true">${esc(p.mono)}</span>
          <div class="plan-chips">${p.plans.map((pl) => `<span class="plan-chip">${esc(pl)}</span>`).join('')}</div>
        </div>
        <h3><bdi>${esc(p.name)}</bdi></h3>
        <p class="p-tag">${esc(p.tagline)}</p>
        <ul class="p-hl">${p.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
        <div class="p-actions">
          <span class="p-more">كل المميزات ${icon('arrow')}</span>
          <a class="p-wa" href="${storeWa(MSG.product(p.name))}" target="_blank" rel="noopener"
            aria-label="اطلب ${esc(p.name)} على واتساب">${icon('whatsapp')}</a>
        </div>
      </article>`;
  }

  function initProducts() {
    const grid = $('#products');
    const filters = $('#filters');
    if (!grid) return;

    grid.innerHTML = products.map(productCard).join('');

    filters.innerHTML = categories
      .map((c, i) => `<button type="button" class="chip-btn" data-filter="${c.id}" aria-pressed="${i === 0}">${esc(c.label)}</button>`)
      .join('');

    filters.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-filter]');
      if (!btn) return;
      const f = btn.dataset.filter;
      $$('[data-filter]', filters).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      $$('.p-card', grid).forEach((card) => {
        const show = f === 'all' || card.dataset.cats.split(' ').includes(f);
        card.classList.toggle('is-hidden', !show);
        if (show) card.classList.add('in');
      });
    });

    grid.addEventListener('click', (e) => {
      if (e.target.closest('.p-wa')) return;
      const card = e.target.closest('.p-card');
      if (card) openProduct(card.dataset.id);
    });
    grid.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.p-card');
      if (!card || e.target !== card) return;
      e.preventDefault();
      openProduct(card.dataset.id);
    });

    const foot = $('#footer-products');
    if (foot) {
      foot.innerHTML = products
        .map((p) => `<li><a href="#${p.id}" data-product="${p.id}"><bdi>${esc(p.name)}</bdi></a></li>`)
        .join('');
    }
  }

  /* ---------- Product modal ---------- */
  const modal = $('#product-modal');
  let lastFocus = null;

  function checks(items) {
    return `<ul class="checks">${items.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;
  }

  function renderProduct(p) {
    const tierSet = p.tiers && tiers[p.tiers];
    return `
      <header class="pm-head">
        <span class="mono lg" aria-hidden="true">${esc(p.mono)}</span>
        <div>
          <p class="kicker" dir="ltr">// SUBSCRIPTION</p>
          <h2 id="pm-title"><bdi>${esc(p.name)}</bdi></h2>
          <p class="pm-tag">${esc(p.tagline)}</p>
        </div>
      </header>

      <div class="pm-plans">
        <span>${p.plans.length > 1 ? 'الباقات / المدد المتاحة:' : 'مدة الاشتراك:'}</span>
        ${p.plans.map((pl) => `<span class="plan-chip">${esc(pl)}</span>`).join('')}
      </div>

      <div class="pm-groups">
        ${p.groups
          .map((g) => `
          <section class="pm-group">
            <h3>${icon(g.icon)}<span>${esc(g.title)}</span></h3>
            ${checks(g.items)}
          </section>`)
          .join('')}
      </div>

      ${tierSet
        ? `<h3 class="pm-section-title">الفرق بين الباقات</h3>
           <div class="pm-tiers">
             ${tierSet.plans
               .map((t) => `
               <div class="pm-tier" style="--c:${t.color}">
                 <b>${esc(t.name)}</b>
                 <span>${esc(t.tag)}</span>
                 <p>${esc(t.summary)} مناسب لـ: ${esc(t.forWho)}</p>
               </div>`)
               .join('')}
           </div>`
        : ''}

      <div class="pm-perks">
        <h3 class="pm-section-title">من <bdi>El Sherif Store</bdi></h3>
        ${checks(p.perks)}
      </div>

      ${p.audience ? `<p class="pm-aud"><b>مناسب لمين؟</b> ${esc(p.audience)}</p>` : ''}

      <p class="fine-note pm-note">${icon('info')}<span>${esc(p.note)}</span></p>

      <div class="pm-cta">
        <a class="btn btn-primary" href="${storeWa(MSG.product(p.name))}" target="_blank" rel="noopener">
          ${icon('whatsapp')} اطلب <bdi>${esc(p.name)}</bdi> الآن
        </a>
        <a class="btn btn-ghost" href="${founderWa(MSG.consult(p.name))}" target="_blank" rel="noopener">
          ${icon('chat')} استشارة مع محمد الشريف
        </a>
      </div>`;
  }

  function openProduct(id) {
    const p = byId[id];
    if (!p || !modal) return;
    lastFocus = document.activeElement;
    modal.style.setProperty('--c', p.color);
    $('#pm-body').innerHTML = renderProduct(p);
    $('#pm-body').scrollTop = 0;
    if (typeof modal.showModal === 'function') modal.showModal();
    else modal.setAttribute('open', '');
    document.documentElement.classList.add('modal-open');
    if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`);
  }

  function initModal() {
    if (!modal) return;
    const close = () => (typeof modal.close === 'function' ? modal.close() : modal.removeAttribute('open'));
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.closest('[data-close]')) close();
    });
    modal.addEventListener('close', () => {
      document.documentElement.classList.remove('modal-open');
      if (byId[location.hash.slice(1)]) history.replaceState(null, '', location.pathname + location.search);
      if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
    });

    // any link/button with data-product opens that product
    document.addEventListener('click', (e) => {
      const el = e.target.closest('[data-product]');
      if (!el) return;
      e.preventDefault();
      openProduct(el.dataset.product);
    });

    // deep links: example.com/#claude opens the Claude details
    const fromHash = () => { const id = location.hash.slice(1); if (byId[id]) openProduct(id); };
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ---------- Compare ---------- */
  function initCompare() {
    const tabs = $('#compare-tabs');
    const grid = $('#tiers');
    if (!tabs || !grid) return;
    const keys = Object.keys(tiers);

    tabs.innerHTML = keys
      .map((k, i) => `<button type="button" class="chip-btn" role="tab" data-tier="${k}" aria-selected="${i === 0}"><bdi>${esc(tiers[k].label)}</bdi></button>`)
      .join('');

    const render = (key) => {
      const set = tiers[key];
      $('#compare-intro').textContent = set.intro;
      grid.style.setProperty('--cols', set.plans.length);
      grid.innerHTML = set.plans
        .map((t) => `
        <article class="tier" style="--c:${t.color}">
          <div class="tier-name">${esc(t.name)}</div>
          <div><span class="tier-tag">${esc(t.tag)}</span></div>
          <p class="tier-sum">${esc(t.summary)}</p>
          ${checks(t.items)}
          <div class="tier-for"><b>مناسب لمين؟</b><p>${esc(t.forWho)}</p></div>
          <a class="btn btn-outline" href="${storeWa(MSG.product(t.name.startsWith(set.label) ? t.name : `${set.label} ${t.name}`))}" target="_blank" rel="noopener">
            ${icon('whatsapp')} اسأل عن <bdi>${esc(t.name)}</bdi>
          </a>
        </article>`)
        .join('');
      $('#tiers-note').innerHTML = `${icon('info')}<span>${esc(set.note)}</span>`;
    };

    tabs.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-tier]');
      if (!btn) return;
      $$('[data-tier]', tabs).forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      render(btn.dataset.tier);
    });
    render(keys[0]);
  }

  /* ---------- Guide (personas) ---------- */
  function initGuide() {
    const list = $('#personas');
    const panel = $('#guide-panel');
    if (!list || !panel) return;

    list.innerHTML = personas
      .map((p, i) => `<button type="button" class="persona" role="tab" data-persona="${p.id}" aria-selected="${i === 0}">${icon(p.icon)}<span>${esc(p.label)}</span></button>`)
      .join('');

    const render = (id) => {
      const persona = personas.find((p) => p.id === id);
      panel.innerHTML = `
        <div class="guide-head"><h3>لو أنت ${esc(persona.label)}</h3></div>
        <p class="guide-term">&gt; recommend --for ${esc(persona.id)} <span>✓ ${persona.picks.length} matches</span></p>
        <p class="guide-text">${esc(persona.text)}</p>
        <div class="picks">
          ${persona.picks
            .map((pid) => byId[pid])
            .filter(Boolean)
            .map((p) => `
            <button type="button" class="pick" style="--c:${p.color}" data-product="${p.id}">
              <span class="mono" aria-hidden="true">${esc(p.mono)}</span>
              <span><b><bdi>${esc(p.name)}</bdi></b><small>${esc(p.highlights.slice(0, 2).join(' · '))}</small></span>
            </button>`)
            .join('')}
        </div>
        <div class="guide-cta">
          <p>لسه محتار؟ محمد الشريف هيساعدك تختار — من غير أي تكلفة.</p>
          <a class="btn btn-ghost btn-sm" href="${founderWa(`أهلاً أستاذ محمد، أنا ${persona.label} ومحتاج استشارة أختار أنهي أداة AI.`)}" target="_blank" rel="noopener">
            ${icon('chat')} استشارة مجانية
          </a>
        </div>`;
    };

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-persona]');
      if (!btn) return;
      $$('[data-persona]', list).forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      render(btn.dataset.persona);
    });
    render(personas[0].id);
  }

  /* ---------- Reviews: 3D carousel + full grid ---------- */
  function initGallery() {
    const section = $('#gallery');
    const grid = $('#gallery-grid');
    const lb = $('#lightbox');
    if (!section || !grid || !gallery || !gallery.length) return;

    section.hidden = false;
    const total = gallery.length;
    const pad = (n) => String(n).padStart(2, '0');
    const count = $('#reviews-count');
    if (count) count.textContent = `+${total}`;

    /* lightbox (shared by carousel and grid) */
    let current = 0;
    const show = (i) => {
      current = (i + total) % total;
      const g = gallery[current];
      $('#lb-img').src = g.src;
      $('#lb-img').alt = g.alt || '';
      $('#lb-cap').textContent = `${pad(current + 1)} / ${total}`;
    };
    const openLightbox = (i) => {
      show(i);
      lb.showModal();
      document.documentElement.classList.add('modal-open');
    };
    lb.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));
    lb.addEventListener('click', (e) => {
      if (e.target === lb || e.target.closest('[data-close]')) lb.close();
    });
    $('.lb-prev', lb).addEventListener('click', () => show(current - 1));
    $('.lb-next', lb).addEventListener('click', () => show(current + 1));
    lb.addEventListener('keydown', (e) => {
      // RTL: right arrow goes back, left arrow goes forward
      if (e.key === 'ArrowRight') show(current - 1);
      if (e.key === 'ArrowLeft') show(current + 1);
    });

    initReviewCarousel(openLightbox);

    /* full grid, revealed on demand */
    const all = $('#gallery-all');
    const allBtn = $('#gallery-all-btn');
    const FIRST = window.matchMedia('(max-width: 640px)').matches ? 6 : 12;
    let gridBuilt = false;
    const buildGrid = () => {
      grid.innerHTML = gallery
        .map((g, i) => `<button type="button" class="g-item${i >= FIRST ? ' is-hidden' : ''}" data-index="${i}" aria-label="${esc(g.alt || 'عرض الصورة')}">
            <img src="${esc(g.src)}" alt="${esc(g.alt || '')}"${g.w ? ` width="${g.w}" height="${g.h}"` : ''} loading="lazy">
          </button>`)
        .join('');
      const more = $('#gallery-more');
      const moreBtn = $('#gallery-more-btn');
      if (more && moreBtn && total > FIRST) {
        more.hidden = false;
        moreBtn.addEventListener('click', () => {
          const hidden = $$('.g-item.is-hidden', grid);
          hidden.slice(0, FIRST).forEach((el) => el.classList.remove('is-hidden'));
          if (hidden.length <= FIRST) more.hidden = true;
        });
      }
      gridBuilt = true;
    };
    if (all && allBtn) {
      allBtn.addEventListener('click', () => {
        if (!gridBuilt) buildGrid();
        const open = all.hidden;
        all.hidden = !open;
        allBtn.setAttribute('aria-expanded', String(open));
        allBtn.querySelector('span').textContent = open ? 'إخفاء كل الآراء' : 'عرض كل الآراء';
        if (open) all.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }
    grid.addEventListener('click', (e) => {
      const item = e.target.closest('.g-item');
      if (item) openLightbox(Number(item.dataset.index));
    });
  }

  function initReviewCarousel(openLightbox) {
    const root = $('#rv');
    const stage = $('#rv-stage');
    if (!root || !stage) return;

    const total = gallery.length;
    const pad = (n) => String(n).padStart(2, '0');
    const DELAY = 4000;
    const mobile = window.matchMedia('(max-width: 640px)');
    let active = 0;
    let timer = 0;
    let userPaused = reduceMotion;
    let hoverPaused = false;
    let inView = false;

    stage.innerHTML = gallery
      .map((g, i) => `
        <button type="button" class="rv-card" data-i="${i}" tabindex="-1" aria-label="رأي عميل ${i + 1} من ${total}">
          <span class="rv-head">
            <span class="rv-dots" aria-hidden="true"><i></i><i></i><i></i></span>
            <span class="rv-verified">${icon('check')} عميل حقيقي</span>
            <span class="rv-num" dir="ltr">#${pad(i + 1)}</span>
          </span>
          <span class="rv-shot"><img data-src="${esc(g.src)}" alt="${esc(g.alt || '')}"></span>
          <span class="rv-foot"><span class="rv-stars" aria-hidden="true">★★★★★</span><bdi>El Sherif Store</bdi></span>
          <span class="rv-glare" aria-hidden="true"></span>
        </button>`)
      .join('');
    const cards = $$('.rv-card', stage);
    $('#rv-total').textContent = pad(total);
    root.style.setProperty('--rv-delay', `${DELAY}ms`);

    // shortest signed distance from the active card, wrapping around the ring
    const offset = (i) => {
      let d = (i - active) % total;
      if (d > total / 2) d -= total;
      if (d < -total / 2) d += total;
      return d;
    };

    const layout = () => {
      const cw = parseFloat(getComputedStyle(root).getPropertyValue('--cw')) || 330;
      const gap = parseFloat(getComputedStyle(root).getPropertyValue('--gap')) || 0.56;
      const visible = mobile.matches ? 2 : 3;
      cards.forEach((card, i) => {
        const d = offset(i);
        const ad = Math.abs(d);
        // RTL: the next reviews sit to the left
        card.style.setProperty('--tx', `${-d * cw * gap}px`);
        card.style.setProperty('--tz', `${-ad * 160}px`);
        card.style.setProperty('--ry', `${Math.max(-50, Math.min(50, d * 32))}deg`);
        card.style.setProperty('--s', ad ? String(1 - Math.min(ad, 3) * 0.06) : '1');
        card.style.setProperty('--o', ad > visible ? '0' : String(1 - ad * 0.12));
        card.style.zIndex = String(100 - ad);
        card.classList.toggle('is-active', d === 0);
        card.classList.toggle('is-far', ad > visible);
        card.setAttribute('aria-hidden', String(d !== 0));
        if (ad <= visible + 1) {
          const img = card.querySelector('img');
          if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
        }
      });
      $('#rv-cur').textContent = pad(active + 1);
    };

    const restartProgress = () => {
      const bar = $('#rv-bar');
      bar.classList.remove('run');
      void bar.offsetWidth;
      if (!userPaused) bar.classList.add('run');
    };

    let wasRunning = false;
    const schedule = () => {
      clearTimeout(timer);
      const running = !userPaused && !hoverPaused && inView && !document.hidden;
      // resuming starts a fresh countdown, so the progress bar restarts with it
      if (running && !wasRunning) restartProgress();
      wasRunning = running;
      root.classList.toggle('is-paused', !running);
      if (running) timer = setTimeout(() => go(active + 1), DELAY);
    };

    const go = (i) => {
      active = ((i % total) + total) % total;
      layout();
      restartProgress();
      schedule();
    };

    $('#rv-next').addEventListener('click', () => go(active + 1));
    $('#rv-prev').addEventListener('click', () => go(active - 1));

    const playBtn = $('#rv-play');
    const syncPlay = () => {
      playBtn.setAttribute('aria-pressed', String(userPaused));
      playBtn.setAttribute('aria-label', userPaused ? 'تشغيل العرض التلقائي' : 'إيقاف العرض التلقائي');
      playBtn.querySelector('use').setAttribute('href', userPaused ? '#i-play' : '#i-pause');
    };
    playBtn.addEventListener('click', () => {
      userPaused = !userPaused;
      syncPlay();
      restartProgress();
      schedule();
    });
    syncPlay();

    // click: side card comes forward, front card opens full size
    let dragged = false;
    stage.addEventListener('click', (e) => {
      const card = e.target.closest('.rv-card');
      if (!card || dragged) return;
      const i = Number(card.dataset.i);
      if (i === active) openLightbox(i);
      else go(i);
    });

    stage.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(active + 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); go(active - 1); }
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLightbox(active); }
    });

    // swipe / drag (RTL: dragging to the right pulls the next card in)
    let startX = null;
    stage.addEventListener('pointerdown', (e) => { startX = e.clientX; dragged = false; });
    stage.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) {
        dragged = true;
        go(active + (dx > 0 ? 1 : -1));
        setTimeout(() => { dragged = false; }, 0);
      }
    });
    stage.addEventListener('pointercancel', () => { startX = null; });

    // 3D tilt + glare on the front card, following the pointer
    if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
      stage.addEventListener('pointermove', (e) => {
        const card = cards[active];
        const r = card.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) return resetTilt();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.classList.add('tilting');
        card.style.setProperty('--tilty', `${(px - 0.5) * 18}deg`);
        card.style.setProperty('--tiltx', `${(0.5 - py) * 14}deg`);
        card.style.setProperty('--mx', `${px * 100}%`);
        card.style.setProperty('--my', `${py * 100}%`);
      });
    }
    const resetTilt = () => {
      cards.forEach((c) => {
        if (!c.classList.contains('tilting')) return;
        c.classList.remove('tilting');
        c.style.setProperty('--tilty', '0deg');
        c.style.setProperty('--tiltx', '0deg');
      });
    };
    stage.addEventListener('pointerleave', resetTilt);

    // pause while hovered/focused, off-screen or in a background tab
    root.addEventListener('mouseenter', () => { hoverPaused = true; schedule(); });
    root.addEventListener('mouseleave', () => { hoverPaused = false; schedule(); });
    root.addEventListener('focusin', () => { hoverPaused = true; schedule(); });
    root.addEventListener('focusout', (e) => { if (!root.contains(e.relatedTarget)) { hoverPaused = false; schedule(); } });
    document.addEventListener('visibilitychange', schedule);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; schedule(); }, { threshold: 0.3 }).observe(root);
    } else {
      inView = true;
    }
    mobile.addEventListener('change', layout);
    window.addEventListener('resize', layout);

    go(0);
  }

  /* ---------- Founder photo fallback ---------- */
  function initFounderPhoto() {
    const img = $('#founder-img');
    if (!img) return;
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener('error', drop);
  }

  /* ---------- Counters ---------- */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const dur = 1400;
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur);
          el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
          if (t < 1) requestAnimationFrame(step);
        };
        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ---------- Reveal on scroll ---------- */
  function initReveal() {
    const els = $$('.reveal:not(.in)');
    if (!('IntersectionObserver' in window) || reduceMotion) {
      els.forEach((el) => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach((el, i) => {
      // small stagger for siblings in the same grid
      el.style.transitionDelay = `${(i % 3) * 70}ms`;
      io.observe(el);
    });
  }

  /* ---------- Boot ---------- */
  initProducts();
  initCompare();
  initGuide();
  initGallery();
  initTicker();
  wireWhatsApp();
  initNav();
  initModal();
  initTyping();
  initNetwork();
  initFounderPhoto();
  initCounters();
  initReveal();

  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
