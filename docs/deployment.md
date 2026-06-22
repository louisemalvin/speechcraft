# Deployment Guide

This document describes how to deploy Speechcraft's frontend and backend services to production environments.

---

## ⚡ 1. Backend Deployment (Supabase Edge Functions)

Speechcraft utilizes Supabase Edge Functions to proxy translation requests and issue ASR access tokens.

### Prerequisites
*   [Supabase CLI](https://supabase.com/docs/guides/cli) installed.
*   An active project on Supabase Cloud.

### Set Production Environment Variables
Deploy your secrets to the production Supabase project before deploying the functions. Run the following command using your Supabase project ref code:

```bash
supabase secrets set \
  DEEPSEEK_API_KEY="your_api_key" \
  ADMIN_PIN_HASH="your_sha256_pin_hash" \
  PIN_SALT="optional_pin_salt" \
  SUPABASE_SERVICE_ROLE_KEY="your_service_role_key" \
  SUPABASE_URL="https://your-project.supabase.co" \
  --project-ref your_project_ref
```

### Environment Variable Glossary
| Name | Type | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | String | API key to authenticate requests to the DeepSeek chat completions endpoint. |
| `DEEPSEEK_API_URL` | String | Base endpoint URL (defaults to `https://api.deepseek.com/v1`). |
| `ADMIN_PIN_HASH` | String | SHA-256 hash of the password PIN code (e.g. `03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4` for PIN `1234`). |
| `PIN_SALT` | String | Optional salt string appended to the input PIN before hashing to prevent rainbow table attacks. |
| `SUPABASE_SERVICE_ROLE_KEY` | String | Admin credential used by Deno to bypass RLS policies and broadcast translation packets directly to the Realtime WebSocket server. |
| `SUPABASE_URL` | String | The remote Supabase project URL endpoint. |

### Deploy the Edge Functions
Execute these commands to deploy the functions to the cloud:

```bash
supabase functions deploy translate --project-ref your_project_ref
supabase functions deploy get-deepgram-token --project-ref your_project_ref
```

---

## 💻 2. Frontend Deployment (Vercel)

The Next.js single-page application (`packages/frontend`) is hosted on Vercel's free serverless tier.

### Build Configuration on Vercel
1.  **Framework Preset**: Select `Next.js`.
2.  **Root Directory**: Set to `packages/frontend`. (Vercel automatically detects the pnpm workspace configurations).
3.  **Build Command**: `pnpm build`
4.  **Output Directory**: `packages/frontend/.next`

### Environment Variables
Configure the following variables in the Vercel Dashboard under **Project Settings > Environment Variables**:

| Variable Name | Value | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | The remote Supabase project API URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `your-anon-key` | The public anonymous key for viewers to establish read-only WebSocket connections. |
| `NEXT_PUBLIC_ASR_PROVIDER` | `deepgram` | The active Speech-to-Text engine (`deepgram` or `webspeech`). |
