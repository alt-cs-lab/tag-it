// Imports
import process from 'node:process'
import { defineStore } from 'pinia'
//import Logger from 'js-logger'

// Services
import api from '@/services/api'
import Logger from 'js-logger'

// Stores

// Variables


export const useDocumentStore = defineStore('documents', {
  state: () => ({
    selectedDocumentId: null,
    projects: [
      {projectId: 1, name: "First"},
      {projectId: 2, name: "Second"},
      {projectId: 3, name: "Third"}
    ]
  }),
  getters: {
    selectedProject: (state) => state.projects.find(project => project.projectId == state.selectedProjectId),
    allProjects: (state) => state.projects,
    projectById: (id) => (state) => state.projects.find(project => project.projectId == id)
  },
  actions: {
    setSelectedProject(projectOrId) {      
      var id = typeof projectOrId === "number" ? projectOrId : projectOrId.id
      console.log({projectOrId, id})
      this.selectedProjectId = id
    },
    /** Fetch the project documents from the api */
    async fetch() {
      Logger.info('documents:fetch')
      const response = await api.get('/api/v1/projects')
      this.courses = response.data
    }
  }
})