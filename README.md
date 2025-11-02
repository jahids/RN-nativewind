# Support Chat – React Native (Expo) Frontend

A premium, Discord-style mobile chat app built with React Native + TypeScript + Expo + NativeWind. It integrates with a secure backend to create support tickets via natural conversation with a live LLM.

Backend base URL: `https://chatbot-backend-54sk.onrender.com/`

## Features
- Modern chat UI with bubbles, timestamps, and auto-scroll
- Message input with disabled state when empty and length limits
- Pending state with "Assistant is thinking…" typing indicator
- Retry action on failed bot responses
- Cancellation of in-flight requests on resend or via Cancel button
- Persistence of `sessionId`, `messages`, and `context` via AsyncStorage
- Latency per-turn measured and shown in UI
- Clean separation of state, UI, and networking inside `App.tsx`

## Requirements Reference
- Design and behavior follow `chatbot-assistant-challenge-rn_v2.md`
- API contract follows `support-chat.postman_collection.json`

## Architecture
- Single-screen chat implemented in `App.tsx`
  - State shape aligns with the spec (messages, context, sessionId, pending, lastLatencyMs)
  - Networking via `fetch` with request timeout + AbortController
  - Persistence using `@react-native-async-storage/async-storage`
  - NativeWind (Tailwind) for styling (`global.css` is already wired)

High-level flow:
1. On first launch, POST `/api/chat/session` to obtain `sessionId` and show a welcome message.
2. When the user sends a message, POST `/api/chat/message` with `{ sessionId, message, context }`.
3. The response includes assistant `reply`, updated `context`, and optional `latencyMs`.
4. UI updates the bubbles, context, and shows per-turn latency.
5. Errors add a retry affordance; users can also cancel in-flight requests.

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. iOS (Mac):
   ```bash
   npm run ios
   ```
3. Android:
   ```bash
   npm run android
   ```
4. Web (optional):
   ```bash
   npm run web
   ```

No provider keys are embedded in the client. The backend holds provider keys securely.

## Environment
- Backend base URL is hardcoded in `App.tsx` to keep setup minimal for this challenge. If you need to customize it, search for `BASE_URL` in `App.tsx`.

## UI Notes
- Clean, premium aesthetic with rounded bubbles and subtle borders
- Assistant bubbles: light theme surface with border; user bubbles: primary blue
- Timestamps and per-turn latency shown in small text
- Success banner when `context.state === "complete"` with ticket ID

## Performance
- Target round-trip latency < 1.5s on warm path (backend-dependent)
- Immediate UI feedback: optimistic user bubble + typing indicator
- Abort previous request when a new message is sent; manual Cancel available

## Failure Modes
- Empty input: send disabled
- Too long: local validation prompts to shorten the message
- Network/server errors: assistant bubble renders an error text with a Retry action
- Client timeout via AbortController; user can cancel manually

## Project Scripts
- `npm run start` – start the Expo dev server
- `npm run ios` – run on iOS simulator
- `npm run android` – run on Android emulator
- `npm run web` – run on web
- `npm run lint` – run ESLint + Prettier check
- `npm run format` – fix ESLint issues and format via Prettier

## Files of Interest
- `App.tsx` – full chat UI, state, persistence, and networking
- `chatbot-assistant-challenge-rn_v2.md` – challenge requirements
- `support-chat.postman_collection.json` – API contract

## Trade-offs
- Implemented as a single screen for speed and clarity; component extraction is straightforward for growth
- Streaming not required; UI shows pending state while waiting
- Dark mode base styles included; the app’s `userInterfaceStyle` is set to light for the challenge but dark-friendly colors are present

## Next Improvements
- Extract reusable components (Bubble, Header, InputBar)
- Add unit tests for reducers and validators
- Add E2E (Detox) for happy path

