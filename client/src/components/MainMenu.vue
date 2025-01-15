<script setup>
// Libraries
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

import Menubar from 'primevue/menubar'

// Menu items
const items = ref([
  {
    label: 'Home',
    icon: 'pi pi-home',
    command: () => {
      router.push({ name: 'home' })
    }
  }
])
</script>

<template>
  <Menubar :model="items"></Menubar>
</template>