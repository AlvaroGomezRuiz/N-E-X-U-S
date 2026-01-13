/** @type {import('tailwindcss').Config} */
export default {
  // Activamos el modo oscuro manual para que tu botón funcione
  darkMode: 'class', 
  
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nexus: {
          dark: '#0B1121',    // Fondo oscuro
          light: '#f8fafc',   // Texto claro
          primary: '#00e8f8', // Color principal (cian)
          glass: 'rgba(255, 255, 255, 0.1)', // Efecto cristal
        }
      },
      fontFamily: {
        // Definimos Audrey como la fuente principal sans-serif
        sans: ['Audrey', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // --- SISTEMA DE ANIMACIONES ---
      animation: {
        'spin-slow': 'spin 60s linear infinite',
        // Animación del avión saliendo
        'fly-out': 'flyOut 1.2s cubic-bezier(0.55, 0.055, 0.675, 0.19) forwards',
        // Animación de la neurona apareciendo
        'neuron-appear': 'neuronAppear 1.2s ease-out forwards',
      },
      keyframes: {
        // Trayectoria del avión
        flyOut: {
          '0%': { transform: 'translate(0, 0) scale(1)', opacity: '1' },
          '20%': { transform: 'translate(-20px, 20px) scale(0.9)', opacity: '1' },
          '100%': { transform: 'translate(600px, -400px) scale(0)', opacity: '0' }, 
        },
        // Aparición de la neurona
        neuronAppear: {
          '0%': { transform: 'translate(600px, -400px) scale(0)', opacity: '0' },
          '40%': { transform: 'translate(600px, -400px) scale(1.5)', opacity: '1' },
          '100%': { transform: 'translate(600px, -400px) scale(1)', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}