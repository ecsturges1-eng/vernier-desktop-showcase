# Vernier Design System

**Vernier — Pricing Intelligence Infrastructure.** Vernier analyses, optimises and defends how financial institutions price their services: instrument-grade tooling for a market that has never had one. Pricing tools optimise. Compliance tools defend. Neither holds the other's evidence. The brand takes its cue from the vernier scale — a measuring instrument, not a marketing surface.

The three verbs — **Analyse / Optimise / Defend** — structure the product, the deck and the navigation.

## Source

Everything here derives from one supplied file:

- `uploads/Vernier Brand Toolkit (1).png` — *Vernier Brand Toolkit v2.0, quick reference, August 2026*. Seven sections: 01 Positioning, 02 Colour, 03 Marque & lockups, 04 Typography, 05 Interface components, 06 Layout & pitch surfaces, 07 Voice. Footer references `vernierintelligence.com`.
- Working crops of that file are kept in `crops/` for reference.

No codebase, Figma file or deck was supplied. Where this system goes beyond the toolkit — screen composition in the UI kit, the type scale rungs between the documented sizes — it is marked as inferred, here and in the relevant README.

## Index

| Path | What it holds |
| --- | --- |
| `styles.css` | Global entry point — imports every token file. Consumers link this one file. |
| `tokens/` | `fonts.css`, `colors.css`, `typography.css`, `spacing.css`, `base.css` |
| `assets/` | Marque and lockup SVGs |
| `components/` | React primitives, grouped by concern |
| `guidelines/` | Foundation specimen cards (Colors, Type, Spacing, Brand) |
| `ui_kits/platform/` | Click-through recreation of the Vernier workspace |
| `slides/` | Seven pitch-surface slide types at 1920×1080 |
| `SKILL.md` | Agent-skill entry point |

### Components

Grouped by concern under `components/`. Every one is drawn from the toolkit's §05 interface components or §06 pitch surfaces.

- **brand/** — `Logo`, `Mark`
- **actions/** — `Button`, `StatusChip`
- **data/** — `MetricCard`, `DeltaBadge`, `DataTable`, `StatBlock`
- **forms/** — `Field`
- **content/** — `SectionLabel`, `NumberedList`, `PullQuote`
- **feedback/** — `AuditStamp`

**Intentional additions.** `Field` is inferred from the surface ladder, which reserves Sheet (#F4F5F4) for "inputs, wells" but shows no input component; `SectionLabel` formalises the "03 / The challenge" pattern the voice section mandates; `Mark` is split out of `Logo` because the toolkit calls for a mark-alone app icon and favicon. Nothing else was added.

---

## Content fundamentals

**Instrument, not advocate. State the measurement and stop.**

- **Register.** Short declaratives. Figures carry the argument, so adjectives don't have to. Name the regulation, the fee, the basis points. Never claim what the audit trail can't evidence.
- **Person.** Third person and impersonal — "Vernier analyses…", "Every decision is stamped". No "we", almost never "you". Instructions to the user are imperative and unadorned: *Approve pricing. Export board paper. View audit trail.*
- **Spelling.** British throughout: analyse, optimise, defensibility, colour.
- **Casing.** Sentence case for headlines and buttons, with no full stop on a standalone display statement. Mono labels are UPPERCASE with wide tracking. Section names are keyed with zero-padded numerals: `03 / The challenge`.
- **Numbers.** Every measured value is mono: currency, basis points, identifiers, dates, percentages, section numbers. Deltas carry an explicit sign (`Δ +0.4bps`). Interpuncts separate fields on one line, never commas: `VR-2291 · approved 14 Aug 2026 09:41 UTC · antitrust scan PASS · 2 approvers`.
- **Emoji.** Never. No stock photography, no illustrated iconography either.

Say / not, verbatim from the toolkit:

| Say | Not |
| --- | --- |
| Audit-ready by design. | Revolutionary AI-powered compliance magic. |
| Δ +0.4bps against the 30-day baseline. | Significant uplift in pricing performance. |

Headline examples in brand voice: *The space between prices · Precision pricing · Two domains. One aligned system.*

---

## Visual foundations

### Colour — two neutrals, two accents, two grounds

| Role | Hex | Notes |
| --- | --- | --- |
| Ink | `#06122A` | Dark ground; primary text on Paper |
| Ink Raised | `#0E1E3A` | Dark card |
| Slate | `#2E3A4D` | Secondary text, labels — **Paper only** |
| Mist | `#A5B2C6` | Secondary text, labels — **Ink only** |
| Paper | `#EAEBEA` | Page ground |
| Sheet | `#F4F5F4` | Inputs, wells |
| Recess | `#DCDEDD` | Zebra, rails |
| Signal | `#24409B` | Accent — **Paper only** |
| Signal Deep | `#1B3179` | Hover / pressed state of Signal |
| Aperture | `#49C4F1` | Accent — **Ink only** |
| Aperture Deep | `#2FA6D4` | Hover / pressed state of Aperture |

**Four rules.** (1) One accent per ground — Signal on Paper, Aperture on Ink; never both on one surface. (2) The accent marks one decision per view: the optimised figure, the active state, the single action. (3) Colour is never the only carrier — every accent ships with a sign, a word or a keyed label. (4) Flat, always: no gradient, glow, shadow, rounded corner or decorative tint.

Banned pairings (they fail contrast): Slate on Ink, Mist on Paper, Signal on Ink, Aperture on Paper, Signal Deep on Ink. Aperture may appear on Paper as the marque's reading mark or a 3px rule — as a mark, never as type. Labels on any accent fill are Paper, which clears 4.5:1 on both.

### Type

- **Display** — Playfair Display 500, tracking −1.5%, leading 1.02–1.10. Sentence case, no full stop on standalone statements. Two lines maximum in decks, three in documents. Never below 28px, never in Slate at display sizes.
- **Body / UI** — Open Sauce Sans, 15–20px, leading 1.5. Weight 500 for lead paragraphs, interface labels and the wordmark; 400 everywhere else. Fallback: Helvetica Neue.
- **Data / label** — IBM Plex Mono 400/500, tracking +10–14%, tabular figures.

### Space and layout

12 columns · 28px gutters · 4px ladder. Spacing scale **4 / 8 / 12 / 20 / 28 / 44 / 56 / 72**. Deck margins 80px at 1920×1080; document margins 56px. Slide text never below 24px; the mark sits bottom-left. 1px hairlines at 10–25% Ink, section dividers only.

### Surfaces, borders, shadows

Build every UI from five rungs: Sheet → Paper → Recess → Ink Raised → Ink. A card on Paper is a 1px hairline box with no fill; a card on Ink is a solid Ink Raised (or Ink) fill with no border. **Corner radius is 0 everywhere. There are no shadows, no inner shadows, no protection gradients, no capsules, no blur and no transparency effects** beyond the hairline rules, which are expressed as Ink at 10/15/25% alpha. Tables have hairline horizontal rules only — no vertical rules, no fills.

### Backgrounds and imagery

No photography, no illustration, no texture, no pattern, no gradient. Grounds are flat Paper or flat Ink. The only decorative element permitted is a rule: a 3–4px accent bar above a quote or beside a display statement, and 1px hairlines between sections. If an image is genuinely required, the toolkit gives no treatment for one — ask before introducing any.

### Motion, hover and press

The toolkit defines interaction as a four-step colour ladder, not as motion: **tint 10 → selected 22 → rest → pressed**. On Paper that is `#E9ECF5 → #CFD5E9 → Signal → Signal Deep`; on Ink, `Ink → Ink Raised → Aperture → Aperture Deep`. Hover deepens the accent; press deepens it further. No scale, no lift, no bounce, no glow. Transitions, where used at all, are short linear colour fades (~120ms). No other colour in the system is interactive, so there are no further states to invent.

### Iconography

**The toolkit ships no icon set and no icon font, and it explicitly bans illustrated iconography and emoji.** The only mark in the system is the vernier marque itself. Meaning is carried by mono words and keyed labels — `ANALYSE`, `PENDING`, `Δ +0.4bps` — not by glyphs. This system therefore contains no icon library and links none from a CDN; that absence is deliberate, not an omission. Unicode is used sparingly and only where it is a typographic character rather than a picture: `Δ` for delta, `·` as a field separator, `—` for an empty cell, `✗` to mark a banned pairing. If a future surface genuinely needs functional glyphs (a close, a chevron), ask before adopting a set — the closest match in spirit would be a 1px-stroke geometric set, but nothing has been chosen.

**Assets.** `assets/mark-paper.svg`, `assets/mark-ink.svg`, `assets/mark-mono.svg`, `assets/logo.svg`, `assets/logo-reversed.svg`. The marque is a faithful trace of the artwork and construction spec in the toolkit (five graduation ticks of unequal height on a baseline; reading mark crossing above and below; geometry fixed — never redraw, restack or re-space the ticks). Mark minimum 26px. Clear space on all sides equals baseline thickness × 3. The wordmark is Open Sauce Sans Medium at +0.02em, sentence case, with the mark set square at 1.7× cap height. **Vector originals were not supplied — request the production SVG/EPS artwork before any print or embossing use.**

---

## Substitutions and gaps — please confirm

1. **Open Sauce Sans** is not on Google Fonts. It is loaded here from the Fontsource CDN (SIL OFL). Supply self-hosted binaries for production.
2. **Playfair Display** and **IBM Plex Mono** load from Google Fonts and match the toolkit exactly.
3. **No vector logo artwork** was supplied; the SVGs here are traced from the raster toolkit against its written construction spec.
4. **No product screens, codebase or Figma file** were supplied. The UI kit composes documented components into inferred layouts.
5. **No marketing website** material was supplied, so no website UI kit exists.
