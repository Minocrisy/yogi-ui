import React, { createContext, useContext, useState, ReactNode } from 'react';
import { replicateApi, ReplicateModel, ModelVersion, PredictionStatus } from '../services/replicateApi';
import { getModelPreset, getDefaultParamsForModel } from '../config/modelPresets';

interface ReplicateContextType {
  loading: boolean;
  error: string | null;
  selectedModels: {
    imageGeneration?: { model: ReplicateModel; version: ModelVersion };
    imageStylization?: { model: ReplicateModel; version: ModelVersion };
    upscaling?: { model: ReplicateModel; version: ModelVersion };
  };
  setSelectedModel: (
    type: 'imageGeneration' | 'imageStylization' | 'upscaling',
    model: ReplicateModel,
    version: ModelVersion
  ) => void;
  runPrediction: (
    type: 'imageGeneration' | 'imageStylization' | 'upscaling',
    input: Record<string, any>
  ) => Promise<any>;
  predictions: PredictionStatus[];
  loadPredictions: () => Promise<void>;
}

const ReplicateContext = createContext<ReplicateContextType | null>(null);

export const ReplicateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModels, setSelectedModels] = useState<ReplicateContextType['selectedModels']>({});
  const [predictions, setPredictions] = useState<PredictionStatus[]>([]);

  const setSelectedModel = (
    type: 'imageGeneration' | 'imageStylization' | 'upscaling',
    model: ReplicateModel,
    version: ModelVersion
  ) => {
    setSelectedModels(prev => ({
      ...prev,
      [type]: { model, version }
    }));
  };

  const runPrediction = async (
    type: 'imageGeneration' | 'imageStylization' | 'upscaling',
    input: Record<string, any>
  ) => {
    const modelConfig = selectedModels[type];
    if (!modelConfig) {
      throw new Error(`No model selected for ${type}`);
    }

    try {
      setLoading(true);
      setError(null);

      const { model, version } = modelConfig;
      
      // Get default parameters for the model
      const defaultParams = getModelPreset(model.owner, model.name)?.defaultParams || {};
      
      // Merge default parameters with input
      const mergedInput = {
        ...defaultParams,
        ...input,
      };

      console.log('Running prediction with:', {
        type,
        model: `${model.owner}/${model.name}`,
        version: version.id,
        input: mergedInput,
      });

      const output = await replicateApi.runPrediction(
        model.owner,
        model.name,
        version.id,
        mergedInput
      );

      await loadPredictions();
      return output;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run prediction';
      console.error('Prediction error:', errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const loadPredictions = async () => {
    try {
      setLoading(true);
      const { predictions: latestPredictions } = await replicateApi.listPredictions();
      setPredictions(latestPredictions);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load predictions';
      console.error('Load predictions error:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReplicateContext.Provider
      value={{
        loading,
        error,
        selectedModels,
        setSelectedModel,
        runPrediction,
        predictions,
        loadPredictions,
      }}
    >
      {children}
    </ReplicateContext.Provider>
  );
};

export const useReplicate = () => {
  const context = useContext(ReplicateContext);
  if (!context) {
    throw new Error('useReplicate must be used within a ReplicateProvider');
  }
  return context;
};
