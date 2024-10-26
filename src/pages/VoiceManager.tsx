import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Slider,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { useElevenLabs } from '../context/ElevenLabsContext';
import HistoryManager from '../components/HistoryManager';
import { Voice } from '../types/elevenlabs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`voice-tabpanel-${index}`}
      aria-labelledby={`voice-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const VoiceManager = () => {
  console.log('Rendering VoiceManager component');
  
  const {
    loading,
    error,
    voices,
    selectedVoice,
    userInfo,
    subscription,
    loadVoices,
    selectVoice,
    generateSpeech,
    editVoiceSettings,
    deleteVoice,
  } = useElevenLabs();

  const [tabValue, setTabValue] = useState(0);
  const [sampleText, setSampleText] = useState('Hello, this is a sample text to test the voice.');
  const [editingVoice, setEditingVoice] = useState<string | null>(null);
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity_boost: 0.5,
    style: 0.5,
    use_speaker_boost: true,
  });

  useEffect(() => {
    console.log('VoiceManager useEffect - Loading voices');
    loadVoices();
  }, []);

  useEffect(() => {
    console.log('Voices updated:', voices);
  }, [voices]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleGenerateSample = async (voiceId: string) => {
    try {
      const audioBlob = await generateSpeech({
        text: sampleText,
        voice_id: voiceId,
        voice_settings: voiceSettings,
      });
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (err) {
      console.error('Error generating sample:', err);
    }
  };

  const handleEditVoice = async (voiceId: string) => {
    if (editingVoice === voiceId) {
      try {
        await editVoiceSettings(voiceId, voiceSettings);
        setEditingVoice(null);
      } catch (err) {
        console.error('Error updating voice settings:', err);
      }
    } else {
      setEditingVoice(voiceId);
      const voice = voices.find((v: Voice) => v.voice_id === voiceId);
      if (voice) {
        setVoiceSettings(voice.settings);
      }
    }
  };

  const handleDeleteVoice = async (voiceId: string) => {
    if (window.confirm('Are you sure you want to delete this voice?')) {
      try {
        await deleteVoice(voiceId);
      } catch (err) {
        console.error('Error deleting voice:', err);
      }
    }
  };

  console.log('Current state:', { loading, error, voicesCount: voices.length });

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" gutterBottom>
        Voice Manager
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Voices" />
          <Tab label="History" />
          <Tab label="Account" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            {voices.map((voice: Voice) => (
              <Grid item xs={12} md={6} key={voice.voice_id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{voice.name}</Typography>
                    <Typography color="textSecondary" gutterBottom>
                      {voice.category}
                    </Typography>
                    
                    {editingVoice === voice.voice_id && (
                      <Box sx={{ mt: 2 }}>
                        <Typography gutterBottom>Stability</Typography>
                        <Slider
                          value={voiceSettings.stability}
                          onChange={(_, value) => setVoiceSettings(prev => ({ ...prev, stability: value as number }))}
                          min={0}
                          max={1}
                          step={0.1}
                        />
                        
                        <Typography gutterBottom>Similarity Boost</Typography>
                        <Slider
                          value={voiceSettings.similarity_boost}
                          onChange={(_, value) => setVoiceSettings(prev => ({ ...prev, similarity_boost: value as number }))}
                          min={0}
                          max={1}
                          step={0.1}
                        />

                        <Typography gutterBottom>Style</Typography>
                        <Slider
                          value={voiceSettings.style}
                          onChange={(_, value) => setVoiceSettings(prev => ({ ...prev, style: value as number }))}
                          min={0}
                          max={1}
                          step={0.1}
                        />
                      </Box>
                    )}

                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      variant="outlined"
                      placeholder="Enter text to test voice..."
                      value={sampleText}
                      onChange={(e) => setSampleText(e.target.value)}
                      sx={{ mt: 2 }}
                    />
                  </CardContent>
                  <CardActions>
                    <IconButton
                      onClick={() => handleGenerateSample(voice.voice_id)}
                      disabled={loading}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleEditVoice(voice.voice_id)}
                      color={editingVoice === voice.voice_id ? 'primary' : 'default'}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteVoice(voice.voice_id)}
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <HistoryManager />
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            {userInfo && (
              <Box>
                <Typography>Subscription: {subscription?.tier}</Typography>
                <Typography>Characters remaining: {userInfo?.subscription?.character_count}</Typography>
                <Typography>Character limit: {userInfo?.subscription?.character_limit}</Typography>
              </Box>
            )}
          </Paper>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default VoiceManager;
