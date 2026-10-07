<!--meta
{
  "slug": "aria-condivisa",
  "title": "Un canale per tutti: quanta aria ha davvero la mesh",
  "description": "Il 10% di duty cycle è un limite per nodo, ma la frequenza è una sola. Con il codice del firmware alla mano calcoliamo quanto occupano advert e messaggi di canale, perché i repeater in collina soffrono di più e cosa fa set txdelay.",
  "h1": "Un canale per tutti",
  "lede": "Quando si parla di limiti si guarda sempre il 10% di duty cycle del singolo nodo. Ma tutta la mesh trasmette sulla stessa frequenza, e il limite che arriva prima è un altro: il tempo d'aria condiviso.",
  "published": "2026-10-07",
  "tags": ["rete", "software"]
}
-->
## Da dove partiamo

La [normativa](../../normativa/) ci dà il 10% di duty cycle: al massimo 6
minuti di trasmissione all'ora **per dispositivo**. È il numero che tutti
controllano, ed è giusto farlo.

Però c'è un dettaglio che il limite per nodo non racconta. Tutti i nodi
italiani usano lo stesso [preset](../../preset-radio/): 869.618 MHz, 62,5 kHz,
SF8. Non ci sono canali alternativi su cui spostarsi. Quando un nodo
trasmette, tutti quelli che lo sentono devono stare zitti o rischiare una
collisione. Il canale è uno solo, e il suo tempo si divide fra tutti.

Abbiamo aperto il codice del firmware (tag `repeater-v1.17.1`) per fare i
conti: quanto pesa ogni pacchetto, quante copie ne girano e quando due
trasmissioni si pestano i piedi.

## Quanto pesa un pacchetto

Il tempo in aria si calcola con la formula del datasheet SX1262, la stessa
che usiamo nella pagina sul [link budget](../../link-budget/). Con il nostro
preset un simbolo dura 4,1 ms. Il firmware usa un preambolo di 32 simboli
quando SF è 8 o meno: prima ancora del primo byte utile passano **148 ms**.

Poi servono le dimensioni dei pacchetti, e quelle si leggono nel codice:

- un **advert** contiene la chiave pubblica (32 byte), un timestamp (4), la
  firma Ed25519 (64) e fino a 32 byte di dati: tipo di nodo, coordinate,
  nome. Un repeater chiamato `IT-Torino-RPT-01` con la posizione impostata
  arriva a circa 127 byte, e ogni hop aggiunge un byte al percorso;
- un **messaggio di canale** porta un byte di hash del canale, 2 di MAC e il
  testo cifrato: timestamp, tipo, `nome: testo`, arrotondato a blocchi di
  16 byte. Un messaggio di 40 caratteri sta intorno ai 70 byte;
- una **conferma di consegna** (ACK) è di pochi byte.

| Pacchetto | Byte (circa) | Tempo in aria |
|---|---|---|
| ACK | 6 | 0,25 s |
| Messaggio di canale, 40 caratteri | 71 | 0,80 s |
| Advert di un repeater, dopo 2 hop | 129 | 1,26 s |
| Pacchetto più lungo possibile | 255 | 2,31 s |

L'advert è il pacchetto più pesante fra quelli di routine: più di un secondo
e un quarto, quasi tutto per la firma e la chiave. Sono i byte che rendono
l'identità di un nodo verificabile senza un server, e non si possono
togliere.

## Un pacchetto, tante copie

Advert e messaggi di canale viaggiano in flood. Ogni repeater che riceve un
pacchetto flood lo ritrasmette **una volta sola**: il firmware tiene una
tabella dei pacchetti già visti e scarta i doppioni. È quello che impedisce
alla rete di andare in loop.

Una volta sola per repeater, però, vuol dire che un singolo messaggio costa
alla rete tante trasmissioni quanti sono i repeater che raggiunge. E chi sta
in ascolto in un punto qualunque riceve una copia da **ogni** repeater che
sente.

Da qui la distinzione che conta:

- il **duty cycle del nodo** misura quanto trasmette lui;
- l'**occupazione del canale** misura quanto è occupata l'aria nel punto in
  cui si trova, sommando tutto quello che sente.

Il primo numero può essere basso mentre il secondo è alto. Un repeater che
ritrasmette 30 messaggi di canale all'ora usa lo 0,7% del suo 10%. Se però
sente altri 19 repeater che fanno la stessa cosa, il canale intorno a lui è
occupato per il 13%. E nessuno ha violato niente.

## Il conto degli advert

Proviamo con un modello semplice. In una zona ci sono **N** repeater
collegati fra loro, e chi ascolta ne sente **k** direttamente. Ogni repeater
manda un advert flood ogni **T** ore. Gli advert dei repeater non vengono
ripetuti oltre 8 hop (`flood.max.advert`, default 8), quindi in una regione
grande N è il numero di repeater entro 8 hop, non quello di tutta Italia.

Ogni advert arriva in k copie, ognuna da 1,26 secondi:

| Repeater in zona (N) | Ne sento (k) | Advert ogni 12 h | Advert ogni 47 h |
|---|---|---|---|
| 50 | 5 | 0,7% | 0,2% |
| 150 | 8 | 3,5% | 0,9% |
| 150 | 20 | 8,8% | 2,2% |

Perché due colonne? Fino alla versione 1.15 il default di
`flood.advert.interval` era di 12 ore. Dalla **1.16.0** un repeater appena
installato manda l'advert flood ogni **47 ore**: in pratica un quarto del
traffico di advert. Il default vale solo per le installazioni nuove o
resettate. Un repeater aggiornato conserva le impostazioni che aveva, quindi
molti nodi in giro mandano ancora l'advert ogni 12 ore.

L'ultima riga è il caso del repeater in cima a una collina, che sente 20
vicini. Con il vecchio intervallo spende quasi un decimo dell'aria solo per
ascoltare gli advert altrui.

## Il conto dei canali

Gli advert si possono diradare. I messaggi di canale no: li manda la gente,
quando ha qualcosa da dire. Un messaggio di canale va in flood fino a 64 hop,
quindi attraversa tutta la parte di rete collegata, salvo che il canale sia
limitato a una regione (lo vediamo più avanti).

Con messaggi di 40 caratteri, ognuno da 0,8 secondi:

| Messaggi all'ora sul canale | Repeater che sento (k) | Canale occupato |
|---|---|---|
| 30 | 8 | 5,4% |
| 30 | 20 | 13,4% |
| 60 | 20 | 26,8% |

Un messaggio ogni due minuti su un canale pubblico regionale non è tanto.
Una serata vivace in chat lo supera facilmente. Ed è qui che la differenza
fra un messaggio diretto e uno di canale diventa concreta. Come spieghiamo
nella pagina sull'[app](../../app/), il primo messaggio diretto passa in
flood, ma poi il percorso viene imparato e i successivi passano solo per i
repeater che servono. Un canale, invece, paga il flood ogni volta.

## Quando due parlano insieme

Prima di trasmettere il firmware controlla se il radio sta ricevendo
qualcosa. Se sì, aspetta qualche centinaio di millisecondi e riprova. È un
"ascolta prima di parlare" e funziona bene **fra nodi che si sentono fra
loro**: con 148 ms di preambolo c'è tutto il tempo per accorgersi che
qualcuno ha cominciato.

Non funziona fra nodi che **non** si sentono. Due repeater in due valli
diverse possono trasmettere nello stesso istante, convinti di avere il
canale libero. Il repeater sulla collina in mezzo li sente entrambi e riceve
solo rumore. È il classico problema del **nodo nascosto**.

Per chi non si sente vale il modello ALOHA: un pacchetto arriva intatto con
probabilità di circa e^(−2G), dove G è il carico dei trasmettitori
nascosti. Se l'aria è occupata per il 10% da nodi che non si sentono fra
loro, circa 18 pacchetti su 100 si perdono. Al 20%, uno su tre.

C'è un'attenuante: se uno dei due segnali è più forte di qualche dB, il
ricevitore LoRa spesso riesce a decodificarlo lo stesso (effetto cattura).
E in una mesh lo stesso pacchetto arriva da più strade. Il conto resta
pessimista, ma la direzione è chiara.

Ecco il paradosso: **il repeater migliore è quello che soffre di più**. Più
è alto, più vicini sente; più vicini sente, più sono quelli che non si
sentono fra loro. Le collisioni si concentrano proprio nei nodi da cui
dipende la copertura di tutti.

## Il ritardo casuale e set txdelay

C'è un momento in cui le collisioni sono quasi certe: subito dopo una
trasmissione. Un repeater manda un pacchetto, e tutti i suoi vicini lo
ricevono nello stesso istante. Se lo ritrasmettessero subito, partirebbero
tutti insieme.

Per questo, prima di ritrasmettere un flood, ogni repeater aspetta un tempo
casuale. Nel codice la finestra va da zero a **5 × txdelay × tempo in aria
del pacchetto**. Con il default `txdelay` 0,5, la finestra è di 2,5 volte la
durata del pacchetto. A parità di ritardo, inoltre, passano prima i
pacchetti che hanno fatto meno hop.

Fra vicini che si sentono basta che uno parta per primo: gli altri lo
sentono e aspettano. Fra vicini nascosti decide solo il caso. Per due
repeater nascosti la probabilità che le loro trasmissioni si sovrappongano
dipende dalla larghezza della finestra:

| `txdelay` | Finestra | Due nascosti si sovrappongono | Ritardo medio per hop (canale) |
|---|---|---|---|
| 0,5 (default) | 2,5 × pacchetto | 64% | 1,0 s |
| 1,0 | 5 × pacchetto | 36% | 2,0 s |
| 2,0 (massimo) | 10 × pacchetto | 19% | 4,0 s |

È uno scambio diretto: meno collisioni in cambio di più latenza, e la
latenza si somma a ogni hop. Su cinque hop, passare da 0,5 a 1,0 aggiunge
in media 5 secondi a un messaggio di canale. Per i messaggi diretti c'è un
parametro separato, `direct.txdelay`, con default 0,3.

## Cosa possiamo fare

Nessuna di queste è una regola della community: sono conseguenze dei
numeri.

1. **Non accorciare l'intervallo degli advert flood.** Se il tuo repeater ha
   ancora le 12 ore di una versione vecchia, valuta di portarlo a 47 con
   `set flood.advert.interval 47`. Un repeater fisso non cambia identità:
   farsi riannunciare spesso non serve a nessuno.
2. **Dal companion, l'advert flood solo quando serve.** Ogni advert flood
   lanciato dal telefono costa 1,26 secondi per ogni repeater della zona.
3. **Messaggi diretti e room server per le conversazioni lunghe.** Un canale
   pubblico è comodo, ma ogni battuta passa da tutta la rete.
4. **Canali limitati a una regione.** Il region scoping (firmware 1.10+,
   comandi nella pagina della [CLI](../../comandi/)) impedisce a un messaggio
   locale di attraversare tutta la mesh.
5. **Un repeater in più non è mai gratis.** Aggiunge una copia di ogni flood
   per tutti quelli che lo sentono. Se copre zone già coperte, toglie aria
   più di quanta ne dia. Prima di installare guarda la
   [mappa di copertura](../../mappa-copertura/) e chiedi nel gruppo.
6. **`txdelay` più alto sui repeater che sentono molto.** Un nodo in collina
   che sente tanti vicini nascosti è il candidato naturale. Alzalo con
   cautela, e coordinati con chi gestisce i repeater vicini.
7. **Misura invece di indovinare.** Via seriale `stats-radio` mostra il tempo
   in aria e il noise floor del repeater, e `stats-packets` i contatori dei
   pacchetti. Un repeater che passa molto tempo a ricevere ti sta dicendo
   quanto è occupato il canale intorno a lui.

Per chi vuole andare oltre, il firmware ha altre due leve, spente di
default: il rilevamento di attività in hardware prima di trasmettere
(`set cad on`) e una soglia di interferenza basata sull'RSSI
(`set int.thresh`). Non le abbiamo provate e non diamo valori consigliati:
chi le usa ci racconti com'è andata.

## I limiti del conto

Il modello è volutamente semplice. Considera i repeater distribuiti in modo
uniforme e un traffico costante. Non conta i tentativi ripetuti dopo un
messaggio non confermato, i pacchetti di percorso e gli ACK. Tratta le
collisioni come se fossero tutte distruttive, ignorando l'effetto cattura.
Il traffico vero arriva a raffiche: i picchi contano più della media oraria.

Gli ordini di grandezza però reggono. Per la mesh italiana, il primo collo di
bottiglia non è il 10% del singolo nodo: è il secondo d'aria condiviso da
tutti quelli che si sentono. Gestire bene quel secondo, con meno advert, meno
repeater inutili e più messaggi diretti, è qualcosa che possiamo fare subito,
senza aspettare un nuovo firmware.

## Fonti

- Formato dell'advert e scarto dei doppioni:
  [`src/Mesh.cpp`](https://github.com/meshcore-dev/MeshCore/blob/repeater-v1.17.1/src/Mesh.cpp)
  e limite di 32 byte di dati in
  [`src/MeshCore.h`](https://github.com/meshcore-dev/MeshCore/blob/repeater-v1.17.1/src/MeshCore.h).
- Default del repeater (`txdelay` 0,5, `direct.txdelay` 0,3,
  `flood.advert.interval` 47, `flood.max.advert` 8) e finestra del ritardo
  casuale:
  [`examples/simple_repeater/MyMesh.cpp`](https://github.com/meshcore-dev/MeshCore/blob/repeater-v1.17.1/examples/simple_repeater/MyMesh.cpp).
- Passaggio da 12 a 47 ore, incluso dalla versione 1.16.0:
  [commit 40180b8](https://github.com/meshcore-dev/MeshCore/commit/40180b8f).
- Ascolto prima della trasmissione:
  [`src/Dispatcher.cpp`](https://github.com/meshcore-dev/MeshCore/blob/repeater-v1.17.1/src/Dispatcher.cpp).
- Preambolo di 32 simboli fino a SF8:
  [`src/helpers/radiolib/RadioLibWrappers.h`](https://github.com/meshcore-dev/MeshCore/blob/repeater-v1.17.1/src/helpers/radiolib/RadioLibWrappers.h).
- Formula del tempo in aria: Semtech, datasheet SX1261/2, §6.1.4.
