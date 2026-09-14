// Chirp LoRa: spettrogramma tempo-frequenza + struttura del pacchetto.
import { PRESET, sensitivity, timeOnAir, bitrate, fmt, el, reducedMotion } from './rf.js';
const SF_MIN = 7, SF_MAX = 12;
const BW_OPTS = [62.5, 125, 250];
const SLOWDOWN = 20; // ms di segnale reale per 1 s di animazione (~50x più lenta, altrimenti invisibile)
const PREAMBLE_SYM = 8 + 4.25;
const HEADER_SYM = 8; // simboli fissi di overhead header esplicito nella formula di rf.timeOnAir

function state(sfSel, bwSel, plRange) {
  const sf = Number(sfSel.value), bw = Number(bwSel.value), payload = Number(plRange.value);
  const tSym = 2 ** sf / bw;
  const total = timeOnAir(payload, sf, bw);
  const preambleMs = tSym * PREAMBLE_SYM;
  const headerMs = tSym * HEADER_SYM;
  const payloadMs = Math.max(total - preambleMs - headerMs, 0);
  return { sf, bw, payload, tSym, total, preambleMs, headerMs, payloadMs, br: bitrate(sf, bw), sens: sensitivity(sf, bw) };
}

function drawSpectrogram(ctx, d, elapsedMs, col) {
  const x0 = 46, y0 = 26, w = 578, h = 108;
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(x0, y0, w, h);
  ctx.fillStyle = col.fg;
  ctx.textAlign = 'left';
  ctx.fillText(`Spettrogramma chirp — T_sym = ${fmt(d.tSym, 3)} ms`, x0, 16);
  ctx.fillStyle = col.dim;
  ctx.textAlign = 'right';
  ctx.fillText(`${d.bw}`, x0 - 6, y0 + 9);
  ctx.fillText(`${d.bw / 2}`, x0 - 6, y0 + h / 2 + 4);
  ctx.fillText('0', x0 - 6, y0 + h - 2);
  ctx.textAlign = 'left';
  ctx.fillText('kHz', 4, 16);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x0, y0, w, h);
  ctx.clip();
  const tileW = Math.min(Math.max(d.tSym * 30, 16), w);
  const wallMsPerTile = (d.tSym / SLOWDOWN) * 1000;
  const offset = ((elapsedMs % wallMsPerTile) / wallMsPerTile) * tileW;
  ctx.strokeStyle = col.accent;
  ctx.lineWidth = 2;
  for (let i = -1, n = Math.ceil(w / tileW) + 2; i < n; i++) {
    const xs = x0 + i * tileW - offset;
    ctx.beginPath(); ctx.moveTo(xs, y0 + h); ctx.lineTo(xs + tileW, y0); ctx.stroke();
  }
  ctx.restore();
  ctx.strokeStyle = col.line;
  ctx.strokeRect(x0, y0, w, h);
}

function drawPacket(ctx, d, col) {
  const x0 = 46, y0 = 168, w = 578, h = 34;
  ctx.fillStyle = col.dim; ctx.textAlign = 'left';
  ctx.fillText('Struttura del pacchetto', x0, y0 - 8);
  const segs = [
    ['Preambolo', d.preambleMs, col.dim, col.fg],
    ['Header', d.headerMs, '#f59e0b', '#0a0a0a'],
    ['Payload', d.payloadMs, col.accent, '#0a0a0a'],
  ];
  let x = x0;
  for (const [label, ms, fill, text] of segs) {
    const sw = Math.max((ms / d.total) * w, 1);
    ctx.fillStyle = fill;
    ctx.fillRect(x, y0, sw, h);
    if (sw > 50) {
      ctx.fillStyle = text; ctx.textAlign = 'center';
      ctx.fillText(label, x + sw / 2, y0 + h / 2 - 3);
      ctx.fillText(`${fmt(ms, 0)} ms`, x + sw / 2, y0 + h / 2 + 11);
    }
    x += sw;
  }
  ctx.strokeStyle = col.line; ctx.strokeRect(x0, y0, w, h);
  ctx.fillStyle = col.fg; ctx.textAlign = 'right';
  ctx.fillText(`totale ${fmt(d.total, 0)} ms`, x0 + w, y0 + h + 16);
}

export default function mount(root) {
  const sfSel = el('select', {});
  for (let s = SF_MIN; s <= SF_MAX; s++) sfSel.append(el('option', { value: s, text: `SF${s}` }));
  sfSel.value = PRESET.sf;
  const bwSel = el('select', {});
  for (const b of BW_OPTS) bwSel.append(el('option', { value: b, text: `${b} kHz` }));
  bwSel.value = PRESET.bw;
  const plOut = el('output', { text: '50' });
  const plRange = el('input', { type: 'range', min: '10', max: '200', step: '1', value: '50' });
  root.append(el('div', { class: 'widget__controls' }, [
    el('label', {}, ['Spreading factor (SF)', sfSel]),
    el('label', {}, ['Larghezza di banda (BW)', bwSel]),
    el('label', {}, ['Payload ', plOut, ' B', plRange]),
  ]));
  const canvas = el('canvas', { width: '640', height: '224' });
  root.append(el('div', { class: 'widget__stage' }, [canvas]));
  const out = el('dl', { class: 'widget__out' });
  const mk = (label) => { const dd = el('dd', {}); out.append(el('div', {}, [el('dt', { text: label }), dd])); return dd; };
  const oTsym = mk('T_sym'), oBitrate = mk('Bitrate'), oToa = mk('Tempo in aria'), oSens = mk('Sensibilità stimata');
  root.append(out);
  root.append(el('p', {
    class: 'widget__note',
    text: `Animazione rallentata di circa 50×: 1 s mostrato ≈ ${SLOWDOWN} ms di segnale reale, altrimenti il chirp sarebbe troppo veloce per essere visto. Preambolo 8+4.25 simboli, header esplicito, CRC on — vedi rf.timeOnAir.`,
  }));
  const ctx = canvas.getContext('2d');
  const css = getComputedStyle(document.documentElement);
  const col = {
    accent: css.getPropertyValue('--accent').trim(),
    fg: css.getPropertyValue('--fg').trim(),
    dim: css.getPropertyValue('--dim').trim(),
    line: css.getPropertyValue('--line').trim(),
  };
  ctx.font = `11px ${css.getPropertyValue('--font-mono').trim() || 'monospace'}`;
  let raf = 0, t0 = 0, lastT = 0;
  function render(elapsed) {
    lastT = elapsed;
    const d = state(sfSel, bwSel, plRange);
    oTsym.textContent = `${fmt(d.tSym, 3)} ms`;
    oBitrate.textContent = `${fmt(d.br, 0)} bit/s`;
    oToa.textContent = `${fmt(d.total, 0)} ms`;
    oSens.textContent = `${fmt(d.sens, 0)} dBm`;
    ctx.clearRect(0, 0, 640, 224);
    drawSpectrogram(ctx, d, elapsed, col);
    drawPacket(ctx, d, col);
  }

  function loop(ts) {
    if (!t0) t0 = ts;
    render(ts - t0);
    raf = requestAnimationFrame(loop);
  }
  function start() {
    if (raf || reducedMotion()) { render(lastT); return; }
    t0 = 0;
    raf = requestAnimationFrame(loop);
  }
  function stop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop())).observe(root);
  sfSel.oninput = bwSel.oninput = () => render(lastT);
  plRange.oninput = () => { plOut.textContent = plRange.value; render(lastT); };
  render(0);
}
