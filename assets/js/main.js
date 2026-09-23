/* متجر أبو طارق — Interactions (premium, mobile-first) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => matchMedia('(min-width: 900px)').matches;

  /* ---------- Loader ---------- */
  const loader = $('#loader');
  const hideLoader = () => { loader?.classList.add('hide'); document.body.classList.remove('is-loading'); };
  addEventListener('load', () => setTimeout(hideLoader, 500));
  setTimeout(hideLoader, 3200);

  /* ---------- Header + progress + dock hide ---------- */
  const header = $('#header');
  const progress = $('#progress');
  const dock = $('#dock');
  let lastY = 0, ticking = false;

  const onScroll = () => {
    const y = scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    const h = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    // dock: hide on scroll down, show on scroll up
    if (dock && !isDesktop()) {
      const down = y > lastY && y > 120;
      const nearEnd = y + innerHeight > document.documentElement.scrollHeight - 80;
      dock.classList.toggle('is-hidden', down && !nearEnd);
    }
    lastY = y;
    ticking = false;
  };
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(onScroll); ticking = true; } }, { passive: true });
  onScroll();

  /* ---------- Side drawer ---------- */
  const menuBtn = $('#menuBtn'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open);
    if (navigator.vibrate) navigator.vibrate(8);
  };
  menuBtn?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('[data-close]', menu).forEach(el => el.addEventListener('click', () => setMenu(false)));
  $$('.drawer__nav a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));
  // swipe-to-close (RTL: panel on right, swipe right closes)
  (() => {
    const panel = $('.drawer__panel'); if (!panel) return;
    let sx = 0, sy = 0, dragging = false;
    panel.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; dragging = true; panel.style.transition = 'none'; }, { passive: true });
    panel.addEventListener('touchmove', e => {
      if (!dragging) return;
      const dx = e.touches[0].clientX - sx, dy = e.touches[0].clientY - sy;
      if (Math.abs(dy) > Math.abs(dx)) return;
      if (dx > 0) panel.style.transform = `translateX(${dx}px)`;
    }, { passive: true });
    panel.addEventListener('touchend', e => {
      dragging = false; panel.style.transition = '';
      const dx = e.changedTouches[0].clientX - sx;
      panel.style.transform = '';
      if (dx > 90) setMenu(false);
    });
  })();

  /* ---------- Scroll spy (header nav + dock) ---------- */
  const sections = $$('section[id]');
  const navLinks = $$('.header__nav a');
  const dockItems = $$('.dock__item[data-sec]');
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      navLinks.forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + id));
      // dock mapping: sections group
      const map = { top: 'top', services: 'services', uc: 'uc', policy: 'uc', trust: 'trust', coverage: 'trust', how: 'trust', faq: 'trust', contact: 'trust' };
      const target = map[id];
      if (target) dockItems.forEach(d => d.classList.toggle('is-active', d.dataset.sec === target));
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal ---------- */
  const rv = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); rv.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });
  $$('.rv').forEach(el => rv.observe(el));

  /* ---------- Counters ---------- */
  const count = el => {
    const target = +el.dataset.count, dur = 1300, t0 = performance.now();
    const tick = t => {
      const p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * e);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { count(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.4 });
  $$('[data-count]').forEach(el => cio.observe(el));

  /* ---------- Policy tabs ---------- */
  const tabs = $$('.flow-tab'), panels = $$('.flow'), glider = $('.flow-tabs__glider');
  const setTab = i => {
    tabs.forEach((t, k) => t.classList.toggle('is-active', k === i));
    panels.forEach((p, k) => p.classList.toggle('is-active', k === i));
    // RTL: glider starts at right, moves left
    if (glider) glider.style.transform = `translateX(${-i * 100}%)`;
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => setTab(i)));
  // swipe between tabs on touch
  const flows = $('.flows');
  if (flows) {
    let sx = 0;
    flows.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
    flows.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) < 50) return;
      const cur = tabs.findIndex(t => t.classList.contains('is-active'));
      // RTL: swipe left => next
      const next = dx < 0 ? Math.min(cur + 1, tabs.length - 1) : Math.max(cur - 1, 0);
      setTab(next);
    }, { passive: true });
  }

  /* ---------- Copy number ---------- */
  const toast = $('#toast');
  const showToast = msg => {
    toast.textContent = msg; toast.classList.add('show');
    clearTimeout(toast._t); toast._t = setTimeout(() => toast.classList.remove('show'), 2200);
  };
  $('#copyNum')?.addEventListener('click', async e => {
    const num = e.currentTarget.dataset.num;
    try { await navigator.clipboard.writeText(num); showToast('تم نسخ الرقم ✓'); }
    catch { showToast(num); }
  });

  /* ---------- Card spotlight + tilt (desktop, pointer only) ---------- */
  if (!reduced && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    $$('.card').forEach(card => {
      card.addEventListener('pointermove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        card.style.setProperty('--mx', x + 'px');
        card.style.setProperty('--my', y + 'px');
        if (card.classList.contains('tilt')) {
          const rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;
          card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
        }
      });
      card.addEventListener('pointerleave', () => { card.style.transform = ''; });
    });

    /* magnetic buttons */
    $$('[data-magnetic]').forEach(btn => {
      btn.addEventListener('pointermove', e => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * .18, y = (e.clientY - r.top - r.height / 2) * .28;
        btn.style.transform = `translate(${x}px,${y}px) translateY(-3px)`;
      });
      btn.addEventListener('pointerleave', () => btn.style.transform = '');
    });
  }

  /* ---------- Particles ---------- */
  const canvas = $('#particles');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let W, H, P = [];
    const N = innerWidth < 700 ? 28 : 60;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const resize = () => {
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const mk = () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.4 + .4, vx: (Math.random() - .5) * .2, vy: -(Math.random() * .3 + .08), a: Math.random() * .5 + .2, t: Math.random() * 6.28 });
    resize(); P = Array.from({ length: N }, mk);
    addEventListener('resize', resize);
    let paused = false;
    document.addEventListener('visibilitychange', () => paused = document.hidden);
    const draw = () => {
      if (!paused) {
        ctx.clearRect(0, 0, W, H);
        for (const p of P) {
          p.x += p.vx; p.y += p.vy; p.t += .02;
          if (p.y < -10) Object.assign(p, mk(), { y: H + 10 });
          if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283);
          ctx.fillStyle = `rgba(245,215,138,${p.a * (.6 + .4 * Math.sin(p.t))})`;
          ctx.fill();
        }
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- Hero parallax (desktop) ---------- */
  const heroImg = $('.hero__bg img');
  if (heroImg && !reduced) {
    addEventListener('scroll', () => {
      if (!isDesktop()) return;
      const y = scrollY; if (y < innerHeight) heroImg.style.translate = `0 ${y * .15}px`;
    }, { passive: true });
  }


  /* ---------- Hero title: word-by-word 3D reveal (Arabic-safe) ---------- */
  $$('[data-split]').forEach(el => {
    const words = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    words.forEach((w, i) => {
      const span = document.createElement('span');
      span.className = 'ch'; span.textContent = w;
      span.style.transitionDelay = `${.15 + i * .12}s`;
      el.appendChild(span);
      if (i < words.length - 1) { const sp = document.createElement('span'); sp.className = 'ch sp'; sp.innerHTML = '&nbsp;'; el.appendChild(sp); }
    });
  });

  /* ---------- Live activity feed ---------- */
  const feed = $('#liveFeed');
  if (feed) {
    const names = ['أحمد', 'محمد', 'عبدالله', 'خالد', 'سالم', 'يوسف', 'عمر', 'حسين', 'فهد', 'ماجد', 'علي', 'صالح', 'ياسر', 'هاني', 'وليد'];
    const cities = ['الحديدة', 'المكلا', 'حضرموت', 'صنعاء', 'عدن', 'تعز', 'إب', 'ذمار', 'مأرب', 'سيئون'];
    const acts = [
      { t: 'شحن {uc} شدة', c: 'g', uc: [60, 325, 660, 1800, 3800, 6600] },
      { t: 'اشترى حساب ببجي', c: '' },
      { t: 'باع بدلة إكس', c: 'p' },
      { t: 'شحن {uc} شدة', c: 'g', uc: [3800, 6600, 1800] },
      { t: 'استلم أمواله مباشرة', c: 'p' },
    ];
    const rnd = a => a[Math.floor(Math.random() * a.length)];
    const mk = () => {
      const act = rnd(acts), n = rnd(names), c = rnd(cities);
      const txt = act.t.replace('{uc}', act.uc ? rnd(act.uc) : '');
      const m = Math.floor(Math.random() * 12) + 1;
      const el = document.createElement('div');
      el.className = 'feed-item';
      el.innerHTML = `<span class="feed-item__av ${act.c}">${n[0]}</span><span class="feed-item__txt"><b>${n} من ${c} — ${txt}</b><small>قبل ${m} دقائق • تمّت بنجاح</small></span><span class="feed-item__ok"><svg viewBox="0 0 24 24"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/></svg></span>`;
      return el;
    };
    const ROW = 62, MAX = 4;
    let items = [];
    const layout = () => items.forEach((el, i) => { el.style.transform = `translateY(${i * ROW + 10}px)`; el.style.opacity = i >= MAX ? 0 : 1; });
    for (let i = 0; i < MAX; i++) items.push(mk());
    items.forEach(el => feed.appendChild(el)); layout();
    const push = () => {
      if (document.hidden) return;
      const el = mk(); el.style.transform = 'translateY(-60px)'; el.style.opacity = 0;
      feed.prepend(el); items.unshift(el);
      requestAnimationFrame(() => requestAnimationFrame(layout));
      while (items.length > MAX + 1) { const old = items.pop(); setTimeout(() => old.remove(), 800); }
    };
    setInterval(push, 3800);
  }

  /* ---------- Custom cursor ---------- */
  const cur = $('#cursor');
  if (cur && matchMedia('(hover:hover) and (pointer:fine)').matches && !reduced) {
    let x = 0, y = 0, rx = 0, ry = 0;
    const ring = $('.cursor__ring', cur), dot = $('.cursor__dot', cur);
    addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; dot.style.transform = `translate(${x}px,${y}px)`; }, { passive: true });
    const loop = () => { rx += (x - rx) * .18; ry += (y - ry) * .18; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(loop); };
    loop();
    const hov = 'a,button,summary,.uc,.card,.city';
    document.addEventListener('pointerover', e => cur.classList.toggle('is-hover', !!e.target.closest(hov)));
    addEventListener('pointerdown', () => cur.classList.add('is-down'));
    addEventListener('pointerup', () => cur.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => cur.style.opacity = 0);
    document.addEventListener('mouseenter', () => cur.style.opacity = 1);
  }

  /* ---------- Share ---------- */
  $('#shareBtn')?.addEventListener('click', async () => {
    const data = { title: 'متجر أبو طارق', text: 'متجر أبو طارق لبيع حسابات ببجي موبايل — الاستلام قبل الدفع، ضمان 15 يوماً', url: location.href };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.href); showToast('تم نسخ رابط الموقع ✓'); } }
    catch { }
  });

  /* ---------- Back to top ---------- */
  const toTop = $('#toTop');
  if (toTop) {
    addEventListener('scroll', () => toTop.classList.toggle('show', scrollY > 700), { passive: true });
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Haptics on key taps (mobile) ---------- */
  if (navigator.vibrate) $$('.btn--gold,.dock__item,.uc,.flow-tab').forEach(el => el.addEventListener('touchstart', () => navigator.vibrate(6), { passive: true }));

  /* ---------- PWA ---------- */
  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
  }

  /* ---------- Year ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
