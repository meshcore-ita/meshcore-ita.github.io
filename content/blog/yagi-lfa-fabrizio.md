<!--meta
{
  "slug": "yagi-lfa-fabrizio",
  "title": "La Yagi LFA di Fabrizio: 50 Ω senza adattatore",
  "description": "Fabrizio aggiunge alla galleria una Yagi LFA a 3 elementi per 868 MHz: 8,8 dBi, rapporto avanti/dietro di 15 dB e ROS 1,00 senza alcuna rete di adattamento, in 12 cm di boom.",
  "h1": "Una Yagi che si adatta da sola",
  "lede": "Il giorno dopo l'apertura della galleria, Fabrizio ci ha mandato una Yagi a 3 elementi un po' speciale: l'elemento alimentato è un anello chiuso. Il simulatore ha risposto con un ROS di 1,00.",
  "published": "2026-09-27",
  "tags": ["antenne", "autocostruzione", "community"]
}
-->
## Un anello al posto del dipolo

In una Yagi classica l'elemento alimentato è un dipolo, cioè un filo tagliato
a metà. Quando ci si mettono vicino riflettore e direttore, però, la sua
impedenza scende ben sotto i 50 Ω, e di solito per collegarlo al cavo serve un
adattatore: un gamma match, un hairpin o un balun.

La **LFA** (*Loop Fed Array*, ideata dal radioamatore inglese Justin Johnson,
G0KSC) fa diversamente. L'elemento alimentato è un **anello rettangolare
chiuso**, lungo e basso, messo tra riflettore e direttore. Allungando o
schiacciando l'anello si porta l'impedenza a 50 Ω, e il cavo si collega
direttamente, senza altro in mezzo.

## Come è fatta

Il modello che Fabrizio ha caricato nella
[galleria](https://meshcore-ita.github.io/antenne/fabrizio-yagi-lfa-3el/)
è piccolo:

| Elemento | Lunghezza | Distanza dal riflettore |
|---|---|---|
| Riflettore | 162 mm | 0 |
| Anello alimentato | 141 × 28 mm | da 47 a 75 mm |
| Direttore | 147 mm | 124 mm |

Tutto in filo da 4 mm, su un boom di **appena 12,4 cm**. Il connettore va al
centro del lato dell'anello più lontano dal riflettore.

## Cosa dice il simulatore

A 869,618 MHz, la frequenza del [preset italiano](../../preset-radio/):

- **Guadagno 8,8 dBi**, cioè 6,6 dB più di un dipolo: nella direzione
  giusta arriva circa 4,6 volte la potenza.
- **Rapporto avanti/dietro 15 dB**: quello che arriva da dietro è attenuato
  di circa 30 volte. È utile se alle spalle del nodo c'è una città piena di
  disturbi.
- **Impedenza 49,8 + j0,2 Ω, ROS 1,00.** Più vicino di così ai 50 Ω non si
  può, e senza adattatore.
- **ROS sotto 2 da meno di 855 fino a circa 881 MHz**: resta un buon margine
  anche se in costruzione le misure non vengono perfette.

Messa accanto alle altre Yagi della galleria:

| Antenna | Guadagno | Avanti/dietro | ROS |
|---|---|---|---|
| **Yagi LFA 3 elementi, di Fabrizio** | **8,8 dBi** | **15,2 dB** | **1,00** |
| Yagi 3 elementi di riferimento | 8,1 dBi | 5,9 dB | 1,23 |
| Yagi 2 elementi con riflettore, di Fabrizio | 6,4 dBi | 8,5 dB | 1,09 |

Con lo stesso numero di elementi, la LFA batte la nostra Yagi di riferimento
su tutti e tre i numeri. Il rapporto avanti/dietro, in particolare, è più che
doppio in dB.

## Attenzione alla potenza

Più guadagno vuol dire meno potenza da impostare sul nodo. Per restare nei
500 mW ERP della sub-banda 869,4–869,65 MHz (vedi la pagina sulla
[normativa](../../normativa/)):

| Perdita del cavo | Potenza massima sul nodo |
|---|---|
| 0 dB | 20,4 dBm (109 mW) |
| 1 dB | 21,4 dBm (138 mW) |
| 2 dB | 22,4 dBm (173 mW) |

Con il cavo corto, i 22 dBm di molte schede sono già troppi.

## Solo una simulazione, per ora

Questi numeri vengono da una simulazione in spazio libero: indicano la
tendenza, ma la verifica vera si fa con un NanoVNA sull'antenna montata.

## E ora?

Aspettiamo le foto della costruzione e, se Fabrizio ha voglia, la misura
del ROS reale. Nel frattempo la scheda con la vista 3D, i grafici e il file
spiegato riga per riga è qui:
[Yagi LFA 3 elementi](https://meshcore-ita.github.io/antenne/fabrizio-yagi-lfa-3el/).

Hai una tua antenna? Le istruzioni sono nell'articolo sulla
[galleria](../galleria-antenne/), oppure mandala nel gruppo Telegram
[MeshCore ITA](https://t.me/meshcore_ita).

Grazie ancora a Fabrizio.
