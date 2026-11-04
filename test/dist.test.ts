import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { build } from '../src/build/bundle.ts';
import { escapeSelector } from '../src/build/generate.ts';

const LAYERS = '@layer kuwa.tokens, kuwa.reset, kuwa.base, kuwa.layout, kuwa.components, kuwa.utilities;';
const read = (f: string) => readFileSync(new URL(`../dist/${f}`, import.meta.url), 'utf8');

await build();
const css = read('kuwa.css');
const vocab = JSON.parse(read('vocab.json'));
const valid = new Set<string>(vocab.classes.map((c: any) => c.name));
for (const p of Object.keys(vocab.prefixes)) for (const r of vocab.responsive) valid.add(`${p}:${r}`);

/** Returns the text of the first block whose prelude matches, including nested blocks. */
function blockOf(source: string, prelude: RegExp): string {
  const m = prelude.exec(source);
  if (!m) return '';
  let i = source.indexOf('{', m.index), depth = 0;
  for (let j = i; j < source.length; j++) {
    if (source[j] === '{') depth++;
    else if (source[j] === '}' && --depth === 0) return source.slice(i, j + 1);
  }
  return source.slice(i);
}

test('build produces every dist file', () => {
  for (const f of ['kuwa.css', 'kuwa.min.css', 'kuwa-scoped.css', 'vocab.json', 'kuwa.d.ts', 'cx.js']) {
    assert.ok(existsSync(new URL(`../dist/${f}`, import.meta.url)), `missing dist/${f}`);
  }
});

test('layer order statement is the first non-comment line', () => {
  const first = css.replace(/\/\*[\s\S]*?\*\//g, '').split('\n').map((l) => l.trim()).find((l) => l.length > 0);
  assert.equal(first, LAYERS);
});

test('minified stylesheet is 10 KB gzipped or smaller', () => {
  const size = gzipSync(read('kuwa.min.css')).length;
  assert.ok(size <= 10240, `gzipped size ${size} bytes`);
});

test('every utility and primitive class exists as a selector, including responsive forms', () => {
  const generated = vocab.classes.filter((c: any) => c.kind === 'utility' || c.kind === 'primitive').map((c: any) => c.name);
  for (const p of Object.keys(vocab.prefixes)) for (const r of vocab.responsive) generated.push(`${p}:${r}`);
  for (const name of generated) assert.ok(css.includes(`.${escapeSelector(name)}`), `selector missing for ${name}`);
});

test('no class selector outside the vocabulary', () => {
  const noComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const preludes = [...noComments.matchAll(/([^{};]+)\{/g)].map((m) => m[1].trim()).filter((p) => !p.startsWith('@'));
  const found = new Set<string>();
  for (const p of preludes) for (const m of p.matchAll(/\.((?:\\:|[A-Za-z0-9_-])+)/g)) found.add(m[1].replace(/\\:/g, ':'));
  const unknown = [...found].filter((n) => !valid.has(n));
  assert.deepEqual(unknown, [], `undeclared classes: ${unknown.join(', ')}`);
});

test('no !important except inside prefers-reduced-motion', () => {
  const total = (css.match(/!important/g) ?? []).length;
  const inside = (blockOf(css, /@media \(prefers-reduced-motion: ?reduce\)/).match(/!important/g) ?? []).length;
  assert.ok(total > 0, 'reduced-motion rule should use !important');
  assert.equal(total, inside);
});
