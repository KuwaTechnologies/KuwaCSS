import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('package.json is valid', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.name, 'kuwacss');
  assert.equal(pkg.bin.kuwacss, 'cli/index.js');
  assert.ok(pkg.files.includes('dist'));
});
