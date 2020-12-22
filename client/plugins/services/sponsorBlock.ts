import { sha256 } from 'js-sha256';
import axios from 'axios';
import { SponsorBlockSegmentsDto } from '@/plugins/shared';

export class SponsorBlock {
  constructor(videoId: string) {
    this._videoId = videoId;
  }

  private _videoId: string;
  private _apiUrl: string = 'https://sponsor.ajay.app/';

  public async getSkipSegments(): Promise<SponsorBlockSegmentsDto> {
    if (this._videoId) {
      const hash = sha256.create();
      hash.update(this._videoId);
      const encodedVideoId = hash.hex();
      const shortHash = encodedVideoId.substr(0, 4);

      try {
        const response = await axios.get(`${this._apiUrl}api/skipSegments/${shortHash}`);
        if (response.data) {
          const skipSections = response.data.find(el => el.videoID === this._videoId);
          if (skipSections) {
            return skipSections;
          }
        }
      } catch (_) {}
      return null;
    }
  }
}
