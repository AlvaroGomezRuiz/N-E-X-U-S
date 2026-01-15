import React, { useState, useEffect } from 'react';

// 1. IMPORTAMOS LOS DOS MODOS
// Asegúrate de haber renombrado los archivos como dijimos antes:
// 'NexusMystery.jsx' (El Orbe/Público) y 'NexusCore.jsx' (El Chat/Trabajo)
import NexusMystery from './pages/NexusMystery';
import NexusCore from './pages/NexusCore';

export default function App() {
  // --- LÓGICA DEL TEMA (LO ANTIGUO) ---
  const [theme, setTheme] = useState(() => {
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  // --- LÓGICA DE DESPLIEGUE (LO NUEVO) ---
  // true = Muestra la Web Misteriosa (Para subir a internet)
  // false = Muestra el Chat Completo (Para trabajar en local)
  const MODO_PUBLICO = false;

  return (
    <div className="relative min-h-screen font-sans bg-slate-100 dark:bg-slate-900 transition-colors duration-500">

      {/* ============================================== */}
      {/* INTERRUPTOR DE TEMA (SIEMPRE VISIBLE)          */}
      {/* ============================================== */}
      <div
        onClick={toggleTheme}
        className={`
          absolute top-8 right-8 z-50 cursor-pointer
          w-20 h-10 rounded-full p-1
          flex items-center transition-colors duration-500 ease-in-out shadow-inner
          ${theme === 'dark' ? 'bg-cyan-900 border border-cyan-500/30' : 'bg-slate-300'}
        `}
      >
        <div
          className={`
            w-8 h-8 rounded-full shadow-lg transform transition-all duration-500 cubic-bezier(0.4, 0.0, 0.2, 1)
            flex items-center justify-center
            ${theme === 'dark' ? 'bg-cyan-400 translate-x-10' : 'bg-white translate-x-0'}
          `}
        >
          {theme === 'dark' ? (
            // LUNA
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-cyan-900" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          ) : (
            // SOL
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>

      {/* ============================================== */}
      {/* RENDERIZADO CONDICIONAL DE PÁGINAS             */}
      {/* ============================================== */}
      {MODO_PUBLICO ? (
        <NexusMystery />
      ) : (
        <NexusCore />
      )}

    </div>
  );
}
