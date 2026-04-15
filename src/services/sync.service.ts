import { getSupabase, isSupabaseConfigured } from '../config/supabase';
import { Message } from '../types/Chat';

let localConversationId: string | null = null;

async function getOrCreateConversation(userId: string): Promise<string> {
  if (localConversationId) return localConversationId;

  const db = getSupabase();
  if (!db) throw new Error('Supabase not configured');

  const { data: existing } = await db
    .from('conversations')
    .select('id')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(1)
    .single();

  if (existing?.id) {
    localConversationId = existing.id;
    return existing.id;
  }

  const { data: created, error } = await db
    .from('conversations')
    .insert({ user_id: userId })
    .select('id')
    .single();

  if (error || !created) throw new Error('Failed to create conversation');
  localConversationId = created.id;
  return created.id;
}

export async function uploadAllMessages(userId: string, messages: Message[]): Promise<void> {
  if (!isSupabaseConfigured() || messages.length === 0) return;
  try {
    const db = getSupabase();
    if (!db) return;
    const conversationId = await getOrCreateConversation(userId);
    const rows = messages.map((m) => ({
      id: m.id,
      conversation_id: conversationId,
      role: m.role,
      content: m.content,
      monkey_state: m.monkeyState,
      timestamp: m.timestamp,
    }));
    await db.from('messages').upsert(rows, { onConflict: 'id' });
  } catch {
    // Sync failure is non-fatal
  }
}

export async function syncLatestMessages(userId: string, messages: Message[]): Promise<void> {
  if (!isSupabaseConfigured() || messages.length === 0) return;
  try {
    const db = getSupabase();
    if (!db) return;
    const conversationId = await getOrCreateConversation(userId);
    const latest = messages.slice(-2);
    const rows = latest.map((m) => ({
      id: m.id,
      conversation_id: conversationId,
      role: m.role,
      content: m.content,
      monkey_state: m.monkeyState,
      timestamp: m.timestamp,
    }));
    await db.from('messages').upsert(rows, { onConflict: 'id' });
    await db
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId);
  } catch {
    // Sync failure is non-fatal
  }
}
