export type MediaType = 'image' | 'video';

export type PromptStyle = 
  | 'veo_cinematic'
  | 'flux_midjourney'
  | 'detailed_transcription'
  | 'creative_director';

export interface PromptAnalysis {
  masterPrompt: string;
  negativePrompt?: string;
  subjectDescription: string;
  actionAndMotion?: string;
  cameraAndLighting: string;
  styleAndAesthetics: string;
  keyElements?: string[];
  timelineSegments?: {
    time: string;
    description: string;
    promptTag: string;
  }[];
  modelUsed: string;
}

export interface AnalyzeMediaRequest {
  mediaType: MediaType;
  data: string; // base64 data without data:prefix
  mimeType: string;
  promptStyle: PromptStyle;
  language: 'en' | 'km';
  aspectRatioPreference?: '16:9' | '9:16';
}

export interface AnalyzeMediaResponse {
  success: boolean;
  analysis?: PromptAnalysis;
  error?: string;
  modelUsed?: string;
  warning?: string;
}

export interface VideoGenRequest {
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  imageBytes?: string;
  mimeType?: string;
}

export interface VideoGenResponse {
  success: boolean;
  operationName?: string;
  error?: string;
}

export interface VideoStatusResponse {
  done: boolean;
  error?: string;
  uri?: string;
}
