<template>
  <div class="login-form" :class="{ loading: loading, wiggle: formWiggle }">
    <h2 class="login-title">Sign in</h2>
    <span class="status-message-display message-display">{{ statusMessage }}</span>
    <Spinner />
    <form id="login" method="post" @submit.prevent="login">
      <FormInput :id="'username'" v-model="username" :label="'username'" :type="'username'" />
      <FormInput :id="'password'" v-model="password" :label="'password'" :type="'password'" />
      <SubmitButton :label="'Sign in'" />
    </form>
  </div>
</template>

<script lang="ts">
import FormInput from '@/components/form/FormInput.vue';
import SubmitButton from '@/components/form/SubmitButton.vue';
import Spinner from '@/components/Spinner.vue';
import { useAccessor } from '@/store';
import { defineComponent, ref, useRoute, useRouter } from '@nuxtjs/composition-api';

export default defineComponent({
  name: 'LoginForm',
  components: {
    FormInput,
    SubmitButton,
    Spinner
  },
  props: {
    complete: Function
  },
  setup(props) {
    const route = useRoute();
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
          message: `Welcome, ${username.value}`
        });
        if (props.complete && typeof props.complete === 'function') {
          props.complete();
        } else {
          router.push((route.value.query.ref as string) || '/');
        }
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

    return {
      loading,
      username,
      password,
      statusMessage,
      formWiggle,
      login
    };
  }
});
</script>

<style lang="scss">
.login-form {
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
