import type shaka from 'shaka-player';

export type EventListenerCallback<E = any> = (e: E) => void;
export type MediaType = 'video' | 'audio' | 'text' | 'image';

export class BitrateInfo {
  mediaType: MediaType;
  bitrate: number;
  width: number;
  height: number;
  scanType: string;
  qualityIndex: number;
}

export class QualityInfo implements BitrateInfo {
  mediaType: MediaType;
  bitrate: number;
  width: number;
  height: number;
  scanType: string;
  qualityIndex: number;
  label: string;
}

export type VideoplaybackAdapterOptions = {
  videoRef: Ref<HTMLVideoElement>;
  source: Ref<string>;
  startTime?: Ref<number>;
};

export type Language = {
  language: string;
  label: string;
  role: string;
};

export type LabelledTrack = shaka.extern.Track & {
  audioLabel: string;
  videoLabel: string;
};

export const shakaAdapter = async (options: VideoplaybackAdapterOptions) => {
  const { source, startTime, videoRef } = options;
  const shaka = await import('shaka-player');

  shaka.polyfill.installAll();

  const browserSupported = shaka.Player.isBrowserSupported();
  if (!browserSupported) {
    throw new Error('Browser not supported');
  }

  const shakaPlayer = new shaka.Player();

  shakaPlayer.configure({
    preferredAudioLanguage: 'en',
    streaming: {
      retryParameters: {
        maxAttempts: Infinity,
        baseDelay: 500,
        timeout: 30000
      },
      bufferingGoal: 30
    },
    manifest: {
      dash: {
        ignoreMinBufferTime: true
      }
    }
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
  const onAutomaticQualityChanged = registerCallback('abrstatuschanged');
  const onTracksChanged = registerCallback('trackschanged');

  const onLanguageChanged = (callback: EventListenerCallback) => {
    onVariantChanged(e => {
      callback(e.newTrack.language);
    });
    onAdaptationChanged(e => {
      if (e.newTrack) {
        callback(e.newTrack.language);
      }
    });
  };

  const onAudioQualityChanged = (callback: EventListenerCallback) => {
    onQualityChanged(e => {
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
    unregisterCallback('abrstatuschanged');

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

  const getTrackList = (): Record<string, LabelledTrack[]> => {
    const groupedTrackList = {};

    shakaPlayer
      .getVariantTracks()
      .map(track => {
        const hdrLabel = track.hdr === 'PQ' || track.hdr === 'HLG' ? 'HDR' : '';
        const frameRateLabel = track.frameRate > 30 ? track.frameRate : '';
        return {
          ...track,
          videoLabel: `${track.height}p${frameRateLabel} · ${humanizeBitrate(track.videoBandwidth)} ${hdrLabel}`,
          audioLabel: humanizeBitrate(track.audioBandwidth)
        };
      })
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

  const getRawTrackList = () => {
    return shakaPlayer.getVariantTracks();
  };

  const getAudioTrackList = () => {
    return shakaPlayer.getVariantTracks().map(track => {
      return {
        ...track,
        label: track.label ?? track.language
      };
    });
  };

  const getLanguageList = (): Language[] => {
    return shakaPlayer.getAudioLanguagesAndRoles();
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
  const setLanguage = (language: string) => {
    shakaPlayer.configure({
      preferredAudioLanguage: language,
      abr: {
        enabled: false
      }
    });
    shakaPlayer.selectAudioLanguage(language);
    shakaPlayer.configure({
      preferredAudioLanguage: language,
      abr: {
        enabled: true
      }
    });
  };

  const setTrack = (trackId: number) => {
    const newTrack = shakaPlayer.getVariantTracks().find(track => track.id === trackId);
    if (newTrack) {
      shakaPlayer.configure({
        abr: {
          enabled: false
        }
      });
      shakaPlayer.selectVariantTrack(newTrack, true);
    }
  };

  const setAutoQuality = (enabled: boolean) => {
    shakaPlayer.configure({
      abr: {
        enabled
      }
    });
  };

  // Initialize player
  watch(source, async (newValue, oldValue) => {
    if (newValue !== oldValue) {
      const startTimeNumber = startTime?.value ?? 0;
      await shakaPlayer.load(source.value, startTimeNumber);
    }
  });
  const startTimeNumber = startTime?.value ?? 0;
  await shakaPlayer.load(source.value, startTimeNumber);

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
    onLanguageChanged,
    onAudioQualityChanged,
    onAutomaticQualityChanged,

    getTime,
    getDuration,
    getBufferLevel,
    getPlaybackRate,
    getTrackList,
    getAudioTrackList,
    getLanguageList,
    getRawTrackList,

    getVolume,
    setVolume,
    setTime,
    setPlaybackRate,
    setLanguage,
    setTrack,
    setAutoQuality,
    play,
    pause,
    destroy
  };
};
