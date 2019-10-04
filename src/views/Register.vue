<template>
  <div class="register">
    <vue-headful title="register - ViewTube" />
    <div class="register-container">
      <h2 class="register-title">register - ViewTube</h2>
      <p class="error-message-display">{{ state.errorMessage }}</p>
      <form id="register" method="post" @submit.prevent="register">
        <input
          id="username"
          class="register-input"
          type="text"
          placeholder="username"
          v-model="username"
          required
          :disabled="loading"
        />
        <input
          id="password"
          class="register-input"
          type="password"
          placeholder="password"
          v-model="password"
          required
          :disabled="loading"
        />
        <button type="submit" class="register-btn ripple">register</button>
      </form>
    </div>
  </div>
</template>

<script>
import UserStore from '@/store/user.js'

export default {
  name: 'register',
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
    register: async function () {
      this.loading = true
      let me = this
      UserStore.register(this.username, this.password, function () {
        me.$router.push(me.redirectedPage.path)
        this.loading = false
      })
    }
  },
  mounted: function () {

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

  .register-container {
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
    justify-content: space-evenly;

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

      .register-input {
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
