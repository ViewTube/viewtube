import type { BitrateInfo, MediaInfo } from 'dashjs';

export type EventListenerCallback = (e: any) => void;

export interface VideoplaybackAdapterResponse {
  type: 'dash' | 'hls' | 'native';

  onPlaybackStarted: (callback: EventListenerCallback) => void;
  onPlaybackPaused: (callback: EventListenerCallback) => void;
  onPlaybackTimeUpdated: (callback: EventListenerCallback) => void;
  onStreamActivated: (callback: EventListenerCallback) => void;
  onStreamDeactivated: (callback: EventListenerCallback) => void;
  onStreamTeardownComplete: (callback: EventListenerCallback) => void;
  onTextTracksAdded: (callback: EventListenerCallback) => void;
  onBufferLevelUpdated: (callback: EventListenerCallback) => void;
  onCanPlay: (callback: EventListenerCallback) => void;
  onWaiting: (callback: EventListenerCallback) => void;
  onVolumeChanged: (callback: EventListenerCallback) => void;
  onPlaybackRateChanged: (callback: EventListenerCallback) => void;

  getTime: () => number;
  getDuration: () => number;
  getBufferLevel: () => number;
  getVolume: () => number;
  getPlaybackRate: () => number;
  getVideoQualityList: () => BitrateInfo[];
  getAudioQualityList: () => BitrateInfo[];
  getVideoTrackList: () => (MediaInfo & { label?: string })[];
  getAudioTrackList: () => (MediaInfo & { label?: string })[];

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
