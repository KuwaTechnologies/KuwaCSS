/** `kuwacss init`: copies the context file into the project and points AI tools and HTML at KuwaCSS. */
import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const SENTENCE = 'This project uses KuwaCSS. Read `kuwa.llms.txt` before writing markup, then run `npx kuwacss check` on your output.';
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const CDN = `https://cdn.jsdelivr.net/npm/kuwacss@${parseInt(pkg.version, 10)}/dist/kuwa.min.css`;

export async function runInit(argv, io, cwd) {
  const flags = new Set(argv.filter((a) => a.startsWith('--')));
  const linkIndex = argv.indexOf('--link');
  const linkFile = linkIndex >= 0 ? argv[linkIndex + 1] : null;
  const notes = [];

  if (linkIndex >= 0) {
    if (!linkFile || linkFile.startsWith('--')) { io.stderr('kuwacss init: --link needs a file name, e.g. --link index.html\n'); return 2; }
    try { statSync(join(cwd, linkFile)); } catch { io.stderr(`kuwacss init: ${linkFile}: no such file\n`); return 2; }
  }

  const target = join(cwd, 'kuwa.llms.txt');
  if (!existsSync(target) || flags.has('--force')) {
    writeFileSync(target, readFileSync(new URL('../dist/llms.txt', import.meta.url), 'utf8'));
    notes.push('wrote kuwa.llms.txt');
  } else {
    notes.push('kuwa.llms.txt already exists (use --force to replace it)');
  }

  const mention = (name) => {
    const file = join(cwd, name);
    const current = existsSync(file) ? readFileSync(file, 'utf8') : '';
    if (current.includes(SENTENCE)) { notes.push(`${name} already mentions KuwaCSS`); return; }
    writeFileSync(file, (current ? current.replace(/\n*$/, '\n\n') : '') + SENTENCE + '\n');
    notes.push(`${current ? 'updated' : 'created'} ${name}`);
  };
  if (flags.has('--agents')) mention('AGENTS.md');
  if (flags.has('--claude')) mention('CLAUDE.md');

  if (linkFile) {
    const file = join(cwd, linkFile);
    const html = readFileSync(file, 'utf8');
    if (html.includes(CDN)) notes.push(`${linkFile} already links KuwaCSS`);
    else if (html.includes('</head>')) {
      writeFileSync(file, html.replace('</head>', `  <link rel="stylesheet" href="${CDN}">\n</head>`));
      notes.push(`linked KuwaCSS in ${linkFile}`);
    } else io.stderr(`${linkFile}: no </head> found; add the link tag yourself\n`);
  }

  io.stdout(`${notes.map((n) => `- ${n}`).join('\n')}

Next steps:
  1. Add to your HTML:  <link rel="stylesheet" href="${CDN}">
  2. Give your AI tools the vocabulary: paste kuwa.llms.txt into the system prompt,
     or run \`npx kuwacss init --agents\` (AGENTS.md) or \`--claude\` (CLAUDE.md).
  3. Validate generated markup:  npx kuwacss check src
`);
  return 0;
}
