<template>
  <div class="login">
    <div
      class="login-container"
      :class="{ loading: loading }"
    >
      <h2 class="login-title">Login</h2>
      <span class="status-message-display message-display">{{ statusMessage }}</span>
      <Spinner />
      <form
        id="login"
        method="post"
        @submit.prevent="login"
      >
        <FormInput
          :id="'username'"
          v-model="username"
          :label="'username'"
          :type="'username'"
        />
        <FormInput
          :id="'password'"
          v-model="password"
          :label="'password'"
          :type="'password'"
        />
        <SubmitButton :label="'Login'" />
      </form>
    </div>
  </div>
</template>

<script>
import FormInput from '@/components/form/FormInput'
import SubmitButton from '@/components/form/SubmitButton'
import Spinner from '@/components/Spinner'

export default {
  name: 'Login',
  components: {
    FormInput,
    SubmitButton,
    Spinner
  },
  data: () => ({
    loading: false,
    username: null,
    password: null,
    statusMessage: '',
    redirectedPage: 'home'
  }),
  mounted() {
  },
  methods: {
    login() {
      this.loading = true
      const me = this

      this.$store.dispatch('user/login', {
        username: this.username,
        password: this.password
      })
        .then((result) => {
          me.$store.dispatch('messages/createMessage', {
            type: 'info',
            title: 'Login successful',
            message: 'Redirecting...'
          })
          me.$router.push(me.redirectedPage.fullPath)
        })
        .catch((err) => {
          console.error(err)
          me.loading = false
          me.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Login failed',
            message: err.message
          })
        })
    }
  },
  beforeRouteEnter(to, from, next) {
    next((vm) => {
      if (from.name) {
        vm.redirectedPage = from
      } else {
        vm.redirectedPage = {
          fullPath: '/'
        }
      }
    })
  }
}
</script>

<style lang="scss">
.login {
  width: 100%;
  height: 100%;
  display: flex;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: var(--bgcolor-alt);
  padding-top: $header-height;

  @media screen and (min-width: $mobile-width) {
    background-image: url("/img/blur-bg-medium-dark.jpg");
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
      height: 100%;
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
</style>
