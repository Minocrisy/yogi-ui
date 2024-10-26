export interface Voice {
  voice_id: string;
  name: string;
  category: string;
  labels: Record<string, string>;
  description: string;
  preview_url: string;
  available_for_tiers: string[];
  settings: VoiceSettings;
  samples: VoiceSample[];
  sharing: {
    status: string;
    history_item_sample_id: string;
  };
}

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style: number;
  use_speaker_boost: boolean;
}

export interface VoiceSample {
  sample_id: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  hash: string;
}

export interface VoiceCloneRequest {
  name: string;
  files: File[];
  description?: string;
  labels?: Record<string, string>;
}

export interface HistoryItem {
  history_item_id: string;
  request_id: string;
  voice_id: string;
  voice_name: string;
  text: string;
  date_unix: number;
  character_count_change_from: number;
  character_count_change_to: number;
  content_type: string;
  state: 'created' | 'processing' | 'failed' | 'completed';
  settings: VoiceSettings;
}

export interface UserSubscription {
  tier: string;
  character_count: number;
  character_limit: number;
  can_extend_character_limit: boolean;
  allowed_to_extend_character_limit: boolean;
  next_character_count_reset_unix: number;
  voice_limit: number;
  professional_voice_limit: number;
  can_extend_voice_limit: boolean;
  can_use_instant_voice_cloning: boolean;
  can_use_professional_voice_cloning: boolean;
  currency: string;
  status: string;
}

export interface UserInfo {
  subscription: UserSubscription;
  is_new_user: boolean;
  xi_api_key: string;
  can_use_delayed_payment_methods: boolean;
}

export interface TextToSpeechRequest {
  text: string;
  voice_id: string;
  voice_settings?: VoiceSettings;
}

export interface HistoryResponse {
  history: HistoryItem[];
  has_more: boolean;
  last_history_item_id?: string;
}
