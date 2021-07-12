import { DirectiveBinding } from 'vue/types/options';

export default {
  inserted(el: HTMLElement, binding: DirectiveBinding) {
    const click = (evt: Event) => {
      if (binding.value(evt, el)) {
        document.body.removeEventListener('click', click);
      }
    };
    document.body.addEventListener('click', click, true);
  }
};
