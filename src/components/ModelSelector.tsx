import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Paper,
  Chip,
  Link,
  Alert,
} from '@mui/material';
import { replicateApi, ReplicateModel, ModelVersion } from '../services/replicateApi';
import { ModelPreset } from '../config/modelPresets';

interface ModelSelectorProps {
  onModelSelect: (model: ReplicateModel, version: ModelVersion) => void;
  modelType?: string;
  suggestedModels?: ModelPreset[];
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  onModelSelect, 
  modelType,
  suggestedModels = []
}) => {
  const [open, setOpen] = useState(false);
  const [models, setModels] = useState<ReplicateModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedModel, setSelectedModel] = useState<ReplicateModel | null>(null);
  const [versions, setVersions] = useState<ModelVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<ModelVersion | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadModels();
    }
  }, [open]);

  useEffect(() => {
    if (selectedModel) {
      loadVersions();
    }
  }, [selectedModel]);

  useEffect(() => {
    if (suggestedModels.length > 0) {
      loadSuggestedModels();
    }
  }, [suggestedModels]);

  const loadSuggestedModels = async () => {
    try {
      console.log('Loading suggested models:', suggestedModels);
      setLoading(true);
      setError(null);

      const modelPromises = suggestedModels.map(async ({ owner, name, version }) => {
        try {
          console.log('Fetching model:', owner, name);
          const model = await replicateApi.getModel(owner, name);
          console.log('Fetching version:', version);
          const modelVersion = await replicateApi.getModelSchema(owner, name, version);
          return { model, version: modelVersion };
        } catch (err) {
          console.error(`Error loading model ${owner}/${name}:`, err);
          return null;
        }
      });

      const results = await Promise.all(modelPromises);
      const validResults = results.filter((result): result is { model: ReplicateModel; version: ModelVersion } => 
        result !== null
      );

      console.log('Loaded models:', validResults);

      if (validResults.length > 0) {
        setModels(validResults.map(r => r.model));
        setSelectedModel(validResults[0].model);
        setSelectedVersion(validResults[0].version);
        onModelSelect(validResults[0].model, validResults[0].version);
      } else {
        setError('No valid models found');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load suggested models';
      console.error('Error in loadSuggestedModels:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadModels = async () => {
    try {
      console.log('Loading models with query:', searchQuery, 'modelType:', modelType);
      setLoading(true);
      setError(null);
      let query = searchQuery;
      if (modelType) {
        query = `${query} ${modelType}`.trim();
      }
      const modelList = await replicateApi.getModels(query);
      console.log('Loaded models:', modelList);
      setModels(modelList);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load models';
      console.error('Error in loadModels:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadVersions = async () => {
    if (!selectedModel) return;
    
    try {
      console.log('Loading versions for model:', selectedModel.owner, selectedModel.name);
      setLoading(true);
      setError(null);
      const versionList = await replicateApi.getModelVersions(
        selectedModel.owner,
        selectedModel.name
      );
      console.log('Loaded versions:', versionList);
      setVersions(versionList);
      if (versionList.length > 0) {
        setSelectedVersion(versionList[0]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load model versions';
      console.error('Error in loadVersions:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadModels();
  };

  const handleModelSelect = (model: ReplicateModel | null) => {
    console.log('Selected model:', model);
    setSelectedModel(model);
    setSelectedVersion(null);
  };

  const handleConfirm = () => {
    if (selectedModel && selectedVersion) {
      console.log('Confirming selection:', selectedModel, selectedVersion);
      onModelSelect(selectedModel, selectedVersion);
      setOpen(false);
    }
  };

  return (
    <Box>
      <Button 
        variant="outlined" 
        onClick={() => setOpen(true)}
        startIcon={loading && <CircularProgress size={20} />}
      >
        {selectedModel ? `${selectedModel.owner}/${selectedModel.name}` : 'Select Model'}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Select Model</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Search Models"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              sx={{ mb: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
            >
              Search
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Autocomplete
                options={models}
                getOptionLabel={(option) => `${option.owner}/${option.name}`}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="subtitle1">
                        {option.owner}/{option.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {option.description}
                      </Typography>
                    </Box>
                  </Box>
                )}
                value={selectedModel}
                onChange={(_, newValue) => handleModelSelect(newValue)}
                renderInput={(params) => (
                  <TextField {...params} label="Select Model" />
                )}
              />

              {selectedModel && (
                <Paper sx={{ mt: 2, p: 2 }}>
                  <Typography variant="h6">
                    {selectedModel.owner}/{selectedModel.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {selectedModel.description}
                  </Typography>
                  
                  <Box sx={{ mb: 1 }}>
                    {selectedModel.github_url && (
                      <Link href={selectedModel.github_url} target="_blank" sx={{ mr: 2 }}>
                        GitHub
                      </Link>
                    )}
                    {selectedModel.paper_url && (
                      <Link href={selectedModel.paper_url} target="_blank" sx={{ mr: 2 }}>
                        Paper
                      </Link>
                    )}
                    {selectedModel.license_url && (
                      <Link href={selectedModel.license_url} target="_blank">
                        License
                      </Link>
                    )}
                  </Box>

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Versions:
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {versions.map((version) => (
                      <Chip
                        key={version.id}
                        label={version.id.substring(0, 8)}
                        onClick={() => setSelectedVersion(version)}
                        color={selectedVersion?.id === version.id ? 'primary' : 'default'}
                        variant={selectedVersion?.id === version.id ? 'filled' : 'outlined'}
                      />
                    ))}
                  </Box>
                </Paper>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            disabled={!selectedModel || !selectedVersion}
            variant="contained"
          >
            Select
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ModelSelector;
