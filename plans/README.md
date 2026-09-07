# Animation plans — Sankara Hill

Plans produced by the `improve-animations` skill. Each plan is self-contained:
an executor with no context from the originating conversation should be able to
follow one end to end.

Before executing a plan, confirm the code excerpts in its Problem section still
match the files on disk. If they do not, stop and report rather than improvising.

## Plans

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-smooth-parallax-and-motion-polish.md) | Add smooth image parallax and polish existing scroll motion | MEDIUM | DONE |
| [002](002-accommodations-motion-polish.md) | Polish accommodations scroll-driven motion | HIGH | DONE |
| [003](003-tactile-button-press-feedback.md) | Add tactile button press feedback | MEDIUM | DONE |
| [004](004-mobile-navbar-drawer-transition.md) | Smooth mobile navbar drawer transition | HIGH | DONE |
| [005](005-navbar-link-hover-interaction.md) | Add directional hairline hover indicator to navbar links | LOW | DONE |
| [006](006-villa-explore-link-hover-interaction.md) | Add hover micro-interaction to villa explore link | LOW | DONE |
| [007](007-loader-motion-polish.md) | Polish loader performance, pacing, and motion cohesion | HIGH | DONE |
| [008](008-hero-entrance-motion-polish.md) | Refine hero entrance motion and coordination | MEDIUM | DONE |
| [009](009-accommodations-split-text-polish.md) | Polish accommodations split-text animation | HIGH | DONE |

## Execution order

Recommended execution order:
1. **[009](009-accommodations-split-text-polish.md)** (HIGH) — Eliminates DOM allocations in rAF loop, batches measurement reflows, adds soft unmasking lead and orphan protection.
2. **[007](007-loader-motion-polish.md)** (HIGH) — Eliminates GPU reflows on hero expansion, tightens sequence to ~3.1s, syncs easing.
3. **[004](004-mobile-navbar-drawer-transition.md)** (HIGH) — Fixes teleporting state on mobile/tablet menu panel; highest structural leverage.
4. **[003](003-tactile-button-press-feedback.md)** (MEDIUM) — Adds immediate tactile press response to all primary CTAs across the site.
5. **[005](005-navbar-link-hover-interaction.md)** (LOW) — Refines desktop navigation polish with directional hairline underline.
6. **[006](006-villa-explore-link-hover-interaction.md)** (LOW) — Enhances villa discovery call-to-action micro-interaction.

Plans 003, 004, 005, and 006 have no mutual dependencies and can be executed independently or in sequence. All plans reuse existing tokens (`--ease-out`, `--transition-base`) defined in `output/assets/css/tokens.css`.

## Scope notes

Deliberately left out of current plans:
- **Reservations section background** — `.p-reservations` uses a CSS `background-image`; parallaxing requires structural markup refactor.
- **Scroll-triggered full-section fade** — Headings and editorial copy left un-animated to preserve instant readability and calm 5-star brand posture.
