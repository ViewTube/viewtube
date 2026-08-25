import type { ApiDto } from '@viewtube/shared';
import { useMessagesStore } from '~/store/messages';

export const useChannelPlaylistsContinuation = (
  initialData: Ref<ApiDto<'VTChannelPlaylistsDto'>>
) => {
  const messagesStore = useMessagesStore();

  const feed = ref(initialData);
  const morePlaylistsPending = ref(false);

  const onLoadMore = async () => {
    if (!feed.value?.continuation) return;

    morePlaylistsPending.value = true;
    try {
      const additionalPlaylists = await getChannelPlaylistsContinuation(feed.value.continuation);
      feed.value.playlists = [...feed.value.playlists, ...additionalPlaylists.playlists];
      feed.value.continuation = additionalPlaylists.continuation;
    } catch (error) {
      messagesStore.createMessage({
        type: 'error',
        title: 'Failed to load more playlists',
        message:
          (error as any).message ??
          "More playlists don't seem to be available, or something went wrong."
      });
    }
    morePlaylistsPending.value = false;
  };

  return {
    feed,
    morePlaylistsPending,
    onLoadMore
  };
};
