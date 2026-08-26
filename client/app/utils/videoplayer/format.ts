/**
 * Both current adapters map 3840 to 2560 rather than 2160. That is wrong, but it is
 * what ships today, so it is preserved here to keep this extraction behaviour-neutral.
 * Fixing it is a visible label change and belongs in its own commit.
 */
const HEIGHT_BY_WIDTH: Record<number, number> = {
  3840: 2560,
  2560: 1440,
  1920: 1080,
  1280: 720,
  854: 480,
  640: 360,
  426: 240,
  256: 144
};

export const normalizeHeight = (width: number, height: number): number =>
  HEIGHT_BY_WIDTH[width] ?? height;

/** Output preserved verbatim from the former utils/humanizeBitrate.ts. */
export const humanizeBitrate = (bitrate: number): string => {
  if (bitrate < 1000) {
    return `${bitrate} bps`;
  }
  if (bitrate < 1000000) {
    return `${Math.round(bitrate / 1000)} kbps`;
  }
  return `${Math.round(bitrate / 1000000)} mbps`;
};

export const formatVideoQualityLabel = (opts: {
  width: number;
  height: number;
  frameRate: number;
  bitrate: number;
}): string => {
  const height = normalizeHeight(opts.width, opts.height);
  const frameRateLabel = opts.frameRate > 30 ? opts.frameRate : '';
  return `${height}p${frameRateLabel} · ${humanizeBitrate(opts.bitrate)}`;
};
