/**
 * MeshCore ITA — ricerca client-side.
 * Modulo ES nativo, zero dipendenze. L'indice (search-index.json) viene
 * caricato al primo utilizzo e la ricerca gira interamente nel browser.
 */

const RESULT_LIMIT = 12;
const DEBOUNCE_MS = 120;
const SNIPPET_RADIUS = 60; // ~120 caratteri totali attorno al primo match

/**
 * Rimuove i diacritici e appiattisce il case — stessa logica dello
 * slugify() di build.mjs: NFD scompone i caratteri accentati in
 * base + combinante, poi si eliminano le combinanti (U+0300–U+036F).
 */
function normalize(text) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

// Variante che conserva la lunghezza: gli indici calcolati sul testo
// normalizzato vengono usati per ritagliare il testo originale, quindi una
// normalizzazione che accorcia (accenti già decomposti nel sorgente)
// sposterebbe l'evidenziazione sulle lettere sbagliate.
function normalizeAligned(text) {
  let out = '';
  for (const ch of text) {
    const folded = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    out += (folded[0] ?? ' ').padEnd(ch.length, ' ');
  }
  return out;
}

function tokenize(query) {
  return normalize(query).trim().split(/\s+/).filter(Boolean);
}

// Punteggio di un campo: ogni occorrenza di un token pesa `weight`,
// raddoppiato se cade su un inizio di parola (più rilevante di un match
// a metà parola).
function scoreField(tokens, field, weight) {
  let score = 0;
  for (const token of tokens) {
    let from = 0;
    let idx;
    while ((idx = field.indexOf(token, from)) !== -1) {
      const atWordStart = idx === 0 || /\s/.test(field[idx - 1]);
      score += weight * (atWordStart ? 2 : 1);
      from = idx + token.length;
    }
  }
  return score;
}

function searchChunks(chunks, tokens) {
  const scored = [];
  for (const chunk of chunks) {
    const title = normalize(chunk.title || '');
    const page = normalize(chunk.page || '');
    const text = normalize(chunk.text || '');
    if (!tokens.every((token) => (title + ' ' + page + ' ' + text).includes(token))) continue;
    const score = scoreField(tokens, title, 5) + scoreField(tokens, page, 2) + scoreField(tokens, text, 1);
    scored.push({ chunk, score });
  }
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, RESULT_LIMIT).map((entry) => entry.chunk);
}

// Ritaglia una finestra di testo attorno al primo token trovato ed
// evidenzia le occorrenze con <mark>, costruendo nodi DOM (mai innerHTML,
// il testo viene dall'indice generato dai contenuti).
function buildSnippet(rawText, tokens) {
  const norm = normalizeAligned(rawText);
  let firstIndex = -1;
  for (const token of tokens) {
    const idx = norm.indexOf(token);
    if (idx !== -1 && (firstIndex === -1 || idx < firstIndex)) firstIndex = idx;
  }
  if (firstIndex === -1) firstIndex = 0;

  const start = Math.max(0, firstIndex - SNIPPET_RADIUS);
  const end = Math.min(rawText.length, firstIndex + SNIPPET_RADIUS);
  const windowRaw = rawText.slice(start, end);
  const windowNorm = norm.slice(start, end);

  const ranges = [];
  for (const token of tokens) {
    let from = 0;
    let idx;
    while ((idx = windowNorm.indexOf(token, from)) !== -1) {
      ranges.push([idx, idx + token.length]);
      from = idx + token.length;
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (last && range[0] <= last[1]) last[1] = Math.max(last[1], range[1]);
    else merged.push(range);
  }

  const fragment = document.createDocumentFragment();
  if (start > 0) fragment.appendChild(document.createTextNode('…'));
  let cursor = 0;
  for (const [s, e] of merged) {
    if (s > cursor) fragment.appendChild(document.createTextNode(windowRaw.slice(cursor, s)));
    const mark = document.createElement('mark');
    mark.textContent = windowRaw.slice(s, e);
    fragment.appendChild(mark);
    cursor = e;
  }
  if (cursor < windowRaw.length) fragment.appendChild(document.createTextNode(windowRaw.slice(cursor)));
  if (end < rawText.length) fragment.appendChild(document.createTextNode('…'));
  return fragment;
}

function initSearch() {
  const dialog = document.getElementById('search');
  const openers = document.querySelectorAll('[data-search-open]');
  if (!dialog || !openers.length) return;

  const input = document.getElementById('search-input');
  const list = document.getElementById('search-results');
  const empty = document.getElementById('search-empty');
  if (!input || !list || !empty) return;

  list.setAttribute('role', 'listbox');
  list.id = list.id || 'search-results';
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-controls', list.id);
  input.setAttribute('aria-autocomplete', 'list');
  input.setAttribute('aria-expanded', 'false');

  // Conteggio dei risultati annunciato dagli screen reader: la lista da sola
  // cambia in silenzio.
  const status = document.createElement('p');
  status.className = 'sr-only';
  status.setAttribute('role', 'status');
  dialog.append(status);

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let chunks = null;
  let indexPromise = null; // guardia contro fetch concorrenti
  let current = []; // risultati mostrati, per la navigazione da tastiera
  let activeIndex = -1;
  let debounceTimer = null;
  let queryToken = 0; // invalida le ricerche in volo (dialog chiuso o query nuova)

  function loadIndex() {
    if (chunks) return Promise.resolve(chunks);
    if (indexPromise) return indexPromise;
    indexPromise = fetch(dialog.dataset.searchIndex)
      .then((res) => {
        if (!res.ok) throw new Error('risposta non ok');
        return res.json();
      })
      .then((data) => {
        chunks = Array.isArray(data) ? data : [];
        return chunks;
      })
      .catch((err) => {
        indexPromise = null; // permette un nuovo tentativo alla prossima ricerca
        throw err;
      });
    return indexPromise;
  }

  function clearResults() {
    list.textContent = '';
    current = [];
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');
    input.setAttribute('aria-expanded', 'false');
    status.textContent = '';
    empty.hidden = true;
  }

  function setActive(index) {
    const items = list.children;
    if (activeIndex >= 0 && items[activeIndex]) items[activeIndex].setAttribute('aria-selected', 'false');
    activeIndex = index;
    const el = items[activeIndex];
    if (!el) {
      input.removeAttribute('aria-activedescendant');
      return;
    }
    el.setAttribute('aria-selected', 'true');
    input.setAttribute('aria-activedescendant', el.id);
    el.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  }

  // L'indice porta URL assoluti (servono al bot Telegram): qui li riportiamo
  // sull'origine corrente, così la ricerca funziona anche in anteprima locale
  // e sotto un base path diverso.
  function localUrl(raw) {
    try {
      const u = new URL(raw);
      return u.pathname + u.search + u.hash;
    } catch {
      return raw;
    }
  }

  function renderResults(results, tokens) {
    list.textContent = '';
    current = results;
    activeIndex = -1;
    input.removeAttribute('aria-activedescendant');

    if (!results.length) {
      empty.textContent = 'Nessun risultato.';
      empty.hidden = false;
      input.setAttribute('aria-expanded', 'false');
      status.textContent = 'Nessun risultato.';
      return;
    }
    empty.hidden = true;
    input.setAttribute('aria-expanded', 'true');
    status.textContent = `${results.length} risultat${results.length === 1 ? 'o' : 'i'}.`;

    results.forEach((chunk, i) => {
      const li = document.createElement('li');
      li.className = 'search__item';
      li.id = 'search-result-' + i;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');

      const link = document.createElement('a');
      link.className = 'search__link';
      link.href = localUrl(chunk.url);

      const page = document.createElement('span');
      page.className = 'search__page';
      page.textContent = chunk.page || '';

      const title = document.createElement('span');
      title.className = 'search__title';
      title.textContent = chunk.title || '';

      const snippet = document.createElement('span');
      snippet.className = 'search__snippet';
      snippet.appendChild(buildSnippet(chunk.text || '', tokens));

      link.append(page, title, snippet);
      li.appendChild(link);
      list.appendChild(li);
    });
  }

  function runSearch(query) {
    const tokens = tokenize(query);
    if (!tokens.length) {
      clearResults();
      return;
    }
    // Una fetch lenta non deve ripopolare un dialog già chiuso né sovrascrivere
    // i risultati di una query più recente.
    queryToken += 1;
    const token = queryToken;
    loadIndex()
      .then((data) => {
        if (token !== queryToken || !dialog.open) return;
        renderResults(searchChunks(data, tokens), tokens);
      })
      .catch(() => {
        if (token !== queryToken || !dialog.open) return;
        list.textContent = '';
        current = [];
        input.setAttribute('aria-expanded', 'false');
        empty.textContent = "Impossibile caricare l'indice di ricerca. Riprova più tardi.";
        empty.hidden = false;
        status.textContent = empty.textContent;
      });
  }

  function openSearch() {
    if (dialog.open) return;
    dialog.showModal();
    input.focus();
    loadIndex().catch(() => {}); // pre-carica; l'errore emerge alla prima ricerca
  }

  openers.forEach((opener) => opener.addEventListener('click', openSearch));

  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close(); // click sul backdrop, fuori dal pannello
  });

  dialog.addEventListener('close', () => {
    queryToken += 1; // scarta le ricerche ancora in volo
    if (debounceTimer) window.clearTimeout(debounceTimer);
    input.value = '';
    clearResults();
  });

  input.addEventListener('input', () => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    if (!input.value.trim()) {
      clearResults();
      return;
    }
    debounceTimer = window.setTimeout(() => runSearch(input.value), DEBOUNCE_MS);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      if (!current.length) return;
      event.preventDefault();
      setActive(activeIndex + 1 >= current.length ? 0 : activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      if (!current.length) return;
      event.preventDefault();
      setActive(activeIndex - 1 < 0 ? current.length - 1 : activeIndex - 1);
    } else if (event.key === 'Enter' && activeIndex >= 0 && current[activeIndex]) {
      // Con un risultato selezionato l'invio naviga, invece di far chiudere
      // il dialog tramite il submit nativo del form.
      event.preventDefault();
      window.location.assign(localUrl(current[activeIndex].url));
    }
  });

  // Scorciatoie globali: "/" e Ctrl/Cmd+K aprono la ricerca, ma non quando
  // l'utente sta già scrivendo in un campo (per non rubargli il carattere).
  document.addEventListener('keydown', (event) => {
    const isSlash = event.key === '/';
    const isCmdK = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
    if (!isSlash && !isCmdK) return;
    const active = document.activeElement;
    const isTyping = active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.isContentEditable);
    if (isTyping) return;
    event.preventDefault();
    openSearch();
  });
}

// Le risposte FAQ sono <details> chiusi: arrivarci da un link con ancora
// (risultati di ricerca, bot Telegram, condivisione) deve aprire la voce
// giusta, altrimenti la pagina salta su un titolo senza contenuto visibile.
function openTargetDetails() {
  const id = decodeURIComponent(location.hash.slice(1));
  if (!id) return;
  const target = document.getElementById(id);
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
    target.scrollIntoView({ block: 'start' });
  }
}

window.addEventListener('hashchange', openTargetDetails);
openTargetDetails();

initSearch();
