<!--meta
{
  "slug": "biquad-paolo",
  "title": "La biquad di Paolo: quasi 10 dBi con un metro di rame e una piastra",
  "description": "Paolo aggiunge alla galleria una biquad con riflettore per 869 MHz e racconta su lora868 come l'ha costruita e tarata con il NanoVNA. In simulazione 9,8 dBi e 18 dB avanti/dietro; sul banco, lati accorciati e schermo a 40 mm. Numeri, differenze tra modello e prototipo, e la potenza da abbassare.",
  "h1": "Due quadrati di rame davanti a uno specchio",
  "lede": "Paolo ha caricato nella galleria la biquad che aveva usato come esempio nel suo tutorial su EZNEC, e sul suo blog spiega passo per passo come costruirla e tararla con il NanoVNA.",
  "published": "2026-10-19",
  "time": "18:00",
  "tags": ["antenne", "autocostruzione", "community"]
}
-->
## Cos'è una biquad

Una **biquad** sono due anelli quadrati di filo, ognuno lungo circa una
lunghezza d'onda di perimetro, uniti al centro come un "8" coricato. Il cavo
si collega nel punto in cui i due quadrati si toccano. Da sola irradia sia
avanti sia indietro. Con una piastra metallica dietro, a pochi centimetri,
l'energia che andrebbe all'indietro viene riflessa in avanti e l'antenna
diventa **direttiva**.

È un progetto classico del Wi-Fi fai-da-te a 2,4 GHz. A 869 MHz le misure
crescono, ma restano da scrivania: un lato di circa 8,5 cm e una piastra di
30 × 20 cm.

## Il modello nella galleria

La [scheda di Paolo](https://meshcore-ita.github.io/antenne/paolo-biquad/)
contiene il file NEC esportato da 4nec2. Le parti sono queste:

| Parte | Misura nel modello |
|---|---|
| Lato dei quadrati | 84 mm, filo di rame da 2 mm |
| Punto di alimentazione | tratto verticale di 9 mm al centro |
| Riflettore | griglia di 350 × 262 mm, maglia da 29 mm |
| Distanza radiatore–riflettore | 35 mm |

I quadrati sono ruotati di 45°, a rombo, e il punto di alimentazione è
verticale. Per questo la polarizzazione risulta **verticale**, la stessa di
quasi tutti i nodi MeshCore. Paolo insiste sullo stesso punto nell'articolo:
i capi del coassiale vanno orientati in verticale, perché "fa tutta la
differenza di questo mondo". Ruotata di 90°, l'antenna parlerebbe in
polarizzazione orizzontale, e verso un nodo verticale si perderebbero molti
dB.

Il riflettore è una griglia di fili perché NEC-2 descrive solo fili, non
superfici. Una maglia di 29 mm, circa un dodicesimo della lunghezza d'onda,
a questa frequenza si comporta come una lastra piena.

## Cosa dice il simulatore

A 869,618 MHz, in spazio libero:

- **Guadagno 9,8 dBi** (7,6 dBd), circa 5,8 volte la potenza di un dipolo
  nella direzione migliore.
- **Avanti/dietro 18 dB**: dietro la piastra arriva circa 1/60 della
  potenza che va in avanti.
- **Impedenza 49,3 − j5,3 Ω, ROS 1,11**, con il cavo saldato direttamente
  sull'antenna e nessun adattatore.
- **Minimo del ROS a 875 MHz**: il modello è leggermente corto. Il ROS
  resta comunque ottimo nella sub-banda.

## Dal modello al banco

La parte più interessante sta nell'articolo
[*Biquad alla griglia*](https://lora868.at1839.name/biquad-alla-griglia/).
Paolo racconta un prototipo vero, misurato con il NanoVNA, con tutti gli
aggiustamenti del caso.

Il materiale è poco:

- un metro di rame nudo da 2 mm;
- una piastra di alluminio da almeno 30 × 20 cm;
- una barra filettata da lampadario, con i suoi dadi. Dentro la barra passa
  il coassiale, e la barra regge il radiatore davanti alla piastra;
- uno spezzone di buon cavo (Paolo ha usato LMR240 in una barra M10; con una
  M14 entrerebbe anche RG213);
- una staffa, possibilmente per un palo in plastica.

Paolo ha piegato i quadrati con 85 mm di lato, apposta un po' lunghi. La
prima misura gli ha dato torto: a 869 MHz c'erano troppa resistenza e
reattanza induttiva, cioè un'antenna troppo lunga. Ha dovuto accorciare
quasi un centimetro per elemento, tagliando 5 mm alle estremità e
risaldando. Poi, girando i dadi sulla barra, ha regolato la distanza dalla
piastra fino a un ROS "praticamente perfetto". La distanza finale è di
**40 mm**, non i 35 del modello.

| | Modello | Prototipo |
|---|---|---|
| Lato | 84 mm | 85 mm, poi accorciato |
| Distanza dalla piastra | 35 mm | 40 mm |
| Riflettore | griglia 350 × 262 mm | piastra piena di alluminio |

Le differenze non devono stupire. Il modello è in spazio libero, senza
barra filettata, senza coassiale, senza nastro e senza staffa, e con un
riflettore di forma diversa. La distanza dalla piastra cambia molto
l'impedenza della biquad, ed è per questo che la barra filettata funziona
così bene come regolazione. Tra il modello che chiede di allungare e il
prototipo che ha chiesto di accorciare, ha ragione il NanoVNA.

È la lezione di tutta la galleria: il simulatore dice com'è fatta l'antenna
e da dove partire, la taratura si fa sull'antenna montata.

## Attenzione alla potenza

Con 7,6 dBd di guadagno questa antenna va sul nodo **a potenza ridotta**.
Il preset italiano consente 27 dBm ERP (500 mW, vedi la
[normativa](../../normativa/)):

| Perdita nel cavo | TX massima |
|---|---|
| 0 dB | 19,4 dBm (87 mW) |
| 1 dB | 20,4 dBm (109 mW) |
| 2 dB | 21,4 dBm (137 mW) |

Un SX1262 al massimo arriva a 22 dBm, cioè oltre il limite con qualunque
cavo corto. Con questa antenna la potenza sul nodo va abbassata. Il
guadagno non si perde: la portata la dà l'antenna, anche in ricezione, che
nessun limite di ERP tocca.

## Dove usarla

Una direttiva con 18 dB avanti/dietro non serve a coprire un quartiere. È
fatta per un **collegamento punto-punto**: un ripetitore che deve
raggiungere un altro ripetitore lontano, oppure un nodo in valle che deve
puntare verso l'unica cima da cui si vede la rete. Rispetto a una Yagi della
stessa resa è molto più corta, e la piastra posteriore protegge anche dai
disturbi che arrivano da dietro.

## E ora?

Paolo stesso considera questo un prototipo. Accorciando i lati, i quadrati
sono venuti un po' storti, e per una versione definitiva propone due idee:
un modo più pulito per tagliare gli elementi, oppure anelli **circolari**,
più belli da vedere, con dimensioni ancora da verificare. Suggerisce anche
di fissare il radiatore con una colata di resina e due supporti laterali
isolanti, al posto del nastro autoagglomerante della prova.

La scheda con la vista 3D, i grafici di ROS e impedenza e il file NEC
spiegato riga per riga è qui:
[Biquad con riflettore](https://meshcore-ita.github.io/antenne/paolo-biquad/).
La teoria e l'uso di EZNEC sono nel tutorial di Paolo,
[*EZNEC, chi era costui (2)*](https://lora868.at1839.name/eznec-chi-era-costui-2/);
per gli strumenti open source equivalenti c'è il nostro articolo sulle
[antenne NEC senza Windows](../antenne-nec-senza-windows/).

Hai una tua antenna? Le istruzioni sono nell'articolo sulla
[galleria](../galleria-antenne/), oppure mandala nel gruppo Telegram
[MeshCore ITA](https://t.me/meshcore_ita).

Grazie a Paolo.
