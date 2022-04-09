import { sha256 } from 'js-sha256';
import axios from 'axios';
import { SponsorBlockSegmentDto, SponsorBlockSegmentsDto } from '@/plugins/shared';

export class SponsorBlock {
  constructor(videoId: string) {
    this._videoId = videoId;
  }

  private _videoId: string;
  private _apiUrl: string = 'https://sponsor.ajay.app/';
  private _skipSegments: SponsorBlockSegmentsDto = null;

  public getCurrentSegment(time: number): SponsorBlockSegmentDto {
    const segments = this._skipSegments;
    if (segments && !isNaN(time)) {
      let i = 0;
      const len = segments.segments.length;
      while (i < len) {
        const currentSegment = segments.segments[i];
        if (currentSegment.segment[0] <= time && currentSegment.segment[1] > time) {
          return currentSegment;
        }
        i++;
      }
    }
    return null;
  }

  public async getSkipSegments(): Promise<SponsorBlockSegmentsDto> {
    if (this._videoId) {
      const hash = sha256.create();
      hash.update(this._videoId);
      const encodedVideoId = hash.hex();
      const shortHash = encodedVideoId.substr(0, 4);
      try {
        const response = await axios.get<Array<SponsorBlockSegmentsDto>>(
          `${this._apiUrl}api/skipSegments/${shortHash}?categories=["sponsor", "intro", "outro", "interaction", "selfpromo", "music_offtopic", "preview"]`
        );
        if (response.data) {
          const skipSections = response.data.find(el=> el.videoID === this._videoId);
          if (skipSections) {
            this._skipSegments = skipSections;
            return skipSections;
          }
        }
      } catch (_) {}
      return null;
    }
  }
}
