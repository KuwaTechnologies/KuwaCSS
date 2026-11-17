# Changelog

## 0.1.0

First public release.

### Hardening after the independent review

- `kuwacss check --fix` preserves a UTF-8 byte-order mark and never rewrites inside `pre`, `code`, `script` or `style`, nor inside Markdown fences and backticks; code samples are still checked.
- `kuwacss check` reports files it skips as not UTF-8 on stderr and counts only checked files in the summary.
- Disabled `primary`, `danger` and `ghost` buttons no longer change colour on hover.
- `vocab.json` no longer carries a `$schema` URL that does not resolve.
- Extractor line numbering is linear; 50,000 class attributes are processed in well under a second.
- Tests run one file at a time so the dist build cannot race files that read it; completeness tests match whole selectors.
- Docs: the README names the reduced-motion exception to "no `!important`"; `llms.txt` notes that `text-left` and `text-right` follow writing direction.
- Workflows: CI is read-only and also runs on tags; the release job pins npm 11 and runs the browser suite and the example check before publishing.

### Contents

- Classless base: semantic HTML looks finished in light and dark mode.
- Layout primitives: `stack`, `row`, `grid`, `cols-1..4`, `container`, `center`, `sidebar`, `sidebar-right`, `cover`, `switcher`, `frame`, `reel`.
- Hole-free utility grammar on one scale (`0 xs s m l xl 2xl 3xl`) for spacing, text, colour, box, sizing, display and position.
- Three responsive prefixes (`m:`, `l:`, `xl:`) on a 14-word whitelist.
- Seven components: button variants, card, badge, alert, prose, switch, icon.
- Tokens: five role colours, six neutrals, fluid type and space scales; retheme in one line.
- Cascade layers: your CSS always wins without `!important`.
- AI contract: `dist/llms.txt` (under 2,500 tokens), `dist/llms-full.txt` with the cookbook, `dist/vocab.json`, `dist/kuwa.d.ts`.
- CLI: `kuwacss check` (foreign spellings, near-misses, bad prefixes, stray modifiers, `--fix`, `--json`, `--strict`) and `kuwacss init`.
- Tests: grammar completeness, drift, size budget (10 KB gzipped), token budget, contrast in both schemes, tint hue, layout behaviour, axe.

The vocabulary is not frozen until 1.0; 0.x releases may still rename classes.
