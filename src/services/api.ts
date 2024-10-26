import axios from 'axios';

const API_KEY = import.meta.env.VITE_HEDRA_API_KEY;

if (!API_KEY) {
  console.error('VITE_HEDRA_API_KEY is not set in .env file');
}

const api = axios.create({
  baseURL: 'https://api.hedra.com', // Update with actual Hedra API endpoint
  headers: {
    'Authorization': `Bearer ${API_KEY}`,
    'Content-Type': 'application/json',
  },
});

export const hedraApi = {
  // Generate video from image and audio
  generateVideo: async (imageFile: File, audioFile: File, aspectRatio: '1:1' | '16:9' | '9:16') => {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('audio', audioFile);
      formData.append('aspect_ratio', aspectRatio);

      const response = await api.post('/video/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error generating video:', error);
      throw error;
    }
  },
};

// TODO: Implement additional services:
// 1. Eleven Labs API for text-to-speech generation
// 2. Image stylization service (research open source options)
// 3. Voice cloning capabilities
// 4. Additional video processing features
