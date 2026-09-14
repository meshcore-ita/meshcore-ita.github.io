// Profilo laterale con zona di Fresnel; scala Y (m) volutamente esagerata su X (km).
import { PRESET, fresnelRadius, fmt, el } from './rf.js';

const SVG_NS = 'http://www.w3.org/2000/svg';
const setAttrs = (n, attrs = {}) => {
  for (const k in attrs) k === 'text' ? (n.textContent = attrs[k]) : n.setAttribute(k, attrs[k]);
  return n;
};
const svgEl = (tag, attrs) => setAttrs(document.createElementNS(SVG_NS, tag), attrs);

const N = 40; // campioni
const W = 600, H = 280, MX = 42, MYT = 22, MYB = 34;
const PW = W - MX * 2, PH = H - MYT - MYB;
const FGHZ = PRESET.freqMHz / 1000;

const range = (label, min, max, step, value, unit) => {
  const out = el('output', { text: `${value} ${unit}` });
  const input = el('input', { type: 'range', min, max, step, value });
  return { lab: el('label', {}, [document.createTextNode(`${label} `), out, input]), input, out };
};

export default function mount(root) {
  const [dist, hA, hB, pos, hO] = [
    ['Distanza', 1, 40, .5, 10, 'km'],
    ['Altezza antenna A', 2, 60, 1, 10, 'm'],
    ['Altezza antenna B', 2, 60, 1, 10, 'm'],
    ['Posizione ostacolo', 5, 95, 1, 50, '%'],
    ['Altezza ostacolo', 0, 80, 1, 12, 'm'],
  ].map((a) => range(...a));
  const controls = el('div', { class: 'widget__controls' }, [dist.lab, hA.lab, hB.lab, pos.lab, hO.lab]);

  const ground = svgEl('line', { stroke: 'var(--line-strong)' });
  const fresnel100 = svgEl('path', { fill: 'var(--accent)', opacity: .14 });
  const fresnel60 = svgEl('path', { fill: 'var(--accent)', opacity: .34 });
  const los = svgEl('line', { stroke: 'var(--fg)', 'stroke-width': 1.25 });
  const poleA = svgEl('line', { stroke: 'var(--fg)', 'stroke-width': 2 });
  const poleB = svgEl('line', { stroke: 'var(--fg)', 'stroke-width': 2 });
  const obstacle = svgEl('rect', { fill: 'var(--muted)', stroke: 'var(--fg)', style: 'cursor:grab;touch-action:none' });
  const scaleTxt = svgEl('text', { x: 6, y: H - 8, fill: 'var(--dim)', 'font-size': 10, text: 'scala verticale esagerata' });
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, 'aria-label': 'Profilo della tratta con zona di Fresnel' });
  svg.append(ground, fresnel100, fresnel60, los, poleA, poleB, obstacle, scaleTxt);
  const stage = el('div', { class: 'widget__stage' }, [svg]);

  const [outR1, outClr, outLos, outFree, outStatus] = [0, 1, 2, 3, 4].map(() => el('dd', {}));
  const out = el('dl', { class: 'widget__out' }, [
    el('div', {}, [el('dt', { text: "r₁ all'ostacolo" }), outR1]),
    el('div', {}, [el('dt', { text: 'Clearance 60% richiesta' }), outClr]),
    el('div', {}, [el('dt', { text: 'Quota linea di vista' }), outLos]),
    el('div', {}, [el('dt', { text: 'Spazio libero effettivo' }), outFree]),
    el('div', {}, [el('dt', { text: 'Stato' }), outStatus]),
  ]);
  const note = el('p', {
    class: 'widget__note',
    text: "ITU-R P.526 richiede almeno il 60% del raggio della prima zona di Fresnel libero da ostacoli. Trascina il rettangolo per muoverlo.",
  });
  root.append(controls, stage, out, note);

  const xOf = (xKm, d) => MX + (xKm / d) * PW;
  let yMin = 0, yMax = 1;
  const yOf = (m) => MYT + PH - ((m - yMin) / (yMax - yMin)) * PH;
  const pathOf = (top, bot, d) => {
    const p = top.map(([x, y]) => `${xOf(x, d)},${yOf(y)}`);
    const q = bot.slice().reverse().map(([x, y]) => `${xOf(x, d)},${yOf(y)}`);
    return `M${p.join('L')}L${q.join('L')}Z`;
  };

  function render() {
    const d = Number(dist.input.value), ha = Number(hA.input.value), hb = Number(hB.input.value);
    const pc = Number(pos.input.value), ho = Number(hO.input.value);
    dist.out.textContent = `${fmt(d, 1)} km`; hA.out.textContent = `${fmt(ha, 0)} m`; hB.out.textContent = `${fmt(hb, 0)} m`;
    pos.out.textContent = `${fmt(pc, 0)} %`; hO.out.textContent = `${fmt(ho, 0)} m`;

    const tops = [], bots = [], top6 = [], bot6 = [];
    let hi = Math.max(ha, hb, ho), lo = 0;
    for (let i = 0; i < N; i++) {
      const xKm = (d * i) / (N - 1);
      const yl = ha + ((hb - ha) * i) / (N - 1);
      const r = fresnelRadius(xKm, d, FGHZ);
      tops.push([xKm, yl + r]); bots.push([xKm, yl - r]);
      top6.push([xKm, yl + .6 * r]); bot6.push([xKm, yl - .6 * r]);
      if (yl + r > hi) hi = yl + r;
      if (yl - r < lo) lo = yl - r;
    }
    yMax = hi * 1.12; yMin = lo * 1.12;
    fresnel100.setAttribute('d', pathOf(tops, bots, d));
    fresnel60.setAttribute('d', pathOf(top6, bot6, d));

    const gy = yOf(0), xA = xOf(0, d), xB = xOf(d, d), yA = yOf(ha), yB = yOf(hb);
    setAttrs(ground, { x1: MX, x2: W - MX, y1: gy, y2: gy });
    setAttrs(poleA, { x1: xA, x2: xA, y1: gy, y2: yA });
    setAttrs(poleB, { x1: xB, x2: xB, y1: gy, y2: yB });
    setAttrs(los, { x1: xA, y1: yA, x2: xB, y2: yB });
    const xO = xOf((pc / 100) * d, d);
    setAttrs(obstacle, { x: xO - 7, width: 14, y: yOf(ho), height: Math.max(gy - yOf(ho), 1) });

    const d1 = (pc / 100) * d, r1 = fresnelRadius(d1, d, FGHZ), clr60 = .6 * r1;
    const yLos = ha + (hb - ha) * (pc / 100), free = yLos - ho;
    outR1.textContent = `${fmt(r1, 1)} m`; outClr.textContent = `${fmt(clr60, 1)} m`;
    outLos.textContent = `${fmt(yLos, 1)} m`; outFree.textContent = `${fmt(free, 1)} m`;
    const [cls, msg] = free < 0 ? ['is-bad', 'Ostruito']
      : free >= clr60 ? ['is-ok', 'Libero']
      : ['is-warn', 'Marginale'];
    outFree.className = cls; outStatus.className = cls; outStatus.textContent = msg;
  }

  for (const { input } of [dist, hA, hB, pos, hO]) input.addEventListener('input', render);

  let dragging = false;
  const endDrag = () => { dragging = false; obstacle.style.cursor = 'grab'; };
  obstacle.addEventListener('pointerdown', (e) => {
    dragging = true; obstacle.setPointerCapture(e.pointerId); obstacle.style.cursor = 'grabbing';
  });
  obstacle.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const r = svg.getBoundingClientRect();
    const pct = (((e.clientX - r.left) / r.width) * W - MX) / PW * 100;
    pos.input.value = Math.round(Math.min(95, Math.max(5, pct)));
    render();
  });
  ['pointerup', 'pointercancel'].forEach((t) => obstacle.addEventListener(t, endDrag));

  render();
}
