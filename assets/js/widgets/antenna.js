// Direzionalità dell'antenna vs scenario d'uso: diagrammi di radiazione
// (azimuth ed elevazione), carta di Smith, SWR vs frequenza, lunghezze.
// Modelli didattici: pattern cos^n con n ricavato dall'HPBW dichiarato,
// impedenza RLC serie con Q tipico. Valori nominali da datasheet/letteratura.
import { PRESET, el, fmt } from './rf.js';

const Z0 = 50;
const F0 = PRESET.freqMHz;
const F_MIN = 860;
const F_MAX = 880;

// hpbwAz/hpbwEl in gradi (-3 dB), fbDb front/back, q banda dell'adattamento.
// omni: azimuth costante (verticale). z: impedenza al punto di alimentazione.
const ANTENNAS = [
  { name: 'Dipolo λ/2 verticale (stock SMA)', gain: 2.15, omni: true, hpbwEl: 78, z: { r: 73, x: 0 }, q: 8, size: 'lunghezza 16.5 cm' },
  { name: 'Antenna PCB / U.FL interna', gain: 0.5, omni: true, hpbwEl: 90, z: { r: 40, x: 15 }, q: 5, size: 'integrata sulla board' },
  { name: 'Verticale 5/8λ con radiali', gain: 3.5, omni: true, hpbwEl: 55, z: { r: 50, x: 0 }, q: 10, size: 'lunghezza 21.6 cm + radiali' },
  { name: 'Yagi 3 elementi', gain: 7.5, omni: false, hpbwAz: 65, hpbwEl: 80, fbDb: 12, z: { r: 50, x: 8 }, q: 12, size: 'boom ~25 cm' },
  { name: 'Yagi 6 elementi', gain: 10.5, omni: false, hpbwAz: 48, hpbwEl: 55, fbDb: 18, z: { r: 50, x: 12 }, q: 15, size: 'boom ~70 cm' },
  { name: 'Yagi 10 elementi', gain: 13, omni: false, hpbwAz: 36, hpbwEl: 40, fbDb: 22, z: { r: 50, x: 15 }, q: 18, size: 'boom ~1.5 m' },
];

// Nodi dello scenario: azimuth in gradi rispetto al puntamento dell'antenna.
const SCENARIOS = {
  urbano: { label: 'Urbano: nodi tutto intorno', nodes: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] },
  misto: { label: 'Quartiere + repeater lontano', nodes: [0, 15, -20, 40, 160, 200] },
  ponte: { label: 'Ponte punto-punto', nodes: [0] },
};

// cos^n: n tale che a HPBW/2 l'ampiezza sia 1/sqrt(2) (-3 dB).
const nFromHpbw = (hpbw) => Math.log(Math.SQRT1_2) / Math.log(Math.cos((hpbw / 2) * Math.PI / 180));
const cosN = (deg, n) => {
  const c = Math.cos(deg * Math.PI / 180);
  return c <= 0 ? 0 : c ** n;
};
const wrap = (deg) => ((deg + 180) % 360 + 360) % 360 - 180;

// Ampiezza di campo normalizzata (0..1) in azimuth.
function ampAz(a, deg) {
  if (a.omni) return 1;
  const n = nFromHpbw(a.hpbwAz);
  const d = wrap(deg);
  return Math.abs(d) <= 90 ? cosN(d, n) : 10 ** (-a.fbDb / 20) * cosN(d - 180, n);
}

const toDb = (amp) => 20 * Math.log10(Math.max(amp, 1e-3));
// Ampiezza in elevazione: 0° = orizzonte. tilt ruota il massimo verso l'alto.
// Verticale omni: taglio simmetrico (lobo avanti e dietro), nullo allo zenit;
// il tilt meccanico ruota l'intero taglio, non solo il lobo avanti.
function ampEl(a, deg, tilt) {
  const n = nFromHpbw(a.hpbwEl);
  const d = wrap(deg - tilt);
  if (a.omni) return Math.max(cosN(d, n), cosN(wrap(d - 180), n));
  return cosN(d, n);
}

// Impedenza vs frequenza: RLC serie, X(f) = X0 + Q·R·(f/f0 - f0/f).
function impedance(a, f) {
  return { r: a.z.r, x: a.z.x + a.q * a.z.r * (f / F0 - F0 / f) };
}

// Γ = (z-1)/(z+1) con z normalizzata a Z0, divisione complessa esatta.
function gamma({ r, x }) {
  const zr = r / Z0, zx = x / Z0;
  const d = (zr + 1) ** 2 + zx ** 2;
  return { re: (zr ** 2 - 1 + zx ** 2) / d, im: (2 * zx) / d };
}
const gammaMag = (g) => Math.hypot(g.re, g.im);
const vswr = (g) => { const m = Math.min(gammaMag(g), 0.999); return (1 + m) / (1 - m); };

// --- disegno ------------------------------------------------------------

const S = 260, CX = S / 2, CY = S / 2, R = S / 2 - 26, DB_RANGE = 30;
const rOf = (db) => Math.max(0, (db + DB_RANGE) / DB_RANGE) * R;
const pt = (r, deg) => `${(CX + r * Math.sin(deg * Math.PI / 180)).toFixed(1)},${(CY - r * Math.cos(deg * Math.PI / 180)).toFixed(1)}`;

function polarGrid(title, labels) {
  const g = el('g');
  for (const db of [-20, -10, 0]) g.append(el('circle', { cx: CX, cy: CY, r: rOf(db), fill: 'none', stroke: db === 0 ? 'var(--line-strong)' : 'var(--line)', 'stroke-dasharray': db === 0 ? '' : '2 3' }));
  for (let d = 0; d < 360; d += 30) g.append(el('line', { x1: CX, y1: CY, x2: pt(R, d).split(',')[0], y2: pt(R, d).split(',')[1], stroke: 'var(--line)' }));
  for (const [deg, txt] of labels) {
    const [x, y] = pt(R + 14, deg).split(',');
    g.append(el('text', { x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', fill: 'var(--dim)', 'font-size': '9', text: txt }));
  }
  g.append(el('text', { x: CX, y: 11, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': '10', text: title }));
  g.append(el('text', { x: CX + 3, y: CY - rOf(-10) - 2, fill: 'var(--dim)', 'font-size': '8', text: '−10 dB' }));
  g.append(el('text', { x: CX + 3, y: CY - rOf(-20) - 2, fill: 'var(--dim)', 'font-size': '8', text: '−20 dB' }));
  return g;
}

function patternPath(ampFn) {
  let d = '';
  for (let deg = 0; deg <= 360; deg += 2) d += (deg ? 'L' : 'M') + pt(rOf(toDb(ampFn(deg))), deg);
  return el('path', { d: d + 'Z', fill: 'var(--accent)', 'fill-opacity': '.22', stroke: 'var(--accent)', 'stroke-width': '1.5' });
}

function drawAzimuth(svg, a, scenario) {
  svg.replaceChildren(polarGrid('Azimuth (vista dall’alto, 0° = puntamento)', [[0, '0°'], [90, '90°'], [180, '180°'], [270, '270°']]));
  svg.append(patternPath((deg) => ampAz(a, deg)));
  let covered = 0;
  for (const az of scenario.nodes) {
    const ok = toDb(ampAz(a, az)) >= -3;
    covered += ok;
    const [cx, cy] = pt(R + 4, az).split(',');
    svg.append(el('circle', { cx, cy, r: 4, fill: ok ? 'var(--accent)' : '#ef4444', stroke: 'var(--bg)', 'stroke-width': '1.5' }));
  }
  return covered;
}

function drawElevation(svg, a, tilt) {
  svg.replaceChildren(polarGrid('Elevazione (0° = orizzonte, 90° = zenit)', [[90, '0°'], [0, '90°'], [270, '180°'], [180, '−90°']]));
  // orizzonte
  svg.append(el('line', { x1: CX - R, y1: CY, x2: CX + R, y2: CY, stroke: 'var(--line-strong)', 'stroke-dasharray': '4 3' }));
  // solo semipiano avanti: asse verticale = elevazione, si disegna ruotato di 90° (0° elevazione a destra)
  svg.append(patternPath((deg) => ampEl(a, 90 - deg, tilt)));
}

// Carta di Smith: cerchi r = 0.5,1,2 e archi x = ±0.5,±1,±2, punto Γ(f), cerchio |Γ| costante.
function drawSmith(svg, a, f) {
  const g = el('g');
  g.append(el('text', { x: CX, y: 11, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': '10', text: `Carta di Smith (Z0 = ${Z0} Ω)` }));
  g.append(el('circle', { cx: CX, cy: CY, r: R, fill: 'none', stroke: 'var(--line-strong)' }));
  g.append(el('line', { x1: CX - R, y1: CY, x2: CX + R, y2: CY, stroke: 'var(--line)' }));
  for (const r of [0.5, 1, 2]) g.append(el('circle', { cx: CX + (r / (1 + r)) * R, cy: CY, r: R / (1 + r), fill: 'none', stroke: 'var(--line)', 'stroke-dasharray': '2 3' }));
  g.append(el('text', { x: CX + 3, y: CY + 10, fill: 'var(--dim)', 'font-size': '8', text: '50 Ω' }));
  const arcs = el('g', { style: 'clip-path: url(#smith-clip)' });
  for (const x of [0.5, 1, 2, -0.5, -1, -2]) {
    arcs.append(el('circle', { cx: CX + R, cy: CY - R / x, r: R / Math.abs(x), fill: 'none', stroke: 'var(--line)', 'stroke-dasharray': '2 3' }));
  }
  g.append(arcs);
  g.append(el('text', { x: CX - R + 2, y: CY - 3, fill: 'var(--dim)', 'font-size': '8', text: '0' }));
  g.append(el('text', { x: CX + R - 10, y: CY - 3, fill: 'var(--dim)', 'font-size': '8', text: '∞' }));
  g.append(el('text', { x: CX + 3, y: CY - R + 12, fill: 'var(--dim)', 'font-size': '8', text: '+jX (induttivo)' }));
  g.append(el('text', { x: CX + 3, y: CY + R - 4, fill: 'var(--dim)', 'font-size': '8', text: '−jX (capacitivo)' }));

  // traccia Γ(f) sulla banda, poi il punto alla frequenza scelta
  let d = '';
  for (let fq = F_MIN; fq <= F_MAX; fq += 0.5) {
    const gm = gamma(impedance(a, fq));
    d += (d ? 'L' : 'M') + `${(CX + gm.re * R).toFixed(1)},${(CY - gm.im * R).toFixed(1)}`;
  }
  g.append(el('path', { d, fill: 'none', stroke: 'var(--muted)', 'stroke-width': '1.2' }));
  const gm = gamma(impedance(a, f));
  g.append(el('circle', { cx: CX, cy: CY, r: gammaMag(gm) * R, fill: 'none', stroke: 'var(--accent)', 'stroke-dasharray': '3 3' }));
  g.append(el('circle', { cx: CX + gm.re * R, cy: CY - gm.im * R, r: 5, fill: 'var(--accent)', stroke: 'var(--bg)', 'stroke-width': '1.5' }));
  svg.replaceChildren(el('defs', {}, [el('clipPath', { id: 'smith-clip' }, [el('circle', { cx: CX, cy: CY, r: R })])]), g);
}

const SW = 260, SH = 130, SML = 30, SMB = 22, SMT = 16;
function drawSwr(svg, a, f) {
  const g = el('g');
  const w = SW - SML - 8, h = SH - SMT - SMB;
  const X = (fq) => SML + ((fq - F_MIN) / (F_MAX - F_MIN)) * w;
  const Y = (s) => SMT + h - ((Math.min(s, 5) - 1) / 4) * h;
  g.append(el('text', { x: SML + w / 2, y: 10, 'text-anchor': 'middle', fill: 'var(--muted)', 'font-size': '10', text: 'SWR vs frequenza' }));
  for (const s of [1, 2, 3, 5]) {
    g.append(el('line', { x1: SML, y1: Y(s), x2: SML + w, y2: Y(s), stroke: s === 2 ? '#ef4444' : 'var(--line)', 'stroke-dasharray': s === 2 ? '4 3' : '2 3' }));
    g.append(el('text', { x: SML - 4, y: Y(s) + 3, 'text-anchor': 'end', fill: 'var(--dim)', 'font-size': '8', text: `${s}:1` }));
  }
  for (const fq of [860, 865, 870, 875, 880]) g.append(el('text', { x: X(fq), y: SH - 6, 'text-anchor': 'middle', fill: 'var(--dim)', 'font-size': '8', text: `${fq}` }));
  let d = '';
  for (let fq = F_MIN; fq <= F_MAX; fq += 0.25) d += (d ? 'L' : 'M') + `${X(fq).toFixed(1)},${Y(vswr(gamma(impedance(a, fq)))).toFixed(1)}`;
  g.append(el('path', { d, fill: 'none', stroke: 'var(--accent)', 'stroke-width': '1.5' }));
  g.append(el('line', { x1: X(f), y1: SMT, x2: X(f), y2: SMT + h, stroke: 'var(--fg)', 'stroke-dasharray': '2 2' }));
  const [lo, hi] = swrBand(a, 2);
  g.append(el('rect', { x: X(lo), y: SMT + h + 2, width: Math.max(0, X(hi) - X(lo)), height: 3, fill: 'var(--accent)' }));
  svg.replaceChildren(g);
}

// Banda in cui SWR <= limite, cercata su 700-1100 MHz (oltre la finestra del grafico).
function swrBand(a, limit) {
  let lo = null, hi = null;
  for (let fq = 700; fq <= 1100; fq += 0.5) {
    if (vswr(gamma(impedance(a, fq))) <= limit) { lo ??= fq; hi = fq; }
  }
  return lo === null ? [F0, F0] : [lo, hi];
}

// --- widget ---------------------------------------------------------------

export default function mount(root) {
  const controls = el('div', { class: 'widget__controls' });
  const field = (label, input, out) => { controls.append(el('label', {}, [label, ' ', out, input])); return input; };

  const antOut = el('output');
  const antSel = field('Antenna', el('select', {}, ANTENNAS.map((a, i) => el('option', { value: String(i), text: a.name }))), antOut);
  const scnOut = el('output');
  const scnSel = field('Scenario', el('select', {}, Object.entries(SCENARIOS).map(([k, s]) => el('option', { value: k, text: s.label }))), scnOut);
  const tiltOut = el('output');
  const tilt = field('Tilt meccanico (elevazione)', el('input', { type: 'range', min: '-10', max: '40', step: '1', value: '0' }), tiltOut);
  const fOut = el('output');
  const freq = field('Frequenza', el('input', { type: 'range', min: String(F_MIN), max: String(F_MAX), step: '0.5', value: String(F0) }), fOut);
  root.append(controls);

  const svgAz = el('svg', { viewBox: `0 0 ${S} ${S}`, role: 'img', 'aria-label': 'Diagramma di radiazione in azimuth con i nodi dello scenario' });
  const svgEl_ = el('svg', { viewBox: `0 0 ${S} ${S}`, role: 'img', 'aria-label': 'Diagramma di radiazione in elevazione' });
  const svgSm = el('svg', { viewBox: `0 0 ${S} ${S}`, role: 'img', 'aria-label': 'Carta di Smith con impedenza dell’antenna' });
  const svgSw = el('svg', { viewBox: `0 0 ${SW} ${SH}`, role: 'img', 'aria-label': 'SWR in funzione della frequenza' });
  root.append(el('div', { class: 'widget__stage antenna__stage' }, [svgAz, svgEl_, svgSm, svgSw]));

  const out = el('dl', { class: 'widget__out' });
  const mk = (label) => { const dd = el('dd'); out.append(el('div', {}, [el('dt', { text: label }), dd])); return dd; };
  const ddCov = mk('Nodi entro −3 dB');
  const ddGain = mk('Guadagno');
  const ddHpbw = mk('Apertura −3 dB (az × el)');
  const ddZ = mk('Impedenza');
  const ddSwr = mk('SWR');
  const ddBand = mk('Banda SWR ≤ 2');
  const ddSize = mk('Dimensioni');
  root.append(out);

  const verdict = el('p', { class: 'widget__note' });
  root.append(verdict);

  // Lunghezze: λ = 299.79/f m. Dipolo λ/2 sottile: 143/f m (fattore d'accorciamento ~0.95).
  const lenF = el('input', { type: 'number', min: '400', max: '1000', step: '0.1', value: String(F0) });
  const lenOut = el('dl', { class: 'widget__out' });
  const lenMk = (label) => { const dd = el('dd'); lenOut.append(el('div', {}, [el('dt', { text: label }), dd])); return dd; };
  const ddLam = lenMk('λ');
  const ddDip = lenMk('Dipolo λ/2 (totale)');
  const ddQ = lenMk('Braccio λ/4 / radiale');
  const ddFe = lenMk('Verticale 5/8λ');
  root.append(el('details', { class: 'antenna__calc' }, [
    el('summary', { text: 'Calcolo lunghezze (autocostruzione)' }),
    el('div', { class: 'widget__controls' }, [el('label', {}, ['Frequenza di progetto (MHz) ', lenF])]),
    lenOut,
    el('p', { class: 'widget__note', text: 'Formula empirica per filo sottile: L(m) = 143 / f(MHz) per il dipolo intero. Tagliare più lungo del 2–3 % e accorciare misurando con un NanoVNA: il fattore d’accorciamento dipende dal diametro del conduttore e dagli oggetti vicini.' }),
  ]));

  function renderLen() {
    const f = Number(lenF.value) || F0;
    const lam = 299.79 / f;
    ddLam.textContent = `${fmt(lam * 100, 1)} cm`;
    ddDip.textContent = `${fmt((143 / f) * 100, 1)} cm`;
    ddQ.textContent = `${fmt((143 / f / 2) * 100, 1)} cm`;
    ddFe.textContent = `${fmt(0.625 * lam * 100, 1)} cm`;
  }

  function render() {
    const a = ANTENNAS[Number(antSel.value)];
    const scn = SCENARIOS[scnSel.value];
    const t = Number(tilt.value);
    const f = Number(freq.value);
    antOut.textContent = '';
    scnOut.textContent = '';
    tiltOut.textContent = `${t}°`;
    fOut.textContent = `${fmt(f, 1)} MHz`;

    const covered = drawAzimuth(svgAz, a, scn);
    drawElevation(svgEl_, a, t);
    drawSmith(svgSm, a, f);
    drawSwr(svgSw, a, f);

    const z = impedance(a, f);
    const s = vswr(gamma(z));
    const [lo, hi] = swrBand(a, 2);
    const n = scn.nodes.length;
    ddCov.textContent = `${covered} / ${n}`;
    ddCov.className = covered === n ? 'is-ok' : covered >= n / 2 ? 'is-warn' : 'is-bad';
    ddGain.textContent = `${fmt(a.gain, 1)} dBi (${fmt(a.gain - 2.15, 1)} dBd)`;
    ddHpbw.textContent = a.omni ? `360° × ${a.hpbwEl}°` : `${a.hpbwAz}° × ${a.hpbwEl}°`;
    ddZ.textContent = `${fmt(z.r, 0)} ${z.x < -0.5 ? '−' : '+'} j${fmt(Math.abs(z.x), 0)} Ω`;
    ddSwr.textContent = `${fmt(s, 2)}:1`;
    ddSwr.className = s <= 1.5 ? 'is-ok' : s <= 2 ? 'is-warn' : 'is-bad';
    ddBand.textContent = lo === hi ? 'fuori banda' : `${fmt(lo, 1)}–${fmt(hi, 1)} MHz`;
    ddSize.textContent = a.size;

    const gainNote = a.omni
      ? 'il guadagno viene dallo schiacciare il lobo verso l’orizzonte: nodi molto più in alto o in basso ricevono meno.'
      : `il guadagno viene dal concentrare l’energia in ${a.hpbwAz}°: ciò che sta fuori dal lobo perde decine di dB, il retro ${a.fbDb} dB.`;
    verdict.textContent = `${covered === n ? 'Tutti' : `${covered} su ${n}`} i nodi dello scenario cadono entro −3 dB dal massimo. ${a.gain > 5 ? 'Antenna direttiva: ' : 'Antenna omnidirezionale: '}${gainNote} Il diagramma è un modello didattico (cosⁿ dall’apertura −3 dB), non una misura.`;
  }

  for (const c of [antSel, scnSel, tilt, freq]) c.addEventListener('input', render);
  lenF.addEventListener('input', renderLen);
  render();
  renderLen();
}
