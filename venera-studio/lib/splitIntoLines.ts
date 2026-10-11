/**
 * Wraps each visual line of `host` in `.srl-line > .srl-lineInner` and returns
 * the inner nodes for animation. `host` must be in the document. The host is
 * briefly hidden while word spans are measured for line breaks.
 */
export function splitHostIntoLineInners(
  host: HTMLElement,
  wordClass: string,
): HTMLElement[] {
  const text = host.textContent ?? "";
  if (!text.trim()) return [];

  host.textContent = "";
  const tokens = text.split(/(\s+)/);
  const wordSpans: HTMLElement[] = [];
  for (const tok of tokens) {
    if (tok === "") continue;
    const s = document.createElement("span");
    s.className = wordClass;
    s.textContent = tok;
    host.appendChild(s);
    wordSpans.push(s);
  }

  if (wordSpans.length === 0) return [];

  const prevOpacity = host.style.opacity;
  host.style.opacity = "0";
  void host.offsetHeight;

  const lines: HTMLElement[][] = [];
  let row: HTMLElement[] = [];
  let prevTop: number | null = null;
  for (const span of wordSpans) {
    const top = span.offsetTop;
    if (prevTop !== null && top !== prevTop && row.length) {
      lines.push(row);
      row = [];
    }
    row.push(span);
    prevTop = top;
  }
  if (row.length) lines.push(row);

  host.textContent = "";
  const inners: HTMLElement[] = [];
  for (const words of lines) {
    const line = document.createElement("span");
    line.className = "srl-line";
    const inner = document.createElement("span");
    inner.className = "srl-lineInner";
    for (const w of words) inner.appendChild(w);
    line.appendChild(inner);
    host.appendChild(line);
    inners.push(inner);
  }

  host.style.opacity = prevOpacity;
  return inners;
}
