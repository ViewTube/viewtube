import kuzzle from '@/services/kuzzle.js'

export default {
  state: {
    errorMessage: null,
    username: null
  },
  async login (username, password) {
    this.state.errorMessage = null
    await kuzzle.connect()
    let jwt = null
    try {
      jwt = await kuzzle.auth.login('local', {
        username,
        password
      })
    } catch (error) {
      console.log(error)
    } finally {
      window.sessionStorage.setItem('jwt', jwt)
      kuzzle.disconnect()
    }
  },
  isAuthenticated () {
    return Boolean(this.state.username)
  },
  getCurrentUser (callback) {
    var jwt = window.sessionStorage.getItem('jwt')
    if (!jwt) {
      // eslint-disable-next-line standard/no-callback-literal
      callback('No current user.')
      kuzzle.setJwtToken(undefined)
      return false
    }
    kuzzle.setJwtToken(jwt)

    kuzzle
      .whoAmI((error, kuzzleUser) => {
        if (error) {
          window.sessionStorage.removeItem('jwt')
          kuzzle.setJwtToken(undefined)
          callback(error)

          return false
        }

        this.state.username = kuzzleUser.id

        callback(null, kuzzleUser)
      })
  }
}
