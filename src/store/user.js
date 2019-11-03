import Authentication from '@/services/authentication.js'
import VueCookie from 'vue-cookie'
import Commons from '@/commons.js'

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
          VueCookie.set('jwt', result.jwt, {
            expires: 1, domain: Commons.getDomain()
          })
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
    if (VueCookie.get('jwt')) {
      Authentication.getUser(VueCookie.get('jwt'))
        .then(result => {
          me.state.username = result.username
          args.callback(result)
        }, error => {
          let errorMsg = ''
          if (error.message !== undefined) {
            errorMsg = error.message
            VueCookie.delete('jwt', { domain: Commons.getDomain() })
          } else {
            error.then((e) => {
              errorMsg = e.message
              VueCookie.delete('jwt', { domain: Commons.getDomain() })
            })
          }
          args.failure(errorMsg)
        })
    } else {
      args.failure('User not logged in')
    }
  }
}
