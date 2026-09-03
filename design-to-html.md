---
name: design-to-html
description: Convert Figma designs (screenshots or Figma MCP data) into clean, token-based HTML, CSS, and JavaScript following the team's frontend standards. Use this skill whenever a designer or user asks to generate a web page from a design, mockup, Figma file, or screenshot; asks to build or revise a homepage, landing page, section (hero, pricing, footer, etc.), or any other page based on a visual design; or asks to create a new page "in the same style" as previously generated pages — even if they don't explicitly mention HTML or CSS.
---

# Design-to-HTML Generation

Convert a Figma design (homepage and subsequent related pages/sections)
into production-ready HTML, CSS, and JavaScript based on a designer's
prompt. Output must follow the team's shared design token system
(`scss-core`), the project folder structure defined below, and the
frontend quality checklist embedded in these rules.

## Workflow Overview

1. Read the design input (Figma MCP preferred; screenshot fallback).
2. Determine context: first-time generation, or continuation/revision.
3. **Extract assets** (images, logos, icons) from Figma — never leave
   broken image paths.
4. **Check component variants/states** in Figma before implementing any
   interactive component.
5. Only ask the designer a question if ambiguity is critical. Otherwise
   assume and mark assumptions.
6. Generate files into the shared folder structure (Section 8).
7. Create or update `components.html` (the living style guide).
8. Append the Manual QA Checklist — never claim runtime behavior is
   verified.

---

## 1. How to Read Design Input

The designer may provide:

1. **Figma MCP / Dev Mode data** (preferred) — exact specs: hex colors,
   pixel measurements, font sizes, spacing, component variants, and
   exportable assets.
2. **Screenshot / exported image** — visual only, no exact measurements.

**Priority rule:** always prefer Figma MCP data when available. Only
estimate visually when a screenshot is the only input.

**When estimating from a screenshot:**

- Round measurements to the nearest value in the spacing scale (4px
  increments: 4, 8, 12, 16, 20, 24, 32, 40...).
- Mark every estimated value: `/* estimated from screenshot */`
- Never invent precise pixel values (e.g. `padding: 17px`) — round to
  the nearest token value.

**Read the layout carefully, not just the content.** Before writing any
section, identify from the design: the exact column structure, element
alignment (left/center/right), relative sizes between elements, and how
items are distributed (e.g. a footer with logo left, nav center, socials
right is three distinct zones — not one row of items). Reproduce the
layout structure faithfully; do not simplify a multi-zone layout into a
generic single-row/column arrangement.

The designer's text prompt determines the **scope**: a single section, a
full page, or multiple pages. Confirm scope before generating.

---

## 2. Detect Context: New Build vs. Continuation/Revision

**A. First-time generation** (no prior output in this project):

- Establish the full folder structure (Section 8), including
  `tokens.css`, `base.css`, `components.css`, and `components.html`.

**B. Continuation or revision** (files already exist in `output/`):

- **Read the existing CSS files first** — especially `components.css`
  and `tokens.css`. Reuse existing classes, tokens, and patterns. Do not
  introduce new colors, spacing values, or diverging naming patterns.
- **New page in the same style** (e.g. "build an About page like the
  homepage"): link the same `tokens.css`, `base.css`, and
  `components.css`; only create a new `pages/[page].css` for
  page-specific layout. Reuse existing components (`c-hero`, `c-card`)
  rather than designing new ones. Mark improvised content:
  `<!-- assumption: reused homepage hero pattern -->`
- **Partial revision** (e.g. "update just the pricing section"): modify
  only the relevant files/sections. State clearly in the response which
  files were changed.
- **If a new global component is created or an existing one modified,
  update `components.html` in the same task** so the style guide never
  drifts out of sync.

---

## 3. HTML Structure Rules

- **Heading hierarchy**: the most visually prominent element becomes
  `h1`; subordinate elements follow in descending order. Never skip
  levels arbitrarily.
- **Alt text**: every `<img>` gets a descriptive `alt`. Empty `alt=""`
  only for purely decorative images.
- **Icon-only buttons**: must include `aria-label="..."` or
  `title="..."`.
- **Semantic tags**: prefer `<nav>`, `<header>`, `<main>`, `<footer>`,
  `<section>`, `<article>` over generic `<div>`.
- **Touch targets**: minimum tappable area ~44x44px via padding.

---

## 4. Asset Extraction (Images, Logos, Icons)

**Never leave a broken image path.** A rendered page with missing images
is a failed output, even if the HTML structure is correct.

- When using Figma MCP, **export the actual assets** (logos, photos,
  illustrations, icons) and save them to `assets/images/`. Use kebab-case
  descriptive filenames: `logo-positivus.svg`, `hero-illustration.png`,
  `team-photo-john.jpg`.
- **Icons and logos**: prefer SVG (inline `<svg>` for small UI icons
  that need color control via CSS; files in `assets/images/` for logos
  and illustrations).
- **Photos**: export as PNG/JPG/WebP at appropriate resolution.
- **If an asset cannot be exported** (MCP limitation, screenshot-only
  input, export failure):
  1. Create a placeholder with the **correct dimensions and shape**
     (CSS background or inline SVG rect) so the layout does not
     collapse.
  2. Mark it clearly: `<!-- TODO: export [description] from Figma -->`
  3. List all missing assets in the final response so the designer can
     export them manually.
- Never reference an image path that does not exist on disk.

---

## 5. CSS Rules and Token Integration

Output must connect to the shared `scss-core` design token system via
CSS custom properties, defined once in `assets/css/tokens.css`.

- **Never hardcode a color or spacing value that exists as a token.**
  Use `var(--color-primary)`, `var(--space-4)`, etc.
- If a design color doesn't match a token exactly, use the **closest
  token** and note it: `/* closest token match */`. If the design's
  palette genuinely differs from the default tokens (different brand),
  define the project palette **in tokens.css only**, following the same
  naming convention — never scatter raw hex values across files.
- **Class naming** — BEM with layer prefixes:
  - `c-` components (`c-button`, `c-card`, `c-hero`)
  - `o-` structural objects (`o-container`, `o-grid`)
  - `u-` utilities (`u-mt-4`, `u-text-center`)
- **No horizontal scrolling**: `box-sizing: border-box` universally; no
  fixed widths wider than the viewport; `max-width: 100%` on media.
- **Responsive**: mobile-first. Breakpoints: `sm` 480px, `md` 768px,
  `lg` 1024px, `xl` 1280px.

### CSS file separation

- `tokens.css` — CSS custom properties only. No selectors other than
  `:root`.
- `base.css` — reset + base element styles (typography, links).
- `components.css` — **all global/reusable components** (buttons, cards,
  navbar, footer, form controls, accordion, slider). Anything used on
  more than one page belongs here.
- `pages/[page].css` — layout and one-off styles specific to a single
  page. If a style is needed by a second page, move it to
  `components.css`.

---

## 6. Component States, Variants, and Interactivity

**Before implementing any interactive component, check its variants in
Figma.** Figma stores states (default/hover/active/expanded/collapsed/
disabled/error) as component variants readable via MCP. Implement all
states found — not just the one visible in the main frame.

- **Accordion/expandable items**: the expanded item and collapsed items
  have different indicators (e.g. minus vs plus icon) and often
  different backgrounds. Match each state to the correct variant — pay
  attention to which state shows which icon.
- **Sliders/carousels**: reproduce the design's actual slide layout
  (e.g. neighboring slides peeking at the edges, dot indicators, arrow
  buttons in the correct position and style). A slider must actually
  function — see JavaScript rules below.
- **Hover/transition**: write `:hover` and `transition` styles wherever
  the design shows interactive affordance. If no hover state exists in
  the design, apply a standard convention and mark it:
  `/* assumption: standard hover state, not shown in design */`

### Custom form controls

**Never ship browser-default radio buttons, checkboxes, or selects when
the design shows custom ones.** Style them to match the design using the
standard technique:

```css
.c-radio input[type="radio"] {
  appearance: none;
  /* custom size, border, background matching the design */
}
.c-radio input[type="radio"]:checked::after {
  /* custom checked indicator */
}
```

Keep them accessible: the real input must remain focusable and
keyboard-operable (`:focus-visible` styles required).

### JavaScript

Interactive components that require JS (sliders, tabs, mobile nav
toggle, accordion if not using `<details>`) get a JS file in
`assets/js/`:

- **Vanilla JavaScript only** — no jQuery, no external libraries.
- One shared `assets/js/main.js` for global components (nav, footer
  interactions); page-specific behavior may go in
  `assets/js/[page].js` if substantial.
- Progressive enhancement: the page must not look broken if JS fails —
  e.g. a slider shows its first slide, an accordion shows all content
  expanded or the first item open.
- JS behavior still belongs to the Manual QA Checklist — write it, but
  never claim it is verified.

---

## 7. Form and Data Security Rules

- **Unambiguously sensitive** fields (password, credit card, national
  ID): automatically apply `autocomplete="off"` or the appropriate
  value (e.g. `autocomplete="new-password"`).
- **Ambiguous** fields (e.g. "Member ID"): handle per the question
  policy in Section 9.

---

## 8. Output Format and Folder Structure

All output lives in the project's `output/` folder (or the folder the
user specifies) with this structure:

```
output/
├── index.html              # homepage
├── about.html              # one file per page, named after the page
├── contact.html
├── components.html         # living style guide (see below)
└── assets/
    ├── css/
    │   ├── tokens.css      # CSS custom properties only
    │   ├── base.css        # reset + base typography
    │   ├── components.css  # all global/reusable components
    │   └── pages/
    │       ├── home.css    # page-specific styles
    │       └── about.css
    ├── js/
    │   ├── main.js         # global interactive components
    │   └── [page].js       # page-specific behavior (if needed)
    └── images/
        ├── logo-[name].svg
        └── ...             # all exported assets, kebab-case names
```

- Every page links CSS in this order: `tokens.css` → `base.css` →
  `components.css` → `pages/[page].css`.
- No inline `<style>` blocks. No `style=""` attributes except for
  style-guide color swatches.
- HTML, CSS, and JS are always separate files.

### components.html — living style guide

A single page that displays every global component and design token in
one place, for team reference and visual consistency checks. Rules:

- It links **the exact same CSS files** as real pages — never its own
  duplicated styles. If a component changes in `components.css`, the
  style guide reflects it automatically.
- Required sections, in order:
  1. **Color palette** — one swatch per token, showing the CSS variable
     name and hex value.
  2. **Typography** — every heading level and body size in use.
  3. **Buttons** — every variant and state (default, hover note,
     disabled).
  4. **Form elements** — text input, textarea, select, custom radio,
     custom checkbox, with labels.
  5. **Cards** — every card type used on the site.
  6. **Interactive components** — accordion, slider/carousel, tabs,
     navigation, in their default state.
  7. **Footer** — the global footer component.
- Update this file **in the same task** whenever a global component is
  added or changed (see Section 2B).

---

## 9. When to Ask vs. When to Assume

**Ask the designer only when:**

- Ambiguity could meaningfully change the output's direction (e.g.
  whether a field counts as sensitive; unclear scope).
- The decision cannot be inferred from the design or existing patterns.

**Do not ask — assume and proceed when:**

- Ambiguity is minor (exact shade, minor spacing, an unshown hover
  state).
- A reasonable default exists with low cost if wrong.

**Always mark assumptions**: `<!-- assumption: ... -->` (HTML) or
`/* assumption: ... */` (CSS/JS).

Default to minimal questioning.

---

## 10. Manual QA Checklist (Append to Every Output)

These items **cannot be guaranteed by static code generation**. Never
present them as "done." Append this checklist at the end of every
generated output:

- [ ] All images and icons load correctly (no broken paths, no missing
      assets).
- [ ] Navigation between pages/sections behaves as expected in a real
      browser.
- [ ] All buttons, links, and interactive elements function correctly.
- [ ] Sliders/carousels advance, loop, and match the design's layout.
- [ ] Accordions expand/collapse with the correct icons per state.
- [ ] Custom radio buttons and checkboxes are selectable via mouse,
      touch, and keyboard.
- [ ] Layout is correct with nothing cut off across desktop, tablet,
      and mobile viewports.
- [ ] Hover effects, transitions, and animations behave as intended.
- [ ] All modals, dropdowns, and tooltips can be closed properly.
- [ ] `components.html` renders all components correctly and matches
      the real pages.

---

## Core Principles Summary

1. Prefer exact design specs (Figma MCP) over visual estimation; mark
   estimates clearly.
2. Export real assets — a page with broken images is a failed output.
3. Check Figma variants before implementing any interactive component;
   implement all states, not just the visible one.
4. Every color and spacing value traces to a token in `tokens.css`.
5. Global components live in `components.css` and are documented in
   `components.html` — both stay in sync with every change.
6. Custom-style all form controls shown as custom in the design.
7. Vanilla JS in separate files; progressive enhancement always.
8. Ask only when ambiguity is significant; otherwise assume and
   comment.
9. Never claim runtime behavior is verified — always hand off the
   manual QA checklist.
