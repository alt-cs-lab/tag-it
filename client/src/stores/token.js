// Imports
import { defineStore } from 'pinia'
import { jwtDecode } from 'jwt-decode'
import Logger from 'js-logger'

// Services
import api from '@/services/api'

export const useTokenStore = defineStore('token', {
  state: () => {
    return {
      token: ''      
    }
  },
  getters: {
    /**
     * Gets the user's eID
     *
     * @returns String: the user's eID
     */
    eid() {
      if (this.token) {
        return jwtDecode(this.token)['eid']
      } else {
        return false
      }
    },
    /**
     * Gets the user's internal ID
     *
     * @returns String: the user's internal ID
     */
    // id() {
    //   if (this.token) {
    //     return jwtDecode(this.token)['user_id']
    //   } else {
    //     return ''
    //   }
    // },
    /**
     * Gets the user's admin status
     *
     * @returns Boolean: true if the user is an admin, otherwise false
     */
    // is_admin() {
    //   if (this.token) {
    //     return jwtDecode(this.token)['roles'].includes('admin')
    //   } else {
    //     return false
    //   }
    // },
    /**
     * Gets the user's user status
     *
     * @returns Boolean: true if the user is a user, otherwise false
     */
    // is_user() {
    //   if (this.token) {
    //     return jwtDecode(this.token)['roles'].includes('user')
    //   } else {
    //     return false
    //   }
    // }
  },
  actions: {
    /**
     * Gets a token from the API using an existing cookie session
     */
    async getToken() {
      Logger.info('token:get')
      await api
        .get('/auth/token', { withCredentials: true })
        .then((response) => {
          this.token = response.data.token
        })
        .catch((err) => {
          // If the response is a 401 error, the user is not logged in
          if (err.response && err.response.status === 401) {
            this.token = ''
            Logger.info('token:get login failed - redirecting to CAS')
            Logger.error(err)
            window.location.href = '/auth/login'
          } else {
            Logger.error('token:get error' + err)
            this.token = ''
          }
        })
    },

    /**
     * Tries the existing token or refresh token to establish a session
     */
    async tryToken() {
      Logger.info('token:try')
      await api
        .get('/auth/token', { withCredentials: true })
        .then((response) => {
          this.token = response.data.token
        })
        .catch(async (err) => {
          // If the current token fails, try the refresh token
          if (err.response && err.response.status === 401) {
            this.token = ''
            Logger.info('token:try login failed ')
          } else {
            this.token = ''
            Logger.error('token:try error' + err)
          }
        })
    },

    /**
     * Log the user out and clear the token
     */
    async logout() {
      this.token = ''
      window.location.href = '/auth/logout'
    }
  }
})