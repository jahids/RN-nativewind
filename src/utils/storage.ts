import AsyncStorage from "@react-native-async-storage/async-storage";
import { BotContext, ChatMessage } from "../types/chat";

const KEY_SESSION_ID = "supportChat.sessionId";
const KEY_MESSAGES = "supportChat.messages";
const KEY_CONTEXT = "supportChat.context";

export async function saveSessionId(sessionId: string) {
  try {
    await AsyncStorage.setItem(KEY_SESSION_ID, sessionId);
  } catch {}
}

export async function loadSessionId(): Promise<string | null> {
  try {
    return (await AsyncStorage.getItem(KEY_SESSION_ID)) ?? null;
  } catch {
    return null;
  }
}

export async function saveMessages(messages: ChatMessage[]) {
  try {
    await AsyncStorage.setItem(KEY_MESSAGES, JSON.stringify(messages));
  } catch {}
}

export async function loadMessages(): Promise<ChatMessage[] | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_MESSAGES);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : null;
  } catch {
    return null;
  }
}

export async function saveContext(ctx: BotContext) {
  try {
    await AsyncStorage.setItem(KEY_CONTEXT, JSON.stringify(ctx));
  } catch {}
}

export async function loadContext(): Promise<BotContext | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_CONTEXT);
    return raw ? (JSON.parse(raw) as BotContext) : null;
  } catch {
    return null;
  }
}

export async function clearAll() {
  try {
    await AsyncStorage.multiRemove([KEY_SESSION_ID, KEY_MESSAGES, KEY_CONTEXT]);
  } catch {}
}


