# ⚡ Supabase Dev-Ops & Edge Functions

This directory contains the database configurations, seeding schemas, and Deno serverless Edge Functions for the Sermon Translation Pipeline.

---

## 📁 Functions List

### 1. `translate`
*   **Path**: `supabase/functions/translate/index.ts`
*   **Role**: Handles security verification (SHA-256 PIN authentication validation), constructs sliding history prompt context, calls the **DeepSeek V4-Flash API**, parses/corrects ASR typos, and broadcasts the final segment output to the `sermon-live` Supabase Realtime WebSocket channel.
*   **HTTP Method**: `POST`

### 2. `get-deepgram-token`
*   **Path**: `supabase/functions/get-deepgram-token/index.ts`
*   **Role**: Validates the speaker console session PIN and returns a short-lived ephemeral Deepgram ASR token. This allows client devices to stream microphone data directly to Deepgram without leaking permanent master API keys in front-end code.
*   **HTTP Method**: `POST` / `GET`

---

## 🛠️ CLI Operations

Ensure you have the Supabase CLI installed and Docker running before executing these.

### Local Initialization
```bash
# Start local emulator (Docker container nodes)
supabase start

# Stop local emulator
supabase stop

# Check local status/URLs/keys
supabase status
```

### Secrets & Env Management
Local functions load environment secrets from `supabase/.env.local` automatically during dev:
*   `DEEPSEEK_API_KEY`: API authentication key.
*   `DEEPSEEK_API_URL`: DeepSeek base endpoint (e.g. `https://api.deepseek.com/v1`).
*   `ADMIN_PIN_HASH`: SHA-256 string representing the authorized Speaker PIN.
*   `PIN_SALT`: Salt value used in PIN comparisons.

To push secrets to your production Supabase Cloud project:
```bash
supabase secrets set DEEPSEEK_API_KEY=your_key ADMIN_PIN_HASH=your_hash --project-ref your_project_ref
```

### Function Deployments
To deploy functions to the cloud:
```bash
supabase functions deploy translate --project-ref your_project_ref
supabase functions deploy get-deepgram-token --project-ref your_project_ref
```
