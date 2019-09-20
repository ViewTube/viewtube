import kuzzle from '@/services/kuzzle.js'

export default {
  state: {
    errorMessage: null,
    username: null
  },
  async login (username, password, callback) {
    if (kuzzle) {
      this.state.errorMessage = null
      await kuzzle.connect()
      let jwt = null
      try {
        jwt = await kuzzle.auth.login('local', {
          username,
          password
        })
        return jwt
      } catch (error) {
        this.state.errorMessage = error.message
        return null
      } finally {
        if (jwt) {
          window.sessionStorage.setItem('jwt', jwt)
          let user = await kuzzle.auth.getCurrentUser()
          this.state.username = user._id
          callback()
        }
        kuzzle.disconnect()
      }
    } else {
      console.error('kuzzle not defined')
    }
  },
  isAuthenticated () {
    return Boolean(this.state.username)
  },
  async logout () {
    this.state.errorMessage = null
    if (this.isAuthenticated()) {
      await kuzzle.connect()
      try {
        await kuzzle.auth.logout()
        window.sessionStorage.removeItem('jwt')
        this.state.username = null
        return true
      } catch (error) {
        console.error(error.message)
        this.state.errorMessage = error.message
        return false
      } finally {
        kuzzle.disconnect()
      }
    }
  },
  async getCurrentUser (callback) {
    if (kuzzle) {
      this.state.errorMessage = null
      await kuzzle.connect()
      var jwt = window.sessionStorage.getItem('jwt')
      if (!jwt) {
        // eslint-disable-next-line standard/no-callback-literal
        callback('No current user.')
        kuzzle.auth.logout()
        return false
      }
      kuzzle.auth.authenticationToken = jwt
      if (kuzzle.auth.checkToken()) {
        try {
          const user = await kuzzle.auth.getCurrentUser()
          if (user) {
            this.state.username = user._id
            callback(null, user._id)
            return user._id
          }
        } catch (error) {
          window.sessionStorage.removeItem('jwt')
          kuzzle.auth.logout()
          callback(error)
          return false
        } finally {
          kuzzle.disconnect()
        }
      } else {
        kuzzle.disconnect()
        return false
      }
    } else {
      console.error('kuzzle not defined')
    }
  }
}
