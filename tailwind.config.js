/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', './AdBlockerTestLab.jsx'],
  theme: {
    extend: {
      // DESIGN.md: DM Mono only for test IDs, timings, and filter rules.
      fontFamily: { mono: ['"DM Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'] }
    }
  },
  plugins: [],
};
