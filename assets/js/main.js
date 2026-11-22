(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Nav: scrolled state + mobile menu ---------- */
  const nav = $('.nav');
  const toggle = $('.nav-toggle');
  const links = $('#nav-links');
  const onScrollNav = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  links.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  document.addEventListener('click', (e) => { if (!nav.contains(e.target)) setMenu(false); });

  /* ---------- Marquees: duplicate content for a seamless loop ---------- */
  $$('.marquee').forEach((m) => {
    const track = $('.marquee-track', m);
    const items = [...track.children];
    // Make sure one copy is wider than the viewport, then double it.
    let guard = 0;
    while (track.scrollWidth < window.innerWidth * 1.1 && guard++ < 4) {
      items.forEach((n) => track.appendChild(n.cloneNode(true)));
    }
    [...track.children].forEach((n) => {
      const c = n.cloneNode(true);
      c.setAttribute('aria-hidden', 'true');
      track.appendChild(c);
    });
    track.style.setProperty('--dur', `${m.dataset.speed || 40}s`);
  });

  /* ---------- Reveal on scroll ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    reveals.forEach((r) => io.observe(r));
  } else {
    reveals.forEach((r) => r.classList.add('is-in'));
  }

  /* ---------- Stacked cards: shrink the ones underneath ---------- */
  const cards = $$('.stack-card');
  const stackMQ = window.matchMedia('(min-width: 861px)');
  let ticking = false;
  const updateStack = () => {
    ticking = false;
    if (!stackMQ.matches || reduceMotion) {
      cards.forEach((c) => { c.style.transform = ''; c.style.filter = ''; });
      return;
    }
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) { card.style.transform = ''; card.style.filter = ''; return; }
      const a = card.getBoundingClientRect();
      const b = next.getBoundingClientRect();
      // 0 when the next card is a full card-height below, 1 when it has fully covered this one.
      const p = Math.min(1, Math.max(0, 1 - (b.top - a.top) / a.height));
      const depth = cards.length - 1 - i;
      const scale = 1 - p * 0.03 * depth;
      card.style.transform = `scale(${scale.toFixed(4)})`;
      card.style.filter = `brightness(${(1 - p * 0.08).toFixed(3)})`;
    });
  };
  const requestStack = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateStack); } };

  // If a card is taller than the space below its sticky offset, stick it higher
  // so its bottom (copy, pills) is always reachable before the next card covers it.
  const setStickTops = () => {
    const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 64;
    cards.forEach((card, i) => {
      card.style.removeProperty('--stick-top');
      if (!stackMQ.matches) return;
      const desired = navH + 24 + i * 22;
      const maxTop = window.innerHeight - card.offsetHeight - 16;
      if (maxTop < desired) card.style.setProperty('--stick-top', `${Math.round(maxTop)}px`);
    });
  };
  setStickTops();
  window.addEventListener('load', () => { setStickTops(); requestStack(); });
  window.addEventListener('resize', () => { setStickTops(); requestStack(); });
  window.addEventListener('scroll', requestStack, { passive: true });
  updateStack();

  /* ---------- Impact carousel ---------- */
  const carousel = $('.carousel');
  $$('.carousel-ctrl .round-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const card = $('.stat-card', carousel);
      const step = card ? card.getBoundingClientRect().width + 22 : 360;
      carousel.scrollBy({ left: step * Number(btn.dataset.dir), behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- Copy email ---------- */
  const toast = $('.toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
  };
  const copyBtn = $('#copy-email');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        showToast('Email copied ✓');
      } catch {
        showToast(email);
      }
    });
  }

  /* ---------- Footer year ---------- */
  const y = $('#year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
