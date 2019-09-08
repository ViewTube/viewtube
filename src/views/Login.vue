<template>
  <div class="login">
    <vue-headful title="Login - ViewTube" />
    <Spinner class="centered" v-if="loading"></Spinner>
    <p class="error-message-display">{{ state.errorMessage }}</p>
    <div class="login-container">
      <form id="login" method="post" @submit.prevent="login">
        <input
          id="username"
          class="username-input"
          type="text"
          placeholder="username"
          v-model="username"
          required
        />
        <input
          id="password"
          class="password-input"
          type="password"
          placeholder="password"
          v-model="password"
          required
        />
        <button type="submit" class="login-btn">Login</button>
      </form>
    </div>
  </div>
</template>

<script>
import Spinner from '@/components/Spinner'
import UserStore from '@/store/user.js'

export default {
  name: 'login',
  components: {
    Spinner
  },
  data: function () {
    return {
      loading: false,
      username: null,
      password: null,
      state: UserStore.state
    }
  },
  methods: {
    login: async function () {
      try {
        let success = await UserStore.login(this.username, this.password)
        console.log(success)
      } catch (error) {
        console.error(error.message)
      }
    }
  },
  mounted: function () {
  },
  beforeRouteEnter (to, from, next) {
    next()
  }
}
</script>

<style lang="scss">
.login {
  .home-videos-container {
    width: 100%;
    max-width: $main-width;
    margin: 0 auto;
    z-index: 10;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly;

    @media screen and (max-width: $mobile-width) {
      flex-direction: column;
    }
  }
}
</style>
