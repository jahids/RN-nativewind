# Chatbot Assistant Integration Challenge

## 📋 Overview

### Goal  
Build a real-time **Discord-style mobile chat app** using **React Native + TypeScript + Expo** for mobile that demonstrates low-latency interactions with a **live LLM provider** (no mock). Users can chat to create a lightweight “support ticket” via natural conversation. The focus is on **snappy message round-trips, robust error handling, and clean architecture** on mobile.

### Key Components  
- **Mobile client (React Native)** with chat UI  
- Join public channels (group chat)  
- keyboard to send **text, emoji, and stickers**  
- **Backend HTTP API** that safely brokers LLM requests (no provider keys in the app)  
- **LLM integration** (OpenAI, Claude, Gemini, Groq, etc.) via the backend  
- **Persistence** of conversation context and local UI state  
- **Latency measurement** and basic logging
- See real-time typing indicators  

### Time Guidance  
**Target:** 2 hours  
**Note:** Real LLM integration is **required**. If you run short on time, you may scope UI polish and document trade-offs in the README.


---

## 🎯 Deliverables

1. **Code Repository**  
   - Mobile app (chat UI, persistence, error/empty states)  
   - Minimal backend (HTTP endpoints) that calls the LLM provider  
   - Integration layer (client ↔ backend)

2. **Documentation**  
   - `README.md` with setup/run commands (mobile + backend)  
   - Architecture & key decisions  
   - Latency and failure-mode strategies

3. **Performance Metrics**  
   - Simple logs or on-screen counters showing **user-send → bot-reply** latency

4. **Security**  
   - **No provider API keys** committed or shipped to the client  
   - Environment variables documented for backend

---

## 👤 User Story

As a user, I can:

1. **Start Chat**  
   Launch the app and see a welcome message:  
   *“Hi! I’m your support assistant. What product can I help you with today?”*

2. **Provide Info**  
   Chat naturally to provide:  
   - Product name  
   - Issue description  
   - Urgency level (low / medium / high)

3. **Clarifications**  
   If inputs are unclear, the assistant asks follow-ups (e.g., “Which product, exactly?”).

4. **Confirm Ticket**  
   Assistant summarizes:  
   *“I’m creating a ticket for [product] about [issue] with [urgency] priority. Submit now?”*

5. **Complete**  
   I confirm, see a short confirmation (e.g., `#T-1234`), and can continue chatting.

---

## 💬 Chat Interface Requirements

### Core Features  
- **Chat list** with left/right bubbles (bot vs user), timestamps, and auto-scroll to latest  
- **Message input** with send button; disable send when empty  
- **Bot thinking indicator** (e.g., “Assistant is thinking…”) during request  
- **Retry** action visible when a bot response fails

### Visual States  
- Idle (no messages yet / welcome)  
- Sending (user message posting)  
- Waiting (bot in progress)  
- Error (failed request with retry)  
- Completed (ticket confirmed)

### Accessibility  
- Clear labels for input and send button  
- Large tap targets for actions (retry, confirm)  
- Respect dark mode if your framework supports it easily

---

## ⚡ Real-Time Performance Requirements

| Metric | Target |
|---|---|
| **Message round-trip latency** (user send → first bot token or full reply) | Aim < **1.5s** on a warm path |
| **UI feedback** | Immediate (optimistic user bubble, progress/typing indicator) |
| **Interruption handling** | Cancel in-flight request when user edits/resends |
| **Recovery** | Automatic retry on transient network errors (plus manual retry) |

> Streaming is **not required** (full response is acceptable), but you should still provide immediate UI feedback (pending bubble + spinner).

---

## 🔧 Backend Requirements (can use any framework)

---

## 🧠 Conversation Bot Logic (Server-side)

When a user messages inside `#support-bot`:

1. Bot collects:
   - product name
   - issue description
   - urgency (low/medium/high)
2. Bot confirms
3. On "yes", backend generates ticket: `T-####`
4. Bot replies with ticket ID and success message

---

### API Endpoints

#### `POST /api/chat/session`  
Initialize a chat session.

**Response:**
```json
{ "sessionId": "uuid" }
```

#### `POST /api/chat/message`  
Accept a user message and return the assistant’s reply (single full response).

**Request:**
```json
{
  "sessionId": "uuid",
  "message": "string",
  "context": { "product": null, "issue": null, "urgency": null, "ticketId": null }
}
```

**Response (success):**
```json
{
  "reply": "assistant text",
  "context": { "product": "Mobile App", "issue": "Crashes on upload", "urgency": "high", "ticketId": null },
  "latencyMs": 742
}
```

**Response (confirm step):**
```json
{
  "reply": "Creating ticket for Mobile App: crashes on upload (high). Submit now?",
  "context": { "product": "Mobile App", "issue": "Crashes on upload", "urgency": "high", "ticketId": null, "state": "confirming" }
}
```

**Response (completed):**
```json
{
  "reply": "Ticket #T-3847 submitted. We’ll follow up shortly.",
  "context": { "product": "Mobile App", "issue": "Crashes on upload", "urgency": "high", "ticketId": "T-3847", "state": "complete" }
}
```

**Error:**
```json
{
  "error": "Upstream LLM timeout",
  "retryAfterMs": 800
}
```


### Notes  
- The backend must **call a real LLM** (provider of your choice).  
- Add **basic guardrails**: max prompt length, request timeouts, minimal prompt template.  
- **Do not** expose provider keys to the client—store them server-side via env vars.

---

## 🏗️ Integration Architecture

### Conversation Pipeline Components  
1. **Input Normalizer** — trims and validates text, handles empty/too-long input  
2. **Context Manager** — tracks `product`, `issue`, `urgency`, and `state` (`greeting → collecting_* → confirming → complete`)  
3. **LLM Orchestrator** — builds prompt, calls provider with timeout, parses reply for slot filling or confirmation  
4. **Response Formatter** — returns assistant text and updated `context`  
5. **Ticket Generator** — on confirmation, issues a simple ticket ID (`T-####`) server-side

### Supported Integration Options (choose one)  
| Option | Components | Benefits |
|---|---|---|
| **A** | OpenAI Responses API (chat) | Simple, fast to wire |
| **B** | Anthropic Messages API | Strong guardrails; clear system prompts |
| **C** | Google Gemini API | Cost-effective, broad availability |

---

## 📊 State Management

### Session State Structure (client-side example)
```javascript
{
  sessionId: "uuid",
  messages: [
    { id: "...", role: "assistant", text: "Welcome...", ts: 123 },
    { id: "...", role: "user", text: "Hi", ts: 124 }
  ],
  context: {
    product: null,
    issue: null,
    urgency: null,
    ticketId: null,
    state: "greeting" // collecting_product | collecting_issue | collecting_urgency | confirming | complete
  },
  pending: false,
  lastLatencyMs: 0,
  errors: []
}
```

**Persistence:**  
- Store `sessionId`, `messages`, and `context` locally (AsyncStorage / SharedPreferences / UserDefaults).  
- On relaunch, restore the conversation.

---

## 🚀 Non-Functional Requirements

### Performance  
- Measure and log message round-trip latency per turn  
- UI should stay responsive while the request is running  
- Cancel in-flight request when user sends a new message

### Flexibility  
- Abstract LLM provider behind a simple interface on the server  
- Light, well-named modules on client (store/hooks/services/components)

### Security  
- **No provider keys** in the client app  
- Basic input validation and size limits  
- Avoid sending PII; redact if logged  
- CORS and minimal auth (e.g., per-session JWT optional if you have time)

---

## 🧪 Testing Requirements

### Test Coverage (lightweight)  
| Test Type | Focus Areas |
|---|---|
| **Unit** | Date/latency calc; context reducer/state machine; message validator |
| **Integration** | Client→backend call success & error; timeout path with retry |
| **E2E (optional)** | Happy path: greet → collect → confirm → complete |

---

## ✅ Acceptance Criteria

1. **Live LLM**: Backend calls a real provider; client never holds provider key  
2. **Chat UX**: Bubbles, timestamps, auto-scroll, pending indicator  
3. **End-to-End Flow**: Greet → collect fields → confirm → submit ticket → continue chat  
4. **Persistence**: Conversation restored after app restart  
5. **Latency**: Per-turn latency tracked and visible (UI or console)  
6. **Errors**: Clear error state and manual **Retry** action; auto-retry on transient failure  
7. **Cancellations**: In-flight request can be canceled when user edits/resends  
8. **Docs**: README covers setup, decisions, trade-offs, and performance notes

---

## 📝 README Documentation Requirements

Include:  
- **Architecture diagram** (client ↔ backend ↔ LLM)  
- **Provider selection & prompt template** (brief)  
- **Setup:** env vars, install & run steps for both app and backend  
- **Latency observations:** rough numbers and optimizations attempted  
- **Failure modes:** how you handle timeouts, network errors, user cancellation  
- **Trade-offs:** what you cut to meet 2h; what you’d improve next

---

## 💡 Example Interaction

```
Assistant: Hi! I’m your support assistant. What product can I help you with today?
User: The mobile app
Assistant: Got it — which issue are you running into?
User: It crashes when I upload photos
Assistant: Understood: crash during photo uploads. How urgent is this — low, medium, or high?
User: High
Assistant: I’m creating a ticket for Mobile App: crash during photo uploads (high). Submit now?
User: Yes
Assistant: Ticket #T-3847 submitted. We’ll follow up shortly.
```

---

## 🌟 Bonus Features

- **LLM tools/functions** to extract `product/issue/urgency` reliably  
- **Rate limiting** and exponential backoff in the backend  
- **Prompt caching** of common system/intro messages  
- **Multi-persona** (switch tone or instructions)  
- **Localization** (EN + one more language)  
- **Offline mode** with queue-then-send

---

## 🎯 Evaluation Focus Areas

1. **LLM Integration Quality** — clean prompt, safe call, proper parsing  
2. **Architecture** — separation of concerns (client store, services, UI; backend layers)  
3. **Resilience** — timeouts, retries, cancellations, and recoveries  
4. **State Management** — straightforward, testable, predictable  
5. **Latency & UX** — responsive UI and visible progress  
6. **Code Organization** — clarity, naming, minimalism suitable for 2h scope

---

### Submission Checklist
- [ ] Runs locally with **one command per side** (mobile + backend)  
- [ ] README with architecture, setup, and trade-offs  
- [ ] No provider keys in client code or repo history  
- [ ] Demonstrates end-to-end chat with a real LLM
