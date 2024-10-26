import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import CharacterCreator from './pages/CharacterCreator';
import VoiceManager from './pages/VoiceManager';
import AIWorkshop from './pages/AIWorkshop';
import ChatInterface from './pages/ChatInterface';
import { HedraProvider } from './context/HedraContext';
import { ElevenLabsProvider } from './context/ElevenLabsContext';
import { ReplicateProvider } from './context/ReplicateContext';
import { GroqProvider } from './context/GroqContext';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#1976d2',
    },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
    },
  },
});

function App() {
  return (
    <HedraProvider>
      <ElevenLabsProvider>
        <ReplicateProvider>
          <GroqProvider>
            <ThemeProvider theme={theme}>
              <CssBaseline />
              <Router>
                <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                  <Navbar />
                  <Box component="main" sx={{ p: 3 }}>
                    <Routes>
                      <Route path="/" element={<CharacterCreator />} />
                      <Route path="/voice-manager" element={<VoiceManager />} />
                      <Route path="/ai-workshop" element={<AIWorkshop />} />
                      <Route path="/chat" element={<ChatInterface />} />
                    </Routes>
                  </Box>
                </Box>
              </Router>
            </ThemeProvider>
          </GroqProvider>
        </ReplicateProvider>
      </ElevenLabsProvider>
    </HedraProvider>
  );
}

export default App;
