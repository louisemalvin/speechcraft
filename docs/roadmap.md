# Project Roadmap

This document outlines the current version capabilities and future feature ideas for the Speechcraft real-time AI interpreter.

---

## 📍 Current Version (v1.0)

*   **Primary Path**: Real-time Indonesian audio transcription (ASR) translated to scrolling English text.
*   **Access Controls**: Secure SHA-256 PIN session gate with temporary token issuance for Deepgram.
*   **Infrastructure**: Fully stateless serverless proxying and ephemeral WebSocket broadcasts.
*   **UI/UX**: Premium dark theme, teleprompter layouts, font-size adjustment, and browser-native text-to-speech.

---

## 🗺️ Future Ideas & Milestone Targets

### 1. Multi-Language Support
*   **Alternative Pairs**: Support translations from and to other major language pairs (e.g. English → Spanish, Indonesian → Mandarin).
*   **Target Selection**: Allow viewers to select their preferred target language from a dropdown, distributing different translations on separate WebSocket channels.

### 2. Streamlined Onboarding
*   **QR Code Generator**: Add an automatic QR code generation tool in the speaker and admin consoles, allowing attendees to join by scanning the presenter's screen.
*   **Deep Link Joins**: Auto-configure channels via query parameters (e.g. `speechcraft.net/?channel=sermon-live`).

### 3. Session & Event Management
*   **Custom Channels**: Support multiple concurrent channels (e.g., Room A, Room B) using the same Supabase serverless tenant.
*   **Scheduled Broadcasts**: Add session scheduling details to the homepage.

### 4. Advanced Analytics & Logs
*   **Translation Analytics**: Track character usage, translation latency, and user connection statistics over time using serverless database persistence options.
*   **Quality Evaluation**: Integrate secondary LLM pipelines to evaluate translation quality scores retrospectively.

### 5. Speaker Profiles & Custom Glossaries
*   **Glossary Profiles**: Allow speakers or administrators to upload custom glossary CSV files in their local settings.
*   **Custom Prompts**: Adapt prompts for business conferences, university lectures, or legal presentations.

### 6. Offline Fallbacks & Resiliency
*   **Offline Cache**: Cache Indonesian transcripts in the speaker client's IndexedDB during network dropouts and batch-process them upon reconnection.
*   **Network Status Indicators**: Detailed live-delay measurements for the viewer interface.
