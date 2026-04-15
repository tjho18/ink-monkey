import { Platform } from 'react-native';

// NOTE: EXPO_PUBLIC_ vars are embedded in the JS bundle at build time.
// For a personal/private app this is acceptable.
// Before any App Store release, replace with a Supabase Edge Function proxy.
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';

// On web, the Anthropic API blocks direct browser requests (CORS).
// We route through a local proxy (scripts/proxy.js on port 8083) for web dev.
// On native (iOS/Android), call the API directly — no CORS restrictions.
export const ANTHROPIC_API_URL =
  Platform.OS === 'web'
    ? 'http://localhost:8083/v1/messages'
    : 'https://api.anthropic.com/v1/messages';

export const ANTHROPIC_MODEL = 'claude-sonnet-4-6';
export const ANTHROPIC_VERSION = '2023-06-01';

export function getAnthropicHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-key': API_KEY,
    'anthropic-version': ANTHROPIC_VERSION,
  };
}

export function hasApiKey(): boolean {
  return API_KEY.length > 0;
}
