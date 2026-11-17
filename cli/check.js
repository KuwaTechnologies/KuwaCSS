/** `kuwacss check`: validates class names in source files and reports what to change. */
import { readFileSync, writeFileSync, lstatSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { extractClasses, CLASS_ATTR } from './extract.js';
import { analyze } from './analyze.js';

export function loadVocab() {
  return JSON.parse(readFileSync(new URL('../dist/vocab.json', import.meta.url), 'utf8'));
}

/** Returns the file as text (byte-order mark preserved), or null when it is binary or not valid UTF-8. Throws for unreadable paths. */
function readText(file) {
  const buf = readFileSync(file);
  if (buf.includes(0)) return null;
  try { return new TextDecoder('utf-8', { fatal: true, ignoreBOM: true }).decode(buf); } catch { return null; }
}

/** Ranges that --fix must never touch: code samples. HTML pre/code/script/style everywhere; fences and backticks in Markdown. */
export function protectedRanges(text, file = '') {
  const ranges = [];
  const add = (re) => { for (const m of text.matchAll(re)) ranges.push([m.index, m.index + m[0].length]); };
  add(/<(pre|code|script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi);
  if (/\.mdx?$/i.test(file)) {
    add(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm);
    add(/`[^`\n]+`/g);
  }
  return ranges;
}

const EXTENSIONS = new Set(['.html', '.htm', '.jsx', '.tsx', '.js', '.ts', '.vue', '.svelte', '.astro', '.md', '.mdx']);

/**
 * Expands directories into their markup and component files, skipping node_modules, dot folders and symlinks.
 * Returns { files, errors }; a missing path is an error, never a crash.
 */
export function expandPaths(paths) {
  const files = [], errors = [];
  const walk = (p) => {
    const st = lstatSync(p);
    if (st.isSymbolicLink()) return;
    if (st.isDirectory()) {
      for (const name of readdirSync(p).sort()) {
        if (name === 'node_modules' || name.startsWith('.')) continue;
        walk(join(p, name));
      }
    } else if ([...EXTENSIONS].some((e) => p.endsWith(e))) {
      files.push(p);
    }
  };
  for (const p of paths) {
    try {
      const st = lstatSync(p);
      if (st.isDirectory()) walk(p); else files.push(p);
    } catch (e) {
      errors.push(`${p}: ${e.code === 'ENOENT' ? 'no such file or directory' : e.message}`);
    }
  }
  return { files, errors };
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Replaces a whole class token inside class attributes only, leaving protected ranges (code samples) untouched. */
export function replaceClassToken(text, from, to, ranges = []) {
  const token = new RegExp(`(^|[\\s"'\`{])${escapeRe(from)}(?=[\\s"'\`}]|$)`, 'g');
  return text.replace(CLASS_ATTR, (attr, ...args) => {
    const offset = args[args.length - 2];
    if (ranges.some(([a, b]) => offset >= a && offset < b)) return attr;
    return attr.replace(token, `$1${to}`);
  });
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
  let sources;
  if (useStdin) {
    sources = [{ file: '<stdin>', text: await io.stdin() }];
  } else {
    const { files: found, errors } = expandPaths(files);
    sources = [];
    for (const f of found) {
      try { sources.push({ file: f, text: readText(f) }); } catch (e) { errors.push(`${f}: ${e.message}`); }
    }
    if (errors.length) {
      for (const e of errors) io.stderr(`kuwacss check: ${e}\n`);
      return 2;
    }
  }
  const all = [];
  let fixed = 0, checked = 0;
  for (const { file, text } of sources) {
    if (text === null) { io.stderr(`kuwacss check: ${file}: skipped (not UTF-8 text)\n`); continue; }
    checked++;
    if (text === '') continue;
    let findings = analyze(extractClasses(text), vocab, { strict });
    if (fix && file !== '<stdin>') {
      const fixable = findings.filter((f) => f.kind === 'foreign' && f.suggestion && !f.suggestion.includes(' '));
      if (fixable.length) {
        const ranges = protectedRanges(text, file);
        let out = text;
        for (const f of fixable) out = replaceClassToken(out, f.cls, f.suggestion, ranges);
        if (out !== text) writeFileSync(file, out);
        const after = analyze(extractClasses(out), vocab, { strict });
        const foreignCount = (list) => list.filter((f) => f.kind === 'foreign').length;
        fixed += foreignCount(findings) - foreignCount(after);
        findings = after;
      }
    }
    for (const f of findings) all.push({ file, ...f });
  }
  if (json) {
    io.stdout(JSON.stringify(all, null, 2) + '\n');
  } else {
    for (const f of all) io.stdout(`${f.file}:${f.line}  ${f.cls}  ${f.kind}  ${f.message}\n`);
    const n = all.length;
    io.stdout(`${n} finding${n === 1 ? '' : 's'} in ${checked} file${checked === 1 ? '' : 's'}${fix ? `, fixed ${fixed}` : ''}\n`);
  }
  return all.length ? 1 : 0;
}
