# 💻 Sermon Translation System: Frontend SPA

This is the Next.js 15 Single Page Application (SPA) that drives the client side of the Sermon Translation Pipeline. It contains the views for the congregation (viewers), the speaker (pastor's recording PWA), and the developer debugging dashboard.

---

## 🗺️ Routes & Pages

1.  **Viewer Interface (`/`)**
    *   Publicly accessible page for congregation members.
    *   Listen Live option triggers browser-native **Text-to-Speech (TTS)** voice synthesis for the translated English segments.
    *   Teleprompter style layout: Displays the latest translation segment at maximum size, alongside the preceding 2 segments at partial opacity to provide instant short-term reading context.
    *   Floating controls to increase/decrease display font sizes.
2.  **Speaker Console (`/speaker`)**
    *   Gated by a PIN entry screen.
    *   Large interactive broadcast action. Upon starting, requests the **Screen Wake Lock API** to keep mobile OS devices from turning off the screen or suspending microphone captures.
    *   Connects to local/remote Supabase Edge Function to fetch token authentication for Deepgram streaming.
    *   Volume VU Meter (visual canvas/progress feedback) tracking live audio levels.
3.  **Developer Debugger Console (`/admin`)**
    *   Gated by a PIN entry screen.
    *   Displays a tabular live log feed of every sequence segment processed by the pipeline, displaying the **Raw Indonesian ASR** alongside the final **Translated English** output.
    *   Visual counters and connection status badges for diagnostic testing.

---

## 📦 Installed Packages & Components

*   **Shared Models (`shared`)**: Injected via pnpm workspaces to provide typescript interfaces and the static context window size.
*   **Design System (`src/components/`)**:
    *   `Button.tsx`: Customizable interactive button wrapper.
    *   `Card.tsx`: Flex containers with standard border-slate ratios.
    *   `Icon.tsx`: Decoupled SVG icons (Play, Stop, Headphones, Settings, Lock, etc.).
    *   `StatusDot.tsx`: Dynamic connection indicator showing live/stopped configurations.
*   **Speech Services (`src/services/speech/`)**:
    *   `AudioOrchestrator.ts`: Audio manager that handles UserMedia capture streams, volume visualizer calculations, and Speech Provider initialization.
    *   `DeepgramSpeechProvider.ts`: Sets up WebSockets connection to stream binary voice data blocks to Deepgram.
    *   `WebSpeechProvider.ts`: Backup provider utilizing browser-native Web Speech Recognition API.
    *   `TextToSpeechService.ts`: Decoupled voice synthesis service mapping `window.speechSynthesis` settings.

---

## 🛠️ Local Development & Scripts

Inside the `packages/frontend/` directory, you can run these standalone commands:

```bash
# Start Next.js development server
pnpm dev

# Build the Next.js production output
pnpm build

# Run lint checks
pnpm lint
```

Make sure you configure `packages/frontend/.env.local` to point to your Supabase installation:
```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```
