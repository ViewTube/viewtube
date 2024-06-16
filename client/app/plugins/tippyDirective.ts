import tippy from 'tippy.js';

export default defineNuxtPlugin(nuxtApp => {
  let tippyInstance: any = null;

  nuxtApp.vueApp.directive('tippy', {
    created(el, binding) {
      if (binding.value?.length > 0) {
        tippyInstance = tippy(el, {
          duration: 250,
          content: binding.value,
          arrow: false,
          delay: [100, 100],
          touch: 'hold',
          placement: 'bottom'
        });
      }
    },

    updated(_: any, binding: any) {
      if (tippyInstance && !tippyInstance.state.isDestroyed && binding.value !== binding.oldValue) {
        tippyInstance.setProps({ content: binding.value });
      }
    },

    beforeUnmount() {
      if (!tippyInstance.state.isDestroyed) {
        tippyInstance.destroy();
      }
    }
  });
});
