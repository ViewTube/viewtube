/**
 * Quality labels come from the width, not the reported height: YouTube gives a
 * non-16:9 video its true height (a 1920-wide cinematic crop is 804 tall), which would
 * label it "804p". Widths are stable, so they name the tier instead.
 *
 * Unknown widths fall through to the reported height, which is why only the standard
 * ladder is listed.
 */
const HEIGHT_BY_WIDTH: Record<number, number> = {
  7680: 4320,
  3840: 2160,
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
