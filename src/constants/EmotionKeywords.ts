import { MonkeyState } from '../types/Chat';

export interface EmotionRule {
  state: MonkeyState;
  keywords: string[];
  antiKeywords?: string[];
}

// Rules are checked in order — first match wins.
// The last rule (idle, empty keywords) is the default fallback.
export const EMOTION_RULES: EmotionRule[] = [
  {
    state: 'distressed',
    keywords: [
      'deeply troubled', 'very difficult', 'that is serious', 'that concerns me',
      'grief', 'loss', 'devastating', 'terrible', 'unbearable', 'broken',
    ],
  },
  {
    state: 'surprised',
    keywords: [
      'surprised', 'unexpected', 'did not expect', 'i was not ready',
      'remarkable', 'extraordinary', 'startled', 'jolts', 'catches me',
    ],
  },
  {
    state: 'exasperated',
    keywords: [
      'sigh', 'sighs', 'despite myself', 'genuinely baffled',
      'patience', 'for the hundredth time', 'shakes his head',
    ],
  },
  {
    state: 'teaching',
    keywords: [
      'let me explain', 'consider this', 'here is what', 'the way i see it',
      'think of it', 'imagine it as', 'what this means', 'lesson',
      'socrates', 'in philosophy', 'the idea is', 'let us examine',
    ],
  },
  {
    state: 'singing',
    keywords: [
      'bruckner', 'strauss', 'schubert', 'symphony', 'four last songs',
      'music', 'melody', 'song', 'singing', 'hum', 'notes',
    ],
  },
  {
    state: 'praying',
    keywords: [
      'moment of stillness', 'sit in silence', 'breathe with that',
      'let us be still', 'close your eyes', 'meditation', 'prayer',
      'gratitude', 'acceptance', 'surrender to', 'peace within',
    ],
  },
  {
    state: 'reflective',
    keywords: [
      'pipe', 'smoke', 'staring at the ceiling', 'long pause',
      'sit with that', 'think about that', 'let that settle',
    ],
  },
  {
    state: 'sneaky',
    keywords: [
      'between us', 'quietly', 'i will tell you a secret', 'just between',
      'not many people', 'i rarely admit', 'privately', 'confession',
      'lean in', 'whisper',
    ],
  },
  {
    state: 'snacking',
    keywords: [
      'tea', 'barley tea', 'pour', 'sip', 'snack', 'warm', 'cup',
      'the tea is', 'takes a sip', 'eating', 'rice', 'food',
    ],
  },
  {
    state: 'focused',
    keywords: [
      'focus', 'concentrate', 'pay attention', 'listen carefully',
      'look closely', 'examine', 'what exactly', 'be precise',
      'tell me specifically', 'the details matter',
    ],
  },
  {
    state: 'monkey',
    keywords: [
      'scratch behind', 'scratching', 'sniff the air', 'interesting pebble',
      'pebble', 'groom', 'knuckle', 'examines', 'turns it over',
    ],
  },
  {
    state: 'amused',
    keywords: [
      'laugh', 'chuckle', 'funny', 'joke', 'absurd', 'ridiculous',
      'irony', 'ironic', 'hah', 'ha.', 'hmm, yes', 'almost funny',
    ],
  },
  {
    state: 'curious',
    keywords: [
      'curious', 'intriguing', 'tell me more', 'i want to understand',
      'what do you mean', 'say more about', 'that is interesting',
      'i find myself wondering', 'this makes me wonder',
    ],
  },
  {
    state: 'playful',
    keywords: [
      'playful', 'game', 'try this', 'what if we', 'pretend',
      'imagine for a moment', 'experiment', 'fun',
    ],
  },
  {
    state: 'wise',
    keywords: [
      'the truth is', 'what i have come to believe', 'in my experience',
      'i have seen', 'over the years', 'zen', 'buddhist', 'ancient',
      'the old', 'teaches us', 'what i know',
    ],
  },
  {
    state: 'concerned',
    keywords: [
      'worried', 'concern', 'that troubles me', 'are you safe',
      'please tell someone', 'not alone', 'reach out', 'crisis',
      '988', 'helpline', 'immediately',
    ],
  },
  {
    state: 'serene',
    keywords: [
      'the snow', 'the bath', 'stillness', 'quiet', 'gentle',
      'breathe', 'the pine', 'warmth', 'at peace',
      'steam rises', 'listen to the',
    ],
  },
  {
    state: 'contemplative',
    keywords: [
      'wonder', 'perhaps', 'i find myself', 'strange thing',
      'what does it mean', 'i ask myself', 'i wonder',
      'interesting question', 'i have been thinking',
    ],
  },
  {
    // Default fallback — always matches
    state: 'idle',
    keywords: [],
  },
];

export function detectMonkeyState(responseText: string): MonkeyState {
  const lower = responseText.toLowerCase();
  for (const rule of EMOTION_RULES) {
    if (rule.keywords.length === 0) return rule.state;
    const hasAnti = rule.antiKeywords?.some((k) => lower.includes(k)) ?? false;
    if (hasAnti) continue;
    const hasKeyword = rule.keywords.some((k) => lower.includes(k));
    if (hasKeyword) return rule.state;
  }
  return 'idle';
}
