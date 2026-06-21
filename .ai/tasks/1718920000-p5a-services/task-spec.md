# Phase 5A: Realtime Subscription & TTS Service — Task Specification

## Source Artifacts / Handoff Context

- **Planning Handoff**: `.ai/tasks/1718920000-p5a-services/planning-handoff.md` (canonical)
- **Implementation Plan**: `docs/implementation-plans/phase-5-viewer-tts.md` Steps 1-2 (code blueprints)
- **Frontend Spec**: `docs/frontend-spec.md` section "Congregation Realtime Sync Interface"
- **Broadcast Payload Schema**: `docs/realtime-broadcast.md`
- **Existing Supabase Client**: `packages/frontend/src/lib/supabaseClient.ts` (from Phase 4D; exports named `supabase`)
- **Project Conventions**: `.ai/context.md` — TypeScript strict mode, named exports, `kebab-case` files, `camelCase` functions, `PascalCase` types/classes

## Scope

Create two backendless TypeScript service modules that the congregation viewer page (Phase 5B) will consume:

1. **`packages/frontend/src/services/realtime/liveSync.ts`**
   - Exports `subscribeToLiveSermon(onSegmentReceived)` function.
   - Connects to the `sermon-live` Supabase Realtime channel.
   - Listens for `translation_segment` broadcast events.
   - Returns a cleanup function `() => void` that unsubscribes from the channel.

2. **`packages/frontend/src/services/speech/TextToSpeechService.ts`**
   - Exports `TextToSpeechService` class.
   - `setEnabled(status: boolean)` — toggles TTS on/off; disabling cancels ongoing speech.
   - `speak(text: string)` — speaks the given English text using the browser Web Speech Synthesis API.
   - Voice selection: prefers English voices with `Natural`, `Google`, or `Siri` in the name, with a fallback to any English voice.
   - Rate: 1.0 (standard speed).

## Non-Goals

- The `/` congregation viewer page itself (Phase 5B).
- The `/speaker` page.
- Supabase config changes.
- Any React components, hooks, or JSX.
- Persistent storage or database writes.
- Server-side functionality.

## Execution

### Pipeline

```
implementer → validator
```

### Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/services/realtime/liveSync.ts` | Create (new directory `realtime/`) | Supabase Realtime subscription helper |
| `packages/frontend/src/services/speech/TextToSpeechService.ts` | Create (in existing `speech/` dir) | Browser TTS manager class |

### Implementation Notes

- **Supabase client import**: Use the existing client from `packages/frontend/src/lib/supabaseClient.ts` (named export `supabase`). Do **not** create a new `createClient()` call inline. The handoff overrides the code blueprints in `phase-5-viewer-tts.md` and `frontend-spec.md` which show inline client creation.

- **Channel config**: `supabase.channel('sermon-live')` — a static channel name matching the broadcast channel used by the speaker-side Edge Function.

- **Event listener**: `.on('broadcast', { event: 'translation_segment' }, ({ payload }) => { ... })`

- **Payload shape**: `{ sequence_number: number, raw_text: string, translated_text: string, timestamp: number }`

- **Cleanup**: The returned function must call `channel.unsubscribe()`.

- **TTS guard**: `speak()` is a no-op if `!this.synth || !this.enabled`.

- **Queue prevention**: `speak()` calls `synth.cancel()` before `synth.speak()` to avoid backing up the speech queue with multiple rapid segments.

- **Voice selection** (in priority order):
  1. Voice with `lang.startsWith('en')` AND name includes `Natural` OR `Google` OR `Siri`
  2. Fallback: any voice with `lang.startsWith('en')`
  3. If no English voice found, `utterance.voice` is left unset (browser default).

- **SSR safety**: `TextToSpeechService` must guard against `window` being undefined (`typeof window !== 'undefined'`).

## Testable Acceptance Criteria

### 1. `liveSync.ts` exports `subscribeToLiveSermon`
- The module has a named export `subscribeToLiveSermon`.
- It accepts a single callback parameter `onSegmentReceived`.

### 2. Channel named `sermon-live`, listens for `translation_segment`
- The function calls `supabase.channel('sermon-live')`.
- It registers a broadcast listener for event `translation_segment`.

### 3. Returns cleanup function
- The return value is a `() => void` function.
- Calling the returned function invokes `channel.unsubscribe()`.

### 4. `TextToSpeechService.ts` exports a class
- The module has a named export `TextToSpeechService`.
- It is a class with private `synth` and `enabled` members.

### 5. `setEnabled(true/false)`
- `setEnabled(false)` calls `synth.cancel()` to stop any ongoing speech.
- `setEnabled(true)` sets the enabled flag.
- `speak()` does nothing when `enabled` is `false`.

### 6. `speak(text)`
- Calls `synth.cancel()` before creating a new utterance.
- Creates a `SpeechSynthesisUtterance` with the provided text.
- Sets `utterance.rate = 1.0`.
- Calls `synth.speak(utterance)`.

### 7. Voice selection matches spec
- Prefers English voices with `Natural`, `Google`, or `Siri` in the name.
- Falls back to any English voice.
- Uses `synth.getVoices()` to enumerate available voices.

### 8. TypeScript compiles clean
- `tsc --noEmit` in `packages/frontend` passes with zero errors for both new files.

### Test File Paths
- `packages/frontend/src/services/realtime/liveSync.test.ts`
- `packages/frontend/src/services/speech/TextToSpeechService.test.ts`

## Inspectable Acceptance Criteria

- **Import path**: `liveSync.ts` imports from `../../lib/supabaseClient` (relative to `packages/frontend/src/services/realtime/`), not from `@supabase/supabase-js` directly.
- **Named exports only**: Both files use `export function` / `export class`, no `export default`.
- **No JSX or React imports**: Neither file imports React, React hooks, or renders components.
- **Type safety**: Callback parameter and payload are typed (not `any`). A shared `TranslationSegment` interface may be defined or inlined.
- **kebab-case filenames**: `liveSync.ts` and `TextToSpeechService.ts` — note `TextToSpeechService` is PascalCase (class file convention from existing codebase: `AudioOrchestrator.ts`, `DeepgramSpeechProvider.ts`, `WebSpeechProvider.ts`, `SpeechToTextProvider.ts` all use PascalCase); `liveSync.ts` is camelCase function file.

## Relevant Files

| File | Role |
|------|------|
| `packages/frontend/src/lib/supabaseClient.ts` | Pre-configured Supabase client (named export `supabase`) |
| `packages/frontend/src/services/speech/SpeechToTextProvider.ts` | Existing interface in same `speech/` directory (no dependency, just co-location awareness) |
| `docs/realtime-broadcast.md` | Broadcast payload schema reference |
| `docs/implementation-plans/phase-5-viewer-tts.md` | Code blueprints (Steps 1-2; superseded on client import by handoff) |
| `docs/frontend-spec.md` | Subscription implementation reference (superseded on client import by handoff) |
| `.ai/context.md` | Project conventions (strict mode, named exports, kebab-case) |

## Validation Plan

1. Run `pnpm tsc --noEmit` from `packages/frontend` — zero errors from new files.
2. Verify `liveSync.ts` imports `supabase` from `../../lib/supabaseClient`.
3. Verify `subscribeToLiveSermon` accepts a callback and returns `() => void`.
4. Verify channel name is `'sermon-live'` and event is `'translation_segment'`.
5. Verify `TextToSpeechService` has `setEnabled(status: boolean)` and `speak(text: string)` public methods.
6. Verify `speak()` guards: no-op when `!synth || !enabled`.
7. Verify `speak()` cancel-then-speak pattern: `synth.cancel()` followed by `synth.speak(utterance)`.
8. Verify voice selection logic: `lang.startsWith('en')` with priority for `Natural`/`Google`/`Siri`.
9. Verify SSR guard: `typeof window !== 'undefined'` for `window.speechSynthesis`.
10. Verify no `export default`, no React imports, no JSX.

## Open Questions

- None. All decisions are resolved by the handoff, source artifacts, and existing codebase conventions.
