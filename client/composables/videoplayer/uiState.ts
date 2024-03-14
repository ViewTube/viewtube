import { usePopupStore } from '@/store/popup';
import { useKeydownActions } from './keydownActions';

const UI_TIMEOUT = 3000;

export type UIState = ReturnType<typeof useUIState>;

export const useUIState = (videoState: VideoState, flipPlayerUIRef: Ref<HTMLDivElement>) => {
  const popupStore = usePopupStore();

  const visible = computed(() => {
    if (_seeking.value || !videoState.video.playing) {
      return true;
    }
    return _visible.value;
  });

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
      duration: 300
    },
    skipBackward: {
      visible: false,
      position: 'left',
      duration: 300
    },
    volumeUp: {
      visible: false,
      position: 'center',
      duration: 300
    },
    volumeDown: {
      visible: false,
      position: 'center',
      duration: 300
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

  const { handleKeydown } = useKeydownActions(videoState, toggleFullscreen, triggerEffect);

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

    onPointerMove,
    onPointerLeave,
    onPointerDown,
    onPointerUp,
    setSeeking,

    toggleFullscreen,
    openSettings,
    closeSettings,
    triggerEffect
  };
};
