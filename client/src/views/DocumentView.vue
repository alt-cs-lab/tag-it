<script setup>
import {ref} from 'vue'
import Splitter from 'primevue/splitter'
import SplitterPanel from 'primevue/splitterpanel'
import Listbox from 'primevue/listbox'

import TagDocument from '../components/TagDocument.vue'
import AnnotatedDocument from '@/components/AnnotatedDocument.vue'

const documents = ref([
  {id: 1, filename: 'foo.txt', text: "it was the best of times, it was the worst of times."},
  {id: 2, filename: 'bar.txt', text: "on the far side of the ocean blue."}
])

const selectedDocument = ref(0)

</script>

<template>
  <main>
    <Splitter :height="500">
      <SplitterPanel class="flex items-center justify-center" :size="25" width="100%">
        Panel 1
        <Listbox v-model="selectedDocument" :options="documents" optionLabel="filename" optionValue="id"/>
      </SplitterPanel>
      <SplitterPanel class="flex items-center justify-center" :size="75">
        Panel 2
        <AnnotatedDocument text="The quick brown fox flew the coop"/>
      </SplitterPanel>
    </Splitter>
  </main>
</template>

<style scoped>
  .p-splitter, .p-splitterpanel {
    height: 100%;
    overflow: auto;
  }
</style>