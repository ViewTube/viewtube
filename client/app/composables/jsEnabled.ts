export const useJsEnabled = () => {
  const jsEnabled = ref(false);

  onMounted(() => {
    jsEnabled.value = true;
  });

  return { jsEnabled };
};
