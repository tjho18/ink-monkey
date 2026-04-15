import {
  ANTHROPIC_API_URL,
  ANTHROPIC_MODEL,
  getAnthropicHeaders,
} from '../config/anthropic';
import { SYSTEM_PROMPT } from '../config/systemPrompt';
import { Message } from '../types/Chat';

// Max messages to send as context to Claude (keeps cost + latency reasonable)
const MAX_CONTEXT_MESSAGES = 40;

interface AnthropicMessage {
  role: 'user' | 'assistant';
  content: string;
}

function toAnthropicMessages(messages: Message[]): AnthropicMessage[] {
  const recent = messages.slice(-MAX_CONTEXT_MESSAGES);
  // Anthropic requires the array to start with a 'user' message.
  // Drop any leading assistant messages (e.g. the opening greeting).
  const firstUserIdx = recent.findIndex((m) => m.role === 'user');
  if (firstUserIdx === -1) return [];
  return recent.slice(firstUserIdx).map((m) => ({ role: m.role, content: m.content }));
}

/**
 * Streams a Claude response. Yields string chunks as they arrive.
 * Uses the Anthropic Messages API via raw fetch + SSE parsing —
 * the official SDK is Node.js-only and cannot run in React Native.
 */
export async function* streamClaudeResponse(
  messages: Message[]
): AsyncGenerator<string> {
  const body = JSON.stringify({
    model: ANTHROPIC_MODEL,
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: toAnthropicMessages(messages),
    stream: true,
  });

  const response = await fetch(ANTHROPIC_API_URL, {
    method: 'POST',
    headers: getAnthropicHeaders(),
    body,
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error ${response.status}: ${err}`);
  }

  if (!response.body) {
    throw new Error('No response body from Anthropic API');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    // SSE lines are separated by \n\n
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;

      const data = trimmed.slice(5).trim();
      if (data === '[DONE]') return;

      try {
        const parsed = JSON.parse(data);
        if (
          parsed.type === 'content_block_delta' &&
          parsed.delta?.type === 'text_delta' &&
          parsed.delta?.text
        ) {
          yield parsed.delta.text as string;
        }
      } catch {
        // Malformed SSE line — skip
      }
    }
  }
}
