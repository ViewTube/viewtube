export const useIsIOS = () => {
  const isIOSOnIPhone = computed(() => {
    return /iPhone/.test(navigator?.userAgent);
  });

  return {
    isIOSOnIPhone
  };
};
