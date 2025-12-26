/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        centralsys: {
          primary: "#1A2B3C",   // Base: Autoridade e estabilidade
          secondary: "#4A5568", // Texto/Ícones: Neutralidade técnica
          accent: "#2D6A4F",    // Sucesso/Ação: Controle financeiro
          bg: "#F8FAFC",        // Background: Limpeza e clareza
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'], // Fonte oficial
      },
    },
  },
  plugins: [],
}