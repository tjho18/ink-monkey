import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Lazily created — only when URL is configured, to avoid "supabaseUrl is required" crash
let _supabase: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  if (!_supabase) {
    _supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return _supabase;
}

// Convenience alias used where the client may be null
export const supabase = {
  auth: {
    signUp: (opts: { email: string; password: string }) =>
      getSupabase()?.auth.signUp(opts) ?? Promise.resolve({ data: null, error: { message: 'Supabase not configured' } as any }),
    signInWithPassword: (opts: { email: string; password: string }) =>
      getSupabase()?.auth.signInWithPassword(opts) ?? Promise.resolve({ data: null, error: { message: 'Supabase not configured' } as any }),
    signOut: () =>
      getSupabase()?.auth.signOut() ?? Promise.resolve({ error: null }),
  },
  from: (table: string) => getSupabase()?.from(table) ?? null,
};

export function isSupabaseConfigured(): boolean {
  return supabaseUrl.length > 0 && supabaseAnonKey.length > 0;
}
