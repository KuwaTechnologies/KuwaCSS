import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, mkdtempSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { extractClasses } from '../cli/extract.js';
import { analyze } from '../cli/analyze.js';
import { runCheck } from '../cli/check.js';

const vocab = JSON.parse(readFileSync(new URL('../dist/vocab.json', import.meta.url), 'utf8'));
const FX = fileURLToPath(new URL('./fixtures/', import.meta.url));
const findings = (html: string, strict = false) => analyze(extractClasses(html), vocab, { strict });
async function run(argv: string[], stdin = '') {
  let out = '', err = '';
  const code = await runCheck(argv, { stdin: async () => stdin, stdout: (s: string) => { out += s; }, stderr: (s: string) => { err += s; } });
  return { code, out, err };
}

test('p-4 is foreign and suggests padding-m', () => {
  const [f] = findings('<div class="p-4">');
  assert.equal(f.kind, 'foreign');
  assert.equal(f.suggestion, 'padding-m');
  assert.equal(f.line, 1);
});

test('text-md is a near-miss of text-m', () => {
  const [f] = findings('<div class="text-md">');
  assert.equal(f.kind, 'near-miss');
  assert.equal(f.suggestion, 'text-m');
});

test('m:padding-l is a bad prefix', () => {
  const [f] = findings('<div class="m:padding-l">');
  assert.equal(f.kind, 'bad-prefix');
});

test('a modifier without a component on the same element is stray', () => {
  assert.equal(findings('<div class="primary">')[0]?.kind, 'stray-modifier');
  assert.deepEqual(findings('<button class="primary">'), []);
  assert.deepEqual(findings('<a class="button primary">'), []);
  assert.deepEqual(findings('<span class="badge success">'), []);
  assert.deepEqual(findings('<div class="alert danger">'), []);
});

test('an unknown project class passes lenient and is flagged strict', () => {
  assert.deepEqual(findings('<div class="hero">'), []);
  assert.equal(findings('<div class="hero">', true)[0]?.kind, 'unknown');
});

test('valid classes including responsive forms produce no findings', () => {
  assert.deepEqual(findings('<div class="stack gap-s m:row xl:cols-4 visually-hidden">'), []);
});

test('a multi-line attribute with duplicate tokens reports each class once', () => {
  const f = findings('<div class="p-4\n  p-4   stack">');
  assert.equal(f.length, 1);
  assert.equal(f[0].cls, 'p-4');
});

test('className in JSX is extracted from string, brace-string and template forms', () => {
  const src = readFileSync(FX + 'jsx.tsx', 'utf8');
  const cls = extractClasses(src).map((c) => c.cls);
  for (const n of ['card', 'stack', 'gap-s', 'text-xl', 'color-muted', 'primary']) assert.ok(cls.includes(n), `missing ${n}`);
  assert.deepEqual(findings(src), []);
});

test('clean.html exits 0 and reports zero findings', async () => {
  const r = await run([FX + 'clean.html']);
  assert.equal(r.code, 0);
  assert.match(r.out, /0 findings/);
});

test('empty and binary files exit 0 without crashing', async () => {
  const r = await run([FX + 'empty.txt', FX + 'binary.bin']);
  assert.equal(r.code, 0);
  assert.equal(r.err, '');
});

test('bad.html exits 1 and --json lists kinds', async () => {
  const r = await run(['--json', FX + 'bad.html']);
  assert.equal(r.code, 1);
  const list = JSON.parse(r.out);
  const kinds = new Set(list.map((f: any) => f.kind));
  for (const k of ['foreign', 'near-miss', 'bad-prefix', 'stray-modifier']) assert.ok(kinds.has(k), `missing kind ${k}`);
  assert.ok(list.every((f: any) => typeof f.file === 'string' && typeof f.line === 'number'));
});

test('--strict adds unknown findings for bad.html', async () => {
  const r = await run(['--json', '--strict', FX + 'bad.html']);
  assert.ok(JSON.parse(r.out).some((f: any) => f.kind === 'unknown' && f.cls === 'hero'));
});

test('--stdin checks piped markup', async () => {
  const r = await run(['--stdin', '--json'], '<div class="w-full">');
  assert.equal(r.code, 1);
  assert.equal(JSON.parse(r.out)[0].suggestion, 'width-full');
});

test('--fix rewrites foreign spellings in place and leaves the rest', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'kuwa-'));
  const file = join(dir, 'bad.html');
  copyFileSync(FX + 'bad.html', file);
  const r = await run(['--fix', file]);
  const after = readFileSync(file, 'utf8');
  assert.ok(after.includes('class="padding-m text-md m:padding-l primary hero"'), after);
  assert.match(r.out, /fixed 1/);
});

test('a directory argument is scanned recursively for markup and component files', async () => {
  const r = await run(['--json', FX]);
  assert.equal(r.code, 1);
  const files = new Set(JSON.parse(r.out).map((f: any) => f.file.split('/').pop()));
  assert.ok(files.has('bad.html'));
  assert.ok(!files.has('clean.html'));
});
