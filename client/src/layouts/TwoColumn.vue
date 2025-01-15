<script setup>
  import Splitter from 'primevue/splitter'
  import SplitterPanel from 'primevue/splitterpanel'
</script>

<template>
  <Splitter>
    <SplitterPanel :size="25">
      <aside>
        <slot name="left"/>
      </aside>
    </SplitterPanel>
    <SplitterPanel :size="75">
      <main>    
        <slot />
      </main>
    </SplitterPanel>
  </Splitter>  
</template>

<style scoped>

</style>