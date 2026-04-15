import { useState } from 'react';
import { getSupabase, isSupabaseConfigured } from '../config/supabase';
import { saveUserId, loadUserId } from '../services/storage.service';

export function useAuth() {
  const [userId, setUserIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signUp(email: string, password: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      setError('Cloud sync is not configured yet.');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const db = getSupabase();
      if (!db) { setError('Not configured'); return false; }
      const { data, error: err } = await db.auth.signUp({ email, password });
      if (err) { setError(err.message); return false; }
      const id = data.user?.id ?? null;
      setUserIdState(id);
      await saveUserId(id);
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string): Promise<boolean> {
    if (!isSupabaseConfigured()) {
      setError('Cloud sync is not configured yet.');
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const db = getSupabase();
      if (!db) { setError('Not configured'); return false; }
      const { data, error: err } = await db.auth.signInWithPassword({ email, password });
      if (err) { setError(err.message); return false; }
      const id = data.user?.id ?? null;
      setUserIdState(id);
      await saveUserId(id);
      return true;
    } finally {
      setLoading(false);
    }
  }

  async function signOut(): Promise<void> {
    const db = getSupabase();
    if (db) await db.auth.signOut();
    setUserIdState(null);
    await saveUserId(null);
  }

  async function restoreSession(): Promise<string | null> {
    const storedId = await loadUserId();
    if (storedId) setUserIdState(storedId);
    return storedId;
  }

  return { userId, loading, error, signUp, signIn, signOut, restoreSession };
}
