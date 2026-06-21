# Implementation Plan - Phase 1: Workspace & Monorepo Setup

## Objective
Establish a clean, type-safe monorepo workspace using `pnpm` workspaces, configure TypeScript sharing rules, define shared interfaces, and set up Vitest for co-located unit testing.

## Tech Stack
*   **Package Manager**: `pnpm` (workspaces enabled)
*   **Test Runner**: `vitest`
*   **Language**: `TypeScript`

## Target Folder Structure
```
/
├── packages/
│   ├── frontend/         # Next.js SPA application
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── shared/           # Common types & utilities
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types.ts
│           └── index.ts
├── pnpm-workspace.yaml   # PNPM workspace definition
├── package.json          # Root scripts & dev dependencies
└── tsconfig.json         # Base TypeScript configuration
```

## Step-by-Step Instructions

### Step 1: Initialize Root Monorepo Configurations
1. Create `pnpm-workspace.yaml` in the workspace root:
   ```yaml
   packages:
     - 'packages/*'
   ```
2. Create root `package.json`:
   ```json
   {
     "name": "translation-pipeline",
     "private": true,
     "scripts": {
       "dev": "concurrently \"pnpm --filter frontend dev\" \"supabase start\"",
       "build": "pnpm --filter shared build && pnpm --filter frontend build",
       "test": "vitest run",
       "test:watch": "vitest"
     },
     "devDependencies": {
       "concurrently": "^8.2.0",
       "typescript": "^5.2.2",
       "vitest": "^1.0.0"
     }
   }
   ```
3. Create root `tsconfig.json` containing base strict compiler options:
   ```json
   {
     "compilerOptions": {
       "target": "ES2022",
       "module": "NodeNext",
       "moduleResolution": "NodeNext",
       "esModuleInterop": true,
       "forceConsistentCasingInFileNames": true,
       "strict": true,
       "skipLibCheck": true
     }
   }
   ```

### Step 2: Initialize Shared Package (`packages/shared`)
1. Create `packages/shared/package.json`:
   ```json
   {
     "name": "shared",
     "version": "1.0.0",
     "main": "./dist/index.js",
     "types": "./dist/index.d.ts",
     "scripts": {
       "build": "tsc"
     },
     "devDependencies": {
       "typescript": "^5.2.2"
     }
   }
   ```
2. Create `packages/shared/tsconfig.json` inheriting from root:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist",
       "declaration": true
     },
     "include": ["src/**/*"]
   }
   ```
3. Create `packages/shared/src/types.ts` containing:
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
4. Export types in `packages/shared/src/index.ts`.

### Step 3: Initialize Frontend Package Boilerplate (`packages/frontend`)
1. Create a Next.js TypeScript application inside `packages/frontend` (e.g., using `npx create-next-app@latest . --typescript --tailwind --eslint --src-dir --app --import-alias "@/*"`).
2. Configure `packages/frontend/package.json` to include `"shared"` in its dependencies:
   ```json
   "dependencies": {
     "shared": "workspace:*"
   }
   ```

## Verification Criteria
1. Run `pnpm install` from the root and verify that dependencies install successfully.
2. Run `pnpm --filter shared build` and ensure the `dist/` directory generates with `.js` and `.d.ts` declaration files.
3. Run `pnpm test` and verify that the Vitest test runner boots and completes with 0 errors.
