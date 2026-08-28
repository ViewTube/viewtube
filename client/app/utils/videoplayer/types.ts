import type { Language, VideoTrack } from '~/interfaces/VideoState';
import type { MessageType } from '~/types/MessageType';

/** Mirrors `VTSabrDto`; fed straight into googlevideo's streaming adapter. */
export interface SabrSource {
  /** SABR endpoint, host already rewritten to the videoplayback proxy. */
  streamingUrl: string;
  formats: Array<SabrFormatLike>;
  ustreamerConfig: string;
  /**
   * PO token bound to this video, minted server-side. Absent when attestation is
   * unavailable or disabled, in which case requests go out without one.
   */
  poToken?: string;
  clientInfo: {
    clientName: number;
    clientVersion: string;
    osName: string;
    osVersion: string;
    deviceMake?: string;
    deviceModel?: string;
  };
}

/** The subset of googlevideo's SabrFormat the server fills in. */
export interface SabrFormatLike {
  itag: number;
  lastModified: string;
  bitrate: number;
  approxDurationMs: number;
  xtags?: string;
  width?: number;
  height?: number;
  contentLength?: number;
  audioTrackId?: string;
  mimeType?: string;
  isDrc?: boolean;
  isVb?: boolean;
  quality?: string;
  qualityLabel?: string;
  averageBitrate?: number;
  audioQuality?: string;
  language?: string;
  isDubbed?: boolean;
  isAutoDubbed?: boolean;
  isDescriptive?: boolean;
  isSecondary?: boolean;
  isOriginal?: boolean;
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
  languageList: Language[];
  selectedLanguage: string;
  automaticVideoQuality: boolean;
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
  /**
   * Fetches a fresh source for the video already playing, without changing which video is
   * playing. Only the SABR adapter uses it, to answer YouTube's reload request in place —
   * returning null means "nothing newer available, keep the current session".
   */
  refreshSource?: () => Promise<PlayerSource | null>;
}
