import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import i18n from './i18n'
import './style.css'
import './assets/themes.css'
import './assets/map.css'

const app = createApp(App)

// Initialize plugins
app.use(createPinia())
app.use(router)
app.use(i18n)

// Initialize auth store from localStorage
import { useAuthStore } from './stores/auth'
const authStore = useAuthStore()
authStore.initializeFromStorage()

app.mount('#app')
