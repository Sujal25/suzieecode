/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        inter: ["Inter", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
      },
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#dff2fe',
          200: '#b8e6fe',
          300: '#74d4ff',
          400: '#00bcff',
          500: '#00a6f4',
          600: '#0084d1',
          700: '#0069a8',
          800: '#00598a',
          900: '#024a70',
        },
        accent: {
          500: '#a78bfa', // purple-400
          600: '#8b5cf6', // purple-500
          700: '#7c3aed', // purple-600
        },
        deep: {
          900: '#0a1124', // deep blue
          800: '#1e293b', // slate-800
        },
        light: {
          100: '#f3f4f6', // gray-100
          200: '#e5e7eb', // gray-200
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        white: '#ffffff',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

