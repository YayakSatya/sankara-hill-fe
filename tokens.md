# Design Tokens — Sankara Hill

Luxury resort landing page. Cool teal-and-slate palette on white/ivory canvas, serif display type (Instrument Serif) paired with Switzer for body/UI. Flat design — no drop shadows anywhere except two floating illustration containers; depth carried by 1px slate-200 borders, not elevation. Color rationed: teal-950/800/700 for dark surfaces (nav CTA, footer, map panel), warm sankara-teal-50 (#f2f7f8) as the alternate section background, slate neutrals for all text/borders.

**Theme:** Light
Last scanned: 2026-09-02 (frame: landing-page, node 4002:3460, 1920×8956, source file "Sankara Hill")

## Tokens — Colors

| Name | Value | Token | Role |
|------|-------|-------|------|
| Neutral 0 | `#ffffff` | `--color-neutral-0` | Page/card background, text-on-dark |
| Neutral 200 | `#e2e8f0` | `--color-neutral-200` | Default border/divider (cards, inputs, fact-item, grid-item pills) |
| Neutral 300 | `#cbd5e1` | `--color-neutral-300` | Secondary divider (facilities "other highlights" rule) |
| Neutral 400 | `#94a3b8` | `--color-neutral-400` | Input placeholder text |
| Neutral 500 | `#64748b` | `--color-neutral-500` | Secondary/eyebrow text on dark-ish contexts, small meta labels |
| Neutral 600 | `#475569` | `--color-neutral-600` | Body copy, subtext under headings |
| Neutral 1000 | `#020617` | `--color-neutral-1000` | Primary heading/body text, icon-path default |
| Sankara Teal 50 | `#f2f7f8` | `--color-teal-50` | Alternate section background (welcome, facilities) |
| Sankara Teal 100 | `#ddecee` | `--color-teal-100` | Icon-wrapper fill (facility icon chips) |
| Sankara Teal 700 | `#1f4b51` | `--color-teal-700` | Divider accent line (footer) |
| Sankara Teal 800 | `#15383c` | `--color-teal-800` | Footer background, nav CTA (btn-primary in navbar) |
| Sankara Teal 950 | `#081a1c` | `--color-teal-950` | Darkest CTA fill (form submit button), icon-path on dark |
| Semantic Error 500 | `#ef4444` | `--color-error-500` | Reserved — form validation error state (not yet used on canvas) |
| Semantic Warning 500 | `#f59e0b` | `--color-warning-500` | Reserved — warning state (not yet used on canvas) |

Local/one-off, not tokenized: map-panel background `#007b8b`, footer-bottom social icon `#1f1f1f`, wireframe placeholder fill `#f2f2f2`. Flag these for promotion if reused elsewhere.

## Tokens — Typography

### Instrument Serif — Display/heading serif · `--font-title`
- **Substitute:** serif (system fallback)
- **Weights:** Regular only (400) — no bold cut used in this frame
- **Sizes used:** 58, 36, 32, 28
- **Line height:** 68px (h2/58) · 44px (h3/36) · 36px (h4/28) · auto (nav logo 28/32)
- **Letter spacing:** -1px (58) · -0.5px (36) · -0.25px (28)

### Switzer — Body/UI sans · `--font-body`
- **Substitute:** Inter, system-ui
- **Weights:** Regular (400) only observed; Bold/Book/Light variables defined but unused on this frame
- **Sizes used:** 20, 18
- **Line height:** 30px (md/20), 28px (sm/18) for eyebrow labels; 160% for body paragraphs
- **Letter spacing:** 0 across all sizes

### Type Scale

| Role | Size | Line Height | Letter Spacing | Token |
|------|------|-------------|----------------|-------|
| Display (hero quote, section H2) | 58px | 68px | -1px | `--text-h2` |
| Display 2 (H3, e.g. card/dialog titles) | 36px | 44px | -0.5px | `--text-h3` |
| Headline (H4, highlight-block titles) | 28px | 36px | -0.25px | `--text-h4` |
| Body/Title (form labels, nav CTA, buttons) | 20px | 30px | 0 | `--text-md` |
| Small/eyebrow (labels, body copy, nav links) | 18px | 28px (label) / 160% (paragraph) | 0 | `--text-sm` |

Eyebrow labels (e.g. "ACCOMMODATIONS", "RESERVATIONS") use `--text-sm` uppercased + `--color-neutral-500`, letter-spacing loosened ~+1.5–2.5% in nav subtext specifically (not part of core scale — local override).

## Spacing

Base unit: 4px. Density: spacious/luxury (generous section padding). Full scale as used: **4, 8, 10, 12, 16, 20, 24, 28, 30, 32, 40, 48, 64, 80, 120, 160**.

| Figma spacing (px) | Usage |
|---|---|
| 4 | icon-label gap (nav logo subtitle) |
| 8 | small icon-text gap (language switcher) |
| 12 | field-group internal gap, fact-item text gap |
| 16 | form-actions gap, input padding |
| 20 | button vertical padding, fact-item top padding |
| 24 | card/section internal gap, welcome-header gap |
| 28 | button horizontal padding, header-text gap |
| 30 | section-header/cards-row/location gap |
| 32 | nav-links gap, other-highlights gap |
| 40 | room-card (2-col variant) padding |
| 48 | enquiry-form padding/gap |
| 64 | inter-block gap within each section |
| 80 | navbar horizontal padding |
| 120 | footer top padding |
| 160 | section horizontal/vertical padding (all main sections) |

### Radius
Role-specific, not global:

| Element | Radius |
|---------|-------|
| none (default) | 0 |
| Cards (room-card, enquiry-form, inputs) | 2px |
| Icon-wrapper (illustration containers) | 8.9px |
| Icon-wrapper (facility chips, circular) | 21px (= half of 42px = full circle) |
| Pill (grid-item facility tags) | 99px (full/pill) |

### Shadows
No drop shadows in this design — flat surface language. Two decorative "Container" illustration nodes carry a soft shadow (`fills: image`, `effects: shadow`) but this is local/one-off illustration styling, not a system elevation token.

### Layout
- **Page max-width:** 1920px canvas, content constrained to 1600px (1601px footer)
- **Section gap (vertical rhythm within section):** 64px
- **Section padding:** 160px horizontal/vertical (120/40 top/bottom for footer)
- **Card padding:** 40–48px (large cards/forms), 20–28px (buttons)
- **Element gap:** 24–30px typical

## Surfaces
| Level | Name | Value | Purpose |
|-------|------|-------|---------|
| 0 | Canvas | `#ffffff` | Page background, accommodations/reservations section |
| 1 | Alt Surface | `#f2f7f8` (teal-50) | Welcome + facilities section background (alternating rhythm) |
| 2 | Elevated Card | `#ffffff` + 1px `#e2e8f0` border | Room cards, enquiry form, fact-item, grid-item pills |
| 3 | Dark Surface | `#15383c` (teal-800) | Footer |
| 3 | Darkest Accent | `#081a1c` (teal-950) | Primary form CTA |

## Elevation
Flat system — depth achieved via 1px borders + alternating background surfaces, not shadows. No named shadow tokens.

## Quick Color Reference
- text: `#020617` / background: `#ffffff` / border: `#e2e8f0` / muted text: `#475569` / accent: `#15383c` / primary action: `#081a1c`

## Quick Start — CSS Custom Properties
```css
:root {
  /* Color */
  --color-neutral-0: #ffffff;
  --color-neutral-200: #e2e8f0;
  --color-neutral-300: #cbd5e1;
  --color-neutral-400: #94a3b8;
  --color-neutral-500: #64748b;
  --color-neutral-600: #475569;
  --color-neutral-1000: #020617;
  --color-teal-50: #f2f7f8;
  --color-teal-100: #ddecee;
  --color-teal-700: #1f4b51;
  --color-teal-800: #15383c;
  --color-teal-950: #081a1c;
  --color-error-500: #ef4444;
  --color-warning-500: #f59e0b;

  /* Typography */
  --font-title: "Instrument Serif", serif;
  --font-body: "Switzer", "Inter", system-ui, sans-serif;
  --text-h2-size: 58px;   --text-h2-lh: 68px;  --text-h2-ls: -1px;
  --text-h3-size: 36px;   --text-h3-lh: 44px;  --text-h3-ls: -0.5px;
  --text-h4-size: 28px;   --text-h4-lh: 36px;  --text-h4-ls: -0.25px;
  --text-md-size: 20px;   --text-md-lh: 30px;  --text-md-ls: 0;
  --text-sm-size: 18px;   --text-sm-lh: 28px;  --text-sm-ls: 0;

  /* Spacing */
  --space-1: 4px;  --space-2: 8px;  --space-2-5: 10px; --space-3: 12px;
  --space-4: 16px; --space-5: 20px; --space-6: 24px;  --space-7: 28px;
  --space-7-5: 30px; --space-8: 32px; --space-10: 40px; --space-12: 48px;
  --space-16: 64px; --space-20: 80px; --space-30: 120px; --space-40: 160px;

  /* Radius */
  --radius-none: 0;
  --radius-card: 2px;
  --radius-icon: 8.9px;
  --radius-full: 9999px;
}
```
