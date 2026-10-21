<!--meta
{
  "slug": "collineare-paolo",
  "title": "La collineare di Paolo: uno sleeve dipole da Amazon diventa a due elementi",
  "description": "Paolo trasforma uno sleeve dipole LoRaWAN comprato online in una collineare a due elementi per 869 MHz: una bobina di sfasamento, un tratto di rame, un radome allungato con la canalina elettrica. In simulazione 4,9 dBi; sul banco ROS tra 1,23 e 1,31. E una lezione sul perché il pigtail cambia l'impedenza letta ma non il ROS.",
  "h1": "Una bobina, un filo e un radome più lungo",
  "lede": "Paolo ha caricato nella galleria la collineare a due elementi che ha ricavato da uno sleeve dipole commerciale, e sul suo blog racconta sia il modello EZNEC sia la costruzione e la taratura con il NanoVNA.",
  "published": "2026-10-21",
  "time": "18:00",
  "tags": ["antenne", "autocostruzione", "community"]
}
-->
## Cos'è una collineare

Una **collineare** è una pila di radiatori a mezz'onda, uno sopra l'altro
sullo stesso asse. Perché i loro campi si sommino, le correnti nei vari
elementi devono essere **in fase**. Due mezz'onde semplicemente in fila non
lo sono: tra l'una e l'altra serve qualcosa che sfasi il segnale di 180°.
Nella versione di Paolo questo compito lo svolge una **bobina** di filo di
rame.

Il risultato è un'antenna verticale e omnidirezionale, come il dipolo di
partenza, ma con un lobo più schiacciato verso l'orizzonte. Quello che si
perde verso il cielo, dove a un nodo MeshCore non serve, si guadagna verso i
nodi vicini.

## Il punto di partenza

Paolo non è partito da zero. La base è uno **sleeve dipole LoRaWAN** con
radome in fibra e connettore N, comprato online e già
[recensito sul suo blog](https://lora868.at1839.name/recensione-antenna-lorawan/).
Il piano è semplice: aprire il radome in cima, saldare sulla punta del dipolo
la bobina e un secondo radiatore verticale, poi richiudere il tutto in un
radome allungato.

## Il modello nella galleria

La [scheda di Paolo](https://meshcore-ita.github.io/antenne/paolo-collineare/)
contiene il modello NEC esportato da 4nec2. Le parti sono queste:

| Parte | Misura nel modello |
|---|---|
| Dipolo di base | 161 mm, filo da 2 mm, alimentato al centro |
| Bobina di sfasamento | 7,65 spire, diametro 11 mm, alta circa 77 mm |
| Secondo radiatore | 184 mm, fino a 421 mm di altezza totale |

Il dipolo del modello è di filo da 2 mm, mentre quello vero è un tubo da
10 mm. Paolo lo spiega nel tutorial: EZNEC rifiuta di collegare la bobina,
fatta di filo sottile, a un elemento cinque volte più grosso. Il dipolo è
stato quindi ricalcolato come se fosse anche lui di filo da 2 mm, con la
lunghezza corretta per restare risonante.

A 869,618 MHz, in spazio libero, il simulatore della galleria dà:

- **Guadagno 4,9 dBi** (2,7 dBd), circa 1,9 volte la potenza di un dipolo
  sull'orizzonte.
- **Avanti/dietro 0 dB**: è omnidirezionale, come deve essere.
- **Impedenza 82,9 − j0,2 Ω, ROS 1,66**.

## Il ROS "sbagliato" che non è sbagliato

Qui c'è la parte più istruttiva. Il modello originale di Paolo in EZNEC
include un pezzo che il motore della galleria non sa simulare: la **linea di
trasmissione** dentro lo sleeve dipole. Il cavo che va dal connettore N al
centro del dipolo è un coassiale lungo circa 19 cm, che a 869 MHz vale
grosso modo **tre quarti d'onda**.

Una linea a quarto d'onda (o a tre quarti) è un trasformatore di impedenza.
I circa 75 Ω di un dipolo a mezz'onda, visti attraverso 3/4 d'onda di cavo a
50 Ω, diventano circa 33 Ω. Paolo aveva misurato 30,5 Ω al connettore dello
sleeve dipole originale e all'inizio non tornava nulla: con questo modello
torna tutto.

La regola che ne esce è utile per chiunque usi un NanoVNA:

> Una linea della stessa impedenza del sistema (50 Ω) cambia l'impedenza
> letta, ma **non cambia il ROS**.

Nel tutorial c'è una tabella che lo mostra: facendo variare la lunghezza
elettrica della linea da 180° a 370°, l'impedenza gira da 75 Ω a 33 Ω e
indietro, con la reattanza che passa da capacitiva a induttiva, mentre il
ROS resta sempre 1,506. La conseguenza pratica è che, misurando attraverso
un pigtail di lunghezza ignota, il segno della reattanza può ingannare: si
può credere che il radiatore sia lungo quando è corto, e viceversa.

Per il ROS, la scheda della galleria non sbaglia: 1,66 è il valore del
modello con o senza linea. Il prototipo, però, ha fatto meglio.

## Dal modello al banco

La costruzione è descritta in
[*Trasformazione in collineare dello sleeve dipole Arceli*](https://lora868.at1839.name/trasformazione-in-collineare-dello-sleeve-dipole-arceli/).
Il materiale:

- lo sleeve dipole da sacrificare;
- uno spezzone di **canalina elettrica** da 20 mm di diametro esterno, più
  un breve tubo di plastica da 20 mm interni per raccordarla al radome
  originale, e un tappo;
- rame da 2 mm;
- un tubetto da 10 mm come forma per avvolgere la bobina;
- un raccordo tra bobina e radiatore superiore (Paolo ha usato 1 cm di
  tubetto di ottone; va bene anche l'interno di un mammut);
- saldatore e NanoVNA.

Il radome originale si apre in cima con un Dremel e si allunga con la
canalina fino a circa 55–60 cm.

La bobina si avvolge **lunga**, una dozzina di spire distese su circa 8 cm,
e si salda da sola in testa al dipolo. Poi la si accorcia poco alla volta,
**sempre con il radome infilato**, finché il NanoVNA a 869 MHz legge
un'impedenza puramente resistiva, senza reattanza. In questa fase il ROS non
conta: conta che la bobina sfasi davvero di 180°. Solo allora si salda il
radiatore superiore, anche lui lungo, e lo si accorcia allo stesso modo.

| | Modello | Prototipo |
|---|---|---|
| Spire | 7,65 | circa 9 |
| Altezza bobina | ~77 mm | 66 mm |
| Radiatore superiore | 184 mm | poco meno di 170 mm |

Il prototipo vuole più spire e un radiatore più corto, ed è normale: il
radome rallenta l'onda e allunga elettricamente tutto quello che contiene, e
nessun modello a fili lo può rappresentare.

Le misure finali:

| Collegamento | Impedenza | ROS |
|---|---|---|
| NanoVNA direttamente sul connettore N | 42 + j5 Ω | 1,23 |
| Attraverso il pigtail SMA in dotazione | 38 − j1 Ω | 1,31 |
| Attraverso un cavo N di qualità | 40,6 − j2,75 Ω | 1,24 |

Con il cavo buono la reattanza cambia segno ma il ROS resta quasi uguale,
esattamente come prevede la teoria. Lo scarto con il pigtail SMA va
attribuito al cavo o ai connettori, non all'antenna.

Il ROS reale, quindi, è intorno a **1,3**, contro l'1,66 della simulazione.
Nella prova sul campo, scrive Paolo, la collineare si è comportata
"nettamente al di sopra" del classico sleeve dipole economico.

## Attenzione alla potenza

Con 2,7 dBd di guadagno, il limite di 27 dBm ERP del preset italiano (vedi
la [normativa](../../normativa/)) lascia molto margine:

| Perdita nel cavo | TX massima |
|---|---|
| 0 dB | 24,3 dBm (267 mW) |
| 1 dB | 25,3 dBm (336 mW) |
| 2 dB | 26,3 dBm (423 mW) |

Un SX1262 si ferma a 22 dBm, quindi con questa antenna lo si può usare al
massimo senza superare il limite. Chi usa moduli con amplificatore più
potente deve invece fare il conto.

## Dove usarla

È un'antenna da **nodo fisso**: un ripetitore su un tetto, un room server,
un nodo di casa che deve coprire tutto attorno. Rispetto a una direttiva
come la [biquad di Paolo](../biquad-paolo/) non va puntata, e rispetto a uno
sleeve dipole semplice guadagna qualche dB sull'orizzonte. Il prezzo è la
lunghezza, circa 60 cm, e un lobo più stretto in verticale: un nodo in
cima a una collina che deve raggiungere la valle molto più in basso può
trovarsi meglio con un dipolo semplice.

## E ora?

Le collineari, avverte Paolo già nella descrizione della scheda, "sono
sempre complesse da costruire e da tarare". La parte delicata è la bobina,
e il metodo per tararla è spiegato a fondo nell'articolo
[*Verticali collineari, la storia infinita*](https://lora868.at1839.name/verticali-collineari-la-storia-infinita/).

La scheda con la vista 3D, i grafici di ROS e impedenza e il file NEC
spiegato riga per riga è qui:
[Collineare 2 elementi](https://meshcore-ita.github.io/antenne/paolo-collineare/).
La teoria, compresa la parte sulle linee di trasmissione, è nella terza
puntata del tutorial di Paolo,
[*EZNEC, chi era costui (3)*](https://lora868.at1839.name/eznec-chi-era-costui-3/);
per gli strumenti open source equivalenti c'è il nostro articolo sulle
[antenne NEC senza Windows](../antenne-nec-senza-windows/).

Hai una tua antenna? Le istruzioni sono nell'articolo sulla
[galleria](../galleria-antenne/), oppure mandala nel gruppo Telegram
[MeshCore ITA](https://t.me/meshcore_ita).

Grazie a Paolo.
