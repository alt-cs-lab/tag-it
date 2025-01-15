<script setup>
// Libraries
import { RouterView } from 'vue-router'

// Custom components
import MainMenu from './components/MainMenu.vue'

// Stores 
import { useTokenStore } from './stores/token'
const tokenStore = useTokenStore()

// Setup stores
tokenStore.tryToken()

</script>

<template>
  <MainMenu/>
  <RouterView />
</template>

<style scoped>
main {
  height: calc(100vh - 30px);
}
</style>
