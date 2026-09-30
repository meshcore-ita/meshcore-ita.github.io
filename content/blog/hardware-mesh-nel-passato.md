<!--meta
{
  "slug": "hardware-mesh-nel-passato",
  "title": "Perché l'hardware mesh vive nel passato? La versione italiana",
  "description": "Alex Beal si chiede perché le schede mesh usino ancora l'SX1262 del 2018 e l'nRF52, e propone i 2,4 GHz. Rifacciamo i conti con le regole europee: i chip LoRa nuovi convengono, i 2,4 GHz no, l'nRF54 può aspettare.",
  "h1": "L'hardware mesh vive nel passato?",
  "lede": "Un articolo americano chiede perché i nodi mesh usino ancora un chip del 2018 e propone di guardare ai 2,4 GHz. Abbiamo rifatto i conti con le regole che valgono in Italia.",
  "published": "2026-09-30",
  "tags": ["hardware", "community"]
}
-->
## Da dove partiamo

Oggi Alex Beal ha pubblicato
[*Why is mesh hardware living in the past?*](https://beala.substack.com/p/why-is-mesh-hardware-living-in-the).
La domanda è semplice. L'**SX1262**, il chip LoRa che c'è in quasi tutti i
nodi MeshCore e Meshtastic, è uscito a gennaio 2018. Da allora Semtech ha
fatto due nuove generazioni di chip, eppure schede appena lanciate come la
Heltec T1 o il kit da 1 W di RAK usano ancora quello.

L'articolo ha due tesi: i chip nuovi sentono meglio, e i 2,4 GHz sono
un'occasione sprecata. Il ragionamento sui 2,4 GHz però si basa sulle regole
americane della FCC. Lo abbiamo rifatto con le regole europee, che sono
quelle che valgono per noi.

## I chip nuovi sentono di più

Beala confronta i chip a SF12 e 125 kHz. Abbiamo ricontrollato i datasheet
Semtech e aggiunto SF7, l'altro valore che tutti e tre riportano:

| Chip | Generazione LoRa | SF7, 125 kHz | SF12, 125 kHz |
|---|---|---|---|
| SX1262 | 2ª (2018) | −124 dBm | −137 dBm |
| LR1110 | 3ª | −127 dBm | −141 dBm |
| LR2021 | 4ª | −127,5 dBm | −141,5 dBm |

A SF12 fra SX1262 e LR2021 ci sono **4,5 dB**: il chip nuovo decodifica un
segnale con circa il 35% della potenza che serve al vecchio, e in spazio
libero arriva a circa 1,7 volte la distanza. A SF7 il vantaggio scende a
3,5 dB.

Il nostro preset usa SF8 a 62,5 kHz. Per questa combinazione il datasheet
dell'LR2021 dà **−132 dBm**. Quello dell'SX1262 non la riporta: nella pagina
sul [link budget](../../link-budget/) la stimiamo intorno a −130 dBm, ma è
un'interpolazione. Con il nostro preset il vantaggio realistico è quindi
**fra 2,5 e 4 dB**, a seconda di quanto è precisa quella stima. Meno dei
4,5 dB di Beala, ma sempre un guadagno che non costa potenza. Nella realtà,
con colline ed edifici in mezzo, il guadagno di portata è minore di quello
in spazio libero, ma i dB restano dB.

La terza generazione non è fantascienza: l'LR1110 è già dentro prodotti che
usiamo, come il tracker Seeed SenseCAP T1000-E e il ThinkNode M3. Per la
quarta c'è il SenseCAP MeshTracker X1 con LR2021. Il firmware alternativo
[ZephCore](https://github.com/liquidraver/ZephCore), compatibile con MeshCore,
ha già driver per entrambi i chip, anche se quello per l'LR2021 è ancora
giovane.

## In Italia la sensibilità conta di più

Qui c'è la prima differenza con gli Stati Uniti, ed è a favore dei chip nuovi.

Nella sub-banda 869,4–869,65 MHz il limite è **500 mW ERP**, qualunque sia
l'antenna (vedi la [normativa](../../normativa/)). Un'antenna con più
guadagno non ci fa trasmettere più lontano: ci obbliga ad abbassare la
potenza sul nodo. Lo abbiamo visto con la
[Yagi LFA di Fabrizio](../yagi-lfa-fabrizio/), dove con il cavo corto
bastano 109 mW.

In trasmissione, quindi, siamo già al tetto. Le leve che restano sono tutte in
**ricezione**: il guadagno dell'antenna che riceve e la sensibilità del chip.
Il limite di potenza non tocca nessuna delle due. I 2,5–4 dB di un LR2021 sono
tra i pochi dB "gratis" che la legge ci lascia prendere, e un repeater in
cima a una collina li usa per tutti i nodi che lo raggiungono.

## I 2,4 GHz: il trucco americano

La seconda tesi di Beala è più audace. A 2,4 GHz la propagazione è peggiore:
circa 9 dB di attenuazione in più rispetto a 869 MHz a parità di distanza, e
gli ostacoli passano peggio. In cambio le antenne sono piccole: un pannello
da 18 dBi sta in 31 × 31 cm.

Negli Stati Uniti c'è anche una regola speciale per i collegamenti punto-punto
a 2,4 GHz. Oltre i 6 dBi di antenna la potenza va ridotta solo di 1 dB ogni
3 dB di guadagno in più. Con quel pannello da 18 dBi si arriva a 44 dBm EIRP,
cioè **25 W**. Beala propone di usarlo per dorsali ad alta velocità fra una
cima e l'altra, e l'idea ha senso.

## Da noi il trucco non c'è

In Europa la banda 2400–2483,5 MHz segue la raccomandazione CEPT
[ERC/REC 70-03](https://docdb.cept.org/download/4635) e la norma ETSI
[EN 300 328](https://www.etsi.org/deliver/etsi_en/300300_300399/300328/02.02.02_60/en_300328v020202p.pdf).
Il tetto generale per i sistemi a banda larga è **100 mW EIRP** (20 dBm),
antenna compresa, e non esiste un'eccezione per il punto-punto.

Per LoRa c'è un limite più stretto. Per le modulazioni a banda larga diverse
dal salto di frequenza, la densità di potenza non può superare **10 mW per
MHz**. Un segnale LoRa a 2,4 GHz occupa al massimo 1,6 MHz, e con le bande
più usate sta dentro un solo MHz: in pratica il limite scende a circa
**10 mW EIRP** (10 dBm). Con un pannello da 18 dBi la potenza sul nodo
dovrebbe scendere a −8 dBm.

Il confronto con Beala è impietoso:

| | Stati Uniti | Europa |
|---|---|---|
| LoRa a 2,4 GHz, pannello da 18 dBi | 44 dBm EIRP (25 W) | circa 10 dBm EIRP (10 mW) |
| 868/915 MHz | 36 dBm EIRP (4 W) | 27 dBm ERP (500 mW) |

In più la norma distingue fra apparati *adattivi*, che ascoltano il canale
prima di trasmettere, e *non adattivi*, che possono occupare il canale al
massimo per il 10% del tempo, pesato sulla potenza. Un nodo mesh dovrebbe
rientrare in una delle due categorie.

Facciamo i conti per un collegamento punto-punto. A 2,4 GHz si parte da
10 dBm EIRP e si perdono circa 9 dB di propagazione in più. A 869 MHz si
parte da circa 29 dBm EIRP. Mettiamo pure un pannello da 18 dBi in
ricezione a 2,4 GHz: a 869 MHz un semplice dipolo resta comunque avanti di
circa 12 dB, e una Yagi come quella di Fabrizio di quasi 20. In Europa i 2,4 GHz non
servono per arrivare più lontano. Possono servire solo per collegamenti
brevi con vista libera, dove interessa più velocità di trasmissione.

## I radioamatori?

Chi ha la patente di radioamatore ha accesso alla banda dei 13 cm, con
potenze molto più alte. Il problema è che il servizio di
radioamatore non ammette comunicazioni cifrate, e MeshCore cifra i messaggi.
Per una rete aperta a tutti non è una strada percorribile.

Anche la banda "personal communication" a 1,9 GHz citata da Beala è una
peculiarità americana: in Europa quella zona dello spettro è occupata dal DECT
dei telefoni cordless.

## E il microcontrollore?

Beala chiude con una battuta: usiamo ancora il Nordic **nRF52**, quando c'è
già l'**nRF54**. Qui la storia è simile, ma con qualche freno in più.

| | nRF52840 | nRF54L15 |
|---|---|---|
| In produzione dal | 2018 | 2024 |
| Processore | Cortex-M4F, 64 MHz | Cortex-M33, 128 MHz |
| Memoria di programma | 1 MB flash | 1,5 MB (RRAM) |
| RAM | 256 KB | 256 KB |
| USB | sì | **no** |

L'nRF54L15 è più veloce e ha più memoria, ma per un nodo MeshCore ci sono
tre ostacoli:

- **Niente USB.** Oggi un nodo nRF52 si aggiorna trascinando un file UF2 sul
  computer, o si collega via USB all'app. Sull'nRF54L15 serve un
  convertitore seriale o un programmatore SWD. La documentazione di ZephCore
  lo dice chiaro: niente UF2, si programma via SWD.
- **Il software.** Il firmware MeshCore ufficiale gira su Arduino, con una
  copia del core Arduino di Adafruit, che supporta solo la famiglia nRF52. L'nRF54 si programma con
  Zephyr. È uno dei motivi per cui esiste ZephCore, che ha già una build per
  la XIAO nRF54L15, ancora non provata sull'hardware.
- **Il guadagno reale è piccolo.** In un repeater la corrente la consuma
  soprattutto la radio LoRa, sempre in ascolto, non il processore. Un
  microcontrollore più efficiente allunga la batteria di un companion, ma
  non cambia la portata di un metro.

Quindi, se si deve scegliere dove spendere, il chip LoRa conta molto più del
microcontrollore. Va detto però che l'MCU si porta dietro anche il
Bluetooth, e un nRF54 con un LR2021 sarebbe oggi la coppia più moderna
possibile.

## Cosa ci portiamo a casa

- **Sì** ai chip nuovi. Con il tetto di 500 mW ERP, la sensibilità in
  ricezione è una delle poche leve libere, e LR1110 e LR2021 ne danno
  qualche dB in più: da 2,5 a 4 con il nostro preset. Vale soprattutto per
  i repeater.
- **Sì** alle antenne con guadagno, per lo stesso motivo: aiutano in
  ricezione anche se in trasmissione vanno compensate abbassando la potenza.
  La [galleria delle antenne](https://meshcore-ita.github.io/antenne/) serve
  proprio a questo.
- **No**, per ora, ai 2,4 GHz per la portata: in Europa LoRa lì resta
  intorno ai 10 mW. Resta interessante solo per collegamenti corti ad alta
  velocità.
- **Nessuna fretta** per l'nRF54: senza USB e senza il core Arduino costa
  più fatica di quanto renda, almeno finché il firmware non lo supporta
  bene.
- **Da seguire**: le modulazioni nuove dell'LR2021 (FLRC, O-QPSK, OOK), che
  Beala segnala e che nessuno ha ancora provato su una rete mesh.

Beala non aspetta i produttori: ha già fatto stampare una scheda di prova con
il modulo LR2021 per la sua rete locale. Se qualcuno nella community italiana
vuole fare lo stesso, o ha già un nodo con LR1110 da confrontare con un
SX1262 sullo stesso tetto, scriveteci nel gruppo Telegram
[MeshCore ITA](https://t.me/meshcore_ita). Una misura vera vale più di tutti
questi conti.
