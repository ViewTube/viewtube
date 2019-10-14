import Authentication from '@/services/authentication.js'

export default {
  state: {
    errorMessage: null,
    username: null
  },
  register (args) {
    this.state.errorMessage = null
    let me = this
    if (!this.isAuthenticated()) {
      Authentication.register(args.username, args.password, args.captcheckSessionCode, args.captcheckSelectedAnswer)
        .then(result => {
          args.callback(result)
        }, error => {
          if (error.message !== undefined) {
            me.state.errorMessage = error.message
          } else {
            error.then((e) => {
              me.state.errorMessage = e.message
            })
          }
          args.failure()
        })
    } else {
      this.state.errorMessage = 'You are already logged in'
      args.failure()
    }
  },
  login (args) {
    this.state.errorMessage = null
    let me = this
    if (!this.isAuthenticated()) {
      Authentication.login(args.username, args.password)
        .then(result => {
          window.sessionStorage.setItem('jwt', result.jwt)
          me.state.username = result.username
          args.callback(result)
        }, error => {
          let me = this
          if (error.message !== undefined) {
            me.state.errorMessage = error.message
          } else {
            error.then((e) => {
              me.state.errorMessage = e.message
            })
          }
          args.failure()
        })
    } else {
      this.state.errorMessage = 'You are already logged in'
      args.failure()
    }
  },
  isAuthenticated () {
    return Boolean(this.state.username)
  },
  async logout () {
    // this.state.errorMessage = null
    // if (this.isAuthenticated()) {
    //   await kuzzle.connect()
    //   try {
    //     await kuzzle.auth.logout()
    //     window.sessionStorage.removeItem('jwt')
    //     this.state.username = null
    //     return true
    //   } catch (error) {
    //     console.error(error.message)
    //     this.state.errorMessage = error.message
    //     return false
    //   } finally {
    //     kuzzle.disconnect()
    //   }
    // }
  },
  getCurrentUser (args) {
    this.state.errorMessage = null
    let me = this
    if (window.sessionStorage.getItem('jwt')) {
      Authentication.getUser(window.sessionStorage.getItem('jwt'))
        .then(result => {
          me.state.username = result.username
          args.callback(result)
        }, error => {
          let errorMsg = ''
          if (error.message !== undefined) {
            errorMsg = error.message
            window.sessionStorage.removeItem('jwt')
          } else {
            error.then((e) => {
              errorMsg = e.message
              window.sessionStorage.removeItem('jwt')
            })
          }
          args.failure(errorMsg)
        })
    } else {
      args.failure('User not logged in')
    }
  }
}
