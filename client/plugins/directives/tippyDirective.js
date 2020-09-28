import tippy from 'tippy.js';

let tippyInstance = null;

export default {
  bind(el, binding) {
    if (binding.value && binding.value.length > 0) {
      tippyInstance = tippy(el, {
        duration: 300,
        content: binding.value,
        arrow: false,
        delay: [500, 100],
        touch: 'hold',
        placement: 'bottom'
      });
    }
  },

  update(_, binding) {
    if (tippyInstance && binding.value !== binding.oldValue) {
      tippyInstance.setProps({ content: binding.value });
    }
  },

  unbind() {
    if (!tippyInstance.state.isDestroyed) {
      tippyInstance.destroy();
    }
  }
};
