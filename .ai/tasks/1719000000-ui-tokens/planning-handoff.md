# UI Unit A: Design Tokens & Metadata — Planning Handoff

- **User Intent**: Establish a single-source-of-truth design token system using Tailwind CSS v4's @theme directive. Define all colors, spacing, border radii, fonts, and animation keyframes in one place. Fix metadata (title, description) and add a favicon. No hardcoded color classes should exist outside this token file.

- **Conversation-Derived Context**: The frontend audit found ~90 hardcoded color occurrences across two monolithic pages. The user wants modular, reusable, clean code with no hardcoded colors. This unit creates the foundation that all other UI units build on. Tailwind v4 is already configured with `@tailwindcss/postcss`.

- **Source Artifacts / Source Context**:
  - `packages/frontend/src/app/globals.css` — current Tailwind @theme (underpopulated)
  - `packages/frontend/src/app/layout.tsx` — metadata with scaffold title "Create Next App"
  - `packages/frontend/src/app/page.tsx` — viewer page (THEME_CLASSES map shows current color usage)
  - `packages/frontend/src/app/speaker/page.tsx` — speaker page (shows current color usage)
  - `.ai/context.md` — project conventions

- **Proposed Task Shape**: Single-unit task: update globals.css with design tokens, fix layout.tsx metadata, add favicon.

- **Assigned Output Path(s)**: .ai/tasks/1719000000-ui-tokens/task-spec.md

- **Scope and Non-Goals**:
  - IN SCOPE: 
    - `packages/frontend/src/app/globals.css` — expand @theme with: color palette (slate scale for surfaces, indigo for accent, green/red for status, amber for sepia theme), border radius scale (sm/md/lg/xl/2xl/full), font families, animation keyframes (fadeInUp, wave-1 through wave-5, pulse-ring)
    - `packages/frontend/src/app/layout.tsx` — update title to "Sermon Translator", description to "Real-time Indonesian-to-English church sermon translation", keep existing PWA/appleWebApp config
    - `packages/frontend/public/favicon.ico` or SVG favicon — add a simple microphone/church themed favicon (can be a placeholder SVG)
  - OUT OF SCOPE: Creating React components, refactoring pages, changing page behavior

- **Constraints**:
  - Tailwind CSS v4 syntax (@theme inline block, not tailwind.config.ts)
  - Colors must be semantic: `--color-surface-primary`, `--color-surface-secondary`, `--color-accent`, `--color-accent-hover`, `--color-status-live`, `--color-status-error`, etc. Not bare hex values in components.
  - Font: Geist Sans (already imported), Geist Mono for code
  - Radius scale: sm (0.375rem), md (0.5rem), lg (0.75rem), xl (1rem), 2xl (1.5rem), full (9999px)
  - Keep existing @theme variables (--color-background, --color-foreground, --font-sans, --font-mono)
  - Animations from the inline <style> blocks in page.tsx and speaker/page.tsx should move into @theme or a CSS layer in globals.css

- **Acceptance Signals**:
  1. globals.css @theme block has color palette with at least: surface (primary/secondary/tertiary), accent (default/hover), status (live/error/warning), text (primary/secondary/muted)
  2. globals.css has border-radius scale variables
  3. globals.css has animation keyframes: fadeInUp, wave-1..5, pulse-ring — moved from inline <style> blocks
  4. layout.tsx title is "Sermon Translator" (not "Create Next App")
  5. layout.tsx description describes the app
  6. A favicon file exists in public/ (simple SVG or .ico)
  7. `pnpm --filter frontend build` succeeds
  8. Existing functionality is not broken

- **Authority Boundary**: Task-planner formalizes spec. Implementer creates tokens and metadata. Validator confirms criteria. All UI units committed together after refactor.

- **Open Questions / Stop Conditions**:
  - Tailwind v4 @theme uses CSS custom properties — ensure they're usable as Tailwind classes (e.g., `bg-surface-primary` should work)
  - Stop if build fails with CSS-related errors
