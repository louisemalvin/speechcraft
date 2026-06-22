# Planning Handoff: Client-Side Translation Accumulation + Fix False Disconnects

## User Intent
1. **Translation accumulation**: Buffer Deepgram `is_final` results on the client side. Only send to the translate Edge Function when a sentence is complete (punctuation-driven), a silence timeout elapses, or a maximum segment count is reached. This replaces the current fire-on-every-fragment model.
2. **Fix false disconnect banner**: The viewer's 10s disconnect timeout fires when the speaker simply pauses (normal sermon behavior). Pausing is not a connection loss. The banner is misleading and alarming.

## Conversation-Derived Context
- Delay is acceptable — the audience has zero reference point for timing. A 4-second accumulation delay is invisible if the output reads like real sentences.
- Current pipeline: Deepgram → `is_final` only (no `punctuate`) → immediate translate call per fragment → broadcast. This produces 5+ API calls for what should be one flowing sentence.
- The `punctuate=true` flag on Deepgram is the prerequisite — without punctuation, there's no sentence-boundary signal for the accumulation logic to use.
- 4-second silence timeout chosen as the ceiling. 5 accumulated segments as safety valve.
- Side benefit: 60-70% fewer DeepSeek API calls = cost savings.

## Source Artifacts / Source Context
- `packages/frontend/src/services/speech/DeepgramSpeechProvider.ts` — add `&punctuate=true` to the WebSocket URL
- `packages/frontend/src/hooks/useAudioCapture.ts` — accumulation logic lives here (the `onTextCaptured` callback in `start()`)
- `packages/frontend/src/app/page.tsx` — viewer disconnect timeout needs fixing (currently 10s)
- `packages/frontend/src/app/speaker/page.tsx` — speaker page also uses `useAudioCapture`, benefits from accumulation too
- `supabase/functions/translate/index.ts` — already handles history context, no changes needed (just receives larger chunks now)
- `packages/shared/src/types.ts` — MAX_HISTORY_WINDOW = 3, no changes needed

## Proposed Task Shape
Two units, sequential:

### Unit 1: Fix false disconnect (quick, high-priority)
- Increase disconnect timeout from 10s to 60s, OR
- Remove the timeout-based detection entirely and rely on Supabase channel status, OR
- Make the banner less alarming (text change to "Waiting for speaker..." instead of "Connection lost")

**Recommendation**: Remove the disconnect detection entirely. The user already said in the earlier design conversation: "If translations stop, they'll notice — not because a dot turned red, but because nothing new is appearing." The 10s timeout was implemented anyway but it's wrong. A paused speaker is normal. Remove the banner logic and the `disconnectTimeoutRef`.

### Unit 2: Accumulation + punctuate
- Add `&punctuate=true` to Deepgram URL
- Replace immediate-translate callback with a buffer that accumulates fragments
- Fire translation when: sentence-ending punctuation (`.!?`), 4s silence timeout, or 5 accumulated segments
- Join accumulated fragments with space when sending to translate
- Sequence number increments per accumulated batch (not per fragment)

## Scope and Non-Goals

**In scope:**
- DeepgramSpeechProvider: add `&punctuate=true`
- useAudioCapture: accumulation logic with timer/count/sentence-detection
- page.tsx: remove or fix disconnect timeout
- sequence_number: one per accumulated batch

**Out of scope:**
- translate Edge Function (already handles whatever text it receives)
- DeepSeek prompt changes
- Viewer layout/styling
- Speaker page UI changes (uses same hook, benefits automatically)

## Constraints
- Build must pass
- Accumulation must not lose segments (edge case: user stops broadcast before timer fires)
- TTS should still speak per-fragment or per-batch? (Likely per-batch now — a complete sentence to speak)

## Acceptance Signals
- Punctuate flag added to Deepgram URL
- Fragments accumulate until `. ! ?` or 4s timeout or 5-segment cap
- Fewer translate Edge Function calls (observable in logs — not a code check)
- Disconnect banner no longer fires on speaker pauses
- Build passes
- Existing speaker/viewer flow still works (broadcast, subscription, TTS)

## Authority Boundary
Implementer may edit DeepgramSpeechProvider.ts, useAudioCapture.ts, page.tsx. May not edit the translate Edge Function, shared types, or any other files.

## Open Questions / Stop Conditions
1. **Disconnect fix**: Remove entirely, or just increase timeout? Default: remove the timeout-based detection. The Supabase Realtime channel handles actual disconnection natively — we don't need a timer hack.
2. **TTS per-batch**: When we accumulate 3 fragments into one translation, TTS speaks one complete sentence instead of 3 fragments. This is actually better. Confirm?
3. **Flush on stop**: When the speaker stops broadcasting (`orchestratorRef.current.stop()`), should we flush any accumulated-but-untranslated text? Yes — otherwise the last few seconds of speech are lost.
