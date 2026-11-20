import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import { SiteSettingsProvider } from "./providers/SiteSettingsProvider.jsx";
import { ThemeProvider } from "./providers/ThemeProvider.jsx";
import "./styles.css";
import "./styles/textures.css";
import "./styles/paper.css";
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <SiteSettingsProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SiteSettingsProvider>
    </ThemeProvider>
  </StrictMode>,
)
