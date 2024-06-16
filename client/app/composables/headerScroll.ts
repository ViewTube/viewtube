export const useHeaderScroll = () => {
  const scrollPosition = ref(0);
  const prevScrollPosition = ref(0);
  const absoluteStartPosition = ref(0);
  const topPosition = ref(0);
  const posAbsolute = ref(false);
  const topPositionPx = computed(() => `${topPosition.value}px`);

  onMounted(() => {
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
  });

  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
  });

  const handleScroll = () => {
    setScrollPosition(window.pageYOffset);
  };

  const setScrollPosition = (pos: number) => {
    scrollPosition.value = pos;
    if (scrollPosition.value > prevScrollPosition.value && posAbsolute.value === false) {
      absoluteStartPosition.value = scrollPosition.value;
      posAbsolute.value = true;
    }
    if (scrollPosition.value < absoluteStartPosition.value && posAbsolute.value === true) {
      posAbsolute.value = false;
    }
    if (
      scrollPosition.value < prevScrollPosition.value &&
      scrollPosition.value > absoluteStartPosition.value + 80 &&
      posAbsolute.value === true
    ) {
      absoluteStartPosition.value = scrollPosition.value - 80;
    }
    prevScrollPosition.value = scrollPosition.value;

    if (pos <= 0) {
      posAbsolute.value = false;
    }
    topPosition.value = posAbsolute.value ? absoluteStartPosition.value : 0;
  };

  return {
    posAbsolute,
    topPositionPx
  };
};
