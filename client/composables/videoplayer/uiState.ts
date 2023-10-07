const UI_TIMEOUT = 3000;

export type UIState = ReturnType<typeof useUiState>;

export const useUiState = (videoState: VideoState) => {
  const visible = computed(() => {
    if (_seeking.value || !videoState.video.playing) {
      return true;
    }
    return _visible.value;
  });

  const _visible = ref(true);
  const _seeking = ref(false);
  const setSeeking = (seeking: boolean) => {
    console.log('setSeeking', seeking);
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
    }, 10);
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

  const onPointerUp = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' && e.target instanceof HTMLVideoElement) {
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

    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    setSeeking
  };
};
