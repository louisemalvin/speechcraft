# UI Redesign Plan

> **Status**: Planning — not yet executed  
> **Scope**: Viewer page structural redesign (scrolling feed) + token/color alignment. Speaker & admin pages deferred.  
> **Reference**: [Design Language](design.md)

---

## Context

Speechcraft MVP is functional but the UI was built quickly with inconsistent styling. The current UI uses a cold slate/indigo palette that doesn't feel intentional. This plan shifts to a warm stone/wine palette, extracts reusable components, and fixes accessibility gaps. **No logo exists yet — brand identity is a wordmark ("Speechcraft") only.**

**Viewer UX redesign**: The current teleprompter model (3 stacked segments + cascading opacity fade) is broken for reading. Text greys out and layout jumps before users can finish reading. The viewer page needs a structural redesign — switching from teleprompter to a stable scrolling chat-feed model where all text remains equally readable. **Speaker and admin pages are deferred** — they remain color-token swaps and component extraction only.

### Current Inventory

- **3 pages**: `/` (viewer), `/speaker`, `/admin`
- **6 components**: `Button`, `Card`, `Icon`, `StatusDot`, `PinGate`, `LoadingSpinner`
- **2 hooks**: `useAudioCapture`, `usePinAuth`
- **1 CSS file**: `globals.css` (101 lines, Tailwind v4)
- **~60% of page color references are hardcoded** Tailwind classes (`bg-slate-950`, `text-white`, `bg-emerald-500`) instead of design tokens

### Key Problems

1. Cold slate/indigo palette doesn't match warm logo identity
2. Pages bypass design tokens with hardcoded Tailwind colors
3. Font conflict — `body` sets Arial, layout loads Geist Sans
4. Missing component extractions (segments and settings are inline)
5. 8+ accessibility gaps (missing aria-labels, roles, small touch targets)
6. Unused tokens and animations in globals.css

---

## Phase 1: Design Tokens & Color Palette

**Files to modify**: `packages/frontend/src/app/globals.css`, `packages/frontend/src/app/layout.tsx`

### 1.1 Replace Surface Colors (Cold → Warm)

Shift from blue-slate to warm stone:

| Token | Current | New | Source |
|---|---|---|---|
| `surface-primary` | `#020617` (slate-950) | `#0C0A09` (stone-950) | Page background |
| `surface-secondary` | `#0f172a` (slate-900) | `#1C1917` (stone-900) | Card backgrounds |
| `surface-tertiary` | `#1e293b` (slate-800) | `#292524` (stone-800) | Elevated surfaces |
| `surface-border` | `#1e293b` | `#44403C` (stone-700) | Dividers |
| `surface-muted` | `#334155` (slate-700) | `#57534E` (stone-600) | Disabled fills |

### 1.2 Replace Accent Colors (Indigo → Wine)

Warm burgundy/wine accent palette:

| Token | Current | New |
|---|---|---|
| `accent` | `#6366f1` (indigo-500) | `#A3424A` |
| `accent-hover` | `#818cf8` (indigo-400) | `#C25560` |
| `accent-strong` | `#4f46e5` (indigo-600) | `#8B2D35` |
| `accent-deep` | `#3730a3` (indigo-800) | `#6B1D24` |
| `accent-muted` | `#4338ca` (indigo-700) | `#7A2830` |

### 1.3 Replace Text Colors

| Token | Current | New |
|---|---|---|
| `text-primary` | `#f1f5f9` (slate-100) | `#FAFAF9` (stone-50) |
| `text-secondary` | `#94a3b8` (slate-400) | `#A8A29E` (stone-400) |
| `text-muted` | `#475569` (slate-600) | `#78716C` (stone-500) |

### 1.4 Add Brand Tokens

```css
--color-brand-maroon: #3C1518;
--color-brand-cream: #E8E0D4;
--color-surface-glass: rgba(28, 25, 23, 0.6);
```

### 1.5 Remove Unused Tokens

- `--color-theme-blue-bg`, `--color-theme-blue-text` (unused)
- `--color-theme-sepia-bg`, `--color-theme-sepia-text`, `--color-theme-sepia-border` (unused)
- `--color-theme-light-bg`, `--color-theme-light-text`, `--color-theme-light-border` (unused)
- `--color-status-error-bg` (unused)
- `--animate-wave-1` through `--animate-wave-5` and their `@keyframes` (unused)
- `:root` `--background`/`--foreground` and the `@media (prefers-color-scheme: dark)` block (superseded by token system)

### 1.6 Fix Typography

In `globals.css`, replace:
```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```
With:
```css
body {
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
}
```
Geist Sans is already loaded via `next/font` in `layout.tsx` and applied via `--font-geist-sans`. Removing the Arial override lets it take effect.

### 1.7 Fix Layout Theme Color

In `layout.tsx` metadata, change `themeColor` from `"#0f172a"` to `"#1C1917"`.

### Acceptance Criteria

- [ ] All token values updated in `globals.css`
- [ ] Unused tokens and keyframes removed
- [ ] `body` font-family override removed
- [ ] `themeColor` updated in `layout.tsx`
- [ ] App renders with warm stone backgrounds instead of cold slate
- [ ] No visual regressions in components using tokens

---

## Phase 2: Component Upgrades

### 2.1 Fix Existing Components

#### `LoadingSpinner.tsx`

Replace hardcoded colors:
- `bg-slate-950` → `bg-surface-primary`
- `text-slate-100` → `text-text-primary`
- `text-slate-400` → `text-text-secondary`

#### `PinGate.tsx`

- Replace `text-white` → `text-text-primary`
- Add `role="alert"` to error display section

#### `Icon.tsx`

The icon named `Headphones` is actually a volume/speaker SVG. Either:
- Replace SVG with actual headphones icon, or
- Rename to `Volume` and add a real `Headphones` icon

### 2.2 Extract New Components

#### `SegmentCard` — `src/components/SegmentCard.tsx`

Currently: translation segments are inline `<p>` elements in viewer page.

```typescript
interface SegmentCardProps {
  translatedText: string;
  className?: string;
}
```

Requirements:
- All segments render with equal visual weight — same font size, same opacity. No cascading fade, no "current" highlight. Position (bottom of feed) is the only indicator of recency.
- `animate-fade-in-up` entrance animation on new segments
- Font size controlled by parent (inherits from viewer state)
- Generous vertical spacing between cards, handled by parent layout

#### `VuMeter` — `src/components/VuMeter.tsx`

Currently: inline gradient `<div>` in speaker page with hardcoded `bg-emerald-500`, `via-yellow-400`, `to-red-500`.

```typescript
interface VuMeterProps {
  volume: number;       // 0-100
  isActive: boolean;
}
```

Requirements:
- Horizontal bar with gradient: `accent-strong` → `status-live`
- Smooth width transition (`transition-all duration-75`)
- `role="meter"`, `aria-valuenow={volume}`, `aria-valuemin={0}`, `aria-valuemax={100}`
- Inactive state shows empty bar at reduced opacity

#### `BroadcastButton` — `src/components/BroadcastButton.tsx`

Currently: inline large circular button in speaker page with hardcoded colors.

```typescript
interface BroadcastButtonProps {
  isListening: boolean;
  volume: number;
  onToggle: () => void;
}
```

Requirements:
- Large circular button (48×48 min, currently 192×192 — keep large)
- Volume-reactive ring animations (use `pulse-ring`)
- Dynamic `aria-label`: "Start broadcast" / "Stop broadcast"
- Active state: warm accent gradient, pulsing rings
- Idle state: muted surface, no animation

### Acceptance Criteria

- [ ] `LoadingSpinner` uses only design tokens
- [ ] `PinGate` uses only design tokens, has `role="alert"`
- [ ] `SegmentCard` extracted and rendered in viewer page
- [ ] `VuMeter` extracted with accessibility attributes
- [ ] `BroadcastButton` extracted with aria-label
- [ ] Icon naming issue resolved

---

## Phase 3: Viewer Page Redesign (`/`)

**File**: `packages/frontend/src/app/page.tsx`

This is the audience-facing surface. Highest polish priority. **The display model changes fundamentally** from teleprompter to scrolling feed.

### Display Model: Scrolling Chat Feed

The core insight: churchgoers who don't understand the spoken language rely on the phone as their **only source of comprehension**. They're not glancing — they're reading continuously, looking up at the speaker for social presence, then back down to catch up.

The current 3-segment teleprompter with opacity fade is broken because:
- Text greys out before users can finish reading it
- Layout recalculation causes text position to jump
- Looking away for 10 seconds means lost sentences

**New model**: Clean scrolling feed, like a chat app. All segments equally readable. New text appears at bottom with smooth scroll animation. No fading, no jumping.

### Layout

```
┌────────────────────────────────┐
│  Speechcraft                   │  ← Thin header, brand only. No status dot.
├────────────────────────────────┤
│                                │
│  Previous segment text...      │  ← All segments: same font, same opacity
│                                │
│  Another previous segment...   │  ← Generous spacing between segments
│                                │
│  More text that was spoken...  │  ← Scrollable — no segments are hidden
│                                │
│  The latest translation...     │  ← Newest at bottom. Position IS the indicator.
│                                │
├────────────────────────────────┤
│  [A-] [A+]     [🔊 Read Aloud]│  ← Sticky bottom bar
└────────────────────────────────┘
```

### Header

- Just "Speechcraft" brand text. No status dot, no LIVE indicator.
- Thin bar, minimal vertical space.
- **No connection status dot.** If translations are flowing, it works. If they stop, the user notices because new text stops appearing.
- Error banner: shown **only when disconnected** — e.g. "⚠ Connection lost. Reconnecting..." as a slim banner below header. Last received text stays visible and readable.

### Feed Behavior

- All segments render at the same font size and opacity. No cascading fade.
- New segments append at the bottom with smooth auto-scroll.
- **Smart auto-scroll**: If user has scrolled up to re-read past segments, auto-scroll pauses and a small "↓" jump-to-latest button appears (floating bottom-right). If user is already at the bottom, auto-scroll continues.
- Generous vertical spacing between segments (e.g. `gap-6` or `gap-8`) so sentences don't blur together.
- Segments use `animate-fade-in-up` entrance animation on arrival.

### Bottom Bar (Sticky)

- **Font size controls**: Small `[A-]` `[A+]` buttons on the left. Show current size label (XL, 2XL, 3XL, 4XL, 5XL) between them.
- **Read Aloud button**: Big labeled button on the right — "🔊 Read Aloud". When active, changes to "🔊 Reading Aloud..." with highlighted state. Words, not just icons — accessible to elderly users who may not recognize icon-only controls.
- Sticky to bottom of viewport. Semi-transparent background with backdrop blur.

### Empty State

- Simple waiting message when no segments have arrived: "Waiting for the sermon to begin..."
- No elaborate animations or illustrations. Clean, minimal.

### Default Font Size

- Default: `text-3xl` (30px, index 5). Same as current default — suited for phone held at lap/pew level, not close to face.

### Token Replacements

Replace all hardcoded colors with design tokens:
- `bg-slate-950` → `bg-surface-primary`
- `bg-slate-900/80` → `bg-surface-secondary/80`
- `bg-slate-900/90` → `bg-surface-secondary/90` (bottom bar)
- `text-slate-100` → `text-text-primary`
- `text-slate-300` → `text-text-primary` (empty state)
- `text-slate-400` → `text-text-secondary`
- `text-slate-500` → `text-text-muted`
- `border-slate-800` → `border-surface-border`
- `active:bg-slate-700` → `active:bg-surface-muted`
- `hover:bg-slate-800` → `hover:bg-surface-tertiary`
- `text-white` → `text-text-primary`
- `bg-slate-900` → `bg-surface-secondary`
- TTS active state `bg-accent` stays, but drop hardcoded indigo glow `shadow-[0_0_12px_rgba(99,102,241,0.6)]` — use semantic accent glow.
- Greeting card `bg-accent/15`, `border-accent/30` → use design tokens.

### State Handling

| State | Behavior |
|---|---|
| Initial (no segments) | Empty state: "Waiting for the sermon to begin..." |
| Connected, receiving | Segments flow into feed, auto-scroll active |
| Scrolled up (re-reading) | Auto-scroll paused, "↓" button appears |
| Connection lost | Error banner: "⚠ Connection lost. Reconnecting..." Last text visible, readable. |
| Connection restored | Banner dismisses, feed resumes. No data loss. |

### Acceptance Criteria

- [ ] Scrolling chat-feed display model (not teleprompter)
- [ ] Zero hardcoded Tailwind color classes
- [ ] `SegmentCard` used for all segments
- [ ] Thin brand-only header (no status dot)
- [ ] Error banner shows only on disconnect
- [ ] Smart auto-scroll with "↓" jump button
- [ ] Bottom bar: A-/A+ controls + labeled Read Aloud button
- [ ] All interactive elements have `aria-label`
- [ ] Empty state when no segments received
- [ ] Generous spacing between segments (no text blurring)

---

## Phase 4: Speaker Page Redesign (`/speaker`)

**File**: `packages/frontend/src/app/speaker/page.tsx`

### Changes

1. **Replace all hardcoded colors**:
   - `bg-slate-950` → `bg-surface-primary`
   - `text-slate-100` → `text-text-primary`
   - `bg-emerald-500` / `via-yellow-400` / `to-red-500` → removed (now inside `VuMeter`)
   - `text-red-400` → `text-status-error-bright`
   - `bg-red-900/30` → `bg-status-error-dark/30`
2. **Use `BroadcastButton`** component
3. **Use `VuMeter`** component
4. **Error card** — use `Card variant="error"`, add `role="alert"`, `aria-live="assertive"`
5. **Add session timer** — elapsed time since broadcast started

### Acceptance Criteria

- [ ] Zero hardcoded Tailwind color classes
- [ ] `BroadcastButton` and `VuMeter` components used
- [ ] Error display has `role="alert"`
- [ ] All interactive elements have `aria-label`

---

## Phase 5: Admin Page Redesign (`/admin`)

**File**: `packages/frontend/src/app/admin/page.tsx`

### Purpose

The admin page is a **developer diagnostic tool** for monitoring live translation quality. It shows raw Deepgram ASR input (Indonesian) alongside DeepSeek translated output (English) in real-time. Not user-facing — used by the developer/operator to verify the pipeline is working correctly.

### Changes

1. **Replace all hardcoded colors** — this page has the most hardcoded values:
   - `bg-slate-950` → `bg-surface-primary`
   - `bg-slate-900` → `bg-surface-secondary`
   - `border-slate-800` → `border-surface-border`
   - `text-slate-500`, `text-slate-400` → `text-text-secondary`
   - `text-slate-300` → `text-text-primary`
   - `text-slate-600` → `text-text-muted`
   - `text-white` → `text-text-primary`
2. **Fix touch targets** — navigation links: increase from `text-[11px]` to `text-sm`, add `min-h-[44px]`
3. **Log container** — add `role="log"`, `aria-live="polite"`
4. **Lock button** — add `aria-label="Lock console"`
5. **Clear Feed** — add `aria-label="Clear debug log"`
6. **Log entries** — use `Card` component, alternate subtle background for scanability

### Acceptance Criteria

- [ ] Zero hardcoded Tailwind color classes
- [ ] Navigation links meet 44px touch target
- [ ] Log container has `role="log"`
- [ ] All buttons have `aria-label`

---

## Phase 6: Final Polish

### Accessibility Sweep

Run through all three pages and verify:

- [ ] Every interactive element has `aria-label` or visible label
- [ ] Error displays have `role="alert"`
- [ ] Log container has `role="log"`
- [ ] Single `<h1>` per page
- [ ] All focus states visible (`focus-visible:outline-*`)
- [ ] All touch targets ≥ 44px

### Token Audit

Search entire `packages/frontend/src/` for remaining hardcoded color classes:

```bash
grep -rn "bg-slate\|text-slate\|bg-emerald\|bg-red-\|text-red-\|text-white\|bg-white" \
  packages/frontend/src/ --include="*.tsx" --include="*.ts"
```

**Target: 0 results.**

### Premium Polish (Optional)

These are nice-to-have enhancements if time permits:

| Enhancement | Location | Details |
|---|---|---|
| Glassmorphism cards | Viewer, Speaker | `backdrop-blur` + semi-transparent surfaces |
| Button hover glow | `Button.tsx` | `hover:shadow-[0_0_20px_var(--color-accent)/0.2]` |
| Skeleton loading | All pages | Replace `LoadingSpinner` with skeleton placeholders |
| Empty state illustration | Viewer | "Waiting for broadcast..." with subtle pulse animation |
| Page mount animation | All pages | `fadeInUp` on initial render |

---

## Execution Order

```
Phase 1 (Tokens)
    ↓
Phase 2 (Components)
    ↓
Phase 3 (Viewer) ─┐
Phase 4 (Speaker) ─┼── can run in parallel
Phase 5 (Admin) ──┘
    ↓
Phase 6 (Polish)
```

> **Phase 1 must complete first.** Every subsequent phase depends on the new token values. Phases 3-5 are independent and can be done in any order or in parallel.
>
> **Phase 3 (Viewer) is the structural redesign.** It changes the display model fundamentally — not just color swaps. Speaker and Admin (P4/P5) are deferred to a later iteration and remain color-token swaps only for now.

---

## Files Changed Summary

| Phase | Files Modified | Files Created |
|---|---|---|
| P1 | `globals.css`, `layout.tsx` | — |
| P2 | `LoadingSpinner.tsx`, `PinGate.tsx`, `Icon.tsx` | `SegmentCard.tsx`, `VuMeter.tsx`, `BroadcastButton.tsx` |
| P3 | `app/page.tsx` | — |
| P4 | `app/speaker/page.tsx` | — |
| P5 | `app/admin/page.tsx` | — |
| P6 | Various (a11y attributes) | — |

All files are in `packages/frontend/src/`.
