import type { BitrateInfo, MediaType } from 'dashjs';

export type EventListenerCallback<E = any> = (e: E) => void;

export class QualityInfo implements BitrateInfo {
  mediaType: MediaType;
  bitrate: number;
  width: number;
  height: number;
  scanType: string;
  qualityIndex: number;
  label: string;
}

export interface VideoplaybackAdapterResponse {
  type: 'dash' | 'hls' | 'native';

  onPlaybackStarted: (callback: EventListenerCallback) => void;
  onPlaybackPaused: (callback: EventListenerCallback) => void;
  onPlaybackTimeUpdated: (callback: EventListenerCallback) => void;
  onTextTracksAdded: (callback: EventListenerCallback) => void;
  onBufferLevelUpdated: (callback: EventListenerCallback) => void;
  onCanPlay: (callback: EventListenerCallback) => void;
  onWaiting: (callback: EventListenerCallback) => void;
  onVolumeChanged: (callback: EventListenerCallback) => void;
  onPlaybackRateChanged: (callback: EventListenerCallback) => void;
  onTrackChanged: (callback: EventListenerCallback) => void;
  onLanguageChanged: (callback: EventListenerCallback) => void;
  onAudioQualityChanged: (callback: EventListenerCallback) => void;

  getTime: () => number;
  getDuration: () => number;
  getBufferLevel: () => number;
  getVolume: () => number;
  getPlaybackRate: () => number;
  getTrackList: () => any[];
  getAudioQualityList: () => any[];
  getVideoTrackList: () => (any & { label?: string })[];
  getAudioTrackList: () => (any & { label?: string })[];
  getLanguageList: () => (any & { label?: string })[];

  setVolume: (volume: number) => void;
  setTime: (time: number) => void;
  setPlaybackRate: (rate: number) => void;
  play: () => void;
  pause: () => void;

  destroy: () => void;
}

export type VideoplaybackAdapterOptions = {
  videoRef: Ref<HTMLVideoElement>;
  source: Ref<string>;
  startTime?: Ref<number>;
};

export type VideoplaybackAdapter = (
  options: VideoplaybackAdapterOptions
) => Promise<VideoplaybackAdapterResponse>;

export type VideoplaybackAdapterType = 'dash' | 'hls' | 'native';
