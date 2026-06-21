# Supabase Realtime & Security Specification (Zero-Database Setup)

This document specifies the network security, PIN-gate authentication, and WebSocket broadcast message payloads used in our serverless translation pipeline. By omitting persistent database storage, all synchronization relies on ephemeral real-time channels and environment-level secrets.

---

## Access Control & Security Model

To protect the system from spam and unauthorized broadcasts while keeping it completely cost-free, security is enforced at the serverless Edge Function boundary:

1. **Viewer Security**: Viewers connect to the Supabase Realtime server with the public `anon` key. They are granted read-only subscription rights to the `sermon-live` WebSocket channel. They cannot broadcast messages or trigger translations.
2. **Speaker Security**: The speaker's device captures the microphone stream. To request translations and broadcast results, it must supply the admin PIN in the headers of its API calls:
   * Header: `x-admin-pin: <plain_text_pin>`
3. **Edge Function Security**: The `translate` Edge Function validates the PIN by computing its SHA-256 hash and comparing it to the `ADMIN_PIN_HASH` stored in Supabase Secrets (environment variables).
4. **Authorized Broadcast**: Only after the PIN is verified will the Edge Function translate the text and broadcast the resulting English + Indonesian payload to the WebSocket channel using the admin/service privileges (`service_role` key).

```
   [Speaker Client App] 
            │ 
            ▼ (HTTP POST /translate with x-admin-pin header)
   [Supabase Edge Function] 
            │ (Verifies PIN hash against Deno.env.get("ADMIN_PIN_HASH"))
            ├───────── Invalid PIN ─────────> [401 Unauthorized]
            │
            ├───────── Valid PIN ───────────> [DeepSeek API] (Translates text)
            │
            ▼ (Broadcasts translation via Supabase service client)
   [Supabase Realtime WebSocket]
            │
            ▼ (Pushes event to viewers)
   [Congregation Viewers]
```

---

## WebSocket Channel Configurations

The congregation connects to the Realtime service via WebSockets, listening to a specific channel named `sermon-live`.

### Broadcast Message Payload Schema
When a segment is successfully translated, the Edge Function broadcasts a JSON payload representing the segment:

```json
{
  "event": "translation_segment",
  "type": "broadcast",
  "payload": {
    "sequence_number": 42,
    "raw_text": "Selamat pagi jemaat sekalian.",
    "translated_text": "Good morning to the entire congregation.",
    "timestamp": 1782031400000
  }
}
```

---

## Configuration & Environment Variables

To run the pipeline, the following configuration secrets must be defined in the Supabase Dashboard (or set locally via `supabase/config.toml` and `.env` files):

| Secret / Environment Variable | Type | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | String | API key to authenticate requests to the DeepSeek V4-Flash model. |
| `DEEPSEEK_API_URL` | String | Endpoint URL (defaults to `https://api.deepseek.com/v1`). |
| `ADMIN_PIN_HASH` | String | SHA-256 hash of the password PIN (e.g. `03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4` for PIN `1234`). Used to verify Speaker actions. |
| `SUPABASE_SERVICE_ROLE_KEY` | String | Used internally by the Edge Function to authenticate broadcast writes to the Realtime channels. |

### Local Dev Environment Variables (`.env.local`)
Create a file under `packages/frontend/.env.local` to enable local communication:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
```
