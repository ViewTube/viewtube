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
    redirectedPage: 'home',
    formWiggle: false
  }),
  head() {
    return {
      title: `Login - ViewTube`,
      meta: [
        { hid: 'description', vmid: 'descriptionMeta', name: 'description', content: 'Login to access your ViewTube account' },
        { hid: 'ogTitle', property: 'og:title', content: 'Login - ViewTube' },
        { hid: 'ogDescription', property: 'og:description', content: 'Login to access your ViewTube account' }
      ]
    }
  },
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
          if (result) {
            me.$store.dispatch('messages/createMessage', {
              type: 'info',
              title: 'Login successful',
              message: 'Redirecting...'
            })
            me.$router.push(me.redirectedPage.fullPath)
          }
        })
        .catch((err) => {
          console.error(err)
          me.loading = false
          this.wiggleLoginForm()
          me.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Login failed',
            message: err.response.data.message
          })
        })
    },
    wiggleLoginForm() {
      this.formWiggle = true
      setTimeout(() => {
        this.formWiggle = false
      }, 600)
    },
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
  display: flex;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: var(--bgcolor-alt);
  height: calc(100vh - #{$header-height});
  padding: $header-height 0 0 0;

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
  20%, 60%{
    transform: translateX(-10px);
  }
  40%, 80%{
    transform: translate(10px);
  }
}
</style>
