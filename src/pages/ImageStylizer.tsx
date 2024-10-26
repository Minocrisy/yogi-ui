import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useStyle } from '../context/StyleContext';
import ModelSelector from '../components/ModelSelector';

const ImageStylizer = () => {
  const { loading, error, selectedModel, setSelectedModel, stylizeImage } = useStyle();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImageSelect = (file: File) => {
    if (file.type.startsWith('image/')) {
      setSelectedImage(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleImageSelect(event.target.files[0]);
    }
  };

  const handleStylize = async () => {
    if (!selectedImage || !selectedModel) return;

    try {
      const result = await stylizeImage(selectedImage, {
        prompt: selectedModel.model.description || 'Style transfer',
      });
      setResultUrl(result);
    } catch (err) {
      console.error('Error stylizing image:', err);
    }
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Image Stylizer
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Model
            </Typography>
            <ModelSelector
              onModelSelect={(model, version) => setSelectedModel(model, version)}
              modelType="image-to-image"
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Upload Image
            </Typography>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: dragActive ? 'primary.main' : 'grey.500',
                borderRadius: 1,
                p: 3,
                textAlign: 'center',
                mb: 2,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: dragActive ? 'action.hover' : 'transparent',
              }}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
                disabled={loading}
              />
              <label htmlFor="image-upload" style={{ width: '100%', cursor: 'pointer' }}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <Box sx={{ py: 4 }}>
                    <CloudUploadIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography>
                      Drag and drop an image here or click to upload
                    </Typography>
                  </Box>
                )}
              </label>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleStylize}
              disabled={loading || !selectedImage || !selectedModel}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Processing...' : 'Apply Style'}
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Result
            </Typography>
            <Box
              sx={{
                width: '100%',
                height: 400,
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                overflow: 'hidden',
              }}
            >
              {resultUrl ? (
                <img
                  src={resultUrl}
                  alt="Stylized"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  Stylized image will appear here
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ImageStylizer;
