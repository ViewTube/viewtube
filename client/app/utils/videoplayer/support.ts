export const isHlsSupportedNatively = () => {
  const video = document.createElement('video');

  return !!(
    video.canPlayType('application/x-mpegURL') || video.canPlayType('application/vnd.apple.mpegurl')
  );
};
