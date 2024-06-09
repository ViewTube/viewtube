import { usePopupStore } from '@/store/popup';

type ModifierKey = 'shiftKey' | 'altKey' | 'ctrlKey' | 'metaKey';

interface KeydownAction {
  keys?: string[];
  keyRegex?: RegExp;
  modifierKeys?: ModifierKey[];
  allowedOnPoster?: boolean;
  pausedOnly?: boolean;
  action: (e: KeyboardEvent) => void;
}

export const useKeydownActions = (
  videoState: VideoState,
  posterVisible: Ref<boolean>,
  toggleFullscreen: () => void,
  triggerEffect: (effect: string) => void,
  toggleCaptions: () => void,
  skipSponsorBlockSegment: () => void
) => {
  const popupStore = usePopupStore();

  const keydownActions: KeydownAction[] = [
    {
      keys: [' ', 'k'],
      allowedOnPoster: true,
      action: () => {
        if (posterVisible.value) {
          if (!videoState.video.buffering) {
            posterVisible.value = false;
            videoState.play();
          }
        } else {
          if (videoState.video.playing) {
            videoState.pause();
          } else {
            videoState.play();
          }
        }
      }
    },
    {
      keys: ['ArrowLeft', 'j'],
      action: () => {
        videoState.setTime(videoState.video.currentTime - 10);
        triggerEffect('skipBackward');
      }
    },
    {
      keys: ['ArrowRight', 'l'],
      action: () => {
        videoState.setTime(videoState.video.currentTime + 10);
        triggerEffect('skipForward');
      }
    },
    {
      keys: ['ArrowUp'],
      action: () => {
        videoState.setVolume(videoState.video.volume + 0.1);
        triggerEffect('volumeUp');
      }
    },
    {
      keys: ['ArrowDown'],
      action: () => {
        videoState.setVolume(videoState.video.volume - 0.1);
        triggerEffect('volumeDown');
      }
    },
    {
      keys: ['m'],
      action: () => {
        videoState.setMuted(!videoState.video.muted);
      }
    },
    {
      keys: ['f'],
      action: () => {
        toggleFullscreen();
      }
    },
    {
      keyRegex: /^\d$/i,
      action: e => {
        const skipInterval = videoState.video.duration / 10;
        const skipNumber = parseInt(e.key);
        videoState.setTime(skipInterval * skipNumber);
      }
    },
    {
      keys: ['End'],
      action: () => {
        videoState.setTime(videoState.video.duration);
      }
    },
    {
      keys: ['.'],
      pausedOnly: true,
      action: () => {
        const frameTime = getFrameTime();
        videoState.setTime(videoState.video.currentTime + frameTime);
      }
    },
    {
      keys: [','],
      pausedOnly: true,
      action: () => {
        const frameTime = getFrameTime();
        videoState.setTime(videoState.video.currentTime - frameTime);
      }
    },
    {
      keys: ['c'],
      action: () => {
        toggleCaptions();
      }
    },
    {
      keys: ['n'],
      modifierKeys: ['shiftKey'],
      action: () => {
        // TODO: Implement next video
        console.log('next video');
      }
    },
    {
      keys: ['p'],
      modifierKeys: ['shiftKey'],
      action: () => {
        // TODO: Implement previous video
        console.log('previous video');
      }
    },
    {
      keys: ['Enter'],
      action: () => {
        skipSponsorBlockSegment();
      }
    }
  ];

  const handleKeydown = (e: KeyboardEvent) => {
    if (popupStore.popupOpen) return;

    const keydownAction = keydownActions.find(action => {
      if (action.keys?.length > 0) {
        return action.keys.map(key => key.toLowerCase()).includes(e.key.toLowerCase());
      } else if (action.keyRegex) {
        return action.keyRegex.test(e.key);
      }
    });

    if (typeof keydownAction?.action !== 'function') return;

    if (posterVisible.value && !keydownAction.allowedOnPoster) return;

    if (keydownAction.modifierKeys) {
      const correctModifierKeysPressed = keydownAction.modifierKeys.every(modifierKey => {
        return e[modifierKey];
      });

      const incorrectModifierKeysPressed = Object.keys(e).some((key: ModifierKey) => {
        return keydownAction.modifierKeys.includes(key) && !e[key];
      });

      if (!correctModifierKeysPressed || incorrectModifierKeysPressed) return;
    }

    if (keydownAction.pausedOnly && videoState.video.playing) return;

    keydownAction.action(e);
    e.preventDefault();
  };

  const getFrameTime = () => {
    const currentFramerate =
      videoState.video.videoTracks
        ?.find(track => track.active)
        ?.representations?.find(rep => rep.active)?.frameRate ?? 30;
    const frameTime = 1 / currentFramerate;
    return frameTime;
  };

  return {
    handleKeydown
  };
};
