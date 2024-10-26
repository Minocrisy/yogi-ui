import React, { useState, useRef, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SettingsIcon from '@mui/icons-material/Settings';
import { useGroq } from '../context/GroqContext';
import { ChatMessage } from '../services/groqApi';

const ChatInterface = () => {
  const {
    loading,
    error,
    models,
    selectedModel,
    setSelectedModel,
    chatSettings,
    setChatSettings,
    streamMessage,
  } = useGroq();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      let currentResponse = '';
      await streamMessage(input, (text, done) => {
        if (!done) {
          currentResponse += text;
          setMessages(prev => {
            const newMessages = [...prev];
            const lastMessage = newMessages[newMessages.length - 1];
            if (lastMessage?.role === 'assistant') {
              lastMessage.content = currentResponse;
            } else {
              newMessages.push({
                role: 'assistant',
                content: currentResponse,
              });
            }
            return newMessages;
          });
        }
      });
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" gutterBottom>
        Chat Interface
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2 }}>
        {/* Chat Area */}
        <Paper sx={{ flex: 1, p: 2, height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <Box sx={{ flex: 1, overflow: 'auto', mb: 2 }}>
            {messages.map((message, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  backgroundColor: message.role === 'user' ? 'action.hover' : 'background.paper',
                  borderRadius: 1,
                }}
              >
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {message.role.toUpperCase()}
                </Typography>
                <Typography
                  sx={{
                    whiteSpace: 'pre-wrap',
                    fontFamily: message.role === 'assistant' ? 'monospace' : 'inherit',
                  }}
                >
                  {message.content}
                </Typography>
              </Box>
            ))}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              disabled={loading}
            />
            <Button
              variant="contained"
              onClick={handleSend}
              disabled={loading || !input.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Send
            </Button>
          </Box>
        </Paper>

        {/* Settings Panel */}
        <Paper sx={{ width: 300, p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Settings
            </Typography>
            <IconButton onClick={() => setShowSettings(!showSettings)}>
              <SettingsIcon />
            </IconButton>
          </Box>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Model</InputLabel>
            <Select
              value={selectedModel}
              label="Model"
              onChange={(e) => setSelectedModel(e.target.value)}
            >
              {models.map((model) => (
                <MenuItem key={model.id} value={model.id}>
                  {model.id} ({model.context_window} tokens)
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider sx={{ my: 2 }} />

          <Typography variant="subtitle2" gutterBottom>
            Temperature: {chatSettings.temperature}
          </Typography>
          <Slider
            value={chatSettings.temperature || 0.7}
            onChange={(_, value) => setChatSettings({ ...chatSettings, temperature: value as number })}
            min={0}
            max={2}
            step={0.1}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Top P: {chatSettings.top_p}
          </Typography>
          <Slider
            value={chatSettings.top_p || 1}
            onChange={(_, value) => setChatSettings({ ...chatSettings, top_p: value as number })}
            min={0}
            max={1}
            step={0.1}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Max Tokens
          </Typography>
          <TextField
            fullWidth
            type="number"
            value={chatSettings.max_tokens || ''}
            onChange={(e) => setChatSettings({ ...chatSettings, max_tokens: parseInt(e.target.value) || undefined })}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Presence Penalty: {chatSettings.presence_penalty}
          </Typography>
          <Slider
            value={chatSettings.presence_penalty || 0}
            onChange={(_, value) => setChatSettings({ ...chatSettings, presence_penalty: value as number })}
            min={-2}
            max={2}
            step={0.1}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle2" gutterBottom>
            Frequency Penalty: {chatSettings.frequency_penalty}
          </Typography>
          <Slider
            value={chatSettings.frequency_penalty || 0}
            onChange={(_, value) => setChatSettings({ ...chatSettings, frequency_penalty: value as number })}
            min={-2}
            max={2}
            step={0.1}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={chatSettings.stream || false}
                onChange={(e) => setChatSettings({ ...chatSettings, stream: e.target.checked })}
              />
            }
            label="Stream Response"
          />
        </Paper>
      </Box>
    </Container>
  );
};

export default ChatInterface;
