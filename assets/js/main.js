/**
 * MeshCore ITA — site behavior.
 * Vanilla ES module, no dependencies. Every feature is guarded on the
 * presence of its target element(s) so the page never throws.
 */

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  let ticking = false;
  const update = () => {
    header.dataset.scrolled = window.scrollY > 8 ? 'true' : 'false';
    ticking = false;
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true }
  );
  update();
}

function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  if (!toggle) return;
  const body = document.body;
  const label = toggle.querySelector('.sr-only');
  const desktopQuery = window.matchMedia('(min-width: 821px)');
  const supportsInert = 'inert' in HTMLElement.prototype;

  // Chiuso, il menu mobile è nascosto solo visivamente dal CSS: senza questo
  // i suoi link restano raggiungibili da tastiera e dagli screen reader.
  const syncHidden = () => {
    if (!nav) return;
    const hidden = !desktopQuery.matches && !body.dataset.navOpen;
    if (supportsInert) {
      nav.inert = hidden;
      return;
    }
    nav.setAttribute('aria-hidden', hidden ? 'true' : 'false');
    nav.querySelectorAll('.nav__link').forEach((link) => {
      if (hidden) link.setAttribute('tabindex', '-1');
      else link.removeAttribute('tabindex');
    });
  };

  const close = ({ restoreFocus = false } = {}) => {
    const wasOpen = Boolean(body.dataset.navOpen);
    delete body.dataset.navOpen;
    toggle.setAttribute('aria-expanded', 'false');
    if (label) label.textContent = 'Apri il menu';
    syncHidden();
    if (wasOpen && restoreFocus) toggle.focus();
  };
  const open = () => {
    body.dataset.navOpen = 'true';
    toggle.setAttribute('aria-expanded', 'true');
    if (label) label.textContent = 'Chiudi il menu';
    syncHidden();
    const first = nav && nav.querySelector('.nav__link');
    if (first) first.focus();
  };

  toggle.addEventListener('click', () => {
    if (body.dataset.navOpen) close();
    else open();
  });

  if (nav) {
    nav.querySelectorAll('.nav__link').forEach((link) => {
      link.addEventListener('click', () => close());
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close({ restoreFocus: true });
  });

  // Click fuori dal menu aperto: chiude come farebbe un menu nativo.
  document.addEventListener('click', (event) => {
    if (!body.dataset.navOpen) return;
    if (toggle.contains(event.target)) return;
    if (nav && nav.contains(event.target)) return;
    close();
  });

  const handleBreakpoint = () => {
    if (desktopQuery.matches) close();
    else syncHidden();
  };
  if (desktopQuery.addEventListener) desktopQuery.addEventListener('change', handleBreakpoint);
  else if (desktopQuery.addListener) desktopQuery.addListener(handleBreakpoint);
  syncHidden();
}

function initCmdbox() {
  const tabs = Array.from(document.querySelectorAll('.cmdbox__tab'));
  if (!tabs.length) return;
  const panels = document.querySelectorAll('.cmdbox__panel');

  const activate = (tab, focusTab) => {
    tabs.forEach((candidate) => {
      const selected = candidate === tab;
      candidate.setAttribute('aria-selected', selected ? 'true' : 'false');
      candidate.tabIndex = selected ? 0 : -1;
    });
    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.dataset.panel;
    });
    if (focusTab) tab.focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(tab, false));
    tab.addEventListener('keydown', (event) => {
      let target = null;
      if (event.key === 'ArrowRight') target = tabs[(index + 1) % tabs.length];
      else if (event.key === 'ArrowLeft') target = tabs[(index - 1 + tabs.length) % tabs.length];
      else if (event.key === 'Home') target = tabs[0];
      else if (event.key === 'End') target = tabs[tabs.length - 1];
      if (target) {
        event.preventDefault();
        activate(target, true);
      }
    });
  });

  const initial = tabs.find((tab) => tab.getAttribute('aria-selected') === 'true') || tabs[0];
  activate(initial, false);
}

// Copia reale: Clipboard API dove disponibile, altrimenti execCommand con
// esito verificato. Se nessuna delle due funziona la promise viene rifiutata,
// così il bottone non può annunciare "COPIATO" senza aver copiato niente.
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, text.length);
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    document.body.removeChild(textarea);
    if (copied) resolve();
    else reject(new Error('copia negli appunti non supportata'));
  });
}

// Fallback finale: selezionare il testo così l'utente lo copia a mano.
function selectElementText(node) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(node);
  selection.removeAllRanges();
  selection.addRange(range);
}

function initCopyButtons() {
  const buttons = document.querySelectorAll('.cmdbox__copy[data-copy-target]');
  if (!buttons.length) return;

  buttons.forEach((button) => {
    const label = button.querySelector('.cmdbox__copy-label');
    const originalLabel = label ? label.textContent : '';
    let resetTimer = null;

    button.addEventListener('click', () => {
      const targetId = button.dataset.copyTarget;
      const codeEl = document.querySelector('#' + targetId + ' .cmdbox__code');
      if (!codeEl) return;
      const text = codeEl.textContent.trim();

      const restore = () => {
        if (resetTimer) window.clearTimeout(resetTimer);
        resetTimer = window.setTimeout(() => {
          delete button.dataset.copied;
          if (label) label.textContent = originalLabel;
        }, 1600);
      };

      copyText(text)
        .then(() => {
          button.dataset.copied = 'true';
          if (label) label.textContent = 'COPIATO';
          restore();
        })
        .catch(() => {
          // Niente falsi positivi: il testo viene selezionato e l'etichetta lo dice.
          selectElementText(codeEl);
          if (label) label.textContent = 'COPIA A MANO';
          restore();
        });
    });
  });
}

function initReveal() {
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
  );
  targets.forEach((el) => observer.observe(el));
}

function initScrollSpy() {
  const sections = document.querySelectorAll('main section[id]');
  if (!sections.length || typeof IntersectionObserver === 'undefined') return;
  const links = document.querySelectorAll('.nav__link');
  if (!links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      if (link.getAttribute('href') === '#' + id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { threshold: 0, rootMargin: '-45% 0px -50% 0px' }
  );
  sections.forEach((section) => observer.observe(section));
}

function initBackground() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Meno particelle su macchine deboli e schermi piccoli: l'effetto resta,
  // il costo per frame no.
  const lowPower = (navigator.hardwareConcurrency || 4) <= 4 || window.innerWidth < 700;
  const MAX = lowPower ? 1200 : 3600;
  const angle = new Float32Array(MAX);
  const dist = new Float32Array(MAX);
  const drift = new Float32Array(MAX);
  const phase = new Float32Array(MAX);
  const size = new Float32Array(MAX);

  // Stringhe colore precalcolate: senza, ogni particella ne alloca una nuova
  // a ogni frame (fino a 3600 stringhe × 60 fps di lavoro per il GC).
  const STEPS = 24;
  const GREEN = [];
  const WHITE = [];
  for (let i = 0; i < STEPS; i += 1) {
    const a = ((i + 1) / STEPS).toFixed(3);
    GREEN.push(`rgba(74,222,128,${a})`);
    WHITE.push(`rgba(235,235,235,${a})`);
  }
  const shade = (palette, alpha) =>
    palette[Math.min(STEPS - 1, Math.max(0, Math.round(alpha * STEPS) - 1))];
  let width = 0, height = 0, count = 0, cx = 0, cy = 0, radius = 0, band = 0;
  let glow = null;
  let inView = true, raf = null;

  const seed = () => {
    count = Math.min(MAX, Math.max(400, Math.round((width * height) / 420)));
    cx = width * 1.46; cy = height * 1.86;
    radius = Math.max(width, height) * 1.15; band = radius * 0.22;
    for (let i = 0; i < count; i += 1) {
      angle[i] = Math.PI * 0.92 + Math.random() * Math.PI * 0.62;
      // densita' concentrata sul bordo dell'arco: u^2.4 addensa verso dist=0
      const u = Math.random();
      dist[i] = (Math.random() < 0.5 ? -1 : 1) * band * Math.pow(u, 2.4);
      drift[i] = (Math.random() * 0.00009 + 0.00002) * (Math.random() < 0.5 ? -1 : 1);
      phase[i] = Math.random() * Math.PI * 2;
      size[i] = Math.random() < 0.85 ? 1 : 2;
    }
    glow = ctx.createRadialGradient(cx, cy, radius * 0.62, cx, cy, radius);
    glow.addColorStop(0, 'rgba(225,29,72,0.04)');
    glow.addColorStop(0.85, 'rgba(34,197,94,0.07)');
    glow.addColorStop(1, 'rgba(34,197,94,0.16)');
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.round(rect.width), h = Math.round(rect.height);
    if (w === width && h === height) return;
    width = w; height = h;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
  };

  const draw = (time) => {
    ctx.clearRect(0, 0, width, height);

    // corpo dell'arco: gradiente radiale ritagliato sul cerchio
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    // bordo luminoso
    ctx.strokeStyle = 'rgba(34,197,94,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.9, Math.PI * 1.6);
    ctx.stroke();

    for (let i = 0; i < count; i += 1) {
      if (!reduceMotion) angle[i] += drift[i];
      const r = radius + dist[i];
      const x = cx + Math.cos(angle[i]) * r, y = cy + Math.sin(angle[i]) * r;
      if (x < -4 || y < -4 || x > width + 4 || y > height + 4) continue;
      const twinkle = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(time * 0.0014 + phase[i]);
      const edge = 1 - Math.min(1, Math.abs(dist[i]) / band);
      const alpha = (0.18 + twinkle * 0.62) * (0.22 + edge * 0.78);
      ctx.fillStyle = edge > 0.55 ? shade(GREEN, alpha) : shade(WHITE, alpha * 0.6);
      ctx.fillRect(x, y, size[i], size[i]);
    }
  };

  const loop = (time) => { draw(time); raf = requestAnimationFrame(loop); };
  const start = () => {
    if (reduceMotion || raf !== null || document.hidden || !inView) return;
    raf = requestAnimationFrame(loop);
  };
  const stop = () => { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } };

  resize();
  draw(0);
  if (reduceMotion) return;

  let resizeTimer = null;
  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(() => { resize(); draw(0); }, 150);
  });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  if (typeof IntersectionObserver !== 'undefined') {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        inView = entry.isIntersecting;
        inView ? start() : stop();
      });
    });
    io.observe(canvas);
  }
  start();
}

function init() {
  initHeaderScroll();
  initMobileNav();
  initCmdbox();
  initCopyButtons();
  initReveal();
  initScrollSpy();
  initBackground();
}

init();
