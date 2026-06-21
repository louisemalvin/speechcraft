# Phase 5B: Congregation Viewer Page — Planning Handoff

- **User Intent**: Build the public congregation live stream viewer at the root path `/` of the Next.js app. This page establishes a read-only WebSocket connection to the `sermon-live` Supabase Realtime channel, renders a scrolling feed of translated English text with auto-scroll, and provides a "Listen Live" TTS toggle for audio output. Premium dark theme optimized for dim church environments.

- **Conversation-Derived Context**: This is the FINAL unit of all 5 phases. All dependencies exist: monorepo (Phase 1), Supabase config (Phase 2), edge function (Phase 3), speaker console (Phase 4), and 5A services (realtime subscription + TTS). The page replaces/overwrites the default Next.js root page.tsx that was scaffolded in Phase 1.

- **Source Artifacts / Source Context**:
  - `docs/implementation-plans/phase-5-viewer-tts.md` Step 3 — / page layout spec
  - `docs/frontend-spec.md` Section "Congregation Live Stream Page" and "UI Components & Design System" — full design spec including scroll behavior, settings panel, states
  - `packages/frontend/src/services/realtime/liveSync.ts` (from 5A)
  - `packages/frontend/src/services/speech/TextToSpeechService.ts` (from 5A)
  - `.ai/context.md` — Tailwind CSS, Next.js App Router

- **Proposed Task Shape**: Single-unit task: create/update the root page with rich UI. One file.

- **Assigned Output Path(s)**: `.ai/tasks/1718921000-p5b-viewer-page/task-spec.md` (single unit)

- **Scope and Non-Goals**:
  - IN SCOPE: `packages/frontend/src/app/page.tsx` — 'use client' page with:
    - Realtime subscription using subscribeToLiveSermon from 5A
    - Chronological segment list state
    - Auto-scroll container: scrolls to bottom on new segments, pauses auto-scroll if user scrolls up, shows floating "Scroll to bottom" button
    - Header: live status dot (green when connected, red on disconnect), sermon title, TTS toggle (headphone icon)
    - TTS integration using TextToSpeechService: when enabled, speaks each new translated segment aloud
    - Settings drawer: font size (SM/MD/LG/XL/2XL), theme (Dark/Blue/Sepia/Light)
    - Dark theme: bg-slate-950, text-slate-100, indigo accents
    - Smooth fade/slide animations on new segments
    - Empty state: "Waiting for the sermon to begin..." message when no segments
    - Late-join state: clean greeting card "Live Translation Active. Text will scroll as the speaker talks."
  - OUT OF SCOPE: Speaker page, Supabase config, any backend logic

- **Constraints**:
  - 'use client' directive (uses browser APIs and React state)
  - Uses subscribeToLiveSermon from 5A and TextToSpeechService from 5A
  - Segment interface: { sequence_number, raw_text, translated_text, timestamp }
  - Auto-scroll: detect user scroll with onScroll handler, compare scrollTop vs scrollHeight
  - Floating "Scroll to bottom" button: appears when user scrolls up >50px from bottom
  - TTS: instantiate TextToSpeechService once (useRef), toggle via setEnabled
  - Theme/font settings: React state, applied via className on container
  - Dark theme colors: bg-slate-950, bg-slate-900, text-slate-100, accent indigo-500/indigo-400
  - Responsive: works on mobile phones (the congregation's devices)
  - Tailwind CSS only, no external UI libraries
  - The existing page.tsx from Phase 1 can be fully replaced

- **Acceptance Signals**:
  1. `/` route renders the congregation viewer page
  2. Subscribe to `sermon-live` channel on mount, unsubscribe on unmount
  3. Incoming segments render in chronological order with animations
  4. Auto-scroll works: scrolls to bottom on new segment
  5. Manual scroll up pauses auto-scroll and shows "Scroll to bottom" button
  6. Clicking "Scroll to bottom" restores auto-scroll
  7. Live status dot: green when connected
  8. TTS toggle: enabling speaks new segments, disabling stops speaking
  9. Settings drawer: font size and theme changes apply correctly
  10. Empty state shows "Waiting for sermon..." message
  11. `pnpm --filter frontend build` succeeds

- **Authority Boundary**: Task-planner formalizes the spec. Implementer creates the page. Validator confirms acceptance criteria. After validation, Phase 5 committed and pushed.

- **Open Questions / Stop Conditions**:
  - The Next.js scaffold may have a root layout.tsx with metadata — the page.tsx goes inside it, so layout changes shouldn't be needed
  - Stop if build fails
