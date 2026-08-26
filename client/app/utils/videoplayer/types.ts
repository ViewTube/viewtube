import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';
import type { MessageType } from '~/types/MessageType';

/**
 * What the SABR adapter needs from the server. The producer (`VTVideoInfoDto.sabr`)
 * arrives with SABR_PLAN.md phase 1; until then nothing constructs a `sabr` source.
 */
export interface SabrSource {
  streamingUrl: string;
  formats: unknown[];
  ustreamerConfig: string;
  poToken: string;
  clientInfo: {
    osName: string;
    osVersion: string;
    clientName: number;
    clientVersion: string;
  };
}

export type PlayerSource =
  | { kind: 'sabr'; manifest: string; sabr: SabrSource }
  | { kind: 'dash'; manifest: string }
  | { kind: 'hls'; url: string }
  | { kind: 'native'; url: string }
  | { kind: 'none'; reason: string };

export type PlayerSourceKind = PlayerSource['kind'];

/** `reason` value used for the source computed evaluated during SSR; never shown. */
export const SSR_SOURCE_REASON = '__SSR__';

export interface PlayerError {
  /** 'no-source' | 'autoplay-blocked' | 'live-ended' | 'element' | 'segment-load' | ... */
  code: string;
  message: string;
  /** fatal = playback can't continue; non-fatal = toast and retry */
  fatal: boolean;
}

export interface PlayerState {
  playing: boolean;
  buffering: boolean;
  /** Seconds buffered *ahead* of the playhead. See useElementState's contract. */
  bufferLevel: number;
  currentTime: number;
  /** Always finite. For live this is the live sync position, not Infinity. */
  duration: number;
  /**
   * Upper bound for seeking and for every progress-bar percentage.
   * Derived in `videoState.ts` from live/liveEdge/duration — adapters maintain the
   * three inputs and never write this field.
   */
  seekMax: number;
  volume: number;
  muted: boolean;
  loop: boolean;
  speed: number;
  /** Owned by the adapter: hls sets it from the playlist, dash/native/sabr set false. */
  live: boolean;
  /** Owned by the adapter. Seekable edge for live, null for VOD. */
  liveEdge: number | null;
  videoTracks: VideoTrack[];
  audioTracks: AudioTrack[];
  languageList: Language[];
  selectedLanguage: string;
  automaticVideoQuality: boolean;
  automaticAudioQuality: boolean;
  error: PlayerError | null;
}

export interface PlayerAdapter {
  load(source: PlayerSource, startTime: number): Promise<void>;
  play(): void;
  pause(): void;
  stop(): void;
  seekTo(time: number): void;
  setVolume(volume: number): void;
  setMuted(muted: boolean): void;
  setPlaybackRate(rate: number): void;
  setLanguage(language: string): void;
  setVideoQuality(trackId: string, representationId: string | null): void;
  setAudioQuality(trackId: string, representationId: string | null): void;
  destroy(): void;
}

export interface AdapterContext {
  videoElementRef: Ref<HTMLVideoElement>;
  /** The reactive PlayerState the adapter mutates. */
  state: PlayerState;
  defaultVolume: Ref<number>;
  loop: boolean;
  autoplay: boolean;
  maximumQuality: string | undefined;
  onEnded: () => void;
  createMessage: (message: Omit<MessageType, 'dismissed' | 'id'>) => void;
}
