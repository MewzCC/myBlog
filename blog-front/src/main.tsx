import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import MessageProvider, { message } from './components/Message/MessageProvider'
import './styles/index.css'

;(globalThis as any).$message = message

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MessageProvider>
      <App />
    </MessageProvider>
  </React.StrictMode>
)
