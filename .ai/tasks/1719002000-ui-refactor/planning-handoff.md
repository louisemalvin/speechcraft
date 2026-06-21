# UI Unit C: Page Refactor & Component Integration — Planning Handoff

- **User Intent**: Refactor both page.tsx and speaker/page.tsx to use the design tokens (Unit A) and reusable components (Unit B). Replace all inline styling with components. Extract remaining composite patterns into their own components. Remove all hardcoded colors. Clean up inline <style> blocks.

- **Conversation-Derived Context**: Units A (design tokens) and B (components) provide the foundation. This unit refactors the two monolithic page files to be clean, modular compositions of components. No behavior changes — pure refactor.

- **Source Artifacts / Source Context**:
  - `packages/frontend/src/app/page.tsx` (449 lines)
  - `packages/frontend/src/app/speaker/page.tsx` (319 lines)
  - `packages/frontend/src/app/globals.css` (design tokens from Unit A)
  - `packages/frontend/src/components/` (Button, Card, StatusDot, Icon from Unit B)
  - `.ai/context.md`

- **Proposed Task Shape**: Single-unit task: refactor pages + extract composite components.

- **Assigned Output Path(s)**: .ai/tasks/1719002000-ui-refactor/task-spec.md

- **Scope and Non-Goals**:
  - IN SCOPE:
    - Refactor `page.tsx`: replace inline buttons with Button component, inline cards with Card, status dot with StatusDot, inline SVGs with Icon, remove inline <style> block (animations now in globals.css)
    - Refactor `speaker/page.tsx`: same replacements, remove inline <style> block
    - Extract `PinGate.tsx` component from speaker page (PIN input form with remember-me checkbox)
    - Extract `SettingsDrawer.tsx` component from viewer page (font size + theme selectors)
    - Extract `SegmentCard.tsx` component from viewer page (individual translation segment display)
    - Header in both pages should use design tokens and adapt to theme
  - OUT OF SCOPE: New features, behavior changes, layout.tsx changes (done in Unit A)

- **Constraints**:
  - All extracted components go in `packages/frontend/src/components/` (alongside Unit B components) or subdirectories
  - Zero hardcoded Tailwind color classes (e.g., no `bg-slate-950` — use tokens)
  - Zero inline <style> blocks (all animations in globals.css or component CSS modules)
  - Same behavior as current pages — users should see no difference
  - PascalCase components, named exports
  - Pages should shrink significantly (target: page.tsx <200 lines, speaker/page.tsx <150 lines)
  - Accessibility preserved (keep all aria-labels)

- **Acceptance Signals**:
  1. Both pages compile and `pnpm --filter frontend build` succeeds
  2. No hardcoded Tailwind color classes in any component or page file
  3. No inline <style> blocks in any component or page file
  4. All extracted components exist in `packages/frontend/src/components/`
  5. page.tsx is under 200 lines
  6. speaker/page.tsx is under 150 lines
  7. Visual appearance matches current deployment exactly (or improved)
  8. All existing functionality preserved (PIN gate, remember-me, broadcast, auto-scroll, TTS, settings, themes)

- **Authority Boundary**: Task-planner formalizes spec. Implementer refactors pages. Validator confirms criteria. After validation, all UI units committed together.

- **Open Questions / Stop Conditions**:
  - Stop if build fails
  - If design tokens from Unit A aren't available, proceed with semantic Tailwind classes directly (this is a fallback)
