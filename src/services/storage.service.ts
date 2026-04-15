import AsyncStorage from '@react-native-async-storage/async-storage';
import { Message } from '../types/Chat';

const KEYS = {
  MESSAGES: 'ink_monkey:messages',
  HISTORY:  'ink_monkey:history',   // all-time conversation history (context for Claude)
  USER_ID: 'ink_monkey:user_id',
  MUTED: 'ink_monkey:muted',
  LAST_SYNC: 'ink_monkey:last_sync',
};

const MAX_STORED_MESSAGES = 200;
const MAX_HISTORY_MESSAGES = 400;

export async function loadMessages(): Promise<Message[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.MESSAGES);
    if (!json) return [];
    return JSON.parse(json) as Message[];
  } catch {
    return [];
  }
}

export async function saveMessages(messages: Message[]): Promise<void> {
  try {
    const trimmed = messages.slice(-MAX_STORED_MESSAGES);
    await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(trimmed));
  } catch {
    // Storage failure is non-fatal
  }
}

export async function loadUserId(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(KEYS.USER_ID);
  } catch {
    return null;
  }
}

export async function saveUserId(userId: string | null): Promise<void> {
  try {
    if (userId) {
      await AsyncStorage.setItem(KEYS.USER_ID, userId);
    } else {
      await AsyncStorage.removeItem(KEYS.USER_ID);
    }
  } catch {}
}

export async function loadMuted(): Promise<boolean> {
  try {
    const val = await AsyncStorage.getItem(KEYS.MUTED);
    return val === 'true';
  } catch {
    return false;
  }
}

export async function saveMuted(muted: boolean): Promise<void> {
  try {
    await AsyncStorage.setItem(KEYS.MUTED, muted ? 'true' : 'false');
  } catch {}
}

export async function clearHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEYS.MESSAGES);
  } catch {}
}

// ─── Long-term conversation history (context passed to Claude, not shown in UI) ───

export async function loadHistory(): Promise<Message[]> {
  try {
    const json = await AsyncStorage.getItem(KEYS.HISTORY);
    if (!json) return [];
    return JSON.parse(json) as Message[];
  } catch {
    return [];
  }
}

export async function appendToHistory(newMessages: Message[]): Promise<void> {
  try {
    const existing = await loadHistory();
    // Merge, avoiding duplicates by id
    const existingIds = new Set(existing.map((m) => m.id));
    const toAdd = newMessages.filter((m) => !existingIds.has(m.id));
    const merged = [...existing, ...toAdd].slice(-MAX_HISTORY_MESSAGES);
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(merged));
  } catch {}
}
