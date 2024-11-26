/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/*.{html,js}"],
  theme: {
    extend: {},
  },
  plugins: [
    function ({ addUtilities }) {
        addUtilities({
          '.sorted-asc::after': {
            content: "' ↑'",
            fontSize: '0.8em',
          },
          '.sorted-desc::after': {
            content: "' ↓'",
            fontSize: '0.8em',
          },
          '.no-scroll': {
            overflow: 'hidden', /* Prevent scrolling */
            position: 'fixed',  /* Lock the background */
            width: '100%',      /* Ensure layout consistency */
          },
          '.disable-interaction': {
            pointerEvents: 'none',
          }
        });
      },
  ],
}

