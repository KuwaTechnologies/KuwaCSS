import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { open, computed, closeAll } from './helpers.ts';

after(closeAll);
const AXE = readFileSync(new URL('../../node_modules/axe-core/axe.min.js', import.meta.url), 'utf8');

for (const file of ['kitchen-sink.html', 'pricing.html']) {
  for (const scheme of ['light', 'dark'] as const) {
    test(`${file} (${scheme}): no serious or critical axe violations`, async () => {
      const page = await open({ file }, { scheme });
      await page.addScriptTag({ content: AXE });
      const violations = await page.evaluate(async () => (await (window as any).axe.run(document, { resultTypes: ['violations'] })).violations);
      const bad = violations
        .filter((v: any) => v.impact === 'serious' || v.impact === 'critical')
        .map((v: any) => `${v.id} (${v.impact}): ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.target?.[0]} — ${v.nodes[0]?.failureSummary?.split('\n')[1] ?? ''}`);
      assert.deepEqual(bad, []);
    });
  }
}

test('a focused button shows a 2px solid outline', async () => {
  const page = await open({ file: 'kitchen-sink.html' });
  await page.focus('#btn-default');
  assert.equal(await computed(page, '#btn-default', 'outline-style'), 'solid');
  assert.equal(await computed(page, '#btn-default', 'outline-width'), '2px');
});

test('reduced motion disables button transitions', async () => {
  const page = await open({ file: 'kitchen-sink.html' }, { reducedMotion: true });
  assert.equal(await computed(page, '#btn-default', 'transition-duration'), '0s');
});

test('buttons meet target size: 40px, or 24px for .small (WCAG 2.5.8)', async () => {
  const page = await open({ file: 'kitchen-sink.html' });
  const short = await page.$$eval('button, .button', (els) => els
    .map((e) => ({ id: (e as HTMLElement).id || e.textContent?.trim(), h: e.getBoundingClientRect().height, small: e.classList.contains('small') }))
    .filter((b) => b.h > 0 && b.h < (b.small ? 24 : 40)));
  assert.deepEqual(short, []);
});
