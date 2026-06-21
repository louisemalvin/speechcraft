# UI Unit B: Reusable Base Components — Planning Handoff

- **User Intent**: Extract repeated UI patterns into reusable, typed React components. Create a component library under `packages/frontend/src/components/` with: Button, Card, StatusDot, Icon. These replace all inline styling patterns found in the audit.

- **Conversation-Derived Context**: The audit found 10+ nearly-identical buttons, 4 cards, 3 status dots, and 8 copy-pasted SVGs. Unit A (design tokens) provides the color/spacing foundation. This unit creates the component building blocks. Unit C will refactor pages to use them.

- **Source Artifacts / Source Context**:
  - `packages/frontend/src/app/page.tsx` — viewer page (contains all repeated patterns)
  - `packages/frontend/src/app/speaker/page.tsx` — speaker page (contains all repeated patterns)
  - `packages/frontend/src/app/globals.css` — design tokens (from Unit A, assume complete)
  - `.ai/context.md` — PascalCase components, named exports

- **Proposed Task Shape**: Single-unit task: create 4 component files under `packages/frontend/src/components/`.

- **Assigned Output Path(s)**: .ai/tasks/1719001000-ui-components/task-spec.md

- **Scope and Non-Goals**:
  - IN SCOPE:
    - `packages/frontend/src/components/Button.tsx` — variants: primary (indigo), secondary (slate/outline), ghost (transparent). Sizes: sm, md, lg. Props: variant, size, iconLeft, iconRight, children, and all standard button HTML attributes.
    - `packages/frontend/src/components/Card.tsx` — variants: default (slate surface), accent (indigo tint), error (red tint). Props: variant, padding (sm/md/lg), children, className.
    - `packages/frontend/src/components/StatusDot.tsx` — states: live (green pulse), idle (slate), error (red). Props: state, label (optional text).
    - `packages/frontend/src/components/Icon.tsx` — a single component rendering SVG icons by name. Icons needed: Microphone, Play, Stop, Lock, Settings/Gear, Headphones, ChevronDown, Close/X, UnlockArrow. Props: name, size (sm/md/lg).
  - OUT OF SCOPE: Composite components (PinGate, SettingsDrawer, SegmentCard — those are Unit C), page refactoring, behavior changes

- **Constraints**:
  - All components must use 'use client' directive (they contain interactivity or event handlers)
  - Use design tokens from globals.css (not hardcoded colors)
  - PascalCase filenames and component names
  - Named exports (not default)
  - TypeScript with proper prop interfaces
  - Tailwind classes for all styling
  - Buttons must have min-h-[48px] for mobile touch targets
  - Icon should accept className for additional styling
  - All interactive elements need aria-labels

- **Acceptance Signals**:
  1. All 4 component files exist in `packages/frontend/src/components/`
  2. Button renders all 3 variants and 3 sizes correctly
  3. Card renders all 3 variants correctly
  4. StatusDot renders all 3 states with appropriate animations
  5. Icon renders all 9 named icons at all 3 sizes
  6. No hardcoded Tailwind color classes (use design tokens)
  7. `pnpm --filter frontend build` succeeds
  8. Components compile without errors

- **Authority Boundary**: Task-planner formalizes spec. Implementer creates components. Validator confirms criteria.

- **Open Questions / Stop Conditions**:
  - Icon implementation: inline SVGs via switch/map vs importing SVG files — implementer chooses cleanest approach
  - Design tokens must exist from Unit A — if Unit A hasn't completed, use semantic Tailwind classes as fallback
  - Stop if build fails
