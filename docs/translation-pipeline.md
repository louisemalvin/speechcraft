# Translation Pipeline

The Speechcraft translation pipeline represents the sequential stages required to turn spoken Indonesian audio into readable English text on viewer screens. This document details each phase of the pipeline, explaining context assembly, custom glossary matching, and latency optimizations.

---

## 🔄 Pipeline Lifecycle

```
[Speaker Speech] 
       │ (Microphone capture)
       ▼
[Audio Capture] ──► [Speech Recognition (Deepgram)] ──► [Raw Indonesian Transcript]
                                                                  │
                                                                  ▼
[Viewer Display] ◄── [Realtime Broadcast] ◄── [Deno Proxy Layer] ◄─┘
  (Teleprompter)         (Supabase WebSocket)      (Glossary + Context + DeepSeek)
```

### 1. Audio Capture
*   The speaker's phone captures microphone audio in raw PCM/WebM format.
*   The browser's Web Audio API routes the input stream to an `AudioWorkletNode` running a lightweight script (`audio-processor.js`) to downsample the audio to a uniform 16kHz sample rate, optimizing network bandwidth.

### 2. Speech Recognition
*   Downsampled audio is streamed continuously via a WebSocket connection to the **Deepgram Nova-2 ASR** engine.
*   Deepgram processes the streaming blocks and returns final Indonesian text transcripts instantly when a sentence boundary or pause is detected.

### 3. Context Window Assembly
*   To prevent translations from feeling disjointed, the Speaker client tracks a sliding in-memory history of the **last 3 segments** (both the raw Indonesian inputs and their translated English outputs).
*   When a new raw text segment is received, the client sends this history array alongside the new segment to the Supabase Edge Function.

### 4. Translation Request & Glossary Injection
*   The backend constructs a structured prompt payload for the **DeepSeek V4-Flash** API.
*   A custom theological and common Indonesian-to-English church glossary is injected directly into the system prompt instructions.
*   This glossary maps words that ASR engines commonly misspell or fail to capitalize:
    *   `Tuhan` $\rightarrow$ `Lord` (corrects common ASR homophones like `tuan`)
    *   `Roh Kudus` $\rightarrow$ `Holy Spirit` (handles lowercase ASR inputs like `roh kudus`)
    *   `Alkitab` $\rightarrow$ `Bible`

### 5. DeepSeek API completion
*   The backend calls the DeepSeek completion endpoint (`deepseek-chat` model) with a low temperature of `0.3` to enforce translation stability.
*   The backend forces a JSON response structure (`{"type": "json_object"}`) to guarantee the payload has the following shape:
    ```json
    {
      "translated_text": "Good morning to the entire congregation."
    }
    ```

### 6. Realtime Distribution
*   The Edge Function parses the JSON completion, validates it via fallbacks, and broadcasts the packet directly to the `sermon-live` WebSocket channel using the admin service role credentials.
*   This server-to-client broadcast is sent ephemerally, completely skipping database writes.

### 7. Viewer Rendering
*   The viewer client receives the WebSocket packet.
*   The page updates the teleprompter state, centering the new English translation, fading previous sentences upward, and feeding the text to the Web Speech Synthesis engine if headphones mode is active.

---

## 🧠 Core Engineering Decisions

### Why a Sliding Context Window is Used
Translating real-time speech word-for-word or sentence-for-sentence in isolation causes "context fragmentation." The translation model loses track of pronouns, sentence flow, and past references.
By sending a sliding window of the **last 3 segments**, the DeepSeek model maintains:
1.  **Pronoun Consistency**: Resolving gender pronouns (e.g. *dia* $\rightarrow$ *he/she* depending on context).
2.  **Tense Continuity**: Maintaining past/present contexts across sentences.
3.  **Correct Terminology Selection**: Choosing the right theological terms based on the preceding topic.

### Latency Considerations
To maintain audience engagement, the end-to-end delay must stay near **1 second**. We optimize latency across all stages:
*   **Audio Downsampling**: Reduces payload data size sent to Deepgram.
*   **Deno Proxy**: Supabase Edge Functions run close to edge datacenters, minimizing network roundtrip times.
*   **Model Selection**: DeepSeek V4-Flash is optimized for high-speed completions with short token lengths.
*   **No DB Write**: Pushing translations directly from Deno to Realtime WebSockets avoids Postgres database transactions and disk locks, reducing latency by **150ms–300ms**.
