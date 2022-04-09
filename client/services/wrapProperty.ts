export const wrapProperty =
  (property, makeComputed = true) =>
  () => {
    const vm = getCurrentInstance().proxy;
    return makeComputed ? computed(() => vm[property]) : vm[property];
  };
