// Registra (o rimuove) il webhook Telegram verso il Worker Cloudflare.
//
//   TELEGRAM_BOT_TOKEN_FILE=~/.config/meshcore-ita/token \
//   TELEGRAM_WEBHOOK_SECRET=<stesso segreto del Worker> \
//   node worker/set-webhook.mjs https://meshcore-ita-bot.<subdomain>.workers.dev
//
//   node worker/set-webhook.mjs --delete   torna al long-polling (bot/bot.mjs)
//   node worker/set-webhook.mjs --info     mostra lo stato attuale del webhook
import { readFileSync } from 'node:fs';

function getToken() {
  const env = process.env.TELEGRAM_BOT_TOKEN;
  if (env && env.trim()) return env.trim();
  const file = process.env.TELEGRAM_BOT_TOKEN_FILE;
  if (file) {
    try {
      return readFileSync(file.replace(/^~/, process.env.HOME ?? '~'), 'utf8').trim();
    } catch (err) {
      console.error(`Impossibile leggere ${file}: ${err.message}`);
      process.exit(1);
    }
  }
  console.error('Token mancante: imposta TELEGRAM_BOT_TOKEN oppure TELEGRAM_BOT_TOKEN_FILE.');
  process.exit(1);
}

// Telegram risponde 200 anche su errori applicativi: senza controllare ok
// lo script stampa "undefined" ed esce 0, lasciando il webhook com'era.
async function tg(token, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data || data.ok !== true) {
    console.error(`${method} fallita: HTTP ${res.status} — ${data?.description ?? 'risposta non interpretabile'}`);
    process.exit(1);
  }
  return data;
}

const token = getToken();
const arg = process.argv[2];

if (arg === '--info') {
  console.log(JSON.stringify((await tg(token, 'getWebhookInfo')).result, null, 2));
} else if (arg === '--delete') {
  console.log(JSON.stringify(await tg(token, 'deleteWebhook', { drop_pending_updates: false })));
} else if (arg && arg.startsWith('https://')) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret) {
    console.error('TELEGRAM_WEBHOOK_SECRET mancante: deve coincidere con il secret del Worker.');
    process.exit(1);
  }
  const res = await tg(token, 'setWebhook', {
    url: arg,
    secret_token: secret,
    allowed_updates: ['message'],
    max_connections: 40,
  });
  console.log(JSON.stringify(res));
} else {
  console.error('Uso: node worker/set-webhook.mjs <url-worker> | --delete | --info');
  process.exit(1);
}
