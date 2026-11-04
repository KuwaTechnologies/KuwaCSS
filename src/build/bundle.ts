/** Assembles src/*.css and the generated CSS into dist/, in cascade layers, and writes the AI-contract files. */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { transform } from 'lightningcss';
import { entries } from '../vocab.ts';
import { utilitiesCss, primitivesCss, vocabJson, dts, llmsTxt, llmsFullTxt } from './generate.ts';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
export const LAYERS = '@layer kuwa.tokens, kuwa.reset, kuwa.base, kuwa.layout, kuwa.components, kuwa.utilities;';
/** Baseline 2024: light-dark(), color-mix, :has, nesting, container queries. */
const TARGETS = { chrome: 123 << 16, firefox: 120 << 16, safari: (17 << 16) | (5 << 8) };

export const pkg = JSON.parse(readFileSync(ROOT + 'package.json', 'utf8')) as { version: string };
const src = (f: string) => (existsSync(ROOT + 'src/' + f) ? readFileSync(ROOT + 'src/' + f, 'utf8') : '');
const wrap = (layer: string, css: string) => `@layer ${layer} {\n${css}\n}\n`;

export function assemble(opts: { scoped?: boolean } = {}): string {
  const list = entries();
  const scope = (css: string) => (opts.scoped ? `@scope (.kuwa) {\n${css}\n}` : css);
  return [
    wrap('kuwa.tokens', src('tokens.css')),
    wrap('kuwa.reset', scope(src('reset.css'))),
    wrap('kuwa.base', scope(src('base.css'))),
    primitivesCss(list),
    wrap('kuwa.layout', src('layout.css')),
    wrap('kuwa.components', src('components.css')),
    utilitiesCss(list),
  ].join('\n');
}

const BANNER = `/*! KuwaCSS v${pkg.version} | MIT | https://github.com/KuwaTechnologies/KuwaCSS */`;

/** Lightning CSS drops a standalone layer-order statement, so it is re-added after transformation. */
function css(code: string, minify: boolean, filename: string): string {
  const out = transform({ filename, code: Buffer.from(code), minify, targets: TARGETS }).code.toString();
  return `${BANNER}\n${LAYERS}\n${out}`;
}

export const CX_JS = `// KuwaCSS: joins class names with a space, dropping falsy values. Types live in kuwa.d.ts.
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
`;

export async function build(): Promise<void> {
  const dist = ROOT + 'dist/';
  mkdirSync(dist, { recursive: true });
  const list = entries();
  const full = assemble();
  writeFileSync(dist + 'kuwa.css', css(full, false, 'kuwa.css'));
  writeFileSync(dist + 'kuwa.min.css', css(full, true, 'kuwa.min.css'));
  const scoped = assemble({ scoped: true });
  let scopedOut: string;
  try {
    scopedOut = css(scoped, true, 'kuwa-scoped.css');
  } catch {
    scopedOut = `${BANNER}\n${LAYERS}\n${scoped}`; // @scope not understood by the minifier: ship it unminified
  }
  writeFileSync(dist + 'kuwa-scoped.css', scopedOut);
  writeFileSync(dist + 'vocab.json', JSON.stringify(vocabJson(list, pkg.version), null, 2) + '\n');
  writeFileSync(dist + 'kuwa.d.ts', dts(list));
  writeFileSync(dist + 'cx.js', CX_JS);

  const major = parseInt(pkg.version, 10);
  const llms = llmsTxt(list, major, readFileSync(ROOT + 'src/llms.template.md', 'utf8'));
  writeFileSync(dist + 'llms.txt', llms);
  const patterns = [
    ...readdirSync(ROOT + 'cookbook/').filter((f) => f.endsWith('.html')).sort().map((f) => ({ name: f, html: readFileSync(ROOT + 'cookbook/' + f, 'utf8') })),
    { name: 'pricing.html', html: readFileSync(ROOT + 'examples/pricing.html', 'utf8') },
  ];
  writeFileSync(dist + 'llms-full.txt', llmsFullTxt(llms, patterns, `https://cdn.jsdelivr.net/npm/kuwacss@${major}/dist/kuwa.min.css`));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await build();
  console.log('built dist/');
}
