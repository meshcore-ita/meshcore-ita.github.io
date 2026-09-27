#!/usr/bin/env node
// MeshCore ITA — static site generator. Node stdlib + marked (markdown).
// Reads templates/layout.html + ogni content/<slug>.html o content/<slug>.md
// e scrive <slug>/index.html, sitemap.xml, robots.txt, 404.html,
// search-index.json e worker/kb.generated.mjs alla radice del repo.
// Legge anche content/blog/<slug>.md e content/blog/tags.json e scrive
// blog/<slug>/index.html, blog/index.html (+ blog/pagina/<n>/), feed.xml,
// blog/tag/<slug>/ (+ blog/tag/<slug>/pagina/<n>/ e blog/tag/<slug>/feed.xml
// per ogni tag effettivamente usato) e blog/archivio/. La sezione si chiama
// "Blog" in UI, ma l'URL /blog/ resta quello storico (mai spostato).
// Aggiorna anche la sezione "Ultimi articoli" di index.html, tra i commenti
// <!-- ultimi-articoli:inizio --> / <!-- ultimi-articoli:fine -->.
//
// Usage:
//   node build.mjs           write generated files to disk
//   node build.mjs --check   build in memory, fail if committed output drifts

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync, rmdirSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { SITE_BASE } from './scripts/site-base.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));

export { SITE_BASE };

// Repo di pubblicazione: in CI arriva da GITHUB_REPOSITORY, così un fork
// genera link "Modifica questa pagina" verso il proprio repo e non a monte.
const REPO_SLUG = process.env.GITHUB_REPOSITORY || 'meshcore-ita/meshcore-ita.github.io';
const REPO_WEB_BASE = `${process.env.GITHUB_SERVER_URL || 'https://github.com'}/${REPO_SLUG}`;
const REPO_EDIT_BASE = `${REPO_WEB_BASE}/edit/main/`;
const REPO_TREE_BASE = `${REPO_WEB_BASE}/tree/main/`;
const CONTENT_DIR = join(ROOT, 'content');
const BLOG_DIR = join(CONTENT_DIR, 'blog');
const BLOG_SLUG = 'blog';
const TEMPLATES_DIR = join(ROOT, 'templates');
const LAYOUT_PATH = join(TEMPLATES_DIR, 'layout.html');
const NOT_FOUND_TEMPLATE_PATH = join(TEMPLATES_DIR, '404.html');
const HOME_PATH = join(ROOT, 'index.html');

const REQUIRED_KEYS = ['slug', 'nav', 'order', 'primary', 'title', 'description', 'h1', 'lede', 'updated'];
const POST_REQUIRED_KEYS = ['slug', 'title', 'description', 'h1', 'lede', 'published'];
const DEFAULT_AUTHOR = 'MeshCore ITA';
const FEED_MAX_ENTRIES = 20;
const POSTS_PER_PAGE = 10;

// Nome della sezione blog mostrato in UI (nav, breadcrumb, eyelash, feed,
// JSON-LD). L'URL resta "/blog/" — mai spostato, per non rompere SEO/link
// esistenti (vedi CONTRIBUTING.md).
const BLOG_LABEL = 'Blog';
// Parole al minuto usate per calcolare il tempo di lettura di un post.
const READING_WPM = 200;
const TAGS_PATH = join(BLOG_DIR, 'tags.json');

// Slug: solo minuscole, cifre e trattini singoli — finiscono in URL, canonical
// e sitemap senza essere codificati. "blog" è la rotta dell'indice generato.
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_SLUGS = new Set(['blog', 'assets', 'content', 'templates', 'scripts', 'bot', 'worker']);
// Slug riservati alle rotte generate sotto /blog/: un post non può chiamarsi
// così, altrimenti calpesterebbe /blog/tag/, /blog/archivio/ o /blog/pagina/.
const POST_RESERVED_SLUGS = new Set(['tag', 'archivio', 'pagina']);
// Cartelle del repo che non contengono output generato: mai toccate dalla
// pulizia delle pagine orfane (_site è la staging area del deploy).
const SOURCE_DIRS = new Set(['assets', 'content', 'templates', 'scripts', 'bot', 'worker', 'node_modules', '_site']);
// Tipi JSON-LD a cui ha senso applicare la data di ultimo aggiornamento.
const DATED_TYPES = new Set(['Article', 'TechArticle', 'HowTo', 'BlogPosting', 'FAQPage', 'WebPage', 'DefinedTermSet']);

const EXTERNAL_NAV_LINKS = [
  { label: 'TELEGRAM', href: 'https://t.me/meshcore_ita' },
  { label: 'GitHub', href: 'https://github.com/meshcore-ita' },
];

const MONTHS_IT = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
];

// Sezioni per il raggruppamento del footer (chiave meta opzionale "section").
// Assente o non riconosciuta -> DEFAULT_SECTION.
const SECTIONS = ['Inizia', 'Hardware', 'Rete', 'Riferimento', 'Community'];
const DEFAULT_SECTION = 'Documentazione';

function escape(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function humanDate(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) throw new Error(`data non valida (atteso YYYY-MM-DD): ${iso}`);
  const [, year, month, day] = m;
  const d = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  // Date.UTC normalizza il 31 febbraio: se i componenti non tornano, la data
  // non esiste nel calendario e non deve finire in <time>/sitemap/feed.
  if (
    d.getUTCFullYear() !== Number(year) ||
    d.getUTCMonth() + 1 !== Number(month) ||
    d.getUTCDate() !== Number(day)
  ) {
    throw new Error(`data inesistente nel calendario: ${iso}`);
  }
  return `${Number(day)} ${MONTHS_IT[Number(month) - 1]} ${year}`;
}

// Valida un campo data di un post (published/updated) con un messaggio che
// nomina il campo giusto, senza toccare humanDate (usata anche altrove).
function assertPostDate(file, field, iso) {
  try {
    humanDate(iso);
  } catch {
    throw new Error(`blog/${file}: campo "${field}" non valido (atteso YYYY-MM-DD): ${iso}`);
  }
}

// Ora di pubblicazione opzionale ("HH:MM", ora italiana). Serve solo a
// ordinare i post usciti lo stesso giorno e a dare al feed un orario vero:
// senza, a parità di data l'ordine sarebbe quello alfabetico dello slug.
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

function assertPostTime(file, time) {
  if (typeof time !== 'string' || !TIME_RE.test(time)) {
    throw new Error(`blog/${file}: campo "time" non valido (atteso HH:MM, ora italiana): ${time}`);
  }
}

// Scostamento di Europe/Rome da UTC in una data (+01:00 o +02:00 con l'ora
// legale): dipende solo dalla data, quindi il feed resta deterministico.
const ROME_OFFSET_FMT = new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Rome', timeZoneName: 'longOffset' });
function romeOffset(iso) {
  const part = ROME_OFFSET_FMT.formatToParts(new Date(`${iso}T12:00:00Z`)).find((p) => p.type === 'timeZoneName');
  const offset = part.value.replace('GMT', '');
  return offset || '+00:00';
}

// Rendering markdown delle pagine sorgente .md — usata dalle pagine content
// (i post del blog hanno il proprio assemblaggio, vedi parsePostFile, perché
// devono calcolare il tempo di lettura sul corpo renderizzato).
export function renderMarkdown(body, lead = '') {
  const html = marked.parse(body, { gfm: true, breaks: false });
  return `<section class="section">\n${lead}  <div class="prose">\n${html}\n  </div>\n</section>`;
}

// I sorgenti markdown sono markdown puro (vedi CONTRIBUTING.md): l'HTML grezzo
// finirebbe non filtrato nelle pagine generate, quindi la build lo rifiuta.
function assertNoRawHtml(label, body) {
  const walk = (tokens) => {
    for (const token of tokens) {
      if (!token || typeof token !== 'object') continue;
      if (token.type === 'html') {
        throw new Error(
          `${label}: HTML grezzo non ammesso nel markdown — ${String(token.raw).trim().slice(0, 60)}`
        );
      }
      for (const key of ['tokens', 'items', 'rows', 'header']) {
        const value = token[key];
        if (Array.isArray(value)) walk(value.flat());
      }
    }
  };
  walk(marked.lexer(body, { gfm: true }));
}

// --- content parsing --------------------------------------------------

function parseContentFile(file) {
  const full = join(CONTENT_DIR, file);
  const raw = readFileSync(full, 'utf8');
  const match = /^<!--meta\s*([\s\S]*?)-->\s*([\s\S]*)$/.exec(raw.trimStart());
  if (!match) {
    throw new Error(`${file}: manca il blocco <!--meta ... --> iniziale`);
  }
  let meta;
  try {
    meta = JSON.parse(match[1]);
  } catch (err) {
    throw new Error(`${file}: JSON non valido nel blocco meta — ${err.message}`);
  }
  for (const key of REQUIRED_KEYS) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === '') {
      throw new Error(`${file}: chiave obbligatoria mancante nel meta: "${key}"`);
    }
  }
  if (typeof meta.order !== 'number' || !Number.isFinite(meta.order)) {
    throw new Error(`${file}: "order" deve essere un numero`);
  }
  if (typeof meta.primary !== 'boolean') {
    throw new Error(`${file}: "primary" deve essere un booleano (true = nav header, false = solo footer)`);
  }
  if (meta.jsonld === undefined) {
    meta.jsonld = [];
  } else if (!Array.isArray(meta.jsonld)) {
    throw new Error(`${file}: "jsonld" deve essere un array`);
  }
  const extMatch = /\.(html|md)$/.exec(file);
  if (!extMatch) {
    throw new Error(`${file}: estensione non supportata (atteso .html o .md)`);
  }
  const ext = extMatch[1];
  const expectedSlug = file.slice(0, -(ext.length + 1));
  if (meta.slug !== expectedSlug) {
    throw new Error(`${file}: "slug" (${meta.slug}) non corrisponde al nome del file (${expectedSlug})`);
  }
  if (!SLUG_RE.test(meta.slug)) {
    throw new Error(`${file}: "slug" non valido (solo minuscole, cifre e trattini): ${meta.slug}`);
  }
  if (RESERVED_SLUGS.has(meta.slug)) {
    throw new Error(`${file}: "slug" riservato a una rotta generata: ${meta.slug}`);
  }
  const body = match[2].trim();
  if (!body) {
    throw new Error(`${file}: il corpo della pagina è vuoto`);
  }
  if (ext === 'md') assertNoRawHtml(file, body);
  const fragment = anchorHeadings(ext === 'md' ? renderMarkdown(body) : body);
  return { file, meta, fragment };
}

function readContentFiles() {
  if (!existsSync(CONTENT_DIR)) return [];
  const files = readdirSync(CONTENT_DIR).filter((f) => /\.(html|md)$/.test(f)).sort();
  return files.map(parseContentFile);
}

// --- blog tags registry (content/blog/tags.json) -------------------------
// Chiave = slug del tag (stesso formato di SLUG_RE), valore = { label,
// description }. L'ordine delle chiavi è l'ordine canonico usato dalla barra
// argomenti dell'indice e dall'elenco tag dell'archivio. Un tag usato da un
// post ma assente da questo file ferma la build; un tag presente qui ma
// usato da zero post non genera pagina.

function readTagRegistry() {
  if (!existsSync(TAGS_PATH)) {
    throw new Error('content/blog/tags.json: file mancante');
  }
  let raw;
  try {
    raw = JSON.parse(readFileSync(TAGS_PATH, 'utf8'));
  } catch (err) {
    throw new Error(`content/blog/tags.json: JSON non valido — ${err.message}`);
  }
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    throw new Error('content/blog/tags.json: deve essere un oggetto {slug: {label, description}}');
  }
  const registry = new Map();
  for (const [slug, entry] of Object.entries(raw)) {
    if (!SLUG_RE.test(slug)) {
      throw new Error(`content/blog/tags.json: slug tag non valido: "${slug}"`);
    }
    if (!entry || typeof entry.label !== 'string' || !entry.label.trim()) {
      throw new Error(`content/blog/tags.json: la voce "${slug}" richiede una "label"`);
    }
    if (typeof entry.description !== 'string' || !entry.description.trim()) {
      throw new Error(`content/blog/tags.json: la voce "${slug}" richiede una "description"`);
    }
    registry.set(slug, { slug, label: entry.label, description: entry.description });
  }
  return registry;
}

// Trasforma gli slug tag di un post nei rispettivi oggetti del registro,
// fermando la build se il post usa un tag non registrato.
function resolveTags(file, tags, registry) {
  return tags.map((slug) => {
    const entry = registry.get(slug);
    if (!entry) {
      throw new Error(`blog/${file}: tag sconosciuto "${slug}" — aggiungilo a content/blog/tags.json`);
    }
    return entry;
  });
}

// --- blog parsing (content/blog/*.md) -----------------------------------
// Stesso blocco <!--meta ... --> dei contenuti .md, chiavi diverse: niente
// "nav"/"order"/"primary" (i post non stanno nella nav piatta né in nessuna
// sezione del footer come pagina singola), ma "published" invece di
// "updated" come data principale. "updated" è opzionale (default: published).

// Chip dei tag di un post, linkate alla rispettiva pagina /blog/tag/<slug>/.
// hrefFor è la stessa fabbrica usata per nav/footer di quella pagina: la
// profondità cambia (post, indice, tag, archivio), il calcolo no.
function tagChips(tagInfo, hrefFor, currentSlug) {
  if (!tagInfo.length) return '';
  const blogRoot = hrefFor(BLOG_SLUG);
  const items = tagInfo
    .map((tag) => {
      const current = tag.slug === currentSlug ? ' aria-current="true"' : '';
      return `<li class="tag"><a class="tag__link" href="${blogRoot}tag/${tag.slug}/"${current}>${escape(tag.label)}</a></li>`;
    })
    .join('');
  return `<ul class="tags">${items}</ul>`;
}

// Riga meta e tag vivono nello stesso .section del corpo: fuori di lì
// finirebbero a filo del viewport invece che allineati all'h1.
function buildPostMetaBlock(meta, hrefFor) {
  const parts = [`<time datetime="${meta.published}">${humanDate(meta.published)}</time>`];
  if (meta.updated !== meta.published) {
    parts.push(`aggiornato il ${humanDate(meta.updated)}`);
  }
  parts.push(`<span class="post-meta__author">${escape(meta.author)}</span>`);
  parts.push(`${meta.readingMinutes} min di lettura`);
  const metaLine = `  <p class="post-meta">${parts.join(' · ')}</p>\n`;
  const tags = tagChips(meta.tagInfo, hrefFor, null);
  return tags ? `${metaLine}  ${tags}\n` : metaLine;
}

function parsePostFile(file, registry) {
  const full = join(BLOG_DIR, file);
  const raw = readFileSync(full, 'utf8');
  const match = /^<!--meta\s*([\s\S]*?)-->\s*([\s\S]*)$/.exec(raw.trimStart());
  if (!match) {
    throw new Error(`blog/${file}: manca il blocco <!--meta ... --> iniziale`);
  }
  let meta;
  try {
    meta = JSON.parse(match[1]);
  } catch (err) {
    throw new Error(`blog/${file}: JSON non valido nel blocco meta — ${err.message}`);
  }
  for (const key of POST_REQUIRED_KEYS) {
    if (meta[key] === undefined || meta[key] === null || meta[key] === '') {
      throw new Error(`blog/${file}: chiave obbligatoria mancante nel meta: "${key}"`);
    }
  }
  if (!file.endsWith('.md')) {
    throw new Error(`blog/${file}: estensione non supportata (atteso .md)`);
  }
  const expectedSlug = file.slice(0, -3);
  if (meta.slug !== expectedSlug) {
    throw new Error(`blog/${file}: "slug" (${meta.slug}) non corrisponde al nome del file (${expectedSlug})`);
  }
  if (!SLUG_RE.test(meta.slug)) {
    throw new Error(`blog/${file}: "slug" non valido (solo minuscole, cifre e trattini): ${meta.slug}`);
  }
  if (POST_RESERVED_SLUGS.has(meta.slug)) {
    throw new Error(`blog/${file}: "slug" riservato a una rotta generata sotto /blog/: ${meta.slug}`);
  }
  assertPostDate(file, 'published', meta.published);
  if (meta.time !== undefined) assertPostTime(file, meta.time);
  // Chiave di ordinamento cronologico: data e, se c'è, ora di pubblicazione.
  meta.sortKey = `${meta.published}T${meta.time ?? '00:00'}`;
  if (meta.updated === undefined) meta.updated = meta.published;
  assertPostDate(file, 'updated', meta.updated);
  if (meta.author === undefined) meta.author = DEFAULT_AUTHOR;
  if (meta.tags === undefined) {
    meta.tags = [];
  } else if (!Array.isArray(meta.tags)) {
    throw new Error(`blog/${file}: "tags" deve essere un array`);
  }
  meta.tagInfo = resolveTags(file, meta.tags, registry);
  if (meta.jsonld === undefined) {
    meta.jsonld = [];
  } else if (!Array.isArray(meta.jsonld)) {
    throw new Error(`blog/${file}: "jsonld" deve essere un array`);
  }
  const body = match[2].trim();
  if (!body) {
    throw new Error(`blog/${file}: il corpo dell'articolo è vuoto`);
  }
  assertNoRawHtml(`blog/${file}`, body);
  const bodyHtml = marked.parse(body, { gfm: true, breaks: false });
  // Tempo di lettura: sul testo visibile del corpo renderizzato, non sul
  // markdown sorgente (tag e sintassi non si leggono).
  const words = stripTags(bodyHtml).split(/\s+/).filter(Boolean).length;
  meta.wordCount = words;
  meta.readingMinutes = Math.max(1, Math.ceil(words / READING_WPM));
  // I post vivono sempre a blog/<slug>/index.html (profondità 2 dalla
  // radice): i link ai tag nel meta block possono usare relativeHref(2) già
  // in fase di parsing, senza aspettare il rendering.
  const metaBlock = buildPostMetaBlock(meta, relativeHref(2));
  const fragment = anchorHeadings(
    `<section class="section">\n${metaBlock}  <div class="prose">\n${bodyHtml}\n  </div>\n</section>`
  );
  return { file, meta, fragment };
}

function readPostFiles(registry) {
  if (!existsSync(BLOG_DIR)) return [];
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).sort();
  const posts = files.map((f) => parsePostFile(f, registry));
  // Due post dello stesso giorno senza ora finirebbero in ordine alfabetico
  // di slug, non di uscita: meglio chiedere l'ora esplicita.
  const byDate = new Map();
  for (const { file, meta } of posts) {
    if (!byDate.has(meta.published)) byDate.set(meta.published, []);
    byDate.get(meta.published).push({ file, meta });
  }
  for (const [date, same] of byDate) {
    if (same.length < 2) continue;
    const missing = same.filter(({ meta }) => meta.time === undefined).map(({ file }) => `blog/${file}`);
    if (missing.length) {
      throw new Error(
        `più post pubblicati il ${date}: aggiungi "time" (HH:MM, ora italiana) nel meta di ${missing.join(', ')} per fissarne l'ordine`
      );
    }
    const times = new Set(same.map(({ meta }) => meta.time));
    if (times.size < same.length) {
      throw new Error(`più post pubblicati il ${date} alla stessa ora: usa valori di "time" diversi`);
    }
  }
  posts.sort((a, b) => {
    if (a.meta.sortKey !== b.meta.sortKey) return a.meta.sortKey < b.meta.sortKey ? 1 : -1;
    return a.meta.slug < b.meta.slug ? -1 : 1;
  });
  return posts;
}

// Data più recente tra i post (per "updated"); se non ci sono post, ricade
// sulla più recente tra le pagine content — sempre deterministico, mai
// legato all'orario di build.
function latestBlogUpdated(posts, pages) {
  const dates = posts.length ? posts.map((p) => p.meta.updated) : pages.map((p) => p.meta.updated);
  return dates.reduce((max, d) => (d > max ? d : max));
}

// --- knowledge base extraction (worker/kb.generated.mjs) ---------------
// Chunks the visible text of every content page (one per <h2>/<h3> section,
// plus one per FAQ question/answer pair) for the Telegram bot's runtime
// retrieval. Deterministic: same input always yields the same output, so
// `--check` can catch drift the same way it does for the HTML pages.

const KB_CHUNK_MAX_CHARS = 700;
const ENTITY_RE = /&lt;|&gt;|&amp;|&#39;|&quot;|&nbsp;/g;
const ENTITY_MAP = { '&lt;': '<', '&gt;': '>', '&amp;': '&', '&#39;': "'", '&quot;': '"', '&nbsp;': ' ' };
const FAQ_BLOCK_RE = /<details class="faq"([^>]*)>([\s\S]*?)<\/details>/g;
const FAQ_QUESTION_RE = /<summary class="faq__q">([\s\S]*?)<\/summary>/;
const HEADING_RE = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/g;

function decodeEntities(text) {
  return text.replace(ENTITY_RE, (m) => ENTITY_MAP[m]);
}

function stripTags(html) {
  return decodeEntities(html.replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateAtWord(text, max = KB_CHUNK_MAX_CHARS) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function slugify(text) {
  return (
    text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'sezione'
  );
}

// Ancore: ogni <h2>/<h3> riceve un id stabile derivato dal suo testo, così i
// risultati di ricerca e le risposte del bot possono linkare la sezione
// esatta invece della cima della pagina. Gli id sono deterministici, quindi
// restano validi finché il titolo non cambia.
function anchorHeadings(fragment) {
  // Si parte dagli id già presenti nel sorgente: un id generato non deve mai
  // duplicarne uno scritto a mano (step, sezioni, ancore di nota).
  const used = new Set([...fragment.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  const nextId = (text) => {
    const base = slugify(text);
    let id = base;
    let n = 2;
    while (used.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    used.add(id);
    return id;
  };
  HEADING_RE.lastIndex = 0;
  const withHeadings = fragment.replace(HEADING_RE, (whole, level, attrs, inner) => {
    if (/\bid=/.test(attrs)) return whole;
    return `<h${level} id="${nextId(stripTags(inner))}"${attrs}>${inner}</h${level}>`;
  });
  FAQ_BLOCK_RE.lastIndex = 0;
  return withHeadings.replace(FAQ_BLOCK_RE, (whole, attrs, inner) => {
    if (/\bid=/.test(attrs)) return whole;
    const q = FAQ_QUESTION_RE.exec(inner);
    if (!q) return whole;
    return `<details class="faq" id="${nextId(stripTags(q[1]))}">${inner}</details>`;
  });
}

function extractPageChunks(meta, fragment) {
  const page = meta.nav;
  const url = `${SITE_BASE}${meta.slug}/`;
  const clean = fragment.replace(/<p class="(?:step|card)__num">[^<]*<\/p>/g, '');
  const chunks = [];
  const usedIds = new Set();

  const addChunk = (title, rawText, anchor) => {
    const text = truncateAtWord(rawText);
    if (!title || !text) return;
    const base = `${meta.slug}--${slugify(title)}`;
    let id = base;
    let n = 2;
    while (usedIds.has(id)) {
      id = `${base}-${n}`;
      n += 1;
    }
    usedIds.add(id);
    chunks.push({ id, page, title, url: anchor ? `${url}#${anchor}` : url, text });
  };

  // FAQ question/answer pairs become their own chunks first, then get
  // stripped out so the heading pass below doesn't duplicate them.
  FAQ_BLOCK_RE.lastIndex = 0;
  let faqMatch;
  while ((faqMatch = FAQ_BLOCK_RE.exec(clean))) {
    const anchor = /\bid="([^"]+)"/.exec(faqMatch[1])?.[1];
    const inner = faqMatch[2];
    const qMatch = FAQ_QUESTION_RE.exec(inner);
    if (!qMatch) continue;
    const answerHtml = inner.slice(qMatch.index + qMatch[0].length);
    addChunk(stripTags(qMatch[1]), stripTags(answerHtml), anchor);
  }
  const withoutFaq = clean.replace(FAQ_BLOCK_RE, '');

  // Every <h2>/<h3> owns the text up to the next heading of either level.
  HEADING_RE.lastIndex = 0;
  const headings = [...withoutFaq.matchAll(HEADING_RE)];
  for (let i = 0; i < headings.length; i += 1) {
    const heading = headings[i];
    const start = heading.index + heading[0].length;
    const end = i + 1 < headings.length ? headings[i + 1].index : withoutFaq.length;
    const anchor = /\bid="([^"]+)"/.exec(heading[2])?.[1];
    addChunk(stripTags(heading[3]), stripTags(withoutFaq.slice(start, end)), anchor);
  }

  return chunks;
}

function computeAllChunks(pages, posts) {
  const sorted = [...pages].sort((a, b) => a.meta.order - b.meta.order);
  const pageChunks = sorted.flatMap(({ meta, fragment }) => extractPageChunks(meta, fragment));
  // I post sono già ordinati per data di pubblicazione decrescente da
  // readPostFiles(); i loro chunk seguono quelli delle pagine, con
  // page:'Blog' e url sotto /blog/<slug>/. Le pagine tag/archivio/home non
  // generano chunk: non sono contenuto editoriale proprio, solo elenchi.
  const postChunks = posts.flatMap(({ meta, fragment }) =>
    extractPageChunks({ slug: `${BLOG_SLUG}/${meta.slug}`, nav: BLOG_LABEL }, fragment)
  );
  return [...pageChunks, ...postChunks];
}

function buildKbModule(chunks) {
  const banner = [
    '// File generato automaticamente da build.mjs — NON modificare a mano.',
    '// Per rigenerare: node build.mjs',
    '//',
    '// Frammenti (sezioni <h2>/<h3> e domande FAQ) delle pagine content/*.html,',
    '// usati da worker/worker.mjs come base di conoscenza aggiuntiva per le',
    '// risposte generate dal modello AI del bot Telegram.',
  ].join('\n');
  return `${banner}\nexport const KB_CHUNKS = ${JSON.stringify(chunks, null, 2)};\n`;
}

// Stessi chunk di worker/kb.generated.mjs, in JSON puro per la ricerca
// client-side (assets/js/search.js li carica via fetch).
function buildSearchIndex(chunks) {
  return `${JSON.stringify(chunks)}\n`;
}

// --- rendering helpers --------------------------------------------------
// Content pages live at depth 1 (<slug>/index.html), so their nav/footer
// links to other pages are relative ("../<slug>/"). 404.html is served by
// GitHub Pages at arbitrary depths, so it renders the same nav/footer with
// absolute links instead — both share the logic below via `hrefFor`.

// relativeHref è una fabbrica: la profondità dell'output determina quanti
// "../" servono per risalire alla radice (pagine content = depth 1, post
// blog = depth 2, indice tag = depth 3, paginazione tag = depth 5, ecc.).
// absoluteHref serve invece a 404.html, servito da GitHub Pages a profondità
// arbitraria. Slug vuoto = home.
const relativeHref = (depth) => (slug) => (slug ? `${'../'.repeat(depth)}${slug}/` : '../'.repeat(depth));
const absoluteHref = (slug) => (slug ? `${SITE_BASE}${slug}/` : SITE_BASE);

function buildNav(pages, currentSlug, hrefFor) {
  const sorted = pages
    .filter(({ meta }) => meta.primary)
    .sort((a, b) => a.meta.order - b.meta.order);
  // "Cos'è" apre la nav anche sulle pagine interne, come nella home: senza,
  // la voce spariva appena si lasciava la pagina principale.
  const lines = [`      <a class="nav__link" href="${hrefFor('')}#cos-e">Cos'è</a>`];
  lines.push(...sorted.map(({ meta }) => {
    const current = meta.slug === currentSlug ? ' aria-current="true"' : '';
    return `      <a class="nav__link" href="${hrefFor(meta.slug)}"${current}>${escape(meta.nav)}</a>`;
  }));
  const blogCurrent = currentSlug === BLOG_SLUG ? ' aria-current="true"' : '';
  lines.push(`      <a class="nav__link" href="${hrefFor(BLOG_SLUG)}"${blogCurrent}>${BLOG_LABEL}</a>`);
  for (const ext of EXTERNAL_NAV_LINKS) {
    lines.push(
      `      <a class="nav__link nav__link--ext" href="${ext.href}" target="_blank" rel="noopener">${ext.label}<span class="ext-arrow">↗</span></a>`
    );
  }
  return lines.join('\n');
}

function buildFooterNav(pages, currentSlug, hrefFor) {
  const groups = new Map();
  for (const { meta } of pages) {
    const section = SECTIONS.includes(meta.section) ? meta.section : DEFAULT_SECTION;
    if (!groups.has(section)) groups.set(section, []);
    groups.get(section).push(meta);
  }
  const blocks = [];
  for (const section of [...SECTIONS, DEFAULT_SECTION]) {
    const metas = groups.get(section);
    if (!metas || !metas.length) continue;
    metas.sort((a, b) => a.order - b.order);
    const items = metas.map((meta) => {
      const current = meta.slug === currentSlug ? ' aria-current="true"' : '';
      return `        <li><a href="${hrefFor(meta.slug)}"${current}>${escape(meta.nav)}</a></li>`;
    });
    blocks.push(`      <p class="foot__nav-label">${escape(section)}</p>
      <ul class="foot__nav-list">
${items.join('\n')}
      </ul>`);
  }
  const blogCurrent = currentSlug === BLOG_SLUG ? ' aria-current="true"' : '';
  blocks.push(`      <p class="foot__nav-label">${BLOG_LABEL}</p>
      <ul class="foot__nav-list">
        <li><a href="${hrefFor(BLOG_SLUG)}"${blogCurrent}>${BLOG_LABEL}</a></li>
      </ul>`);
  return blocks.join('\n');
}

function wrapJsonLd(graph) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  // Never let a literal "</script" inside a string value close the tag early.
  return json.replace(/<\/script/gi, '<\\/script');
}

// I nodi datati ereditano la data "updated" del sorgente, se non la portano
// già: senza, i motori non vedono mai l'ultimo aggiornamento della pagina.
function withDateModified(nodes, updated) {
  return nodes.map((node) =>
    node && DATED_TYPES.has(node['@type']) && node.dateModified === undefined
      ? { ...node, dateModified: updated }
      : node
  );
}

function buildJsonLd(meta) {
  const canonical = `${SITE_BASE}${meta.slug}/`;
  const graph = [
    ...withDateModified(meta.jsonld, meta.updated),
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_BASE },
        { '@type': 'ListItem', position: 2, name: meta.nav, item: canonical },
      ],
    },
  ];
  return wrapJsonLd(graph);
}

// Nodo BlogPosting generato per ogni post, seguito dagli eventuali nodi
// jsonld extra del meta e da un BreadcrumbList a 3 livelli (Home > Blog >
// titolo del post).
function buildPostJsonLd(meta) {
  const canonical = `${SITE_BASE}${BLOG_SLUG}/${meta.slug}/`;
  const blogIndexUrl = `${SITE_BASE}${BLOG_SLUG}/`;
  const graph = [
    {
      '@type': 'BlogPosting',
      headline: meta.title,
      description: meta.description,
      datePublished: meta.published,
      dateModified: meta.updated,
      author: { '@type': 'Organization', name: meta.author },
      inLanguage: 'it',
      mainEntityOfPage: canonical,
      keywords: meta.tagInfo.map((t) => t.label).join(', '),
      wordCount: meta.wordCount,
      timeRequired: `PT${meta.readingMinutes}M`,
      articleSection: BLOG_LABEL,
    },
    ...meta.jsonld,
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_BASE },
        { '@type': 'ListItem', position: 2, name: BLOG_LABEL, item: blogIndexUrl },
        { '@type': 'ListItem', position: 3, name: meta.h1, item: canonical },
      ],
    },
  ];
  return wrapJsonLd(graph);
}

// Nodo Blog per una pagina dell'indice, con l'elenco dei post di quella
// pagina (versione ridotta) e il BreadcrumbList corrispondente.
function buildBlogIndexJsonLd(posts, pageNum = 1) {
  const blogIndexUrl = `${SITE_BASE}${BLOG_SLUG}/`;
  const crumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_BASE },
    { '@type': 'ListItem', position: 2, name: BLOG_LABEL, item: blogIndexUrl },
  ];
  if (pageNum > 1) {
    crumbs.push({
      '@type': 'ListItem',
      position: 3,
      name: `Pagina ${pageNum}`,
      item: `${blogIndexUrl}pagina/${pageNum}/`,
    });
  }
  const graph = [
    {
      '@type': 'Blog',
      blogPost: posts.map(({ meta }) => ({
        '@type': 'BlogPosting',
        headline: meta.title,
        url: `${SITE_BASE}${BLOG_SLUG}/${meta.slug}/`,
        datePublished: meta.published,
      })),
    },
    { '@type': 'BreadcrumbList', itemListElement: crumbs },
  ];
  return wrapJsonLd(graph);
}

// Nodo CollectionPage per una pagina tag (+ eventuale paginazione), con
// BreadcrumbList Home > Blog > <label tag> (> Pagina n).
function buildTagJsonLd(tag, posts, pageNum = 1) {
  const blogIndexUrl = `${SITE_BASE}${BLOG_SLUG}/`;
  const tagUrl = `${blogIndexUrl}tag/${tag.slug}/`;
  const crumbs = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_BASE },
    { '@type': 'ListItem', position: 2, name: BLOG_LABEL, item: blogIndexUrl },
    { '@type': 'ListItem', position: 3, name: tag.label, item: tagUrl },
  ];
  if (pageNum > 1) {
    crumbs.push({ '@type': 'ListItem', position: 4, name: `Pagina ${pageNum}`, item: `${tagUrl}pagina/${pageNum}/` });
  }
  const graph = [
    {
      '@type': 'CollectionPage',
      name: tag.label,
      description: tag.description,
      url: pageNum > 1 ? `${tagUrl}pagina/${pageNum}/` : tagUrl,
      isPartOf: { '@type': 'Blog', '@id': blogIndexUrl },
      mainEntity: posts.map(({ meta }) => ({
        '@type': 'BlogPosting',
        headline: meta.title,
        url: `${blogIndexUrl}${meta.slug}/`,
        datePublished: meta.published,
      })),
    },
    { '@type': 'BreadcrumbList', itemListElement: crumbs },
  ];
  return wrapJsonLd(graph);
}

// Nodo CollectionPage per l'archivio, con tutti i post e il relativo
// BreadcrumbList.
function buildArchiveJsonLd(posts) {
  const blogIndexUrl = `${SITE_BASE}${BLOG_SLUG}/`;
  const archiveUrl = `${blogIndexUrl}archivio/`;
  const graph = [
    {
      '@type': 'CollectionPage',
      name: `Archivio — ${BLOG_LABEL}`,
      url: archiveUrl,
      isPartOf: { '@type': 'Blog', '@id': blogIndexUrl },
      mainEntity: posts.map(({ meta }) => ({
        '@type': 'BlogPosting',
        headline: meta.title,
        url: `${blogIndexUrl}${meta.slug}/`,
        datePublished: meta.published,
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_BASE },
        { '@type': 'ListItem', position: 2, name: BLOG_LABEL, item: blogIndexUrl },
        { '@type': 'ListItem', position: 3, name: 'Archivio', item: archiveUrl },
      ],
    },
  ];
  return wrapJsonLd(graph);
}

function card(href, title, body) {
  return `
      <a class="card" href="${href}">
        <h3 class="card__title">${escape(title)}</h3>
        <p class="card__body">${escape(body)}</p>
      </a>`;
}

function relatedSection(cardsHtml) {
  return `<section class="section related" data-reveal>
    <div class="section__head">
      <p class="eyelash">Continua a leggere</p>
      <h2 class="section__title">Altri contenuti MeshCore ITA</h2>
    </div>
    <div class="grid grid--2">${cardsHtml}
    </div>
  </section>`;
}

function buildRelated(pages, currentSlug) {
  const sorted = [...pages].sort((a, b) => a.meta.order - b.meta.order);
  const current = sorted.find((p) => p.meta.slug === currentSlug);
  const others = sorted.filter((p) => p.meta.slug !== currentSlug);
  others.sort((a, b) => {
    const da = Math.abs(a.meta.order - current.meta.order);
    const db = Math.abs(b.meta.order - current.meta.order);
    return da - db || a.meta.order - b.meta.order;
  });
  const nearest = others.slice(0, 3);

  const cards = nearest.map(({ meta }) => card(relativeHref(1)(meta.slug), meta.nav, meta.lede)).join('');
  const homeCard = card('../', 'Home', 'Torna alla pagina principale di MeshCore ITA.');

  return relatedSection(`${cards}${homeCard}`);
}

// Variante per il blog (post, indice, tag, archivio): le 3 pagine di
// documentazione primarie con l'order più basso, più una card extra a
// scelta del chiamante.
function buildBlogRelated(depth, pages, extra) {
  const hrefFor = relativeHref(depth);
  const primary = pages
    .filter((p) => p.meta.primary)
    .sort((a, b) => a.meta.order - b.meta.order)
    .slice(0, 3);
  const cards = primary.map(({ meta }) => card(hrefFor(meta.slug), meta.nav, meta.lede)).join('');
  return relatedSection(`${cards}${card(extra.href, extra.title, extra.body)}`);
}

// Breadcrumb: l'ultima voce è la pagina corrente e non ha href. Un solo
// token nel layout evita di duplicare il template per i livelli extra.
function buildCrumbs(items) {
  return items
    .map(({ name, href }) =>
      href
        ? `        <li><a href="${href}">${escape(name)}</a></li>`
        : `        <li aria-current="page">${escape(name)}</li>`
    )
    .join('\n');
}

// --- card dei post (indice, tag, archivio correlati, home) ---------------
// Una sola <a> per card creerebbe link annidati ora che i tag sono cliccabili:
// il titolo diventa un link "stretched" (::after sull'intera card, vedi CSS),
// i tag restano link separati sopra di esso (z-index).
function postCard(meta, hrefFor, { featured = false } = {}) {
  const blogRoot = hrefFor(BLOG_SLUG);
  const href = `${blogRoot}${meta.slug}/`;
  const tags = tagChips(meta.tagInfo, hrefFor, null);
  const cta = featured ? `\n        <span class="post-card__cta" aria-hidden="true">Leggi l'articolo →</span>` : '';
  return `    <li class="post-card${featured ? ' post-card--featured' : ''}">
      <article class="post-card__inner">
        <p class="post-card__meta"><time datetime="${meta.published}">${humanDate(meta.published)}</time> · ${meta.readingMinutes} min di lettura</p>
        <h3 class="post-card__title"><a class="post-card__link" href="${href}">${escape(meta.title)}</a></h3>
        <p class="post-card__body">${escape(meta.lede)}</p>
        ${tags}${cta}
      </article>
    </li>`;
}

// Barra argomenti dell'indice: chip dei tag usati con conteggio, più
// Archivio e Feed Atom. tagCounts è già nell'ordine canonico del registro.
// L'archivio la riusa senza i due link extra (è già lui l'archivio).
// Il feed del sito sta alla radice (/feed.xml), non sotto /blog/.
function buildTopicBar(tagCounts, hrefFor, { extras = true } = {}) {
  const blogRoot = hrefFor(BLOG_SLUG);
  const tagItems = tagCounts
    .map(
      ({ slug, label, count }) =>
        `<li><a class="topicbar__link" href="${blogRoot}tag/${slug}/">${escape(label)} <span class="topicbar__count">${count}</span></a></li>`
    )
    .join('');
  const extraItems = extras
    ? `<li><a class="topicbar__link topicbar__link--muted" href="${blogRoot}archivio/">Archivio</a></li><li><a class="topicbar__link topicbar__link--muted" href="${hrefFor('')}feed.xml">Feed Atom</a></li>`
    : '';
  return `<nav class="topicbar" aria-label="Argomenti">
  <ul class="topicbar__list">
${tagItems}${extraItems}
  </ul>
</nav>
`;
}

// In questo articolo: indice dei soli <h2>, solo se ce ne sono almeno 3.
function buildToc(fragment) {
  const headings = [...fragment.matchAll(/<h2 id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>/g)];
  if (headings.length < 3) return '';
  const items = headings.map(([, id, inner]) => `<li><a href="#${id}">${escape(stripTags(inner))}</a></li>`).join('');
  return `\n<nav class="toc" aria-label="In questo articolo">
  <p class="toc__label">In questo articolo</p>
  <ol class="toc__list">${items}</ol>
</nav>\n`;
}

// Navigazione tra post cronologicamente adiacenti. "posts" è ordinato per
// data di pubblicazione decrescente (il più nuovo all'indice 0): il post
// precedente (più vecchio) è quello dopo nell'array, il successivo (più
// nuovo) è quello prima.
function prevNextHtml(meta, posts, hrefFor) {
  const idx = posts.findIndex((p) => p.meta.slug === meta.slug);
  const older = posts[idx + 1];
  const newer = idx > 0 ? posts[idx - 1] : undefined;
  if (!older && !newer) return '';
  const blogRoot = hrefFor(BLOG_SLUG);
  const side = (post, modifier, label) =>
    post
      ? `<a class="post-nav__link post-nav__link--${modifier}" href="${blogRoot}${post.meta.slug}/"><span class="post-nav__label">${label}</span><span class="post-nav__title">${escape(post.meta.title)}</span></a>`
      : `<span class="post-nav__link post-nav__link--${modifier} post-nav__link--empty"></span>`;
  return `\n<nav class="post-nav" aria-label="Articoli adiacenti">
${side(older, 'prev', 'Articolo precedente')}
${side(newer, 'next', 'Articolo successivo')}
</nav>\n`;
}

// Articoli correlati: fino a 3 altri post che condividono almeno un tag,
// ordinati per numero di tag condivisi e poi per data di pubblicazione.
function relatedPostsHtml(meta, posts, hrefFor) {
  const scored = posts
    .filter((p) => p.meta.slug !== meta.slug)
    .map((p) => ({ post: p, shared: p.meta.tags.filter((t) => meta.tags.includes(t)).length }))
    .filter((x) => x.shared > 0)
    .sort((a, b) => b.shared - a.shared || (a.post.meta.sortKey < b.post.meta.sortKey ? 1 : -1));
  const picked = scored.slice(0, 3).map((x) => x.post);
  if (!picked.length) return '';
  const cards = picked.map((p) => postCard(p.meta, hrefFor)).join('\n');
  return `\n<section class="section related-posts" data-reveal>
    <div class="section__head">
      <p class="eyelash">Correlati</p>
      <h2 class="section__title">Articoli correlati</h2>
    </div>
    <ul class="posts">
${cards}
    </ul>
  </section>`;
}

// Riga di condivisione: Telegram è un link statico, "Copia link" è
// progressive enhancement — resta "hidden" senza JS, main.js lo rivela solo
// se navigator.clipboard è disponibile.
function shareRow(meta, canonical) {
  const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(canonical)}&text=${encodeURIComponent(meta.title)}`;
  return `\n<div class="share">
  <p class="share__label">Condividi</p>
  <a class="share__btn" href="${shareUrl}" target="_blank" rel="noopener">Telegram</a>
  <button class="share__btn share__copy" type="button" data-copy-link="${canonical}" hidden>Copia link</button>
  <span class="share__status" role="status" aria-live="polite"></span>
</div>\n`;
}

function renderPage(layout, meta, fragment, pages, file) {
  const canonical = `${SITE_BASE}${meta.slug}/`;
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
    // "article" per la documentazione; una pagina può dichiararsi diversa
    // (es. la pagina community, che è una scheda dell'organizzazione).
    '{{OG_TYPE}}': escape(meta.ogType || 'article'),
    '{{OG_IMAGE}}': `${SITE_BASE}assets/img/og-image.png`,
    '{{JSONLD}}': buildJsonLd(meta),
    '{{NAV}}': buildNav(pages, meta.slug, relativeHref(1)),
    '{{FOOTER_NAV}}': buildFooterNav(pages, meta.slug, relativeHref(1)),
    '{{BREADCRUMB}}': buildCrumbs([{ name: 'Home', href: '../' }, { name: meta.nav }]),
    '{{EYELASH}}': escape(meta.nav),
    '{{H1}}': escape(meta.h1),
    '{{LEDE}}': escape(meta.lede),
    '{{CONTENT}}': fragment,
    '{{RELATED}}': buildRelated(pages, meta.slug),
    '{{UPDATED_HUMAN}}': humanDate(meta.updated),
    '{{ROOT}}': '../',
    '{{FEED_URL}}': `${SITE_BASE}feed.xml`,
    '{{FEED_TITLE}}': `MeshCore ITA — ${BLOG_LABEL}`,
    '{{EDIT_URL}}': `${REPO_EDIT_BASE}content/${file}`,
  };
  let html = layout;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

// Pagina di un singolo post (blog/<slug>/index.html, depth 2).
function renderPost(layout, meta, fragment, pages, file, posts) {
  const canonical = `${SITE_BASE}${BLOG_SLUG}/${meta.slug}/`;
  const hrefFor = relativeHref(2);
  const toc = buildToc(fragment);
  const fragmentWithToc = toc ? fragment.replace('  <div class="prose">', `${toc}  <div class="prose">`) : fragment;
  const content = `${fragmentWithToc}${prevNextHtml(meta, posts, hrefFor)}${shareRow(meta, canonical)}${relatedPostsHtml(meta, posts, hrefFor)}`;
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
    '{{OG_TYPE}}': 'article',
    '{{OG_IMAGE}}': `${SITE_BASE}assets/img/og-image.png`,
    '{{JSONLD}}': buildPostJsonLd(meta),
    '{{NAV}}': buildNav(pages, BLOG_SLUG, hrefFor),
    '{{FOOTER_NAV}}': buildFooterNav(pages, BLOG_SLUG, hrefFor),
    '{{BREADCRUMB}}': buildCrumbs([
      { name: 'Home', href: '../../' },
      { name: BLOG_LABEL, href: '../' },
      { name: meta.h1 },
    ]),
    '{{EYELASH}}': BLOG_LABEL,
    '{{H1}}': escape(meta.h1),
    '{{LEDE}}': escape(meta.lede),
    '{{CONTENT}}': content,
    '{{RELATED}}': buildBlogRelated(2, pages, {
      href: '../',
      title: BLOG_LABEL,
      body: 'Tutti gli articoli e le novità di MeshCore ITA.',
    }),
    '{{UPDATED_HUMAN}}': humanDate(meta.updated),
    '{{ROOT}}': '../../',
    '{{FEED_URL}}': `${SITE_BASE}feed.xml`,
    '{{FEED_TITLE}}': `MeshCore ITA — ${BLOG_LABEL}`,
    '{{EDIT_URL}}': `${REPO_EDIT_BASE}content/${BLOG_SLUG}/${file}`,
  };
  let html = layout;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

// Elenco dei post di una pagina (indice, tag): hrefFor è quello della
// pagina corrente, la card calcola da sola il link a ogni post/tag.
function buildPostList(posts, hrefFor, { withFeatured = false } = {}) {
  if (!posts.length) {
    return `<section class="section">
    <div class="prose">
      <p>Non ci sono ancora articoli pubblicati. Torna presto.</p>
    </div>
  </section>`;
  }
  const items = posts.map((p, i) => postCard(p.meta, hrefFor, { featured: withFeatured && i === 0 })).join('\n');
  return `<section class="section">
  <ul class="posts">
${items}
  </ul>
</section>`;
}

// Paginazione: la pagina 1 resta la rotta storica (/blog/ o /blog/tag/<slug>/,
// mai spostate), le successive vivono in .../pagina/<n>/. Niente
// <link rel=prev/next> nel <head>: Google li ignora dal 2019, i link
// navigabili sono ciò che conta. Generica: usata per l'indice del blog e per
// ogni pagina tag, che condividono la stessa struttura di annidamento.
function paginatePosts(posts) {
  if (posts.length <= POSTS_PER_PAGE) return [posts];
  const slices = [];
  for (let i = 0; i < posts.length; i += POSTS_PER_PAGE) {
    slices.push(posts.slice(i, i + POSTS_PER_PAGE));
  }
  return slices;
}

// Href di una pagina n vista da una pagina "from" della stessa sezione
// (indice del blog o indice di un tag: stessa struttura ./ + pagina/<n>/).
const sectionPageHref = (from, to) => {
  const up = from === 1 ? '' : '../../';
  return to === 1 ? `${up}` || './' : `${up}pagina/${to}/`;
};

function buildPager(current, total, pageHref, ariaLabel) {
  if (total < 2) return '';
  const parts = [];
  if (current > 1) {
    parts.push(`    <a class="pager__link pager__link--prev" rel="prev" href="${pageHref(current - 1)}">Più recenti</a>`);
  }
  parts.push(`    <span class="pager__status">Pagina ${current} di ${total}</span>`);
  if (current < total) {
    parts.push(`    <a class="pager__link pager__link--next" rel="next" href="${pageHref(current + 1)}">Meno recenti</a>`);
  }
  return `\n<nav class="pager" aria-label="${escape(ariaLabel)}">
${parts.join('\n')}
  </nav>`;
}

// Una pagina dell'indice del blog. Pagina 1 = blog/index.html (depth 1),
// pagina n>1 = blog/pagina/<n>/index.html (depth 3).
function renderBlogIndex(layout, pagePosts, allPosts, pages, pageNum, totalPages, tagCounts) {
  const first = pageNum === 1;
  const canonical = first
    ? `${SITE_BASE}${BLOG_SLUG}/`
    : `${SITE_BASE}${BLOG_SLUG}/pagina/${pageNum}/`;
  const suffix = first ? '' : ` — pagina ${pageNum}`;
  const meta = {
    title: `${BLOG_LABEL}${suffix} — MeshCore ITA`,
    description: 'Novità, guide brevi e annunci della community italiana di MeshCore: repeater, firmware, mappa di copertura e vita del progetto.',
    h1: BLOG_LABEL,
    lede: 'Novità, guide brevi e annunci della community italiana di MeshCore.',
    updated: latestBlogUpdated(allPosts, pages),
  };
  const depth = first ? 1 : 3;
  const hrefFor = relativeHref(depth);
  const root = first ? '../' : '../../../';
  const crumbs = first
    ? [{ name: 'Home', href: root }, { name: meta.h1 }]
    : [
        { name: 'Home', href: root },
        { name: meta.h1, href: '../../' },
        { name: `Pagina ${pageNum}` },
      ];
  const content = `${buildTopicBar(tagCounts, hrefFor)}${buildPostList(pagePosts, hrefFor, { withFeatured: first })}${buildPager(
    pageNum,
    totalPages,
    (to) => sectionPageHref(pageNum, to),
    `Paginazione del ${BLOG_LABEL.toLowerCase()}`
  )}`;
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
    // L'indice è un elenco, non un articolo.
    '{{OG_TYPE}}': 'website',
    '{{OG_IMAGE}}': `${SITE_BASE}assets/img/og-image.png`,
    '{{JSONLD}}': buildBlogIndexJsonLd(pagePosts, pageNum),
    '{{NAV}}': buildNav(pages, BLOG_SLUG, hrefFor),
    '{{FOOTER_NAV}}': buildFooterNav(pages, BLOG_SLUG, hrefFor),
    '{{BREADCRUMB}}': buildCrumbs(crumbs),
    '{{EYELASH}}': escape(meta.h1),
    '{{H1}}': escape(meta.h1),
    '{{LEDE}}': escape(meta.lede),
    '{{CONTENT}}': content,
    '{{RELATED}}': buildBlogRelated(depth, pages, {
      href: root,
      title: 'Home',
      body: 'Torna alla pagina principale di MeshCore ITA.',
    }),
    '{{UPDATED_HUMAN}}': humanDate(meta.updated),
    '{{ROOT}}': root,
    '{{FEED_URL}}': `${SITE_BASE}feed.xml`,
    '{{FEED_TITLE}}': `MeshCore ITA — ${BLOG_LABEL}`,
    '{{EDIT_URL}}': `${REPO_TREE_BASE}content/blog`,
  };
  let html = layout;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

// Una pagina di /blog/tag/<slug>/ (+ paginazione). pagina 1 = depth 3
// (blog/tag/<slug>/index.html), pagina n>1 = depth 5
// (blog/tag/<slug>/pagina/<n>/index.html).
function renderTagPage(layout, tag, pagePosts, allTagPosts, pages, pageNum, totalPages) {
  const first = pageNum === 1;
  const tagPath = `${BLOG_SLUG}/tag/${tag.slug}/`;
  const canonical = first ? `${SITE_BASE}${tagPath}` : `${SITE_BASE}${tagPath}pagina/${pageNum}/`;
  const suffix = first ? '' : ` — pagina ${pageNum}`;
  const meta = {
    title: `${tag.label}${suffix} — ${BLOG_LABEL} — MeshCore ITA`,
    description: tag.description,
    h1: tag.label,
    lede: tag.description,
    updated: allTagPosts.reduce((max, p) => (p.meta.updated > max ? p.meta.updated : max), allTagPosts[0].meta.updated),
  };
  const depth = first ? 3 : 5;
  const hrefFor = relativeHref(depth);
  const root = hrefFor('');
  const blogRootHref = hrefFor(BLOG_SLUG);
  const crumbs = first
    ? [{ name: 'Home', href: root }, { name: BLOG_LABEL, href: blogRootHref }, { name: tag.label }]
    : [
        { name: 'Home', href: root },
        { name: BLOG_LABEL, href: blogRootHref },
        { name: tag.label, href: `${blogRootHref}tag/${tag.slug}/` },
        { name: `Pagina ${pageNum}` },
      ];
  const content = `${buildPostList(pagePosts, hrefFor)}${buildPager(
    pageNum,
    totalPages,
    (to) => sectionPageHref(pageNum, to),
    `Paginazione — ${tag.label}`
  )}`;
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
    '{{OG_TYPE}}': 'website',
    '{{OG_IMAGE}}': `${SITE_BASE}assets/img/og-image.png`,
    '{{JSONLD}}': buildTagJsonLd(tag, pagePosts, pageNum),
    '{{NAV}}': buildNav(pages, BLOG_SLUG, hrefFor),
    '{{FOOTER_NAV}}': buildFooterNav(pages, BLOG_SLUG, hrefFor),
    '{{BREADCRUMB}}': buildCrumbs(crumbs),
    '{{EYELASH}}': BLOG_LABEL,
    '{{H1}}': escape(meta.h1),
    '{{LEDE}}': escape(meta.lede),
    '{{CONTENT}}': content,
    '{{RELATED}}': buildBlogRelated(depth, pages, {
      href: blogRootHref,
      title: BLOG_LABEL,
      body: 'Tutti gli articoli e le novità di MeshCore ITA.',
    }),
    '{{UPDATED_HUMAN}}': humanDate(meta.updated),
    '{{ROOT}}': root,
    '{{FEED_URL}}': `${blogRootHref}tag/${tag.slug}/feed.xml`,
    '{{FEED_TITLE}}': `MeshCore ITA — ${BLOG_LABEL}: ${tag.label}`,
    '{{EDIT_URL}}': `${REPO_TREE_BASE}content/blog`,
  };
  let html = layout;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

// /blog/archivio/: tutti i post raggruppati per anno e mese (depth 2), più
// l'elenco completo dei tag con conteggio.
function renderArchivePage(layout, posts, pages, tagCounts) {
  const depth = 2;
  const hrefFor = relativeHref(depth);
  const root = hrefFor('');
  const blogRootHref = hrefFor(BLOG_SLUG);
  const canonical = `${SITE_BASE}${BLOG_SLUG}/archivio/`;
  const meta = {
    title: `Archivio — ${BLOG_LABEL} — MeshCore ITA`,
    description: `Tutti gli articoli del ${BLOG_LABEL.toLowerCase()} di MeshCore ITA, divisi per anno e mese.`,
    h1: 'Archivio',
    lede: 'Tutti gli articoli, divisi per anno e mese.',
    updated: latestBlogUpdated(posts, pages),
  };
  const byYear = new Map();
  for (const post of posts) {
    const [y, m] = post.meta.published.split('-').map(Number);
    if (!byYear.has(y)) byYear.set(y, new Map());
    const months = byYear.get(y);
    if (!months.has(m)) months.set(m, []);
    months.get(m).push(post);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);
  const yearBlocks = years
    .map((year) => {
      const months = byYear.get(year);
      const monthKeys = [...months.keys()].sort((a, b) => b - a);
      const monthBlocks = monthKeys
        .map((month) => {
          const items = months
            .get(month)
            .map(({ meta: m }) => {
              const tags = m.tagInfo.length ? ` · ${tagChips(m.tagInfo, hrefFor, null)}` : '';
              return `<li class="archive__item"><time datetime="${m.published}">${humanDate(m.published)}</time> · <a href="${blogRootHref}${m.slug}/">${escape(m.title)}</a>${tags}</li>`;
            })
            .join('');
          return `<div class="archive__month"><h3 class="archive__month-title">${MONTHS_IT[month - 1]}</h3><ul class="archive__list">${items}</ul></div>`;
        })
        .join('');
      return `<section class="archive__year"><h2 class="archive__year-title">${year}</h2>${monthBlocks}</section>`;
    })
    .join('');
  // Stessi chip con conteggio della barra argomenti dell'indice.
  const tagList = tagCounts.length
    ? `<div class="archive__tags"><h2 class="archive__year-title">Tag</h2>${buildTopicBar(tagCounts, hrefFor, { extras: false })}</div>`
    : '';
  const content = `<section class="section">
  <div class="archive">
${yearBlocks}
  </div>
  ${tagList}
</section>`;
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
    '{{OG_TYPE}}': 'website',
    '{{OG_IMAGE}}': `${SITE_BASE}assets/img/og-image.png`,
    '{{JSONLD}}': buildArchiveJsonLd(posts),
    '{{NAV}}': buildNav(pages, BLOG_SLUG, hrefFor),
    '{{FOOTER_NAV}}': buildFooterNav(pages, BLOG_SLUG, hrefFor),
    '{{BREADCRUMB}}': buildCrumbs([
      { name: 'Home', href: root },
      { name: BLOG_LABEL, href: blogRootHref },
      { name: 'Archivio' },
    ]),
    '{{EYELASH}}': BLOG_LABEL,
    '{{H1}}': escape(meta.h1),
    '{{LEDE}}': escape(meta.lede),
    '{{CONTENT}}': content,
    '{{RELATED}}': buildBlogRelated(depth, pages, {
      href: blogRootHref,
      title: BLOG_LABEL,
      body: 'Tutti gli articoli e le novità di MeshCore ITA.',
    }),
    '{{UPDATED_HUMAN}}': humanDate(meta.updated),
    '{{ROOT}}': root,
    '{{FEED_URL}}': `${SITE_BASE}feed.xml`,
    '{{FEED_TITLE}}': `MeshCore ITA — ${BLOG_LABEL}`,
    '{{EDIT_URL}}': `${REPO_TREE_BASE}content/blog`,
  };
  let html = layout;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

function renderNotFound(template, pages) {
  const replacements = {
    '{{BASE}}': SITE_BASE,
    '{{FEED_URL}}': `${SITE_BASE}feed.xml`,
    '{{FEED_TITLE}}': `MeshCore ITA — ${BLOG_LABEL}`,
    '{{NAV}}': buildNav(pages, null, absoluteHref),
    '{{FOOTER_NAV}}': buildFooterNav(pages, null, absoluteHref),
  };
  let html = template;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

function buildSitemap(pages, posts, tagIndex) {
  const sorted = [...pages].sort((a, b) => a.meta.order - b.meta.order);
  const urls = [`  <url>\n    <loc>${SITE_BASE}</loc>\n  </url>`];
  for (const { meta } of sorted) {
    urls.push(
      `  <url>\n    <loc>${SITE_BASE}${meta.slug}/</loc>\n    <lastmod>${meta.updated}</lastmod>\n  </url>`
    );
  }
  urls.push(
    `  <url>\n    <loc>${SITE_BASE}${BLOG_SLUG}/</loc>\n    <lastmod>${latestBlogUpdated(posts, pages)}</lastmod>\n  </url>`
  );
  const slices = paginatePosts(posts);
  for (let n = 2; n <= slices.length; n += 1) {
    urls.push(
      `  <url>\n    <loc>${SITE_BASE}${BLOG_SLUG}/pagina/${n}/</loc>\n    <lastmod>${slices[n - 1][0].meta.updated}</lastmod>\n  </url>`
    );
  }
  for (const { meta } of posts) {
    urls.push(
      `  <url>\n    <loc>${SITE_BASE}${BLOG_SLUG}/${meta.slug}/</loc>\n    <lastmod>${meta.updated}</lastmod>\n  </url>`
    );
  }
  urls.push(
    `  <url>\n    <loc>${SITE_BASE}${BLOG_SLUG}/archivio/</loc>\n    <lastmod>${latestBlogUpdated(posts, pages)}</lastmod>\n  </url>`
  );
  for (const [slug, tagPosts] of tagIndex) {
    const latest = tagPosts.reduce((max, p) => (p.meta.updated > max ? p.meta.updated : max), tagPosts[0].meta.updated);
    urls.push(
      `  <url>\n    <loc>${SITE_BASE}${BLOG_SLUG}/tag/${slug}/</loc>\n    <lastmod>${latest}</lastmod>\n  </url>`
    );
    const tagSlices = paginatePosts(tagPosts);
    for (let n = 2; n <= tagSlices.length; n += 1) {
      urls.push(
        `  <url>\n    <loc>${SITE_BASE}${BLOG_SLUG}/tag/${slug}/pagina/${n}/</loc>\n    <lastmod>${tagSlices[n - 1][0].meta.updated}</lastmod>\n  </url>`
      );
    }
  }
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

// Sitemap aggiuntive pubblicate da altri repo sotto lo stesso dominio: una
// sitemap in /antenne/ può elencare solo URL sotto /antenne/, quindi la
// galleria ha la sua e qui la dichiariamo accanto a quella del sito.
const EXTRA_SITEMAPS = ['antenne/sitemap.xml'];

function buildRobots() {
  const maps = ['sitemap.xml', ...EXTRA_SITEMAPS].map((p) => `Sitemap: ${SITE_BASE}${p}`).join('\n');
  return `User-agent: *\nAllow: /\n\n${maps}\n`;
}

// RFC 3339 a partire da una data YYYY-MM-DD: sempre mezzanotte UTC, mai
// legata all'orario di build (il feed deve restare deterministico).
function rfc3339(iso) {
  return `${iso}T00:00:00Z`;
}

// Istante di pubblicazione di un post: con "time" è l'ora italiana vera,
// senza resta la mezzanotte UTC di sempre. "updated" riusa l'ora solo se
// coincide con la data di pubblicazione, così non precede mai <published>.
function postPublishedAt(meta) {
  return meta.time ? `${meta.published}T${meta.time}:00${romeOffset(meta.published)}` : rfc3339(meta.published);
}

function postUpdatedAt(meta) {
  return meta.updated === meta.published ? postPublishedAt(meta) : rfc3339(meta.updated);
}

// Generico: usato sia per il feed dell'intero blog sia per i feed per tag
// (stesso formato Atom, id/link/titolo diversi).
function buildFeed(posts, pages, options = {}) {
  const {
    id = `${SITE_BASE}${BLOG_SLUG}/`,
    selfHref = `${SITE_BASE}feed.xml`,
    alternateHref = `${SITE_BASE}${BLOG_SLUG}/`,
    title = `MeshCore ITA — ${BLOG_LABEL}`,
  } = options;
  // L'istante più recente tra le voci (confrontato come data vera: gli
  // scostamenti orari possono differire), mai prima di un <published>.
  const updated = posts.length
    ? posts.map((p) => postUpdatedAt(p.meta)).reduce((max, d) => (Date.parse(d) > Date.parse(max) ? d : max))
    : rfc3339(latestBlogUpdated(posts, pages));
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    `  <title>${escape(title)}</title>`,
    `  <id>${id}</id>`,
    `  <link rel="self" href="${selfHref}"/>`,
    `  <link rel="alternate" href="${alternateHref}"/>`,
    `  <updated>${updated}</updated>`,
    '  <author><name>MeshCore ITA</name></author>',
  ];
  for (const post of posts.slice(0, FEED_MAX_ENTRIES)) {
    const canonical = `${SITE_BASE}${BLOG_SLUG}/${post.meta.slug}/`;
    lines.push(
      '  <entry>',
      `    <id>${canonical}</id>`,
      `    <title>${escape(post.meta.title)}</title>`,
      `    <link rel="alternate" href="${canonical}"/>`,
      `    <published>${postPublishedAt(post.meta)}</published>`,
      `    <updated>${postUpdatedAt(post.meta)}</updated>`,
      `    <summary type="text">${escape(post.meta.lede)}</summary>`,
      ...post.meta.tagInfo.map((t) => `    <category term="${t.slug}" label="${escape(t.label)}"/>`),
      `    <content type="html">${escape(post.fragment)}</content>`,
      '  </entry>'
    );
  }
  lines.push('</feed>');
  return `${lines.join('\n')}\n`;
}

// --- home (index.html) ---------------------------------------------------
// index.html è scritta a mano, ma la sezione "Ultimi articoli" è generata:
// vive tra due commenti marcatore che il build cerca e sostituisce per
// intero. Mancano? La build si ferma con un errore chiaro invece di
// ignorare la sezione in silenzio.
const HOME_MARKER_START = '<!-- ultimi-articoli:inizio -->';
const HOME_MARKER_END = '<!-- ultimi-articoli:fine -->';

function renderHome(posts) {
  if (!existsSync(HOME_PATH)) return null;
  const current = readFileSync(HOME_PATH, 'utf8');
  const startIdx = current.indexOf(HOME_MARKER_START);
  const endIdx = current.indexOf(HOME_MARKER_END);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(
      `index.html: mancano i marcatori "${HOME_MARKER_START}" / "${HOME_MARKER_END}" per la sezione "Ultimi articoli"`
    );
  }
  const hrefFor = relativeHref(0);
  const latest = posts.slice(0, 3);
  const body = latest.length
    ? `    <ul class="posts">\n${latest.map((p) => postCard(p.meta, hrefFor)).join('\n')}\n    </ul>`
    : '    <p class="section__lede">Non ci sono ancora articoli pubblicati. Torna presto.</p>';
  const section = `${HOME_MARKER_START}
  <section id="blog" class="section" data-reveal>
    <div class="section__head">
      <p class="eyelash">${BLOG_LABEL}</p>
      <h2 class="section__title">Ultimi articoli</h2>
      <p class="section__lede">Novità, guide brevi e annunci della community italiana di MeshCore.</p>
    </div>
${body}
    <p class="section__lede">Tutti gli articoli: <a class="link" href="blog/">il blog di MeshCore ITA</a>.</p>
  </section>
  ${HOME_MARKER_END}`;
  return `${current.slice(0, startIdx)}${section}${current.slice(endIdx + HOME_MARKER_END.length)}`;
}

// --- orchestration --------------------------------------------------

function computeOutputs() {
  const pages = readContentFiles();
  const registry = readTagRegistry();
  const posts = readPostFiles(registry);
  const layout = readFileSync(LAYOUT_PATH, 'utf8');
  const notFoundTemplate = readFileSync(NOT_FOUND_TEMPLATE_PATH, 'utf8');
  const outputs = new Map();
  // Due sorgenti che scrivono lo stesso file sarebbero una pagina che ne
  // sovrascrive un'altra in silenzio: meglio fermare la build.
  const put = (rel, content) => {
    if (outputs.has(rel)) throw new Error(`due sorgenti generano lo stesso file: ${rel}`);
    outputs.set(rel, content);
  };

  // Tag effettivamente usati da almeno un post, nell'ordine canonico del
  // registro: quelli a zero post non generano pagina né feed.
  const tagIndex = new Map();
  for (const slug of registry.keys()) {
    const tagPosts = posts.filter((p) => p.meta.tags.includes(slug));
    if (tagPosts.length) tagIndex.set(slug, tagPosts);
  }
  const tagCounts = [...tagIndex.entries()].map(([slug, tagPosts]) => ({
    slug,
    label: registry.get(slug).label,
    count: tagPosts.length,
  }));

  for (const { file, meta, fragment } of pages) {
    put(join(meta.slug, 'index.html'), renderPage(layout, meta, fragment, pages, file));
  }
  for (const { file, meta, fragment } of posts) {
    put(join(BLOG_SLUG, meta.slug, 'index.html'), renderPost(layout, meta, fragment, pages, file, posts));
  }
  const slices = paginatePosts(posts);
  slices.forEach((slice, i) => {
    const n = i + 1;
    const rel = n === 1 ? join(BLOG_SLUG, 'index.html') : join(BLOG_SLUG, 'pagina', String(n), 'index.html');
    put(rel, renderBlogIndex(layout, slice, posts, pages, n, slices.length, tagCounts));
  });
  for (const [slug, tagPosts] of tagIndex) {
    const tag = registry.get(slug);
    const tagSlices = paginatePosts(tagPosts);
    tagSlices.forEach((slice, i) => {
      const n = i + 1;
      const rel =
        n === 1
          ? join(BLOG_SLUG, 'tag', slug, 'index.html')
          : join(BLOG_SLUG, 'tag', slug, 'pagina', String(n), 'index.html');
      put(rel, renderTagPage(layout, tag, slice, tagPosts, pages, n, tagSlices.length));
    });
    put(
      join(BLOG_SLUG, 'tag', slug, 'feed.xml'),
      buildFeed(tagPosts, pages, {
        id: `${SITE_BASE}${BLOG_SLUG}/tag/${slug}/`,
        selfHref: `${SITE_BASE}${BLOG_SLUG}/tag/${slug}/feed.xml`,
        alternateHref: `${SITE_BASE}${BLOG_SLUG}/tag/${slug}/`,
        title: `MeshCore ITA — ${BLOG_LABEL}: ${tag.label}`,
      })
    );
  }
  put(join(BLOG_SLUG, 'archivio', 'index.html'), renderArchivePage(layout, posts, pages, tagCounts));

  const chunks = computeAllChunks(pages, posts);
  put('feed.xml', buildFeed(posts, pages));
  put('sitemap.xml', buildSitemap(pages, posts, tagIndex));
  put('robots.txt', buildRobots());
  put('404.html', renderNotFound(notFoundTemplate, pages));
  put(join('worker', 'kb.generated.mjs'), buildKbModule(chunks));
  put('search-index.json', buildSearchIndex(chunks));
  const home = renderHome(posts);
  if (home !== null) put('index.html', home);
  return { pages, posts, outputs };
}

// Pagine generate presenti sul disco: ogni <dir>/index.html fuori dalle
// cartelle sorgente. Serve a riconoscere le rotte rimaste dopo la
// cancellazione di un contenuto (post, tag non più usato, ecc.).
function listGeneratedPages(dir = ROOT, rel = '') {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const childRel = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (!rel && SOURCE_DIRS.has(entry.name)) continue;
      found.push(...listGeneratedPages(join(dir, entry.name), childRel));
    } else if (rel && entry.name === 'index.html') {
      found.push(childRel);
    }
  }
  return found;
}

function staleOutputs(outputs) {
  const expected = new Set([...outputs.keys()].map((rel) => rel.split('\\').join('/')));
  return listGeneratedPages().filter((rel) => !expected.has(rel));
}

// Rimuove il file e poi le cartelle rimaste vuote risalendo fino alla radice.
function removeGenerated(rel) {
  rmSync(join(ROOT, rel), { force: true });
  let dir = dirname(join(ROOT, rel));
  while (dir !== ROOT) {
    try {
      rmdirSync(dir);
    } catch {
      return;
    }
    dir = dirname(dir);
  }
}

// La home è scritta a mano ma pubblica URL assoluti: se non corrispondono a
// SITE_BASE (fork, repo rinominato) canonical, og:url e feed puntano altrove.
function checkHomeBase() {
  const homePath = join(ROOT, 'index.html');
  if (!existsSync(homePath)) return [];
  const canonical = /<link rel="canonical" href="([^"]+)"/.exec(readFileSync(homePath, 'utf8'));
  if (!canonical) return ['index.html: manca il link canonical'];
  return canonical[1] === SITE_BASE
    ? []
    : [`index.html: canonical ${canonical[1]} non corrisponde a SITE_BASE (${SITE_BASE})`];
}

function writeOutputs(outputs) {
  for (const [rel, content] of outputs) {
    const full = join(ROOT, rel);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, content, 'utf8');
  }
}

function checkOutputs(outputs) {
  const problems = [];
  for (const [rel, content] of outputs) {
    const full = join(ROOT, rel);
    if (!existsSync(full)) {
      problems.push(`mancante: ${rel}`);
      continue;
    }
    if (readFileSync(full, 'utf8') !== content) {
      problems.push(`non aggiornato: ${rel}`);
    }
  }
  for (const rel of staleOutputs(outputs)) {
    problems.push(`orfano (nessun sorgente lo genera): ${rel}`);
  }
  problems.push(...checkHomeBase());
  return problems;
}

function main() {
  const checkMode = process.argv.includes('--check');
  let pages;
  let posts;
  let outputs;
  try {
    ({ pages, posts, outputs } = computeOutputs());
  } catch (err) {
    console.error(`Errore di build: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  const indexPages = paginatePosts(posts).length;
  const indexLabel = indexPages === 1 ? 'blog/index.html' : `${indexPages} pagine indice blog`;
  const summary = `${pages.length} pagine + ${posts.length} post + ${indexLabel} + tag/archivio/feed del blog + feed.xml + sitemap.xml + robots.txt + 404.html + search-index.json + worker/kb.generated.mjs + index.html`;

  if (checkMode) {
    const problems = checkOutputs(outputs);
    if (problems.length) {
      console.error('Il contenuto generato non corrisponde a quello committato:');
      for (const problem of problems) console.error(`  - ${problem}`);
      console.error('Esegui `node build.mjs` e committa i file generati.');
      process.exitCode = 1;
      return;
    }
    console.log(`OK: ${outputs.size} file generati sono aggiornati (${summary}).`);
    return;
  }

  const stale = staleOutputs(outputs);
  for (const rel of stale) removeGenerated(rel);
  writeOutputs(outputs);
  for (const problem of checkHomeBase()) console.warn(`Attenzione: ${problem}`);
  const removed = stale.length ? `, rimossi ${stale.length} file orfani` : '';
  console.log(`Generati ${outputs.size} file (${summary})${removed}.`);
}

// Eseguito solo da riga di comando: importare questo modulo (per SITE_BASE
// o per le funzioni) non deve rigenerare il sito come effetto collaterale.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
