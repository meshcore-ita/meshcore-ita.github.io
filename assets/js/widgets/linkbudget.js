import {
  ERP_LIMIT_DBM,
  DBI_TO_DBD,
  dbmToMw,
  fspl,
  sensitivity,
  fmt,
  el,
} from './rf.js';

const FREQ = 869.618;
const SVGNS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attrs = {}) {
  const node = document.createElementNS(SVGNS, tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') node.textContent = v;
    else node.setAttribute(k, v);
  }
  return node;
}

function range(controls, { label, unit, min, max, step, value }) {
  const out = el('output', { text: String(value) });
  const input = el('input', {
    type: 'range',
    min: String(min),
    max: String(max),
    step: String(step),
    value: String(value),
  });
  controls.append(
    el('label', {}, [`${label} `, out, ` ${unit}`, input]),
  );
  return { input, out };
}

function select(controls, { label, options, value }) {
  const sel = el('select', {});
  for (const o of options) {
    const opt = el('option', { value: String(o), text: String(o) });
    if (o === value) opt.selected = true;
    sel.append(opt);
  }
  controls.append(el('label', {}, [label, sel]));
  return sel;
}

export default function mount(root) {
  const controls = el('div', { class: 'widget__controls' });
  const ptx = range(controls, { label: 'Potenza TX', unit: 'dBm', min: 0, max: 22, step: 1, value: 22 });
  const gtx = range(controls, { label: 'Guadagno antenna TX', unit: 'dBi', min: 0, max: 9, step: 0.5, value: 2 });
  const ltx = range(controls, { label: 'Perdita cavo TX', unit: 'dB', min: 0, max: 6, step: 0.5, value: 0.5 });
  const grx = range(controls, { label: 'Guadagno antenna RX', unit: 'dBi', min: 0, max: 9, step: 0.5, value: 2 });
  const lrx = range(controls, { label: 'Perdita cavo RX', unit: 'dB', min: 0, max: 6, step: 0.5, value: 0.5 });
  const dist = range(controls, { label: 'Distanza', unit: 'km', min: 0.5, max: 60, step: 0.5, value: 10 });
  const sf = select(controls, { label: 'Spreading factor (SF)', options: [7, 8, 9, 10, 11, 12], value: 8 });
  const bw = select(controls, { label: 'Larghezza di banda (BW)', options: [62.5, 125, 250], value: 62.5 });
  root.append(controls);

  const W = 400;
  const H = 70;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}` });
  const MIN_DB = -20;
  const MAX_DB = 100;
  const x = (v) => ((Math.min(Math.max(v, MIN_DB), MAX_DB) - MIN_DB) / (MAX_DB - MIN_DB)) * W;
  const bar = svgEl('rect', { x: String(x(0)), y: '22', height: '20', rx: '3' });
  const zero = svgEl('line', { x1: String(x(0)), x2: String(x(0)), y1: '10', y2: '52', stroke: 'var(--dim)' });
  const zeroLabel = svgEl('text', { x: String(x(0)), y: '66', 'text-anchor': 'middle', class: 'widget__val', text: '0 dB' });
  const marginLabel = svgEl('text', { y: '14', 'text-anchor': 'middle', class: 'widget__val' });
  svg.append(bar, zero, zeroLabel, marginLabel);
  root.append(el('div', { class: 'widget__stage' }, [svg]));

  const out = el('dl', { class: 'widget__out' });
  const mk = (label) => {
    const dd = el('dd', {});
    out.append(el('div', {}, [el('dt', { text: label }), dd]));
    return dd;
  };
  const ddFspl = mk('FSPL');
  const ddSens = mk('Sensibilità stimata');
  const ddMargin = mk('Margine');
  const ddErpDbm = mk('ERP effettivo');
  const ddErpMw = mk('ERP effettivo');
  root.append(out);

  root.append(
    el('p', { class: 'widget__note', text: 'Solo spazio libero: ostacoli e zona di Fresnel non inclusi, vedi il visualizzatore qui sotto.' }),
  );

  function cls(v, ok, warn) {
    if (v >= ok) return 'is-ok';
    if (v >= warn) return 'is-warn';
    return 'is-bad';
  }

  function recalc() {
    const pTx = Number(ptx.input.value);
    const gTx = Number(gtx.input.value);
    const lTx = Number(ltx.input.value);
    const gRx = Number(grx.input.value);
    const lRx = Number(lrx.input.value);
    const d = Number(dist.input.value);
    const s = Number(sf.value);
    const b = Number(bw.value);

    ptx.out.textContent = fmt(pTx, 0);
    gtx.out.textContent = fmt(gTx, 1);
    ltx.out.textContent = fmt(lTx, 1);
    grx.out.textContent = fmt(gRx, 1);
    lrx.out.textContent = fmt(lRx, 1);
    dist.out.textContent = fmt(d, 1);

    const loss = fspl(d, FREQ);
    const sens = sensitivity(s, b);
    const margin = pTx + gTx - lTx + gRx - lRx - loss - sens;
    const erpDbm = pTx + gTx - DBI_TO_DBD - lTx;
    const erpMw = dbmToMw(erpDbm);

    ddFspl.textContent = `${fmt(loss)} dB`;
    ddSens.textContent = `${fmt(sens)} dBm`;
    ddMargin.textContent = `${fmt(margin)} dB`;
    const marginCls = cls(margin, 15, 5);
    ddMargin.className = marginCls;
    ddErpDbm.textContent = `${fmt(erpDbm)} dBm`;
    ddErpMw.textContent = `${fmt(erpMw, 0)} mW`;
    const erpBad = erpDbm > ERP_LIMIT_DBM;
    ddErpDbm.className = erpBad ? 'is-bad' : 'is-ok';
    ddErpMw.className = erpBad ? 'is-bad' : 'is-ok';

    const x0 = x(0);
    const x1 = x(margin);
    bar.setAttribute('x', String(Math.min(x0, x1)));
    bar.setAttribute('width', String(Math.abs(x1 - x0)));
    const color = marginCls === 'is-ok' ? 'var(--accent)' : marginCls === 'is-warn' ? '#f59e0b' : '#ef4444';
    bar.setAttribute('fill', color);
    marginLabel.setAttribute('x', String(Math.min(Math.max(x1, 20), W - 20)));
    marginLabel.textContent = `margine ${fmt(margin)} dB`;
  }

  for (const c of [ptx, gtx, ltx, grx, lrx, dist]) c.input.addEventListener('input', recalc);
  sf.addEventListener('input', recalc);
  bw.addEventListener('input', recalc);
  recalc();
}
