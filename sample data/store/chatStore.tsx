import React, { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { BotContext, ChatMessage, SessionState } from "@/types/chat";
import { ApiError, createSession, isTransient, sendMessage } from "@/api/client";
import { clearAll, loadContext, loadMessages, loadSessionId, saveContext, saveMessages, saveSessionId } from "@/utils/storage";

type Action =
  | { type: "INIT"; payload: Partial<SessionState> }
  | { type: "SET_SESSION"; sessionId: string }
  | { type: "ADD_MESSAGE"; message: ChatMessage }
  | { type: "UPDATE_MESSAGE"; id: string; data: Partial<ChatMessage> }
  | { type: "SET_CONTEXT"; context: BotContext }
  | { type: "SET_PENDING"; pending: boolean }
  | { type: "SET_LATENCY"; ms: number }
  | { type: "PUSH_ERROR"; error: string };

const initialContext: BotContext = {
  product: null,
  issue: null,
  urgency: null,
  ticketId: null,
  state: "greeting",
};

const initialState: SessionState = {
  sessionId: null,
  messages: [],
  context: initialContext,
  pending: false,
  lastLatencyMs: 0,
  errors: [],
};

function reducer(state: SessionState, action: Action): SessionState {
  switch (action.type) {
    case "INIT":
      return { ...state, ...action.payload };
    case "SET_SESSION":
      return { ...state, sessionId: action.sessionId };
    case "ADD_MESSAGE":
      return { ...state, messages: [...state.messages, action.message] };
    case "UPDATE_MESSAGE":
      return {
        ...state,
        messages: state.messages.map((m) => (m.id === action.id ? { ...m, ...action.data } : m)),
      };
    case "SET_CONTEXT":
      return { ...state, context: action.context };
    case "SET_PENDING":
      return { ...state, pending: action.pending };
    case "SET_LATENCY":
      return { ...state, lastLatencyMs: action.ms };
    case "PUSH_ERROR":
      return { ...state, errors: [...state.errors, action.error] };
    default:
      return state;
  }
}

type SendOptions = { autoRetry?: boolean };

interface ChatStoreApi {
  state: SessionState;
  ensureSession: () => Promise<void>;
  sendUserMessage: (text: string, opts?: SendOptions) => Promise<void>;
  retryLast: () => Promise<void>;
  cancelInFlight: () => void;
  reset: () => Promise<void>;
}

const ChatStoreContext = createContext<ChatStoreApi | undefined>(undefined);

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const abortRef = useRef<AbortController | null>(null);
  const lastUserTextRef = useRef<string | null>(null);

  useEffect(() => {
    (async () => {
      const [sessionId, messages, context] = await Promise.all([
        loadSessionId(),
        loadMessages(),
        loadContext(),
      ]);

      const payload: Partial<SessionState> = {
        sessionId: sessionId ?? null,
        messages: messages ?? [],
        context: context ?? initialContext,
      };

      // Bootstrap welcome message if empty
      if (!messages || messages.length === 0) {
        payload.messages = [
          {
            id: uid(),
            role: "assistant",
            text: "Hi! I’m your support assistant. What product can I help you with today?",
            ts: Date.now(),
          },
        ];
      }

      dispatch({ type: "INIT", payload });
    })();
  }, []);

  // Persist on changes
  useEffect(() => {
    if (state.sessionId) saveSessionId(state.sessionId);
    saveMessages(state.messages);
    saveContext(state.context);
  }, [state.sessionId, state.messages, state.context]);

  const ensureSession = useCallback(async () => {
    if (state.sessionId) return;
    const { sessionId } = await createSession();
    dispatch({ type: "SET_SESSION", sessionId });
    await saveSessionId(sessionId);
  }, [state.sessionId]);

  const cancelInFlight = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
      dispatch({ type: "SET_PENDING", pending: false });
    }
  }, []);

  const doSend = useCallback(
    async (text: string, autoRetry: boolean) => {
      await ensureSession();
      if (!state.sessionId) return;

      // cancel prior request if any
      cancelInFlight();

      lastUserTextRef.current = text;
      const userMsg: ChatMessage = { id: uid(), role: "user", text, ts: Date.now() };
      dispatch({ type: "ADD_MESSAGE", message: userMsg });

      const placeholderId = uid();
      dispatch({
        type: "ADD_MESSAGE",
        message: { id: placeholderId, role: "assistant", text: "Assistant is thinking…", ts: Date.now(), pending: true },
      });

      dispatch({ type: "SET_PENDING", pending: true });
      const abort = new AbortController();
      abortRef.current = abort;
      const started = Date.now();

      try {
        const res = await sendMessage(
          {
            sessionId: state.sessionId!,
            message: text.trim(),
            context: state.context,
          },
          { signal: abort.signal, timeoutMs: 15000 }
        );
        const latencyMs = Date.now() - started;
        dispatch({ type: "SET_LATENCY", ms: latencyMs });
        dispatch({ type: "UPDATE_MESSAGE", id: placeholderId, data: { text: res.reply, pending: false, error: null } });
        dispatch({ type: "SET_CONTEXT", context: res.context });
      } catch (e) {
        let errText = "Request failed";
        let status: number | undefined;
        let retryAfter: number | undefined;
        if (e instanceof ApiError) {
          errText = e.message;
          status = e.status;
          retryAfter = e.retryAfterMs;
        } else if (e instanceof Error) {
          errText = e.message;
        }

        // Special recovery: invalid session (404) -> recreate and retry once
        if (status === 404 && autoRetry) {
          try {
            const { sessionId } = await createSession();
            dispatch({ type: "SET_SESSION", sessionId });
            await saveSessionId(sessionId);
            await doSend(text, false);
            return;
          } catch {}
        }

        // Auto-retry on transient errors once
        if (autoRetry && status && isTransient(status)) {
          const wait = retryAfter ?? 800;
          await new Promise((r) => setTimeout(r, wait));
          await doSend(text, false);
          return;
        }

        dispatch({ type: "PUSH_ERROR", error: errText });
        dispatch({ type: "UPDATE_MESSAGE", id: placeholderId, data: { text: "Failed to get a reply.", pending: false, error: errText } });
      } finally {
        dispatch({ type: "SET_PENDING", pending: false });
        abortRef.current = null;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state.sessionId, state.context, ensureSession, cancelInFlight]
  );

  const sendUserMessage = useCallback(
    async (text: string, opts?: SendOptions) => {
      const trimmed = text.trim();
      if (!trimmed) return; // input normalizer: empty blocked
      // guardrail: limit length ~ 500 chars
      if (trimmed.length > 500) {
        dispatch({ type: "PUSH_ERROR", error: "Message too long (max 500)" });
        const userMsg: ChatMessage = { id: uid(), role: "user", text: trimmed.slice(0, 500), ts: Date.now() };
        dispatch({ type: "ADD_MESSAGE", message: userMsg });
        const errId = uid();
        dispatch({
          type: "ADD_MESSAGE",
          message: { id: errId, role: "assistant", text: "Message too long. Please shorten it.", ts: Date.now(), pending: false, error: "413" },
        });
        return;
      }
      await doSend(trimmed, opts?.autoRetry ?? true);
    },
    [doSend]
  );

  const retryLast = useCallback(async () => {
    if (!lastUserTextRef.current) return;
    await doSend(lastUserTextRef.current, false);
  }, [doSend]);

  const reset = useCallback(async () => {
    cancelInFlight();
    await clearAll();
    dispatch({ type: "INIT", payload: initialState });
    dispatch({
      type: "ADD_MESSAGE",
      message: {
        id: uid(),
        role: "assistant",
        text: "Hi! I’m your support assistant. What product can I help you with today?",
        ts: Date.now(),
      },
    });
  }, [cancelInFlight]);

  const value = useMemo<ChatStoreApi>(
    () => ({ state, ensureSession, sendUserMessage, retryLast, cancelInFlight, reset }),
    [state, ensureSession, sendUserMessage, retryLast, cancelInFlight, reset]
  );

  return <ChatStoreContext.Provider value={value}>{children}</ChatStoreContext.Provider>;
};

export function useChatStore() {
  const ctx = useContext(ChatStoreContext);
  if (!ctx) throw new Error("useChatStore must be used within ChatProvider");
  return ctx;
}



