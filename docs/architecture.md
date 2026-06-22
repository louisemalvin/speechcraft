# System Architecture

Speechcraft is designed as a stateless, low-latency, real-time translation system. It separates raw audio transcription, machine translation, and websocket broadcasting into independent layers to achieve sub-second latency and zero data-storage overhead.

---

## 🎯 Architecture Goals

1.  **Low Latency**: Limit end-to-end voice-to-screen lag to around one second.
2.  **Stateless Operation**: Eliminate database read/write actions during translation to reduce infrastructure complexity.
3.  **Low Operational Cost**: Fit all hosting and synchronization costs within the free-tier thresholds of Vercel and Supabase.

---

## 🗺️ System Architecture Flow

Here is the block-diagram showing the flow of data from the speaker's microphone to the congregation's browsers:

![System Architecture Flow](images/architecture.jpg)

---

## 📦 System Components

Speechcraft is divided into five distinct operational blocks:

### 1. Speaker Client (PWA)
*   **Role**: Serves as the recording and configuration panel for the presenter.
*   **Responsibilities**:
    *   Requests browser microphone permission and captures the audio stream.
    *   Maintains device active state using the browser **Screen Wake Lock API** so the OS doesn't sleep.
    *   Performs Web Audio analysis to drive a visual, canvas-based volume VU meter.
    *   Authenticates with the translation backend via a session PIN to request temporary, short-lived Deepgram ASR credentials.
    *   Establishes a WebSocket connection to stream raw binary audio blocks to Deepgram.

### 2. Translation Layer (Supabase Edge Function)
*   **Role**: Acts as the secure translation proxy between the speaker and the translation model.
*   **Responsibilities**:
    *   Verifies the speaker's session PIN by checking its SHA-256 hash.
    *   Builds the prompt context by combining the raw transcription text with a sliding window of the last three translated segments to maintain narrative flow.
    *   Applies a localized theological and community glossary to correct phonetic ASR errors (e.g. spelling of names, church terms).
    *   Calls the DeepSeek V4-Flash API using secure, server-side environment secrets.
    *   Validates and parses the model's JSON translation outputs.

### 3. Broadcast Layer (Supabase Realtime WebSockets)
*   **Role**: Pushes translated packets to all listening clients instantly.
*   **Responsibilities**:
    *   Subscribes viewers to the public `sermon-live` channel.
    *   Dispatches translated JSON segments ephemerally to all connected WebSocket clients.
    *   Enforces write-access restrictions: only the serverless Translation Layer (using the admin/service role key) can broadcast translated text, preventing viewer spam.
    *   Stores no translation data in postgres, maintaining a $0 monthly storage footprint.

### 4. Viewer Client (Browser)
*   **Role**: Displays the real-time translation to the audience.
*   **Responsibilities**:
    *   Connects to the Supabase Realtime WebSocket server.
    *   Renders a scrolling, high-contrast, low-glare teleprompter layout (focusing on the latest translation segment, with older segments faded up).
    *   Controls text size scaling via interactive accessibility buttons.
    *   Synthesizes spoken audio output via browser-native `window.speechSynthesis` (headphones mode).

### 5. Admin Console
*   **Role**: Serves as a diagnostic tool for monitoring live translation packets.
*   **Responsibilities**:
    *   Displays sequence numbers, timestamps, raw Indonesian ASR inputs, and translated English outputs side-by-side.
    *   Provides quick toggles to clear debugging streams or jump between speaker and viewer pages.
