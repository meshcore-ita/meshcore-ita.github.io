<!--meta
{
  "slug": "percorso-awesome-meshcore",
  "title": "Da dove partire tra le 470 risorse di awesome-meshcore",
  "description": "Un percorso in italiano tra le risorse di awesome-meshcore: app, strumenti per repeater, pianificazione RF, librerie, firmware alternativi e lo stato reale della cifratura.",
  "h1": "Da dove partire tra le 470 risorse di awesome-meshcore",
  "lede": "L'elenco ha superato le 470 voci. Abbiamo scelto quelle che servono davvero, divise per quello che vuoi fare: usare un nodo, gestire un repeater, pianificare una tratta o scrivere codice.",
  "published": "2026-10-06",
  "tags": ["risorse", "software"]
}
-->
## Perché un percorso

Quando abbiamo [presentato awesome-meshcore](../awesome-meshcore/) le voci
erano 160. Oggi sono più di 470. Un elenco così lungo risponde bene alla
domanda «esiste uno strumento per X?», ma non aiuta chi non sa ancora quale
sia la X.

Qui sotto trovi una selezione divisa per profilo. Per ogni progetto abbiamo
controllato che il repository sia vivo: salvo dove indicato, tutti hanno
ricevuto commit nelle ultime settimane. Le stelle GitHub sono quelle di
oggi, 6 ottobre 2026, e servono solo a dare un'idea della diffusione.

## Hai appena comprato un nodo

Prima di tutto la nostra [guida](../../guida/) e il
[preset radio italiano](../../preset-radio/): senza il preset giusto il nodo
funziona, ma non sente nessuno.

Per il firmware basta il [web flasher ufficiale](https://flasher.meshcore.io/),
dal browser. Per le app:

- l'**app ufficiale** è gratuita ma closed source, su Android, iOS e nel
  browser su [app.meshcore.nz](https://app.meshcore.nz/). È quella che
  descriviamo nella pagina [MeshCore ogni giorno](../../app/);
- [MeshCore Open](https://github.com/zjs81/meshcore-open) è l'alternativa
  open source più diffusa (licenza MIT, circa 630 stelle): un client Flutter
  per Android, iOS e desktop;
- su iPhone, iPad e Mac c'è anche
  [MeshCore One](https://github.com/Avi0n/MeshCoreOne), nativo in Swift e
  sotto GPL-3.0.

Se preferisci un video,
[*How to get started with MeshCore*](https://www.youtube.com/watch?v=t1qne8uJBAc)
di Andy Kirby fa vedere tutto il primo setup. È in inglese: i parametri
radio, da noi, vanno presi dalla pagina del preset.

## Gestisci un repeater

Per la configurazione via USB c'è lo strumento ufficiale
[config.meshcore.io](https://config.meshcore.io/), che evita di scrivere a
mano i comandi della [CLI](../../comandi/). Per aggiornare un repeater senza
salire sul tetto, la [guida OTA di Mraanderson](https://github.com/Mraanderson/meshcore-ota)
spiega passo per passo l'aggiornamento via Bluetooth di repeater e room
server.

Quando il repeater è davvero irraggiungibile c'è
[Drone MeshCore Updater](https://github.com/recrof/drone_meshcore_updater):
un firmware Zephyr per le schede Seeed XIAO che si porta il pacchetto di
aggiornamento fino al repeater, in volo su un drone o a piedi, e lo flasha
via BLE DFU. È un progetto giovane, ma risolve un problema che chi ha un
nodo su un traliccio conosce bene.

Per vedere cosa passa davvero sulla rete servono un osservatore e una
dashboard:

- [CoreScope](https://github.com/Kpa-clawbot/CoreScope) (GPL-3.0) riceve i
  pacchetti via MQTT e mostra mappa, chat dei canali, replay e statistiche
  per nodo;
- [MeshMonitor](https://meshmonitor.org/) (BSD-3-Clause, circa 680 stelle) è
  una dashboard self-hosted che segue sia MeshCore sia Meshtastic;
- [Mesh Health Check](https://github.com/yellowcooln/meshcore-health-check)
  manda messaggi di prova e misura quanti osservatori MQTT li ricevono: è il
  modo più diretto per capire se un messaggio arriva davvero, invece di
  fidarsi della mappa.

A proposito di mappa: la [Internet Map](https://map.meshcore.io/) mostra
solo i nodi che qualcuno ha caricato, non la copertura. Ne parliamo nella
pagina sulla [mappa pubblica](../../mappa-copertura/).

## Vuoi pianificare una tratta

La teoria è nella pagina su [portata e link budget](../../link-budget/). Per
i calcoli sul terreno vero:

- [MeshKit](https://meshkit.app/) lavora nel browser: profilo del terreno,
  linea di vista e zona di Fresnel fra due punti;
- [Mesh Community Planner](https://github.com/PapaSierra555/MeshCommunityPlanner)
  è un'applicazione desktop che, oltre alla propagazione, aiuta a scegliere
  l'hardware e produce la distinta dei materiali. L'ultimo commit è di
  giugno;
- [MeshBench](https://github.com/MeshBench/meshbench) è il più ambizioso:
  simula una rete facendo girare il firmware vero su un canale LoRa
  simulato a livello di campione, con il terreno reale. È nuovo e ha ancora
  pochi utenti, ma è l'unico che risponde alla domanda «cosa succede alla
  rete se aggiungo questo repeater?».

Prima di toccare la configurazione delle region, leggi
[*Why regions?*](https://kiekr.app/why-regions) di KiekR: in poche righe
spiega perché, con il limite di duty cycle europeo, una rete grande senza
region si satura.

## Scrivi codice

Le tre basi ufficiali, tutte sotto licenza MIT e mantenute dal progetto:

- [meshcore_py](https://github.com/meshcore-dev/meshcore_py), i binding
  Python su seriale, BLE e TCP;
- [meshcore.js](https://github.com/meshcore-dev/meshcore.js), la libreria
  JavaScript;
- [meshcore-cli](https://github.com/meshcore-dev/meshcore-cli), la riga di
  comando, utile anche solo per fare script.

Sopra queste ci sono l'integrazione ufficiale per
[Home Assistant](https://github.com/meshcore-dev/meshcore-ha), installabile
da HACS, e decine di bot e bridge. Uno è anche veneto:
[MeshBBS](https://github.com/atomozero/MeshBBS) di Andrea Bernardi, una BBS
con bacheche pubbliche e messaggi privati raggiungibile via MeshCore.

Per studiare il protocollo:
[meshcore-decoder](https://github.com/michaelhart/meshcore-decoder)
decodifica i pacchetti in TypeScript, il
[dissector per Wireshark](https://github.com/aaronb/wireshark-meshcore) li
mostra come qualsiasi altro protocollo di rete, e
[meshcore_sim](https://github.com/matthewdgreen/meshcore_sim) simula la
logica di instradamento del firmware. Questi tre sono fermi da marzo: vanno
bene per capire, meno per seguire le ultime versioni.

## Cerchi un firmware diverso

L'elenco ha più di 40 fork. Tre esempi di direzioni molto diverse:

- [MeshCore Low-Power](https://github.com/dt267/MeshCore-Low-Power-Firmware)
  per Heltec V3 e V4: sonno profondo e BLE, USB e Wi-Fi nella stessa immagine,
  pensato per più giorni lontano da una presa;
- [Wadamesh](https://github.com/ALLFATHER-BV/wadamesh), interfaccia touch per
  T-Deck e Heltec V4 TFT;
- [ZephCore](https://github.com/liquidraver/ZephCore), che riscrive MeshCore
  da Arduino al sistema operativo Zephyr e supporta già i chip LoRa di nuova
  generazione di cui abbiamo parlato nell'articolo
  [sull'hardware mesh](../hardware-mesh-nel-passato/).

Un fork non è il firmware ufficiale: quando qualcosa non va, la prima
domanda nel gruppo sarà «succede anche con il firmware ufficiale?». Per i
repeater sulla rete italiana consigliamo il firmware ufficiale.

## Una nota sulla cifratura

Fra le risorse c'è anche una issue del repository ufficiale, la
[#259](https://github.com/meshcore-dev/MeshCore/issues/259), aperta e con
oltre 90 commenti. Vale la pena conoscerla.

Nella nostra [FAQ](../../faq/) scriviamo che i messaggi sono cifrati con
AES-128, ed è vero. Il codice del firmware però mostra due dettagli che la
FAQ non dice: AES è usato in **modalità ECB**, cioè blocco per blocco, e
l'autenticazione HMAC-SHA256 è troncata a **2 byte**. In ECB due blocchi di
testo uguali producono blocchi cifrati uguali, e un MAC di 2 byte protegge
poco contro chi prova a modificare i pacchetti. Nella issue si discute una
versione 2 della cifratura che sostituisca questa.

In pratica: MeshCore va benissimo per comunicare quando manca la rete, ma
non è uno strumento per proteggere segreti. I canali pubblici e quelli con
un nome tipo hashtag hanno chiavi note o ricavabili, e chiunque le conosca
può leggerli. Per i messaggi diretti il contenuto resta privato rispetto ai
repeater, ma non con le garanzie di un'app come Signal.

## Manca qualcosa?

L'elenco cresce con le segnalazioni. Apri una issue o una pull request sul
[repository](https://github.com/meshcore-ita/awesome-meshcore), oppure
scrivici nel gruppo Telegram [MeshCore ITA](https://t.me/meshcore_ita).
