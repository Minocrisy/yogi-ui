import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { groqApi, ChatMessage, GroqModel, ChatCompletionOptions } from '../services/groqApi';

interface GroqContextType {
  loading: boolean;
  error: string | null;
  models: GroqModel[];
  selectedModel: string;
  setSelectedModel: (modelId: string) => void;
  chatSettings: Partial<ChatCompletionOptions>;
  setChatSettings: (settings: Partial<ChatCompletionOptions>) => void;
  sendMessage: (message: string) => Promise<string>;
  streamMessage: (message: string, onChunk: (text: string, done: boolean) => void) => Promise<void>;
}

const GroqContext = createContext<GroqContextType | null>(null);

export const GroqProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [models, setModels] = useState<GroqModel[]>([]);
  const [selectedModel, setSelectedModel] = useState('mixtral-8x7b-32768');
  const [chatSettings, setChatSettings] = useState<Partial<ChatCompletionOptions>>({
    temperature: 0.7,
    top_p: 1,
    max_tokens: undefined,
    presence_penalty: 0,
    frequency_penalty: 0,
  });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const modelList = await groqApi.listModels();
      setModels(modelList);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string): Promise<string> => {
    try {
      setLoading(true);
      setError(null);

      const messages: ChatMessage[] = [
        { role: 'user', content: message }
      ];

      const response = await groqApi.createChatCompletion({
        messages,
        model: selectedModel,
        ...chatSettings,
      });

      return response.choices[0]?.message?.content || '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const streamMessage = async (
    message: string,
    onChunk: (text: string, done: boolean) => void
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const messages: ChatMessage[] = [
        { role: 'user', content: message }
      ];

      await groqApi.createStreamingChatCompletion(
        {
          messages,
          model: selectedModel,
          ...chatSettings,
          stream: true,
        },
        (chunk) => {
          if (chunk.done) {
            onChunk('', true);
          } else {
            const content = chunk.choices[0]?.delta?.content || '';
            onChunk(content, false);
          }
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stream message');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <GroqContext.Provider
      value={{
        loading,
        error,
        models,
        selectedModel,
        setSelectedModel,
        chatSettings,
        setChatSettings,
        sendMessage,
        streamMessage,
      }}
    >
      {children}
    </GroqContext.Provider>
  );
};

export const useGroq = () => {
  const context = useContext(GroqContext);
  if (!context) {
    throw new Error('useGroq must be used within a GroqProvider');
  }
  return context;
};
