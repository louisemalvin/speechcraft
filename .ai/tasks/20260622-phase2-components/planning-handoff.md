# Planning Handoff: Phase 2 — Component Upgrades

## User Intent
Fix existing components to use design tokens instead of hardcoded colors, extract new components (SegmentCard, VuMeter, BroadcastButton) for reuse in pages. This is the component foundation phase — Phase 3 (Viewer) depends on SegmentCard being ready.

## Conversation-Derived Context
- Phase 1 (tokens) is complete and validated — warm stone/wine palette is live in globals.css
- The SegmentCard component spec has been simplified vs the original plan: no more opacity or isCurrent props — all segments render equally in the new scrolling feed model
- User wants no questions asked — just execute the pipeline

## Source Artifacts / Source Context
- `docs/ui-redesign-plan.md` — Phase 2 section
- Existing components: `packages/frontend/src/components/LoadingSpinner.tsx`, `PinGate.tsx`, `Icon.tsx`
- Task spec for Phase 1: `.ai/tasks/20260622-phase1-design-tokens/task-spec.md` (tokens now live)

## Proposed Task Shape
Single-unit but multi-file: fix 3 existing components + create 3 new components. All are independent of each other inside this phase.

## Assigned Output Path(s)
- `.ai/tasks/20260622-phase2-components/task-spec.md`

## Scope and Non-Goals

**In scope:**
- Fix LoadingSpinner: replace hardcoded `bg-slate-950`, `text-slate-100`, `text-slate-400` → design tokens
- Fix PinGate: replace `text-white` → `text-text-primary`, add `role="alert"` to error section
- Fix Icon: the "Headphones" icon is actually a volume/speaker SVG. Rename to "Volume" or add real Headphones
- Create SegmentCard: simple component rendering translatedText with className passthrough. No opacity/isCurrent props (simplified for scrolling feed). animate-fade-in-up entrance.
- Create VuMeter: volume bar with gradient, accessibility attributes (role="meter", aria-valuenow/min/max)
- Create BroadcastButton: large circular button with volume-reactive rings, dynamic aria-label

**Out of scope:**
- Any page-level changes (those are Phase 3)
- Speaker/admin page changes

## Constraints
- Build must pass after changes
- Components must use only design tokens (no hardcoded Tailwind color classes)
- New components go in `packages/frontend/src/components/`

## Acceptance Signals
- Build passes
- Zero hardcoded color classes in new/existing components
- SegmentCard has no opacity or isCurrent props
- VuMeter has role="meter" + aria attributes
- BroadcastButton has dynamic aria-label
- PinGate error section has role="alert"

## Authority Boundary
Implementer may edit `LoadingSpinner.tsx`, `PinGate.tsx`, `Icon.tsx`, and create `SegmentCard.tsx`, `VuMeter.tsx`, `BroadcastButton.tsx`. No page files. No globals.css.

## Open Questions / Stop Conditions
None. Specs are clear from the plan. Proceed directly.
