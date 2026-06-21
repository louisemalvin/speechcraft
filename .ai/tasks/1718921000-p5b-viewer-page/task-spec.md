# Task Specification: Phase 5B — Congregation Viewer Page

## Source Artifacts / Handoff Context

- **Planning handoff**: `.ai/tasks/1718921000-p5b-viewer-page/planning-handoff.md` — canonical scope and constraints.
- **Implementation plan Step 3**: `docs/implementation-plans/phase-5-viewer-tts.md` — `/` page layout spec, scroll behavior, TTS integration.
- **Frontend spec**: `docs/frontend-spec.md` sections "Congregation Live Stream Page" and "UI Components & Design System" — full design spec including dark theme colors, header bar, settings drawer states, and scroll-lock behavior.
- **`liveSync.ts`** (Phase 5A): `packages/frontend/src/services/realtime/liveSync.ts` exports `subscribeToLiveSermon(onSegmentReceived: (s: TranslationSegment) => void): () => void`. The `TranslationSegment` interface is `{ sequence_number, raw_text, translated_text, timestamp }`.
- **`TextToSpeechService.ts`** (Phase 5A): `packages/frontend/src/services/speech/TextToSpeechService.ts` exports class `TextToSpeechService` with `setEnabled(status: boolean): void` and `speak(text: string): void`.
- **Existing page**: `packages/frontend/src/app/page.tsx` is the Next.js scaffold — to be fully replaced.
- **Root layout**: `packages/frontend/src/app/layout.tsx` wraps with `<body className="min-h-full flex flex-col">` — no changes needed.
- **Project conventions** (`.ai/context.md`): Tailwind CSS only, Next.js App Router, kebab-case files, PascalCase React components, named exports preferred.

## Scope

**One file only**: `packages/frontend/src/app/page.tsx`

The root route `/` page, a `'use client'` React component that renders the congregation live stream viewer. The page must:

1. **Realtime subscription**: Call `subscribeToLiveSermon` from `liveSync.ts` on mount, pushing each received `TranslationSegment` into React state as a chronologically ordered list. Unsubscribe on unmount.

2. **Segment list state**: Maintain `Segment[]` in state (sharing the `TranslationSegment` interface from `liveSync.ts`). Append new segments in arrival order.

3. **Scroll container**:
   - Render segments in a scrollable viewport.
   - On new segment arrival, auto-scroll to bottom.
   - On user scroll-up (detected via `onScroll` handler comparing `scrollTop + clientHeight < scrollHeight - 50`), pause auto-scroll and show a floating "Scroll to bottom" button.
   - Clicking the button scrolls to bottom and re-enables auto-scroll.

4. **Header control bar**:
   - **Live status dot**: green (`bg-green-500` with glow/pulse) when WebSocket is connected, red (`bg-red-500`) on disconnect. Derive from presence/absence of segments plus a connection state tracked alongside the subscription.
   - **Sermon title**: display a static title ("Live Translation") or derive from context.
   - **TTS toggle**: headphone icon button (🎧 or SVG). Toggles `TextToSpeechService.setEnabled()`. Visual active/inactive state.
   - **Settings gear icon**: opens the settings drawer.

5. **TTS integration**: Instantiate `TextToSpeechService` once via `useRef`. When TTS is enabled, call `ttsRef.current.speak(segment.translated_text)` for each new segment.

6. **Settings drawer**: A slide-in or overlay panel toggled from the header gear icon:
   - **Font size**: SM (`text-sm`), MD (`text-base`), LG (`text-lg`), XL (`text-xl`), 2XL (`text-2xl`).
   - **Theme**: Dark (default, `bg-slate-950 text-slate-100`), Midnight Blue (`bg-blue-950 text-blue-50`), Sepia (`bg-amber-50 text-amber-950`), Light (`bg-white text-gray-900`).
   - Settings applied via React state, propagated through `className` on the root container.

7. **Animations**: Smooth fade-in and slide-up transitions on new segment entries (CSS transition/animation via Tailwind).

8. **Empty state**: When `segments.length === 0`, render a centered message: "Waiting for the sermon to begin..."

9. **Late-join state**: When segments exist but the connection is fresh (detected by a flag set after first subscription), optionally render a brief greeting card "Live Translation Active. Text will scroll as the speaker talks." that dismisses on first scroll or after a timeout. (Keep simple: show above the feed when segments exist and is initial load.)

10. **Responsive design**: Works on mobile phones (the congregation's devices). Full-viewport height layout. Touch-friendly tap targets.

11. **Dark theme premium styling**: Colors as specified — `bg-slate-950`, `bg-slate-900` (cards/containers), `text-slate-100`, accent `indigo-500` / `indigo-400`. No external UI libraries.

## Non-Goals

- No changes to `layout.tsx`, `globals.css`, or any other existing file.
- No speaker page changes (`/speaker`).
- No Supabase configuration changes.
- No backend or edge function logic.
- No PWA/service worker changes (already in layout).
- No separate component files — all UI lives in `page.tsx`.
- No tests at this stage (acceptance is manual visual verification).

## Execution

**Pipeline**: implementer → validator

### Implementer Instructions

1. **Read the source artifacts** listed above to understand the existing service interfaces (`subscribeToLiveSermon`, `TextToSpeechService`, `TranslationSegment`).

2. **Replace `packages/frontend/src/app/page.tsx`** entirely. The new file must start with `'use client';`.

3. **Imports**: Import `subscribeToLiveSermon` from `@/services/realtime/liveSync` and `TextToSpeechService` from `@/services/speech/TextToSpeechService`. Use the `TranslationSegment` type from `liveSync.ts`.

4. **State management**:
   - `segments: TranslationSegment[]` — chronological list.
   - `ttsEnabled: boolean` — TTS toggle state.
   - `autoScroll: boolean` — whether auto-scroll is active.
   - `fontSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl'` — font size setting.
   - `theme: 'dark' | 'blue' | 'sepia' | 'light'` — theme setting.
   - `settingsOpen: boolean` — drawer visibility.
   - `connected: boolean` — WebSocket connection status (set true on first segment received, false on disconnect or if subscription errors; or track via channel status if available).

5. **Refs**: `ttsRef = useRef<TextToSpeechService>(new TextToSpeechService())`. `scrollContainerRef = useRef<HTMLDivElement>(null)`.

6. **Subscription**: In `useEffect` on mount, call `subscribeToLiveSermon` and push segments into state. Return the unsubscribe function.

7. **TTS**: In a `useEffect` watching `segments`, when a new segment arrives and `ttsEnabled` is true, call `ttsRef.current.speak(segment.translated_text)`.

8. **Auto-scroll logic**: `useEffect` on `segments`: if `autoScroll` is true, scroll container to bottom. `onScroll` handler: if user scrolls up beyond 50px from bottom, set `autoScroll = false`; if user manually scrolls to bottom, set `autoScroll = true`.

9. **Theme/font CSS mapping**: Build `className` strings from state. Theme colors per spec:
   - dark: `bg-slate-950 text-slate-100`
   - blue: `bg-blue-950 text-blue-50`
   - sepia: `bg-amber-50 text-amber-950`
   - light: `bg-white text-gray-900`
   - Font sizes: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`.

10. **Build verification**: Run `pnpm --filter frontend build` to confirm no TypeScript or build errors.

### Validator Instructions

Validate against the acceptance criteria below. Confirm:

- Build succeeds.
- Visual inspection of all states (empty, segments, scroll behavior, TTS, settings drawer, themes, responsive).
- WebSocket subscription lifecycle (mount/unmount).
- All 11 acceptance signals from the planning handoff pass.

## Testable Acceptance Criteria

1. **Route rendering**: Navigating to `http://localhost:3000/` renders the congregation viewer page (not the Next.js scaffold).

2. **WebSocket lifecycle**: On page mount, a Supabase Realtime subscription to `sermon-live` channel is established. On page unmount (navigate away or close tab), the subscription is cleaned up.

3. **Segment rendering**: When a `translation_segment` broadcast is received, the segment renders in the feed in chronological order with a visible fade-in/slide animation.

4. **Auto-scroll**: When a new segment arrives, the scroll container automatically scrolls to the bottom.

5. **Scroll lock**: When the user scrolls up manually (more than ~50px above the bottom), auto-scroll pauses and a floating "Scroll to bottom" button appears.

6. **Scroll restore**: Clicking the "Scroll to bottom" button re-enables auto-scroll and scrolls to the bottom.

7. **Live status dot**: Shows green (with glow/pulse) when connected; shows red when disconnected.

8. **TTS toggle**: Enabling the headphone toggle causes new translated segments to be spoken aloud via browser TTS. Disabling the toggle stops speech and prevents future segments from being spoken.

9. **Settings drawer — font size**: Changing font size in the settings drawer applies the correct Tailwind text class to the segment feed.

10. **Settings drawer — theme**: Changing the theme applies the correct background/text color scheme to the entire page.

11. **Empty state**: When no segments have been received, the page displays "Waiting for the sermon to begin..."

12. **Late-join state**: When segments exist (from prior broadcasts during the same page session) and the connection is live, a brief indicator communicates that translation is active and text will scroll.

13. **Build**: `pnpm --filter frontend build` completes without errors.

### Test File Paths

No automated test files are required for this phase. Acceptance is manual:
- Start the Next.js dev server (`pnpm --filter frontend dev`).
- Open `http://localhost:3000` in a browser.
- Trigger mock broadcast events from the Supabase Dashboard or browser console to simulate incoming segments.
- Verify all criteria above visually and behaviorally.

## Inspectable Acceptance Criteria

1. **Code**: `page.tsx` starts with `'use client';` directive.
2. **Code**: Uses `subscribeToLiveSermon` from `liveSync.ts` (not a local reimplementation).
3. **Code**: Uses `TextToSpeechService` from `TextToSpeechService.ts` (instantiated once via `useRef`).
4. **Code**: No external UI component libraries imported (Tailwind CSS only).
5. **Code**: All interactive elements (toggle, settings gear, drawer controls, scroll button) have appropriate `aria-label` attributes for accessibility.
6. **Code**: Cleanup function from `subscribeToLiveSermon` is returned from `useEffect` for proper unmount teardown.

## Relevant Files

| File | Role | Action |
|------|------|--------|
| `packages/frontend/src/app/page.tsx` | Root congregation viewer page | **Replace entirely** |
| `packages/frontend/src/services/realtime/liveSync.ts` | Realtime subscription (Phase 5A) | Read only — import `subscribeToLiveSermon` |
| `packages/frontend/src/services/speech/TextToSpeechService.ts` | Browser TTS (Phase 5A) | Read only — import `TextToSpeechService` |
| `packages/frontend/src/app/layout.tsx` | Root layout wrapper | No changes needed |
| `packages/frontend/src/lib/supabaseClient.ts` | Supabase client singleton | No changes needed (used by liveSync) |

## Validation Plan

1. **Build check**: `pnpm --filter frontend build` — must succeed with zero errors.
2. **Dev server**: `pnpm --filter frontend dev` — page loads without console errors.
3. **Empty state**: Load the page with no active broadcast — verify "Waiting for the sermon to begin..." message.
4. **Segment feed**: Trigger a mock `translation_segment` broadcast (via Supabase Dashboard Realtime inspector or programmatic channel send) — verify the segment appears with animation.
5. **Auto-scroll**: Send multiple segments rapidly — verify auto-scroll keeps the view at the bottom.
6. **Scroll lock**: Scroll up manually — verify the "Scroll to bottom" button appears and auto-scroll pauses. Send a new segment — verify it does NOT auto-scroll. Click the button — verify it scrolls to bottom and auto-scroll re-engages.
7. **Status dot**: Verify green when subscription is active (segment received). Disconnect network or trigger an error — verify red indicator.
8. **TTS**: Enable headphone toggle, send a segment — verify browser speaks the `translated_text` aloud. Disable toggle mid-speech — verify speech stops.
9. **Settings — font size**: Cycle through all five sizes — verify text in the feed resizes correctly.
10. **Settings — theme**: Cycle through all four themes — verify background and text colors change correctly across the entire page.
11. **Responsive**: Resize browser to mobile widths (320px–428px) — verify layout remains usable, no horizontal overflow, tap targets are adequate.
12. **Unmount cleanup**: Navigate away from `/` to `/speaker` — verify no console errors, subscription is torn down (no duplicate segments on return).

## Open Questions

- **Connection status granularity**: The Supabase Realtime channel object may not expose a direct "connected/disconnected" event in the current API surface. The implementer may need to derive connection status from whether segments have been received recently (e.g., set `connected = true` on first segment, `false` after a timeout with no segments). This is an implementation-local decision.
- **Late-join indicator timing**: The handoff mentions a greeting card for late-join. The implementer can choose between showing it for a fixed duration (e.g., 3 seconds) or dismissing it on first user interaction. Either approach is acceptable as long as the message is shown.
- **Settings persistence**: The handoff and frontend spec do not mention persisting settings across sessions. The implementer may optionally persist font size and theme to `localStorage`, but this is not required. The default behavior is in-memory state only (reset on page reload).
