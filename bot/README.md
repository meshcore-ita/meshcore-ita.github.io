# Bot Telegram — MeshCore ITA

Runtime Node.js (≥20), zero dipendenze npm, per il bot `@meshcore_ita_bot`
del gruppo [MeshCore ITA](https://t.me/meshcore_ita).

## Contenuto

- `content.mjs` — testi delle risposte (HTML) ed elenco dei 28 topic del forum.
- `bot.mjs` — runtime long-polling: risponde ai comandi in chat.
- `setup-topics.mjs` — script one-shot per creare i topic del forum nel gruppo.
- `meshcore-ita-bot.service` — unit systemd `--user` per tenere il bot attivo.
- `topics.created.json` — **generato** da `setup-topics.mjs`, non va committato:
  tiene traccia dei topic già creati per rendere lo script rieseguibile.

## Token del bot

Il token **non va mai committato**. Va passato in uno dei due modi:

- variabile d'ambiente `TELEGRAM_BOT_TOKEN`;
- oppure `TELEGRAM_BOT_TOKEN_FILE=/percorso/al/file`, un file di testo che
  contiene solo il token (lo script lo legge e fa `trim()`).

Senza nessuna delle due, `bot.mjs` e `setup-topics.mjs` terminano subito con
un messaggio d'errore chiaro.

Consigliato: `TELEGRAM_CHAT_ID`, l'id del gruppo MeshCore ITA. Limita le
risposte nei gruppi a quello configurato; le chat private restano sempre
ammesse indipendentemente da questa variabile (`isAllowedChat` in
`routing.mjs`, condivisa col Worker webhook).

Opzionale: `TELEGRAM_HELP_TOPIC_ID` — `message_thread_id` del topic in cui il
bot risponde ai comandi (default `17`, "Supporto e troubleshooting"). Fuori da
quel topic i comandi vengono ignorati e loggati come
`/cmd ignorato chat=… thread=…`: se i topic vengono ricreati, l'id corretto si
legge da quel log (o dall'URL `t.me/meshcore_ita/<id>` del topic) e si imposta
qui. In chat privata col bot i comandi funzionano sempre.

Questo runtime gestisce solo i comandi fissi: `/chiedi` e le risposte AI a
una menzione del bot sono disponibili solo tramite il Worker webhook (vedi
`worker/README.md`), non qui.

## Avvio del bot

```sh
TELEGRAM_BOT_TOKEN=xxxxx node bot/bot.mjs
```

Per l'esecuzione continua vedi `meshcore-ita-bot.service`
(`systemctl --user enable --now meshcore-ita-bot.service`).

## Creazione dei topic

```sh
node bot/setup-topics.mjs --dry-run   # mostra il piano, nessuna chiamata API
TELEGRAM_BOT_TOKEN=xxxxx node bot/setup-topics.mjs
```

Prerequisiti nel gruppo: "Argomenti" (Topics) attivo e il bot con il
permesso amministratore "Gestisci argomenti" — altrimenti lo script si
ferma e stampa le istruzioni in italiano per l'owner del gruppo.

## Comandi registrati

`/preset` `/inizia` `/hardware` `/ruoli` `/nomi` `/normativa` `/link`
`/regole` `/regioni` `/cli` `/problemi` `/app`
