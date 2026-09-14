// Formule RF condivise dai widget. Stesse formule e fonti citate nelle pagine
// link-budget e normativa: non introdurre costanti diverse qui.

export const PRESET = { freqMHz: 869.618, bw: 62.5, sf: 8, cr: 8 };
export const ERP_LIMIT_DBM = 27; // 500 mW e.r.p., EN 300 220-2 Annex B, 869.4–869.65 MHz
export const DUTY_LIMIT = 0.10;
export const DBI_TO_DBD = 2.15; // EIRP = ERP + 2.15 dB

export const dbmToMw = (dbm) => 10 ** (dbm / 10);
export const mwToDbm = (mw) => 10 * Math.log10(mw);

// Perdita di spazio libero, d in km, f in MHz.
export const fspl = (dKm, fMHz) => 20 * Math.log10(dKm) + 20 * Math.log10(fMHz) + 32.44;

// Raggio prima zona di Fresnel (m) a distanza d1 dal punto A su tratta d (km), f in GHz.
export const fresnelRadius = (d1Km, dKm, fGHz) =>
  17.32 * Math.sqrt((d1Km * (dKm - d1Km)) / (dKm * fGHz));

// Sensibilità SX1262 stimata (dBm): interpolazione lineare SF7=-124 / SF12=-137
// a BW 125 kHz (datasheet Tab. 3-8), -3 dB per dimezzamento di banda.
export const sensitivity = (sf, bwKHz) =>
  -124 - (sf - 7) * (13 / 5) - 10 * Math.log10(125 / bwKHz);

// Time-on-air (ms), datasheet SX1262 §6.1.4. Header esplicito, CRC on, preambolo 8.
// LDRO attivo quando T_sym > 16.38 ms (SF11/12 @125, SF10+ @62.5).
export function timeOnAir(payloadBytes, sf, bwKHz, cr = PRESET.cr, preamble = 8) {
  const tSym = 2 ** sf / bwKHz; // ms
  const de = tSym > 16.38 ? 1 : 0;
  const num = 8 * payloadBytes - 4 * sf + 28 + 16 - 20 * 0;
  const nPayload = 8 + Math.max(Math.ceil(num / (4 * (sf - 2 * de))) * cr, 0);
  return (preamble + 4.25 + nPayload) * tSym;
}

// Bitrate equivalente (bit/s) del modo LoRa: SF · (4/CR) · BW / 2^SF.
export const bitrate = (sf, bwKHz, cr = PRESET.cr) => (sf * (4 / cr) * bwKHz * 1000) / 2 ** sf;

// Potenza TX massima (dBm al connettore) per restare entro ERP_LIMIT_DBM.
export const maxTxDbm = (gainDbi, cableLossDb) =>
  ERP_LIMIT_DBM - (gainDbi - DBI_TO_DBD) + cableLossDb;

export const fmt = (n, digits = 1) => Number(n).toFixed(digits).replace('-', '−');

// Helper DOM minimo condiviso. I tag SVG vanno creati nel loro namespace,
// altrimenti non vengono renderizzati.
const SVG_TAGS = new Set(['svg', 'g', 'rect', 'line', 'path', 'text', 'circle', 'ellipse', 'polygon', 'polyline']);
export function el(tag, attrs = {}, children = []) {
  const node = SVG_TAGS.has(tag)
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else node.setAttribute(k, v);
  }
  for (const c of children) node.append(c);
  return node;
}

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
