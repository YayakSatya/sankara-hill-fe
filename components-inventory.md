# Component Inventory — Sankara Hill

Last scanned: 2026-09-02 (frame: landing-page, node 4002:3460)
Source file: "Sankara Hill" · page " ↳ Desktop" · 1920×8956, 399 nodes, 220 frames, 148 auto-layout frames, token coverage 98.7%

Token names below refer to `tokens.md`. All px values are Figma-source (1920 frame) — apply `SCALING.md` ratio before implementation.

---

## Button (btn-primary)
**Role:** Sole call-to-action in the system. Appears in navbar, inside room cards, and as the enquiry-form submit.

Horizontal auto-layout frame, contents centered on both axes, no gap (single text child). Padding is `--space-5` / `--space-7` (20px vertical, 28px horizontal) in the card and form variants; the navbar variant collapses vertical padding to 0 and fixes height to 58px instead. Background is a solid dark fill with no border, no radius (sharp square corners — `--radius-none`), and no shadow. Label sits in `--font-body` at either `--text-md` (20px/30px, uppercase, used in navbar and form submit) or `--text-sm` (18px, sentence case, used inside room cards), always `--color-neutral-0`. The button always fills the width of its parent container in card and form contexts (570px in the card, 960px in the form) and hugs its label only in the navbar (193px).

**Variants:** navbar (`--color-teal-800`, 58px tall, uppercase 20px, hug width) / card (`--color-neutral-1000`, 62px tall, sentence-case 18px, fill width) / form-submit (`--color-teal-950`, 70px tall, uppercase 20px, fill width). Fill color darkens as the CTA gets more committal.
**Source:** `landing-page/sticky-navbar/nav-actions/btn-primary` (COMPONENT 193×58), `.../room-card/btn-primary` (570×62), `.../enquiry-form/form-actions/btn-primary` (960×70)

---

## RoomCard
**Role:** Accommodation showcase in a two-up row; the left card is image-only, the right is a full spec card.

Vertical auto-layout with `SPACE_BETWEEN` primary alignment so the CTA is pinned to the bottom edge regardless of body length. Surface is `--color-neutral-0` with a 1px `--color-neutral-200` border and `--radius-card` (2px). The image-only variant carries no padding — the wireframe/photo container fills the whole card. The content variant takes `--space-10` (40px) padding all round and stacks: a `room-card-header` block (12px internal gap, 28px bottom padding, terminated by a 1px `--color-neutral-200` bottom border), a `room-facilities` list (24px gap, 28px top and bottom padding), then the full-width Button. Card title uses `--font-title` at `--text-h4`; supporting rows use `--font-body` at `--text-sm`/`--color-neutral-600`. Cards never get a shadow — the border is the only separation from the surrounding surface.

**Variants:** image-only (920×734, no padding) / content (650×734, 40px padding, header + facilities + CTA)
**Source:** `landing-page/content-wrapper/accommodations-section/cards-row/room-card` ×2

---

## HighlightBlock
**Role:** Featured facility tile (pool, restaurant, spa) in the facilities section's 3-up row. The only true Figma COMPONENT in this frame.

Vertical auto-layout, `--space-6` (24px) gap, `--radius-card` (2px), no fill or border of its own — it sits directly on the section's `--color-teal-50` surface. Top slot is a `highlight-thumbnail` rectangle at full block width × 560px (image placeholder). Below it, a `highlight-text` frame with `--space-4` (16px) gap holds a title in `--font-title` at `--text-h4` / `--color-neutral-1000` and a single-line description in `--font-body` at `--text-sm` / `--color-neutral-600`. Width is fluid — 513.33px as instantiated in a 3-column 1600px row with 30px gutters.

**Variants:** single variant; content-swapped per facility (Infinity Pool, Restaurant, Spa)
**Source:** `landing-page/content-wrapper/facilities-section/featured-highlights/highlight-block` (COMPONENT) ×3

---

## FacilityPill (grid-item)
**Role:** Compact secondary facility tag in the "Other Highlights" grid — 24 instances, wrapped in rows of ~8.

Horizontal auto-layout pill, `--space-3` (12px) gap, asymmetric padding (`10px 24px 10px 10px` — tighter on the icon side so the circular icon chip sits flush). Fill `--color-neutral-0`, 1px `--color-neutral-200` border, `--radius-full` (99px). Leading `icon-wrapper` is a 42×42 circle (`r21`) filled `--color-teal-100` centering an 18.375px stroked icon glyph (stroke `--color-teal-950` or `--color-neutral-600`). Label is `--font-body` `--text-sm` / `--color-neutral-1000`. Width hugs the label (126–209px observed).

**Variants:** single variant; icon + label swapped per facility (Wedding Chapel, Pool Bar, Room Service, Gym, Free WiFi, Function Room, Airport Transfer, …)
**Source:** `landing-page/content-wrapper/facilities-section/other-highlights/facilities-grid/grid-item` ×24

---

## FormField (field-group + input)
**Role:** Every field in the reservations enquiry form.

Vertical auto-layout, `--space-3` (12px) gap between label and control. Label is `--font-body` `--text-sm` / `--color-neutral-1000`, with a literal ` *` suffix for required fields (no separate asterisk styling). Control is a 61px-tall horizontal auto-layout frame with `--space-4` (16px) padding all round, transparent fill, 1px `--color-neutral-200` border, `--radius-card` (2px). Placeholder text is `--font-body` `--text-sm` / `--color-neutral-400`. Text inputs align content `MIN/CENTER`; date and select controls use `SPACE_BETWEEN` so a trailing 24px icon (lucide `calendar` or `chevron-down`, stroke `--color-neutral-1000`) pins to the right edge.

**Variants:** text (full-width 960px, e.g. Full Name) / date (370px, trailing calendar icon, placeholder `DD / MM / YYYY`) / select (180px, trailing chevron-down) — arranged in `form-row` frames with 30px gutters.
**Source:** `landing-page/content-wrapper/section-reservations/enquiry-form/reservation-form/form-field | field-group` ×5

---

## SectionHeader
**Role:** Opens every content section; establishes the eyebrow → headline → subtext rhythm.

Two arrangements share one anatomy. The horizontal variant (accommodations) is a `SPACE_BETWEEN`-ish row (`MIN/MAX`) with a 649px `header-text` column on the left and supporting content on the right, 30px gutter. The vertical variant (facilities, reservations) stacks the same block full-width with `--space-6` (24px) gap. The text column itself uses 24px gaps and three tiers: an uppercase eyebrow in `--font-body` `--text-sm` / `--color-neutral-600` (e.g. "ACCOMMODATIONS", "RESERVATIONS"), the headline in `--font-title` `--text-h2` (58/68, -1px) / `--color-neutral-1000`, and a 1–2 line subtext in `--font-body` 18px at 160% line height / `--color-neutral-600`.

**Variants:** horizontal (split, 120px tall) / vertical (stacked, 202px tall)
**Source:** `landing-page/content-wrapper/accommodations-section/section-header`, `.../facilities-section/section-header`, `.../enquiry-form/reservation-header`

---

## FactItem / FactsStrip
**Role:** Three-up stat strip under the welcome copy (room/suite/villa counts).

`facts-strip` is a horizontal `SPACE_BETWEEN` frame, no gap, `r4`, 786×104. Each `fact-item` is a 240×104 vertical frame with `--space-3` (12px) gap, 20px top padding, and a 1px `--color-neutral-200` border. Label on top: uppercase `--font-body` `--text-sm` / `--color-neutral-500`. Value below: `--font-title` at `--text-h3` (36/44, -0.5px) / `--color-neutral-1000`. No fill — the strip reads as bordered cells on the `--color-teal-50` surface.

**Variants:** single variant ×3
**Source:** `landing-page/content-wrapper/welcome-section/facts-strip/fact-item` ×3

---

## LandmarkItem
**Role:** Distance-to-landmark row in the location section.

Horizontal auto-layout, `MIN/CENTER`, 30px gap, 16px bottom padding, terminated by a 1px `--color-neutral-200` bottom border (a list-divider pattern, not a boxed card). Primary label is `--font-body` at `--text-md` (20/30) / `--color-neutral-1000` and takes the remaining width; the trailing duration is `--text-sm` / `--color-neutral-600` (e.g. "15 – 20 min"). 512×46 as instantiated.

**Variants:** single variant ×5
**Source:** `landing-page/content-wrapper/location-section/.../landmark-item` ×5

---

## StickyNavbar
**Role:** Persistent top navigation; the only element outside `content-wrapper` besides the hero.

Full-bleed 1920×106 horizontal `SPACE_BETWEEN / CENTER` frame, `--color-neutral-0` fill, `--space-6`/`--space-20` padding (24px vertical, 80px horizontal), 1px bottom border. Left slot `nav-logo`: wordmark in `--font-title` at 28px / `--color-neutral-1000` over a 12px tracked-out subtitle in `--text-sm`-ish 12px / `--color-neutral-500`, 4px gap. Center `nav-links`: five `nav-link-item` frames, 32px gap, each a 4px-gap vertical frame (the empty second slot is the active-underline placeholder) with label in `--font-body` `--text-sm` at 160% / `--color-neutral-1000`. Right `nav-actions`: 24px gap holding a `language-switcher` (EN / vertical rule / ID, 8px gap; active `--color-neutral-1000`, inactive `--color-neutral-500`) and the navbar Button.

**Variants:** single variant
**Source:** `landing-page/sticky-navbar` (1920×106)

---

## Footer
**Role:** Closing dark band with brand, link columns, and legal row.

Full-bleed 1921×561, `--color-teal-800` fill, padding 120/160/40/160, 64px gap. `footer-content` is a horizontal `SPACE_BETWEEN` row: a 379px brand column (wordmark in `--font-title` at 32px / `--color-neutral-0`, contact lines in `--font-body` `--text-sm` at 160% / `--color-neutral-0`, 24px gap) plus link columns (`footer-explore` etc., 20px gap; uppercase heading in `--text-sm` 28px line-height, links in 18px at 160%, 12px gap). A 1px `--color-teal-700` rule separates content from `footer-bottom`, a 29px-tall horizontal row carrying legal text and `social-link` items. All footer text is `--color-neutral-0` — no muted tier on the dark surface.

**Variants:** single variant
**Source:** `landing-page/content-wrapper/footer-section` (1921×561)

---

## Do's
- Do alternate section surfaces `--color-neutral-0` → `--color-teal-50` for vertical rhythm; every main section uses 160px padding and a 64px internal gap.
- Do separate surfaces with a 1px `--color-neutral-200` border. This is the system's only depth mechanic.
- Do keep display type in Instrument Serif Regular and all UI/body type in Switzer Regular.
- Do let a card's primary CTA fill the card width and pin to the bottom via `SPACE_BETWEEN`.
- Do darken the CTA fill as commitment rises: navbar `teal-800` → card `neutral-1000` → form submit `teal-950`.

## Don't
- Don't add drop shadows to cards, buttons, or inputs — the system is flat. The only shadowed nodes are decorative illustration containers.
- Don't use bold or light weights of either family; only Regular is used on this frame despite the variables existing.
- Don't round cards or buttons beyond `--radius-card` (2px). Pill radius (`99px`) belongs to facility tags only; circles (`r21`) to icon chips only.
- Don't introduce a muted text tier on the dark footer — all footer text is pure white.
- Don't use `--color-error-500` / `--color-warning-500` decoratively; they are reserved for form states not yet designed.

## Example Component Prompts

1. **Facility pill row** — "Build a horizontal wrapping row of facility pills, 16px gap. Each pill: horizontal flex, 12px gap, padding 10px 24px 10px 10px, background #ffffff, 1px solid #e2e8f0 border, border-radius 99px, width hugs content, height 62px. Leading element is a 42×42 circle filled #ddecee centering an 18.375px lucide icon stroked #081a1c. Label right of it: Switzer 18px / 160% line-height, color #020617."

2. **Room spec card** — "Vertical flex card, justify-content space-between, width 650px, height 734px, background #ffffff, 1px solid #e2e8f0, border-radius 2px, padding 40px. Body column contains: header block (12px gap, 28px bottom padding, 1px solid #e2e8f0 bottom border) with title in Instrument Serif 28px / 36px / -0.25px letter-spacing, color #020617; then a facilities list with 24px gap and 28px vertical padding, rows in Switzer 18px / 160%, color #475569. Bottom: full-width button, height 62px, background #020617, no radius, label 'Enquire Now' in Switzer 18px color #ffffff, centered."

3. **Section header (stacked)** — "Vertical block, 24px gap, full width 1600px. Eyebrow: uppercase, Switzer 18px / 28px, color #475569. Headline: Instrument Serif 58px / 68px / -1px letter-spacing, color #020617. Subtext: Switzer 18px / 160% line-height, color #475569, max-width ~960px."

4. **Enquiry form field row** — "Horizontal row, 30px gap. Each field: vertical flex, 12px gap. Label in Switzer 18px / 160%, color #020617, required fields end in ' *'. Control: height 61px, padding 16px, transparent background, 1px solid #e2e8f0, border-radius 2px. Text field aligns content left-center; date and select fields use justify-content space-between with a trailing 24px lucide icon (calendar / chevron-down) stroked #020617. Placeholder text Switzer 18px color #94a3b8."

5. **Featured highlight tile** — "Vertical flex, 24px gap, border-radius 2px, no background (sits on #f2f7f8). Top: image placeholder at full width × 560px. Below: text block with 16px gap — title in Instrument Serif 28px / 36px / -0.25px, color #020617; description in Switzer 18px / 160%, color #475569, one line. Lay three across a 1600px row with 30px gutters (513.33px each)."

## Imagery
Photography-forward: a full-bleed 1920×1080 hero rectangle opens the page, room cards use a full-card image treatment on the left of the two-up row, and each featured highlight tile is a 560px-tall image plate above its caption. All image slots are currently wireframe/placeholder rectangles with no radius on the hero and `--radius-card` (2px) inside cards — no overlays, gradients, or masks. Icons are outlined lucide-style vector paths (18.375px, 1px stroke) rather than filled glyphs, matching the flat, line-based visual language.
