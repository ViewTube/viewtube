import { ApiErrorDto, VideoDto } from 'viewtube/shared';
import { useSettingsStore } from '~~/store/settings';
import { useUserStore } from '~~/store/user';

type VideoType = VideoDto & { initialVideoTime: number };

export const useGetVideos = (id: string | string[]) => {
  const config = useRuntimeConfig();
  const userStore = useUserStore();
  const settingsStore = useSettingsStore();

  const saveToHistory = video => {
    if (userStore.isLoggedIn) {
      $fetch(`${config.public.apiUrl}user/history/${id}`, {
        body: {
          progressSeconds: null,
          lengthSeconds: video.value.lengthSeconds
        },
        credentials: 'include'
      }).catch(_ => {});
    }
  };

  return useLazyAsyncData<VideoType, ApiErrorDto>(id as string, async () => {
    const value = await $fetch<VideoDto>(`${config.public.apiUrl}videos/${id}`);

    let initialVideoTime = 0;
    if (userStore.isLoggedIn && settingsStore.saveVideoHistory) {
      const videoVisit = await $fetch<any>(`${config.public.apiUrl}user/history/${value.videoId}`, {
        credentials: 'include'
      }).catch((_: any) => {});

      if (videoVisit?.progressSeconds > 0) {
        initialVideoTime = videoVisit.data.progressSeconds;
      } else {
        saveToHistory(value);
      }
    }

    return { ...value, initialVideoTime };
  });
};
