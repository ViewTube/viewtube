<template>
  <div class="login" @scroll="$emit('scroll', $event)">
    <vue-headful title="Login - ViewTube" />
    <div class="login-container" :class="{ loading: loading }">
      <h2 class="login-title">Login</h2>
      <p class="error-message-display message-display">{{ state.errorMessage }}</p>
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

<script>
import UserStore from '@/store/user.js'
import FormInput from '@/components/form/FormInput'
import SubmitButton from '@/components/form/SubmitButton'
import Spinner from '@/components/Spinner'

export default {
  name: 'login',
  components: {
    FormInput,
    SubmitButton,
    Spinner
  },
  data: () => ({
    loading: false,
    username: null,
    password: null,
    state: UserStore.state,
    statusMessage: '',
    redirectedPage: 'home'
  }),
  methods: {
    login() {
      this.loading = true
      let me = this
      UserStore.login({
        username: me.username,
        password: me.password,
        callback() {
          me.$router.push(me.redirectedPage.fullPath)
        },
        failure() {
          me.loading = false
        }
      })
    }
  },
  mounted() {
    this.$Progress.finish()
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
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

      &.error-message-display {
        color: var(--error-color-red);
      }
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
