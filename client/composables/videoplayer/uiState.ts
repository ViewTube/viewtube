const UI_TIMEOUT = 3000;

export type UIState = ReturnType<typeof useUIState>;

export const useUIState = (videoState: VideoState, flipPlayerUIRef: Ref<HTMLDivElement>) => {
  const visible = computed(() => {
    if (_seeking.value || !videoState.video.playing) {
      return true;
    }
    return _visible.value;
  });

  const fullscreen = ref(false);

  const updateFullscreen = () => {
    fullscreen.value = !!document.fullscreenElement;
  };

  onBeforeMount(() => {
    document.addEventListener('fullscreenchange', updateFullscreen);
  });

  onBeforeUnmount(() => {
    document.removeEventListener('fullscreenchange', updateFullscreen);
  });

  const toggleFullscreen = () => {
    if (fullscreen.value) {
      document.exitFullscreen();
    } else {
      flipPlayerUIRef.value?.requestFullscreen();
    }
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
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType === 'touch') {
      touchEvent.value = true;
      if (e.target instanceof HTMLVideoElement) {
        if (!visible.value) {
          showUI();
        } else {
          hideUI();
        }
      }
    }
  };

  const pointerMoveTimeout = ref<number | NodeJS.Timeout>();
  const onPointerMove = (e: PointerEvent) => {
    clearTimeout(pointerMoveTimeout.value);
    pointerMoveTimeout.value = setTimeout(() => {
      if (e.pointerType === 'mouse' && !touchEvent.value) {
        showUI();
      }
    }, 1);
  };

  const onPointerLeave = (e: PointerEvent) => {
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

      if (videoState.video.playing) {
        videoState.pause();
      } else {
        videoState.play();
      }
    }
  };

  return {
    visible,
    cursor,
    fullscreen,

    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    setSeeking,

    toggleFullscreen
  };
};
