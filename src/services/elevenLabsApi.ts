import axios from 'axios';
import { 
  Voice, 
  VoiceSettings, 
  VoiceCloneRequest,
  UserInfo,
  UserSubscription,
  HistoryResponse,
  TextToSpeechRequest
} from '../types/elevenlabs';

const API_KEY = import.meta.env.VITE_ELEVEN_LABS_API_KEY;
const BASE_URL = 'https://api.elevenlabs.io/v1';

if (!API_KEY) {
  console.error('VITE_ELEVEN_LABS_API_KEY is not set in .env file');
}

console.log('Initializing Eleven Labs API with base URL:', BASE_URL);

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'xi-api-key': API_KEY,
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
api.interceptors.request.use(request => {
  console.log('Making request to:', request.url);
  return request;
});

// Add response interceptor for logging
api.interceptors.response.use(
  response => {
    console.log('Received response from:', response.config.url);
    return response;
  },
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const elevenLabsApi = {
  // Get all available voices
  getVoices: async (): Promise<Voice[]> => {
    console.log('Fetching voices...');
    try {
      const response = await api.get('/voices');
      console.log('Fetched voices:', response.data.voices);
      return response.data.voices;
    } catch (error) {
      console.error('Error fetching voices:', error);
      throw error;
    }
  },

  // Get specific voice
  getVoice: async (voiceId: string): Promise<Voice> => {
    console.log('Fetching voice:', voiceId);
    try {
      const response = await api.get(`/voices/${voiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching voice:', error);
      throw error;
    }
  },

  // Edit voice settings
  editVoice: async (voiceId: string, settings: VoiceSettings): Promise<void> => {
    console.log('Updating voice settings:', voiceId, settings);
    try {
      await api.patch(`/voices/${voiceId}/settings`, settings);
    } catch (error) {
      console.error('Error editing voice:', error);
      throw error;
    }
  },

  // Delete a voice
  deleteVoice: async (voiceId: string): Promise<void> => {
    console.log('Deleting voice:', voiceId);
    try {
      await api.delete(`/voices/${voiceId}`);
    } catch (error) {
      console.error('Error deleting voice:', error);
      throw error;
    }
  },

  // Add voice (voice cloning)
  addVoice: async (request: VoiceCloneRequest): Promise<Voice> => {
    console.log('Adding new voice:', request.name);
    try {
      const formData = new FormData();
      formData.append('name', request.name);
      request.files.forEach((file: File) => {
        formData.append('files', file);
      });
      if (request.description) {
        formData.append('description', request.description);
      }
      if (request.labels) {
        formData.append('labels', JSON.stringify(request.labels));
      }

      const response = await api.post('/voices/add', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error adding voice:', error);
      throw error;
    }
  },

  // Text to speech
  textToSpeech: async (request: TextToSpeechRequest): Promise<Blob> => {
    console.log('Generating speech for voice:', request.voice_id);
    try {
      const response = await api.post(
        `/text-to-speech/${request.voice_id}`,
        {
          text: request.text,
          voice_settings: request.voice_settings,
        },
        {
          responseType: 'blob',
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error generating speech:', error);
      throw error;
    }
  },

  // Get user subscription info
  getUserSubscription: async (): Promise<UserSubscription> => {
    console.log('Fetching user subscription...');
    try {
      const response = await api.get('/user/subscription');
      return response.data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      throw error;
    }
  },

  // Get user info
  getUserInfo: async (): Promise<UserInfo> => {
    console.log('Fetching user info...');
    try {
      const response = await api.get('/user');
      return response.data;
    } catch (error) {
      console.error('Error fetching user info:', error);
      throw error;
    }
  },

  // Get voice generation history
  getHistory: async (pageSize?: number, startAfter?: string): Promise<HistoryResponse> => {
    console.log('Fetching history...', { pageSize, startAfter });
    try {
      const params = new URLSearchParams();
      if (pageSize) params.append('page_size', pageSize.toString());
      if (startAfter) params.append('start_after', startAfter);

      const response = await api.get(`/history?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching history:', error);
      throw error;
    }
  },

  // Download a specific history item
  downloadHistoryItem: async (historyItemId: string): Promise<Blob> => {
    console.log('Downloading history item:', historyItemId);
    try {
      const response = await api.get(`/history/${historyItemId}/audio`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error downloading history item:', error);
      throw error;
    }
  },

  // Delete history items
  deleteHistoryItems: async (historyItemIds: string[]): Promise<void> => {
    console.log('Deleting history items:', historyItemIds);
    try {
      await api.delete('/history', {
        data: { history_item_ids: historyItemIds },
      });
    } catch (error) {
      console.error('Error deleting history items:', error);
      throw error;
    }
  },
};
