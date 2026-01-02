
export interface NewsScript {
  text: string;
  originalText: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING_SCRIPT = 'GENERATING_SCRIPT',
  GENERATING_AUDIO = 'GENERATING_AUDIO',
  PLAYING = 'PLAYING',
  ERROR = 'ERROR'
}

export interface AudioState {
  isPlaying: boolean;
  progress: number;
  duration: number;
}
