// Simulatore duty cycle: time-on-air, airtime/ora e tetto normativo del 10%
// (EN 300 220-2). Formule condivise in ./rf.js.
import { timeOnAir, DUTY_LIMIT, fmt, reducedMotion } from './rf.js';

const W = 600, H = 70, BAND_Y = 20, BAND_H = 30;
const CAP_X = W * DUTY_LIMIT;
const PKT_MIN = 1, PKT_MAX = 1200;
const sliderToPkt = (p) => Math.round(PKT_MIN * (PKT_MAX / PKT_MIN) ** (p / 100));
const pktToSlider = (n) => (100 * Math.log(n / PKT_MIN)) / Math.log(PKT_MAX / PKT_MIN);

export default function mount(root) {
  root.innerHTML = `
    <div class="widget__controls">
      <label>Pacchetti/ora <output id="dc-pktout">60 pkt/h</output>
        <input type="range" id="dc-pkt" min="0" max="100" step="0.1" value="${pktToSlider(60)}">
      </label>
      <label>Payload <output id="dc-plout">50 B</output>
        <input type="range" id="dc-pl" min="10" max="200" step="1" value="50">
      </label>
      <label>Spreading factor
        <select id="dc-sf">
          ${[7, 8, 9, 10, 11, 12].map((v) => `<option value="${v}"${v === 8 ? ' selected' : ''}>SF${v}</option>`).join('')}
        </select>
      </label>
      <label>Banda
        <select id="dc-bw">
          ${[62.5, 125, 250].map((v) => `<option value="${v}"${v === 62.5 ? ' selected' : ''}>${v} kHz</option>`).join('')}
        </select>
      </label>
    </div>
    <div class="widget__stage">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Timeline di un'ora con i pacchetti trasmessi">
        <rect x="0" y="${BAND_Y}" width="${W}" height="${BAND_H}" fill="none" stroke="var(--line)"></rect>
        <rect id="dc-fill" x="0" y="${BAND_Y}" width="0" height="${BAND_H}" fill="var(--accent)" opacity=".18"></rect>
        <line id="dc-ticks" x1="0" y1="${BAND_Y + BAND_H / 2}" x2="0" y2="${BAND_Y + BAND_H / 2}" stroke="var(--accent)" stroke-width="${BAND_H}"></line>
        <line x1="${CAP_X}" y1="${BAND_Y - 6}" x2="${CAP_X}" y2="${BAND_Y + BAND_H + 6}" stroke="#ef4444" stroke-width="2" stroke-dasharray="4 4"></line>
        <text x="${CAP_X}" y="${BAND_Y - 9}" fill="#ef4444" font-size="9" font-family="var(--font-mono)" text-anchor="middle">10% (6 min)</text>
        <text x="0" y="${H - 4}" fill="var(--dim)" font-size="9" font-family="var(--font-mono)">0 min</text>
        <text x="${W}" y="${H - 4}" fill="var(--dim)" font-size="9" font-family="var(--font-mono)" text-anchor="end">60 min</text>
      </svg>
    </div>
    <dl class="widget__out">
      <div><dt>Time on air/pacchetto</dt><dd id="dc-toa">–</dd></div>
      <div><dt>Airtime totale/ora</dt><dd id="dc-air">–</dd></div>
      <div><dt>Duty cycle</dt><dd id="dc-duty">–</dd></div>
      <div><dt>Pacchetti max/ora (10%)</dt><dd id="dc-max">–</dd></div>
    </dl>
    <p class="widget__note">Time-on-air stimato per SX1262 (CR 4/8, preambolo 8, LDRO automatico). Il limite del 10% è normativo (EN 300 220-2): il firmware non lo conteggia, il rispetto è a carico dell'operatore.</p>
  `;

  const pktEl = root.querySelector('#dc-pkt');
  const pktOut = root.querySelector('#dc-pktout');
  const plEl = root.querySelector('#dc-pl');
  const plOut = root.querySelector('#dc-plout');
  const sfEl = root.querySelector('#dc-sf');
  const bwEl = root.querySelector('#dc-bw');
  const fillRect = root.querySelector('#dc-fill');
  const ticksLine = root.querySelector('#dc-ticks');
  const toaOut = root.querySelector('#dc-toa');
  const airOut = root.querySelector('#dc-air');
  const dutyOut = root.querySelector('#dc-duty');
  const maxOut = root.querySelector('#dc-max');

  const still = reducedMotion();
  let frac = still ? 1 : 0;

  function draw() {
    const x = frac * W;
    fillRect.setAttribute('width', x);
    ticksLine.setAttribute('x2', x);
  }

  function recompute() {
    const pkt = sliderToPkt(+pktEl.value);
    const payload = +plEl.value;
    const sf = +sfEl.value;
    const bw = +bwEl.value;
    const toa = timeOnAir(payload, sf, bw);
    const airtimeS = (toa / 1000) * pkt;
    const dutyPct = (airtimeS / 3600) * 100;
    const maxPkt = Math.floor((DUTY_LIMIT * 3600 * 1000) / toa);

    pktOut.textContent = `${pkt} pkt/h`;
    plOut.textContent = `${payload} B`;
    toaOut.textContent = `${fmt(toa, 0)} ms`;
    airOut.textContent = `${fmt(airtimeS, 1)} s`;
    dutyOut.textContent = `${fmt(dutyPct, 2)} %`;
    dutyOut.className = dutyPct > DUTY_LIMIT * 100 ? 'is-bad' : dutyPct >= 5 ? 'is-warn' : 'is-ok';
    maxOut.textContent = String(maxPkt);

    const spacing = W / pkt;
    ticksLine.setAttribute('stroke-dasharray', `1 ${Math.max(spacing - 1, 0.05)}`);
    draw();
  }

  for (const [ctl, evt] of [[pktEl, 'input'], [plEl, 'input'], [sfEl, 'change'], [bwEl, 'change']]) {
    ctl.addEventListener(evt, recompute);
  }
  recompute();

  if (still) return;

  let raf = null, startTs = null;
  function frame(ts) {
    if (startTs === null) startTs = ts;
    frac = ((ts - startTs) % 4000) / 4000;
    draw();
    raf = requestAnimationFrame(frame);
  }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      if (raf === null) { startTs = null; raf = requestAnimationFrame(frame); }
    } else if (raf !== null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  });
  io.observe(root);
}
