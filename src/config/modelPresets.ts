export interface ModelPreset {
  owner: string;
  name: string;
  version: string;
  description: string;
  defaultParams?: Record<string, any>;
  category: string[];
}

export const MODEL_PRESETS: ModelPreset[] = [
  // Text to Image Models
  {
    owner: 'stability-ai',
    name: 'sdxl',
    version: '39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
    description: 'State-of-the-art image generation model',
    defaultParams: {
      width: 1024,
      height: 1024,
      num_outputs: 1,
      scheduler: 'K_EULER',
      num_inference_steps: 50,
      guidance_scale: 7.5,
    },
    category: ['text-to-image', 'general']
  },
  {
    owner: 'stability-ai',
    name: 'stable-diffusion',
    version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf',
    description: 'Fast and efficient image generation',
    defaultParams: {
      width: 768,
      height: 768,
      prompt_strength: 0.8,
      num_outputs: 1,
      num_inference_steps: 50,
      guidance_scale: 7.5,
    },
    category: ['text-to-image', 'general']
  },

  // Character Generation Models
  {
    owner: 'playgroundai',
    name: 'playground-v2-1024px-aesthetic',
    version: '0f5cce4f90419b13ada34f1884d1bc0fe8201120db0eb321817bb88c0d6f504f',
    description: 'Specialized in character and portrait generation',
    defaultParams: {
      width: 1024,
      height: 1024,
      num_outputs: 1,
      guidance_scale: 7.5,
    },
    category: ['text-to-image', 'character', 'portrait']
  },
  {
    owner: 'prompthero',
    name: 'openjourney',
    version: '9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb',
    description: 'Specialized in anime and illustration style',
    defaultParams: {
      width: 512,
      height: 512,
      num_outputs: 1,
      num_inference_steps: 50,
      guidance_scale: 7,
    },
    category: ['text-to-image', 'anime', 'character']
  },

  // Style Transfer Models
  {
    owner: 'rossjillian',
    name: 'controlnet',
    version: '1b336a8d5aa3d89c616c4d10ee86975d87d06d90a1850a3a1950af4726b0fad5',
    description: 'Advanced style transfer and image manipulation',
    defaultParams: {
      image_resolution: 768,
      detect_resolution: 768,
      guessmode: false,
    },
    category: ['image-to-image', 'style-transfer']
  },
  {
    owner: 'pmndrs',
    name: 'toonify',
    version: '877d2b8b38c5b8d3b920b2bd89e2c8bb10a8c3ac79bc05517c05e692589d9a9a',
    description: 'Convert images into cartoon style',
    defaultParams: {
      image_resolution: 512,
    },
    category: ['image-to-image', 'style-transfer', 'cartoon']
  },

  // Upscaling Models
  {
    owner: 'nightmareai',
    name: 'real-esrgan',
    version: '42fed1c4974146d4d2414e2be2c5277c7fcf05fcc3a73abf41610695738c1d7b',
    description: 'High-quality image upscaling',
    defaultParams: {
      scale: 2,
      face_enhance: true,
    },
    category: ['image-to-image', 'upscaling']
  },

  // Background Removal/Manipulation
  {
    owner: 'ilkerc',
    name: 'rembg',
    version: 'fb8af171cfa1616ddcf1242c093f9c46bcada5ad4cf6f2fbe8b81b330ec5c003',
    description: 'Remove image backgrounds',
    defaultParams: {
      alpha_matting: true,
      alpha_matting_foreground_threshold: 240,
      alpha_matting_background_threshold: 10,
    },
    category: ['image-to-image', 'background-removal']
  },

  // Artistic Style Models
  {
    owner: 'cjwbw',
    name: 'anything-v3.0',
    version: '09a5805203f4c12da649ec1923bb7729517ca25fcac790e640eaa9ed66573b65',
    description: 'Versatile artistic style generation',
    defaultParams: {
      width: 512,
      height: 512,
      num_inference_steps: 28,
      guidance_scale: 9,
    },
    category: ['text-to-image', 'artistic']
  },
];

export const getModelsByCategory = (category: string): ModelPreset[] => {
  return MODEL_PRESETS.filter(model => model.category.includes(category));
};

export const getModelPreset = (owner: string, name: string): ModelPreset | undefined => {
  return MODEL_PRESETS.find(model => model.owner === owner && model.name === name);
};

export const getDefaultParamsForModel = (owner: string, name: string): Record<string, any> => {
  const preset = getModelPreset(owner, name);
  return preset?.defaultParams || {};
};
