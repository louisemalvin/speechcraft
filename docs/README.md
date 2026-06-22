# Project Documentation Index

Welcome to the documentation directory for the **0-Cost Real-Time Church Sermon Translation Pipeline (Indonesian → English)**.

This directory contains technical specifications, architecture diagrams, and guidelines explaining the end-to-end stateless translation system.

---

## 🗺️ Documentation Sitemap

Refer to these documents for deep-dives into specific areas of the system:

1. **[System Architecture](file:///home/ltanaka/github/translation-service/docs/system-architecture.md)**
   * Outlines the architectural overview, zero-cost constraints, system topology, sequence flows (Mermaid diagrams), and latency performance targets.
2. **[Translation Brain Specification](file:///home/ltanaka/github/translation-service/docs/translation-brain.md)**
   * Describes the sliding context window (history mapping), theological glossary, prompt rules for DeepSeek V4-Flash, and JSON fallback parsing mechanisms.
3. **[Realtime & Security Specification](file:///home/ltanaka/github/translation-service/docs/realtime-broadcast.md)**
   * Details the authorization model (PIN security, headers, env vars) and WebSocket broadcast payloads using Supabase Realtime channels.
4. **[Frontend Specification](file:///home/ltanaka/github/translation-service/docs/frontend-spec.md)**
   * Details Next.js routing (Viewer `/`, Speaker `/speaker`, Debugger `/admin`), Web Speech API, Deepgram WebSocket integration, Screen Wake Lock API, and state hook interfaces.
5. **[Design Guidelines](file:///home/ltanaka/github/translation-service/docs/design-guidelines.md)**
   * Outlines the UI/UX choices, dark color palette tokens, typography rules, teleprompter layouts, and custom interactive controls.

---

## 🏛️ Historical Plans

* **[Implementation Plans Directory](file:///home/ltanaka/github/translation-service/docs/implementation-plans)**
  * Contains the step-by-step phases used to scaffold, implement, and verify the MVP setup.
