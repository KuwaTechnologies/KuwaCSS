import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { encode } from 'gpt-tokenizer';
import { entries } from '../src/vocab.ts';

const read = (f: string) => readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');
const llms = read('llms.txt');
const full = read('llms-full.txt');

test('llms.txt is 2,500 tokens or fewer', () => {
  const n = encode(llms).length;
  assert.ok(n <= 2500, `llms.txt is ${n} tokens`);
});

test('llms.txt names every primitive and component', () => {
  for (const e of entries()) if (e.kind === 'primitive' || e.kind === 'component') assert.ok(llms.includes(e.name), `llms.txt lacks ${e.name}`);
});

test('llms.txt carries the pinned CDN link for the current major', () => {
  assert.ok(llms.includes('https://cdn.jsdelivr.net/npm/kuwacss@0/dist/kuwa.min.css'));
});

test('llms.txt lists the responsive whitelist and the forbidden spellings', () => {
  assert.ok(llms.includes('ONLY on: hidden block stack row cols-1 cols-2 cols-3 cols-4 text-left text-center text-right order-first order-last grow'));
  assert.ok(llms.includes('p-4'));
});

test('llms-full.txt starts with llms.txt and appends the cookbook', () => {
  assert.ok(full.startsWith(llms));
  for (const name of ['landing.html', 'dashboard.html', 'settings-form.html', 'pricing.html']) assert.ok(full.includes(`## Pattern: ${name}`), `missing pattern ${name}`);
  assert.ok(!full.includes('../dist/kuwa.css'), 'patterns must link the CDN, not a relative path');
});
