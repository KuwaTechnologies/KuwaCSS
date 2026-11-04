import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPACE, TEXT, ROLES, PREFIXES, RESPONSIVE, entries, TRANSLATIONS } from '../src/vocab.ts';

const list = entries();
const names = new Set(list.map((e) => e.name));
const has = (n: string) => assert.ok(names.has(n), `missing class: ${n}`);

test('names are unique', () => {
  assert.equal(names.size, list.length);
});

test('every spacing side × scale exists', () => {
  const sides = ['', 'x', 'y', 'top', 'bottom', 'left', 'right'];
  for (const prop of ['padding', 'margin']) {
    for (const side of sides) {
      for (const size of SPACE) has(side ? `${prop}-${side}-${size}` : `${prop}-${size}`);
      if (prop === 'margin') has(side ? `margin-${side}-auto` : 'margin-auto');
    }
  }
  for (const axis of ['', 'x', 'y']) for (const size of SPACE) has(axis ? `gap-${axis}-${size}` : `gap-${size}`);
});

test('text sizes complete', () => {
  for (const t of TEXT) has(`text-${t}`);
});

test('colour roles complete', () => {
  for (const r of ROLES) for (const n of [`color-${r}`, `bg-${r}`, `bg-${r}-soft`, `border-${r}`]) has(n);
  for (const n of ['color-text', 'color-muted', 'bg-page', 'bg-surface', 'bg-subtle', 'bg-transparent']) has(n);
});

test('RESPONSIVE names all exist and number 14', () => {
  assert.equal(RESPONSIVE.length, 14);
  for (const n of RESPONSIVE) has(n);
  assert.deepEqual(Object.keys(PREFIXES), ['m', 'l', 'xl']);
});

test('every utility and primitive has css, using logical properties only', () => {
  for (const e of list) {
    if (e.kind === 'utility' || e.kind === 'primitive') {
      assert.ok(e.css && Object.keys(e.css).length > 0, `${e.name} has no css`);
      for (const k of Object.keys(e.css)) assert.doesNotMatch(k, /-(left|right|top|bottom)$/, `${e.name} uses physical property ${k}`);
    }
  }
});

test('translations target valid names', () => {
  for (const [from, to] of Object.entries(TRANSLATIONS)) {
    for (const n of to.split(' ')) assert.ok(names.has(n), `translation ${from} -> ${to} targets unknown ${n}`);
  }
});

test('total distinct names between 300 and 400', () => {
  assert.ok(names.size >= 300 && names.size <= 400, `got ${names.size}`);
});

test('every entry has a description', () => {
  for (const e of list) assert.ok(e.description.length > 3, `${e.name} lacks description`);
});
