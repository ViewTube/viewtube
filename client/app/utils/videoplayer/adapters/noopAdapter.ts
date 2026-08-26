import type { AdapterContext, PlayerAdapter } from '../types';

/**
 * Stands in when there is nothing playable. The error is set by videoState from the
 * source's `reason`, so this only has to avoid doing anything.
 */
export const createNoopAdapter = async (_ctx: AdapterContext): Promise<PlayerAdapter> => ({
  async load() {},
  play: () => {},
  pause: () => {},
  stop: () => {},
  seekTo: () => {},
  setVolume: () => {},
  setMuted: () => {},
  setPlaybackRate: () => {},
  setLanguage: () => {},
  setVideoQuality: () => {},
  setAudioQuality: () => {},
  destroy: () => {}
});
