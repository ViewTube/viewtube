import { vueDirective } from 'modern-js-ripple';

export default defineNuxtPlugin(nuxtApp => {
  nuxtApp.vueApp.directive('ripple', vueDirective);
});
