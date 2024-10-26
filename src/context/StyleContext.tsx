import React, { createContext, useContext, useState, ReactNode } from 'react';
import { replicateApi, ReplicateModel, ModelVersion } from '../services/replicateApi';

interface StyleContextType {
  loading: boolean;
  error: string | null;
  selectedModel: { model: ReplicateModel; version: ModelVersion } | null;
  setSelectedModel: (model: ReplicateModel, version: ModelVersion) => void;
  stylizeImage: (imageFile: File, input: Record<string, any>) => Promise<string>;
}

const StyleContext = createContext<StyleContextType | null>(null);

export const StyleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<{ model: ReplicateModel; version: ModelVersion } | null>(null);

  const handleSetSelectedModel = (model: ReplicateModel, version: ModelVersion) => {
    setSelectedModel({ model, version });
  };

  const stylizeImage = async (imageFile: File, input: Record<string, any>): Promise<string> => {
    if (!selectedModel) {
      throw new Error('No model selected');
    }

    try {
      setLoading(true);
      setError(null);

      // Upload the image first
      const imageUrl = await replicateApi.uploadFile(imageFile);

      // Run the prediction with the selected model
      const output = await replicateApi.runPrediction(
        selectedModel.model.owner,
        selectedModel.model.name,
        selectedModel.version.id,
        {
          ...input,
          image: imageUrl,
        }
      );

      return output;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stylize image');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyleContext.Provider
      value={{
        loading,
        error,
        selectedModel,
        setSelectedModel: handleSetSelectedModel,
        stylizeImage,
      }}
    >
      {children}
    </StyleContext.Provider>
  );
};

export const useStyle = () => {
  const context = useContext(StyleContext);
  if (!context) {
    throw new Error('useStyle must be used within a StyleProvider');
  }
  return context;
};
