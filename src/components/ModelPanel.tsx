import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  TextField,
  Tooltip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import InfoIcon from '@mui/icons-material/Info';
import { ReplicateModel, ModelVersion } from '../services/replicateApi';
import ModelSelector from './ModelSelector';

interface ModelPanelProps {
  title: string;
  description: string;
  modelType: 'imageGeneration' | 'imageStylization' | 'upscaling';
  selectedModel?: { model: ReplicateModel; version: ModelVersion };
  onModelSelect: (model: ReplicateModel, version: ModelVersion) => void;
  onRunPrediction: (input: Record<string, any>) => Promise<any>;
  loading?: boolean;
  error?: string | null;
}

const ModelPanel: React.FC<ModelPanelProps> = ({
  title,
  description,
  modelType,
  selectedModel,
  onModelSelect,
  onRunPrediction,
  loading,
  error,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState<Record<string, any>>({});

  const handleInputChange = (key: string, value: any) => {
    setInput(prev => ({ ...prev, [key]: value }));
  };

  const handleRun = async () => {
    try {
      await onRunPrediction(input);
    } catch (err) {
      console.error('Error running prediction:', err);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Typography variant="h6">{title}</Typography>
          <Tooltip title={description}>
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <IconButton onClick={() => setExpanded(!expanded)}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 2 }}>
            <ModelSelector
              onModelSelect={onModelSelect}
              modelType={modelType}
            />
          </Box>

          {selectedModel && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                Selected Model: {selectedModel.model.owner}/{selectedModel.model.name}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Version: {selectedModel.version.id}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Model Inputs:
                </Typography>
                {Object.entries(selectedModel.version.openapi_schema?.components?.schemas?.Input?.properties || {}).map(([key, schema]: [string, any]) => (
                  <TextField
                    key={key}
                    fullWidth
                    label={key}
                    helperText={schema.description}
                    value={input[key] || ''}
                    onChange={(e) => handleInputChange(key, e.target.value)}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Box>

              <Button
                variant="contained"
                onClick={handleRun}
                disabled={loading}
                startIcon={loading && <CircularProgress size={20} />}
                sx={{ mt: 2 }}
              >
                {loading ? 'Running...' : 'Run Model'}
              </Button>
            </>
          )}
        </Box>
      </Collapse>
    </Paper>
  );
};

export default ModelPanel;
