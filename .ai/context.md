# Project: Translation Service

## Overview

**0-Cost Real-Time Church Sermon Translation Pipeline (Indonesian → English).**

Provides live, scrolling English text translations of spoken Indonesian church sermons to attendees' personal mobile devices. Budget constraint: $0 monthly infrastructure hosting cost indefinitely.

### Architecture (ADR Approved)

Decoupled, distributed serverless architecture that offloads all computing from local church hardware.

```
[Pastor's Phone at Pulpit]
       │  (Web Speech API: Audio → Raw Indonesian Text)
       ▼
[Supabase Postgres DB]
       │  (Database Webhook Trigger)
       ▼
[Supabase Edge Function] → [DeepSeek V4-Flash API]
       │                    (Contextual Translation)
       ▼
[Supabase Realtime Sync]
       │  (WebSocket Broadcast)
       ▼
[Congregation Mobile Browsers] (Vercel Static Hosting)
```

#### Components

1. **Audio Capture Node (Input)** — Static webpage using Web Speech API (`webkitSpeechRecognition`, `id-ID` locale) running on the pastor's/admin's smartphone. Converts room audio to Indonesian text on-device, pipes raw sentences to Supabase via public Client SDK.

2. **Cloud Engine (Backend)** — Supabase Free Tier project:
   - Postgres database for raw and translated text storage.
   - Serverless Edge Function (Deno runtime) triggered by database mutations, calling DeepSeek V4-Flash API with a context-aware system prompt for sermon translation.
   - Realtime WebSocket broadcast to congregation clients.

3. **Translation Brain** — DeepSeek V4-Flash API ($0.14/1M input, $0.28/1M output). ~$0.002 per 45-minute sermon (~$0.10/year). System prompt instructs conversational Indonesian → natural English with typo correction using theological context.

4. **Live Stream View (Output)** — Static SPA hosted on Vercel, accessed via QR code. Uses `supabase.channel()` for realtime WebSocket delivery of translated English blocks within 1–2 seconds.

#### Inactivity Mitigation

Supabase free tier pauses after 7 days of inactivity. An external cron (e.g., cron-job.org) pings `GET /rest/v1/translations?select=id&limit=1` with the anon key every 3 days to keep the project alive between weekly services.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (everywhere) |
| Frontend | Next.js + Tailwind CSS (hosted on Vercel) |
| Backend / DB | Supabase (Postgres, Edge Functions, Realtime) |
| Translation API | DeepSeek V4-Flash |
| Package Manager | pnpm |
| Monorepo Tool | pnpm workspaces |

---

## Project Structure

Monorepo with packages:

```
packages/
  frontend/          # Next.js app (admin capture page + congregation view)
  edge-functions/    # Supabase Edge Functions (Deno runtime)
  shared/            # Shared TypeScript types, constants, utilities
supabase/
  migrations/        # Database migrations
  config.toml        # Supabase project configuration
```

---

## Test Setup

- **Framework**: Vitest
- **Runner**: `npx vitest` (or `pnpm vitest`)
- **Test file pattern**: `*.test.ts` (co-located with source files)
- **Test layout**: Tests live next to the source file they test.

Example:
```
packages/shared/src/translation-utils.ts
packages/shared/src/translation-utils.test.ts
```

---

## Conventions

### Naming
- **Files and directories**: `kebab-case` (e.g., `translation-service.ts`, `edge-functions/`)
- **Functions and variables**: `camelCase` (e.g., `getTranslation()`, `rawText`)
- **Types and interfaces**: `PascalCase` (e.g., `TranslationBlock`, `SermonConfig`)
- **React components**: `PascalCase` files (e.g., `TranslationFeed.tsx`)

### Imports
- Auto-sorted imports only. No other special import/export rules.

### Code Style
- TypeScript strict mode enabled.
- Prefer named exports over default exports.
- No unused variables or imports (enforced by TS config).
- Edge Functions run on Deno; keep Deno-compatible imports (no Node.js-specific APIs).

### Error Handling
- Edge Functions: return structured error responses, never leak internal state.
- Frontend: graceful degradation when WebSocket or Speech API is unavailable.

---

## Workflow

- **Agy**: `enabled` — Implementer agent can offload work through `agy` to split quota usage across models.
