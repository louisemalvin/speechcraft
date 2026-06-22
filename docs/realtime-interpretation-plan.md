# Real-Time Interpretation Optimization Plan

This document outlines the architectural changes to Speechcraft's translation pipeline to deliver a simultaneous interpretation experience. The goal is to keep translation latency under **1.5 seconds** and resolve the domain mismatch (church, wedding, general) purely in the prompt layer.

---

## 1. Adaptive System Prompt (Domain Adaptation)
To support multiple event types without adding settings dropdowns to the PWA UI, the translation engine in the [translate](file:///home/ltanaka/github/translation-service/supabase/functions/translate/index.ts) Edge Function will dynamically detect the topic and apply the theological glossary conditionally.

### System Prompt Changes
We will update [translate/index.ts](file:///home/ltanaka/github/translation-service/supabase/functions/translate/index.ts)'s system prompt instructions:
1. **Dynamic Domain Detection:** Instruct the LLM to identify the domain (sermon, wedding, seminar, casual talk) from the current speech and context history.
2. **Conditional Glossary:** Apply Christian theological terms (e.g., "Tuhan" -> "Lord") only when a sermon context is detected. Otherwise, default to standard translations (e.g., "Tuhan" -> "Mr." or "sir").
3. **Phonetic Error Correction:** Direct the LLM to correct ASR errors contextually (e.g., "bearish ratenya" -> "barrier-nya" / "barrier to entry").

---

## 2. Low-Latency "Breath Group" Pipeline
To match the user's expectation of real-time speech interpretation and avoid long delays (which make the app feel broken), we will optimize the client-side buffering strategy.

### Client-Side Buffering Upgrades in [useAudioCapture.ts](file:///home/ltanaka/github/translation-service/packages/frontend/src/hooks/useAudioCapture.ts)
Instead of waiting for 5 fragments or a 4-second pause of silence, the client will immediately flush and translate segments as they arrive:

1. **Immediate Punctuation Flush:** If a fragment ends with sentence-ending punctuation (`.`, `!`, `?`), trigger an immediate translation call.
2. **Immediate Word-Count Flush:** If the accumulated buffer reaches **3 or more words**, trigger an immediate translation call.
3. **Optimized Safety Timeout:** If a fragment is under 3 words and has no punctuation, set a safety silence timer of **2.0 seconds** (reduced from 4.0 seconds) to flush remaining words.

---

## 3. Benefits & Metrics

| Metric | Previous Behavior | Optimized Behavior |
| --- | --- | --- |
| **Max Wait Time** | 10–20 seconds (during long speech) | **~1.5 - 2.5 seconds** |
| **Pacing** | Wall of text every paragraph | Short, conversational clauses |
| **Headphones TTS Sync** | High cumulative lag behind speaker | High-fidelity simultaneous interpretation |
| **UI Complexity** | Manual settings required | Automatic and zero settings footprint |
