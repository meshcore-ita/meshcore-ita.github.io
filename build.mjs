#!/usr/bin/env node
// MeshCore ITA — static site generator. Node stdlib + marked (markdown).
// Reads templates/layout.html + ogni content/<slug>.html o content/<slug>.md
// e scrive <slug>/index.html, sitemap.xml, robots.txt, 404.html,
// search-index.json e worker/kb.generated.mjs alla radice del repo.
// Legge anche content/blog/<slug>.md e scrive blog/<slug>/index.html,
// blog/index.html e feed.xml (il blog "Aggiornamenti").
//
// Usage:
//   node build.mjs           write generated files to disk
//   node build.mjs --check   build in memory, fail if committed output drifts

import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marked } from 'marked';
import { SITE_BASE } from './scripts/site-base.mjs';

const ROOT = dirname(fileURLToPath(import.meta.url));

export { SITE_BASE };

const REPO_EDIT_BASE =
  'https://github.com/meshcore-ita/meshcore-ita.github.io/edit/main/';
const REPO_TREE_BASE =
  'https://github.com/meshcore-ita/meshcore-ita.github.io/tree/main/';
const CONTENT_DIR = join(ROOT, 'content');
const BLOG_DIR = join(CONTENT_DIR, 'blog');
const BLOG_SLUG = 'blog';
const TEMPLATES_DIR = join(ROOT, 'templates');
const LAYOUT_PATH = join(TEMPLATES_DIR, 'layout.html');
const NOT_FOUND_TEMPLATE_PATH = join(TEMPLATES_DIR, '404.html');

const REQUIRED_KEYS = ['slug', 'nav', 'order', 'primary', 'title', 'description', 'h1', 'lede', 'updated'];
const POST_REQUIRED_KEYS = ['slug', 'title', 'description', 'h1', 'lede', 'published'];
const DEFAULT_AUTHOR = 'MeshCore ITA';
const FEED_MAX_ENTRIES = 20;
const POSTS_PER_PAGE = 10;

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
  if (!m) throw new Error(`data "updated" non valida (atteso YYYY-MM-DD): ${iso}`);
  const [, year, month, day] = m;
  const name = MONTHS_IT[Number(month) - 1];
  if (!name) throw new Error(`mese non valido in "updated": ${iso}`);
  return `${Number(day)} ${name} ${year}`;
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

// Rendering markdown delle pagine sorgente .md — riusata anche dai post
// del blog (content/blog/*.md), che condividono lo stesso avvolgimento.
export function renderMarkdown(body, lead = '') {
  const html = marked.parse(body, { gfm: true, breaks: false });
  return `<section class="section">\n${lead}  <div class="prose">\n${html}\n  </div>\n</section>`;
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
  const body = match[2].trim();
  if (!body) {
    throw new Error(`${file}: il corpo della pagina è vuoto`);
  }
  const fragment = anchorHeadings(ext === 'md' ? renderMarkdown(body) : body);
  return { file, meta, fragment };
}

function readContentFiles() {
  if (!existsSync(CONTENT_DIR)) return [];
  const files = readdirSync(CONTENT_DIR).filter((f) => /\.(html|md)$/.test(f)).sort();
  return files.map(parseContentFile);
}

// --- blog parsing (content/blog/*.md) -----------------------------------
// Stesso blocco <!--meta ... --> dei contenuti .md, chiavi diverse: niente
// "nav"/"order"/"primary" (i post non stanno nella nav piatta né in nessuna
// sezione del footer come pagina singola), ma "published" invece di
// "updated" come data principale. "updated" è opzionale (default: published).

// Riga meta e tag vivono nello stesso .section del corpo: fuori di lì
// finirebbero a filo del viewport invece che allineati all'h1.
function buildPostMetaBlock(meta) {
  const metaLine = `  <p class="post-meta"><time datetime="${meta.published}">${humanDate(meta.published)}</time> · <span class="post-meta__author">${escape(meta.author)}</span></p>\n`;
  if (!meta.tags.length) return metaLine;
  return `${metaLine}  <ul class="tags">${meta.tags.map((t) => `<li class="tag">${escape(t)}</li>`).join('')}</ul>\n`;
}

function parsePostFile(file) {
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
  assertPostDate(file, 'published', meta.published);
  if (meta.updated === undefined) meta.updated = meta.published;
  assertPostDate(file, 'updated', meta.updated);
  if (meta.author === undefined) meta.author = DEFAULT_AUTHOR;
  if (meta.tags === undefined) {
    meta.tags = [];
  } else if (!Array.isArray(meta.tags)) {
    throw new Error(`blog/${file}: "tags" deve essere un array`);
  }
  if (meta.jsonld === undefined) {
    meta.jsonld = [];
  } else if (!Array.isArray(meta.jsonld)) {
    throw new Error(`blog/${file}: "jsonld" deve essere un array`);
  }
  const body = match[2].trim();
  if (!body) {
    throw new Error(`blog/${file}: il corpo dell'articolo è vuoto`);
  }
  const fragment = anchorHeadings(renderMarkdown(body, buildPostMetaBlock(meta)));
  return { file, meta, fragment };
}

function readPostFiles() {
  if (!existsSync(BLOG_DIR)) return [];
  const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith('.md')).sort();
  const posts = files.map(parsePostFile);
  posts.sort((a, b) => {
    if (a.meta.published !== b.meta.published) return a.meta.published < b.meta.published ? 1 : -1;
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
  const used = new Set();
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
  // page:'Aggiornamenti' e url sotto /blog/<slug>/.
  const postChunks = posts.flatMap(({ meta, fragment }) =>
    extractPageChunks({ slug: `${BLOG_SLUG}/${meta.slug}`, nav: 'Aggiornamenti' }, fragment)
  );
  return [...pageChunks, ...postChunks];
}

function buildKbModule(pages, posts) {
  const chunks = computeAllChunks(pages, posts);
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
function buildSearchIndex(pages, posts) {
  return `${JSON.stringify(computeAllChunks(pages, posts))}\n`;
}

// --- rendering helpers --------------------------------------------------
// Content pages live at depth 1 (<slug>/index.html), so their nav/footer
// links to other pages are relative ("../<slug>/"). 404.html is served by
// GitHub Pages at arbitrary depths, so it renders the same nav/footer with
// absolute links instead — both share the logic below via `hrefFor`.

// relativeHref è una fabbrica: la profondità dell'output determina quanti
// "../" servono per risalire alla radice (pagine content = depth 1, post
// blog = depth 2). absoluteHref serve invece a 404.html, servito da GitHub
// Pages a profondità arbitraria.
const relativeHref = (depth) => (slug) => `${'../'.repeat(depth)}${slug}/`;
const absoluteHref = (slug) => `${SITE_BASE}${slug}/`;

function buildNav(pages, currentSlug, hrefFor) {
  const sorted = pages
    .filter(({ meta }) => meta.primary)
    .sort((a, b) => a.meta.order - b.meta.order);
  const lines = sorted.map(({ meta }) => {
    const current = meta.slug === currentSlug ? ' aria-current="true"' : '';
    return `      <a class="nav__link" href="${hrefFor(meta.slug)}"${current}>${escape(meta.nav)}</a>`;
  });
  const blogCurrent = currentSlug === BLOG_SLUG ? ' aria-current="true"' : '';
  lines.push(`      <a class="nav__link" href="${hrefFor(BLOG_SLUG)}"${blogCurrent}>Aggiornamenti</a>`);
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
  blocks.push(`      <p class="foot__nav-label">Aggiornamenti</p>
      <ul class="foot__nav-list">
        <li><a href="${hrefFor(BLOG_SLUG)}"${blogCurrent}>Aggiornamenti</a></li>
      </ul>`);
  return blocks.join('\n');
}

function wrapJsonLd(graph) {
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2);
  // Never let a literal "</script" inside a string value close the tag early.
  return json.replace(/<\/script/gi, '<\\/script');
}

function buildJsonLd(meta) {
  const canonical = `${SITE_BASE}${meta.slug}/`;
  const graph = [
    ...meta.jsonld,
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
// jsonld extra del meta e da un BreadcrumbList a 3 livelli (Home >
// Aggiornamenti > titolo del post).
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
    },
    ...meta.jsonld,
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_BASE },
        { '@type': 'ListItem', position: 2, name: 'Aggiornamenti', item: blogIndexUrl },
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
    { '@type': 'ListItem', position: 2, name: 'Aggiornamenti', item: blogIndexUrl },
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

// Variante per il blog (post e indice /blog/): le 3 pagine di documentazione
// primarie con l'order più basso, più una card extra a scelta del chiamante
// (l'indice blog per i post, la Home per l'indice blog).
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

function renderPage(layout, meta, fragment, pages, file) {
  const canonical = `${SITE_BASE}${meta.slug}/`;
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
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
    '{{EDIT_URL}}': `${REPO_EDIT_BASE}content/${file}`,
  };
  let html = layout;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

// Pagina di un singolo post (blog/<slug>/index.html, depth 2).
function renderPost(layout, meta, fragment, pages, file) {
  const canonical = `${SITE_BASE}${BLOG_SLUG}/${meta.slug}/`;
  const hrefFor = relativeHref(2);
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
    '{{OG_IMAGE}}': `${SITE_BASE}assets/img/og-image.png`,
    '{{JSONLD}}': buildPostJsonLd(meta),
    '{{NAV}}': buildNav(pages, BLOG_SLUG, hrefFor),
    '{{FOOTER_NAV}}': buildFooterNav(pages, BLOG_SLUG, hrefFor),
    '{{BREADCRUMB}}': buildCrumbs([
      { name: 'Home', href: '../../' },
      { name: 'Aggiornamenti', href: '../' },
      { name: meta.h1 },
    ]),
    '{{EYELASH}}': 'Aggiornamenti',
    '{{H1}}': escape(meta.h1),
    '{{LEDE}}': escape(meta.lede),
    '{{CONTENT}}': fragment,
    '{{RELATED}}': buildBlogRelated(2, pages, {
      href: '../',
      title: 'Aggiornamenti',
      body: 'Tutti gli articoli e le novità di MeshCore ITA.',
    }),
    '{{UPDATED_HUMAN}}': humanDate(meta.updated),
    '{{ROOT}}': '../../',
    '{{FEED_URL}}': `${SITE_BASE}feed.xml`,
    '{{EDIT_URL}}': `${REPO_EDIT_BASE}content/${BLOG_SLUG}/${file}`,
  };
  let html = layout;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

// Elenco dei post di una pagina dell'indice. `postHref` cambia con la
// profondità: "./" dalla pagina 1 (blog/), "../../" dalle pagine
// successive (blog/pagina/<n>/).
function buildPostList(posts, postHref) {
  if (!posts.length) {
    return `<section class="section">
    <div class="prose">
      <p>Non ci sono ancora aggiornamenti pubblicati. Torna presto.</p>
    </div>
  </section>`;
  }
  const items = posts
    .map(
      ({ meta }) =>
        `  <li class="post-card"><a class="post-card__link" href="${postHref}${meta.slug}/"><time class="post-card__date" datetime="${meta.published}">${humanDate(meta.published)}</time><h3 class="post-card__title">${escape(meta.title)}</h3><p class="post-card__body">${escape(meta.lede)}</p></a></li>`
    )
    .join('\n');
  return `<section class="section">
  <ul class="posts">
${items}
  </ul>
</section>`;
}

// Paginazione: la pagina 1 resta /blog/ (URL storico, mai spostato), le
// successive vivono in /blog/pagina/<n>/. Niente <link rel=prev/next> nel
// <head>: Google li ignora dal 2019, i link navigabili sono ciò che conta.
function paginatePosts(posts) {
  if (posts.length <= POSTS_PER_PAGE) return [posts];
  const slices = [];
  for (let i = 0; i < posts.length; i += POSTS_PER_PAGE) {
    slices.push(posts.slice(i, i + POSTS_PER_PAGE));
  }
  return slices;
}

// Href di una pagina dell'indice vista da un'altra pagina dell'indice.
const blogPageHref = (from, to) => {
  const up = from === 1 ? '' : '../../';
  return to === 1 ? `${up}` || './' : `${up}pagina/${to}/`;
};

function buildPager(current, total) {
  if (total < 2) return '';
  const parts = [];
  if (current > 1) {
    parts.push(`    <a class="pager__link pager__link--prev" rel="prev" href="${blogPageHref(current, current - 1)}">Più recenti</a>`);
  }
  parts.push(`    <span class="pager__status">Pagina ${current} di ${total}</span>`);
  if (current < total) {
    parts.push(`    <a class="pager__link pager__link--next" rel="next" href="${blogPageHref(current, current + 1)}">Meno recenti</a>`);
  }
  return `\n<nav class="pager" aria-label="Paginazione degli aggiornamenti">
${parts.join('\n')}
  </nav>`;
}

// Una pagina dell'indice del blog. Pagina 1 = blog/index.html (depth 1),
// pagina n>1 = blog/pagina/<n>/index.html (depth 3).
function renderBlogIndex(layout, pagePosts, allPosts, pages, pageNum, totalPages) {
  const first = pageNum === 1;
  const canonical = first
    ? `${SITE_BASE}${BLOG_SLUG}/`
    : `${SITE_BASE}${BLOG_SLUG}/pagina/${pageNum}/`;
  const suffix = first ? '' : ` — pagina ${pageNum}`;
  const meta = {
    title: `Aggiornamenti${suffix} — MeshCore ITA`,
    description: 'Novità, guide brevi e annunci della community italiana di MeshCore: repeater, firmware, mappa di copertura e vita del progetto.',
    h1: 'Aggiornamenti',
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
  const replacements = {
    '{{TITLE}}': escape(meta.title),
    '{{DESCRIPTION}}': escape(meta.description),
    '{{CANONICAL}}': canonical,
    '{{OG_IMAGE}}': `${SITE_BASE}assets/img/og-image.png`,
    '{{JSONLD}}': buildBlogIndexJsonLd(pagePosts, pageNum),
    '{{NAV}}': buildNav(pages, BLOG_SLUG, hrefFor),
    '{{FOOTER_NAV}}': buildFooterNav(pages, BLOG_SLUG, hrefFor),
    '{{BREADCRUMB}}': buildCrumbs(crumbs),
    '{{EYELASH}}': escape(meta.h1),
    '{{H1}}': escape(meta.h1),
    '{{LEDE}}': escape(meta.lede),
    '{{CONTENT}}': `${buildPostList(pagePosts, first ? './' : '../../')}${buildPager(pageNum, totalPages)}`,
    '{{RELATED}}': buildBlogRelated(depth, pages, {
      href: root,
      title: 'Home',
      body: 'Torna alla pagina principale di MeshCore ITA.',
    }),
    '{{UPDATED_HUMAN}}': humanDate(meta.updated),
    '{{ROOT}}': root,
    '{{FEED_URL}}': `${SITE_BASE}feed.xml`,
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
    '{{NAV}}': buildNav(pages, null, absoluteHref),
    '{{FOOTER_NAV}}': buildFooterNav(pages, null, absoluteHref),
  };
  let html = template;
  for (const [token, value] of Object.entries(replacements)) {
    html = html.split(token).join(value);
  }
  return html;
}

function buildSitemap(pages, posts) {
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
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
}

function buildRobots() {
  return `User-agent: *\nAllow: /\n\nSitemap: ${SITE_BASE}sitemap.xml\n`;
}

// RFC 3339 a partire da una data YYYY-MM-DD: sempre mezzanotte UTC, mai
// legata all'orario di build (il feed deve restare deterministico).
function rfc3339(iso) {
  return `${iso}T00:00:00Z`;
}

function buildFeed(posts, pages) {
  const updated = latestBlogUpdated(posts, pages);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<feed xmlns="http://www.w3.org/2005/Atom">',
    '  <title>MeshCore ITA — Aggiornamenti</title>',
    `  <id>${SITE_BASE}${BLOG_SLUG}/</id>`,
    `  <link rel="self" href="${SITE_BASE}feed.xml"/>`,
    `  <link rel="alternate" href="${SITE_BASE}${BLOG_SLUG}/"/>`,
    `  <updated>${rfc3339(updated)}</updated>`,
    '  <author><name>MeshCore ITA</name></author>',
  ];
  for (const post of posts.slice(0, FEED_MAX_ENTRIES)) {
    const canonical = `${SITE_BASE}${BLOG_SLUG}/${post.meta.slug}/`;
    lines.push(
      '  <entry>',
      `    <id>${canonical}</id>`,
      `    <title>${escape(post.meta.title)}</title>`,
      `    <link rel="alternate" href="${canonical}"/>`,
      `    <published>${rfc3339(post.meta.published)}</published>`,
      `    <updated>${rfc3339(post.meta.updated)}</updated>`,
      `    <summary type="text">${escape(post.meta.lede)}</summary>`,
      `    <content type="html">${escape(post.fragment)}</content>`,
      '  </entry>'
    );
  }
  lines.push('</feed>');
  return `${lines.join('\n')}\n`;
}

// --- orchestration --------------------------------------------------

function computeOutputs() {
  const pages = readContentFiles();
  const posts = readPostFiles();
  const layout = readFileSync(LAYOUT_PATH, 'utf8');
  const notFoundTemplate = readFileSync(NOT_FOUND_TEMPLATE_PATH, 'utf8');
  const outputs = new Map();
  for (const { file, meta, fragment } of pages) {
    outputs.set(join(meta.slug, 'index.html'), renderPage(layout, meta, fragment, pages, file));
  }
  for (const { file, meta, fragment } of posts) {
    outputs.set(join(BLOG_SLUG, meta.slug, 'index.html'), renderPost(layout, meta, fragment, pages, file));
  }
  const slices = paginatePosts(posts);
  slices.forEach((slice, i) => {
    const n = i + 1;
    const rel = n === 1 ? join(BLOG_SLUG, 'index.html') : join(BLOG_SLUG, 'pagina', String(n), 'index.html');
    outputs.set(rel, renderBlogIndex(layout, slice, posts, pages, n, slices.length));
  });
  outputs.set('feed.xml', buildFeed(posts, pages));
  outputs.set('sitemap.xml', buildSitemap(pages, posts));
  outputs.set('robots.txt', buildRobots());
  outputs.set('404.html', renderNotFound(notFoundTemplate, pages));
  outputs.set(join('worker', 'kb.generated.mjs'), buildKbModule(pages, posts));
  outputs.set('search-index.json', buildSearchIndex(pages, posts));
  return { pages, posts, outputs };
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
  const summary = `${pages.length} pagine + ${posts.length} post + ${indexLabel} + feed.xml + sitemap.xml + robots.txt + 404.html + search-index.json + worker/kb.generated.mjs`;

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

  writeOutputs(outputs);
  console.log(`Generati ${outputs.size} file (${summary}).`);
}

// Eseguito solo da riga di comando: importare questo modulo (per SITE_BASE
// o per le funzioni) non deve rigenerare il sito come effetto collaterale.
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
