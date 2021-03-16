<template>
  <div class="login">
    <div class="login-container" :class="{ loading: loading, wiggle: formWiggle }">
      <h2 class="login-title">Login</h2>
      <span class="status-message-display message-display">{{ statusMessage }}</span>
      <Spinner />
      <form id="login" method="post" @submit.prevent="login">
        <FormInput :id="'username'" v-model="username" :label="'username'" :type="'username'" />
        <FormInput :id="'password'" v-model="password" :label="'password'" :type="'password'" />
        <SubmitButton :label="'Login'" />
      </form>
    </div>
  </div>
</template>

<script lang="ts">
import FormInput from '@/components/form/FormInput.vue';
import SubmitButton from '@/components/form/SubmitButton.vue';
import Spinner from '@/components/Spinner.vue';
import { defineComponent, ref, useContext, useMeta, useRouter } from '@nuxtjs/composition-api';
import { useAccessor } from '~/store';

export default defineComponent({
  name: 'Login',
  components: {
    FormInput,
    SubmitButton,
    Spinner
  },
  setup() {
    const { from } = useContext();
    const accessor = useAccessor();
    const router = useRouter();

    const loading = ref(false);
    const username = ref(null);
    const password = ref(null);
    const statusMessage = ref('');
    const formWiggle = ref(false);

    const login = async (): Promise<void> => {
      loading.value = true;

      const user = await accessor.user.login({
        username: username.value,
        password: password.value
      });
      if (user && user.success) {
        accessor.messages.createMessage({
          type: 'info',
          title: 'Login successful',
          message: 'Redirecting...'
        });
        console.log(from);
        router.push(from.value);
      } else {
        loading.value = false;
        wiggleLoginForm();
        accessor.messages.createMessage({
          type: 'error',
          title: 'Login failed',
          message: user ? user.error : ''
        });
      }
    };

    const wiggleLoginForm = (): void => {
      formWiggle.value = true;
      setTimeout(() => {
        formWiggle.value = false;
      }, 600);
    };

    useMeta(() => ({
      title: `Login :: ViewTube`,
      meta: [
        {
          hid: 'description',
          vmid: 'descriptionMeta',
          name: 'description',
          content: 'Login to access your ViewTube account'
        },
        {
          hid: 'ogTitle',
          property: 'og:title',
          content: 'Login - ViewTube'
        },
        {
          hid: 'ogDescription',
          property: 'og:description',
          content: 'Login to access your ViewTube account'
        }
      ]
    }));

    return {
      loading,
      username,
      password,
      statusMessage,
      formWiggle,
      login
    };
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

  .login-container {
    margin: auto;
    width: 100%;
    max-width: 500px;
    background-color: var(--bgcolor-alt);
    box-shadow: $medium-shadow;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;

    @media screen and (max-width: $mobile-width) {
      height: auto;
      box-shadow: none;
    }

    &.wiggle {
      animation: wiggle 600ms;
    }

    .login-title {
      margin: 20px 0 0 0;
      font-size: 2rem;
      color: var(--theme-color);
      font-family: $default-font;
    }

    .message-display {
      height: 20px;
      line-height: 20px;
    }

    &.loading {
      #login {
        opacity: 0;
        pointer-events: none;
      }

      .spinner {
        opacity: 1;
      }
    }

    .spinner {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0;
      transition: opacity 300ms $intro-easing;
    }

    #login {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 500px;
      padding: 10px;
      box-sizing: border-box;
      transition: opacity 300ms $intro-easing;
    }
  }
}

@keyframes wiggle {
  20%,
  60% {
    transform: translateX(-10px);
  }
  40%,
  80% {
    transform: translate(10px);
  }
}
</style>
