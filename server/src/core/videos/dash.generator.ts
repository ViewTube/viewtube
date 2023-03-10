// Youtube MPEG-Dash Manifest generator
//
// Based on yt-dash-manifest-generator
// by https://github.com/GilgusMaximus
// https://www.npmjs.com/package/@freetube/yt-dash-manifest-generator

import { URL, URLSearchParams } from 'node:url';
import xml from 'xml-js';

export class DashGenerator {
  static generateDashFileFromFormats(videoFormats, videoLength) {
    const generatedJSON = this.generateJsonFromData(videoFormats, videoLength);
    return xml.json2xml(generatedJSON as unknown as string);
  }

  static generateAudioRepresentation(format) {
    const representation = {
      type: 'element',
      name: 'Representation',
      attributes: {
        id: format.itag,
        codecs: format.mimeType
          .split(' ')[1]
          .match(/"[^"]*/)[0]
          .substr(1),
        bandwidth: format.bitrate
      },
      elements: [
        {
          type: 'element',
          name: 'AudioChannelConfiguration',
          attributes: {
            schemeIdUri: 'urn:mpeg:dash:23003:3:audio_channel_configuration:2011',
            value: '2'
          }
        },
        {
          type: 'element',
          name: 'BaseURL',
          elements: [
            {
              type: 'text',
              text: format.url
            }
          ]
        },
        {
          type: 'element',
          name: 'SegmentBase',
          attributes: {
            indexRange: `${format.indexRange.start}-${format.indexRange.end}`
          },
          elements: [
            {
              type: 'element',
              name: 'Initialization',
              attributes: {
                range: `${format.initRange.start}-${format.initRange.end}`
              }
            }
          ]
        }
      ]
    };
    return representation;
  }

  static generateVideoRepresentation(format) {
    const representation = {
      type: 'element',
      name: 'Representation',
      attributes: {
        id: format.itag,
        codecs: format.mimeType
          .split(' ')[1]
          .match(/"[^"]*/)[0]
          .substr(1),
        bandwidth: format.bitrate,
        width: format.width,
        height: format.height,
        maxPlayoutRate: '1',
        frameRate: format.fps
      },
      elements: [
        {
          type: 'element',
          name: 'BaseURL',
          elements: [
            {
              type: 'text',
              text: format.url
            }
          ]
        },
        {
          type: 'element',
          name: 'SegmentBase',
          attributes: {
            indexRange: `${format.indexRange.start}-${format.indexRange.end}`
          },
          elements: [
            {
              type: 'element',
              name: 'Initialization',
              attributes: {
                range: `${format.initRange.start}-${format.initRange.end}`
              }
            }
          ]
        }
      ]
    };
    return representation;
  }

  static generateAdaptationSet(VideoFormatArray) {
    const adaptationSets = [];
    const mimeTypes = [];
    const mimeObjects = [[]];
    // sort the formats by mime types
    VideoFormatArray.forEach(videoFormat => {
      // the dual formats should not be used
      if (videoFormat.hasVideo && videoFormat.hasAudio) {
        return;
      }
      // if these properties are not available, then we skip it because we cannot set these properties
      if (
        !(
          Object.prototype.hasOwnProperty.call(videoFormat, 'initRange') &&
          Object.prototype.hasOwnProperty.call(videoFormat, 'indexRange')
        )
      ) {
        return;
      }
      const mimeType = videoFormat.mimeType.split(';')[0];
      if (mimeType === 'video/mp4' || mimeType === 'audio/mp4') {
        return;
      }
      const mimeTypeIndex = mimeTypes.indexOf(mimeType);
      if (mimeTypeIndex > -1) {
        mimeObjects[mimeTypeIndex].push(videoFormat);
      } else {
        mimeTypes.push(mimeType);
        mimeObjects.push([]);
        mimeObjects[mimeTypes.length - 1].push(videoFormat);
      }
    });
    // for each MimeType generate a new Adaptation set with Representations as sub elements
    for (let i = 0; i < mimeTypes.length; i++) {
      let isVideoFormat = false;
      const adapSet = {
        type: 'element',
        name: 'AdaptationSet',
        attributes: {
          id: i,
          mimeType: mimeTypes[i],
          startWithSAP: '1',
          subsegmentAlignment: 'true'
        },
        elements: []
      };
      if (mimeTypes[i].includes('video')) {
        (adapSet.attributes as any).scanType = 'progressive';
        isVideoFormat = true;
      }
      mimeObjects[i].forEach(format => {
        if (format.url) {
          const correctedUrl = format.url.replaceAll('&amp;', '&');
          const oldUrl = new URL(correctedUrl);

          const searchParams = new URLSearchParams();
          for (const [key, value] of oldUrl.searchParams) {
            searchParams.append(key, value);
          }
          searchParams.append('host', oldUrl.host);
          format.url = `/api/videoplayback?${searchParams.toString()}`;
        }

        if (isVideoFormat) {
          adapSet.elements.push(this.generateVideoRepresentation(format));
        } else {
          adapSet.elements.push(this.generateAudioRepresentation(format));
        }
      });
      adaptationSets.push(adapSet);
    }
    return adaptationSets;
  }

  static generateJsonFromData(videoFormatArray: Array<any>, videoLength: number) {
    const convertJSON = {
      declaration: {
        attributes: {
          version: '1.0',
          encoding: 'utf-8'
        }
      },
      elements: [
        {
          type: 'element',
          name: 'MPD',
          attributes: {
            xmlns: 'urn:mpeg:dash:schema:mpd:2011',
            profiles: 'urn:mpeg:dash:profile:full:2011',
            minBufferTime: 'PT1.5S',
            type: 'static',
            mediaPresentationDuration: `PT${videoLength}S`
          },
          elements: [
            {
              type: 'element',
              name: 'Period',
              elements: this.generateAdaptationSet(videoFormatArray)
            }
          ]
        }
      ]
    };
    return convertJSON;
  }
}
