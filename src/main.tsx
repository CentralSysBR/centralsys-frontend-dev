import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'
import { CaixaProvider } from './components/contexts/CaixaContext'

registerSW({
  immediate: true
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <CaixaProvider>
      <App />
    </CaixaProvider>
  </React.StrictMode>
)
