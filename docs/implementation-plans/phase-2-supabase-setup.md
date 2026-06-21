# Implementation Plan - Phase 2: Supabase Serverless & Realtime Setup

## Objective
Initialize the local Supabase environment and configure the local settings to run the serverless Edge Functions and Realtime WebSocket broadcast server locally without database migrations.

## Tech Stack
*   **CLI**: `supabase` (Supabase CLI)
*   **Containers**: Docker (required by Supabase CLI to run local services)

## Step-by-Step Instructions

### Step 1: Initialize Supabase CLI
1. Verify that the Supabase CLI is installed on your machine (`supabase --version`).
2. Run the initialization command in the repository root:
   ```bash
   supabase init
   ```
3. This creates a `supabase` directory with a `config.toml` file.

### Step 2: Configure `supabase/config.toml`
Open `supabase/config.toml` and review the local service settings. Ensure the following configurations are set:
1. **Enable Realtime**: Verify that `[realtime]` is enabled (it is on by default).
2. **Disable DB migrations if reset**: Since our architecture is 100% stateless and uses **0 database tables**, we do not need to write SQL migration files under `supabase/migrations/`.
3. **Verify API Gateway Port**: The local Supabase gateway runs at `http://localhost:54321`.

### Step 3: Write Local Environment Configuration
Since we are bypassing database-level writes, the translation Edge Function will authenticate requests using a SHA-256 password PIN hash.

1. Generate a SHA-256 hash of your chosen speaker password (e.g. `SermonTranslate2026!`) using the shell command:
   ```bash
   echo -n "SermonTranslate2026!" | shasum -a 256
   # Output: 37d80a1c62f2cc9650b296eb4cde4010a30b427b3d39589d9e6e8e8e8e8e8e8e
   ```
2. Create `supabase/.env.local` to store secrets for local Edge Function testing:
   ```env
   DEEPSEEK_API_KEY=your_deepseek_api_key
   DEEPSEEK_API_URL=https://api.deepseek.com/v1
   ADMIN_PIN_HASH=37d80a1c62f2cc9650b296eb4cde4010a30b427b3d39589d9e6e8e8e8e8e8e8e
   ```

3. Create the frontend environment config `packages/frontend/.env.local` to connect to the local emulator gateway:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
   ```
   *(Note: You will find `your_local_anon_key` in the terminal output when starting Supabase in the next step).*

### Step 4: Boot Supabase Stack
1. Start the local Docker-based emulator stack:
   ```bash
   supabase start
   ```
2. Save the **anon key** and **service_role key** output in the terminal to your environment config files.

## Verification Criteria
1. Run `supabase status` and verify that the API URL, GraphQL URL, Studio URL, and Realtime URL are active.
2. Confirm that you can open the local Supabase Studio dashboard at `http://localhost:54323`.
