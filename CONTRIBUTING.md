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
   `description`, `h1`, `lede`, `updated`, `jsonld`.
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
- **Post della sezione Aggiornamenti**: `content/blog/<slug>.md`. Chiavi
  meta obbligatorie: `slug`, `title`, `description`, `h1`, `lede`,
  `published`. Opzionali: `updated` (default: uguale a `published`),
  `author` (default: `"MeshCore ITA"`), `tags` (array di stringhe).

In entrambi i casi `slug` deve essere identico al nome del file (senza
estensione), e il corpo dopo il blocco meta è markdown puro (GFM), senza
HTML grezzo: viene convertito automaticamente dalla build.

L'indice degli Aggiornamenti si impagina da solo a 10 post per pagina: la
prima resta `/blog/`, le successive diventano `/blog/pagina/2/`,
`/blog/pagina/3/` e così via. Non c'è niente da configurare, e `/blog/`
non cambia mai URL.

Per una guida passo passo su come scrivere un post, vedi
["Come scrivere un post"](https://meshcore-ita.github.io/blog/come-scrivere-un-post/)
nella sezione Aggiornamenti del sito.

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
