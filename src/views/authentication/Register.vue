<template>
  <div class="register">
    <vue-headful title="Register - ViewTube" />
    <div class="register-container" :class="{ loading: loading }">
      <h2 class="register-title">Register</h2>
      <p class="error-message-display message-display">{{ state.errorMessage }}</p>
      <span class="status-message-display message-display">{{ statusMessage }}</span>
      <Spinner />
      <form id="register" method="post" @submit.prevent="register" ref="registerForm">
        <FormInput :id="'username'" v-model="username" :label="'username'" :type="'username'" />
        <FormInput :id="'password'" v-model="password" :label="'password'" :type="'password'" />
        <FormInput
          :id="'repeat-password'"
          v-model="repeatPassword"
          :label="'Repeat password'"
          :type="'password'"
        />
        <div class="captcheck_container"></div>
        <SubmitButton :label="'Register'" />
      </form>
    </div>
  </div>
</template>

<script>
import UserStore from '@/store/user.js'
import Captcheck from '@/services/captcheck.js'
import FormInput from '@/components/form/FormInput'
import SubmitButton from '@/components/form/SubmitButton'
import Spinner from '@/components/Spinner'

export default {
  name: 'register',
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
    state: UserStore.state,
    statusMessage: '',
    redirectedPage: 'home'
  }),
  methods: {
    register(e) {
      this.loading = true
      let me = this

      let formData = this.$refs.registerForm.elements
      let captcheckSessionCode = formData['captcheck_session_code'].value
      let captcheckSelectedAnswer = formData['captcheck_selected_answer'].value

      Captcheck.reloadCaptcheck()

      UserStore.register({
        username: me.username,
        password: me.password,

        captcheckSessionCode: captcheckSessionCode,
        captcheckSelectedAnswer: captcheckSelectedAnswer,

        callback() {
          me.statusMessage = 'Registration successful. Redirecting'
          me.$router.push(me.redirectedPage.fullPath)
        },
        failure() {
          me.loading = false
        }
      })
    },
    checkRepeatPasswords() {
      if (this.password !== this.repeatPassword) {
        this.statusMessage = 'passwords do not match'
      } else {
        this.statusMessage = ''
      }
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
    this.$Progress.finish()
    Captcheck.initCaptcheck()
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
.register {
  width: 100%;
  height: 100%;
  display: flex;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  background-color: var(--bgcolor-alt);
  padding-top: $header-height;

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

      .captcheck_container {
        width: calc(100% - 40px);
        display: flex;
        margin: 20px 20px;
        border-radius: 4px;
        height: 125px;

        .captcheck_box {
          padding: 12px 12px;
          margin: auto;
          border: 2px solid var(--bgcolor-alt-light);
          width: 100%;
          background-color: transparent;
          color: var(--subtitle-color-light);

          .captcheck_label_message,
          .captcheck_label_message b {
            color: var(--subtitle-color-light);
            font-family: $default-font;
            margin: 0 0 10px 0;
          }

          .captcheck_answer_images {
            width: 100%;
            height: 70px;

            flex-direction: row;
            justify-content: space-between;

            &:not([style="display: none;"]) {
              display: flex !important;
            }

            .captcheck_answer_label {
              input + img {
                width: 100%;
                filter: invert(100) opacity(1);
                transition: border 300ms $intro-easing;
              }

              input:checked + img {
                cursor: pointer;
                border: 2px solid var(--bgcolor-alt-light);
                border-radius: 4px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
