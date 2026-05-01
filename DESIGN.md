# Design System — user-dashboard

This document is the canonical reference for the design tokens used in `hub.venerian.space`. All UI work in this repo should consume these tokens; no bespoke hex/oklch values in components.

## Token sources

All tokens live in `src/index.css` and are exposed to Tailwind v4 via the `@theme inline` block. There are three layers:

1. **Default** (`:root`) — shadcn neutral grayscale. Light mode default.
2. **Dark** (`.dark`) — shadcn neutral dark.
3. **Clinical** (`.theme-clinical` / `.theme-clinical.dark`) — Venera's branded teal+amber palette. Toggled via `useStyleTheme()` hook, persisted in localStorage under `venera-style-theme`.

Theme application is controlled by:
- `next-themes` for light/dark (`attribute="class"`, key `dark`)
- `useStyleTheme()` for default/clinical (adds `theme-clinical` class to `<html>`)

The two are orthogonal: you can have any combination of `{light, dark} × {default, clinical}` = four visual modes.

## Token catalogue

Every token is an `oklch()` value. Use the semantic name, never the raw value.

### Surfaces
| Token | Role |
|---|---|
| `--background` / `--foreground` | App-level base surface and text |
| `--card` / `--card-foreground` | Card and elevated surface |
| `--popover` / `--popover-foreground` | Popover, dropdown, dialog |
| `--sidebar` and `--sidebar-*` | Sidebar (dark in clinical light mode — Epic/Cerner pattern) |

### Intent
| Token | Role |
|---|---|
| `--primary` / `--primary-foreground` | Primary action — teal in clinical theme |
| `--secondary` / `--secondary-foreground` | Secondary action |
| `--accent` / `--accent-foreground` | Accent emphasis |
| `--muted` / `--muted-foreground` | De-emphasized surface and text |
| `--destructive` | Destructive action / error |

### Form & state
| Token | Role |
|---|---|
| `--border` | Default border |
| `--input` | Input field background |
| `--ring` | Keyboard focus ring (used by global `:focus-visible` fallback) |

### Charts
`--chart-1` through `--chart-5` — semantic chart series colors. Use these, not arbitrary palettes.

### Radius
| Token | Pixel (default) | Pixel (clinical) |
|---|---|---|
| `--radius-sm` | 6px | 8px |
| `--radius-md` | 8px | 10px |
| `--radius-lg` | 10px | 12px |
| `--radius-xl` | 14px | 16px |

Always use `rounded-sm/md/lg/xl` Tailwind utilities — they map to these tokens.

## Rules

1. **Never hardcode colors** in components. Always use a token via Tailwind class (`bg-card`, `text-muted-foreground`, `border-border`) or `var(--token)` in raw CSS.
2. **Never hardcode radii** — use `rounded-sm/md/lg/xl`.
3. **Use shadcn primitives** when one exists. Raw `<button>`, `<input>`, `<a>` should still be keyboard-accessible — the global `:focus-visible` rule in `index.css` provides a fallback ring, but prefer `<Button>` from `@/components/shadcn/button`.
4. **Respect `prefers-reduced-motion`** — `index.css` shortens transitions globally; do not override unless the animation is essential to functionality (rare). Avoid infinite decorative loops.
5. **Theme-test** — when adding a screen, verify it works in all four combinations: light/dark × default/clinical.

## Adding a new token

1. Add the variable to all four blocks in `src/index.css`: `:root`, `.dark`, `.theme-clinical`, `.theme-clinical.dark`.
2. If it's a color, expose it through `@theme inline` so Tailwind generates utilities.
3. Update this document.

## Accessibility floor

- All interactive elements must have a visible `:focus-visible` state. The global rule in `src/index.css` catches anything that lacks one.
- All decorative animation must respect `prefers-reduced-motion: reduce`. The global rule shortens to 0.01ms. Don't bypass.
- Body text against background should hit WCAG AA contrast (4.5:1). Token defaults are designed to pass — be careful when introducing custom muted shades.

## Out of scope

- The `sales-kit/` page in `api-hub` is dark-only marketing and does not share this system.
- The `admin-dashboard/` placeholder in `api-hub` is unused.
- Cross-repo token sharing is deferred until there's a second consumer that ships.
