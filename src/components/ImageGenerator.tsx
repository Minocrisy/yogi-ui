import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Grid,
} from '@mui/material';
import { useReplicate } from '../context/ReplicateContext';
import ModelSelector from './ModelSelector';
import { getModelsByCategory, getDefaultParamsForModel } from '../config/modelPresets';

interface ImageGeneratorProps {
  onImageGenerated?: (imageUrl: string) => void;
  category?: string;
}

interface AdvancedParams {
  width: number;
  height: number;
  num_inference_steps: number;
  guidance_scale: number;
  num_outputs: number;
}

const DEFAULT_PARAMS: AdvancedParams = {
  width: 768,
  height: 768,
  num_inference_steps: 50,
  guidance_scale: 7.5,
  num_outputs: 1,
};

const ImageGenerator: React.FC<ImageGeneratorProps> = ({ 
  onImageGenerated,
  category = 'text-to-image'
}) => {
  const { loading, error, selectedModels, setSelectedModel, runPrediction } = useReplicate();
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [params, setParams] = useState<AdvancedParams>(DEFAULT_PARAMS);

  useEffect(() => {
    if (selectedModels.imageGeneration) {
      const defaultParams = getDefaultParamsForModel(
        selectedModels.imageGeneration.model.owner,
        selectedModels.imageGeneration.model.name
      );
      setParams({ ...DEFAULT_PARAMS, ...defaultParams });
    }
  }, [selectedModels.imageGeneration]);

  const handleGenerate = async () => {
    if (!selectedModels.imageGeneration || !prompt) return;

    try {
      const result = await runPrediction('imageGeneration', {
        prompt,
        negative_prompt: negativePrompt,
        ...params,
      });

      if (Array.isArray(result) && result.length > 0 && onImageGenerated) {
        onImageGenerated(result[0]);
      }
    } catch (err) {
      console.error('Error generating image:', err);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Image Generator
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2 }}>
        <ModelSelector
          onModelSelect={(model, version) => setSelectedModel('imageGeneration', model, version)}
          modelType={category}
          suggestedModels={getModelsByCategory(category)}
        />
      </Box>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Prompt"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        sx={{ mb: 2 }}
      />

      <TextField
        fullWidth
        multiline
        rows={2}
        label="Negative Prompt"
        value={negativePrompt}
        onChange={(e) => setNegativePrompt(e.target.value)}
        placeholder="Describe what you don't want in the image..."
        sx={{ mb: 2 }}
      />

      <Button
        variant="outlined"
        onClick={() => setShowAdvanced(!showAdvanced)}
        sx={{ mb: 2 }}
      >
        {showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
      </Button>

      {showAdvanced && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={6}>
            <Typography gutterBottom>Width: {params.width}px</Typography>
            <Slider
              value={params.width}
              onChange={(_, value) => setParams(prev => ({ ...prev, width: value as number }))}
              min={256}
              max={1024}
              step={64}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>Height: {params.height}px</Typography>
            <Slider
              value={params.height}
              onChange={(_, value) => setParams(prev => ({ ...prev, height: value as number }))}
              min={256}
              max={1024}
              step={64}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>Steps: {params.num_inference_steps}</Typography>
            <Slider
              value={params.num_inference_steps}
              onChange={(_, value) => setParams(prev => ({ ...prev, num_inference_steps: value as number }))}
              min={20}
              max={100}
              step={1}
            />
          </Grid>
          <Grid item xs={6}>
            <Typography gutterBottom>Guidance Scale: {params.guidance_scale}</Typography>
            <Slider
              value={params.guidance_scale}
              onChange={(_, value) => setParams(prev => ({ ...prev, guidance_scale: value as number }))}
              min={1}
              max={20}
              step={0.1}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Number of Images</InputLabel>
              <Select
                value={params.num_outputs}
                label="Number of Images"
                onChange={(e) => setParams(prev => ({ ...prev, num_outputs: e.target.value as number }))}
              >
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={4}>4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleGenerate}
        disabled={loading || !prompt || !selectedModels.imageGeneration}
        startIcon={loading && <CircularProgress size={20} />}
      >
        {loading ? 'Generating...' : 'Generate Image'}
      </Button>
    </Paper>
  );
};

export default ImageGenerator;
