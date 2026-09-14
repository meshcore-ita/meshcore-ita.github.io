// Cloudflare Worker: bot Telegram MeshCore ITA in modalità webhook.
// Stessi testi del runtime long-polling (bot/content.mjs), nessuna dipendenza.
//
// Secret richiesti (wrangler secret put ...):
//   TELEGRAM_BOT_TOKEN     token del bot
//   TELEGRAM_WEBHOOK_SECRET valore passato a setWebhook come secret_token
// Variabile opzionale:
//   TELEGRAM_CHAT_ID       se impostata, il bot risponde solo in quella chat
import { REPLIES } from '../bot/content.mjs';
import { BOT_USERNAME, DEFAULT_HELP_TOPIC_ID, isAllowedThread, parseCommand, sendWithRetry } from '../bot/routing.mjs';
import { KB_CHUNKS } from './kb.generated.mjs';

const COMMANDS = new Set(Object.keys(REPLIES));

// Testo libero rivolto al bot: "/chiedi <domanda>" oppure una menzione
// @meshcore_ita_bot. Con privacy mode attiva sono gli unici messaggi che il
// bot riceve, quindi non serve altro filtro.
function parseQuestion(text) {
  if (typeof text !== 'string') return null;
  const asked = /^\/chiedi(@meshcore_ita_bot)?\b/i.test(text)
    ? text.replace(/^\/chiedi(@meshcore_ita_bot)?\s*/i, '')
    : text.includes(`@${BOT_USERNAME}`)
      ? text.replaceAll(`@${BOT_USERNAME}`, ' ').trim()
      : null;
  if (!asked) return null;
  const q = asked.trim();
  return q.length >= 3 && q.length <= 400 ? q : null;
}

const stripTags = (s) => s.replace(/<[^>]+>/g, '');

// La base di conoscenza sempre presente è quella dei comandi: il modello non
// deve sapere niente che non sia già stato verificato e pubblicato.
const BASE_KB = Object.entries(REPLIES)
  .map(([k, v]) => `### /${k}\n${stripTags(v)}`)
  .join('\n\n');

// --- retrieval sulle pagine del sito (worker/kb.generated.mjs) ----------
// Le pagine content/*.html sono ~9000 parole in totale: troppe per essere
// incluse per intero a ogni richiesta. Invece cerchiamo per sovrapposizione
// di termini i pochi frammenti (chunk) più pertinenti alla domanda e li
// aggiungiamo alla base di conoscenza solo per quella richiesta.
const STOPWORDS = new Set([
  'a', 'ad', 'agli', 'ai', 'al', 'alla', 'alle', 'allo', 'anche', 'avere',
  'che', 'chi', 'ci', 'cio', 'come', 'con', 'cosa', 'cui', 'da', 'dal',
  'dalla', 'dalle', 'dallo', 'dei', 'del', 'della', 'delle', 'dello', 'di',
  'dov', 'dove', 'e', 'ed', 'essere', 'fra', 'gli', 'ha', 'hai', 'hanno',
  'ho', 'i', 'il', 'in', 'io', 'la', 'le', 'lei', 'lo', 'loro', 'lui', 'ma',
  'mi', 'mio', 'ne', 'nei', 'nel', 'nella', 'nelle', 'nello', 'non', 'noi',
  'nostro', 'o', 'per', 'perche', 'però', 'piu', 'poco', 'qual', 'quale', 'quali',
  'quanto', 'quanti', 'quanta', 'quante',
  'quando', 'quello', 'questa', 'questi', 'questo', 'qui', 'se', 'si', 'sia',
  'sono', 'su', 'sua', 'sue', 'sugli', 'sui', 'sul', 'sulla', 'sulle',
  'sullo', 'suo', 'suoi', 'ti', 'tra', 'tu', 'tua', 'tuo', 'tutti', 'tutto',
  'un', 'una', 'uno', 'vi', 'voi', 'vostro',
]);

// Minuscolo, senza accenti, senza punteggiatura.
function normalize(text) {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return normalize(text)
    .split(' ')
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function ngrams(tokens, n) {
  const result = [];
  for (let i = 0; i + n <= tokens.length; i += 1) result.push(tokens.slice(i, i + n).join(' '));
  return result;
}

// Indice minimo pre-tokenizzato, costruito una sola volta all'avvio del
// Worker: nessuna struttura derivata più pesante dei chunk stessi.
const KB_INDEX = KB_CHUNKS.map((chunk) => {
  const titleTokens = tokenize(chunk.title);
  const textTokens = tokenize(chunk.text);
  return {
    chunk,
    titleTokens,
    textTokens,
    titleTokenSet: new Set(titleTokens),
    textTokenSet: new Set(textTokens),
  };
});

function phraseBonus(queryTokens, chunkTokens) {
  if (chunkTokens.length === 0) return 0;
  const joined = chunkTokens.join(' ');
  let bonus = 0;
  for (const n of [2, 3]) {
    for (const gram of ngrams(queryTokens, n)) {
      if (joined.includes(gram)) bonus += n;
    }
  }
  return bonus;
}

function scoreEntry(entry, queryTokens, queryTokenSet) {
  let score = 0;
  for (const t of queryTokenSet) {
    if (entry.titleTokenSet.has(t)) score += 3;
    if (entry.textTokenSet.has(t)) score += 1;
  }
  score += phraseBonus(queryTokens, entry.titleTokens) * 2;
  score += phraseBonus(queryTokens, entry.textTokens);
  return score;
}

const KB_MIN_SCORE = 3;
const KB_MAX_CHUNKS = 4;
const KB_CHAR_BUDGET = 4000;

// Top 3-4 chunk pertinenti alla domanda, entro un budget di caratteri.
// Nessun risultato sopra soglia -> array vuoto: niente contenuto irrilevante.
function retrieveChunks(question) {
  const queryTokens = tokenize(question);
  if (queryTokens.length === 0) return [];
  const queryTokenSet = new Set(queryTokens);

  const scored = KB_INDEX.map((entry) => ({ entry, score: scoreEntry(entry, queryTokens, queryTokenSet) }))
    .filter((s) => s.score >= KB_MIN_SCORE)
    .sort((a, b) => b.score - a.score);

  const picked = [];
  let budget = KB_CHAR_BUDGET;
  for (const { entry } of scored) {
    if (picked.length >= KB_MAX_CHUNKS) break;
    const cost = entry.chunk.title.length + entry.chunk.text.length + entry.chunk.url.length;
    if (cost > budget) continue;
    picked.push(entry.chunk);
    budget -= cost;
  }
  return picked;
}

function formatRetrievedSection(chunks) {
  if (chunks.length === 0) return '';
  const body = chunks
    .map((c) => `### ${c.title} (${c.page})\nURL: ${c.url}\n${c.text}`)
    .join('\n\n');
  return `\n\nAPPROFONDIMENTI DAL SITO (usali solo se pertinenti alla domanda; se la risposta si basa su uno di questi, chiudi con l'URL indicato sopra quel frammento)\n${body}`;
}

const SYSTEM_BASE = `Sei l'assistente del gruppo Telegram MeshCore ITA, community italiana indipendente di MeshCore (rete mesh LoRa off-grid).
Rispondi SOLO in italiano, in massimo 6 righe, senza saluti né chiacchiere.
Usa esclusivamente le informazioni nella BASE DI CONOSCENZA qui sotto.
Regole non negoziabili:
- Non inventare MAI frequenze, parametri radio, limiti di potenza o comandi. Se un valore non è nella base di conoscenza, dì che non lo sai e rimanda a https://docs.meshcore.io/ .
- Il preset corretto è esattamente 869.618 MHz / SF8 / BW 62.5 kHz / CR8 (EU/UK Narrow). Riportalo alla lettera quando serve.
- Quando esiste un comando che copre la domanda, suggeriscilo (es. /preset, /cli, /problemi, /app, /hardware, /ruoli, /nomi, /normativa, /link, /regole, /regioni).
- Non inventare MAI un URL: puoi citarne uno solo se è tra quelli forniti nella base di conoscenza o negli approfondimenti qui sotto, e solo se la risposta lo usa davvero.
- Niente Markdown e niente tag HTML: solo testo semplice.

BASE DI CONOSCENZA
${BASE_KB}`;

function buildSystemPrompt(question) {
  return `${SYSTEM_BASE}${formatRetrievedSection(retrieveChunks(question))}`;
}

// Esportate solo per test/tooling (es. script di verifica della retrieval);
// il Worker in produzione usa esclusivamente l'export default sotto.
export { retrieveChunks, buildSystemPrompt };

async function answerWithAI(env, question) {
  const res = await env.AI.run('@cf/meta/llama-3.3-70b-instruct-fp8-fast', {
    messages: [
      { role: 'system', content: buildSystemPrompt(question) },
      { role: 'user', content: question },
    ],
    max_tokens: 320,
    temperature: 0.2,
  });
  const text = (res?.response ?? '').trim();
  return text || 'Non ho una risposta affidabile. Prova con /link oppure scrivi nel topic Supporto e troubleshooting.';
}

// Quota Workers AI: senza limiti, un singolo utente può bruciare i neuron
// giornalieri e spegnere le risposte AI per tutto il gruppo. Il contatore vive
// nell'isolate (niente KV da configurare): limita il caso realistico, cioè lo
// spam a raffica, non un attacco distribuito.
const AI_USER_PER_HOUR = 6;
const AI_CHAT_PER_HOUR = 30;
const AI_HOUR_MS = 3600_000;
const aiHits = new Map(); // chiave -> array di timestamp

function allowAi(key, limit, now) {
  const hits = (aiHits.get(key) ?? []).filter((t) => now - t < AI_HOUR_MS);
  if (hits.length >= limit) {
    aiHits.set(key, hits);
    return false;
  }
  hits.push(now);
  aiHits.set(key, hits);
  return true;
}

function aiQuotaOk(message) {
  const now = Date.now();
  const chatKey = `c:${message.chat.id}`;
  const userKey = `u:${message.from?.id ?? 'anon'}`;
  return allowAi(chatKey, AI_CHAT_PER_HOUR, now) && allowAi(userKey, AI_USER_PER_HOUR, now);
}

// Invio con ritentativi: il Worker risponde 200 subito, quindi Telegram non
// riconsegna l'update e una risposta persa è persa per sempre.
async function sendMessage(token, payload) {
  const attempt = async () => {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    return {
      ok: res.ok && data.ok !== false,
      status: res.status,
      retryAfter: data.parameters && data.parameters.retry_after,
    };
  };
  const sent = await sendWithRetry(attempt);
  if (!sent.ok) console.error(`sendMessage fallita: ${sent.error}`);
  return sent.ok;
}

export default {
  async fetch(request, env, ctx) {
    if (request.method !== 'POST') return new Response('ok', { status: 200 });
    if (request.headers.get('x-telegram-bot-api-secret-token') !== env.TELEGRAM_WEBHOOK_SECRET) {
      return new Response('forbidden', { status: 403 });
    }

    const update = await request.json().catch(() => null);
    const message = update?.message;
    if (!message?.chat) return new Response('ok');

    const chatId = String(message.chat.id);
    if (env.TELEGRAM_CHAT_ID && chatId !== String(env.TELEGRAM_CHAT_ID)) return new Response('ok');

    // Stesso confine del runtime long polling: fuori dal topic di supporto
    // (e fuori dalla chat privata) il bot non risponde.
    const helpTopicId = Number(env.TELEGRAM_HELP_TOPIC_ID ?? DEFAULT_HELP_TOPIC_ID);
    if (!isAllowedThread(message, helpTopicId)) return new Response('ok');

    const command = parseCommand(message.text, COMMANDS);
    const question = command ? null : parseQuestion(message.text);
    if (!command && !question) return new Response('ok');

    const base = {
      chat_id: message.chat.id,
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    };
    if (message.message_thread_id) base.message_thread_id = message.message_thread_id;

    if (command) {
      ctx.waitUntil(sendMessage(env.TELEGRAM_BOT_TOKEN, { ...base, text: REPLIES[command] }));
      return new Response('ok');
    }

    if (!aiQuotaOk(message)) {
      ctx.waitUntil(
        sendMessage(env.TELEGRAM_BOT_TOKEN, {
          ...base,
          text: 'Troppe domande di fila: riprova tra qualche minuto. Nel frattempo usa /link o i comandi del bot.',
          parse_mode: undefined,
        })
      );
      return new Response('ok');
    }

    // Risposta AI: testo semplice, nessun tag da escapare.
    ctx.waitUntil(
      answerWithAI(env, question)
        .then((text) => sendMessage(env.TELEGRAM_BOT_TOKEN, { ...base, text, parse_mode: undefined }))
        .catch(async (err) => {
          console.error(`AI error: ${err.message}`);
          await sendMessage(env.TELEGRAM_BOT_TOKEN, {
            ...base,
            text: 'Al momento non riesco a rispondere. Usa /link o scrivi nel topic Supporto e troubleshooting.',
            parse_mode: undefined,
          });
        }),
    );
    return new Response('ok');
  },
};
