# Implementation Plan - Phase 4: Speaker Console & PWA Setup

## Objective
Develop the `/speaker` route inside `packages/frontend`. This page captures audio, registers as an installable Progressive Web App (PWA) with screen wake-lock protection, streams speech to Deepgram (with Web Speech fallback), and broadcasts translations statelessly over WebSockets.

## Tech Stack
*   **Framework**: Next.js, React, Tailwind CSS
*   **WebSocket Engine**: Supabase client JS SDK (`supabase.channel().send()`)
*   **Media APIs**: HTML5 Audio Capture (`navigator.mediaDevices.getUserMedia`), MediaRecorder API, Screen Wake Lock API, IndexedDB API
*   **ASR Provider**: Deepgram (WebSocket) / Web Speech API (`webkitSpeechRecognition`)

## Detailed Step-by-Step Instructions

### Step 1: Configure PWA Manifest
1. In the Next.js frontend, add a `manifest.json` under the public directory `/public/manifest.json`.
2. Define a service worker `sw.js` to register microphone permissions and keep the page alive.
3. Configure metadata in Next.js layout to render meta tags for PWA installation (Apple mobile web app capable, mobile viewport scaling).

### Step 2: Implement ASR Interface & Adapters
1. Create `packages/frontend/src/services/speech/SpeechToTextProvider.ts`:
   ```typescript
   export interface SpeechToTextProvider {
     start(stream: MediaStream, onTextCaptured: (text: string) => void): Promise<void>;
     stop(): Promise<void>;
   }
   ```
2. Implement `DeepgramSpeechProvider.ts` opening a browser WebSocket connection to `wss://api.deepgram.com/v1/listen?language=id&model=nova-2&encoding=linear16&sample_rate=16000`, feeding raw audio buffers from `MediaRecorder(stream)` at `250ms` intervals, and parsing the `onmessage` return payload.
3. Implement `WebSpeechProvider.ts` wrapping native browser `webkitSpeechRecognition` as a local, free fallback adapter.

### Step 3: Implement Audio Orchestrator (With Local IndexedDB Audio Caching)
1. Write `AudioOrchestrator.ts` to manage:
   * **Active Stream Capture**: Requests `getUserMedia({ audio: true })`.
   * **ASR provider launch**: Feeds stream into the selected provider.
   * **IndexedDB storage**: Launches a concurrent `MediaRecorder` mapping 5-second raw audio chunks into a local browser IndexedDB database (`SermonAudioBackup`). This acts as an offline voice safety net.
   * **Wake Lock**: Requests `navigator.wakeLock.request('screen')` to prevent the device from entering sleep mode.

### Step 4: Implement `useAudioCapture` React Hook
1. Develop the React Hook `useAudioCapture(sermonId: string)` in `/src/hooks/useAudioCapture.ts`.
2. Ensure that on final text detection, the hook:
   * Sends the raw text + context array to the `/translate` Edge Function using `fetch()`.
   * Appends the translated return values to `historyRef` (maintaining the last 3 entries in memory).
   * Broadcasts the translated JSON packet to the `sermon-live` WebSocket channel using the Supabase client.

### Step 5: Build `/speaker` Page UI
1. Add `/app/speaker/page.tsx` rendering:
   * **Speaker Password gate**: Prompt to enter and save the PIN to `sessionStorage` before showing the capture console.
   * **Control Trigger**: Large start/stop toggle button (styled with premium animations, e.g. pulsing red wave when active, glowing green indicator when connected).
   * **Volume Visualizer**: A simple canvas or CSS-based wave matching mic volume input.
   * **Backup Downloader**: A button to compile all chunks in IndexedDB into a single audio blob and trigger a browser file download of the full sermon audio recording.

## Verification Criteria
1. Load `/speaker` on a mobile device or browser.
2. Confirm the page prompts for a Speaker PIN. Enter the PIN and press start.
3. Verify that the microphone indicator turns on and the screen stays awake (check `document.visibilityState` or test that screen sleep is blocked).
4. Speak into the mic and check the console logs: confirm raw transcripts are detected and the HTTP call to the local translation Edge Function returns translation payload.
5. Stop the stream, click "Download Backup Audio", and confirm that a `.webm`/`.ogg` audio file is saved locally to your device.
