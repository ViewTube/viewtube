import type { RxPlayerAdapterOptions } from './rxPlayerAdapter';

type HlsAdapterOptions = RxPlayerAdapterOptions;

export const shakaAdapterOld = async ({
  videoElementRef,
  source,
  startTime,
  videoState,
  volumeStorage,
  videoEnded,
  createMessage,
  autoplay
}: HlsAdapterOptions) => {
  // const shaka = await import('shaka-player');
  // shaka.polyfill.installAll();
  // const browserSupported = shaka.Player.isBrowserSupported();
  // if (!browserSupported) {
  //   throw new Error('Browser not supported');
  // }
  // const shakaPlayer = new shaka.Player();
  // shakaPlayer.configure({
  //   preferredAudioLanguage: 'en',
  //   abr: {
  //     restrictions: {
  //       maxPixels: 1920 * 1080
  //     }
  //   },
  //   streaming: {
  //     retryParameters: {
  //       maxAttempts: Infinity,
  //       baseDelay: 500,
  //       timeout: 30000
  //     },
  //     bufferingGoal: 30,
  //     bufferBehind: 60
  //   },
  //   manifest: {
  //     dash: {
  //       ignoreMinBufferTime: true,
  //       disableXlinkProcessing: true
  //     }
  //   }
  // });
  // const eventStorage = new Map<string, EventListenerCallback>();
  // const registerCallback = (event: string) => (callback: EventListenerCallback) => {
  //   eventStorage.set(event, callback);
  //   shakaPlayer.addEventListener(event, callback);
  // };
  // const registerMultipleCallbacks = (events: string[]) => (callback: EventListenerCallback) => {
  //   events.forEach(event => {
  //     eventStorage.set(event, callback);
  //     shakaPlayer.addEventListener(event, callback);
  //   });
  // };
  // const registerNativeCallback =
  //   (event: keyof HTMLVideoElementEventMap) => (callback: EventListenerCallback) => {
  //     eventStorage.set(event, callback);
  //     videoRef.value.addEventListener(event, callback);
  //   };
  // const unregisterCallback = (event: string) => {
  //   const callback = eventStorage.get(event);
  //   if (callback) {
  //     shakaPlayer.removeEventListener(event, callback);
  //   }
  // };
  // const unregisterMultipleCallbacks = (events: string[]) => {
  //   events.forEach(event => {
  //     const callback = eventStorage.get(event);
  //     if (callback) {
  //       shakaPlayer.removeEventListener(event, callback);
  //     }
  //   });
  // };
  // const unregisterNativeCallback = (event: string) => {
  //   const callback = eventStorage.get(event);
  //   if (callback) {
  //     videoRef.value.removeEventListener(event, callback);
  //   }
  // };
  // const onError = registerCallback('error');
  // const onMessage = registerCallback('message');
  // const onOpen = registerCallback('open');
  // onError(error => {
  //   console.log('Shaka error', error);
  // });
  // onMessage(message => {
  //   console.log('Shaka message', message);
  // });
  // onOpen(e => {
  //   console.log('Shaka open', e);
  // });
  // // Register callbacks
  // const onPlaybackStarted = registerNativeCallback('playing');
  // const onPlaybackPaused = registerNativeCallback('pause');
  // const onPlaybackTimeUpdated = registerNativeCallback('timeupdate');
  // const onCanPlay = registerNativeCallback('canplay');
  // const onVolumeChanged = registerNativeCallback('volumechange');
  // // https://nightly-dot-shaka-player-demo.appspot.com/docs/api/shaka.Player.html#.event:BufferingEvent
  // const onWaiting = registerCallback('buffering');
  // const onTextTracksAdded = registerCallback('textchanged');
  // const onBufferLevelUpdated = registerMultipleCallbacks(['segmentappended', 'onstatechange']);
  // const onVariantChanged = registerCallback('variantchanged');
  // const onPlaybackRateChanged = registerCallback('ratechange');
  // const onQualityChanged = registerCallback('mediaqualitychanged');
  // const onAdaptationChanged = registerCallback('adaptation');
  // const onAutomaticQualityChanged = registerCallback('abrstatuschanged');
  // const onTracksChanged = registerCallback('trackschanged');
  // const onLanguageChanged = (callback: EventListenerCallback) => {
  //   onVariantChanged(e => {
  //     callback(e.newTrack.language);
  //   });
  //   onAdaptationChanged(e => {
  //     if (e.newTrack) {
  //       callback(e.newTrack.language);
  //     }
  //   });
  // };
  // const onAudioQualityChanged = (callback: EventListenerCallback) => {
  //   onQualityChanged(e => {
  //     if (e.mediaType === 'audio') {
  //       callback(e);
  //     }
  //   });
  // };
  // await shakaPlayer.attach(videoRef.value);
  // const destroy = () => {
  //   unregisterNativeCallback('playing');
  //   unregisterNativeCallback('pause');
  //   unregisterNativeCallback('timeupdate');
  //   unregisterCallback('textchanged');
  //   unregisterMultipleCallbacks(['segmentappended', 'onstatechange']);
  //   unregisterNativeCallback('canplay');
  //   unregisterCallback('buffering');
  //   unregisterNativeCallback('volumechange');
  //   unregisterCallback('ratechange');
  //   unregisterCallback('mediaqualitychanged');
  //   unregisterCallback('abrstatuschanged');
  //   shakaPlayer.destroy();
  // };
  // // Getters
  // const getBufferLevel = () => {
  //   let bufferLevel = 0;
  //   const bufferedInfo = shakaPlayer.getBufferedInfo();
  //   if (bufferedInfo) {
  //     bufferLevel = bufferedInfo.total.sort((a, b) => a.end - b.end).reverse()[0].end;
  //   }
  //   return bufferLevel;
  // };
  // const getTrackList = (): Record<string, LabelledTrack[]> => {
  //   const groupedTrackList = {};
  //   shakaPlayer
  //     .getVariantTracks()
  //     .map(track => {
  //       const frameRateLabel = track.frameRate > 30 ? track.frameRate : '';
  //       let heightLabel = track.height;
  //       switch (track.width) {
  //         case 3840:
  //           heightLabel = 2560;
  //           break;
  //         case 2560:
  //           heightLabel = 1440;
  //           break;
  //         case 1920:
  //           heightLabel = 1080;
  //           break;
  //         case 1280:
  //           heightLabel = 720;
  //           break;
  //         case 854:
  //           heightLabel = 480;
  //           break;
  //         case 640:
  //           heightLabel = 360;
  //           break;
  //         case 426:
  //           heightLabel = 240;
  //           break;
  //         case 256:
  //           heightLabel = 144;
  //           break;
  //       }
  //       return {
  //         ...track,
  //         videoLabel: `${heightLabel}p${frameRateLabel} · ${humanizeBitrate(track.videoBandwidth)}`,
  //         audioLabel: humanizeBitrate(track.audioBandwidth)
  //       };
  //     })
  //     .sort((a, b) => {
  //       const videoCodecA = a.videoCodec.split('.')[0];
  //       const videoCodecB = b.videoCodec.split('.')[0];
  //       const audioCodecA = a.audioCodec.split('.')[0];
  //       const audioCodecB = b.audioCodec.split('.')[0];
  //       return (
  //         videoCodecA.localeCompare(videoCodecB) ||
  //         audioCodecA.localeCompare(audioCodecB) ||
  //         a.height - b.height ||
  //         a.videoBandwidth - b.videoBandwidth ||
  //         a.audioBandwidth - b.audioBandwidth
  //       );
  //     })
  //     .forEach(track => {
  //       const language = track.language;
  //       if (!groupedTrackList[language]) {
  //         groupedTrackList[language] = [];
  //       }
  //       groupedTrackList[language].push(track);
  //     });
  //   return groupedTrackList;
  // };
  // const getRawTrackList = () => {
  //   return shakaPlayer.getVariantTracks();
  // };
  // const getAudioTrackList = () => {
  //   return shakaPlayer.getVariantTracks().map(track => {
  //     return {
  //       ...track,
  //       label: track.label ?? track.language
  //     };
  //   });
  // };
  // const getLanguageList = (): Language[] => {
  //   return shakaPlayer.getAudioLanguagesAndRoles();
  // };
  // const getTime = () => videoRef.value?.currentTime ?? 0;
  // const getDuration = () => videoRef.value?.duration ?? 0;
  // const getVolume = () => videoRef.value?.volume ?? 1;
  // const getPlaybackRate = shakaPlayer.getPlaybackRate;
  // // Setters
  // const setVolume = (volume: number) => {
  //   if (videoRef.value) {
  //     let vol = volume;
  //     if (volume > 1) {
  //       vol = 1;
  //     } else if (volume < 0) {
  //       vol = 0;
  //     }
  //     videoRef.value.volume = vol;
  //   }
  // };
  // const setTime = (time: number) => {
  //   if (videoRef.value && !isNaN(time)) {
  //     videoRef.value.currentTime = time;
  //   }
  // };
  // const setPlaybackRate = (rate: number) => {
  //   if (videoRef.value && !isNaN(rate) && rate > 0) {
  //     videoRef.value.playbackRate = rate;
  //   }
  // };
  // const play = () => {
  //   videoRef.value?.play();
  // };
  // const pause = () => {
  //   videoRef.value?.pause();
  // };
  // const setLanguage = (language: string) => {
  //   shakaPlayer.configure({
  //     preferredAudioLanguage: language,
  //     abr: {
  //       enabled: false
  //     }
  //   });
  //   shakaPlayer.selectAudioLanguage(language);
  //   shakaPlayer.configure({
  //     preferredAudioLanguage: language,
  //     abr: {
  //       enabled: true
  //     }
  //   });
  // };
  // const setTrack = (trackId: number) => {
  //   const newTrack = shakaPlayer.getVariantTracks().find(track => track.id === trackId);
  //   if (newTrack) {
  //     shakaPlayer.configure({
  //       abr: {
  //         enabled: false
  //       }
  //     });
  //     shakaPlayer.selectVariantTrack(newTrack, true);
  //   }
  // };
  // const setAutoQuality = (enabled: boolean) => {
  //   shakaPlayer.configure({
  //     abr: {
  //       enabled
  //     }
  //   });
  // };
  // // Initialize player
  // watch(source, async (newValue, oldValue) => {
  //   if (newValue !== oldValue) {
  //     const startTimeNumber = startTime?.value ?? 0;
  //     await shakaPlayer.load(source.value, startTimeNumber);
  //   }
  // });
  // const startTimeNumber = startTime?.value ?? 0;
  // await shakaPlayer.load(source.value, startTimeNumber);
  // return {
  //   type: 'dash',
  //   onPlaybackStarted,
  //   onPlaybackPaused,
  //   onPlaybackTimeUpdated,
  //   onTextTracksAdded,
  //   onBufferLevelUpdated,
  //   onPlaybackRateChanged,
  //   onCanPlay,
  //   onWaiting,
  //   onVolumeChanged,
  //   onLanguageChanged,
  //   onAudioQualityChanged,
  //   onTracksChanged,
  //   onAutomaticQualityChanged,
  //   getTime,
  //   getDuration,
  //   getBufferLevel,
  //   getPlaybackRate,
  //   getTrackList,
  //   getAudioTrackList,
  //   getLanguageList,
  //   getRawTrackList,
  //   getVolume,
  //   setVolume,
  //   setTime,
  //   setPlaybackRate,
  //   setLanguage,
  //   setTrack,
  //   setAutoQuality,
  //   play,
  //   pause,
  //   destroy
  // };
};
