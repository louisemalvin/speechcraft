# Implementation Report: Phase 3 — Viewer Page Redesign

## Outcome

Complete rewrite of `packages/frontend/src/app/page.tsx` from teleprompter model to scrolling chat-feed model. All verifications pass.

## Files Changed

| File | Action |
|------|--------|
| `packages/frontend/src/app/page.tsx` | Complete rewrite (188 lines → 201 lines) |

## Structural Changes

1. **Imports**: Removed `StatusDot`, `Card`; added `SegmentCard`. Kept `Icon`, `Button`.

2. **Constants**: Added `AUTO_SCROLL_THRESHOLD = 80` and `DISCONNECT_TIMEOUT_MS = 10_000`.

3. **State**: Removed `showGreeting`; added `isScrolledUp`. Kept `segments`, `ttsEnabled`, `connected`, `fontSizeIdx`.

4. **Refs**: Removed `hasReceivedSegmentRef`; added `scrollContainerRef` (HTMLDivElement) and `disconnectTimeoutRef` (timeout ID). Kept `ttsRef`, `prevSegmentsLengthRef`.

5. **useEffect 1 (subscription)**: Now clears/arms a 10s disconnect timeout on each segment arrival. Removed greeting show/hide logic. Removed `hasReceivedSegmentRef` guard. Cleanup clears timeout + unsubscribes + disables TTS.

6. **useEffect 2 (TTS speak)**: Kept exactly as-is.

7. **useEffect 3 (auto-scroll)**: NEW — scrolls to bottom on new segments only if user is within 80px of bottom.

8. **Callbacks**: Kept `toggleTts`; removed `dismissGreeting`; added `handleScroll` (sets `isScrolledUp`) and `jumpToLatest` (scrolls + resets flag).

9. **JSX**:
   - Root: `h-dvh w-full flex flex-col relative` (was `h-screen` → enables absolute positioning of jump button)
   - Header: stripped to brand-only "Speechcraft" text, no StatusDot
   - Error banner: NEW `role="alert"` with `aria-live="assertive"`, shows when `!connected && segments.length > 0`
   - Feed area: `<main>` with `ref={scrollContainerRef}` + `onScroll={handleScroll}`, `overflow-y-auto`
   - Empty state: centered with microphone icon, uses design tokens
   - Segment feed: `flex flex-col gap-8 max-w-4xl mx-auto` with `SegmentCard` per segment, `ALL_SIZES[fontSizeIdx]` for font
   - Jump button: absolute `bottom-20 right-6`, `bg-accent`, only visible when `isScrolledUp && segments.length > 0`
   - Footer: `role="toolbar"`, `bg-surface-glass`, [A-] label [A+] on left, `Button` (variant primary/secondary) with Volume icon on right

10. **Design tokens**: Zero hardcoded Tailwind color classes — every color reference uses design tokens (`bg-surface-primary`, `text-text-primary`, `bg-surface-secondary/80`, `border-surface-border`, `text-text-muted`, `bg-status-error-dark/40`, `border-status-error/40`, `text-status-error-bright`, `bg-accent`, `bg-surface-glass`, `bg-surface-tertiary`, `bg-surface-muted`).

## Verification

| Check | Result |
|-------|--------|
| Build (`pnpm build`) | ✅ Compiled successfully |
| Zero hardcoded Tailwind colors (`slate-`, `gray-`, etc.) | ✅ No matches |
| `SegmentCard` import exists | ✅ Line 8 |
| No `StatusDot` import | ✅ Not found |
| No `Card` import | ✅ Not found |
| No greeting/dismissGreeting/showGreeting | ✅ Not found |
| No teleprompter variables (`latestSegments`, etc.) | ✅ Not found |
| `scrollContainerRef`, `handleScroll`, `jumpToLatest`, `isScrolledUp` | ✅ All found |
| `disconnectTimeoutRef` | ✅ Found (lines 35,44,45,50,58,59) |
| `role="alert"` (error banner) | ✅ Line 115 |
| `role="toolbar"` (bottom bar) | ✅ Line 175 |

## Known Issues

None.
