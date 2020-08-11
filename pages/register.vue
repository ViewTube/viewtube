<template>
  <div class="register">
    <div class="register-container" :class="{ loading: loading, wiggle: formWiggle }">
      <h2 class="register-title">Register</h2>
      <span class="status-message-display message-display">{{ statusMessage }}</span>
      <Spinner />
      <form id="register" ref="registerForm" method="post" @submit.prevent="register">
        <FormInput :id="'username'" v-model="username" :label="'username'" :type="'username'" />
        <FormInput :id="'password'" v-model="password" :label="'password'" :type="'password'" />
        <FormInput
          :id="'repeat-password'"
          v-model="repeatPassword"
          :label="'Repeat password'"
          :type="'password'"
        />
        <div class="captcha-container">
          <div class="captcha-box">
            <img class="captcha-image" :src="captchaImage" alt="Captcha image">
          </div>
        </div>
        <FormInput
          :id="'image-captcha'"
          v-model="captchaSolution"
          :label="'Captcha'"
          :type="'text'"
        />
        <SubmitButton :label="'Register'" />
      </form>
    </div>
  </div>
</template>

<script>
import FormInput from '@/components/form/FormInput'
import SubmitButton from '@/components/form/SubmitButton'
import Spinner from '@/components/Spinner'

export default {
  name: 'Register',
  components: {
    FormInput,
    SubmitButton,
    Spinner
  },
  data: () => ({
    loading: false,
    username: null,
    password: null,
    repeatPassword: null,
    captchaSolution: null,
    statusMessage: '',
    errorMessage: '',
    redirectedPage: 'home',
    formWiggle: false
  }),
  computed: {
    captchaImage() {
      return this.$store.getters['captcha/image']
    }
  },
  watch: {
    password() {
      this.checkRepeatPasswords()
    },
    repeatPassword() {
      this.checkRepeatPasswords()
    }
  },
  mounted() {
    this.$store.dispatch('captcha/getCaptcha')
  },
  methods: {
    register(e) {
      this.loading = true
      const me = this

      this.$store.dispatch('user/register', {
        username: this.username,
        password: this.password,
        captchaSolution: this.captchaSolution
      })
        .then((result) => {
          me.$store.dispatch('messages/createMessage', {
            type: 'info',
            title: 'Registration successful',
            message: 'Redirecting...'
          })
          me.$router.push(me.redirectedPage.fullPath)
        })
        .catch((err) => {
          console.error(err)
          me.loading = false
          me.$store.dispatch('messages/createMessage', {
            type: 'error',
            title: 'Registration failed',
            message: err.message
          })
          this.wiggleRegisterForm()
          this.$store.dispatch('captcha/getCaptcha')
        })
    },
    wiggleRegisterForm() {
      this.formWiggle = true
      setTimeout(() => {
        this.formWiggle = false
      }, 600)
    },
    checkRepeatPasswords() {
      if (this.password !== this.repeatPassword) {
        this.statusMessage = 'passwords do not match'
      } else {
        this.statusMessage = ''
      }
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
.register {
  display: flex;
  background-size: cover;
  background-repeat: no-repeat;
  background-color: var(--bgcolor-alt);
  height: 100vh;

  @media screen and (min-width: $mobile-width) {
    background-image: url("/img/blur-bg-medium-dark.jpg");
  }

  .register-container {
    margin: auto;
    width: 100%;
    max-width: 500px;
    background-color: var(--bgcolor-alt);
    box-shadow: $max-shadow;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    position: relative;

    @media screen and (max-width: $mobile-width) {
      height: 100%;
    }

    &.wiggle {
      animation: wiggle 600ms;
    }

    .register-title {
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
      #register {
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

    #register {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-height: 10000px;
      max-width: 500px;
      padding: 10px;
      box-sizing: border-box;
      transition: opacity 300ms $intro-easing;

      .captcha-container {
        width: calc(100% - 40px);
        display: flex;
        margin: 20px 20px;
        height: auto;

        .captcha-box {
          border: 2px solid var(--bgcolor-alt-light);
          width: 100%;
          background-color: transparent;
          color: var(--subtitle-color-light);
          border-radius: 4px;
          overflow: hidden;

          .captcha-image {
            width: 100%;
            filter: var(--darkness);
            margin:  -10px 0;
          }
        }
      }
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
