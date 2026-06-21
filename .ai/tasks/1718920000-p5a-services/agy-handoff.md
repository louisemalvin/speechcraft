# Agy Handoff — Phase 5A: Realtime Subscription & TTS Service

## Implementer Persona and Boundaries

You are the Implementer Agent.

Own implementation only after the task is specified and approved in `.ai/tasks/<NNN>-<task-id>/task-spec.md`. You are a custom implementation subagent used by orchestrator.

Responsibilities:

- Read `.ai/context.md` (use the `read` tool — `glob` does not match dot-directories reliably) and the task spec before editing.
- Read the files listed in the task spec's `## Relevant Files` section. If those files import or reference other files you need to understand, read those too — but only as far as needed. Do not explore unrelated parts of the codebase.
- Make the smallest correct change that satisfies the task spec.
- Preserve unrelated user changes.
- Run the smallest relevant verification when practical.
- Write `.ai/tasks/1718920000-p5a-services/implementation-report.md` with sections: Outcome, Files Changed, Decisions, Verification. Include Known Issues only if there are any.
- Run the project's test suite (using the test runner from `.ai/context.md` — read it with the `read` tool, as `glob` is unreliable for `.ai/` paths). Confirm that the task-specific tests pass. If pre-existing baseline tests fail, note them as Known Issues but do not chase them.

Boundaries:

- Do not edit `.ai/tasks/**` except the task's `implementation-report.md` and `agy-handoff.md`.
- Do not edit `.ai/context.md` or `.ai/decisions/**`.
- Do not add backward compatibility, dependencies, abstractions, new files, or broad rewrites unless the task spec requires them.
- Do not commit, amend, or push.
- Do not write test files — the test-writer agent owns tests. Only write implementation source code.
- Do not modify the agy configuration or toggle. The `agy: enabled` flag in `.ai/context.md` is user-owned.

If requirements are unclear, destructive, security-sensitive, or conflict with the task spec, stop and report back to orchestrator.

Default report back:

- Changes made.
- Implementation report path.
- Verification run.
- Open issues, risks, or follow-up needed.
- Test results — pass/fail counts and any failures.

---

## Orchestrator Command

Implement Phase 5A: Realtime Subscription & TTS Service.

**Task spec**: `.ai/tasks/1718920000-p5a-services/task-spec.md`
**Planning handoff**: `.ai/tasks/1718920000-p5a-services/planning-handoff.md`

Create:
1. `packages/frontend/src/services/realtime/liveSync.ts` — subscribeToLiveSermon using the supabase client from `../../lib/supabaseClient`
2. `packages/frontend/src/services/speech/TextToSpeechService.ts` — browser TTS class

After implementation, verify `tsc --noEmit` passes (from packages/frontend), then write the implementation report to: `.ai/tasks/1718920000-p5a-services/implementation-report.md`

---

## Task Spec

Path: `.ai/tasks/1718920000-p5a-services/task-spec.md`

### Scope

Create two backendless TypeScript service modules that the congregation viewer page (Phase 5B) will consume:

1. **`packages/frontend/src/services/realtime/liveSync.ts`**
   - Exports `subscribeToLiveSermon(onSegmentReceived)` function.
   - Connects to the `sermon-live` Supabase Realtime channel.
   - Listens for `translation_segment` broadcast events.
   - Returns a cleanup function `() => void` that unsubscribes from the channel.
   - Import supabase from `../../lib/supabaseClient` (NOT inline `createClient`).

2. **`packages/frontend/src/services/speech/TextToSpeechService.ts`**
   - Exports `TextToSpeechService` class.
   - `setEnabled(status: boolean)` — toggles TTS on/off; disabling cancels ongoing speech.
   - `speak(text: string)` — speaks the given English text using the browser Web Speech Synthesis API.
   - Voice selection: prefers English voices with `Natural`, `Google`, or `Siri` in the name, with a fallback to any English voice.
   - Rate: 1.0 (standard speed).

### Non-Goals

- The `/` congregation viewer page itself (Phase 5B).
- The `/speaker` page.
- Supabase config changes.
- Any React components, hooks, or JSX.
- Persistent storage or database writes.
- Server-side functionality.

### Files to Create / Modify

| File | Action | Description |
|------|--------|-------------|
| `packages/frontend/src/services/realtime/liveSync.ts` | Create (new directory `realtime/`) | Supabase Realtime subscription helper |
| `packages/frontend/src/services/speech/TextToSpeechService.ts` | Create (in existing `speech/` dir) | Browser TTS manager class |

### Implementation Notes

- **Supabase client import**: Use the existing client from `packages/frontend/src/lib/supabaseClient.ts` (named export `supabase`). Do **not** create a new `createClient()` call inline.
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

### Testable Acceptance Criteria

1. `liveSync.ts` exports `subscribeToLiveSermon` — accepts a single callback parameter `onSegmentReceived`.
2. Channel named `sermon-live`, listens for `translation_segment`.
3. Returns cleanup function `() => void` that calls `channel.unsubscribe()`.
4. `TextToSpeechService.ts` exports a class with private `synth` and `enabled` members.
5. `setEnabled(false)` calls `synth.cancel()`. `setEnabled(true)` sets the enabled flag. `speak()` does nothing when `enabled` is `false`.
6. `speak(text)` calls `synth.cancel()` first, creates utterance with rate 1.0, calls `synth.speak(utterance)`.
7. Voice selection: prefers English voices with `Natural`/`Google`/`Siri` in the name; falls back to any English voice.
8. `tsc --noEmit` in `packages/frontend` passes with zero errors for both new files.

### Inspectable Acceptance Criteria

- **Import path**: `liveSync.ts` imports from `../../lib/supabaseClient` (relative to `packages/frontend/src/services/realtime/`), not from `@supabase/supabase-js` directly.
- **Named exports only**: Both files use `export function` / `export class`, no `export default`.
- **No JSX or React imports**: Neither file imports React, React hooks, or renders components.
- **Type safety**: Callback parameter and payload are typed (not `any`). A shared `TranslationSegment` interface may be defined or inlined.
- **kebab-case filenames**: `liveSync.ts` and `TextToSpeechService.ts` — `TextToSpeechService` is PascalCase (class file convention from existing codebase); `liveSync.ts` is camelCase function file.

---

## Project Context

From `.ai/context.md`:

- **Test Framework**: Vitest
- **Runner**: `npx vitest` (or `pnpm vitest`)
- **Test file pattern**: `*.test.ts` (co-located with source files)
- **Conventions**: TypeScript strict mode, named exports over default exports, kebab-case files/directories, camelCase functions/variables, PascalCase types/interfaces/classes.
- **No unused variables or imports** (enforced by TS config).
- **Agy**: `enabled`

---

## Relevant Files

### 1. `packages/frontend/src/lib/supabaseClient.ts`
Full contents:
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### 2. `packages/frontend/src/services/speech/` (existing directory)
Contains: `AudioOrchestrator.ts`, `DeepgramSpeechProvider.ts`, `SpeechToTextProvider.ts`, `WebSpeechProvider.ts`
All class files use PascalCase naming (e.g., `AudioOrchestrator.ts`, `WebSpeechProvider.ts`).

### 3. `packages/frontend/tsconfig.json`
- `strict: true`, `noEmit: true`, `jsx: "react-jsx"`, target ES2017
- `lib: ["dom", "dom.iterable", "esnext"]` (includes SpeechSynthesis types natively)
- `moduleResolution: "bundler"`

### 4. `docs/realtime-broadcast.md`
Broadcast payload schema:
```typescript
{
  sequence_number: number;
  raw_text: string;
  translated_text: string;
  timestamp: number;
}
```

### 5. `docs/implementation-plans/phase-5-viewer-tts.md`
Code blueprints (Steps 1-2) — NOTE: The code blueprints show inline `createClient` which is **superseded** by the task spec. Import from `../../lib/supabaseClient` instead.

---

## Report Path

`/home/ltanaka/github/translation-service/.ai/tasks/1718920000-p5a-services/implementation-report.md`

---

## Verification Commands

```bash
# TypeScript compilation check
cd /home/ltanaka/github/translation-service/packages/frontend && pnpm tsc --noEmit
```

---

## Constraints and Non-Goals

- Do NOT create inline `createClient()` call; import existing `supabase` from `../../lib/supabaseClient`.
- Do NOT create test files.
- Do NOT create React components, hooks, or JSX.
- Do NOT modify Supabase config.
- Do NOT commit, amend, or push.
- Do NOT edit `.ai/context.md` or `.ai/decisions/**`.
- Do NOT add backward compatibility, dependencies, abstractions, new files, or broad rewrites beyond what the task spec requires.
- Named exports only (no `export default`).
- TypeScript strict mode — all types must be explicit, no `any`.

---

## Stop Conditions

Stop and report back to orchestrator if:
- Requirements are unclear, destructive, or security-sensitive.
- There is a conflict between the task spec and the existing codebase.
- Pre-existing test failures block verification.
- The `tsc --noEmit` check fails with errors from the new files and cannot be resolved with reasonable edits.

---

## Explicit Instructions

1. Create the `packages/frontend/src/services/realtime/` directory.
2. Create `packages/frontend/src/services/realtime/liveSync.ts` with:
   - Named export `subscribeToLiveSermon(onSegmentReceived: (segment: TranslationSegment) => void): () => void`
   - Import `supabase` from `../../lib/supabaseClient`
   - Inline or shared `TranslationSegment` interface with `sequence_number`, `raw_text`, `translated_text`, `timestamp`
   - `supabase.channel('sermon-live')` with `.on('broadcast', { event: 'translation_segment' }, ...)` and `.subscribe()`
   - Returns cleanup function calling `channel.unsubscribe()`
3. Create `packages/frontend/src/services/speech/TextToSpeechService.ts` with:
   - Named export `TextToSpeechService` class
   - Private `synth` initialized as `typeof window !== 'undefined' ? window.speechSynthesis : null`
   - Private `enabled` boolean
   - `setEnabled(status: boolean)` — sets enabled, calls `synth.cancel()` when disabling
   - `speak(text: string)` — no-op if `!synth || !enabled`; otherwise cancel, create utterance with rate 1.0, select English voice prioritizing Natural/Google/Siri, then `synth.speak(utterance)`
4. **Preserve all unrelated existing files and code.**
5. After creating the files, run the verification command.
6. Write the implementation report at the specified report path.
7. **Do NOT commit, amend, or push.**
8. If anything goes wrong, write the report with the details and report back to orchestrator.
