import { chromium, type Browser, type Page } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let browser: Browser | undefined;
const DIST = fileURLToPath(new URL('../../dist/kuwa.css', import.meta.url));
export const EXAMPLES = fileURLToPath(new URL('../../examples/', import.meta.url));

export async function launch(): Promise<Browser> {
  browser ??= await chromium.launch();
  return browser;
}

export async function closeAll(): Promise<void> {
  await browser?.close();
  browser = undefined;
}

/** Opens an example file (by name) or an inline HTML snippet with dist/kuwa.css inlined. */
export async function open(target: { file?: string; html?: string }, opts: { width?: number; scheme?: 'light' | 'dark'; reducedMotion?: boolean } = {}): Promise<Page> {
  const b = await launch();
  const ctx = await b.newContext({
    viewport: { width: opts.width ?? 1280, height: 800 },
    colorScheme: opts.scheme ?? 'light',
    reducedMotion: opts.reducedMotion ? 'reduce' : 'no-preference',
  });
  const page = await ctx.newPage();
  if (target.file) {
    await page.goto('file://' + EXAMPLES + target.file);
  } else {
    const css = readFileSync(DIST, 'utf8');
    await page.setContent(`<!doctype html><html lang="en"><head><meta charset="utf-8"><style>${css}</style></head><body>${target.html ?? ''}</body></html>`);
  }
  return page;
}

export async function computed(page: Page, selector: string, prop: string): Promise<string> {
  return page.$eval(selector, (el, p) => getComputedStyle(el as Element).getPropertyValue(p as string), prop);
}

/** Resolves any computed colour to sRGB via a canvas, so oklch and color-mix values compare safely. */
export async function rgb(page: Page, selector: string, prop: string): Promise<[number, number, number]> {
  return page.$eval(selector, (el, p) => {
    const value = getComputedStyle(el as Element).getPropertyValue(p as string);
    const c = document.createElement('canvas'); c.width = c.height = 1;
    const ctx = c.getContext('2d', { colorSpace: 'srgb' })!;
    ctx.fillStyle = value; ctx.fillRect(0, 0, 1, 1);
    const d = ctx.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]] as [number, number, number];
  }, prop);
}

export function luminance([r, g, b]: [number, number, number]): number {
  const f = (v: number) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: [number, number, number], b: [number, number, number]): number {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}
