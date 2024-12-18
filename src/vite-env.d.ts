/// <reference types="vite/client" />

declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

interface ImportMetaEnv {
  readonly VITE_GROQ_API_KEY: string;
  readonly VITE_REPLICATE_API_KEY: string;
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_ELEVENLABS_API_KEY: string;
  // Add other env variables as needed
  [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
