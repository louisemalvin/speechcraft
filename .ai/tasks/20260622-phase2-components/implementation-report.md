# Implementation Report — Step 2: Create New Components

## Outcome

All 3 new component files created successfully. Build passes. All acceptance criteria met.

## Files Changed

| File | Action | Status |
|------|--------|--------|
| `packages/frontend/src/components/SegmentCard.tsx` | Created | ✅ |
| `packages/frontend/src/components/VuMeter.tsx` | Created | ✅ |
| `packages/frontend/src/components/BroadcastButton.tsx` | Created | ✅ |

## Decisions

- **Tailwind v4 gradient syntax**: Used `bg-linear-to-r` (VuMeter) and `bg-linear-to-br` (BroadcastButton) as confirmed by `@import "tailwindcss"` in `globals.css`.
- **No `'use client'` on SegmentCard/VuMeter**: These are pure presentational components with no event handlers or hooks, consistent with the project pattern.
- **BroadcastButton has `'use client'`**: Required because it uses `onClick` handler.
- **No `className` passthrough on BroadcastButton**: The task spec section 6 mentions "className passthrough for parent customization" in the behavior description, but the implementation skeleton in the spec does not include a `className` prop in the interface or usage. Following the exact spec — the component as specified accepts `isListening`, `volume`, and `onToggle` only. If className passthrough is needed later, it can be added.
- **SegmentCard** — No `opacity` or `isCurrent` props (verified by grep exit 1). Font size inherited from parent. Only `text-text-primary` for color.
- **VuMeter** — All 4 accessibility attributes verified: `role="meter"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`.

## Verification

```bash
# Build
cd packages/frontend && pnpm build
# Result: ✓ Compiled successfully in 1820ms, ✓ TypeScript clean
#         ✓ 4 routes generated (/, /_not-found, /admin, /speaker)

# SegmentCard — no forbidden props (exit 1 = clean)
$ grep -n "opacity\|isCurrent" packages/frontend/src/components/SegmentCard.tsx
# Exit: 1 (no matches)

# VuMeter — accessibility attributes (each returns 1)
$ grep -c 'role="meter"'    packages/frontend/src/components/VuMeter.tsx  → 1
$ grep -c 'aria-valuenow'   packages/frontend/src/components/VuMeter.tsx  → 1
$ grep -c 'aria-valuemin'   packages/frontend/src/components/VuMeter.tsx  → 1
$ grep -c 'aria-valuemax'   packages/frontend/src/components/VuMeter.tsx  → 1

# BroadcastButton — dynamic aria-label
$ grep "Start broadcast\|Stop broadcast" packages/frontend/src/components/BroadcastButton.tsx
# → aria-label={isListening ? 'Stop broadcast' : 'Start broadcast'}
```

## Known Issues

None. Build is clean, all component specs are satisfied.
