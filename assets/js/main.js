/* متجر أبو طارق — Interactions */
(function () {
  'use strict';

  /* ---------- Loader ---------- */
  const loader = document.getElementById('loader');
  const hideLoader = () => loader && loader.classList.add('hide');
  window.addEventListener('load', () => setTimeout(hideLoader, 400));
  setTimeout(hideLoader, 3000); // safety

  /* ---------- Navbar ---------- */
  const nav = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const links = document.getElementById('navLinks');

  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  burger.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });
  links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open');
    burger.classList.remove('open');
    document.body.style.overflow = '';
  }));

  /* Active link highlight */
  const sections = [...document.querySelectorAll('section[id]')];
  const navAnchors = [...links.querySelectorAll('a')];
  const spy = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  document.querySelectorAll('.uc-grid .reveal').forEach((el, i) => el.style.setProperty('--i', i));
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  reveals.forEach(el => io.observe(el));

  /* ---------- Counters ---------- */
  const counters = document.querySelectorAll('[data-count]');
  const runCounter = el => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1400;
    const start = performance.now();
    const tick = now => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { runCounter(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counters.forEach(c => cio.observe(c));

  /* ---------- Golden particles ---------- */
  const canvas = document.getElementById('particles');
  if (canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = canvas.getContext('2d');
    let W, H, parts = [];
    const N = window.innerWidth < 700 ? 35 : 70;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    const make = () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(Math.random() * 0.35 + 0.1),
      a: Math.random() * 0.6 + 0.2,
      tw: Math.random() * Math.PI * 2
    });
    resize();
    parts = Array.from({ length: N }, make);
    window.addEventListener('resize', resize);

    const draw = t => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.x += p.vx; p.y += p.vy; p.tw += 0.02;
        if (p.y < -10) { Object.assign(p, make(), { y: H + 10 }); }
        if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
        const alpha = p.a * (0.6 + 0.4 * Math.sin(p.tw));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(243,210,122,${alpha})`;
        ctx.shadowBlur = 8; ctx.shadowColor = 'rgba(217,168,58,.8)';
        ctx.fill();
      }
      requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  }

  /* ---------- Year ---------- */
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  /* ---------- Hero parallax (subtle) ---------- */
  const heroImg = document.querySelector('.hero__bg img');
  if (heroImg && window.innerWidth > 900) {
    window.addEventListener('scroll', () => {
      const s = window.scrollY;
      if (s < window.innerHeight) heroImg.style.transform = `scale(1.05) translateY(${s * 0.18}px)`;
    }, { passive: true });
  }
})();
