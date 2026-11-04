# KuwaCSS v{{major}} — complete reference
Include once: <link rel="stylesheet" href="{{cdn}}">
No build step. No JavaScript. Plain semantic HTML already looks finished; add classes only to change layout or emphasis.

## Rules
1. A class is property-value. Values come from ONE scale: 0 xs s m l xl 2xl 3xl (text sizes also have 4xl).
2. A bare property means its medium value: padding = padding-m, gap = gap-m, margin = margin-m, rounded = rounded-m, shadow = shadow-m, border = 1px border.
3. Only the classes in this file exist. Never invent classes. These do NOT exist: p-4 mt-2 w-full flex items-center text-gray-500 hover:* dark:* btn container-fluid.
4. Responsive prefixes {{prefixes}}, mobile-first, ONLY on: {{responsive}}.
5. Colours are roles: primary success warning danger info. Dark mode is automatic; force it with data-theme="dark" or "light" on any element.
6. Need something not listed? Write one line of CSS. Your CSS always beats KuwaCSS (cascade layers); never use !important.
7. Tune a primitive with an inline custom property: style="--gap: 2rem" or style="--min: 20rem".

## Layout (one per container)
{{layout}}
Children:  {{children}}
Alignment: {{alignment}}

## Spacing (sizes: 0 xs s m l xl 2xl 3xl; left/right follow writing direction)
{{spacing}}

## Text (text-* is size only, never colour)
{{typography}}

## Colour (roles: primary success warning danger info; bg-{role} also sets a readable text colour; -soft is a light tint)
{{color}}

## Box and size
{{box}}
{{sizing}}

## Display, position, interaction
{{display}}

## Components (these elements need no classes: button input select textarea label fieldset table dialog details nav blockquote code pre kbd mark hr progress figure img)
{{components}}
label          wrap an input: label text sits above it; wrap a checkbox or radio: inline row

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
  <div class="row justify-center"><a href="/start" class="button primary large">Get started</a><a href="/docs" class="button ghost large">Read the docs</a></div>
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
