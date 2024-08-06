import { useMessagesStore } from '~/store/messages';
import type { ApiDto } from '@viewtube/shared';

export const useChannelVideosContinuation = <T extends ApiDto<'ChannelVideosDto'>>(
  initialData: Ref<T>
) => {
  const messagesStore = useMessagesStore();

  const videos = ref(initialData);
  const moreVideosPending = ref(false);

  const onLoadMore = async () => {
    if (!videos.value.continuation) return;

    moreVideosPending.value = true;
    try {
      const additionalVideos = await getChannelVideosContinuation(videos.value.continuation);
      videos.value.items = [...videos.value.items, ...additionalVideos.items];
      videos.value.continuation = additionalVideos.continuation;
    } catch (error) {
      messagesStore.createMessage({
        type: 'error',
        title: 'Failed to load more videos',
        message:
          (error as any).message ??
          "More videos don't seem to be available, or something went wrong."
      });
    }
    moreVideosPending.value = false;
  };

  return {
    videos,
    moreVideosPending,
    onLoadMore
  };
};
