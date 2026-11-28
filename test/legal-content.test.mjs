import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import {
  OPERATOR,
  CONTACT_EMAIL,
  EFFECTIVE_DATE,
  EXTERNAL_TEST_SERVERS,
  CONTROL_TEST_SERVERS,
  LIVE_AD_NETWORKS,
  PRIVACY_POLICY,
  TERMS_OF_USE,
  LEGAL_PAGES
} from '../src/lab/legal-content.js';
import { TAB_PATHS } from '../src/lab/navigation.js';

const source = readFileSync(new URL('../AdBlockerTestLab.jsx', import.meta.url), 'utf8');

test('operator, contact, and effective date are set', () => {
  assert.equal(OPERATOR, 'Rahul Muraleedharan');
  assert.match(CONTACT_EMAIL, /^[^@\s]+@[^@\s]+\.[a-z]+$/);
  assert.match(EFFECTIVE_DATE, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(!Number.isNaN(Date.parse(EFFECTIVE_DATE)));
});

test('the privacy policy lists exactly the servers the full test contacts', () => {
  const probeHosts = [
    ...source.matchAll(/type: 'external_domain_probe',[\s\S]*?targetUrl: '(https:\/\/[^'/]+)/g)
  ].map((m) => new URL(m[1]).host);
  assert.equal(probeHosts.length, 10);
  assert.deepEqual([...EXTERNAL_TEST_SERVERS.map((s) => s.host)].sort(), [...probeHosts].sort());
});

test('the live ad networks named match the providers the lab can load', () => {
  for (const name of ['ADSTERRA', 'MONETAG', 'EXOCLICK']) {
    assert.ok(LIVE_AD_NETWORKS.some((n) => n.name.toUpperCase() === name), name);
  }
});

test('every section has content and every link is https', () => {
  for (const page of [PRIVACY_POLICY, TERMS_OF_USE]) {
    assert.ok(page.summary.length > 0);
    assert.equal(new Set(page.sections.map((s) => s.id)).size, page.sections.length);
    for (const section of page.sections) {
      assert.ok(section.paragraphs.every((p) => p.trim().length > 10), `${page.id}/${section.id}`);
      for (const link of section.links || []) assert.match(link.href, /^https:\/\//);
    }
  }
  for (const entry of [...EXTERNAL_TEST_SERVERS, ...LIVE_AD_NETWORKS]) assert.match(entry.policy, /^https:\/\//);
});

test('the contact email appears in both documents', () => {
  for (const page of [PRIVACY_POLICY, TERMS_OF_USE]) {
    assert.ok(JSON.stringify(page).includes(CONTACT_EMAIL), page.id);
  }
});

test('no em dashes, no exclamation marks, and no unsupported compliance claims', () => {
  const text = JSON.stringify(LEGAL_PAGES);
  assert.ok(!text.includes('—'));
  assert.ok(!text.includes('!'));
  assert.ok(!/compliant|certified|guarantee that|100% (secure|private)/i.test(text));
});

test('legal pages have addresses', () => {
  for (const id of Object.keys(LEGAL_PAGES)) assert.ok(TAB_PATHS[id], id);
});

test('the Privacy Policy describes the visit and test counters while they exist', () => {
  const counter = PRIVACY_POLICY.sections.find((sec) => sec.id === 'counter');
  assert.ok(counter, 'counter section missing');
  const text = counter.paragraphs.join(' ');
  assert.match(text, /Neon/);
  assert.match(text, /does not store your IP address/);
  assert.ok(existsSync(new URL('../api/counter.js', import.meta.url)), 'policy describes a counter that no longer exists');
});

test('the privacy policy lists the control servers the full test contacts', async () => {
  const { CONTROL_ENDPOINTS } = await import('../src/lab/reachability.js');
  assert.deepEqual(CONTROL_TEST_SERVERS.map((s) => s.host).sort(), CONTROL_ENDPOINTS.map((e) => e.host).sort());
});
