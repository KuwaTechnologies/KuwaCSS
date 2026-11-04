# KuwaCSS

[![npm](https://img.shields.io/npm/v/kuwacss)](https://www.npmjs.com/package/kuwacss)
[![CI](https://github.com/KuwaTechnologies/kuwacss/actions/workflows/ci.yml/badge.svg)](https://github.com/KuwaTechnologies/kuwacss/actions/workflows/ci.yml)
![size](https://img.shields.io/badge/gzipped-%3C10%20KB-blue)
![no build](https://img.shields.io/badge/build%20step-none-success)

**A 150-word UI vocabulary that humans and AI both speak fluently. One file. No build. No JavaScript.**

KuwaCSS styles plain semantic HTML so it looks finished, in light and dark mode, with no classes at all. When you need layout, you name it: `stack`, `row`, `grid`, `sidebar`, `cover`. When you need a tweak, you say it in plain words: `padding-l`, `color-muted`, `rounded`. The whole vocabulary fits in one page that a developer, or a language model, can read once and then use without error.

## Quick start

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/kuwacss@0/dist/kuwa.min.css">
</head>
<body>
  <header class="container row justify-between padding-y-m">
    <a href="/" class="bold text-l">Acme</a>
    <nav><a href="/docs">Docs</a><a href="/signup" class="button primary">Sign up</a></nav>
  </header>
  <main class="container stack gap-l padding-y-2xl">
    <h1 class="text-4xl balance">Ship faster with less.</h1>
    <p class="text-l color-muted max-width-prose">One stylesheet. No build. Looks right in light and dark.</p>
    <div class="grid gap-m" style="--min: 18rem">
      <article class="card stack gap-s"><h3>Fast</h3><p class="color-muted">Under 10 KB gzipped.</p></article>
      <article class="card stack gap-s"><h3>Simple</h3><p class="color-muted">150 words to learn.</p></article>
    </div>
  </main>
</body>
</html>
```

Or from npm:

```bash
npm install kuwacss
```

```js
import 'kuwacss';        // dist/kuwa.css
import 'kuwacss/min';    // dist/kuwa.min.css
```

## Why it is different

| | KuwaCSS |
|---|---|
| **One page to learn** | The complete vocabulary, rules and examples fit in [`dist/llms.txt`](dist/llms.txt), under 2,500 tokens. |
| **Zero build** | One `<link>`. Native CSS only. Tooling exists to check, never to compile. |
| **Good by default** | Semantic HTML with no classes looks finished and passes axe and WCAG AA contrast. |
| **Say what you mean** | `padding-l`, not `p-6`. `color-danger`, not `text-red-600`. `text-*` is always size, never colour. |
| **No holes in the grammar** | If `padding-m` exists, every side and every size exists. A test proves it on every build. |
| **Layout is named, not assembled** | `sidebar`, not `flex flex-wrap gap-4 [&>*:first-child]:basis-64`. Primitives adapt to space, so most pages need no breakpoints. |
| **The cascade you can trust** | Everything lives in `@layer kuwa.*`. Any unlayered rule you write wins, whatever its specificity. No `!important`. |
| **Verifiable by machines** | `npx kuwacss check` flags invented classes with a suggestion, and exits non-zero for CI and agent loops. |

## The vocabulary

One size language, two tables. Steps `l` and up are fluid.

| Step | Space | Text |
|---|---|---|
| `0` `xs` `s` `m` | 0 / 0.25rem / 0.5rem / 1rem | – / 0.75rem / 0.875rem / 1rem |
| `l` `xl` `2xl` `3xl` | 1.5–2rem / 2–3rem / 3–5rem / 4–8rem | 1.125–1.25rem / 1.25–1.5rem / 1.5–2rem / 2–3rem |
| `4xl` | – | 2.5–4.5rem |

A bare property name means its medium value: `padding` = `padding-m`, `gap` = `gap-m`, `rounded` = `rounded-m`, `shadow` = `shadow-m`, `border` = a 1px border.

| Group | Classes |
|---|---|
| Layout | `stack` `row` `grid` `cols-1..4` `container` `center` `sidebar` `sidebar-right` `cover` `switcher` `frame` `reel` |
| Children | `grow` `shrink-0` `span-2` `span-3` `span-full` `order-first` `order-last` `self-*` |
| Alignment | `align-start\|center\|end\|stretch\|baseline` `justify-start\|center\|end\|between\|around\|evenly` `wrap` `nowrap` |
| Spacing | `padding-{side}-{size}` `margin-{side}-{size}` `margin-{side}-auto` `gap-{axis}-{size}` |
| Text | `text-{size}` `text-left\|center\|right` `font-sans\|serif\|mono` `light…bold` `italic` `uppercase` `truncate` `lines-2` `balance` `leading-*` `tracking-*` |
| Colour | `color-{role}` `bg-{role}` `bg-{role}-soft` `border-{role}` `color-text` `color-muted` `bg-page` `bg-surface` `bg-subtle` `opacity-*` |
| Box | `border` `border-{side}` `rounded` `rounded-{s,l,xl,full,0}` `shadow` `shadow-{s,l,xl,0}` |
| Sizing | `width-{full,auto,fit,screen}` `height-*` `min-height-screen` `min-width-0` `max-width-{s,m,l,xl,prose,full,none}` |
| Display | `hidden` `block` `inline` `inline-block` `visually-hidden` `overflow-*` `relative` `absolute` `fixed` `sticky` `inset-0` `z-*` |
| Components | `button` `card` `badge` `alert` `prose` `switch` `icon` with modifiers `primary` `ghost` `danger` `small` `large` `success` `warning` `info` |

Roles are `primary` `success` `warning` `danger` `info`. `bg-{role}` also sets a readable text colour. The full list with descriptions is [`dist/llms.txt`](dist/llms.txt); the machine-readable form is [`dist/vocab.json`](dist/vocab.json).

### Responsive

Mobile-first prefixes `m:` (≥768px), `l:` (≥1024px) and `xl:` (≥1280px) apply to fourteen words only: `hidden block stack row cols-1 cols-2 cols-3 cols-4 text-left text-center text-right order-first order-last grow`.

```html
<div class="stack m:row">…</div>          <!-- stacked on phones, a row from tablets -->
<nav class="hidden l:block">…</nav>       <!-- appears on laptops -->
<div class="cols-1 m:cols-2 l:cols-3">…</div>
```

Everything else is responsive without prefixes: fluid sizes, `grid`, `switcher`, `sidebar`, `container` and `cover` adapt to the space they have.

## Layout primitives

Put one class on a container. Tune it with an inline custom property.

```html
<div class="stack gap-l">…</div>                       <!-- vertical, spaced -->
<div class="row justify-between">…</div>              <!-- horizontal, wraps, centred -->
<div class="grid" style="--min: 20rem">…</div>         <!-- as many 20rem columns as fit -->
<div class="sidebar" style="--side: 18rem">            <!-- fixed sidebar + fluid main; stacks when narrow -->
  <nav>…</nav><main>…</main>
</div>
<div class="switcher" style="--threshold: 40rem">…</div>  <!-- row above 40rem, stack below -->
<section class="cover"><h1>Centred</h1></section>      <!-- full viewport height -->
<div class="frame" style="--ratio: 4/3"><img src="…" alt="…"></div>
<div class="reel" tabindex="0" aria-label="Cards">…</div>   <!-- horizontal scroll with snap -->
```

Inside a primitive, the primitive owns the spacing: flow margins on its children are zeroed. Outside, paragraphs and headings keep sensible margins so classless pages have rhythm.

## Theming

Everything is driven by custom properties on `:root`. Override as many or as few as you like.

```css
:root {
  --primary: oklch(60% 0.19 25);   /* brand red: buttons, links, focus rings, badges, tints */
  --radius: 1rem;
  --font: "Inter", system-ui, sans-serif;
}
```

| Token | Purpose |
|---|---|
| `--primary` `--success` `--warning` `--danger` `--info` | Role colours. Soft tints, on-colour text and hover shades are derived. |
| `--text` `--muted` `--border` `--bg-page` `--bg-surface` `--bg-subtle` | Neutrals. Use `light-dark(a, b)` to set both modes at once. |
| `--font` `--font-serif` `--font-mono` `--radius` `--container` `--measure` `--transition` | Shape and type. |

## Dark mode

Automatic from the operating system. Force it on any subtree:

```html
<section data-theme="dark">…</section>
<div data-theme="light">…</div>
```

It works by switching `color-scheme`, so nested overrides resolve per element.

## Using with AI

KuwaCSS is designed to be learned from a page, not a corpus.

```bash
npx kuwacss init --agents      # copies kuwa.llms.txt and points AGENTS.md at it (--claude for CLAUDE.md)
npx kuwacss check src          # validates every class in your markup
```

- **`dist/llms.txt`** is the complete vocabulary in under 2,500 tokens. Paste it into a system prompt or project rules file.
- **`dist/llms-full.txt`** adds the cookbook: complete pages for a landing page, a dashboard, a settings form and a pricing page.
- **`dist/vocab.json`** is the machine-readable source every other artefact is generated from.
- **`kuwacss/types`** exports `KuwaClass` and `cx()` for TypeScript editors.

## `kuwacss check`

```
$ npx kuwacss check src/
src/App.tsx:12  p-4       foreign         "p-4" is not KuwaCSS; use "padding-m"
src/App.tsx:12  text-md   near-miss       "text-md" does not exist; did you mean "text-m"?
src/App.tsx:30  hover:bg  bad-prefix      unknown prefix "hover:"; KuwaCSS has m: l: xl: only …
src/Nav.tsx:4   primary   stray-modifier  "primary" is a modifier for button, .button, .badge, .alert …
4 findings in 2 files
```

Lenient by default: your own classes (`hero`, `logo`) pass. `--strict` flags every class not in the vocabulary. `--fix` rewrites unambiguous foreign spellings in place. `--json` is for agents and CI. The exit code is non-zero on any finding.

## Browser support

Baseline 2024 and later (Chrome 123, Firefox 120, Safari 17.5): cascade layers, `:has()`, `light-dark()`, `color-mix()`, `oklch`, `dvh`, `text-wrap: balance`. Interactive patterns use native `<dialog>`, `<details>` and `popover`; no script is shipped.

## Honest comparison

Where KuwaCSS is designed to win: time to a first correct page, valid-output rate for language models, zero-build simplicity, cascade safety, theming effort, accessibility defaults, size.

Where it does not win and does not try: plugin ecosystem, arbitrary-value syntax, JavaScript widgets, and the sheer volume of existing training data. That last gap is why the context file and the validator exist.

## Development

```bash
npm install
npm run build          # src/vocab.ts → dist/ (CSS, vocab.json, llms.txt, types)
npm test               # grammar, drift, size and token budgets, CLI
npm run test:browser   # layout, theme, contrast, hue, axe (Playwright)
```

`src/vocab.ts` is the single source of truth for every class. Hand-written CSS covers tokens, the classless base, primitive child rules and components. `dist/` is committed so the CDN and the drift test see the same bytes.

## Licence

MIT © Kuwa Technologies
