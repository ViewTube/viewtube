import { EventListenerCallback, VideoplaybackAdapter } from './adapter';

export const dashAdapter: VideoplaybackAdapter = async options => {
  const { source, startTime, videoRef } = options;
  const dashjs = await import('dashjs');
  const mediaPlayer = dashjs.MediaPlayer().create();

  const eventStorage = new Map<string, EventListenerCallback>();

  const registerCallback = (event: string) => (callback: EventListenerCallback) => {
    eventStorage.set(event, callback);
    mediaPlayer.on(event, callback);
  };

  const unregisterCallback = (event: string) => {
    const callback = eventStorage.get(event);
    if (callback) {
      mediaPlayer.off(event, callback);
    }
  };

  // Register callbacks
  const onPlaybackStarted = registerCallback(dashjs.MediaPlayer.events.PLAYBACK_STARTED);
  const onPlaybackPaused = registerCallback(dashjs.MediaPlayer.events.PLAYBACK_PAUSED);
  const onPlaybackTimeUpdated = registerCallback(dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED);
  const onStreamActivated = registerCallback(dashjs.MediaPlayer.events.STREAM_ACTIVATED);
  const onStreamDeactivated = registerCallback(dashjs.MediaPlayer.events.STREAM_DEACTIVATED);
  const onStreamTeardownComplete = registerCallback(
    dashjs.MediaPlayer.events.STREAM_TEARDOWN_COMPLETE
  );
  const onTextTracksAdded = registerCallback(dashjs.MediaPlayer.events.TEXT_TRACKS_ADDED);
  const onBufferLevelUpdated = registerCallback(dashjs.MediaPlayer.events.BUFFER_LEVEL_UPDATED);
  const onCanPlay = registerCallback(dashjs.MediaPlayer.events.CAN_PLAY);
  const onWaiting = registerCallback(dashjs.MediaPlayer.events.PLAYBACK_WAITING);
  const onVolumeChanged = registerCallback(dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED);
  const onPlaybackRateChanged = registerCallback(dashjs.MediaPlayer.events.PLAYBACK_RATE_CHANGED);

  const destroy = () => {
    unregisterCallback(dashjs.MediaPlayer.events.PLAYBACK_STARTED);
    unregisterCallback(dashjs.MediaPlayer.events.PLAYBACK_PAUSED);
    unregisterCallback(dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED);
    unregisterCallback(dashjs.MediaPlayer.events.STREAM_ACTIVATED);
    unregisterCallback(dashjs.MediaPlayer.events.STREAM_DEACTIVATED);
    unregisterCallback(dashjs.MediaPlayer.events.STREAM_TEARDOWN_COMPLETE);
    unregisterCallback(dashjs.MediaPlayer.events.TEXT_TRACKS_ADDED);
    unregisterCallback(dashjs.MediaPlayer.events.BUFFER_LEVEL_UPDATED);
    unregisterCallback(dashjs.MediaPlayer.events.CAN_PLAY);
    unregisterCallback(dashjs.MediaPlayer.events.PLAYBACK_WAITING);
    unregisterCallback(dashjs.MediaPlayer.events.PLAYBACK_VOLUME_CHANGED);
    unregisterCallback(dashjs.MediaPlayer.events.PLAYBACK_RATE_CHANGED);

    

    mediaPlayer.destroy();
  };

  // Getters
  const getBufferLevel = () => {
    let bufferLevel = 0;
    if (typeof mediaPlayer.getDashMetrics === 'function') {
      const dashMetrics = mediaPlayer.getDashMetrics();
      if (dashMetrics) {
        bufferLevel = dashMetrics.getCurrentBufferLevel('video');
        if (!bufferLevel) {
          bufferLevel = dashMetrics.getCurrentBufferLevel('audio');
        }
      }
    }
    return bufferLevel;
  };
  const getVideoQualityList = () => {
    return mediaPlayer.getBitrateInfoListFor('video').map(bitrateInfo => ({
      ...bitrateInfo,
      label: `${bitrateInfo.height}p - ${humanizeBitrate(bitrateInfo.bitrate)}`
    }));
  };
  const getAudioQualityList = () => {
    return mediaPlayer.getBitrateInfoListFor('audio').map(bitrateInfo => ({
      ...bitrateInfo,
      label: `${bitrateInfo.height}p - ${humanizeBitrate(bitrateInfo.bitrate)}`
    }));
  };
  const getVideoTrackList = () => {
    return mediaPlayer.getTracksFor('video');
  };
  const getAudioTrackList = () => {
    return mediaPlayer.getTracksFor('audio').map(audioTrack => {
      return {
        ...audioTrack,
        label: audioTrack.labels?.[0]?.text ?? audioTrack.lang
      };
    });
  };
  const getTime = mediaPlayer.time;
  const getDuration = mediaPlayer.duration;
  const getVolume = mediaPlayer.getVolume;
  const getPlaybackRate = mediaPlayer.getPlaybackRate;

  // Setters
  const setVolume = (volume: number) => {
    mediaPlayer.setVolume(volume);
  };
  const setTime = (time: number) => {
    mediaPlayer.seek(time);
  };
  const setPlaybackRate = (rate: number) => {
    mediaPlayer.setPlaybackRate(rate);
  };
  const play = () => {
    mediaPlayer.play();
  };
  const pause = () => {
    mediaPlayer.pause();
  };

  // Initialize player
  watch(source, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      const startTimeNumber = startTime?.value ?? 0;
      mediaPlayer.initialize(videoRef.value, source.value, false, startTimeNumber);
    }
  });
  const startTimeNumber = startTime?.value ?? 0;
  mediaPlayer.initialize(videoRef.value, source.value, false, startTimeNumber);

  return {
    type: 'dash',

    onPlaybackStarted,
    onPlaybackPaused,
    onPlaybackTimeUpdated,
    onStreamActivated,
    onStreamDeactivated,
    onStreamTeardownComplete,
    onTextTracksAdded,
    onBufferLevelUpdated,
    onPlaybackRateChanged,
    onCanPlay,
    onWaiting,
    onVolumeChanged,

    getTime,
    getDuration,
    getBufferLevel,
    getPlaybackRate,
    getVideoQualityList,
    getAudioQualityList,
    getVideoTrackList,
    getAudioTrackList,

    getVolume,
    setVolume,
    setTime,
    setPlaybackRate,
    play,
    pause,
    destroy
  };
};
