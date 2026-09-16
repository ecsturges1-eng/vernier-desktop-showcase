# Vernier Design System

A precision-instrument identity: Playfair Display for voice, IBM Plex Sans for interface, IBM Plex Mono for every label and figure. One radius (0px), one border weight (1px), an 8px spacing grid, and a single accent — #2E4BA0.

## Grounds

Two, and only two. Light (`--surface` #FFFFFF / `--surface-sunken` #F7F8FA) and ink (`--surface-ink` #06122A). Reversed type and the reversed logo are for #06122A only; the `--ink-reversed-*` tokens are contrast-checked against it.

## Tokens

Import `styles.css`, which pulls in the token layer:

- `tokens/fonts.css` — webfont loading
- `tokens/colors.css` — palette, semantic ink/surface, status
- `tokens/typography.css` — display, interface, and mono scales as `font:` shorthands
- `tokens/spacing.css` — 8px grid plus measured application paddings
- `tokens/surface.css` — radius, rules, elevation, graduation ticks, motion
- `tokens/base.css` — resets, link states, keyframes

Use the composite `--type-*` tokens as `font:` shorthand rather than setting size and family separately.

## Components

- **Logo** — the mark and monogram, ink and reversed.
- **Button** — primary, secondary, quiet; three sizes; light and ink grounds.
- **Badge** — mono uppercase status label in four tones.
- **Input** — single-line field with a mono label, hint, and invalid state.
- **Panel** — the default bordered container; light or ink, flat or elevated.
- **Table** — hairline rows, mono right-aligned figures, no striping.
- **Figure** — a labelled statistic with optional unit and delta.

## Rules

- Never recolor, outline, or rebuild the logo; use the supplied SVGs.
- Labels are mono, uppercase, `--tracking-label`. Figures are mono with tabular numerals.
- Playfair is for display, titles, and the signature word — never for interface text.
- Elevation stops at `--elevation-1` in product UI. `--elevation-2` is one marketing element per view.
