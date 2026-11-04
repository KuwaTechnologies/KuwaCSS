import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { open, rgb, luminance, closeAll } from './helpers.ts';

after(closeAll);

test('dark scheme switches the page surface', async () => {
  const light = await open({ file: 'kitchen-sink.html' }, { scheme: 'light' });
  const dark = await open({ file: 'kitchen-sink.html' }, { scheme: 'dark' });
  assert.ok(luminance(await rgb(light, 'html', 'background-color')) > 0.8);
  assert.ok(luminance(await rgb(dark, 'html', 'background-color')) < 0.2);
});

test('nested data-theme="light" inside data-theme="dark" renders light', async () => {
  const page = await open({ html: '<div data-theme="dark" id="outer"><p>dark</p><div data-theme="light" id="x"><p>light</p></div></div>' });
  assert.ok(luminance(await rgb(page, '#outer', 'background-color')) < 0.2, 'outer is dark');
  assert.ok(luminance(await rgb(page, '#x', 'background-color')) > 0.8, 'inner is light');
  assert.ok(luminance(await rgb(page, '#x p', 'color')) < 0.3, 'inner text is dark');
});
