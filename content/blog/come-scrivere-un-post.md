<!--meta
{
  "slug": "come-scrivere-un-post",
  "title": "Come scrivere un post per il blog di MeshCore ITA",
  "description": "Guida pratica per la community: dove creare il file, quali chiavi meta sono obbligatorie e come pubblicare un nuovo post nel blog del sito.",
  "h1": "Come scrivere un post per il blog",
  "lede": "Dove sta il file, quali chiavi meta servono e come pubblicare un nuovo post nel blog.",
  "published": "2026-09-13",
  "updated": "2026-09-27",
  "tags": ["contribuire"]
}
-->
## Dove sta il file

Ogni post del blog è un file markdown dentro
`content/blog/`. Il nome del file diventa l'URL del post: un file
`content/blog/mio-post.md` finisce pubblicato su `/blog/mio-post/`.

Per scriverne uno nuovo:

1. Crea un file `content/blog/<slug>.md`, dove `<slug>` è il nome che
   vuoi dare al post (minuscolo, parole separate da trattino).
2. Il file inizia con un blocco di meta dati, poi il corpo in markdown.
3. Rigenera il sito e committa l'output.

## Il blocco meta

Come per le pagine di documentazione, il file inizia con un commento
`<!--meta { ... } -->` contenente un oggetto JSON. Per un post servono
queste chiavi:

- `slug`: **deve essere identico al nome del file**, senza estensione. Se
  il file è `come-scrivere-un-post.md`, `slug` deve valere
  `"come-scrivere-un-post"`.
- `title`: titolo per il tag `<title>` e per i motori di ricerca.
- `description`: riassunto breve, usato come meta description.
- `h1`: titolo mostrato in cima al post.
- `lede`: sottotitolo/riassunto mostrato sotto l'`h1` e nella lista dei
  post.
- `published`: data di pubblicazione, formato `AAAA-MM-GG`.

Sono opzionali:

- `updated`: data di ultimo aggiornamento, se diversa da `published`.
- `time`: ora di pubblicazione in formato `"HH:MM"`, ora italiana
  (es. `"18:30"`). Serve quando esce più di un post nello stesso giorno:
  in quel caso va messa in tutti, e decide quale compare per primo.
- `author`: di default è `"MeshCore ITA"`.
- `tags`: un array di slug scelti tra quelli definiti in
  `content/blog/tags.json` (vedi sezione "I tag" più sotto).

## I tag

Ogni voce di `tags` deve essere uno slug già presente in
`content/blog/tags.json`: un tag non registrato fa fallire la build. Gli
slug attuali sono: `antenne`, `autocostruzione`, `software`, `community`,
`risorse`, `sito`, `contribuire`.

Per ogni tag usato da almeno un post la build genera una pagina
`/blog/tag/<slug>/` (con paginazione e feed Atom propri), usando `label`
e `description` del registro come titolo e testo introduttivo.

Per aggiungere un tag nuovo: aggiungi una voce a `tags.json` con `label`
e `description`, poi usane lo slug nell'array `tags` del post.

## Il corpo

Dopo il blocco meta, il resto del file è markdown normale (GFM: titoli,
liste, tabelle, link, blocchi di codice, grassetto/corsivo). Niente HTML
grezzo: il markdown viene convertito automaticamente in HTML dalla build,
seguendo lo stile del sito.

Usa `##` per i titoli di sezione (l'`h1` lo genera già il layout dal campo
`h1` del meta). Mantieni lo stesso registro delle altre pagine del sito:
italiano tecnico, diretto, frasi brevi, niente marketing.

## Pubblicare il post

Dopo aver scritto il file:

```sh
node build.mjs          # rigenera il sito, incluso /blog/ e il feed
node build.mjs --check  # deve uscire 0: è lo stesso gate della CI
```

Committa sia il file sorgente in `content/blog/` sia tutti i file generati
che cambiano (`blog/`, `feed.xml`, `search-index.json` e l'eventuale
sitemap). La CI esegue `node build.mjs --check` su ogni pull request e la
rifiuta se i file generati non corrispondono ai sorgenti.

Se preferisci non usare la riga di comando, il link **"Modifica questa
pagina su GitHub"** in fondo a ogni pagina apre comunque l'editor web e
produce una pull request: in quel caso è chi revisiona la PR a rigenerare
e verificare i file di output.
