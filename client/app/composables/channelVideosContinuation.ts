import type { ApiDto } from '@viewtube/shared';
import { useMessagesStore } from '~/store/messages';

export const useChannelVideosContinuation = (initialData: Ref<ApiDto<'VTChannelFeedDto'>>) => {
  const messagesStore = useMessagesStore();

  const feed = ref(initialData);
  const moreVideosPending = ref(false);

  const onLoadMore = async () => {
    if (!feed.value?.continuation) return;

    moreVideosPending.value = true;
    try {
      const additionalVideos = await getChannelVideosContinuation(feed.value.continuation);
      feed.value.videos = [...feed.value.videos, ...additionalVideos.videos];
      feed.value.continuation = additionalVideos.continuation;
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
    feed,
    moreVideosPending,
    onLoadMore
  };
};
