const UI_TIMEOUT = 3000;

export const useUiState = () => {
  const uiState = reactive({
    visible: true
  });

  const cursor = computed(() => {
    return uiState.visible ? 'default' : 'none';
  });

  const showUITimeout = ref<number | NodeJS.Timeout>();
  const showUI = () => {
    uiState.visible = true;
    clearTimeout(showUITimeout.value);
    showUITimeout.value = setTimeout(() => {
      // uiState.visible = false;
    }, UI_TIMEOUT);
  };

  const hideUI = () => {
    // uiState.visible = false;
    clearTimeout(showUITimeout.value);
  };

  const onMouseMove = (_e: MouseEvent) => {
    showUI();
  };
  const onMouseLeave = (_e: MouseEvent) => {
    hideUI();
  };

  return {
    uiState,
    cursor,

    onMouseMove,
    onMouseLeave
  };
};
