export const useChannelPages = () => {
  const route = useRoute();
  const channelId = computed(() => route.params.id?.toString() ?? null);

  const currentPage = ref(route.query.page?.toString() ?? 'home');

  const changePage = (pageName: string) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', pageName);
    window.history.replaceState(null, '', newUrl);
    currentPage.value = pageName;
  };

  const pages = computed(() => [
    {
      title: 'Home',
      pageName: 'home',
      link: `/channel/${channelId.value}`
    },
    {
      title: 'Videos',
      pageName: 'videos',
      link: `/channel/${channelId.value}?page=videos`
    },
    {
      title: 'Playlists',
      pageName: 'playlists',
      link: `/channel/${channelId.value}?page=playlists`
    },
    {
      title: 'Community',
      pageName: 'community',
      link: `/channel/${channelId.value}?page=community`
    },
    {
      title: 'Channels',
      pageName: 'channels',
      link: `/channel/${channelId.value}?page=channels`
    },
    {
      title: 'About',
      pageName: 'about',
      link: `/channel/${channelId.value}?page=about`
    }
  ]);

  return { pages, currentPage, changePage };
};
