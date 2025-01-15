// Imports
import { defineStore } from 'pinia'
//import Logger from 'js-logger'

// Services
import api from '@/services/api'
import Logger from 'js-logger'

export const useProjectStore = defineStore('projects', {
  state: () => ({
    selectedProject: null,
    projects: []
  }),
  getters: {
    projectById: (id) => (state) => state.projects.find(project => project.projectId == id)
  },
  actions: {
    /** Fetch the list of projects from the api */
    async fetch() {
      Logger.info('projects:fetch')
      const response = await api.get('/api/v1/projects')
      this.projects = response.data
    },
    async select(projectId) {
      Logger.info('projects.select')
      const response = await api.get(`/api/v1/projects/${projectId}`)
      this.selectedProject = response.data
    },
    async create(name) {
      Logger.info('projects.create')
      const response = await api.post(`/api/v1/projects`, {name})
      this.selectedProject = response.data
    },
    async addUsers(projectId, usernames) {
      Logger.info('projects.addUsers')
      await api.post(`/api/v1/projects/${projectId}/users`, {usernames})
    }
  }
})