import { createServer } from 'node:http';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { randomUUID } from 'node:crypto';

const RUN_ID = /^[a-f0-9-]{36}$/i;
const TEST_ID = /^[A-Z]{2,4}-\d{2}$/;

async function readReceipts(receiptFile, retentionMs, now) {
  try {
    const stored = JSON.parse(await readFile(receiptFile, 'utf8'));
    return stored.filter((receipt) => now - receipt.arrivedAt <= retentionMs);
  } catch (error) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

export function createFixtureService({ receiptFile, retentionMs = 300_000, now = () => Date.now() }) {
  if (!receiptFile) throw new Error('receiptFile is required');
  let server;
  let receiptQueue = Promise.resolve();

  // Serialize receipt transactions so concurrent requests cannot overwrite one another.
  const withReceiptLock = (operation) => {
    const result = receiptQueue.then(operation, operation);
    receiptQueue = result.catch(() => {});
    return result;
  };

  const persist = async (receipts) => {
    await mkdir(dirname(receiptFile), { recursive: true });
    await writeFile(receiptFile, JSON.stringify(receipts), 'utf8');
  };
  const respond = (response, status, body) => {
    response.writeHead(status, { 'cache-control': 'no-store', 'content-type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify(body));
  };
  const handler = async (request, response) => {
    const url = new URL(request.url, 'http://fixture.local');
    if (request.method === 'POST' && url.pathname === '/api/fixture/runs') {
      return respond(response, 201, { runId: randomUUID(), expiresAt: new Date(now() + retentionMs).toISOString() });
    }
    if (request.method !== 'GET' || !['/api/fixture/resource', '/api/fixture/verify'].includes(url.pathname)) {
      return respond(response, 404, { error: 'not_found' });
    }
    const runId = url.searchParams.get('run') || '';
    const testId = url.searchParams.get('test') || '';
    if (!RUN_ID.test(runId) || !TEST_ID.test(testId)) return respond(response, 400, { error: 'invalid_correlation' });
    if (url.pathname === '/api/fixture/resource') {
      await withReceiptLock(async () => {
        const receipts = await readReceipts(receiptFile, retentionMs, now());
        receipts.push({ runId, testId, arrivedAt: now() });
        await persist(receipts);
      });
      response.writeHead(204, { 'cache-control': 'no-store' });
      return response.end();
    }
    const arrived = await withReceiptLock(async () => {
      const receipts = await readReceipts(receiptFile, retentionMs, now());
      await persist(receipts);
      return receipts.some((receipt) => receipt.runId === runId && receipt.testId === testId);
    });
    return respond(response, 200, { arrived, runId, testId });
  };

  return {
    get url() {
      const address = server?.address();
      return address && typeof address === 'object' ? `http://127.0.0.1:${address.port}` : null;
    },
    async listen(port = 0) {
      server = createServer((request, response) => handler(request, response).catch(() => respond(response, 500, { error: 'fixture_failure' })));
      await new Promise((resolve, reject) => { server.once('error', reject); server.listen(port, '127.0.0.1', resolve); });
    },
    async close() {
      if (server) await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  };
}
