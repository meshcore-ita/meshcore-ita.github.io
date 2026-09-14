// Notifica IndexNow (Bing, Yandex, Seznam, Naver) delle sole pagine cambiate.
//
// Uso:
//   node scripts/indexnow.mjs <sha-precedente> <sha-attuale>
//   node scripts/indexnow.mjs --all
//
// La chiave è pubblica per specifica: deve essere servita come
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync } from 'node:fs';
import { SITE_BASE } from './site-base.mjs';

// La chiave è il nome del file <chiave>.txt presente nella root del sito:
// una sola fonte di verità, impossibile che file e script divergano.
const keyFile = readdirSync('.').find((f) => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) {
  console.error('IndexNow: nessun file <chiave>.txt nella root del sito.');
  process.exit(1);
}
const KEY = keyFile.replace(/\.txt$/, '');
const ENDPOINT = 'https://api.indexnow.org/IndexNow';
const host = new URL(SITE_BASE).host;

// 'guida/index.html' -> '<base>guida/', 'index.html' -> '<base>',
// 'blog/index.html' -> '<base>blog/', 'blog/guida/index.html' -> '<base>blog/guida/',
// 'blog/pagina/2/index.html' -> '<base>blog/pagina/2/'
function pathToUrl(file) {
  if (file === 'index.html') return SITE_BASE;
  if (file === 'blog/index.html') return `${SITE_BASE}blog/`;
  const paged = file.match(/^blog\/pagina\/(\d+)\/index\.html$/);
  if (paged) return `${SITE_BASE}blog/pagina/${paged[1]}/`;
  const post = file.match(/^blog\/([a-z0-9-]+)\/index\.html$/);
  if (post) return `${SITE_BASE}blog/${post[1]}/`;
  const m = file.match(/^([a-z0-9-]+)\/index\.html$/);
  return m ? `${SITE_BASE}${m[1]}/` : null;
}

function allUrls() {
  const sitemap = readFileSync('sitemap.xml', 'utf8');
  return [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

function changedUrls(before, after) {
  const out = execFileSync('git', ['diff', '--name-only', before, after], {
    encoding: 'utf8',
  });
  const urls = out
    .split('\n')
    .map((f) => f.trim())
    .filter(Boolean)
    .map(pathToUrl)
    .filter(Boolean);
  return [...new Set(urls)];
}

const [a, b] = process.argv.slice(2);
const urlList = a === '--all' ? allUrls() : changedUrls(a, b);

if (!urlList.length) {
  console.log('IndexNow: nessuna pagina cambiata, niente da inviare.');
  process.exit(0);
}

const body = { host, key: KEY, keyLocation: `${SITE_BASE}${KEY}.txt`, urlList };
const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

console.log(`IndexNow: ${res.status} ${res.statusText} per ${urlList.length} URL`);
for (const u of urlList) console.log(`  ${u}`);

// 200 accettato, 202 accettato ma chiave in validazione: entrambi vanno bene.
// Un errore qui non deve far fallire un deploy già andato a buon fine.
if (res.status !== 200 && res.status !== 202) {
  console.error(`IndexNow: risposta inattesa: ${await res.text()}`);
}
