import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { cacheVersion } from '../scripts/cache-version.mjs';

test('cache version is stable and changes when question validation or app assets change', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'quiz-cache-'));
  try {
    await mkdir(path.join(root, 'data'));
    const questions = path.join(root, 'data/questions.json');
    await writeFile(questions, '[{"validated":false}]');
    await writeFile(path.join(root, 'app.js'), 'original');
    const original = await cacheVersion(root);
    assert.equal(await cacheVersion(root), original);
    await writeFile(questions, '[{"validated":true}]');
    const validated = await cacheVersion(root);
    assert.notEqual(validated, original);
    await writeFile(path.join(root, 'app.js'), 'updated');
    assert.notEqual(await cacheVersion(root), validated);
    await writeFile(questions, '[{"validated":false}]');
    await writeFile(path.join(root, 'app.js'), 'original');
    assert.equal(await cacheVersion(root), original);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
