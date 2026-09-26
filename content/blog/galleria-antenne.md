<!--meta
{
  "slug": "galleria-antenne",
  "title": "Nasce la galleria delle antenne della community",
  "description": "Modelli NEC-2 di antenne per MeshCore simulati a 869.618 MHz, con vista 3D, spiegazioni dei risultati, potenza massima in ERP e una guida per chi inizia.",
  "h1": "La galleria delle antenne della community",
  "lede": "Dopo l'articolo su xnec2c, Fabrizio ci ha mandato la Yagi che usa sul suo nodo. Da lì è nata una galleria aperta: si condivide il file .nec, e il sito simula l'antenna e spiega cosa significano i numeri.",
  "published": "2026-09-26",
  "tags": ["antenne", "software", "autocostruzione", "community"]
}
-->
## Com'è nata

Nell'articolo [Simulare antenne senza Windows](../antenne-nec-senza-windows/)
abbiamo mostrato come simulare un dipolo a 869 MHz con strumenti open source.
Poche ore dopo Fabrizio ha risposto nel gruppo con la foto di una **Yagi a 2
elementi** in tubo di rame, montata sul tetto accanto al suo nodo solare
*pybot*, e con i file `.nec` dei suoi modelli.

Simulandoli ci siamo accorti che valeva la pena raccoglierli in un posto solo,
insieme ad altre antenne, e spiegare bene cosa dice ogni numero. Così è nata
la [galleria delle antenne](https://meshcore-ita.github.io/antenne/).

## Cosa trovi in ogni scheda

- **I numeri principali**, calcolati a 869,618 MHz, la frequenza del
  [preset italiano](../../preset-radio/): guadagno, rapporto avanti/dietro,
  ROS, impedenza e frequenza di risonanza.
- **Cosa dicono questi numeri**, in parole semplici: quante volte l'antenna
  concentra la potenza rispetto a un dipolo, quanta potenza torna indietro
  per il ROS, se l'antenna è lunga o corta e va quindi accorciata o allungata.
- **La potenza massima da impostare sul nodo** per restare entro i 500 mW
  ERP della sub-banda 869,4–869,65 MHz, con 0, 1 o 2 dB di perdita nel cavo.
  I limiti sono spiegati nella pagina sulla [normativa](../../normativa/).
- **Una vista 3D** del diagramma di irradiazione con l'antenna dentro, da
  ruotare col mouse o col dito, e i grafici di ROS e impedenza da 855 a
  885 MHz.
- **Il file `.nec` spiegato riga per riga**, da scaricare e aprire con
  xnec2c, 4nec2 o EZNEC.
- **Costruzione, esperimenti ed errori comuni**: misure, lista di taglio,
  materiali e cosa succede se si cambia qualcosa.

C'è anche una [guida](https://meshcore-ita.github.io/antenne/guida/) per chi
parte da zero: lunghezza d'onda, dBi e dBd, polarizzazione, ROS, adattamento
a 50 Ω, ERP e come si scrive un file NEC.

## Le antenne di oggi

| Antenna | Guadagno | ROS a 869,618 MHz |
|---|---|---|
| Yagi 2 elementi con riflettore, di Fabrizio (in uso su pybot) | 6,4 dBi | 1,09 |
| Yagi 2 elementi con direttore, di Fabrizio | 5,3 dBi | 1,02 |
| Yagi 10 elementi, progetto da 432 MHz riscalato, di Fabrizio | 12,4 dBi | 1,91 |
| Dipolo a mezz'onda | 2,1 dBi | 1,44 |
| Ground plane λ/4 con 4 radiali a 45° | 2,2 dBi | 1,01 |
| Yagi 3 elementi | 8,1 dBi | 1,23 |

Le ultime tre sono progetti di riferimento accordati da noi. Il dipolo
risuona a **160,6 mm**, gli stessi 161 mm a cui arriva il
[tutorial di Paolo su Lora Italia](https://www.loraitalia.it/eznec-chi-era-costui/).

Qualche numero è diverso da quello che si legge spesso in giro. Un esempio:
con quattro radiali orizzontali una ground plane non sta a 36 Ω ma intorno a
25 Ω. Piegando i radiali a 45° si arriva a 50 Ω. La scheda spiega il perché.

Sono simulazioni in spazio libero: indicano la tendenza, ma non
sostituiscono una misura con un NanoVNA sull'antenna montata.

## Aggiungi la tua antenna

La galleria vive su GitHub nel repository
[meshcore-ita/antenne](https://github.com/meshcore-ita/antenne). Per
aggiungere un'antenna bastano una cartella con il file `.nec`, un piccolo
`meta.json` con titolo e autore e, se vuoi, qualche foto e le note di
costruzione. Le istruzioni sono in
[CONTRIBUTING.md](https://github.com/meshcore-ita/antenne/blob/main/CONTRIBUTING.md).
A ogni modifica il sito rifà da solo le simulazioni e rigenera le pagine.

Se non usi GitHub, manda il file `.nec` e una foto nel gruppo Telegram
[MeshCore ITA](https://t.me/meshcore_ita): lo aggiungiamo noi, citandoti.

Grazie a Fabrizio per aver aperto la strada.
