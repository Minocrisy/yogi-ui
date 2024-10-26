import React, { useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
} from '@mui/material';
import { useReplicate } from '../context/ReplicateContext';
import ModelPanel from '../components/ModelPanel';

const AIWorkshop = () => {
  const {
    loading,
    error,
    selectedModels,
    setSelectedModel,
    runPrediction,
    predictions,
  } = useReplicate();

  const [results, setResults] = useState<Record<string, any>>({});

  const handleRunPrediction = async (type: 'imageGeneration' | 'imageStylization' | 'upscaling', input: Record<string, any>) => {
    try {
      const output = await runPrediction(type, input);
      setResults(prev => ({
        ...prev,
        [type]: output
      }));
    } catch (err) {
      console.error('Error running prediction:', err);
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        AI Workshop
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={8}>
          {/* Model Panels */}
          <ModelPanel
            title="Image Generation"
            description="Generate images from text descriptions using various AI models"
            modelType="imageGeneration"
            selectedModel={selectedModels.imageGeneration}
            onModelSelect={(model, version) => setSelectedModel('imageGeneration', model, version)}
            onRunPrediction={(input) => handleRunPrediction('imageGeneration', input)}
            loading={loading}
            error={error}
          />

          <ModelPanel
            title="Image Stylization"
            description="Apply various AI styles to your images"
            modelType="imageStylization"
            selectedModel={selectedModels.imageStylization}
            onModelSelect={(model, version) => setSelectedModel('imageStylization', model, version)}
            onRunPrediction={(input) => handleRunPrediction('imageStylization', input)}
            loading={loading}
            error={error}
          />

          <ModelPanel
            title="Image Upscaling"
            description="Enhance and upscale images using AI"
            modelType="upscaling"
            selectedModel={selectedModels.upscaling}
            onModelSelect={(model, version) => setSelectedModel('upscaling', model, version)}
            onRunPrediction={(input) => handleRunPrediction('upscaling', input)}
            loading={loading}
            error={error}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          {/* Results Panel */}
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Results
            </Typography>
            {Object.entries(results).map(([type, output]) => (
              <Box key={type} sx={{ mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  {type}:
                </Typography>
                {Array.isArray(output) ? (
                  <Grid container spacing={1}>
                    {output.map((url, index) => (
                      <Grid item xs={6} key={index}>
                        <img
                          src={url}
                          alt={`Result ${index + 1}`}
                          style={{
                            width: '100%',
                            height: 'auto',
                            borderRadius: 4,
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <pre style={{ overflow: 'auto', maxHeight: 200 }}>
                    {JSON.stringify(output, null, 2)}
                  </pre>
                )}
              </Box>
            ))}
          </Paper>

          {/* Recent Predictions */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Predictions
            </Typography>
            {predictions.map((prediction) => (
              <Box key={prediction.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2">
                  {prediction.status} - {new Date(prediction.created_at).toLocaleString()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Model: {prediction.urls.get.split('/')[4]}/{prediction.urls.get.split('/')[5]}
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AIWorkshop;
