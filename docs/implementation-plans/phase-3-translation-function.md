# Implementation Plan - Phase 3: DeepSeek Translation Function

## Objective
Implement the stateless `translate` serverless Edge Function running on the Deno runtime. It will authorize requests using the PIN header, call the DeepSeek V4-Flash API with sliding history context and custom glossary settings, and return the translated English text.

## Tech Stack
*   **Runtime**: Deno (configured via Supabase Edge Functions)
*   **API**: DeepSeek V4-Flash Chat API
*   **Libraries**: Standard Deno library imports (e.g. `std/http/server.ts`, Web Crypto API for SHA-256)

## Target File Location
`supabase/functions/translate/index.ts`

## Step-by-Step Instructions

### Step 1: Create the Function Scaffold
1. Run the Supabase CLI generator command:
   ```bash
   supabase functions new translate
   ```
2. This creates `supabase/functions/translate/index.ts`.

### Step 2: Implement Code Logic
Write the Deno server code inside `index.ts`. Make sure to implement:
1. **CORS Headers**: Allow preflight options requests (`OPTIONS`) from the frontend client.
2. **PIN Verification**:
   * Read the `x-admin-pin` header.
   * If missing, return `401 Unauthorized`.
   * Compute the SHA-256 hex string of the incoming PIN using the browser-standard Web Crypto API.
   * Compare it against `Deno.env.get("ADMIN_PIN_HASH")`. If it does not match, return `401 Unauthorized`.
3. **Request Body Parsing**: Read `{ raw_text: string, history: Array<{ raw: string, translated: string }> }`.
4. **DeepSeek Request Payload Construction**:
   * Build messages starting with the custom translation System Prompt.
   * Append the context history as alternating user/assistant messages.
   * Append the new raw Indonesian sentence as the final user message.
5. **API Fetch**:
   * Send the request to `${Deno.env.get("DEEPSEEK_API_URL")}/chat/completions` using the `DEEPSEEK_API_KEY` header.
   * Configure options: `model: "deepseek-chat"`, `temperature: 0.3`, `response_format: { type: "json_object" }` (forces JSON response formatting).
6. **Return Payload**:
   * Extract the `"translated_text"` key from the DeepSeek response and return it as `{ translated_text: "..." }` in the HTTP 200 response.

### Deno Code Blueprint (`index.ts`)
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-pin",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// SHA-256 hashing helper using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. PIN Authorization Gate
    const pin = req.headers.get("x-admin-pin");
    if (!pin) {
      return new Response(JSON.stringify({ error: "Missing PIN header" }), { status: 401, headers: corsHeaders });
    }

    const hashedPin = await sha256(pin);
    const targetHash = Deno.env.get("ADMIN_PIN_HASH");

    if (hashedPin !== targetHash) {
      return new Response(JSON.stringify({ error: "Unauthorized: Invalid PIN" }), { status: 401, headers: corsHeaders });
    }

    // 2. Parse payload
    const { raw_text, history } = await req.json();
    if (!raw_text) {
      return new Response(JSON.stringify({ error: "Missing raw_text" }), { status: 400, headers: corsHeaders });
    }

    // 3. Build prompts containing glossary and sliding window history
    const systemPrompt = `You are the translation engine of a real-time Indonesian-to-English church sermon pipeline.
Translate conversational Indonesian to natural, readable English for display to a church congregation.
Correct ASR transcription typos using surrounding context (e.g. "tuan" -> "Tuhan", "yesus" -> "Yesus").
Christian Glossary: "Tuhan" -> "Lord", "Bapa" -> "Father", "Roh Kudus" -> "Holy Spirit", "Firman" -> "Word".
Do NOT translate the context history, only translate the final prompt.
Return output strictly in JSON format: { "translated_text": "english_translation_here" }`;

    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Append history context (limit to last 3 entries)
    history.forEach((h: any) => {
      messages.push({ role: "user", content: `Context Segment (Indonesian): ${h.raw}` });
      messages.push({ role: "assistant", content: `Translation (English): ${h.translated}` });
    });

    // Append the new segment
    messages.push({ role: "user", content: `Translate this new segment (Indonesian): ${raw_text}` });

    // 4. Invoke DeepSeek
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    const apiUrl = Deno.env.get("DEEPSEEK_API_URL") || "https://api.deepseek.com/v1";

    const dsResponse = await fetch(`${apiUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages,
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!dsResponse.ok) {
      const errorText = await dsResponse.text();
      throw new Error(`DeepSeek API error: ${errorText}`);
    }

    const dsData = await dsResponse.json();
    const resultJson = JSON.parse(dsData.choices[0].message.content);

    return new Response(JSON.stringify({ translated_text: resultJson.translated_text }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
```

## Verification Criteria
1. Serve the Edge Function locally:
   ```bash
   supabase functions serve --no-verify-jwt
   ```
2. Execute a local HTTP mock request:
   ```bash
   curl -i -X POST http://localhost:54321/functions/v1/translate \
     -H "Content-Type: application/json" \
     -H "x-admin-pin: SermonTranslate2026!" \
     -d '{"raw_text": "Selamat pagi tuan.", "history": []}'
   ```
3. Confirm that the response status is `200 OK` and returns:
   ```json
   { "translated_text": "Good morning, Lord." }
   ```
4. Verify that sending an invalid PIN header (e.g. `x-admin-pin: 0000`) returns `401 Unauthorized` instantly.
