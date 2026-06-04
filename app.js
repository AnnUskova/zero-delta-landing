// Reveal-on-scroll: marks elements (and their children, for groups) visible
// when they enter the viewport so CSS can play the staggered transitions.
(() => {
  const targets = document.querySelectorAll('.reveal, .reveal-group');
  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach(el => el.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.18, rootMargin: '0px 0px -60px 0px' });

  targets.forEach(el => io.observe(el));
})();

// Count-up for stats
(() => {
  const stats = document.querySelector('.stats');
  if (!stats) return;

  const parse = (raw) => {
    const m = raw.match(/([^\d]*)([\d.]+)([^\d]*)/);
    if (!m) return null;
    return { prefix: m[1], num: parseFloat(m[2]), suffix: m[3], raw };
  };

  const fmt = (parsed, value) => {
    const hasDecimal = parsed.raw.includes('.');
    const text = hasDecimal ? value.toFixed(1) : Math.round(value).toString();
    return `${parsed.prefix}${text}${parsed.suffix}`;
  };

  const animate = (el, parsed) => {
    const duration = 1400;
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = fmt(parsed, parsed.num * ease(t));
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = parsed.raw;
    };
    requestAnimationFrame(tick);
  };

  const items = [...stats.querySelectorAll('.stat__value')].map(el => {
    const parsed = parse(el.textContent.trim());
    if (parsed) el.dataset.target = parsed.raw;
    return { el, parsed };
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      items.forEach(({ el, parsed }) => parsed && animate(el, parsed));
      io.disconnect();
    });
  }, { threshold: 0.4 });

  io.observe(stats);
})();

// Use-case carousel: pin the card, swap slides based on scroll progress
(() => {
  const scroll = document.querySelector('.usecase-scroll');
  const sticky = document.querySelector('.usecase-sticky');
  const slides = [...document.querySelectorAll('.usecase-slide')];
  if (!scroll || !sticky || slides.length === 0) return;

  const N = slides.length;
  let ticking = false;
  const update = () => {
    ticking = false;
    const stickyH = sticky.offsetHeight;
    const travel = scroll.offsetHeight - stickyH;
    const top = parseFloat(getComputedStyle(sticky).top) || 0;
    let p = travel > 0 ? (top - scroll.getBoundingClientRect().top) / travel : 0;
    p = Math.min(1, Math.max(0, p));
    const seg = 1 / Math.max(1, N - 1);
    slides.forEach((s, k) => {
      if (k === 0) { s.style.transform = 'translateY(0)'; return; }
      const local = Math.min(1, Math.max(0, (p - (k - 1) * seg) / seg));
      s.style.transform = `translateY(${(1 - local) * 100}%)`;
    });
  };

  const onScroll = () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

// Back-to-top button: show after scrolling down, smooth-scroll to top
(() => {
  const btn = document.querySelector('.scroll-top');
  if (!btn) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    btn.classList.toggle('is-visible', window.scrollY > 700);
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
