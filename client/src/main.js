// CSS
import './assets/main.css'
import 'primeicons/primeicons.css'

// Libraries
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Logger from 'js-logger'

// Services 
import setupInterceptors from './services/interceptors'

// Log messages will be written to window's console
Logger.useDefaults()
Logger.setLevel(import.meta.env.DEV ? Logger.DEBUG : Logger.WARN)
console.log('Log level: ' + Logger.getLevel().name)

// App and Vue Router
import App from './App.vue'
import router from './router'

// Setup axios interceptors
setupInterceptors()

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {theme: {preset: Aura}})

app.mount('#app')
