# UI Unit C: Page Refactor & Component Integration — agy Handoff

## Implementer Persona and Boundaries

You are the Implementer Agent.

Own implementation only after the task is specified and approved in `.ai/tasks/<NNN>-<task-id>/task-spec.md`. You are a custom implementation subagent used by orchestrator.

Responsibilities:

- Read `.ai/context.md` and the task spec before editing.
- Read the files listed in the task spec's `## Relevant Files` section. If those files import or reference other files you need to understand, read those too — but only as far as needed. Do not explore unrelated parts of the codebase.
- Make the smallest correct change that satisfies the task spec.
- Preserve unrelated user changes.
- Run the smallest relevant verification when practical.
- Write `.ai/tasks/<NNN>-<task-id>/implementation-report.md` with sections: Outcome, Files Changed, Decisions, Verification. Include Known Issues only if there are any.
- Run the project's test suite. Confirm that the task-specific tests pass. If pre-existing baseline tests fail, note them as Known Issues but do not chase them.

Boundaries:

- Do not edit `.ai/tasks/**` except the task's `implementation-report.md` and `agy-handoff.md`.
- Do not edit `.ai/context.md` or `.ai/decisions/**`.
- Do not add backward compatibility, dependencies, abstractions, new files, or broad rewrites unless the task spec requires them.
- Do not commit, amend, or push.
- Do not write test files — the test-writer agent owns tests. Only write implementation source code.
- Do not modify the agy configuration or toggle.

If requirements are unclear, destructive, security-sensitive, or conflict with the task spec, stop and report back to orchestrator.

Default report back:
- Changes made.
- Implementation report path.
- Verification run.
- Open issues, risks, or follow-up needed.
- Test results — pass/fail counts and any failures.

---

## Orchestrator Command

Implement UI Unit C: Page Refactor & Component Integration.

**Task spec**: .ai/tasks/1719002000-ui-refactor/task-spec.md
**Planning handoff**: .ai/tasks/1719002000-ui-refactor/planning-handoff.md

---

## Task Spec

Full contents at: `.ai/tasks/1719002000-ui-refactor/task-spec.md`

The task covers 6 work areas:
1. Update Button, Card, StatusDot to use design tokens from globals.css (replace hardcoded Tailwind classes)
2. Expand Icon component with missing icons (Broadcast, Warning, ErrorCircle)
3. Extract PinGate.tsx from speaker page
4. Extract SettingsDrawer.tsx (with THEME_CLASSES relocation) from viewer page
5. Extract SegmentCard.tsx from viewer page
6. Refactor both pages: compose from components, remove ALL inline <style> blocks, remove ALL inline SVGs, target <200 lines for page.tsx and <150 for speaker/page.tsx

---

## Project Context

The project is a 0-Cost Real-Time Church Sermon Translation Pipeline (Indonesian → English).

- Frontend: Next.js + Tailwind CSS
- Package manager: pnpm
- Design tokens defined in `@theme inline` block in `globals.css`
- Existing components at `packages/frontend/src/components/`: Button.tsx, Card.tsx, StatusDot.tsx, Icon.tsx
- Test runner: `pnpm --filter frontend build`
- agy: enabled

---

## Relevant Files

### To Read Before Editing

#### 1. globals.css (design tokens - READ ONLY reference)
**Path**: `packages/frontend/src/app/globals.css`
Contains `@theme inline` block with token definitions:
- Surface tokens: `--color-surface-primary`, `--color-surface-secondary`, `--color-surface-tertiary`, `--color-surface-border`, `--color-surface-muted`
- Text tokens: `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`
- Accent tokens: `--color-accent`, `--color-accent-hover`, `--color-accent-strong`, `--color-accent-deep`, `--color-accent-muted`
- Status tokens: `--color-status-live`, `--color-status-live-bright`, `--color-status-error`, `--color-status-error-bright`, `--color-status-error-dark`, `--color-status-error-bg`
- Theme tokens: `--color-theme-blue-bg`, `--color-theme-blue-text`, `--color-theme-sepia-bg`, `--color-theme-sepia-text`, `--color-theme-sepia-border`, `--color-theme-light-bg`, `--color-theme-light-text`, `--color-theme-light-border`
- Overlay: `--color-overlay`
- Radius: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-2xl`, `--radius-full`
- Animations: `--animate-fade-in-up`, `--animate-wave-1` through `--animate-wave-5`, `--animate-pulse-ring`

#### 2. Button.tsx (MODIFY)
**Path**: `packages/frontend/src/components/Button.tsx`
Current hardcoded colors:
- `bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20` → use `bg-accent-strong hover:bg-accent text-white shadow-lg shadow-accent-strong/20`
- `bg-slate-800 border border-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-slate-300` → use `bg-surface-tertiary border border-surface-muted/50 text-text-secondary hover:bg-surface-muted hover:text-text-primary` (note: surface-muted is `#334155` which maps to slate-700)
- `text-slate-400 hover:text-slate-200 hover:bg-slate-800` → use `text-text-secondary hover:text-text-primary hover:bg-surface-tertiary`
- `focus-visible:outline-indigo-500` → use `focus-visible:outline-accent`

#### 3. Card.tsx (MODIFY)
**Path**: `packages/frontend/src/components/Card.tsx`
Current hardcoded colors:
- `bg-slate-900/80 border border-slate-800/50` → use `bg-surface-secondary/80 border border-surface-border/50`
- `bg-indigo-500/10 border border-indigo-500/20` → use `bg-accent/10 border border-accent/20`
- `bg-red-900/50 border border-red-500` → use `bg-status-error-dark/50 border border-status-error`

#### 4. StatusDot.tsx (MODIFY)
**Path**: `packages/frontend/src/components/StatusDot.tsx`
Current:
- `bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]` → `bg-status-live animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]` (keep shadow hardcoded as it's not a token, or use a token if available)
- `bg-slate-600` → `bg-surface-muted`
- `bg-red-500` → `bg-status-error`
- `text-slate-400` → `text-text-secondary`

**Add props**:
- `ariaLabel?: string` — overrides the default `aria-label={state}`
- `labelClassName?: string` — additional class for the label span

#### 5. Icon.tsx (MODIFY)
**Path**: `packages/frontend/src/components/Icon.tsx`

Add three new icons to the union type and ICON_MAP:

**Broadcast** (megaphone icon - from speaker page header lines 185-187):
```tsx
function BroadcastIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </SvgWrapper>
  );
}
```

**Warning** (triangle with exclamation - from speaker page lines 106-108):
```tsx
function WarningIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </SvgWrapper>
  );
}
```

**ErrorCircle** (circle with X - from speaker page lines 265-266):
```tsx
function ErrorCircleIcon({ sizeClass, className }: { sizeClass: string; className?: string }) {
  return (
    <SvgWrapper sizeClass={sizeClass} className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
    </SvgWrapper>
  );
}
```

Add to `IconProps['name']` union: `| 'Broadcast' | 'Warning' | 'ErrorCircle'`
Add to ICON_MAP: `Broadcast: BroadcastIcon, Warning: WarningIcon, ErrorCircle: ErrorCircleIcon`

#### 6. PinGate.tsx (CREATE)
**Path**: `packages/frontend/src/components/PinGate.tsx`

Extracted from `speaker/page.tsx` lines 76-137 (the PIN input form shown when not authenticated).

Props:
- `pinInput: string`
- `pinError: string | null`
- `rememberDevice: boolean`
- `onPinInputChange: (value: string) => void`
- `onRememberDeviceChange: (checked: boolean) => void`
- `onSubmit: (e: React.FormEvent) => void`

Must use:
- `<Card>` for the wrapper card (rounded-2xl → use `className="rounded-2xl"`)
- `<Icon name="Lock">` for the lock icon
- `<Icon name="Warning">` for the pin error icon
- `<Button variant="primary" size="lg" className="w-full" iconRight={<Icon name="UnlockArrow" />}>Unlock Console</Button>` for the submit button — note the original has `min-h-[48px]` which Button already provides, and the original has `rounded-xl`, `shadow-lg shadow-indigo-600/20`. The Button primary variant already has `shadow-lg shadow-accent-strong/20` and `rounded-lg`. Override the radius with `className="w-full rounded-xl"`.
- Lock icon container: use `bg-accent/10 border border-accent/20 text-accent`
- Title: `text-white` (keep)
- Labels: `text-text-secondary`
- Input: `bg-surface-primary border-surface-border text-text-primary placeholder-text-muted focus:ring-accent/50 focus:border-accent`
- Remember-me checkbox: style with accent tokens
- Error message: use `<Icon name="Warning" className="w-4 h-4" />` with `text-status-error`

#### 7. SettingsDrawer.tsx (CREATE)
**Path**: `packages/frontend/src/components/SettingsDrawer.tsx`

Extracted from `page.tsx` lines 342-446.

Props:
- `open: boolean`
- `fontSize: FontSize`
- `theme: Theme`
- `onFontSizeChange: (size: FontSize) => void`
- `onThemeChange: (theme: Theme) => void`
- `onClose: () => void`

Must include:
- Fixed overlay (`bg-overlay`) with `aria-hidden="true"`, onClick calls onClose
- Sliding drawer panel with `bg-surface-secondary border-l border-surface-border`
- Close button with `<Icon name="Close">`
- Font size selector with proper aria-labels and aria-pressed
- Theme selector with theme swatches using design tokens (e.g., for dark: `bg-surface-primary border-surface-muted`, for blue: `bg-theme-blue-bg border-theme-blue-text`, for sepia: `bg-theme-sepia-bg border-theme-sepia-text`, for light: `bg-theme-light-bg border-theme-light-border`)

**Must include the following constants moved from page.tsx**:
```typescript
type FontSize = 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type Theme = 'dark' | 'blue' | 'sepia' | 'light';

const FONT_SIZE_CLASSES: Record<FontSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
  '2xl': 'text-2xl',
};

export { type FontSize, type Theme, FONT_SIZE_CLASSES };
```

Note: `THEME_CLASSES` must be rewritten to use design tokens:
```typescript
const THEME_CLASSES: Record<Theme, string> = {
  dark: 'bg-surface-primary text-text-primary',
  blue: 'bg-theme-blue-bg text-theme-blue-text',
  sepia: 'bg-theme-sepia-bg text-theme-sepia-text',
  light: 'bg-theme-light-bg text-theme-light-text',
};
```

`FONT_SIZE_LABELS` and `THEME_LABELS` should also move here.

For the theme button styles, use `ring-2 ring-accent ring-offset-2 ring-offset-surface-secondary` for the selected state.

#### 8. SegmentCard.tsx (CREATE)
**Path**: `packages/frontend/src/components/SegmentCard.tsx`

Extracted from `page.tsx` lines 291-310.

Props:
- `segment: TranslationSegment` (has `translated_text: string`, `timestamp: string`, `sequence_number: number`)
- `isLatest: boolean`
- `fontSizeClass: string`

Uses `<Card variant={isLatest ? 'accent' : 'default'}>` with `animate-fade-in-up`.

The segment text uses `text-text-primary leading-relaxed`.
Timestamp uses `text-text-muted` text-xs.
Sequence number uses `text-text-muted` text-xs.

#### 9. page.tsx (REWRITE)
**Path**: `packages/frontend/src/app/page.tsx`

Target: <200 lines.

Import from components:
- `import { StatusDot } from '@/components/StatusDot';` (add `ariaLabel` prop usage)
- `import { Icon } from '@/components/Icon';`
- `import { Button } from '@/components/Button';`
- `import { Card } from '@/components/Card';`
- `import { SegmentCard } from '@/components/SegmentCard';`
- `import { SettingsDrawer, type FontSize, type Theme, FONT_SIZE_CLASSES } from '@/components/SettingsDrawer';`

Remove:
- THEME_CLASSES, FONT_SIZE_CLASSES, FONT_SIZE_LABELS, THEME_LABELS (moved to SettingsDrawer)
- Inline `<style>` block (lines 136-141)
- Inline SVGs (replace with `<Icon>`)
- Inline buttons (replace with `<Button>`)
- Inline status dot (replace with `<StatusDot>`)
- Inline card patterns (replace with `<Card>`)

Changes needed:
- Header: Replace manual status dot div (lines 147-158) with `<StatusDot state={connected ? 'live' : 'error'} label="LIVE" ariaLabel={connected ? 'Connected' : 'Disconnected'} />`
- Header: Replace TTS button (lines 167-192) with `<Button variant="ghost" size="md" iconLeft={<Icon name="Headphones" />} aria-label={...} className={ttsEnabled ? 'bg-accent/20 text-accent' : ''} />`
- Header: Replace settings button (lines 195-215) with `<Button variant="ghost" size="md" iconLeft={<Icon name="Settings" />} aria-label="Open settings" title="Settings" />`
- Header bg: use `bg-surface-secondary/80 backdrop-blur-sm border-b border-surface-border`
- Header title: `text-text-primary` instead of `text-slate-100`
- Empty state: Replace microphone SVG div (lines 225-241) with `<div className="... bg-surface-tertiary ..."><Icon name="Microphone" size="lg" className="text-text-muted" /></div>`
- Empty state text: use `text-text-secondary` and `text-text-muted`
- Late-join greeting: Replace with `<Card variant="accent" padding="md" className="relative">` + `<Button variant="ghost" size="sm" className="absolute top-2 right-2" iconLeft={<Icon name="Close" />} onClick={dismissGreeting} aria-label="Dismiss greeting" />`
- Segment feed: Replace manual divs with `<SegmentCard segment={seg} isLatest={idx === segments.length - 1} fontSizeClass={fontSizeClass} />`
- Scroll-to-bottom: Replace with `<Button variant="primary" size="md" iconLeft={<Icon name="ChevronDown" />} onClick={scrollToBottom} aria-label="Scroll to bottom" className="rounded-full" />`
- Settings overlay + drawer: Replace with `<SettingsDrawer open={settingsOpen} fontSize={fontSize} theme={theme} onFontSizeChange={setFontSize} onThemeChange={setTheme} onClose={() => setSettingsOpen(false)} />`

Note: FONT_SIZE_CLASSES is still needed in page.tsx to apply fontSizeClass to the root div. Import it from SettingsDrawer.

#### 10. speaker/page.tsx (REWRITE)
**Path**: `packages/frontend/src/app/speaker/page.tsx`

Target: <150 lines.

Import from components:
- `import { StatusDot } from '@/components/StatusDot';`
- `import { Icon } from '@/components/Icon';`
- `import { Button } from '@/components/Button';`
- `import { Card } from '@/components/Card';`
- `import { PinGate } from '@/components/PinGate';`

Remove inline `<style>` block (lines 144-179).
Remove all inline SVGs.

Changes:
- Loading state: Replace hardcoded colors with design tokens (`bg-surface-primary text-text-primary`, spinner border use accent tokens)
- PIN gate: Replace with `<PinGate pinInput={pinInput} pinError={pinError} rememberDevice={rememberDevice} onPinInputChange={...} onRememberDeviceChange={...} onSubmit={handlePinSubmit} />`
- Header: Replace broadcast icon with `<Icon name="Broadcast" />` in an accent container
- Header: Replace connection indicator with `<StatusDot state={isListening ? 'live' : 'idle'} label={isListening ? 'LIVE BROADCAST' : 'READY TO START'} labelClassName={isListening ? 'text-status-live-bright' : 'text-text-secondary'} />`
- Start/Stop button: Use `<Button variant="primary" size="lg" iconLeft={<Icon name={isListening ? 'Stop' : 'Play'} size="lg" />} onClick={isListening ? stop : start} className="w-48 h-48 rounded-full flex-col gap-2 !p-0 shadow-2xl bg-gradient-to-br from-accent-strong to-accent-deep hover:from-accent-hover hover:to-accent-strong text-white [&_.inline-flex]:mb-1" />` — NOTE: The button needs to be circular with gradient. The `variant="primary"` classes will be overridden by className since className is appended last. Use `className` override for the gradient and shape.
- Pulse ring backdrop line 213: use `animate-pulse-ring`
- Volume visualizer: keep as-is (already uses wave animations from globals.css)
- Error banner: Replace with `<Card variant="error" padding="lg" className="flex items-start gap-3">` + `<Icon name="ErrorCircle" className="w-5 h-5 text-status-error-bright shrink-0 mt-0.5" />` + error text content
- Lock console button: Replace with `<Button variant="secondary" size="md" iconLeft={<Icon name="Lock" />} onClick={handleLock}>Lock Console</Button>`
- Text panels: Replace hardcoded colors with design tokens (e.g., `bg-surface-secondary/50 border border-surface-border/80`, `bg-accent/15 border border-accent-muted/35`)
- All `aria-label` values preserved exactly

---

## Report Path

**Absolute path**: `/home/ltanaka/github/translation-service/.ai/tasks/1719002000-ui-refactor/implementation-report.md`

---

## Verification Commands

After all edits, run:
```bash
cd /home/ltanaka/github/translation-service && pnpm --filter frontend build 2>&1
```

Then verify:
```bash
# No hardcoded colors in page files
rg 'bg-(slate|indigo|red|green|blue|amber)-' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx
rg 'text-(slate|indigo|red|green|blue|amber)-' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx
rg 'border-(slate|indigo|red|green|blue|amber)-' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx

# No inline style blocks
rg '<style>' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx

# No inline SVGs
rg '<svg' packages/frontend/src/app/page.tsx packages/frontend/src/app/speaker/page.tsx

# Line counts
wc -l packages/frontend/src/app/page.tsx
wc -l packages/frontend/src/app/speaker/page.tsx

# Component existence
ls -la packages/frontend/src/components/PinGate.tsx packages/frontend/src/components/SettingsDrawer.tsx packages/frontend/src/components/SegmentCard.tsx
```

---

## Constraints and Non-Goals

- **No behavior changes**: Functionality (PIN gate, remember-me, broadcast, auto-scroll, TTS, settings, themes) must remain identical
- **No layout.tsx changes**: Root layout was handled in Unit A
- **No new features**: Pure refactor, no new capabilities
- **No structural changes**: Same routes, same public API surface
- **No PWA/service-worker changes**
- **No test files**: Tests owned by test-writer agent
- **No committing, amending, or pushing**
- **No editing `.ai/tasks/**` except implementation-report.md and agy-handoff.md
- **No editing `.ai/context.md` or `.ai/decisions/**`

---

## Stop Conditions

- Stop if build fails — fix build errors before proceeding
- Stop if requirements are unclear, destructive, security-sensitive, or conflict with the task spec — report back to orchestrator

---

## Explicit Instructions

1. Read all relevant files first before editing.
2. Update Button.tsx, Card.tsx, StatusDot.tsx, Icon.tsx first.
3. Create PinGate.tsx, SettingsDrawer.tsx, SegmentCard.tsx.
4. Rewrite page.tsx and speaker/page.tsx.
5. Preserve all unrelated changes.
6. Preserve all `aria-label`, `aria-pressed`, `aria-hidden`, `role` attributes.
7. The `@theme inline` tokens in globals.css map to Tailwind classes like `bg-accent-strong`, `text-text-secondary`, etc. Use these.
8. All semantic Tailwind classes derived from the `@theme inline` block are available because Tailwind v4 reads the `@theme` block and generates utility classes.
9. Run the build and fix any errors.
10. Write the implementation report at the specified path after completing all edits.
11. Do NOT commit, amend, or push any changes.
