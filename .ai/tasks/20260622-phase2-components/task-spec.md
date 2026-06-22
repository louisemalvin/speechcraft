# Task Spec: Phase 2 — Component Upgrades

## Objective

Fix 3 existing components to use design tokens instead of hardcoded Tailwind colors, and create 3 new components (SegmentCard, VuMeter, BroadcastButton) for reuse in Phase 3+ pages. All components must be token-only (zero hardcoded color classes) and meet the accessibility requirements in the redesign plan.

## Source Artifacts / Handoff Context

- **Planning handoff**: `.ai/tasks/20260622-phase2-components/planning-handoff.md`
- **Source plan**: `docs/ui-redesign-plan.md` — Phase 2 section
- **Phase 1 tokens**: `.ai/tasks/20260622-phase1-design-tokens/task-spec.md` (complete; tokens are live in `globals.css`)
- **Existing components**: `packages/frontend/src/components/LoadingSpinner.tsx`, `PinGate.tsx`, `Icon.tsx`
- **Reference components**: `Button.tsx`, `Card.tsx` (for className-passthrough and variant patterns)

---

## Scope

### Files to Modify

| File | Changes |
|---|---|
| `packages/frontend/src/components/LoadingSpinner.tsx` | Replace 3 hardcoded color classes with design tokens |
| `packages/frontend/src/components/PinGate.tsx` | Replace 1 hardcoded color class; add `role="alert"` to error section |
| `packages/frontend/src/components/Icon.tsx` | Rename `Headphones` → `Volume`; add real `Headphones` icon |

### Files to Create

| File | Purpose |
|---|---|
| `packages/frontend/src/components/SegmentCard.tsx` | Translation segment card for scrolling feed (Phase 3 consumer) |
| `packages/frontend/src/components/VuMeter.tsx` | Volume meter bar with gradient + accessibility attributes (Phase 4 consumer) |
| `packages/frontend/src/components/BroadcastButton.tsx` | Large circular broadcast toggle with volume-reactive rings (Phase 4 consumer) |

---

## Non-Goals

- **No page-level changes.** Phase 3 (Viewer), Phase 4 (Speaker), Phase 5 (Admin) are separate task units.
- **No `globals.css` changes.** Tokens are complete from Phase 1.
- **No `layout.tsx` changes.**
- **No changes to `Button.tsx`, `Card.tsx`, or `StatusDot.tsx`.**
- **SegmentCard does NOT have `opacity` or `isCurrent` props.** Those were removed per the simplified scrolling-feed model.

---

## Component Changes — Exact Specifications

### 1. LoadingSpinner.tsx — Token Swap

**Current code at the 3 affected lines:**

```tsx
// Line 7 (outer div):
<div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">

// Line 10 (label span):
<span className="text-sm text-slate-400 font-medium">{label}</span>
```

**Required changes (3 replacements):**

| Old class | New class | Location |
|---|---|---|
| `bg-slate-950` | `bg-surface-primary` | Outer div |
| `text-slate-100` | `text-text-primary` | Outer div |
| `text-slate-400` | `text-text-secondary` | Label span |

**Resulting file** — same structure, only class names changed.

---

### 2. PinGate.tsx — Token Swap + Accessibility

**Current code (line 35):**

```tsx
<h1 className="text-2xl font-bold tracking-tight text-white mb-2">Speaker Console</h1>
```

**Required change:**

| Old class | New class |
|---|---|
| `text-white` | `text-text-primary` |

**Current error display (lines 52–57):**

```tsx
{pinError && (
  <p className="text-status-error text-sm mt-2 font-medium flex items-center gap-1.5 justify-center">
    <Icon name="Warning" className="w-4 h-4 text-status-error" />
    {pinError}
  </p>
)}
```

**Required change:** Add `role="alert"` to the `<p>` element:

```tsx
{pinError && (
  <p role="alert" className="text-status-error text-sm mt-2 font-medium flex items-center gap-1.5 justify-center">
    <Icon name="Warning" className="w-4 h-4 text-status-error" />
    {pinError}
  </p>
)}
```

No other lines in PinGate.tsx are changed.

---

### 3. Icon.tsx — Rename Headphones → Volume + Add Real Headphones

The current `HeadphonesIcon` function (lines 101–108) contains a **volume/speaker** SVG:

```
path: speaker cone (M11 5L6 9H2v6h4l5 4V5z)
path: sound wave arc 1 (M19.07 4.93a10 10 0 010 14.14)
path: sound wave arc 2 (M15.54 8.46a5 5 0 010 7.07)
```

This is used in `page.tsx` line 93 as `<Icon name="Headphones" />` for the Read Aloud button (TTS). Renaming the icon to `Volume` and adding a real headphones SVG means `page.tsx` automatically picks up the correct headphones icon — **no page changes needed**.

**Changes:**

#### A. Update the type union (line 12)

Change:
```tsx
| 'Headphones'
```
To:
```tsx
| 'Headphones'
| 'Volume'
```

(The `'Headphones'` entry stays — only `'Volume'` is added.)

#### B. Rename the function (line 101)

Change function name from `HeadphonesIcon` to `VolumeIcon`. Keep the body identical.

#### C. Add new `HeadphonesIcon` function

Insert before the `CloseIcon` function (or after `VolumeIcon`):

```tsx
function HeadphonesIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </SvgWrapper>
  );
}
```

#### D. Update ICON_MAP (line 161)

Change:
```tsx
Headphones: HeadphonesIcon,
```
To:
```tsx
Headphones: HeadphonesIcon,
Volume: VolumeIcon,
```

**Summary of changes in Icon.tsx:**

| Location | Change |
|---|---|
| Line 12, type union | Add `'Volume'` |
| Line 101, function name | `HeadphonesIcon` → `VolumeIcon` |
| After line 109 (or after VolumeIcon) | Insert new `HeadphonesIcon` function with real headphones SVG |
| Line 161, ICON_MAP | `Headphones: HeadphonesIcon,` → `Headphones: HeadphonesIcon,` + `Volume: VolumeIcon,` |

---

### 4. SegmentCard.tsx — New File

**Full specification:**

```typescript
interface SegmentCardProps {
  translatedText: string;
  className?: string;
}
```

**Behavior:**

- Renders `translatedText` inside a `<p>` element with `animate-fade-in-up` entrance animation.
- Font size is inherited from the parent container (no fixed font-size class on the card itself).
- All segments have equal visual weight: same opacity, same font size, same styling.
- No `opacity` prop. No `isCurrent` prop. No fade/cascade logic.
- Generous vertical spacing is handled by the parent layout (Phase 3); this component does not add its own margins/padding beyond what `className` passthrough allows.
- className is appended to the root element.

**Implementation:**

```tsx
interface SegmentCardProps {
  translatedText: string;
  className?: string;
}

export function SegmentCard({ translatedText, className = '' }: SegmentCardProps) {
  return (
    <p className={`animate-fade-in-up text-text-primary ${className}`.trim()}>
      {translatedText}
    </p>
  );
}
```

**Design token usage:** `text-text-primary` (no hardcoded colors).

---

### 5. VuMeter.tsx — New File

**Full specification:**

```typescript
interface VuMeterProps {
  volume: number;    // integer, 0–100
  isActive: boolean;
}
```

**Behavior:**

- Horizontal bar showing volume level as a percentage-width fill.
- **Active state** (`isActive === true`): Bar fills from left with a gradient background from `accent-strong` (left) to `status-live` (right). Width transitions smoothly (`transition-all duration-75`).
- **Inactive state** (`isActive === false`): Empty bar with reduced opacity (`opacity-30`), showing the track but no fill.
- **Accessibility**: `role="meter"`, `aria-valuenow={volume}`, `aria-valuemin={0}`, `aria-valuemax={100}`, `aria-label="Volume level"`.

**Implementation:**

```tsx
interface VuMeterProps {
  volume: number;
  isActive: boolean;
}

export function VuMeter({ volume, isActive }: VuMeterProps) {
  return (
    <div
      role="meter"
      aria-valuenow={volume}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Volume level"
      className="w-full h-3 rounded-full bg-surface-tertiary overflow-hidden"
    >
      <div
        className={`h-full rounded-full bg-linear-to-r from-accent-strong to-status-live transition-all duration-75 ${
          isActive ? '' : 'opacity-30'
        }`}
        style={{ width: `${isActive ? volume : 0}%` }}
      />
    </div>
  );
}
```

**Design token usage:** `bg-surface-tertiary`, `from-accent-strong`, `to-status-live`, `opacity-30` (opacity utility, not a color — allowed).

**Note on `bg-linear-to-r`:** Tailwind v4 gradient syntax. If the project uses Tailwind v3 style `bg-gradient-to-r`, check `globals.css` for the `@theme inline` block — Tailwind v4 `@theme inline` registers `--animate-*` but gradient utilities depend on the Tailwind version. Use `bg-gradient-to-r` if v3-style classes are available; otherwise use the v4 `bg-linear-to-r` syntax that Tailwind v4 provides. Verify after first build attempt.

---

### 6. BroadcastButton.tsx — New File

**Full specification:**

```typescript
interface BroadcastButtonProps {
  isListening: boolean;
  volume: number;     // integer, 0–100
  onToggle: () => void;
}
```

**Behavior:**

- **Large circular button** — default size `w-48 h-48` (192×192, matching current speaker page usage), with `rounded-full`.
- **Active state** (`isListening === true`):
  - Button background: warm accent gradient (`bg-linear-to-br from-accent-strong to-accent` or similar warm gradient using accent tokens).
  - **Concentric pulsing rings**: 2–3 absolute-positioned ring `<div>` elements behind the button, each with `animate-pulse-ring`, staggered `animationDelay` (0s, 0.5s, 1s), and volume-reactive scale (`transform: scale()` tied to `volume` — higher volume = larger rings).
  - Ring colors use accent tokens at low opacity (e.g., `bg-accent/20`, `bg-accent/10`).
- **Idle state** (`isListening === false`):
  - Button background: muted surface (`bg-surface-muted`).
  - No visible rings.
  - No animation.
- **Accessibility**: `aria-label` dynamically set to `"Stop broadcast"` when listening, `"Start broadcast"` when idle.
- **Interaction**: `onClick={onToggle}`, cursor pointer, focus-visible outline using `focus-visible:outline-accent`.
- **Touch target**: Already large (192×192), well above 44px minimum.
- **className passthrough** for parent customization.

**Implementation skeleton:**

```tsx
'use client';

interface BroadcastButtonProps {
  isListening: boolean;
  volume: number;
  onToggle: () => void;
}

export function BroadcastButton({ isListening, volume, onToggle }: BroadcastButtonProps) {
  return (
    <button
      onClick={onToggle}
      aria-label={isListening ? 'Stop broadcast' : 'Start broadcast'}
      className="relative w-48 h-48 rounded-full flex items-center justify-center
                 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent
                 transition-all duration-300 cursor-pointer select-none
                 active:scale-[0.97]"
    >
      {/* Pulsing rings — only when listening */}
      {isListening && (
        <>
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring bg-accent/20"
            style={{ transform: `scale(${1 + volume / 200})` }}
          />
          <div
            className="absolute inset-0 rounded-full animate-pulse-ring bg-accent/10"
            style={{
              animationDelay: '0.5s',
              transform: `scale(${1 + volume / 100})`,
            }}
          />
        </>
      )}

      {/* Button face */}
      <span
        className={`relative z-10 w-full h-full rounded-full flex items-center justify-center
                    text-text-primary text-lg font-semibold transition-all duration-300
                    ${isListening
                      ? 'bg-linear-to-br from-accent-strong to-accent shadow-lg shadow-accent-strong/40'
                      : 'bg-surface-muted'
                    }`}
      >
        {isListening ? 'Stop' : 'Broadcast'}
      </span>
    </button>
  );
}
```

**Design token usage:** `bg-accent/20`, `bg-accent/10`, `text-text-primary`, `from-accent-strong`, `to-accent`, `bg-surface-muted`, `shadow-accent-strong/40` (shadow is a utility, uses design token — allowed). Outline uses `outline-accent`. Zero hardcoded color hexes or Tailwind color names.

---

## Acceptance Criteria

### Testable Acceptance Criteria

#### Automated / Build Verification

- [ ] **Build passes**: `cd packages/frontend && pnpm build` exits 0 with no errors.
- [ ] **TypeScript compiles**: No TS errors in any modified or created files.
- [ ] **Zero hardcoded color classes in component files**: Running `grep -rn "bg-slate\|text-slate\|bg-emerald\|bg-red-\|text-red-\|text-white\|bg-white\|bg-indigo\|text-indigo" packages/frontend/src/components/ --include="*.tsx"` returns zero matches in the files touched by this phase. (Pre-existing hardcoded colors in `Button.tsx` — `text-white` on line 14 — are out of scope for this phase; they are addressed in Phase 6.)

#### Test File Paths

```
(No test files exist in this project. Verification is via build + lint.)
```

### Inspectable Acceptance Criteria

#### LoadingSpinner.tsx

- [ ] `bg-slate-950` replaced with `bg-surface-primary`
- [ ] `text-slate-100` replaced with `text-text-primary`
- [ ] `text-slate-400` replaced with `text-text-secondary`
- [ ] No other class names changed

#### PinGate.tsx

- [ ] `text-white` on `<h1>` replaced with `text-text-primary`
- [ ] Error `<p>` element has `role="alert"` attribute
- [ ] No other structural changes

#### Icon.tsx

- [ ] `'Volume'` added to the type union on line 12
- [ ] `HeadphonesIcon` function renamed to `VolumeIcon`
- [ ] New `HeadphonesIcon` function exists with a real headphones SVG (earcups + headband, not speaker cone)
- [ ] ICON_MAP has `Headphones: HeadphonesIcon` (new function) and `Volume: VolumeIcon` (renamed)
- [ ] No other icon functions modified
- [ ] `page.tsx` usage of `<Icon name="Headphones" />` resolves to the new headphones SVG (verify by import analysis — no runtime test needed for Phase 2)

#### SegmentCard.tsx

- [ ] File exists at `packages/frontend/src/components/SegmentCard.tsx`
- [ ] Exports `SegmentCard` function component
- [ ] Props interface has `translatedText: string` and `className?: string`
- [ ] No `opacity` prop
- [ ] No `isCurrent` prop
- [ ] Uses `animate-fade-in-up` class
- [ ] Uses `text-text-primary` (no hardcoded color)
- [ ] Font size is NOT set on the component (inherits)

#### VuMeter.tsx

- [ ] File exists at `packages/frontend/src/components/VuMeter.tsx`
- [ ] Exports `VuMeter` function component
- [ ] Props interface has `volume: number` and `isActive: boolean`
- [ ] Root element has `role="meter"`
- [ ] Root element has `aria-valuenow`, `aria-valuemin={0}`, `aria-valuemax={100}`
- [ ] Root element has `aria-label="Volume level"`
- [ ] Fill bar uses gradient from `accent-strong` to `status-live`
- [ ] Width transitions with `transition-all duration-75`
- [ ] Inactive state shows `opacity-30` on the fill bar
- [ ] Zero hardcoded color classes

#### BroadcastButton.tsx

- [ ] File exists at `packages/frontend/src/components/BroadcastButton.tsx`
- [ ] Exports `BroadcastButton` function component
- [ ] Has `'use client'` directive (uses onClick handler)
- [ ] Props interface has `isListening: boolean`, `volume: number`, `onToggle: () => void`
- [ ] `aria-label` is dynamic: `"Start broadcast"` when idle, `"Stop broadcast"` when listening
- [ ] Default size is `w-48 h-48` (192×192)
- [ ] `rounded-full` applied
- [ ] Active state shows concentric ring elements with `animate-pulse-ring`
- [ ] Rings have staggered `animationDelay`
- [ ] Ring scale responds to `volume` prop (higher volume = larger rings via inline `style.transform`)
- [ ] Idle state shows button with `bg-surface-muted`, no rings, no animation
- [ ] Active button face uses accent gradient
- [ ] `focus-visible:outline-accent` applied
- [ ] Zero hardcoded color classes
- [ ] className passthrough supported (accepts and appends `className` prop)

---

## Relevant Files

| File | Role |
|---|---|
| `packages/frontend/src/components/LoadingSpinner.tsx` | Modify — token swap |
| `packages/frontend/src/components/PinGate.tsx` | Modify — token swap + aria |
| `packages/frontend/src/components/Icon.tsx` | Modify — rename + add icon |
| `packages/frontend/src/components/SegmentCard.tsx` | **Create** |
| `packages/frontend/src/components/VuMeter.tsx` | **Create** |
| `packages/frontend/src/components/BroadcastButton.tsx` | **Create** |
| `packages/frontend/src/app/globals.css` | Read-only reference (tokens + animations) |
| `packages/frontend/src/components/Button.tsx` | Read-only reference (pattern) |
| `packages/frontend/src/components/Card.tsx` | Read-only reference (pattern) |
| `docs/ui-redesign-plan.md` | Read-only reference (Phase 2 section) |

---

## Execution

This is a single-unit, multi-file task. All 6 component changes are independent of each other and can be done in any order. The pipeline below groups them into logical steps.

### Step 1: Fix Existing Components (3 files)

**Agent**: `cavecrew-builder`  
**Scope**: Modify `LoadingSpinner.tsx`, `PinGate.tsx`, `Icon.tsx` per the exact specifications in this task spec.  
**Deliverables**: Three files with only the specified changes.  
**Order**: Any order; all three are independent.

### Step 2: Create New Components (3 files)

**Agent**: `cavecrew-builder` (can be the same or a new builder)  
**Scope**: Create `SegmentCard.tsx`, `VuMeter.tsx`, `BroadcastButton.tsx` per the exact specifications in this task spec.  
**Deliverables**: Three new files following the patterns established by existing components (`Card.tsx`, `Button.tsx`).  
**Order**: Any order; all three are independent.

### Step 3: Build Verification

**Agent**: `cavecrew-builder` (same agent that did Steps 1+2)  
**Command**: `cd packages/frontend && pnpm build`  
**Expected**: Exit code 0, no errors.  
**On failure**: Fix errors and re-run until clean.

### Step 4: Hardcoded-Color Audit

**Agent**: `cavecrew-investigator` (or builder)  
**Command**:

```bash
grep -rn "bg-slate\|text-slate\|bg-emerald\|bg-red-\|text-red-\|text-white\b\|bg-white\b\|bg-indigo\|text-indigo" \
  packages/frontend/src/components/ --include="*.tsx"
```

**Expected**: Zero matches in the files touched by this phase. The pre-existing `text-white` in `Button.tsx` line 14 is out of scope and may appear — that is acceptable.

### Step 5: Component-Specific Verification

**Agent**: `cavecrew-reviewer`  
**Scope**: Review the diff for all 6 components against the acceptance criteria checklist. Verify:
- SegmentCard has no opacity/isCurrent props
- VuMeter has role="meter" + all 4 aria attributes
- BroadcastButton has dynamic aria-label
- PinGate error section has role="alert"
- Icon.tsx has both `Volume` and `Headphones` in type union and ICON_MAP

---

## Validation Plan

```bash
# 1. Build check
cd packages/frontend && pnpm build

# 2. Hardcoded color audit (expect ~1 match: Button.tsx text-white, which is out of scope)
grep -rn "bg-slate\|text-slate\|bg-emerald\|bg-red-\|text-red-\|text-white\b\|bg-white\b\|bg-indigo\|text-indigo" \
  packages/frontend/src/components/ --include="*.tsx"

# 3. Verify SegmentCard has no forbidden props
grep -n "opacity\|isCurrent" packages/frontend/src/components/SegmentCard.tsx
# Expected: no output (1 = exit 1 = no matches)

# 4. Verify VuMeter accessibility attributes
grep -c 'role="meter"' packages/frontend/src/components/VuMeter.tsx
# Expected: 1
grep -c 'aria-valuenow' packages/frontend/src/components/VuMeter.tsx
# Expected: 1
grep -c 'aria-valuemin' packages/frontend/src/components/VuMeter.tsx
# Expected: 1
grep -c 'aria-valuemax' packages/frontend/src/components/VuMeter.tsx
# Expected: 1

# 5. Verify BroadcastButton dynamic aria-label
grep "Start broadcast\|Stop broadcast" packages/frontend/src/components/BroadcastButton.tsx
# Expected: both strings present

# 6. Verify PinGate role="alert"
grep 'role="alert"' packages/frontend/src/components/PinGate.tsx
# Expected: 1 match

# 7. Verify Icon.tsx has both Volume and Headphones in type and map
grep -c "'Volume'" packages/frontend/src/components/Icon.tsx
# Expected: at least 2 (type union + ICON_MAP)
grep -c "'Headphones'" packages/frontend/src/components/Icon.tsx
# Expected: at least 2 (type union + ICON_MAP)
```

---

## Open Questions

None. All specifications are derived from the planning handoff and source plan. The handoff explicitly states: "No questions asked — just execute the pipeline."
