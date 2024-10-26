import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import { useHedra } from '../context/HedraContext';
import TextToSpeechGenerator from '../components/TextToSpeechGenerator';
import ImageGenerator from '../components/ImageGenerator';

type AspectRatio = '1:1' | '16:9' | '9:16';

const CharacterCreator = () => {
  const { loading, error, generateVideo } = useHedra();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleImageGenerated = async (imageUrl: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], 'generated-image.png', { type: 'image/png' });
      setSelectedImage(file);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(URL.createObjectURL(file));
    } catch (err) {
      console.error('Error processing generated image:', err);
    }
  };

  const handleGenerate = async () => {
    if (selectedImage && generatedAudio) {
      try {
        const audioFile = new File([generatedAudio], 'generated_audio.wav', {
          type: 'audio/wav'
        });
        await generateVideo(selectedImage, audioFile, aspectRatio);
      } catch (err) {
        console.error('Error generating video:', err);
      }
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Character Creator
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Left Column - Image Generation */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Character Image
            </Typography>
            <ImageGenerator
              onImageGenerated={handleImageGenerated}
              category="character"
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Video Settings
            </Typography>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Aspect Ratio</InputLabel>
              <Select
                value={aspectRatio}
                label="Aspect Ratio"
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                disabled={loading}
              >
                <MenuItem value="1:1">1:1 (Square)</MenuItem>
                <MenuItem value="16:9">16:9 (Landscape)</MenuItem>
                <MenuItem value="9:16">9:16 (Portrait)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleGenerate}
              disabled={loading || !selectedImage || !generatedAudio}
              startIcon={loading && <CircularProgress size={20} />}
            >
              {loading ? 'Generating Video...' : 'Generate Video'}
            </Button>
          </Paper>
        </Grid>

        {/* Right Column - Audio and Preview */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Voice Generation
            </Typography>
            <TextToSpeechGenerator onAudioGenerated={setGeneratedAudio} />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preview
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
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <Typography color="text.secondary">
                  Generate or upload an image to preview
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CharacterCreator;
