# User Journeys

This document outlines the operational goals, entry paths, and step-by-step journeys for each user role in Speechcraft.

---

## 🎙️ 1. The Speaker

### Goals
*   Begin broadcasting translation with minimal startup time.
*   Zero technical configuration or channel mapping.
*   Clear visual feedback that audio is streaming.

### Mental Model & User Intent
*"I want to enter a PIN, click 'Start', and speak Indonesian. I expect my phone screen to stay awake and see live volume feedback so I know my microphone is capturing sound. When I'm done, I want to tap 'Stop'."*

### Step-by-Step Journey

```
[Open /speaker Page]
         │
         ▼
[Enter session PIN] ──► [Fails] ───► [IP Lockout after 5 attempts]
         │ (Succeeds)
         ▼
[Authorized Console]
         │
         ▼
[Tap "Start Broadcast"] ──► [Requests Screen Wake Lock API]
         │
         ▼
[Speak naturally] ──► [Monitor real-time volume VU levels]
         │
         ▼
[Tap "Stop Broadcast"] ──► [Releases Screen Wake Lock]
         │
         ▼
[Tap "Lock Console"] ──► [Clears sessionStorage authentication]
```

---

## 📱 2. The Viewer

### Goals
*   Read translated English text instantly.
*   Tune in via audio headphones.
*   Adjust layout size for optimal readability.

### Mental Model & User Intent
*"I want to load a URL or scan a QR code and immediately watch the translation scroll. I don't want to register. I want to plug in my headphones to hear it spoken in English."*

### Step-by-Step Journey

```
[Scan event QR Code / Open root URL "/"]
                  │
                  ▼
[Load Teleprompter display]
                  │
                  ├──► [Translate events arrive] ──► [Read scrolling text feed]
                  │
                  ├──► [Tap headphones icon] ──► [Live Text-to-Speech active]
                  │
                  └──► [Tap "A-" / "A+" buttons] ──► [Font size adjusts dynamically]
```

---

## 🛠️ 3. The Administrator

### Goals
*   Verify speech-to-text (ASR) transcription quality.
*   Monitor translation accuracy.
*   Clear log feeds during testing or session boundaries.

### Mental Model & User Intent
*"I want to watch raw Indonesian sentences side-by-side with final English outputs in real-time to debug lag or translation errors, and clear the screen when needed."*

### Step-by-Step Journey

```
[Open "/admin" URL]
         │
         ▼
[Enter session PIN]
         │ (Succeeds)
         ▼
[Open Developer Debug Console]
         │
         ├──► [Watch Live log feed] ──► [Inspect sequence numbers & timestamps]
         │
         └──► [Tap "Clear Feed"] ──► [Resets active feed container]
```
