<script setup>

// Layouts
import OneColumn from '@/layouts/OneColumn.vue'
import TwoColumn from '@/layouts/TwoColumn.vue'

// Custom Components
import ProjectCreator from '@/components/ProjectCreator.vue'
import ProjectSelector from '@/components/ProjectSelector.vue'
import ProjectDetails from '@/components/ProjectDetails.vue'

// Stores
import {useProjectStore} from '@/stores/projects'
const projectStore = useProjectStore()

// Load the project data when mounted
projectStore.fetch()

</script>

<template>
  <TwoColumn v-if="projectStore.selectedProject">
    <ProjectDetails/>
    <template #left>
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <h2>Projects</h2> 
        <ProjectCreator/>
      </div>
      <ProjectSelector/>
    </template>
  </TwoColumn>
  <div v-else>
    <OneColumn>      
      <div style="display: flex; flex-direction: row; justify-content: space-between;">
        <h2>Projects</h2> 
        <ProjectCreator/>
      </div>
      <ProjectSelector />
    </OneColumn>
  </div>
</template>