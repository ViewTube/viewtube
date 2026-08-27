export interface Representation {
  id: string;
  bitrate: number;
  codec: string;
  active: boolean;
  label: string;
}

export interface VideoRepresentation extends Representation {
  width: number;
  height: number;
  frameRate: number;
  hdr: boolean;
  hdrType?: string;
}

export interface Track {
  id: string;
  active: boolean;
  codec: string;
}

export interface VideoTrack extends Track {
  representations: VideoRepresentation[];
}

export type Language = {
  language: string;
  label: string;
  active: boolean;
};
