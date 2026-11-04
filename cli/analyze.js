/** Checks extracted classes against vocab.json. Lenient by default; --strict flags every unknown class. */

function levenshtein(a, b) {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let last = prev[0]; prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = prev[j];
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, last + (a[i - 1] === b[j - 1] ? 0 : 1));
      last = tmp;
    }
  }
  return prev[b.length];
}

function nearest(cls, names, max = cls.length < 6 ? 1 : 2) {
  let best = null, bestD = Infinity;
  for (const n of names) {
    if (Math.abs(n.length - cls.length) > max) continue;
    const d = levenshtein(cls, n);
    if (d < bestD || (d === bestD && best && n.length < best.length)) { best = n; bestD = d; }
  }
  return bestD <= max ? best : null;
}

/* Tailwind-style numerics: n/4 rem mapped onto the KuwaCSS scale (l and above are fluid; their lower bound is used). */
const STEPS = [['0', 0], ['xs', 0.25], ['s', 0.5], ['m', 1], ['l', 1.5], ['xl', 2], ['2xl', 3], ['3xl', 4]];
function stepFor(n) {
  const rem = n === 'px' ? 0.0625 : Number(n) / 4;
  let best = STEPS[0];
  for (const s of STEPS) if (Math.abs(s[1] - rem) < Math.abs(best[1] - rem) - 1e-9) best = s;
  return best[0];
}
const SPACING = { p: 'padding', px: 'padding-x', py: 'padding-y', pt: 'padding-top', pb: 'padding-bottom', pl: 'padding-left', pr: 'padding-right', ps: 'padding-left', pe: 'padding-right',
  m: 'margin', mx: 'margin-x', my: 'margin-y', mt: 'margin-top', mb: 'margin-bottom', ml: 'margin-left', mr: 'margin-right', ms: 'margin-left', me: 'margin-right',
  gap: 'gap', 'gap-x': 'gap-x', 'gap-y': 'gap-y' };
const HUE_ROLE = { red: 'danger', rose: 'danger', pink: 'danger', orange: 'warning', amber: 'warning', yellow: 'warning', lime: 'success', green: 'success', emerald: 'success', teal: 'success',
  cyan: 'info', sky: 'info', blue: 'primary', indigo: 'primary', violet: 'primary', purple: 'primary', fuchsia: 'primary' };
const GREYS = new Set(['gray', 'grey', 'slate', 'zinc', 'neutral', 'stone']);
const BREAKPOINTS = { sm: 'm', md: 'm', lg: 'l', xl: 'xl', '2xl': 'xl' };

/** Recognises common foreign (Tailwind/Bootstrap) spellings that are not in the translation table. */
function foreignPattern(cls) {
  let m;
  if ((m = /^(p|px|py|pt|pb|pl|pr|ps|pe|m|mx|my|mt|mb|ml|mr|ms|me|gap|gap-x|gap-y)-(\d+(?:\.\d+)?|px)$/.exec(cls))) {
    const s = `${SPACING[m[1]]}-${stepFor(m[2])}`;
    return { message: `"${cls}" is Tailwind spacing; use "${s}" (scale: 0 xs s m l xl 2xl 3xl)`, suggestion: s };
  }
  if ((m = /^space-(x|y)-(\d+(?:\.\d+)?|px)$/.exec(cls))) {
    const step = stepFor(m[2]);
    const s = `${m[1] === 'y' ? 'stack' : 'row'}${step === 'm' ? '' : ` gap-${step}`}`;
    return { message: `"${cls}" has no equivalent; put "${s}" on the parent instead`, suggestion: s };
  }
  if ((m = /^(text|bg|border)-([a-z]+)-(\d{2,3})$/.exec(cls))) {
    const [, prop, hue, shade] = m;
    const grey = GREYS.has(hue), role = HUE_ROLE[hue] ?? 'primary';
    const s = prop === 'text' ? (grey ? 'color-muted' : `color-${role}`)
      : prop === 'bg' ? (grey ? 'bg-subtle' : Number(shade) >= 400 ? `bg-${role}` : `bg-${role}-soft`)
      : grey ? 'border' : `border-${role}`;
    return { message: `"${cls}" is a Tailwind colour scale; KuwaCSS colours are roles (primary success warning danger info); use "${s}"`, suggestion: s };
  }
  if ((m = /^(from|to|via|ring|fill|stroke|decoration|divide|outline|accent|caret|placeholder)-([a-z]+)(-\d{2,3})?$/.exec(cls))) {
    return { message: `"${cls}" has no equivalent; KuwaCSS colours are roles, write one line of CSS for ${m[1]} colours` };
  }
  if ((m = /^(w|h|min-w|max-w|min-h|max-h|size)-(\d+(?:\.\d+)?|\d+\/\d+|px)$/.exec(cls))) {
    return { message: `"${cls}" is a fixed size; use width-full/width-fit/height-screen, cols-N on the parent for fractions, or one line of CSS` };
  }
  if ((m = /^grid-cols-(\d+)$/.exec(cls))) {
    const s = Number(m[1]) <= 4 ? `cols-${m[1]}` : 'grid';
    return { message: `"${cls}" is Tailwind; use "${s}"${Number(m[1]) > 4 ? ' with --min' : ''}`, suggestion: s };
  }
  if ((m = /^col-span-(\d+)$/.exec(cls))) {
    const s = Number(m[1]) <= 3 ? `span-${m[1]}` : 'span-full';
    return { message: `"${cls}" is Tailwind; use "${s}"`, suggestion: s };
  }
  if (/^col(-(sm|md|lg|xl|xxl))?(-\d+|-auto)?$/.test(cls) || /^(row-cols|g|gx|gy)-\d+$/.test(cls)) {
    return { message: `"${cls}" is the Bootstrap grid; use cols-N or grid on the parent and grow on children` };
  }
  return null;
}

export function analyze(classes, vocab, { strict = false } = {}) {
  const names = new Set(vocab.classes.map((c) => c.name));
  const nameList = [...names];
  const responsive = new Set(vocab.responsive);
  const prefixes = Object.keys(vocab.prefixes);
  const modifiers = new Map(vocab.classes.filter((c) => c.kind === 'modifier').map((c) => [c.name, c.appliesTo ?? []]));
  const translations = vocab.translations ?? {};
  const byStem = new Map(), byFirst = new Map();
  for (const n of nameList) {
    const i = n.lastIndexOf('-');
    if (i > 0) { const stem = n.slice(0, i); if (!byStem.has(stem)) byStem.set(stem, []); byStem.get(stem).push(n.slice(i + 1)); }
    const j = n.indexOf('-');
    if (j > 0) { const first = n.slice(0, j); if (!byFirst.has(first)) byFirst.set(first, []); byFirst.get(first).push(n); }
  }

  const byElement = new Map();
  for (const c of classes) {
    if (!byElement.has(c.element)) byElement.set(c.element, []);
    byElement.get(c.element).push(c);
  }

  const findings = [];
  for (const items of byElement.values()) {
    const present = new Set(items.map((i) => i.cls));
    const tag = items[0]?.tag ?? '';
    for (const { cls, line } of items) {
      const push = (kind, message, suggestion) => findings.push({ cls, line, kind, message, ...(suggestion ? { suggestion } : {}) });

      if (cls.includes(':')) {
        const i = cls.indexOf(':');
        const prefix = cls.slice(0, i), base = cls.slice(i + 1);
        if (prefixes.includes(prefix) && responsive.has(base)) continue;
        if (prefixes.includes(prefix)) push('bad-prefix', `"${prefix}:" applies only to: ${[...responsive].join(' ')}`, names.has(base) ? base : undefined);
        else if (BREAKPOINTS[prefix]) {
          const mapped = `${BREAKPOINTS[prefix]}:${translations[base] ?? base}`;
          const ok = responsive.has(mapped.slice(mapped.indexOf(':') + 1));
          push('bad-prefix', `"${prefix}:" is not a KuwaCSS prefix; use m: (>=768px) l: (>=1024px) xl: (>=1280px)${ok ? `, e.g. "${mapped}"` : ', and only on the responsive whitelist'}`, ok ? mapped : undefined);
        } else push('bad-prefix', `unknown prefix "${prefix}:"; KuwaCSS has m: l: xl: only and no state variants (components carry their own states)`);
        continue;
      }

      if (modifiers.has(cls)) {
        const applies = modifiers.get(cls);
        const ok = applies.some((a) => (a.startsWith('.') ? present.has(a.slice(1)) : tag === a));
        if (!ok) push('stray-modifier', `"${cls}" is a modifier for ${applies.join(', ')}; it does nothing on a plain element`);
        continue;
      }

      if (names.has(cls)) continue;

      if (translations[cls]) { push('foreign', `"${cls}" is not KuwaCSS; use "${translations[cls]}"`, translations[cls]); continue; }

      const pattern = foreignPattern(cls);
      if (pattern) { push('foreign', pattern.message, pattern.suggestion); continue; }

      const near = nearest(cls, nameList);
      if (near) { push('near-miss', `"${cls}" does not exist; did you mean "${near}"?`, near); continue; }

      const i = cls.lastIndexOf('-');
      const stem = i > 0 ? cls.slice(0, i) : null;
      if (stem && byStem.has(stem)) { push('near-miss', `"${cls}" has an invalid value for "${stem}"; valid: ${byStem.get(stem).join(' ')}`, `${stem}-${byStem.get(stem)[0]}`); continue; }

      const j = cls.indexOf('-');
      const first = j > 0 ? cls.slice(0, j) : null;
      if (first && byFirst.has(first)) {
        const candidates = byFirst.get(first);
        const pick = nearest(cls, candidates, 99) ?? candidates[0];
        push('near-miss', `"${cls}" does not exist; valid ${first}-* classes: ${candidates.slice(0, 12).join(' ')}${candidates.length > 12 ? ' …' : ''}`, pick);
        continue;
      }

      if (strict) push('unknown', `"${cls}" is not a KuwaCSS class`);
    }
  }
  return findings;
}
