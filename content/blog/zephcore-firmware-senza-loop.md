<!--meta
{
  "slug": "zephcore-firmware-senza-loop",
  "title": "ZephCore: MeshCore senza il loop di Arduino",
  "description": "ZephCore riscrive MeshCore sul sistema operativo Zephyr. Stesso protocollo e stesse app, ma niente loop() che gira a vuoto: il processore dorme finché non succede qualcosa. Cosa cambia rispetto al firmware ufficiale e cosa tenere a mente prima di installarlo.",
  "h1": "ZephCore: MeshCore senza il loop",
  "lede": "Ne avevamo parlato di passaggio, come il firmware che supporta già i chip LoRa nuovi. Questa volta guardiamo dentro: come gira, cosa fa diversamente dal firmware ufficiale e quando ha senso provarlo.",
  "published": "2026-10-19",
  "time": "10:00",
  "tags": ["software", "rete"]
}
-->
## Da dove partiamo

Nell'articolo [sull'hardware mesh](../hardware-mesh-nel-passato/) abbiamo
citato [ZephCore](https://github.com/liquidraver/ZephCore) due volte: ha già
i driver per i chip LoRa di nuova generazione (LR1110 e LR2021) e una build
per l'nRF54L15, che il firmware ufficiale non può supportare perché gira su
un core Arduino solo per nRF52. Lo abbiamo poi rimesso nel
[percorso tra le risorse di awesome-meshcore](../percorso-awesome-meshcore/),
fra i firmware alternativi.

Il punto però non è solo l'hardware. ZephCore cambia il modo in cui il
firmware passa il tempo. Il firmware ufficiale gira in un ciclo che
controlla tutto, di continuo. ZephCore invece aspetta che succeda qualcosa.

Questo articolo si basa sul codice di ZephCore 1.18.0 e sul ramo principale
di MeshCore di metà ottobre 2026.

## Stesso protocollo, sotto è tutto diverso

ZephCore non è un fork del protocollo. Un nodo ZephCore parla con i nodi
MeshCore normali, si accoppia con le stesse app e risponde agli stessi
comandi della CLI. Il formato dei pacchetti in aria è bloccato a quello
ufficiale: il documento di progetto lo chiama *frozen*, e ogni funzione in
più deve restare locale al nodo.

Cambia quello che sta sotto. Al posto di Arduino c'è
[Zephyr](https://zephyrproject.org/), un sistema operativo real-time per
microcontrollori della Linux Foundation. I driver radio, il Bluetooth, la
USB e il file system sono quelli di Zephyr. Il codice della mesh
(`Dispatcher`, `Mesh`, `Packet`, le identità) è invece copiato da MeshCore
quasi riga per riga: ogni modifica è marcata con un commento
`// ZEPHCORE:`, così un confronto con l'originale mostra solo le differenze
volute. Quando MeshCore esce con una versione nuova, ZephCore la importa.
La 1.18.0 di ZephCore contiene le modifiche della 1.18.0 ufficiale.

| | MeshCore ufficiale | ZephCore |
|---|---|---|
| Base | Arduino (core Adafruit su nRF52, Arduino-ESP32 su ESP32) | Zephyr RTOS |
| Ciclo principale | `loop()` chiamato di continuo | thread che dorme finché arriva un evento |
| Radio | RadioLib, l'interrupt alza un flag | driver Zephyr, l'interrupt mette il pacchetto in coda e sveglia il thread |
| Ritardo prima di ritrasmettere | `txdelay` fisso | finestra adattiva |
| Processori | nRF52, ESP32, RP2040, STM32 | nRF52, nRF54L, ESP32, EFR32MG24, STM32WL, Linux |
| Ruoli | companion, repeater, room server, KISS modem | gli stessi più l'observer (MQTT) |
| Chi lo scrive | il progetto MeshCore | una persona che dirige, con il codice scritto al 99% da AI |

## Il loop del firmware ufficiale

Un programma Arduino ha due funzioni: `setup()`, che parte una volta, e
`loop()`, che viene chiamata all'infinito. Il repeater ufficiale fa così. A
ogni giro `loop()`:

1. legge la seriale, un carattere alla volta, per vedere se è arrivato un
   comando della CLI;
2. chiama `the_mesh.loop()`, che a sua volta chiede alla radio se ha finito
   di trasmettere, se ha ricevuto un pacchetto, se c'è qualcosa da spedire;
3. aggiorna sensori, display e orologio;
4. se `powersaving` è attivo e non c'è lavoro in sospeso, mette il
   processore a dormire.

La radio non chiama nessuno. Quando l'SX1262 riceve un pacchetto, alza il
pin DIO1 e l'interrupt imposta un flag (`STATE_INT_READY` nel wrapper di
RadioLib). Sarà il giro successivo del loop ad accorgersene. È un modello
detto *polling*: il programma chiede di continuo «c'è qualcosa?».

Il polling è semplice da leggere e da correggere, ed è il motivo per cui
MeshCore gira su schede tanto diverse. Ha due costi. Il primo è l'energia:
se `powersaving` è spento, che è il default, il processore non si ferma mai.
Il secondo è che ogni pezzo di codice nel loop rallenta tutti gli altri:
se uno si blocca, si blocca tutto.

Va detto per correttezza: con `powersaving on` su nRF52 anche il firmware
ufficiale dorme fra un evento e l'altro, e si sveglia con qualunque
interrupt. Ma al risveglio rifà comunque tutto il giro, per scoprire cosa
è successo.

## Niente loop: un thread che aspetta

In ZephCore la mesh vive in un solo thread, il thread principale di Zephyr.
Quel thread passa quasi tutto il tempo fermo in una chiamata,
`k_event_wait()`, che si sblocca solo quando qualcuno alza uno dei bit di
evento: pacchetto LoRa ricevuto, trasmissione finita, comando arrivato da
USB o Bluetooth, scadenza di manutenzione, azione del GPS.

Il percorso di un pacchetto ricevuto è questo:

1. la radio alza DIO1;
2. il driver Zephyr legge il pacchetto e lo scrive in un buffer circolare
   da 8 posti;
3. il driver alza l'evento `MESH_EVENT_LORA_RX`;
4. il thread principale si sveglia, guarda quali bit sono alzati e svuota il
   buffer con lo stesso `Dispatcher` del firmware ufficiale;
5. finito il lavoro, torna ad aspettare.

Nessuno chiede di continuo «c'è qualcosa?». Quando non c'è niente, il
processore non ha niente da eseguire e Zephyr lo mette a dormire da solo.

Il codice ha una regola esplicita: lo stato della mesh si tocca solo dal
thread principale. Bluetooth, USB, GPS e driver radio girano in contesti
separati e passano i dati attraverso code ed eventi. È lo stesso principio
del firmware ufficiale, un solo flusso che possiede la mesh, ma senza il
giro a vuoto.

## Le scadenze al posto del timer

Restava un pezzo di polling. Fino alla 1.16.7 il repeater ZephCore si
svegliava comunque ogni 5 secondi, per fare la manutenzione: misurare il
rumore di fondo, controllare il timer degli advert, rimettere a posto una
configurazione radio temporanea.

Dalla 1.16.8 il repeater è guidato dalle scadenze. Prima di addormentarsi
chiede «quando è il prossimo lavoro?» e programma un'unica sveglia per quel
momento. Una sveglia di sicurezza ogni 60 secondi copre il caso di una
scadenza dimenticata. Il documento di progetto riporta circa 0,07 risvegli
al secondo per un repeater fermo, cioè uno ogni 14 secondi circa. Oggi il
room server condivide lo stesso ciclo del repeater, e quindi le stesse
sveglie.

Il companion tiene il timer da 5 secondi, ed è una scelta dichiarata: deve
controllare cose che non hanno una scadenza, come l'avanzamento della lista
contatti verso l'app o il Bluetooth che smette di farsi vedere.

Una nota sui consumi: in un repeater la parte grossa la fa la radio,
sempre in ascolto, come avevamo scritto nell'articolo sull'hardware. Un
processore che dorme meglio aiuta, ma non cambia l'ordine di grandezza.
ZephCore ha anche una leva sulla radio: un ciclo di ascolto in cui il chip
LoRa sonnecchia fra un controllo del preambolo e l'altro. È opzionale e va
valutata scheda per scheda: dormire troppo vuol dire perdere pacchetti.

## Le macchine a stati

Un firmware senza loop non può più scrivere «aspetta che la radio finisca»
come una riga dentro un ciclo. Ogni componente che ha un'attesa deve sapere
in che fase si trova e cosa la fa passare alla fase dopo. In pratica,
diventa una macchina a stati esplicita. In ZephCore ce ne sono diverse:

- **La radio** (`LoRaRadio`): ricezione, ascolto prima di parlare,
  trasmissione, ritorno in ricezione. Ogni passaggio è innescato da un
  interrupt del chip, non da un controllo periodico.
- **Il GPS**: spento, in acquisizione, in attesa. Se è impostato un
  intervallo, dopo 5 posizioni buone spegne il modulo e lo riaccende alla
  scadenza successiva.
- **Il Dispatcher**: coda di trasmissione, controllo del canale libero,
  duty cycle. È la stessa logica del firmware ufficiale.

La regola che le tiene insieme è scritta nel progetto: ogni attesa ha un
limite e un modo di uscirne. ZephCore non usa il watchdog hardware, il
timer che riavvia il processore se il programma smette di rispondere.
Ogni macchina a stati ha invece il proprio ripristino. Se il canale
risulta occupato per più di 4 secondi, la radio viene resettata e rimessa
in ricezione invece di trasmettere alla cieca. Se un chip LR1110 resta
bloccato senza interrupt per 12 secondi, un controllo separato lo
riconosce e lo riavvia.

È un approccio più faticoso da scrivere, ma che si può verificare. Il
nucleo della mesh gira anche sul computer, dentro una batteria di test
automatici con gli strumenti che trovano gli errori di memoria (ASan e
UBSan). Su un loop che controlla l'hardware a ogni giro sarebbe più
difficile.

## Il ritardo adattivo al posto di txdelay

Nell'articolo sul [tempo d'aria condiviso](../aria-condivisa/) abbiamo
visto come funziona il ritardo casuale prima di ritrasmettere un flood: la
finestra è fissa, 5 × `txdelay` × tempo in aria, e alzare `txdelay` sui
repeater in collina riduce le collisioni al prezzo di più latenza.

ZephCore sostituisce quel parametro con tre meccanismi:

- **Finestra adattiva.** Il repeater misura quanto è affollato il suo
  intorno e allarga o stringe la finestra di conseguenza. Il tetto è il
  minore fra 2 secondi e 6 volte il tempo in aria del pacchetto.
- **Rinvio a ogni doppione.** Se mentre aspetta sente un altro nodo
  ritrasmettere lo stesso pacchetto, rimanda la propria trasmissione di
  una frazione del tempo in aria, fino a un massimo.
- **Finestra corta per i companion.** Un companion che non ripete usa una
  finestra fissa fra 20 e 150 ms per i messaggi che parte lui.

La conseguenza pratica è importante: **su ZephCore `set txdelay`,
`set rxdelay` e `set direct.txdelay` vengono accettati ma ignorati**. Il
consiglio del nostro articolo precedente non si applica. L'unica leva è
`set backoff.multiplier` (default 0,2), che regola il rinvio per doppione;
`get txdelay` mostra lo stato del meccanismo adattivo.

Queste scelte non cambiano niente in aria: un nodo ZephCore in mezzo a nodi
ufficiali è solo un nodo che sceglie il momento in modo diverso. Non
abbiamo misure sul campo che dicano se una mesh mista funzioni meglio o
peggio. Se ne hai, scrivici.

## Le altre differenze

- **Più processori e chip radio.** nRF52840, nRF54L15, la famiglia ESP32,
  EFR32MG24 e STM32WL; per le radio SX126x, SX127x, LR1110 e LR2021. Con
  l'LR2021 si può impostare una frequenza a 2,4 GHz. In Italia per ora non
  serve: nell'articolo sull'hardware abbiamo visto perché.
- **Un ruolo in più, l'observer.** Un nodo ESP32 che ascolta e basta, e
  pubblica tutto quello che sente su un server MQTT via Wi-Fi. Anche un
  repeater ESP32 può mandare i pacchetti a MQTT mentre ripete.
- **Sincronizzazione dell'ora.** I nodi senza GPS possono mettersi d'accordo
  sull'ora usando i timestamp firmati degli advert dei vicini. È spenta di
  default (`set meshtimesync on`).
- **LED configurabili.** `set leds off` li spegne tutti; si può scegliere
  cosa segnala ciascuno, per esempio un lampeggio a ogni pacchetto
  ricevuto: a colpo d'occhio si vede se un repeater sente qualcosa.
- **Gira anche su Linux.** Lo stesso codice gira come programma normale su
  un Raspberry Pi con un SX1262 collegato.

## Prima di installarlo

- **Le impostazioni non passano.** Fra firmware ufficiale e ZephCore, in
  entrambe le direzioni, contatti, canali e configurazione non vengono
  conservati. Su un repeater vuol dire rifare password, nome, preset radio e
  posizione. Se il nodo ha un'identità che i vicini conoscono, esportala
  prima.
- **Su nRF52 il bootloader resta quello.** Si installa trascinando il file
  UF2, come il firmware ufficiale, e si torna indietro allo stesso modo.
- **L'installazione più semplice** è il
  [web flasher di ZephCore](https://zephcore.meshcore.dev), da Chrome o Edge.
- **Le schede nRF sono le più provate.** Il manutentore prova le release
  soprattutto su schede nRF; le schede ESP32 sono provate in buona parte
  dalla community.
- **Il codice è scritto quasi tutto da AI.** Lo dice il README stesso:
  circa il 99% del codice è scritto da modelli AI, una persona decide cosa
  costruire e prova i risultati su radio vere. Le decisioni sono
  documentate, ci sono test automatici e i bug trovati vengono segnalati
  anche al progetto ufficiale. Resta un progetto guidato da una persona
  sola, e conviene saperlo.
- **Non è il firmware ufficiale.** Se chiedi aiuto nel gruppo, dillo
  subito: un comportamento strano su ZephCore può non avere niente a che
  vedere con MeshCore, e viceversa.

## Cosa ci portiamo a casa

Per chi usa un companion, ZephCore è soprattutto un modo di avere MeshCore
su schede che il firmware ufficiale non supporta. Per chi gestisce un
repeater, è un esperimento interessante su due fronti: un processore che
dorme davvero quando non c'è traffico e un ritardo di ritrasmissione che
si adatta da solo invece di essere regolato a mano.

Il modo giusto di provarlo è su un nodo che controlli da vicino, non sul
repeater in cima alla collina che serve mezza provincia. E se lo provi,
raccontaci com'è andata nel gruppo: stabilità, consumi, cosa senti in più
o in meno.

## Fonti

- Architettura, modello a thread unico, regole su attese e ripristini:
  [`docs/DESIGN.md`](https://github.com/liquidraver/ZephCore/blob/4f63ee25bda2876e36d47d7a77747b2eeaaae202/docs/DESIGN.md)
  di ZephCore.
- Ciclo a eventi del repeater e del room server:
  [`zephcore/src/server_main_common.cpp`](https://github.com/liquidraver/ZephCore/blob/4f63ee25bda2876e36d47d7a77747b2eeaaae202/zephcore/src/server_main_common.cpp).
- Macchina a stati della radio, flusso di un pacchetto ricevuto e
  ripristini:
  [`docs/ARCHITECTURE.md`](https://github.com/liquidraver/ZephCore/blob/4f63ee25bda2876e36d47d7a77747b2eeaaae202/docs/ARCHITECTURE.md).
- Ritardo adattivo e `txdelay` ignorato:
  [ADR 0007](https://github.com/liquidraver/ZephCore/blob/4f63ee25bda2876e36d47d7a77747b2eeaaae202/docs/adr/0007-adaptive-contention-window.md).
- Repeater guidati dalle scadenze:
  [note di rilascio 1.16.8](https://github.com/liquidraver/ZephCore/releases/tag/1.16.8-zephcore).
- Loop del repeater ufficiale:
  [`examples/simple_repeater/main.cpp`](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/examples/simple_repeater/main.cpp);
  gestione dell'interrupt radio:
  [`src/helpers/radiolib/RadioLibWrappers.cpp`](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/src/helpers/radiolib/RadioLibWrappers.cpp);
  sonno su nRF52:
  [`src/helpers/NRF52Board.cpp`](https://github.com/meshcore-dev/MeshCore/blob/81dbae592ffad40b4212bc0b37e82b38da08f4bc/src/helpers/NRF52Board.cpp).
