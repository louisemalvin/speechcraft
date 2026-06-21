# UI Unit B: Reusable Base Components — Task Specification

## Source Artifacts / Handoff Context

- **Planning handoff**: `.ai/tasks/1719001000-ui-components/planning-handoff.md` (canonical)
- **Source pages** (patterns to extract):
  - `packages/frontend/src/app/page.tsx` — viewer page: buttons (ghost, primary, secondary-outline), cards (default, accent, segment), status dots (live-green-pulse, disconnected-red), inline SVGs (Headphones, Gear, Microphone, Close/X, ChevronDown)
  - `packages/frontend/src/app/speaker/page.tsx` — speaker page: buttons (primary-filled, secondary-outline, circular-play/stop), cards (default, accent-indigo, error-red), status dots (live-green-pulse, ready-slate, subtitle-slate/indigo), inline SVGs (Lock, ErrorTriangle, UnlockArrow, Play, Stop, Microphone)
- **Design tokens**: `packages/frontend/src/app/globals.css` — currently minimal (`--background`, `--foreground`, `--font-sans`, `--font-mono`). Unit A design tokens are assumed but may not be complete (see Open Questions).
- **Project conventions**: `.ai/context.md` — PascalCase React component filenames, named exports preferred, TypeScript strict mode, Tailwind CSS for styling, `'use client'` for interactive components.
- **This unit's role**: Building blocks. Unit C will refactor pages to consume these. No page changes in this unit.

---

## Scope

Create **four reusable, typed React components** under a new directory `packages/frontend/src/components/`. Each component is self-contained in its own `.tsx` file with a named export.

### 1. `Button.tsx`

A polymorphic button component supporting variants, sizes, icons, and all standard HTML button attributes.

**File**: `packages/frontend/src/components/Button.tsx`

**Props interface**:
```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  iconLeft?: React.ReactNode;   // rendered before children
  iconRight?: React.ReactNode;  // rendered after children
}
```

**Variant styles** (extracted from source pages):
| Variant | Appearance | Source examples |
|---------|-----------|-----------------|
| `primary` | Filled indigo background (`bg-indigo-600`), white text, indigo hover (`hover:bg-indigo-500`), rounded-lg/rounded-xl/rounded-full (size-dependent) | "Unlock Console" (speaker), "Scroll to bottom" (viewer), Start/Stop Broadcast (speaker) |
| `secondary` | Slate background (`bg-slate-800` or `bg-slate-950`), slate border (`border-slate-700/50`), slate text (`text-slate-400`), hover to lighter slate | Font size toggles, Theme toggles, Lock Console (speaker) |
| `ghost` | Transparent background, slate text (`text-slate-400`), hover to visible bg (`hover:bg-slate-800`) + light text (`hover:text-slate-200`) | TTS toggle, Settings gear, Close X, Dismiss greeting |

**Size styles**:
| Size | Padding | Border radius | Font | Min height |
|------|---------|--------------|------|-----------|
| `sm` | `px-2 py-1` or `p-1.5` | `rounded-lg` | `text-xs` | ≥48px |
| `md` | `px-4 py-2` or `p-2` | `rounded-lg` | `text-sm` | ≥48px |
| `lg` | `px-6 py-3` or `w-full` | `rounded-xl` | `text-base font-semibold` | ≥48px |

**Additional behavior**:
- All sizes must have `min-h-[48px]` for mobile touch targets (per constraint).
- `active:scale-[0.98]` press feedback on all variants.
- `transition-colors` (or `transition-all duration-200`) for smooth state changes.
- `aria-label` passed through from props.
- Spread `...rest` onto the `<button>` element (excluding variant/size/iconLeft/iconRight from spread).
- Icon-only buttons (children absent, only iconLeft/iconRight present): apply `p-2 rounded-lg` size-like defaults; the component should detect icon-only mode and adjust padding accordingly.
- `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500` for keyboard accessibility.

### 2. `Card.tsx`

A wrapper container for grouped content.

**File**: `packages/frontend/src/components/Card.tsx`

**Props interface**:
```ts
interface CardProps {
  variant?: 'default' | 'accent' | 'error';
  padding?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  className?: string;
}
```

**Variant styles** (extracted from source pages):
| Variant | Background | Border | Source examples |
|---------|-----------|--------|-----------------|
| `default` | `bg-slate-900/80` (or `/50`, `/60`) | `border border-slate-800/50` | Segment cards (viewer), PIN gate (speaker), Transcript panel (speaker), Settings drawer |
| `accent` | `bg-indigo-500/10` (or `bg-indigo-950/15`) | `border border-indigo-500/20` (or `border-indigo-900/35`) | Greeting banner (viewer), Translation panel (speaker) |
| `error` | `bg-red-900/50` | `border border-red-500` | Error banner (speaker) |

**Padding values**:
| Padding | Classes |
|---------|---------|
| `sm` | `px-3 py-2` |
| `md` | `px-4 py-3` |
| `lg` | `p-5` |

**Radius**: All variants use `rounded-lg` (or `rounded-xl` for larger cards). Default to `rounded-lg`.

**Additional behavior**:
- Accept `className` for overrides/merging.
- No default `aria-*` needed (semantic `<div>` or `<section>` wrapper is fine).
- `backdrop-blur-md` only when appropriate — not needed for the base Card; consumers (Unit C) add it via `className`.

### 3. `StatusDot.tsx`

A small colored circle with animation for conveying connection/liveness state.

**File**: `packages/frontend/src/components/StatusDot.tsx`

**Props interface**:
```ts
interface StatusDotProps {
  state: 'live' | 'idle' | 'error';
  label?: string;    // optional text label next to the dot
  className?: string;
}
```

**State styles** (extracted from source pages):
| State | Dot color | Animation | Glow | Source examples |
|-------|-----------|-----------|------|-----------------|
| `live` | `bg-green-500` (or `bg-green-400`) | `animate-pulse` | `shadow-[0_0_8px_rgba(34,197,94,0.6)]` | "LIVE" indicator (viewer), "LIVE BROADCAST" (speaker) |
| `idle` | `bg-slate-600` (or `bg-slate-500`) | none (static) | none | "READY TO START" (speaker), Subtitle dots (speaker) |
| `error` | `bg-red-500` | none (static) | none | Disconnected state (viewer) |

**Dot dimensions**: `w-2.5 h-2.5` (10px) for standalone, `w-2 h-2` (8px) for inline-with-text. Default to `w-2.5 h-2.5`. Shape: `rounded-full`.

**Additional behavior**:
- When `label` is provided, render a flex row: dot + `<span className="text-xs font-medium text-slate-400 uppercase tracking-wider">` wrapping the label.
- Wrap the dot+label in a `<div aria-label={state}>` for screen readers.
- Accept `className` for external overrides.

### 4. `Icon.tsx`

A single component rendering SVG icons by name, eliminating 10+ copy-pasted inline SVGs across the codebase.

**File**: `packages/frontend/src/components/Icon.tsx`

**Props interface**:
```ts
interface IconProps {
  name: 'Microphone' | 'Play' | 'Stop' | 'Lock' | 'Settings' | 'Headphones' | 'ChevronDown' | 'Close' | 'UnlockArrow';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}
```

**Size mapping**:
| Size | Width/height | Use case |
|------|-------------|----------|
| `sm` | 16px (`w-4 h-4`) | Inline in buttons, small dismiss X |
| `md` | 20px (`w-5 h-5`) | Standard icon buttons (TTS, Settings, Lock) |
| `lg` | 28px+ (`w-7 h-7` or larger) | Large buttons (Start/Stop), empty state microphone |

**Icon sources** (all from source pages — exact SVG paths as found):

| Icon name | Source file | SVG path elements |
|-----------|------------|-------------------|
| `Microphone` | `page.tsx:226-241` | `<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/>` (with `width=28 height=28 viewBox="0 0 24 24"`) |
| `Play` | `speaker/page.tsx:236-239` | `<path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>` |
| `Stop` | `speaker/page.tsx:227-230` | `<path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/><path d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/>` |
| `Lock` | `speaker/page.tsx:80-82` | `<path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>` |
| `Settings` | `page.tsx:201-214` | `<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 ... z"/>` (gear icon, full path in source) |
| `Headphones` | `page.tsx:177-191` | `<path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 010 14.14"/><path d="M15.54 8.46a5 5 0 010 7.07"/>` |
| `ChevronDown` | `page.tsx:321-333` | `<polyline points="6 9 12 15 18 9"/>` |
| `Close` | `page.tsx:266-279` | `<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>` |
| `UnlockArrow` | `speaker/page.tsx:131-133` | `<path d="M13 5l7 7-7 7M5 5l7 7-7 7"/>` |

**SVG wrapper properties** (common to all icons):
```tsx
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth={2}      // except Microphone uses 1.5
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"
>
```

**Implementation approach**: Use a `switch` statement or an object map that returns the appropriate SVG markup for each `name`. This is the simplest approach given the small number of icons and avoids external dependencies.

**Additional behavior**:
- Accept `className` for external styling (merges with size classes).
- Default size: `md` when not specified.

---

## Execution

### Pipeline

```
implementer → validator
```

1. **Implementer**: Creates the 4 component files with all variants/sizes/states as specified. Passes `pnpm --filter frontend build` before handoff to validator.
2. **Validator**: Confirms all acceptance criteria are met. Runs the build. Verifies TypeScript compiles cleanly, all variants render logically from prop-to-className mappings, and SVG paths match the source pages exactly.

### File checklist

| File | Action |
|------|--------|
| `packages/frontend/src/components/Button.tsx` | CREATE |
| `packages/frontend/src/components/Card.tsx` | CREATE |
| `packages/frontend/src/components/StatusDot.tsx` | CREATE |
| `packages/frontend/src/components/Icon.tsx` | CREATE |

No existing files are modified. No pages are touched (that is Unit C).

---

## Non-Goals

- **No page refactoring**: Do not modify `page.tsx` or `speaker/page.tsx`. Unit C handles this.
- **No composite components**: PinGate, SettingsDrawer, SegmentCard, VolumeVisualizer, broadcast start/stop composite — all belong to Unit C.
- **No behavior changes**: Components must match existing visual output exactly (same colors, same radii, same hover/press effects, same animations).
- **No tests in this unit**: Test specifications are deferred. The validator confirms compilation and correctness.
- **No barrel file**: An `index.ts` barrel re-export can be added when Unit C is ready to import, but it is not required here.

---

## Testable Acceptance Criteria

1. **All 4 component files exist** at `packages/frontend/src/components/Button.tsx`, `Card.tsx`, `StatusDot.tsx`, `Icon.tsx`.
2. **Button renders all 3 variants × 3 sizes**: `variant="primary"|"secondary"|"ghost"` combined with `size="sm"|"md"|"lg"` produces distinct, correct className strings. Icon-only mode (no children, one or both icon props) renders correctly.
3. **Card renders all 3 variants**: `variant="default"|"accent"|"error"` produces correct background + border classes. All 3 padding values (`sm`/`md`/`lg`) produce correct padding classes.
4. **StatusDot renders all 3 states**: `state="live"` has green fill + pulse animation + glow shadow. `state="idle"` has slate fill, no animation. `state="error"` has red fill, no animation. Optional `label` renders next to the dot.
5. **Icon renders all 9 named icons at all 3 sizes**: Each `name` value maps to correct SVG markup. `size="sm"|"md"|"lg"` applies correct width/height classes. `className` prop merges correctly.
6. **No hardcoded Tailwind arbitrary values for colors**: Use Tailwind's built-in color scale classes (`indigo-500`, `slate-800`, `red-500`, `green-500`, etc.) Note: design tokens from Unit A are not yet available; see Open Questions.
7. **Accessibility**: All interactive elements have `aria-label` support. Icons have `aria-hidden="true"`. StatusDot's wrapper has `aria-label` reflecting state.
8. **TypeScript compiles without errors**: `pnpm --filter frontend build` (or `npx tsc --noEmit`) passes with no type errors related to these components.
9. **Mobile touch target**: All Button instances enforce `min-h-[48px]` regardless of content length.
10. **All components use `'use client'` directive**: Each `.tsx` file begins with `'use client';` since they may render interactive elements.

### Test File Paths

Tests are deferred per Non-Goals. The validator inspects source files directly.

---

## Inspectable Acceptance Criteria

| # | Criterion | How to verify |
|---|-----------|---------------|
| I1 | PascalCase component filenames | List files in `components/`: Button.tsx, Card.tsx, StatusDot.tsx, Icon.tsx |
| I2 | Named exports (not default) | `grep "export function"` or `grep "export const"` on each file — no `export default` |
| I3 | `'use client'` directive at top of each file | Read first line of each file |
| I4 | SVG paths in Icon.tsx match source pages exactly | Compare path `d` attributes against `page.tsx` and `speaker/page.tsx` as documented above |
| I5 | No unused imports or variables | `pnpm --filter frontend exec tsc --noEmit` reports zero errors, zero warnings |
| I6 | Tailwind classes match source patterns | Visual comparison of className strings against equivalent inline classes in source pages |
| I7 | Button icon-only mode preserves correct padding | Inspect logic: when `children` is falsy and `iconLeft \|\| iconRight` is truthy, apply icon-only padding |

---

## Relevant Files

| File | Role |
|------|------|
| `packages/frontend/src/app/page.tsx` | Source of truth for viewer-side UI patterns |
| `packages/frontend/src/app/speaker/page.tsx` | Source of truth for speaker-side UI patterns |
| `packages/frontend/src/app/globals.css` | Available design tokens (limited) |
| `packages/frontend/tsconfig.json` | TypeScript configuration |
| `.ai/context.md` | Project conventions (PascalCase, named exports) |
| `.ai/tasks/1719001000-ui-components/planning-handoff.md` | Canonical requirements handoff |

---

## Validation Plan

**Validator steps**:

1. Confirm all 4 files exist with correct names and locations.
2. Open each file and verify:
   - `'use client';` on line 1.
   - Named export (e.g., `export function Button` or `export const Button`).
   - TypeScript props interface is defined and exported (or local).
   - Proper spread of `...rest` onto the native element (Button).
3. Run `pnpm --filter frontend build` — confirm zero build errors.
4. For **Button**: Trace each `variant + size` combination to a unique className string. Verify `min-h-[48px]` is always present. Verify icon-only detection logic.
5. For **Card**: Trace each `variant + padding` combination to correct background/border/padding classes.
6. For **StatusDot**: Trace each `state` to correct color + animation + shadow classes. Confirm `aria-label` on wrapper.
7. For **Icon**: Verify all 9 names are handled (no fallthrough/default case that throws). Compare SVG path `d` strings against source pages. Confirm `aria-hidden="true"`.
8. Spot-check that no hardcoded color hex values appear in className strings (Tailwind's built-in palette is acceptable; the handoff guidance says "use Tailwind classes" as fallback since Unit A tokens may be incomplete).

---

## Open Questions

1. **Design token availability**: Unit A (design tokens in `globals.css`) is a prerequisite but may not be complete. The current `globals.css` contains only `--background`, `--foreground`, and font variables. All source pages use raw Tailwind color classes (`indigo-500`, `slate-800`, etc.). **Guidance**: Use Tailwind's built-in color scale classes directly. A future tokenization pass can remap these to CSS custom properties without changing component interfaces.

2. **Icon implementation**: Handoff delegates the choice between inline SVG switch vs importing SVG files. **Recommendation**: Inline SVG switch (or object map) — zero dependencies, zero build config, zero network requests. Matches the pattern already used in source pages.

3. **Microphone icon**: The viewer page microphone (`page.tsx:226-241`) uses `strokeWidth=1.5` while the speaker page microphone (`speaker/page.tsx:186-187`) uses `strokeWidth={2}`. Use `strokeWidth={2}` as the standard for all icons (the simpler, more common value); the 1.5 version was an outlier for the larger standalone display case. The Size `lg` can adjust stroke width if needed.

4. **Button circular variants**: The Start/Stop broadcast button in `speaker/page.tsx` is `w-48 h-48 rounded-full` — a very large circular button. This does not fit neatly into the `sm`/`md`/`lg` size model. **Guidance**: This is out of scope for the base Button component. The circular broadcast button is a composite component for Unit C, which will compose Button + Icon + custom sizing via `className`.

5. **Stop if build fails**: The handoff specifies this as a stop condition. The implementer must resolve all build errors before marking the implementation complete.
