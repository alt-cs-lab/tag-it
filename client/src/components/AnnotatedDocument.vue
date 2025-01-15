<!-- Component currenlty uses recogitojs, which is React-based -->
<!-- -->
<!-- Future work is to convert to a Vue-native component -->
<!-- See https://github.com/GhentCDH/vue_component_annotated_text for another example -->
<script setup>
  import { ref, watch, onMounted, onUnmounted } from 'vue'
  import { Recogito } from '@recogito/recogito-js'
  import '@recogito/recogito-js/dist/recogito.min.css'


  //import useDocumentStore from '@/stores/documents'
  //const documentStore = useDocumentStore()

  const ws = ref(null) // websocket connection 
  const isConnected = ref(false) // Connection status
  const retryInterval = 3000 // Time interval for retrying connection
  var retryTimeout = null // Timeout reference for reconnection

  // Function to initiate WebSocket connection
  const connectWebSocket = () => {
    ws.value = new WebSocket(`ws://localhost:5178/documents/${"foo"}`)

    ws.value.onopen = () => {
      console.log("Websocket connected.")
      isConnected.value = true
      if (retryTimeout) {
        clearTimeout(retryTimeout)
        retryTimeout = null
      }
    }

    ws.value.onmessage = (event) => {
      console.log(event.data)
    }

    ws.value.onerror = (error) => {
      console.error("Websocket error:", error)
      isConnected.value = false
    }

    ws.value.onclose = () => {
      console.log("Websocket closed. Retrying...")
      isConnected.value = false
      attemptReconnect()
    }
  }

  const attemptReconnect = () => {
    if(!isConnected.value) {
      retryTimeout = setTimeout(() => {
        console.log("Attempting to reconnect...")
        connectWebSocket()
      }, retryInterval)
    }
  }

  onMounted(() => {
    connectWebSocket()
  })

  onUnmounted(() => {
    if(ws.value) {
      ws.value.close()
    }
    if(retryTimeout) {
      clearTimeout(retryTimeout)
    }
  })

  const content = ref(null)
  const props = defineProps({
    text: {
      type: String,
      required: true
    },
    annotations: {
      type: Array,
      default: () => []
    }
  })

  const emit = defineEmits(['update:annotations'])

  const initRecogito = () => {
    const r = new Recogito({
      content: content.value,
      locale: 'en-US',
      widgets: [{ widget: 'TAG' }]
    })

    // const { user } = useAuthStore()
    // r.setAuthInfo({
    //   id: user.uid,
    //   displayName: user.displayName
    // })
    r.setAuthInfo({id:1,displayName:'cuttlefish'})

    watch(() => props.annotations, (newAnnotations) => {
      r.setAnnotations(newAnnotations)
    }, { immediate: true })

    r.on('createAnnotation', () => {
      emit('update:annotations', r.getAnnotations())
    })

    r.on('updateAnnotation', () => {
      emit('update:annotations', r.getAnnotations())
    })

    r.on('deleteAnnotation', () => {
      emit('update:annotations', r.getAnnotations())
    })
  }

  onMounted(initRecogito)
</script>

<template>
  <div
    v-if="text"
    ref="content"
    v-html="text"
  />
</template>