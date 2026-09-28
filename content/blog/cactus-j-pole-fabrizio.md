<!--meta
{
  "slug": "cactus-j-pole-fabrizio",
  "title": "La Cactus J-Pole di Fabrizio: una J-pole che ignora il palo",
  "description": "Fabrizio aggiunge alla galleria una J-pole per 868 MHz con stub di disaccoppiamento del palo. In simulazione il ROS resta 1,04 con un palo da 10 cm come da 3 m. Numeri, confronto con la J-pole classica e una nota sul brevetto.",
  "h1": "Una J-pole che non sente il palo",
  "lede": "Dopo la Yagi LFA, Fabrizio ha caricato nella galleria una J-pole verticale pensata per il palo metallico. Il primo prototipo è già in funzione sul suo nodo di casa.",
  "published": "2026-09-28",
  "tags": ["antenne", "autocostruzione", "community"]
}
-->
## Il problema della J-pole sul palo

La **J-pole** è una delle verticali più semplici da autocostruire. Un
radiatore di circa mezza lunghezza d'onda viene alimentato attraverso una
sezione di adattamento di un quarto d'onda, la gamba corta della "J". Non
servono radiali e il cavo si collega a pochi millimetri dal fondo, nel punto
in cui l'impedenza vale 50 Ω.

Il difetto si vede al momento di montarla. Se la base tocca un palo
metallico, il palo e la calza del cavo coassiale entrano a far parte
dell'antenna. Impedenza e diagramma cambiano con la lunghezza del palo e con
il percorso del cavo. Per questo di solito la J-pole va montata su un
supporto isolante, con un choke sul cavo.

## Uno stub che isola il palo

La **Cactus J-Pole**, ideata da John S. Huggins, aggiunge sotto la J un
secondo stub, lungo circa un quarto d'onda e ripiegato verso l'alto
accanto al palo. Alla frequenza di progetto questo stub crea un punto ad
**alta impedenza RF** tra l'antenna e il palo. La corrente che scende verso
il supporto si ferma lì, e il palo può essere lungo quanto serve.

Nel modello che Fabrizio ha caricato nella
[galleria](https://meshcore-ita.github.io/antenne/fabrizio-cactus-j-pole/)
le misure sono queste:

| Parte | Misura |
|---|---|
| Elemento lungo (adattamento + radiatore) | 238 mm |
| Gamba corta della J | 82 mm, a 8 mm dall'elemento lungo |
| Punto di alimentazione | 8 mm sopra il fondo della J |
| Stub di disaccoppiamento | 82 mm in giù e 82 mm di ritorno, a 8 mm |

Tutto in filo da 4 mm, per circa 32 cm di altezza. Il file ragiona su una
lunghezza d'onda di 328 mm, circa il 5% in meno dei 345 mm che si hanno in
aria a 869,6 MHz. È il solito accorciamento che si applica ai dipoli per
tenere conto dello spessore del filo.

## Cosa dice il simulatore

A 869,618 MHz, la frequenza del [preset italiano](../../preset-radio/), in
spazio libero e con 10 cm di palo:

- **Guadagno 3,3 dBi**, cioè 1,1 dB più di un dipolo. Il massimo cade
  circa 20° sopra l'orizzonte; sull'orizzonte si resta fra 2,7 e
  3,1 dBi.
- **Impedenza 51,6 − j1,3 Ω, ROS 1,04**, senza nessun adattatore oltre alla J.
- **ROS sotto 2 da 848,5 a 891,5 MHz**: 43 MHz di banda, ben oltre il
  margine che serve per la sub-banda 869,4–869,65 MHz.
- **Omnidirezionale.** Tra il lato migliore e quello opposto ci sono
  2,9 dB, perché la gamba corta della J rende il diagramma un po'
  asimmetrico.

Messa accanto alle altre verticali omnidirezionali della galleria:

| Antenna | Guadagno | ROS |
|---|---|---|
| **Cactus J-Pole, di Fabrizio** | **3,3 dBi** | **1,04** |
| Ground plane di riferimento | 2,2 dBi | 1,01 |
| Dipolo di riferimento | 2,1 dBi | 1,44 |

## La prova del palo

La scheda di Fabrizio dice che variando la lunghezza del palo l'antenna si
comporta allo stesso modo. Lo abbiamo verificato con lo stesso motore NEC-2
della galleria. Abbiamo fatto variare il palo da 10 cm a 3 m e ripetuto la
prova su una **J-pole classica**, cioè la stessa J senza lo stub e con il
palo attaccato direttamente alla base. In tabella, «orizzonte» è il
guadagno sull'orizzonte in dBi.

| Palo (m) | ROS Cactus | Orizzonte Cactus | ROS classica | Orizzonte classica |
|---|---|---|---|---|
| 0,10 | 1,04 | 2,7 | 1,25 | 1,1 |
| 0,25 | 1,04 | 3,1 | 1,41 | 1,5 |
| 0,50 | 1,04 | 2,9 | 1,04 | 1,5 |
| 1,00 | 1,04 | 3,1 | 1,03 | 3,1 |
| 1,50 | 1,04 | 2,9 | 1,06 | 1,4 |
| 2,00 | 1,04 | 3,1 | 1,13 | 3,0 |
| 3,00 | 1,04 | 3,1 | 1,26 | 1,5 |

Con la Cactus l'impedenza non si muove: resta tra 51,5 e 51,6 Ω su tutte le
lunghezze. La J-pole classica oscilla tra 36 e 50 Ω. Il ROS però non è il
problema più grosso, perché resta comunque sotto 1,5.

Il danno si vede nel diagramma. Con molte lunghezze di palo la J-pole
classica perde 1,5 dB o più **proprio sull'orizzonte**, cioè nella
direzione degli altri nodi. Con 2 e 3 m di palo il lobo principale finisce
addirittura verso il basso, perché a irradiare è il palo stesso. La Cactus
resta intorno ai 3 dBi sull'orizzonte con qualunque palo.

Se volete ripetere la prova, c'è un dettaglio da sapere. Nel file il palo
(`GW 10`) ha sempre 5 segmenti, che bastano per 10 cm ma non per 3 m: ogni
segmento diventerebbe lungo 60 cm, troppo per NEC. Quando si allunga
`pole` bisogna aumentare anche i segmenti. Noi ne abbiamo usato uno ogni
1,6 cm circa.

## Potenza

Con 1,1 dBd di guadagno, per restare nei 500 mW ERP della sub-banda (vedi
la [normativa](../../normativa/)) sul nodo si possono impostare fino a
circa 25,9 dBm anche senza perdite nel cavo. Un SX1262 si ferma a 22 dBm:
con questa antenna le schede più diffuse restano nel limite anche alla
potenza massima.

## Il brevetto

La configurazione *mast mountable antenna* di Huggins è coperta dal
brevetto statunitense
[US10468743B2](https://patents.google.com/patent/US10468743B2/en),
concesso nel 2019. Fabrizio lo ha segnalato nella scheda. Pubblicare il
modello, le foto e le misure di un prototipo non dà una licenza sul
brevetto.

I brevetti valgono per territorio, e la scheda consultata riporta gli Stati
Uniti. Prima di produrre o vendere antenne basate su questo progetto
bisogna verificare quali diritti sono in vigore nei paesi interessati. Per
gli usi privati non commerciali e per le sperimentazioni la legge può
prevedere eccezioni.

## Solo una simulazione, per ora

Questi numeri vengono da un modello in spazio libero, senza il cavo
coassiale. Indicano la tendenza, ma la verifica vera si fa sull'antenna
montata. La scheda suggerisce di misurare il ROS con il palo e il cavo
nella posizione definitiva e, se possibile, di confrontare la corrente sul
palo con e senza lo stub.

## E ora?

Il prototipo di Fabrizio, in filo di rame con il cavo che esce da un tubo
bianco, è già in funzione sul suo nodo. Se ha voglia, aspettiamo una misura
con il NanoVNA. Nel frattempo la scheda con la foto, la vista 3D, i grafici
e il file spiegato riga per riga è qui:
[Cactus J-Pole](https://meshcore-ita.github.io/antenne/fabrizio-cactus-j-pole/).

Per approfondire il progetto originale c'è l'articolo di John S. Huggins,
[*Mast Mountable J-Pole Antenna*](https://www.hamradio.me/antennas/mast-mountable-j-pole-antenna.html).

Hai una tua antenna? Le istruzioni sono nell'articolo sulla
[galleria](../galleria-antenne/), oppure mandala nel gruppo Telegram
[MeshCore ITA](https://t.me/meshcore_ita).

Grazie ancora a Fabrizio.
