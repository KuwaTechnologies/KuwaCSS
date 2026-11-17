import { test } from 'node:test';
import assert from 'node:assert/strict';
import { entries, TRANSLATIONS } from '../src/vocab.ts';
import { utilitiesCss, primitivesCss, vocabJson, dts, escapeSelector } from '../src/build/generate.ts';

const list = entries();
const squash = (s: string) => s.replace(/\s+/g, '');
const util = squash(utilitiesCss(list));
const prim = squash(primitivesCss(list));

test('escapeSelector escapes the colon', () => {
  assert.equal(escapeSelector('m:row'), 'm\\:row');
  assert.equal(escapeSelector('padding-l'), 'padding-l');
});

test('utilitiesCss emits padding-top-l inside the utilities layer', () => {
  assert.ok(util.startsWith('@layerkuwa.utilities{'));
  assert.ok(util.includes('.padding-top-l{padding-block-start:var(--space-l)}'));
});

test('responsive variants exist for the whitelist only, in prefix order', () => {
  const m = util.indexOf('@media(min-width:48rem){');
  const l = util.indexOf('@media(min-width:64rem){');
  const xl = util.indexOf('@media(min-width:80rem){');
  assert.ok(m > 0 && l > m && xl > l, 'media blocks in order m, l, xl');
  assert.ok(util.includes('.m\\:row{'));
  assert.ok(util.includes('.m\\:stack{'));
  assert.ok(util.includes('.m\\:hidden{display:none}'));
  assert.ok(util.includes('.xl\\:cols-4{'));
  assert.ok(!util.includes('.m\\:padding-l'));
});

test('responsive primitive variants keep their gap and zero child margins; gap utilities come last', () => {
  const rule = util.slice(util.indexOf('.m\\:row{'));
  const body = rule.slice(0, rule.indexOf('}'));
  assert.ok(body.includes('gap:var(--gap,var(--space-m))'), body);
  const lastMedia = util.lastIndexOf('@media');
  assert.ok(util.indexOf('.gap-s{') > lastMedia, 'gap-s must follow the media blocks');
  assert.ok(util.indexOf('.gap{') > lastMedia, 'bare gap must follow the media blocks');
  assert.ok(util.includes(':where(.m\\:stack,.m\\:row,.m\\:cols-1,.m\\:cols-2,.m\\:cols-3,.m\\:cols-4)>:where(*){margin-block:0}'));
});

test('primitivesCss zeroes flow margins of every primitive child', () => {
  assert.ok(prim.includes('.cols-4,.container,'), prim.slice(-300));
  assert.ok(prim.includes(')>:where(*){margin-block:0}'));
});

test('primitivesCss emits grid in the layout layer', () => {
  assert.ok(prim.startsWith('@layerkuwa.layout{'));
  assert.ok(prim.includes('.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(var(--min,16rem),100%),1fr));gap:var(--gap,var(--space-m))}'));
});

test('vocabJson shape', () => {
  const v = vocabJson(list, '0.1.0') as any;
  assert.equal(v.version, '0.1.0');
  assert.ok(!('$schema' in v), 'vocab.json must not point at a schema URL that does not exist');
  assert.equal(v.prefixes.m, '48rem');
  assert.equal(v.classes.find((c: any) => c.name === 'row').responsive, true);
  assert.equal(v.classes.find((c: any) => c.name === 'padding-l').responsive, false);
  assert.equal(v.classes.find((c: any) => c.name === 'primary').kind, 'modifier');
  assert.deepEqual(v.classes.find((c: any) => c.name === 'primary').appliesTo, ['button', '.button', '.badge', '.alert']);
  assert.equal(v.translations['p-4'], 'padding-m');
  assert.deepEqual(v.responsive, list.length ? ['hidden', 'block', 'stack', 'row', 'cols-1', 'cols-2', 'cols-3', 'cols-4', 'text-left', 'text-center', 'text-right', 'order-first', 'order-last', 'grow'] : []);
  assert.equal(Object.keys(v.translations).length, Object.keys(TRANSLATIONS).length);
});

test('dts lists plain and prefixed forms and a cx helper', () => {
  const d = dts(list);
  assert.ok(d.includes("'padding-l'"));
  assert.ok(d.includes("'m:row'"));
  assert.ok(d.includes("'xl:hidden'"));
  assert.ok(!d.includes("'m:padding-l'"));
  assert.ok(d.includes('export type KuwaClass'));
  assert.ok(d.includes('export function cx('));
});
