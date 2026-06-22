# Planning Handoff: Phase 1 — Design Tokens & Color Palette

## User Intent
Replace the cold slate/indigo color palette with a warm stone/wine palette across the CSS design tokens. This is the foundation for the entire UI redesign — all subsequent phases depend on these tokens being correct.

## Conversation-Derived Context
- The actual logo (`docs/images/speechcraft-logo.png`) is a random internet image, not the real brand logo. The color palette (maroon/cream) was intentionally adopted from it as a design direction, not because it has brand authority.
- No logo exists yet — "Speechcraft" is a wordmark-only brand for now.
- User chose to keep the warm stone/wine palette (Option 1) despite no real logo anchoring it.
- Speaker and admin pages are deferred — only viewer redesign is in scope, but Phase 1 (tokens) affects all pages and must be universal.

## Source Artifacts / Source Context
- `docs/ui-redesign-plan.md` — full plan with token mapping tables in Phase 1
- `packages/frontend/src/app/globals.css` — current CSS tokens file
- `packages/frontend/src/app/layout.tsx` — themeColor and font config

## Proposed Task Shape
Single-unit: edit two files (globals.css, layout.tsx) to replace all CSS custom property values, add brand tokens, remove unused tokens, fix body typography, and update themeColor.

## Assigned Output Path(s)
- `.ai/tasks/20260622-phase1-design-tokens/task-spec.md`

## Scope and Non-Goals
**In scope:**
- Replace surface color tokens (5 tokens: primary through muted)
- Replace accent color tokens (5 tokens: accent through accent-muted)
- Replace text color tokens (3 tokens: primary through muted)
- Add brand tokens (brand-maroon, brand-cream, surface-glass)
- Remove unused tokens (theme-blue, theme-sepia, theme-light, status-error-bg, wave animations, root background/foreground, prefers-color-scheme-dark)
- Fix body typography (remove Arial override, use surface/text tokens)
- Update layout.tsx themeColor

**Out of scope:**
- Any page-level changes (viewer, speaker, admin)
- Component changes (those are Phase 2)
- Any structural UI changes

## Constraints
- Must not break the build (`npx next build` in packages/frontend)
- Tokens must be valid CSS custom properties
- Existing components that reference tokens by name (e.g., `bg-surface-primary`) must continue to work — only values change, not key names

## Acceptance Signals
- Build passes: `cd packages/frontend && npx next build`
- Zero hardcoded slate/emerald/red color classes in globals.css: `grep -rn "bg-slate\|text-slate\|bg-emerald\|bg-red-\|text-red-\|text-white\|bg-white" packages/frontend/src/app/globals.css` returns no results
- All token values match the mapping tables in the plan

## Authority Boundary
Implementer may edit `globals.css` and `layout.tsx` only. No other files. No structural changes. No UI component edits.

## Open Questions / Stop Conditions
- None. Token mappings are fully specified in the plan. Proceed directly.
