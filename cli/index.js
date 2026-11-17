#!/usr/bin/env node
import { runCheck } from './check.js';

const HELP = `kuwacss — the KuwaCSS command line

  kuwacss check [files...] [--json] [--strict] [--fix] [--stdin]
      Validate class names. Lenient by default: flags foreign spellings (p-4),
      near-misses (text-md), bad prefixes (m:padding-l) and stray modifiers.
      --strict  also flag every class not in the vocabulary
      --fix     rewrite unambiguous foreign spellings in place (never inside pre, code,
                script or style, nor inside Markdown fences and backticks)
      --json    machine-readable output        --stdin  read markup from stdin

  kuwacss init [--agents] [--claude] [--link <file.html>] [--force]
      Copy kuwa.llms.txt into the project and point your AI tools at it.
`;

function readStdin() {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (c) => { data += c; });
    process.stdin.on('end', () => resolve(data));
  });
}

const [cmd, ...rest] = process.argv.slice(2);
const io = { stdin: readStdin, stdout: (s) => process.stdout.write(s), stderr: (s) => process.stderr.write(s) };

if (cmd === 'check') {
  process.exitCode = await runCheck(rest, io);
} else if (cmd === 'init') {
  const { runInit } = await import('./init.js');
  process.exitCode = await runInit(rest, io, process.cwd());
} else {
  io.stdout(HELP);
  process.exitCode = !cmd || cmd === '--help' || cmd === '-h' ? 0 : 2;
}
