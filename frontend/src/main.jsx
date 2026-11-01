import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ToastProvider } from './context/ToastProvider.jsx'
import { AuthProvider } from './context/AuthProvider.jsx'
import { ConfirmProvider } from './context/ConfirmProvider.jsx'
import { UpgradeProvider } from './context/UpgradeProvider.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <ConfirmProvider>
            <UpgradeProvider>
              <App />
            </UpgradeProvider>
          </ConfirmProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)