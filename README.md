# 🎙️ Zero-Cost Real-Time Sermon Translation Pipeline (Indonesian → English)

An ephemeral, zero-database-storage real-time translation system designed for dark-environment church settings. The system captures spoken Indonesian sermons, transcribes them in real-time, translates them using the **DeepSeek V4-Flash API**, and broadcasts the translation to congregation devices via **Supabase Realtime** WebSockets.

---

## 🚀 Key Features

*   **Zero-Storage Infrastructure**: Pushes translated segments ephemerally over WebSockets, incurring $0/month in database storage.
*   **Real-Time Speech-to-Text (ASR)**: Uses **Deepgram** (WebSocket streaming) for low-latency ASR, with browser-native **Web Speech API** as a backup.
*   **Contextual Translation Brain**: A serverless **Supabase Edge Function** wrapping the DeepSeek model using a sliding 3-segment context window to maintain flow, pronouns, and correct church-specific vocabulary via a targeted theological glossary.
*   **Congregation Teleprompter View**: A premium dark-themed viewport designed to prevent screen glare. Displays the current translation in large fonts, along with the previous 2 segments faded up for quick reading context. Includes client-side Text-to-Speech (TTS) voice synthesis.
*   **Security & Gatekeeping**: Secure SHA-256 PIN authentication prevents unauthorized translations or channel broadcasts. Integrates in-memory rate limiting and automated temporary IP blocking for wrong PIN attempts.
*   **Developer Debug Console**: A live dashboard to monitor raw Indonesian speech inputs alongside Translated English streams.

---

## 📁 Project Structure

The project is structured as a type-safe monorepo workspace using `pnpm`:

```
translation-service/
├── docs/                      # Architectural specifications and design guidelines
│   ├── design-guidelines.md   # Unified dark theme color palette and layout tokens
│   ├── frontend-spec.md       # SPA routing, ASR provider hooks, and TTS details
│   ├── realtime-broadcast.md  # Security gates, PIN hashes, and WebSocket schemas
│   ├── system-architecture.md # Network topology, sequence flow, and latency targets
│   └── translation-brain.md   # DeepSeek prompt details and sliding context format
├── packages/
│   ├── frontend/              # Next.js 15 app (Vercel)
│   └── shared/                # Shared TypeScript models and constants
└── supabase/                  # Supabase database/emulator setup
    └── functions/             # Deno Edge Functions
        ├── translate/         # DeepSeek translator & Realtime broadcaster
        └── get-deepgram-token/# Speaker authentication & token issuer
```

---

## 🛠️ Local Development Setup

Follow these steps to run the complete environment (including local Supabase Edge Functions and the Next.js frontend) on your local machine.

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+)
*   [pnpm](https://pnpm.io/)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/) (required to run the local Supabase emulator)
*   [Supabase CLI](https://supabase.com/docs/guides/cli)

### Step 1: Install Workspace Dependencies
Clone the repository and run:
```bash
pnpm install
```

### Step 2: Configure Environment Variables

1.  **Frontend Env Setup**: Create a `packages/frontend/.env.local` file:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
    ```

2.  **Supabase Secrets Setup**: Create a `supabase/.env.local` file:
    ```env
    DEEPSEEK_API_KEY=your_deepseek_api_key
    DEEPSEEK_API_URL=https://api.deepseek.com/v1
    ADMIN_PIN_HASH=0f7d0f6b15be5f7a0df98ca3de2c30d5fef1ebd8c06bcdfef6dd629591461789
    PIN_SALT=optional_pin_salt
    ```
    *(Note: `ADMIN_PIN_HASH` must match the SHA-256 hash of the password PIN used by the speaker console to unlock the microphone. The hash above corresponds to the PIN `1234` when hashed with no salt).*

### Step 3: Run the Development Servers
Start the local Supabase emulator and the Next.js frontend concurrently:
```bash
pnpm dev
```

### Step 4: Access the Dashboards
Open your browser and navigate to:
*   **Congregation Viewer Page**: [http://localhost:3000/](http://localhost:3000/)
*   **Speaker console (Requires PIN)**: [http://localhost:3000/speaker](http://localhost:3000/speaker)
*   **Developer Debug Feed (Requires PIN)**: [http://localhost:3000/admin](http://localhost:3000/admin)

---

## 🧪 Testing

To run the unit tests in the workspace:
```bash
pnpm test
```

---

## 🚀 Production Deployment

### 1. Deploy Supabase Edge Functions
To deploy the edge functions to your cloud project:
```bash
# Set secrets on your production project
supabase secrets set DEEPSEEK_API_KEY=your_key ADMIN_PIN_HASH=your_hash PIN_SALT=your_salt --project-ref your_project_ref

# Deploy functions
supabase functions deploy translate --project-ref your_project_ref
supabase functions deploy get-deepgram-token --project-ref your_project_ref
```

### 2. Deploy Next.js Frontend (Vercel)
Import the monorepo into Vercel and configure the output directory to point to `packages/frontend`. Make sure to set the Environment Variables matching your cloud Supabase endpoint:
*   `NEXT_PUBLIC_SUPABASE_URL`
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
