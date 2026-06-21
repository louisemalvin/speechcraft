# Monorepo Structure & Local Development Workflow

This document describes the monorepo configuration using `pnpm workspaces`, directories layout, dependency management, local testing with Vitest, and the Supabase CLI development workflow.

## Project Structure Layout

We use a monorepo setup to keep the Deno Edge Functions, Next.js frontend, and shared types co-located in a single repository.

```
/
├── packages/
│   ├── frontend/         # Next.js SPA application
│   │   ├── package.json
│   │   └── src/
│   ├── edge-functions/   # Supabase Edge Functions (Deno layout)
│   │   └── supabase/
│   │       └── functions/
│   │           └── translate/
│   │               └── index.ts
│   └── shared/           # Common interfaces, constants, and utilities
│       ├── package.json
│       └── src/
│           ├── types.ts  # Shared TypeScript definitions
│           └── utils.ts
├── supabase/             # Supabase project-level orchestration
│   └── config.toml       # Local Supabase configuration
├── pnpm-workspace.yaml   # PNPM workspace definition
├── package.json          # Root scripts & dev dependencies
└── tsconfig.json         # Base TypeScript configuration
```

---

## PNPM Workspace Configuration

The workspace topology is configured in `pnpm-workspace.yaml` in the root of the project:

```yaml
packages:
  - 'packages/*'
```

### Root `package.json`
The root file aggregates scripts to run components concurrently.

```json
{
  "name": "translation-pipeline",
  "private": true,
  "scripts": {
    "dev": "concurrently \"pnpm --filter frontend dev\" \"supabase start\"",
    "build": "pnpm --filter shared build && pnpm --filter frontend build",
    "test": "vitest run",
    "test:watch": "vitest",
    "supabase:serve": "supabase functions serve --no-verify-jwt",
    "supabase:deploy": "supabase functions deploy translate"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "typescript": "^5.2.2",
    "vitest": "^1.0.0"
  }
}
```

---

## Shared Library Package (`packages/shared`)

The shared library contains data models, common constants, validation schemas, and unit tests.

### Shared TypeScript Types (`packages/shared/src/types.ts`)
```typescript
export interface TranslationPayload {
  sequenceNumber: number;
  rawText: string;
  translatedText: string;
  timestamp: number;
}

export interface TranslationResponse {
  translated_text: string;
}
```

---

## Supabase Local Development & Deployment

The local Supabase emulator is used to run the Realtime WebSocket server and Edge Functions locally without incurring any costs.

### Local Development Flow

1. **Install Supabase CLI** (if not installed):
   ```bash
   npm install -g supabase
   ```

2. **Initialize Supabase**:
   ```bash
   supabase init
   ```

3. **Start Local Emulator Stack**:
   This spins up local Docker containers for the local API gateway (at `localhost:54321`) and the Realtime WebSocket server.
   ```bash
   supabase start
   ```

4. **Serve Edge Functions Locally**:
   To test Deno function execution without deploying to production:
   ```bash
   supabase functions serve --no-verify-jwt
   ```


---

## Test Execution with Vitest

In accordance with our test layout conventions, tests reside next to the source files they cover.

Example structure:
- Source: `packages/shared/src/utils.ts`
- Test: `packages/shared/src/utils.test.ts`

### Running Tests
Execute unit tests from the workspace root:
```bash
pnpm test
```

### Mocking Deno/Edge Function APIs
Since Supabase Edge Functions use Deno runtime APIs, Vitest provides unit testing isolation by mocking global network fetches and database clients.

Example Vitest mock (`packages/shared/src/utils.test.ts`):
```typescript
import { describe, it, expect, vi } from 'vitest';
import { validateSegment } from './utils';

describe('Segment Validation Utility', () => {
  it('should accept clean Indonesian sentences', () => {
    const result = validateSegment('Selamat pagi jemaat sekalian.');
    expect(result.isValid).toBe(true);
  });

  it('should reject empty or whitespace-only inputs', () => {
    const result = validateSegment('    ');
    expect(result.isValid).toBe(false);
  });
});
```
