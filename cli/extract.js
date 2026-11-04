/**
 * Extracts class names from HTML, JSX, TSX, Vue, Svelte and Astro sources.
 * Static text only: class="…", class='…', className="…", className={'…'}, className={"…"}, className={`…`}.
 * Returns one record per distinct class per element, with the line the attribute starts on and the element tag.
 */
export const CLASS_ATTR = /(?<![:\w.-])(?:class|className)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)\s*\})/g;

export function extractClasses(source) {
  const out = [];
  let element = 0;
  for (const m of source.matchAll(CLASS_ATTR)) {
    const raw = m[1] ?? m[2] ?? m[3] ?? m[4] ?? m[5] ?? '';
    const value = m[5] !== undefined ? raw.replace(/\$\{[^}]*\}/g, ' ') : raw;
    const line = source.slice(0, m.index).split('\n').length;
    const open = source.lastIndexOf('<', m.index);
    const tag = open >= 0 ? (/^<([A-Za-z][\w.:-]*)/.exec(source.slice(open, m.index))?.[1] ?? '').toLowerCase() : '';
    const seen = new Set();
    for (const cls of value.split(/\s+/).filter(Boolean)) {
      if (seen.has(cls)) continue;
      seen.add(cls);
      out.push({ cls, line, element, tag });
    }
    element++;
  }
  return out;
}
