<template>
  <div class="register">
    <RegisterForm />
  </div>
</template>

<script lang="ts">

import RegisterForm from '@/components/form/RegisterForm.vue';

export default defineComponent({
  name: 'Register',
  components: {
    RegisterForm
  },
  setup() {
    useMeta(() => ({
      title: `Register :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'Create a ViewTube account'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Sign up - ViewTube'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'Create a ViewTube account'
        }
      ]
    }));
  },
  head: {}
});
</script>

<style lang="scss">
.register {
  display: flex;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: var(--bgcolor-alt);
  height: calc(100vh - #{$header-height});
  padding: $header-height 0 0 0;
  overflow: scroll;

  @media screen and (min-width: $mobile-width) {
    background-image: url('/img/blur-bg-medium-dark.jpg');
  }
}
</style>
