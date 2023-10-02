export type EventListenerCallback = (e: any) => void;

export interface VideoplaybackAdapterResponse {
  onPlaybackStarted: (callback: EventListenerCallback) => void;
  onPlaybackPaused: (callback: EventListenerCallback) => void;
  onPlaybackTimeUpdated: (callback: EventListenerCallback) => void;
  onStreamActivated: (callback: EventListenerCallback) => void;
  onStreamDeactivated: (callback: EventListenerCallback) => void;
  onStreamTeardownComplete: (callback: EventListenerCallback) => void;
  onTextTracksAdded: (callback: EventListenerCallback) => void;
  onBufferLevelUpdated: (callback: EventListenerCallback) => void;
}

export type VideoplaybackAdapterOptions = {
  videoRef: Ref<HTMLVideoElement>;
  source: Ref<string>;
  startTime: Ref<string>;
};

export type VideoplaybackAdapter = (
  options: VideoplaybackAdapterOptions
) => Promise<VideoplaybackAdapterResponse>;
