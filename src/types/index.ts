export interface VideoSummary {
  id: string;
  title: string;
  transcript: string;
  summary: string;
  keyMoments: KeyMoment[];
  steps: string[];
}

export interface KeyMoment {
  timestamp: string;
  description: string;
}

export interface ApiResponse {
  success: boolean;
  data: VideoSummary;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export type LLMProvider = 'openai' | 'claude' | 'ollama';

export interface LLMSettings {
  provider: LLMProvider;
  apiKey: string;
  apiUrl: string;
}