import auth0 from 'auth0-js'

export default {
  authenticated: false,

  auth0: new auth0.WebAuth({
    domain: '<%= options.subdomain %>.auth0.com',
    clientID: '<%= options.clientID %>',
    redirectUri: `${window.location.origin}/callback`,
    responseType: 'token'
  }),

  profile: {},

  isLoggedIn() {
    const expiry = window.localStorage.getItem('expiresAt')

    return !!window.localStorage.getItem('accessToken') && !!expiry && new Date().getTime() < expiry
  },

  init() {
    this.authenticated = this.isLoggedIn()

    if (this.authenticated) {
      this.profile = JSON.parse(window.localStorage.getItem('profile'))
    }
  },

  login() {
    this.auth0.authorize()
  },

  logout() {
    this.removeSession()
  },

  handleCallback(next) {
    this.auth0.parseHash((err, result) => {
      if (err) {
        return next(err)
      }

      this.setSession(result)
      return next()
    })
  },

  setSession(result) {
    window.localStorage.setItem('accessToken', result.accessToken)
    window.localStorage.setItem('idToken', result.idToken)
    window.localStorage.setItem('profile', JSON.stringify(result.idTokenPayload))
    window.localStorage.setItem('expiresAt', result.expiresIn * 1000 + new Date().getTime())

    this.authenticated = true
    this.profile = result.idTokenPayload
  },

  removeSession() {
    window.localStorage.removeItem('accessToken')
    window.localStorage.removeItem('idToken')
    window.localStorage.removeItem('profile')
    window.localStorage.removeItem('expiresAt')

    this.authenticated = false
    this.profile = {}

    window.location.reload()
  }
}
