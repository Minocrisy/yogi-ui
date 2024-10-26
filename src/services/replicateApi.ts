import axios, { AxiosError } from 'axios';

const API_KEY = import.meta.env.VITE_REPLICATE_API_KEY;
const BASE_URL = 'http://localhost:3001/api/replicate'; // Using local proxy server

if (!API_KEY) {
  console.error('VITE_REPLICATE_API_KEY is not set in .env file');
}

export interface ReplicateModel {
  url: string;
  owner: string;
  name: string;
  description: string;
  visibility: string;
  github_url?: string;
  paper_url?: string;
  license_url?: string;
  latest_version?: ModelVersion;
}

export interface ModelVersion {
  id: string;
  created_at: string;
  cog_version: string;
  openapi_schema: any;
}

export interface PredictionStatus {
  id: string;
  version: string;
  status: 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled';
  input: Record<string, any>;
  output: any;
  error: string | null;
  logs: string;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  urls: {
    get: string;
    cancel: string;
  };
  metrics: {
    predict_time: number;
  };
}

export interface PredictionResponse {
  predictions: PredictionStatus[];
  next?: string;
}

// Create axios instance with custom config
const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Increase timeout for long-running operations
  timeout: 300000, // 5 minutes
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // Don't log sensitive information in production
    console.log('Making request:', {
      url: config.url,
      method: config.method,
      headers: {
        ...config.headers,
        Authorization: config.headers.Authorization ? '[REDACTED]' : undefined,
      },
    });
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Response error:', {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
      });
    }
    return Promise.reject(error);
  }
);

const handleApiError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    console.error('API Error:', {
      status: axiosError.response?.status,
      statusText: axiosError.response?.statusText,
      data: axiosError.response?.data,
      headers: axiosError.response?.headers,
      config: {
        url: axiosError.config?.url,
        method: axiosError.config?.method,
        headers: axiosError.config?.headers,
      },
    });

    if (axiosError.response?.status === 401) {
      throw new Error('Invalid API key. Please check your REPLICATE_API_KEY.');
    } else if (axiosError.response?.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    } else if (axiosError.response?.data) {
      throw new Error(`API Error: ${JSON.stringify(axiosError.response.data)}`);
    }
  }
  throw error;
};

export const replicateApi = {
  // Get all available models
  getModels: async (query?: string): Promise<ReplicateModel[]> => {
    try {
      console.log('Fetching models with query:', query);
      const response = await api.get('/models', {
        params: query ? { query } : undefined
      });
      console.log('Models response:', response.data);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching models:', error);
      throw handleApiError(error);
    }
  },

  // Get specific model details
  getModel: async (owner: string, name: string): Promise<ReplicateModel> => {
    try {
      console.log('Fetching model details:', owner, name);
      const response = await api.get(`/models/${owner}/${name}`);
      console.log('Model details response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching model:', error);
      throw handleApiError(error);
    }
  },

  // Get model versions
  getModelVersions: async (owner: string, name: string): Promise<ModelVersion[]> => {
    try {
      console.log('Fetching model versions:', owner, name);
      const response = await api.get(`/models/${owner}/${name}/versions`);
      console.log('Model versions response:', response.data);
      return response.data.results;
    } catch (error) {
      console.error('Error fetching model versions:', error);
      throw handleApiError(error);
    }
  },

  // Get model schema
  getModelSchema: async (owner: string, name: string, version: string): Promise<ModelVersion> => {
    try {
      console.log('Fetching model schema:', owner, name, version);
      const response = await api.get(`/models/${owner}/${name}/versions/${version}`);
      console.log('Model schema response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching model schema:', error);
      throw handleApiError(error);
    }
  },

  // Run prediction
  runPrediction: async (owner: string, name: string, version: string, input: Record<string, any>): Promise<any> => {
    try {
      console.log('Running prediction:', { owner, name, version, input });
      const response = await api.post('/predictions', {
        version: `${owner}/${name}:${version}`,
        input,
      });
      console.log('Initial prediction response:', response.data);

      // Poll for completion
      let prediction = response.data;
      while (prediction.status !== 'succeeded' && prediction.status !== 'failed') {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const pollResponse = await api.get(`/predictions/${prediction.id}`);
        prediction = pollResponse.data;
        console.log('Prediction status:', prediction.status, 'Logs:', prediction.logs);
      }

      if (prediction.status === 'failed') {
        throw new Error(prediction.error || 'Prediction failed');
      }

      return prediction.output;
    } catch (error) {
      console.error('Error running prediction:', error);
      throw handleApiError(error);
    }
  },

  // Upload file
  uploadFile: async (file: File): Promise<string> => {
    try {
      console.log('Uploading file:', file.name);
      // Get upload URL
      const response = await api.post('/upload', {
        type: file.type,
      });

      const { upload_url, serving_url } = response.data;

      // Upload file
      await axios.put(upload_url, file, {
        headers: {
          'Content-Type': file.type,
        },
      });

      console.log('File uploaded successfully:', serving_url);
      return serving_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw handleApiError(error);
    }
  },

  // List predictions
  listPredictions: async (cursor?: string): Promise<PredictionResponse> => {
    try {
      console.log('Listing predictions, cursor:', cursor);
      const response = await api.get('/predictions', {
        params: cursor ? { cursor } : undefined
      });
      console.log('Predictions response:', response.data);
      return {
        predictions: response.data.results,
        next: response.data.next,
      };
    } catch (error) {
      console.error('Error listing predictions:', error);
      throw handleApiError(error);
    }
  },
};
