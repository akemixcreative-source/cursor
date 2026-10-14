import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CursorBridge, CursorError, buildPrompt, isTerminal } from '../src/cursor.js';

test('a question stays an answer unless build is on', () => {
  const answer = buildPrompt({ name: 'Venera', query: 'what is the rooftop for?', build: false });
  assert.match(answer, /Venera/);
  assert.match(answer, /rooftop/);
  assert.match(answer, /Do not change files/);

  const build = buildPrompt({ name: 'Venera', query: 'add a topic', build: true });
  assert.match(build, /open a pull request/);
  assert.doesNotMatch(build, /Do not change files/);
});

test('the first question creates an agent and the next one continues it', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'cursor-bridge-'));
  const statePath = path.join(dir, 'bridge.json');
  const calls = [];
  const bridge = new CursorBridge({
    apiKey: 'cursor_test_key',
    repository: 'https://github.com/akemixcreative-source/cursor',
    ref: 'main',
    statePath,
    fetchImpl: async (url, init) => {
      calls.push({ url, init: { ...init, body: init.body ? JSON.parse(init.body) : undefined } });
      if (url.endsWith('/v1/agents') && init.method === 'POST') {
        return json(200, {
          agent: { id: 'bc-lounge', url: 'https://cursor.com/agents/bc-lounge' },
          run: { id: 'run-1' },
        });
      }
      if (url.endsWith('/v1/agents/bc-lounge/runs') && init.method === 'POST') {
        return json(200, { run: { id: 'run-2' } });
      }
      return json(500, { code: 'nope' });
    },
  });

  const first = await bridge.send({ name: 'Venera', query: 'who is in voice?', build: false });
  assert.equal(first.continued, false);
  assert.equal(first.runId, 'run-1');
  assert.equal(calls[0].init.body.mode, 'plan');
  assert.equal(calls[0].init.body.autoCreatePR, false);
  assert.equal(calls[0].init.body.repos[0].startingRef, 'main');
  assert.equal(calls[0].init.headers.Authorization.startsWith('Basic '), true);
  assert.doesNotMatch(calls[0].init.headers.Authorization, /cursor_test_key/);

  const second = await bridge.send({ name: 'Venera', query: 'and the focus room?', build: true });
  assert.equal(second.continued, true);
  assert.equal(second.runId, 'run-2');
  assert.equal(calls[1].init.body.mode, 'agent');

  const saved = JSON.parse(await readFile(statePath, 'utf8'));
  assert.equal(saved.agentId, 'bc-lounge');
  await rm(dir, { recursive: true, force: true });
});

test('a refused key does not leak the secret', async () => {
  const bridge = new CursorBridge({
    apiKey: 'super-secret-key',
    statePath: path.join(tmpdir(), 'missing-bridge.json'),
    fetchImpl: async () => json(401, { code: 'unauthorized', message: 'bad key super-secret-key' }),
  });

  await assert.rejects(
    () => bridge.send({ name: 'Venera', query: 'hello', fresh: true }),
    (error) => {
      assert.ok(error instanceof CursorError);
      assert.equal(error.status, 401);
      assert.match(error.message, /CURSOR_API_KEY/);
      assert.doesNotMatch(error.message, /super-secret-key/);
      return true;
    },
  );
});

test('a busy agent is a plain sentence', async () => {
  const bridge = new CursorBridge({
    apiKey: 'cursor_test_key',
    statePath: path.join(tmpdir(), 'busy-bridge.json'),
    fetchImpl: async (url) => {
      if (url.endsWith('/runs')) return json(409, { code: 'agent_busy' });
      return json(200, {
        agent: { id: 'bc-busy', url: 'https://cursor.com/agents/bc-busy' },
        run: { id: 'run-busy' },
      });
    },
  });

  await bridge.send({ name: 'Venera', query: 'first', fresh: true });
  await assert.rejects(
    () => bridge.send({ name: 'Venera', query: 'second' }),
    (error) => {
      assert.match(error.message, /still working/);
      return true;
    },
  );
});

test('terminal run statuses are the ones with a reply', () => {
  assert.equal(isTerminal('FINISHED'), true);
  assert.equal(isTerminal('ERROR'), true);
  assert.equal(isTerminal('RUNNING'), false);
});

function json(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async text() {
      return JSON.stringify(body);
    },
  };
}
