/* Shared interactions: preloader, cursor, nav, typing, reveal, counters, tilt, tag-sphere, contact. */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

  const ICONS = {
    github: '<path fill="currentColor" d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.9 1.2 1.9 1.2 1 1.8 2.8 1.3 3.5 1 0-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-6 0-1.2.5-2.3 1.3-3.1-.2-.4-.6-1.6 0-3.2 0 0 1-.3 3.4 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8 0 3.2.9.8 1.3 1.9 1.3 3.1 0 4.6-2.8 5.6-5.5 5.9.5.4.9 1.1.9 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3"/>',
    linkedin: '<path fill="currentColor" d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.6V9h3.5v11.5zM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0z"/>',
    mail: '<g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="m22 7-10 6L2 7"/></g>',
    phone: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    download: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
    arrow: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="M7 17 17 7M8 7h9v9"/>',
    up: '<path fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" d="m6 15 6-6 6 6"/>',
    send: '<path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/>',
    pin: '<g fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></g>'
  };
  const sprite = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  sprite.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  sprite.setAttribute('aria-hidden', 'true');
  sprite.innerHTML = Object.entries(ICONS).map(([k, v]) => `<symbol id="i-${k}" viewBox="0 0 24 24">${v}</symbol>`).join('') +
    '<defs><linearGradient id="ringGrad" x1="0" x2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent2)"/></linearGradient></defs>';
  document.body.prepend(sprite);

  /* Preloader */
  const hideLoader = () => $('#preloader')?.classList.add('done');
  addEventListener('load', () => setTimeout(hideLoader, 300));
  setTimeout(hideLoader, 1800);

  /* Split hero name into animated letters (grouped per word so lines never break mid-word) */
  $$('.split').forEach(el => {
    const txt = el.textContent.trim(), n = txt.replace(/\s/g, '').length; let k = 0;
    el.textContent = ''; el.setAttribute('aria-label', txt);
    txt.split(/\s+/).forEach((word, wi) => {
      if (wi) el.appendChild(document.createTextNode(' '));
      const w = document.createElement('span'); w.className = 'word'; w.setAttribute('aria-hidden', 'true');
      [...word].forEach(ch => {
        const s = document.createElement('span'); s.className = 'ch'; s.textContent = ch;
        s.style.animationDelay = `${0.6 + k * 0.045}s`;
        s.style.backgroundSize = `${n * 100}% 100%`;
        s.style.backgroundPosition = `${n > 1 ? (k / (n - 1)) * 100 : 0}% 0`;
        w.appendChild(s); k++;
      });
      el.appendChild(w);
    });
  });

  /* Cursor */
  if (fine && !reduce) {
    const dot = Object.assign(document.createElement('div'), { className: 'cursor-dot' });
    const ring = Object.assign(document.createElement('div'), { className: 'cursor-ring' });
    document.body.append(dot, ring);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px)`; }, { passive: true });
    (function follow() { rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16; ring.style.transform = `translate(${rx}px,${ry}px)`; requestAnimationFrame(follow); })();
    document.addEventListener('pointerover', e => ring.classList.toggle('hover', !!e.target.closest('a,button,.flip,.tilt,input,textarea')));
  }

  /* Scroll: progress, nav, to-top, timeline beam */
  const progress = $('#progress'), nav = $('.nav'), toTop = $('.to-top'), tl = $('.timeline'), beam = $('.timeline .beam');
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = `${(scrollY / (max || 1)) * 100}%`;
    nav?.classList.toggle('scrolled', scrollY > 40);
    toTop?.classList.toggle('show', scrollY > 700);
    if (tl && beam) {
      const r = tl.getBoundingClientRect();
      const pct = Math.min(1, Math.max(0, (innerHeight * 0.6 - r.top) / r.height));
      beam.style.setProperty('--beam', `${pct * 100}%`);
    }
  };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop?.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* Mobile menu */
  const burger = $('.burger'), links = $('.nav-links');
  burger?.addEventListener('click', () => {
    const open = links.classList.toggle('open'); burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open); document.body.style.overflow = open ? 'hidden' : '';
  });
  $$('.nav-links a').forEach(a => a.addEventListener('click', () => {
    links.classList.remove('open'); burger?.classList.remove('open'); burger?.setAttribute('aria-expanded', 'false'); document.body.style.overflow = '';
  }));

  /* Active nav link */
  const navMap = new Map($$('.nav-links a[href^="#"]').map(a => [a.getAttribute('href').slice(1), a]));
  const secObs = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { navMap.forEach(a => a.classList.remove('active')); navMap.get(e.target.id)?.classList.add('active'); }
  }), { rootMargin: '-45% 0px -50% 0px' });
  navMap.forEach((_, id) => { const s = document.getElementById(id); s && secObs.observe(s); });

  /* Typing */
  $$('[data-typed]').forEach(el => {
    const words = JSON.parse(el.dataset.typed); const out = el.querySelector('.typed') || el;
    if (reduce) { out.textContent = words[0]; return; }
    let w = 0, i = 0, del = false;
    (function tick() {
      const word = words[w]; out.textContent = word.slice(0, i);
      if (!del && i === word.length) { del = true; return setTimeout(tick, 1700); }
      if (del && i === 0) { del = false; w = (w + 1) % words.length; }
      i += del ? -1 : 1; setTimeout(tick, del ? 32 : 70);
    })();
  });

  /* Counters */
  const animateCount = el => {
    const end = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || '', pre = el.dataset.prefix || '';
    if (reduce) { el.textContent = pre + end.toFixed(dec) + suf; return; }
    const t0 = performance.now(), dur = 1900;
    (function step(t) {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = pre + (end * e).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(t0);
  };

  /* Reveal + one-shot animations */
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('in'); setTimeout(() => el.classList.add('revealed'), 1300);
    $$('[data-count]', el).concat(el.matches('[data-count]') ? [el] : []).forEach(c => { if (!c.dataset.done) { c.dataset.done = 1; animateCount(c); } });
    $$('.bar i[data-w]', el).forEach(b => b.style.width = b.dataset.w);
    $$('.ring .val[data-p]', el).forEach(r => r.style.strokeDashoffset = 302 - 302 * (+r.dataset.p));
    io.unobserve(el);
  }), { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('[data-reveal], [data-count], .bars, .code-grid').forEach(el => io.observe(el));

  /* 3D tilt */
  if (fine && !reduce) {
    $$('[data-tilt]').forEach(el => {
      const max = +(el.dataset.tilt || 12);
      if (!el.querySelector('.glare')) el.insertAdjacentHTML('beforeend', '<span class="glare"></span>');
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        el.style.transform = `perspective(1000px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) scale3d(1.02,1.02,1.02)`;
        el.style.setProperty('--gx', `${x * 100}%`); el.style.setProperty('--gy', `${y * 100}%`);
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
    $$('[data-magnetic]').forEach(el => {
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
      });
      el.addEventListener('pointerleave', () => { el.style.transform = ''; });
    });
  }

  /* Tap to flip on touch devices */
  $$('.flip').forEach(f => {
    f.setAttribute('tabindex', '0');
    f.addEventListener('click', () => { if (!fine) f.classList.toggle('flipped'); });
  });

  /* Collapsible "show more" */
  $$('.more-toggle').forEach(btn => btn.addEventListener('click', () => {
    const c = document.getElementById(btn.getAttribute('aria-controls'));
    const open = c.classList.toggle('open'); btn.setAttribute('aria-expanded', open);
    btn.textContent = open ? '− show less' : btn.dataset.label;
  }));

  /* 3D tag sphere (Fibonacci distribution, drag / hover to steer) */
  $$('.sphere[data-tags]').forEach(el => {
    const tags = el.dataset.tags.split(',').map(s => s.trim()).filter(Boolean), N = tags.length;
    const items = tags.map((t, i) => {
      const s = document.createElement('span'); s.textContent = t; el.appendChild(s);
      const phi = Math.acos(-1 + (2 * i + 1) / N), th = Math.sqrt(N * Math.PI) * phi;
      return { s, x: Math.cos(th) * Math.sin(phi), y: Math.sin(th) * Math.sin(phi), z: Math.cos(phi) };
    });
    let R = 0, vx = 0.004, vy = 0.006, tvx = vx, tvy = vy, visible = false, dragging = false, lx = 0, ly = 0;
    const size = () => { R = el.clientWidth * 0.4; }; size(); addEventListener('resize', size);
    new IntersectionObserver(([e]) => visible = e.isIntersecting).observe(el);
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      if (dragging) { tvy = (e.clientX - lx) * 0.002; tvx = -(e.clientY - ly) * 0.002; lx = e.clientX; ly = e.clientY; return; }
      if (fine) { tvy = ((e.clientX - r.left) / r.width - 0.5) * 0.03; tvx = -((e.clientY - r.top) / r.height - 0.5) * 0.03; }
    });
    el.addEventListener('pointerdown', e => { dragging = true; lx = e.clientX; ly = e.clientY; el.style.cursor = 'grabbing'; });
    addEventListener('pointerup', () => { dragging = false; el.style.cursor = ''; });
    el.addEventListener('pointerleave', () => { if (!dragging) { tvx = 0.004; tvy = 0.006; } });
    (function spin() {
      if (visible || !R) {
        vx += (tvx - vx) * 0.05; vy += (tvy - vy) * 0.05;
        const ax = reduce ? 0 : vx, ay = reduce ? 0 : vy;
        const cx = Math.cos(ax), sx = Math.sin(ax), cy = Math.cos(ay), sy = Math.sin(ay);
        items.forEach(p => {
          const y1 = p.y * cx - p.z * sx, z1 = p.y * sx + p.z * cx;
          const x2 = p.x * cy + z1 * sy, z2 = -p.x * sy + z1 * cy;
          p.x = x2; p.y = y1; p.z = z2;
          const sc = (p.z + 2) / 3;
          p.s.style.transform = `translate(-50%,-50%) translate3d(${p.x * R}px,${p.y * R}px,0) scale(${sc})`;
          p.s.style.opacity = 0.25 + 0.75 * ((p.z + 1) / 2);
          p.s.style.zIndex = Math.round(p.z * 100) + 100;
        });
      }
      requestAnimationFrame(spin);
    })();
  });

  /* Toast + copy helpers */
  const toast = msg => {
    let t = $('.toast'); if (!t) { t = Object.assign(document.createElement('div'), { className: 'toast' }); document.body.appendChild(t); }
    t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400);
  };
  $$('[data-copy]').forEach(el => el.addEventListener('click', e => {
    if (!navigator.clipboard) return;
    if (fine) { e.preventDefault(); navigator.clipboard.writeText(el.dataset.copy).then(() => toast(`Copied: ${el.dataset.copy}`)); }
  }));

  /* Contact form → mail client */
  $('#contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target, name = f.name.value.trim(), email = f.email.value.trim(), subject = f.subject.value.trim(), msg = f.message.value.trim();
    const body = `${msg}\n\n— ${name}${email ? ` (${email})` : ''}`;
    location.href = `mailto:anubhuv007@gmail.com?subject=${encodeURIComponent(subject || `Hello from ${name}`)}&body=${encodeURIComponent(body)}`;
    toast('Opening your mail app…');
  });

  $$('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
})();
