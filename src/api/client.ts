import { BotContext, CreateSessionResponse, ErrorResponseBody, MessageRequestBody, MessageSuccessResponse } from "../types/chat";

const BASE_URL = "https://chatbot-backend-54sk.onrender.com";

export class ApiError extends Error {
  status: number;
  retryAfterMs?: number;
  constructor(message: string, status: number, retryAfterMs?: number) {
    super(message);
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, controller: AbortController) {
  if (!timeoutMs) return promise;
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const result = await promise;
    clearTimeout(timeout);
    return result;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

async function request<T>(path: string, init: RequestInit, opts: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const signal = opts.signal ?? controller.signal;
  const timeoutMs = opts.timeoutMs ?? 20000;
  const req = fetch(`${BASE_URL}${path}`, { ...init, signal });
  const res = await withTimeout(req, timeoutMs, controller).catch((e) => {
    if ((e as any)?.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw e;
  });

  if (!res.ok) {
    let payload: ErrorResponseBody | undefined;
    try {
      payload = (await res.json()) as ErrorResponseBody;
    } catch {}
    const message = payload?.error || `HTTP ${res.status}`;
    const retryAfterMs = payload?.retryAfterMs;
    throw new ApiError(message, res.status, retryAfterMs);
  }
  return (await res.json()) as T;
}

export async function createSession(opts?: RequestOptions): Promise<CreateSessionResponse> {
  return request<CreateSessionResponse>(
    "/api/chat/session",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    },
    opts
  );
}

export interface SendMessageParams {
  sessionId: string;
  message: string;
  context?: BotContext;
}

export async function sendMessage(body: SendMessageParams, opts?: RequestOptions): Promise<MessageSuccessResponse> {
  const payload: MessageRequestBody = {
    sessionId: body.sessionId,
    message: body.message,
    context: body.context,
  };
  return request<MessageSuccessResponse>(
    "/api/chat/message",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    opts
  );
}

export function isTransient(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}


