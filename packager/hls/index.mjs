import fs from 'node:fs/promises';
import videoJson from './wTuOasmssE0.json' with { type: 'json' };

const videoFormats = videoJson.video_sets;
const audioFormats = videoJson.audio_sets;

const formats = {
  videoFormats,
  audioFormats
};

fs.writeFile('formats.json', JSON.stringify(formats, null, 2));
