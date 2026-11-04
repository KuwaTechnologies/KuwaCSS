import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, computed, closeAll } from './helpers.ts';

after(closeAll);
const box = (page: any, sel: string) => page.$eval(sel, (el: Element) => { const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height, bottom: r.bottom }; });

test('grid fits as many 16rem columns as the container allows', async () => {
  const wide = await open({ file: 'kitchen-sink.html' }, { width: 1280 });
  const narrow = await open({ file: 'kitchen-sink.html' }, { width: 375 });
  assert.equal((await computed(wide, '#grid', 'grid-template-columns')).split(' ').length, 4);
  assert.equal((await computed(narrow, '#grid', 'grid-template-columns')).split(' ').length, 1);
});

test('sidebar sits beside its content when wide and stacks when narrow', async () => {
  const wide = await open({ file: 'kitchen-sink.html' }, { width: 1280 });
  const narrow = await open({ file: 'kitchen-sink.html' }, { width: 375 });
  const [wa, wb] = [await box(wide, '#sidebar > :first-child'), await box(wide, '#sidebar > :last-child')];
  assert.equal(wa.y, wb.y, 'same row when wide');
  const [na, nb] = [await box(narrow, '#sidebar > :first-child'), await box(narrow, '#sidebar > :last-child')];
  assert.ok(nb.y >= na.bottom, 'stacked when narrow');
});

test('switcher is a row when wide and a stack when narrow', async () => {
  const wide = await open({ file: 'kitchen-sink.html' }, { width: 1280 });
  const narrow = await open({ file: 'kitchen-sink.html' }, { width: 375 });
  const ys = async (p: any) => Promise.all([1, 2, 3].map((n) => box(p, `#switcher > :nth-child(${n})`).then((b: any) => b.y)));
  assert.equal(new Set(await ys(wide)).size, 1, 'one row when wide');
  assert.equal(new Set(await ys(narrow)).size, 3, 'three rows when narrow');
});

test('cover fills the viewport and centres its only child', async () => {
  const page = await open({ file: 'kitchen-sink.html' }, { width: 1280 });
  const cover = await box(page, '#cover');
  const child = await box(page, '#cover-child');
  assert.ok(cover.h >= 800, `cover height ${cover.h}`);
  const coverMid = cover.y + cover.h / 2, childMid = child.y + child.h / 2;
  assert.ok(Math.abs(coverMid - childMid) <= 2, `child offset ${Math.abs(coverMid - childMid)}`);
});

test('hidden m:stack is hidden on phones and a flex column from tablets', async () => {
  const narrow = await open({ file: 'kitchen-sink.html' }, { width: 375 });
  const wide = await open({ file: 'kitchen-sink.html' }, { width: 1280 });
  assert.equal(await computed(narrow, '#hm', 'display'), 'none');
  assert.equal(await computed(wide, '#hm', 'display'), 'flex');
  assert.equal(await computed(wide, '#hm', 'flex-direction'), 'column');
});

test('min-width-0 lets a flex child with an unbroken string shrink', async () => {
  const page = await open({ file: 'kitchen-sink.html' }, { width: 375 });
  const child = await box(page, '#shrink');
  const parent = await box(page, '#shrink-wrap');
  assert.ok(child.w <= parent.w, `child ${child.w} wider than parent ${parent.w}`);
});

test('flow margins are zeroed inside a stack and kept outside', async () => {
  const page = await open({ file: 'kitchen-sink.html' });
  assert.equal(await computed(page, '#stack > p', 'margin-bottom'), '0px');
  assert.equal(await computed(page, '#flow-p', 'margin-bottom'), '16px');
});
