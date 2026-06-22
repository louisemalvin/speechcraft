# System Performance

This document describes the latency targets, throughput capacities, reconnect behaviors, and mobile browser optimization strategies of Speechcraft.

---

## ⏱️ 1. Latency Profile

To maintain engagement, the delay between a speaker uttering a sentence and the translated text scrolling onto viewer devices must remain around one second.

### Typical Latency Breakdown

| Lifecycle Stage | Component / Action | Typical Latency | Notes |
|---|---|---|---|
| **1. Speech Recognition** | Deepgram Nova-2 ASR | **300–800 ms** | Includes audio sampling, packet buffering, network transit, and boundary determination. |
| **2. Proxy & Translation** | Edge Function + DeepSeek | **200–500 ms** | Deno edge execution, sliding context matching, and DeepSeek chat completion. |
| **3. Broadcast Propagation** | Supabase Realtime WebSocket | **<100 ms** | Ephemeral propagation to all active WebSocket connections. |
| **Total Target** | **Voice-to-Screen Loop** | **~1.1 seconds** | Provides a seamless, near-conversational scrolling experience. |

---

## 📈 2. Throughput & Scalability

Since the architecture is stateless and writes no translation logs to a database, system capacity scales linearly with serverless edge compute bounds:

*   **Database Writes**: `0 bytes` per translation packet. This eliminates Postgres database locking issues and avoids storage allocation costs.
*   **WebSockets Limit**: Supabase Realtime supports thousands of concurrent WebSocket client connections on its free tier, scaling horizontally to handle large event crowds.
*   **Edge Functions Limit**: Runs on Deno's global network routing requests close to the user's geocenter, scaling auto-provisioned Deno containers to handle spike volumes.

---

## 🛠️ 3. Failure Handling & Reconnect Behavior

### Network Disconnects (Speaker)
*   If the speaker's cellular or Wi-Fi network drops, the Deepgram WebSocket connection is severed.
*   The Speaker console detects the connection termination, sounds an error state, turns the status badge red, and shows an error banner.
*   The speaker can tap Stop/Start to re-initiate the session when the connection recovers.

### Network Disconnects (Viewer)
*   If a viewer's mobile connection fluctuates, the Supabase Realtime client attempts to reconnect automatically.
*   Because the pipeline is stateless, late-joining or reconnecting viewers will begin receiving translations from their reconnection timestamp onward.

---

## 📱 4. Mobile Browser Optimizations

Operating within standard browser sandboxes (specifically iOS Safari and Android Chrome) on attendee phones requires optimizations:

*   **Audio Downsampling**: Downsampling speech inputs to 16kHz via a custom client-side `AudioWorkletProcessor` decreases network upload bandwidth by **~64%** compared to streaming raw stereo waveforms.
*   **Wake Lock Integration**: Requesting `navigator.wakeLock` prevents mobile operating systems from locking the phone screen, protecting the recording session from CPU suspension.
*   **Low memory footprints**: Renders scrolling teleprompter text by maintaining only the last 3 active segments in the DOM, keeping mobile device memory footprints minimal and eliminating browser rendering crashes.
