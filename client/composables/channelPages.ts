import KeenSlider, { KeenSliderInstance } from 'keen-slider';

export const useChannelPages = () => {
  const route = useRoute();
  const channelId = computed(() => getChannelIdFromParam(route.params.id) ?? null);

  console.log('page', route.params.id, getCurrentPageFromParam(route.params.id));
  const currentPage = ref(getCurrentPageFromParam(route.params.id));
  console.log(currentPage.value);

  const changingSlideProgrammatically = ref(false);
  const initializationPending = ref(true);

  const changePage = (pageName: string, updateSlide = true) => {
    const newUrl = `${cleanChannelParam(window.location.href)}/${pageName}`;
    window.history.replaceState(null, '', newUrl);
    currentPage.value = pageName;

    if (updateSlide) {
      updateSlider(pageName);
    }
  };

  const updateSlider = (pageName: string) => {
    if (sliderInstance.value) {
      changingSlideProgrammatically.value = true;
      const pageIndex = pages.value.findIndex(page => page.pageName === pageName);
      sliderInstance.value?.moveToIdx(pageIndex);
      setTimeout(() => {
        changingSlideProgrammatically.value = false;
      }, 300);
    }
  };

  const sliderInstance = ref<KeenSliderInstance | null>(null);

  const swipeContainerRef = ref<HTMLElement | null>(null);

  onMounted(() => {
    initializationPending.value = false;
    nextTick(() => {
      sliderInstance.value = new KeenSlider(swipeContainerRef.value, {
        slides: {
          origin: 'center'
        },
        initial: pages.value.findIndex(page => page.pageName === currentPage.value),
        rubberband: false,
        created(slider) {
          slider.container.addEventListener(
            'mousedown',
            e => {
              e.stopPropagation();
            },
            { capture: true }
          );
        },
        slideChanged(slider) {
          if (!changingSlideProgrammatically.value) {
            const pageName = pages.value[slider.track.details.rel]?.pageName;
            if (pageName) {
              changePage(pageName, false);
            }
          }
        }
      });
    });
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
    sliderInstance,
    swipeContainerRef,
    initializationPending
  };
};
