import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createFixtureService } from '../scripts/fixture-service.mjs';

test('records and verifies the exact run/test fixture arrival', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'adblocker-fixture-'));
  const service = createFixtureService({ receiptFile: join(directory, 'receipts.json'), retentionMs: 60_000 });
  await service.listen();
  t.after(async () => { await service.close(); await rm(directory, { recursive: true, force: true }); });

  const base = service.url;
  const created = await fetch(`${base}/api/fixture/runs`, { method: 'POST' });
  const { runId } = await created.json();
  const fixture = await fetch(`${base}/api/fixture/resource?run=${encodeURIComponent(runId)}&test=NET-01`);
  assert.equal(fixture.status, 204);
  const verified = await fetch(`${base}/api/fixture/verify?run=${encodeURIComponent(runId)}&test=NET-01`);
  assert.deepEqual(await verified.json(), { arrived: true, runId, testId: 'NET-01' });
});

test('preserves independent fixture arrivals when requests run concurrently', async (t) => {
  const directory = await mkdtemp(join(tmpdir(), 'adblocker-fixture-concurrent-'));
  const service = createFixtureService({ receiptFile: join(directory, 'receipts.json'), retentionMs: 60_000 });
  await service.listen();
  t.after(async () => { await service.close(); await rm(directory, { recursive: true, force: true }); });

  const base = service.url;
  const created = await fetch(`${base}/api/fixture/runs`, { method: 'POST' });
  assert.equal(created.status, 201);
  const { runId } = await created.json();
  const testIds = Array.from({ length: 24 }, (_, index) => `NET-${String(index + 1).padStart(2, '0')}`);

  const arrivals = await Promise.all(testIds.map((testId) =>
    fetch(`${base}/api/fixture/resource?run=${encodeURIComponent(runId)}&test=${encodeURIComponent(testId)}`)
  ));
  assert.deepEqual(arrivals.map((response) => response.status), Array(testIds.length).fill(204));

  const results = await Promise.all(testIds.map(async (testId) => {
    const response = await fetch(`${base}/api/fixture/verify?run=${encodeURIComponent(runId)}&test=${encodeURIComponent(testId)}`);
    assert.equal(response.status, 200);
    return response.json();
  }));

  assert.deepEqual(results.map(({ arrived, testId }) => ({ arrived, testId })), testIds.map((testId) => ({ arrived: true, testId })));
});
