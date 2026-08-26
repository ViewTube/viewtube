import type { AudioTrack, Language, VideoTrack } from '~/interfaces/VideoState';
import { formatVideoQualityLabel, humanizeBitrate } from './format';

/**
 * Normalised shapes every adapter converts its own library's track types into, so the
 * mappers below stay library-agnostic and testable without a DOM.
 */
export interface EngineVideoRepresentation {
  id: string;
  bitrate: number;
  codec: string;
  width: number;
  height: number;
  frameRate: number;
  hdr: boolean;
  hdrType?: string;
}

export interface EngineAudioRepresentation {
  id: string;
  bitrate: number;
  codec: string;
}

export interface EngineVideoTrack {
  id: string;
  active: boolean;
  representations: EngineVideoRepresentation[];
}

export interface EngineAudioTrack {
  id: string;
  active: boolean;
  language: string;
  label: string;
  representations: EngineAudioRepresentation[];
}

const joinCodecs = (codecs: string[]): string => [...new Set(codecs)].join(', ');

export const mapVideoTracks = (
  tracks: EngineVideoTrack[],
  activeRepresentationId: string | null
): VideoTrack[] =>
  (tracks ?? []).map(track => ({
    id: track.id,
    active: track.active,
    codec: joinCodecs((track.representations ?? []).map(rep => rep.codec)),
    representations: (track.representations ?? []).map(rep => ({
      id: rep.id,
      label: formatVideoQualityLabel(rep),
      bitrate: rep.bitrate,
      codec: rep.codec,
      width: rep.width,
      height: rep.height,
      frameRate: rep.frameRate,
      active: activeRepresentationId === rep.id,
      hdr: rep.hdr,
      hdrType: rep.hdrType
    }))
  }));

/**
 * When several audio languages exist the quality list is restricted to the selected one,
 * otherwise every track is kept. The distinct-language count is derived from `tracks`
 * rather than read back from state, so the result never depends on mapping order.
 */
export const mapAudioTracks = (
  tracks: EngineAudioTrack[],
  activeRepresentationId: string | null,
  selectedLanguage: string
): AudioTrack[] => {
  const languageCount = new Set((tracks ?? []).map(track => track.language)).size;

  return (tracks ?? [])
    .filter(track => languageCount <= 1 || track.language === selectedLanguage)
    .map(track => ({
      id: track.id,
      active: track.active,
      language: track.language,
      codec: joinCodecs((track.representations ?? []).map(rep => rep.codec)),
      representations: (track.representations ?? []).map(rep => ({
        id: rep.id,
        label: humanizeBitrate(rep.bitrate),
        bitrate: rep.bitrate,
        codec: rep.codec,
        active: activeRepresentationId === rep.id
      }))
    }));
};

export const mapLanguageList = (tracks: EngineAudioTrack[]): Language[] =>
  (tracks ?? [])
    .map(track => ({
      language: track.language,
      label: track.label,
      active: track.active
    }))
    .sort((a, b) => a.language.localeCompare(b.language))
    .filter(
      (language, index, self) => self.findIndex(l => l.language === language.language) === index
    );
