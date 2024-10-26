import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the root directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());

// Log middleware
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Proxy middleware configuration
const replicateProxy = createProxyMiddleware({
  target: 'https://api.replicate.com/v1',
  changeOrigin: true,
  pathRewrite: {
    '^/api/replicate': '',
  },
  onProxyReq: (proxyReq, req, _res) => {
    // Add the API key to the request
    proxyReq.setHeader('Authorization', `Token ${process.env.VITE_REPLICATE_API_KEY}`);
    console.log('Proxying request:', req.method, req.url);
  },
  onProxyRes: (proxyRes, req, _res) => {
    console.log('Received response:', proxyRes.statusCode, req.url);
  },
  onError: (err, _req, _res) => {
    console.error('Proxy error:', err);
  },
});

// Use the proxy middleware
app.use('/api/replicate', replicateProxy);

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy server running on http://localhost:${PORT}`);
  console.log('Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    REPLICATE_API_KEY: process.env.VITE_REPLICATE_API_KEY ? '[REDACTED]' : 'Not set',
  });
});
