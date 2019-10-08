import Authentication from '@/services/authentication.js'

export default {
  state: {
    errorMessage: null,
    username: null
  },
  register(args) {
    this.state.errorMessage = null
    if (!this.isAuthenticated()) {
      Authentication.register(args.username, args.password, args.captcheckSessionCode, args.captcheckSelectedAnswer)
        .then(result => {
          this.state.username = result.username
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
  login(username, password, callback) {
    // this.state.errorMessage = null
    // await kuzzle.connect()
    // let jwt = null
    // try {
    //   jwt = await kuzzle.auth.login('local', {
    //     username,
    //     password
    //   })
    //   return jwt
    // } catch (error) {
    //   this.state.errorMessage = error.message
    //   return null
    // } finally {
    //   if (jwt) {
    //     window.sessionStorage.setItem('jwt', jwt)
    //     let user = await kuzzle.auth.getCurrentUser()
    //     this.state.username = user._id
    //     callback()
    //   }
    //   kuzzle.disconnect()
    // }
  },
  isAuthenticated() {
    return Boolean(this.state.username)
  },
  async logout() {
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
  async getCurrentUser(callback) {
    // if (kuzzle) {
    //   this.state.errorMessage = null
    //   await kuzzle.connect()
    //   var jwt = window.sessionStorage.getItem('jwt')
    //   if (!jwt) {
    //     // eslint-disable-next-line standard/no-callback-literal
    //     callback('No current user.')
    //     kuzzle.auth.logout()
    //     return false
    //   }
    //   kuzzle.auth.authenticationToken = jwt
    //   if (kuzzle.auth.checkToken()) {
    //     try {
    //       const user = await kuzzle.auth.getCurrentUser()
    //       if (user) {
    //         this.state.username = user._id
    //         callback(null, user._id)
    //         return user._id
    //       }
    //     } catch (error) {
    //       window.sessionStorage.removeItem('jwt')
    //       kuzzle.auth.logout()
    //       callback(error)
    //       return false
    //     } finally {
    //       kuzzle.disconnect()
    //     }
    //   } else {
    //     kuzzle.disconnect()
    //     return false
    //   }
    // } else {
    //   console.debug('kuzzle not defined')
    // }
  }
}
