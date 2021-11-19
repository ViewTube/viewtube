import {
  computed,
  reactive,
  ref,
  watch,
  onMounted,
  onBeforeUnmount
} from '@nuxtjs/composition-api';
import { MediaMetadataHelper } from './mediaMetadata';
import { calculateSeekPercentage, matchSeekProgressPercentage, seekbarFunctions } from './seekbar';
import { parseChapters } from './chapters';
import { destroyInstance, initializeHlsStream, isHlsNative, isHlsSupported } from './hlsHelper';
import { DashHelper } from './dash';
import { commons } from '@/plugins/commons';
// import dashjs from 'dashjs';
import { SponsorBlock } from '@/plugins/services/sponsorBlock';
import { SponsorBlockSegmentsDto } from '@/plugins/shared';
import { useAccessor } from '@/store';
import { useFormatting } from '@/plugins/formatting';
import { useAxios } from '@/plugins/axiosPlugin';
import { useImgProxy } from '@/plugins/proxy';
import { createComputed } from '@/plugins/computed';

export const videoPlayerSetup = (props: any, emit: Function) => {
  const accessor = useAccessor();
  const formatting = useFormatting();
  const axios = useAxios();
  const imgProxy = useImgProxy();

  const loading = ref(true);
  const fullscreen = ref(false);
  // const dashPlayer = ref(null);
  // const dashBitrates = ref(null);

  const touchAction = ref(false);

  const playerOverlay = reactive({
    visible: false,
    timeout: undefined,
    updateInterval: undefined,
    thumbnailVisible: true
  });

  const animations = reactive({
    skipForward: false,
    skipBackward: false,
    volumeUp: false,
    volumeDown: false
  });

  const videoElement = reactive({
    positionSaveInterval: undefined,
    buffering: true,
    playing: false,
    progress: 0,
    progressPercentage: 0,
    loadingPercentage: 0,
    firstTimeBuffering: true,
    aspectRatio: 16 / 9,
    playerVolume: 1,
    zoomed: false,
    duration: 0
  });

  const seekbar = reactive({
    seeking: false,
    seekPercentage: 0,
    hoverPercentage: 0,
    hoverTime: '00:00',
    hoverTimeStamp: 0
  });

  const skipButton = reactive({
    clickFn: null,
    skipCategory: '',
    visible: false
  });

  const highestLegacyQuality = ref(null);

  const mediaMetadataHelper = new MediaMetadataHelper(props.video);

  const videoPlayerRef = ref(null);
  const seekbarHoverPreviewRef = ref(null);
  const seekbarHoverTimestampRef = ref(null);
  const chapterTitleRef = ref(null);
  const videoRef = ref(null);
  const videoPlayerSettingsRef = ref(null);

  const touchActionTimeout = ref(null);

  const dashHelper = ref<DashHelper>(null);

  const videoQualityList = createComputed(() => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      return dashHelper.value.getVideoQualityList();
    } else {
      return props.video.legacyFormats;
    }
  });

  const audioQualityList = createComputed(() => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      return dashHelper.value.getAudioQualityList();
    }
  });

  const selectedLegacyQuality = ref(0);

  const selectedVideoQuality = createComputed(() => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      return dashHelper.value.currentVideoQuality;
    }
    return selectedLegacyQuality.value;
  });

  const selectedAudioQuality = createComputed(() => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      return dashHelper.value.currentAudioQuality;
    }
  });

  const renderedVideoQuality = createComputed(() => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      return dashHelper.value.renderedVideoQuality;
    }
  });

  const doTouchAction = () => {
    touchAction.value = true;
    if (touchActionTimeout.value) {
      clearTimeout(touchActionTimeout.value);
    }
    touchActionTimeout.value = setTimeout(() => {
      touchAction.value = false;
    }, 400);
  };

  highestLegacyQuality.value = '#';
  if (props.video.legacyFormats) {
    const videoFormat = props.video.legacyFormats.find((e: any) => {
      if (e.qualityLabel) {
        if (e.qualityLabel === '1080p') {
          return true;
        } else if (e.qualityLabel === '720p') {
          return true;
        }
      }
      return false;
    });
    if (videoFormat && videoFormat.url) {
      highestLegacyQuality.value = videoFormat.url;
    } else if (props.video.legacyFormats.length > 0) {
      highestLegacyQuality.value = props.video.legacyFormats[0].url;
    }
  }

  const chapters = ref(null);

  if (accessor.settings.miniplayer) {
    chapters.value = parseChapters(props.video.description, props.video.lengthSeconds);
  }

  const sponsorBlockSegments = ref<SponsorBlockSegmentsDto>(null);
  let sponsorBlock: SponsorBlock = null;

  if (accessor.settings.sponsorblockEnabled) {
    sponsorBlock = new SponsorBlock(props.video.videoId);
    sponsorBlock.getSkipSegments().then(value => {
      if (value) {
        const segments = {
          hash: value.hash,
          videoID: value.videoID,
          segments: value.segments.map(segment => {
            const startPercentage = (segment.segment[0] / props.video.lengthSeconds) * 100;
            const endPercentage = (segment.segment[1] / props.video.lengthSeconds) * 100;
            return {
              startPercentage,
              endPercentage,
              ...segment
            };
          })
        };
        sponsorBlockSegments.value = segments;
      }
    });
  }

  const videoUrl = computed(() => {
    if (props.video !== undefined) {
      return `/watch?v=${props.video.videoId}`;
    }
    return '';
  });
  const playerOverlayVisible = computed(() => {
    return playerOverlay.visible || !videoElement.playing;
  });

  watch(
    () => videoElement.playerVolume,
    (newValue: number, oldValue: number) => {
      if (newValue !== oldValue && newValue >= 0 && newValue <= 1) {
        if (videoRef.value) {
          if (newValue > 0) {
            videoRef.value.muted = false;
          } else if (newValue === 0) {
            videoRef.value.muted = true;
          }
          accessor.playerVolume.setPlayerVolume(newValue);
          videoRef.value.volume = newValue;
        }
      }
    }
  );

  const getChapterForPercentage = (percentage: number) => {
    if (chapters.value) {
      const chapter = chapters.value.find(
        (c: any) => percentage > c.startPercentage && percentage < c.endPercentage
      );
      if (chapter) {
        return chapter;
      }
    }
    return null;
  };

  const toggleVideoPlayback = () => {
    if (!seekbar.seeking && videoRef.value) {
      playerOverlay.thumbnailVisible = false;
      if (videoElement.playing) {
        videoRef.value.pause();
      } else {
        videoRef.value.play();
      }
    }
  };

  const onWindowKeyDown = (e: KeyboardEvent) => {
    if (videoRef.value) {
      switch (e.key) {
        case ' ':
        case 'k':
          toggleVideoPlayback();
          e.preventDefault();
          break;
        case 'ArrowRight':
          seekForward(5);
          break;
        case 'ArrowLeft':
          seekBackward(5);
          break;
        case 'ArrowUp':
          increaseVolume(0.1);
          e.preventDefault();
          break;
        case 'ArrowDown':
          decreaseVolume(0.1);
          e.preventDefault();
          break;
        case 'j':
          seekBackward(10);
          break;
        case 'l':
          seekForward(10);
          break;
        case 'm':
          videoRef.value.muted = !videoRef.value.muted;
          break;
        case 'f':
          onSwitchFullscreen();
          break;
        case '.':
          if (!videoElement.playing) {
            videoRef.value.currentTime = videoRef.value.currentTime + 1 / 30;
          }
          break;
        case ',':
          if (!videoElement.playing) {
            videoRef.value.currentTime = videoRef.value.currentTime - 1 / 30;
          }
          break;
        case '>': {
          let newSpeed = videoRef.value.playbackRate + 0.2;
          newSpeed = newSpeed < 3 ? newSpeed : 3;
          videoRef.value.playbackRate = newSpeed;
          videoRef.value.defaultPlaybackRate = newSpeed;
          break;
        }
        case '<': {
          let newSpeed = videoRef.value.playbackRate - 0.2;
          newSpeed = newSpeed > 0.1 ? newSpeed : 0.1;
          videoRef.value.playbackRate = newSpeed;
          videoRef.value.defaultPlaybackRate = newSpeed;
          break;
        }
        case (e.key.match(/\d/) && e.key.match(/\d/).input) || {}: {
          const skipInterval = videoRef.value.duration / 10;
          const amount = parseInt(e.key);
          videoRef.value.currentTime = skipInterval * amount;
          break;
        }
        default:
          break;
      }
    }
  };

  const onLoadedMetadata = async (e: any) => {
    videoElement.aspectRatio = e.target.videoHeight / e.target.videoWidth;
    if (videoRef.value) {
      videoElement.playerVolume = accessor.playerVolume.getPlayerVolume;
      if (videoElement.firstTimeBuffering) {
        videoElement.firstTimeBuffering = false;
        if (!props.video.liveNow) {
          setVideoTime(props.initialVideoTime);
        }
        if (props.autoplay) {
          try {
            await videoRef.value.play();
          } catch (error) {
            accessor.messages.createMessage({
              type: 'error',
              title: 'Autoplay blocked',
              message: 'Allow autoplay for this website to start the video automatically'
            });
          }
        }
        if ('mediaSession' in navigator && process.browser) {
          const metadata = createMediaMetadata();
          (navigator as any).mediaSession.metadata = metadata;
        }
      }
    }
    videoElement.buffering = false;
  };

  const playbackTimeBeforeUpdate = ref(0);

  const updatePlaybackProgress = (force = false) => {
    if (videoRef.value && !seekbar.seeking) {
      if (Math.abs(playbackTimeBeforeUpdate.value - videoRef.value.currentTime) > 1 || force) {
        videoElement.progressPercentage =
          (videoRef.value.currentTime / videoRef.value.duration) * 100;
        videoElement.progress = videoRef.value.currentTime;
        videoElement.duration = videoRef.value.duration;

        accessor.videoPlayer.setCurrentTime(videoRef.value.currentTime);
        accessor.videoPlayer.setVideoLength(videoRef.value.duration);

        if (accessor.settings.sponsorblockEnabled && sponsorBlock) {
          const currentSegment = sponsorBlock.getCurrentSegment(videoRef.value.currentTime);
          if (currentSegment) {
            let segmentOption = 'ask';
            if (currentSegment.category === 'music_offtopic') {
              segmentOption = accessor.settings.sponsorblockSegmentMusicOfftopic;
            }
            switch (currentSegment.category) {
              case 'music_offtopic':
                segmentOption = accessor.settings.sponsorblockSegmentMusicOfftopic;
                break;
              case 'interaction':
                segmentOption = accessor.settings.sponsorblockSegmentInteraction;
                break;
              case 'intro':
                segmentOption = accessor.settings.sponsorblockSegmentIntro;
                break;
              case 'outro':
                segmentOption = accessor.settings.sponsorblockSegmentOutro;
                break;
              case 'selfpromo':
                segmentOption = accessor.settings.sponsorblockSegmentSelfpromo;
                break;
              case 'preview':
                segmentOption = accessor.settings.sponsorblockSegmentPreview;
                break;
              case 'sponsor':
                segmentOption = accessor.settings.sponsorblockSegmentSponsor;
                break;
              default:
                break;
            }
            if (segmentOption && segmentOption === 'skip') {
              setVideoTime(currentSegment.segment[1]);
            } else if (segmentOption && segmentOption === 'ask') {
              skipButton.visible = true;
              skipButton.skipCategory = currentSegment.category;
              skipButton.clickFn = () => {
                setVideoTime(currentSegment.segment[1]);

                skipButton.visible = false;
              };
            }
          } else {
            skipButton.visible = false;
          }
        }

        if (process.browser && 'mediaSession' in navigator) {
          const duration = parseFloat(videoRef.value.duration);
          const playbackRate = parseFloat(videoRef.value.playbackRate);
          const position = parseFloat(videoRef.value.currentTime);
          if (duration && playbackRate && position) {
            (navigator as any).mediaSession.setPositionState({
              duration,
              playbackRate,
              position
            });
          }
        }

        playbackTimeBeforeUpdate.value = Math.floor(videoRef.value.currentTime);
      }
    }
  };

  const onPlaybackProgress = () => {
    updatePlaybackProgress();
  };

  const onLoadingProgress = () => {
    if (videoRef.value && videoRef.value.buffered.length) {
      const videoBufferedMaxTimeRange = videoRef.value.buffered.length - 1;
      const loadingPercentage =
        (videoRef.value.buffered.end(videoBufferedMaxTimeRange) / videoRef.value.duration) * 100;
      videoElement.loadingPercentage = loadingPercentage;
    }
  };

  const onVolumeChange = () => {
    if (videoRef.value) {
      if (videoRef.value.muted) {
        videoElement.playerVolume = 0;
      } else if (videoElement.playerVolume === 0 && videoRef.value.volume === 0) {
        videoElement.playerVolume = 0.5;
      } else {
        videoElement.playerVolume = videoRef.value.volume;
      }
    }
  };

  const onVideoPlaying = () => {
    updatePlaybackProgress(true);
    clearInterval(videoElement.positionSaveInterval);
    playerOverlay.thumbnailVisible = false;
    videoElement.playing = true;
    videoElement.positionSaveInterval = setInterval(() => {
      saveVideoPosition(videoRef.value.currentTime);
    }, 5000);
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'playing';
    }
  };

  const onVideoPaused = () => {
    videoElement.playing = false;
    saveVideoPosition(videoRef.value.currentTime);
    clearInterval(videoElement.positionSaveInterval);
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'paused';
    }
  };

  const onVideoEnded = () => {
    emit('videoEnded');
  };

  const onVideoCanplay = () => {
    videoElement.buffering = false;
  };

  const onVideoBuffering = () => {
    videoElement.buffering = true;
  };

  const onLoaded = () => {
    loading.value = false;
  };

  // Interaction events
  const onVolumeInteraction = () => {};
  const onOpenInPlayer = () => {
    if (playerOverlayVisible.value) {
      window.open(videoUrl.value, '_blank');
    }
  };
  const onOpenInPlayerMouseUp = () => {};
  const onVideoExpand = () => {
    if (playerOverlayVisible.value) {
      videoElement.zoomed = true;
    }
  };
  const onVideoExpandMouseUp = () => {};
  const onVideoCollapse = () => {
    if (playerOverlayVisible.value) {
      videoElement.zoomed = false;
    }
  };
  const onVideoCollapseMouseUp = () => {};
  const onSwitchFullscreen = () => {
    if (fullscreen.value) {
      onLeaveFullscreen();
    } else {
      onEnterFullscreen(true);
    }
  };
  const onEnterFullscreen = (force: boolean) => {
    if (playerOverlayVisible.value || force === true) {
      const elem = videoPlayerRef.value;
      try {
        if (elem.requestFullscreen) {
          elem.requestFullscreen();
        } else if (elem.mozRequestFullScreen) {
          elem.mozRequestFullScreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          elem.msRequestFullscreen();
        }
        fullscreen.value = true;
      } catch {}
    }
  };
  const onEnterFullscreenMouseUp = () => {};
  const onLeaveFullscreen = () => {
    if (playerOverlayVisible.value) {
      const doc = document as any;
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
      } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
      } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
      }
      fullscreen.value = false;
    }
  };
  const onFullscreenChange = () => {
    if (document.fullscreenElement) {
      fullscreen.value = true;
    } else {
      fullscreen.value = false;
    }
  };
  const onLeaveFullscreenMouseUp = () => {};
  const onPlayBtnTouchEnd = () => {
    if (playerOverlayVisible.value) {
      playerOverlay.visible = false;
      toggleVideoPlayback();
    }
  };
  const onPlayBtnClick = () => {
    if (playerOverlayVisible.value) {
      toggleVideoPlayback();
    }
  };

  const onPlayerTouchStart = () => {
    doTouchAction();
  };

  const doubleTouchTimer = ref(null);
  const firstTouchX = ref(0);

  const onPlayerTouchEnd = (e: any) => {
    doTouchAction();
    if (!doubleTouchTimer.value) {
      firstTouchX.value = e.changedTouches[0].pageX;

      doubleTouchTimer.value = setTimeout(() => {
        doubleTouchTimer.value = null;

        if (playerOverlay.visible) {
          hidePlayerOverlay();
        } else {
          showPlayerOverlay(true);
        }

        if (seekbar.seeking) {
          seekbar.seeking = false;
          matchSeekProgressPercentage(videoRef, seekbar.seekPercentage, videoElement, true);
        }
      }, 300);
    } else {
      clearTimeout(doubleTouchTimer.value);
      doubleTouchTimer.value = null;

      if (videoPlayerRef.value && e.changedTouches) {
        const pageX = e.changedTouches[0].pageX;
        const containerWidth = videoPlayerRef.value.clientWidth;

        const leftHalf = pageX < containerWidth / 2;
        const rightHalf = pageX > containerWidth / 2;

        const firstTouchLeftHalf = firstTouchX.value < containerWidth / 2;
        const firstTouchRightHalf = firstTouchX.value > containerWidth / 2;

        if (leftHalf === firstTouchLeftHalf && rightHalf === firstTouchRightHalf) {
          if (leftHalf) {
            seekBackward(5);
          } else if (rightHalf) {
            seekForward(5);
          }
        }
      }
    }
  };

  const playerMouseMoveCounter = ref(0);
  const playerMouseMoveCounterTimeout = ref(null);

  const onPlayerMouseMove = (e: { pageX: number; pageY: number }) => {
    if (playerMouseMoveCounter.value < 1) {
      if (playerMouseMoveCounterTimeout.value) {
        clearTimeout(playerMouseMoveCounterTimeout.value);
      }
      playerMouseMoveCounter.value += 1;
      playerMouseMoveCounterTimeout.value = setTimeout(() => {
        playerMouseMoveCounter.value = 0;
      }, 100);
    } else if (!touchAction.value) {
      showPlayerOverlay(false);
      if (seekbar.seeking && videoRef.value) {
        seekbar.seekPercentage = calculateSeekPercentage(e.pageX);
        seekbar.hoverPercentage = calculateSeekPercentage(e.pageX);
        seekbar.hoverTime = formatting.getTimestampFromSeconds(
          (videoRef.value.duration / 100) * seekbar.hoverPercentage
        );
        seekbar.hoverTimeStamp = (videoRef.value.duration / 100) * seekbar.hoverPercentage;
        matchSeekProgressPercentage(videoRef, seekbar.seekPercentage, videoElement);
        if (seekbarFunctions.isMouseOufOfBoundary(e.pageX, e.pageY)) {
          seekbar.seeking = false;
        }
      }
    }
  };
  const onPlayerMouseLeave = () => {
    hidePlayerOverlay();
  };
  const showPlayerOverlay = (noTimeout: boolean = false) => {
    playerOverlay.visible = true;
    if (playerOverlay.timeout) {
      clearTimeout(playerOverlay.timeout);
    }
    if (!noTimeout) {
      playerOverlay.timeout = setTimeout(() => {
        playerOverlay.visible = false;
      }, 3000);
    }
  };
  const hidePlayerOverlay = () => {
    if (playerOverlay.timeout) {
      clearTimeout(playerOverlay.timeout);
    }
    playerOverlay.visible = false;
  };
  const seekHoverAdjustedLeft = (element: any): string => {
    const percentage = seekbar.hoverPercentage;
    return hoverAdjustedCenter(element, percentage);
  };

  const hoverAdjustedCenter = (element: any, percentage: number): string => {
    let leftPx = 0;
    if (element) {
      const elOffsetWidth = element.$el ? element.$el.offsetWidth : 0;
      const elWidth = element.offsetWidth || elOffsetWidth;
      const pageWidth = commons.getPageWidth();
      leftPx = ((pageWidth - 27.5) / 100) * percentage - (elWidth / 2 - 12);

      if (leftPx < 10) {
        leftPx = 10;
      }
      if (leftPx > pageWidth - elWidth - 17) {
        leftPx = pageWidth - elWidth - 17;
      }
    }

    return `${leftPx}px`;
  };

  const hoverAdjustedLeft = (element: any, percentage: number): string => {
    let leftPx = 0;
    if (element) {
      const elOffsetWidth = element.$el ? element.$el.offsetWidth : 0;
      const elWidth = element.offsetWidth || elOffsetWidth;
      const pageWidth = commons.getPageWidth();
      leftPx = ((pageWidth - 20) / 100) * percentage;

      if (leftPx < 10) {
        leftPx = 10;
      }
      if (leftPx > pageWidth - elWidth - 10) {
        leftPx = pageWidth - elWidth - 10;
      }
    }

    return `${leftPx}px`;
  };

  const onPlayerClick = () => {
    toggleVideoPlayback();
  };

  // Seekbar
  const onSeekbarTouchStart = (e: any) =>
    seekbarFunctions.onSeekbarTouchStart(e, {
      playerOverlayVisible,
      seekbar,
      videoRef,
      videoElement,
      formatFn: formatting.getTimestampFromSeconds
    });

  const onSeekbarMouseMove = (e: any) =>
    seekbarFunctions.onSeekbarMouseMove(e, {
      seekbar,
      videoDuration: videoRef.value.duration,
      formatFn: formatting.getTimestampFromSeconds
    });

  const onSeekbarTouchMove = (e: any) =>
    seekbarFunctions.onSeekbarTouchMove(e, {
      playerOverlayVisible,
      seekbar,
      videoDuration: videoRef.value.duration,
      formatFn: formatting.getTimestampFromSeconds
    });

  const onPlayerTouchMove = (e: any) => {
    doTouchAction();
    seekbarFunctions.onPlayerTouchMove(e, {
      seekbar,
      videoRef,
      seekPercentage: seekbar.seekPercentage,
      videoElement
    });
  };

  const onSeekbarMouseDown = () => seekbarFunctions.onSeekbarMouseDown({ seekbar });

  const onPlayerMouseUp = () =>
    seekbarFunctions.onPlayerMouseUp({
      seekbar,
      videoRef,
      seekPercentage: seekbar.seekPercentage,
      videoElement
    });

  const onSeekbarMouseLeave = () => seekbarFunctions.onSeekbarMouseLeave();

  const onSeekbarMouseEnter = () => seekbarFunctions.onSeekbarMouseEnter();

  const onSeekbarClick = (e: any) =>
    seekbarFunctions.onSeekBarClick(e, {
      seekbar,
      videoRef,
      videoElement
    });

  const onChangeQuality = async (index: number) => {
    videoRef.value.pause();
    const currentTime = videoRef.value.currentTime;
    saveVideoPosition(currentTime);
    if (props.video.liveNow) {
      await initializeHlsStream(
        props.video.legacyFormats[index].url,
        videoRef.value,
        accessor.environment.streamProxyUrl
      );
    } else {
      videoRef.value.src = props.video.legacyFormats[index].url;
    }
    videoRef.value.currentTime = currentTime;
    videoRef.value.play();
    selectedLegacyQuality.value = index;
  };

  const onAutoAdjustChange = () => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      dashHelper.value.setAudioAutoSwitchingMode(accessor.settings.autoAdjustAudioQuality);
      dashHelper.value.setVideoAutoSwitchingMode(accessor.settings.autoAdjustVideoQuality);
    }
  };

  const onRefreshRecommendedQuality = (quality: number) => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      const maxBitrate = dashHelper.value.getVideoQualityList()[quality];
      dashHelper.value.setMaxBitrate(maxBitrate.bitrate);
    }
  };

  const onChangeVideoQuality = (index: number) => {
    if (dashHelper.value && dashHelper.value.isFullyInitialized) {
      dashHelper.value.setVideoQuality(index);
    } else {
      onChangeQuality(index);
    }
  };

  const onChangeAudioQuality = (index: number) => {
    if (dashHelper.value) {
      dashHelper.value.setAudioQuality(index);
    }
  };

  const onChangeSpeed = (speed: number) => {
    if (videoRef.value) {
      videoRef.value.playbackRate = speed;
      videoRef.value.defaultPlaybackRate = speed;
    }
  };

  const onChangeLoop = (enabled: boolean) => {
    if (videoRef.value) {
      videoRef.value.loop = enabled;
    }
  };

  const onLoopChanged = (enabled: boolean) => {
    if (videoPlayerSettingsRef.value) {
      videoPlayerSettingsRef.value.loopVideo = enabled;
    }
  };

  const onSpeedChanged = (event: any) => {
    if (videoPlayerSettingsRef.value) {
      videoPlayerSettingsRef.value.videoSpeed = event.target.playbackRate;
    }
  };

  const createMediaMetadata = () => {
    return mediaMetadataHelper.createMediaMetadata();
  };

  const saveVideoPosition = (currentTime: number) => {
    if (videoRef.value && accessor.settings.saveVideoHistory) {
      if (accessor.user.isLoggedIn && !props.video.liveNow) {
        const apiUrl = accessor.environment.apiUrl;
        axios
          .post(
            `${apiUrl}user/history/${props.video.videoId}`,
            {
              progressSeconds: Math.floor(currentTime),
              lengthSeconds: Math.floor(videoRef.value.duration)
            },
            { withCredentials: true }
          )
          .catch((_: any) => {});
      }
    }
  };

  if (process.browser && 'mediaSession' in navigator) {
    (navigator as any).mediaSession.setActionHandler('play', () => {
      if (videoRef.value) {
        playerOverlay.thumbnailVisible = false;
        videoRef.value.play();
      }
    });
    (navigator as any).mediaSession.setActionHandler('pause', () => {
      if (videoRef.value) {
        playerOverlay.thumbnailVisible = false;
        videoRef.value.pause();
      }
    });
    (navigator as any).mediaSession.setActionHandler('seekbackward', () => {
      if (videoRef.value) {
        seekBackward(5);
        updatePlaybackProgress(true);
      }
    });
    (navigator as any).mediaSession.setActionHandler('seekforward', () => {
      if (videoRef.value) {
        seekForward(5);
        updatePlaybackProgress(true);
      }
    });
    (navigator as any).mediaSession.setActionHandler('seekto', (details: any) => {
      if (videoRef.value && details.seekTime) {
        videoRef.value.currentTime = details.seekTime;
        updatePlaybackProgress(true);
      }
    });
  }

  const seekForward = (time: number) => {
    videoRef.value.currentTime = Math.min(
      videoRef.value.currentTime + time,
      videoRef.value.duration
    );
    playAnimation((val: boolean) => (animations.skipForward = val));
  };

  const seekBackward = (time: number) => {
    videoRef.value.currentTime = Math.max(videoRef.value.currentTime - time, 0);
    playAnimation((val: boolean) => (animations.skipBackward = val));
  };

  const increaseVolume = (volume: number) => {
    videoRef.value.volume = Math.min(videoRef.value.volume + volume, 1);
    playAnimation((val: boolean) => (animations.volumeUp = val));
  };

  const decreaseVolume = (volume: number) => {
    videoRef.value.volume = Math.max(videoRef.value.volume - volume, 0);
    playAnimation((val: boolean) => (animations.volumeDown = val));
  };

  const playAnimation = (animFn: Function) => {
    animFn(true);
    setTimeout(() => {
      animFn(false);
    }, 600);
  };

  const setVideoTime = (seconds: number): void => {
    if (seconds >= 0) {
      if (seconds <= videoRef.value.duration) {
        videoRef.value.currentTime = seconds;
      } else if (seconds > videoRef.value.duration) {
        videoRef.value.currentTime = videoRef.value.duration;
      }
    }
  };

  const videoAttrObserver = ref(null);

  onMounted(async () => {
    document.addEventListener('keydown', onWindowKeyDown);
    if (videoRef.value) {
      if (props.video.liveNow) {
        if (isHlsSupported()) {
          await initializeHlsStream(
            highestLegacyQuality.value,
            videoRef.value,
            accessor.environment.streamProxyUrl
          );
          selectedLegacyQuality.value = 0;
        } else if (isHlsNative(videoRef.value) && !isHlsSupported()) {
          videoRef.value.src = highestLegacyQuality.value;
        }
      } else if (process.browser) {
        if (accessor.settings.dashPlaybackEnabled && window.MediaSource) {
          // Using dashjs
          const manifestUrl = `${accessor.environment.apiUrl}videos/manifest/dash/${props.video.videoId}`;
          dashHelper.value = new DashHelper(videoRef.value, manifestUrl);

          dashHelper.value.registerEventHandlers({ videoElement });
        } else {
          selectedLegacyQuality.value = 0;
          videoRef.value.src = highestLegacyQuality.value;
        }
      }

      videoAttrObserver.value = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.type === 'attributes') {
            if (mutation.attributeName === 'loop') {
              onLoopChanged(videoRef.value.loop);
            }
          }
        });
      });

      videoAttrObserver.value.observe(videoRef.value, { attributes: true });
    }
  });

  onBeforeUnmount(() => {
    saveVideoPosition(videoRef.value.currentTime);
    document.removeEventListener('keydown', onWindowKeyDown);
    destroyInstance();
  });

  return {
    imgProxyUrl: imgProxy.url,
    loading,
    fullscreen,
    playerOverlay,
    videoElement,
    seekbar,
    highestLegacyQuality,
    videoQualityList,
    audioQualityList,
    videoUrl,
    playerOverlayVisible,
    videoPlayerRef,
    seekbarHoverPreviewRef,
    chapterTitleRef,
    seekbarHoverTimestampRef,
    videoRef,
    videoPlayerSettingsRef,
    animations,
    chapters,
    sponsorBlockSegments,
    skipButton,
    selectedVideoQuality,
    selectedAudioQuality,
    renderedVideoQuality,
    getChapterForPercentage,
    onLoadedMetadata,
    onPlaybackProgress,
    onLoadingProgress,
    onVolumeChange,
    onVideoPlaying,
    onVideoPaused,
    onVideoEnded,
    onVideoCanplay,
    onVideoBuffering,
    onSpeedChanged,
    onLoaded,
    onVolumeInteraction,
    onOpenInPlayer,
    onOpenInPlayerMouseUp,
    onVideoExpand,
    onVideoExpandMouseUp,
    onVideoCollapse,
    onVideoCollapseMouseUp,
    onSwitchFullscreen,
    onEnterFullscreen,
    onEnterFullscreenMouseUp,
    onLeaveFullscreen,
    onFullscreenChange,
    onLeaveFullscreenMouseUp,
    onPlayBtnTouchEnd,
    onPlayBtnClick,
    onPlayerTouchStart,
    onPlayerTouchEnd,
    onPlayerMouseMove,
    onPlayerMouseLeave,
    showPlayerOverlay,
    hidePlayerOverlay,
    seekHoverAdjustedLeft,
    hoverAdjustedLeft,
    onSeekbarMouseMove,
    onSeekbarTouchStart,
    onSeekbarTouchMove,
    onPlayerTouchMove,
    onSeekbarMouseDown,
    onPlayerMouseUp,
    onSeekbarMouseLeave,
    onSeekbarMouseEnter,
    onSeekbarClick,
    onPlayerClick,
    onChangeQuality,
    onChangeVideoQuality,
    onChangeAudioQuality,
    onChangeLoop,
    onChangeSpeed,
    setVideoTime,
    onAutoAdjustChange,
    onRefreshRecommendedQuality
  };
};
