/** @type {import('tailwindcss').Config} */
// Базовая вёрстка повторяет оригинал (inline-стили в компонентах + src/styles/global.css).
// Tailwind подключён без preflight, чтобы не менять базовые стили оригинала; утилиты можно использовать для доработок.
export default {
  content: ['./src/**/*.{astro,html,js,ts}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#121821', 900: '#1e2530', 800: '#232d3d', body: '#3a4149', muted: '#4a515a' },
        paper: '#f2f4f6',
        line: '#e2e6ea',
      },
      fontFamily: {
        head: ['Manrope', '"Helvetica Neue"', 'Arial', 'sans-serif'],
        body: ['Onest', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
