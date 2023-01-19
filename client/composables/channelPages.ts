export const useChannelPages = () => {
  const route = useRoute();
  const channelId = computed(() => getChannelIdFromParam(route.params.id) ?? null);

  const currentPage = ref(getCurrentPageFromParam(route.params.id));

  const swiperInstance = ref(null);

  const initializationPending = ref(true);

  const onSwiperInstance = swiper => {
    swiperInstance.value = swiper;
  };

  const changePage = (pageName: string) => {
    const newUrl = `${cleanChannelParam(window.location.href)}/${pageName}`;
    window.history.replaceState(null, '', newUrl);
    currentPage.value = pageName;
  };

  const swipeContainerRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    initializationPending.value = false;
  });

  const cleanChannelParam = (url: string) => {
    let newUrl = url;
    pages.value.forEach(page => {
      newUrl = newUrl.replaceAll(page.pageName, '');
    });
    newUrl = newUrl.replace(/\/*$/gi, '');
    return new URL(newUrl).href;
  };

  const pages = computed(() => {
    const pages = ['home', 'videos', 'playlists', 'community', 'channels', 'about'];
    return pages.map(page => ({
      title: page.charAt(0).toUpperCase() + page.slice(1),
      pageName: page,
      link: `/channel/${channelId.value}/${page}`
    }));
  });

  return {
    pages,
    currentPage,
    changePage,
    swipeContainerRef,
    initializationPending,
    onSwiperInstance
  };
};
