<script setup>

import { ref, onMounted } from 'vue'
import colors from '../utils/highlight-colors'
    

  const text = `1.1.2 New courses developed or being developed:
CC 111 for Preservice Teachers This is a special section of CC 111 intended for pre-service teachers. It incorporates
a significant amount of Scratch programming into the course, while also introducing Python as in the normal
sections. Students are allowed to select from either language for the large programming assignments, and the
Python lab assignments are somewhat reduced to give more time to Scratch lab assignments. I piloted it in Fall
2024 with three preservice (math) teachers. The students displayed a reasonable amount of Scratch proficiency and
a weak knowledge of Python by the end of the course - sufficient for the purpose of the one-hour lab. I will continue
to revise, and we will be incorporating the Scratch assignments into future 711 course offerings as well.
K-State Cat Communities Bridge Course I have been working with the K-State CAT Communities to create a CAT
community for pre-education students. Students in the community will take CC 110/111 and EDCI 110 (or EDCI
111) at the same time as the bridge course, which brings together the ideas of teaching and computer science
brought up in the two courses with lots of hands-on activities to help students see how CS can be integrated into
K-12 education at all levels. We were set to pilot in Fall 2024, but did not get the enrollments. We are hoping to
leverage the Cyber Pipeline to reach and recruit students for Fall 2025.`
const annotations = ref([
  {start: 4, end: 12, color: 'yellow', tag: 'foo'},
  {start: 20, end: 55, color: 'green', tag: 'bar'},
  {start: 100, end: 105, color: 'purple', tag: 'foo'},
  {start: 98, end: 110, color: 'purple', tag: 'bar'}
])

const content = ref(null)

function onMouseup(event){
  console.log(event)
  const selection = window.getSelection()
  const range = selection.getRangeAt(0)
  console.log(range);
  const highlight = document.createElement("span")
  highlight.style['background-color'] = 'rgba(255,0,0,0.5)'
  highlight.appendChild(range.extractContents())
  range.insertNode(highlight)
}

onMounted(() => {

  if(!CSS.highlights) {content.value.textContent = "Higlighting is not supported in this browser!"; return}  
  
  const textNode = content.value.childNodes[0]
  const tagHighlights = {}
  
  // Create ranges for each tag's highlights
  annotations.value.forEach(anno => {    
    const range = new Range()
    range.setStart(textNode, anno.start)
    range.setEnd(textNode, anno.end)
    if(!tagHighlights[anno.tag]) tagHighlights[anno.tag] = []
    tagHighlights[anno.tag].push(range)
  })

  // Create CSS higlights for each tag
  Object.keys(tagHighlights).forEach((tag, i) => {
    let highlight = new Highlight(...tagHighlights[tag])
    CSS.highlights.set(`highlight-${i}`, highlight)
    console.log(highlight)
  })

})
</script>

<template>
  <button @click="highlightSelectedText">Highlight</button>

  <div>
    <p id="content" ref="content" @mouseup="onMouseup">
      {{text}}
    </p>
  </div>

  <!-- List to display highlights -->
  <div>
      <ul>
        <li v-for="(annotation, index) in annotations" :key="index">
          <mark :style="{ backgroundColor: 'green' }">
            {{ annotation.text }}
          </mark>
        </li>
      </ul>
    </div>

    <!-- Button to add highlights -->
    <button @click="addHighlight">Add highlight</button>
</template>

<style scoped>
.highlighted-text {
  background-color: yellow;
}
::highlight(yellow) {
  background-color: rgba(255, 255, 0.5);
}
::highlight(blue) {
  background-color: rgba(0,0,255,0.5);
}
</style>