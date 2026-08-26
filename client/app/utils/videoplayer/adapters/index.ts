import type { AdapterContext, PlayerAdapter, PlayerSource } from '../types';
import { createDashAdapter } from './dashAdapter';
import { createHlsAdapter } from './hlsAdapter';
import { createNativeAdapter } from './nativeAdapter';
import { createNoopAdapter } from './noopAdapter';

export const createAdapter = (
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
    case 'sabr':
      // Lands with SABR_PLAN.md phase 3; nothing produces a sabr source yet.
      return createNoopAdapter(ctx);
    case 'none':
      return createNoopAdapter(ctx);
  }
};
