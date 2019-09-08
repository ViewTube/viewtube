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
      return jwt
    } catch (error) {
      this.state.errorMessage = error.message
      return null
    } finally {
      if (jwt) {
        window.sessionStorage.setItem('jwt', jwt)
        let user = await kuzzle.auth.getCurrentUser()
        this.state.username = user._id
        console.log(user._id)
      }
      kuzzle.disconnect()
    }
  },
  async isAuthenticated () {
    if (!this.state.username) {
      if (window.sessionStorage.getItem('jwt')) {
        console.log(window.sessionStorage.getItem('jwt'))
        await kuzzle.connect()
        const token = window.sessionStorage.getItem('jwt')
        const tokenCheck = await kuzzle.auth.checkToken(token)
        console.log(tokenCheck)
      }
      return false
    }
    return true
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
