#!/usr/bin/env node
// Script one-shot e idempotente: crea i 28 topic del forum nel gruppo
// MeshCore ITA. Ripetibile: salta i topic già creati in un run precedente.
// Uso: node bot/setup-topics.mjs [--dry-run]

import { readFileSync, writeFileSync, renameSync, openSync, closeSync, unlinkSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import { TOPICS } from './content.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// File generato: elenco dei topic già creati, per rendere lo script
// idempotente. Non è un segreto, ma non va committato: rigenerabile.
const STATE_FILE = path.join(__dirname, 'topics.created.json');

const ICON_COLORS = [0x6fb9f0, 0xffd67e, 0xcb86db, 0x8eee98, 0xff93b2, 0xfb6f5f];

const DRY_RUN = process.argv.includes('--dry-run');
const CHAT_ID = process.env.TELEGRAM_CHAT_ID && process.env.TELEGRAM_CHAT_ID.trim()
  ? process.env.TELEGRAM_CHAT_ID.trim()
  : '-1003711129218';

function readTokenFile(filePath) {
  try {
    return readFileSync(filePath, 'utf8').trim();
  } catch (err) {
    console.error(`Impossibile leggere il token da "${filePath}": ${err.message}`);
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

function loadState() {
  if (!existsSync(STATE_FILE)) return {};
  try {
    return JSON.parse(readFileSync(STATE_FILE, 'utf8'));
  } catch (err) {
    console.error(`Attenzione: ${STATE_FILE} illeggibile (${err.message}), riparto da zero.`);
    return {};
  }
}

// Scrittura atomica: un'interruzione a metà lascerebbe uno stato illeggibile,
// e loadState ripartirebbe da zero ricreando topic già esistenti.
function saveState(state) {
  const tmp = `${STATE_FILE}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(state, null, 2)}\n`);
  renameSync(tmp, STATE_FILE);
}

// Lock esclusivo: due run in parallelo creerebbero i topic due volte.
const LOCK_FILE = `${STATE_FILE}.lock`;
function acquireLock() {
  try {
    closeSync(openSync(LOCK_FILE, 'wx'));
  } catch {
    console.error(`Un altro run è in corso (rimuovi ${LOCK_FILE} se è rimasto orfano).`);
    process.exit(1);
  }
  const release = () => {
    try {
      unlinkSync(LOCK_FILE);
    } catch {
      /* già rimosso */
    }
  };
  process.on('exit', release);
  process.on('SIGINT', () => process.exit(130));
  process.on('SIGTERM', () => process.exit(143));
}

async function tg(token, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload ?? {}),
  });
  const data = await res.json();
  return { ok: data.ok, result: data.result, description: data.description };
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Telegram limita la creazione di topic: su 429 attende retry_after e riprova.
async function tgWithRetry(token, method, payload, attempts = 5) {
  for (let attempt = 1; ; attempt += 1) {
    const res = await tg(token, method, payload);
    if (res.ok) return res;
    const wait = /retry after (\d+)/i.exec(res.description || '');
    if (!wait || attempt >= attempts) return res;
    const seconds = Number(wait[1]) + 1;
    console.log(`Rate limit: attendo ${seconds}s e riprovo (${method})`);
    await sleep(seconds * 1000);
  }
}

function pickIcon(stickers, index) {
  const sticker = stickers && stickers.length ? stickers[index % stickers.length] : null;
  const icon = { icon_color: ICON_COLORS[index % ICON_COLORS.length] };
  if (sticker && sticker.custom_emoji_id) icon.icon_custom_emoji_id = sticker.custom_emoji_id;
  return icon;
}

function printForumInstructions(desc) {
  console.error(`
Impossibile creare i topic: ${desc}

Per usare i topic nel gruppo MeshCore ITA, il proprietario del gruppo deve prima:
  1. Aprire le impostazioni del gruppo su Telegram
  2. In "Modifica gruppo" attivare "Argomenti" (Topics)
  3. Aprire "Amministratori" -> selezionare @meshcore_ita_bot -> concedere il permesso "Gestisci argomenti"

Una volta fatto, rilancia: node bot/setup-topics.mjs
`);
}

function isForumPermissionError(description) {
  const d = (description || '').toLowerCase();
  return (
    d.includes('not a forum') ||
    d.includes('can_manage_topics') ||
    d.includes('not enough rights') ||
    d.includes('rights to manage topics')
  );
}

async function main() {
  console.log(`Piano di creazione topic (${TOPICS.length} totali):`);
  TOPICS.forEach((topic, index) => {
    console.log(`${index + 1}. [${topic.kind}] ${topic.name}`);
  });

  if (DRY_RUN) {
    console.log('\n--dry-run: nessuna chiamata API effettuata.');
    return;
  }

  const token = getToken();
  acquireLock();
  const state = loadState();

  let stickers = [];
  try {
    const stickerRes = await tg(token, 'getForumTopicIconStickers', {});
    if (stickerRes.ok) stickers = stickerRes.result;
    else console.error(`Attenzione: getForumTopicIconStickers fallita: ${stickerRes.description}`);
  } catch (err) {
    console.error(`Attenzione: impossibile ottenere le icone dei topic: ${err.message}`);
  }

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < TOPICS.length; i += 1) {
    const topic = TOPICS[i];
    if (state[topic.name]) {
      console.log(`Skip (già creato): ${topic.name}`);
      skipped += 1;
      continue;
    }

    const icon = pickIcon(stickers, i);
    const payload = { chat_id: CHAT_ID, name: topic.name, icon_color: icon.icon_color };
    if (icon.icon_custom_emoji_id) payload.icon_custom_emoji_id = icon.icon_custom_emoji_id;

    const res = await tgWithRetry(token, 'createForumTopic', payload);
    if (!res.ok) {
      if (isForumPermissionError(res.description)) {
        printForumInstructions(res.description);
        process.exit(2);
      }
      console.error(`Errore creando "${topic.name}": ${res.description}`);
      process.exit(1);
    }

    state[topic.name] = {
      message_thread_id: res.result.message_thread_id,
      kind: topic.kind,
      created_at: new Date().toISOString(),
    };
    saveState(state);
    created += 1;
    console.log(`Creato: ${topic.name} (thread ${res.result.message_thread_id})`);
    await sleep(1200);
  }

  console.log(`\nCompletato: ${created} creati, ${skipped} già presenti.`);
}

main().catch((err) => {
  console.error(`Errore inatteso: ${err.message}`);
  process.exit(1);
});
