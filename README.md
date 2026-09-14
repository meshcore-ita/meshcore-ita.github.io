# MeshCore ITA — sito

Sito statico della community italiana MeshCore ITA.

Pubblicato su: **https://meshcore-ita.github.io/**

MeshCore ITA è una community indipendente di utenti MeshCore, non affiliata al
progetto MeshCore upstream né ad altre community italiane.

## Struttura

```
content/<slug>.html      sorgenti pagine di documentazione (meta JSON + fragment HTML)
content/<slug>.md        sorgenti pagine di documentazione in markdown
content/blog/<slug>.md   sorgenti dei post della sezione Aggiornamenti (markdown)
templates/layout.html    layout condiviso di tutte le pagine generate
templates/404.html       layout della pagina 404
build.mjs                generatore statico (Node, dipendenza: marked)
index.html               home page, scritta a mano
<slug>/index.html        pagine generate — NON modificare a mano
blog/                    indice e post generati della sezione Aggiornamenti
feed.xml                 feed Atom dei post, generato
search-index.json        indice per la ricerca interna, generato
sitemap.xml robots.txt   generati
404.html                 generato
assets/                  css, js (ES module), logo, favicon, immagine social
bot/ worker/             bot Telegram della community (testi e regole condivisi)
.github/workflows/       gate di build sulle PR + deploy su GitHub Pages
```

## Build

```sh
npm ci                  # installa le dipendenze (marked)
node build.mjs          # rigenera pagine, blog, feed, ricerca, sitemap, robots.txt, 404
node build.mjs --check  # esce 1 se i file generati divergono dai sorgenti
```

La build rimuove anche le pagine generate rimaste senza sorgente (per esempio
dopo aver cancellato un `content/<slug>.html`); `--check` le segnala come
orfane invece di cancellarle.

`--check` gira su ogni pull request (`.github/workflows/check.yml`) e di nuovo
prima del deploy: una PR che modifica `content/` senza rigenerare non viene
pubblicata.

## Sviluppo locale

```sh
npm ci && node build.mjs && python3 -m http.server 8080
```

Poi apri `http://localhost:8080/`.

## Pubblicazione

Deploy automatico ad ogni push su `main` tramite
`.github/workflows/pages.yml` (source: GitHub Actions, nessun Jekyll, vedi
`.nojekyll`).

I link interni e gli asset sono relativi, quindi il sito funziona invariato a
qualunque mount point. Gli URL assoluti (canonical, `og:url`, JSON-LD,
`sitemap.xml`, `robots.txt`) sono risolti da `build.mjs` in quest'ordine:
variabile `SITE_BASE`, poi `GITHUB_REPOSITORY` in CI, infine il fallback
`https://meshcore-ita.github.io/`.

### IndexNow

Ad ogni push su `main`, dopo il deploy, `scripts/indexnow.mjs` notifica
IndexNow (Bing, Yandex, Seznam, Naver) delle **sole pagine cambiate**,
ricavandole dal diff fra i due sha del push. La chiave è il file
`<chiave>.txt` nella root del sito: è pubblica per specifica, e lo script
la legge dal nome del file, così le due cose non possono divergere.
Invio manuale di tutte le URL: `node scripts/indexnow.mjs --all`.

### Annunci su Telegram

Sempre dopo il deploy, `scripts/announce-post.mjs` pubblica nel topic
**Annunci** del gruppo Telegram (`t.me/meshcore_ita/15`) i post del blog
*aggiunti* da quel push: titolo, lede e URL. Le modifiche a un post già
pubblicato non vengono riannunciate. Richiede il secret
`TELEGRAM_BOT_TOKEN` sul repo (senza, lo step non fa nulla e non fallisce) e
che il bot possa scrivere in quel topic. Invio manuale:
`node scripts/announce-post.mjs --post <slug>`.

## Contribuire

Vedi [CONTRIBUTING.md](CONTRIBUTING.md). In fondo a ogni pagina del sito c'è
il link "Modifica questa pagina su GitHub", che apre l'editor sul sorgente
giusto e produce una pull request.

Le discussioni pubbliche avvengono qui su GitHub e sul gruppo Telegram
pubblico MeshCore ITA (https://t.me/meshcore_ita), aperto a chiunque senza
bisogno di invito.

## Licenza

Codice sotto licenza MIT. Contenuti (testi, immagini) sotto licenza
CC BY 4.0.
