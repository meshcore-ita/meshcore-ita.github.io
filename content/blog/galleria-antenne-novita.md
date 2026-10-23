<!--meta
{
  "slug": "galleria-antenne-novita",
  "title": "Galleria antenne: correnti nel 3D, listato NEC collegato e foto a schermo intero",
  "description": "La galleria delle antenne per MeshCore si aggiorna: la vista 3D mostra la corrente su ogni filo, passando il mouse su un filo si trova la sua riga nel file NEC (e viceversa), il parser capisce più schede e controlla meglio gli errori, le foto si aprono a schermo intero.",
  "h1": "La galleria delle antenne è cambiata",
  "lede": "Da quando è nata la galleria sono arrivate la biquad e la collineare di Paolo, e con loro un po' di lavoro sotto il cofano. Ecco cosa è cambiato per chi guarda le schede e per chi vuole caricare un modello.",
  "published": "2026-10-23",
  "time": "12:00",
  "tags": ["antenne", "software", "community"]
}
-->
## Cosa vedi nella vista 3D

La vista 3D delle [schede](https://meshcore-ita.github.io/antenne/) non mostra
più solo il diagramma di irradiazione: ora c'è anche l'antenna, e si capisce
come lavora.

- **Le correnti.** Ogni segmento dei fili è colorato in base all'intensità
  della corrente: grigio-blu quasi zero, arancio e giallo il massimo. Si vede
  subito dove l'antenna "lavora": nel centro di un dipolo la corrente è alta,
  alle punte va a zero.
- **La fase.** Il pulsante *Fase* anima la corrente nel tempo: i tratti
  sfasati pulsano in momenti diversi. È il modo più rapido per capire perché
  una [collineare](../collineare-paolo/) ha bisogno di una bobina tra i due
  elementi.
- **Il punto di alimentazione e il lobo principale**, indicati nella scena,
  con una legenda per corrente e guadagno. Le linee di trasmissione `TL`, se
  presenti, sono tratteggiate.
- **Diagramma in dB o lineare.** In scala lineare i lobi secondari quasi
  spariscono e resta il fascio principale.
- **I tagli 2D.** Due anelli sulla superficie mostrano da dove vengono i
  grafici sotto: il taglio in azimut e quello in elevazione, nel piano del
  lobo principale.
- **Punti di vista pronti**: 3D, dall'alto, di fronte e di lato (rispetto al
  lobo principale), rotazione automatica attivabile, reset e schermo intero.

## Il 3D e il file NEC parlano tra loro

Il file `.nec` di ogni scheda è spiegato riga per riga. Adesso è collegato
alla vista:

- passando il mouse su un **filo** nel 3D si vedono numero di filo, riga e
  corrente; un clic porta alla riga `GW` che lo definisce;
- passando o cliccando su una riga `GW` o `EX` del listato, **il filo si
  illumina** nel 3D.

Il listato ha anche i colori per tipo di scheda (geometria, sorgente,
controlli, commenti), la sintassi evidenziata per le variabili `SY`, un
pulsante **Copia** accanto a *Scarica antenna.nec* e una legenda in cima.
Per chi sta imparando a leggere un modello NEC è la differenza tra guardare
una tabella di numeri e vedere cosa fa ciascuna riga.

## Un parser più robusto

Con i modelli di Paolo, esportati da 4nec2, il parser interno è stato messo
sotto stress e migliorato:

- **Più schede supportate**: ora anche `TL` (linee di trasmissione) e `NT`
  (reti a due porte), oltre a `CM CE SY GW GS GE EK GN EX LD FR`. Le schede
  di sola visualizzazione (`RP`, `PT`, `PL`, `XQ`, `NE`, `NH`) vengono
  ignorate, perché il diagramma lo calcola la galleria.
- **Espressioni complete nelle `SY`**: `+ - * / ^` e funzioni come `sqrt`,
  `sin`, `cos`, `atan`, `log`, `exp`, `pi`.
- **Controlli più severi**: il build si ferma se mancano campi obbligatori in
  `meta.json`, se una foto non c'è o se `EX`, `LD` o `TL` puntano a fili o
  segmenti inesistenti. Segnala con un avviso (senza fermarsi) i segmenti
  troppo lunghi, oltre λ/20, o troppo corti rispetto al raggio del filo.
- **Regola sul raggio corretta.** La guida diceva che un segmento deve essere
  lungo almeno 4 volte il raggio. Il manuale di NEC-2 chiede 8 volte con il
  kernel normale e 2 con `EK`, quello esteso, che tutti i modelli della
  galleria usano. Abbiamo corretto sia il controllo sia la
  [guida](https://meshcore-ita.github.io/antenne/guida/).

I tre modelli di Paolo (biquad, collineare, Yagi a 10 elementi) sono stati
riscritti nello stesso stile commentato degli altri, così il listato spiegato
è leggibile come quelli di Fabrizio.

## Le foto

Le miniature delle schede hanno ora un rapporto 4:3 uniforme e, con un clic,
si aprono in una **lightbox** a schermo intero: frecce per scorrere, `Esc` o
un clic fuori dall'immagine per chiudere. Le foto di costruzione e taratura
della [biquad](../biquad-paolo/) si guardano finalmente come meritano.

## Caricare un modello

Le regole per aggiungere un'antenna sono in
[CONTRIBUTING.md](https://github.com/meshcore-ita/antenne/blob/main/CONTRIBUTING.md)
del repository. Due consigli pratici dopo questi cambiamenti:

- se esporti da 4nec2 o EZNEC, i campi sono separati da TAB e non ci sono
  commenti: riscrivi il file nello stile della galleria prima della pull
  request;
- usa righe terminate con LF (non CRLF) e UTF-8, così gli accenti nei
  commenti si leggono bene.

Non serve installare nulla: il 3D usa [three.js](https://threejs.org/)
incluso nel repository, e la galleria non carica niente da servizi esterni.
Se la vista non parte perché il browser ha WebGL disattivato, i grafici e il
file NEC restano comunque visibili.
