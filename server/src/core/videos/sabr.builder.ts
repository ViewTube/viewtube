import { Logger } from '@nestjs/common';
import { VTSabrDto, VTSabrFormatDto } from 'server/mapper/dto/vt-sabr.dto';
import type { Innertube } from 'youtubei.js';
import { Constants } from 'youtubei.js';

type VideoInfo = Awaited<ReturnType<Innertube['getInfo']>>;

const logger = new Logger('SabrBuilder');

/**
 * Builds the SABR block the client needs to drive playback itself.
 *
 * YouTube no longer puts segment URLs in `adaptive_formats` for VOD — only a
 * `server_abr_streaming_url` that expects a protobuf POST per segment. The DASH manifest
 * generated here carries `sabr://` pseudo-URLs instead of real ones, which the client's
 * SABR adapter intercepts and turns into those POSTs.
 *
 * Returns null when the video has no SABR endpoint, so callers fall back to the legacy
 * DASH path.
 */
export const buildSabrBlock = async (
  videoInfo: VideoInfo,
  client: Innertube
): Promise<VTSabrDto | null> => {
  const streamingData = videoInfo.streaming_data;
  const rawStreamingUrl = streamingData?.server_abr_streaming_url;
  const ustreamerConfig =
    videoInfo.player_config?.media_common_config?.media_ustreamer_request_config
      ?.video_playback_ustreamer_config;

  if (!rawStreamingUrl || !ustreamerConfig) return null;

  // The ABR endpoint carries a scrambled `n` parameter like any other playback URL.
  // Deciphering needs the JS evaluator installed in common/innertube; if that is missing
  // this throws and YouTube rejects the resulting URL, so the failure is logged rather
  // than swallowed.
  let streamingUrl = rawStreamingUrl;
  try {
    streamingUrl = await client.session.player.decipher(rawStreamingUrl);
  } catch (error) {
    logger.warn(`Could not decipher the SABR streaming URL: ${error?.message ?? error}`);
  }

  // `is_sabr` has to go in `manifest_options`: DashOptions declares it at the top level
  // but MediaInfo.toDash only forwards `manifest_options` to the generator, so a
  // top-level flag is silently dropped and the call then fails deciphering URLs that no
  // longer exist.
  const dashManifest = await videoInfo.toDash({
    url_transformer: (url: URL) => {
      url.searchParams.append('__host', url.host);
      return url;
    },
    manifest_options: { is_sabr: true }
  });

  return {
    streamingUrl,
    dashManifest,
    ustreamerConfig,
    poToken: client.session.po_token,
    formats: (streamingData.adaptive_formats ?? []).map(toSabrFormat),
    clientInfo: {
      clientName: Number(Constants.CLIENT_NAME_IDS[client.session.client_name]),
      clientVersion: client.session.client_version,
      osName: client.session.context.client.osName,
      osVersion: client.session.context.client.osVersion,
      deviceMake: client.session.context.client.deviceMake,
      deviceModel: client.session.context.client.deviceModel
    }
  };
};

const toSabrFormat = (format: any): VTSabrFormatDto => ({
  itag: format.itag,
  lastModified: String(format.last_modified_ms ?? format.last_modified ?? ''),
  bitrate: format.bitrate,
  approxDurationMs: Number(format.approx_duration_ms ?? 0),
  xtags: format.xtags,
  width: format.width,
  height: format.height,
  contentLength: format.content_length ? Number(format.content_length) : undefined,
  audioTrackId: format.audio_track?.id,
  mimeType: format.mime_type,
  isDrc: format.is_drc,
  isVb: format.is_vb,
  quality: format.quality,
  qualityLabel: format.quality_label,
  averageBitrate: format.average_bitrate,
  audioQuality: format.audio_quality,
  language: format.language ?? undefined,
  isDubbed: format.is_dubbed,
  isAutoDubbed: format.is_auto_dubbed,
  isDescriptive: format.is_descriptive,
  isSecondary: format.is_secondary,
  isOriginal: format.is_original
});
