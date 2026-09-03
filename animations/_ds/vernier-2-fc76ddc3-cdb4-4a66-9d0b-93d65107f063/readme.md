# Vernier Design System

Vernier is AI-native decision infrastructure for pricing strategy. Its audience is pricing and revenue management teams; its category is pricing intelligence. The brand toolkit states what the brand must signal: "Measurement, precision and institutional durability. Read by finance, not by consumers."

The system is deliberately instrument-like: white surfaces, one navy ink, one accent blue used sparingly, one border weight, two elevation levels, and mono figures wherever a number is doing work. Everything in this project is derived from a single source.

## Source

- `uploads/Brand Toolkit v3.pdf` — **Vernier Brand Toolkit v1.0, September 2026**, 23 pages, three parts: Identity (mark, lockups, clear space), System (colour, type, grid, borders/radius/elevation, components, data visualisation, iconography), Application (voice and tone, four application surfaces, quick reference). Page renders used while building are in `scraps/`.
- No codebase, Figma file or font binaries were supplied. Web address given in the toolkit: vernier.co.
- Everything in this project traces to that PDF. Where something is extrapolated rather than specified, it is flagged inline and listed under [Gaps and substitutions](#gaps-and-substitutions).

## Index

| Path | What it is |
| --- | --- |
| `styles.css` | The single entry point consumers link. `@import` lines only. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `surface.css`, `base.css` |
| `assets/` | `mark.svg`, `mark-reversed.svg` — geometry extracted from the toolkit, not redrawn |
| `components/actions/` | `Button` |
| `components/forms/` | `Input` |
| `components/display/` | `Badge`, `Card`, `Eyebrow` |
| `components/data/` | `Delta`, `MetricCard`, `DataTable`, `BarChart` |
| `components/brand/` | `Logo`, `Icon` |
| `guidelines/` | 17 specimen cards: colours, type, spacing, surface, brand, voice |
| `ui_kits/web/` | Marketing site — home, method, request access (click-through) |
| `ui_kits/console/` | Price index console — table selection, detail panel, margin floor |
| `ui_kits/document/` | Briefing note and email signature |
| `slides/` | Six 1920×1080 slide templates |
| `SKILL.md` | Agent-skill front matter for use outside this project |

## Content fundamentals

Copy is written as a reading, not a pitch. The toolkit gives three rules and one before/after pair, and everything here follows them.

1. **Measurement first, implication second.** "Give the number and its source before saying what it means."
2. **State the confidence.** "Every model output is published with its confidence and its window. Uncertainty is disclosed, not smoothed."
3. **No superlatives.** "No revolutionary, no game-changing, no unlock. British spelling throughout."

Avoid — "Unlock explosive margin growth with AI-powered insights."
Use — "Market median moved 4.23% above your list price across 1,806 SKUs. Confidence 0.94."

Practical conventions drawn from the source:

- **Person.** The reader is addressed as "your list price", "the categories you price". Vernier refers to itself by name or in the first person plural ("we publish"), never as "I" and never chattily.
- **Casing.** Sentence case for headings and buttons ("Run analysis", "Request access"). Uppercase is reserved for the mono label style, which is always tracked +0.12em ("MARKET MEDIAN", "CLEAR SPACE", "PART 02").
- **Figures.** Two decimals, always: `−4.23%`, `0.94`, `1,240.00`. A true minus sign, not a hyphen. Large figures abbreviate in KPIs only (`1.42m`). Every derived figure names its window (eight weeks) and its confidence.
- **Status language names the threshold.** "Below floor", "Within tolerance", "Headroom", "Stale — 9 days" — never a bare "Warning" or "Error", and never a coloured chip with no figure beside it.
- **Sentence length.** Short declaratives, full stops, no exclamation marks, no rhetorical questions. Em dashes appear only in labels ("Small — captions and notes").
- **Spelling.** British: colour, visualisation, aggregated into "Other".
- **Emoji.** Never. Not in product, documents, slides or marketing.
- **Vibe.** A calibrated instrument. Quiet, dated, signed, checkable — closer to an audit note than to a SaaS landing page.

## Visual foundations

**Colour.** White is the ground: roughly 80% of any surface. One navy ink (#0D1B33) sets all type, the mark and section covers. One accent blue (#2E4BA0) marks the primary action, links and the focus ring — one accent per view, never a fill for large areas. Two neutrals below ink (#48546B body, #8A93A3 mono labels), two border greys (#E2E5EB default, #C9CFD9 hover/selected), one recessed fill (#F7F8FA). Status is three colours with paired tints, and status colour never travels alone: every coloured value carries a label or figure stating the threshold it was measured against. Status colour is not permitted in headings, buttons, section accents or the logo.

**Type.** Three families, all SIL OFL 1.1. Playfair Display Medium sets Display (96/100) and Title (64/72) and the wordmark — nothing else, ever. IBM Plex Sans sets Subtitle (44/56 Medium), Body (34/50), Small (28/42) and all interface text. IBM Plex Mono sets labels (24/32, uppercase, +0.12em) and every figure in a data context; in running prose numerals stay in Plex Sans. Interface sizes step 24 / 20 / 15 / 13 / 11.

**Spacing and layout.** 8px base; steps of 8, 16, 24, 32, 48, 64, 96. Twelve fluid columns, six on tablet, four on mobile, 32px gutter. 100px slide margin, 64px product margin. Left-aligned, always — centred type appears on cover slides only.

**Backgrounds.** Flat colour only: white, #F7F8FA for recessed panels and table headers, and full-bleed #0D1B33 for section covers and closing bands. No photography, no illustration, no pattern, no texture, no gradient anywhere in the toolkit. Imagery is absent from the brand rather than styled — if a photograph is ever required, treat it as an exception and ask.

**Borders.** One weight only: 1px solid. Hairline #E2E5EB by default, #C9CFD9 for hover and selection. Never 2px. Never coloured, except the focus ring.

**Radius.** 6px for containers — cards, panels, modals, inputs, buttons. 3px for inline controls — chips, tags, badges. 0px for tables, dividers, charts and full-bleed surfaces. Cards are therefore a 6px rectangle with a hairline border and no shadow; nothing in the system is pill-shaped or circular.

**Elevation and shadow.** Two levels. 0 is flat and bordered, the default. 1 adds `0 1px 2px rgba(13,27,51,0.06)`, keeps its border, and is for menus and modals only. No inner shadows, no glows, no layered stacks, no drop shadows beyond level 1.

**Focus, hover, press.** Focus is a 2px accent outline at 2px offset — the only place accent blue becomes a border. Hover darkens the accent fill (#263F87), strengthens a border to #C9CFD9, or fills a row with #F7F8FA; a selected row takes the accent tint #EEF1FA. Press is not specified in the toolkit: use a further darkening of the same fill, never a scale or lift, since the system has no motion-based affordances.

**Motion.** Not specified in the source. Inferred to match: 120–180ms, `cubic-bezier(0.2,0,0.2,1)`, colour and opacity only. No bounce, no spring, no scale, no parallax, no animated illustration. Tokens live in `tokens/surface.css` and are marked as inferred.

**Transparency and blur.** Only reversed type on ink uses transparency (`rgba(255,255,255,0.7)` for secondary copy on #0D1B33). No frosted glass, no backdrop blur, no protection gradients — a full-bleed ink panel does the job a scrim would do elsewhere.

**Data visualisation.** Square bars and columns, no radius. Horizontal gridlines only, 1px #E2E5EB. Axis labels in mono. Five steps of one blue (#1B2E63 → #C6D1EE); series beyond five aggregate into "Other". Status colour replaces the ramp only where a value has been evaluated against a threshold. No gradients, no shadows, no 3D, no pie charts.

**Never list**, verbatim from the toolkit: gradients; drop shadows beyond level 1; status colour as decoration; Playfair anywhere but Display, Title and the wordmark; accent blue as a large fill; more than one accent per view.

## Identity

The mark is a measuring instrument: a baseline rule one unit deep spanning the full field, five scale ticks 0.75 units wide set at uneven heights, and one indicator one unit wide running the full height of the field and crossing the baseline. The ticks are observed prices; the bar is the reading taken from them. The indicator is the only element ever set in accent blue.

Mark height equals 1.6× the cap height of the wordmark, and the gap between mark and wordmark equals half the mark's width — the `Logo` component computes both from a single height prop. Clear space is half the mark's width on all four sides, and no type, rule, image or edge may enter it. Minimum sizes: lockup 140px / 36mm, mark only 24px / 8mm. Below that, use the mark alone.

`assets/mark.svg` and `assets/mark-reversed.svg` were extracted as exact rect geometry from the toolkit's vector artwork, not redrawn by hand. The wordmark is set live in Playfair Display Medium rather than shipped as outlines — no font binaries or logo files came with the PDF.

## Iconography

The toolkit specifies the icon system precisely but ships no glyphs: 24-unit grid, 1.5-unit stroke, square caps and joins, 2-unit padding, strokes only — no filled shapes. Ink at full strength, or #8A93A3 when inactive. Icons never take accent blue or a status colour; the label beside them carries the meaning. Sizes 16 · 20 · 24 · 32px. Four glyphs appear on the iconography page (a gauge, a table, a small bar chart, a plus), which reads as a small purpose-built set rather than a licensed library.

There is no icon font, no sprite and no SVG files in the source. `components/brand/Icon.jsx` therefore substitutes **Lucide** (`lucide-static@0.474.0`, jsDelivr CDN), masked so each glyph takes the ink colour. This is a flagged substitution: Lucide draws at a 2-unit stroke with round caps, where Vernier specifies 1.5 units and square caps. Emoji are never used; unicode characters appear only as typographic marks (− + · — × ").

## Components

Ten primitives, built from the inventory the toolkit itself defines (p.14, p.16–18):

| Component | Source |
| --- | --- |
| `Button` | Actions · radius 6px — "Run analysis" / "Export" / "Cancel" |
| `Input` | Input · radius 6px — labelled field with mono numeric mode |
| `Badge` | Chips and badges · radius 3px — EMEA / Verified / Stale — 9 days / Breach |
| `Card` | Borders, radius and elevation — 6px container, elevation 0 and 1 |
| `MetricCard` | Metric card · elevation 0 |
| `DataTable` | Table row · radius 0, and Numerals and tabular data |
| `Delta` | Signed figures in the table and KPI footnotes |
| `BarChart` | Data visualisation — square columns, blue ramp, status bars |
| `Logo` | Identity — lockups, ratios, minimum sizes |

**Intentional additions** (not defined as components in the source):

- `Eyebrow` — the toolkit's LABEL type style (mono, uppercase, +0.12em) used on every surface; promoted to a component so the tracking is never re-typed.
- `Icon` — a wrapper so the substituted glyph set has one place to be swapped for Vernier's own.

## Gaps and substitutions

1. **Fonts are linked, not bundled.** No binaries were supplied. Playfair Display, IBM Plex Sans and IBM Plex Mono are the real specified families and are loaded from Google Fonts in `tokens/fonts.css`. Send the licensed files and they can be self-hosted with proper `@font-face` rules.
2. **Icons are Lucide, not Vernier's.** Closest available match; stroke weight and caps differ from spec. Please supply the real set.
3. **Motion, press states and disabled treatment** are inferred — the toolkit is silent on all three.
4. **The console kit is extrapolated.** The toolkit specifies every component in it but shows no product screenshot, so the arrangement is a proposal; component styling is ground truth.
5. **Interface type sizes** (24/20/15/13/11) are an addition — the published scale is a presentation scale (96 down to 24) and would not fit a product view.
6. **Series ramp values** were sampled from the toolkit's ramp artwork, which lists no hex codes: #1B2E63, #2E4BA0, #5B77C4, #93A6DC, #C6D1EE.
