/**
 * KuwaCSS vocabulary: the single source of truth for every class.
 * Everything a human or machine reads about utilities (CSS, vocab.json,
 * llms.txt, kuwa.d.ts) is generated from this file.
 */

export const SPACE = ['0', 'xs', 's', 'm', 'l', 'xl', '2xl', '3xl'] as const;
export const TEXT = ['xs', 's', 'm', 'l', 'xl', '2xl', '3xl', '4xl'] as const;
export const ROLES = ['primary', 'success', 'warning', 'danger', 'info'] as const;
export const PREFIXES = { m: '48rem', l: '64rem', xl: '80rem' } as const;
export const RESPONSIVE = [
  'hidden', 'block', 'stack', 'row', 'cols-1', 'cols-2', 'cols-3', 'cols-4',
  'text-left', 'text-center', 'text-right', 'order-first', 'order-last', 'grow',
] as const;

export type Kind = 'utility' | 'primitive' | 'component' | 'modifier' | 'adjective';
export type Group =
  | 'layout' | 'children' | 'alignment' | 'spacing' | 'typography' | 'color'
  | 'box' | 'sizing' | 'display' | 'position' | 'interaction' | 'component';

export interface Entry {
  name: string;
  group: Group;
  kind: Kind;
  css?: Record<string, string>;
  knobs?: Record<string, string>;
  appliesTo?: string[];
  description: string;
}

const GAP = 'var(--gap, var(--space-m))';
const SIDE_WORD: Record<string, string> = { '': '', x: 'horizontal ', y: 'vertical ', top: 'top ', bottom: 'bottom ', left: 'left ', right: 'right ' };
const SIDE_SUFFIX: Record<string, string> = { '': '', x: '-inline', y: '-block', top: '-block-start', bottom: '-block-end', left: '-inline-start', right: '-inline-end' };

function u(name: string, group: Group, css: Record<string, string>, description: string): Entry {
  return { name, group, kind: 'utility', css, description };
}
function p(name: string, css: Record<string, string>, description: string, knobs?: Record<string, string>): Entry {
  return { name, group: 'layout', kind: 'primitive', css, knobs, description };
}
function c(name: string, description: string): Entry {
  return { name, group: 'component', kind: 'component', description };
}
function m(name: string, appliesTo: string[], description: string): Entry {
  return { name, group: 'component', kind: 'modifier', appliesTo, description };
}

export function entries(): Entry[] {
  const out: Entry[] = [];

  // Layout primitives (container declarations only; child rules live in src/layout.css)
  out.push(
    p('stack', { display: 'flex', 'flex-direction': 'column', 'flex-wrap': 'nowrap', 'align-items': 'stretch', gap: GAP }, 'vertical flex column, children separated by gap (--gap, default m)', { '--gap': 'var(--space-m)' }),
    p('row', { display: 'flex', 'flex-direction': 'row', 'flex-wrap': 'wrap', 'align-items': 'center', gap: GAP }, 'horizontal flex row, wraps, children vertically centred (--gap)', { '--gap': 'var(--space-m)' }),
    p('grid', { display: 'grid', 'grid-template-columns': 'repeat(auto-fit, minmax(min(var(--min, 16rem), 100%), 1fr))', gap: GAP }, 'responsive columns, as many as fit; --min sets minimum column width (default 16rem)', { '--min': '16rem', '--gap': 'var(--space-m)' }),
  );
  for (const n of [1, 2, 3, 4]) {
    out.push(p(`cols-${n}`, { display: 'grid', 'grid-template-columns': `repeat(${n}, minmax(0, 1fr))`, gap: GAP }, `fixed ${n}-column grid; combine with m:/l:/xl:`, { '--gap': 'var(--space-m)' }));
  }
  out.push(
    p('container', { 'inline-size': '100%', 'max-inline-size': 'var(--container, 72rem)', 'margin-inline': 'auto', 'padding-inline': 'var(--space-m)' }, 'centred content column, max 72rem, side padding', { '--container': '72rem' }),
    p('center', { display: 'grid', 'place-items': 'center' }, 'centres children horizontally and vertically'),
    p('sidebar', { display: 'flex', 'flex-wrap': 'wrap', gap: GAP }, 'first child is a fixed sidebar (--side, default 16rem), second child fills; stacks when narrow', { '--side': '16rem', '--gap': 'var(--space-m)' }),
    p('sidebar-right', { display: 'flex', 'flex-wrap': 'wrap', gap: GAP }, 'same as sidebar, the sidebar is the last child', { '--side': '16rem', '--gap': 'var(--space-m)' }),
    p('cover', { 'min-block-size': 'var(--min-height, 100dvh)', display: 'flex', 'flex-direction': 'column' }, 'full viewport height; first child at top, last at bottom, middle centred; a single child is centred', { '--min-height': '100dvh' }),
    p('switcher', { display: 'flex', 'flex-wrap': 'wrap', gap: GAP }, 'row that becomes a stack below --threshold (default 30rem)', { '--threshold': '30rem', '--gap': 'var(--space-m)' }),
    p('frame', { 'aspect-ratio': 'var(--ratio, 16/9)', overflow: 'hidden' }, 'fixed aspect ratio box (--ratio, default 16/9); img or video inside covers it', { '--ratio': '16/9' }),
    p('reel', { display: 'flex', 'overflow-x': 'auto', 'scroll-snap-type': 'x mandatory', 'overscroll-behavior-x': 'contain', gap: GAP }, 'horizontal scroll strip with snap; give it tabindex="0" and an aria-label so keyboards can scroll it', { '--gap': 'var(--space-m)' }),
  );

  // Children
  out.push(
    u('grow', 'children', { 'flex-grow': '1' }, 'child grows to fill remaining space'),
    u('shrink-0', 'children', { 'flex-shrink': '0' }, 'child never shrinks'),
    u('span-2', 'children', { 'grid-column': 'span 2' }, 'grid child spans 2 columns'),
    u('span-3', 'children', { 'grid-column': 'span 3' }, 'grid child spans 3 columns'),
    u('span-full', 'children', { 'grid-column': '1 / -1' }, 'grid child spans all columns'),
    u('order-first', 'children', { order: '-1' }, 'child moves first'),
    u('order-last', 'children', { order: '99' }, 'child moves last'),
  );
  for (const v of ['start', 'center', 'end', 'stretch']) out.push(u(`self-${v}`, 'children', { 'align-self': v }, `child aligns itself to ${v}`));

  // Alignment
  for (const v of ['start', 'center', 'end', 'stretch', 'baseline']) out.push(u(`align-${v}`, 'alignment', { 'align-items': v }, `cross-axis alignment: ${v}`));
  const JUST: Record<string, string> = { start: 'flex-start', center: 'center', end: 'flex-end', between: 'space-between', around: 'space-around', evenly: 'space-evenly' };
  for (const [k, v] of Object.entries(JUST)) out.push(u(`justify-${k}`, 'alignment', { 'justify-content': v }, `main-axis distribution: ${k}`));
  out.push(
    u('wrap', 'alignment', { 'flex-wrap': 'wrap', 'white-space': 'normal' }, 'allow wrapping (flex children and text)'),
    u('nowrap', 'alignment', { 'flex-wrap': 'nowrap', 'white-space': 'nowrap' }, 'forbid wrapping (flex children and text)'),
  );

  // Spacing
  for (const prop of ['padding', 'margin'] as const) {
    for (const side of ['', 'x', 'y', 'top', 'bottom', 'left', 'right']) {
      const cssProp = `${prop}${SIDE_SUFFIX[side]}`;
      for (const size of SPACE) {
        out.push(u(side ? `${prop}-${side}-${size}` : `${prop}-${size}`, 'spacing', { [cssProp]: `var(--space-${size})` }, `${SIDE_WORD[side]}${prop}, size ${size}`));
      }
      if (prop === 'margin') out.push(u(side ? `margin-${side}-auto` : 'margin-auto', 'spacing', { [cssProp]: 'auto' }, `${SIDE_WORD[side]}margin auto`));
    }
  }
  for (const axis of ['', 'x', 'y']) {
    const cssProp = axis === 'x' ? 'column-gap' : axis === 'y' ? 'row-gap' : 'gap';
    for (const size of SPACE) out.push(u(axis ? `gap-${axis}-${size}` : `gap-${size}`, 'spacing', { [cssProp]: `var(--space-${size})` }, `${SIDE_WORD[axis]}gap, size ${size}`));
  }
  // Bare = medium (spec: bare-name rule)
  out.push(
    u('padding', 'spacing', { padding: 'var(--space-m)' }, 'padding, size m'),
    u('margin', 'spacing', { margin: 'var(--space-m)' }, 'margin, size m'),
    u('gap', 'spacing', { gap: 'var(--space-m)' }, 'gap, size m'),
  );

  // Typography
  for (const t of TEXT) out.push(u(`text-${t}`, 'typography', { 'font-size': `var(--text-${t})` }, `font size ${t}`));
  out.push(
    u('text-left', 'typography', { 'text-align': 'start' }, 'align text to the start (left in LTR)'),
    u('text-center', 'typography', { 'text-align': 'center' }, 'centre text'),
    u('text-right', 'typography', { 'text-align': 'end' }, 'align text to the end (right in LTR)'),
    u('font-sans', 'typography', { 'font-family': 'var(--font)' }, 'sans-serif family'),
    u('font-serif', 'typography', { 'font-family': 'var(--font-serif)' }, 'serif family'),
    u('font-mono', 'typography', { 'font-family': 'var(--font-mono)' }, 'monospace family'),
    u('light', 'typography', { 'font-weight': '300' }, 'font weight 300'),
    u('regular', 'typography', { 'font-weight': '400' }, 'font weight 400'),
    u('medium', 'typography', { 'font-weight': '500' }, 'font weight 500'),
    u('semibold', 'typography', { 'font-weight': '600' }, 'font weight 600'),
    u('bold', 'typography', { 'font-weight': '700' }, 'font weight 700'),
    u('italic', 'typography', { 'font-style': 'italic' }, 'italic'),
    u('uppercase', 'typography', { 'text-transform': 'uppercase' }, 'uppercase'),
    u('lowercase', 'typography', { 'text-transform': 'lowercase' }, 'lowercase'),
    u('capitalize', 'typography', { 'text-transform': 'capitalize' }, 'capitalise each word'),
    u('underline', 'typography', { 'text-decoration': 'underline' }, 'underline'),
    u('strike', 'typography', { 'text-decoration': 'line-through' }, 'strike through'),
    u('tabular', 'typography', { 'font-variant-numeric': 'tabular-nums' }, 'equal-width digits'),
    u('truncate', 'typography', { overflow: 'hidden', 'text-overflow': 'ellipsis', 'white-space': 'nowrap' }, 'one line, ellipsis when too long'),
    u('lines-2', 'typography', { display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': '2', overflow: 'hidden' }, 'clamp to 2 lines'),
    u('lines-3', 'typography', { display: '-webkit-box', '-webkit-box-orient': 'vertical', '-webkit-line-clamp': '3', overflow: 'hidden' }, 'clamp to 3 lines'),
    u('balance', 'typography', { 'text-wrap': 'balance' }, 'balanced line lengths (headings)'),
    u('pretty', 'typography', { 'text-wrap': 'pretty' }, 'avoid orphans (paragraphs)'),
    u('leading-tight', 'typography', { 'line-height': '1.2' }, 'line height 1.2'),
    u('leading-normal', 'typography', { 'line-height': '1.5' }, 'line height 1.5'),
    u('leading-loose', 'typography', { 'line-height': '1.75' }, 'line height 1.75'),
    u('tracking-tight', 'typography', { 'letter-spacing': '-0.02em' }, 'tighter letter spacing'),
    u('tracking-normal', 'typography', { 'letter-spacing': '0' }, 'normal letter spacing'),
    u('tracking-wide', 'typography', { 'letter-spacing': '0.05em' }, 'wider letter spacing'),
  );

  // Colour
  for (const r of ROLES) {
    out.push(
      u(`color-${r}`, 'color', { color: `var(--${r})` }, `text colour: ${r}`),
      u(`bg-${r}`, 'color', { background: `var(--${r})`, color: `var(--on-${r})` }, `solid ${r} background with readable text colour`),
      u(`bg-${r}-soft`, 'color', { background: `var(--${r}-soft)`, color: `var(--${r}-text)` }, `light ${r} tint with matching text colour`),
      u(`border-${r}`, 'color', { 'border-color': `var(--${r})` }, `border colour: ${r}`),
    );
  }
  out.push(
    u('color-text', 'color', { color: 'var(--text)' }, 'default text colour'),
    u('color-muted', 'color', { color: 'var(--muted)' }, 'muted text colour'),
    u('bg-page', 'color', { background: 'var(--bg-page)' }, 'page background'),
    u('bg-surface', 'color', { background: 'var(--bg-surface)' }, 'surface background (cards, panels)'),
    u('bg-subtle', 'color', { background: 'var(--bg-subtle)' }, 'subtle background'),
    u('bg-transparent', 'color', { background: 'transparent' }, 'transparent background'),
  );
  for (const o of ['0', '25', '50', '75', '100']) out.push(u(`opacity-${o}`, 'color', { opacity: String(Number(o) / 100) }, `opacity ${o}%`));

  // Box
  out.push(
    u('border', 'box', { border: '1px solid var(--border)' }, '1px border'),
    u('border-top', 'box', { 'border-block-start': '1px solid var(--border)' }, 'top border'),
    u('border-bottom', 'box', { 'border-block-end': '1px solid var(--border)' }, 'bottom border'),
    u('border-left', 'box', { 'border-inline-start': '1px solid var(--border)' }, 'left border'),
    u('border-right', 'box', { 'border-inline-end': '1px solid var(--border)' }, 'right border'),
    u('border-0', 'box', { border: '0' }, 'no border'),
    u('rounded', 'box', { 'border-radius': 'var(--radius)' }, 'radius m'),
    u('rounded-0', 'box', { 'border-radius': '0' }, 'square corners'),
    u('rounded-s', 'box', { 'border-radius': 'calc(var(--radius) / 2)' }, 'radius s'),
    u('rounded-l', 'box', { 'border-radius': 'calc(var(--radius) * 1.5)' }, 'radius l'),
    u('rounded-xl', 'box', { 'border-radius': 'calc(var(--radius) * 2)' }, 'radius xl'),
    u('rounded-full', 'box', { 'border-radius': '9999px' }, 'pill / circle'),
    u('shadow', 'box', { 'box-shadow': 'var(--shadow-m)' }, 'shadow m'),
    u('shadow-0', 'box', { 'box-shadow': 'none' }, 'no shadow'),
    u('shadow-s', 'box', { 'box-shadow': 'var(--shadow-s)' }, 'shadow s'),
    u('shadow-l', 'box', { 'box-shadow': 'var(--shadow-l)' }, 'shadow l'),
    u('shadow-xl', 'box', { 'box-shadow': 'var(--shadow-xl)' }, 'shadow xl'),
  );

  // Sizing
  out.push(
    u('width-full', 'sizing', { 'inline-size': '100%' }, 'width 100%'),
    u('width-auto', 'sizing', { 'inline-size': 'auto' }, 'width auto'),
    u('width-fit', 'sizing', { 'inline-size': 'fit-content' }, 'width fits content'),
    u('width-screen', 'sizing', { 'inline-size': '100vw' }, 'width of the viewport'),
    u('height-full', 'sizing', { 'block-size': '100%' }, 'height 100%'),
    u('height-auto', 'sizing', { 'block-size': 'auto' }, 'height auto'),
    u('height-screen', 'sizing', { 'block-size': '100dvh' }, 'height of the viewport'),
    u('min-height-screen', 'sizing', { 'min-block-size': '100dvh' }, 'at least viewport height'),
    u('min-width-0', 'sizing', { 'min-inline-size': '0' }, 'allow a flex or grid child to shrink below its content'),
    u('max-width-s', 'sizing', { 'max-inline-size': '24rem' }, 'max width 24rem'),
    u('max-width-m', 'sizing', { 'max-inline-size': '40rem' }, 'max width 40rem'),
    u('max-width-l', 'sizing', { 'max-inline-size': '56rem' }, 'max width 56rem'),
    u('max-width-xl', 'sizing', { 'max-inline-size': '72rem' }, 'max width 72rem'),
    u('max-width-prose', 'sizing', { 'max-inline-size': 'var(--measure)' }, 'max width for readable text (65ch)'),
    u('max-width-full', 'sizing', { 'max-inline-size': '100%' }, 'max width 100%'),
    u('max-width-none', 'sizing', { 'max-inline-size': 'none' }, 'no max width'),
  );

  // Display and overflow
  out.push(
    u('hidden', 'display', { display: 'none' }, 'not displayed'),
    u('block', 'display', { display: 'block' }, 'block'),
    u('inline', 'display', { display: 'inline' }, 'inline'),
    u('inline-block', 'display', { display: 'inline-block' }, 'inline block'),
    u('visually-hidden', 'display', { position: 'absolute', 'inline-size': '1px', 'block-size': '1px', padding: '0', margin: '-1px', overflow: 'hidden', 'clip-path': 'inset(50%)', 'white-space': 'nowrap', border: '0' }, 'hidden visually, read by screen readers'),
    u('overflow-hidden', 'display', { overflow: 'hidden' }, 'clip overflow'),
    u('overflow-auto', 'display', { overflow: 'auto' }, 'scroll when needed'),
    u('overflow-visible', 'display', { overflow: 'visible' }, 'show overflow'),
    u('overflow-x-auto', 'display', { 'overflow-x': 'auto' }, 'horizontal scroll when needed'),
    u('overflow-y-auto', 'display', { 'overflow-y': 'auto' }, 'vertical scroll when needed'),
  );

  // Position
  for (const v of ['relative', 'absolute', 'fixed', 'sticky', 'static']) out.push(u(v, 'position', { position: v }, `position ${v}`));
  out.push(
    u('inset-0', 'position', { inset: '0' }, 'all offsets 0'),
    u('top-0', 'position', { 'inset-block-start': '0' }, 'top 0'),
    u('right-0', 'position', { 'inset-inline-end': '0' }, 'right 0'),
    u('bottom-0', 'position', { 'inset-block-end': '0' }, 'bottom 0'),
    u('left-0', 'position', { 'inset-inline-start': '0' }, 'left 0'),
    u('z-below', 'position', { 'z-index': '-1' }, 'behind siblings'),
    u('z-above', 'position', { 'z-index': '10' }, 'above siblings'),
    u('z-top', 'position', { 'z-index': '1000' }, 'above everything'),
  );

  // Interaction
  out.push(
    u('pointer', 'interaction', { cursor: 'pointer' }, 'pointer cursor'),
    u('transition', 'interaction', { transition: 'color var(--transition), background-color var(--transition), border-color var(--transition), opacity var(--transition), transform var(--transition), translate var(--transition), box-shadow var(--transition)' }, 'smooth colour, opacity, transform and shadow changes'),
    u('select-none', 'interaction', { 'user-select': 'none' }, 'text cannot be selected'),
  );

  // Components (hand-written CSS in src/components.css and src/base.css)
  out.push(
    c('button', 'button look for <a> (a <button> needs no class)'),
    c('card', 'surface panel with border, radius, padding'),
    c('badge', 'small label; add a role'),
    c('alert', 'message box; add a role'),
    c('prose', 'long-form text: measure, rhythm, headings, lists'),
    c('switch', 'toggle switch on input[type=checkbox]'),
    c('icon', '1em icon in the current text colour on svg'),
    m('primary', ['button', '.button', '.badge', '.alert'], 'primary role'),
    m('ghost', ['button', '.button'], 'no background or border'),
    m('danger', ['button', '.button', '.badge', '.alert'], 'danger role'),
    m('small', ['button', '.button'], 'smaller size'),
    m('large', ['button', '.button'], 'larger size'),
    m('success', ['.badge', '.alert'], 'success role'),
    m('warning', ['.badge', '.alert'], 'warning role'),
    m('info', ['.badge', '.alert'], 'info role'),
  );

  return out;
}

/** Foreign-framework spellings and their KuwaCSS equivalents (used by `kuwacss check`). */
export const TRANSLATIONS: Record<string, string> = {
  'p-4': 'padding-m', 'px-4': 'padding-x-m', 'py-4': 'padding-y-m', 'p-2': 'padding-s', 'p-6': 'padding-l', 'p-8': 'padding-xl',
  'm-4': 'margin-m', 'mt-2': 'margin-top-s', 'mt-4': 'margin-top-m', 'mb-4': 'margin-bottom-m', 'mx-auto': 'margin-x-auto', 'ml-auto': 'margin-left-auto',
  'gap-2': 'gap-s', 'gap-4': 'gap-m', 'gap-6': 'gap-l', 'gap-8': 'gap-xl',
  'w-full': 'width-full', 'h-full': 'height-full', 'h-screen': 'height-screen', 'min-h-screen': 'min-height-screen', 'max-w-prose': 'max-width-prose',
  'sr-only': 'visually-hidden', 'font-bold': 'bold', 'font-semibold': 'semibold', 'font-medium': 'medium',
  'text-sm': 'text-s', 'text-base': 'text-m', 'text-lg': 'text-l', 'rounded-lg': 'rounded-l', 'rounded-md': 'rounded', 'shadow-md': 'shadow', 'shadow-lg': 'shadow-l',
  'items-center': 'align-center', 'items-start': 'align-start', 'items-end': 'align-end', 'flex-col': 'stack', 'flex-row': 'row', 'flex-wrap': 'wrap', 'flex-1': 'grow',
  'grid-cols-2': 'cols-2', 'grid-cols-3': 'cols-3', 'grid-cols-4': 'cols-4', 'col-span-2': 'span-2', 'col-span-full': 'span-full',
  'btn': 'button', 'btn-primary': 'primary', 'btn-danger': 'danger', 'btn-sm': 'small', 'btn-lg': 'large',
  'd-none': 'hidden', 'd-block': 'block', 'container-fluid': 'container', 'text-muted': 'color-muted', 'fw-bold': 'bold',
};
