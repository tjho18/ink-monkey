import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message, MonkeyState } from '../types/Chat';
import { streamClaudeResponse } from '../services/claude.service';
import { detectMonkeyState } from '../constants/EmotionKeywords';
import { saveMessages, loadHistory, appendToHistory } from '../services/storage.service';
import { syncLatestMessages } from '../services/sync.service';
import { hasApiKey } from '../config/anthropic';

// Greeting the monkey sends at the start of every session
const OPENING_MESSAGE: Message = {
  id: 'opening',
  role: 'assistant',
  content:
    'You have arrived at the right time. The snow started again about an hour ago — you can hear it if you listen past the sound of the water. Sit. The tea is still warm.',
  timestamp: Date.now(),
  monkeyState: 'serene',
};

export function useChat() {
  // What renders in the chat — current session only, always starts fresh
  const [messages, setMessages] = useState<Message[]>([OPENING_MESSAGE]);
  const [isThinking, setIsThinking] = useState(false);
  const [monkeyState, setMonkeyState] = useState<MonkeyState>('serene');
  const [streamingContent, setStreamingContent] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  // Full conversation history loaded from storage — sent to Claude for memory,
  // never shown in the UI.
  const historyRef = useRef<Message[]>([]);

  const streamBufferRef = useRef('');
  const displayRef = useRef('');

  // On mount: load persistent history for Claude's context (not displayed)
  useEffect(() => {
    loadHistory().then((h) => {
      historyRef.current = h;
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (isThinking || !text.trim()) return;

      const userMessage: Message = {
        id: uuidv4(),
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
        monkeyState: 'idle',
      };

      const updatedSession = [...messages, userMessage];
      setMessages(updatedSession);
      setIsThinking(true);
      setMonkeyState('thinking');
      setStreamingContent('');
      streamBufferRef.current = '';
      displayRef.current = '';

      if (!hasApiKey()) {
        const mockResponse: Message = {
          id: uuidv4(),
          role: 'assistant',
          content:
            'I hear you. I am scratching my chin, which is something I do when a question has more depth than it first appeared. Tell me more — what does that feel like, exactly?',
          timestamp: Date.now(),
          monkeyState: 'contemplative',
        };
        await new Promise((r) => setTimeout(r, 1200));
        const final = [...updatedSession, mockResponse];
        setMessages(final);
        setMonkeyState('contemplative');
        setIsThinking(false);
        setStreamingContent('');
        return;
      }

      try {
        let fullResponse = '';

        const interval = setInterval(() => {
          const buf = streamBufferRef.current;
          if (buf.length > displayRef.current.length) {
            displayRef.current = buf;
            setStreamingContent(buf);
          }
        }, 25);

        setMonkeyState('responding');

        // Claude sees: full history (all past sessions) + current session messages
        const contextMessages = [
          ...historyRef.current,
          ...updatedSession,
        ];

        for await (const chunk of streamClaudeResponse(contextMessages)) {
          fullResponse += chunk;
          streamBufferRef.current = fullResponse;
        }

        clearInterval(interval);
        setStreamingContent(fullResponse);

        const detectedState = detectMonkeyState(fullResponse);

        const assistantMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content: fullResponse,
          timestamp: Date.now(),
          monkeyState: detectedState,
        };

        const finalSession = [...updatedSession, assistantMessage];
        setMessages(finalSession);
        setMonkeyState(detectedState);
        setIsThinking(false);
        setStreamingContent('');

        // Persist: save current session display + append new messages to long-term history
        await saveMessages(finalSession);
        await appendToHistory([userMessage, assistantMessage]);

        if (userId) {
          await syncLatestMessages(userId, finalSession);
        }
      } catch (err) {
        console.error('Chat error:', err);
        const errMessage: Message = {
          id: uuidv4(),
          role: 'assistant',
          content:
            'The line went quiet for a moment. Something in the mountain air, perhaps. Try again — I am still here.',
          timestamp: Date.now(),
          monkeyState: 'serene',
        };
        const withError = [...updatedSession, errMessage];
        setMessages(withError);
        setMonkeyState('serene');
        setIsThinking(false);
        setStreamingContent('');
        await saveMessages(withError);
      }
    },
    [messages, isThinking, userId]
  );

  const clearHistory = useCallback(async () => {
    setMessages([OPENING_MESSAGE]);
    setMonkeyState('serene');
    historyRef.current = [];
    await saveMessages([OPENING_MESSAGE]);
  }, []);

  return {
    messages,
    isThinking,
    monkeyState,
    streamingContent,
    sendMessage,
    clearHistory,
    setUserId,
  };
}
