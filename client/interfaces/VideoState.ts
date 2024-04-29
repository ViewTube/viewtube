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

export interface AudioRepresentation extends Representation {}

export interface Track {
  id: string;
  active: boolean;
  codec: string;
}

export interface VideoTrack extends Track {
  representations: VideoRepresentation[];
}

export interface AudioTrack extends Track {
  language: string;
  representations: AudioRepresentation[];
}

export type Language = {
  language: string;
  label: string;
  active: boolean;
};
