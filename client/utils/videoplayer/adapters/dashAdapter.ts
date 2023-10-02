import {
  EventListenerCallback,
  VideoplaybackAdapter,
  VideoplaybackAdapterResponse
} from './adapter';

export const dashAdapter: VideoplaybackAdapter = async options => {
  const { source, startTime, videoRef } = options;
  const dashjs = await import('dashjs');
  const mediaPlayer = dashjs.MediaPlayer().create();

  const onPlaybackStarted = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.PLAYBACK_STARTED, callback);
  };

  const onPlaybackPaused = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.PLAYBACK_PAUSED, callback);
  };

  const onPlaybackTimeUpdated = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.PLAYBACK_TIME_UPDATED, callback);
  };

  const onStreamActivated = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.STREAM_ACTIVATED, callback);
  };

  const onStreamDeactivated = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.STREAM_DEACTIVATED, callback);
  };

  const onStreamTeardownComplete = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.STREAM_TEARDOWN_COMPLETE, callback);
  };

  const onTextTracksAdded = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.TEXT_TRACKS_ADDED, callback);
  };

  const onBufferLevelUpdated = (callback: EventListenerCallback) => {
    mediaPlayer.on(dashjs.MediaPlayer.events.BUFFER_LEVEL_UPDATED, callback);
  };

  watch(source, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      mediaPlayer.initialize(videoRef.value, source.value, false, startTime.value);
    }
  });

  mediaPlayer.initialize(videoRef.value, source.value, false, startTime.value);

  return {
    onPlaybackStarted,
    onPlaybackPaused,
    onPlaybackTimeUpdated,
    onStreamActivated,
    onStreamDeactivated,
    onStreamTeardownComplete,
    onTextTracksAdded,
    onBufferLevelUpdated
  };
};
