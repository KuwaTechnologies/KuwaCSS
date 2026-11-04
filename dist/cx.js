// KuwaCSS: joins class names with a space, dropping falsy values. Types live in kuwa.d.ts.
export function cx(...classes) {
  return classes.filter(Boolean).join(' ');
}
