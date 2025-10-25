export interface VideoAnalysisConfig {
  ollama: {
    baseUrl: string;
    whisperModel: string;
    analysisModel: string;
    timeout: number;
  };
  ffmpeg: {
    audioFormat: string;
    sampleRate: string;
    channels: string;
    codec: string;
  };
  analysis: {
    maxLearningObjectives: number;
    maxRequirements: number;
    temperature: number;
    maxTokens: number;
  };
}

export const defaultVideoAnalysisConfig: VideoAnalysisConfig = {
  ollama: {
    baseUrl: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
    whisperModel: process.env.OLLAMA_WHISPER_MODEL || 'whisper',
    analysisModel: process.env.OLLAMA_ANALYSIS_MODEL || 'llama3',
    timeout: parseInt(process.env.OLLAMA_TIMEOUT || '60000'),
  },
  ffmpeg: {
    audioFormat: 'wav',
    sampleRate: '16000',
    channels: '1',
    codec: 'pcm_s16le',
  },
  analysis: {
    maxLearningObjectives: 5,
    maxRequirements: 4,
    temperature: 0.3,
    maxTokens: 500,
  },
}; 