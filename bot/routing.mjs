// Regole di instradamento condivise dai due runtime del bot (long polling in
// bot/bot.mjs, webhook in worker/worker.mjs). Stanno qui perché una divergenza
// fra i due significa un bot che risponde in topic diversi a seconda di dove
// gira.

export const BOT_USERNAME = 'meshcore_ita_bot';

// I comandi sono attivi solo nel topic "Supporto e troubleshooting": il suo
// message_thread_id coincide con l'id del messaggio di creazione del topic
// (t.me/meshcore_ita/17). Override via env se il topic viene ricreato.
export const DEFAULT_HELP_TOPIC_ID = 17;

// '/cli', '/cli@meshcore_ita_bot arg' -> 'cli'; comando rivolto a un altro bot
// o non registrato -> null.
export function parseCommand(text, commands) {
  if (typeof text !== 'string' || text[0] !== '/') return null;
  const [cmd, mention] = text.split(/\s/, 1)[0].slice(1).split('@');
  if (mention && mention.toLowerCase() !== BOT_USERNAME) return null;
  const name = cmd.toLowerCase();
  return commands.has(name) ? name : null;
}

// In chat privata il bot risponde sempre; nei gruppi solo nel topic di
// supporto, così non invade Annunci, Off-topic o i topic regionali.
export function isAllowedThread(message, helpTopicId = DEFAULT_HELP_TOPIC_ID) {
  if (message?.chat?.type === 'private') return true;
  return message?.message_thread_id === helpTopicId;
}

// Un invio fallito per motivi transitori (429, 5xx, rete) va ritentato: senza,
// la risposta va persa e Telegram non la richiede mai più.
export async function sendWithRetry(send, { attempts = 3, sleep } = {}) {
  const wait = sleep ?? ((ms) => new Promise((r) => setTimeout(r, ms)));
  let lastError = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const res = await send();
      if (res.ok) return { ok: true };
      // 400/403 sono errori definitivi: ritentare non cambia la risposta.
      if (res.status && res.status !== 429 && res.status < 500) {
        return { ok: false, error: `HTTP ${res.status}` };
      }
      lastError = `HTTP ${res.status ?? '?'}`;
      const retryAfter = Number(res.retryAfter) || 0;
      if (attempt < attempts) await wait(retryAfter ? retryAfter * 1000 : 500 * 2 ** (attempt - 1));
    } catch (err) {
      lastError = err.message;
      if (attempt < attempts) await wait(500 * 2 ** (attempt - 1));
    }
  }
  return { ok: false, error: lastError };
}
