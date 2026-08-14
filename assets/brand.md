# Bee brand — source of truth for all harness-repo visuals

Every visual asset in this repo (banners, diagrams, badges, social previews) uses this
system and nothing else. Generated from Bee's brand spec, 2026-08-14.

## Palette

| Name | Hex | Usage rule |
|---|---|---|
| INK | `#16130F` | Foreground. Dark-theme background. Badge label background. |
| PAPER | `#F4F1EC` | Background. Dark-theme foreground. |
| PERIWINKLE | `#5660F0` | Primary · interactive. Connectors, links, the source-of-truth block, separators. |
| ACID | `#D8FF3A` | Tag · status ONLY. Label chips, badges. Always with INK text. Never body text, never fills of large areas. |
| PINK | `#F056A0` | Accent · FILLS ONLY. Accent bars, the one top-level chip. Never as text color. |

Muted/secondary text: `#8B867C` (warm gray between INK and PAPER).

## Type

| Role | Face | Fallback stack (SVG-safe) |
|---|---|---|
| Display | Bricolage Grotesque | `"Bricolage Grotesque", "Helvetica Neue", Arial, sans-serif` — bold/800, tight (−1 letter-spacing) |
| Body | Figtree Regular 16/24 | `"Figtree", -apple-system, "Segoe UI", sans-serif` — hierarchy from weight and color before size |
| HUD / chrome | Fragment Mono | `"Fragment Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace` — eyebrows, tags, indices, chains, live data. Uppercase + letter-spacing. |

GitHub renders SVGs in `<img>` without webfonts, so declare the brand face first and let
the stack fall back; the fallback must still look intentional.

## Theme behavior

Assets ship in pairs (`*-light.svg` on PAPER, `*-dark.svg` on INK) and switch via
`<picture><source media="(prefers-color-scheme: dark)">`. Chip fills (ACID, PINK,
PERIWINKLE) are constant across themes — only INK/PAPER swap roles.

## Reference — bearodil.com (Bee's portfolio)

The living example of the system in use. What to take from it:

- **Both themes**, minimalist, high contrast — confirms the both-themes-always doctrine.
- **Signature motif:** glitch-doubled text (`LLooaaddiinngg`) — a playful distortion used
  sparingly as identity, not decoration. Candidate motif for harness visuals if a loading /
  in-progress state ever needs one.
- **Labels:** small uppercase tags with years ("WEB · 2024") — exactly the Fragment Mono
  eyebrow role. No heavy chip styling on the portfolio; chips in this repo stay because the
  harness map inherits them from Bee's own diagram.
- **Voice:** confident, not corporate — "turn complex, technical products into interfaces
  people understand", "design for users, with users", "AI-powered, human-made".

## Standing rules (learned)

- No invented palettes. If a new color feels needed, the answer is a different weight or
  opacity of these five.
- ACID text is always INK. PINK never carries text. PERIWINKLE text only on PAPER-colored
  labels inside a periwinkle fill.
- Mono everything that is a label, tag, or datum; display face only for the wordmark and
  headlines; prose in body face.
