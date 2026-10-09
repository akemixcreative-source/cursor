<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Design Reference

For all UI / visual design work on Venera Studio, read [`DESIGN.md`](./DESIGN.md) at the project root before generating components, pages, or styles. It defines the color palette, typography hierarchy, component patterns, spacing scale, and do's/don'ts to keep work on-brand (dark canvas, mono-caps technical meta, single warm-accent CTA, brutalist editorial rhythm). The full upstream catalog of alternate design systems is mirrored in `docs/design-references/awesome-design-md/` for reference; do not edit those files. Apply the Venera token overrides called out in the header comment of `DESIGN.md` (e.g. `--bg #0E0E0E`, `--fg #F5F0E8`, `--accent #FF4500`, Geist / Geist Mono in place of Inter / IBM Plex Mono) rather than the literal Sanity tokens.
