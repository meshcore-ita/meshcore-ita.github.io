#!/usr/bin/env node
// Runtime del bot Telegram di MeshCore ITA: long polling, zero dipendenze.
// Token: TELEGRAM_BOT_TOKEN (env) oppure TELEGRAM_BOT_TOKEN_FILE (percorso a un file).
// Opzionale: TELEGRAM_CHAT_ID per rispondere solo in quel gruppo.
// Opzionale: TELEGRAM_HELP_TOPIC_ID per cambiare il topic in cui il bot risponde
// (default: 17, "Supporto e troubleshooting"). In chat privata risponde sempre.

import { readFileSync } from 'node:fs';
import process from 'node:process';
import { REPLIES } from './content.mjs';
import { DEFAULT_HELP_TOPIC_ID, isAllowedThread, parseCommand, sendWithRetry } from './routing.mjs';

const COMMANDS = new Set(Object.keys(REPLIES));

function readTokenFile(path) {
  try {
    return readFileSync(path, 'utf8').trim();
  } catch (err) {
    console.error(`Impossibile leggere il token da "${path}": ${err.message}`);
    process.exit(1);
  }
}

function getToken() {
  const envToken = process.env.TELEGRAM_BOT_TOKEN;
  if (envToken && envToken.trim()) return envToken.trim();

  const tokenFile = process.env.TELEGRAM_BOT_TOKEN_FILE;
  if (tokenFile && tokenFile.trim()) return readTokenFile(tokenFile.trim());

  console.error(
    'Token mancante: imposta TELEGRAM_BOT_TOKEN oppure TELEGRAM_BOT_TOKEN_FILE (percorso a un file con il token).'
  );
  process.exit(1);
}

const TOKEN = getToken();
const API = `https://api.telegram.org/bot${TOKEN}`;
const ALLOWED_CHAT_ID = process.env.TELEGRAM_CHAT_ID ? String(process.env.TELEGRAM_CHAT_ID) : null;
const HELP_TOPIC_ID = Number(process.env.TELEGRAM_HELP_TOPIC_ID ?? DEFAULT_HELP_TOPIC_ID);

// Ritorna il risultato Telegram; su risposta non ok solleva, tranne quando il
// chiamante chiede l'esito grezzo (raw) per decidere se ritentare.
async function tg(method, payload, options = {}) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
    signal: options.signal,
  });
  const data = await res.json().catch(() => ({}));
  if (options.raw) {
    return {
      ok: Boolean(data.ok),
      status: res.status,
      retryAfter: data.parameters && data.parameters.retry_after,
      description: data.description,
    };
  }
  if (!data.ok) {
    throw new Error(`${method} fallita: ${data.description ?? res.status}`);
  }
  return data.result;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handleMessage(message) {
  const chatId = message.chat && message.chat.id;
  if (ALLOWED_CHAT_ID && String(chatId) !== ALLOWED_CHAT_ID) return;

  const cmd = parseCommand(message.text, COMMANDS);
  if (!cmd) return;

  // Fuori dal topic di supporto il bot resta zitto: niente risposte nei topic
  // regionali, in Annunci o in General. Il thread ignorato finisce nei log,
  // così si ricava l'id giusto se i topic vengono ricreati.
  if (!isAllowedThread(message, HELP_TOPIC_ID)) {
    console.log(
      `${new Date().toISOString()} /${cmd} ignorato chat=${chatId} thread=${message.message_thread_id ?? 'none'}`
    );
    return;
  }

  const payload = {
    chat_id: chatId,
    text: REPLIES[cmd],
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
  };
  if (message.message_thread_id) payload.message_thread_id = message.message_thread_id;

  const user = message.from && message.from.username
    ? `@${message.from.username}`
    : String((message.from && message.from.id) ?? 'sconosciuto');

  // Un 429 o un 5xx transitorio non deve far perdere la risposta: l'update è
  // già stato consumato e Telegram non lo riproporrà.
  const sent = await sendWithRetry(() => tg('sendMessage', payload, { raw: true }), { sleep });
  if (!sent.ok) {
    console.error(`${new Date().toISOString()} /${cmd} NON inviato chat=${chatId} user=${user}: ${sent.error}`);
    return;
  }
  console.log(`${new Date().toISOString()} /${cmd} chat=${chatId} user=${user}`);
}

let running = true;
let offset = 0;
let abortController = new AbortController();

async function pollLoop() {
  let backoff = 3000;
  while (running) {
    let updates;
    try {
      updates = await tg(
        'getUpdates',
        { offset, timeout: 30, allowed_updates: ['message'] },
        { signal: abortController.signal }
      );
      backoff = 3000;
    } catch (err) {
      if (err.name === 'AbortError' || !running) break;
      console.error(`${new Date().toISOString()} errore getUpdates: ${err.message}`);
      await sleep(backoff);
      backoff = Math.min(backoff * 2, 60000);
      continue;
    }

    for (const update of updates) {
      offset = update.update_id + 1;
      if (!update.message) continue;
      try {
        await handleMessage(update.message);
      } catch (err) {
        console.error(`${new Date().toISOString()} errore gestione messaggio: ${err.message}`);
      }
    }
  }
  console.log(`${new Date().toISOString()} loop di polling terminato`);
}

function shutdown(signal) {
  console.log(`${new Date().toISOString()} ricevuto ${signal}, arresto in corso...`);
  running = false;
  abortController.abort();
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

console.log(`${new Date().toISOString()} meshcore-ita-bot avviato, comandi: ${[...COMMANDS].join(', ')}`);
pollLoop();
