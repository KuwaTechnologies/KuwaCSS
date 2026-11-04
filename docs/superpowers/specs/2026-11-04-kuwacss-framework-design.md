# KuwaCSS: Design Spec

**Date:** 2026-11-04
**Status:** Draft for review (architectural path, brainstorming stage complete)
**Tagline:** *A 150-word UI vocabulary that humans and AI both speak fluently. One file. No build. No JavaScript.*

---

## 1. Summary

KuwaCSS is a CSS framework built around one idea: **the whole framework must fit in a single page that a developer or a language model can read once and then use without error.**

It combines four proven ideas and adds a fifth that no major framework has:

| Idea | Borrowed from | What KuwaCSS does with it |
|---|---|---|
| Classless base | Pico, Simple.css, MVP.css | Plain semantic HTML looks finished. Classes refine, they never rescue. |
| Named layout primitives | Every Layout, CUBE CSS | `stack`, `row`, `grid`, `sidebar`, `cover`, `switcher`. Responsive without breakpoints. |
| Bounded utility grammar | Tailwind, Tachyons | ~150 words, one shared size scale, zero holes. Every analogy an LLM makes is true. |
| Design tokens | Open Props, shadcn | Five role colours plus six neutrals. Retheme in one line. Dark mode automatic. |
| **The AI contract** | New | A machine-readable vocabulary, a 2,500-token context file, a validator with "did you mean", and a published benchmark of how often LLMs get it right. |

The result is a stylesheet under 10 KB gzipped, loaded with one `<link>`, where user CSS always wins thanks to cascade layers, and where an agent can check its own output in one command.

---

## 2. Understanding and assumptions

### What you asked for
"Design an AI-friendly, powerful CSS framework that is super simple to use, developer friendly, and beats all popular CSS frameworks."

### What I take that to mean
- **AI-friendly:** an LLM given minimal context produces valid, good-looking markup on the first try, and can verify its own output.
- **Powerful:** any real layout is achievable without fighting the framework, and modern CSS (layers, container-aware primitives, `oklch`, `light-dark()`, `:has()`) is used to full advantage.
- **Super simple:** learnable in minutes, no build step, no configuration file, no JavaScript.
- **Developer friendly:** readable class names, predictable cascade, good defaults, honest docs, and a feedback loop that catches mistakes.
- **Beats popular frameworks:** wins on defined, measurable axes (section 18), not on every axis. Where Tailwind or Bootstrap still win, the spec says so.

### Assumptions I made because you were not available to ask
| # | Assumption | Why | Change it if... |
|---|---|---|---|
| A1 | The deliverable for this request is the design. Implementation starts after you approve it. | You wrote "design". | You wanted code first. |
| A2 | Target audience is developers building web apps and sites with AI assistance, plus the AI agents themselves. | "AI friendly" plus "developer friendly". | It is for designers or no-code users. |
| A3 | Modern browsers only: Baseline 2024 features are fair game. | Old-browser support is incompatible with "powerful and simple". | You need to support anything older than 2024 evergreen browsers. |
| A4 | Open source, MIT licence, published on npm and a CDN. | Standard for CSS frameworks; required for LLMs to learn it. | It is a private, internal framework. |
| A5 | Name: **KuwaCSS** (package `kuwacss`). | Your choice. `kuwacss` is free on npm and no CSS project on GitHub uses the name. | Decided. |
| A6 | Sizes use t-shirt names (`s m l`) rather than numbers (`2 4 8`). | Meaningful to humans, tiny to memorise, no arbitrary scale. | You want Tailwind-style numeric spacing. |
| A7 | No state variants (`hover:`, `focus:`) and no arbitrary values (`w-[137px]`) in v1. | They need a build step or explode file size. Components carry their own states; custom CSS covers the rest. | You consider them essential. |

### Success criteria
1. A developer who has never seen KuwaCSS builds a correct responsive landing page within 15 minutes using only `llms.txt`.
2. Frontier LLMs given `llms.txt` produce markup where **at least 97% of classes are valid** across the Kuwa Bench prompt set (section 12.7).
3. `kuwa.min.css` is **10 KB gzipped or smaller** with no JavaScript.
4. A page with zero classes passes WCAG 2.2 AA contrast and focus requirements in light and dark mode.
5. Any user CSS overrides KuwaCSS without `!important` or specificity tricks.

---

## 3. Goals and non-goals

### Goals
- One stylesheet, one `<link>`, zero build.
- Complete vocabulary learnable from one page.
- Intrinsically responsive layouts that need no breakpoint classes in the common case.
- Theming through a handful of custom properties; dark mode for free.
- Verifiable output: a validator any human or agent can run.
- Stable vocabulary: 1.x never renames or removes a class.

### Non-goals (v1)
- JavaScript widgets (dropdowns, carousels, toasts). Native `<dialog>`, `<details>`, `popover` cover most needs.
- Icon set.
- Hover, focus, or dark-mode class variants.
- Arbitrary-value syntax.
- Numeric spacing aliases or a Tailwind compatibility layer in the core file.
- Support for browsers older than Baseline 2024.

---

## 4. Approaches considered

### A. Tightened utility-first (Tailwind-shaped, smaller)
A JIT engine scans markup and emits only the utilities used, with a reduced, more regular vocabulary.
- **Pros:** familiar to the largest body of training data; arbitrary values and variants are cheap.
- **Cons:** needs a build step, which breaks the "paste one HTML file" workflow that LLMs and beginners rely on. Still produces class soup. Does not fix layout, the thing LLMs get wrong most.

### B. Classless plus components (Pico-shaped, bigger)
Style semantic HTML and add a component catalogue; few or no utilities.
- **Pros:** truly zero-learning for simple pages; tiny markup.
- **Cons:** hits a wall on real app layouts. Users end up writing bespoke CSS for everything beyond a blog, and LLMs have no shared vocabulary for layout.

### C. Vocabulary hybrid (recommended)
Classless base + named layout primitives + a bounded, hole-free utility grammar + tokens, wrapped in an explicit AI contract (context file, machine-readable vocab, validator, benchmark).
- **Pros:** no build step; layout is named, not assembled; the whole API fits in a prompt; mistakes are detectable; user CSS always wins.
- **Cons:** diverges from Tailwind spellings that models already know (mitigated by the context file and the validator's translation hints); fewer escape hatches inside the class system (mitigated by "write one line of CSS, it always wins").

**Recommendation: C.** It is the only approach that attacks all three root causes of AI-generated CSS failures: invented class names, broken layout, and build-step dependency.

---

## 5. Design principles (the seven laws)

1. **One page to learn.** The complete vocabulary, rules, and examples fit in 2,500 tokens. If a feature does not fit, it is not in core.
2. **Zero build.** One `<link>`. Everything is native CSS. Tooling exists only to check and to help, never to compile.
3. **Good by default.** Semantic HTML with no classes looks finished and is accessible.
4. **Say what you mean.** Class names are `property-value` in plain words. `padding-l`, not `p-6`. `color-danger`, not `text-red-600`.
5. **No holes in the grammar.** If `padding-m` exists, every side and every size exists. LLMs and humans learn by analogy; every analogy must be true.
6. **Layout is named, not assembled.** `sidebar`, not `flex flex-wrap gap-4 [&>*:first-child]:basis-64`.
7. **The cascade you can trust.** All KuwaCSS lives in a cascade layer. Any unlayered user rule wins, whatever its specificity. No `!important`, with a single documented accessibility exception.

---

## 6. The vocabulary

Everything below is the entire class API. Counts: 10 layout primitives, 2 sidebar variants, 4 fixed grids, ~150 distinct words (class names ignoring scale values), ~480 generated rules.

### 6.1 The scale

One size language, two tables.

| Step | Space (padding, margin, gap) | Text (font-size) |
|---|---|---|
| `0` | 0 | - |
| `xs` | 0.25rem | 0.75rem |
| `s` | 0.5rem | 0.875rem |
| `m` | 1rem | 1rem |
| `l` | clamp(1.5rem, 1.25rem + 1vw, 2rem) | clamp(1.125rem, 1.05rem + 0.3vw, 1.25rem) |
| `xl` | clamp(2rem, 1.5rem + 2vw, 3rem) | clamp(1.25rem, 1.1rem + 0.6vw, 1.5rem) |
| `2xl` | clamp(3rem, 2rem + 4vw, 5rem) | clamp(1.5rem, 1.2rem + 1.2vw, 2rem) |
| `3xl` | clamp(4rem, 2.5rem + 6vw, 8rem) | clamp(2rem, 1.5rem + 2vw, 3rem) |
| `4xl` | - | clamp(2.5rem, 1.5rem + 4vw, 4.5rem) |

Steps `l` and above are fluid: they grow with the viewport, so most pages need no responsive spacing classes.

**Bare-name rule:** a property name with no value means its medium value. `padding` = `padding-m`, `gap` = `gap-m`, `margin` = `margin-m`, `rounded` = `rounded-m`, `shadow` = `shadow-m`, `border` = the standard 1px border.

### 6.2 Layout primitives

Put one on a container. Each has knobs settable inline: `style="--gap: 2rem"`.

| Class | Behaviour | Knobs (default) |
|---|---|---|
| `stack` | Vertical flex column, children separated by gap. | `--gap` (m) |
| `row` | Horizontal flex, wraps, items vertically centred. | `--gap` (m) |
| `grid` | Responsive grid: as many columns as fit, each at least `--min` wide. | `--min` (16rem), `--gap` (m) |
| `cols-1` `cols-2` `cols-3` `cols-4` | Fixed column count. Combine with responsive prefixes. | `--gap` (m) |
| `container` | Centred content column with side padding. | `--container` (72rem) |
| `center` | Centres its children horizontally and vertically (`place-items: center`). | - |
| `sidebar` | First child is a fixed-width sidebar, second child fills. Stacks when there is no room. | `--side` (16rem), `--gap` (m) |
| `sidebar-right` | Same, sidebar is the last child. | same |
| `cover` | At least viewport height. First child sticks to top, last to bottom, middle children centred. A single child is centred. | `--min-height` (100dvh) |
| `switcher` | A row that becomes a stack when narrower than the threshold. | `--threshold` (30rem), `--gap` (m) |
| `frame` | Media box with a fixed aspect ratio; an `img` or `video` inside covers it. | `--ratio` (16/9) |
| `reel` | Horizontal scrolling strip with scroll snap. | `--gap` (m) |

Children and alignment:

| Group | Classes |
|---|---|
| Child sizing | `grow` `shrink-0` `span-2` `span-3` `span-full` |
| Child order | `order-first` `order-last` |
| Child self-align | `self-start` `self-center` `self-end` `self-stretch` |
| Cross-axis | `align-start` `align-center` `align-end` `align-stretch` `align-baseline` |
| Main-axis | `justify-start` `justify-center` `justify-end` `justify-between` `justify-around` `justify-evenly` |
| Wrapping | `wrap` `nowrap` (sets both `flex-wrap` and `white-space`, so "do not wrap" means what it says) |

Inside any layout primitive, the primitive owns spacing: direct children have their flow margins zeroed. Outside primitives, flow elements keep a bottom margin of `m` so classless pages have rhythm.

### 6.3 Spacing

| Pattern | Sides | Values |
|---|---|---|
| `padding-{side}-{scale}` | (none), `x`, `y`, `top`, `bottom`, `left`, `right` | `0 xs s m l xl 2xl 3xl` |
| `margin-{side}-{scale}` | same seven | same, plus `auto` |
| `gap-{axis}-{scale}` | (none), `x`, `y` | `0 xs s m l xl 2xl 3xl` |

`left` and `right` map to `inline-start` and `inline-end`, so RTL works without a second vocabulary.

### 6.4 Typography

| Group | Classes |
|---|---|
| Size | `text-xs` `text-s` `text-m` `text-l` `text-xl` `text-2xl` `text-3xl` `text-4xl` |
| Align | `text-left` `text-center` `text-right` |
| Family | `font-sans` `font-serif` `font-mono` |
| Weight (bare) | `light` `regular` `medium` `semibold` `bold` |
| Style (bare) | `italic` `uppercase` `lowercase` `capitalize` `underline` `strike` `tabular` |
| Wrapping | `truncate` `lines-2` `lines-3` `balance` `pretty` |
| Leading | `leading-tight` `leading-normal` `leading-loose` |
| Tracking | `tracking-tight` `tracking-normal` `tracking-wide` |

`text-` always means size. Colour is never under `text-`; that single Tailwind ambiguity (`text-lg` vs `text-red-500`) causes a measurable share of LLM errors.

### 6.5 Colour

Colours are **roles**, never hues. Five roles: `primary` `success` `warning` `danger` `info`. Six neutrals: `text` `muted` `border` `bg-page` `bg-surface` `bg-subtle`.

| Pattern | Values | Notes |
|---|---|---|
| `color-{x}` | five roles, `text`, `muted` | Text colour. |
| `bg-{role}` | five roles | Solid background **and** sets a readable text colour. |
| `bg-{role}-soft` | five roles | Tint for badges, alerts, highlights. Sets matching text colour. |
| `bg-page` `bg-surface` `bg-subtle` `bg-transparent` | - | Neutral surfaces. |
| `border-{role}` | five roles | Border colour. |
| `opacity-{n}` | `0 25 50 75 100` | - |

Each role is one token (`--primary`). KuwaCSS derives the soft tint, the on-colour text, the hover shade, and the focus ring with `color-mix()` in `oklch`, so the derived colours stay correct in dark mode because the surfaces they are mixed with change.

### 6.6 Borders, radius, shadow

| Group | Classes |
|---|---|
| Border | `border` `border-top` `border-bottom` `border-left` `border-right` `border-0` |
| Radius | `rounded` `rounded-0` `rounded-s` `rounded-l` `rounded-xl` `rounded-full` |
| Shadow | `shadow` `shadow-0` `shadow-s` `shadow-l` `shadow-xl` |

### 6.7 Sizing

| Group | Classes |
|---|---|
| Width | `width-full` `width-auto` `width-fit` `width-screen` |
| Height | `height-full` `height-auto` `height-screen` |
| Min | `min-height-screen` `min-width-0` |
| Max width | `max-width-s` (24rem) `max-width-m` (40rem) `max-width-l` (56rem) `max-width-xl` (72rem) `max-width-prose` (65ch) `max-width-full` `max-width-none` |

`min-width-0` is included because "flex child will not shrink" is one of the five most common layout bugs in generated code.

### 6.8 Display, position, overflow, interaction

| Group | Classes |
|---|---|
| Display | `hidden` `block` `inline` `inline-block` `visually-hidden` |
| Position | `relative` `absolute` `fixed` `sticky` `static` |
| Offsets | `inset-0` `top-0` `right-0` `bottom-0` `left-0` |
| Stacking | `z-below` (-1) `z-above` (10) `z-top` (1000) |
| Overflow | `overflow-hidden` `overflow-auto` `overflow-visible` `overflow-x-auto` `overflow-y-auto` |
| Interaction | `pointer` `transition` `select-none` |

### 6.9 Responsive prefixes

Mobile-first. Three prefixes, applied only to a whitelist, so the static file stays small and the mental model stays simple.

| Prefix | Min width |
|---|---|
| `m:` | 48rem (768px) |
| `l:` | 64rem (1024px) |
| `xl:` | 80rem (1280px) |

Whitelist (14 words): `hidden` `block` `stack` `row` `cols-1` `cols-2` `cols-3` `cols-4` `text-left` `text-center` `text-right` `order-first` `order-last` `grow`.

Example: `<div class="stack m:row">` stacks on phones and becomes a row from tablets up. `<nav class="hidden l:block">` appears on laptops.

Everything else is responsive without prefixes: fluid scale steps, `grid`, `switcher`, `sidebar`, `container`, `cover`.

### 6.10 Grammar rules (what the validator enforces)

1. A class is either a **layout primitive**, a **component or modifier**, a **bare adjective**, or `property-value` where the value is drawn from that property's declared set.
2. Every `property × value` combination declared in `vocab.json` exists in the CSS. Nothing else does. The test suite proves this on every build.
3. The bare adjective set is closed. Each is a CSS property (meaning "medium") or a CSS keyword whose property is unambiguous.
4. Role words (`primary` and friends) are modifiers. They do nothing on a plain element; the validator warns when one appears without a component class.
5. Responsive prefixes apply to the whitelist only; the validator rejects `m:padding-l`.
6. Knobs are custom properties set inline. The validator does not police them.

---

## 7. Tokens and theming

All tokens live on `:root` in the `kuwa.tokens` layer. Users override on `:root` or on any subtree.

```css
:root {
  /* Role colours (any colour space; oklch recommended) */
  --primary: oklch(55% 0.2 262);
  --success: oklch(62% 0.17 150);
  --warning: oklch(78% 0.16 80);
  --danger:  oklch(58% 0.21 25);
  --info:    oklch(62% 0.14 230);

  /* Neutrals, both modes in one declaration */
  --text:       light-dark(oklch(20% 0.01 260), oklch(93% 0.01 260));
  --muted:      light-dark(oklch(48% 0.02 260), oklch(70% 0.02 260));
  --border:     light-dark(oklch(88% 0.01 260), oklch(32% 0.01 260));
  --bg-page:    light-dark(oklch(99% 0 0),       oklch(16% 0.01 260));
  --bg-surface: light-dark(oklch(100% 0 0),      oklch(21% 0.01 260));
  --bg-subtle:  light-dark(oklch(96% 0.005 260), oklch(26% 0.01 260));

  /* Shape and type */
  --font: system-ui, sans-serif;
  --font-serif: Georgia, serif;
  --font-mono: ui-monospace, monospace;
  --radius: 0.5rem;
  --container: 72rem;
  --measure: 65ch;
  --transition: 150ms;

  color-scheme: light dark;
}
```

Derived tokens (computed by KuwaCSS, not meant for override): `--{role}-soft`, `--{role}-text`, `--on-{role}`, `--{role}-hover`, `--ring`, the space and text scales, and the shadow stack.

**Retheme in one line:** `:root { --primary: oklch(60% 0.19 25) }` makes the brand red everywhere: buttons, links, focus rings, badges, tints.

**Dark mode:** automatic from the OS. Force it on any subtree with `data-theme="dark"` or `data-theme="light"`; this works by switching `color-scheme`, so `light-dark()` resolves per element. A dark hero inside a light page is one attribute.

**Density and radius:** `--radius: 0` gives a flat, square look. `--radius: 9999px` gives pills.

---

## 8. Classless base

Semantic HTML gets a finished look with no classes. The reset is minimal (box-sizing, media defaults, margin normalisation) so user expectations about elements still hold.

| Element | Treatment |
|---|---|
| `body` | `--font`, `--text` on `--bg-page`, line-height 1.5, text-rendering tuned. |
| `h1`–`h4` | `text-3xl` `2xl` `xl` `l`, semibold, tight leading, `text-wrap: balance`, top margin `l` when not first. |
| `p`, lists, `blockquote`, `pre`, `table`, `figure` | Bottom margin `m` (zeroed inside layout primitives). |
| `a` | `--primary`, underline with offset; no underline inside `nav`. |
| `button`, `.button` | Min height 2.5rem, padding, radius, 1px border, medium weight, hover shade, focus ring, disabled opacity. Default look is neutral. |
| `input` `select` `textarea` | Block, full width, min height 2.5rem, surface background, border, radius, focus ring. Checkbox and radio use `accent-color: var(--primary)`. |
| `label` | Grid with `xs` gap so text sits above its input. `label:has(> input[type=checkbox])` and radio become an inline row instead. |
| `fieldset` | Border, radius, padding; `legend` semibold. |
| `table` | Full width, collapsed borders, `th` left-aligned semibold, row separators, cell padding `s m`. |
| `dialog` | Centred, max width `min(90vw, 36rem)`, surface, radius, `xl` shadow; backdrop at 50% black. |
| `details` `summary` | Border, radius, padding; `summary` pointer and semibold. |
| `code` `kbd` `mark` `pre` | Mono family, subtle background, small radius; `pre` scrolls horizontally. |
| `hr` | 1px `--border`, vertical margin `l`. |
| `img` `video` `svg` | `display: block; max-width: 100%; height: auto`. |
| `nav` | Flex row, wraps, `m` gap; nested lists lose bullets and padding. |
| `progress` | Accent colour primary, height 0.5rem, rounded. |
| `:focus-visible` | 2px `--ring` outline, 2px offset. Everywhere. |
| `@media (prefers-reduced-motion: reduce)` | Transitions and animations off. This is the one permitted `!important`. |

All base selectors are wrapped in `:where()` so they carry zero specificity.

---

## 9. Components

Seven components. Anything not here is either a styled element (section 8) or a layout primitive (section 6.2).

| Component | Markup | Modifiers |
|---|---|---|
| Button | `<button>` or `<a class="button">` | `primary` `ghost` `danger`, `small` `large` |
| Card | `<article class="card">` | - (compose with `stack`, `padding-*`) |
| Badge | `<span class="badge">` | any role |
| Alert | `<div class="alert" role="status">` | any role |
| Prose | `<article class="prose">` | - |
| Switch | `<input type="checkbox" class="switch">` | - |
| Icon | `<svg class="icon">` | - |

Rules:
- Modifiers are plain words scoped to the component (`.badge.primary`), so they cannot leak.
- Components use tokens only. Retheming the tokens rethemes every component.
- Components carry their own hover, focus, active, and disabled states. That is why there are no state utilities.
- Interactive patterns use native HTML: `<dialog>` with `showModal()`, `<details>` for disclosure, the `popover` attribute with `popovertarget` for menus and tooltips. KuwaCSS styles these; it ships no script.

---

## 10. Cascade architecture

```css
@layer kuwa.tokens, kuwa.reset, kuwa.base, kuwa.layout, kuwa.components, kuwa.utilities;
```

- Inside KuwaCSS, later layers win: a utility on a component beats the component (`button.width-full` works).
- Responsive utilities are emitted after their base utilities, so `hidden m:block` resolves in order.
- **User CSS is unlayered and therefore always wins**, regardless of specificity. Writing `.hero { padding: 7rem }` beats `padding-3xl` with no `!important`.
- Users who adopt layers themselves declare `@layer kuwa, app;` once and keep the same guarantee.
- A second build, `kuwa-scoped.css`, wraps `reset` and `base` in `@scope (.kuwa)` for dropping KuwaCSS into an existing site without restyling every element.

---

## 11. Responsiveness strategy

Three tiers, in the order a user should reach for them:

1. **Intrinsic.** `grid`, `switcher`, `sidebar`, `row` (wrapping), `container`, and `cover` adapt to available space with no classes. This covers roughly 80% of real layouts.
2. **Fluid.** Scale steps `l` and above, and text sizes `l` and above, interpolate with the viewport via `clamp()`. Headings and section padding breathe without prefixes.
3. **Explicit.** Three prefixes on fourteen words for the remaining cases: hide or show, change column count, switch stack to row, reorder.

Container queries are an implementation detail where they make a primitive more robust; they are not exposed as a class API in v1.

---

## 12. The AI contract

This is the part no popular framework ships. Every item is generated from the same source so none can drift.

### 12.1 `llms.txt` (2,500 tokens or fewer)
The complete vocabulary, the grammar rules, the theme tokens, and four examples. Meant to be pasted into a system prompt, `CLAUDE.md`, `AGENTS.md`, or `.cursor/rules`. Draft in Appendix A; by character count it is roughly 1,600 to 1,950 tokens, so the budget leaves room for a few more examples. CI fails if it exceeds the token budget.

### 12.2 `llms-full.txt`
`llms.txt` plus the cookbook: 25 complete single-file patterns (landing, pricing, dashboard shell, settings form, blog post, auth page, data table, empty state, and so on). Models pattern-match; give them correct patterns to match.

### 12.3 `vocab.json`
Machine-readable list of every valid class: name, group, CSS property, value, description, whether it accepts responsive prefixes, and which components a modifier belongs to. Schema in Appendix C. This is the single input for the validator, editor completion, the docs site, the TypeScript types, and the two text files.

### 12.4 `npx kuwacss check`
```
npx kuwacss check src/**/*.html            # files
npx kuwacss check --stdin < snippet.html   # pipe
npx kuwacss check --json                   # for agents
npx kuwacss check --fix                    # apply safe translations
```
Scans `class` and `className` attributes in HTML, JSX, TSX, Vue, Svelte, Astro, and template literals. Reports:
- **Unknown class** with a "did you mean" suggestion (edit distance within the vocab).
- **Foreign spelling** with the KuwaCSS equivalent, from a curated translation table (`p-4` to `padding-m`, `flex items-center gap-2` to `row gap-s`, `btn btn-primary` to `button primary`, `container mx-auto` to `container`, `sr-only` to `visually-hidden`).
- **Modifier without component** (`primary` on a bare `div`).
- **Prefix outside whitelist** (`m:padding-l`).

Projects have their own classes (`hero`, `logo`), so the default mode is lenient: it flags only classes that look like KuwaCSS (a known stem with an invalid value, or within edit distance 2 of a KuwaCSS class), foreign-framework spellings, bad prefixes, and stray modifiers. Everything else passes. `--strict` flags every class not in the vocabulary, for projects that want zero custom classes.

Exit code is non-zero on any finding, so it works in CI and in an agent loop. `--fix` applies only unambiguous one-to-one translations.

### 12.5 `npx kuwacss init`
Adds the `<link>` to the entry HTML if asked, copies `llms.txt` into the project, and appends one line to `AGENTS.md` or `CLAUDE.md`: "This project uses KuwaCSS. Read `kuwa.llms.txt` before writing markup, then run `npx kuwacss check` on your output." Opt-in for each file touched.

### 12.6 Types
`kuwacss/types` exports `type KuwaClass` (a union of every valid class including prefixed forms) and a `cx()` helper that type-checks string literals. Optional, for TypeScript users who want editor completion and red squiggles.

### 12.7 Kuwa Bench
A reproducible evaluation: 40 prompts ("build a pricing page with three tiers", "dashboard with a collapsible sidebar") run against several frontier models, with and without `llms.txt` in context. Metrics:
- **Valid-class rate** (via `kuwacss check`).
- **Layout correctness** at three viewport widths, scored by a rubric with an LLM judge and spot-checked by a human.
- **Tokens per page** of generated markup.
The same prompts run against Tailwind with its docs excerpt as the baseline. Results are published with each release. The 1.0 release gate is a 97% valid-class rate for the top three models with `llms.txt` in context.

### 12.8 Stability promise
The 1.0 vocabulary is frozen. 1.x releases add words and never rename or remove them. The CDN URL `kuwacss@1` stays valid for the life of the project. Framework version confusion (Bootstrap 4 versus 5, Tailwind 3 versus 4) is one of the largest sources of LLM error today; KuwaCSS removes it by policy.

### 12.9 Later (not v1)
A tiny MCP server, `kuwa-mcp`, exposing `validate(markup)` and `vocab()` so agents in any IDE can check without the shell. It wraps the CLI and adds no new logic.

---

## 13. Repository architecture

```
kuwacss/
  src/
    vocab.ts            # SINGLE SOURCE OF TRUTH: scales, property groups, primitives,
                        # components, modifiers, prefix whitelist, descriptions
    tokens.css          # :root custom properties and @property registrations
    reset.css
    base.css            # classless elements
    layout.css          # primitives and alignment
    components.css
    build/
      generate.ts       # vocab.ts -> utilities.css, vocab.json, llms.txt, llms-full.txt, kuwa.d.ts
      bundle.ts         # concatenate layers, transpile nesting, minify, gzip-size check
  cookbook/             # 25 single-file patterns, used by llms-full.txt, docs, and bench
  cli/                  # `kuwacss` bin: check, init
  bench/                # prompts, runner, rubric, published results
  docs/                 # static site generated from vocab.json and cookbook; playground
  test/
  dist/
    kuwa.css  kuwa.min.css  kuwa-scoped.css
    vocab.json  llms.txt  llms-full.txt  kuwa.d.ts
```

Build tooling for the framework itself: TypeScript, Lightning CSS (nesting transpile and minify), Vitest, Playwright, axe-core. None of this is required by users.

Data flow: `vocab.ts` is the only hand-written description of the utility API. Everything a human or machine reads about utilities is generated from it. Hand-written CSS (`base`, `layout`, `components`) is covered by visual tests, and their class names are also registered in `vocab.ts` so the validator knows them.

---

## 14. Testing strategy

| Test | Checks | Fails the build when |
|---|---|---|
| Grammar completeness | Parse `dist/kuwa.css`, compare selector set with `vocab.json`. | Any declared class is missing or any undeclared class exists. |
| Drift | Regenerate `llms.txt`, `vocab.json`, `kuwa.d.ts`; diff against committed. | Any diff. |
| Token budget | Count tokens in `llms.txt` with a standard tokenizer. | Over 2,500. |
| Size budget | gzip `kuwa.min.css`. | Over 10,240 bytes. |
| Visual regression | Playwright screenshots of the kitchen-sink page at 375, 768, 1280 widths, light and dark. | Pixel diff over threshold. |
| Contrast | Compute every role on every surface it is paired with. | Below WCAG AA 4.5:1 for text, 3:1 for UI. |
| Accessibility | axe-core on kitchen sink and each cookbook page. | Any violation. |
| Validator | Fixture files with known-bad classes and expected reports. | Report mismatch. |
| Bench | Kuwa Bench run (release only; needs model API keys). | Under 97% valid-class rate at 1.0. |

---

## 15. Accessibility

- Focus rings on every focusable element, offset and high contrast, never removed.
- Role colours are chosen in `oklch` so lightness is perceptually honest; derived text colours are computed to meet AA on their surfaces, and the contrast test proves it.
- Minimum interactive height 2.5rem, matching WCAG 2.2 target size.
- `visually-hidden` for screen-reader-only text.
- Reduced motion respected globally.
- `prefers-contrast: more` thickens borders and focus rings.
- Classless forms produce correct label association when the input is nested in the label.

---

## 16. Browser support

Baseline 2024 and later: cascade layers, `:has()`, `light-dark()`, `color-mix()`, `oklch`, container queries, CSS nesting (transpiled away in dist anyway), `dvh`, `text-wrap: balance`, `@property`, `popover`. Anchor positioning is not relied on in v1 because support is still uneven.

---

## 17. Size and performance

Estimated rule count: ~480 (spacing 143, typography 37, colour 31, box 17, sizing 16, display 26, alignment and children 24, layout 25, responsive 42, components 45, base 70; total 476). Minified around 30 KB, gzipped 6–8 KB. Hard ceiling 10 KB gzipped, enforced by test.

No JavaScript, no fonts, no icons, no network requests beyond the stylesheet. Render-blocking cost is one small file that caches forever at a pinned CDN URL.

---

## 18. Honest comparison

| Axis | Tailwind 4.3 | Bootstrap 5 | Pico 2 | Open Props | KuwaCSS |
|---|---|---|---|---|---|
| Build step required | Yes (CDN play build is dev-only) | No | No | No | **No** |
| JavaScript | No | Yes for widgets | No | No | **No** |
| Words to learn | thousands | hundreds | ~0 classes, limited | tokens only | **~150** |
| Classless base | No | No | Yes | No | **Yes** |
| Named layout primitives | No | Grid only | No | No | **Yes** |
| Grammar is hole-free | No (`text-md` does not exist) | No | n/a | n/a | **Yes, tested** |
| Context file for LLMs | Community gist | No | No | No | **Official, budgeted** |
| Validator with suggestions | No | No | No | No | **Yes** |
| Published LLM benchmark | No | No | No | No | **Yes** |
| User CSS wins without `!important` | Yes (layers) | No | Mostly | Yes | **Yes** |
| Automatic dark mode | Via `dark:` variants | Opt-in attribute | Yes | Partial | **Yes, per subtree** |
| Gzipped CSS (typical) | ~10 KB | ~25 KB + JS | ~10 KB | ~5 KB | **≤10 KB** |
| Arbitrary values | Yes | No | No | No | No (write CSS) |
| State variants | Yes | No | No | No | No (components carry states) |
| Ecosystem and training data | Enormous | Enormous | Small | Small | **None yet** |

Where KuwaCSS is designed to win: time to first correct page, LLM valid-output rate, zero-build simplicity, cascade safety, theming effort, accessibility defaults, size.

Where KuwaCSS does not win and does not try: plugin ecosystem, arbitrary-value density, JavaScript widgets, and the sheer volume of existing training data. The last gap is why the AI contract exists: KuwaCSS must be learnable from a page, because it will never be learnable from a corpus.

Prior art worth crediting: Yumma CSS pairs a context file with a validator ("Canon"); KuwaCSS goes further by designing the vocabulary itself for guessability, generating every artefact from one source, and publishing a benchmark.

---

## 19. Risks and mitigations

| Risk | Mitigation |
|---|---|
| Models default to Tailwind spellings (`p-4`, `w-full`). | `llms.txt` states the rule explicitly and lists forbidden examples; `kuwacss check` translates them; `--fix` rewrites them. Bench measures the residual rate. |
| Classless base conflicts with an existing site. | Cascade layers mean existing CSS wins; `kuwa-scoped.css` confines element styles to `.kuwa`. |
| Vocabulary too small for a complex app. | Knobs, three-tier responsiveness, and "write one line of CSS, it always wins". The validator is lenient by default, so project-specific classes are never flagged. |
| Three breakpoints are not enough. | Intrinsic primitives remove most breakpoint needs; custom media queries remain available. |
| `nowrap` sets two properties. | Documented; matches intent in every case found in the cookbook. |
| Fluid sizes render differently per viewport, confusing screenshot-based review. | Visual tests at three widths; docs show the ranges. |
| Name adjacency with "Kuwa GenAI OS", an unrelated AI orchestration project. | Different domain and audience; the `kuwacss` package name and the CSS suffix in the brand keep search results distinct. |
| Bench cost and model drift. | Bench runs on release only; prompts and rubric versioned with the repo. |

---

## 20. Roadmap

| Milestone | Scope | Exit criterion |
|---|---|---|
| M1 Foundation | `vocab.ts` skeleton, tokens, reset, base, layout primitives, kitchen-sink page, size test | Classless kitchen sink looks finished in light and dark |
| M2 Vocabulary | Generator, utilities, `vocab.json`, `llms.txt`, types, components, completeness and drift tests | All grammar tests green; `llms.txt` under budget |
| M3 AI contract | CLI `check` and `init`, translation table, bench harness, first bench run | `kuwacss check` catches 100% of fixture errors; baseline bench numbers recorded |
| M4 Docs | Docs site from `vocab.json`, 25 cookbook patterns, playground, `llms-full.txt` | A newcomer builds the landing page from docs in 15 minutes (tested with 3 people) |
| M5 1.0 | Vocabulary freeze, a11y audit, visual regression suite, CDN publish, bench ≥ 97% | All section 2 success criteria met |

Estimated effort for a single developer: two weeks per milestone. No calendar dates are promised.

---

## 21. Decisions for you

These are the choices that would change the work. The spec proceeds on the recommended option unless you say otherwise.

1. **Name:** KuwaCSS, package `kuwacss`. Decided by you.
2. **Scale naming:** t-shirt sizes (`s m l`). Recommended over numeric.
3. **Tailwind compatibility shim in core:** no. The validator's `--fix` handles migration instead. Recommended.
4. **Component count:** seven. Could grow to ten (avatar, tabs via radio inputs, skeleton) at the cost of `llms.txt` budget.
5. **Licence:** MIT. Recommended.
6. **`kuwa-mcp` server in 1.1:** yes, small. Recommended.

---

## Appendix A: `llms.txt` draft

```
# KuwaCSS v1 — complete reference
Include once: <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/kuwacss@1/dist/kuwa.min.css">
No build step. No JavaScript. Plain semantic HTML already looks finished; add classes only to change layout or emphasis.

## Rules
1. A class is property-value. Values come from ONE scale: 0 xs s m l xl 2xl 3xl (text sizes also have 4xl).
2. A bare property means its medium value: padding = padding-m, gap = gap-m, margin = margin-m, rounded = rounded-m, shadow = shadow-m, border = 1px border.
3. Only the classes in this file exist. Never invent classes. These do NOT exist: p-4 mt-2 w-full flex items-center text-gray-500 hover:* dark:* btn container-fluid.
4. Responsive prefixes m: (>=768px) l: (>=1024px) xl: (>=1280px), mobile-first, ONLY on: hidden block stack row cols-1 cols-2 cols-3 cols-4 text-left text-center text-right order-first order-last grow.
5. Colours are roles: primary success warning danger info. Dark mode is automatic; force it with data-theme="dark" or "light" on any element.
6. Need something not listed? Write one line of CSS. Your CSS always beats KuwaCSS (cascade layers); never use !important.
7. Tune a primitive with an inline custom property: style="--gap: 2rem" or style="--min: 20rem".

## Layout (one per container)
stack            vertical flex, gap between children (--gap, default m)
row              horizontal flex, wraps, children vertically centred (--gap)
grid             responsive columns, as many as fit; --min sets minimum column width (default 16rem)
cols-1 cols-2 cols-3 cols-4   fixed column count; combine with m:/l:/xl:
container        centred content column, max 72rem, side padding
center           centres children horizontally and vertically
sidebar          first child is a fixed sidebar (--side, default 16rem), second child fills; stacks when narrow
sidebar-right    same, sidebar is the last child
cover            full viewport height; first child at top, last at bottom, middle centred; single child centred
switcher         row that becomes a stack below --threshold (default 30rem)
frame            fixed aspect ratio box (--ratio, default 16/9); img or video inside covers it
reel             horizontal scroll strip with snap
Children:  grow  shrink-0  span-2  span-3  span-full  order-first  order-last  self-start  self-center  self-end  self-stretch
Alignment: align-start align-center align-end align-stretch align-baseline   justify-start justify-center justify-end justify-between justify-around justify-evenly   wrap  nowrap

## Spacing (0 xs s m l xl 2xl 3xl)
padding-{size}  padding-x-  padding-y-  padding-top-  padding-bottom-  padding-left-  padding-right-
margin-{size}   same sides, plus margin-auto margin-x-auto margin-y-auto margin-top-auto margin-bottom-auto margin-left-auto margin-right-auto
gap-{size}  gap-x-{size}  gap-y-{size}

## Text
text-xs text-s text-m text-l text-xl text-2xl text-3xl text-4xl       (size only; text- never means colour)
text-left text-center text-right
font-sans font-serif font-mono
light regular medium semibold bold italic
uppercase lowercase capitalize underline strike tabular
truncate lines-2 lines-3 balance pretty
leading-tight leading-normal leading-loose   tracking-tight tracking-normal tracking-wide

## Colour (roles: primary success warning danger info)
color-{role}  color-text  color-muted
bg-{role}            solid background; readable text colour is set for you
bg-{role}-soft       light tint for badges, alerts, highlights
bg-page bg-surface bg-subtle bg-transparent
border-{role}
opacity-0 opacity-25 opacity-50 opacity-75 opacity-100

## Box
border border-top border-bottom border-left border-right border-0
rounded rounded-0 rounded-s rounded-l rounded-xl rounded-full
shadow shadow-0 shadow-s shadow-l shadow-xl
width-full width-auto width-fit width-screen   height-full height-auto height-screen   min-height-screen min-width-0
max-width-s max-width-m max-width-l max-width-xl max-width-prose max-width-full max-width-none

## Display and position
hidden block inline inline-block visually-hidden
relative absolute fixed sticky static   inset-0 top-0 right-0 bottom-0 left-0   z-below z-above z-top
overflow-hidden overflow-auto overflow-visible overflow-x-auto overflow-y-auto
pointer transition select-none

## Components (these elements need no classes: button input select textarea label fieldset table dialog details nav blockquote code pre kbd mark hr progress figure img)
button, or <a class="button">     modifiers: primary ghost danger   small large
.card      surface panel with border, radius, padding (compose with stack and padding-*)
.badge     small label; add a role
.alert     message box; add a role
.prose     long-form text: measure, rhythm, headings, lists
input[type=checkbox].switch   toggle switch
svg.icon   1em icon in the current text colour
label      wrap an input: label text sits above it; wrap a checkbox: inline row

## Theme (override on :root)
--primary --success --warning --danger --info          any colour; oklch recommended
--text --muted --border --bg-page --bg-surface --bg-subtle   use light-dark(light, dark)
--font --font-serif --font-mono --radius --container --measure

## Examples
<header class="container row justify-between padding-y-m">
  <a href="/" class="bold text-l">Acme</a>
  <nav><a href="/docs">Docs</a><a href="/signup" class="button primary">Sign up</a></nav>
</header>

<section class="container stack gap-l padding-y-3xl text-center">
  <h1 class="text-4xl balance">Ship faster with less.</h1>
  <p class="text-l color-muted max-width-prose margin-x-auto">One stylesheet. No build. Looks right in light and dark.</p>
  <div class="row justify-center"><a class="button primary large">Get started</a><a class="button ghost large">Read the docs</a></div>
</section>

<div class="grid gap-m" style="--min: 18rem">
  <article class="card stack gap-s"><span class="badge primary">New</span><h3>Fast</h3><p class="color-muted">Under 10 KB.</p></article>
  <article class="card stack gap-s"><h3>Simple</h3><p class="color-muted">150 words to learn.</p></article>
</div>

<div class="sidebar gap-l min-height-screen">
  <nav class="stack gap-xs padding-m bg-subtle"><a href="#">Overview</a><a href="#">Reports</a></nav>
  <main class="stack gap-l padding-l">
    <div class="row justify-between"><h2>Reports</h2><button class="primary">Export</button></div>
    <div class="alert success" role="status">Export finished.</div>
  </main>
</div>
```

---

## Appendix B: how a full page reads in KuwaCSS

A pricing page, complete, with nothing but KuwaCSS:

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pricing</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/kuwacss@1/dist/kuwa.min.css">
  <style>:root { --primary: oklch(55% 0.2 262); --radius: 0.75rem }</style>
</head>
<body>
  <header class="container row justify-between padding-y-m">
    <a href="/" class="bold text-l">Acme</a>
    <nav>
      <a href="/docs">Docs</a>
      <a href="/pricing" class="bold">Pricing</a>
      <a href="/login" class="button">Log in</a>
    </nav>
  </header>

  <main class="container stack gap-2xl padding-y-2xl">
    <section class="stack gap-s text-center max-width-prose margin-x-auto">
      <h1 class="text-4xl balance">Simple pricing</h1>
      <p class="text-l color-muted">Start free. Upgrade when the team grows.</p>
    </section>

    <section class="grid gap-l" style="--min: 18rem">
      <article class="card stack gap-m">
        <h3>Free</h3>
        <p class="text-3xl bold tabular">$0</p>
        <ul class="stack gap-xs color-muted"><li>1 project</li><li>Community support</li></ul>
        <a href="/signup" class="button margin-top-auto">Start free</a>
      </article>

      <article class="card stack gap-m border-primary shadow-l">
        <div class="row justify-between"><h3>Team</h3><span class="badge primary">Popular</span></div>
        <p class="text-3xl bold tabular">$12 <span class="text-s color-muted regular">per seat</span></p>
        <ul class="stack gap-xs color-muted"><li>Unlimited projects</li><li>Priority support</li><li>SSO</li></ul>
        <a href="/signup?plan=team" class="button primary margin-top-auto">Choose Team</a>
      </article>

      <article class="card stack gap-m">
        <h3>Enterprise</h3>
        <p class="text-3xl bold tabular">Custom</p>
        <ul class="stack gap-xs color-muted"><li>Dedicated support</li><li>Custom contracts</li></ul>
        <a href="/contact" class="button ghost margin-top-auto">Contact sales</a>
      </article>
    </section>

    <section class="switcher gap-l align-start">
      <div class="stack gap-s"><h2>Questions?</h2><p class="color-muted">Everything you need to know.</p></div>
      <div class="stack gap-s">
        <details><summary>Can I cancel any time?</summary><p>Yes. Cancel from settings; access continues to the end of the period.</p></details>
        <details><summary>Do you offer discounts?</summary><p>Yes, for education and non-profits.</p></details>
      </div>
    </section>
  </main>

  <footer class="container padding-y-l text-s color-muted border-top">
    <div class="row justify-between"><span>© Acme</span><nav><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav></div>
  </footer>
</body>
</html>
```

The same page in Tailwind needs a build step or the dev-only play CDN, and noticeably more class tokens per element. In Bootstrap it needs the grid scaffolding (`row`, `col-md-4`) and the JavaScript bundle for the accordion, where KuwaCSS uses native `details`. Kuwa Bench will measure the token difference rather than assert it.

---

## Appendix C: `vocab.json` schema

```json
{
  "$schema": "https://kuwacss.dev/vocab.schema.json",
  "version": "1.0.0",
  "scales": {
    "space": ["0","xs","s","m","l","xl","2xl","3xl"],
    "text":  ["xs","s","m","l","xl","2xl","3xl","4xl"]
  },
  "prefixes": { "m": "48rem", "l": "64rem", "xl": "80rem" },
  "classes": [
    {
      "name": "padding-top-l",
      "group": "spacing",
      "kind": "utility",
      "css": { "padding-block-start": "var(--space-l)" },
      "responsive": false,
      "description": "Top padding, size l."
    },
    {
      "name": "row",
      "group": "layout",
      "kind": "primitive",
      "knobs": { "--gap": "var(--space-m)" },
      "responsive": true,
      "description": "Horizontal flex row that wraps; children vertically centred."
    },
    {
      "name": "primary",
      "group": "component",
      "kind": "modifier",
      "appliesTo": ["button", ".button", ".badge", ".alert"],
      "responsive": false,
      "description": "Role modifier."
    }
  ],
  "translations": {
    "p-4": "padding-m",
    "w-full": "width-full",
    "sr-only": "visually-hidden",
    "btn btn-primary": "button primary"
  }
}
```

Every consumer (validator, docs, types, `llms.txt`) reads this file and nothing else.
