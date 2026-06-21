# Phase 2: Supabase Serverless & Realtime Setup — Planning Handoff

- **User Intent**: Initialize the local Supabase environment (CLI init, config.toml, env files) to run the serverless Edge Functions and Realtime WebSocket broadcast server locally. No database migrations needed — architecture is 100% stateless.

- **Conversation-Derived Context**: Phase 1 is complete (monorepo with pnpm workspace, Next.js frontend scaffold). The user wants git commits between phases. Phase 2 is a single unit — all config is mechanical and tightly coupled. Supabase CLI and Docker must be available on the machine.

- **Source Artifacts / Source Context**:
  - `docs/implementation-plans/phase-2-supabase-setup.md` — primary spec with step-by-step instructions
  - `docs/realtime-broadcast.md` — security model, env var definitions, PIN-gate specs
  - `docs/system-architecture.md` — architecture overview confirming stateless design
  - `.ai/context.md` — project conventions
  - Existing Phase 1 output: root package.json, packages/frontend/ (already scaffolded)

- **Proposed Task Shape**: Single-unit task: run `supabase init`, configure `supabase/config.toml`, create `supabase/.env.local` and `packages/frontend/.env.local`, boot `supabase start`.

- **Assigned Output Path(s)**: `.ai/tasks/1718911000-p2-supabase/task-spec.md` (single unit)

- **Scope and Non-Goals**:
  - IN SCOPE: `supabase init`, `supabase/config.toml` review/configure (enable realtime, disable migrations), `supabase/.env.local` (DEEPSEEK_API_KEY, DEEPSEEK_API_URL, ADMIN_PIN_HASH), `packages/frontend/.env.local` (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY), `supabase start`
  - OUT OF SCOPE: Writing edge functions, creating DB tables/migrations, any frontend code, any API logic

- **Constraints**:
  - Must have `supabase` CLI installed (check with `supabase --version`)
  - Must have Docker running (Supabase CLI requires it)
  - No SQL migration files — architecture is stateless, 0 database tables
  - Realtime must be enabled in config.toml
  - ADMIN_PIN_HASH must be a real SHA-256 hash (not a placeholder) — use `echo -n "SermonTranslate2026!" | shasum -a 256` to generate
  - API Gateway should run at `http://localhost:54321`
  - Frontend env vars use NEXT_PUBLIC_ prefix
  - DEEPSEEK_API_KEY should be a placeholder value like `sk-your-deepseek-api-key` (the real key is secret)

- **Acceptance Signals**:
  1. `supabase --version` reports a valid version
  2. `supabase init` creates the `supabase/` directory with `config.toml`
  3. `supabase/config.toml` has realtime enabled and no DB migrations configured
  4. `supabase/.env.local` exists with DEEPSEEK_API_KEY, DEEPSEEK_API_URL, ADMIN_PIN_HASH
  5. `packages/frontend/.env.local` exists with NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
  6. `supabase start` boots the Docker emulator stack successfully
  7. `supabase status` shows API URL, Realtime URL, Studio URL as active

- **Authority Boundary**: Task-planner formalizes the spec. Implementer creates config files and boots services. Validator confirms acceptance criteria. After validation, orchestrator triggers git commit via shipper. Note: the implementer should NOT leave `supabase start` running after verification — stop it before reporting.

- **Open Questions / Stop Conditions**:
  - Stop if `supabase --version` fails (CLI not installed)
  - Stop if Docker is not running
  - Stop if `supabase start` fails and cannot be resolved
  - The ADMIN_PIN_HASH must be a real SHA-256, not the placeholder from the spec — compute it fresh
