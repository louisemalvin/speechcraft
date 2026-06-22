# 📦 Shared Package

This package contains common TypeScript types, interfaces, and static constants used across the Next.js frontend application and the Supabase serverless Edge Functions.

## 📁 Exports

The package exposes the following symbols:

*   **`TranslationPayload`**: The interface representing a single translation packet:
    ```typescript
    export interface TranslationPayload {
      sequence_number: number;
      raw_text: string;
      translated_text: string;
      timestamp: number;
    }
    ```
*   **`TranslationResponse`**: Expected response shape from the translation Edge Function.
*   **`MAX_HISTORY_WINDOW`**: Constant (set to `3`) defining the maximum number of past segments sent as sliding context to the translation LLM.

## 🛠️ Scripts

*   `pnpm build`: Runs the TypeScript compiler to output type declarations and JS outputs under the `dist/` folder.
