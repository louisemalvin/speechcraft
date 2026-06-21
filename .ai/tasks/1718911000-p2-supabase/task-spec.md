# Task Spec: Phase 2 — Supabase Serverless & Realtime Setup

## Source Artifacts / Handoff Context

- **User Intent**: Initialize the local Supabase environment (CLI init, config.toml, env files) to run the serverless Edge Functions and Realtime WebSocket broadcast server locally. No database migrations — architecture is 100% stateless with 0 database tables.
- **Phase 1 Output**: Monorepo with pnpm workspace is scaffolded (`packages/frontend/`, `packages/shared/`, root `package.json`).
- **Canonical Source**: `docs/implementation-plans/phase-2-supabase-setup.md` — primary step-by-step spec.
- **Security Model**: `docs/realtime-broadcast.md` — env var definitions, PIN-gate auth, WebSocket payload schema.
- **Architecture Confirmation**: `docs/system-architecture.md` — confirms stateless ephemeral design; no Postgres storage used.
- **Project Conventions**: `.ai/context.md` — TypeScript, pnpm, Vitest, kebab-case files, camelCase functions, PascalCase types, no DB in this phase.
- **Handoff Context**: `.ai/tasks/1718911000-p2-supabase/planning-handoff.md` — authoritative scope, constraints, and acceptance signals.

## Scope

**Single unit** — all configuration is mechanical and tightly coupled.

1. **`supabase init`**: Run in repo root; creates `supabase/` directory with `config.toml`.
2. **Configure `supabase/config.toml`**: Review and adjust:
   - Verify `[realtime]` is enabled (on by default).
   - Disable/reset DB migration settings so the CLI does not look for SQL migration files.
3. **Create `supabase/.env.local`** with the following variables:
   - `DEEPSEEK_API_KEY` — placeholder: `sk-your-deepseek-api-key`
   - `DEEPSEEK_API_URL` — `https://api.deepseek.com/v1`
   - `ADMIN_PIN_HASH` — real SHA-256 hash of `SermonTranslate2026!` (computed fresh via `echo -n "SermonTranslate2026!" | shasum -a 256 | cut -d' ' -f1`)
4. **Create `packages/frontend/.env.local`** with:
   - `NEXT_PUBLIC_SUPABASE_URL` — `http://localhost:54321`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the actual anon key emitted by `supabase start` (not a placeholder).
5. **`supabase start`**: Boot the local Docker emulator stack. Capture the anon key from terminal output and backfill into `packages/frontend/.env.local`.
6. **Stop the stack** after verification (do not leave containers running).

## Execution

**Pipeline**: `implementer → validator`

### Prerequisites (implementer must verify before proceeding)

- `supabase --version` must return a valid version string. **Stop if CLI is not installed.**
- Docker must be running (`docker info` must succeed). **Stop if Docker is not available.**
- Working directory must be the repository root.

### Steps (implementer)

1. Run `supabase init` from the repo root. Confirm `supabase/` directory and `config.toml` are created.
2. Inspect `supabase/config.toml`:
   - Confirm `[realtime]` block has `enabled = true`.
   - Set any migration-related gates (e.g., `[db]` blocks or `migration_enabled` fields) to prevent migration lookups.
3. Generate the ADMIN_PIN_HASH:
   ```bash
   echo -n "SermonTranslate2026!" | shasum -a 256 | cut -d' ' -f1
   ```
   Use the computed hash in the env file — do not use a hardcoded placeholder.
4. Create `supabase/.env.local` with `DEEPSEEK_API_KEY=sk-your-deepseek-api-key`, `DEEPSEEK_API_URL=https://api.deepseek.com/v1`, and the computed `ADMIN_PIN_HASH`.
5. Create `packages/frontend/.env.local` with `NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321` and a temporary placeholder for `NEXT_PUBLIC_SUPABASE_ANON_KEY` (to be replaced in step 7).
6. Run `supabase start`. Wait for all containers to boot.
7. From the `supabase start` terminal output, extract the **anon key**. Update `packages/frontend/.env.local` to replace the placeholder with the real anon key.
8. Run `supabase status` to confirm all services.
9. Run `supabase stop` to shut down the emulator stack. Do not leave containers running.

### Steps (validator)

The validator confirms every acceptance criterion below. Any failure is reported back to the orchestrator with specifics.

## Non-Goals

- Writing Edge Functions (Phase 3)
- Creating database tables, SQL migrations, or seed files
- Any frontend application code
- Any translation API logic
- Vercel deployment
- CI/CD pipeline configuration

## Testable Acceptance Criteria

Each criterion is verifiable via CLI commands or file inspection.

1. **CLI available**: `supabase --version` outputs a valid version.
2. **Init artifacts exist**: `supabase/` directory and `supabase/config.toml` are present on disk.
3. **Realtime enabled in config**: `grep -A2 '\[realtime\]' supabase/config.toml` shows `enabled = true`.
4. **No migration config**: The config.toml does not reference any migration directory that would trigger migration-on-start behaviour.
5. **Server-side env file**: `supabase/.env.local` exists and contains exactly three keys: `DEEPSEEK_API_KEY`, `DEEPSEEK_API_URL`, `ADMIN_PIN_HASH`.
6. **ADMIN_PIN_HASH is a real hash**: The value of `ADMIN_PIN_HASH` is a 64-character hex string matching `sha256("SermonTranslate2026!")`.
7. **Frontend env file**: `packages/frontend/.env.local` exists and contains `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
8. **Stack boots**: `supabase start` exits successfully and all containers reach healthy state.
9. **Services active**: `supabase status` reports API URL, Realtime URL, and Studio URL as active (typically `http://localhost:54321`, `ws://localhost:54321/realtime/v1`, and `http://localhost:54323`).
10. **Anon key is real**: The `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `packages/frontend/.env.local` is not a placeholder string — it matches the anon key emitted by `supabase start`.

### Test File Paths

No automated test files are required for this phase. All validation is operational (CLI commands and file inspection). The acceptance criteria themselves serve as the test plan.

## Inspectable Acceptance Criteria

- `supabase/config.toml` reviewed by human — realtime block enabled, no DB migration paths configured.
- `supabase/.env.local` — values inspected for correctness; `ADMIN_PIN_HASH` is a real SHA-256 (not a placeholder).
- `packages/frontend/.env.local` — `NEXT_PUBLIC_SUPABASE_ANON_KEY` is populated with the real anon key from `supabase start` output.

## Relevant Files

| File | Role |
|---|---|
| `supabase/config.toml` | Created by `supabase init`; modified to enable realtime, disable migrations |
| `supabase/.env.local` | Server-side secrets for Edge Function runtime |
| `packages/frontend/.env.local` | Frontend connection config for local emulator |
| `docs/implementation-plans/phase-2-supabase-setup.md` | Primary implementation guide |
| `docs/realtime-broadcast.md` | Env var definitions and security model |
| `docs/system-architecture.md` | Confirms stateless architecture |

## Validation Plan

1. Run `supabase --version` — should output a version.
2. Run `ls supabase/config.toml supabase/.env.local packages/frontend/.env.local` — all three should exist.
3. Run `grep -E 'enabled\s*=\s*true' supabase/config.toml` near the `[realtime]` block.
4. Confirm no `sql` or `migrations` directories are being sourced in config.toml.
5. Inspect `supabase/.env.local`: verify `ADMIN_PIN_HASH` equals `echo -n "SermonTranslate2026!" | shasum -a 256 | cut -d' ' -f1`.
6. Run `supabase start` — must exit 0.
7. Run `supabase status` — must list API URL, Realtime URL, Studio URL as active.
8. Verify `packages/frontend/.env.local` anon key matches the one from `supabase status` output.
9. Run `supabase stop`.

## Open Questions

- None. All decisions are specified by the handoff and source artifacts.
