import { readFile, writeFile } from 'node:fs/promises';
import { paths } from './util.js';

const API = 'https://api.cursor.com';
const DEFAULT_REPOSITORY = 'https://github.com/akemixcreative-source/cursor';
const TERMINAL = new Set(['FINISHED', 'ERROR', 'CANCELLED', 'EXPIRED']);

export class CursorError extends Error {
  constructor(message, { status, code } = {}) {
    super(message);
    this.name = 'CursorError';
    this.status = status;
    this.code = code;
  }
}

export function cursorSettings(env = process.env) {
  const apiKey = env.CURSOR_API_KEY?.trim() || '';
  const repository = env.CURSOR_REPOSITORY?.trim() || DEFAULT_REPOSITORY;
  const ref = env.CURSOR_REF?.trim() || 'main';
  return { apiKey, repository, ref };
}

/**
 * The Discord text is wrapped so a lounge question stays a question.
 * `build` is the only path that asks Cursor to change the project.
 */
export function buildPrompt({ name, query, build }) {
  const who = String(name || 'someone').replace(/\s+/g, ' ').trim().slice(0, 80) || 'someone';
  const text = String(query || '').trim().slice(0, 4000);
  const closing = build
    ? 'They asked you to change the project. Do the work and open a pull request.'
    : 'Answer in a few short paragraphs. Do not change files. This reply is posted back in Discord.';
  return [`Question from ${who} in Venera's Lounge on Discord.`, '', text, '', closing].join('\n');
}

export function isTerminal(status) {
  return TERMINAL.has(status);
}

function publicError(status, payload) {
  const code = typeof payload?.code === 'string' ? payload.code : '';
  if (status === 401) return 'Cursor refused the API key. Check CURSOR_API_KEY in .env.';
  if (status === 403) return 'This API key cannot start a Cursor agent.';
  if (status === 409 || code === 'agent_busy') return 'Cursor is still working on the last question.';
  if (code === 'agent_id_conflict') return 'That Cursor chat already exists. Ask again with fresh turned on.';
  return 'Cursor could not take that question.';
}

export class CursorBridge {
  constructor({ apiKey, repository, ref, fetchImpl = fetch, statePath = paths.bridge } = {}) {
    this.apiKey = apiKey || '';
    this.repository = repository || DEFAULT_REPOSITORY;
    this.ref = ref || 'main';
    this.fetchImpl = fetchImpl;
    this.statePath = statePath;
  }

  async send({ name, query, build = false, fresh = false }) {
    if (!this.apiKey) {
      throw new CursorError('Add CURSOR_API_KEY to .env and restart the bot.');
    }
    if (!/^https:\/\/\S+$/.test(this.repository)) {
      throw new CursorError('CURSOR_REPOSITORY should be an https url.');
    }

    const prompt = buildPrompt({ name, query, build });
    const mode = build ? 'agent' : 'plan';
    const saved = fresh ? null : await this.load();

    if (saved?.agentId) {
      try {
        const run = await this.request('POST', `/v1/agents/${saved.agentId}/runs`, {
          prompt: { text: prompt },
          mode,
        });
        return {
          agentId: saved.agentId,
          runId: run.run.id,
          url: saved.url || agentUrl(saved.agentId),
          continued: true,
          build,
        };
      } catch (error) {
        if (error.status !== 404) throw error;
      }
    }

    const created = await this.request('POST', '/v1/agents', {
      name: `lounge · ${String(name || 'question')}`.replace(/\s+/g, ' ').trim().slice(0, 100),
      prompt: { text: prompt },
      mode,
      autoCreatePR: Boolean(build),
      repos: [{ url: this.repository, startingRef: this.ref }],
    });
    const agentId = created.agent.id;
    const url = created.agent.url || agentUrl(agentId);
    await this.save({ version: 1, agentId, url });
    return {
      agentId,
      runId: created.run.id,
      url,
      continued: false,
      build,
    };
  }

  async getRun(agentId, runId) {
    return this.request('GET', `/v1/agents/${agentId}/runs/${runId}`);
  }

  async wait(agentId, runId, { intervalMs = 4000, attempts = 150, sleep = delay } = {}) {
    for (let attempt = 0; attempt < attempts; attempt += 1) {
      const run = await this.getRun(agentId, runId);
      if (isTerminal(run.status)) return run;
      if (attempt < attempts - 1) await sleep(intervalMs);
    }
    return null;
  }

  async load() {
    try {
      const data = JSON.parse(await readFile(this.statePath, 'utf8'));
      if (data && typeof data.agentId === 'string' && data.agentId) return data;
    } catch {
      // A missing file just means this is the first question.
    }
    return null;
  }

  async save(state) {
    await writeFile(this.statePath, `${JSON.stringify(state, null, 2)}\n`);
  }

  async request(method, pathname, body) {
    let response;
    try {
      response = await this.fetchImpl(`${API}${pathname}`, {
        method,
        headers: {
          Authorization: `Basic ${Buffer.from(`${this.apiKey}:`).toString('base64')}`,
          Accept: 'application/json',
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch {
      throw new CursorError('Could not reach Cursor. Try again in a moment.');
    }

    const text = await response.text();
    let payload = null;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = null;
      }
    }
    if (!response.ok) {
      throw new CursorError(publicError(response.status, payload), {
        status: response.status,
        code: typeof payload?.code === 'string' ? payload.code : undefined,
      });
    }
    return payload ?? {};
  }
}

function agentUrl(agentId) {
  return `https://cursor.com/agents/${agentId}`;
}

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
