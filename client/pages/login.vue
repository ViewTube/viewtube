<template>
  <div class="login">
    <LoginForm />
  </div>
</template>

<script lang="ts">
import { defineComponent, useMeta } from '#imports';
import LoginForm from '@/components/form/LoginForm.vue';

export default defineComponent({
  name: 'Login',
  components: { LoginForm },
  setup() {
    useHead({
      title: 'Login',
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'Sign in to access your ViewTube account'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Sign in - ViewTube'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'Sign in to access your ViewTube account'
        }
      ]
    });
  },
  head: {}
});
</script>

<style lang="scss">
.login {
  display: flex;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: var(--bgcolor-alt);
  height: calc(100vh - #{$header-height});
  padding: $header-height 0 0 0;

  @media screen and (min-width: $mobile-width) {
    background-image: url('/img/blur-bg-medium-dark.jpg');
  }
}
</style>
