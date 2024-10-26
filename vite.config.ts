import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, path.resolve(__dirname), '');

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
