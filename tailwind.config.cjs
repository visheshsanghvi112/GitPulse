module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          50: '#f5f3ff',
          100: '#ede9fe',
          500: '#7c3aed'
        }
      }
    }
  },
  plugins: []
}
