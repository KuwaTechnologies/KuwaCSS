import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, rgb, rgba, bgOf, contrast, computed, closeAll } from './helpers.ts';

after(closeAll);
const ROLES = ['primary', 'success', 'warning', 'danger', 'info'];

for (const scheme of ['light', 'dark'] as const) {
  test(`${scheme}: text meets 4.5:1 on every surface, badge, alert and button`, async () => {
    const page = await open({ file: 'kitchen-sink.html' }, { scheme });
    const failures: string[] = [];
    const check = async (sel: string, min = 4.5) => {
      const c = contrast(await rgb(page, sel, 'color'), await bgOf(page, sel));
      if (c < min) failures.push(`${sel} ${c.toFixed(2)}`);
    };
    for (const r of ROLES) for (const sel of [`#bg-${r}`, `#bg-${r}-soft`, `#badge-${r}`, `#alert-${r}`, `#bg-${r} a`, `#bg-${r}-soft a`, `#alert-${r} a`]) await check(sel);
    for (const sel of ['#badge-default', '#alert-default', '#btn-default', '#btn-primary', '#btn-ghost', '#btn-danger', '#btn-link',
      '#flow-p', '#surface', '#subtle', '#muted', '#link', '#card p', '#dark-section p', '#dark-section button', '#prose p']) await check(sel);
    assert.deepEqual(failures, [], `${scheme} contrast failures: ${failures.join(', ')}`);
  });

  test(`${scheme}: components paint their own background`, async () => {
    const page = await open({ file: 'kitchen-sink.html' }, { scheme });
    for (const sel of ['#badge-primary', '#badge-default', '#alert-danger', '#card', '#btn-primary', '#switch']) {
      const [, , , a] = await rgba(page, sel, 'background-color');
      assert.ok(a > 0, `${sel} has no background of its own`);
    }
  });

  test(`${scheme}: focus ring contrasts 3:1 with the page`, async () => {
    const page = await open({ file: 'kitchen-sink.html' }, { scheme });
    await page.focus('#btn-default');
    assert.equal(await computed(page, '#btn-default', 'outline-style'), 'solid');
    const c = contrast(await rgb(page, '#btn-default', 'outline-color'), await rgb(page, 'html', 'background-color'));
    assert.ok(c >= 3, `ring contrast ${c.toFixed(2)}`);
  });
}

const ROLE_HUE: Record<string, number> = { primary: 262, success: 150, warning: 80, danger: 25, info: 230 };
/** Hue in degrees from a computed oklch() or oklab() colour string. */
function hueOf(value: string): number | null {
  const lch = /oklch\(([\d.]+%?) ([\d.]+) ([\d.]+)/.exec(value);
  if (lch) return parseFloat(lch[3]);
  const lab = /oklab\(([\d.]+%?) (-?[\d.]+) (-?[\d.]+)/.exec(value);
  if (lab) return ((Math.atan2(parseFloat(lab[3]), parseFloat(lab[2])) * 180) / Math.PI + 360) % 360;
  return null;
}
for (const scheme of ['light', 'dark'] as const) {
  test(`${scheme}: soft tints keep their role hue`, async () => {
    const page = await open({ file: 'kitchen-sink.html' }, { scheme });
    for (const r of ROLES) {
      const bg = await computed(page, `#badge-${r}`, 'background-color');
      const hue = hueOf(bg);
      assert.ok(hue !== null, `${r}: unexpected computed colour ${bg}`);
      const diff = Math.min(Math.abs(hue! - ROLE_HUE[r]), 360 - Math.abs(hue! - ROLE_HUE[r]));
      assert.ok(diff <= 45, `${scheme} ${r}: tint hue ${hue!.toFixed(0)} is ${diff.toFixed(0)} degrees from ${ROLE_HUE[r]}`);
    }
  });
}
