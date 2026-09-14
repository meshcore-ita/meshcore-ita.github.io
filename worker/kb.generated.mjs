// File generato automaticamente da build.mjs — NON modificare a mano.
// Per rigenerare: node build.mjs
//
// Frammenti (sezioni <h2>/<h3> e domande FAQ) delle pagine content/*.html,
// usati da worker/worker.mjs come base di conoscenza aggiuntiva per le
// risposte generate dal modello AI del bot Telegram.
export const KB_CHUNKS = [
  {
    "id": "guida--cosa-serve",
    "page": "Guida",
    "title": "Cosa serve",
    "url": "https://meshcore-ita.github.io/guida/#cosa-serve",
    "text": "Per configurare il primo nodo MeshCore servono tre cose: una board LoRa compatibile, un cavo USB dati funzionante (non solo di ricarica) e uno smartphone o un computer con un browser aggiornato. Non serve installare nessuna toolchain: il flash del firmware si fa interamente dal browser tramite il web flasher ufficiale. Questa guida copre l'intero percorso, dalla scelta della board al primo scambio di messaggi sulla mesh italiana. In circa mezz'ora, dal primo collegamento USB al primo messaggio ricevuto, puoi avere un nodo companion funzionante e allineato alla mesh italiana; se scegli di configurare anche un repeater o un room server, i passaggi iniziali di flash e accoppiamento restano gli…"
  },
  {
    "id": "guida--dal-firmware-al-primo-advert",
    "page": "Guida",
    "title": "Dal firmware al primo advert",
    "url": "https://meshcore-ita.github.io/guida/#dal-firmware-al-primo-advert",
    "text": "Otto passaggi, in ordine, per portare un nodo nuovo sulla mesh italiana."
  },
  {
    "id": "guida--scegli-la-board",
    "page": "Guida",
    "title": "Scegli la board",
    "url": "https://meshcore-ita.github.io/guida/#scegli-la-board",
    "text": "Procurati una board LoRa supportata. Per una panoramica completa dei modelli e delle differenze tra chip ESP32 e nRF52 consulta la guida hardware alle board LoRa compatibili con MeshCore ; l'elenco sempre aggiornato delle board supportate è comunque sul web flasher."
  },
  {
    "id": "guida--flasha-il-firmware-companion",
    "page": "Guida",
    "title": "Flasha il firmware Companion",
    "url": "https://meshcore-ita.github.io/guida/#flasha-il-firmware-companion",
    "text": "Collega la board al computer via USB e apri flasher.meshcore.io ↗ da un browser basato su Chromium (richiede WebSerial). Seleziona la board dall'elenco e installa il firmware Companion. Su Linux, se il flasher non vede la porta seriale, è quasi sempre un problema di permessi: dai i permessi con sudo setfacl -m u:$USER:rw /dev/ttyUSB0 (adatta il device path al tuo caso, ad esempio /dev/ttyACM0 ) e ricarica la pagina. Se il problema persiste, consulta la pagina soluzioni ai problemi più comuni di MeshCore ."
  },
  {
    "id": "guida--installa-l-app-o-usa-il-client-web",
    "page": "Guida",
    "title": "Installa l'app o usa il client web",
    "url": "https://meshcore-ita.github.io/guida/#installa-l-app-o-usa-il-client-web",
    "text": "Su Android o iOS installa l'app MeshCore dallo store del tuo dispositivo. In alternativa, senza installare nulla, puoi usare il client web su app.meshcore.nz ↗ , che funziona anche da computer collegando il nodo via USB."
  },
  {
    "id": "guida--accoppia-il-nodo",
    "page": "Guida",
    "title": "Accoppia il nodo",
    "url": "https://meshcore-ita.github.io/guida/#accoppia-il-nodo",
    "text": "Dall'app cerca il nodo via Bluetooth (companion BLE) e accoppialo inserendo il PIN di default 123456 . Se preferisci non usare il Bluetooth, o se il firmware installato è la variante \"USB-only\", collega il nodo via cavo USB: sia l'app mobile sia il client web supportano la connessione seriale."
  },
  {
    "id": "guida--imposta-il-preset-radio-italiano",
    "page": "Guida",
    "title": "Imposta il preset radio italiano",
    "url": "https://meshcore-ita.github.io/guida/#imposta-il-preset-radio-italiano",
    "text": "Dal client, entra nelle impostazioni radio e scegli il preset EU/UK (Narrow) , che corrisponde a 869.618 MHz · BW 62.5 kHz · SF8 · CR8 . Da riga di comando, via seriale o da un client admin, lo stesso risultato si ottiene con set radio 869.618,62.5,8,8 seguito da reboot . Tutti i dettagli, incluso perché il vecchio preset è deprecato, sono nella pagina dedicata al preset radio italiano per MeshCore ."
  },
  {
    "id": "guida--scegli-il-nome-del-nodo",
    "page": "Guida",
    "title": "Scegli il nome del nodo",
    "url": "https://meshcore-ita.github.io/guida/#scegli-il-nome-del-nodo",
    "text": "Assegna un nome riconoscibile: la convenzione usata dalla community italiana è IT-<citta>-NN per un companion, IT-<citta>-RPT-NN per un repeater e IT-<citta>-ROOM-NN per un room server (esempio: IT-TORINO-RPT-01 ). Da riga di comando si imposta con set name <nome> ; l'elenco completo dei comandi disponibili è nella pagina comandi CLI per amministrare un nodo MeshCore ."
  },
  {
    "id": "guida--invia-il-primo-advert-e-verifica-i-contatti",
    "page": "Guida",
    "title": "Invia il primo advert e verifica i contatti",
    "url": "https://meshcore-ita.github.io/guida/#invia-il-primo-advert-e-verifica-i-contatti",
    "text": "Dopo aver riavviato il nodo con il nuovo preset, invia un advert (dal client, o via CLI con il comando advert ) e chiedi a un altro membro della community di verificare che il tuo nodo compaia tra i suoi contatti. Se non succede, il problema quasi sempre è un preset radio non allineato: la pagina soluzioni ai problemi più comuni di MeshCore copre anche questo caso."
  },
  {
    "id": "guida--presentati-nel-gruppo-telegram",
    "page": "Guida",
    "title": "Presentati nel gruppo Telegram",
    "url": "https://meshcore-ita.github.io/guida/#presentati-nel-gruppo-telegram",
    "text": "Unisciti al gruppo Telegram MeshCore ITA ↗ , pubblico e senza bisogno di invito, e presenta il tuo nodo nel topic dedicato ai nuovi membri o in quello della tua regione. Per dubbi non coperti da questa guida, la pagina domande frequenti su MeshCore in italiano raccoglie le domande più comuni della community. Dopo il primo nodo"
  },
  {
    "id": "guida--companion-repeater-o-room-server",
    "page": "Guida",
    "title": "Companion, repeater o room server?",
    "url": "https://meshcore-ita.github.io/guida/#companion-repeater-o-room-server",
    "text": "Il ruolo di un nodo dipende solo da come lo configuri, non dall'hardware."
  },
  {
    "id": "guida--companion",
    "page": "Guida",
    "title": "Companion",
    "url": "https://meshcore-ita.github.io/guida/#companion",
    "text": "Il client collegato via BLE o USB tramite app mobile o interfaccia web, quello configurato in questa guida. Non ripete i pacchetti degli altri nodi: serve per leggere e inviare messaggi, ed è il ruolo giusto per iniziare finché non hai familiarità con la mesh e con il preset radio condiviso."
  },
  {
    "id": "guida--repeater-e-room-server",
    "page": "Guida",
    "title": "Repeater e room server",
    "url": "https://meshcore-ita.github.io/guida/#repeater-e-room-server",
    "text": "Un repeater estende la copertura della mesh inoltrando i pacchetti sui percorsi appresi dal routing ibrido; un room server conserva fino a 32 messaggi non letti per utente, come una bacheca in stile BBS. Entrambi i ruoli danno il meglio se restano sempre accesi e raggiungibili, con lo stesso preset radio e lo stesso firmware aggiornato del resto della mesh."
  },
  {
    "id": "preset-radio--il-preset-radio-e-obbligatorio-per-usare-meshcore-in-italia",
    "page": "Preset radio",
    "title": "Il preset radio è obbligatorio per usare MeshCore in Italia?",
    "url": "https://meshcore-ita.github.io/preset-radio/#il-preset-radio-e-obbligatorio-per-usare-meshcore-in-italia",
    "text": "Non è obbligatorio dal punto di vista tecnico: puoi impostare qualsiasi frequenza e parametri consentiti dalla normativa. È però fortemente raccomandato, perché è l'unico modo per sentire e farsi sentire dagli altri nodi della mesh italiana: due nodi con preset diversi semplicemente non si vedono."
  },
  {
    "id": "preset-radio--perche-il-vecchio-preset-869-525-mhz-e-deprecato",
    "page": "Preset radio",
    "title": "Perché il vecchio preset 869.525 MHz è deprecato?",
    "url": "https://meshcore-ita.github.io/preset-radio/#perche-il-vecchio-preset-869-525-mhz-e-deprecato",
    "text": "Il vecchio preset EU/UK (869.525 MHz, SF11, BW 250 kHz, CR5) è oggi etichettato come Deprecato nell'elenco ufficiale dei preset del client MeshCore. La community internazionale è passata a un preset narrow, con banda più stretta e spreading factor più basso, per una migliore interoperabilità: per l'Italia il preset attuale è 869.618 MHz, BW 62.5 kHz, SF8, CR8, corrispondente a EU/UK (Narrow) nel client."
  },
  {
    "id": "preset-radio--cosa-succede-se-resto-sul-preset-vecchio",
    "page": "Preset radio",
    "title": "Cosa succede se resto sul preset vecchio?",
    "url": "https://meshcore-ita.github.io/preset-radio/#cosa-succede-se-resto-sul-preset-vecchio",
    "text": "Un nodo rimasto sul preset deprecato non riceve né trasmette pacchetti verso i nodi allineati al preset attuale: frequenza, banda, spreading factor e coding rate devono coincidere esattamente perché due radio LoRa si sentano. Il nodo resta isolato dalla mesh italiana finché non viene riallineato."
  },
  {
    "id": "preset-radio--serve-una-licenza-radioamatoriale-per-usare-questo-preset",
    "page": "Preset radio",
    "title": "Serve una licenza radioamatoriale per usare questo preset?",
    "url": "https://meshcore-ita.github.io/preset-radio/#serve-una-licenza-radioamatoriale-per-usare-questo-preset",
    "text": "No. Entro i limiti di potenza, ERP e duty cycle della sub-banda 869.4-869.65 MHz previsti da ETSI EN 300 220 e dal Piano Nazionale di Ripartizione delle Frequenze, l'uso è libero e non richiede licenza. La responsabilità del rispetto di questi limiti resta comunque dell'operatore del nodo."
  },
  {
    "id": "preset-radio--i-parametri-condivisi-dalla-community-italiana",
    "page": "Preset radio",
    "title": "I parametri condivisi dalla community italiana",
    "url": "https://meshcore-ita.github.io/preset-radio/#i-parametri-condivisi-dalla-community-italiana",
    "text": "Una radio LoRa sente solo un'altra radio impostata esattamente sugli stessi parametri: frequenza, banda, spreading factor e coding rate devono coincidere. Preset radio EU/Italia — EU/UK (Narrow) Parametro Valore Note Frequenza 869.618 MHz Banda occupata 869.587–869.649 MHz Bandwidth 62.5 kHz — Spreading Factor SF8 — Coding Rate CR8 — Potenza max 500 mW ERP Entro la sub-banda 869.4–869.65 MHz Duty cycle 10% Max 6 minuti di trasmissione per ora Nel client MeshCore (app o web) questo insieme di parametri corrisponde al preset EU/UK (Narrow) nella lista dei preset disponibili. Configurazione"
  },
  {
    "id": "preset-radio--come-impostarlo",
    "page": "Preset radio",
    "title": "Come impostarlo",
    "url": "https://meshcore-ita.github.io/preset-radio/#come-impostarlo",
    "text": "Il modo più diretto è da riga di comando, via USB seriale o da un client MeshCore autenticato come admin su repeater e room server: Comandi CLI Comando Cosa fa set radio 869.618,62.5,8,8 Imposta frequenza, banda, SF e CR in un colpo solo. Richiede reboot per applicarsi. get radio Legge i parametri radio correnti, per verificare che il preset sia stato applicato. Nell'app mobile Android/iOS e nel client web su app.meshcore.nz ↗ lo stesso risultato si ottiene dal menu delle impostazioni radio del nodo, scegliendo il preset EU/UK (Narrow) dall'elenco predefinito, senza dover digitare i singoli parametri. Dopo qualsiasi modifica radio il nodo va riavviato prima di riprovare a comunicare con la…"
  },
  {
    "id": "preset-radio--il-vecchio-preset-e-deprecato",
    "page": "Preset radio",
    "title": "Il vecchio preset è deprecato",
    "url": "https://meshcore-ita.github.io/preset-radio/#il-vecchio-preset-e-deprecato",
    "text": "Il preset precedente — 869.525 MHz , SF11 , BW 250 kHz , CR5 — è oggi etichettato come Deprecato nell'elenco ufficiale dei preset del client MeshCore. La community internazionale è passata a un preset \"narrow\", con banda più stretta e spreading factor più basso, per migliorare l'interoperabilità tra reti nazionali diverse. Chi resta sul preset vecchio non è in errore di configurazione in senso stretto, ma è semplicemente su una frequenza e con parametri che nessun altro nodo italiano ascolta più: frequenza, banda, SF e CR devono coincidere esattamente perché due radio LoRa si sentano, quindi un nodo disallineato resta isolato dalla mesh anche se acceso e funzionante. Se hai un nodo…"
  },
  {
    "id": "preset-radio--cosa-significano-frequenza-banda-sf-e-cr",
    "page": "Preset radio",
    "title": "Cosa significano frequenza, banda, SF e CR",
    "url": "https://meshcore-ita.github.io/preset-radio/#cosa-significano-frequenza-banda-sf-e-cr",
    "text": "Ogni parametro sposta l'equilibrio tra portata, robustezza del segnale e velocità di trasmissione."
  },
  {
    "id": "preset-radio--frequenza-e-banda-bandwidth",
    "page": "Preset radio",
    "title": "Frequenza e banda (bandwidth)",
    "url": "https://meshcore-ita.github.io/preset-radio/#frequenza-e-banda-bandwidth",
    "text": "La frequenza (869.618 MHz) è il canale su cui i nodi trasmettono e ricevono. La banda (62.5 kHz) è l'ampiezza dello spettro occupato attorno a quella frequenza: una banda più stretta concentra l'energia del segnale, aumentando la sensibilità in ricezione a scapito della velocità dati."
  },
  {
    "id": "preset-radio--spreading-factor-sf",
    "page": "Preset radio",
    "title": "Spreading Factor (SF)",
    "url": "https://meshcore-ita.github.io/preset-radio/#spreading-factor-sf",
    "text": "Determina quanto ogni bit viene \"diffuso\" nel tempo. Uno spreading factor più alto (es. SF11 del preset vecchio) aumenta la portata e la resistenza al rumore, ma allunga il tempo di trasmissione di ogni pacchetto. SF8, usato nel preset attuale, è un compromesso più veloce, adatto a mesh dense con più nodi che condividono lo stesso canale."
  },
  {
    "id": "preset-radio--coding-rate-cr",
    "page": "Preset radio",
    "title": "Coding Rate (CR)",
    "url": "https://meshcore-ita.github.io/preset-radio/#coding-rate-cr",
    "text": "Aggiunge ridondanza al pacchetto per correggere errori di trasmissione dovuti a interferenze o rumore. Un coding rate più alto protegge meglio il pacchetto ma aumenta l'airtime, cioè il tempo che il pacchetto occupa sul canale radio."
  },
  {
    "id": "preset-radio--il-compromesso-airtime-portata",
    "page": "Preset radio",
    "title": "Il compromesso airtime/portata",
    "url": "https://meshcore-ita.github.io/preset-radio/#il-compromesso-airtime-portata",
    "text": "Parametri che favoriscono la portata (SF alto, banda stretta, CR alto) allungano l'airtime di ogni pacchetto, riducendo quanti pacchetti la mesh può scambiare per unità di tempo entro i limiti di duty cycle. Il preset condiviso dalla community è la scelta di compromesso ritenuta migliore per l'uso tipico in Italia: cambiarlo unilateralmente isola il tuo nodo dal resto della rete. Quadro normativo"
  },
  {
    "id": "preset-radio--limiti-di-potenza-e-duty-cycle",
    "page": "Preset radio",
    "title": "Limiti di potenza e duty cycle",
    "url": "https://meshcore-ita.github.io/preset-radio/#limiti-di-potenza-e-duty-cycle",
    "text": "Il preset condiviso opera nella sub-banda 869.4–869.65 MHz , dove la normativa europea (ETSI EN 300 220) e il Piano Nazionale di Ripartizione delle Frequenze consentono l'uso libero, senza licenza, entro precisi limiti: potenza massima 500 mW ERP e duty cycle del 10% , cioè al massimo 6 minuti di trasmissione ogni ora per ogni dispositivo. Questi limiti sono già rispettati dai parametri di default consigliati dalla community, ma restano comunque responsabilità di chi configura e gestisce il nodo, in particolare se si aumenta la potenza di trasmissione oltre i valori di default con il comando set tx . Per i termini tecnici usati in questa pagina — advert, path-discovery, room server e altri…"
  },
  {
    "id": "hardware--una-scelta-ampia-tutta-a-basso-costo",
    "page": "Hardware",
    "title": "Una scelta ampia, tutta a basso costo",
    "url": "https://meshcore-ita.github.io/hardware/#una-scelta-ampia-tutta-a-basso-costo",
    "text": "MeshCore gira su firmware Arduino/PlatformIO open source, portato su due famiglie di chip: ESP32 e nRF52. La scelta della board dipende dall'uso che vuoi farne, non da vincoli del protocollo. Non esiste una board \"ufficiale\" per MeshCore: il firmware Companion, Repeater e Room Server è compilato per decine di dispositivi LoRa diversi, dalle economiche Heltec ESP32 ai moduli nRF52840 a basso consumo di RAK e Seeed. Questa pagina confronta le board che la community italiana usa più spesso, indicate anche nella guida passo passo per configurare un nodo MeshCore . Qualunque board tu scelga, dopo il primo flash dovrai comunque allinearti al preset radio italiano per MeshCore perché il tuo nodo…"
  },
  {
    "id": "hardware--le-board",
    "page": "Hardware",
    "title": "Le board",
    "url": "https://meshcore-ita.github.io/hardware/#le-board",
    "text": "Board LoRa supportate dal firmware MeshCore Board Chip BLE / USB Uso tipico Heltec V3 ESP32-S3 BLE, USB, Wi-Fi Companion o repeater, buon punto di partenza Heltec T114 nRF52840 BLE, USB Repeater da tavolo (con display) o companion Heltec T190 ESP32-S3 BLE, USB Companion con display o repeater LilyGO T-Deck ESP32-S3 BLE, USB Companion portatile, con tastiera e schermo LilyGO T-Beam ESP32 BLE, USB Companion o repeater, con GPS integrato LilyGO T3S3 ESP32-S3 BLE, USB Repeater compatto o companion RAK4631 / WisBlock nRF52840 BLE, USB (Ethernet opzionale) Repeater o room server per installazioni permanenti Seeed XIAO nRF52840 + Wio-SX1262 nRF52840 BLE, USB Companion o repeater a basso consumo,…"
  },
  {
    "id": "hardware--esp32-o-nrf52840",
    "page": "Hardware",
    "title": "ESP32 o nRF52840?",
    "url": "https://meshcore-ita.github.io/hardware/#esp32-o-nrf52840",
    "text": "La differenza principale non è la copertura radio, ma il consumo energetico e cosa il chip fa quando il nodo non sta trasmettendo."
  },
  {
    "id": "hardware--consumo-e-autonomia",
    "page": "Hardware",
    "title": "Consumo e autonomia",
    "url": "https://meshcore-ita.github.io/hardware/#consumo-e-autonomia",
    "text": "I chip nRF52840 (Heltec T114, RAK4631, Seeed XIAO) consumano molto meno in idle rispetto a un ESP32, e sono la scelta più comune per un repeater a batteria o pannello solare. Sulle board ESP32 il comando powersaving on aiuta a ridurre il consumo mettendo il nodo in sospensione tra una trasmissione e l'altra, ma resta comunque più alto di un nRF52 equivalente."
  },
  {
    "id": "hardware--connettivita-e-display",
    "page": "Hardware",
    "title": "Connettività e display",
    "url": "https://meshcore-ita.github.io/hardware/#connettivita-e-display",
    "text": "Tutte le board di questa lista supportano sia BLE sia USB per il firmware Companion, e alcune (Heltec V3, Station G2) anche il Wi-Fi per l'app companion o l'aggiornamento OTA. Le board con display integrato (Heltec T114, T190, LilyGO T-Beam, T3S3) mostrano stato radio e contatti senza bisogno di un client collegato; il Seeed XIAO nRF52840 non ha display ed è pensato per installazioni headless. Installazione"
  },
  {
    "id": "hardware--antenne-e-connettori",
    "page": "Hardware",
    "title": "Antenne e connettori",
    "url": "https://meshcore-ita.github.io/hardware/#antenne-e-connettori",
    "text": "La maggior parte delle board monta un connettore SMA o U.FL/IPEX per l'antenna LoRa in sub-banda 868 MHz. Un'antenna esterna correttamente accordata sulla banda 869 MHz incide sulla portata più della potenza di trasmissione: prima di aumentare il tx conviene verificare che l'antenna in dotazione sia adatta all'uso outdoor previsto."
  },
  {
    "id": "hardware--alimentazione-e-installazione-outdoor",
    "page": "Hardware",
    "title": "Alimentazione e installazione outdoor",
    "url": "https://meshcore-ita.github.io/hardware/#alimentazione-e-installazione-outdoor",
    "text": "Per un repeater fisso, l'alimentazione tipica è un pannello solare con batteria tampone (LiPo o LiFePO4) collegato alle board nRF52 a basso consumo, oppure alimentazione a rete per installazioni indoor stabili. In esterno serve sempre una custodia con grado di protezione adeguato: né le board né le antenne standard sono impermeabili di fabbrica. Dove comprare"
  },
  {
    "id": "hardware--reperire-l-hardware-in-italia",
    "page": "Hardware",
    "title": "Reperire l'hardware in Italia",
    "url": "https://meshcore-ita.github.io/hardware/#reperire-l-hardware-in-italia",
    "text": "Le board elencate in questa pagina sono prodotti generici, non legati a MeshCore: si trovano tramite i normali canali di vendita di elettronica e componentistica, sia su marketplace internazionali sia tramite rivenditori italiani di elettronica per hobbisti. Non esistono negozi o distributori ufficiali della community MeshCore ITA, e la community non gestisce né consiglia link affiliati: verifica sempre che il venditore indichi chiaramente il modello esatto (ad esempio \"Heltec WiFi LoRa 32 V3\" e non semplicemente \"Heltec LoRa\") prima di acquistare, perché board con nomi simili possono montare chip o moduli radio diversi. Dopo l'acquisto"
  },
  {
    "id": "hardware--prossimi-passi",
    "page": "Hardware",
    "title": "Prossimi passi",
    "url": "https://meshcore-ita.github.io/hardware/#prossimi-passi",
    "text": "Una volta scelta e ricevuta la board, il percorso di configurazione è lo stesso per tutti i modelli: flash del firmware Companion, accoppiamento e impostazione del preset radio, descritti passo passo nella guida passo passo per configurare un nodo MeshCore . Se hai dubbi su comandi specifici per repeater e room server, ad esempio per attivare powersaving o regolare la potenza TX, la pagina comandi CLI per amministrare un nodo MeshCore li elenca tutti. In caso di problemi di flash o accoppiamento, la pagina soluzioni ai problemi più comuni di MeshCore copre i casi più frequenti segnalati dalla community, e il glossario dei termini MeshCore spiega i termini tecnici usati in questa pagina come…"
  },
  {
    "id": "comandi--come-raggiungere-la-console-del-nodo",
    "page": "Comandi",
    "title": "Come raggiungere la console del nodo",
    "url": "https://meshcore-ita.github.io/comandi/#come-raggiungere-la-console-del-nodo",
    "text": "Ogni repeater e room server MeshCore espone una console di comandi testuali, raggiungibile in due modi. Il primo è via USB seriale: colleghi il nodo al computer con un cavo dati (non solo di ricarica) e apri una console seriale, ad esempio il web flasher ufficiale dal browser oppure picocom da terminale su Linux. Questo metodo funziona anche prima di aver mai configurato il nodo, perché non richiede una rete mesh già funzionante. Il secondo è da remoto, tramite un client MeshCore (app o web) già autenticato come amministratore sul nodo target: utile per un repeater o un room server già installato in un punto alto o difficile da raggiungere fisicamente. In entrambi i casi serve la password…"
  },
  {
    "id": "comandi--nome-e-password-amministrativa",
    "page": "Comandi",
    "title": "Nome e password amministrativa",
    "url": "https://meshcore-ita.github.io/comandi/#nome-e-password-amministrativa",
    "text": "Identità e nome nodo Comando Effetto set name <nome> Cambia il nome del nodo mostrato negli advert e nei contatti degli altri nodi. password <nuova-password> Cambia la password amministrativa della console (default password ). Esempio per un repeater a Torino, seguendo la convenzione di naming della community: set name IT-Torino-RPT-01 . Dopo un cambio nome è buona norma inviare subito un nuovo advert (vedi sotto) così che i nodi vicini aggiornino il contatto. Per la password, scegline una che non condividi con altri servizi: la console non offre un modo per leggerla in chiaro, solo per sovrascriverla. Radio"
  },
  {
    "id": "comandi--preset-potenza-e-diagnostica-radio",
    "page": "Comandi",
    "title": "Preset, potenza e diagnostica radio",
    "url": "https://meshcore-ita.github.io/comandi/#preset-potenza-e-diagnostica-radio",
    "text": "Configurazione e diagnostica radio Comando Effetto get radio / set radio <freq>,<bw>,<sf>,<cr> Legge o imposta frequenza, banda, spreading factor e coding rate in un solo comando. Richiede reboot per applicarsi. get freq / set freq <MHz> Legge o cambia la sola frequenza, senza toccare banda, SF o CR. get tx / set tx <dbm> Legge o imposta la potenza di trasmissione in dBm (1–22). set lat <lat> / set lon <lon> Imposta la posizione GPS del nodo, usata per la mappa pubblica e per l'advert. advert Invia subito un advert flood, senza aspettare l'intervallo periodico. set flood.advert.interval <ore> Cambia l'intervallo dell'advert flood periodico (default 12 ore). set repeat <on|off> Attiva o…"
  },
  {
    "id": "comandi--risparmio-energetico-e-stato-del-nodo",
    "page": "Comandi",
    "title": "Risparmio energetico e stato del nodo",
    "url": "https://meshcore-ita.github.io/comandi/#risparmio-energetico-e-stato-del-nodo",
    "text": "Alimentazione e risparmio Comando Effetto powersaving <on|off> Attiva o disattiva il risparmio energetico: il nodo dorme tra una trasmissione e l'altra. stats-core Mostra stato batteria, uptime e coda messaggi del nodo. Su un repeater alimentato a batteria o pannello solare, powersaving on è spesso la prima leva da usare se l'autonomia non basta, insieme a una potenza TX ( set tx ) non più alta del necessario per la copertura richiesta. Se la batteria si scarica comunque troppo in fretta, stats-core aiuta a capire se il problema è di consumo o se il nodo si sta riavviando in loop: la pagina soluzioni ai problemi più comuni di MeshCore copre anche questo caso insieme ad altri sintomi…"
  },
  {
    "id": "comandi--sincronizzazione-dell-ora",
    "page": "Comandi",
    "title": "Sincronizzazione dell'ora",
    "url": "https://meshcore-ita.github.io/comandi/#sincronizzazione-dell-ora",
    "text": "Orologio Comando Effetto time <epoch> Imposta manualmente l'orologio del nodo, utile su board senza GPS o senza fix. clock sync Sincronizza l'orologio del nodo con quello del dispositivo collegato (companion o client admin). Un orologio sbagliato è una delle cause più comuni per cui un nodo sembra \"sparito\": gli advert non risultano validi e il nodo smette di comparire come recente nei contatti altrui. Su una board con GPS (ad esempio LilyGO T-Beam o T-Deck) il fix corregge l'ora da solo appena disponibile; su una board senza GPS, o finché il fix non arriva, usa clock sync da un client collegato oppure imposta l'epoch manualmente con time <epoch> via seriale. Amministrazione e OTA"
  },
  {
    "id": "comandi--riavvio-e-aggiornamento-firmware",
    "page": "Comandi",
    "title": "Riavvio e aggiornamento firmware",
    "url": "https://meshcore-ita.github.io/comandi/#riavvio-e-aggiornamento-firmware",
    "text": "Amministrazione e OTA Comando Effetto reboot Riavvia il nodo: necessario dopo aver cambiato parametri radio o nome. start ota Avvia l'aggiornamento firmware via OTA (Wi-Fi su ESP32, DFU su nRF52). Su board ESP32 come Heltec V3, start ota apre un hotspot Wi-Fi chiamato \"MeshCore OTA\": ti colleghi a quell'hotspot dal telefono o dal computer e vai su 192.168.4.1/update per caricare il nuovo firmware. Su board nRF52 (RAK4631, Heltec T114, Seeed XIAO) lo stesso comando prepara il nodo, ma il caricamento avviene con l'app nRF DFU dello smartphone. In entrambi i casi non scollegare l'alimentazione del nodo durante il trasferimento: un OTA interrotto a metà può lasciare il nodo in uno stato da…"
  },
  {
    "id": "problemi--il-metodo-veloce-in-tre-passaggi",
    "page": "Problemi",
    "title": "Il metodo veloce, in tre passaggi",
    "url": "https://meshcore-ita.github.io/problemi/#il-metodo-veloce-in-tre-passaggi",
    "text": "Prima di cercare il caso specifico, verifica questi tre punti: da soli risolvono la maggior parte delle segnalazioni."
  },
  {
    "id": "problemi--controlla-il-preset-radio",
    "page": "Problemi",
    "title": "Controlla il preset radio",
    "url": "https://meshcore-ita.github.io/problemi/#controlla-il-preset-radio",
    "text": "Il motivo più comune per cui due nodi non si sentono è un preset diverso. Lancia get radio da un client admin e confronta il risultato con il preset radio condiviso per l'Italia : deve restituire 869.618,62.5,8,8 ."
  },
  {
    "id": "problemi--controlla-l-orologio",
    "page": "Problemi",
    "title": "Controlla l'orologio",
    "url": "https://meshcore-ita.github.io/problemi/#controlla-l-orologio",
    "text": "Molti nodi \"invisibili\" hanno semplicemente l'ora sbagliata. Sincronizza con clock sync da un client admin, oppure imposta l'epoch manualmente con time <epoch> via seriale."
  },
  {
    "id": "problemi--controlla-i-permessi-usb-solo-linux",
    "page": "Problemi",
    "title": "Controlla i permessi USB (solo Linux)",
    "url": "https://meshcore-ita.github.io/problemi/#controlla-i-permessi-usb-solo-linux",
    "text": "Se il web flasher non vede la board, quasi sempre è un problema di permessi sulla porta seriale: il caso dedicato più sotto spiega il comando esatto da usare. Troubleshooting"
  },
  {
    "id": "problemi--nove-casi-comuni-diagnosi-causa-soluzione",
    "page": "Problemi",
    "title": "Nove casi comuni: diagnosi, causa, soluzione",
    "url": "https://meshcore-ita.github.io/problemi/#nove-casi-comuni-diagnosi-causa-soluzione",
    "text": "Ogni caso segue lo stesso schema: cosa osservi, perché succede, come risolverlo."
  },
  {
    "id": "problemi--il-nodo-non-compare-in-app",
    "page": "Problemi",
    "title": "Il nodo non compare in app",
    "url": "https://meshcore-ita.github.io/problemi/#il-nodo-non-compare-in-app",
    "text": "Diagnosi: il nodo è acceso e nel raggio radio ma non compare nella lista contatti o discover del client. Causa: quasi sempre un problema di orologio: su un T-Deck può mancare il fix GPS o il baud rate GPS è sbagliato, oppure il nodo remoto ha l'ora sbagliata e i suoi advert vengono scartati. Soluzione: da un client admin lancia clock sync per sincronizzare l'orologio del nodo collegato, oppure imposta l'ora manualmente con time <epoch> via seriale; poi lancia advert per forzare un nuovo annuncio."
  },
  {
    "id": "problemi--il-bluetooth-ble-non-si-accoppia",
    "page": "Problemi",
    "title": "Il Bluetooth (BLE) non si accoppia",
    "url": "https://meshcore-ita.github.io/problemi/#il-bluetooth-ble-non-si-accoppia",
    "text": "Diagnosi: il client MeshCore non trova il nodo tra i dispositivi Bluetooth disponibili, oppure il pairing fallisce. Causa: sul nodo è stato flashato il firmware Companion USB-only invece di Companion BLE: solo un companion accetta connessioni Bluetooth, un repeater o un room server non ne aprono mai una. Soluzione: verifica con il web flasher di aver installato il firmware Companion BLE corretto per la tua board; il PIN di pairing di default è 123456 ."
  },
  {
    "id": "problemi--il-web-flasher-non-vede-la-board-linux",
    "page": "Problemi",
    "title": "Il web flasher non vede la board (Linux)",
    "url": "https://meshcore-ita.github.io/problemi/#il-web-flasher-non-vede-la-board-linux",
    "text": "Diagnosi: il browser mostra un errore del tipo “Failed to open serial port” quando provi a collegarti alla board dal web flasher. Causa: su Linux l'utente non ha i permessi di lettura e scrittura sulla porta seriale USB assegnata alla board. Soluzione: assegna i permessi con sudo setfacl -m u:$USER:rw /dev/ttyUSB0 (adatta il device path, ad esempio /dev/ttyACM0 per una board nRF), poi ricarica la pagina del web flasher e riprova la connessione."
  },
  {
    "id": "problemi--nessun-nodo-e-raggiungibile",
    "page": "Problemi",
    "title": "Nessun nodo è raggiungibile",
    "url": "https://meshcore-ita.github.io/problemi/#nessun-nodo-e-raggiungibile",
    "text": "Diagnosi: il nodo trasmette regolarmente ma non riesce a sentire né a farsi sentire da nessun altro nodo della mesh. Causa: il preset radio — frequenza, banda, spreading factor o coding rate — non corrisponde a quello del resto della mesh: due nodi su preset diversi non comunicano, anche se vicini. Soluzione: controlla il preset attuale con get radio e riallinealo con set radio 869.618,62.5,8,8 , poi riavvia con reboot ."
  },
  {
    "id": "problemi--la-batteria-dura-poco",
    "page": "Problemi",
    "title": "La batteria dura poco",
    "url": "https://meshcore-ita.github.io/problemi/#la-batteria-dura-poco",
    "text": "Diagnosi: un repeater alimentato a batteria si scarica molto più rapidamente del previsto. Causa: il risparmio energetico non è attivo, oppure la potenza di trasmissione è impostata più alta del necessario per la copertura richiesta. Soluzione: attiva il risparmio energetico con powersaving on — il nodo dorme tra una trasmissione e l'altra — e riduci la potenza TX con set tx <dbm> (intervallo 1–22 dBm); controlla il valore attuale con get tx ."
  },
  {
    "id": "problemi--il-firmware-va-aggiornato-via-ota-dfu",
    "page": "Problemi",
    "title": "Il firmware va aggiornato via OTA/DFU",
    "url": "https://meshcore-ita.github.io/problemi/#il-firmware-va-aggiornato-via-ota-dfu",
    "text": "Diagnosi: la board è già installata in un punto scomodo da raggiungere via USB e serve aggiornare il firmware da remoto. Causa: gli aggiornamenti via cavo richiedono accesso fisico alla board a ogni versione. Soluzione: su ESP32 lancia start ota dal client admin, collegati all'hotspot Wi-Fi “MeshCore OTA” e vai su 192.168.4.1/update ; su board nRF (RAK, T114, Seeed XIAO) usa start ota insieme all'app nRF DFU sullo smartphone."
  },
  {
    "id": "problemi--il-bluetooth-si-disconnette-in-continuazione-heltec-v3",
    "page": "Problemi",
    "title": "Il Bluetooth si disconnette in continuazione (Heltec V3)",
    "url": "https://meshcore-ita.github.io/problemi/#il-bluetooth-si-disconnette-in-continuazione-heltec-v3",
    "text": "Diagnosi: il collegamento BLE tra companion e app cade spesso, anche a pochi metri di distanza. Causa: su Heltec V3 l'antenna Bluetooth/Wi-Fi integrata è una piccola bobina sul circuito stampato, con portata di pochi metri. Soluzione: resta vicino al nodo durante l'uso; in alternativa, chi ha dimestichezza con la saldatura può sostituire l'antenna a bobina con un filo di circa 31 mm per migliorare la portata BLE — è una modifica hardware da valutare con cautela."
  },
  {
    "id": "problemi--il-repeater-sembra-sordo-non-sente-piu-i-nodi-vicini",
    "page": "Problemi",
    "title": "Il repeater sembra sordo, non sente più i nodi vicini",
    "url": "https://meshcore-ita.github.io/problemi/#il-repeater-sembra-sordo-non-sente-piu-i-nodi-vicini",
    "text": "Diagnosi: un repeater che prima funzionava smette di sentire nodi che dovrebbero essere in portata, pur restando acceso e configurato correttamente. Causa: può trattarsi dell'AGC (Automatic Gain Control) del chip radio SX1262, che può bloccarsi in presenza di forti interferenze vicine alla frequenza usata. Soluzione: imposta un reset periodico dell'AGC con set agc.reset.interval <numero> — il valore è in secondi, in multipli di 4; set agc.reset.interval 4 è un buon punto di partenza."
  },
  {
    "id": "problemi--il-dispositivo-sembra-corrotto-o-bloccato",
    "page": "Problemi",
    "title": "Il dispositivo sembra corrotto o bloccato",
    "url": "https://meshcore-ita.github.io/problemi/#il-dispositivo-sembra-corrotto-o-bloccato",
    "text": "Diagnosi: il nodo non risponde più correttamente o non entra più in funzionamento normale. Causa: una configurazione o un firmware corrotti, spesso dopo un aggiornamento interrotto. Soluzione: se riesci a collegarti dall'app, esporta le impostazioni, esegui un factory reset e poi reimportale dopo aver ripristinato il pairing Bluetooth; se non riesci a collegarti, usa il web flasher per entrare in modalità DFU, esegui “Erase Flash” e poi reinstalla il firmware con “Flash!”. Dalla versione firmware 1.7.0, le board con pulsante utente (alcune RAK, T114) hanno anche una modalità di recovery: tienilo premuto entro 8 secondi dall'accensione per accedere alla console del web flasher. Serve altro…"
  },
  {
    "id": "problemi--se-il-problema-persiste",
    "page": "Problemi",
    "title": "Se il problema persiste",
    "url": "https://meshcore-ita.github.io/problemi/#se-il-problema-persiste",
    "text": "Non tutti i problemi rientrano in uno schema fisso: a volte serve ispezionare lo stato del nodo o confrontarsi con chi ha già affrontato lo stesso caso. Il riferimento completo dei comandi CLI ti permette di ispezionare lo stato del nodo con stats-radio (noise floor, RSSI/SNR, airtime) e neighbors (vicini diretti uditi di recente). Le domande frequenti su MeshCore coprono altri dubbi comuni su portata, preset e mappa pubblica, mentre la pagina hardware elenca le board supportate se il problema dipende dal modello specifico che usi. Chi arriva da altri sistemi mesh può trovare utile il confronto in MeshCore vs Meshtastic per capire le differenze di routing prima di aprire una segnalazione.…"
  },
  {
    "id": "faq--quanto-costa-iniziare-con-meshcore",
    "page": "FAQ",
    "title": "Quanto costa iniziare con MeshCore?",
    "url": "https://meshcore-ita.github.io/faq/#quanto-costa-iniziare-con-meshcore",
    "text": "Il firmware MeshCore è gratuito e open source con licenza MIT: nessun costo di licenza o abbonamento. Il costo iniziale è solo quello dell'hardware — una board LoRa economica come la Heltec V3 basta per iniziare come companion, mentre una seconda board dedicata serve per un repeater che estenda la copertura. GPS o schermo (T-Beam, T-Deck) fanno salire il prezzo della singola board, ma non sono necessari per comunicare. Elenco completo delle board nella pagina hardware ."
  },
  {
    "id": "faq--che-differenza-c-e-tra-i-ruoli-companion-repeater-room-server-e-sensor",
    "page": "FAQ",
    "title": "Che differenza c'è tra i ruoli companion, repeater, room server e sensor?",
    "url": "https://meshcore-ita.github.io/faq/#che-differenza-c-e-tra-i-ruoli-companion-repeater-room-server-e-sensor",
    "text": "Sono i quattro ruoli che un nodo MeshCore può assumere, a seconda del firmware flashato. Un companion è un client via BLE o USB con app mobile o interfaccia web, e non ripete mai i pacchetti altrui. Un repeater estende la copertura inoltrando i pacchetti sui percorsi appresi dal routing ibrido. Un room server funziona come una bacheca in stile BBS, con fino a 32 messaggi non letti conservati per ogni utente. Un sensor trasmette telemetria o payload personalizzati sulla mesh. Per configurare ciascun ruolo vedi la pagina comandi CLI per repeater e room server ."
  },
  {
    "id": "faq--serve-una-licenza-radio-per-usare-meshcore-in-italia",
    "page": "FAQ",
    "title": "Serve una licenza radio per usare MeshCore in Italia?",
    "url": "https://meshcore-ita.github.io/faq/#serve-una-licenza-radio-per-usare-meshcore-in-italia",
    "text": "No, l'uso è libero senza licenza, a condizione di restare entro i limiti di potenza, ERP e duty cycle della sub-banda 869.4–869.65 MHz. Questi limiti sono definiti dalla norma ETSI EN 300 220 e dal Piano Nazionale di Ripartizione delle Frequenze italiano. La responsabilità di rispettare questi limiti resta comunque dell'operatore del singolo nodo, non della community."
  },
  {
    "id": "faq--quanta-portata-reale-ha-un-nodo-meshcore",
    "page": "FAQ",
    "title": "Quanta portata reale ha un nodo MeshCore?",
    "url": "https://meshcore-ita.github.io/faq/#quanta-portata-reale-ha-un-nodo-meshcore",
    "text": "Non esiste un numero di copertura garantito: la portata reale dipende da diversi fattori concomitanti. L'orografia del terreno e la presenza di ostacoli — edifici, vegetazione, colline — contano più della distanza in linea d'aria, e l'altezza dell'antenna sopra gli ostacoli locali è spesso il fattore singolo più determinante, soprattutto per un repeater in quota. La potenza di trasmissione (comando set tx , tipicamente 1–22 dBm) e i parametri del preset radio (spreading factor e coding rate) influiscono sulla sensibilità del collegamento, a scapito della velocità di trasmissione. Per questo ogni installazione va valutata sul campo, non stimata a tavolino."
  },
  {
    "id": "faq--serve-una-connessione-internet-per-usare-meshcore",
    "page": "FAQ",
    "title": "Serve una connessione internet per usare MeshCore?",
    "url": "https://meshcore-ita.github.io/faq/#serve-una-connessione-internet-per-usare-meshcore",
    "text": "No: MeshCore funziona interamente via radio LoRa, senza SIM, senza Wi-Fi e senza infrastruttura centrale — è pensato esplicitamente per la comunicazione off-grid. L'unico uso opzionale di internet è caricare il proprio nodo sulla mappa pubblica o consultarla da un browser: sono funzioni accessorie, non necessarie per inviare e ricevere messaggi sulla mesh."
  },
  {
    "id": "faq--che-differenza-c-e-tra-meshcore-e-meshtastic",
    "page": "FAQ",
    "title": "Che differenza c'è tra MeshCore e Meshtastic?",
    "url": "https://meshcore-ita.github.io/faq/#che-differenza-c-e-tra-meshcore-e-meshtastic",
    "text": "MeshCore usa un routing ibrido: gli advert e i messaggi di canale viaggiano in flood, mentre i messaggi privati sfruttano un path-discovery che scopre e poi riutilizza un percorso diretto tra mittente e destinatario. Un client MeshCore non ripete mai il traffico degli altri nodi: solo repeater e room server lo fanno, il che riduce il traffico ripetuto e il consumo energetico dei client. Per un confronto tecnico completo vedi la pagina MeshCore vs Meshtastic ."
  },
  {
    "id": "faq--come-sono-protetti-i-messaggi-su-meshcore",
    "page": "FAQ",
    "title": "Come sono protetti i messaggi su MeshCore?",
    "url": "https://meshcore-ita.github.io/faq/#come-sono-protetti-i-messaggi-su-meshcore",
    "text": "Ogni nodo ha un'identità basata su una coppia di chiavi Ed25519, usata per firmare gli advert ed evitare lo spoofing. Le chiavi condivise tra due nodi che comunicano vengono derivate con uno scambio ECDH su curva X25519, e i messaggi vengono cifrati simmetricamente con AES-128. In pratica i contenuti restano privati anche quando un pacchetto viene ripetuto da un repeater, che non ne conosce il contenuto in chiaro."
  },
  {
    "id": "faq--quanti-hop-puo-percorrere-un-messaggio-su-meshcore",
    "page": "FAQ",
    "title": "Quanti hop può percorrere un messaggio su MeshCore?",
    "url": "https://meshcore-ita.github.io/faq/#quanti-hop-puo-percorrere-un-messaggio-su-meshcore",
    "text": "Il firmware impone un limite interno di 64 hop per pacchetto. In condizioni reali è raro avvicinarsi a questo limite: orografia, densità di repeater e tempi di trasmissione rendono già significativo un percorso di pochi hop. Il limite esiste come tetto di sicurezza del protocollo, non come obiettivo da raggiungere."
  },
  {
    "id": "faq--ogni-quanto-un-nodo-manda-il-proprio-advert",
    "page": "FAQ",
    "title": "Ogni quanto un nodo manda il proprio advert?",
    "url": "https://meshcore-ita.github.io/faq/#ogni-quanto-un-nodo-manda-il-proprio-advert",
    "text": "Un repeater manda un advert flood ogni 12 ore per impostazione predefinita, un intervallo regolabile con il comando set flood.advert.interval <ore> . Un companion, invece, si annuncia solo quando l'utente lo richiede esplicitamente dall'app o dal client web: non c'è un annuncio periodico automatico lato client."
  },
  {
    "id": "faq--il-preset-radio-e-obbligatorio",
    "page": "FAQ",
    "title": "Il preset radio è obbligatorio?",
    "url": "https://meshcore-ita.github.io/faq/#il-preset-radio-e-obbligatorio",
    "text": "Non è obbligatorio in senso tecnico — un nodo MeshCore può funzionare su qualunque combinazione di frequenza, banda, SF e CR entro i limiti normativi — ma è fortemente raccomandato per la community italiana. Un preset condiviso è ciò che permette a nodi diversi di sentirsi tra loro: due nodi su preset differenti semplicemente non comunicano, anche se vicini. Per i dettagli vedi la pagina dedicata al preset radio italiano ."
  },
  {
    "id": "faq--perche-il-preset-radio-e-cambiato",
    "page": "FAQ",
    "title": "Perché il preset radio è cambiato?",
    "url": "https://meshcore-ita.github.io/faq/#perche-il-preset-radio-e-cambiato",
    "text": "Il vecchio preset EU/UK (869.525 MHz · SF11 · BW 250 kHz · CR5) è oggi etichettato come Deprecato nell'elenco ufficiale dei preset del client MeshCore. La community internazionale è passata a preset “narrow”, a banda più stretta e SF più basso, per una migliore interoperabilità. In Italia il preset attuale è 869.618 MHz · BW 62.5 kHz · SF8 · CR8, corrispondente a EU/UK (Narrow): i nodi rimasti sul vecchio preset non sentono più la rete e vanno riallineati con set radio 869.618,62.5,8,8 ."
  },
  {
    "id": "faq--posso-lasciare-un-nodo-acceso-h24",
    "page": "FAQ",
    "title": "Posso lasciare un nodo acceso H24?",
    "url": "https://meshcore-ita.github.io/faq/#posso-lasciare-un-nodo-acceso-h24",
    "text": "Sì, ed è anzi consigliato per repeater e room server: sono utili alla mesh solo se restano sempre accesi e raggiungibili dagli altri nodi. Va comunque rispettato il limite di duty cycle della banda usata — 10%, massimo 6 minuti di trasmissione per ora — che riguarda il tempo di trasmissione e non il tempo di accensione del dispositivo."
  },
  {
    "id": "faq--come-entro-nel-gruppo-telegram",
    "page": "FAQ",
    "title": "Come entro nel gruppo Telegram?",
    "url": "https://meshcore-ita.github.io/faq/#come-entro-nel-gruppo-telegram",
    "text": "Il gruppo Telegram MeshCore ITA è pubblico e aperto a chiunque, senza bisogno di un invito: basta aprire t.me/meshcore_ita ↗ . Il gruppo è organizzato in topic tematici e in un topic per ogni regione italiana, dove si discutono installazioni e copertura locale."
  },
  {
    "id": "faq--come-aggiorno-il-firmware",
    "page": "FAQ",
    "title": "Come aggiorno il firmware?",
    "url": "https://meshcore-ita.github.io/faq/#come-aggiorno-il-firmware",
    "text": "Il metodo dipende dal chip della board. Su ESP32 (es. Heltec V3) usa il web flasher via USB, oppure aggiorna via OTA lanciando start ota dal client admin e collegandoti all'hotspot Wi-Fi “MeshCore OTA” su 192.168.4.1/update . Su board nRF (RAK4631, Heltec T114, Seeed XIAO) usa start ota insieme all'app nRF DFU sullo smartphone. Il bin “non-merged” mantiene l'abbinamento Bluetooth esistente; il “merged” lo azzera ma mantiene nome, chiavi e preset salvati. Se qualcosa va storto, la pagina sulla risoluzione dei problemi copre i casi più comuni."
  },
  {
    "id": "faq--il-mio-nodo-e-visibile-sulla-mappa-pubblica",
    "page": "FAQ",
    "title": "Il mio nodo è visibile sulla mappa pubblica?",
    "url": "https://meshcore-ita.github.io/faq/#il-mio-nodo-e-visibile-sulla-mappa-pubblica",
    "text": "Non automaticamente: devi caricarlo tu. Per un companion, apri l'app MeshCore, vai su “Internet Map” e scegli “Add me to the Map”. Per un repeater o room server, aprilo dalla lista contatti, tocca “Share” e poi “Upload to Internet Map”. Una volta caricato, il nodo è consultabile sulla mappa pubblica su map.meshcore.io."
  },
  {
    "id": "faq--iniziare-con-meshcore",
    "page": "FAQ",
    "title": "Iniziare con MeshCore",
    "url": "https://meshcore-ita.github.io/faq/#iniziare-con-meshcore",
    "text": "Le domande più comuni di chi si avvicina per la prima volta alla rete. Sotto il cofano"
  },
  {
    "id": "faq--rete-e-sicurezza",
    "page": "FAQ",
    "title": "Rete e sicurezza",
    "url": "https://meshcore-ita.github.io/faq/#rete-e-sicurezza",
    "text": "Come funziona il routing, la cifratura e il preset radio condiviso. Uso quotidiano"
  },
  {
    "id": "faq--uso-quotidiano",
    "page": "FAQ",
    "title": "Uso quotidiano",
    "url": "https://meshcore-ita.github.io/faq/#uso-quotidiano",
    "text": "Gruppo, mappa pubblica e aggiornamenti firmware."
  },
  {
    "id": "meshcore-vs-meshtastic--meshcore-e-meshtastic-sono-compatibili-tra-loro",
    "page": "Confronti",
    "title": "MeshCore e Meshtastic sono compatibili tra loro?",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#meshcore-e-meshtastic-sono-compatibili-tra-loro",
    "text": "No. Anche se entrambi usano radio LoRa, i protocolli, il formato dei pacchetti e le chiavi di cifratura sono diversi e incompatibili: un nodo MeshCore e un nodo Meshtastic non si sentono, anche sulla stessa frequenza e con lo stesso hardware."
  },
  {
    "id": "meshcore-vs-meshtastic--posso-usare-lo-stesso-hardware-per-entrambe-le-reti",
    "page": "Confronti",
    "title": "Posso usare lo stesso hardware per entrambe le reti?",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#posso-usare-lo-stesso-hardware-per-entrambe-le-reti",
    "text": "Sì, ma non nello stesso momento: board come Heltec V3 o RAK4631 sono supportate da entrambi i firmware, quindi puoi dedicare una board a MeshCore e un'altra a Meshtastic, oppure riflashare la stessa board passando da un progetto all'altro."
  },
  {
    "id": "meshcore-vs-meshtastic--qual-e-la-differenza-principale-nel-modo-in-cui-instradano-i-messaggi",
    "page": "Confronti",
    "title": "Qual è la differenza principale nel modo in cui instradano i messaggi?",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#qual-e-la-differenza-principale-nel-modo-in-cui-instradano-i-messaggi",
    "text": "MeshCore separa nettamente flood (per advert e canali) e routing diretto scoperto via path-discovery (per i messaggi privati), con i soli repeater a ripetere il traffico. Meshtastic gestisce tutto con un unico meccanismo di managed flooding con backoff basato sull'SNR, a cui dalla versione 2.6 si affianca un next-hop routing per i messaggi diretti."
  },
  {
    "id": "meshcore-vs-meshtastic--due-filosofie-di-routing-diverse",
    "page": "Confronti",
    "title": "Due filosofie di routing diverse",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#due-filosofie-di-routing-diverse",
    "text": "Entrambi i sistemi risolvono lo stesso problema — far arrivare un messaggio su una rete LoRa senza infrastruttura — ma con meccanismi diversi. In MeshCore gli advert e i messaggi di canale viaggiano sempre in flood: un repeater li ritrasmette a chiunque sia in ascolto, con un annuncio periodico predefinito ogni 12 ore (regolabile con set flood.advert.interval <ore> ). I messaggi privati, invece, usano un meccanismo diverso: il primo invio raggiunge il destinatario in flood, ma la conferma di consegna che torna al mittente porta con sé l'elenco dei repeater attraversati. Da quel momento il mittente incorpora quel percorso nei pacchetti successivi, e solo i repeater che corrispondono al…"
  },
  {
    "id": "meshcore-vs-meshtastic--meshcore-vs-meshtastic-punto-per-punto",
    "page": "Confronti",
    "title": "MeshCore vs Meshtastic, punto per punto",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#meshcore-vs-meshtastic-punto-per-punto",
    "text": "Le differenze tecniche principali, senza dichiarare un vincitore assoluto: dipende dall'uso. Routing, ruoli e licenza a confronto Parametro MeshCore Meshtastic Chi ripete i pacchetti Solo repeater e room server; i client (companion) non ripetono mai Ogni nodo può ritrasmettere fino al limite di hop, con priorità maggiore per i ruoli Router/Repeater Messaggi diretti Path-discovery: il primo invio usa il flood, la conferma di consegna stabilisce il percorso diretto da riusare Dalla v2.6, next-hop routing: il flood iniziale stabilisce un nodo di inoltro successivo, con fallback al flood se il percorso smette di rispondere Traffico broadcast (canali/annunci) Sempre in flood, gestito dai…"
  },
  {
    "id": "meshcore-vs-meshtastic--ruoli-e-hardware-condiviso",
    "page": "Confronti",
    "title": "Ruoli e hardware condiviso",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#ruoli-e-hardware-condiviso",
    "text": "Il concetto di \"ruolo\" esiste in entrambi i progetti, ma è applicato in modo diverso."
  },
  {
    "id": "meshcore-vs-meshtastic--ruoli-in-meshcore",
    "page": "Confronti",
    "title": "Ruoli in MeshCore",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#ruoli-in-meshcore",
    "text": "Un nodo assume uno di quattro ruoli scelti al momento del flash del firmware: companion (client BLE/USB, non ripete), repeater (estende la copertura), room server (bacheca stile BBS con fino a 32 messaggi non letti per utente) o sensor (telemetria). Per la configurazione di ciascuno vedi la pagina comandi CLI per repeater e room server ."
  },
  {
    "id": "meshcore-vs-meshtastic--ruoli-in-meshtastic",
    "page": "Confronti",
    "title": "Ruoli in Meshtastic",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#ruoli-in-meshtastic",
    "text": "Meshtastic assegna un ruolo software a ogni nodo (tra cui Client, Router e Repeater) che ne modifica il comportamento nel flooding: i ruoli Router e Repeater hanno priorità più alta nel ritrasmettere un pacchetto anche se hanno già sentito un'altra ritrasmissione, mentre un Client segue il normale backoff basato sull'SNR. Sul piano dell'hardware, i due ecosistemi si sovrappongono molto: entrambi girano su board LoRa economiche e diffuse come Heltec V3, RAK4631/WisBlock o LilyGO T-Beam. Questo non significa che le reti siano compatibili tra loro: un nodo va flashato con il firmware dell'uno o dell'altro progetto, non con entrambi contemporaneamente, e le due mesh non si sentono anche sulla…"
  },
  {
    "id": "meshcore-vs-meshtastic--meshcore-o-meshtastic-dipende-dall-uso",
    "page": "Confronti",
    "title": "MeshCore o Meshtastic: dipende dall'uso",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#meshcore-o-meshtastic-dipende-dall-uso",
    "text": "Nessuna delle due reti è oggettivamente \"migliore\": rispondono bene a esigenze diverse."
  },
  {
    "id": "meshcore-vs-meshtastic--meshcore-e-indicato-quando",
    "page": "Confronti",
    "title": "MeshCore è indicato quando…",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#meshcore-e-indicato-quando",
    "text": "Comunichi spesso in messaggi diretti con un gruppo di contatti noti e vuoi che l'airtime della rete si concentri sui percorsi effettivamente usati, con pochi repeater dedicati a fare da infrastruttura e client che restano leggeri sul traffico condiviso."
  },
  {
    "id": "meshcore-vs-meshtastic--meshtastic-e-indicato-quando",
    "page": "Confronti",
    "title": "Meshtastic è indicato quando…",
    "url": "https://meshcore-ita.github.io/meshcore-vs-meshtastic/#meshtastic-e-indicato-quando",
    "text": "Vuoi che ogni nodo del gruppo veda automaticamente posizione e stato di tutti gli altri via broadcast periodico, con un ecosistema maturo di moduli e integrazioni costruito nel tempo dalla community Meshtastic. Chi arriva da MeshCore e vuole approfondire i primi passi pratici può partire dalla guida a MeshCore passo passo , mentre chi ha già un nodo configurato ma non riesce a farlo comunicare con il resto della mesh italiana dovrebbe controllare il preset radio condiviso per l'Italia . Le domande più comuni su costi, portata e sicurezza sono raccolte nella pagina FAQ MeshCore . Domande frequenti"
  },
  {
    "id": "glossario--radio-e-lora",
    "page": "Glossario",
    "title": "Radio e LoRa",
    "url": "https://meshcore-ita.github.io/glossario/#radio-e-lora",
    "text": "I termini che descrivono come MeshCore trasmette fisicamente sull'aria."
  },
  {
    "id": "glossario--lora",
    "page": "Glossario",
    "title": "LoRa",
    "url": "https://meshcore-ita.github.io/glossario/#lora",
    "text": "Modulazione radio a spettro allargato (chirp spread spectrum) su cui si basa la trasmissione fisica di MeshCore. Permette portate lunghe con potenze basse, a scapito della velocità di trasmissione."
  },
  {
    "id": "glossario--lorawan",
    "page": "Glossario",
    "title": "LoRaWAN",
    "url": "https://meshcore-ita.github.io/glossario/#lorawan",
    "text": "Protocollo di rete a stella costruito sopra LoRa, con gateway e server centrali a cui i dispositivi si collegano. È un'architettura diversa da MeshCore, che è invece una mesh peer-to-peer senza gateway obbligatorio né backend internet."
  },
  {
    "id": "glossario--frequenza-e-banda-bandwidth",
    "page": "Glossario",
    "title": "Frequenza e banda (bandwidth)",
    "url": "https://meshcore-ita.github.io/glossario/#frequenza-e-banda-bandwidth",
    "text": "La frequenza è il canale su cui opera un nodo; il preset condiviso dalla community italiana usa 869.618 MHz. La banda è la larghezza di spettro occupata da ogni trasmissione, 62.5 kHz nello stesso preset. Tutti i dettagli sono nella pagina dedicata al preset radio italiano per MeshCore ."
  },
  {
    "id": "glossario--spreading-factor-sf-e-coding-rate-cr",
    "page": "Glossario",
    "title": "Spreading Factor (SF) e Coding Rate (CR)",
    "url": "https://meshcore-ita.github.io/glossario/#spreading-factor-sf-e-coding-rate-cr",
    "text": "Lo spreading factor allunga o accorcia la durata di ogni simbolo radio, scambiando portata con velocità e airtime: più alto è l'SF, più lontano arriva il segnale ma più a lungo occupa il canale. Il coding rate aggiunge ridondanza per la correzione d'errore. Il preset italiano usa SF8 e CR8."
  },
  {
    "id": "glossario--erp-e-duty-cycle",
    "page": "Glossario",
    "title": "ERP e duty cycle",
    "url": "https://meshcore-ita.github.io/glossario/#erp-e-duty-cycle",
    "text": "L'ERP è la potenza radiata effettiva dall'antenna: nella sotto-banda usata in Italia il limite è 500 mW ERP. Il duty cycle è la percentuale di tempo per cui un nodo può trasmettere in un'ora: il limite di banda è il 10%, cioè al massimo 6 minuti di trasmissione ogni ora."
  },
  {
    "id": "glossario--rssi-snr-e-airtime",
    "page": "Glossario",
    "title": "RSSI, SNR e airtime",
    "url": "https://meshcore-ita.github.io/glossario/#rssi-snr-e-airtime",
    "text": "L'RSSI misura la potenza del segnale ricevuto in dBm; l'SNR misura quanto quel segnale sia pulito rispetto al rumore di fondo. L'airtime è il tempo effettivo che il radio passa in trasmissione, il valore che conta ai fini del duty cycle. Entrambi RSSI e SNR dell'ultimo pacchetto ricevuto, insieme all'airtime, si leggono su un repeater con il comando stats-radio , descritto nella pagina dei comandi CLI per amministrare un nodo MeshCore ."
  },
  {
    "id": "glossario--antenna-guadagno-e-ros-swr",
    "page": "Glossario",
    "title": "Antenna, guadagno e ROS/SWR",
    "url": "https://meshcore-ita.github.io/glossario/#antenna-guadagno-e-ros-swr",
    "text": "L'antenna irradia e riceve il segnale: la sua altezza e posizione contano spesso più della potenza di trasmissione. Il guadagno, in dBi, indica quanto un'antenna concentra l'energia in una direzione. Il ROS (o SWR) misura quanto bene antenna e cavo siano adattati al radio: valori alti indicano energia riflessa e sprecata, e nel tempo possono danneggiare lo stadio di uscita. Terminologia"
  },
  {
    "id": "glossario--rete-mesh-e-ruoli-dei-nodi",
    "page": "Glossario",
    "title": "Rete mesh e ruoli dei nodi",
    "url": "https://meshcore-ita.github.io/glossario/#rete-mesh-e-ruoli-dei-nodi",
    "text": "Come i pacchetti si muovono tra i nodi e quali ruoli può assumere un dispositivo MeshCore."
  },
  {
    "id": "glossario--mesh-flood-e-path-discovery",
    "page": "Glossario",
    "title": "Mesh, flood e path discovery",
    "url": "https://meshcore-ita.github.io/glossario/#mesh-flood-e-path-discovery",
    "text": "La mesh è la topologia in cui i nodi si scambiano e ripetono pacchetti tra loro senza infrastruttura centrale. Il flood è la modalità con cui un pacchetto viene ritrasmesso verso tutti i vicini, usata da MeshCore per advert e messaggi di canale. Il path discovery è invece il meccanismo con cui MeshCore scopre un percorso diretto tra due nodi per i messaggi privati, evitando di inondare l'intera rete."
  },
  {
    "id": "glossario--hop-e-advert",
    "page": "Glossario",
    "title": "Hop e advert",
    "url": "https://meshcore-ita.github.io/glossario/#hop-e-advert",
    "text": "Un hop è ogni passaggio di un pacchetto attraverso un repeater: MeshCore applica un limite interno di 64 hop. L'advert è il pacchetto periodico con cui un nodo annuncia la propria presenza e identità, inviato di default ogni 12 ore o subito con il comando advert ."
  },
  {
    "id": "glossario--nodo-repeater-room-server-companion-sensor",
    "page": "Glossario",
    "title": "Nodo, repeater, room server, companion, sensor",
    "url": "https://meshcore-ita.github.io/glossario/#nodo-repeater-room-server-companion-sensor",
    "text": "Nodo è il termine generico per qualsiasi dispositivo che esegue il firmware MeshCore. Un repeater estende la copertura inoltrando i pacchetti sui percorsi appresi. Un room server funziona come una bacheca condivisa, conservando fino a 32 messaggi non letti per ogni utente. Un companion è collegato via BLE o USB a un'app o a un client web e non ripete i pacchetti altrui. Un sensor trasmette telemetria o payload personalizzati sulla mesh. I dettagli su hardware e configurazione di ciascun ruolo sono nella guida passo passo a MeshCore in italiano ."
  },
  {
    "id": "glossario--mappa-pubblica",
    "page": "Glossario",
    "title": "Mappa pubblica",
    "url": "https://meshcore-ita.github.io/glossario/#mappa-pubblica",
    "text": "La mappa pubblica, consultabile su map.meshcore.io, mostra i nodi che i loro proprietari hanno scelto volontariamente di condividere. Terminologia"
  },
  {
    "id": "glossario--sicurezza-e-crittografia",
    "page": "Glossario",
    "title": "Sicurezza e crittografia",
    "url": "https://meshcore-ita.github.io/glossario/#sicurezza-e-crittografia",
    "text": "Come MeshCore protegge identità e contenuto dei messaggi senza un server centrale."
  },
  {
    "id": "glossario--ed25519-e-chiave-pubblica",
    "page": "Glossario",
    "title": "Ed25519 e chiave pubblica",
    "url": "https://meshcore-ita.github.io/glossario/#ed25519-e-chiave-pubblica",
    "text": "Ed25519 è la curva ellittica usata da MeshCore per l'identità e la firma di ogni nodo. La chiave pubblica che ne deriva è l'identificativo crittografico del nodo, condiviso per stabilire fiducia e instradare i messaggi verso il destinatario corretto."
  },
  {
    "id": "glossario--x25519-ecdh-e-aes-128",
    "page": "Glossario",
    "title": "X25519 / ECDH e AES-128",
    "url": "https://meshcore-ita.github.io/glossario/#x25519-ecdh-e-aes-128",
    "text": "X25519 (ECDH su curva ellittica) è lo scambio di chiavi con cui due nodi derivano una chiave condivisa senza mai trasmetterla in chiaro. Quella chiave viene poi usata con AES-128 per cifrare il contenuto dei messaggi, che restano privati anche senza rete internet o cellulare."
  },
  {
    "id": "glossario--pin-di-pairing",
    "page": "Glossario",
    "title": "PIN di pairing",
    "url": "https://meshcore-ita.github.io/glossario/#pin-di-pairing",
    "text": "Il PIN di pairing è il codice numerico richiesto per accoppiare via Bluetooth un nodo companion; il valore di default è 123456 . Se l'accoppiamento fallisce, la pagina soluzioni ai problemi più comuni di MeshCore elenca le cause più frequenti. Terminologia"
  },
  {
    "id": "glossario--firmware-e-aggiornamenti",
    "page": "Glossario",
    "title": "Firmware e aggiornamenti",
    "url": "https://meshcore-ita.github.io/glossario/#firmware-e-aggiornamenti",
    "text": "I termini che incontri flashando o aggiornando un nodo."
  },
  {
    "id": "glossario--web-flasher",
    "page": "Glossario",
    "title": "Web flasher",
    "url": "https://meshcore-ita.github.io/glossario/#web-flasher",
    "text": "Lo strumento ufficiale nel browser, su flasher.meshcore.io, per installare il firmware MeshCore via USB senza bisogno di toolchain locali."
  },
  {
    "id": "glossario--ota-e-dfu",
    "page": "Glossario",
    "title": "OTA e DFU",
    "url": "https://meshcore-ita.github.io/glossario/#ota-e-dfu",
    "text": "OTA è l'aggiornamento firmware over-the-air, avviato con il comando start ota : su board ESP32 apre un hotspot Wi-Fi dedicato, su board nRF52 prepara il nodo per il DFU (Device Firmware Update), completato tramite l'app nRF DFU dello smartphone."
  },
  {
    "id": "glossario--bin-merged-non-merged",
    "page": "Glossario",
    "title": "Bin merged / non-merged",
    "url": "https://meshcore-ita.github.io/glossario/#bin-merged-non-merged",
    "text": "Due varianti del firmware compilato per l'aggiornamento: il bin merged azzera l'abbinamento Bluetooth esistente ma mantiene nome, chiavi e preset radio salvati; il bin non-merged mantiene invece il pairing Bluetooth già stabilito. La procedura completa, comando per comando, è nella pagina dei comandi CLI per amministrare un nodo MeshCore ; per il confronto con altri sistemi mesh vedi la pagina MeshCore a confronto con Meshtastic ."
  },
  {
    "id": "community--una-community-indipendente-aperta-e-documentata",
    "page": "Community",
    "title": "Una community indipendente, aperta e documentata",
    "url": "https://meshcore-ita.github.io/community/#una-community-indipendente-aperta-e-documentata",
    "text": "MeshCore ITA esiste per dare a chi usa MeshCore in Italia un punto di riferimento in italiano, verificato e aperto a tutti. MeshCore ITA è una community indipendente: non è affiliata al progetto upstream MeshCore né lo rappresenta ufficialmente. MeshCore, il firmware e i client su cui ci basiamo, è un progetto open source rilasciato con licenza MIT; la nostra community italiana esiste per tre ragioni concrete. La prima è avere un preset radio condiviso, così che i nodi installati da persone diverse in città diverse si sentano davvero tra loro invece di restare isole isolate. La seconda è offrire documentazione tecnica in italiano, verificata rispetto alle fonti ufficiali del progetto e non…"
  },
  {
    "id": "community--il-gruppo-telegram-e-pubblico",
    "page": "Community",
    "title": "Il gruppo Telegram è pubblico",
    "url": "https://meshcore-ita.github.io/community/#il-gruppo-telegram-e-pubblico",
    "text": "Non serve un invito: chiunque usi o voglia iniziare a usare MeshCore può entrare. Il gruppo Telegram MeshCore ITA è aperto e gratuito. Che tu stia configurando il tuo primo nodo seguendo la guida passo passo a MeshCore in italiano o gestisca già un repeater da mesi, il gruppo è il posto dove presentarsi, fare domande e coordinarsi con chi ha copertura vicino a te. ENTRA NEL GRUPPO TELEGRAM ↗ Struttura del gruppo"
  },
  {
    "id": "community--otto-topic-generali-uno-per-regione",
    "page": "Community",
    "title": "Otto topic generali, uno per regione",
    "url": "https://meshcore-ita.github.io/community/#otto-topic-generali-uno-per-regione",
    "text": "Il gruppo è organizzato in topic separati, per tenere le discussioni leggibili anche con molti membri attivi."
  },
  {
    "id": "community--annunci",
    "page": "Community",
    "title": "Annunci",
    "url": "https://meshcore-ita.github.io/community/#annunci",
    "text": "Comunicazioni ufficiali della community e aggiornamenti importanti."
  },
  {
    "id": "community--benvenuti-e-presentazioni",
    "page": "Community",
    "title": "Benvenuti e presentazioni",
    "url": "https://meshcore-ita.github.io/community/#benvenuti-e-presentazioni",
    "text": "Dove i nuovi membri si presentano al resto della community."
  },
  {
    "id": "community--supporto-e-troubleshooting",
    "page": "Community",
    "title": "Supporto e troubleshooting",
    "url": "https://meshcore-ita.github.io/community/#supporto-e-troubleshooting",
    "text": "Domande tecniche e aiuto per risolvere problemi di configurazione dei nodi."
  },
  {
    "id": "community--hardware-e-antenne",
    "page": "Community",
    "title": "Hardware e antenne",
    "url": "https://meshcore-ita.github.io/community/#hardware-e-antenne",
    "text": "Confronti su board, antenne, alimentazione e installazioni fisiche."
  },
  {
    "id": "community--firmware-e-configurazione",
    "page": "Community",
    "title": "Firmware e configurazione",
    "url": "https://meshcore-ita.github.io/community/#firmware-e-configurazione",
    "text": "Versioni firmware, preset radio e impostazioni dei dispositivi."
  },
  {
    "id": "community--repeater-e-room-server",
    "page": "Community",
    "title": "Repeater e room server",
    "url": "https://meshcore-ita.github.io/community/#repeater-e-room-server",
    "text": "Coordinamento di installazioni condivise e infrastruttura di rete."
  },
  {
    "id": "community--mappa-e-copertura",
    "page": "Community",
    "title": "Mappa e copertura",
    "url": "https://meshcore-ita.github.io/community/#mappa-e-copertura",
    "text": "Segnalazioni di copertura e aggiornamenti sulla mappa pubblica."
  },
  {
    "id": "community--off-topic",
    "page": "Community",
    "title": "Off-topic",
    "url": "https://meshcore-ita.github.io/community/#off-topic",
    "text": "Chiacchiere libere, non legate a MeshCore. Accanto a questi otto, ogni regione italiana ha un topic dedicato con prefisso IT · : Abruzzo, Basilicata, Calabria, Campania, Emilia-Romagna, Friuli-Venezia Giulia, Lazio, Liguria, Lombardia, Marche, Molise, Piemonte, Puglia, Sardegna, Sicilia, Toscana, Trentino-Alto Adige, Umbria, Valle d'Aosta e Veneto. Le discussioni locali — nuove installazioni, copertura di zona, incontri — vanno nel topic della propria regione; i topic generali restano per gli argomenti trasversali a tutta la community. Regole"
  },
  {
    "id": "community--convivenza-nel-gruppo",
    "page": "Community",
    "title": "Convivenza nel gruppo",
    "url": "https://meshcore-ita.github.io/community/#convivenza-nel-gruppo",
    "text": "Rispetto reciproco: niente spam, pubblicità non richiesta o offese. Usa il topic giusto per l'argomento, compreso quello della tua regione. Rispetta la normativa radio quando operi in banda 869 MHz: i limiti di potenza ed ERP e di duty cycle sono riassunti nella pagina del preset radio italiano per MeshCore . Niente contenuti illegali. Il regolamento completo, quando presente, è fissato in cima al gruppo. Per problemi tecnici puntuali il topic Supporto e troubleshooting resta il canale più veloce; per una diagnosi scritta, la pagina soluzioni ai problemi più comuni di MeshCore copre i casi più frequenti passo passo. Contribuire"
  },
  {
    "id": "community--sito-documentazione-e-coordinamento-infrastruttura",
    "page": "Community",
    "title": "Sito, documentazione e coordinamento infrastruttura",
    "url": "https://meshcore-ita.github.io/community/#sito-documentazione-e-coordinamento-infrastruttura",
    "text": "Questo sito, come tutto il resto della community, è open source. Se trovi un'imprecisione, un comando mancante o una pagina da migliorare, apri una issue o una pull request sul repository del sito ↗ ; le altre risorse della community sono nell'organizzazione github.com/meshcore-ita ↗ . Ogni modifica tecnica proposta va confrontata con le fonti ufficiali del progetto MeshCore o con la pagina dei comandi CLI per amministrare un nodo MeshCore , che elenchiamo con la stessa disciplina. Se invece vuoi coordinare un repeater o un room server con la community, il percorso è: verifica prima nel topic Repeater e room server se qualcuno copre già la tua zona, scegli hardware coerente con la guida…"
  },
  {
    "id": "community--un-marchio-una-community-indipendente",
    "page": "Community",
    "title": "Un marchio, una community indipendente",
    "url": "https://meshcore-ita.github.io/community/#un-marchio-una-community-indipendente",
    "text": "MeshCore ITA è una community indipendente: non è affiliata al progetto MeshCore né ne è sponsorizzata o approvata. Il nome MeshCore resta del suo progetto e dei suoi autori upstream; questo sito e il gruppo Telegram sono iniziative della community italiana, gestite volontariamente e senza scopo di lucro. I contenuti di questo sito sono pubblicati sotto licenza CC BY 4.0, il codice del sito sotto licenza MIT: puoi riusarli citando la fonte. Per qualsiasi dubbio su cosa sia ufficiale e cosa no, la pagina delle domande frequenti su MeshCore in italiano raccoglie anche questo tipo di domande."
  },
  {
    "id": "installare-repeater--quanto-guadagno-d-antenna-serve-per-un-repeater",
    "page": "Repeater",
    "title": "Quanto guadagno d'antenna serve per un repeater?",
    "url": "https://meshcore-ita.github.io/installare-repeater/#quanto-guadagno-d-antenna-serve-per-un-repeater",
    "text": "Dipende dal terreno intorno al repeater. Un'antenna omnidirezionale con guadagno più alto (in dBi) concentra l'energia in un lobo di irradiazione più schiacciato verso l'orizzonte: ottimo su un palo alto in pianura, meno adatto in collina dove serve irradiare anche verso il basso per raggiungere nodi a quote diverse. Un guadagno moderato con una posizione alta batte quasi sempre un guadagno alto con una posizione mediocre."
  },
  {
    "id": "installare-repeater--meglio-un-connettore-sma-o-rp-sma",
    "page": "Repeater",
    "title": "Meglio un connettore SMA o RP-SMA?",
    "url": "https://meshcore-ita.github.io/installare-repeater/#meglio-un-connettore-sma-o-rp-sma",
    "text": "Dipende da come è cablata la board: molte board LoRa montano un connettore RP-SMA (polarità invertita rispetto allo SMA standard), mentre alcuni cavi e antenne in commercio sono SMA. L'errore classico è comprare un'antenna o una prolunga con il connettore sbagliato e forzarla: verifica sempre la polarità prima dell'acquisto, un adattatore SMA/RP-SMA costa pochi euro e non introduce perdite significative."
  },
  {
    "id": "installare-repeater--un-pannello-solare-basta-per-un-repeater-sempre-acceso",
    "page": "Repeater",
    "title": "Un pannello solare basta per un repeater sempre acceso?",
    "url": "https://meshcore-ita.github.io/installare-repeater/#un-pannello-solare-basta-per-un-repeater-sempre-acceso",
    "text": "Nella maggior parte dei casi sì, se il nodo usa una board a basso consumo (chip nRF52) con powersaving on attivo e una potenza di trasmissione non superiore al necessario. Il dimensionamento va comunque fatto sul consumo medio reale del nodo e sulle ore di luce disponibili nella stagione peggiore, non sul consumo di picco: un pannello e una batteria sottodimensionati reggono in estate e si scaricano in inverno."
  },
  {
    "id": "installare-repeater--serve-una-licenza-o-un-tecnico-per-installare-un-repeater-su-un-palo-o-un-tetto",
    "page": "Repeater",
    "title": "Serve una licenza o un tecnico per installare un repeater su un palo o un tetto?",
    "url": "https://meshcore-ita.github.io/installare-repeater/#serve-una-licenza-o-un-tecnico-per-installare-un-repeater-su-un-palo-o-un-tetto",
    "text": "Per l'uso radio in sé non serve una licenza, entro i limiti di potenza e duty cycle del preset condiviso. L'installazione fisica in quota (tetti, pali, tralicci) comporta però rischi di caduta e richiede competenze e dispositivi di sicurezza adeguati: valuta di affidarti a chi ha esperienza specifica, e ricorda che la responsabilità della sicurezza dell'installazione resta sempre dell'installatore."
  },
  {
    "id": "installare-repeater--nove-passaggi-per-un-repeater-permanente",
    "page": "Repeater",
    "title": "Nove passaggi per un repeater permanente",
    "url": "https://meshcore-ita.github.io/installare-repeater/#nove-passaggi-per-un-repeater-permanente",
    "text": "Un repeater condiviso serve alla mesh più di un companion privato: ogni scelta qui sotto incide direttamente sulla copertura di chi ci si appoggia."
  },
  {
    "id": "installare-repeater--scegli-la-posizione",
    "page": "Repeater",
    "title": "Scegli la posizione",
    "url": "https://meshcore-ita.github.io/installare-repeater/#scegli-la-posizione",
    "text": "L'altezza dell'antenna sopra gli ostacoli locali conta più della potenza di trasmissione: un repeater su un tetto o traliccio con vista libera copre più lontano di uno a potenza massima ma circondato da edifici o vegetazione. Verifica cosa c'è tra il punto scelto e le direzioni da coprire — colline, palazzi, alberi maturi — perché un solo ostacolo vicino può bloccare più segnale di chilometri in linea d'aria."
  },
  {
    "id": "installare-repeater--scegli-l-antenna",
    "page": "Repeater",
    "title": "Scegli l'antenna",
    "url": "https://meshcore-ita.github.io/installare-repeater/#scegli-l-antenna",
    "text": "Per un repeater fisso la scelta tipica è un'antenna omnidirezionale esterna, accordata sulla sub-banda 868-870 MHz: un'antenna per un'altra banda ha un ROS/SWR alto, riflette energia verso il radio invece di irradiarla e nel tempo danneggia lo stadio di uscita. Il guadagno in dBi non è sempre \"più alto meglio è\": un guadagno maggiore schiaccia il lobo di irradiazione verso l'orizzonte, utile in pianura ma penalizzante in collina. Occhio ai connettori: molte board montano SMA o RP-SMA (polarità invertita), e scambiarli è l'errore più comune in fase d'acquisto."
  },
  {
    "id": "installare-repeater--scegli-il-cavo",
    "page": "Repeater",
    "title": "Scegli il cavo",
    "url": "https://meshcore-ita.github.io/installare-repeater/#scegli-il-cavo",
    "text": "Ogni metro di cavo coassiale introduce una perdita che si somma, in negativo, al guadagno dell'antenna: un cavo lungo e scadente può vanificare il beneficio di un'antenna con guadagno alto. Tienilo il più corto possibile — sposta il radio vicino all'antenna se serve — e scegli un cavo di qualità adeguata a 868 MHz."
  },
  {
    "id": "installare-repeater--dimensiona-l-alimentazione",
    "page": "Repeater",
    "title": "Dimensiona l'alimentazione",
    "url": "https://meshcore-ita.github.io/installare-repeater/#dimensiona-l-alimentazione",
    "text": "Tre opzioni pratiche: rete elettrica per un'installazione indoor con presa già disponibile; PoE se il punto ha già un cablaggio di rete; pannello solare con batteria tampone (LiPo o LiFePO4) per un palo o un tetto isolato. Dimensiona il consumo, non limitarti a collegare: attiva powersaving on per far dormire il nodo tra una trasmissione e l'altra, e non alzare set tx oltre la potenza necessaria per la copertura richiesta."
  },
  {
    "id": "installare-repeater--prepara-il-contenitore-stagno",
    "page": "Repeater",
    "title": "Prepara il contenitore stagno",
    "url": "https://meshcore-ita.github.io/installare-repeater/#prepara-il-contenitore-stagno",
    "text": "Né le board né le antenne standard sono impermeabili di fabbrica: in esterno serve una custodia con grado di protezione adeguato. Usa passacavi sigillati, orienta il contenitore perché l'acqua non ristagni sopra i passacavi, e lascia un minimo di ricambio d'aria per limitare condensa e sbalzi termici."
  },
  {
    "id": "installare-repeater--metti-a-terra-e-proteggi-dalle-scariche",
    "page": "Repeater",
    "title": "Metti a terra e proteggi dalle scariche",
    "url": "https://meshcore-ita.github.io/installare-repeater/#metti-a-terra-e-proteggi-dalle-scariche",
    "text": "Un'antenna esterna su un punto alto è un bersaglio naturale per le scariche atmosferiche: dove possibile, valuta una messa a terra e uno scaricatore di sovratensione sulla linea coassiale. L'installazione su tetti, pali o tralicci comporta rischi di caduta reali e richiede competenze e sicurezza adeguate: se non hai esperienza, fatti aiutare da chi ce l'ha. La responsabilità della sicurezza dell'installazione, e del rispetto dei limiti normativi, resta dell'operatore del nodo."
  },
  {
    "id": "installare-repeater--configura-il-nodo-come-repeater",
    "page": "Repeater",
    "title": "Configura il nodo come repeater",
    "url": "https://meshcore-ita.github.io/installare-repeater/#configura-il-nodo-come-repeater",
    "text": "Collegati alla console via USB o da un client admin e imposta un nome coerente con la convenzione della community, ad esempio set name IT-Torino-RPT-01 . Allinea il preset radio con set radio 869.618,62.5,8,8 , regola la potenza con set tx <dbm> senza eccedere il necessario, attiva powersaving on se il nodo è a batteria o solare, e se serve cambia l'intervallo di annuncio con set flood.advert.interval <ore> . Applica tutto con reboot e invia un advert per farti vedere dai vicini. Sintassi completa nella pagina comandi CLI per amministrare un nodo MeshCore ."
  },
  {
    "id": "installare-repeater--verifica-sul-campo",
    "page": "Repeater",
    "title": "Verifica sul campo",
    "url": "https://meshcore-ita.github.io/installare-repeater/#verifica-sul-campo",
    "text": "Dopo il riavvio, usa neighbors per controllare quali nodi il tuo repeater sente direttamente e stats-radio per leggere noise floor, RSSI/SNR e airtime dell'ultima ricezione. Il riscontro più affidabile resta però quello umano: chiedi nel gruppo Telegram a chi ha un nodo nella tua zona di confermare che il tuo repeater compare tra i suoi contatti dopo l'advert."
  },
  {
    "id": "installare-repeater--pianifica-la-manutenzione",
    "page": "Repeater",
    "title": "Pianifica la manutenzione",
    "url": "https://meshcore-ita.github.io/installare-repeater/#pianifica-la-manutenzione",
    "text": "Un repeater condiviso va controllato periodicamente: verifica che compaia ancora negli advert altrui e tieni il firmware aggiornato via OTA (Wi-Fi su ESP32, DFU su nRF52), come descritto nella pagina dei comandi. Se il nodo sparisce, la causa più comune non è la radio ma l'alimentazione o l'orologio: la pagina soluzioni ai problemi più comuni di MeshCore copre entrambi i casi con diagnosi e comando risolutivo. Attenzione trasversale"
  },
  {
    "id": "installare-repeater--naming-coerente",
    "page": "Repeater",
    "title": "Naming coerente",
    "url": "https://meshcore-ita.github.io/installare-repeater/#naming-coerente",
    "text": "Usa la convenzione IT-<citta>-RPT-NN (ad esempio IT-Torino-RPT-01 ): rende immediato per chiunque nella mesh capire cosa vede tra i contatti."
  },
  {
    "id": "installare-repeater--preavviso-alla-community",
    "page": "Repeater",
    "title": "Preavviso alla community",
    "url": "https://meshcore-ita.github.io/installare-repeater/#preavviso-alla-community",
    "text": "Se il repeater è già in servizio, annuncia nel gruppo Telegram prima di cambiare preset radio o spostare l'antenna: un cambiamento non comunicato toglie copertura a chi non se lo aspetta."
  },
  {
    "id": "installare-repeater--cosa-succede-se-sparisce",
    "page": "Repeater",
    "title": "Cosa succede se sparisce",
    "url": "https://meshcore-ita.github.io/installare-repeater/#cosa-succede-se-sparisce",
    "text": "Un repeater che smette di comparire negli advert altrui non è necessariamente guasto: spesso è alimentazione esaurita o orologio disallineato. Controllalo con stats-core e get radio . Scelte di alimentazione"
  },
  {
    "id": "installare-repeater--rete-poe-o-solare-quando-usarli",
    "page": "Repeater",
    "title": "Rete, PoE o solare: quando usarli",
    "url": "https://meshcore-ita.github.io/installare-repeater/#rete-poe-o-solare-quando-usarli",
    "text": "Opzioni di alimentazione per un repeater Alimentazione Quando usarla Note Rete elettrica Installazione indoor o punto con presa già disponibile. La più semplice e affidabile; nessun dimensionamento batteria. PoE Punto già raggiunto da un cablaggio di rete (tetto, sottotetto, armadio tecnico). Evita un secondo cavo di alimentazione separato dal dato. Pannello solare + batteria Palo o tetto isolato, senza rete elettrica nelle vicinanze. Richiede board a basso consumo (nRF52), powersaving on e dimensionamento sulla stagione peggiore. Domande frequenti"
  },
  {
    "id": "installare-repeater--faq-sull-installazione-di-un-repeater",
    "page": "Repeater",
    "title": "FAQ sull'installazione di un repeater",
    "url": "https://meshcore-ita.github.io/installare-repeater/#faq-sull-installazione-di-un-repeater",
    "text": "Per il quadro normativo vedi il preset radio italiano per MeshCore ; per le board adatte vedi la guida hardware ; per un problema dopo l'installazione vedi le soluzioni ai problemi più comuni . Per confrontarti con chi ha già installato un repeater vicino a te, il posto giusto è il gruppo Telegram MeshCore ITA ↗ ."
  },
  {
    "id": "mappa-copertura--il-mio-nodo-e-automaticamente-sulla-mappa-pubblica",
    "page": "Mappa",
    "title": "Il mio nodo è automaticamente sulla mappa pubblica?",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#il-mio-nodo-e-automaticamente-sulla-mappa-pubblica",
    "text": "No, non automaticamente: devi caricarlo tu. Per un companion, apri l'app MeshCore, vai su \"Internet Map\" e scegli \"Add me to the Map\". Per un repeater o room server, aprilo dalla lista contatti, tocca \"Share\" e poi \"Upload to Internet Map\". Una volta caricato, il nodo è consultabile sulla mappa pubblica su map.meshcore.io."
  },
  {
    "id": "mappa-copertura--e-sicuro-pubblicare-la-posizione-di-un-nodo-domestico",
    "page": "Mappa",
    "title": "È sicuro pubblicare la posizione di un nodo domestico?",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#e-sicuro-pubblicare-la-posizione-di-un-nodo-domestico",
    "text": "È una scelta volontaria che va valutata caso per caso. Pubblicare la posizione esatta di un companion tenuto in casa rende identificabile pubblicamente dove abiti; per un nodo domestico molti preferiscono non caricarlo sulla mappa, oppure impostare una posizione approssimata invece delle coordinate precise. Per un repeater installato in un punto già pubblico (tetto condominiale, palo, sede di un'associazione) il rischio di privacy è minore."
  },
  {
    "id": "mappa-copertura--la-mappa-mostra-la-copertura-reale-della-mesh",
    "page": "Mappa",
    "title": "La mappa mostra la copertura reale della mesh?",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#la-mappa-mostra-la-copertura-reale-della-mesh",
    "text": "No. La mappa mostra solo i nodi che i loro proprietari hanno scelto volontariamente di caricare, non le aree effettivamente coperte dal segnale. Un'area senza puntini sulla mappa può comunque avere copertura da nodi non pubblicati, mentre un'area con più puntini non garantisce che i messaggi passino davvero tra quei nodi: per questo serve una verifica sul campo."
  },
  {
    "id": "mappa-copertura--come-verifico-la-copertura-reale-nella-mia-zona",
    "page": "Mappa",
    "title": "Come verifico la copertura reale nella mia zona?",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#come-verifico-la-copertura-reale-nella-mia-zona",
    "text": "Il modo più affidabile è un test con un secondo nodo: spostati nel punto che vuoi verificare, invia un advert e controlla con neighbors e stats-radio se il tuo repeater lo riceve, leggendo RSSI e SNR. Sentire un advert non basta a garantire che un messaggio venga instradato con successo: conferma la copertura scambiando anche un messaggio di prova con un altro nodo della zona, e confrontati nel topic regionale del gruppo Telegram."
  },
  {
    "id": "mappa-copertura--la-internet-map-di-meshcore",
    "page": "Mappa",
    "title": "La Internet Map di MeshCore",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#la-internet-map-di-meshcore",
    "text": "Una mappa pubblica e consultabile da chiunque, dove i proprietari dei nodi possono decidere di comparire. La Internet Map, consultabile su map.meshcore.io ↗ , è il registro pubblico ufficiale dei nodi MeshCore che i loro proprietari hanno scelto volontariamente di condividere. Ogni puntino sulla mappa rappresenta un companion, un repeater o un room server con nome e posizione caricati da chi lo gestisce: non è un servizio di scansione automatica della rete, e un nodo acceso e perfettamente funzionante può non comparire semplicemente perché nessuno lo ha caricato. Serve principalmente per due cose: capire a colpo d'occhio dove esistono già repeater e room server pubblici prima di installarne…"
  },
  {
    "id": "mappa-copertura--companion",
    "page": "Mappa",
    "title": "Companion",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#companion",
    "text": "Apri l'app MeshCore, vai su \"Internet Map\" e scegli \"Add me to the Map\". Il nodo comparirà sulla mappa pubblica con il nome e la posizione impostati sul companion."
  },
  {
    "id": "mappa-copertura--repeater-o-room-server",
    "page": "Mappa",
    "title": "Repeater o room server",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#repeater-o-room-server",
    "text": "Apri il nodo dalla lista contatti, tocca \"Share\" e poi \"Upload to Internet Map\". La posizione caricata è quella impostata sul nodo con set lat e set lon , descritti nella pagina dei comandi CLI per amministrare un nodo MeshCore . In entrambi i casi la pubblicazione è volontaria e reversibile: nessun nodo finisce sulla mappa senza un'azione esplicita di chi lo gestisce. Vale la pena farlo per un repeater o un room server pensato per servire altri, perché aiuta chi sta pianificando una nuova installazione a evitare doppioni inutili nella stessa zona; per un companion privato la scelta va ponderata con attenzione alla privacy, vedi sotto. Privacy"
  },
  {
    "id": "mappa-copertura--cosa-comporta-pubblicare-una-posizione",
    "page": "Mappa",
    "title": "Cosa comporta pubblicare una posizione",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#cosa-comporta-pubblicare-una-posizione",
    "text": "La mappa è pubblica: chiunque, non solo la community MeshCore, può consultarla su un browser. Caricare la posizione esatta di un companion tenuto in casa rende identificabile pubblicamente il tuo indirizzo, in modo permanente finché non rimuovi il nodo dalla mappa. Per un nodo domestico è ragionevole chiedersi se serva davvero comparire: se l'obiettivo è solo restare in contatto con la mesh locale, spesso non serve caricare il companion, mentre ha più senso caricare un eventuale repeater condiviso, la cui posizione fisica (un tetto, un palo, una sede) è già di fatto un punto pubblico e utile a chi vuole agganciarsi alla mesh. Se vuoi comunque comparire ma limitare l'esposizione, un…"
  },
  {
    "id": "mappa-copertura--mappa-dei-nodi-non-mappa-della-copertura",
    "page": "Mappa",
    "title": "Mappa dei nodi, non mappa della copertura",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#mappa-dei-nodi-non-mappa-della-copertura",
    "text": "Un puntino sulla mappa dice \"questo nodo esiste ed è stato dichiarato qui\", non \"questa zona è coperta dal segnale\". Questa distinzione è la fonte più comune di aspettative sbagliate. Un'area senza puntini può comunque avere copertura reale, garantita da repeater che i loro proprietari non hanno caricato: la mancanza di puntini non significa mancanza di rete. Al contrario, più puntini ravvicinati non garantiscono che i messaggi passino davvero tra quei nodi: la copertura LoRa dipende da altezza dell'antenna, ostacoli, orografia e potenza, fattori che la mappa non misura. Due nodi vicini sulla mappa possono essere separati da una collina che li rende reciprocamente sordi. C'è anche una…"
  },
  {
    "id": "mappa-copertura--come-stimare-la-copertura-reale",
    "page": "Mappa",
    "title": "Come stimare la copertura reale",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#come-stimare-la-copertura-reale",
    "text": "Segnali da controllare per stimare la copertura Comando Cosa dice sulla copertura neighbors Elenca i vicini diretti uditi di recente da un repeater: dice chi è effettivamente in portata radio, non chi è sulla mappa. stats-radio Mostra RSSI e SNR dell'ultimo pacchetto ricevuto: un RSSI molto basso o un SNR vicino allo zero indicano un collegamento al limite, anche se il pacchetto è arrivato. advert Forza un annuncio flood immediato, utile per un test rapido con un secondo nodo mentre ti sposti nel punto da verificare. Il test più affidabile resta pratico: prendi un secondo nodo, spostati nel punto da verificare, invia un advert e controlla se il repeater lo riceve con neighbors e stats-radio…"
  },
  {
    "id": "mappa-copertura--faq-sulla-mappa-e-la-copertura",
    "page": "Mappa",
    "title": "FAQ sulla mappa e la copertura",
    "url": "https://meshcore-ita.github.io/mappa-copertura/#faq-sulla-mappa-e-la-copertura",
    "text": "Per approfondire i termini tecnici usati in questa pagina vedi il glossario MeshCore ; per confrontarti su copertura e installazioni nella tua zona vedi il gruppo Telegram MeshCore ITA ↗ ."
  },
  {
    "id": "app--qual-e-il-pin-per-accoppiare-il-nodo-via-bluetooth",
    "page": "App",
    "title": "Qual è il PIN per accoppiare il nodo via Bluetooth?",
    "url": "https://meshcore-ita.github.io/app/#qual-e-il-pin-per-accoppiare-il-nodo-via-bluetooth",
    "text": "Il PIN di default è 123456. Vale solo per un nodo con firmware Companion BLE: un repeater o room server non accetta mai connessioni Bluetooth, va amministrato via USB o da remoto via LoRa."
  },
  {
    "id": "app--perche-un-contatto-risulta-visto-molti-giorni-fa-anche-se-e-acceso",
    "page": "App",
    "title": "Perché un contatto risulta \"visto molti giorni fa\" anche se è acceso?",
    "url": "https://meshcore-ita.github.io/app/#perche-un-contatto-risulta-visto-molti-giorni-fa-anche-se-e-acceso",
    "text": "Quasi sempre è l'orologio, non la portata radio: se il nodo remoto ha l'ora sbagliata i suoi advert non aggiornano il \"last seen\". La pagina sui problemi comuni copre diagnosi e comandi per risincronizzarlo."
  },
  {
    "id": "app--posso-amministrare-un-repeater-via-bluetooth-come-un-companion",
    "page": "App",
    "title": "Posso amministrare un repeater via Bluetooth come un companion?",
    "url": "https://meshcore-ita.github.io/app/#posso-amministrare-un-repeater-via-bluetooth-come-un-companion",
    "text": "No: un repeater o room server non apre mai una connessione Bluetooth. Si amministra via USB con un client admin, oppure da remoto via LoRa collegandoti dall'app a un tuo companion."
  },
  {
    "id": "app--il-client-web-funziona-anche-da-smartphone",
    "page": "App",
    "title": "Il client web funziona anche da smartphone?",
    "url": "https://meshcore-ita.github.io/app/#il-client-web-funziona-anche-da-smartphone",
    "text": "Dipende dal browser: usa il Web Bluetooth, supportato da Chrome su Android e desktop ma non da Safari su iOS. Su iPhone conviene l'app nativa; da computer il client web si collega anche via USB."
  },
  {
    "id": "app--come-so-se-un-messaggio-diretto-e-arrivato-davvero",
    "page": "App",
    "title": "Come so se un messaggio diretto è arrivato davvero?",
    "url": "https://meshcore-ita.github.io/app/#come-so-se-un-messaggio-diretto-e-arrivato-davvero",
    "text": "Il client segnala inviato o consegnato in base alla conferma che torna dal destinatario; senza conferma entro il timeout ritenta da solo. Un messaggio di canale non ha invece conferma di consegna."
  },
  {
    "id": "app--non-il-primo-setup-come-si-usa-meshcore-ogni-giorno",
    "page": "App",
    "title": "Non il primo setup: come si usa MeshCore ogni giorno",
    "url": "https://meshcore-ita.github.io/app/#non-il-primo-setup-come-si-usa-meshcore-ogni-giorno",
    "text": "Se il nodo non è ancora flashato o accoppiato, parti dalla guida; questa pagina presuppone un nodo già configurato e allineato al preset radio condiviso. Una volta completata la guida passo passo a MeshCore in italiano , l'uso quotidiano passa quasi sempre da un client: l'app sul telefono o il client web dal computer. Il nodo LoRa resta acceso e fa da modem radio; il client è l'interfaccia con cui leggi e scrivi messaggi, gestisci i contatti e cambi le impostazioni. Questa pagina copre l'uso di tutti i giorni, non il flash del firmware né il primo accoppiamento. Client"
  },
  {
    "id": "app--tre-strade-per-parlare-col-nodo",
    "page": "App",
    "title": "Tre strade per parlare col nodo",
    "url": "https://meshcore-ita.github.io/app/#tre-strade-per-parlare-col-nodo",
    "text": "Il nodo companion resta lo stesso; cambia solo il dispositivo con cui ti ci colleghi."
  },
  {
    "id": "app--app-android",
    "page": "App",
    "title": "App Android",
    "url": "https://meshcore-ita.github.io/app/#app-android",
    "text": "Si installa dallo store del dispositivo e si collega al nodo companion via Bluetooth Low Energy: la strada più comoda per l'uso mobile quotidiano."
  },
  {
    "id": "app--app-ios",
    "page": "App",
    "title": "App iOS",
    "url": "https://meshcore-ita.github.io/app/#app-ios",
    "text": "Stessa app, stessa interfaccia, stesso accoppiamento BLE: su iPhone e iPad la connessione Bluetooth funziona come su Android."
  },
  {
    "id": "app--client-web",
    "page": "App",
    "title": "Client web",
    "url": "https://meshcore-ita.github.io/app/#client-web",
    "text": "Su app.meshcore.nz ↗ , senza installare nulla: Web Bluetooth del browser oppure connessione USB seriale, comoda da computer. Accoppiamento"
  },
  {
    "id": "app--connettersi-al-nodo-bluetooth-o-usb",
    "page": "App",
    "title": "Connettersi al nodo: Bluetooth o USB",
    "url": "https://meshcore-ita.github.io/app/#connettersi-al-nodo-bluetooth-o-usb",
    "text": "Un nodo con firmware Companion BLE si accoppia cercandolo tra i dispositivi Bluetooth e inserendo il PIN di default 123456 . Un nodo Companion USB-only, o semplicemente collegato via cavo, si raggiunge invece con una connessione seriale, supportata sia dall'app sia dal client web. Un dettaglio spesso frainteso: un nodo con firmware repeater o room server non apre mai una connessione Bluetooth diretta; per amministrarlo servono un client admin via USB oppure la gestione remota via LoRa dall'app, collegandoti prima a un tuo companion. Interfaccia"
  },
  {
    "id": "app--contatti-messaggi-diretti-canali-e-room-server",
    "page": "App",
    "title": "Contatti, messaggi diretti, canali e room server",
    "url": "https://meshcore-ita.github.io/app/#contatti-messaggi-diretti-canali-e-room-server",
    "text": "L'elenco contatti è il punto centrale del client: raccoglie ogni nodo di cui hai ricevuto un advert, con l'indicazione di quando è stato \"visto\" l'ultima volta. Un contatto normale apre una chat diretta uno-a-uno; i canali funzionano invece come una bacheca condivisa in flood, dove chiunque nel canale legge tutti i messaggi. Un room server è diverso da entrambi: è un server BBS che conserva i messaggi non letti — fino a 32 per utente — così puoi tornare online più tardi e recuperarli, invece di perderli come accade con un canale se sei fuori portata al momento dell'invio. Contatti"
  },
  {
    "id": "app--come-si-aggiunge-e-si-riscopre-un-contatto",
    "page": "App",
    "title": "Come si aggiunge (e si riscopre) un contatto",
    "url": "https://meshcore-ita.github.io/app/#come-si-aggiunge-e-si-riscopre-un-contatto",
    "text": "Un contatto compare automaticamente quando il tuo nodo riceve il suo advert, diretto o ripetuto da un repeater della mesh; da lì puoi salvarlo in modo permanente. Un companion invia il proprio advert solo su richiesta esplicita dell'utente, non periodicamente: se un nodo vicino non ti trova tra i suoi contatti, la soluzione più semplice è inviarne uno nuovo dal client. Se invece un contatto già noto risulta \"visto\" molti giorni fa pur essendo acceso, la causa quasi sempre non è la portata radio ma l'orologio: un advert con timestamp non plausibile non aggiorna il \"last seen\". La pagina sulla risoluzione dei problemi più comuni di MeshCore copre diagnosi e comandi per risincronizzare l'ora.…"
  },
  {
    "id": "app--canale-o-messaggio-diretto-cosa-cambia-in-pratica",
    "page": "App",
    "title": "Canale o messaggio diretto: cosa cambia in pratica",
    "url": "https://meshcore-ita.github.io/app/#canale-o-messaggio-diretto-cosa-cambia-in-pratica",
    "text": "Un messaggio di canale viaggia sempre in flood: parte, viene ripetuto da ogni repeater che lo sente e raggiunge chiunque sia nel canale in quel momento, senza conferma di consegna. Un messaggio diretto funziona diversamente: il primo invio raggiunge comunque il destinatario in flood, ma la conferma di consegna che torna indietro porta con sé i repeater attraversati, e da quel momento il client riusa quel percorso per i messaggi successivi. In pratica un canale è immediato ma \"spara e spera\"; un diretto è più lento al primo invio — deve scoprire il percorso — ma più affidabile e più veloce in seguito, perché non deve più floodare l'intera mesh. Il confronto tecnico completo con il \"managed…"
  },
  {
    "id": "app--cosa-puoi-cambiare-sul-nodo-dal-client",
    "page": "App",
    "title": "Cosa puoi cambiare sul nodo dal client",
    "url": "https://meshcore-ita.github.io/app/#cosa-puoi-cambiare-sul-nodo-dal-client",
    "text": "Dal client puoi modificare le impostazioni principali del nodo senza toccare la CLI: il nome (convenzione IT-<citta>-NN descritta nella guida), il preset radio — frequenza, banda, spreading factor e coding rate, sempre allineati al preset radio italiano per MeshCore — e la potenza di trasmissione, da tenere solo quanto serve per la copertura richiesta. Le stesse impostazioni sono raggiungibili via riga di comando; l'elenco completo è nella pagina comandi CLI per amministrare un nodo MeshCore , utile soprattutto per un repeater che il client BLE non raggiunge direttamente. Mappa e batteria"
  },
  {
    "id": "app--mappa-pubblica-e-autonomia-del-companion",
    "page": "App",
    "title": "Mappa pubblica e autonomia del companion",
    "url": "https://meshcore-ita.github.io/app/#mappa-pubblica-e-autonomia-del-companion",
    "text": "Dal client puoi caricare il tuo nodo sulla mappa pubblica map.meshcore.io: la procedura, diversa per un companion rispetto a un repeater o room server, è nella pagina delle domande frequenti su MeshCore in italiano ; per leggere cosa mostra la mappa vedi la pagina dedicata alla mappa di copertura MeshCore . Sul fronte batteria, un companion connesso via Bluetooth consuma più di un nodo lasciato solo in ricezione: se lo usi come base fissa, alimentarlo via USB evita sorprese; in mobilità il consumo dipende soprattutto da quanto a lungo l'app resta connessa via BLE. Domande frequenti"
  },
  {
    "id": "regioni--perche-meshcore-cresce-regione-per-regione",
    "page": "Regioni",
    "title": "Perché MeshCore cresce regione per regione",
    "url": "https://meshcore-ita.github.io/regioni/#perche-meshcore-cresce-regione-per-regione",
    "text": "Un nodo LoRa parla con chi ha vicino, non con l'Italia intera: la mesh si costruisce a partire da isole locali che si allargano. MeshCore non ha un server centrale: ogni nodo comunica solo con chi riesce a sentire in radio, direttamente o attraverso repeater intermedi. Due nodi a 400 km di distanza semplicemente non si sentono, qualunque sia il preset radio impostato: non è un limite di configurazione, è fisica della propagazione LoRa. Per questo la community italiana organizza il gruppo Telegram con un topic per ciascuna regione: le discussioni utili — chi ha già copertura, dove serve un repeater, chi cerca un aggancio — hanno senso solo tra persone geograficamente vicine. Una mesh…"
  },
  {
    "id": "regioni--tutte-le-regioni-italiane-nel-gruppo-telegram",
    "page": "Regioni",
    "title": "Tutte le regioni italiane nel gruppo Telegram",
    "url": "https://meshcore-ita.github.io/regioni/#tutte-le-regioni-italiane-nel-gruppo-telegram",
    "text": "Ogni regione ha un topic dedicato con prefisso IT · , dove si discute copertura, installazioni e aggancio tra nodi vicini. Topic regionali del gruppo Telegram MeshCore ITA Regione Topic Telegram Abruzzo Topic Abruzzo ↗ Basilicata Topic Basilicata ↗ Calabria Topic Calabria ↗ Campania Topic Campania ↗ Emilia-Romagna Topic Emilia-Romagna ↗ Friuli-Venezia Giulia Topic Friuli-Venezia Giulia ↗ Lazio Topic Lazio ↗ Liguria Topic Liguria ↗ Lombardia Topic Lombardia ↗ Marche Topic Marche ↗ Molise Topic Molise ↗ Piemonte Topic Piemonte ↗ Puglia Topic Puglia ↗ Sardegna Topic Sardegna ↗ Sicilia Topic Sicilia ↗ Toscana Topic Toscana ↗ Trentino-Alto Adige Topic Trentino-Alto Adige ↗ Umbria Topic Umbria ↗…"
  },
  {
    "id": "regioni--cosa-scrivere-quando-arrivi-nel-topic-della-tua-regione",
    "page": "Regioni",
    "title": "Cosa scrivere quando arrivi nel topic della tua regione",
    "url": "https://meshcore-ita.github.io/regioni/#cosa-scrivere-quando-arrivi-nel-topic-della-tua-regione",
    "text": "Un messaggio di presentazione utile è breve ma specifico: indica la zona di massima (comune o area, non serve l'indirizzo esatto), il tipo di nodo che hai — companion, repeater o room server — e il tipo di antenna e installazione, ad esempio \"companion portatile con antenna stock\" oppure \"repeater fisso in terrazzo a 15 metri con antenna 5.8 dBi\". Specifica anche cosa cerchi: se stai solo verificando se c'è copertura vicino a te, se cerchi un aggancio con un nodo esistente, o se hai un repeater da proporre come punto condiviso di zona. Più il messaggio è concreto, più è facile per chi è già attivo nella tua area capire se e come collegarti, invece di dover fare domande di chiarimento.…"
  },
  {
    "id": "regioni--da-nodi-isolati-a-mesh-locale",
    "page": "Regioni",
    "title": "Da nodi isolati a mesh locale",
    "url": "https://meshcore-ita.github.io/regioni/#da-nodi-isolati-a-mesh-locale",
    "text": "Un aggancio tra due nodi vicini si verifica concretamente, non si stima a tavolino: dopo esservi messi d'accordo nel topic regionale, allineate entrambi i nodi allo stesso preset radio italiano per MeshCore — nodi su preset diversi non si sentono anche se a pochi metri — e poi inviate un advert da entrambe le parti per verificare che ciascuno compaia nei contatti dell'altro. Se l'aggancio diretto non funziona per orografia o distanza, il passo successivo è capire se un repeater esistente nella zona può fare da ponte tra i due nodi: chi lo gestisce può confermarlo nel topic. Da qui la mesh locale cresce per aggiunte successive: ogni nuovo nodo che si aggancia a uno già presente estende…"
  },
  {
    "id": "regioni--proporre-un-repeater-di-zona",
    "page": "Regioni",
    "title": "Proporre un repeater di zona",
    "url": "https://meshcore-ita.github.io/regioni/#proporre-un-repeater-di-zona",
    "text": "Se hai una posizione in quota o comunque sopraelevata rispetto agli ostacoli locali — un tetto, un traliccio, un'altura — puoi valutare di installare un repeater condiviso invece di un secondo companion. Prima di procedere, verifica nel topic della tua regione se qualcuno copre già la tua zona: un repeater doppione a poca distanza da uno esistente aggiunge poco e complica la disambiguazione dei percorsi sulla mesh. Se la copertura manca davvero, la pagina come installare un repeater MeshCore copre l'installazione passo passo, dalla scelta della board all'amministrazione via CLI; una volta operativo, annuncialo nel topic regionale e valuta di caricarlo sulla mappa pubblica, così chi è nella…"
  },
  {
    "id": "regioni--la-copertura-non-e-garantita-va-verificata-sul-campo",
    "page": "Regioni",
    "title": "La copertura non è garantita: va verificata sul campo",
    "url": "https://meshcore-ita.github.io/regioni/#la-copertura-non-e-garantita-va-verificata-sul-campo",
    "text": "Nessuna delle informazioni raccolte nei topic regionali, né la presenza di un repeater sulla mappa pubblica, sostituisce una verifica reale. Orografia, ostacoli, altezza dell'antenna e persino le condizioni atmosferiche influiscono sulla portata effettiva più della distanza in linea d'aria: un repeater segnalato come attivo può non raggiungere un punto che sembra vicino sulla carta. Prima di contare su una copertura per un uso critico, verificala di persona con un contatto reale e uno scambio di messaggi, e tienila aggiornata nel topic regionale se cambia: un nodo spento o rimosso senza avviso lascia altri a fare affidamento su una copertura che non c'è più. Per approfondire i fattori che…"
  },
  {
    "id": "normativa--meshcore-sul-preset-869-618-mhz-richiede-una-licenza-radioamatoriale",
    "page": "Normativa",
    "title": "MeshCore sul preset 869.618 MHz richiede una licenza radioamatoriale?",
    "url": "https://meshcore-ita.github.io/normativa/#meshcore-sul-preset-869-618-mhz-richiede-una-licenza-radioamatoriale",
    "text": "No. La sub-banda 869.4-869.65 MHz è ad uso libero per apparati a corto raggio entro i limiti di potenza (500 mW ERP) e duty cycle (10%) fissati dalla norma armonizzata ETSI EN 300 220-2 e recepiti nel Piano Nazionale di Ripartizione delle Frequenze. Non serve nominativo né autorizzazione generale."
  },
  {
    "id": "normativa--posso-alzare-la-potenza-di-trasmissione-oltre-il-default-con-set-tx",
    "page": "Normativa",
    "title": "Posso alzare la potenza di trasmissione oltre il default con set tx?",
    "url": "https://meshcore-ita.github.io/normativa/#posso-alzare-la-potenza-di-trasmissione-oltre-il-default-con-set-tx",
    "text": "Solo restando entro il limite di 500 mW ERP della sub-banda 869.4-869.65 MHz, calcolato sottraendo il guadagno dell'antenna (in dBd) e sommando la perdita di cavo alla potenza in uscita dal radio. Il rispetto del limite resta responsabilità di chi configura il nodo."
  },
  {
    "id": "normativa--posso-usare-meshcore-in-banda-radioamatoriale-con-il-mio-nominativo",
    "page": "Normativa",
    "title": "Posso usare MeshCore in banda radioamatoriale con il mio nominativo?",
    "url": "https://meshcore-ita.github.io/normativa/#posso-usare-meshcore-in-banda-radioamatoriale-con-il-mio-nominativo",
    "text": "Non in modo conforme: MeshCore cifra canali e messaggi diretti, mentre le trasmissioni radioamatoriali non possono essere rese volutamente incomprensibili a terzi, salvo il controllo di satelliti. Restare sulla sub-banda 869.4-869.65 MHz ad uso libero, oppure sulla banda LPD 433 MHz, evita il conflitto."
  },
  {
    "id": "normativa--chi-controlla-che-il-duty-cycle-del-10-sia-rispettato",
    "page": "Normativa",
    "title": "Chi controlla che il duty cycle del 10% sia rispettato?",
    "url": "https://meshcore-ita.github.io/normativa/#chi-controlla-che-il-duty-cycle-del-10-sia-rispettato",
    "text": "Nessun ente misura in automatico il duty cycle dei singoli nodi: il limite è normativo e la sua osservanza è responsabilità dell'operatore. I parametri di default del preset condiviso e il traffico tipico di una mesh restano ampiamente sotto il 10%, ma un uso anomalo (ad esempio un loop di flood) può avvicinarsi al limite."
  },
  {
    "id": "normativa--le-sub-bande-863-870-mhz-rilevanti-per-meshcore",
    "page": "Normativa",
    "title": "Le sub-bande 863-870 MHz rilevanti per MeshCore",
    "url": "https://meshcore-ita.github.io/normativa/#le-sub-bande-863-870-mhz-rilevanti-per-meshcore",
    "text": "Solo tre sub-bande contano per un nodo MeshCore in Italia: quella del preset condiviso e le due adiacenti spesso confuse con essa. Limiti di potenza e duty cycle, apparati a corto raggio non specifici 1 Sub-banda Potenza max Duty cycle Uso per MeshCore 868.000–868.600 MHz 25 mW e.r.p. ≤ 1% Non usata dal preset condiviso: potenza troppo bassa per un repeater. 869.400–869.650 MHz 500 mW e.r.p. ≤ 10% Sub-banda del preset radio condiviso (869.618 MHz). 869.700–870.000 MHz 5 mW e.r.p. (oppure 25 mW con duty cycle ≤ 1%) Nessun limite (oppure ≤ 1%) Non usata: 5 mW è troppo poco, 25 mW impone un duty cycle più stretto del preset. Il preset condiviso 869.618 MHz, BW 62.5 kHz, SF8, CR8 (dettagli…"
  },
  {
    "id": "normativa--erp-eirp-e-come-si-calcola-la-potenza-massima-consentita",
    "page": "Normativa",
    "title": "ERP, EIRP e come si calcola la potenza massima consentita",
    "url": "https://meshcore-ita.github.io/normativa/#erp-eirp-e-come-si-calcola-la-potenza-massima-consentita",
    "text": "L'ERP ( effective radiated power ) è la potenza misurata rispetto a un'antenna dipolo a mezz'onda di riferimento: è la grandezza usata dalla norma ETSI EN 300 220 e quindi il limite che conta per MeshCore in Italia. L'EIRP ( equivalent isotropically radiated power ), usata più spesso nelle schede tecniche dei chip radio, è invece riferita a un'antenna isotropica ideale. La differenza tra i due riferimenti è una costante fisica: EIRP = ERP + 2.15 dB . La norma definisce l'ERP come la potenza in uscita dal connettore d'antenna corretta per il guadagno dell'antenna stessa, espresso in dBd (relativo al dipolo) 2 . Le antenne in commercio dichiarano però il guadagno in dBi: va convertito…"
  },
  {
    "id": "normativa--cosa-conta-per-il-10-di-duty-cycle",
    "page": "Normativa",
    "title": "Cosa conta per il 10% di duty cycle",
    "url": "https://meshcore-ita.github.io/normativa/#cosa-conta-per-il-10-di-duty-cycle",
    "text": "Il duty cycle del 10% nella sub-banda 869.4–869.65 MHz 1 è una frazione di tempo, non di pacchetti: significa al massimo 6 minuti di trasmissione effettiva ogni ora, per singolo dispositivo, indipendentemente da quanti pacchetti vengono inviati in quella finestra. Un pacchetto LoRa più lungo (SF alto, banda stretta, CR alto) consuma più duty cycle di uno breve a parità di dati trasmessi, perché il limite è sul tempo che il trasmettitore resta acceso, non sui byte inviati. MeshCore non applica un contatore di duty cycle lato firmware: il rispetto del limite dipende dai parametri del preset condiviso (che tengono l'airtime di un singolo pacchetto di 50 byte intorno al mezzo secondo, vedi…"
  },
  {
    "id": "normativa--perche-queste-frequenze-sono-ad-uso-libero",
    "page": "Normativa",
    "title": "Perché queste frequenze sono ad uso libero",
    "url": "https://meshcore-ita.github.io/normativa/#perche-queste-frequenze-sono-ad-uso-libero",
    "text": "Le tre sub-bande della tabella sopra rientrano nella categoria degli apparati a corto raggio non specifici (SRD), disciplinata a livello europeo dalla decisione di armonizzazione dello spettro 2017/1483/UE e dalla relativa norma tecnica armonizzata ETSI EN 300 220-2 1 . In Italia questa allocazione è recepita nel Piano Nazionale di Ripartizione delle Frequenze (PNRF), approvato con decreto ministeriale del 31 agosto 2022 e pubblicato nel Supplemento ordinario n. 35 alla Gazzetta Ufficiale n. 214 del 13 settembre 2022 3 , ai sensi del Codice delle comunicazioni elettroniche (decreto legislativo 1° agosto 2003, n. 259) 4 . Per questa categoria di apparati non serve un'autorizzazione generale…"
  },
  {
    "id": "normativa--lpd-433-mhz-libero-uso-ma-non-e-la-banda-radioamatoriale",
    "page": "Normativa",
    "title": "LPD 433 MHz: libero uso, ma non è la banda radioamatoriale",
    "url": "https://meshcore-ita.github.io/normativa/#lpd-433-mhz-libero-uso-ma-non-e-la-banda-radioamatoriale",
    "text": "La sub-banda 433.050–434.790 MHz è anch'essa ad uso libero per SRD, con potenza massima 10 mW e.r.p. sull'intera banda 1 : è la stessa banda su cui operano i dispositivi LPD (Low Power Device) commerciali. Numericamente si sovrappone alla porzione 430-440 MHz allocata in Italia, in via secondaria, al servizio di radioamatore 3 : stessa porzione di spettro, ma due statuti giuridici diversi. Un nodo MeshCore configurato su questa sub-banda a 10 mW e.r.p. resta nell'uso libero SRD, senza bisogno di nominativo; usare invece i privilegi di potenza più alta della banda radioamatoriale richiederebbe una licenza e ricadrebbe nel problema descritto nella sezione seguente. Radioamatori"
  },
  {
    "id": "normativa--perche-meshcore-non-e-compatibile-con-l-uso-radioamatoriale",
    "page": "Normativa",
    "title": "Perché MeshCore non è compatibile con l'uso radioamatoriale",
    "url": "https://meshcore-ita.github.io/normativa/#perche-meshcore-non-e-compatibile-con-l-uso-radioamatoriale",
    "text": "MeshCore cifra il contenuto dei canali e dei messaggi diretti per progetto. Il Regolamento delle radiocomunicazioni dell'ITU, ratificato dall'Italia con legge 31 gennaio 1996, n. 61 e richiamato nel PNRF 3 , vieta di regola alle stazioni radioamatoriali l'uso di codici o cifrari il cui scopo sia nascondere il significato delle comunicazioni, con la sola eccezione dei segnali di controllo verso satelliti radioamatoriali 6 . La normativa italiana sui radioamatori (allegato 26 al Codice delle comunicazioni elettroniche, più volte modificato, tra cui dal decreto ministeriale 21 luglio 2005 5 ) lega l'uso della banda radioamatoriale all'identificazione della stazione con il nominativo assegnato:…"
  },
  {
    "id": "normativa--faq-sulla-normativa",
    "page": "Normativa",
    "title": "FAQ sulla normativa",
    "url": "https://meshcore-ita.github.io/normativa/#faq-sulla-normativa",
    "text": "Per la configurazione del preset radio vedi preset radio MeshCore Italia ; per l'installazione di un nodo fisso vedi installare un repeater ; per altri dubbi tecnici vedi le FAQ . Riferimenti"
  },
  {
    "id": "normativa--fonti",
    "page": "Normativa",
    "title": "Fonti",
    "url": "https://meshcore-ita.github.io/normativa/#fonti",
    "text": "ETSI, EN 300 220-2 V3.2.1 — Short Range Devices (SRD) operating in the frequency range 25 MHz to 1 000 MHz; Part 2 , Annex B, 2018-06. etsi.org ↗ ETSI, EN 300 220-1 V3.1.1 — Short Range Devices (SRD) operating in the frequency range 25 MHz to 1 000 MHz; Part 1 , clausola 5.2.1-5.2.2, 2017-02. etsi.org ↗ Ministero dello Sviluppo Economico, decreto 31 agosto 2022, Piano nazionale di ripartizione delle frequenze tra 0 e 3000 GHz , Gazzetta Ufficiale n. 214 del 13 settembre 2022, Supplemento ordinario n. 35. gazzettaufficiale.it ↗ Decreto legislativo 1° agosto 2003, n. 259, Codice delle comunicazioni elettroniche . bosettiegatti.eu ↗ Ministro delle comunicazioni, decreto 21 luglio 2005,…"
  },
  {
    "id": "link-budget--perche-due-nodi-con-margine-di-segnale-abbondante-a-volte-non-si-sentono-comunque",
    "page": "Portata e link budget",
    "title": "Perché due nodi con margine di segnale abbondante a volte non si sentono comunque?",
    "url": "https://meshcore-ita.github.io/link-budget/#perche-due-nodi-con-margine-di-segnale-abbondante-a-volte-non-si-sentono-comunque",
    "text": "Perché il calcolo di margine basato sulla sola perdita di spazio libero (FSPL) ignora gli ostacoli reali. Anche con decine di dB di margine teorico, un edificio, una collina o della vegetazione che invadono la prima zona di Fresnel introducono una perdita di diffrazione aggiuntiva non compresa nella FSPL: in pratica è quasi sempre la linea di vista libera, non la potenza disponibile, a limitare la portata reale in Italia."
  },
  {
    "id": "link-budget--qual-e-la-sensibilita-reale-del-preset-radio-italiano",
    "page": "Portata e link budget",
    "title": "Qual è la sensibilità reale del preset radio italiano?",
    "url": "https://meshcore-ita.github.io/link-budget/#qual-e-la-sensibilita-reale-del-preset-radio-italiano",
    "text": "Il datasheet del chip SX1262 tabula la sensibilità LoRa in guadagno boosted solo per SF7 e SF12 a banda 10.4, 125, 250 e 500 kHz, non per la combinazione SF8/62.5 kHz del preset italiano. Interpolando linearmente tra i due estremi tabulati a 125 kHz e scalando di circa 3 dB per il dimezzamento della banda a 62.5 kHz si stima una sensibilità di circa -130 dBm."
  },
  {
    "id": "link-budget--conviene-un-cavo-coassiale-lungo-per-portare-l-antenna-piu-in-alto",
    "page": "Portata e link budget",
    "title": "Conviene un cavo coassiale lungo per portare l'antenna più in alto?",
    "url": "https://meshcore-ita.github.io/link-budget/#conviene-un-cavo-coassiale-lungo-per-portare-l-antenna-piu-in-alto",
    "text": "Solo se il guadagno di quota supera la perdita del cavo aggiuntivo. Un cavo economico come l'RG-58 perde oltre 4 dB ogni 10 metri a 869 MHz, quanto quasi dimezzare la potenza trasmessa: per run superiori a pochi metri conviene un cavo a bassa perdita come l'LMR-400, oppure spostare il radio vicino all'antenna e portare giù solo l'alimentazione e i dati."
  },
  {
    "id": "link-budget--un-piccolo-pannello-solare-basta-per-un-nodo-nrf52-sempre-acceso",
    "page": "Portata e link budget",
    "title": "Un piccolo pannello solare basta per un nodo nRF52 sempre acceso?",
    "url": "https://meshcore-ita.github.io/link-budget/#un-piccolo-pannello-solare-basta-per-un-nodo-nrf52-sempre-acceso",
    "text": "Nell'esempio di dimensionamento con un consumo medio di 30 mA a 3.7 V (circa 2.7 Wh al giorno) e l'irraggiamento di dicembre nel Nord Italia su un pannello inclinato per l'inverno, bastano pochi Watt di picco per coprire il fabbisogno con margine; la scelta pratica tipica da 5-10 W lascia comunque ampio margine per giornate nuvolose consecutive e perdite del regolatore di carica."
  },
  {
    "id": "link-budget--perche-la-portata-non-si-stima-in-chilometri",
    "page": "Portata e link budget",
    "title": "Perché la portata non si stima in chilometri",
    "url": "https://meshcore-ita.github.io/link-budget/#perche-la-portata-non-si-stima-in-chilometri",
    "text": "Un collegamento radio funziona se, sommando guadagni e perdite in dB, il segnale arriva al ricevitore sopra la sua soglia minima di sensibilità. Il link budget di un collegamento wireless è la somma algebrica di tutti i guadagni e le perdite tra il trasmettitore e il ricevitore. Nella forma generale usata dalle note applicative Semtech per LoRa 1 è: P_rx = P_tx + G_sistema − L_sistema − L_canale − M dove M è un margine di fading aggiuntivo. Per un collegamento punto-punto con antenna e cavo distinti su entrambi i lati, la stessa equazione si riscrive nella forma pratica usata in questa pagina: P_tx + G_tx − L_cavo_tx + G_rx − L_cavo_rx − L_path ≥ sensibilità del ricevitore Se il risultato…"
  },
  {
    "id": "link-budget--sensibilita-del-chip-sx1262-sul-preset-italiano",
    "page": "Portata e link budget",
    "title": "Sensibilità del chip SX1262 sul preset italiano",
    "url": "https://meshcore-ita.github.io/link-budget/#sensibilita-del-chip-sx1262-sul-preset-italiano",
    "text": "Il datasheet non tabula direttamente SF8 a 62.5 kHz: la sensibilità del preset condiviso va ricavata per interpolazione. La Tabella 3-8 \"Receive Mode Specifications\" del datasheet Semtech SX1261/2 (pagina 19 di 111) riporta la sensibilità LoRa a guadagno boosted solo per gli estremi SF7 e SF12, alle bande 10.4, 125, 250 e 500 kHz 2 . Né SF8 né la banda 62.5 kHz del preset italiano compaiono come riga propria. Il valore più vicino tabulato è la banda 125 kHz: -124 dBm a SF7, -137 dBm a SF12. Interpolando linearmente tra i due estremi (passo di circa 2.6 dB per spreading factor) e poi scalando di -3 dB per il dimezzamento della banda da 125 a 62.5 kHz — dimezzare la banda dimezza la potenza…"
  },
  {
    "id": "link-budget--perdita-di-spazio-libero-a-869-mhz",
    "page": "Portata e link budget",
    "title": "Perdita di spazio libero a 869 MHz",
    "url": "https://meshcore-ita.github.io/link-budget/#perdita-di-spazio-libero-a-869-mhz",
    "text": "La FSPL da sola lascia margini enormi anche a 50 km: quasi mai è lei a fermare un collegamento MeshCore in Italia. La perdita di spazio libero (free space path loss, FSPL) in decibel è FSPL = 20·log₁₀(d_km) + 20·log₁₀(f_MHz) + 32.44 . Applicandola a 869.618 MHz, con il limite di potenza di 500 mW ERP (27 dBm ERP) della sub-banda 869.4-869.65 MHz 3 — limiti approfonditi nella pagina sulla normativa delle sub-bande libere — e la sensibilità stimata di circa -129.6 dBm per SF8/BW62.5 kHz: FSPL e margine teorico a 869.618 MHz, 27 dBm ERP, sensibilità -129.6 dBm Distanza FSPL Margine (antenne unitarie, no ostacoli) 1 km 91.2 dB +65.4 dB 5 km 105.2 dB +51.4 dB 10 km 111.2 dB +45.4 dB 20 km 117.3…"
  },
  {
    "id": "link-budget--quanto-costa-in-db-il-cavo-coassiale",
    "page": "Portata e link budget",
    "title": "Quanto costa in dB il cavo coassiale",
    "url": "https://meshcore-ita.github.io/link-budget/#quanto-costa-in-db-il-cavo-coassiale",
    "text": "Un cavo economico può vanificare in pochi metri il guadagno di un'antenna migliore. Perdita indicativa per 10 m di cavo coassiale a ~869-900 MHz Cavo Perdita / 10 m Fonte RG-58 ≈4.3 dB Crown Electronics, 13 dB/100 ft a 900 MHz (valore tabulato più vicino) 7 RG-213 ≈2.5 dB FeedFlex RG213/U, 24.9 dB/100 m a 900 MHz (valore tabulato più vicino) 6 LMR-400 ≈1.3 dB Times Microwave, formula datasheet a 869.618 MHz 5 4.3 dB persi in soli 10 m di RG-58 equivalgono a lasciare a terra più di due terzi della potenza trasmessa. La regola pratica resta la stessa: tenere il cavo il più corto possibile, e se la distanza tra radio e antenna è superiore a qualche metro conviene un cavo a bassa perdita come…"
  },
  {
    "id": "link-budget--strumenti-gratuiti-per-simulare-la-copertura",
    "page": "Portata e link budget",
    "title": "Strumenti gratuiti per simulare la copertura",
    "url": "https://meshcore-ita.github.io/link-budget/#strumenti-gratuiti-per-simulare-la-copertura",
    "text": "Simulano il percorso su un modello del terreno, non sostituiscono una verifica sul campo."
  },
  {
    "id": "link-budget--heywhatsthat-8",
    "page": "Portata e link budget",
    "title": "HeyWhatsThat 8",
    "url": "https://meshcore-ita.github.io/link-budget/#heywhatsthat-8",
    "text": "Calcola il profilo altimetrico e la linea di vista da un punto verso qualsiasi direzione, gratis e senza installazione, usando dati di elevazione globali. Utile per un primo controllo rapido degli ostacoli tra due siti candidati."
  },
  {
    "id": "link-budget--radio-mobile-online-9",
    "page": "Portata e link budget",
    "title": "Radio Mobile Online 9",
    "url": "https://meshcore-ita.github.io/link-budget/#radio-mobile-online-9",
    "text": "Software dedicato alla radioamatoriale che simula un collegamento punto-punto o la copertura di un repeater su terreno digitale, con parametri di frequenza, potenza e antenna configurabili."
  },
  {
    "id": "link-budget--splat-10",
    "page": "Portata e link budget",
    "title": "SPLAT! 10",
    "url": "https://meshcore-ita.github.io/link-budget/#splat-10",
    "text": "Strumento open source a riga di comando (Longley-Rice) per l'analisi di percorso e la mappa di copertura di un repeater, tra 20 MHz e 20 GHz. Più tecnico dei precedenti, adatto a chi vuole automatizzare più simulazioni. Questi strumenti stimano la copertura teorica sul modello del terreno: non sanno nulla di un edificio costruito di recente, della vegetazione stagionale o di un'antenna montata più bassa del previsto. Il riscontro definitivo resta il confronto con la mappa pubblica dei nodi effettivamente attivi e, meglio ancora, un test sul campo con neighbors e stats-radio come descritto nella guida all'installazione di un repeater. Alimentazione"
  },
  {
    "id": "link-budget--dimensionare-un-pannello-solare-con-pvgis",
    "page": "Portata e link budget",
    "title": "Dimensionare un pannello solare con PVGIS",
    "url": "https://meshcore-ita.github.io/link-budget/#dimensionare-un-pannello-solare-con-pvgis",
    "text": "Esempio di calcolo per un nodo nRF52 a basso consumo nel mese più sfavorevole, dicembre nel Nord Italia. Il tool gratuito PVGIS della Commissione Europea 11 fornisce l'irraggiamento medio mensile per qualunque punto, su un piano inclinato a scelta. Esempio di dimensionamento, con ipotesi esplicite: Esempio: nodo nRF52, consumo medio dichiarato 30 mA a 3.7 V, dicembre, Torino Grandezza Valore Ipotesi Consumo medio 30 mA × 3.7 V = 111 mW Valore medio dichiarato dall'utente con powersaving on , non il picco in trasmissione Fabbisogno giornaliero 111 mW × 24 h ≈ 2.7 Wh/giorno Consumo costante nelle 24 ore Irraggiamento dicembre ≈3.6 kWh/m²/giorno Pannello inclinato 60° verso sud, media…"
  },
  {
    "id": "link-budget--faq-su-portata-e-link-budget",
    "page": "Portata e link budget",
    "title": "FAQ su portata e link budget",
    "url": "https://meshcore-ita.github.io/link-budget/#faq-su-portata-e-link-budget",
    "text": "Riferimenti"
  },
  {
    "id": "link-budget--fonti",
    "page": "Portata e link budget",
    "title": "Fonti",
    "url": "https://meshcore-ita.github.io/link-budget/#fonti",
    "text": "Semtech Corporation, AN1200.22 LoRa Modulation Basics , Revision 2, maggio 2015 (§5.3 Link Budget, §4.2 rumore/sensibilità). ea1jao.com/wp-content/uploads/2024/02/an1200.22.pdf Semtech Corporation, SX1261/2 datasheet , Rev. 1.2, giugno 2019, Tabella 3-8 \"Receive Mode Specifications\" (p. 19/111), §6.1.4 \"LoRa Time-on-Air\" (p. 41/111), nota LDRO (p. 39/111). cdn.sparkfun.com/assets/6/b/5/1/4/SX1262_datasheet.pdf ETSI, EN 300 220-2 V3.2.1 , giugno 2018 (limiti di potenza ERP e duty cycle per SRD 863-876 MHz). etsi.org/deliver/.../en_30022002v030201p.pdf ITU-R, Recommendation ITU-R P.526-16, Propagation by diffraction , novembre 2025 (§2.1 raggio zona di Fresnel, §2.3/2.5 criterio del 60% di…"
  },
  {
    "id": "blog/wiki-e-aggiornamenti--cosa-cambia",
    "page": "Aggiornamenti",
    "title": "Cosa cambia",
    "url": "https://meshcore-ita.github.io/blog/wiki-e-aggiornamenti/#cosa-cambia",
    "text": "Da oggi il sito ha una sezione Aggiornamenti (questa che stai leggendo): una serie di post per raccontare novità sul sito, sulla documentazione e sulla community, senza dover infilare tutto nelle pagine di riferimento esistenti. Insieme alla sezione Aggiornamenti arrivano tre cose: Un feed Atom , su /feed.xml . Se usi un lettore RSS/Atom puoi iscriverti lì e sapere quando esce un nuovo post, senza dover controllare il sito a mano. Ogni voce del feed contiene titolo, data di pubblicazione e riassunto del post. La ricerca interna , richiamabile dal pulsante di ricerca nell'header o dalla dialog che si apre in ogni pagina del sito. Cerca nel testo delle pagine di documentazione e dei post,…"
  },
  {
    "id": "blog/wiki-e-aggiornamenti--cosa-non-cambia",
    "page": "Aggiornamenti",
    "title": "Cosa non cambia",
    "url": "https://meshcore-ita.github.io/blog/wiki-e-aggiornamenti/#cosa-non-cambia",
    "text": "Nessun URL esistente è cambiato. /guida/ , /hardware/ , /preset-radio/ , /comandi/ e tutte le altre pagine restano agli stessi indirizzi di sempre. Se hai un link salvato o condiviso da qualche parte, continua a funzionare."
  },
  {
    "id": "blog/wiki-e-aggiornamenti--come-contribuire",
    "page": "Aggiornamenti",
    "title": "Come contribuire",
    "url": "https://meshcore-ita.github.io/blog/wiki-e-aggiornamenti/#come-contribuire",
    "text": "Il modo per contribuire resta lo stesso di sempre: ogni pagina del sito ha in fondo il link \"Modifica questa pagina su GitHub\" , che apre l'editor GitHub sul file sorgente corretto. Al salvataggio, GitHub propone di aprire una pull request. La novità è che, oltre alle pagine di documentazione esistenti (scritte in HTML), ora è possibile scrivere nuovi contenuti in markdown : sia nuove pagine, sia post come questo. Il markdown è più semplice da scrivere e da revisionare in una pull request rispetto all'HTML, quindi è il formato consigliato per chi vuole proporre qualcosa di nuovo. Se vuoi scrivere un post per gli Aggiornamenti, trovi la guida pratica nel prossimo post di questa sezione."
  },
  {
    "id": "blog/wiki-e-aggiornamenti--dove-trovarci",
    "page": "Aggiornamenti",
    "title": "Dove trovarci",
    "url": "https://meshcore-ita.github.io/blog/wiki-e-aggiornamenti/#dove-trovarci",
    "text": "Le discussioni sulla documentazione, sul sito e sulla rete in generale avvengono su GitHub (repository meshcore-ita ) e sul gruppo Telegram pubblico MeshCore ITA , aperto a chiunque senza bisogno di invito. Se hai domande, correzioni o proposte, sono i due posti giusti dove portarle."
  },
  {
    "id": "blog/come-scrivere-un-post--dove-sta-il-file",
    "page": "Aggiornamenti",
    "title": "Dove sta il file",
    "url": "https://meshcore-ita.github.io/blog/come-scrivere-un-post/#dove-sta-il-file",
    "text": "Ogni post della sezione Aggiornamenti è un file markdown dentro content/blog/ . Il nome del file diventa l'URL del post: un file content/blog/mio-post.md finisce pubblicato su /blog/mio-post/ . Per scriverne uno nuovo: Crea un file content/blog/<slug>.md , dove <slug> è il nome che vuoi dare al post (minuscolo, parole separate da trattino). Il file inizia con un blocco di meta dati, poi il corpo in markdown. Rigenera il sito e committa l'output."
  },
  {
    "id": "blog/come-scrivere-un-post--il-blocco-meta",
    "page": "Aggiornamenti",
    "title": "Il blocco meta",
    "url": "https://meshcore-ita.github.io/blog/come-scrivere-un-post/#il-blocco-meta",
    "text": "Come per le pagine di documentazione, il file inizia con un commento <!--meta { ... } --> contenente un oggetto JSON. Per un post servono queste chiavi: slug : deve essere identico al nome del file , senza estensione. Se il file è come-scrivere-un-post.md , slug deve valere \"come-scrivere-un-post\" . title : titolo per il tag <title> e per i motori di ricerca. description : riassunto breve, usato come meta description. h1 : titolo mostrato in cima al post. lede : sottotitolo/riassunto mostrato sotto l' h1 e nella lista dei post. published : data di pubblicazione, formato AAAA-MM-GG . Sono opzionali: updated : data di ultimo aggiornamento, se diversa da published . author : di default è…"
  },
  {
    "id": "blog/come-scrivere-un-post--il-corpo",
    "page": "Aggiornamenti",
    "title": "Il corpo",
    "url": "https://meshcore-ita.github.io/blog/come-scrivere-un-post/#il-corpo",
    "text": "Dopo il blocco meta, il resto del file è markdown normale (GFM: titoli, liste, tabelle, link, blocchi di codice, grassetto/corsivo). Niente HTML grezzo: il markdown viene convertito automaticamente in HTML dalla build, seguendo lo stile del sito. Usa ## per i titoli di sezione (l' h1 lo genera già il layout dal campo h1 del meta). Mantieni lo stesso registro delle altre pagine del sito: italiano tecnico, diretto, frasi brevi, niente marketing."
  },
  {
    "id": "blog/come-scrivere-un-post--pubblicare-il-post",
    "page": "Aggiornamenti",
    "title": "Pubblicare il post",
    "url": "https://meshcore-ita.github.io/blog/come-scrivere-un-post/#pubblicare-il-post",
    "text": "Dopo aver scritto il file: node build.mjs # rigenera il sito, incluso /blog/ e il feed node build.mjs --check # deve uscire 0: è lo stesso gate della CI Committa sia il file sorgente in content/blog/ sia tutti i file generati che cambiano ( blog/ , feed.xml , search-index.json e l'eventuale sitemap). La CI esegue node build.mjs --check su ogni pull request e la rifiuta se i file generati non corrispondono ai sorgenti. Se preferisci non usare la riga di comando, il link \"Modifica questa pagina su GitHub\" in fondo a ogni pagina apre comunque l'editor web e produce una pull request: in quel caso è chi revisiona la PR a rigenerare e verificare i file di output."
  }
];
