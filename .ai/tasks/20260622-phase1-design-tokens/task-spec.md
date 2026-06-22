# Task Spec: Phase 1 — Design Tokens & Color Palette

## Objective

Replace the cold indigo accent palette with a warm wine/burgundy palette, add brand tokens, remove unused tokens/animations, fix body typography, and update the themeColor metadata. This is the foundational token pass that all subsequent UI redesign phases depend on.

**Note:** Surface and text color tokens are already at their target warm-stone values (`#0C0A09`, `#1C1917`, `#FAFAF9`, etc.). Only the accent tokens, brand additions, removals, typography fix, and layout metadata need changing.

---

## Source Artifacts / Handoff Context

- **Planning handoff**: `.ai/tasks/20260622-phase1-design-tokens/planning-handoff.md`
- **Source plan**: `docs/ui-redesign-plan.md` (Phase 1, sections 1.1–1.7)
- **Files to edit**:
  - `packages/frontend/src/app/globals.css` (lines 1–96)
  - `packages/frontend/src/app/layout.tsx` (lines 1–49)

---

## Scope

### In Scope

| # | Change | File |
|---|--------|------|
| A | Replace 5 accent color token values (indigo → wine) | `globals.css` |
| B | Add 3 brand tokens (`brand-maroon`, `brand-cream`, `surface-glass`) | `globals.css` |
| C | Remove unused tokens: 9 theme tokens, 1 status-error-bg token, 2 background/foreground tokens | `globals.css` |
| D | Remove unused wave animation tokens and keyframes (`--animate-wave-1` through `--animate-wave-5`, `@keyframes wave-1` through `wave-5`) | `globals.css` |
| E | Remove `@media (prefers-color-scheme: dark)` block | `globals.css` |
| F | Fix `body` block: remove `font-family: Arial...`, use surface-primary/text-primary tokens | `globals.css` |
| G | Update `themeColor` from `#0f172a` to `#1C1917` | `layout.tsx` |

### Out of Scope

- Any page-level changes (viewer, speaker, admin)
- Component edits (LoadingSpinner, PinGate, Icon, etc.)
- Any structural UI changes
- Logo or brand-asset changes

---

## Files to Modify

| File | Path |
|------|------|
| globals.css | `packages/frontend/src/app/globals.css` |
| layout.tsx | `packages/frontend/src/app/layout.tsx` |

---

## Step-by-Step Changes

### Step A: Replace Accent Color Tokens (globals.css, lines 22–27)

**Current:**
```css
  --color-accent: #6366f1;
  --color-accent-hover: #818cf8;
  --color-accent-strong: #4f46e5;
  --color-accent-deep: #3730a3;
  --color-accent-muted: #4338ca;
```

**Replace with:**
```css
  --color-accent: #A3424A;
  --color-accent-hover: #C25560;
  --color-accent-strong: #8B2D35;
  --color-accent-deep: #6B1D24;
  --color-accent-muted: #7A2830;
```

### Step B: Add Brand Tokens (globals.css, after accent block, before status colors)

Insert after the accent block (after `--color-accent-muted` line) and before the `/* ── Status colors ── */` comment:

```css

  /* ── Brand ── */
  --color-brand-maroon: #3C1518;
  --color-brand-cream: #E8E0D4;
  --color-surface-glass: rgba(28, 25, 23, 0.6);
```

### Step C: Remove Unused Tokens (globals.css)

**Remove these 12 lines:**

1. `--color-background: var(--background);` (line 5)
2. `--color-foreground: var(--foreground);` (line 6)
3. `--color-status-error-bg: #450a0a;` (line 35)
4. `--color-theme-blue-bg: #172554;` (line 38)
5. `--color-theme-blue-text: #eff6ff;` (line 39)
6. `--color-theme-sepia-bg: #fffbeb;` (line 40)
7. `--color-theme-sepia-text: #451a03;` (line 41)
8. `--color-theme-sepia-border: #fde68a;` (line 42)
9. `--color-theme-light-bg: #ffffff;` (line 43)
10. `--color-theme-light-text: #111827;` (line 44)
11. `--color-theme-light-border: #e5e7eb;` (line 45)

### Step D: Remove Wave Animation Tokens and Keyframes (globals.css)

**Remove these 5 tokens** (currently lines 60–64):
```css
  --animate-wave-1: wave-1 1.2s ease-in-out infinite;
  --animate-wave-2: wave-2 0.9s ease-in-out infinite;
  --animate-wave-3: wave-3 1.5s ease-in-out infinite;
  --animate-wave-4: wave-4 1.1s ease-in-out infinite;
  --animate-wave-5: wave-5 1.3s ease-in-out infinite;
```

**Remove these 5 keyframe blocks** (currently lines 73–77):
```css
@keyframes wave-1 { 0%, 100% { height: 8px; } 50% { height: 28px; } }
@keyframes wave-2 { 0%, 100% { height: 12px; } 50% { height: 38px; } }
@keyframes wave-3 { 0%, 100% { height: 6px; } 50% { height: 24px; } }
@keyframes wave-4 { 0%, 100% { height: 14px; } 50% { height: 42px; } }
@keyframes wave-5 { 0%, 100% { height: 10px; } 50% { height: 32px; } }
```

### Step E: Remove Dark Mode Media Query Block (globals.css, lines 85–90)

**Remove:**
```css
@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}
```

Also remove any blank line preceding it so there is no stray whitespace before the `body` block.

### Step F: Fix Body Typography (globals.css, lines 92–96)

**Current:**
```css
body {
  background: var(--background);
  color: var(--foreground);
  font-family: Arial, Helvetica, sans-serif;
}
```

**Replace with:**
```css
body {
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
}
```

### Step G: Update Layout Theme Color (layout.tsx, line 27)

**Current:**
```typescript
  themeColor: "#0f172a",
```

**Replace with:**
```typescript
  themeColor: "#1C1917",
```

---

## Testable Acceptance Criteria

### Build

- [ ] `cd packages/frontend && npx next build` exits zero (no CSS or TypeScript errors)

### Token Value Verification

- [ ] Accent token `--color-accent` is `#A3424A` (not `#6366f1`)
- [ ] Accent token `--color-accent-hover` is `#C25560` (not `#818cf8`)
- [ ] Accent token `--color-accent-strong` is `#8B2D35` (not `#4f46e5`)
- [ ] Accent token `--color-accent-deep` is `#6B1D24` (not `#3730a3`)
- [ ] Accent token `--color-accent-muted` is `#7A2830` (not `#4338ca`)
- [ ] Brand tokens `--color-brand-maroon`, `--color-brand-cream`, `--color-surface-glass` exist with correct values

### Removal Verification

- [ ] Zero hardcoded slate/emerald/red/white color classes in globals.css: `grep -rn "bg-slate\|text-slate\|bg-emerald\|bg-red-\|text-red-\|text-white\|bg-white" packages/frontend/src/app/globals.css` returns no results
- [ ] `--color-status-error-bg` no longer exists in globals.css
- [ ] `--color-theme-blue-bg`, `--color-theme-sepia-bg`, `--color-theme-light-bg` and their -text/-border companions no longer exist
- [ ] `--color-background` and `--color-foreground` no longer exist
- [ ] `--animate-wave-1` through `--animate-wave-5` no longer exist
- [ ] `@keyframes wave-1` through `@keyframes wave-5` no longer exist
- [ ] `@media (prefers-color-scheme: dark)` block no longer exists

### Typography Verification

- [ ] `body` block has no `font-family` property
- [ ] `body` block uses `background: var(--color-surface-primary)` and `color: var(--color-text-primary)`

### Layout Verification

- [ ] `themeColor` in `layout.tsx` is `"#1C1917"` (not `"#0f172a"`)

### Visual Check (manual / dev server)

- [ ] App renders (all 3 pages) with warm stone backgrounds instead of cold slate
- [ ] Accent-colored elements (buttons, links, active states) use warm wine/burgundy instead of indigo
- [ ] All type is Geist Sans (not Arial)
- [ ] Browser tab/mobile status bar shows warm `#1C1917` theme color
- [ ] No visual regressions in components that use design-token classes

---

## Verification Commands

Run these after making changes:

```bash
# 1. Build check (must pass)
cd packages/frontend && npx next build

# 2. Zero hardcoded color classes in globals.css
grep -rn "bg-slate\|text-slate\|bg-emerald\|bg-red-\|text-red-\|text-white\|bg-white" packages/frontend/src/app/globals.css
# Expected: no output

# 3. Confirm accent token values
grep -n "color-accent" packages/frontend/src/app/globals.css
# Expected: wine values (A3424A, C25560, 8B2D35, 6B1D24, 7A2830)

# 4. Confirm brand tokens exist
grep -n "brand-maroon\|brand-cream\|surface-glass" packages/frontend/src/app/globals.css
# Expected: 3 lines with correct values

# 5. Confirm removals (no results = success)
grep -n "theme-blue\|theme-sepia\|theme-light\|status-error-bg\|animate-wave-[1-5]\|@keyframes wave-[1-5]\|prefers-color-scheme" packages/frontend/src/app/globals.css
# Expected: no output

# 6. Confirm background/foreground removed
grep -n "color-background\|color-foreground" packages/frontend/src/app/globals.css
# Expected: no output

# 7. Confirm body has no font-family
grep -n "font-family" packages/frontend/src/app/globals.css
# Expected: no output

# 8. Confirm layout themeColor
grep -n "themeColor" packages/frontend/src/app/layout.tsx
# Expected: themeColor: "#1C1917",
```

---

## Execution

| Step | Agent | File(s) | Description |
|------|-------|---------|-------------|
| 1 | `cavecrew-builder` | `globals.css` | Steps A–F: Replace accent tokens, add brand tokens, remove unused tokens, remove wave animations, remove dark-mode media query, fix body typography |
| 2 | `cavecrew-builder` | `layout.tsx` | Step G: Update `themeColor` from `#0f172a` to `#1C1917` |
| 3 | Manual / bash | — | Run all verification commands from the Verification Commands section |
| 4 | `cavecrew-reviewer` | Both files | Review the diff for correctness: token values match plan, no accidental removals, no residual hardcoded colors |

**Execution order:** Steps 1 and 2 can run in parallel (they touch different files with no dependency). Step 3 runs after both complete. Step 4 runs after verification passes.

---

## Validation Plan

1. **Build**: `npx next build` in `packages/frontend` must exit 0 with no errors or warnings.
2. **Grep audit**: Run all 8 verification commands. Zero unexpected results.
3. **Visual spot-check**: Start dev server (`npx next dev`), open all three pages (`/`, `/speaker`, `/admin`), confirm warm palette visually.
4. **Token integrity**: Components using `bg-surface-primary`, `bg-accent`, `text-text-primary`, `border-surface-border` etc. must render correctly — only values change, not key names.

---

## Open Questions

None. All token mappings are fully specified in `docs/ui-redesign-plan.md`. Proceed directly.

---

## Expected Final State of globals.css

After all changes, the file should contain these token groups (in order):

```css
@import "tailwindcss";

@theme inline {
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);

  /* ── Surface colors ── */
  --color-surface-primary: #0C0A09;
  --color-surface-secondary: #1C1917;
  --color-surface-tertiary: #292524;
  --color-surface-border: #44403C;
  --color-surface-muted: #57534E;

  /* ── Text colors ── */
  --color-text-primary: #FAFAF9;
  --color-text-secondary: #A8A29E;
  --color-text-muted: #78716C;

  /* ── Accent colors ── */
  --color-accent: #A3424A;
  --color-accent-hover: #C25560;
  --color-accent-strong: #8B2D35;
  --color-accent-deep: #6B1D24;
  --color-accent-muted: #7A2830;

  /* ── Brand ── */
  --color-brand-maroon: #3C1518;
  --color-brand-cream: #E8E0D4;
  --color-surface-glass: rgba(28, 25, 23, 0.6);

  /* ── Status colors ── */
  --color-status-live: #22c55e;
  --color-status-live-bright: #4ade80;
  --color-status-error: #ef4444;
  --color-status-error-bright: #f87171;
  --color-status-error-dark: #7f1d1d;

  /* ── Overlay ── */
  --color-overlay: rgba(0, 0, 0, 0.5);

  /* ── Border radius scale ── */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* ── Animation utilities ── */
  --animate-fade-in-up: fadeInUp 0.3s ease-out;
  --animate-pulse-ring: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse-ring {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 0.4; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

body {
  background: var(--color-surface-primary);
  color: var(--color-text-primary);
}
```

---

## Expected Final State of layout.tsx

Only line 27 changes:

```typescript
  themeColor: "#1C1917",
```

(from the previous `"#0f172a"`).
