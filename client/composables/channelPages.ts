import KeenSlider, { KeenSliderInstance } from 'keen-slider';

export const useChannelPages = () => {
  const route = useRoute();
  const channelId = computed(() => route.params.id?.toString() ?? null);

  const currentPage = ref(route.query.page?.toString() ?? 'home');

  const changingSlideProgrammatically = ref(false);

  const changePage = (pageName: string, updateSlide = true) => {
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('page', pageName);
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
    sliderInstance.value = new KeenSlider(swipeContainerRef.value, {
      slides: {
        origin: 'center'
      },
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

  return { pages, currentPage, changePage, sliderInstance, swipeContainerRef };
};
