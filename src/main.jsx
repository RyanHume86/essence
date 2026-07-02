import React from 'react'
import ReactDOM from 'react-dom/client'
import App from '@/App.jsx'
import { PrefsProvider } from '@/hooks/usePrefs'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <PrefsProvider>
    <App />
  </PrefsProvider>
)
