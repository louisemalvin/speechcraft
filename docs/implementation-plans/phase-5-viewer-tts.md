# Implementation Plan - Phase 5: Congregation Live View & Browser TTS

## Objective
Develop the public congregation live stream viewer at the root path `/` of the application. It will establish a read-only WebSocket connection to the static `sermon-live` Supabase Realtime channel, render the scrolling translation text feed, and support built-in browser-native English Text-to-Speech (TTS) for audio listening.

## Tech Stack
*   **Framework**: Next.js, React, Tailwind CSS
*   **WebSockets**: Supabase client JS SDK (`supabase.channel().on('broadcast', ...)`)
*   **TTS API**: HTML5 SpeechSynthesis API (`window.speechSynthesis`)

## Detailed Step-by-Step Instructions

### Step 1: Implement WebSocket Broadcast Subscription
1. Inside `packages/frontend/src/services/realtime/liveSync.ts`, write the subscription helper:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   );

   export function subscribeToLiveSermon(onSegmentReceived: (segment: any) => void) {
     const channel = supabase.channel('sermon-live');

     channel
       .on('broadcast', { event: 'translation_segment' }, ({ payload }) => {
         // Payload schema: { sequence_number, raw_text, translated_text, timestamp }
         onSegmentReceived(payload);
       })
       .subscribe();

     return () => {
       channel.unsubscribe();
     };
   }
   ```

### Step 2: Implement Client-Side Text-to-Speech Manager
1. Write a service utility `packages/frontend/src/services/speech/TextToSpeechService.ts`:
   ```typescript
   export class TextToSpeechService {
     private synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
     private enabled = false;

     public setEnabled(status: boolean) {
       this.enabled = status;
       if (!status) {
         this.synth?.cancel(); // Cancel any ongoing speaking
       }
     }

     public speak(text: string) {
       if (!this.synth || !this.enabled) return;

       // Cancel previous utterances to avoid backing up speech queue
       this.synth.cancel();

       const utterance = new SpeechSynthesisUtterance(text);
       
       // Search and prioritize high-quality neural english voices
       const voices = this.synth.getVoices();
       const englishVoice = voices.find(voice => 
         voice.lang.startsWith('en') && 
         (voice.name.includes('Natural') || voice.name.includes('Google') || voice.name.includes('Siri'))
       ) || voices.find(voice => voice.lang.startsWith('en'));

       if (englishVoice) {
         utterance.voice = englishVoice;
       }
       
       utterance.rate = 1.0; // Standard speed
       this.synth.speak(utterance);
     }
   }
   ```

### Step 3: Build Congregation Live Feed View (`/`)
1. Implement the layout in `/app/page.tsx`. Use a premium, responsive dark theme design system.
2. Maintain a chronological list of received segment blocks inside React state:
   ```typescript
   interface Segment {
     sequence_number: number;
     raw_text: string;
     translated_text: string;
     timestamp: number;
   }
   const [segments, setSegments] = useState<Segment[]>([]);
   ```
3. **Scroll View Box**:
   * Map and render segments in order.
   * Auto-scroll behavior: Upon receiving a new segment, automatically scroll the container to the bottom.
   * Scroll Lock Override: If the attendee manually scrolls up (e.g. `scrollTop < scrollHeight`), pause auto-scrolling and display a floating "Scroll to bottom" button. Clicking the button restores the auto-scroll position.
4. **Header Control Bar**:
   * Live Status Dot: Glows green when the channel connection is open, red on disconnect.
   * **"Listen Live" Toggle**: Button (styled as a 🎧 headphone icon). Toggles `TextToSpeechService.setEnabled()`.

## Verification Criteria
1. Run the local Next.js development server. Open `http://localhost:3000` in multiple browser tabs (simulating viewers).
2. Connect to the local Supabase WebSocket gateway.
3. Trigger a mock broadcast event from your console (e.g. using Supabase Dashboard or simulated speaker API).
4. Verify that **all** open viewer tabs instantly receive and render the new segment in real-time.
5. Enable the "Listen Live" headphones toggle in one tab, broadcast a text segment, and confirm that the browser reads the translation aloud.
6. Verify that disabling the headphones toggle instantly stops any speech output.
