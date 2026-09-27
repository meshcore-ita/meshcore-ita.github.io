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

// Copia link del post: progressive enhancement. Il bottone parte "hidden"
// (funziona anche senza JS: resta nascosto, il link Telegram basta), e
// viene rivelato solo se il Clipboard API è disponibile.
function initCopyLink() {
  const buttons = document.querySelectorAll('.share__copy[data-copy-link]');
  if (!buttons.length) return;
  if (!navigator.clipboard || !navigator.clipboard.writeText) return;

  buttons.forEach((button) => {
    button.hidden = false;
    const status = button.parentElement && button.parentElement.querySelector('.share__status');
    let resetTimer = null;

    button.addEventListener('click', () => {
      const url = button.dataset.copyLink;
      copyText(url)
        .then(() => {
          if (status) status.textContent = 'Link copiato';
        })
        .catch(() => {
          if (status) status.textContent = 'Copia non riuscita';
        })
        .finally(() => {
          if (resetTimer) window.clearTimeout(resetTimer);
          resetTimer = window.setTimeout(() => {
            if (status) status.textContent = '';
          }, 2000);
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

  // Rete mesh simulata, fedele al comportamento di MeshCore:
  // - LoRa è broadcast: una trasmissione è un'onda che raggiunge insieme
  //   tutti i nodi in portata, non un pacchetto su un filo;
  // - solo i repeater ritrasmettono, una volta sola per pacchetto, dopo un
  //   ritardo casuale (txdelay); i companion ricevono ma non ripetono;
  // - gli advert si fermano a 8 hop (flood.max.advert), gli altri flood a 64;
  // - un messaggio privato va in flood, la conferma torna al mittente lungo
  //   il percorso registrato, e i messaggi successivi usano solo quel
  //   percorso (routing diretto).
  let nodes = [];
  const ripples = [];
  const trails = [];
  const events = [];
  let simT = 0, pktId = 0, nextEvent = 900, lastTime = 0, cycle = 0;
  const pointer = { x: -9999, y: -9999, on: false };
  let parallax = 0;
  const AIRTIME = 600; // ms, ~50 byte a SF8/BW62.5 col preambolo MeshCore
  const COLORS = {
    advert: '74,222,128',
    msg: '187,247,208',
    ack: '251,113,133',
    direct: '226,232,240',
  };

  const nodePos = (n) => {
    const r = radius + n.dist;
    return [cx + Math.cos(n.angle) * r, cy + Math.sin(n.angle) * r];
  };

  const later = (delay, fn) => events.push({ at: simT + delay, fn });

  const seedNodes = () => {
    nodes = [];
    const want = lowPower ? 14 : 26;
    for (let tries = 0; nodes.length < want && tries < 4000; tries += 1) {
      const n = {
        angle: Math.PI * 0.92 + Math.random() * Math.PI * 0.62,
        // sulla superficie del pianeta, appena dentro il bordo luminoso
        dist: -band * (0.08 + Math.random() * 1.6),
        links: [], seen: new Set(), pulse: 0, color: COLORS.advert,
      };
      const r = radius + n.dist;
      const x = cx + Math.cos(n.angle) * r, y = cy + Math.sin(n.angle) * r;
      if (x < 30 || y < 30 || x > width - 30 || y > height - 30) continue;
      if (nodes.some((m) => Math.hypot(m.x0 - x, m.y0 - y) < 60)) continue;
      n.x0 = x; n.y0 = y;
      nodes.push(n);
    }
    // circa un nodo su tre è un companion (il telefono di qualcuno)
    nodes.forEach((n, i) => { n.repeater = i % 3 !== 0; });
    // portata radio: chi è entro range si sente, in entrambe le direzioni
    const range = Math.max(150, Math.min(width, height) * 0.3);
    nodes.forEach((n, i) => {
      n.links = nodes
        .map((m, j) => ({ j, d: Math.hypot(m.x0 - n.x0, m.y0 - n.y0) }))
        .filter((o) => o.j !== i && o.d < range)
        .sort((a, b) => a.d - b.d)
        .slice(0, 5)
        .map((o) => o.j);
    });
    nodes.forEach((n, i) => n.links.forEach((j) => {
      if (!nodes[j].links.includes(i)) nodes[j].links.push(i);
    }));
    ripples.length = 0; trails.length = 0; events.length = 0;
  };

  // Un nodo trasmette: onda visibile, e dopo l'airtime tutti i vicini ricevono.
  const transmit = (idx, pkt) => {
    const n = nodes[idx];
    n.pulse = 1; n.color = COLORS[pkt.kind];
    ripples.push({ idx, age: 0, color: COLORS[pkt.kind] });
    later(AIRTIME, () => n.links.forEach((j) => receive(j, idx, pkt)));
  };

  const receive = (idx, from, pkt) => {
    const n = nodes[idx];
    if (pkt.route) {
      // routing diretto: agisce solo il prossimo nodo del percorso
      if (pkt.route[pkt.hop + 1] !== idx || pkt.route[pkt.hop] !== from) return;
      trails.push({ a: from, b: idx, age: 0, color: COLORS[pkt.kind] });
      const next = { ...pkt, hop: pkt.hop + 1 };
      if (next.hop === pkt.route.length - 1) { n.pulse = 1; n.color = COLORS[pkt.kind]; pkt.onArrive?.(); return; }
      later(150 + Math.random() * 350, () => transmit(idx, next));
      return;
    }
    // flood: ogni nodo tiene traccia dei pacchetti già visti
    if (n.seen.has(pkt.id)) return;
    n.seen.add(pkt.id);
    const path = [...pkt.path, idx];
    if (pkt.dest === idx) { n.pulse = 1; n.color = COLORS[pkt.kind]; pkt.onArrive?.(path); return; }
    if (!n.repeater || path.length - 1 >= pkt.maxHops) { n.pulse = Math.max(n.pulse, 0.5); return; }
    later(150 + Math.random() * 550, () => transmit(idx, { ...pkt, path }));
  };

  const flood = (src, kind, extra = {}) => {
    pktId += 1;
    nodes[src].seen.add(pktId);
    transmit(src, { id: pktId, kind, path: [src], maxHops: kind === 'advert' ? 8 : 64, ...extra });
  };

  const direct = (route, kind, onArrive) => {
    pktId += 1;
    transmit(route[0], { id: pktId, kind, route, hop: 0, onArrive });
  };

  // Scambio completo tra due companion: flood, conferma sul percorso, diretto.
  const conversation = () => {
    const companions = nodes.map((n, i) => i).filter((i) => !nodes[i].repeater);
    if (companions.length < 2) return false;
    const a = companions[Math.floor(Math.random() * companions.length)];
    const others = companions.filter((i) => i !== a);
    const b = others[Math.floor(Math.random() * others.length)];
    flood(a, 'msg', {
      dest: b,
      onArrive: (path) => later(500, () => direct([...path].reverse(), 'ack', () => {
        later(1800, () => direct(path, 'direct'));
      })),
    });
    return true;
  };

  const tick = () => {
    cycle += 1;
    if (cycle % 3 === 0 && conversation()) return 9000;
    const reps = nodes.map((n, i) => i).filter((i) => nodes[i].repeater);
    if (reps.length) flood(reps[Math.floor(Math.random() * reps.length)], 'advert');
    return 4500 + Math.random() * 2500;
  };

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
    seedNodes();
  };

  const drawMesh = (dt) => {
    if (!nodes.length) return;
    simT += dt;
    for (let k = events.length - 1; k >= 0; k -= 1) {
      if (events[k].at <= simT) { const { fn } = events[k]; events.splice(k, 1); fn(); }
    }

    // portata radio tra i nodi
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(74,222,128,0.09)';
    ctx.beginPath();
    nodes.forEach((n, i) => n.links.forEach((j) => {
      if (j < i) return;
      const [ax, ay] = nodePos(n), [bx, by] = nodePos(nodes[j]);
      ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
    }));
    ctx.stroke();

    // tratte del routing diretto: si accende solo il percorso usato
    ctx.lineWidth = 1.5;
    for (let k = trails.length - 1; k >= 0; k -= 1) {
      const tr = trails[k];
      tr.age += dt / 2600;
      if (tr.age >= 1) { trails.splice(k, 1); continue; }
      const [ax, ay] = nodePos(nodes[tr.a]), [bx, by] = nodePos(nodes[tr.b]);
      ctx.strokeStyle = `rgba(${tr.color},${(0.55 * (1 - tr.age)).toFixed(3)})`;
      ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    }

    // onde di trasmissione: raggiungono tutti i vicini nello stesso istante
    ctx.lineWidth = 1;
    for (let k = ripples.length - 1; k >= 0; k -= 1) {
      const rp = ripples[k];
      rp.age += dt / AIRTIME;
      if (rp.age >= 1.6) { ripples.splice(k, 1); continue; }
      const n = nodes[rp.idx];
      const [x, y] = nodePos(n);
      const reach = Math.min(110, n.links.reduce((m, j) => Math.max(m, Math.hypot(nodes[j].x0 - n.x0, nodes[j].y0 - n.y0)), 40));
      const t = Math.min(1, rp.age);
      const fade = rp.age < 1 ? 0.22 : 0.22 * (1.6 - rp.age) / 0.6;
      ctx.strokeStyle = `rgba(${rp.color},${fade.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, 3 + t * reach, 0, Math.PI * 2);
      ctx.stroke();
    }

    // nodi: repeater pieni, companion ad anello
    nodes.forEach((n) => {
      const [x, y] = nodePos(n);
      n.pulse = Math.max(0, n.pulse - dt / 900);
      if (n.pulse > 0) {
        ctx.fillStyle = `rgba(${n.color},${(n.pulse * 0.2).toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
      }
      const a = (0.4 + n.pulse * 0.6).toFixed(3);
      if (n.repeater) {
        ctx.fillStyle = `rgba(187,247,208,${a})`;
        ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.strokeStyle = `rgba(226,232,240,${a})`;
        ctx.lineWidth = 1;
        ctx.beginPath(); ctx.arc(x, y, 2.6, 0, Math.PI * 2); ctx.stroke();
      }
    });
  };

  const draw = (time) => {
    // draw(0) viene chiamato anche fuori dal loop (resize): niente dt negativi
    const dt = time > lastTime ? Math.min(64, lastTime ? time - lastTime : 16) : 0;
    if (time) lastTime = time;
    parallax = reduceMotion ? 0 : Math.min(window.scrollY * 0.06, height * 0.15);
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(0, -parallax);

    // corpo dell'arco: gradiente radiale ritagliato sul cerchio
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.clip();
    ctx.fillStyle = glow;
    ctx.fillRect(0, parallax, width, height);
    ctx.restore();

    // bordo luminoso
    ctx.strokeStyle = 'rgba(34,197,94,0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, Math.PI * 0.9, Math.PI * 1.6);
    ctx.stroke();

    const px = pointer.x, py = pointer.y + parallax, pr = 140;
    const top = parallax - 4, bottom = height + parallax + 4;
    for (let i = 0; i < count; i += 1) {
      if (!reduceMotion) angle[i] += drift[i];
      const r = radius + dist[i];
      const x = cx + Math.cos(angle[i]) * r, y = cy + Math.sin(angle[i]) * r;
      if (x < -4 || y < top || x > width + 4 || y > bottom) continue;
      const twinkle = reduceMotion ? 0.8 : 0.55 + 0.45 * Math.sin(time * 0.0014 + phase[i]);
      const edge = 1 - Math.min(1, Math.abs(dist[i]) / band);
      let alpha = (0.18 + twinkle * 0.62) * (0.22 + edge * 0.78);
      // alone attorno al puntatore: le particelle vicine si accendono
      let near = 0;
      if (pointer.on) {
        const dx = x - px, dy = y - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < pr * pr) near = 1 - Math.sqrt(d2) / pr;
      }
      alpha = Math.min(1, alpha + near * 0.7);
      ctx.fillStyle = edge > 0.55 || near > 0.3 ? shade(GREEN, alpha) : shade(WHITE, alpha * 0.6);
      ctx.fillRect(x, y, size[i], size[i]);
    }

    if (!reduceMotion && nodes.length) {
      nextEvent -= dt;
      if (nextEvent <= 0) nextEvent = tick();
    }
    drawMesh(reduceMotion ? 0 : dt);
    ctx.restore();
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
  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (e) => { pointer.x = e.clientX; pointer.y = e.clientY; pointer.on = true; }, { passive: true });
    document.addEventListener('pointerleave', () => { pointer.on = false; });
  }
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
  initCopyLink();
  initReveal();
  initScrollSpy();
  initBackground();
}

init();
