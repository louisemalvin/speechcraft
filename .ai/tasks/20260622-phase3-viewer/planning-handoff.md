# Planning Handoff: Phase 3 — Viewer Page Redesign

## User Intent
Structurally redesign the viewer page from a 3-segment teleprompter with cascading opacity fade to a scrolling chat-feed model. All segments equally readable, newest at bottom, smart auto-scroll. This is the core UX change — the audience-facing surface.

## Conversation-Derived Context
- Churchgoers who don't understand the spoken language rely on the phone as their only source of comprehension. They read continuously, look up at the speaker, then look back down to catch up.
- Current teleprompter model is broken: text greys out before reading, layout jumps, looking away = lost sentences.
- New model: scrolling feed like a chat app. No fading, no jumping. Smart auto-scroll pauses when user scrolls up + "↓" jump button.
- Header: just "Speechcraft" brand, thin, no status dot. Error banner only on disconnect.
- Bottom bar: [A-] [A+] small left, big labeled "🔊 Read Aloud" button on right.
- Default font: text-3xl (30px). Empty state: simple waiting text.
- User wants no questions — just execute.

## Source Artifacts / Source Context
- `docs/ui-redesign-plan.md` — Phase 3 section with full layout, header, feed behavior, bottom bar, empty state, state handling table, token replacements
- `packages/frontend/src/app/page.tsx` — current viewer page (teleprompter model)
- `packages/frontend/src/components/SegmentCard.tsx` — already created in Phase 2
- Phase 1 tokens and Phase 2 components are complete and committed

## Proposed Task Shape
Single-unit: rewrite one file (`page.tsx`) with the new display model. Multiple changes within the file but all in one component.

## Assigned Output Path(s)
- `.ai/tasks/20260622-phase3-viewer/task-spec.md`

## Scope and Non-Goals

**In scope:**
- Replace teleprompter display with scrolling chat-feed
- Replace header: remove StatusDot, remove LIVE label, keep only "Speechcraft" brand
- Remove greeting card (no longer needed — card notification replaced by simpler approach)
- Add error banner for connection loss (shown only when disconnected)
- Move Read Aloud (TTS) button from header to bottom bar as labeled button
- Keep font size controls in bottom bar but repositioned
- Add smart auto-scroll with "↓" jump-to-latest button
- Use SegmentCard component for all segments
- Replace ALL hardcoded colors with design tokens
- Add connection-lost state (currently no disconnect handling in viewer)

**Out of scope:**
- Speaker page
- Admin page
- Any backend/API changes
- TTS service changes (just move UI placement)

## Constraints
- Build must pass
- Must use SegmentCard component (already created)
- All segments equally readable (same font size, same opacity)
- No StatusDot component usage in header
- Design tokens only — zero hardcoded Tailwind colors
- Must handle: initial state, connected, scrolled-up, connection lost, connection restored

## Acceptance Signals
- Scrolling feed display (not 3-segment teleprompter)
- Header shows "Speechcraft" only
- No StatusDot or LIVE indicator
- Error banner appears on disconnect, not before
- "↓" button appears when scrolled up and auto-scroll paused
- Bottom bar: A- [label] A+ on left, "🔊 Read Aloud" big button on right
- TTS toggle works same as before (just moved placement)
- All text equally readable, no opacity fade
- SegmentCard used for all segments
- Zero hardcoded color classes
- Build passes

## Authority Boundary
Implementer may edit `packages/frontend/src/app/page.tsx` only. May import SegmentCard. May not edit any other file.

## Open Questions / Stop Conditions
None. Full design decisions captured in plan and conversation. Execute directly.
