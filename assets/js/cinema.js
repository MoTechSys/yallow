/* متجر أبو طارق — Cinematic Layer
   1) Curtain reveal after loader (split + gold flash)
   2) WhatsApp cinematic transition: ripple from tap → blackout → emblem ring draws → typed text → particle burst → open
   3) Torch reveal: hidden hex-grid in hero revealed only around the pointer/finger
   4) Gold wipe when navigating between sections
*/
(() => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = ms => new Promise(r => setTimeout(r, ms));

  /* ================= 1) CURTAIN ================= */
  const curtain = $('#curtain');
  let curtainOpened = false;
  const openCurtain = () => {
    if (!curtain || curtainOpened) return; curtainOpened = true;
    curtain.classList.add('open');
    setTimeout(() => curtain.remove(), 1600);
  };
  // fires when loader hides (observe class change)
  const loader = $('#loader');
  if (loader && curtain && !reduced) {
    if (loader.classList.contains('hide')) setTimeout(openCurtain, 120);
    else {
      const mo = new MutationObserver(() => { if (loader.classList.contains('hide')) { mo.disconnect(); setTimeout(openCurtain, 120); } });
      mo.observe(loader, { attributes: true, attributeFilter: ['class'] });
    }
    setTimeout(openCurtain, 3600); // safety
  } else curtain?.remove();

  /* ================= 2) WHATSAPP CINEMATIC ================= */
  const cine = $('#cine');
  const ripple = $('#cineRipple');
  const ringPath = $('#cineRing');
  const typed = $('#cineTyped');
  const canvas = $('#cineCanvas');
  const skip = $('#cineSkip');
  let running = false;

  const openWA = href => { const w = window.open(href, '_blank', 'noopener'); if (!w) location.href = href; };

  // Arabic-safe typing: reveal word by word (keeps ligatures intact)
  const typeText = async (el, text, speed = 170) => {
    el.textContent = '';
    const words = text.split(' ');
    for (let i = 0; i < words.length; i++) { el.textContent = words.slice(0, i + 1).join(' '); await wait(speed); }
  };

  const burstParticles = (cx, cy, dur = 1100) => new Promise(res => {
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const N = innerWidth < 700 ? 140 : 260;
    const P = Array.from({ length: N }, () => {
      const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 9;
      return { x: cx, y: cy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, r: 1 + Math.random() * 3, life: 1, hue: Math.random() < .25 ? 140 : 42, spin: Math.random() * 6 };
    });
    const t0 = performance.now();
    const step = now => {
      const p = (now - t0) / dur;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ctx.globalCompositeOperation = 'lighter';
      for (const q of P) {
        q.x += q.vx; q.y += q.vy; q.vy += .18; q.vx *= .985; q.vy *= .985; q.life = 1 - p; q.spin += .2;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.spin);
        ctx.fillStyle = `hsla(${q.hue},90%,${q.hue === 140 ? 55 : 68}%,${q.life})`;
        ctx.shadowBlur = 12; ctx.shadowColor = `hsla(${q.hue},90%,60%,${q.life})`;
        ctx.fillRect(-q.r, -q.r * .35, q.r * 2, q.r * .7);
        ctx.restore();
      }
      if (p < 1) requestAnimationFrame(step); else { ctx.clearRect(0, 0, innerWidth, innerHeight); res(); }
    };
    requestAnimationFrame(step);
  });

  const runCinematic = async (href, x, y) => {
    if (running) return; running = true;
    let skipped = false;
    const onSkip = () => { skipped = true; };
    skip?.addEventListener('click', onSkip, { once: true });
    navigator.vibrate?.([10, 40, 10, 40, 25]);

    // ripple from tap point
    ripple.style.left = x + 'px'; ripple.style.top = y + 'px';
    cine.classList.add('on'); ripple.classList.add('go');
    await wait(520);
    cine.classList.add('dark');
    await wait(260);

    // draw ring + emblem pop
    cine.classList.add('ring');
    await wait(900);
    cine.classList.add('emblem');
    await wait(500);

    // typed text
    if (!skipped) await typeText(typed, 'جارٍ تحويلك إلى المتجر الرسمي …', 190);
    await wait(skipped ? 0 : 300);

    // burst + open
    cine.classList.add('flash');
    navigator.vibrate?.(40);
    const cx = innerWidth / 2, cy = innerHeight / 2 - 40;
    openWA(href);
    await burstParticles(cx, cy, 1000);
    // outro
    cine.classList.add('out');
    await wait(700);
    cine.className = ''; ripple.classList.remove('go'); typed.textContent = '';
    running = false;
  };

  // Intercept all wa.me links (but not inside the drawer during swipe etc.)
  if (cine && !reduced) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href*="wa.me"]');
      if (!a || e.metaKey || e.ctrlKey) return;
      e.preventDefault();
      runCinematic(a.href, e.clientX || innerWidth / 2, e.clientY || innerHeight / 2);
    }, true);
  }

  /* ================= 3) TORCH REVEAL ================= */
  const torch = $('#torch');
  if (torch && !reduced) {
    const hero = $('.hero');
    let tx = -999, ty = -999, cx = -999, cy = -999, active = false, raf;
    const set = () => {
      cx += (tx - cx) * .18; cy += (ty - cy) * .18;
      torch.style.setProperty('--x', cx + 'px'); torch.style.setProperty('--y', cy + 'px');
      if (active) raf = requestAnimationFrame(set);
    };
    const start = () => { if (!active) { active = true; torch.classList.add('on'); set(); } };
    const stop = () => { active = false; cancelAnimationFrame(raf); torch.classList.remove('on'); tx = ty = -999; };
    hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; start(); }, { passive: true });
    hero.addEventListener('pointerleave', stop);
    hero.addEventListener('touchend', () => setTimeout(stop, 900), { passive: true });
  }

  /* ================= 4) SECTION WIPE ================= */
  const wipe = $('#wipe');
  if (wipe && !reduced) {
    document.addEventListener('click', e => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href').slice(1);
      const target = id && document.getElementById(id);
      if (!target || id === 'top') return;
      e.preventDefault();
      wipe.classList.remove('in', 'out'); void wipe.offsetWidth;
      wipe.classList.add('in');
      navigator.vibrate?.(6);
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        history.replaceState(null, '', '#' + id);
        wipe.classList.remove('in'); wipe.classList.add('out');
        setTimeout(() => wipe.classList.remove('out'), 650);
      }, 420);
    });
  }

  /* ================= 5) Emblem burst → screen shake + gold flash ================= */
  document.addEventListener('emblem:burst', () => {
    document.body.classList.remove('shake'); void document.body.offsetWidth; document.body.classList.add('shake');
    const f = $('#goldFlash'); if (f) { f.classList.remove('go'); void f.offsetWidth; f.classList.add('go'); }
    setTimeout(() => document.body.classList.remove('shake'), 500);
  });
})();
