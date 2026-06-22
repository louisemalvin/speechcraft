# Task Spec: Phase 3 — Viewer Page Redesign

## Objective

Replace the teleprompter display model (3-segment cascade with opacity fade) in the viewer page (`/`) with a scrolling chat-feed model. All segments equally readable, newest at bottom, smart auto-scroll. Remove StatusDot, greeting card, and all hardcoded Tailwind color classes.

## Source Artifacts / Handoff Context

- `docs/ui-redesign-plan.md` — Phase 3 section: full layout ASCII, feed behavior, header/bottom bar spec, state handling table, token replacements
- `packages/frontend/src/app/page.tsx` — current viewer page (teleprompter model)
- `packages/frontend/src/components/SegmentCard.tsx` — already created, one `<p>` with `animate-fade-in-up` + configurable className
- `packages/frontend/src/components/Icon.tsx` — available icon names: `Volume`, `Headphones`, `Microphone`, `Warning`, `ErrorCircle`, `Close`, etc.
- `packages/frontend/src/components/Button.tsx` — variant/size/iconLeft API
- `packages/frontend/src/services/speech/TextToSpeechService.ts` — `setEnabled(bool)`, `speak(text)` interface
- `packages/frontend/src/services/realtime/liveSync.ts` — `subscribeToLiveSermon(callback)` returns `() => void`; no built-in connection status tracking
- `packages/frontend/src/app/globals.css` — Phase 1 tokens already applied: `surface-primary`, `surface-secondary`, `surface-tertiary`, `surface-border`, `surface-muted`, `surface-glass`, `text-primary`, `text-secondary`, `text-muted`, `accent`, `accent-strong`, `accent-muted`, `status-error`, `status-error-bright`, `status-error-dark`, `animate-fade-in-up`

## Scope

Rewrite `packages/frontend/src/app/page.tsx` completely. Single file.

**In scope:**
- Replace teleprompter display with scrolling chat-feed
- Thin brand-only header ("Speechcraft"), no StatusDot, no LIVE indicator
- Error banner that appears only on connection loss (timeout-based detection)
- All segments in a scrollable container using `SegmentCard`
- Smart auto-scroll: pauses when user scrolls up, "↓" jump-to-latest button
- Bottom bar: `[A-]` label `[A+]` on left, "🔊 Read Aloud" Button on right
- TTS toggle moved from header to bottom bar
- No greeting card
- Every class uses a design token; zero hardcoded Tailwind color classes
- Connection loss detection: 10s timeout since last segment

**Out of scope:**
- Speaker page, admin page, backend, liveSync service, TTS service, SegmentCard, Button, Icon, globals.css — do not touch any file except `page.tsx`

## Files to Modify

| File | Action |
|------|--------|
| `packages/frontend/src/app/page.tsx` | Complete rewrite |

## Complete Rewrite Specification

### Imports

**Keep:**
```tsx
'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { subscribeToLiveSermon, type TranslationSegment } from '@/services/realtime/liveSync';
import { TextToSpeechService } from '@/services/speech/TextToSpeechService';
import { Icon } from '@/components/Icon';
import { Button } from '@/components/Button';
```

**Remove:**
- `StatusDot` import
- `Card` import (greeting card is removed)

**Add:**
```tsx
import { SegmentCard } from '@/components/SegmentCard';
```

### Constants (keep / modify)

**Keep exactly as-is:**
```tsx
const ALL_SIZES = ['text-sm', 'text-base', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl'] as const;
const MIN_FONT_IDX = 3; // 'text-xl'
const MAX_FONT_IDX = 7; // 'text-5xl'

const FONT_SIZE_LABELS: Record<number, string> = {
  3: 'XL',
  4: '2XL',
  5: '3XL',
  6: '4XL',
  7: '5XL',
};
```

**Add:**
```tsx
const AUTO_SCROLL_THRESHOLD = 80; // px from bottom to consider "at bottom"
const DISCONNECT_TIMEOUT_MS = 10_000; // 10 seconds
```

### State Variables

| State | Type | Init | Change from current |
|-------|------|------|---------------------|
| `segments` | `TranslationSegment[]` | `[]` | Same |
| `ttsEnabled` | `boolean` | `false` | Same |
| `connected` | `boolean` | `false` | Same (but now set false on timeout, not just init) |
| `fontSizeIdx` | `number` | `5` (text-3xl) | Same |
| `isScrolledUp` | `boolean` | `false` | **NEW** — drives "↓" button visibility |

**Remove:**
- `showGreeting` state — greeting card is gone

### Refs

| Ref | Type | Init | Change from current |
|-----|------|------|---------------------|
| `ttsRef` | `useRef<TextToSpeechService>` | `new TextToSpeechService()` | Same |
| `prevSegmentsLengthRef` | `useRef<number>` | `0` | Same (TTS diffing) |
| `scrollContainerRef` | `useRef<HTMLDivElement \| null>` | `null` | **NEW** — scroll container for auto-scroll |
| `disconnectTimeoutRef` | `useRef<ReturnType<typeof setTimeout> \| null>` | `null` | **NEW** — disconnect detection timeout ID |

**Remove:**
- `hasReceivedSegmentRef` — no longer needed (greeting card removed)

### useEffect Hooks

#### 1. Subscription + Disconnect Detection (`useEffect`, deps `[]`)

```tsx
useEffect(() => {
  const currentTts = ttsRef.current;
  const unsubscribe = subscribeToLiveSermon((segment: TranslationSegment) => {
    setSegments((prev) => [...prev, segment]);

    // Clear any pending disconnect timeout
    if (disconnectTimeoutRef.current !== null) {
      clearTimeout(disconnectTimeoutRef.current);
    }
    setConnected(true);

    // Arm disconnect timeout: if no segment in 10s, set connected=false
    disconnectTimeoutRef.current = setTimeout(() => {
      setConnected(false);
    }, DISCONNECT_TIMEOUT_MS);
  });

  return () => {
    unsubscribe();
    currentTts.setEnabled(false);
    if (disconnectTimeoutRef.current !== null) {
      clearTimeout(disconnectTimeoutRef.current);
    }
  };
}, []);
```

**Changes from current:**
- REMOVED `hasReceivedSegmentRef.current` check
- REMOVED `setShowGreeting(true)` + `setTimeout(() => setShowGreeting(false), 5000)`
- ADDED disconnect timeout logic: clear/set timeout on each segment arrival

#### 2. TTS Speak (`useEffect`, deps `[segments, ttsEnabled]`)

**Keep exactly as-is** from current code (no changes):
```tsx
useEffect(() => {
  if (ttsEnabled && segments.length > prevSegmentsLengthRef.current) {
    const newSegments = segments.slice(prevSegmentsLengthRef.current);
    for (const seg of newSegments) ttsRef.current.speak(seg.translated_text);
  }
  prevSegmentsLengthRef.current = segments.length;
}, [segments, ttsEnabled]);
```

#### 3. Auto-Scroll on New Segments (`useEffect`, deps `[segments]`)

**NEW:**

```tsx
useEffect(() => {
  const container = scrollContainerRef.current;
  if (!container) return;

  // Only auto-scroll if user is already at (or near) the bottom
  const distanceFromBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight;
  if (distanceFromBottom <= AUTO_SCROLL_THRESHOLD) {
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }
}, [segments]);
```

**Rationale:** Runs on every segments change. If user is at the bottom, scroll to the new bottom. If user has scrolled up, do nothing — the `isScrolledUp` detection is handled by the `onScroll` handler below (passive, no extra effect needed).

### Callbacks

**Keep:**
```tsx
const toggleTts = useCallback(() => setTtsEnabled(prev => { ttsRef.current.setEnabled(!prev); return !prev; }), []);
```

**Remove:**
- `dismissGreeting` — no greeting card

**Add:**
```tsx
const handleScroll = useCallback(() => {
  const container = scrollContainerRef.current;
  if (!container) return;
  const distanceFromBottom =
    container.scrollHeight - container.scrollTop - container.clientHeight;
  setIsScrolledUp(distanceFromBottom > AUTO_SCROLL_THRESHOLD);
}, []);

const jumpToLatest = useCallback(() => {
  const container = scrollContainerRef.current;
  if (!container) return;
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  setIsScrolledUp(false);
}, []);
```

### Token Replacement Mappings

Every hardcoded Tailwind color in the current page must be replaced. Here is the complete mapping — the implementer must use the **New** value, not the Current:

| Context (current) | Current | New (design token) |
|---|---|---|
| Root container bg | `bg-slate-950` | `bg-surface-primary` |
| Root container text | `text-slate-100` | `text-text-primary` |
| Header bg | `bg-slate-900/80` | `bg-surface-secondary/80` |
| Header border | `border-b border-slate-800` | `border-b border-surface-border` |
| Header h1 text | `text-slate-100` | `text-text-primary` |
| TTS active bg | `bg-accent` | `bg-accent` (keep, already token) |
| TTS active shadow | `shadow-[0_0_12px_rgba(99,102,241,0.6)]` | Remove entirely **or** use `shadow-accent/30` |
| TTS active border | `border border-accent/30` | `border border-accent/30` (keep) |
| TTS active scale | `scale-105` | Remove (belongs in `Button` component, not page) |
| TTS inactive text | `text-slate-400` | `text-text-secondary` |
| TTS inactive hover text | `hover:text-slate-100` | `hover:text-text-primary` |
| TTS inactive hover bg | `hover:bg-slate-800` | `hover:bg-surface-tertiary` |
| Bottom bar bg | `bg-slate-900/90` | `bg-surface-glass` |
| Bottom bar border | `border border-slate-800` | `border-t border-surface-border` |
| Bottom bar text | `text-slate-100` | `text-text-primary` |
| Bottom bar buttons hover | `hover:bg-slate-800` | `hover:bg-surface-tertiary` |
| Bottom bar buttons active | `active:bg-slate-700` | `active:bg-surface-muted` |
| Empty state circle bg | `bg-slate-900` | `bg-surface-secondary` |
| Empty state icon | `text-slate-500` | `text-text-muted` |
| Empty state title | `text-slate-300` | `text-text-primary` |
| Empty state subtitle | `text-slate-500` | `text-text-muted` |
| StatusDot label text | `text-slate-400` | **REMOVED** (no StatusDot) |
| **NEW: error banner bg** | — | `bg-status-error-dark/40` |
| **NEW: error banner border** | — | `border border-status-error/40` |
| **NEW: error banner text** | — | `text-status-error-bright` |
| **NEW: jump button bg** | — | `bg-accent` |
| **NEW: jump button text** | — | `text-text-primary` |

**Hard rule:** `grep` for `slate-`, `gray-`, `neutral-`, `zinc-`, `white` (as color), `red-`, `emerald-`, `indigo-`, `blue-`, `amber-`, `yellow-`, `green-` in the rewritten file must return **zero results**.

### JSX Structure

The `return` statement must produce this tree (pseudocode):

```
<div className="h-dvh w-full flex flex-col bg-surface-primary text-text-primary overflow-hidden">
  {/* ── Header ── */}
  <header className="flex items-center px-4 py-3 bg-surface-secondary/80 border-b border-surface-border backdrop-blur-sm flex-shrink-0">
    <h1 className="text-sm font-semibold tracking-tight text-text-primary">
      Speechcraft
    </h1>
  </header>

  {/* ── Error Banner ── */}
  {!connected && segments.length > 0 && (
    <div
      role="alert"
      aria-live="assertive"
      className="flex items-center gap-2 px-4 py-2 bg-status-error-dark/40 border-b border-status-error/40 text-status-error-bright text-sm flex-shrink-0"
    >
      <Icon name="Warning" size="sm" />
      <span>Connection lost. Reconnecting...</span>
    </div>
  )}

  {/* ── Feed Area ── */}
  <main
    ref={scrollContainerRef}
    onScroll={handleScroll}
    className="flex-1 overflow-y-auto overscroll-contain px-6 md:px-12 py-8 relative"
  >
    {segments.length === 0 ? (
      /* Empty state */
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center bg-surface-secondary">
            <Icon name="Microphone" size="lg" className="text-text-muted" />
          </div>
          <p className="text-lg font-medium text-text-primary">
            Waiting for the sermon to begin...
          </p>
          <p className="text-sm mt-2 text-text-muted">
            Live translation will appear here automatically
          </p>
        </div>
      </div>
    ) : (
      /* Segment feed */
      <div className="flex flex-col gap-8 max-w-4xl mx-auto">
        {segments.map((seg) => (
          <SegmentCard
            key={seg.sequence_number}
            translatedText={seg.translated_text}
            className={`${ALL_SIZES[fontSizeIdx]} leading-relaxed tracking-wide`}
          />
        ))}
        {/* Bottom spacer so last segment isn't flush against the edge */}
        <div className="h-4 flex-shrink-0" />
      </div>
    )}
  </main>

  {/* ── Jump-to-Latest Button ── */}
  {segments.length > 0 && isScrolledUp && (
    <button
      onClick={jumpToLatest}
      className="absolute bottom-20 right-6 z-30 w-10 h-10 rounded-full bg-accent text-text-primary shadow-lg flex items-center justify-center animate-fade-in-up"
      aria-label="Jump to latest translation"
      title="Jump to latest"
    >
      <span className="text-lg font-bold leading-none">↓</span>
    </button>
  )}
  {/* NOTE: The jump button is positioned absolutely within the relative parent.
      Use the root div (or main) with position: relative. The bottom-20 ensures
      it sits above the bottom bar. */}

  {/* ── Bottom Bar ── */}
  <footer
    role="toolbar"
    aria-label="Viewer controls"
    className="flex items-center justify-between px-4 py-3 bg-surface-glass backdrop-blur-md border-t border-surface-border flex-shrink-0"
  >
    {/* Font size controls */}
    <div className="flex items-center gap-1">
      <button
        onClick={() => setFontSizeIdx((prev) => Math.max(MIN_FONT_IDX, prev - 1))}
        disabled={fontSizeIdx === MIN_FONT_IDX}
        className="w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-tertiary text-text-primary active:bg-surface-muted"
        aria-label="Decrease font size"
      >
        A-
      </button>
      <span className="text-xs font-bold select-none min-w-[32px] text-center opacity-85 text-text-primary">
        {FONT_SIZE_LABELS[fontSizeIdx]}
      </span>
      <button
        onClick={() => setFontSizeIdx((prev) => Math.min(MAX_FONT_IDX, prev + 1))}
        disabled={fontSizeIdx === MAX_FONT_IDX}
        className="w-9 h-9 flex items-center justify-center rounded-full text-xs font-bold transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-tertiary text-text-primary active:bg-surface-muted"
        aria-label="Increase font size"
      >
        A+
      </button>
    </div>

    {/* Read Aloud button */}
    <Button
      variant={ttsEnabled ? 'primary' : 'secondary'}
      size="md"
      onClick={toggleTts}
      iconLeft={<Icon name="Volume" className="w-5 h-5" />}
      aria-label={ttsEnabled ? 'Disable read aloud' : 'Enable read aloud'}
    >
      {ttsEnabled ? 'Reading Aloud...' : 'Read Aloud'}
    </Button>
  </footer>
</div>
```

**Key structural notes:**

1. **Jump button positioning:** The root `<div>` (or a wrapper) needs `className="relative"` so the absolute-positioned jump button works. The simplest approach: add `relative` to the root div and use `bottom-20` on the button (above the footer).

2. **Footer vs. main ordering:** Footer comes after `<main>` in DOM order but is visually at the bottom because the flex layout stacks header → error → main(flex-1) → footer.

3. **Icon name for Read Aloud:** Use `"Volume"` (speaker icon), not `"Headphones"`. The design plan calls for "🔊" emoji in the spec but `Button` expects `iconLeft` as `ReactNode`. Use the `Icon` component with `name="Volume"` for the speaker SVG. Do NOT use literal emoji.

4. **TTS active button state:** Use `Button variant="primary"` when TTS is on (gives `bg-accent-strong` background) and `variant="secondary"` when off. Let the `Button` component handle styling — do not add custom className overrides for active state.

5. **Empty state centering:** `h-full` on the empty wrapper ensures it fills the scrollable main area and centers vertically.

6. **Gap between segments:** `gap-8` on the feed flex container. This uses Tailwind's spacing scale (2rem/32px) — no hardcoded color.

## Validation Plan

### Verification Commands

```bash
# 1. Build must pass
npx tsc --noEmit --project packages/frontend/tsconfig.json
# (or equivalent next build check)

# 2. Zero hardcoded Tailwind color classes in the rewritten file
grep -nE 'slate-|gray-|neutral-|zinc-|white\b|red-|emerald-|indigo-|blue-|amber-|yellow-|green-' \
  packages/frontend/src/app/page.tsx

# 3. SegmentCard import exists
grep -n "SegmentCard" packages/frontend/src/app/page.tsx

# 4. No StatusDot import
grep -n "StatusDot" packages/frontend/src/app/page.tsx
# expected: no output

# 5. No Card import
grep -n "from '@/components/Card'" packages/frontend/src/app/page.tsx
# expected: no output

# 6. No greeting/dismissGreeting references
grep -n "greeting\|dismissGreeting\|showGreeting" packages/frontend/src/app/page.tsx
# expected: no output

# 7. No teleprompter pattern (latestSegments, segBeforeThat, precedingSeg, latestSeg)
grep -n "latestSegments\|segBeforeThat\|precedingSeg\|latestSeg[^m]" packages/frontend/src/app/page.tsx
# expected: no output

# 8. Verify key structural elements exist
grep -n "scrollContainerRef\|handleScroll\|jumpToLatest\|isScrolledUp" packages/frontend/src/app/page.tsx
# expected: all found

grep -n "disconnectTimeoutRef" packages/frontend/src/app/page.tsx
# expected: found

grep -n "role=\"alert\"" packages/frontend/src/app/page.tsx
# expected: found (error banner)

grep -n "role=\"toolbar\"" packages/frontend/src/app/page.tsx
# expected: found (bottom bar)
```

## Execution

```
[ Implementer ] ──> [ Validator ]
```

- **Implementer**: Rewrite `packages/frontend/src/app/page.tsx` per this spec. Replace the entire file. Do not patch.
- **Validator**: Run all verification commands above. Confirm build passes. Report back which checks pass/fail.

## Testable Acceptance Criteria

- [ ] Build passes (`tsc --noEmit` or equivalent)
- [ ] Scrolling chat-feed display model — all segments render (not 3-segment teleprompter)
- [ ] Header shows only "Speechcraft" brand text
- [ ] No StatusDot component rendered
- [ ] No greeting card (`Card` component) rendered
- [ ] `SegmentCard` component used for every segment
- [ ] All segments same font size (controlled by `ALL_SIZES[fontSizeIdx]`)
- [ ] Zero hardcoded Tailwind color classes in the file
- [ ] Error banner with `role="alert"` appears when `connected` becomes `false` (disconnect timeout fires)
- [ ] Error banner does NOT appear before first segment arrives (empty state shown instead)
- [ ] Error banner dismisses when next segment arrives (`connected` back to `true`)
- [ ] "↓" jump button appears when user scrolls up (away from bottom)
- [ ] "↓" jump button scrolls to bottom and hides itself on click
- [ ] Auto-scroll to bottom on new segment when user is already at bottom
- [ ] Auto-scroll does NOT fire when user is scrolled up
- [ ] Bottom bar has `[A-]` label `[A+]` on the left
- [ ] Bottom bar has a labeled Button ("Read Aloud" / "Reading Aloud...") on the right
- [ ] TTS toggle works (calls `setEnabled(true/false)` and `speak()` on new segments)
- [ ] Empty state shows "Waiting for the sermon to begin..." when no segments
- [ ] Generous vertical spacing between segments (no text blurring)
- [ ] All interactive elements have `aria-label` (font buttons, TTS button, jump button)

## Open Questions

None. Full design decisions captured in the handoff and `docs/ui-redesign-plan.md`.
