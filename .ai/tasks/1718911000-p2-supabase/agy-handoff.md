# agy Handoff: Phase 2 — Supabase Serverless & Realtime Setup

## Implementer Persona and Boundaries

You are acting as the Implementer Agent for a Phase 2 Supabase setup task. Your boundaries:

- Do not edit `.ai/tasks/**` except the task's `implementation-report.md` and this handoff file.
- Do not edit `.ai/context.md` or `.ai/decisions/**`.
- Do not add backward compatibility, dependencies, abstractions, new files, or broad rewrites unless the task spec requires them.
- Do not commit, amend, or push.
- Do not write test files — the test-writer agent owns tests. Only write implementation source code.
- Do not modify the agy configuration or toggle.

If requirements are unclear, destructive, security-sensitive, or conflict with the task spec, stop and report back.

Default report back:
- Changes made.
- Implementation report path.
- Verification run.
- Open issues, risks, or follow-up needed.
- Test results — pass/fail counts and any failures.

## Orchestrator Command

Implement Phase 2: Supabase Serverless & Realtime Setup.

Key steps:
1. Verify supabase CLI is installed (`supabase --version`)
2. Run `supabase init` in the repo root
3. Configure `supabase/config.toml` — ensure realtime is enabled, disable migrations
4. Create `supabase/.env.local` with DEEPSEEK_API_KEY (placeholder), DEEPSEEK_API_URL, and a REAL SHA-256 hash of "SermonTranslate2026!" (compute it fresh with `echo -n "SermonTranslate2026!" | shasum -a 256 | cut -d' ' -f1`)
5. Create `packages/frontend/.env.local` with NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 and NEXT_PUBLIC_SUPABASE_ANON_KEY (use placeholder initially, then backfill from supabase start output)
6. Run `supabase start`, capture the anon key, backfill into frontend .env.local
7. Run `supabase status` to verify, then `supabase stop`

After implementation, write the implementation report.

Do NOT run the validator. Stop `supabase start` before finishing.

## Task Spec

Located at: `.ai/tasks/1718911000-p2-supabase/task-spec.md`

Full contents:

```
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

## Non-Goals

- Writing Edge Functions (Phase 3)
- Creating database tables, SQL migrations, or seed files
- Any frontend application code
- Any translation API logic
- Vercel deployment
- CI/CD pipeline configuration

## Testable Acceptance Criteria

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
```

## Project Context

From `.ai/context.md`:
- **Project**: 0-Cost Real-Time Church Sermon Translation Pipeline (Indonesian → English)
- **Tech Stack**: TypeScript, Next.js, Supabase (Postgres, Edge Functions, Realtime), DeepSeek V4-Flash, pnpm, Vitest
- **Conventions**: kebab-case files, camelCase functions, PascalCase types, named exports, TypeScript strict mode
- **Test Setup**: Vitest, test files co-located (`*.test.ts`), runner `pnpm vitest`
- **agy**: enabled (this handoff is the delegation mechanism)

## Relevant Files

### `packages/frontend/.gitignore`
Currently ignores `.*env*` files. That's fine — `.env.local` is gitignored.

### `packages/frontend/`
Next.js app. No `.env.local` exists yet. Needs one created.

### `docs/implementation-plans/phase-2-supabase-setup.md`
Step-by-step guide for Phase 2. Mirrors the task spec closely.

### `docs/realtime-broadcast.md`
Security model spec. Defines env vars: DEEPSEEK_API_KEY, DEEPSEEK_API_URL, ADMIN_PIN_HASH, SUPABASE_SERVICE_ROLE_KEY.

### `docs/system-architecture.md`
Confirms stateless ephemeral design, no database storage used.

### `.gitignore` (root)
Already ignores `.env.local` and `.env`.

## Report Path

The implementation report must be written to:
`.ai/tasks/1718911000-p2-supabase/implementation-report.md`

## Verification Commands

1. `supabase --version` — should output a version.
2. `ls supabase/config.toml supabase/.env.local packages/frontend/.env.local` — all three should exist.
3. `grep -E 'enabled\s*=\s*true' supabase/config.toml` near the `[realtime]` block.
4. Confirm no `sql` or `migrations` directories are being sourced in config.toml.
5. Inspect `supabase/.env.local`: verify `ADMIN_PIN_HASH` equals `echo -n "SermonTranslate2026!" | shasum -a 256 | cut -d' ' -f1`.
6. Run `supabase start` — must exit 0.
7. Run `supabase status` — must list API URL, Realtime URL, Studio URL as active.
8. Verify `packages/frontend/.env.local` anon key matches the one from `supabase status` output.
9. Run `supabase stop`.

## Constraints and Non-Goals

### Constraints
- Must have `supabase` CLI installed (check with `supabase --version`)
- Must have Docker running (Supabase CLI requires it)
- No SQL migration files — architecture is stateless, 0 database tables
- Realtime must be enabled in config.toml
- ADMIN_PIN_HASH must be a real SHA-256 hash (not a placeholder) — use `echo -n "SermonTranslate2026!" | shasum -a 256 | cut -d' ' -f1` to generate
- API Gateway should run at `http://localhost:54321`
- Frontend env vars use NEXT_PUBLIC_ prefix
- DEEPSEEK_API_KEY should be a placeholder value like `sk-your-deepseek-api-key`

### Non-Goals
- Writing Edge Functions (Phase 3)
- Creating database tables, SQL migrations, or seed files
- Any frontend application code
- Any translation API logic
- Vercel deployment
- CI/CD pipeline configuration

## Stop Conditions

- Stop if `supabase --version` fails (CLI not installed)
- Stop if Docker is not running (`docker info` fails)
- Stop if `supabase start` fails and cannot be resolved
- The ADMIN_PIN_HASH must be a real SHA-256, not a placeholder — compute it fresh

## Explicit Instructions

1. Preserve unrelated user changes. Only touch files listed in the task spec.
2. Write the implementation report at `.ai/tasks/1718911000-p2-supabase/implementation-report.md` after completing all edits.
3. Do not commit, amend, or push any changes.
4. Do not run the validator.
5. Stop `supabase start` (run `supabase stop`) before finishing.
6. The implementation report must include: Outcome, Files Changed, Decisions, Verification, Known Issues (if any).
7. After completing, report back with: changes made, implementation report path, verification run summary, and any open issues.
