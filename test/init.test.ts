import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInit } from '../cli/init.js';

const LLMS = readFileSync(new URL('../dist/llms.txt', import.meta.url), 'utf8');
const SENTENCE = 'This project uses KuwaCSS. Read `kuwa.llms.txt` before writing markup, then run `npx kuwacss check` on your output.';
async function run(argv: string[], cwd: string) {
  let out = '', err = '';
  const code = await runInit(argv, { stdin: async () => '', stdout: (s: string) => { out += s; }, stderr: (s: string) => { err += s; } }, cwd);
  return { code, out, err };
}
const tmp = () => mkdtempSync(join(tmpdir(), 'kuwa-init-'));

test('init copies llms.txt into the project and prints next steps', async () => {
  const dir = tmp();
  const r = await run([], dir);
  assert.equal(r.code, 0);
  assert.equal(readFileSync(join(dir, 'kuwa.llms.txt'), 'utf8'), LLMS);
  assert.match(r.out, /kuwa\.llms\.txt/);
  assert.match(r.out, /npx kuwacss check/);
});

test('init does not overwrite an existing kuwa.llms.txt unless --force', async () => {
  const dir = tmp();
  writeFileSync(join(dir, 'kuwa.llms.txt'), 'custom');
  await run([], dir);
  assert.equal(readFileSync(join(dir, 'kuwa.llms.txt'), 'utf8'), 'custom');
  await run(['--force'], dir);
  assert.equal(readFileSync(join(dir, 'kuwa.llms.txt'), 'utf8'), LLMS);
});

test('--agents appends one line to AGENTS.md and is idempotent', async () => {
  const dir = tmp();
  await run(['--agents'], dir);
  await run(['--agents'], dir);
  const text = readFileSync(join(dir, 'AGENTS.md'), 'utf8');
  assert.equal(text.split(SENTENCE).length - 1, 1);
});

test('--claude appends to an existing CLAUDE.md without clobbering it', async () => {
  const dir = tmp();
  writeFileSync(join(dir, 'CLAUDE.md'), '# Project\n\nKeep this.\n');
  await run(['--claude'], dir);
  const text = readFileSync(join(dir, 'CLAUDE.md'), 'utf8');
  assert.ok(text.startsWith('# Project\n\nKeep this.\n'));
  assert.ok(text.includes(SENTENCE));
  assert.ok(!existsSync(join(dir, 'AGENTS.md')));
});

test('--link inserts the stylesheet link once before </head>', async () => {
  const dir = tmp();
  writeFileSync(join(dir, 'index.html'), '<!doctype html><html><head><title>x</title></head><body></body></html>');
  await run(['--link', 'index.html'], dir);
  await run(['--link', 'index.html'], dir);
  const html = readFileSync(join(dir, 'index.html'), 'utf8');
  assert.equal((html.match(/kuwacss@0\/dist\/kuwa\.min\.css/g) ?? []).length, 1);
  assert.ok(html.indexOf('<link') < html.indexOf('</head>'));
});

test('--link with a missing file exits 2 before writing anything', async () => {
  const dir = tmp();
  const r = await run(['--link', 'nope.html'], dir);
  assert.equal(r.code, 2);
  assert.match(r.err, /nope\.html/);
  assert.ok(!existsSync(join(dir, 'kuwa.llms.txt')));
});

test('--link without a file name exits 2', async () => {
  const r = await run(['--link', '--force'], tmp());
  assert.equal(r.code, 2);
});
