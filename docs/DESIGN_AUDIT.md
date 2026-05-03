# Design System Audit — user-dashboard

> Snapshot date: see git history
> Scope: every route under `src/routes/` (~40 pages), the sidebar, the dashboard layout, and shared widgets under `src/components/`. Token catalogue (`src/index.css`) is treated as out of scope per `DESIGN.md`.

This audit catalogues recurring UI patterns that drifted across the app and prescribes a migration plan. It pairs with a Phase-1 migration that already removed the highest-leverage drift.

---

## How to read this report

- **HIGH** — breaks brand consistency or violates `DESIGN.md` (raw colors, ad-hoc primitives, uncontrolled label casing).
- **MEDIUM** — looks careless side-by-side: subtle duplication that should be consolidated.
- **LOW** — cosmetic drift; safe to leave for a later sweep.
- File references use `path:line`. Class snippets are quoted verbatim so search-replace is direct.

A table of categories sits at the top so the migration plan and severity ranking can be scanned without reading the whole document.

---

## Category index

| # | Category | Severity | Distinct variants | Where it shows up |
|---|----------|----------|-------------------|-------------------|
| 1 | Demo page shell (`flex flex-col h-[calc(100vh-4rem)]`) | MEDIUM | 1 (28 copies) | every two-pane playground |
| 2 | Page description bar (`bg-muted/10` strip) | MEDIUM | 4 | bhxh-validator, ehr-converter, ehr-summary, medical-image, blood-panel, voice-transcribe |
| 3 | Toolbar between description and split | HIGH | 4 (right-only, left+right, embedded controls, missing) | bhxh, medical-image, blood-panel, voice-transcribe, ehr-converter, gene-decoder, cross-search |
| 4 | Two-pane split layout | HIGH | 1 (9 copies) | every two-pane demo |
| 5 | Right-pane empty state | HIGH | 4+ (icon-ring vs text-only, ad-hoc SVGs, varying gaps) | 21 routes |
| 6 | Primary CTA on demo pages | HIGH | 5 (full-width, default-width, h-7 ml-auto, dark pill, in-toolbar) | bhxh vs blood-panel vs ehr-summary vs voice-transcribe |
| 7 | Section/label casing (INPUT, Output, Description) | HIGH | 3 (`uppercase tracking-wider`, sentence case, Title Case) | every demo page |
| 8 | Action button labels for the same intent | HIGH | 4 (Load Example, Load Demo, Upload XML, Load Multi-Source Demo) | bhxh vs cross-search vs ehr-summary vs blood-panel |
| 9 | Internal navigation primitive | HIGH | 2 (`Link to=`, raw `<a href="#">` in breadcrumb) | dashboard-layout breadcrumb (single offender) |
| 10 | Toggle vs checkbox for booleans | MEDIUM | 2 (custom toggle in bhxh, raw `<input type=checkbox>` in voice-transcribe) | bhxh, voice-transcribe |
| 11 | Inline raw `<input>` / `<select>` styling | MEDIUM | 3 (`px-3 py-2 text-sm`, `px-3 py-1.5 text-sm`, `px-2 py-1 text-xs`) | blood-panel, cross-search, voice-transcribe, knowledge-base, gene-decoder, etc. |
| 12 | Arbitrary text sizes (`text-[10px]` … `text-[13px]`) | MEDIUM | 333 occurrences | nearly every demo page |
| 13 | Hardcoded hex colors in TS literals | HIGH | ~40 occurrences | architecture, api-reference, digital-twin, integration-dashboard, healthcare-dashboard |
| 14 | Info banner placement & color | MEDIUM | 3 (`bg-blue-50/40` in bhxh; none on blood-panel; ad-hoc amber in voice-transcribe) | bhxh, voice-transcribe |
| 15 | Footer attribution strip | LOW | 1 (3 copies, identical) | medical-image, blood-panel, voice-transcribe |
| 16 | Page heading scale (h2/h3/text-2xl) | MEDIUM | 4 (`text-4xl`, `text-2xl font-bold tracking-tight`, `text-lg font-semibold`, `text-sm uppercase`) | home vs login vs billing vs every demo |
| 17 | Color-coded chip status (severity, format) | HIGH | 6+ (BHXH severity, blood panel status, EHR format) | blood-panel, bhxh, ehr-summary |
| 18 | File dropzone | MEDIUM | 2 (`border-2 border-dashed rounded-lg p-6` in voice/medical-image; bespoke in dashboard-builder) | medical-image, voice-transcribe, dashboard-builder |
| 19 | Tab pattern (active=bottom-border vs active=bg) | MEDIUM | 2 | data-masking vs ehr-summary |
| 20 | "OR" divider on input pages | LOW | 1 (1 copy in voice-transcribe — fine, but if reused must be canonical) | voice-transcribe |

20 categories. ~10 are HIGH/blocking; the rest are MEDIUM/LOW.

---

## 1 · Demo page shell

**Severity: MEDIUM** — single repeated copy; trivial to extract.

Every two-pane demo opens with the same wrapper:

```tsx
<DashboardLayout pageTitle="...">
  <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
```

28 occurrences across `src/routes/*.tsx`. The literal `4rem` is the dashboard header height — if the header ever changes height, every demo silently breaks.

**Migration:** Phase 1 introduces `<DemoPageShell>` (`src/components/demo/demo-page-shell.tsx`) and replaces 6 of the 28 copies. Remaining 22 to migrate in Phase 2.

---

## 2 · Page description bar

**Severity: MEDIUM**

Six demo pages open with a near-identical "what this page does" strip:

```tsx
<div className="px-4 py-2 border-b bg-muted/10">
  <p className="text-xs text-muted-foreground">…</p>
</div>
```

Variants observed:

- `px-4 py-2` (most pages)
- `px-4 py-3` (bhxh-error-codes:67)
- Wrapped in extra flex container with action buttons on the right (patient-history:357)
- Skipped entirely (data-masking, gene-decoder)

**Files:**
- `src/routes/bhxh-validator.tsx:176`
- `src/routes/medical-image.tsx:123`
- `src/routes/blood-panel.tsx:187`
- `src/routes/voice-transcribe.tsx:291`
- `src/routes/ehr-converter.tsx:201`
- `src/routes/ehr-summary.tsx:506`

**Migration:** Phase 1 extracts `<DemoPageDescription>` and migrates 6 demo pages. Optional `infoBanner` slot lets bhxh-validator keep its blue link strip without the consumer wiring its own border.

---

## 3 · Toolbar between description and split

**Severity: HIGH** — same toolbar conceptually, four different DOM patterns.

| Pattern | File | Notes |
|---|---|---|
| Right-only `ViewCodeDialog`, `justify-end px-4 py-1.5 border-b` | bhxh-validator:211, medical-image:130, data-masking:96, knowledge-base:168 | Most common |
| Both sides `justify-between px-4 py-1.5 border-b` | blood-panel:194, gene-decoder:126, cross-search:125 | Adds preset switcher on the left |
| Left controls embedded in description bar | voice-transcribe:298 | Different padding; mixes labels and `ViewCodeDialog` |
| Toolbar is part of the right pane header (`bg-muted/30`) | ehr-converter:222, ehr-summary:516 | Different background; toolbar lives below the split, not above it |

**Migration:** Phase 1 introduces `<DemoToolbar start={…} end={…} />` and replaces it on 5 pages. ehr-converter's "toolbar inside output pane" stays — it serves a slightly different role (output header rather than page-level toolbar).

---

## 4 · Two-pane split layout

**Severity: HIGH** — every copy is byte-identical, but they're nine independent copies and any future change has to be made nine times.

```tsx
<div className="flex-1 grid grid-cols-1 lg:grid-cols-2 overflow-hidden border-b">
  <div className="border-r flex flex-col overflow-hidden">…left…</div>
  <div className="flex flex-col overflow-hidden">…right…</div>
</div>
```

**Files (all byte-identical):**
- bhxh-validator:222
- ehr-converter:209
- medical-image:138
- voice-transcribe:364
- blood-panel:224
- data-masking:106
- knowledge-base:194
- gene-decoder:153
- cross-search:147

**Migration:** Phase 1 introduces `<DemoSplitLayout left={…} right={…} />`. Migrated in 6 pages. Three remaining (knowledge-base, gene-decoder, cross-search) — empty-state pieces already extracted; the layout wrappers can move in Phase 2.

---

## 5 · Right-pane empty state

**Severity: HIGH** — the worst offender. 21 distinct copies, multiple variants:

### Variant A — icon ring + text + optional hint (most common)

```tsx
<div className="flex-1 flex items-center justify-center p-8">
  <div className="text-center space-y-3 max-w-sm">
    <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
      <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5">…inline path…</svg>
    </div>
    <p className="text-sm text-muted-foreground">…</p>
  </div>
</div>
```

10 occurrences. Each one re-implements the inline SVG (DESIGN.md mandates Lucide icons; raw SVGs slip through).

### Variant B — text only (no icon)

`ehr-summary:883`, `ehr-summary:557` — same wrapper but no icon ring. Hint text uses `text-[11px]` (arbitrary size).

### Variant C — same shape, different gap

`a2ui-playground:281`, `digital-twin:1250` — drift in `space-y` and `max-w`.

### Variant D — wrapper with `min-h-[60vh]`

`ehr-overview:860` — adds extra vertical centering not present in others.

**Migration:** Phase 1 introduces `<DemoEmptyState icon={LucideIcon} description={…} hint={…} />` and migrates 9 pages: bhxh-validator, ehr-converter, ehr-summary (×2), medical-image, voice-transcribe, blood-panel, data-masking, gene-decoder, knowledge-base, cross-search. All inline SVGs replaced with Lucide imports — `ShieldCheckIcon`, `ImageIcon`, `MicIcon`, `DropletIcon`, `EyeOffIcon`, `DnaIcon`, `DatabaseIcon`, `SearchIcon`, `ChevronRightIcon`.

---

## 6 · Primary CTA on demo pages

**Severity: HIGH** — the single most visible inconsistency.

| Style | File:line | Class string |
|---|---|---|
| Full-width default `<Button>` | blood-panel:312, voice-transcribe:412, medical-image:192 | (no extra classes) |
| Default `<Button>` (auto-width) | bhxh-validator:298, ehr-converter:via ConverterForm | Same component, but visually narrower because no `w-full` |
| `<Button>` with `h-8 text-xs ml-auto` | ehr-summary:751, patient-history:395, dashboard-builder:367 | Pushed to right via `ml-auto`, smaller height |
| Custom dark pill (manual) | digital-twin:594 | h-7 + custom palette |
| Toolbar-embedded `Button size="sm"` | gene-decoder:128 | Full button is the toolbar |

This is what the user noticed first when scrolling through demos — `Validate` (default-width black), `Mask Data` (default), `Analyze Blood Panel` (full-width), `Summarize 0 Source(s)` (small h-8 pushed right), and `Load Demo Patient` (custom).

**Migration plan (Phase 2):** pick one canonical CTA shape per pane type:
- "Submit" CTA inside the input pane footer → use default `<Button>` (h-9), `className="w-full"`.
- "Submit" CTA inside the toolbar → use `<Button size="sm">` (h-8), no `ml-auto` — let `<DemoToolbar>` justify it.
- "Submit" CTA inside an output pane footer → use `<Button size="sm">`, right-aligned by parent.
- Stop using ad-hoc `h-7 text-xs` on pages that already have `<DemoToolbar>` because the toolbar hands them consistent height.

---

## 7 · Section / label casing

**Severity: HIGH** — same intent rendered three different ways.

| Casing | Class | Where |
|---|---|---|
| `UPPERCASE TRACKING-WIDER` | `text-[11px] font-semibold uppercase tracking-wider` or `text-sm font-semibold uppercase tracking-wider` | ehr-converter (Output), ehr-summary (EHR Sources, Output), document-to-fhir, federated-learning |
| Sentence case | `text-sm font-medium` | bhxh-validator (BHXH 4210 XML Input), blood-panel (Marker Details), medical-image (Description, Findings) |
| Title Case | `text-sm font-medium` | medical-image (Suggested Diagnoses), ehr-summary (Clinical Summary, Merged FHIR R4) |

The same component (a section header) shifts casing within a single page. blood-panel:336 has "Summary" (sentence) but blood-panel:347 has "Flags" (sentence) and blood-panel:360 "Marker Details" (Title) — three styles in one column.

Sidebar group labels are `text-[11px] font-bold uppercase tracking-widest` (app-sidebar:282) — that's a fourth distinct treatment.

**Migration plan (Phase 2):** lock down two roles only.
- **Eyebrow header** (above a section) — uppercase `text-[11px] font-semibold tracking-wider`. Use it for "OUTPUT", "INPUT", "EHR SOURCES", "QUICK ACCESS".
- **Inline label** (above a field or block) — sentence case `text-sm font-medium`. Use it for "Description", "Findings", "Summary".
- Title Case ("Suggested Diagnoses", "Marker Details") should be retired — convert to sentence case.

---

## 8 · Action button labels for the same intent

**Severity: HIGH**

The "load a sample input" affordance is labelled inconsistently:

- `Load Example` — bhxh-validator:266, data-masking:117, gene-decoder:168, symptom-checker:169, clinic-search:172, wearable-data:530
- `Load Demo` — cross-search:156
- `Load Demo Patient (ID: 1)` — digital-twin:1268
- `Load Multi-Visit Demo` — patient-history:345
- `Load Multi-Source Demo (3 facilities)` — ehr-summary:570
- `Load Example (Patient 1)` — ehr-overview:881
- `Load Example Data` — health-score:518

The "upload" affordance:

- `Upload XML` — bhxh-validator:255
- `Upload EHR` — rx-advisor:224, ehr-summary:535
- `Upload EHR File(s) (txt, xml, json, pdf, image)` — ehr-summary:578

**Migration plan (Phase 2):** standardize to:
- `Load example` (sentence case, no parens) — single sample.
- `Load demo` — multi-record / fixture set.
- `Upload` — when the file type is implied by context.
- `Upload XML` / `Upload audio` — when the extension matters; keep capitalization sentence case.

---

## 9 · Internal navigation primitive

**Severity: HIGH** — direct DESIGN.md violation.

Every other internal link is `<NavLink to>` or `<Link to>` (react-router-dom). The single offender was `dashboard-layout.tsx:48`:

```tsx
<BreadcrumbLink href="#">My Project</BreadcrumbLink>
```

This causes a hard reload and loses SPA state.

**Migration:** Phase 1 fixed this — `BreadcrumbLink` now wraps `<Link to="/">` via `asChild`.

External links (`href="https://…"` for Google OAuth) are correct as-is. No other `<a href="/">` exists in the route or component tree (verified via grep).

---

## 10 · Toggle vs checkbox

**Severity: MEDIUM**

Same boolean-input intent, two different controls:

- bhxh-validator:228 — custom CSS pill toggle (39px wide, animated knob) for "Strict mode"
- voice-transcribe:324, 336, 348 — raw `<input type="checkbox">` for Denoise / Enhance / Translate

The voice-transcribe checkboxes are not styled — they fall through to browser default and look completely out of place against the rest of the chrome.

**Migration plan (Phase 2):** Add a `<Switch>` shadcn primitive (currently missing — `components.json` only has `accordion`/`avatar`/etc.). Replace both patterns. Keep `<input type="checkbox">` only for table-row multi-select.

---

## 11 · Inline raw `<input>` / `<select>` styling

**Severity: MEDIUM**

Three distinct input "sizes" via raw classes:

| Size class | Files |
|---|---|
| `rounded-md border px-3 py-2 text-sm bg-background` | knowledge-base:204/209/223, ehr-overview:383, gene-decoder:180, data-masking:125, bhxh-validator:283 |
| `rounded-md border px-3 py-1.5 text-sm bg-background` | cross-search:164/170/176, blood-panel:241/255 |
| `rounded-md border px-2 py-1 text-xs bg-background` | voice-transcribe:313 |

shadcn `Input` (`src/components/shadcn/input.tsx`) exists and matches the first variant. It's used in login/register but ignored in the demo pages. Likewise `Select` is missing entirely from `src/components/shadcn/`.

**Migration plan (Phase 2):**
- Add `Select` shadcn primitive.
- Migrate every demo `<input className="rounded-md border…">` to `<Input>` from `@/components/shadcn/input`.
- The third "compact" size (`text-xs px-2 py-1`) is only used in voice-transcribe's language picker — collapse onto `<Select>` once it exists.

---

## 12 · Arbitrary text sizes

**Severity: MEDIUM**

333 instances of `text-[10px]` … `text-[13px]` across `src/routes/`. Half of these are clustered around chips and footnotes.

The standard Tailwind scale offers `text-xs` (12px), `text-sm` (14px). The arbitrary values are filling a legitimate gap (10/11px for chip labels) but each consumer picked a slightly different value.

**Migration plan (Phase 2):**
- Add a project-level `text-2xs` utility (10px) and `text-tiny` (11px) — or settle on a single sub-12 size and use it everywhere.
- Sweep `text-[10px]` → canonical, `text-[11px]` → canonical, drop `text-[13px]` (use `text-sm`).

---

## 13 · Hardcoded hex colors in TS literals

**Severity: HIGH** — direct DESIGN.md violation.

DESIGN.md rule 1: *"Never hardcode colors in components."* Several routes ignore this:

- `architecture.tsx`: 8 layer colors (`#6366f1`, `#0ea5e9`, …) used for SVG fills and Mermaid diagrams.
- `api-reference.tsx`: 7 category colors used as left-rail accents.
- `digital-twin.tsx`: 7 risk-level colors and inline gradient stops.
- `integration-dashboard.tsx:582`: `bg-[radial-gradient(circle,_rgba(0,0,0,0.04)_…)]` — a literal rgba in an arbitrary class.

Mermaid diagrams in `architecture.tsx:491` are a special case (Mermaid takes inline color strings) — those are defensible. The Tailwind tokens (`text-blue-500/10` etc.) used elsewhere are fine because they pass through Tailwind's `oklch` stack.

**Migration plan (Phase 2):**
- For SVG diagrams that need stable distinct colors → expose `--chart-1` … `--chart-5` (already in DESIGN.md catalogue) and read via `getComputedStyle(document.documentElement)`.
- For category/risk colors → introduce 6 new semantic tokens (`--severity-low`, `--severity-medium`, `--severity-high`, `--severity-critical`).

---

## 14 · Info banner placement & color

**Severity: MEDIUM**

bhxh-validator has a blue strip linking to its error-code reference (lines 183-209). It's the only page with a styled info banner. voice-transcribe has an inline amber strip for mic permission errors (lines 429-438) — same intent, different palette, different placement (in the input column rather than at the top).

**Migration plan (Phase 2):**
- Build `<InfoBanner intent="info|warning|error">` once.
- Use it for both bhxh-validator's blue link strip and voice-transcribe's amber permission notice.

---

## 15 · Footer attribution strip

**Severity: LOW**

Three pages have a tiny "Powered by …" footer:

```tsx
<div className="px-4 py-1.5 border-t bg-muted/10 text-[10px] text-muted-foreground text-center">
  Powered by …
</div>
```

medical-image:359, blood-panel:424, voice-transcribe:606. Identical class string. Could be `<DemoFootnote>` in Phase 2 — low value, just leave as is until something else touches these files.

---

## 16 · Page heading scale

**Severity: MEDIUM**

| Pattern | File | Class |
|---|---|---|
| `text-4xl font-bold tracking-tight` | login:78, register:70 | Auth pages |
| `text-2xl font-bold tracking-tight` | home:127 | Landing |
| `text-lg font-semibold` | billing:39, 67 | Section headers |
| `text-sm font-semibold uppercase tracking-wider` | ehr-converter:223, ehr-summary:517 | Demo "section eyebrows" |
| `pageTitle="…"` (rendered via Breadcrumb) | every demo route | Page chrome title |

The 4xl/2xl/lg shift is normal for landing/auth/dashboard hierarchy. The problem is each demo page has zero visible h1 — only a breadcrumb crumb — and then re-introduces a small uppercase header for "OUTPUT" or "EHR SOURCES" that isn't a heading at all. There's no consistent h1 → h2 → h3 chain.

**Migration plan (Phase 2):** Define a typographic scale doc (in DESIGN.md or a separate `TYPOGRAPHY.md`):
- h1 = `text-4xl font-bold tracking-tight` (auth landings only).
- h2 = `text-2xl font-bold tracking-tight` (dashboard home, billing, settings).
- h3 = `text-lg font-semibold` (sections within a page).
- Eyebrow = `text-[11px] font-semibold uppercase tracking-wider text-muted-foreground` (above a region).
- Field label = `text-sm font-medium`.
- Audit every page against this scale — particularly the demo pages, which today use the eyebrow style for what should be h3.

---

## 17 · Color-coded chip status

**Severity: HIGH** — same logical concept (severity → color), three private implementations.

- blood-panel:38 — `statusColor()` maps CRITICAL/HIGH/LOW/BORDERLINE/NORMAL to red/amber/green using inline class strings.
- bhxh-validator:163 — `severityColor()` maps error/warning/info similarly.
- bhxh-error-codes:14 — `XML1`–`XML15` maps XML type to chip color.
- ehr-summary:18 — `FORMAT_COLORS` maps HL7v2/CDA/FHIR/BHXH to chip color.

Each one re-derives colors from raw Tailwind palette classes (`bg-red-100`, `text-red-800`, `dark:bg-red-900/30`). Drift is already visible — blood-panel uses `border border-red-300`, bhxh uses no border.

**Migration plan (Phase 2):**
- Build a single `<StatusChip status="critical|high|medium|low|normal|info">` primitive with a closed enum and consistent borders.
- Build `<FormatChip format="HL7v2|CDA|FHIR|BHXH4210">` for codec labels.
- Lift these to `src/components/chips/`.

---

## 18 · File dropzone

**Severity: MEDIUM**

Two byte-identical:
- medical-image:144 — `border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50`
- voice-transcribe:371 — same.

One bespoke:
- dashboard-builder:287 — uses `border-2 border-dashed` plus `${dragIdx === idx ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-muted-foreground/40"}` for drag-state. No drag handlers on the medical-image / voice-transcribe ones.

**Migration plan (Phase 2):**
- Build `<FileDropzone accept onFiles>` with optional drag-state.
- Replace medical-image, voice-transcribe, dashboard-builder.

---

## 19 · Tab pattern

**Severity: MEDIUM**

Two active-state styles:

- data-masking:154 — active = `border-b-2 border-primary text-foreground`, inactive = `text-muted-foreground hover:text-foreground`.
- ehr-summary:805 — same shape, but uses `text-primary` for active text.
- bhxh-validator (post-user-edit) — uses Button-style toggle.

**Migration plan (Phase 2):** Pick one — `border-b-2` underline tab. Lift into `<DemoTabs>` next to `<DemoSplitLayout>`.

---

## 20 · "OR" divider

**Severity: LOW**

`voice-transcribe:419` has a single `<div>` with line + "OR" + line. Only one occurrence; not worth extracting until a second consumer appears.

---

## Token gaps

DESIGN.md rule 1 says "never hardcode colors" but the audit found:

- 40+ inline hex strings (category 13) for diagram fills, severity colors, gradient stops.
- 1 raw `rgba()` in an arbitrary class (`integration-dashboard.tsx:582`).
- Severity scale (critical/high/medium/low/normal) implemented privately on three pages without semantic tokens.
- Format chip colors (HL7v2/CDA/FHIR/BHXH) with no `--format-hl7v2` token.
- Sub-`text-xs` font-size scale unsupported — every page invents `text-[10px]` and `text-[11px]`.

Recommended additions to `src/index.css` (out of scope for Phase 1, but prerequisite for category 13 + 17):

```css
/* Severity */
--severity-critical: var(--destructive);
--severity-high: oklch(0.65 0.20 25);   /* deep amber-red */
--severity-medium: oklch(0.78 0.18 75); /* amber */
--severity-low: oklch(0.72 0.16 145);   /* green */

/* Diagram fills (per layer) — wired through chart-1..5 plus 3 new */
--chart-6: oklch(0.65 0.18 305); /* violet */
--chart-7: oklch(0.55 0.20 25);  /* red-orange */
--chart-8: oklch(0.60 0.10 220); /* slate-blue */
```

---

## Migration plan

### Phase 1 — applied (this PR)

The Phase-1 set was chosen for highest leverage / lowest risk:

1. **`<DemoPageShell>`** — wraps the `flex flex-col h-[calc(100vh-4rem)]` shell. Migrated 6 demo pages.
2. **`<DemoPageDescription>`** — replaces the muted strip + paragraph. Migrated 6 pages. Optional `infoBanner` slot keeps bhxh's link strip working.
3. **`<DemoToolbar start end>`** — collapses the 4 distinct toolbar shapes into one. Migrated 5 pages (bhxh-validator, medical-image, blood-panel, voice-transcribe, data-masking).
4. **`<DemoSplitLayout left right>`** — replaces the duplicate split. Migrated 6 pages.
5. **`<DemoEmptyState icon description hint>`** — eliminates 9 hand-rolled empty-state implementations and replaces all of their inline SVGs with Lucide icons. Migrated bhxh-validator, ehr-converter, ehr-summary (×2), medical-image, voice-transcribe, blood-panel, data-masking, gene-decoder, knowledge-base, cross-search.
6. **Breadcrumb fix** — `dashboard-layout.tsx` now uses `<Link to="/">` via `BreadcrumbLink asChild` instead of `href="#"`. Eliminates the only internal-anchor offender in the app.

Net: ~250 lines of duplicated layout/markup removed; 5 new components live in `src/components/demo/`. No tokens added. No tokens changed.

### Phase 2 — proposed (next PR)

Ordered by leverage:

| # | Item | Effort | Notes |
|---|------|--------|-------|
| 2.1 | Migrate remaining 22 `flex flex-col h-[calc…]` shells onto `<DemoPageShell>` | S | mechanical |
| 2.2 | Replace inline `<input className="rounded-md border…">` with shadcn `<Input>` | M | adds shadcn `<Select>` if needed |
| 2.3 | Build `<StatusChip>` and `<FormatChip>`, sweep blood-panel, bhxh, ehr-summary | M | retires `statusColor()` and `severityColor()` |
| 2.4 | Build `<InfoBanner intent>`; sweep bhxh + voice-transcribe | S | |
| 2.5 | Standardize CTA: pick canonical sizes per pane role and sweep | M | needs a short style note |
| 2.6 | Add `<Switch>` primitive; replace bhxh toggle + voice-transcribe checkboxes | M | also retroactively fixes other future booleans |
| 2.7 | Define typographic scale; sweep page headings | M | requires DESIGN.md or TYPOGRAPHY.md update |
| 2.8 | Standardize action button labels per category 8 | S | text-only sweep |

### Phase 3 — token work (gated on owner approval)

| # | Item | Effort | Notes |
|---|------|--------|-------|
| 3.1 | Add `--severity-*` tokens, sweep architecture / api-reference / digital-twin hex literals | L | requires editing `src/index.css` (out of scope per DESIGN.md until approved) |
| 3.2 | Add `--chart-6/7/8` for the 3rd-party color needs | M | same |
| 3.3 | Add 10/11px text utilities | S | same |

---

## What we deliberately did *not* touch in Phase 1

- **Sidebar layout / structure** — complex, working, would benefit from a dedicated PR. The sidebar is currently consistent within itself; the issue is its eyebrow style (`text-[11px] font-bold uppercase tracking-widest`) doesn't match the demo pages' eyebrow style (`text-[11px] font-semibold uppercase tracking-wider`). Resolving this is part of category 7's Phase-2 sweep.
- **Tokens in `src/index.css`** — hard rule per DESIGN.md. All Phase-1 components consume existing tokens only.
- **`api-flow-builder.tsx` / `digital-twin.tsx` / `healthcare-dashboard.tsx`** — large bespoke pages that don't share the demo shell. Their internal inconsistencies (cards, charts, status pills) are scoped under categories 12/13/17 and addressed in Phase 2/3.
- **Mermaid color literals in `architecture.tsx`** — Mermaid takes raw color strings; pulling these through tokens needs a runtime read of CSS vars (Phase 3).
- **Login / register hard-coded layouts** — they intentionally diverge from the dashboard chrome (no sidebar, centered card). Their internal inconsistency is minimal; deferred.
