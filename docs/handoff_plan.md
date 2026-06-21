# Stateless Translation System: Agent Handoff Index

This document acts as the master index to hand off the implementation phases of the stateless real-time sermon translation system to your autonomous coding agents.

Each phase is written as a self-contained specification file inside the `docs/implementation-plans/` directory in the repository:

*   **Phase 1: Workspace Setup**: Detailed in [phase-1-monorepo.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-1-monorepo.md)
*   **Phase 2: Supabase Emulator**: Detailed in [phase-2-supabase-setup.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-2-supabase-setup.md)
*   **Phase 3: Translation Edge Function**: Detailed in [phase-3-translation-function.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-3-translation-function.md)
*   **Phase 4: Speaker PWA Console**: Detailed in [phase-4-speaker-pwa.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-4-speaker-pwa.md)
*   **Phase 5: Congregation Live Stream**: Detailed in [phase-5-viewer-tts.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-5-viewer-tts.md)

---

## Agent Delegation Guide

You can hand off the tasks to your developer agents sequentially or concurrently using this breakdown:

### Task 1: Monorepo Architect Agent
*   **Assign**: [phase-1-monorepo.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-1-monorepo.md)
*   **Context**: Instruct this agent to initialize the root monorepo project files, configure workspaces, define the shared TypeScript models, and spin up the Next.js frontend structure.

### Task 2: Supabase Dev-Ops Agent
*   **Assign**: [phase-2-supabase-setup.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-2-supabase-setup.md)
*   **Context**: Instruct this agent to boot up the local Supabase Docker emulator and write the correct local `.env` configuration files for local network streaming.

### Task 3: Backend Deno Agent
*   **Assign**: [phase-3-translation-function.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-3-translation-function.md)
*   **Context**: Instruct this agent to write the translation Edge Function in Deno, configure DeepSeek connection headers, and implement the hashed x-admin-pin verification logic.

### Task 4: Frontend Speaker & ASR Agent
*   **Assign**: [phase-4-speaker-pwa.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-4-speaker-pwa.md)
*   **Context**: Instruct this agent to build the `/speaker` console, implement PWA configurations, write Web Speech and Deepgram WebSockets adapters, and handle local IndexedDB recording caching.

### Task 5: Frontend Congregation & Audio Agent
*   **Assign**: [phase-5-viewer-tts.md](file:///home/ltanaka/github/translation-service/docs/implementation-plans/phase-5-viewer-tts.md)
*   **Context**: Instruct this agent to write the root `/` viewer page, connect the WebSockets subscriber listener, and add the native browser-built TTS audio synthesis button.
