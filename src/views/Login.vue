<template>
  <div class="login">
    <vue-headful title="Login - ViewTube" />
    <div class="login-container">
      <h2 class="login-title">Login - ViewTube</h2>
      <p class="error-message-display">{{ state.errorMessage }}</p>
      <form id="login" method="post" @submit.prevent="login">
        <input
          id="username"
          class="login-input"
          type="text"
          placeholder="username"
          v-model="username"
          required
          :disabled="loading"
        />
        <input
          id="password"
          class="login-input"
          type="password"
          placeholder="password"
          v-model="password"
          required
          :disabled="loading"
        />
        <button type="submit" class="login-btn ripple">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import UserStore from '@/store/user.js'
import Messages from '@/store/notifications.js'

export default {
  name: 'login',
  data: function () {
    return {
      loading: false,
      username: null,
      password: null,
      state: UserStore.state,
      redirectedPage: 'home'
    }
  },
  methods: {
    login: async function () {
      this.loading = true
      try {
        let me = this
        let success = await UserStore.login(this.username, this.password, function () {
          me.$router.push(me.redirectedPage.path)
        })
        this.loading = false
        console.log(success)
      } catch (error) {
        console.error(error.message)
      }
    }
  },
  mounted: async function () {
    await Messages.subscribeMessages()
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
.login {
  width: 100%;
  height: 100%;
  display: flex;
  .login-container {
    margin: auto;
    height: 100%;
    max-height: 500px;
    width: 100%;
    max-width: 600px;
    background-color: $bgcolor-alt;
    box-shadow: $medium-shadow;
    display: flex;
    flex-direction: column;
    align-items: center;

    .login-title {
      margin: 20px 0;
      font-size: 2rem;
      color: $theme-color;
      font-family: $default-font;
    }

    #login {
      margin: auto;
      display: flex;
      flex-direction: column;
      width: 100%;
      max-width: 500px;
      padding: 10px;
      box-sizing: border-box;

      .login-input {
        font-size: 1.1rem;
        background-color: transparent;
        border-style: none;
        color: $title-color;
        margin: 20px 20px;
        width: calc(100% - 40px);
        border-bottom: 2px solid $theme-color;
        line-height: 30px;
        font-family: $default-font;
      }

      .login-btn {
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
