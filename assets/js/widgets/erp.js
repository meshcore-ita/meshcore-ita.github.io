// Calcolatore ERP/EIRP: guadagno antenna, perdita cavo, potenza impostata
// su radio -> ERP effettivo e potenza massima consentita per set tx.
import { ERP_LIMIT_DBM, DBI_TO_DBD, dbmToMw, maxTxDbm, fmt } from './rf.js';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const gx = (dbm) => 20 + (clamp(dbm, 0, 30) / 30) * 280;

export default function mount(root) {
  root.innerHTML = `
    <div class="widget__controls">
      <label>Guadagno antenna <output id="erp-gain-out">5.0</output> dBi
        <input type="range" id="erp-gain" min="0" max="12" step="0.5" value="5">
      </label>
      <label>Perdita cavo+connettori <output id="erp-loss-out">1.0</output> dB
        <input type="range" id="erp-loss" min="0" max="6" step="0.1" value="1">
      </label>
      <label>Potenza impostata (set tx) <output id="erp-tx-out">22</output> dBm
        <input type="range" id="erp-tx" min="1" max="22" step="1" value="22">
      </label>
    </div>
    <div class="widget__stage">
      <svg viewBox="0 0 320 70" role="img" aria-label="Gauge ERP da 0 a 30 dBm">
        <line x1="20" y1="40" x2="300" y2="40" stroke="var(--line)" stroke-width="2"/>
        ${[0, 10, 20, 30].map((v) => `<line x1="${gx(v)}" y1="34" x2="${gx(v)}" y2="46" stroke="var(--dim)"/><text x="${gx(v)}" y="62" font-size="9" fill="var(--muted)" text-anchor="middle" font-family="var(--font-mono)">${v}</text>`).join('')}
        <line x1="${gx(ERP_LIMIT_DBM)}" y1="16" x2="${gx(ERP_LIMIT_DBM)}" y2="52" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="3,2"/>
        <text x="${gx(ERP_LIMIT_DBM)}" y="12" font-size="9" fill="#ef4444" text-anchor="middle" font-family="var(--font-mono)">${ERP_LIMIT_DBM}</text>
        <circle id="erp-mark" cx="20" cy="40" r="6" fill="var(--accent)" stroke="var(--bg)" stroke-width="1.5"/>
      </svg>
    </div>
    <dl class="widget__out">
      <div><dt>Guadagno antenna</dt><dd id="erp-gaindbd"></dd></div>
      <div><dt>ERP risultante</dt><dd id="erp-erp"></dd></div>
      <div><dt>EIRP</dt><dd id="erp-eirp"></dd></div>
      <div><dt>TX massimo consentito</dt><dd id="erp-maxtx"></dd></div>
    </dl>
    <pre class="widget__cmd" id="erp-cmd"></pre>
    <p class="widget__note">Non è consulenza legale: verifica la fonte 1 in fondo alla pagina.</p>
  `;

  const gain = root.querySelector('#erp-gain');
  const loss = root.querySelector('#erp-loss');
  const tx = root.querySelector('#erp-tx');
  const gainOut = root.querySelector('#erp-gain-out');
  const lossOut = root.querySelector('#erp-loss-out');
  const txOut = root.querySelector('#erp-tx-out');
  const ddGainDbd = root.querySelector('#erp-gaindbd');
  const ddErp = root.querySelector('#erp-erp');
  const ddEirp = root.querySelector('#erp-eirp');
  const ddMaxTx = root.querySelector('#erp-maxtx');
  const cmd = root.querySelector('#erp-cmd');
  const mark = root.querySelector('#erp-mark');

  function render() {
    const gainDbi = Number(gain.value);
    const lossDb = Number(loss.value);
    const txDbm = Number(tx.value);
    gainOut.textContent = fmt(gainDbi, 1);
    lossOut.textContent = fmt(lossDb, 1);
    txOut.textContent = fmt(txDbm, 0);

    const gainDbd = gainDbi - DBI_TO_DBD;
    const erpDbm = txDbm + gainDbd - lossDb;
    const eirpDbm = erpDbm + DBI_TO_DBD;
    const maxTx = maxTxDbm(gainDbi, lossDb);
    const ok = erpDbm <= ERP_LIMIT_DBM;

    ddGainDbd.textContent = `${fmt(gainDbd, 2)} dBd`;
    ddErp.textContent = `${fmt(erpDbm, 2)} dBm (${fmt(dbmToMw(erpDbm), 0)} mW)`;
    ddErp.className = ok ? 'is-ok' : 'is-bad';
    ddEirp.textContent = `${fmt(eirpDbm, 2)} dBm`;
    ddMaxTx.textContent = `${fmt(maxTx, 2)} dBm (${fmt(dbmToMw(maxTx), 0)} mW)`;

    // set tx accetta interi; 22 dBm è il massimo hardware dell'SX1262.
    cmd.textContent = `set tx ${Math.min(22, Math.floor(maxTx))}`;

    mark.setAttribute('cx', String(gx(erpDbm)));
    mark.setAttribute('fill', ok ? 'var(--accent)' : '#ef4444');
  }

  for (const input of [gain, loss, tx]) input.addEventListener('input', render);
  render();
}
