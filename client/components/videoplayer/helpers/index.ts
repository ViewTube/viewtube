import {
  computed,
  reactive,
  ref,
  watch,
  onMounted,
  onBeforeUnmount
} from '@nuxtjs/composition-api';
import Commons from '@/plugins/commons';
import dashjs from 'dashjs';
import { SponsorBlock } from '@/plugins/services/sponsorBlock';
import { SponsorBlockSegmentsDto } from '@/plugins/shared';
import { MediaMetadataHelper } from './mediaMetadata';
import { calculateSeekPercentage, matchSeekProgressPercentage, seekbarFunctions } from './seekbar';
import { parseChapters } from './chapters';

export const videoPlayerSetup = ({ root, props }) => {
  const loading = ref(true);
  const fullscreen = ref(false);
  const dashPlayer = ref(null);
  const dashBitrates = ref(null);

  const touchAction = ref(false);

  const selectedQuality = ref(1);

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
    zoomed: false
  });

  const seekbar = reactive({
    seeking: false,
    seekPercentage: 0,
    hoverPercentage: 0,
    hoverTime: '00:00',
    hoverTimeStamp: 0
  });

  const highestVideoQuality = ref(null);

  const commons = Commons;
  const mediaMetadataHelper = new MediaMetadataHelper(props.video);

  const doTouchAction = () => {
    touchAction.value = true;
    setTimeout(() => {
      touchAction.value = false;
    }, 100);
  };

  highestVideoQuality.value = '#';
  if (props.video.formatStreams) {
    let qualityIndex = 0;
    const videoFormat = props.video.formatStreams.find((e: any, index: number) => {
      qualityIndex = index;
      return e.qualityLabel && e.qualityLabel === '720p';
    });
    if (videoFormat && videoFormat.url) {
      highestVideoQuality.value = videoFormat.url;
    } else if (props.video.formatStreams.length > 0) {
      highestVideoQuality.value = props.video.formatStreams[0].url;
    }
    selectedQuality.value = qualityIndex;
  }

  const videoVolume = computed(() => {
    return videoElement.playerVolume;
  });
  const videoLength = computed(() => {
    if (props.video !== undefined) {
      return props.video.lengthSeconds;
    }
    return 0;
  });
  const chapters = ref(null);

  if (root.$store.getters['settings/miniplayer']) {
    chapters.value = parseChapters(props.video.description, videoLength.value);
  }

  const sponsorBlockSegments = ref<SponsorBlockSegmentsDto>(null);

  if (root.$store.getters['settings/sponsorblock']) {
    const sponsorblock = new SponsorBlock(props.video.videoId);
    sponsorblock.getSkipSegments().then(value => {
      if (value) {
        const segments = {
          hash: value.hash,
          videoID: value.videoID,
          segments: value.segments.map(segment => {
            const startPercentage = (segment.segment[0] / videoLength.value) * 100;
            const endPercentage = (segment.segment[1] / videoLength.value) * 100;
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

  const videoPlayerRef = ref(null);
  const seekbarHoverPreviewRef = ref(null);
  const seekbarHoverTimestampRef = ref(null);
  const chapterTitleRef = ref(null);
  const videoRef = ref(null);

  watch(videoVolume, (val: number, prevVal: number) => {
    if (videoRef.value && val <= 1 && val >= 0 && val !== prevVal) {
      videoRef.value.volume = val;
    }
  });

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

  const onWindowKeyDown = e => {
    if (videoRef.value) {
      if (e.key === ' ') {
        toggleVideoPlayback();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        seekForward(5);
      } else if (e.key === 'ArrowLeft') {
        seekBackward(5);
      } else if (e.key === 'ArrowUp') {
        increaseVolume(0.1);
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        decreaseVolume(0.1);
        e.preventDefault();
      }
    }
  };

  const onLoadedMetadata = e => {
    videoElement.aspectRatio = e.target.videoHeight / e.target.videoWidth;
  };

  const playbackTimeBeforeUpdate = ref(0);

  const updatePlaybackProgress = (force = false) => {
    if (videoRef.value && !seekbar.seeking) {
      if (Math.abs(playbackTimeBeforeUpdate.value - videoRef.value.currentTime) > 1 || force) {
        videoElement.progressPercentage = (videoRef.value.currentTime / videoLength.value) * 100;
        videoElement.progress = videoRef.value.currentTime;

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
    if (videoRef.value) {
      const videoBufferedMaxTimeRange = videoRef.value.buffered.length - 1;
      if (videoBufferedMaxTimeRange && videoBufferedMaxTimeRange > 0) {
        const loadingPercentage =
          (videoRef.value.buffered.end(videoRef.value.buffered.length - 1) /
            videoRef.value.duration) *
          100;
        videoElement.loadingPercentage = loadingPercentage;
      }
    }
  };

  const onVolumeChange = () => {
    if (videoRef.value) {
      videoElement.playerVolume = videoRef.value.volume;
    }
  };

  const onVideoPlaying = () => {
    playerOverlay.thumbnailVisible = false;
    videoElement.playing = true;
    videoElement.positionSaveInterval = setInterval(
      () => saveVideoPosition(videoRef.value.currentTime, root.$accessor.videoProgress),
      5000
    );
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'playing';
    }
  };

  const onVideoPaused = () => {
    videoElement.playing = false;
    saveVideoPosition(videoRef.value.currentTime, root.$accessor.videoProgress);
    clearInterval(videoElement.positionSaveInterval);
    if ('mediaSession' in navigator) {
      (navigator as any).mediaSession.playbackState = 'paused';
    }
  };

  const onVideoCanplay = () => {
    if (videoRef.value && videoElement.firstTimeBuffering) {
      videoRef.value.currentTime = root.$accessor.videoProgress.getSavedPositionForId(
        props.video.videoId
      );
      videoElement.firstTimeBuffering = false;
      if (props.autoplay) {
        videoRef.value.play();
      }
      if ('mediaSession' in navigator && process.browser) {
        const metadata = createMediaMetadata();
        (navigator as any).mediaSession.metadata = metadata;
      }
    }
    videoElement.buffering = false;
  };

  const onVideoBuffering = () => {
    videoElement.buffering = true;
  };

  const onLoaded = () => {
    loading.value = false;
  };

  const loadDashVideo = () => {
    if (videoRef.value) {
      let url = `${root.$store.getters['instances/currentInstanceApi']}manifest/dash/id/${props.video.videoId}?local=true`;
      if (props.video.dashUrl) {
        url = `${props.video.dashUrl}?local=true`;
      }
      dashPlayer.value = dashjs.MediaPlayer().create();
      dashPlayer.initialize(videoRef.value, url, false);
      dashBitrates.value = dashPlayer.getBitrateInfoListFor('video');
    }
  };

  // Interaction events
  const onVolumeInteraction = () => {};
  const onOpenInPlayer = () => {
    window.open(videoUrl.value, '_blank');
  };
  const onOpenInPlayerMouseUp = () => {};
  const onVideoExpand = () => {
    videoElement.zoomed = true;
  };
  const onVideoExpandMouseUp = () => {};
  const onVideoCollapse = () => {
    videoElement.zoomed = false;
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
    }
  };
  const onEnterFullscreenMouseUp = () => {};
  const onLeaveFullscreen = () => {
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
    toggleVideoPlayback();
  };
  const onPlayBtnClick = () => {
    toggleVideoPlayback();
  };

  const onPlayerTouchStart = () => {
    doTouchAction();
    if (playerOverlay.visible) {
      hidePlayerOverlay();
    } else {
      showPlayerOverlay(true);
    }
  };

  const doubleTouchTimer = ref(null);

  const onPlayerTouchEnd = (e: any) => {
    doTouchAction();
    if (!doubleTouchTimer.value) {
      doubleTouchTimer.value = setTimeout(() => {
        doubleTouchTimer.value = null;

        if (seekbar.seeking) {
          seekbar.seeking = false;
          matchSeekProgressPercentage(videoRef, seekbar.seekPercentage, videoElement, true);
        }
      }, 500);
    } else {
      clearTimeout(doubleTouchTimer.value);
      doubleTouchTimer.value = null;

      if (videoPlayerRef.value && e.changedTouches) {
        const pageX = e.changedTouches[0].pageX;
        const containerWidth = videoPlayerRef.value.clientWidth;

        const leftHalf = pageX < containerWidth / 2;
        const rightHalf = pageX > containerWidth / 2;

        if (leftHalf) {
          seekBackward(5);
        } else if (rightHalf) {
          seekForward(5);
        }
      }
    }
  };
  const onPlayerMouseMove = (e: { pageX: number; pageY: number }) => {
    if (!touchAction.value) {
      showPlayerOverlay(false);
      if (seekbar.seeking && videoRef.value) {
        seekbar.seekPercentage = calculateSeekPercentage(e.pageX);
        seekbar.hoverPercentage = calculateSeekPercentage(e.pageX);
        seekbar.hoverTime = root.$formatting.getTimestampFromSeconds(
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
      const pageWidth = Commons.getPageWidth();
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
      const pageWidth = Commons.getPageWidth();
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
      formatFn: root.$formatting.getTimestampFromSeconds
    });

  const onSeekbarMouseMove = (e: any) =>
    seekbarFunctions.onSeekbarMouseMove(e, {
      seekbar,
      videoDuration: videoRef.value.duration,
      formatFn: root.$formatting.getTimestampFromSeconds
    });

  const onSeekbarTouchMove = (e: any) =>
    seekbarFunctions.onSeekbarTouchMove(e, {
      playerOverlayVisible,
      seekbar,
      videoDuration: videoRef.value.duration,
      formatFn: root.$formatting.getTimestampFromSeconds
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

  const onChangeQuality = (index: number) => {
    videoRef.value.pause();
    const currentTime = videoRef.value.currentTime;
    saveVideoPosition(currentTime, root.$accessor.videoProgress);
    videoRef.value.src = props.video.formatStreams[index].url;
    videoRef.value.currentTime = currentTime;
    videoRef.value.play();
    selectedQuality.value = index;
  };

  const createMediaMetadata = () => {
    return mediaMetadataHelper.createMediaMetadata();
  };

  const saveVideoPosition = (currentTime: number, store: any) => {
    if (videoRef.value.video !== undefined) {
      store.addVideoProgress({
        videoId: props.video.videoId,
        value: currentTime
      });
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
    }, 300);
  };

  const setVideoTime = (seconds: number): void => {
    if (seconds >= 0 && seconds <= videoRef.value.duration) videoRef.value.currentTime = seconds;
  };

  onMounted(() => {
    document.addEventListener('keydown', onWindowKeyDown);
  });

  onBeforeUnmount(() => {
    saveVideoPosition(videoRef.value.currentTime, root.$accessor.videoProgress);
    document.removeEventListener('keydown', onWindowKeyDown);
  });
  return {
    loading,
    fullscreen,
    dashPlayer,
    playerOverlay,
    videoElement,
    seekbar,
    commons,
    selectedQuality,
    highestVideoQuality,
    videoVolume,
    videoLength,
    videoUrl,
    playerOverlayVisible,
    videoPlayerRef,
    seekbarHoverPreviewRef,
    chapterTitleRef,
    seekbarHoverTimestampRef,
    videoRef,
    animations,
    chapters,
    sponsorBlockSegments,
    getChapterForPercentage,
    onLoadedMetadata,
    onPlaybackProgress,
    onLoadingProgress,
    onVolumeChange,
    onVideoPlaying,
    onVideoPaused,
    onVideoCanplay,
    onVideoBuffering,
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
    loadDashVideo,
    setVideoTime
  };
};
