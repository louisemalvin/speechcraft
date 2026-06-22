# Security & Privacy Model

Speechcraft implements a secure, stateless architecture to protect credentials and API endpoints, defend against abuse, and respect user privacy while maintaining a $0 monthly infrastructure cost.

---

## 🔒 1. PIN Protection & Authentication Gate

To prevent unauthorized translations and WebSocket broadcasts, write operations are gated by a session PIN code:

1.  **Client-Side Entry**: The speaker enters a numeric PIN in the speaker interface. This PIN is stored in `sessionStorage` and sent in the header `x-admin-pin` of API requests.
2.  **Server-Side Hash Comparison**: The serverless Edge Function computes the SHA-256 hash of the incoming PIN (combined with an optional `PIN_SALT` environment secret) and compares it to the securely stored `ADMIN_PIN_HASH`.
3.  **Brute-Force Defense**:
    *   The backend tracks failed authentication attempts by client IP address in an in-memory cache.
    *   After **5 failed attempts**, the client IP is blocked for **15 minutes** (`PIN_BLOCK_DURATION_MS`).
    *   No translation requests from blocked IPs are processed during this lockout window.

---

## 🔑 2. Controlled Deepgram Token Issuance

Directly embedding a master Deepgram API Key on the client side allows users to steal the key and run up large bills. Speechcraft prevents this using a short-lived token proxy:

1.  The Speaker console calls the `get-deepgram-token` Edge Function and supplies the session PIN in the header.
2.  The backend verifies the PIN. If authenticated, it calls the Deepgram Token API to generate a short-lived, single-use credential token.
3.  The frontend uses this token to connect to Deepgram's streaming WebSockets. Even if an attacker extracts this token from network logs, it cannot be reused for general transcription or key administration.

---

## 🚫 3. Rate Limiting

To prevent API abuse and DDoS attacks from exhausting free serverless limits, the Translation proxy implements a rate limit:

*   **Max Rate**: 120 successful requests per minute per IP address.
*   **Implementation**: Tracked via an in-memory sliding window cache on Deno.
*   **Result**: Requests exceeding the threshold are immediately rejected with an HTTP `429 Rate limit exceeded` status, protecting the DeepSeek API limits.

---

## 👤 4. Stateless & Privacy-First Design

By design, Speechcraft does not persist translation history or user transcripts in a database:

*   **Data Ephemerality**: Transcripts flow in-memory. Once translated and broadcasted to the WebSocket server, the text is discarded by the backend.
*   **Zero Storage footprints**: Pushing translation payloads directly to the WebSocket client avoids database storage operations, satisfying privacy requirements.
*   **Security Advantages**: If the Supabase database is compromised, no history of past sermons or event transcripts is exposed.

---

## 🌐 5. Secrets Management

*   **Vercel Secrets**: Frontend access tokens (`NEXT_PUBLIC_SUPABASE_ANON_KEY`) are public-facing keys with read-only access to websocket channels.
*   **Supabase Secrets**: Private master API keys (`DEEPSEEK_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) are stored in secure environment variables that are only accessible by the Deno serverless Edge Functions and are never exposed to browser clients.
