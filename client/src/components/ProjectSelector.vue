<script setup>
// Library imports
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia';

// Vueprime components
import Listbox from 'primevue/listbox'

// Stores
import {useProjectStore} from '../stores/projects';
const projectsStore = useProjectStore();
const { projects } = storeToRefs(projectsStore)

// Variables
const selectedProjectId = ref(null)

// Watchers 
watch(selectedProjectId, async (projectId) => {
  await projectsStore.select(projectId)
})

</script>

<template>
  <Listbox v-model="selectedProjectId" :options="projects" optionLabel="name" optionValue="projectId" filter />
</template>

