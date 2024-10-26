import { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import { useElevenLabs } from '../context/ElevenLabsContext';
import { Voice } from '../types/elevenlabs';

interface TextToSpeechGeneratorProps {
  onAudioGenerated?: (audioBlob: Blob) => void;
}

const TextToSpeechGenerator = ({ onAudioGenerated }: TextToSpeechGeneratorProps) => {
  const { voices, loading, error, generateSpeech } = useElevenLabs();
  const [text, setText] = useState('');
  const [selectedVoice, setSelectedVoice] = useState('');
  const [generatedAudio, setGeneratedAudio] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleTextFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setText(content);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedVoice || !text) return;

    try {
      const audioBlob = await generateSpeech({
        text,
        voice_id: selectedVoice,
      });

      setGeneratedAudio(audioBlob);
      if (onAudioGenerated) {
        onAudioGenerated(audioBlob);
      }

      // Create audio URL for preview
      if (audioRef.current) {
        const audioUrl = URL.createObjectURL(audioBlob);
        audioRef.current.src = audioUrl;
      }
    } catch (err) {
      console.error('Error generating audio:', err);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSave = () => {
    if (generatedAudio) {
      const url = URL.createObjectURL(generatedAudio);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-audio-${Date.now()}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Text to Speech Generator
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3 }}>
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Voice</InputLabel>
          <Select
            value={selectedVoice}
            label="Select Voice"
            onChange={(e) => setSelectedVoice(e.target.value)}
            disabled={loading}
          >
            {voices.map((voice: Voice) => (
              <MenuItem key={voice.voice_id} value={voice.voice_id}>
                {voice.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ mb: 2 }}>
          <input
            accept=".txt"
            style={{ display: 'none' }}
            id="text-file-upload"
            type="file"
            onChange={handleTextFileUpload}
          />
          <label htmlFor="text-file-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
            >
              Upload Text File
            </Button>
          </label>
        </Box>

        <TextField
          fullWidth
          multiline
          rows={6}
          variant="outlined"
          placeholder="Enter text or upload a file..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
          sx={{ mb: 2 }}
        />

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            onClick={handleGenerate}
            disabled={loading || !selectedVoice || !text}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Generating...' : 'Generate Audio'}
          </Button>

          {generatedAudio && (
            <>
              <IconButton onClick={handlePlayPause} disabled={loading}>
                <PlayArrowIcon />
              </IconButton>
              <IconButton onClick={handleSave} disabled={loading}>
                <SaveIcon />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        style={{ display: 'none' }}
      />
    </Paper>
  );
};

export default TextToSpeechGenerator;
