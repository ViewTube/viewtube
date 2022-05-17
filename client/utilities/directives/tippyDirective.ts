import tippy from 'tippy.js';

let tippyInstance: any = null;

export default {
  bind(el: HTMLElement, binding: any) {
    if (binding.value && binding.value.length > 0) {
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

  update(_: any, binding: any) {
    if (tippyInstance && !tippyInstance.state.isDestroyed && binding.value !== binding.oldValue) {
      tippyInstance.setProps({ content: binding.value });
    }
  },

  unbind() {
    if (!tippyInstance.state.isDestroyed) {
      tippyInstance.destroy();
    }
  }
};
