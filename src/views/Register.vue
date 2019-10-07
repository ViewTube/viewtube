<template>
  <div class="register">
    <vue-headful title="register - ViewTube" />
    <div class="register-container">
      <h2 class="register-title">Register</h2>
      <p class="error-message-display">{{ state.errorMessage }}</p>
      <p class="status-message-display">{{ statusMessage }}</p>
      <form id="register" method="post" @submit.prevent="register" :class="{ loading: loading }">
        <div class="register-input-container">
          <input
            id="username"
            class="register-input"
            :class="{ 'focus-content': usernameHasText }"
            type="text"
            v-model="username"
            required
            :disabled="loading"
          />
          <label for="username" class="input-label">username</label>
        </div>
        <div class="register-input-container">
          <input
            id="password"
            class="register-input"
            :class="{ 'focus-content': passwordHasText }"
            type="password"
            v-model="password"
            required
            :disabled="loading"
          />
          <label for="password" class="input-label">password</label>
        </div>
        <div class="register-input-container">
          <input
            id="repeat-password"
            class="register-input"
            :class="{ 'focus-content': repeatPasswordHasText }"
            type="password"
            v-model="repeatPassword"
            ref="repeatPassword"
            required
            :disabled="loading"
          />
          <label for="password" class="input-label">repeat password</label>
        </div>
        <div class="captcheck_container"></div>
        <input type="submit" class="register-btn ripple" :disabled="loading" value="register" />
      </form>
    </div>
  </div>
</template>

<script>
import UserStore from '@/store/user.js'
import Captcheck from '@/services/captcheck.js'

export default {
  name: 'register',
  data: function () {
    return {
      loading: false,
      username: null,
      password: null,
      repeatPassword: null,
      state: UserStore.state,
      statusMessage: '',
      redirectedPage: 'home'
    }
  },
  methods: {
    register: async function () {
      this.loading = true
      let me = this
      UserStore.register(this.username, this.password, function () {
        me.statusMessage = 'Registration successful. redirecting...'
        // me.$router.push(me.redirectedPage.path)
      })
    },
    checkRepeatPasswords: function () {
      if (this.password !== this.repeatPassword) {
        this.$refs.repeatPassword.setCustomValidity('passwords do not match')
      } else {
        this.$refs.repeatPassword.setCustomValidity('')
      }
    }
  },
  watch: {
    password: function () {
      this.checkRepeatPasswords()
    },
    repeatPassword: function () {
      this.checkRepeatPasswords()
    }
  },
  mounted: function () {
    this.$Progress.finish()
    Captcheck.initCaptcheck()
  },
  computed: {
    usernameHasText() {
      return this.username && this.username.length > 0
    },
    passwordHasText() {
      return this.password && this.password.length > 0
    },
    repeatPasswordHasText() {
      return this.repeatPassword && this.repeatPassword.length > 0
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from.name) {
        vm.redirectedPage = from
      } else {
        vm.redirectedPage = {
          path: '/'
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
  background-image: url("/img/blur-bg-medium-dark.jpg");
  background-size: cover;
  background-repeat: no-repeat;

  .register-container {
    margin: auto;
    width: 100%;
    max-width: 500px;
    background-color: $bgcolor-alt;
    box-shadow: $max-shadow;
    border-radius: 3px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;

    @media screen and (max-width: $mobile-width) {
      height: 100%;
    }

    .register-title {
      margin: 20px 0 0 0;
      font-size: 2rem;
      color: $theme-color;
      font-family: $default-font;
    }

    #register {
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 500px;
      padding: 10px;
      box-sizing: border-box;

      &.loading {
        filter: opacity(0.5);
      }

      .register-input-container {
        position: relative;
        $input-line-height: 50px;

        .register-input {
          margin: 20px 20px;
          padding: 12px 12px;
          line-height: 30px;
          border-radius: 4px;
          width: calc(100% - 40px);
          height: $input-line-height;

          font-size: 1rem;
          border-style: none;
          color: $title-color;
          box-sizing: border-box;
          font-family: $default-font;
          background-color: transparent;
          border: 2px solid $bgcolor-alt-light;
          transition: border 300ms $intro-easing;

          &:focus {
            border-color: $theme-color;
          }

          &:focus,
          &.focus-content {
            padding: 20px 12px 4px 12px;
          }

          &:not(:valid) {
            box-shadow: none;
            border-color: $error-color-red;
          }
        }

        .input-label {
          position: absolute;
          left: 34px;
          top: 20px;
          height: $input-line-height;
          line-height: $input-line-height;
          text-align: center;
          margin: auto;
          pointer-events: none;
          transition: transform 300ms $intro-easing, color 300ms $intro-easing;
          transform-origin: left top;
          color: $subtitle-color-light;
        }

        .focus-content ~ .input-label,
        .register-input:focus ~ .input-label {
          transform: scale(0.8) translateY(-10px);
        }

        .register-input:focus ~ .input-label {
          color: $theme-color;
        }
      }

      .register-btn {
        font-size: 1rem;
        border-style: none;
        width: calc(100% - 40px);
        text-align: center;
        cursor: pointer;
        user-select: none;
        margin: 20px 20px;
        background: $theme-color-primary-gradient;
        padding: 8px 0;
        border-radius: 5px;
        box-sizing: border-box;
        color: $title-color;
        box-shadow: $low-shadow;
        transition: box-shadow 300ms $intro-easing;

        &:hover {
          box-shadow: $max-shadow;
        }
      }
    }
  }
}
</style>
