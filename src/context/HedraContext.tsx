import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HedraContextType {
  loading: boolean;
  error: string | null;
  generateVideo: (imageFile: File, audioFile: File, aspectRatio: '1:1' | '16:9' | '9:16') => Promise<Blob>;
}

const defaultContext: HedraContextType = {
  loading: false,
  error: null,
  generateVideo: async () => new Blob(),
};

const HedraContext = createContext<HedraContextType>(defaultContext);

export const HedraProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateVideo = async (imageFile: File, audioFile: File, aspectRatio: '1:1' | '16:9' | '9:16'): Promise<Blob> => {
    try {
      setLoading(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('audio', audioFile);
      formData.append('ar', aspectRatio);

      const API_KEY = import.meta.env.VITE_HEDRA_API_KEY;
      const response = await fetch('https://api.hedra.com/v1/video/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const videoBlob = await response.blob();
      return videoBlob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate video');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <HedraContext.Provider
      value={{
        loading,
        error,
        generateVideo,
      }}
    >
      {children}
    </HedraContext.Provider>
  );
};

export const useHedra = () => {
  const context = useContext(HedraContext);
  if (!context) {
    throw new Error('useHedra must be used within a HedraProvider');
  }
  return context;
};
