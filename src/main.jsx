/**
 * @file main.jsx
 * @description Punto de entrada de la aplicación React.
 * Inicializa el DOM y carga los estilos globales.
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import 'bootstrap-icons/font/bootstrap-icons.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
