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

function nearest(cls, names) {
  const max = cls.length < 6 ? 1 : 2;
  let best = null, bestD = Infinity;
  for (const n of names) {
    if (Math.abs(n.length - cls.length) > max) continue;
    const d = levenshtein(cls, n);
    if (d < bestD || (d === bestD && best && n.length < best.length)) { best = n; bestD = d; }
  }
  return bestD <= max ? best : null;
}

export function analyze(classes, vocab, { strict = false } = {}) {
  const names = new Set(vocab.classes.map((c) => c.name));
  const nameList = [...names];
  const responsive = new Set(vocab.responsive);
  const prefixes = Object.keys(vocab.prefixes);
  const modifiers = new Map(vocab.classes.filter((c) => c.kind === 'modifier').map((c) => [c.name, c.appliesTo ?? []]));
  const translations = vocab.translations ?? {};
  const byStem = new Map();
  for (const n of nameList) {
    const i = n.lastIndexOf('-');
    if (i > 0) { const stem = n.slice(0, i); if (!byStem.has(stem)) byStem.set(stem, []); byStem.get(stem).push(n.slice(i + 1)); }
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
        else push('bad-prefix', `unknown prefix "${prefix}:"; KuwaCSS has m: l: xl: only and no state variants (components carry their own states)`);
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

      const near = nearest(cls, nameList);
      if (near) { push('near-miss', `"${cls}" does not exist; did you mean "${near}"?`, near); continue; }

      const i = cls.lastIndexOf('-');
      const stem = i > 0 ? cls.slice(0, i) : null;
      if (stem && byStem.has(stem)) { push('near-miss', `"${cls}" has an invalid value for "${stem}"; valid: ${byStem.get(stem).join(' ')}`, `${stem}-${byStem.get(stem)[0]}`); continue; }

      if (strict) push('unknown', `"${cls}" is not a KuwaCSS class`);
    }
  }
  return findings;
}
