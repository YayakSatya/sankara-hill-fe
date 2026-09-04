# Animation plans — Sankara Hill

Plans produced by the `improve-animations` skill. Each plan is self-contained:
an executor with no context from the originating conversation should be able to
follow one end to end.

This project is **not a git repository**, so plans carry a snapshot date instead
of a commit hash. Before executing a plan, confirm the code excerpts in its
Problem section still match the files on disk. If they do not, stop and report
rather than improvising.

## Plans

| # | Title | Severity | Status |
| --- | --- | --- | --- |
| [001](001-smooth-parallax-and-motion-polish.md) | Add smooth image parallax and polish existing scroll motion | MEDIUM | DONE |

## Execution order

Execute in ascending number. There is currently one plan and it has no
dependencies.

Plan 001 introduces the `--ease-out` and `--ease-in-out` tokens in
`output/assets/css/tokens.css`. Any future plan that needs a custom easing
curve should reuse those tokens rather than adding a parallel set, and should
therefore run after 001.

## Scope notes

Deliberately left out of plan 001, recorded here so a later plan can pick them
up rather than rediscover them:

- **Reservations section background** — `.p-reservations` uses a CSS
  `background-image`, so there is no element to transform. Parallaxing it needs
  a markup change (an absolutely positioned image layer behind the form), which
  is a larger structural edit than plan 001's "attributes only" boundary allows.
- **Image weight** — the source images are 1.5–6.1 MB each at 4–6K widths, with
  no `srcset`, no `sizes`, and no WebP/AVIF variants. Parallax makes this more
  noticeable because the browser recomposites large textures while scrolling.
  Worth its own plan; it is a performance concern, not an animation one.
- **Scroll-reveal on section entrances** — sections currently appear fully
  formed with no entrance motion. A `data-reveal` + IntersectionObserver system
  would suit the page, but it is additive rather than corrective and was left
  out to keep plan 001's diff reviewable.
