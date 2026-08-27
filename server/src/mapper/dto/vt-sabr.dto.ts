/**
 * Mirrors googlevideo's `SabrFormat`. The client feeds these straight into
 * `SabrStreamingAdapter.setServerAbrFormats`, so field names are camelCase to match that
 * library rather than youtubei.js's snake_case source.
 */
export class VTSabrFormatDto {
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

/** Sent verbatim in the SABR request's `streamerContext.clientInfo`. */
export class VTSabrClientInfoDto {
  /** Numeric innertube client id — 1 for WEB. Not the client's name. */
  clientName: number;
  clientVersion: string;
  osName: string;
  osVersion: string;
  deviceMake?: string;
  deviceModel?: string;
}

export class VTSabrDto {
  /** SABR endpoint, host already rewritten to the videoplayback proxy. */
  streamingUrl: string;
  /** DASH manifest whose BaseURLs are `sabr://` pseudo-URLs, base64 data URI. */
  dashManifest: string;
  /** base64 `video_playback_ustreamer_config` from the player response. */
  ustreamerConfig: string;
  poToken?: string;
  formats: Array<VTSabrFormatDto>;
  clientInfo: VTSabrClientInfoDto;
}
