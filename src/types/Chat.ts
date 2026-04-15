export type MonkeyState =
  | 'idle'
  | 'thinking'
  | 'responding'
  | 'playful'
  | 'contemplative'
  | 'wise'
  | 'amused'
  | 'concerned'
  | 'exasperated'
  | 'reflective'
  | 'serene'
  | 'monkey'
  | 'curious'
  | 'distressed'
  | 'focused'
  | 'snacking'
  | 'praying'
  | 'singing'
  | 'teaching'
  | 'sneaky'
  | 'surprised';

export type MessageRole = 'user' | 'assistant';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  monkeyState: MonkeyState;
}

export interface Conversation {
  id: string;
  startedAt: number;
  messages: Message[];
  userId?: string;
}
