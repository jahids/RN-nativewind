export type Role = "user" | "assistant";

export type Urgency = "low" | "medium" | "high" | null;

export type BotState =
  | "greeting"
  | "collecting_product"
  | "collecting_issue"
  | "collecting_urgency"
  | "confirming"
  | "complete";

export interface BotContext {
  product: string | null;
  issue: string | null;
  urgency: Urgency;
  ticketId: string | null;
  state?: BotState;
}

export interface ChatMessageMeta {
  latencyMs?: number;
  ticketId?: string | null;
  state?: BotState;
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  ts: number;
  pending?: boolean;
  error?: string | null;
  meta?: ChatMessageMeta;
}

export interface SessionState {
  sessionId: string | null;
  messages: ChatMessage[];
  context: BotContext;
  pending: boolean;
  lastLatencyMs: number;
  errors: string[];
}

// API request/response contracts (client <-> backend)
export interface CreateSessionResponse {
  sessionId: string;
}

export interface MessageRequestBody {
  sessionId: string;
  message: string;
  context?: BotContext;
}

export interface MessageSuccessResponse {
  reply: string;
  context: BotContext;
  latencyMs?: number;
}

export interface ErrorResponseBody {
  error: string;
  retryAfterMs?: number;
}


