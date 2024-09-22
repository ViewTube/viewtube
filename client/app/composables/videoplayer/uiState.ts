import type { ApiDto } from '@viewtube/shared';
import { usePopupStore } from '~/store/popup';
import { useSettingsStore } from '~/store/settings';

const UI_TIMEOUT = 3000;

export type UiState = ReturnType<typeof useUIState>;

export const useUIState = (
  videoState: VideoState,
  video: Ref<ApiDto<'VTVideoInfoDto'>>,
  flipPlayerUIRef: Ref<HTMLDivElement | null>,
  captionsState: CaptionsState,
  hidden?: Ref<boolean>
) => {
  const popupStore = usePopupStore();
  const settingsStore = useSettingsStore();

  const visible = computed(() => {
    if (_seeking.value || !videoState.video.playing) {
      return true;
    }
    return _visible.value;
  });

  const toggleCaptions = () => {
    if (captionsState.availableCaptionTracks.value?.length > 0) {
      if (captionsState.currentTrackCode.value) {
        captionsState.selectCaptionsTrack(null);
        triggerEffect('toggleCaptions');
      } else {
        captionsState.selectCaptionsTrack(
          captionsState.availableCaptionTracks.value[0].languageCode
        );
        triggerEffect('toggleCaptions');
      }
    }
  };

  const { getSegmentState } = useSponsorBlockUtils();
  const { getCurrentSegment, skipSegments } = useSponsorBlockState(video);

  const skipCurrentSponsorBlockSegment = (skipOnly = false) => {
    if (!settingsStore.sponsorblockEnabled) return;

    const currentSegment = getCurrentSegment(videoState.video.currentTime);
    if (!currentSegment) return;

    const segmentState = getSegmentState(currentSegment.category);

    if (segmentState === 'none') return;
    if (skipOnly && segmentState !== 'skip') return;

    videoState.setTime(currentSegment.segment[1]);
  };

  watch(
    () => videoState.video.currentTime,
    (newValue, oldValue) => {
      if (newValue !== oldValue) {
        skipCurrentSponsorBlockSegment(true);
      }
    }
  );

  const fullscreen = ref(false);
  const toggleFullscreen = () => {
    if (fullscreen.value) {
      document.exitFullscreen();
    } else {
      flipPlayerUIRef.value?.requestFullscreen();
    }
  };
  const updateFullscreen = () => {
    fullscreen.value = !!document.fullscreenElement;
  };

  const visualEffects = reactive({
    skipForward: {
      visible: false,
      position: 'right',
      duration: 500
    },
    skipBackward: {
      visible: false,
      position: 'left',
      duration: 500
    },
    volumeUp: {
      visible: false,
      position: 'center',
      duration: 500
    },
    volumeDown: {
      visible: false,
      position: 'center',
      duration: 500
    },
    toggleCaptions: {
      visible: false,
      position: 'center',
      duration: 500
    }
  });
  const triggerEffect = (effect: keyof typeof visualEffects) => {
    const triggeredEffect = visualEffects[effect];
    triggeredEffect.visible = true;
    setTimeout(() => {
      triggeredEffect.visible = false;
    }, triggeredEffect.duration);
  };

  type VisibleEffect = {
    name: keyof typeof visualEffects;
    duration: number;
    position: string;
  };

  const visibleEffects = computed<VisibleEffect[]>(() => {
    const visibleEffectsArray: VisibleEffect[] = [];

    Object.keys(visualEffects).forEach((key: keyof typeof visualEffects) => {
      const effect = visualEffects[key];
      if (effect.visible) {
        visibleEffectsArray.push({
          name: key,
          duration: effect.duration,
          position: effect.position
        });
      }
    });

    return visibleEffectsArray;
  });

  const posterVisible = ref(true);

  const hidePoster = () => {
    posterVisible.value = false;
  };

  watch(
    () => videoState.video.playing,
    newValue => {
      if (newValue === true) {
        posterVisible.value = false;
      }
    }
  );

  const { handleKeydown } = useKeydownActions(
    videoState,
    posterVisible,
    toggleFullscreen,
    triggerEffect,
    toggleCaptions,
    skipCurrentSponsorBlockSegment
  );

  onBeforeMount(() => {
    document.addEventListener('fullscreenchange', updateFullscreen);
    window.addEventListener('keydown', handleKeydown);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', updateFullscreen);
    window.removeEventListener('keydown', handleKeydown);
  });

  const settingsOpen = ref(false);

  const openSettings = () => {
    settingsOpen.value = true;
    window.addEventListener('keydown', onCloseSettings);
    popupStore.setPopupOpen(true);
  };

  const onCloseSettings = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      window.removeEventListener('keydown', onCloseSettings);
      closeSettings();
    }
  };

  const closeSettings = () => {
    settingsOpen.value = false;
    popupStore.setPopupOpen(false);
  };

  const _visible = ref(true);
  const _seeking = ref(false);
  const setSeeking = (seeking: boolean) => {
    _seeking.value = seeking;
    if (!seeking) {
      showUI();
    }
  };

  const cursor = computed(() => {
    return visible.value ? 'default' : 'none';
  });

  const showUITimeout = ref<number | NodeJS.Timeout>();
  const showUI = () => {
    _visible.value = true;
    clearTimeout(showUITimeout.value);
    showUITimeout.value = setTimeout(() => {
      _visible.value = false;
    }, UI_TIMEOUT);
  };

  const hideUI = () => {
    _visible.value = false;
    clearTimeout(showUITimeout.value);
  };

  const touchEvent = ref(false);

  const doubleTouchTimeout = ref<number | NodeJS.Timeout>();
  const doubleTouchPosition = ref({ x: 0, y: 0 });

  const onPointerDown = (e: PointerEvent) => {
    if (hidden?.value) return true;

    if (e.pointerType !== 'touch') return;
    touchEvent.value = true;
    if (!(e.target instanceof HTMLVideoElement)) return;
    if (!doubleTouchTimeout.value) {
      doubleTouchTimeout.value = setTimeout(() => {
        clearTimeout(doubleTouchTimeout.value);
        doubleTouchTimeout.value = undefined;

        if (!visible.value) {
          showUI();
        } else {
          hideUI();
        }
      }, 250);

      doubleTouchPosition.value = { x: e.clientX, y: e.clientY };
    } else {
      clearTimeout(doubleTouchTimeout.value);
      doubleTouchTimeout.value = undefined;
      const distanceX = e.clientX - doubleTouchPosition.value.x;
      const distanceY = e.clientY - doubleTouchPosition.value.y;
      if (Math.abs(distanceX) < 50 && Math.abs(distanceY) < 50) {
        const container = e.target as HTMLVideoElement;
        const containerRect = container.getBoundingClientRect();

        const leftHalf = e.clientX < containerRect.left + containerRect.width / 2;
        const rightHalf = e.clientX > containerRect.left + containerRect.width / 2;

        if (leftHalf) {
          videoState.setTime(videoState.video.currentTime - 10);
          triggerEffect('skipBackward');
        }

        if (rightHalf) {
          videoState.setTime(videoState.video.currentTime + 10);
          triggerEffect('skipForward');
        }
      }
    }
  };

  const pointerMoveTimeout = ref<number | NodeJS.Timeout>();
  const onPointerMove = (e: PointerEvent) => {
    if (hidden?.value) return true;

    clearTimeout(pointerMoveTimeout.value);
    pointerMoveTimeout.value = setTimeout(() => {
      if (e.pointerType === 'mouse' && !touchEvent.value) {
        showUI();
      }
    }, 1);
  };

  const onPointerLeave = (e: PointerEvent) => {
    if (hidden?.value) return true;

    clearTimeout(pointerMoveTimeout.value);
    if (e.pointerType === 'mouse' && !touchEvent.value) {
      hideUI();
    }

    if (e.pointerType === 'mouse') {
      touchEvent.value = false;
    }
  };

  const doubleClickTimeout = ref<number | NodeJS.Timeout>();

  const onPointerUp = (e: PointerEvent) => {
    if (hidden?.value) return true;

    if (e.pointerType === 'mouse' && e.target instanceof HTMLVideoElement) {
      if (!doubleClickTimeout.value) {
        doubleClickTimeout.value = setTimeout(() => {
          clearTimeout(doubleClickTimeout.value);
          doubleClickTimeout.value = undefined;
        }, 300);
      } else {
        clearTimeout(doubleClickTimeout.value);
        doubleClickTimeout.value = undefined;
        toggleFullscreen();
      }

      if (e.button === 0) {
        if (videoState.video.playing) {
          videoState.pause();
        } else {
          videoState.play();
        }
      }
    }
  };

  return {
    visible,
    cursor,
    fullscreen,
    settingsOpen,
    visibleEffects,
    skipSegments,
    posterVisible,

    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    setSeeking,
    getCurrentSegment,

    hidePoster,
    toggleFullscreen,
    openSettings,
    closeSettings,
    triggerEffect
  };
};
