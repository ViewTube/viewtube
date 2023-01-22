import { Swiper } from 'swiper';

export const useChannelPages = () => {
  const route = useRoute();
  const channelId = computed(() => getChannelIdFromParam(route.params.id) ?? null);

  const currentPage = ref(getCurrentPageFromParam(route.params.id));

  const currentPageIndex = computed(() => {
    return pages.value.findIndex(page => page.pageName === currentPage.value);
  });

  const swiperInstance = ref<Swiper>(null);

  const onSwiperInstance = (swiper: Swiper) => {
    swiperInstance.value = swiper;

    swiper.on('slideChange', swiper => {
      const page = pages.value[swiper.activeIndex];
      changePage(page.pageName);
    });
  };

  const changePage = (pageName: string) => {
    const newUrl = `${cleanChannelParam(window.location.href)}/${pageName}`;
    window.history.replaceState(null, '', newUrl);
    currentPage.value = pageName;

    const index = pages.value.findIndex(page => page.pageName === pageName);
    if (swiperInstance.value?.activeIndex !== index) {
      swiperInstance.value.slideTo(index);
    }
  };

  const swipeContainerRef = ref<HTMLElement | null>(null);

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
    currentPageIndex,
    changePage,
    swipeContainerRef,
    onSwiperInstance
  };
};
