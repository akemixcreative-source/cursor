import path from 'node:path';
import { access } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import dotenv from 'dotenv';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const paths = {
  root,
  manifest: path.join(root, '.venera-manifest.json'),
  icon: path.join(root, 'assets', 'icon.png'),
  banner: path.join(root, 'assets', 'banner.png'),
};

export const SETUP_REASON = 'venera studio · setup';
export const DOOR_REASON = 'venera studio · door';

const orange = (text) => `\x1b[38;2;255;69;0m${text}\x1b[0m`;
const dim = (text) => `\x1b[2m${text}\x1b[0m`;

export const log = {
  banner(text) {
    console.log(`\n${orange('venera studio')}  ·  ${text}\n`);
  },
  step(title) {
    console.log(`\n${orange('▸')} ${title}`);
  },
  ok(message) {
    console.log(`  ${orange('✓')} ${message}`);
  },
  skip(message) {
    console.log(`  ${dim(`– ${message}`)}`);
  },
  warn(message) {
    console.warn(`  \x1b[33m!\x1b[0m ${message}`);
  },
  error(message) {
    console.error(`  \x1b[31m✗\x1b[0m ${message}`);
  },
};

const HINTS = {
  50013:
    'Missing permissions. Drag the bot role to the top of Server Settings → Roles, and re-invite it with Administrator if this keeps happening.',
  50001: 'Missing access. Invite the bot into this server and let it see the channel.',
  10004: 'Unknown guild. Check GUILD_ID, and invite the bot into Venera\'s Lounge.',
  50035:
    'Discord rejected a field. A description needs Community on some servers, and a banner needs boost level 2.',
  60003:
    'This server requires two-factor authentication for admin actions. Enable 2FA on the owner account.',
  30005: 'This server is at Discord\'s channel limit.',
  30013: 'This server is at Discord\'s role limit.',
};

/**
 * Turn a Discord or network error into one line a person can act on.
 * Permission failures stay in the log instead of dumping a stack trace.
 */
export function explain(error) {
  if (!error) return 'unknown error';
  const message = error instanceof Error ? error.message : String(error);
  if (/disallowed intents/i.test(message) || /used disallowed intents/i.test(message)) {
    return 'Discord refused the connection. Enable Server Members Intent under Developer Portal → Bot → Privileged Gateway Intents, then run it again.';
  }
  if (error.code === 'ENOTFOUND' || error.code === 'ECONNRESET' || error.code === 'ETIMEDOUT') {
    return 'Could not reach Discord. Check the network and run it again.';
  }
  const code = error.code ?? error.rawError?.code;
  const hint = HINTS[code];
  if (hint) return `${message} (${code}) — ${hint}`;
  return message;
}

export function loadEnv() {
  dotenv.config({ path: path.join(root, '.env'), quiet: true });
}

export function requireEnv() {
  const major = Number(process.versions.node.split('.')[0]);
  if (!Number.isFinite(major) || major < 20) {
    throw new Error(`Node 20+ is required. This machine is on ${process.versions.node}.`);
  }

  const token = process.env.DISCORD_TOKEN?.trim();
  const guildId = process.env.GUILD_ID?.trim();
  if (!token || !guildId) {
    throw new Error('Missing DISCORD_TOKEN or GUILD_ID. Copy .env.example to .env and fill both in.');
  }
  if (!/^\d{17,22}$/.test(guildId)) {
    throw new Error(
      'GUILD_ID should be the numeric server id. Turn on Developer Mode, then right-click the server → Copy Server ID.',
    );
  }
  return { token, guildId };
}

export function isDirectRun(metaUrl) {
  const entry = process.argv[1];
  if (!entry) return false;
  return metaUrl === pathToFileURL(path.resolve(entry)).href;
}

export async function fileExists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export function sameName(left, right) {
  return left.trim().toLowerCase() === right.trim().toLowerCase();
}

export function emptyManifest(guildId) {
  return {
    version: 1,
    guildId,
    roles: {},
    categories: {},
    channels: {},
    messages: {},
  };
}
