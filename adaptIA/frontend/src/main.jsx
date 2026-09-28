import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import SmoothScroll from './components/SmoothScroll.jsx';
import './styles/global.css';
import './styles/layout.css';
import './styles/taller.css';
import './styles/input-panel.css';
import './styles/document.css';
import './styles/footer.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/*
      SmoothScroll se monta UNA SOLA VEZ en el nivel más alto de la app,
      fuera del BrowserRouter, para que Lenis persista entre navegaciones
      de ruta y no se re-instancie (ni destruya) en cada cambio de página.

      Props por defecto (premium preset):
        duration        = 1.6   → inercia pesada, sensación cinematográfica
        wheelMultiplier = 0.85  → suave, sin saltos de pantalla
        touchMultiplier = 1.5   → respuesta natural en móvil
    */}
    <SmoothScroll>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </SmoothScroll>
  </React.StrictMode>
);
