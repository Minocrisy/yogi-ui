import axios from 'axios';

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const BASE_URL = 'https://api.groq.com/openai/v1';

if (!API_KEY) {
  console.error('VITE_GROQ_API_KEY is not set in .env file');
}

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content: string;
  name?: string;
  tool_calls?: any[];
}

export interface ChatCompletionOptions {
  messages: ChatMessage[];
  model: string;
  temperature?: number;
  top_p?: number;
  n?: number;
  stream?: boolean;
  stop?: string | string[];
  max_tokens?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  tools?: any[];
  tool_choice?: string | { type: string; function: { name: string } };
  user?: string;
  response_format?: { type: string };
}

export interface GroqModel {
  id: string;
  object: string;
  created: number;
  owned_by: string;
  active: boolean;
  context_window: number;
}

export const groqApi = {
  // List available models
  listModels: async (): Promise<GroqModel[]> => {
    try {
      const response = await api.get('/models');
      return response.data.data;
    } catch (error) {
      console.error('Error listing models:', error);
      throw error;
    }
  },

  // Get specific model details
  getModel: async (modelId: string): Promise<GroqModel> => {
    try {
      const response = await api.get(`/models/${modelId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting model:', error);
      throw error;
    }
  },

  // Create chat completion
  createChatCompletion: async (options: ChatCompletionOptions) => {
    try {
      const response = await api.post('/chat/completions', options);
      return response.data;
    } catch (error) {
      console.error('Error creating chat completion:', error);
      throw error;
    }
  },

  // Create streaming chat completion
  createStreamingChatCompletion: async (options: ChatCompletionOptions, onChunk: (chunk: any) => void) => {
    try {
      const response = await api.post('/chat/completions', 
        { ...options, stream: true },
        { 
          responseType: 'stream',
          onDownloadProgress: (progressEvent: any) => {
            const lines: string[] = progressEvent.event.target.responseText
              .split('\n')
              .filter((line: string) => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  onChunk({ done: true });
                } else {
                  try {
                    const chunk = JSON.parse(data);
                    onChunk(chunk);
                  } catch (e) {
                    console.error('Error parsing chunk:', e);
                  }
                }
              }
            }
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating streaming chat completion:', error);
      throw error;
    }
  },
};
