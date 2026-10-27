<!--meta
{
  "slug": "yagi-10-paolo",
  "title": "La Yagi a 10 elementi di Paolo: 14 dBi e un dipolo ripiegato senza balun",
  "description": "Paolo carica nella galleria una Yagi a 10 elementi per 869 MHz calcolata con DL6WU: boom di 74 cm, dipolo ripiegato di filo da 1 mm saldato direttamente al coassiale. In simulazione 14,1 dBi, 20 dB avanti/dietro, ROS 1,15; sul banco, circa 12 dB di RSSI sopra una ground plane tarata. Il trucco: avvicinare il radiatore al riflettore per abbassare l'impedenza.",
  "h1": "Dieci elementi, un boom da 74 cm e nessuna rete di adattamento",
  "lede": "Nella galleria c'è una nuova Yagi: dieci elementi calcolati con DL6WU e un radiatore ripiegato che si salda al cavo così com'è. Paolo spiega sul suo blog perché ha scelto questa strada e come ha portato l'impedenza a 50 Ω spostando il radiatore di 35 mm.",
  "published": "2026-10-27",
  "time": "13:00",
  "tags": ["antenne", "autocostruzione", "community"]
}
-->
## Cos'è una Yagi

Una **Yagi** ha un solo elemento collegato al cavo, il **radiatore**. Tutti
gli altri sono **parassiti**: pezzi di metallo non collegati a niente che
irradiano di nuovo il segnale che ricevono. Dietro il radiatore sta un
**riflettore**, un po' più lungo; davanti, una fila di **direttori**, un po'
più corti. Se lunghezze e distanze sono giuste, ogni elemento sfasa
quanto basta perché il segnale si sommi in avanti e si annulli indietro.

Più direttori ci sono, più stretto e più guadagnoso è il fascio. Costa solo
lunghezza di boom: a 869 MHz la lunghezza d'onda è di 34,5 cm, e questa
Yagi è lunga 74 cm, poco più di due lunghezze d'onda.

Nella galleria c'erano già quattro Yagi di Fabrizio (compresa la
[LFA a tre elementi](../yagi-lfa-fabrizio/)) e una a tre elementi di
MeshCore ITA. Questa è la più lunga e la più guadagnosa.

## I numeri della scheda

La [scheda di Paolo](https://meshcore-ita.github.io/antenne/paolo-yagi10/)
contiene il modello NEC derivato dal calcolatore DL6WU. Il riflettore e gli
otto direttori sono tondini da 4 mm; il radiatore è un **dipolo ripiegato**
di filo da 1 mm.

| Parte | Misura nel modello |
|---|---|
| Riflettore | 167 mm, in posizione 0 |
| Dipolo ripiegato | 146 × 20 mm, a 34 mm dal riflettore |
| Direttori | 8, da 146 a 134 mm |
| Posizione dell'ultimo direttore | 740 mm dal riflettore |

Le posizioni lungo il boom sono cumulative, a partire dal riflettore. I
direttori stanno a 95, 157, 231, 317, 414, 517, 626 e 740 mm: la distanza tra
l'uno e l'altro cresce da 62 a 114 mm, perché più si va avanti e meno serve
tenerli stretti.

A 869,618 MHz, in spazio libero, la scheda riporta:

- **Guadagno 14,1 dBi** (11,9 dBd): circa 15,6 volte la potenza di un dipolo
  nella direzione migliore.
- **Avanti/dietro 20,1 dB**: dietro arriva circa 1/100 della potenza che va
  avanti.
- **Impedenza 51,3 + j7,0 Ω, ROS 1,15**, con il cavo saldato direttamente.
- **Minimo del ROS a 868 MHz**, un soffio sotto la sub-banda.

Come per le altre antenne direttive, il modello è orientato in orizzontale
(elementi lungo x) solo per comodità di descrizione. Per MeshCore l'antenna
va **montata in verticale**, con gli elementi in verticale. Guadagno, ROS e
forma del fascio non cambiano; cambia la polarizzazione, che diventa verticale
come quella dei nodi.

Rifacendo la simulazione con il file della scheda ho ricavato altri due
numeri che la pagina non dà:

- **Apertura del fascio a −3 dB: circa 36° in un piano e 40° nell'altro.**
  L'antenna va puntata con un errore massimo di una ventina di gradi per lato,
  cioè a occhio, ma non a caso.
- **ROS sotto 1,5 tra circa 862 e 873 MHz**, sotto 2 tra circa 859 e 880. La
  banda è stretta: quella dei 10 elementi non perdona un'antenna tarata male
  di qualche millimetro.

## Il calcolatore, e dove non basta

Paolo parte dal calcolatore online di
[3G-Aerial basato su DL6WU](https://3g-aerial.biz/en/online-calculations/antenna-calculations/dl6wu-yagi-uda-antenna-online-calculator).
Non è un dettaglio neutro: il calcolatore chiede il **tipo di boom**, e
sbagliare questa scelta dà un'antenna sbagliata. Paolo ha scelto un boom
**non conduttivo** (legno verniciato o plastica rigida, di sezione quadra da
20 mm) con gli elementi che lo attraversano. Gli altri parametri:

| Parametro | Valore |
|---|---|
| Forma del radiatore | dritto (poi ripiegato, vedi sotto) |
| Frequenza | 869 MHz |
| Elementi | 10 |
| Diametro degli elementi | 4 mm |
| Boom | quadro, 20 mm, dielettrico |

Il calcolatore dà 744 mm di boom e circa 13,9 dBi; la scheda ne simula 14,1
con il radiatore spostato. Ma Paolo mette in guardia: DL6WU **non garantisce
50 Ω** al radiatore. E una Yagi lunga e ottimizzata a fondo ha un'impedenza
più vicina a 30 Ω che a 50.

## Il problema del radiatore

A 869 MHz fare un adattamento di impedenza, hairpin o gamma match, è
difficile: le misure sono millimetriche e un contatto approssimativo toglie
resa senza dare nessun segnale. Il ROS può anche risultare perfetto mentre
l'antenna rende meno di quanto potrebbe. E il dipolo dritto del calcolatore
va montato **attraverso il boom**, aperto al centro, in modo che le viti non
facciano da contatto.

La strada di Paolo è un'altra: un **dipolo ripiegato** (folded) di filo di
rame da 1 mm, un rettangolo chiuso di 146 × 20 mm, a cui si saldano
direttamente i capi del coassiale. È molto più semplice da montare. Ma ha un
difetto: l'impedenza di un dipolo ripiegato è circa quattro volte quella di
uno dritto.

Paolo lo verifica con NEC, nell'ordine:

| Passo | Impedenza | ROS |
|---|---|---|
| Folded come da calcolatore, 4 mm | 143 − j34 Ω | 3,0 |
| Filo da 1 mm | 142 − j53 Ω | 3,3 |
| Lato lungo portato a 150 mm (risonanza) | 163 − j1 Ω | 3,3 |
| Radiatore da 69 a **34 mm** dal riflettore, lato di nuovo 146 mm | **52 + j6 Ω** | **1,14** |

Il trucco sta nell'ultima riga: **avvicinare il radiatore al riflettore
abbassa la parte resistiva dell'impedenza**. Con una sola modifica geometrica
(e riaccorciando il lato) l'impedenza passa da 163 a 52 Ω, senza balun e senza
trasformatori.

Con il modello della scheda ho provato a spostare solo il radiatore,
lasciando tutto il resto com'è:

| Distanza dal riflettore | Impedenza | ROS |
|---|---|---|
| 34 mm | 51 + j7 Ω | 1,15 |
| 40 mm | 68 + j13 Ω | 1,47 |
| 50 mm | 99 + j10 Ω | 2,01 |
| 69 mm | 146 − j42 Ω | 3,19 |

Sei millimetri spostano il ROS da 1,15 a 1,47. Questa è la ragione per cui
Paolo lascia l'ultima messa a punto al NanoVNA: il radiatore si sposta di
qualche millimetro in avanti o indietro finché il ROS è minimo.

## Il prezzo da pagare

Paolo dice chiaramente cosa si perde: il diagramma peggiora, in particolare
il **rapporto avanti/dietro**, che rispetto a un modello perfetto cala di
circa 10 dB. Il guadagno invece non scende, anzi sembra salire. La banda
larga, che di solito è il pregio di una Yagi ottimizzata, a un nodo MeshCore
non serve: il canale è uno solo.

Per il nostro uso è un buon compromesso. Un avanti/dietro di 20 dB è più che
sufficiente per un collegamento punto-punto, e non c'è nessuna rete di
adattamento da costruire a 869 MHz.

Un altro punto, di mestiere: i capi del coassiale vanno saldati al dipolo
**il più corti possibile e in linea con il dipolo**, a formare una **T** e
non una V. Paolo non mette il balun, e sostiene che "statisticamente" non
serve: il tema delle correnti sulla calza del cavo lo rimanda a un contributo
specifico.

## Dal modello al banco

Paolo ha costruito diverse antenne come descritte. Una è stata misurata con
il NanoVNA e confrontata con una **ground plane tarata alla perfezione**:
sul campo la Yagi ha dato circa **12 dB in più di RSSI**. Il conto torna:
14,1 dBi di guadagno contro i 2,2 dBi della ground plane fanno 11,9 dB.

Il materiale è quello che si trova ovunque:

- barra piena di alluminio da 4 mm per riflettore e direttori;
- filo di rame da 1 mm per il radiatore;
- un quadrello di legno da verniciare, o un tubo di plastica rigido, come
  boom;
- staffe da antenna TV per il montaggio;
- un trapano a colonna, o almeno una guida, per i fori: gli elementi storti
  non sono belli da vedere, anche se ci sono margini prima che il diagramma
  ne risenta.

Per il radiatore non serve nessun foro. Il file del modello è nella scheda e si apre con xnec2c o 4nec2:
vedi l'articolo sulle [antenne NEC senza Windows](../antenne-nec-senza-windows/).

## Il confronto con le altre Yagi

| Antenna | Elementi | Guadagno | Avanti/dietro | ROS |
|---|---|---|---|---|
| Yagi di Paolo | 10 (boom 740 mm) | 14,1 dBi | 20,1 dB | 1,15 |
| [Yagi di Fabrizio](https://meshcore-ita.github.io/antenne/fabrizio-yagi-10el/) | 10 (boom circa 583 mm) | 12,5 dBi | 22,3 dB | 1,82 |
| [Yagi LFA 3 elementi](../yagi-lfa-fabrizio/) | 3 | 8,8 dBi | 15,1 dB | 1,02 |
| [Yagi 3 elementi MeshCore ITA](https://meshcore-ita.github.io/antenne/meshcore-ita-yagi-3el/) | 3 | 8,1 dBi | 5,9 dB | 1,23 |

Il confronto non è del tutto alla pari: la Yagi di Fabrizio è un progetto
tedesco a 432 MHz riscalato, con boom metallico e un radiatore da 14 mm, ed
è più corta di 16 cm. Ma serve a mettere a fuoco una cosa: i 14 dBi di Paolo
non vengono da trucchi di modellazione. Vengono da due lunghezze d'onda di
boom e da una taratura molto ben fatta del radiatore.

## Attenzione alla potenza

Con 11,9 dBd di guadagno questa antenna va sul nodo **a potenza ridotta**. Il
preset italiano consente 27 dBm ERP (500 mW, vedi la
[normativa](../../normativa/)):

| Perdita nel cavo | TX massima |
|---|---|
| 0 dB | 15,1 dBm (32 mW) |
| 1 dB | 16,1 dBm (41 mW) |
| 2 dB | 17,1 dBm (51 mW) |

Un SX1262 si ferma a 22 dBm, quindi qui la potenza va **abbassata di 5-7 dB**
rispetto al massimo. Si perde poco: la portata la dà l'antenna, anche in
ricezione, e nessun limite di ERP tocca il guadagno in ricezione.

## Dove usarla

Una Yagi a 10 elementi con un fascio di 40° è un'antenna da
**collegamento punto-punto**, o da nodo in valle che deve raggiungere
l'unica cima da cui si vede la rete. Non copre un quartiere. Per un
ripetitore che serve la zona è meglio una
[collineare](../collineare-paolo/) o un dipolo. Per un collegamento tra due
ripetitori lontani, o per un bersaglio in una direzione sola, è la scelta
giusta.

La [scheda con vista 3D, grafici e file NEC](https://meshcore-ita.github.io/antenne/paolo-yagi10/)
è nella galleria; il tutorial completo di Paolo, con il calcolo e le foto,
è
[*Yagi-Uda 1926-2026*](https://lora868.at1839.name/yagi-uda-1926-2026/)
(pubblicato anche su Lora Italia).

Hai una tua antenna? Le istruzioni sono nell'articolo sulla
[galleria](../galleria-antenne/), oppure mandala nel gruppo Telegram
[MeshCore ITA](https://t.me/meshcore_ita).

Grazie a Paolo.
