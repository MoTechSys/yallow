/* متجر أبو طارق — Interactions (premium, mobile-first) */
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isDesktop = () => matchMedia('(min-width: 900px)').matches;

  /* ---------- Loader ---------- */
  const loader = $('#loader');
  const hideLoader = () => loader?.classList.add('hide');
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

  /* ---------- Mobile menu ---------- */
  const menuBtn = $('#menuBtn'), menu = $('#menu');
  const setMenu = open => {
    menu.classList.toggle('is-open', open);
    menuBtn.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', open);
    menu.setAttribute('aria-hidden', !open);
    document.body.classList.toggle('menu-open', open);
  };
  menuBtn?.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  addEventListener('keydown', e => e.key === 'Escape' && setMenu(false));

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

  /* ---------- Year ---------- */
  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();
})();
