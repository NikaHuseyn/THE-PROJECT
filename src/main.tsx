import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Error handling for the entire application
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  event.preventDefault();
});

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element not found");
}

const root = createRoot(rootElement);

try {
  root.render(<App />);
} catch (error) {
  console.error('Failed to render app:', error);
  
  // Fallback UI if React fails to render
  rootElement.innerHTML = `
    <div style="
      min-height: 100vh; 
      display: flex; 
      align-items: center; 
      justify-content: center; 
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #fdf2f8 0%, #ffffff 50%, #fce7f3 100%);
    ">
      <div style="
        max-width: 400px; 
        padding: 2rem; 
        background: white; 
        border-radius: 12px; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        text-align: center;
      ">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">Application Error</h1>
        <p style="color: #6b7280; margin-bottom: 1.5rem;">
          Something went wrong loading the application. Please refresh the page.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #3b82f6; 
            color: white; 
            border: none; 
            padding: 0.75rem 1.5rem; 
            border-radius: 6px; 
            cursor: pointer;
            font-size: 1rem;
          "
        >
          Reload Page
        </button>
      </div>
    </div>
  `;
}
