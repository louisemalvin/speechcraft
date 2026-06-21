# Phase 5A: Realtime Subscription & TTS Service — Planning Handoff

- **User Intent**: Create the two backendless services the congregation viewer page uses: a Supabase Realtime subscription helper that listens for `translation_segment` broadcast events on the `sermon-live` channel, and a browser Text-to-Speech service that speaks translated English text aloud using the Web Speech Synthesis API.

- **Conversation-Derived Context**: Phase 5 is the final phase, decomposed into 2 units. Unit 5A creates the services that 5B (the `/` viewer page) consumes. These are pure TypeScript service modules — no React dependencies. The subscription uses the supabaseClient from 4D. The TTS service uses `window.speechSynthesis`.

- **Source Artifacts / Source Context**:
  - `docs/implementation-plans/phase-5-viewer-tts.md` — Steps 1-2 with code blueprints
  - `docs/frontend-spec.md` Section "Congregation Realtime Sync Interface" — subscription implementation
  - `docs/realtime-broadcast.md` — broadcast payload schema
  - `packages/frontend/src/lib/supabaseClient.ts` (from 4D)
  - `.ai/context.md` — TypeScript strict mode, named exports

- **Proposed Task Shape**: Single-unit task: create subscription helper and TTS service. Two files.

- **Assigned Output Path(s)**: `.ai/tasks/1718920000-p5a-services/task-spec.md` (single unit)

- **Scope and Non-Goals**:
  - IN SCOPE: `packages/frontend/src/services/realtime/liveSync.ts` (subscribeToLiveSermon function, connects to `sermon-live` channel, listens for `translation_segment` events, returns unsubscribe cleanup), `packages/frontend/src/services/speech/TextToSpeechService.ts` (class with enable/disable and speak methods, voice selection preferring English neural voices)
  - OUT OF SCOPE: `/` viewer page (5B), /speaker page, Supabase config changes

- **Constraints**:
  - `subscribeToLiveSermon(onSegmentReceived)` — returns a cleanup function `() => void`
  - Channel: `sermon-live`, event: `translation_segment`
  - Uses the supabase client from `../../lib/supabaseClient`
  - Payload schema: { sequence_number, raw_text, translated_text, timestamp }
  - `TextToSpeechService` class with: `setEnabled(status: boolean)`, `speak(text: string)`
  - `speak()` calls `synth.cancel()` first to avoid queue buildup, then `synth.speak(utterance)`
  - Voice selection: prefer `lang.startsWith('en')` voices with 'Natural', 'Google', or 'Siri' in name, fallback to any English voice
  - Rate: 1.0 standard speed
  - Guard: if `!enabled` or `!synth`, speak is a no-op
  - Named exports only
  - TypeScript strict mode

- **Acceptance Signals**:
  1. `liveSync.ts` exports `subscribeToLiveSermon` function
  2. Function creates channel named `sermon-live`, listens for `translation_segment` event
  3. Returns cleanup function that calls `channel.unsubscribe()`
  4. `TextToSpeechService.ts` exports a class
  5. `setEnabled(true/false)` — false cancels ongoing speech
  6. `speak(text)` — cancels previous, creates utterance with selected English voice
  7. Voice selection logic matches spec (prioritize neural/Google/Siri voices)
  8. Both files: `tsc --noEmit` compiles clean

- **Authority Boundary**: Task-planner formalizes the spec. Implementer creates two files. Validator confirms acceptance criteria. Phase 5 commits after 5B completes.

- **Open Questions / Stop Conditions**:
  - The supabaseClient from 4D uses `NEXT_PUBLIC_` env vars which are available at build time — this is fine
  - TTS voice availability varies by browser — the fallback to any English voice handles this
