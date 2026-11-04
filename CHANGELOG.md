# Changelog

## 0.1.0

First public release.

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
