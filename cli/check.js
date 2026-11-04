/** `kuwacss check`: validates class names in source files and reports what to change. */
import { readFileSync, writeFileSync, statSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { extractClasses, CLASS_ATTR } from './extract.js';
import { analyze } from './analyze.js';

export function loadVocab() {
  return JSON.parse(readFileSync(new URL('../dist/vocab.json', import.meta.url), 'utf8'));
}

/** Returns the file as text, or null when it is binary or not valid UTF-8. */
function readText(file) {
  const buf = readFileSync(file);
  if (buf.includes(0)) return null;
  try { return new TextDecoder('utf-8', { fatal: true }).decode(buf); } catch { return null; }
}

const EXTENSIONS = new Set(['.html', '.htm', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.astro', '.md', '.mdx']);

/** Expands directories into their markup and component files, skipping node_modules and dot folders. */
export function expandPaths(paths) {
  const out = [];
  const walk = (p) => {
    if (statSync(p).isDirectory()) {
      for (const name of readdirSync(p).sort()) {
        if (name === 'node_modules' || name.startsWith('.')) continue;
        walk(join(p, name));
      }
    } else if ([...EXTENSIONS].some((e) => p.endsWith(e)) || !out.length && paths.includes(p)) {
      out.push(p);
    }
  };
  for (const p of paths) {
    if (statSync(p).isDirectory()) walk(p); else out.push(p);
  }
  return out;
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Replaces a whole class token inside class attributes only. */
export function replaceClassToken(text, from, to) {
  const token = new RegExp(`(^|[\\s"'\`{])${escapeRe(from)}(?=[\\s"'\`}]|$)`, 'g');
  return text.replace(CLASS_ATTR, (attr) => attr.replace(token, `$1${to}`));
}

export async function runCheck(argv, io) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const files = argv.filter((a) => !a.startsWith('--'));
  const json = flags.has('--json'), strict = flags.has('--strict'), fix = flags.has('--fix'), useStdin = flags.has('--stdin');
  if (!files.length && !useStdin) {
    io.stderr('usage: kuwacss check [files...] [--json] [--strict] [--fix] [--stdin]\n');
    return 2;
  }
  const vocab = loadVocab();
  const sources = useStdin ? [{ file: '<stdin>', text: await io.stdin() }] : expandPaths(files).map((f) => ({ file: f, text: readText(f) }));
  const all = [];
  let fixed = 0;
  for (const { file, text } of sources) {
    if (text === null || text === '') continue;
    let findings = analyze(extractClasses(text), vocab, { strict });
    if (fix && file !== '<stdin>') {
      const fixable = findings.filter((f) => f.kind === 'foreign' && f.suggestion && !f.suggestion.includes(' '));
      if (fixable.length) {
        let out = text;
        for (const f of fixable) out = replaceClassToken(out, f.cls, f.suggestion);
        writeFileSync(file, out);
        fixed += fixable.length;
        findings = analyze(extractClasses(out), vocab, { strict });
      }
    }
    for (const f of findings) all.push({ file, ...f });
  }
  if (json) {
    io.stdout(JSON.stringify(all, null, 2) + '\n');
  } else {
    for (const f of all) io.stdout(`${f.file}:${f.line}  ${f.cls}  ${f.kind}  ${f.message}\n`);
    const n = all.length, m = sources.length;
    io.stdout(`${n} finding${n === 1 ? '' : 's'} in ${m} file${m === 1 ? '' : 's'}${fix ? `, fixed ${fixed}` : ''}\n`);
  }
  return all.length ? 1 : 0;
}
