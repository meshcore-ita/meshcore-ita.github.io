<!--meta
{
  "slug": "mesh-node-configurator-qrmesh",
  "title": "Mesh Node Configurator e QRMesh: due strumenti per le domande che tornano sempre",
  "description": "Dal gruppo arrivano due strumenti web open source: Mesh Node Configurator, per mettere insieme la distinta di un nodo solare con una stima dei costi, e QRMesh, per generare il QR di un canale MeshCore o Meshtastic invece di passarsi le chiavi a mano. C'è anche un bot Telegram.",
  "h1": "Il nodo sul tetto e la chiave del canale",
  "lede": "Cosa mettere in un nodo sul tetto e dove trovare la chiave di un canale sono le due domande che tornano più spesso nel gruppo. Per rispondere Alessandro ha creato Mesh Node Configurator e QRMesh, pubblicati con il codice su GitHub.",
  "published": "2026-10-29",
  "time": "10:00",
  "tags": ["software", "community", "hardware"]
}
-->
## Da dove nascono

Chi passa dal gruppo conosce le due domande: cosa mettere in un nodo
autonomo e dove trovare la chiave di un canale. Due strumenti, presentati
nel gruppo da Alessandro, provano a rispondere in modo
self-service.

Sono due siti web statici, gratuiti e senza registrazione. Il codice è
pubblico nel profilo GitHub [arkanet](https://github.com/arkanet), e la
presentazione completa sta sul blog di Loracity:
[Mesh Node Configurator](https://mesh.loracity.it/mesh-node-configurator-configuratore-open-source-per-nodi-lora-mesh/)
e [QRMesh](https://mesh.loracity.it/qrmesh-un-qr-per-condividere-i-canali-mesh/).

## Mesh Node Configurator: la distinta del nodo

[meshnode.vercel.app](https://meshnode.vercel.app/) ·
[codice](https://github.com/arkanet/MeshNodeConfigurator)

Un nodo autonomo sul tetto non è solo una scheda LoRa: servono batteria,
pannello solare, antenna, magari un filtro e una scatola stagna. Il
configuratore fa scegliere questi pezzi uno alla volta:

- **piattaforma LoRa**, batteria, pannello e accessori di montaggio;
- **antenna e filtro RF**, con avvisi quando specifiche o compatibilità
  non tornano;
- alla fine, una **distinta** con il costo stimato, i link di ricerca e
  l'esportazione in CSV.

Due avvertenze, scritte dall'autore stesso. I prezzi sono **stime
indicative**, non quotazioni aggiornate. I link portano ad AliExpress solo
per comodità di ricerca: **niente affiliazioni** e nessuna commissione.

Il configuratore non è legato a una rete in particolare: tra i riferimenti
cita Meshtastic, DarkMesh e Reticulum. L'hardware però è lo stesso di
MeshCore, quindi la distinta vale anche per un nostro ripetitore. Per
scegliere l'antenna, la nostra [galleria](https://meshcore-ita.github.io/antenne/) ha misure e
simulazioni di quelle costruite dalla community.

## QRMesh: il canale in un QR

[allqrmesh.vercel.app](https://allqrmesh.vercel.app/) ·
[codice](https://github.com/arkanet/QRMesh) ·
bot [@allqrmesh_bot](https://t.me/allqrmesh_bot)

Copiare a mano nome e chiave di un canale è il modo più sicuro per
sbagliare un carattere. QRMesh genera il QR di importazione, da
inquadrare con l'app.

- **SINGOLO**, per **MeshCore** e Meshtastic: si sceglie il protocollo,
  la community e il canale dal catalogo, oppure si inseriscono i dati a
  mano, e si ottiene QR e link.
- **MULTI**, solo Meshtastic: da uno a otto canali (CH0 primario, CH1–CH7
  secondari), anche di community diverse, in un unico QR. Si possono
  aggiungere regione, preset del modem e potenza.

Le stesse funzioni ci sono nel bot Telegram: `/start` apre il menu,
`/qr` e `/link` danno il canale, `/multi` avvia la procedura multicanale,
`/help` spiega il resto.

Una nota che l'autore mette in chiaro e che vale la pena ripetere: le
chiavi dei **canali pubblici non sono segrete**, chiunque le può leggere.
Per le conversazioni private servono un canale con chiave propria o i
messaggi diretti. Prima di importare un QR conviene controllare nome,
chiave e provenienza.

## Contribuire

Entrambi i progetti sono aperti: un dispositivo che manca nel
configuratore, un canale da aggiungere al catalogo di QRMesh o un prezzo
sbagliato si segnalano con una issue sui rispettivi repository.
