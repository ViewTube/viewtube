import type { EventListenerCallback, VideoplaybackAdapter } from './adapter';

export const shakaAdapter: VideoplaybackAdapter = async options => {
  const { source, startTime, videoRef } = options;
  const shaka = await import('shaka-player');

  shaka.polyfill.installAll();

  const browserSupported = shaka.Player.isBrowserSupported();
  if (!browserSupported) {
    throw new Error('Browser not supported');
  }

  const shakaPlayer = new shaka.Player();

  shakaPlayer.configure({
    preferredAudioLanguage: 'en'
  });

  const eventStorage = new Map<string, EventListenerCallback>();

  const registerCallback = (event: string) => (callback: EventListenerCallback) => {
    eventStorage.set(event, callback);
    shakaPlayer.addEventListener(event, callback);
  };

  const registerMultipleCallbacks = (events: string[]) => (callback: EventListenerCallback) => {
    events.forEach(event => {
      eventStorage.set(event, callback);
      shakaPlayer.addEventListener(event, callback);
    });
  };

  const registerNativeCallback =
    (event: keyof HTMLVideoElementEventMap) => (callback: EventListenerCallback) => {
      eventStorage.set(event, callback);
      videoRef.value.addEventListener(event, callback);
    };

  const unregisterCallback = (event: string) => {
    const callback = eventStorage.get(event);
    if (callback) {
      shakaPlayer.removeEventListener(event, callback);
    }
  };

  const unregisterMultipleCallbacks = (events: string[]) => {
    events.forEach(event => {
      const callback = eventStorage.get(event);
      if (callback) {
        shakaPlayer.removeEventListener(event, callback);
      }
    });
  };

  const unregisterNativeCallback = (event: string) => {
    const callback = eventStorage.get(event);
    if (callback) {
      videoRef.value.removeEventListener(event, callback);
    }
  };

  const onError = registerCallback('error');
  const onMessage = registerCallback('message');
  const onOpen = registerCallback('open');

  onError(error => {
    console.log('Shaka error', error);
  });

  onMessage(message => {
    console.log('Shaka message', message);
  });

  onOpen(e => {
    console.log('Shaka open', e);
  });

  // Register callbacks
  const onPlaybackStarted = registerNativeCallback('playing');
  const onPlaybackPaused = registerNativeCallback('pause');
  const onPlaybackTimeUpdated = registerNativeCallback('timeupdate');
  const onTextTracksAdded = registerCallback('textchanged');
  const onBufferLevelUpdated = registerMultipleCallbacks(['segmentappended', 'onstatechange']);
  const onCanPlay = registerNativeCallback('canplay');
  // https://nightly-dot-shaka-player-demo.appspot.com/docs/api/shaka.Player.html#.event:BufferingEvent
  const onWaiting = registerCallback('buffering');
  const onVolumeChanged = registerNativeCallback('volumechange');
  const onVariantChanged = registerCallback('variantchanged');
  const onPlaybackRateChanged = registerCallback('ratechange');
  const onQualityChanged = registerCallback('mediaqualitychanged');
  const onAdaptationChanged = registerCallback('adaptation');

  const onTrackChanged = (callback: EventListenerCallback) => {
    onQualityChanged(e => {
      console.log(e);
      // if (e.mediaType === 'video') {
      //   callback(e.newQuality);
      // }
    });

    onAdaptationChanged(e => {
      if (e.newTrack) {
        callback(e.newTrack.id);
      }
    });
  };

  const onLanguageChanged = (callback: EventListenerCallback) => {
    onVariantChanged(e => {
      callback(e.language);
    });
  };

  const onAudioQualityChanged = (callback: EventListenerCallback) => {
    onQualityChanged(e => {
      console.log(e);

      if (e.mediaType === 'audio') {
        callback(e);
      }
    });
  };

  await shakaPlayer.attach(videoRef.value);

  const destroy = () => {
    unregisterNativeCallback('playing');
    unregisterNativeCallback('pause');
    unregisterNativeCallback('timeupdate');
    unregisterCallback('textchanged');
    unregisterMultipleCallbacks(['segmentappended', 'onstatechange']);
    unregisterNativeCallback('canplay');
    unregisterCallback('buffering');
    unregisterNativeCallback('volumechange');
    unregisterCallback('ratechange');
    unregisterCallback('mediaqualitychanged');

    shakaPlayer.destroy();
  };

  // Getters
  const getBufferLevel = () => {
    let bufferLevel = 0;
    const bufferedInfo = shakaPlayer.getBufferedInfo();
    if (bufferedInfo) {
      bufferLevel = bufferedInfo.total.sort((a, b) => a.end - b.end).reverse()[0].end;
    }
    return bufferLevel;
  };

  const getTrackList = () => {
    const groupedTrackList = [];

    shakaPlayer
      .getVariantTracks()
      .map(track => ({
        ...track,
        label: `${track.videoCodec} ${track.audioCodec} ${track.height}p - ${humanizeBitrate(track.videoBandwidth)} | ${humanizeBitrate(track.audioBandwidth)} ${track.hdr === 'PQ' ? 'HDR' : ''} ${track.language}`
      }))
      .sort((a, b) => {
        const videoCodecA = a.videoCodec.split('.')[0];
        const videoCodecB = b.videoCodec.split('.')[0];

        const audioCodecA = a.audioCodec.split('.')[0];
        const audioCodecB = b.audioCodec.split('.')[0];

        return (
          videoCodecA.localeCompare(videoCodecB) ||
          audioCodecA.localeCompare(audioCodecB) ||
          a.height - b.height ||
          a.videoBandwidth - b.videoBandwidth ||
          a.audioBandwidth - b.audioBandwidth
        );
      })
      .forEach(track => {
        const language = track.language;

        if (!groupedTrackList[language]) {
          groupedTrackList[language] = [];
        }

        groupedTrackList[language].push(track);
      });

    return groupedTrackList;
  };

  const getAudioQualityList = () => {
    return shakaPlayer.getVariantTracks().map(track => ({
      ...track,
      label: `${track.height}p - ${humanizeBitrate(track.bandwidth)}`
    }));
  };

  const getVideoTrackList = () => {
    return shakaPlayer.getImageTracks().map(track => {
      return {
        ...track,
        label: track.label
      };
    });
  };

  const getAudioTrackList = () => {
    return shakaPlayer.getVariantTracks().map(track => {
      return {
        ...track,
        label: track.label ?? track.language
      };
    });
  };

  const getLanguageList = () => {
    return shakaPlayer.getAudioLanguages();
  };

  const getTime = () => videoRef.value?.currentTime ?? 0;
  const getDuration = () => videoRef.value?.duration ?? 0;
  const getVolume = () => videoRef.value?.volume ?? 1;
  const getPlaybackRate = shakaPlayer.getPlaybackRate;

  // Setters
  const setVolume = (volume: number) => {
    if (videoRef.value) {
      videoRef.value.volume = volume;
    }
  };
  const setTime = (time: number) => {
    if (videoRef.value) {
      videoRef.value.currentTime = time;
    }
  };
  const setPlaybackRate = (rate: number) => {
    if (videoRef.value) {
      videoRef.value.playbackRate = rate;
    }
  };
  const play = () => {
    videoRef.value?.play();
  };
  const pause = () => {
    videoRef.value?.pause();
  };

  // Initialize player
  watch(source, (newValue, oldValue) => {
    if (newValue !== oldValue) {
      const startTimeNumber = startTime?.value ?? 0;
      shakaPlayer.load(source.value, startTimeNumber);
    }
  });
  const startTimeNumber = startTime?.value ?? 0;
  shakaPlayer.load(source.value, startTimeNumber);

  return {
    type: 'dash',

    onPlaybackStarted,
    onPlaybackPaused,
    onPlaybackTimeUpdated,
    onTextTracksAdded,
    onBufferLevelUpdated,
    onPlaybackRateChanged,
    onCanPlay,
    onWaiting,
    onVolumeChanged,
    onTrackChanged,
    onLanguageChanged,
    onAudioQualityChanged,

    getTime,
    getDuration,
    getBufferLevel,
    getPlaybackRate,
    getTrackList,
    getAudioQualityList,
    getVideoTrackList,
    getAudioTrackList,
    getLanguageList,

    getVolume,
    setVolume,
    setTime,
    setPlaybackRate,
    play,
    pause,
    destroy
  };
};
