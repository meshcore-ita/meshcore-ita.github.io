# Bot su Cloudflare Workers (webhook)

Alternativa serverless al runtime long-polling `bot/bot.mjs`: nessuna macchina
sempre accesa, Telegram consegna gli update al Worker via webhook. I testi
delle risposte restano quelli di `bot/content.mjs`, condivisi dai due runtime.

## Contenuto

| File | Ruolo |
|---|---|
| `worker.mjs` | handler `fetch`: valida il secret, riconosce il comando, risponde |
| `wrangler.toml` | configurazione del Worker (`TELEGRAM_CHAT_ID` come var) |
| `set-webhook.mjs` | registra / rimuove / ispeziona il webhook su Telegram |

## Deploy

```sh
cd worker
npx wrangler login                          # apre il browser, autorizza l'account
npx wrangler secret put TELEGRAM_BOT_TOKEN  # incolla il token di @BotFather
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET   # stringa casuale, es. openssl rand -hex 32
npx wrangler deploy                         # stampa l'URL https://meshcore-ita-bot.<subdomain>.workers.dev
```

Poi si punta Telegram al Worker (dalla radice del repo):

```sh
TELEGRAM_BOT_TOKEN_FILE=~/.config/meshcore-ita/token \
TELEGRAM_WEBHOOK_SECRET=<lo stesso segreto> \
node worker/set-webhook.mjs https://meshcore-ita-bot.<subdomain>.workers.dev
```

Webhook e long-polling si escludono a vicenda: prima di attivare il webhook
ferma il servizio locale, altrimenti Telegram rifiuta `getUpdates`.

```sh
systemctl --user disable --now meshcore-ita-bot
```

## Verifica e rollback

```sh
node worker/set-webhook.mjs --info     # url, update pendenti, ultimo errore
npx wrangler tail                      # log in tempo reale del Worker
node worker/set-webhook.mjs --delete   # rimuove il webhook
systemctl --user enable --now meshcore-ita-bot   # torna al long-polling
```

## Risposte AI

Oltre ai comandi fissi, il Worker risponde al testo libero con Workers AI
(`@cf/meta/llama-3.3-70b-instruct-fp8-fast`, binding `AI` in `wrangler.toml`):

- `/chiedi <domanda>` oppure un messaggio che menziona `@meshcore_ita_bot`
- la domanda deve stare fra 3 e 400 caratteri, altrimenti viene ignorata
- il modello riceve i testi di `bot/content.mjs` (ripuliti dai tag) come base
  sempre presente, più eventuali frammenti pertinenti delle pagine del sito
  (vedi sotto): non può citare comandi, frequenze o URL che non siano già
  stati verificati e pubblicati
- il preset corretto è ripetuto nel system prompt come vincolo esplicito
- se il modello o la quota falliscono, il bot manda un messaggio di fallback e
  i comandi statici continuano a funzionare

Il free tier di Workers AI include 10.000 neuron al giorno; superata la quota
le chiamate AI falliscono ma i comandi restano operativi. Per disattivare la
funzione basta rimuovere la sezione `[ai]` da `wrangler.toml` e rideployare.

## Base di conoscenza dal sito

Oltre ai comandi, il Worker cerca nelle pagine `content/*.html` i frammenti
pertinenti alla domanda:

- `build.mjs` divide ogni pagina in frammenti (uno per sezione `<h2>`/`<h3>`,
  più uno per ogni domanda `<details class="faq">`) e li scrive in
  `worker/kb.generated.mjs`, un modulo generato — non modificarlo a mano,
  rilanciare `node build.mjs` dopo ogni modifica a `content/*.html`
- a runtime, `worker.mjs` normalizza la domanda (minuscolo, senza accenti,
  senza stopword italiane) e assegna un punteggio ai frammenti per
  sovrapposizione di termini (i match nel titolo pesano più di quelli nel
  testo, più un bonus per le frasi multi-parola)
- i 3-4 frammenti col punteggio più alto, entro un budget di ~4000 caratteri,
  vengono aggiunti al system prompt sotto un'intestazione dedicata; se nessun
  frammento supera la soglia minima, il prompt resta solo la base dei comandi
- il modello può chiudere la risposta con l'URL della pagina d'origine solo
  se l'ha davvero usata, e non può mai inventarne uno

`node build.mjs --check` fallisce se `worker/kb.generated.mjs` non è
aggiornato rispetto a `content/*.html`, quindi è coperto dallo stesso
controllo CI degli altri file generati.

## Note

- Il Worker accetta solo POST con header `x-telegram-bot-api-secret-token`
  corrispondente al secret: senza, risponde 403.
- Comandi e risposte AI valgono solo nel topic "Supporto e troubleshooting"
  (`TELEGRAM_HELP_TOPIC_ID`, default 17) e in chat privata: la regola è
  condivisa con il runtime long polling in `bot/routing.mjs`.
- Le domande AI sono limitate a 6 all'ora per utente e 30 all'ora per chat:
  senza limite un solo utente può esaurire la quota giornaliera di Workers AI
  per tutto il gruppo. Il contatore vive nell'isolate del Worker.
- Risponde subito `200` e invia il messaggio in `ctx.waitUntil`, con 3 tentativi
  su 429/5xx/errori di rete: Telegram non riconsegna l'update, quindi un invio
  perso sarebbe perso per sempre.
- Con `TELEGRAM_CHAT_ID` impostata gli update di altre chat vengono ignorati.
- Il piano free copre 100.000 richieste al giorno: per un gruppo di community
  è ampiamente sufficiente.
