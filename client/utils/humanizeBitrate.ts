export const humanizeBitrate = (bitrate: number) => {
  if (bitrate < 1000) {
    return `${bitrate} bps`;
  }
  if (bitrate < 1000000) {
    return `${Math.round(bitrate / 1000)} kbps`;
  }
  return `${Math.round(bitrate / 1000000)} mbps`;
};
