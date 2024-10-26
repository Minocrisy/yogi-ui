import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { elevenLabsApi } from '../services/elevenLabsApi';
import { 
  Voice, 
  VoiceSettings, 
  UserInfo, 
  UserSubscription,
  TextToSpeechRequest,
  HistoryResponse 
} from '../types/elevenlabs';

interface ElevenLabsContextType {
  loading: boolean;
  error: string | null;
  voices: Voice[];
  selectedVoice: Voice | null;
  userInfo: UserInfo | null;
  subscription: UserSubscription | null;
  loadVoices: () => Promise<void>;
  loadUserInfo: () => Promise<void>;
  loadSubscription: () => Promise<void>;
  selectVoice: (voiceId: string) => Promise<void>;
  generateSpeech: (request: TextToSpeechRequest) => Promise<Blob>;
  editVoiceSettings: (voiceId: string, settings: VoiceSettings) => Promise<void>;
  deleteVoice: (voiceId: string) => Promise<void>;
  getHistory: (pageSize?: number, startAfter?: string) => Promise<HistoryResponse>;
  downloadHistoryItem: (historyItemId: string) => Promise<Blob>;
  deleteHistoryItems: (historyItemIds: string[]) => Promise<void>;
}

const ElevenLabsContext = createContext<ElevenLabsContextType | undefined>(undefined);

export const ElevenLabsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);

  const loadVoices = async () => {
    if (loading) return; // Prevent duplicate calls
    try {
      setLoading(true);
      setError(null);
      const voicesData = await elevenLabsApi.getVoices();
      setVoices(voicesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load voices');
    } finally {
      setLoading(false);
    }
  };

  const loadUserInfo = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);
      const info = await elevenLabsApi.getUserInfo();
      setUserInfo(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user info');
    } finally {
      setLoading(false);
    }
  };

  const loadSubscription = async () => {
    if (loading) return;
    try {
      setLoading(true);
      setError(null);
      const sub = await elevenLabsApi.getUserSubscription();
      setSubscription(sub);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subscription');
    } finally {
      setLoading(false);
    }
  };

  const selectVoice = async (voiceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const voice = await elevenLabsApi.getVoice(voiceId);
      setSelectedVoice(voice);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to select voice');
    } finally {
      setLoading(false);
    }
  };

  const generateSpeech = async (request: TextToSpeechRequest) => {
    try {
      setLoading(true);
      setError(null);
      return await elevenLabsApi.textToSpeech(request);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate speech');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const editVoiceSettings = async (voiceId: string, settings: VoiceSettings) => {
    try {
      setLoading(true);
      setError(null);
      await elevenLabsApi.editVoice(voiceId, settings);
      await loadVoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to edit voice settings');
    } finally {
      setLoading(false);
    }
  };

  const deleteVoice = async (voiceId: string) => {
    try {
      setLoading(true);
      setError(null);
      await elevenLabsApi.deleteVoice(voiceId);
      await loadVoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete voice');
    } finally {
      setLoading(false);
    }
  };

  const getHistory = async (pageSize?: number, startAfter?: string) => {
    try {
      setLoading(true);
      setError(null);
      return await elevenLabsApi.getHistory(pageSize, startAfter);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get history');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const downloadHistoryItem = async (historyItemId: string) => {
    try {
      setLoading(true);
      setError(null);
      return await elevenLabsApi.downloadHistoryItem(historyItemId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download history item');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteHistoryItems = async (historyItemIds: string[]) => {
    try {
      setLoading(true);
      setError(null);
      await elevenLabsApi.deleteHistoryItems(historyItemIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete history items');
    } finally {
      setLoading(false);
    }
  };

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      await Promise.all([
        loadVoices(),
        loadUserInfo(),
        loadSubscription()
      ]);
    };
    loadInitialData();
  }, []);

  return (
    <ElevenLabsContext.Provider
      value={{
        loading,
        error,
        voices,
        selectedVoice,
        userInfo,
        subscription,
        loadVoices,
        loadUserInfo,
        loadSubscription,
        selectVoice,
        generateSpeech,
        editVoiceSettings,
        deleteVoice,
        getHistory,
        downloadHistoryItem,
        deleteHistoryItems,
      }}
    >
      {children}
    </ElevenLabsContext.Provider>
  );
};

export const useElevenLabs = () => {
  const context = useContext(ElevenLabsContext);
  if (!context) {
    throw new Error('useElevenLabs must be used within an ElevenLabsProvider');
  }
  return context;
};
