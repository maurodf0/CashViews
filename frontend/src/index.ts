import { createApp } from 'vue-lynx'
import { createPinia } from 'pinia'

import { installIntlPolyfill, registerIconSet } from '@vyui/core'
import { provideVyUI } from '@vyui/kit'
import lucide from '@iconify-json/lucide/icons.json'

import App from './App.vue'
import vyuiConfig from '../vyui.config'
import './styles/index.css'

installIntlPolyfill()
registerIconSet('lucide', lucide)

const app = createApp(App)
app.use(createPinia())
provideVyUI(app, vyuiConfig)
app.mount()
