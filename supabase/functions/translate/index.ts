import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

// Centralized Configuration Constants
const MAX_HISTORY_WINDOW = 3;
const MAX_PIN_FAILURES = 5;
const PIN_BLOCK_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 120;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

// In-memory rate limiting and blocking states
const pinFailures = new Map<string, { count: number; blockedUntil: number }>();
const requestTimestamps = new Map<string, number[]>();

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") || "";
  let allowOrigin = "*";
  const allowedOriginsEnv = Deno.env.get("ALLOWED_ORIGINS");
  if (allowedOriginsEnv !== undefined && allowedOriginsEnv !== null) {
    const allowedOrigins = allowedOriginsEnv.split(",").map(o => o.trim());
    if (allowedOrigins.includes(origin)) {
      allowOrigin = origin;
    } else {
      allowOrigin = allowedOrigins[0] || ""; // fail CORS for unauthorized origins
    }
  }
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-pin",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function getClientIp(req: Request): string {
  const cfIp = req.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const parts = xForwardedFor.split(",");
    const clientIp = parts[0].trim();
    if (clientIp) return clientIp;
  }

  return "unknown-ip";
}

// SHA-256 hashing helper using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function cleanTranslation(text: string): string {
  let cleaned = text.trim();
  
  // Remove leading/trailing escaped double/single quotes or literal double/single quotes
  while (true) {
    const len = cleaned.length;
    if (cleaned.startsWith('\\"') && cleaned.endsWith('\\"')) {
      cleaned = cleaned.substring(2, cleaned.length - 2);
    } else if (cleaned.startsWith('\\\'') && cleaned.endsWith('\\\'')) {
      cleaned = cleaned.substring(2, cleaned.length - 2);
    } else if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    } else if (cleaned.startsWith("'") && cleaned.endsWith("'")) {
      cleaned = cleaned.substring(1, cleaned.length - 1);
    } else {
      break;
    }
    if (cleaned.length === len) break;
  }
  
  // Strip trailing backslashes/escapes
  cleaned = cleaned.replace(/\\+$/g, '');
  
  return cleaned.trim();
}

function parseTranslationResponse(content: string): string {
  const trimmedContent = content.trim();
  if (!trimmedContent) {
    throw new Error("Empty response content");
  }

  // 1. Primary: JSON.parse and extract .translated_text
  try {
    const parsed = JSON.parse(trimmedContent);
    if (parsed && typeof parsed.translated_text === "string") {
      return cleanTranslation(parsed.translated_text);
    }
  } catch (_) {
    // Proceed to Fallback 1
  }

  // 2. Fallback 1: regex-extract content between curly braces, re-parse.
  const braceMatch = trimmedContent.match(/\{([\s\S]*)\}/);
  if (braceMatch) {
    const innerContent = braceMatch[1];
    try {
      const parsed = JSON.parse(`{${innerContent}}`);
      if (parsed && typeof parsed.translated_text === "string") {
        return cleanTranslation(parsed.translated_text);
      }
    } catch (_) {
      // If parsing fails, try regex extracting the value of "translated_text"
      const textMatch = innerContent.match(/"translated_text"\s*:\s*"([\s\S]*?)"/);
      if (textMatch) {
        return cleanTranslation(textMatch[1]);
      }
    }
  }

  // 3. Fallback 2: treat the entire string as the raw translation.
  const rawTranslation = cleanTranslation(trimmedContent);
  if (!rawTranslation) {
    throw new Error("Failed to parse translation from response");
  }
  return rawTranslation;
}

const systemPrompt = `You are the translation engine of a real-time Indonesian-to-English church sermon pipeline.
Your goal is to translate spoken Indonesian into natural, grammatically correct, and contextually appropriate English.

Core Instructions:
1. Translate conversational Indonesian to natural, readable English suitable for displaying live to a church congregation.
2. Correct ASR (Automatic Speech Recognition) transcription typos. Spoken Indonesian often results in phonetically similar typos (e.g., "tuan" instead of "Tuhan", "yesus" instead of "Yesus", "roh kudus" instead of "Roh Kudus"). Use the surrounding sermon context to repair these spelling errors.
3. Align translations with Christian theological terminology (see the Indonesian-English church glossary below).
4. Keep translations concise and immediate. Do not add commentary, explanations, formatting markers, or conversational filler.
5. Translate the final user prompt. You are provided up to 3 prior segments as context to preserve flow and pronoun antecedents. Do NOT translate the context segments; only translate the LAST segment.
6. Return your output STRICTLY in JSON format with a single key "translated_text" containing the translated string.
7. Bilingual Sermon Rules: If English words or mixed text are encountered, preserve them in the translation and correct any obvious ASR phonetic spelling issues (e.g. translate 'god bles yu' to 'God bless you'). Do not translate English text back to Indonesian.

Indonesian-English Church Glossary:
- "Tuhan" -> "Lord" (rarely "Sir" or "master" in this context)
- "Bapa" -> "Father"
- "Roh Kudus" -> "Holy Spirit"
- "Firman" -> "Word" (e.g., "Firman Tuhan" -> "Word of God")
- "Kasih karunia" -> "Grace"
- "Jemaat" / "Umat" -> "Congregation" / "Church members"
- "Alkitab" -> "Bible"
- "Gembala" / "Pendeta" -> "Pastor"
- "Kristus" -> "Christ"
- "Salib" / "Penyaliban" -> "Cross" / "Crucifixion"
- "Kebaktian" / "Ibadah" -> "Service" / "Worship service"
- "Pujian" / "Penyembahan" -> "Praise" / "Worship"
- "Keselamatan" -> "Salvation"
- "Dosa" -> "Sin"
- "Kerajaan Allah" -> "Kingdom of God"
- "Penebusan" -> "Redemption"
- "Saksi" -> "Witness"
- "Mujizat" -> "Miracle"
- "Perjamuan Kudus" -> "Holy Communion"`;

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const ip = getClientIp(req);
  const now = Date.now();

  // Check if IP is blocked due to excessive PIN failures
  const failureRecord = pinFailures.get(ip);
  if (failureRecord && now < failureRecord.blockedUntil) {
    return new Response(
      JSON.stringify({ error: "IP temporarily blocked due to multiple PIN verification failures" }),
      {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  try {
    // 1. PIN Authorization Gate
    const pin = req.headers.get("x-admin-pin");
    if (!pin) {
      const record = pinFailures.get(ip) || { count: 0, blockedUntil: 0 };
      record.count += 1;
      if (record.count >= MAX_PIN_FAILURES) {
        record.blockedUntil = now + PIN_BLOCK_DURATION_MS;
      }
      pinFailures.set(ip, record);

      return new Response(JSON.stringify({ error: "Missing PIN header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const salt = Deno.env.get("PIN_SALT") || "";
    const hashedPin = await sha256(salt + pin);
    const targetHash = Deno.env.get("ADMIN_PIN_HASH");

    if (hashedPin !== targetHash) {
      const record = pinFailures.get(ip) || { count: 0, blockedUntil: 0 };
      record.count += 1;
      if (record.count >= MAX_PIN_FAILURES) {
        record.blockedUntil = now + PIN_BLOCK_DURATION_MS;
      }
      pinFailures.set(ip, record);

      return new Response(JSON.stringify({ error: "Unauthorized: Invalid PIN" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Reset PIN failure count on success
    pinFailures.delete(ip);

    // 2. Successful Request Rate Limiting (120 requests/min)
    const timestamps = requestTimestamps.get(ip) || [];
    const oneMinuteAgo = now - RATE_LIMIT_WINDOW_MS;
    const recent = timestamps.filter(t => t > oneMinuteAgo);
    if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded" }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    recent.push(now);
    requestTimestamps.set(ip, recent);

    // 3. Parse request payload
    let body;
    try {
      body = await req.json();
    } catch (_) {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    const { raw_text, history = [], sequence_number, audio_start_time, stt_received_time } = body;
    if (!raw_text) {
      return new Response(JSON.stringify({ error: "Missing raw_text" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 4. Build prompt context with sliding window
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    const historyLimit = history.slice(-MAX_HISTORY_WINDOW);
    historyLimit.forEach((h: any) => {
      messages.push({ role: "user", content: `Context Segment (Indonesian): ${h.raw}` });
      messages.push({ role: "assistant", content: `Translation (English): ${h.translated}` });
    });

    messages.push({ role: "user", content: `Translate this new segment (Indonesian): ${raw_text}` });

    // 5. Invoke DeepSeek V4-Flash
    const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
    if (!apiKey) {
      throw new Error("Missing DEEPSEEK_API_KEY environment variable");
    }
    const apiUrl = Deno.env.get("DEEPSEEK_API_URL") || "https://api.deepseek.com/v1";

    const deepseek_start_time = Date.now();

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
    const deepseek_received_time = Date.now();
    const responseContent = dsData.choices?.[0]?.message?.content;
    if (!responseContent) {
      throw new Error("Empty or invalid response from DeepSeek API");
    }

    const translated_text = parseTranslationResponse(responseContent);

    // 6. Broadcast via Supabase Realtime channel directly from the server
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseServiceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
      const channel = supabaseAdmin.channel("sermon-live");
      
      await new Promise<void>((resolve, reject) => {
        channel.subscribe(async (status, err) => {
          if (err) {
            reject(err);
            return;
          }
          if (status === "SUBSCRIBED") {
            try {
              await channel.send({
                type: "broadcast",
                event: "translation_segment",
                payload: {
                  sequence_number: sequence_number || 1,
                  raw_text,
                  translated_text,
                  timestamp: Date.now(),
                  audio_start_time,
                  stt_received_time,
                  deepseek_start_time,
                  deepseek_received_time,
                },
              });
              resolve();
            } catch (sendErr) {
              reject(sendErr);
            }
          }
        });
      }).catch((broadcastErr) => {
        console.error("Realtime broadcast error:", broadcastErr);
      });

      // Cleanup subscription connection
      try {
        await channel.unsubscribe();
      } catch (unsubErr) {
        console.error("Unsubscribe error:", unsubErr);
      }
    } else {
      console.warn("Skipping Realtime broadcast: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured");
    }

    return new Response(JSON.stringify({
      translated_text,
      audio_start_time,
      stt_received_time,
      deepseek_start_time,
      deepseek_received_time
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });

  } catch (err: any) {
    console.error("Internal translation handler error:", err);
    // Generic error payload to prevent detail leakage
    return new Response(JSON.stringify({ error: "Translation service error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
