import type { Language, VideoTrack } from '~/interfaces/VideoState';
import { formatVideoQualityLabel } from './format';

/**
 * Normalised shapes every adapter converts its own library's track types into, so the
 * mappers below stay library-agnostic and testable without a DOM.
 */
export interface EngineVideoRepresentation {
  id: string;
  /** Overrides the derived label. The SABR adapter names resolution tiers itself. */
  label?: string;
  bitrate: number;
  codec: string;
  width: number;
  height: number;
  frameRate: number;
  hdr: boolean;
  hdrType?: string;
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
      label: rep.label ?? formatVideoQualityLabel(rep),
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
