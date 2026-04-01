// Punto de entrada del frontend: monta React con Router y contexto global.
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { BooksProvider } from './context/BooksContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <BooksProvider>
        <App />
      </BooksProvider>
    </BrowserRouter>
  </StrictMode>,
)
