# UI Unit C: Page Refactor & Component Integration — Task Specification

## Source Artifacts / Handoff Context

- **Planning handoff**: `.ai/tasks/1719002000-ui-refactor/planning-handoff.md`
- **Project context**: `.ai/context.md`
- **Viewer page**: `packages/frontend/src/app/page.tsx` (449 lines) — live translation feed with TTS, auto-scroll, theme/font-size settings drawer
- **Speaker page**: `packages/frontend/src/app/speaker/page.tsx` (319 lines) — PIN-gated audio capture console with broadcast controls
- **Design tokens (Unit A)**: `packages/frontend/src/app/globals.css` lines 8–69 — `@theme inline` block defining surface, text, accent, status, theme, overlay, radius, and animation tokens
- **Reusable components (Unit B)**:
  - `Button.tsx` — variant/size/icon-aware button wrapper (62 lines)
  - `Card.tsx` — variant/padding-aware container (40 lines)
  - `StatusDot.tsx` — live/idle/error state indicator with optional label (40 lines)
  - `Icon.tsx` — named SVG icon lookup (Microphone, Play, Stop, Lock, Settings, Headphones, ChevronDown, Close, UnlockArrow) (162 lines)
- **Layout (Unit A)**: `packages/frontend/src/app/layout.tsx` — root layout with Geist fonts and PWA manifest

**Key tension**: Unit B components currently use hardcoded Tailwind color classes (e.g., `bg-indigo-600`, `text-slate-400`). The handoff mandates zero hardcoded Tailwind color classes. The implementer must update the Unit B components to consume design tokens from `@theme inline` as part of this refactor — this is an implementation-local decision that does not exceed the authority boundary.

## Scope

### 1. Update Unit B Components to Use Design Tokens

Replace hardcoded Tailwind color classes in `Button.tsx`, `Card.tsx`, and `StatusDot.tsx` with references to the design tokens defined in `globals.css` (`@theme inline` block). Examples:

| Hardcoded (current) | Design Token |
|---|---|
| `bg-indigo-600` | `bg-accent-strong` |
| `bg-slate-800` | `bg-surface-tertiary` |
| `text-slate-400` | `text-text-secondary` |
| `bg-green-500` | `bg-status-live` |
| `bg-red-500` | `bg-status-error` |
| `text-white` | `text-white` (may need a token if not already) |

### 2. Expand Icon Component

Add the following icon names to `Icon.tsx` that are used by the pages but not yet defined:

- **`Broadcast`** — megaphone/broadcast icon (path from speaker page header)
- **`Warning`** — triangle with exclamation (used in PIN error and broadcast error)
- **`ErrorCircle`** — circle with X mark (used in broadcast error banner)

### 3. Extract Composite Components

Create three new components in `packages/frontend/src/components/`:

#### 3a. `PinGate.tsx`

Extracted from `speaker/page.tsx` lines 76–137 (the PIN input form shown when not authenticated).

**Props**:
- `pinInput: string`
- `pinError: string | null`
- `rememberDevice: boolean`
- `onPinInputChange: (value: string) => void`
- `onRememberDeviceChange: (checked: boolean) => void`
- `onSubmit: (e: React.FormEvent) => void`

Replaces inline `<button type="submit">` with `<Button>`, inline lock/unlock-arrow SVGs with `<Icon>`, inline error warning SVG with `<Icon>`. The outer card wrapper should use `<Card>`.

#### 3b. `SettingsDrawer.tsx`

Extracted from `page.tsx` lines 342–446 (the settings overlay + drawer panel).

**Props**:
- `open: boolean`
- `fontSize: FontSize`
- `theme: Theme`
- `onFontSizeChange: (size: FontSize) => void`
- `onThemeChange: (theme: Theme) => void`
- `onClose: () => void`

Must include the fixed-position overlay (`bg-overlay`) and the sliding drawer panel. Theme swatches must use design tokens (e.g., `bg-theme-blue-bg`, `bg-theme-sepia-bg`, `bg-theme-light-bg`). Close button uses `<Icon name="Close">`.

#### 3c. `SegmentCard.tsx`

Extracted from `page.tsx` lines 291–310 (individual translation segment with timestamp and sequence number).

**Props**:
- `segment: TranslationSegment`
- `isLatest: boolean`
- `fontSizeClass: string` (applied to text content)

Uses `<Card variant="default">` (or `"accent"` when `isLatest`). Timestamp and sequence number displayed in muted text. Animation class `animate-fade-in-up` applied via token.

### 4. Refactor `page.tsx` (Viewer Page)

- Replace inline `<style>` block (lines 136–141) — animation `fadeInUp` already defined in `globals.css`; use `animate-fade-in-up`
- Replace header status dot (lines 147–158) with `<StatusDot state="live" label="LIVE" />` (or `"idle"` when disconnected, with appropriate labels). Note: `StatusDot` currently renders `aria-label={state}` but the original has `aria-label={connected ? 'Connected' : 'Disconnected'}` — the StatusDot component should accept an `ariaLabel` prop to preserve this, or the implementer may wrap it.
  - **Implementation decision**: Add optional `ariaLabel` prop to `StatusDot` to preserve exact accessibility
- Replace TTS button (lines 167–192) with `<Button variant="ghost" size="md" iconLeft={<Icon name="Headphones" />} aria-label="..." />` — use `iconOnly` handling
- Replace settings button (lines 195–215) with `<Button variant="ghost" size="md" iconLeft={<Icon name="Settings" />} />`
- Replace header `bg-slate-900/80` / `border-slate-800` with design tokens
- Replace empty-state microphone SVG (lines 226–241) with `<Icon name="Microphone" size="lg" />` and wrapper with design tokens
- Replace late-join greeting card (lines 254–282) with `<Card variant="accent">` and dismiss button with `<Button variant="ghost" size="sm" iconLeft={<Icon name="Close" />} />`
- Replace segment feed items (lines 291–310) with `<SegmentCard>`
- Replace scroll-to-bottom floating button (lines 314–337) with `<Button variant="primary" size="md" iconLeft={<Icon name="ChevronDown" />}>Scroll to bottom</Button>`
- Replace entire settings section (lines 342–446) with `<SettingsDrawer>` imported component
- Replace `THEME_CLASSES` mapping — use design tokens instead of hardcoded Tailwind color strings (e.g., `dark: 'bg-surface-primary text-text-primary'` using semantic tokens that map via `@theme inline`)
- Replace `FONT_SIZE_CLASSES` — keep as-is (these are functional, not color-related)
- All `aria-label` attributes preserved exactly

**Line target**: <200 lines

### 5. Refactor `speaker/page.tsx` (Speaker Page)

- Replace inline `<style>` block (lines 144–179) — all wave and pulse-ring animations already defined in `globals.css`; use `animate-wave-N` and `animate-pulse-ring`
- Replace loading spinner (lines 62–70) — use design tokens for container colors
- Replace entire PIN gate section (lines 76–137) with `<PinGate>` imported component
- Replace header broadcast icon (lines 184–188) with `<Icon name="Broadcast">`
- Replace header connection indicator (lines 196–205) — use `<StatusDot state={isListening ? 'live' : 'idle'} label="..." />` and adjust label to "LIVE BROADCAST" / "READY TO START". To handle the text color change (`text-green-400` vs `text-slate-400`), add a `labelClassName` prop to `StatusDot` or wrap the label outside the component.
  - **Implementation decision**: Add optional `labelClassName` prop to `StatusDot`
- Replace start/stop button (lines 217–242) with `<Button variant="primary" size="lg" iconLeft={<Icon name={isListening ? 'Stop' : 'Play'} size="lg" />}>{...}</Button>`. Note the original has a distinct gradient visual — the implementer may add a `"broadcast"` variant to Button or use `className` override on `<Button>`.
  - **Implementation decision**: Use `className` override on `<Button>` for the gradient styles mapped to design tokens
- Replace pulse-ring backdrop (line 213) — use `animate-pulse-ring`
- Replace volume visualizer bars — keep as-is (functional animation, not color-dependent)
- Replace error banner (lines 263–273) with `<Card variant="error" padding="lg">` and SVG replaced with `<Icon name="ErrorCircle" />` or `<Icon name="Warning" />` (depending on exact icon match)
- Replace lock console button (lines 306–314) with `<Button variant="secondary" size="md" iconLeft={<Icon name="Lock" />}>Lock Console</Button>`
- Replace all hardcoded container colors with design tokens

**Line target**: <150 lines

### 6. Update `globals.css` if Needed

If any animation tokens are missing (all wave and pulse-ring keyframes are already present, confirmed), no changes needed.

**Potential additions**:
- `animate-spin` — used for loading spinner; already standard Tailwind
- If any color token is missing for the new component scenarios, add it to the `@theme inline` block

## Non-Goals

- **No behavior changes**: Functionality (PIN gate, remember-me, broadcast, auto-scroll, TTS, settings, themes) must remain identical
- **No layout.tsx changes**: Root layout was handled in Unit A
- **No new features**: Pure refactor, no new capabilities
- **No structural changes**: Same routes, same public API surface
- **No PWA/service-worker changes**

## Execution

**Pipeline**: implementer → validator

### Implementer steps:

1. **Update `Button.tsx`**: Replace hardcoded Tailwind colors with design tokens
2. **Update `Card.tsx`**: Replace hardcoded Tailwind colors with design tokens
3. **Update `StatusDot.tsx`**: Replace hardcoded Tailwind colors with design tokens; add `ariaLabel` and `labelClassName` props
4. **Expand `Icon.tsx`**: Add `Broadcast`, `Warning`, `ErrorCircle` icon definitions
5. **Create `PinGate.tsx`**: Extract from speaker page
6. **Create `SettingsDrawer.tsx`**: Extract from viewer page
7. **Create `SegmentCard.tsx`**: Extract from viewer page
8. **Refactor `page.tsx`**: Replace inline styles/SVGs/buttons/cards/dots with components; remove `<style>` block; target <200 lines
9. **Refactor `speaker/page.tsx`**: Replace inline styles/SVGs/buttons/cards/dots with components; remove `<style>` block; target <150 lines
10. **Verify build**: Run `pnpm --filter frontend build`

### Validator steps:

1. Verify `pnpm --filter frontend build` passes with zero errors
2. Grep for hardcoded Tailwind color classes in `page.tsx`, `speaker/page.tsx`, and all `components/*.tsx` — expect zero matches for `bg-slate-`, `bg-indigo-`, `bg-red-`, `bg-green-`, `bg-blue-`, `bg-amber-`, `text-slate-`, `text-indigo-`, `text-red-`, `text-green-`, `text-blue-`, `text-amber-`, `border-slate-`, `border-indigo-`, `border-red-` (allow `text-white`, `text-black`, and functional utilities like `bg-black/50` for overlay)
3. Grep for `<style>` in `page.tsx` and `speaker/page.tsx` — expect zero matches
4. Count lines: `page.tsx` <200, `speaker/page.tsx` <150
5. Verify all extracted components exist: `PinGate.tsx`, `SettingsDrawer.tsx`, `SegmentCard.tsx`
6. Verify all `aria-label` attributes from original pages are preserved in refactored pages/components
7. Verify the Icon component's name union includes `Broadcast`, `Warning`, `ErrorCircle`
8. Verify all `@theme inline` tokens used have matching definitions in `globals.css`

## Testable Acceptance Criteria

### A. Build

| # | Criterion | Verification |
|---|-----------|-------------|
| A1 | `pnpm --filter frontend build` succeeds with no errors | Run build command |
| A2 | TypeScript compilation produces zero errors (strict mode) | Build step includes type-checking |

### B. No Hardcoded Colors

| # | Criterion | Verification |
|---|-----------|-------------|
| B1 | Zero hardcoded Tailwind color classes in `page.tsx` | Grep for `bg-slate-`, `bg-indigo-`, `bg-red-`, `bg-green-`, `bg-blue-`, `bg-amber-`, `text-slate-`, `text-indigo-`, `text-red-`, `text-green-`, `text-blue-`, `text-amber-`, `border-slate-`, `border-indigo-`, `border-red-` |
| B2 | Zero hardcoded Tailwind color classes in `speaker/page.tsx` | Same grep |
| B3 | Zero hardcoded Tailwind color classes in all `components/*.tsx` files | Same grep across all components |
| B4 | All color classes resolve to `@theme inline` tokens (e.g., `bg-surface-primary`, `text-text-secondary`, `border-surface-border`) | Visual inspection or grep for token names |

### C. No Inline Styles

| # | Criterion | Verification |
|---|-----------|-------------|
| C1 | No `<style>` block in `page.tsx` | Grep for `<style>` |
| C2 | No `<style>` block in `speaker/page.tsx` | Grep for `<style>` |
| C3 | No `<style>` block in any component file | Grep across components/ |

### D. Extracted Components

| # | Criterion | Verification |
|---|-----------|-------------|
| D1 | `PinGate.tsx` exists in `packages/frontend/src/components/` | File exists |
| D2 | `SettingsDrawer.tsx` exists in `packages/frontend/src/components/` | File exists |
| D3 | `SegmentCard.tsx` exists in `packages/frontend/src/components/` | File exists |
| D4 | All extracted components use PascalCase named exports | Verify `export function PinGate` etc. |

### E. Line Count Targets

| # | Criterion | Verification |
|---|-----------|-------------|
| E1 | `page.tsx` is under 200 lines | `wc -l page.tsx` |
| E2 | `speaker/page.tsx` is under 150 lines | `wc -l speaker/page.tsx` |

### F. Accessibility Preservation

| # | Criterion | Verification |
|---|-----------|-------------|
| F1 | All original `aria-label` values preserved | Manually compare old page to new page + components |
| F2 | All `aria-pressed` values preserved (font size and theme buttons) | Verify in `SettingsDrawer.tsx` |
| F3 | All `role` attributes preserved (settings dialog) | Verify in `SettingsDrawer.tsx` |
| F4 | All `aria-hidden` attributes preserved (overlay) | Verify in `SettingsDrawer.tsx` |

### G. Component Integration

| # | Criterion | Verification |
|---|-----------|-------------|
| G1 | All `<button>` elements in both pages use `<Button>` component | Grep for `<button` — only `<Button` should appear (except in extracted components that wrap Button) |
| G2 | All inline SVG elements replaced by `<Icon>` component | Grep for `<svg` — only in `Icon.tsx` |
| G3 | All status dot patterns use `<StatusDot>` | Grep for status dot pattern `w-2.5 h-2.5 rounded-full` — only in `StatusDot.tsx` |
| G4 | All card patterns use `<Card>` | Grep for `bg-slate-900/80` in page files — zero matches |
| G5 | All animation classes reference globals.css tokens or standard Tailwind | Verify `animate-fade-in-up`, `animate-wave-N`, `animate-pulse-ring`, `animate-spin` |

### H. Behavior Preservation

| # | Criterion | Verification |
|---|-----------|-------------|
| H1 | Page `page.tsx` still uses `subscribeToLiveSermon` and renders segments | Manual or visual regression |
| H2 | Speaker page PIN gate, remember-me, lock console all functional | Manual testing |
| H3 | TTS toggle, auto-scroll, scroll-to-bottom still work | Manual testing |
| H4 | Settings drawer opens/closes, font size and theme changes apply | Manual testing |
| H5 | All four themes (dark, blue, sepia, light) render correctly | Visual verification |

### Test File Paths

No automated test files are expected for this UI refactor unit. Testing is manual/visual plus static analysis (build, grep, line count). If component unit tests are desired, they should be co-located:

- `packages/frontend/src/components/PinGate.test.tsx`
- `packages/frontend/src/components/SettingsDrawer.test.tsx`
- `packages/frontend/src/components/SegmentCard.test.tsx`

## Inspectable Acceptance Criteria

### I1: Design Token Coverage

All visual styles in the pages and components should trace to a `@theme inline` token definition in `globals.css`. The implementer should verify that every used token class (e.g., `bg-surface-primary`, `text-accent`, `border-status-error`) has a corresponding `--color-*` definition in the `@theme inline` block.

A manual audit checklist:
- Surface tokens: `surface-primary`, `surface-secondary`, `surface-tertiary`, `surface-border`, `surface-muted`
- Text tokens: `text-primary`, `text-secondary`, `text-muted`
- Accent tokens: `accent`, `accent-hover`, `accent-strong`, `accent-deep`, `accent-muted`
- Status tokens: `status-live`, `status-live-bright`, `status-error`, `status-error-bright`, `status-error-dark`, `status-error-bg`
- Theme tokens: `theme-blue-bg`, `theme-blue-text`, `theme-sepia-bg`, `theme-sepia-text`, `theme-sepia-border`, `theme-light-bg`, `theme-light-text`, `theme-light-border`
- Overlay: `overlay`
- Radius tokens: `radius-sm`, `radius-md`, `radius-lg`, `radius-xl`, `radius-2xl`, `radius-full`

### I2: Component Boundary Cleanliness

Each extracted component should be self-contained:
- `PinGate` owns the PIN form layout, validation display, and remember-me checkbox
- `SettingsDrawer` owns the overlay, drawer panel, font-size selector, and theme selector
- `SegmentCard` owns the segment display, timestamp, and sequence number

Pages should import and compose these components without duplicating their internal markup.

### I3: Icon Coverage

The `Icon` component's `name` union type must include all icons used by the pages. Verify:
- Viewer page uses: Microphone, Headphones, Settings, Close, ChevronDown
- Speaker page uses: Lock, UnlockArrow, Play, Stop, Broadcast, Warning, ErrorCircle
- No inline `<svg>` remains in any page file

## Relevant Files

| File | Role | Change Type |
|------|------|-------------|
| `packages/frontend/src/app/globals.css` | Design tokens and animations | Read-only (reference for token names) |
| `packages/frontend/src/components/Button.tsx` | Button component | **Modify** — replace hardcoded colors with tokens |
| `packages/frontend/src/components/Card.tsx` | Card component | **Modify** — replace hardcoded colors with tokens |
| `packages/frontend/src/components/StatusDot.tsx` | Status dot component | **Modify** — replace hardcoded colors with tokens; add `ariaLabel` and `labelClassName` props |
| `packages/frontend/src/components/Icon.tsx` | Icon component | **Modify** — add Broadcast, Warning, ErrorCircle icon definitions |
| `packages/frontend/src/components/PinGate.tsx` | PIN gate component | **Create** |
| `packages/frontend/src/components/SettingsDrawer.tsx` | Settings drawer component | **Create** |
| `packages/frontend/src/components/SegmentCard.tsx` | Segment card component | **Create** |
| `packages/frontend/src/app/page.tsx` | Viewer page | **Rewrite** — compose from components; target <200 lines |
| `packages/frontend/src/app/speaker/page.tsx` | Speaker page | **Rewrite** — compose from components; target <150 lines |

## Validation Plan

1. **Build check**: `cd packages/frontend && pnpm build` — must pass with zero errors
2. **Hardcoded color audit**:
   ```bash
   rg 'bg-(slate|indigo|red|green|blue|amber)-' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx
   rg 'text-(slate|indigo|red|green|blue|amber)-' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx
   rg 'border-(slate|indigo|red|green|blue|amber)-' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx
   ```
   Same across all `packages/frontend/src/components/*.tsx` files.
3. **Inline style audit**: `rg '<style>' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx` — expect zero matches
4. **Line count**: `wc -l` on both page files
5. **Component existence**: Verify `PinGate.tsx`, `SettingsDrawer.tsx`, `SegmentCard.tsx` exist
6. **Inline SVG audit**: `rg '<svg' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx` — expect zero matches (all SVGs in Icon.tsx only)
7. **Accessibility audit**: Manual grep for all `aria-` attributes from original pages, verify they appear in refactored pages or components
8. **Functional smoke test**: Run the dev server and verify both routes load without errors, theme switcher works, PIN gate renders

## Open Questions

1. **Button gradient for broadcast button**: The speaker page start/stop button uses `bg-gradient-to-br from-indigo-600 to-indigo-800` (or red for stop). The current `Button` component only supports solid background colors. The implementer should either:
   - Add a `broadcast` variant to `Button` with gradient support
   - Use `className` override on `<Button>` with token-based gradient classes (e.g., using CSS custom properties)

   **Resolved**: Use `className` override. The implementer may define gradient utility classes in `globals.css` if Token-based gradients are needed.

2. **StatusDot label color change**: The speaker page header changes label color based on connection state (`text-green-400` vs `text-slate-400`). The current `StatusDot` component uses a fixed label color (`text-slate-400`). The implementer should add a `labelClassName` prop.

   **Resolved**: Add `labelClassName` prop to `StatusDot`.

3. **StatusDot aria-label vs state**: The current `StatusDot` uses `state` for `aria-label` (e.g., `aria-label="live"`). The viewer page uses `aria-label="Connected"` / `aria-label="Disconnected"`. Add an `ariaLabel` prop to `StatusDot` to override the default.

   **Resolved**: Add `ariaLabel` prop to `StatusDot`.

4. **THEME_CLASSES and FONT_SIZE_CLASSES location**: Currently in `page.tsx`. After refactoring, should these move to `SettingsDrawer.tsx`? Since `SettingsDrawer` imports them, they should live in `SettingsDrawer.tsx`. The page only needs to pass the resolved `themeClass`/`fontSizeClass` to the root div — these can remain as local constants in the page file or be moved to a shared constants file.

   **Resolved**: Move `THEME_CLASSES` (now using tokens) and `FONT_SIZE_CLASSES` to `SettingsDrawer.tsx`. The `FONT_SIZE_LABELS` and `THEME_LABELS` maps should also move there. The page file retains only the state and the theme/font-size class application to the root div.
