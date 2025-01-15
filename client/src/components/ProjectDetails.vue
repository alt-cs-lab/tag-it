<script setup>

// Library imports
import { storeToRefs } from 'pinia'
import { RouterLink } from 'vue-router'

// Primevue components
import Panel from 'primevue/panel'

// Custom components
import ProjectSharer from '@/components/ProjectSharer.vue'

// Stores
import { useProjectStore } from '../stores/projects'
const projectsStore = useProjectStore()
const { selectedProject } = storeToRefs(projectsStore)
</script>

<template>
  <div v-if="selectedProject" style="height: 100%">    
    <h1>{{ selectedProject.name }}</h1>
    
    <!--IftaLabel>
      <Select :options="methods" value="Open Coding" class="w-full"/>
      <label>Current Method</label>
    </IftaLabel-->

    <div style="display: grid; grid-template-columns: 1fr 1fr;">
        <Panel>
          <span style="float: right;">
            +
          </span>
          <h3>Documents</h3>
          <ul>
            <li v-for="document in selectedProject.documents" v-bind:key="document.documentId">
              <RouterLink :to="`/projects/${selectedProject.projectId}/documents/${document.documentId}`">
                {{ document.filename }}
              </RouterLink>
              {{ JSON.stringify(document) }}
            </li>
          </ul>
        </Panel>
        <Panel>
          <span style="float: right;">
            <ProjectSharer/>
          </span>
          <h3>Users</h3>
          <ul>
            <li v-for="user in selectedProject.users" v-bind:key="user.id">
              {{ user.username }}
            </li>
          </ul>
        </Panel>    
      </div>
  </div>
</template>
