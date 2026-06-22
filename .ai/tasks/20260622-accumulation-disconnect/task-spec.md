# Task Spec: Client-Side Translation Accumulation + Fix False Disconnects

## Objective

1. **Fix the false disconnect banner** on the viewer page by removing the 10-second timeout-based "Connection lost" detection entirely. The Supabase Realtime channel natively handles connection state — a paused speaker is normal sermon behavior, not a disconnection.
2. **Implement client-side translation accumulation** so that Deepgram `is_final` fragments are buffered on the speaker client and only sent to the translate Edge Function when a sentence boundary is reached (punctuation: `.`, `!`, `?`), a 4-second silence timeout elapses, or 5 fragments have accumulated. This replaces the current fire-on-every-fragment model, producing fewer, better-formed sentences for translation and reducing DeepSeek API calls by 60–70%.

## Source Artifacts / Handoff Context

- Planning handoff: `.ai/tasks/20260622-accumulation-disconnect/planning-handoff.md` — canonical context
- `packages/frontend/src/services/speech/DeepgramSpeechProvider.ts` — add `&punctuate=true` to line 19 WebSocket URL
- `packages/frontend/src/hooks/useAudioCapture.ts` — accumulation buffer, timer, flush logic
- `packages/frontend/src/app/page.tsx` — remove disconnect timeout, banner, connected state
- `packages/frontend/src/services/speech/AudioOrchestrator.ts` — read-only reference (no changes). Constructor: `(providerType, config, onTextCaptured, onVolumeChange?)`. `onTextCaptured` is passed to `provider.start()`.
- `supabase/functions/translate/index.ts` — read-only reference. Handles translate + broadcast. Already accepts arbitrary `raw_text` length; no changes needed.

## Confirmed Decisions

All three decisions are locked — no further deliberation needed:

| # | Decision | Rationale |
|---|----------|-----------|
| 1 | **Remove disconnect timeout entirely** (kill the banner, timer, and `disconnectTimeoutRef`) | Paused speaker is normal. If translations stop, users notice content absence. The 10s timeout is a false-alarm generator. |
| 2 | **4-second silence timeout** for accumulation flush | Chosen as the ceiling. Audience has zero reference point for timing; 4s of accumulated sentence reads vastly better than fragment-by-fragment. |
| 3 | **TTS per-batch** (natural consequence) | When 3 fragments accumulate into one translation, TTS speaks one complete sentence instead of 3 fragments. This is better UX. No code changes needed in the viewer TTS — it already speaks per-segment. |

## Scope

### In Scope
- `DeepgramSpeechProvider.ts`: add `&punctuate=true` to the Deepgram WebSocket URL
- `useAudioCapture.ts`: replace inline translate callback with accumulation buffer + flush function; flush remaining buffer on `stop()`
- `page.tsx`: remove `DISCONNECT_TIMEOUT_MS`, `connected` state, `disconnectTimeoutRef`, timeout logic in subscription `useEffect`, and error banner JSX
- Sequence number: increments per accumulated batch (not per fragment)

### Out of Scope
- Translate Edge Function (no changes — already handles whatever `raw_text` it receives)
- DeepSeek prompt changes
- Viewer layout/styling
- Speaker page UI (`speaker/page.tsx` — uses same `useAudioCapture` hook, benefits automatically)
- Shared types (`packages/shared/src/types.ts` — `MAX_HISTORY_WINDOW` unchanged)
- Supabase Realtime channel configuration
- `AudioOrchestrator.ts` (no changes — its constructor and `onTextCaptured` interface remain the same)

## Files to Modify

| File | Unit | Summary |
|------|------|---------|
| `packages/frontend/src/app/page.tsx` | 1 | Remove disconnect timeout and banner |
| `packages/frontend/src/services/speech/DeepgramSpeechProvider.ts` | 2 | Add `&punctuate=true` |
| `packages/frontend/src/hooks/useAudioCapture.ts` | 2 | Accumulation buffer, timer, flush logic |

---

## Unit 1: Fix False Disconnect (page.tsx)

### Exact Removals

1. **Line 23**: Delete the `DISCONNECT_TIMEOUT_MS` constant declaration.
2. **Line 28**: Delete the `connected` state variable and its `useState` initializer. Remove `connected` from the destructured `useState` line entirely (the `const [connected, setConnected] = useState(false);` line goes away).
3. **Lines 35**: Delete the `disconnectTimeoutRef` ref declaration.
4. **Lines 38–62** (subscription `useEffect`): Inside the `subscribeToLiveSermon` callback, remove the disconnect timeout logic block (lines 43–52) — the `clearTimeout`, `setConnected(true)`, and `setTimeout` arm. Keep only `setSegments((prev) => [...prev, segment])`. Also remove the `disconnectTimeoutRef` cleanup in the effect's return (lines 58–60). The subscription/unsubscription itself stays.
5. **Lines 112–122**: Delete the error banner JSX block entirely (`{!connected && segments.length > 0 && (...)}`).

### What Stays Unchanged in page.tsx
- All `segments` state and rendering
- TTS `useEffect` (per-segment speak — naturally becomes per-batch with accumulation)
- Auto-scroll logic
- Font size controls
- Jump-to-latest button
- Header, footer, toolbar

### After This Unit
The viewer page no longer has any disconnect detection. It simply subscribes to `sermon-live` and displays segments as they arrive. If segments stop arriving (speaker paused), nothing happens — the last segment remains on screen. The Supabase Realtime channel handles actual connection loss silently via its own reconnection mechanism.

---

## Unit 2: Translation Accumulation (DeepgramSpeechProvider.ts + useAudioCapture.ts)

### Step 1: Add Punctuate to Deepgram (DeepgramSpeechProvider.ts)

**File**: `packages/frontend/src/services/speech/DeepgramSpeechProvider.ts`

**Change**: On line 19, append `&punctuate=true` to the WebSocket URL.

**Before**:
```
'wss://api.deepgram.com/v1/listen?language=id&model=nova-2&encoding=linear16&sample_rate=16000',
```

**After**:
```
'wss://api.deepgram.com/v1/listen?language=id&model=nova-2&encoding=linear16&sample_rate=16000&punctuate=true',
```

This tells Deepgram to add sentence-ending punctuation (`.`, `!`, `?`) to `is_final` transcripts. Without this flag, the accumulation logic has no sentence-boundary signal and can't decide when to flush.

### Step 2: Accumulation Logic (useAudioCapture.ts)

**File**: `packages/frontend/src/hooks/useAudioCapture.ts`

#### 2.1: New Hook-Level Refs

Add two new refs alongside the existing ones (after line 27, before `const start`):

```typescript
const accumulationBufferRef = useRef<string[]>([]);
const accumulationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
```

#### 2.2: Restructure the `start()` Function

Replace the inline translate callback (lines 60–97) with accumulation logic. The new structure:

```
start() {
  // ... existing setup (PIN fetch, token fetch, channel subscribe) stays the same ...

  const pin = sessionStorage.getItem('speaker_pin') || '';

  // --- Flush function (defined inside start so it captures pin) ---
  const flushBuffer = async () => {
    const buffer = accumulationBufferRef.current;
    if (buffer.length === 0) return; // no-op on empty buffer

    // Clear the silence timer if active
    if (accumulationTimerRef.current !== null) {
      clearTimeout(accumulationTimerRef.current);
      accumulationTimerRef.current = null;
    }

    // Join all accumulated fragments with a single space
    const accumulatedText = buffer.join(' ');
    // Clear buffer immediately (before the async call)
    accumulationBufferRef.current = [];

    setLatestTranscribedText(accumulatedText);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('translate', {
        body: {
          raw_text: accumulatedText,
          history: historyRef.current,
          sequence_number: sequenceRef.current,
        },
        headers: { 'x-admin-pin': pin },
      });

      if (fnError) {
        throw new Error(`Translation server error: ${fnError.message || fnError}`);
      }

      const translatedText = data.translated_text;
      if (!translatedText) {
        throw new Error('Translation response missing translated_text');
      }

      setLatestTranslatedText(translatedText);

      // Update in-memory sliding history
      const updatedHistory = [...historyRef.current, { raw: accumulatedText, translated: translatedText }];
      if (updatedHistory.length > MAX_HISTORY_WINDOW) updatedHistory.shift();
      historyRef.current = updatedHistory;

      sequenceRef.current += 1;
    } catch (apiErr: unknown) {
      const errMsg = apiErr instanceof Error ? apiErr.message : String(apiErr);
      setError(`Translation failed: ${errMsg}`);
    }
  };

  // --- Accumulating onTextCaptured callback ---
  const onTextCaptured = (rawText: string) => {
    // Push the new fragment to the buffer
    accumulationBufferRef.current.push(rawText);

    // Check if THIS fragment (the most recent one) ends with sentence-ending punctuation
    const trimmed = rawText.trim();
    const lastChar = trimmed.charAt(trimmed.length - 1);
    if (lastChar === '.' || lastChar === '!' || lastChar === '?') {
      void flushBuffer();
      return;
    }

    // Safety valve: flush if 5 fragments have accumulated
    if (accumulationBufferRef.current.length >= 5) {
      void flushBuffer();
      return;
    }

    // Reset the 4-second silence timer
    if (accumulationTimerRef.current !== null) {
      clearTimeout(accumulationTimerRef.current);
    }
    accumulationTimerRef.current = setTimeout(() => {
      void flushBuffer();
    }, 4000);
  };

  // --- Orchestrator construction (unchanged interface, new callback) ---
  orchestratorRef.current = new AudioOrchestrator(
    providerType,
    { apiKey: token },
    onTextCaptured,              // <-- accumulating callback replaces inline translate
    (vol) => { setVolume(vol); }
  );

  await orchestratorRef.current.start();
  setIsListening(true);
  // ... error handling stays the same ...
}
```

#### 2.3: Restructure the `stop()` Function

Before stopping the orchestrator, flush any remaining accumulated fragments:

```typescript
const stop = async () => {
  // Flush any accumulated-but-untranslated text before tearing down
  if (accumulationBufferRef.current.length > 0) {
    // Clear timer if active
    if (accumulationTimerRef.current !== null) {
      clearTimeout(accumulationTimerRef.current);
      accumulationTimerRef.current = null;
    }

    const accumulatedText = accumulationBufferRef.current.join(' ');
    accumulationBufferRef.current = [];

    setLatestTranscribedText(accumulatedText);

    try {
      const pin = sessionStorage.getItem('speaker_pin') || '';
      const { data, error: fnError } = await supabase.functions.invoke('translate', {
        body: {
          raw_text: accumulatedText,
          history: historyRef.current,
          sequence_number: sequenceRef.current,
        },
        headers: { 'x-admin-pin': pin },
      });

      if (!fnError && data?.translated_text) {
        setLatestTranslatedText(data.translated_text);
        const updatedHistory = [...historyRef.current, { raw: accumulatedText, translated: data.translated_text }];
        if (updatedHistory.length > MAX_HISTORY_WINDOW) updatedHistory.shift();
        historyRef.current = updatedHistory;
        sequenceRef.current += 1;
      }
    } catch {
      // Best-effort flush on stop; silently ignore failures
    }
  }

  // Then stop the orchestrator (tears down audio)
  if (orchestratorRef.current) {
    await orchestratorRef.current.stop();
    orchestratorRef.current = null;
  }
  if (channelRef.current) {
    await channelRef.current.unsubscribe();
    channelRef.current = null;
  }
  setVolume(0);
  setIsListening(false);
};
```

**Note**: The stop flush duplicates some translate logic from `flushBuffer` because `stop()` doesn't have lexical access to the `flushBuffer` closure (it's defined inside `start()`). The stop-flush is intentionally simplified — it's a best-effort send; failures are silently ignored since the user is shutting down anyway.

#### 2.4: Cleanup `useEffect` (Unmount)

No changes needed. The existing cleanup calls `orchestratorRef.current.stop()` and `channelRef.current.unsubscribe()`. We do NOT add a flush here because component unmount means the user navigated away intentionally — there's no audience to receive the translation.

---

## Accumulation Algorithm (Detailed Specification)

### Data Structures

| Ref | Type | Purpose |
|-----|------|---------|
| `accumulationBufferRef` | `MutableRefObject<string[]>` | Holds Deepgram `is_final` fragment strings, in order of arrival |
| `accumulationTimerRef` | `MutableRefObject<ReturnType<typeof setTimeout> \| null>` | 4-second silence timer ID; `null` when no timer is active |

### Flow

```
onTextCaptured(rawText) fires:
  1. Push rawText → accumulationBufferRef.current
  2. Check most recent fragment's final character (after trim):
     - If '.' or '!' or '?' → flushBuffer() immediately, return
  3. If accumulationBufferRef.current.length >= 5 → flushBuffer() immediately, return
  4. Clear existing silence timer (if any)
  5. Start new 4-second setTimeout → flushBuffer() on fire

flushBuffer():
  1. If accumulationBufferRef.current.length === 0 → return (no-op)
  2. Clear accumulationTimerRef (if active)
  3. joined = buffer.join(' ')
  4. Clear buffer: accumulationBufferRef.current = []
  5. setLatestTranscribedText(joined)
  6. Call supabase.functions.invoke('translate', { raw_text: joined, history, sequence_number })
  7. On success: update history, increment sequenceRef, setLatestTranslatedText
  8. On error: setError(...), text is lost (same behavior as current code)

stop():
  1. If buffer is not empty → best-effort flush (translate call, ignore errors)
  2. Stop orchestrator
  3. Unsubscribe channel
  4. Reset state
```

### Punctuation Check Rule

**Only check the last fragment's ending** — not every fragment in the buffer. The buffer may contain `["Hello world", "and welcome"]`. Only `"and welcome"` is checked for terminal punctuation. If a middle fragment happens to end with `.`, `!`, or `?`, it does NOT trigger a flush. This is correct because Deepgram sends `is_final` fragments in speech order, and only the final fragment of a sentence will have punctuation from the `punctuate=true` flag.

### Why Sequence Increments Per Batch

Previously `sequenceRef.current += 1` fired per fragment (potentially 5+ API calls for one sentence). Now it fires once per flush — one sequence number per accumulated batch. The viewer renders segments keyed by `sequence_number`, so this naturally groups translations into meaningful units.

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Speaker stops mid-sentence (clicks Stop)** | `stop()` flushes any buffered fragments before tearing down audio. The last few seconds of speech are not lost. |
| **Empty buffer on flush** | `flushBuffer()` checks `buffer.length === 0` and returns immediately. No API call. |
| **Punctuation on a middle fragment** | Ignored. Only the most recently pushed fragment's last character is checked. This handles the case where Deepgram sends `"Hello."` as one fragment and `"How are you?"` as the next — only `"?"` triggers the flush, which then includes both fragments. |
| **4-second silence timeout fires** | Flush whatever is in the buffer, even if no punctuation. This handles the case where Deepgram fails to punctuate or the speaker trails off. |
| **5-fragment cap reached** | Flush immediately, even if no punctuation and timer hasn't fired. Safety valve for rapid speech without pauses. |
| **Fragment with only whitespace/punctuation** | Deepgram's `is_final` check already filters: `isFinal && transcript && transcript.trim().length > 0`. Empty/whitespace-only fragments never reach `onTextCaptured`. |
| **Rapid speaker (fragments arrive faster than 4s)** | Each new fragment resets the 4-second timer. The buffer grows until punctuation, 5-fragment cap, or a genuine 4-second pause. |
| **Browser tab hidden / throttled timers** | `setTimeout` may fire late in background tabs. This is acceptable — a delayed flush is still correct behavior, and the speaker is typically in the foreground. |
| **Error during translate call** | Same behavior as current: `setError(...)` is called. The accumulated text is lost (not retried). The buffer was already cleared before the call. |
| **Stop called while translate is in-flight** | The stop-flush is sequential; it awaits the translate call. If the in-flight call from a timer/punctuation flush is still running, the stop-flush will see an empty buffer (since the other flush already cleared it). No double-send. |
| **`&punctuate=true` not working / Deepgram returns no punctuation** | The 4-second silence timer and 5-fragment cap act as safety valves. Translations will still flush, just on time/count rather than sentence boundaries. |

---

## Testable Acceptance Criteria

- [ ] **Punctuate flag present**: Inspect `DeepgramSpeechProvider.ts` line 19 — URL contains `&punctuate=true`
- [ ] **Disconnect constant removed**: `DISCONNECT_TIMEOUT_MS` no longer exists in `page.tsx`
- [ ] **Disconnect ref removed**: `disconnectTimeoutRef` no longer exists in `page.tsx`
- [ ] **Connected state removed**: `connected` / `setConnected` no longer exist in `page.tsx`
- [ ] **Error banner removed**: No `"Connection lost"` JSX in `page.tsx`
- [ ] **Accumulation refs exist**: `accumulationBufferRef` and `accumulationTimerRef` declared in `useAudioCapture.ts`
- [ ] **Accumulation logic present**: `onTextCaptured` in `useAudioCapture.ts` pushes to buffer, checks punctuation, checks cap, arms timer — does NOT call translate directly
- [ ] **Flush function exists**: `flushBuffer` (or equivalent) joins buffer with space, calls translate, clears buffer/timer
- [ ] **Stop flushes buffer**: `stop()` in `useAudioCapture.ts` flushes remaining buffer before calling `orchestratorRef.current.stop()`
- [ ] **Sequence increments per batch**: `sequenceRef.current += 1` happens once per flush (in `flushBuffer`), not once per fragment
- [ ] **No other files modified**: Only the 3 files listed in Scope are changed
- [ ] **Build passes**: `npx tsc --noEmit` succeeds (or the project's build command)

### Test File Paths

```
packages/frontend/src/services/speech/DeepgramSpeechProvider.ts
packages/frontend/src/hooks/useAudioCapture.ts
packages/frontend/src/app/page.tsx
```

---

## Inspectable Acceptance Criteria

These require human inspection of the code (not automated testing):

- [ ] **Accumulation buffer cleared on flush**: After `flushBuffer()` completes, `accumulationBufferRef.current` is `[]`
- [ ] **Timer cleared on flush**: After `flushBuffer()` completes, `accumulationTimerRef.current` is `null`
- [ ] **Timer cleared on new fragment**: When `onTextCaptured` fires, any existing timer is cleared before starting a new one
- [ ] **Punctuation check is on last fragment only**: The code checks `rawText.trim()`'s last char, not `buffer[buffer.length-1]` (though in practice they're the same since we just pushed)
- [ ] **Stop-flush is best-effort**: `stop()`'s flush wraps the translate call in try/catch and silently ignores errors
- [ ] **Unmount does NOT flush**: The cleanup `useEffect` return does not call flush
- [ ] **TTS naturally per-batch**: The viewer's TTS `useEffect` iterates `newSegments` — with fewer, larger segments, this is correct
- [ ] **No imports broken**: Existing imports in `page.tsx` still resolve (Icon, Button, SegmentCard, subscribeToLiveSermon, etc.)

---

## Relevant Files (Read-Only Reference)

| File | Role |
|------|------|
| `packages/frontend/src/services/speech/AudioOrchestrator.ts` | Constructor interface: `(providerType, config, onTextCaptured, onVolumeChange?)`. `onTextCaptured` signature unchanged. |
| `packages/frontend/src/services/speech/SpeechToTextProvider.ts` | Interface that `DeepgramSpeechProvider` implements. |
| `packages/shared/src/types.ts` | `MAX_HISTORY_WINDOW = 3`, `TranslationPayload`, `TranslationResponse` — unchanged. |
| `supabase/functions/translate/index.ts` | Translate + broadcast via Supabase Realtime. Handles arbitrary `raw_text` length. No changes needed. |
| `packages/frontend/src/services/realtime/liveSync.ts` | Viewer-side subscription to `sermon-live`. Unchanged. |
| `packages/frontend/src/app/speaker/page.tsx` | Uses `useAudioCapture` hook. Benefits automatically from accumulation. No changes needed. |

---

## Validation Plan

### Automated
```bash
# Type-check the frontend (from repo root)
npx tsc --noEmit --project packages/frontend/tsconfig.json

# Or if using the workspace build command:
npm run build --workspace=packages/frontend
```

### Manual Verification Commands
```bash
# 1. Verify punctuate flag is present
rg 'punctuate=true' packages/frontend/src/services/speech/DeepgramSpeechProvider.ts

# 2. Verify no disconnect constant remains
rg 'DISCONNECT_TIMEOUT' packages/frontend/src/app/page.tsx
# Expected: no matches

# 3. Verify no disconnectTimeoutRef remains
rg 'disconnectTimeoutRef' packages/frontend/src/app/page.tsx
# Expected: no matches

# 4. Verify no connected state remains
rg 'setConnected|connected' packages/frontend/src/app/page.tsx
# Expected: no matches (the word "connected" may appear in comments — check context)

# 5. Verify no error banner remains
rg 'Connection lost' packages/frontend/src/app/page.tsx
# Expected: no matches

# 6. Verify accumulationBufferRef exists
rg 'accumulationBufferRef' packages/frontend/src/hooks/useAudioCapture.ts

# 7. Verify accumulationTimerRef exists
rg 'accumulationTimerRef' packages/frontend/src/hooks/useAudioCapture.ts

# 8. Verify flushBuffer or equivalent exists
rg 'flushBuffer' packages/frontend/src/hooks/useAudioCapture.ts

# 9. Verify stop() contains a flush before orchestrator.stop()
rg -A 20 'const stop = async' packages/frontend/src/hooks/useAudioCapture.ts
# Look for buffer flush occurring before orchestratorRef.current.stop()

# 10. Verify no other files modified
git diff --name-only
# Expected: only the 3 files listed above
```

---

## Execution

### Pipeline
1. **implementer** — makes all code changes across the 3 files (Unit 1 then Unit 2)
2. **validator** — runs `npx tsc --noEmit`, the verification `rg` commands above, and visually inspects the accumulation logic against this spec

### Implementation Order
1. **Unit 1 first** (page.tsx removals): Simpler, lower-risk, no dependency on Unit 2. Removes the false disconnect behavior immediately.
2. **Unit 2 second** (accumulation): Depends conceptually on the punctuate flag but is independent of Unit 1. Changes in `DeepgramSpeechProvider.ts` and `useAudioCapture.ts` can be done in either order (punctuate flag first makes sense, then accumulation logic).

### Rollback Safety
Both units are additive-removal changes. To roll back:
- **Unit 1**: Re-add the 8 removed lines (constant, state, ref, timeout logic, banner JSX)
- **Unit 2**: Revert `onTextCaptured` to the inline translate callback; remove `&punctuate=true` from URL; remove the stop-flush

---

## Open Questions

1. **Flush on stop duplicates translate logic**: The stop-flush inlines the supabase translate call rather than sharing `flushBuffer` (which is closure-captured inside `start()`). Is the duplication acceptable, or should we lift `flushBuffer` to a ref-accessible level? **Decision**: Duplication is acceptable — the stop-flush is best-effort and simplified; the ~15 lines of duplication are clear and self-contained.

2. **Edge function rate limiting**: With fewer API calls (60-70% reduction), the rate limit of 120 req/min is even less likely to be hit. No action needed.

3. **What if Deepgram never sends `is_final` (stuck in interim)?** This is unchanged from current behavior — DeepgramSpeechProvider only calls `onTextCaptured` on `is_final`. If Deepgram keeps results in interim state, no fragments accumulate. This is a pre-existing Deepgram behavior question, not introduced by this change.
