import type { AdapterContext, PlayerAdapter, PlayerSource } from '../types';
import { createDashAdapter } from './dashAdapter';
import { createHlsAdapter } from './hlsAdapter';
import { createNativeAdapter } from './nativeAdapter';
import { createNoopAdapter } from './noopAdapter';

export const createAdapter = async (
  source: PlayerSource,
  ctx: AdapterContext
): Promise<PlayerAdapter> => {
  switch (source.kind) {
    case 'dash':
      return createDashAdapter(ctx);
    case 'hls':
      return createHlsAdapter(ctx);
    case 'native':
      return createNativeAdapter(ctx);
    case 'sabr': {
      // Imported lazily so shaka-player only loads for the videos that need it.
      const { createSabrAdapter } = await import('./sabrAdapter');
      return createSabrAdapter(ctx, source);
    }
    case 'none':
      return createNoopAdapter(ctx);
  }
};
