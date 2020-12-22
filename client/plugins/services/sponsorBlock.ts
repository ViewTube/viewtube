import { sha256 } from 'js-sha256';
import axios from 'axios';

export class SponsorBlock {
  constructor(videoId: string) {
    this._videoId = videoId;
  }

  private _videoId: string;
  private _apiUrl: string = 'https://sponsor.ajay.app/';

  public getSkipSegments() {
    if (this._videoId) {
      const hash = sha256.create();
      hash.update(this._videoId);
      const encodedVideoId = hash.hex();
      const shortHash = encodedVideoId.substr(0, 4);

      return axios
        .get(`${this._apiUrl}api/skipSegments/${shortHash}`)
        .then((response: any) => {
          if (response.data) {
            const skipSections = response.data.find(el => el.videoID === this._videoId);
            console.log(skipSections);
          }
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}
