# Contribuire a MeshCore ITA

Ogni contributo passa da una pull request: niente wiki, niente modifiche
dirette. Così ogni cambiamento resta tracciato e verificabile.

## Correggere o migliorare una pagina

In fondo a ogni pagina del sito c'è il link **"Modifica questa pagina su
GitHub"**: apre l'editor GitHub sul file sorgente corretto e, al salvataggio,
crea una pull request. È il modo più rapido per correggere un refuso o
aggiungere un paragrafo.

I sorgenti delle pagine stanno in `content/<slug>.html`. **Non modificare i
file generati** (`<slug>/index.html`, `sitemap.xml`, `robots.txt`,
`404.html`): vengono riscritti dalla build e la CI rifiuta la PR se
divergono.

## Regola sui fatti

Questo sito è documentazione tecnica, non divulgazione approssimativa.

- Ogni comando, frequenza, parametro radio o modello di board deve essere
  verificabile su una fonte upstream: `https://meshcore.io/`,
  `https://docs.meshcore.io/`, `https://github.com/meshcore-dev/MeshCore`,
  `https://flasher.meshcore.io/`.
- Se un dato non è verificabile, si omette. Meglio una pagina più corta che
  una pagina sbagliata.
- Il preset radio italiano corrente è `869.618 MHz · BW 62.5 kHz · SF8 · CR8`
  (`EU/UK (Narrow)`). Se cambia, va aggiornato ovunque compaia, non solo
  nella pagina del preset.

## Aggiungere una pagina nuova (HTML)

1. Crea `content/<slug>.html`. Il file inizia con un blocco `<!--meta {...}-->`
   JSON con le chiavi: `slug`, `nav`, `order`, `primary`, `title`,
   `description`, `h1`, `lede`, `updated`. Opzionale: `jsonld`.
2. Il corpo contiene solo `<section class="section">`: niente `<h1>`,
   `<head>`, `<nav>`, `<main>` o `<footer>` (li mette il layout).
3. `primary: true` mette la pagina nell'header; `false` la lascia solo nel
   footer e nei link correlati.
4. Usa solo le classi CSS già esistenti in `assets/css/style.css`.
5. Lancia `node build.mjs` e committa anche i file generati.

## Aggiungere contenuti in markdown

Oltre alle pagine HTML esistenti, il sito supporta sorgenti in markdown per
contenuti nuovi:

- **Pagina di documentazione**: `content/<slug>.md`. Stesso blocco meta
  delle pagine `.html` (`slug`, `nav`, `order`, `primary`, `title`,
  `description`, `h1`, `lede`, `updated`).
- **Post della sezione Blog**: `content/blog/<slug>.md`. Chiavi
  meta obbligatorie: `slug`, `title`, `description`, `h1`, `lede`,
  `published`. Opzionali: `updated` (default: uguale a `published`),
  `time` (ora di pubblicazione `"HH:MM"`, ora italiana), `author`
  (default: `"MeshCore ITA"`), `tags` (array di slug).

  I post escono in ordine di `published`. Se due post hanno la stessa
  data, entrambi devono avere `time`, altrimenti la build si ferma: senza
  l'ora non si sa quale sia uscito prima.

  `tags` contiene slug definiti in `content/blog/tags.json`: un oggetto
  `slug → { label, description }` che dà titolo e testo introduttivo alla
  relativa pagina `/blog/tag/<slug>/`. Usare uno slug non presente nel
  registro (o una voce del registro senza `label`/`description`, o con
  slug non valido) fa fallire la build con un errore in italiano. Per
  aggiungere un tag nuovo: aggiungi una voce a `tags.json` con `label` e
  `description`, poi usane lo slug nell'array `tags` del post.

  Gli slug `tag`, `archivio` e `pagina` sono riservati e non si possono
  usare come `slug` di un post: la build li rifiuta con un errore chiaro.

In entrambi i casi `slug` deve essere identico al nome del file (senza
estensione) e in forma URL-safe (minuscole, cifre e trattini singoli: la build
rifiuta il resto). Il corpo dopo il blocco meta è markdown puro (GFM): l'HTML
grezzo non è ammesso e fa fallire la build, non viene silenziosamente incluso.

Chiave meta opzionale `ogType`: cambia `og:type` della pagina (default
`article`; usa `website` per pagine che non sono articoli).

L'indice del Blog si impagina da solo a 10 post per pagina: la
prima resta `/blog/`, le successive diventano `/blog/pagina/2/`,
`/blog/pagina/3/` e così via. Non c'è niente da configurare, e `/blog/`
non cambia mai URL.

Dai `tags` dei post la build genera automaticamente, senza intervento
manuale: la pagina `/blog/tag/<slug>/` per ogni tag usato da almeno un
post (impaginata come l'indice: `/blog/tag/<slug>/pagina/2/` e così via)
con il proprio feed Atom `/blog/tag/<slug>/feed.xml`; l'archivio
`/blog/archivio/` con tutti i post raggruppati per anno e mese; i
"post correlati" e i link post precedente/successivo in fondo a ogni
post, calcolati da tag in comune e date; il tempo di lettura stimato
("N min di lettura"), calcolato sul testo del post; e il blocco degli
ultimi articoli del blog in home, generato tra due marcatori HTML dentro
`index.html` — non va scritto a mano.

Per una guida passo passo su come scrivere un post, vedi
["Come scrivere un post"](https://meshcore-ita.github.io/blog/come-scrivere-un-post/)
nella sezione Blog del sito.

## Regola SEO: non spostare gli URL esistenti

Gli URL delle pagine pubblicate non cambiano mai: rinominare uno `slug` o
spostare una pagina rompe i link già condivisi e indicizzati dai motori di
ricerca. Se una pagina va ristrutturata, si modifica il contenuto lasciando
lo `slug` (e quindi l'URL) invariato.

## Verifica prima di aprire la PR

Da quando il sito supporta il markdown, il progetto ha una dipendenza
npm (`marked`): dopo aver clonato il repository, o se `package.json`
cambia, esegui prima `npm ci`.

```sh
npm ci                  # installa le dipendenze (marked)
node build.mjs          # rigenera pagine, sitemap, robots, 404, blog, feed
node build.mjs --check  # deve uscire 0: è lo stesso gate della CI
python3 -m http.server 8080   # controlla il risultato nel browser
```

## Stile

Italiano tecnico, diretto, senza marketing ed emoji. Frasi brevi. Il lettore
sa cos'è una radio: non serve spiegargli cos'è un file.
