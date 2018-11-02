
import config from '../../config';
import axios from 'axios';
import history from '../../history'

const Auth = {
  isAuthenticated: false,
  user: null,
  init() {
    const token = localStorage.getItem('col_plus_auth_token')
   return (!token) ? new Promise.resolve() : axios(`${config.dataApi}user/me`)
      .then((res) => {
        this.user = res.data
        this.isAuthenticated = true
      })
      .catch((err) => {
        this.user = null
        this.isAuthenticated = false
      })
  },
  authenticate(auth) {
  return  axios(`${config.dataApi}user/login`, { auth })
      .then((res) => {
        localStorage.setItem('col_plus_auth_token', res.data)
        this.isAuthenticated = true
      })
      

  },
  signout() {
    localStorage.removeItem('col_plus_auth_token')
    this.isAuthenticated = false
    this.user = null
    return new Promise.resolve();
  },
  getUser() {
    return this.user;
  },
  hasRole(role) {
    return this.user !== null && this.user.indexOf(role.toLowercase() > -1);
  }

}

export default Auth;