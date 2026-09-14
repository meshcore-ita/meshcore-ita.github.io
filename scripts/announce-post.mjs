// Annuncia nel topic "Annunci" del gruppo Telegram i post del blog aggiunti
// da questo push. Gira dopo il deploy: l'URL deve già rispondere quando il
// messaggio arriva.
//
// Uso:
//   node scripts/announce-post.mjs <sha-precedente> <sha-attuale>
//   node scripts/announce-post.mjs --post <slug>      invio manuale
//
// Env: TELEGRAM_BOT_TOKEN (obbligatorio). Opzionali TELEGRAM_CHAT_ID e
// TELEGRAM_ANNOUNCE_TOPIC_ID, che hanno come default il gruppo MeshCore ITA
// e il topic Annunci (t.me/meshcore_ita/15).
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { SITE_BASE } from './site-base.mjs';

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '-1003711129218';
const TOPIC_ID = Number(process.env.TELEGRAM_ANNOUNCE_TOPIC_ID ?? 15);

if (!TOKEN) {
  console.log('Annuncio saltato: TELEGRAM_BOT_TOKEN non impostato.');
  process.exit(0);
}

// parse_mode HTML: titolo e lede vanno escapati, arrivano da un sorgente.
const escapeHtml = (s) =>
  String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

// Legge il blocco <!--meta ... --> del sorgente: stesso formato di build.mjs.
function readPost(slug) {
  const raw = readFileSync(`content/blog/${slug}.md`, 'utf8');
  const match = /^<!--meta\s*([\s\S]*?)-->/.exec(raw.trimStart());
  if (!match) throw new Error(`content/blog/${slug}.md: blocco meta mancante`);
  return JSON.parse(match[1]);
}

// Post *aggiunti* dal push: una modifica a un post già pubblicato non va
// riannunciata.
function addedSlugs(before, after) {
  // Primo push su un branch: GitHub passa uno sha di soli zeri, non diffabile.
  if (!before || !after || /^0+$/.test(before)) return [];
  const out = execFileSync('git', ['diff', '--name-only', '--diff-filter=A', before, after], {
    encoding: 'utf8',
  });
  return out
    .split('\n')
    .map((f) => f.trim())
    .map((f) => /^content\/blog\/([a-z0-9-]+)\.md$/.exec(f)?.[1])
    .filter(Boolean);
}

const [a, b] = process.argv.slice(2);
const slugs = a === '--post' ? [b] : addedSlugs(a, b);

if (!slugs.length) {
  console.log('Annuncio: nessun nuovo post in questo push.');
  process.exit(0);
}

for (const slug of slugs) {
  const meta = readPost(slug);
  const url = `${SITE_BASE}blog/${slug}/`;
  const text =
    `<b>${escapeHtml(meta.h1 ?? meta.title)}</b>\n\n` +
    `${escapeHtml(meta.lede ?? meta.description)}\n\n` +
    `<a href="${url}">${url}</a>`;

  const res = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      message_thread_id: TOPIC_ID,
      text,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: false },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (data.ok) console.log(`Annunciato: ${url}`);
  // Un annuncio perso non deve far fallire un deploy già riuscito: si logga.
  else console.error(`Annuncio fallito per ${slug}: HTTP ${res.status} — ${data.description ?? 'risposta non interpretabile'}`);
}
