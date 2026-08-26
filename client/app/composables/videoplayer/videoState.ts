import type { ApiDto } from '@viewtube/shared';
import { clamp, useStorage } from '@vueuse/core';
import { useMessagesStore } from '~/store/messages';
import { useSettingsStore } from '~/store/settings';
import { useUserStore } from '~/store/user';
import { useVideoPlayerStore } from '~/store/videoPlayer';
import { createAdapter } from '~/utils/videoplayer/adapters';
import {
  SSR_SOURCE_REASON,
  type PlayerAdapter,
  type PlayerSource,
  type PlayerSourceKind,
  type PlayerState
} from '~/utils/videoplayer/types';
import { useMediaSession } from './mediaSession';

export type VideoState = ReturnType<typeof useVideoState>;

type VideoStateProps = {
  videoElementRef: Ref<HTMLVideoElement>;
  source: Ref<PlayerSource>;
  video: ApiDto<'VTVideoInfoDto'>;
  videoEnded: () => void;
  startTime?: Ref<number>;
  autoplay?: boolean;
  embed?: boolean;
};

export const useVideoState = ({
  videoElementRef,
  source,
  video,
  videoEnded,
  startTime,
  autoplay,
  embed
}: VideoStateProps) => {
  const settingsStore = useSettingsStore();
  const userStore = useUserStore();
  const videoPlayerStore = useVideoPlayerStore();
  const messagesStore = useMessagesStore();
  const { vtFetch } = useVtFetch();
  const { apiUrl } = useApiUrl();
  const volumeStorage = useStorage('volume', 1);
  const route = useRoute();

  const videoState = reactive<PlayerState>({
    playing: false,
    buffering: true,
    bufferLevel: 0,
    currentTime: 0,
    duration: 0,
    seekMax: 0,
    volume: 1,
    muted: false,
    loop: false,
    speed: 1,
    live: !!video.live,
    liveEdge: null,
    videoTracks: [],
    audioTracks: [],
    languageList: [],
    selectedLanguage: 'en',
    automaticVideoQuality: true,
    automaticAudioQuality: true,
    error: null
  });

  // Derived in one place so adapters only maintain live/liveEdge/duration and can never
  // leave seekMax stale by forgetting one of their write sites.
  watchEffect(() => {
    videoState.seekMax = videoState.live
      ? (videoState.liveEdge ?? videoState.duration)
      : videoState.duration;
  });

  let adapter: PlayerAdapter | null = null;
  let lastKind: PlayerSourceKind | null = null;
  let loadSeq = 0;
  let hasLoadedOnce = false;

  // SABR is the only source that re-issues itself for the same video (po_token expiry).
  // Every other source change reaching this watch is a different video, which must start
  // from its own resume position.
  const isSameVideoReload = (newSource: PlayerSource) => hasLoadedOnce && newSource.kind === 'sabr';

  const load = async (newSource: PlayerSource) => {
    const seq = ++loadSeq;

    if (newSource.kind === 'none') {
      adapter?.destroy();
      adapter = null;
      lastKind = null;
      if (newSource.reason !== SSR_SOURCE_REASON) {
        videoState.error = { code: 'no-source', message: newSource.reason, fatal: true };
        videoState.buffering = false;
      }
      return;
    }
    videoState.error = null;

    if (lastKind !== newSource.kind) {
      adapter?.destroy();
      adapter = null;

      const created = await createAdapter(newSource, {
        videoElementRef,
        state: videoState,
        defaultVolume: volumeStorage,
        loop: settingsStore.alwaysLoopVideo,
        autoplay,
        maximumQuality: settingsStore.maxVideoQuality,
        onEnded: videoEnded,
        createMessage: messagesStore.createMessage
      });

      // A newer load started while the adapter was being built.
      if (seq !== loadSeq) {
        created.destroy();
        return;
      }
      adapter = created;
      lastKind = newSource.kind;
    }

    // Only a same-video source swap resumes mid-playback. A different video arriving
    // through this path must start at its own resume position, not the previous one's.
    const startAt = isSameVideoReload(newSource) ? videoState.currentTime : (startTime?.value ?? 0);

    await adapter.load(newSource, startAt);
    if (seq !== loadSeq) return;

    if (!hasLoadedOnce) {
      hasLoadedOnce = true;
      // Ran synchronously after adapter creation before; the load is async now, so it has
      // to happen here or the configured default speed is never applied.
      setLoop(settingsStore.alwaysLoopVideo);
      setPlaybackRate(settingsStore.defaultVideoSpeed);
    }
  };

  const play = () => adapter?.play();
  const pause = () => {
    adapter?.pause();
    saveVideoPosition();
  };
  const stop = () => adapter?.stop();
  const setVolume = (volume: number) => {
    const clampedVolume = clamp(volume, 0, 1);
    volumeStorage.value = clampedVolume;
    adapter?.setVolume(clampedVolume);
  };
  const setMuted = (muted: boolean) => {
    if (adapter) return adapter.setMuted(muted);
    // Reachable while the poster is still up and the adapter is mid-construction.
    if (videoElementRef.value) videoElementRef.value.muted = muted;
    videoState.muted = muted;
  };
  const setPlaybackRate = (playbackRate: number) => adapter?.setPlaybackRate(playbackRate);
  const setTime = async (time: number) => {
    adapter?.seekTo(time);
    await nextTick();
    saveVideoPosition();
  };
  const setLoop = (loop: boolean) => {
    if (videoElementRef.value) videoElementRef.value.loop = loop;
    videoPlayerStore.setLoop(loop);
  };
  const setLanguage = (language: string) => adapter?.setLanguage(language);
  const setVideoQuality = (videoTrackId: string, videoRepresentationId: string | null) =>
    adapter?.setVideoQuality(videoTrackId, videoRepresentationId);
  const setAudioQuality = (audioTrackId: string, audioRepresentationId: string | null) =>
    adapter?.setAudioQuality(audioTrackId, audioRepresentationId);

  const shouldSaveVideoPosition = () =>
    settingsStore.saveVideoHistory && !embed && userStore.isLoggedIn && !video.live;

  const saveVideoPosition = () => {
    if (!shouldSaveVideoPosition()) return;

    vtFetch(`${apiUrl.value}user/history/${video.id}`, {
      method: 'POST',
      body: {
        progressSeconds: videoState.currentTime,
        lengthSeconds: videoState.duration
      },
      credentials: 'include'
    }).catch(_ => {});
  };

  // A regular fetch is abandoned when the page goes away, which is how the last few
  // minutes of progress get lost. sendBeacon survives teardown; it needs a typed Blob or
  // the body arrives as text/plain and never reaches the JSON body parser.
  const saveVideoPositionBeacon = () => {
    if (!shouldSaveVideoPosition()) return;

    const body = JSON.stringify({
      progressSeconds: videoState.currentTime,
      lengthSeconds: videoState.duration
    });
    navigator.sendBeacon?.(
      `${apiUrl.value}user/history/${video.id}`,
      new Blob([body], { type: 'application/json' })
    );
  };

  const throttledSaveVideoPosition = useThrottleFn(saveVideoPosition, 5000);

  watch(
    () => videoState.currentTime,
    () => {
      throttledSaveVideoPosition();
      videoPlayerStore.setCurrentTime(videoState.currentTime);
      videoPlayerStore.setVideoLength(videoState.seekMax);
    }
  );

  watch(
    () => route.query,
    newValue => {
      if (newValue.t) {
        setTime(Number(newValue.t));
      }
    }
  );

  onMounted(() => {
    // Deferred to mount: videoElementRef is null during setup, and the source computed
    // reads browser globals.
    watch(source, load, { immediate: true });

    if (!(videoElementRef.value instanceof HTMLVideoElement)) return;

    const videoAttributeObserver = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'loop') {
          videoState.loop = videoElementRef.value.loop;
          videoPlayerStore.setLoop(videoElementRef.value.loop);
        }
      });
    });
    videoAttributeObserver.observe(videoElementRef.value, { attributes: true });
    onBeforeUnmount(() => videoAttributeObserver.disconnect());
  });

  useEventListener('pagehide', saveVideoPositionBeacon);

  onBeforeUnmount(() => {
    // Before destroy: tearing down the native adapter resets currentTime to 0, which
    // would otherwise be the position that gets persisted.
    saveVideoPosition();
    adapter?.destroy();
    adapter = null;
    lastKind = null;
  });

  const onNextTrack = () => {
    videoEnded();
  };

  useMediaSession({ video, videoState, play, pause, stop, setTime, onNextTrack });

  return {
    video: videoState,
    play,
    pause,
    stop,
    setVolume,
    setMuted,
    setPlaybackRate,
    setTime,
    setLoop,
    setLanguage,
    setVideoQuality,
    setAudioQuality
  };
};
