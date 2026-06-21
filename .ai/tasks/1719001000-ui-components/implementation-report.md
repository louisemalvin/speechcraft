# Implementation Report — UI Unit B: Reusable Base Components

## Outcome

All 4 component files created successfully. Build passes with zero errors.

## Files Changed

| File | Action |
|------|--------|
| `packages/frontend/src/components/Button.tsx` | CREATED |
| `packages/frontend/src/components/Card.tsx` | CREATED |
| `packages/frontend/src/components/StatusDot.tsx` | CREATED |
| `packages/frontend/src/components/Icon.tsx` | CREATED |

No existing files were modified.

## Component Details

### Button.tsx
- **Export**: `export function Button` (named export)
- **Props interface**: `ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>` with `variant`, `size`, `iconLeft`, `iconRight`
- **Variants**: `primary` (indigo filled), `secondary` (slate surface + border), `ghost` (transparent + hover bg)
- **Sizes**: `sm`, `md`, `lg` — each with appropriate padding, border-radius, font-size
- **Icon-only mode**: Detected when `children` is falsy but `iconLeft` or `iconRight` is present; applies compact padding (`p-1.5`/`p-2`/`p-3` instead of horizontal padding)
- **Accessibility**: `min-h-[48px]` on all sizes, `active:scale-[0.98]` press feedback, `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`, `aria-label` pass-through via `...rest`

### Card.tsx
- **Export**: `export function Card` (named export)
- **Props interface**: `CardProps` with `variant`, `padding`, `children`, `className`
- **Variants**: `default` (slate-900/80 + slate-800/50 border), `accent` (indigo-500/10 + indigo-500/20 border), `error` (red-900/50 + red-500 border)
- **Padding**: `sm` (px-3 py-2), `md` (px-4 py-3), `lg` (p-5)
- **Radius**: `rounded-lg` on all variants
- **Merging**: `className` appended, allowing consumers to add `backdrop-blur-md` etc. via className

### StatusDot.tsx
- **Export**: `export function StatusDot` (named export)
- **Props interface**: `StatusDotProps` with `state`, `label` (optional), `className`
- **States**: `live` (green-500 + animate-pulse + green glow shadow), `idle` (slate-600 static), `error` (red-500 static)
- **Dot**: `w-2.5 h-2.5 rounded-full`
- **Label mode**: When `label` provided, renders flex row with dot + uppercase tracking-wider label
- **Accessibility**: Wrapper `<div>` gets `aria-label={state}`
- **Edge case**: `state` defaults to `idle` if an unknown value is passed (fallback in map lookup)

### Icon.tsx
- **Export**: `export function Icon` (named export)
- **Props interface**: `IconProps` with `name`, `size`, `className`
- **9 icons implemented**: Microphone, Play, Stop, Lock, Settings, Headphones, ChevronDown, Close, UnlockArrow
- **Sizes**: `sm` (16px / w-4 h-4), `md` (20px / w-5 h-5), `lg` (28px / w-7 h-7); defaults to `md`
- **Architecture**: Internal per-icon components (MicrophoneIcon, PlayIcon, etc.) registered in an `ICON_MAP` object; `Icon` looks up the component by name and renders it with the computed size class
- **SVG wrapper**: `xmlns`, `viewBox="0 0 24 24"`, `fill="none"`, `stroke="currentColor"`, `strokeWidth={2}`, `strokeLinecap="round"`, `strokeLinejoin="round"`, `aria-hidden="true"`
- **SVG paths**: Extracted exactly from source pages (`page.tsx` and `speaker/page.tsx`) per the task spec's documented source locations

## Decisions

1. **Icon architecture**: Used a component-per-icon approach inside a single file, registered in an `ICON_MAP` object. This keeps all icons in one file (no new files per icon) while keeping each icon's JSX clean and avoiding a monolithic switch statement.

2. **Microphone strokeWidth**: Per task spec guidance, used `strokeWidth={2}` (standard) instead of the viewer page's `strokeWidth={1.5}`. The `lg` size retains `strokeWidth={2}` for consistency.

3. **Tailwind classes directly**: Per Open Question #1 and task spec guidance, used Tailwind's built-in color scale classes (e.g., `bg-indigo-600`, `text-slate-400`) since Unit A design tokens are not yet available. A future tokenization pass can remap these.

4. **Card variant "accent" classes**: Chose `bg-indigo-500/10 border border-indigo-500/20` as it appears in both source pages (viewer greeting banner and matches the speaker translation panel's intent), providing consistent accent styling.

5. **No barrel file**: Per Non-Goals, an `index.ts` barrel re-export is deferred to Unit C.

## Verification

- **Build**: `pnpm --filter frontend build` — **PASS** (compiled successfully, zero TypeScript errors)
- **TypeScript**: No type errors related to these components
- **Pre-existing warnings**: 3 `themeColor` metadata warnings (unrelated to this unit, pre-existing in the codebase)

## Known Issues

- The 3 `themeColor` metadata warnings are pre-existing and not caused by this implementation.
